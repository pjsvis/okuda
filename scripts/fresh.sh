#!/usr/bin/env bash
# fresh.sh — prove the shipped binary is the source you're looking at.
#
# The stale-binary trap (2026-09-02): `just ship` printed "auto-fresh"
# while compiling a checkout that predated the fix the operator believed
# they were shipping. A claim no mechanism verifies is decoration. This
# gate checks the two links in the chain:
#
#   1. PATH resolution — ~/.local/bin/<name> symlinks to $(pwd)/<name>.
#   2. Build stamp    — the binary's embedded git SHA matches HEAD.
#
# Both shipped binaries are checked: okuda (the viewer) and cahier (the
# compositor, BRF-CAHIER-BINARY). A binary that is absent is never shipped.
#
# Caveat: the stamp is the *commit*, not the tree — dirty working files
# still build as HEAD. The stamp answers "is this the right branch",
# not "is the tree clean"; `just orient` answers the second.
#
# Exit 0 fresh, 1 stale, 2 never shipped. Run by `just fresh` / `just ship`.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
BINDIR="$HOME/.local/bin"
head_sha="$(git -C "$REPO" rev-parse --short=7 HEAD)"

for name in okuda cahier; do
  BIN="$REPO/$name"
  LINK="$BINDIR/$name"

  if [[ ! -x "$BIN" ]]; then
    echo "fresh: FAIL — no $name binary in repo root; run just build"
    exit 2
  fi

  # ── 1. PATH resolution ───────────────────────────────────────────────
  if [[ ! -L "$LINK" ]] || [[ "$(readlink "$LINK")" != "$BIN" ]]; then
    echo "fresh: FAIL — $LINK does not resolve to $BIN (run just install)"
    exit 1
  fi

  # ── 2. Build stamp vs HEAD ──────────────────────────────────────────
  stamp=$("$BIN" --version | grep -oE '\([0-9a-f]{7,}\)' | tr -d '()' || true)
  if [[ -z "$stamp" ]]; then
    echo "fresh: FAIL — $name carries no build stamp (old build; run just build)"
    exit 1
  fi
  if [[ "$stamp" != "$head_sha" ]]; then
    echo "fresh: FAIL — $name is $stamp, checkout is $head_sha; run just ship"
    exit 1
  fi
done

echo "fresh: OK — okuda, cahier = $head_sha, PATH resolves to this repo"
