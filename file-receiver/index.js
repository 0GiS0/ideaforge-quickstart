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
// Security: every path the runner sends is resolved against the allowed
// roots (/app/frontend, /app/backend) and rejected if it escapes them.
// This guards against a malicious agent trying to write arbitrary files
// like /etc/passwd via path traversal.

import express from 'express'
import { mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { dirname, resolve, sep } from 'node:path'

const PORT = Number(process.env.PORT || 3001)
const ALLOWED_ROOTS = ['/app/frontend', '/app/backend']

const app = express()
// Generated apps can be hundreds of KB across many files; bump the JSON
// limit so the runner can drop a full project in one POST.
app.use(express.json({ limit: '10mb' }))

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

app.post('/files', async (req, res) => {
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

app.post('/exec', (req, res) => {
  const { cwd, command, args } = req.body || {}
  if (typeof command !== 'string' || !command) {
    return res.status(400).json({ error: 'Body must be { cwd, command, args? }' })
  }
  if (typeof cwd !== 'string' || !ALLOWED_ROOTS.includes(cwd)) {
    return res.status(400).json({ error: `cwd must be one of: ${ALLOWED_ROOTS.join(', ')}` })
  }
  const argv = Array.isArray(args) ? args.map(String) : []
  const child = spawn(command, argv, { cwd, env: process.env })
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
})
