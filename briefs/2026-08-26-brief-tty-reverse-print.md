---
type: Brief
callsign: BRF-TTY-REVERSE
---

# Brief: TTY Reverse-Print — Land at the Top

**Date:** 2026-08-26
**Status:** Ready (small; independently shippable)
**td:** unassigned

## What

When the streaming renderer (`okuda <file>`, the no-`--tui` path) writes to
a TTY, print the rendered lines **bottom-up**: emit the last line first,
then walk upward, so the terminal ends with line 1 at the cursor and the
rest of the document in scrollback above it. The reader lands at the top of
the document and scrolls down to read — Glow's trick, worth stealing.

When stdout is a pipe (`okuda doc.md | less`, the SSH ForceCommand path,
tests), print forward unchanged: downstream consumers must receive the
document in reading order.

## Why

The streaming path currently prints the whole document top-down and maroons
the cursor at the *bottom*. A viewer that opens at the end is a viewer
fighting its reader. The TUI already opens at `scroll = 0`; the streaming
path should not disagree with it about where a document begins.

This is also the piece the `gloam` launcher (playbook:
`playbooks/gloam-launcher-playbook.md`) leans on indirectly: the launcher's
preview uses the streaming renderer, and the committed read uses the TUI —
both should put the reader at the top.

## Scope

- `cli.ts` `draw()`: when `process.stdout.isTTY` and not `--watch`, emit
  lines in reverse order (join with `\n`, final `\n` last-emitted line is
  line 1). No ANSI games beyond what the renderer already emits.
- `--watch` keeps forward printing: watch redraws (`\x1b[2J\x1b[3J\x1b[H`)
  and reverse-print would re-dump the whole doc on every change event.
- Piped/stdin-redirected output: byte-identical to today.

## Out of scope

- The TUI (already correct — `scroll = 0`).
- Alternate-screen pager behaviour. Reverse-print uses scrollback, not the
  alternate screen; the terminal's own scrollback *is* the pager.
- Terminals with scrollback disabled: they will show only the first
  screenful. Document, don't work around.

## Verification

- TTY check under a PTY (`script -q`): last emitted line is the document's
  line 1; `head` of scrollback contains the document's end.
- Pipe check: `okuda doc.md | wc -l` unchanged; byte-compare against the
  pre-change stream output.
