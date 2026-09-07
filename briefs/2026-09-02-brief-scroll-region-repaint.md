---
type: Brief
callsign: BRF-SCROLL-REPAINT
---

# Brief: One line per scroll — scroll-region repaint for the TUI

**Date:** 2026-09-02
**Status:** Open
**Branch:** brief-first; implementation branch follows
**Context:** operator evidence, WiFi LAN — paging slightly sticky even
after BRF-SYNC-OUTPUT (no tearing, atomic frames). `ssh -C` materially
improved scrolling *and* fzf tracking, which confirms the second-order
finding: wire **volume**, not just frame atomicity, is now the binding
constraint. The operator concurs: make paging efficient.

## The finding, quantified

Every scroll keystroke repaints the full viewport: `rows × cols` of
content plus ANSI escapes — 2–10 KB per keystroke, of which ~90% is
bytes identical to the frame before it. A one-line scroll logically
changes one row; the TUI currently re-sends all of them. fzf's
improvement under compression is the proof: only redundant frames
compress that well.

## The design: scroll regions, not more bytes

The classic pager technique, three parts:

1. **Set a scroll region** (`ESC[<top>;<bottom>r`) over the content
   area only. The footer and hints row sit *outside* the region —
   they shift never and repaint never. This alone removes the footer
   from every scroll's byte bill.
2. **Shift by scrolling**: `ESC[<n>S` (content scrolled up, paging
   down) or `ESC[<n>T` (paging up) moves the region's rows in one
   ~8-byte sequence instead of rewriting them.
3. **Paint only the newly exposed lines** — `n` lines at the region's
   edge, positioned, colour-classified, done.

Byte cost per scroll keystroke: an 8-byte shift + `n` new lines
(~100–300 bytes each) instead of the full viewport. On a 40-row
terminal that is roughly a **20–50× reduction** on the dominant
interaction.

## The constraint that gates the fast path

**Soft-wrapped lines break the one-logical-line-one-row assumption.**
Over-wide mermaid art (the i811 corpus, by design: "diagram never
wraps even when wider than terminal") soft-wraps onto extra rows; a
scroll-region shift under wrapped content misaligns everything below
the wrap. Therefore:

- **Conditional fast path**: compute each visible line's row count
  (displayWidth vs cols); if every visible line is single-row, take
  the shift; if any wraps, fall back to the full repaint. The fast
  path must degrade, never tear.
- Jump, reload, resize, and hints-toggle keep the full-repaint path —
  they change everything, and diffing them earns nothing (the option-3
  analysis from BRF-SYNC-OUTPUT, now with its one paying exception
  exploited).

## Frame mode — which scroll are we optimising?

This brief was written before frame mode landed (keyboard-controls
`01`, the okudaframe). Frame mode introduces two distinct scroll
shapes, and `scrollPlan` must distinguish them because their byte
profiles differ:

- **The contiguous step (BRF-OKUDAGRAM-STEP) is the shift case.** A
  one-line step changes one row at the viewport edge; the rest is
  identical. This is the scroll the scroll-region optimisation targets —
  the 20–50× reduction applies here, and this is the dominant
  interaction in frame mode (the reader steps through, no gaps).
- **The structural jump (`snapFrame`, header-to-header) is a full
  repaint.** A jump changes everything — the new section's header and
  content replace the old. Diffing it earns nothing; `kind: "full"`.
  The jump is a declared skip (the reader's "I'm done with this tail"),
  not the scroll the optimisation serves.

The implementation's `scrollPlan` takes a motion kind, not just a line
count: `step` → shift path (subject to the wrap-gate); `jump` → full
repaint, unconditionally. The brief's acceptance criteria
("scroll keystroke on single-row content emits shift + new lines
only") refers to the *step*, not the jump. Naming both keeps the
implementer on the right path — optimise the step, full-paint the
jump.

## Composition requirements

- Every emitted frame — shift or full — goes through `syncWrap`
  (DECSET 2026). Atomicity and volume are independent fixes; both hold.
- The sequential-write rule survives: newly exposed lines are written
  with explicit positioning only *after* the shift sequence, and the
  wrap-gate guarantees positioned lines are single-row.
- `viewport()` and the content gate are untouched; this brief changes
  *paint emission*, not *viewport logic*.

## Testable seam

A pure `scrollPlan(lines, scroll, prevScroll, rows, cols)` returning
`{ kind: "shift", n, newLines }` or `{ kind: "full" }`: the decision
logic (wrap-gate, direction, footer exclusion) is tested exhaustively
as a pure function; the terminal emission is thin and verified by the
operator over SSH. The plan is the fixture; the emission is the
accused.

## Runbook rider: Compression yes

okuda's stated medium includes the SSH wire (the ssh-serve brief);
the runbook gains a client-side line: connect with `Compression yes`
(`ssh -C`, or per-host in `~/.ssh/config`). Not a code change — a
documented position, landing with this work because it is the same
finding from the other direction.

## Acceptance

- Scroll keystroke on single-row content emits shift + new lines
  only; footer bytes absent from scroll frames.
- Any visible wrapped line forces the full path; no visual difference
  between paths on the same input (the plan is deterministic).
- `bun test` green including new `scrollPlan` coverage (wrap-gate both
  ways, direction, n-clamping, region arithmetic).
- Operator over WiFi SSH: paging no longer sticky, with and without
  `-C`.
- `just check` passes.
