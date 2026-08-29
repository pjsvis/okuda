---
type: Brief
callsign: BRF-VIEWPORT-PADDING
---

# Brief: Viewport padding — upper and lower render margins

**Date:** 2026-08-25
**Status:** Rejected (2026-08-25, same day — operator call: "doing less to get more")
**Branch:** feat/rhs-chip-headers → feat/tui-control-plane
**Context:** follows the RHS chip work (td-9fdca0). The chip established
the panel frame on the LHS (heading badge) and RHS (muted chip). The
horizontal margins (2-char LHS, implicit RHS) already exist in `finalize`.
The document reads as a panel, but the top and bottom are flush — the
frame is missing its fourth side. Dogfood finding: an empty line at the
top and at the bottom would make the whole thing look like a PAD.

## What

A single blank line above and below the rendered document, in `finalize`
(the render plane — not the TUI paint loop). The render already emits a
leading blank (Glow parity: "breathing room above the doc"); this adds
the matching trailing blank, completing the vertical frame.

## Why it earns its place

1. **Frame completion.** The chip work made the header a bounded panel
   (LHS badge + RHS chip). The body sits inside an implicit panel
   (2-char LHS, content-boundary RHS). A top and bottom blank line
   completes the panel on all four sides — the document reads as a
   contained unit, not a flush flow.
2. **Consistency with the horizontal margins.** The 2-char LHS margin
   is a render decision (applies in streaming, TUI, and watch). The
   vertical margins belong in the same place — a render decision, not
   a viewer accident. Putting them in the TUI would make them
   context-dependent; in render they're a grammar decision, like the
   LHS margin.
3. **Viewport breathing room.** In the TUI, a top blank line survives
   scrolling (it's part of the rendered lines, not a paint-loop pad),
   so the panel frame holds at every scroll position. A bottom blank
   gives the last line room before the footer.

## How

In `finalize` (`src/render.ts`):

- Keep the leading `\n` (already present, Glow parity).
- Add a trailing `\n` (the document currently trims trailing newlines
  via `.replace(/\n+$/, "") + "\n"`; change to preserve one trailing
  blank).

The result: `\n<document>\n\n` — one blank above, one blank below.

## Scope

- Render plane only (`finalize`). No TUI changes.
- No new roles, no new styler methods. A blank line is a blank line —
  no ANSI, no colour, no chip.
- Applies to all render contexts (streaming, TUI, watch) uniformly.
- NO_COLOR parity: blank lines are blank in both modes; line-count
  parity holds (the existing "plain output is the colored output minus
  escapes" test must still pass).

## Divergence from glow

Glow emits a leading blank (breathing room above) but trims trailing
newlines. Adding a trailing blank is a deliberate okuda divergence:
the panel metaphor earns the bottom margin. Log as a divergence row in
ADR-007 (alongside the RHS chip divergence), not a silent drift.

## Out of scope

- TUI paint-loop padding (viewport-level pad independent of scroll).
  The render-level margin handles the common case; a viewport-level
  pad is a separate, larger change and not needed for the panel read.
- Margins on individual blocks (per-block padding). The document-level
  margin is the frame; per-block padding is a different element.
- A coloured top/bottom rule. The frame is whitespace, not a line —
  consistent with how the LHS margin is whitespace, not a bar.

## Rejection (2026-08-25)

Rejected at the dogfood gate, before any code was written. Nothing was
built, so nothing was reversed — no ADR.

1. **A blank line only carries information at a boundary.** At
   scroll-top and scroll-bottom the edge itself is the signal; mid-scroll
   an injected blank is indistinguishable from a paragraph break — zero
   bits of information, pure decoration.
2. **The top blank already exists** (`finalize` leading `\n`, Glow
   parity); the terminal viewport plus the footer already say "this is
   the bottom" for free.
3. **A viewport pad would fight the content-anchor.** The resize anchor
   (`6471146`) keys on the non-blank line nearest the viewport middle;
   paint-loop padding perturbs the line↔screen-row mapping at every
   scroll position — complexity in service of whitespace nobody reads.

Pivot note: the project is deliberately doing less to get more. This
brief is the pivot's first recorded refusal.
