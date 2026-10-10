#!/usr/bin/env bash
# protocol-install.sh — deploy the canonical system.md to the agent runtime.
#
# system.md is the source of truth; the deployed copy is an OUTPUT, not a store.
#
# The target — ~/.pi/agent/AGENTS.md — may be a SYMLINK, and following it can
# land the write in ANOTHER repository's file. That happened silently: the chain
# on this machine is
#
#   ~/.pi/agent/AGENTS.md
#     -> cool-pi-extensions/prompts/edinburgh-protocol.md
#        -> cool-pi-extensions/SYSTEM.md
#
# so every install edited a foreign repo and left it dirty, with nothing on
# screen saying where the write went. A path that presents as the agent's config
# and resolves into another repository is an impostor; the fix is not to refuse
# it — the wiring is deliberate, and the prompted protocol *should* live in a
# versioned repo — but to DECLARE it: resolve the chain, write the real file,
# name it, and if it lives in a repository, say which one and whether the copy
# is committed there. A derived artefact declares itself derived; a pointer
# resolves. Silent is the defect.
#
# Usage: bash scripts/protocol-install.sh
set -euo pipefail

cd "$(dirname "$0")/.."

SRC="system.md"
DEST="${OKUDA_AGENTS:-$HOME/.pi/agent/AGENTS.md}"

[ -f "$SRC" ] || { echo "protocol-install: $SRC not found" >&2; exit 1; }

# Resolve a symlink chain to an absolute path. macOS ships no `readlink -f`.
resolve() {
  local p="$1" dir
  while [ -L "$p" ]; do
    dir="$(cd -P "$(dirname "$p")" && pwd)"
    p="$(readlink "$p")"
    case "$p" in /*) ;; *) p="$dir/$p" ;; esac
  done
  printf '%s/%s\n' "$(cd -P "$(dirname "$p")" && pwd)" "$(basename "$p")"
}

REAL="$(resolve "$DEST")"

if cmp -s "$SRC" "$REAL" 2>/dev/null; then
  echo "protocol: already in sync -> $REAL"
else
  cp "$SRC" "$REAL"
  echo "protocol installed: $SRC -> $REAL"
fi

# Declare the impostor, when there is one.
if [ "$REAL" != "$DEST" ]; then
  echo "  note: $DEST is a symlink; the write went to"
  echo "        $REAL"
  repo="$(git -C "$(dirname "$REAL")" rev-parse --show-toplevel 2>/dev/null || true)"
  if [ -n "$repo" ]; then
    rel="${REAL#"$repo"/}"
    echo "        which is in the repository: $repo"
    if [ -n "$(git -C "$repo" status --porcelain -- "$rel" 2>/dev/null)" ]; then
      echo "        and it is UNCOMMITTED there — commit it in that repository, or the copy drifts."
    fi
  fi
fi
