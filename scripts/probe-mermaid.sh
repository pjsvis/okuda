#!/usr/bin/env bash
# probe-mermaid.sh — the consumer-path probe, not a test suite.
#
# Pipes one fixed mermaid fence through the real entry point (gloam/okuda,
# non-TTY streaming path), then asserts the bytes. This is the chain that
# mermaid-to-md's own suite cannot see: argv0 dispatch → fence detection →
# Bun.spawn → the wrapper → the engine. It is deliberately outside `just
# test`: it needs a built/installed consumer, and a downstream binary is not
# a hermetic gate for upstream.
#
# Exit 0 when the consumer renders the diagram, 1 when it does not, 2 when
# there is no consumer to probe (skip, not failure).
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if command -v gloam >/dev/null 2>&1; then
  GLOAM="$(command -v gloam)"
elif [[ -x ./okuda ]]; then
  GLOAM="./okuda"          # same streaming path; argv0 differs, TTY logic does not
else
  echo "skip: no gloam on PATH and no built ./okuda — run: just build" >&2
  exit 2
fi

src='```mermaid
flowchart LR
  A[Smoke] --> B[Pipe]
```'

out="$(printf '%s\n' "$src" | COLUMNS=80 "$GLOAM" --no-color --width 80 2>&1)"
rc=$?

fail() {
  echo "FAIL: $1" >&2
  printf '%s\n' "--- consumer output ---" >&2
  printf '%s\n' "$out" >&2
  exit 1
}

[[ "$rc" -eq 0 ]] || fail "consumer exited $rc"
[[ -n "$out" ]] || fail "consumer produced no output"
[[ "$out" == *"│ Smoke "* ]] || fail "art is missing the Smoke node"
[[ "$out" == *"│ Pipe "* ]] || fail "art is missing the Pipe node"
[[ "$out" == *"mermaid source elided"* ]] || fail "fence was not treated as a render"
[[ "$out" != *"flowchart LR"* ]] || fail "mermaid source leaked into the render"
[[ "$out" != *"diagram unavailable"* ]] || fail "consumer reported the diagram as unavailable"

echo "ok — gloam rendered the mermaid fence end-to-end"
