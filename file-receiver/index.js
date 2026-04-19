// File-receiver sidecar.
//
// Tiny Express app that the IdeaForge runner talks to over HTTP to:
//   1. Drop new/updated files into the shared frontend/backend volumes
//      (mounted at /app/frontend and /app/backend), so the dev servers
//      running in the sibling containers pick them up via Vite HMR /
//      Spring Boot DevTools.
//   2. Execute one-off commands inside those volumes (e.g. `npm install`,
//      `npx vite build --mode development` for build validation).
//
// Security hardening:
//   - Path traversal: every path the runner sends is resolved against the
//     allowed roots (/app/frontend, /app/backend) and rejected if it
//     escapes them.
//   - Command injection: /exec only runs commands from an explicit
//     allow-list (npm, npx, node, mvn). Defense in depth in case the
//     runner ever gets a malicious payload.
//   - Rate limiting: /files and /exec are throttled per IP so a bug in
//     the runner can't DoS the dev environment with an infinite loop.

import express from 'express'
import rateLimit from 'express-rate-limit'
import { mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { dirname, resolve, sep } from 'node:path'

const PORT = Number(process.env.PORT || 3001)
const ALLOWED_ROOTS = ['/app/frontend', '/app/backend']
const ALLOWED_COMMANDS = new Set(['npm', 'npx', 'node', 'mvn'])

const app = express()
// Generated apps can be hundreds of KB across many files; bump the JSON
// limit so the runner can drop a full project in one POST.
app.use(express.json({ limit: '10mb' }))

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})

const execLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})

function resolveSafePath(rawPath) {
  // Strip a leading "frontend/" or "backend/" prefix so the runner can send
  // template-relative paths without knowing the volume layout.
  const normalized = rawPath.replace(/^\/+/, '')
  let absolute
  if (normalized.startsWith('frontend/')) {
    absolute = resolve('/app/frontend', normalized.slice('frontend/'.length))
  } else if (normalized.startsWith('backend/')) {
    absolute = resolve('/app/backend', normalized.slice('backend/'.length))
  } else {
    return null
  }
  const ok = ALLOWED_ROOTS.some(root => absolute === root || absolute.startsWith(root + sep))
  return ok ? absolute : null
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/files', writeLimiter, async (req, res) => {
  const files = Array.isArray(req.body?.files) ? req.body.files : null
  if (!files) {
    return res.status(400).json({ error: 'Body must be { files: [{ path, content }] }' })
  }
  const written = []
  const errors = []
  for (const f of files) {
    if (typeof f?.path !== 'string' || typeof f?.content !== 'string') {
      errors.push({ path: f?.path, error: 'Invalid file entry' })
      continue
    }
    const safe = resolveSafePath(f.path)
    if (!safe) {
      errors.push({ path: f.path, error: 'Path outside allowed roots' })
      continue
    }
    try {
      await mkdir(dirname(safe), { recursive: true })
      await writeFile(safe, f.content, 'utf8')
      written.push(f.path)
    } catch (err) {
      errors.push({ path: f.path, error: err instanceof Error ? err.message : String(err) })
    }
  }
  if (errors.length > 0) {
    return res.status(207).json({ written, errors })
  }
  res.json({ written })
})

app.post('/exec', execLimiter, (req, res) => {
  const { cwd, command, args } = req.body || {}
  if (typeof command !== 'string' || !command) {
    return res.status(400).json({ error: 'Body must be { cwd, command, args? }' })
  }
  if (!ALLOWED_COMMANDS.has(command)) {
    return res
      .status(400)
      .json({ error: `command must be one of: ${[...ALLOWED_COMMANDS].join(', ')}` })
  }
  if (typeof cwd !== 'string' || !ALLOWED_ROOTS.includes(cwd)) {
    return res.status(400).json({ error: `cwd must be one of: ${ALLOWED_ROOTS.join(', ')}` })
  }
  const argv = Array.isArray(args) ? args.map(String) : []
  // shell:false (the default) ensures argv values are passed as a single
  // argv vector to execvp — no shell interpolation, so even if argv items
  // contain shell metacharacters they're treated as literal arguments.
  const child = spawn(command, argv, { cwd, env: process.env, shell: false })
  let stdout = ''
  let stderr = ''
  child.stdout.on('data', d => {
    stdout += d.toString()
  })
  child.stderr.on('data', d => {
    stderr += d.toString()
  })
  child.on('error', err => {
    res.status(500).json({ error: err.message, stdout, stderr })
  })
  child.on('close', code => {
    res.status(code === 0 ? 200 : 500).json({ exitCode: code, stdout, stderr })
  })
})

app.listen(PORT, () => {
  console.log(`file-receiver listening on :${PORT}`)
  console.log(`allowed roots: ${ALLOWED_ROOTS.join(', ')}`)
  console.log(`allowed commands: ${[...ALLOWED_COMMANDS].join(', ')}`)
})
