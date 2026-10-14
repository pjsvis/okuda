#!/usr/bin/env bash
# facade-lint.sh — enforce the justfile facade's layout invariants.
#
# The justfile is the facade a visitor sees first; this repo's thesis is
# restful rendering, so the facade must not be ragged. This gate checks the
# *causes* of raggedness (measurable), not raggedness itself (the eyeball's
# job — see justfile-playbook.md, Tricky Parts #7).
#
# Invariants (all derived from `just --list` + the justfile):
#   1. Comment column in [20, 30] (the band a render targets).
#   2. Recipe comments ≤ 3 words (terse labels, not sentences).
#   3. No multi-line recipe comments (one comment line per recipe).
#   4. No default values on parameterized recipes (`param="..."` pins the
#      column; the signature is the only lever on alignment).
#
# Exit 0 if all pass, 1 with a named violation list if any fail, 2 if the gate
# cannot run — a missing instrument is not a verdict. ADR-041.
# Run by `just check` alongside reg-sync.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
JUSTFILE="$REPO/justfile"
fail=0
violations=()

# ── 0. Precondition ───────────────────────────────────────────────────
# Invariant 1 derives the comment column from `just --list`, so the gate
# needs `just` on PATH. Unguarded, the probe below exits 127, `pipefail`
# propagates it, and `set -e` aborts before any diagnostic — exit 1 with
# zero bytes, indistinguishable from a named violation. Say so instead.
if ! command -v just >/dev/null 2>&1; then
  echo "facade-lint: cannot run — 'just' is not on PATH (exit 2, not a verdict)" >&2
  echo "  Invariant 1 (comment column) is derived from 'just --list'." >&2
  echo "  Run this gate as 'just check', or put 'just' on PATH." >&2
  echo "  The facade is UNVERIFIED — do not read this as a pass." >&2
  exit 2
fi

# ── 1. Comment column ──────────────────────────────────────────────────
# `just --list` prints recipes indented 4 spaces; the comment column is the
# 1-based index of the first '#' on a commented recipe line.
col=$(just --justfile "$JUSTFILE" --list 2>/dev/null \
  | grep '#' | head -1 \
  | awk '{for(i=1;i<=length($0);i++){if(substr($0,i,1)=="#"){print i; exit}}}')
if [[ -z "$col" ]]; then
  # No commented recipes — vacuously in band.
  col_ok=1
elif (( col >= 20 && col <= 30 )); then
  col_ok=1
else
  col_ok=0
  violations+=("comment column $col (target band 20–30)")
fi

# ── 2. Comment word count (≤ 3 words) ─────────────────────────────────
# Extract recipe comments from the justfile: a '# ...' line immediately
# followed (skipping blank/attribute lines) by a recipe header. Strip the
# leading '# ' and count whitespace-separated tokens.
while IFS= read -r comment; do
  words=$(wc -w <<<"$comment" | tr -d ' ')
  if (( words > 3 )); then
    violations+=("comment >3 words: \"$comment\"")
    fail=1
  fi
done < <(awk '
  /^# ──/ { comment=""; next }   # section divider, not a recipe comment
  /^# / { comment = $0; next }
  /^\[group/ { next }
  /^$/ { next }
  /^[a-z@]/ && comment != "" {
    sub(/^# /, "", comment); print comment; comment=""; next
  }
  { comment="" }
' "$JUSTFILE")

# ── 3. No multi-line recipe comments ─────────────────────────────────
# Two consecutive '# ' lines where the second is immediately above a recipe
# header. Detect any '# ' line followed (skipping blank/attribute) by another
# '# ' line before a recipe.
multiline=$(awk '
  BEGIN { block=0; started=0 }
  /^# ──/ { started=1; block=0; next }   # first divider marks end of header
  !started { next }                     # skip file banner before first section
  /^# / { if (block) { print "1"; exit }; block=1; next }
  /^\[group/ { next }
  /^$/ { next }
  /^[a-z@]/ { block=0 }
  { block=0 }
' "$JUSTFILE")
if [[ "$multiline" == "1" ]]; then
  violations+=("multi-line recipe comment present (one line per recipe)")
  fail=1
fi

# ── 4. No default values on parameterized recipes ────────────────────
# A recipe header line containing `word="..."` has a default that pins the
# column. (Bare params like `file:` are fine; `file="x":` is not.)
defaults=$(grep -E '^[a-zA-Z_-]+ [a-zA-Z_]+="[^"]*":' "$JUSTFILE" || true)
if [[ -n "$defaults" ]]; then
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    violations+=("default value on param recipe: $line")
  done <<<"$defaults"
  fail=1
fi

# ── Report ────────────────────────────────────────────────────────────
if (( col_ok == 0 )); then fail=1; fi

if (( fail == 0 )) && [[ ${#violations[@]} -eq 0 ]]; then
  echo "facade-lint: OK (column $col${col:+, }in band, comments terse, no defaults)"
  exit 0
fi

echo "facade-lint: FAIL — the facade is misaligned" >&2
for v in "${violations[@]}"; do
  echo "  ✗ $v" >&2
done
echo "  see playbooks/justfile-playbook.md (House Style)" >&2
exit 1