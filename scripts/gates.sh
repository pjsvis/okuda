#!/usr/bin/env bash
# gates.sh — the named gate table `just check` runs (ADR-GATE-TWO-RENDERS-085).
#
# The recipe used to be one 860-character line joining 23 gates with `&&`, so a
# failure reported *recipe check failed on line 128* and named no gate: every
# gate named itself in its own output, and the recipe destroyed the attribution
# on the way out. This file is that table, with the names kept.
#
# Each gate is fail-fast, inherits stdio, and prints its own verdict — one line
# on pass (ADR-GATE-TWO-RENDERS-085), its findings on fail. On failure the name,
# the position and the single re-run command are printed below the evidence, so
# the reader looks *down* from the failure rather than walking backwards through
# the recipe.
#
# Usage:
#   bash scripts/gates.sh            # all gates, in order
#   bash scripts/gates.sh callsign   # one gate, by name
#   bash scripts/gates.sh --list     # the table (name and command)
#
# Exit: 0 all green · 1 a gate failed · 2 the caller asked for a gate that is
# not in the table (a missing instrument is not a verdict — facade-lint's rule).
set -uo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO" || exit 2

# name | command. Order is the order they run; a gate that fails stops the run.
GATES=(
  "signature|bash scripts/signature-check.sh"
  "tree|bash scripts/tree-lint.sh"
  "ref-census|bun scripts/ref-census.ts --gate"
  "reg-sync|bun scripts/reg-sync.ts --all --gate"
  "family|bun scripts/family.ts --gate"
  "packages|bun scripts/platform-packages.ts --check"
  "facade|bash scripts/facade-lint.sh"
  "amp|bun scripts/amp-check.ts --gate"
  "amp-briefs|bun scripts/amp-briefs.ts --check"
  "td-id|bun scripts/td-id-lint.ts"
  "callsign|bun scripts/callsign-lint.ts"
  "date|bun scripts/date-lint.ts --gate"
  "archive|bun scripts/archive-lint.ts"
  "idea|bun scripts/idea-lint.ts --gate"
  "debrief|bun scripts/debrief-link-lint.ts --gate"
  "retired|bun scripts/retired-terms-lint.ts --gate"
  "census|bun scripts/citation-census.ts --strict"
  "lexicon|bun scripts/lexicon-lint.ts"
  "prose|bun scripts/prose-check.ts --strict-leaks"
  "elision|bun scripts/elision-monotone.ts --gate --strict"
  "seams|bun scripts/seams.ts --gate"
  "briefs|bun scripts/brief-queue.ts --gate"
  "html|bun scripts/html-batch.ts"
  "contrast|bun scripts/contrast.ts --surface --gate"
)

if [[ "${1:-}" == "--list" ]]; then
  for row in "${GATES[@]}"; do
    printf '%-12s %s\n' "${row%%|*}" "${row#*|}"
  done
  exit 0
fi

total=${#GATES[@]}

# One gate, by name: the failure path's own remedy.
if [[ -n "${1:-}" ]]; then
  for row in "${GATES[@]}"; do
    if [[ "${row%%|*}" == "$1" ]]; then
      eval "${row#*|}"
      exit $?
    fi
  done
  echo "gates: no gate named '$1' — 'bash scripts/gates.sh --list' prints the table" >&2
  exit 2
fi

start=$SECONDS
i=0
for row in "${GATES[@]}"; do
  i=$((i + 1))
  name="${row%%|*}"
  cmd="${row#*|}"
  eval "$cmd"
  status=$?
  if (( status != 0 )); then
    echo "" >&2
    echo "gates: FAILED at $i/$total — $name" >&2
    echo "       $cmd" >&2
    echo "       re-run alone: just gate $name" >&2
    exit 1
  fi
done

echo "gates: $total/$total OK in $((SECONDS - start))s (bash scripts/gates.sh --list for the table)"
