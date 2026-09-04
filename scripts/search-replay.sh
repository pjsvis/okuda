#!/usr/bin/env bash
# search-replay.sh — open the EXACT picker instance gloam would open,
# with the exact argv and the exact entry stream, but standalone: no
# gloam, no loop, no spawn wrapper between us and fzf.
#
# Purpose: when the smoke (fzf --filter) is green but the operator's
# interactive picker is red, the delta lives in one of three places:
#   a) the entry stream  (dumped to a file you can read)
#   b) the fzf argv      (printed before launch)
#   c) the spawn context (eliminated here — this IS an interactive fzf)
#
# Usage: bash scripts/search-replay.sh "load bearing"
# The selection prints after Esc. Both parties now run the same instance.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"
QUERY="${*:-1.4.0}"
DUMP="${TMPDIR:-/tmp}/gloam-entries.txt"

# ── the exact entry stream ────────────────────────────────────────────
bun -e '
import { rankedShortlistEntries } from "./src/launcher";
process.stdout.write(rankedShortlistEntries(process.argv[1]!).join("\n") + "\n");
' "$QUERY" > "$DUMP"

echo "── the same thing, both sides ─────────────────────────"
echo "query:   \"$QUERY\""
echo "entries: $DUMP ($(wc -l < "$DUMP" | tr -d ' ') lines, $(grep -c $'\t' "$DUMP" || true) with evidence)"
echo "argv:    fzf --layout=reverse --no-mouse --exact --tiebreak=index --delimiter=<TAB> \\"
echo "           --bind=ctrl-d:page-down,ctrl-u:page-up,esc:cancel \\"
echo "           --query=\"$QUERY\" --print-query --header=... --prompt=\"gloam -g ❯ \""
echo "env:     FZF_* stripped (fzfEnv); your shell rc cannot reach this instance"
echo "───────────────────────────────────────────────────────"

# ── the instance: identical argv, interactive, list from the dump ─────
fzf --layout=reverse --no-mouse --exact --tiebreak=index --delimiter="	" \
  --bind="ctrl-d:page-down,ctrl-u:page-up,esc:cancel" \
  --prompt="gloam -g ❯ " --query="$QUERY" --print-query \
  --header="enter: read · ctrl-w: clear word · esc: clear/done" \
  < "$DUMP" > /tmp/gloam-selection.txt || true

echo "── selection ──────────────────────────────────────────"
sel="$(sed -E 's/\t.*//; s/[[:space:]]+$//' /tmp/gloam-selection.txt | head -1)"
if [[ -n "$sel" ]]; then
  echo "picked:  $sel"
else
  echo "picked:  (nothing — Esc'd out)"
fi
