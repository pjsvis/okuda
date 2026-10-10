#!/usr/bin/env bash
# protocol-check.sh — the roster: which silo copies of system.md are behind.
#
# A sibling silo's SYSTEM.md is its own instance: some track the global protocol,
# some declare a LOCAL variant (their marker carries @<repo>). Per the seam rule,
# a declared divergence is not a defect — undeclared scope is. This reports each
# copy as source / in sync / variant / BEHIND, with the copy's own cut marker as
# the evidence. Informational: it reads sibling repos, so it is NOT in `just check`.
#
# Usage: bash scripts/protocol-check.sh
#   OKUDA_PROTOCOL_ROOT   the silo neighbourhood   (default ~/Dev/GitHub)
#   OKUDA_PROTOCOL_SILOS  explicit space-separated file list (overrides discovery)
set -euo pipefail

cd "$(dirname "$0")/.."

SRC="system.md"
[ -f "$SRC" ] || { echo "protocol-check: $SRC not found" >&2; exit 1; }

ROOT="${OKUDA_PROTOCOL_ROOT:-$HOME/Dev/GitHub}"
SELF="$(cd "$(dirname "$SRC")" && pwd)/$SRC"

FILES=()
if [ -n "${OKUDA_PROTOCOL_SILOS:-}" ]; then
  # shellcheck disable=SC2206
  FILES=(${OKUDA_PROTOCOL_SILOS})
else
  for d in "$ROOT"/*/; do
    for f in "$d"SYSTEM.md "$d"system.md; do
      [ -f "$f" ] && FILES+=("$f")
    done
  done
fi

# A case-insensitive filesystem makes SYSTEM.md and system.md the same file;
# dedupe by device:inode so each copy appears once.
dev_ino() { stat -f '%d:%i' "$1" 2>/dev/null || stat -c '%d:%i' "$1"; }
DEDUPED=(); SEEN=()
for f in "${FILES[@]}"; do
  key="$(dev_ino "$f")"
  skip=0
  for s in ${SEEN[@]+"${SEEN[@]}"}; do [ "$s" = "$key" ] && skip=1 && break; done
  [ "$skip" = 1 ] && continue
  SEEN+=("$key"); DEDUPED+=("$f")
done
FILES=("${DEDUPED[@]}")

marker() {
  local m
  m="$(grep -m1 -E '^\*\*(Cut|Version):\*\*' "$1" 2>/dev/null | sed -E 's/^\*\*(Cut|Version):\*\* *//; s/ —.*$//')"
  printf '%s' "${m:-(no cut line)}"
}

behind=0; variant=0; synced=0
printf 'protocol-check — %s (%s)\n\n' "$SRC" "$(marker "$SRC")"
for f in "${FILES[@]}"; do
  rel="${f#"$ROOT"/}"
  repo="$(basename "$(dirname "$f")")"
  m="$(marker "$f")"
  if [ "$f" -ef "$SELF" ]; then
    printf '  source   %s\n' "$rel"
  elif cmp -s "$SRC" "$f"; then
    printf '  in sync  %-38s %s\n' "$rel" "$m"
    synced=$((synced + 1))
  elif printf '%s' "$m" | grep -qE "@$repo([^A-Za-z0-9_-]|$)"; then
    printf '  variant  %-38s %s  (declared local — not behind)\n' "$rel" "$m"
    variant=$((variant + 1))
  else
    printf '  BEHIND   %-38s %s\n' "$rel" "$m"
    behind=$((behind + 1))
  fi
done

printf '\n%d behind · %d declared local variant · %d in sync\n' "$behind" "$variant" "$synced"
[ "$behind" -gt 0 ] && printf 'Send a new cut from okuda: just protocol-install\n'
exit 0
