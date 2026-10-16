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
FROZEN="$REPO/tmp/silcrow-look.entries"
META="$REPO/tmp/silcrow-look.meta"

# ── the exact entry stream ────────────────────────────────────────────
# Prefer the frozen capture (`just silcrow-freeze`): the control and the
# silcrow replica must read the SAME bytes, or the comparison is void —
# rg's body-channel order is not yet deterministic (td-975a6e).
if [ -s "$FROZEN" ]; then
  cp "$FROZEN" "$DUMP"
  if [ -s "$META" ]; then
    QUERY="$(sed -n 's/^query=//p' "$META")"
  fi
  echo "entries: FROZEN $FROZEN — sha256 $(shasum -a 256 "$FROZEN" | cut -d' ' -f1)"
else
  bun -e '
import { rankedShortlistEntries } from "./src/launcher";
process.stdout.write(rankedShortlistEntries(process.argv[1]!).join("\n") + "\n");
' "$QUERY" > "$DUMP"
fi

echo "── the same thing, both sides ─────────────────────────"
echo "query:   \"$QUERY\""
echo "entries: $DUMP ($(wc -l < "$DUMP" | tr -d ' ') lines, $(grep -c $'\t' "$DUMP" || true) with evidence)"
echo "argv:    fzf --layout=reverse --no-mouse --no-hscroll --exact --tiebreak=index --delimiter=<TAB> \\"
echo "           --color=hl:#dfa21a:bold:underline,... --bind=ctrl-d:page-down,ctrl-u:page-up,esc:clear-query \\"
echo "           --query=\"$QUERY\" --print-query --header=... --prompt=\"gloam ❯ \""
echo "env:     FZF_* stripped (fzfEnv); your shell rc cannot reach this instance"
echo "note:    argv mirrors src/launcher.ts (FZF_FIXED_ARGS, FZF_HL_ARG, GLOAM_FZF_BINDS, PROMPT, HEADER)"
echo "───────────────────────────────────────────────────────"

# ── the instance: the launcher's exact argv, interactive, frozen rows ─
# The source of truth is src/launcher.ts: FZF_FIXED_ARGS + FZF_HL_ARG
# + GLOAM_FZF_BINDS + PROMPT + HEADER. The live `change:reload` bind is
# omitted — standalone, the dump is the whole stream. The match paint
# (--color hl) is load-bearing for the control: without it fzf falls
# back to its default red highlight and the comparison is confounded.
HL_ARG=""
[ -n "${NO_COLOR:-}" ] || HL_ARG="--color=hl:#dfa21a:bold:underline,hl+:#dfa21a:bold:underline,selected-hl:#dfa21a:bold:underline"
fzf --layout=reverse --no-mouse --no-hscroll --exact --tiebreak=index --delimiter="	" \
  $HL_ARG \
  --bind="ctrl-d:page-down,ctrl-u:page-up,esc:clear-query" \
  --prompt="gloam ❯ " --query="$QUERY" --print-query \
  --header="type: search · dir/ and @2026-08 filter paths · !word excludes · enter: read · ctrl-w: word · esc: clear/done
 " \
  < "$DUMP" > /tmp/gloam-selection.txt || true

echo "── selection ──────────────────────────────────────────"
sel="$(sed -E 's/\t.*//; s/[[:space:]]+$//' /tmp/gloam-selection.txt | head -1)"
if [[ -n "$sel" ]]; then
  echo "picked:  $sel"
else
  echo "picked:  (nothing — Esc'd out)"
fi
