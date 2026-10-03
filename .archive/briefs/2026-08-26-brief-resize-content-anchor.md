---
type: Brief
callsign: BRF-RESIZE-CONTENT
---

# Brief: Resize content-anchor — keep the line under the eye

**Date:** 2026-08-26
**Status:** Open
**Branch:** feat/rhs-chip-headers → feat/tui-control-plane
**Context:** follows the TUI control-plane brief (`2026-08-23-brief-okuda-tui-control-plane.md`)
and interacts with the viewport-padding brief
(`2026-08-25-brief-viewport-padding.md`). Dogfood prompt: reflowing
markdown in herdr (hosted in Ghostty, text-size zoomed) is wicked — the
line you were reading stays under your eye. okuda should feel like that.

## The problem

`onWinch` preserves `scroll` as a **physical-line index**:

```ts
const onWinch = (): void => { void (async () => {
  lines = await renderLines(await readSource(), dims().cols);
  scroll = Math.min(scroll, viewport(lines, 0, dims().rows - 1).maxScroll);
  paint();
})(); };
```

This is decorated Stuff. Width change → `wrapANSI` reflows → a logical
line that was 3 physical lines at 80 cols becomes 2 at 100. Physical
index 50 now names different content. We tell the reader "you're still
here" while the here moved. The protocol calls this out: format without
substance, the benchmaxxing of scroll models.

The viewport-padding brief makes the lie **worse, not better**. Its
leading blank becomes physical line 0. Under index-preservation, the
anchor target on resize is *that blank*, not the content. So the margin
brief is a reason to fix the anchor, not a reason to defer it.

## The user-visible goal

Ghostty reflows wrapped lines itself — the terminal owns the wrap, so
resize keeps the reading position for free. okuda owns its wrap
(`wrapANSI` in `render.ts`), so it cannot delegate. But the goal is the
same one the herdr/Ghostty dogfood demonstrated: **on horizontal resize,
minimise apparent vertical movement — the line under the eye stays
under the eye.**

(The first implementation anchored the *top* visible line and pinned it
to the top. Dogfood (`just manifesto-okuda`, narrowing the terminal)
showed the eye drifting down on width-reduce and up on widen: the top
was a fixed point but the eye is in the middle, so the lines between
moved. The fix: anchor the non-blank line nearest the viewport *middle*
and pin it back to the *same screen row*. This trades a stable top for a
stable eye — the correct trade, since you read in the middle, not at
the edge. Logged here so it's a decision, not a drift.)

## What (the simplest thing)

Capture the **stripped text of the first visible non-blank line**
before re-render. After re-render, scan the new physical lines for the
earliest match, preferring matches near the old scroll position. Set
scroll so that matched line is the first visible non-blank line.

TUI-only. No render-plane change. ~15 lines in `tui.ts`.

## Why this is enough (the effort-justification gate)

The "correct" version threads source-line identity through every
`Bun.markdown` handler, through `wrapANSI`, through `finalize`, and has
`renderDocument` emit a parallel `srcLine[]` (one source index per
physical line). That is the thing that cannot drift. It is also a
render-plane refactor sized between "small" and "unblocks a lot" — and
it touches the same `finalize` the margin brief is about, forcing the
two to land together.

We don't need it, because **the cheap anchor's failure mode is
invisible.** A wrong match only happens on *identical* stripped content
(blank lines, repeated short lines, repeated list items). When the
matched line looks identical to the one you were reading, your eye
lands on the same words. Place-keeping has not failed in any way the
reader can perceive. The variance compresses where it matters; the
edge case (duplicate content) is a no-op, not a regression.

This is the predictably-adequate criterion: the floor (index-lie) is
raised to content-match; the ceiling (logical tagging) is not needed
because its marginal benefit is imperceptible. Tagging earns its place
only if a *second* feature needs source-line identity — e.g. a
go-to-source-line jump, or a diff-style change highlight. None is on
the board. **No second consumer → no heavy prerequisite.**

## How

In `tui.ts`, `onWinch`:

1. Before re-render, find the non-blank visible line **nearest the
   viewport middle** (the eye proxy). Capture its stripped text (ANSI
   removed, 2-char margin removed) and its screen-row offset (0-based
   from the viewport top). (Empty/all-blank viewport → no anchor;
   fall back to index-preservation + clamp.)
2. Re-render at the new width.
3. Walk the new lines, stripped, for the index whose text equals the
   anchor — **bounded to one viewport radius** around the old scroll.
   Small-moderate reflow hits a near match precisely. A big resize
   correctly misses (returns `-1`) rather than grabbing a distant
   duplicate — the bug that jumped to the top.
4. If found, set scroll so the matched line lands at its **original
   screen row** (`scroll = idx - offset`, clamped). Pinning the middle
   line to the middle row minimises apparent vertical movement. If not
   found, fall back to **proportional** (`scroll ≈ oldScroll / oldMax ×
   newMax`) — imprecise but never jumps to the top, the failure mode
   that lost the reader's place.

Helpers: `stripForAnchor(line)` (strip ANSI + margin), `anchorFor(lines,
scroll, height)` (returns `{ text, offset } | null`), `findAnchor(lines,
anchor, hint, maxRadius)` (bounded outward-biased lookup, returns `-1` on
miss), `proportionalScroll(oldScroll, oldMax, newMax)` (the robust floor).
All pure, in `tui.ts` — a control-plane concern, not render. (Render's
`stripTags` is about internal markers, not ANSI; do not reuse it.)

**The proportional fallback** is the muppet the brief rejected as a
*primary* strategy (always imprecise). As a *fallback* for the rare
big-reflow case, it's the robust floor that stops the jump. The brief's
rejection was of "proportional *instead of* anchoring"; this is
"proportional *when* anchoring fails." Different gate.

## Scope

- TUI control plane only (`tui.ts`). No render, grammar, or wrap change.
- One pure helper (`stripForAnchor`) + revised `onWinch`. No new roles,
  no new styler methods.
- Applies only to horizontal resize (the reflow case). Vertical resize
  keeps index-preservation — height change does not reflow content, so
  the index is still honest and clamping is correct.
- NO_COLOR parity: the anchor strips ANSI before comparing, so the
  same string matches in both modes. No divergence row needed.

## Interaction with the viewport-padding brief

The margin brief adds a leading blank (physical line 0) and a trailing
blank. Under the content-anchor, both are harmless: the anchor skips
blanks by definition (first **non-blank** visible line), so the leading
margin never becomes the anchor; the trailing margin never affects the
search. The two briefs compose cleanly and can land independently.
Land the margin brief first (smaller, render-only); the anchor second
(TUI-only). Neither blocks the other.

## Out of scope

- **Logical-line tagging through the render plane.** The heavy
  prerequisite. Parked until a second consumer appears.
- **Fractional/proportional scroll.** Looks like place-keeping, behaves
  badly on uneven documents (a 3-line heading followed by a 60-line
  code block is not 1/63th content). Rejected; named here so it doesn't
  come back.
- **Vertical-resize anchoring.** Height change doesn't reflow; clamp is
  honest. Adding content-anchor to vertical resize is ceremony.
- **Ghostty-style terminal-owned reflow.** okuda owns its wrap; the
  reference is a goal, not an implementation to copy.
