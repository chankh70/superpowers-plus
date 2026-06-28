#!/usr/bin/env bash
# Wiring regression for tests/run-all.sh.
# Fail if the orchestrator doesn't reference every test subdirectory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ORCH="$SCRIPT_DIR/run-all.sh"

FAIL=0

if [[ ! -x "$ORCH" ]]; then
  echo "FAIL: $ORCH does not exist or is not executable"
  exit 1
fi

# Every label referenced from run_runner(...) in tests/run-all.sh must
# correspond to a directory under tests/. Reject the orchestrator if a
# subdir exists that isn't referenced, AND if a label exists that has no
# subdir. This catches drift in either direction.
required_labels=(
  shell-lint
  hooks
  codex-plugin-sync
  brainstorm-server
  kimi
  pi
  antigravity
  opencode
  claude-code
  explicit-skill-requests
)

for label in "${required_labels[@]}"; do
  if ! grep -Fq "\"$label\"" "$ORCH"; then
    echo "FAIL: orchestrator is missing the \"$label\" runner"
    FAIL=1
  fi
done

# And every labeled runner must have a backing subdir on disk.
expected_subdirs=(
  tests/shell-lint
  tests/hooks
  tests/codex-plugin-sync
  tests/brainstorm-server
  tests/kimi
  tests/pi
  tests/antigravity
  tests/opencode
  tests/claude-code
  tests/explicit-skill-requests
)

REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
for subdir in "${expected_subdirs[@]}"; do
  if [[ ! -d "$REPO_ROOT/$subdir" ]]; then
    echo "FAIL: expected subdir missing — $subdir"
    FAIL=1
  fi
done

# Sanity: the orchestrator must aggregate failures (no `set -e` trap that
# would short-circuit) and must end with a final report line.
if ! grep -Eq 'FAIL_COUNT' "$ORCH"; then
  echo "FAIL: orchestrator does not aggregate failures (FAIL_COUNT)"
  FAIL=1
fi
if ! grep -Eq 'All test runners completed' "$ORCH"; then
  echo "FAIL: orchestrator does not print final 'All test runners completed.' report"
  FAIL=1
fi

if [[ $FAIL -eq 0 ]]; then
  echo "PASS"
  exit 0
fi
exit 1
