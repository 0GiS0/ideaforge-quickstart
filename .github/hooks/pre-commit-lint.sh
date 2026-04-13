#!/usr/bin/env bash
# Hook: pre-commit-lint
# Runs format + lint for frontend and backend before any git commit.
# Called by Copilot as a PreToolUse hook — receives tool invocation JSON on stdin.

set -euo pipefail

INPUT=$(cat)

# Only act on run_in_terminal calls that contain "git commit"
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName // empty')
COMMAND=$(echo "$INPUT" | jq -r '.input.command // empty')

if [[ "$TOOL_NAME" != "run_in_terminal" ]] || [[ "$COMMAND" != *"git commit"* ]]; then
  echo '{}' # no-op — allow other tools to proceed
  exit 0
fi

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ERRORS=()

# --- Frontend: Prettier + ESLint ---
if [[ -f "$REPO_ROOT/frontend/package.json" ]]; then
  cd "$REPO_ROOT/frontend"
  if ! npm run format 2>&1; then
    ERRORS+=("Frontend format (Prettier) failed")
  fi
  if ! npm run lint 2>&1; then
    ERRORS+=("Frontend lint (ESLint) failed")
  fi
fi

# --- Backend: Spotless ---
if [[ -f "$REPO_ROOT/backend/pom.xml" ]]; then
  cd "$REPO_ROOT/backend"
  if ! mvn spotless:apply -q 2>&1; then
    ERRORS+=("Backend format (Spotless) failed")
  fi
fi

# If any step failed, block the commit
if [[ ${#ERRORS[@]} -gt 0 ]]; then
  REASON=$(printf '%s; ' "${ERRORS[@]}")
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Lint/format failed: ${REASON%; }"
  }
}
EOF
  exit 0
fi

# Format/lint passed — re-stage any auto-fixed files, then allow the commit
cd "$REPO_ROOT"
git add -A

echo '{}' # allow
exit 0
