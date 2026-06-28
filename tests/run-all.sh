#!/usr/bin/env bash
# Orchestrator for all plugin test runners.
# Usage: tests/run-all.sh [fast|full]
#
# `fast` (default) runs each runner with whatever timeouts each runner owns.
# `full` is reserved for future emphasis on integration suites; today it
# behaves the same as `fast`.
#
# Each sub-runner owns its own setup and gates itself when its optional
# tooling is absent. The orchestrator only reports pass/fail per runner and
# aggregates.

set -uo pipefail  # NOTE: deliberately no `-e`. We run every runner and aggregate.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

mode="${1:-fast}"
if [[ "$mode" != "fast" && "$mode" != "full" ]]; then
  echo "usage: $0 [fast|full]" >&2
  exit 2
fi

FAIL_COUNT=0

run_runner() {
  local label="$1"
  shift
  echo
  echo "=== ${label} ==="
  if "$@"; then
    echo "PASS: ${label}"
  else
    echo "FAIL: ${label}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

# Cheap, fast tests first so an early failure saves time on slow suites.

run_runner "shell-lint" \
  bash "$SCRIPT_DIR/shell-lint/test-lint-shell.sh"

run_runner "hooks" \
  bash "$SCRIPT_DIR/hooks/test-session-start.sh"

run_runner "codex-plugin-sync" \
  bash "$SCRIPT_DIR/codex-plugin-sync/test-sync-to-codex-plugin.sh"

run_runner "brainstorm-server" \
  bash -c "set -euo pipefail; cd '$SCRIPT_DIR/brainstorm-server' && ([ -d node_modules ] || npm install --no-audit --no-fund >/dev/null) && npm test --silent"

run_runner "kimi" \
  bash "$SCRIPT_DIR/kimi/run-tests.sh"

run_runner "pi" \
  bash -c "set -euo pipefail; cd '$SCRIPT_DIR/pi' && node test-pi-extension.mjs"

run_runner "antigravity" \
  bash "$SCRIPT_DIR/antigravity/run-tests.sh"

run_runner "opencode" \
  bash "$SCRIPT_DIR/opencode/run-tests.sh"

run_runner "claude-code" \
  bash "$SCRIPT_DIR/claude-code/run-skill-tests.sh"

run_runner "explicit-skill-requests" \
  bash "$SCRIPT_DIR/explicit-skill-requests/run-all.sh"

echo
if [[ $FAIL_COUNT -eq 0 ]]; then
  echo "All test runners completed."
  exit 0
fi
echo "${FAIL_COUNT} test runner(s) failed."
exit 1
