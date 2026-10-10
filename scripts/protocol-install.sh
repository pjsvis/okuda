#!/usr/bin/env bash
# protocol-install.sh — publish the canonical system.md to a sibling's inbox.
#
# system.md is the source of truth. Its deployed copy is a MESSAGE, not a store:
# **the sender owns the content and publishes it; the receiver owns its copy and
# the commit** (the seam rule — `docs/2026-10-10-the-seam.md`).
#
# This replaces the old write-through-chain. The runtime chain on this machine is
#
#   ~/.pi/agent/AGENTS.md
#     -> cool-pi-extensions/prompts/edinburgh-protocol.md
#        -> cool-pi-extensions/SYSTEM.md
#
# and `cp` used to follow it and land a silent cross-repo write — attribution
# scrambled, verification absent, context lost, and nothing on screen saying
# where the bytes went. A path that presents as the agent's config and resolves
# into another repository is an impostor. The fix is not to refuse the wiring —
# the prompted protocol SHOULD live in a versioned repo — but to stop writing
# through it: publish a copy into the receiver's declared inbox, name it, and let
# the receiver commit. The runtime repoints off the chain separately, by the
# operator (named, never automated).
#
# Usage: bash scripts/protocol-install.sh
#   COOL_PI_DIR      receiver root    (default ~/Dev/GitHub/cool-pi-extensions)
#   OKUDA_MSG_FROM   inbox name       (default from-mac | from-omarchy by uname)
set -euo pipefail

cd "$(dirname "$0")/.."

SRC="system.md"
RECEIVER="${COOL_PI_DIR:-$HOME/Dev/GitHub/cool-pi-extensions}"

[ -f "$SRC" ] || { echo "protocol-install: $SRC not found" >&2; exit 1; }
[ -d "$RECEIVER/msgs" ] || {
  echo "protocol-install: no inbox at $RECEIVER/msgs" >&2
  echo "  the seam needs a declared inbox — create msgs/ in the receiver first" >&2
  exit 1
}

case "$(uname -s)" in
  Darwin) FROM_DEFAULT=from-mac ;;
  *)      FROM_DEFAULT=from-omarchy ;;
esac
FROM="${OKUDA_MSG_FROM:-$FROM_DEFAULT}"
INBOX="$RECEIVER/msgs/$FROM"
mkdir -p "$INBOX"

# The cut line is line 2: `**Cut:** 2.7.0 (2026-10-10) — …`.
CUT="$(sed -n '2p' "$SRC" | sed -E 's/^\*\*Cut:\*\* *//; s/ —.*$//')"
STAMP="$(date -u +%Y-%m-%d-%H%M)"
ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
OUT="$INBOX/$STAMP-protocol-system-md.json"

# Attribute the source: the commit that carries this cut (dirty, if it is).
COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
[ -z "$(git status --porcelain -- "$SRC" 2>/dev/null)" ] || COMMIT="$COMMIT-dirty"

jq -n \
  --arg from "okuda-session ($FROM)" \
  --arg to "cool-pi-extensions" \
  --arg cut "$CUT" \
  --arg commit "$COMMIT" \
  --arg timestamp "$ISO" \
  --arg detail "$(cat "$SRC")" \
  '{
    from: $from,
    to: $to,
    type: "request",
    topic: "protocol-system-md",
    status: "open",
    cut: $cut,
    source_commit: $commit,
    timestamp: $timestamp,
    summary: ("system.md cut " + $cut + " — publish to SYSTEM.md and commit (you own the commit)."),
    detail: $detail,
    action_needed: "Replace SYSTEM.md with the detail above, review it, and commit in cool-pi-extensions — the receiver owns the commit.",
    awareness_needed: "The runtime chain ~/.pi/agent/AGENTS.md -> cool-pi-extensions/prompts/edinburgh-protocol.md -> ../SYSTEM.md is unchanged; this script no longer writes through it.",
    bounded_context: "okuda owns system.md and the cut; cool-pi-extensions owns SYSTEM.md, its copy, and the commit. Intersection: the content only."
  }' > "$OUT"

echo "protocol-install: message sent -> $OUT"
echo "  cut:      $CUT  (source $COMMIT)"
echo "  receiver: cool-pi-extensions owns SYSTEM.md and the commit (not this script)"
echo "  next:     commit it there, then run just protocol-check to name who is still behind"
echo "  chain:    $HOME/.pi/agent/AGENTS.md untouched — no write through the symlink"
