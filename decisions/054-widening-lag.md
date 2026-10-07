---
type: ADR
callsign: ADR-WIDENING-LAG-054
date: 2026-10-07
---

# Decision: Lag the widening direction — a frame narrower than the pane is a margin, a frame wider is a lie

**Date:** 2026-10-07
**Status:** Accepted

## Context

Moving focus out of a Gloam pane reflowed a couple of words in it — visible only
in peripheral vision, over inside a frame, and impossible to pin by looking. It
took a frame trace (`OKUDA_FRAME_LOG`) to name it, and the log named it in one
read:

```
render width=74 maxline=72 lines=423
paint  cols=74 rows=32 tty=74x32 render=74 scroll=150
resize cols=75 rows=32 tty=75x32          ← the jolt
render width=75 maxline=73 lines=422
paint  cols=75 rows=32 tty=75x32 render=75 scroll=150
```

The pane genuinely gains a column when it loses focus, and the terminal reports it
truthfully — `tty` and our resolved `cols` agree at every line, so nothing is
lying and no fallback is in play. The cause is the host's focus outline changing
the pane's *pixel* box, which moves `pixels ÷ cell_width` by one. The document then
re-wraps (423 lines to 422) and the densest paragraph moves.

okuda's rule until now was ADR-ROLE-LAYOUT-022's: render to the live state, always.
That rule assumes the glass changes when the *reader* changes it. Here the glass
changed and the reader did nothing, and the honest response to a one-column
widening turns out not to be the same as the response to a resize.

## Decision

**A resize that only widens the pane by less than `CHROME_JITTER` (2) columns is
held: the frame stays as it is and the extra column is taken on the next render
that happens for any other reason.** The hold is taken *before* the fetch and the
render, which the first implementation got wrong: a re-render at a new width
produces different lines, the content gate compares rendered lines, and so the
"content changed" verdict was caused by the hold's own re-render — the guard could
never fire. A resize is therefore a geometry signal only; content belongs to the
watcher and to `r`. Narrowing is adopted immediately, height
changes always re-lay, and a widening of 2 or more columns is adopted at once.

The exception rests on an asymmetry, not on a preference:

- a frame **wider** than the pane is soft-wrapped by the terminal — a line
  pretending to be two, the one thing okuda never emits;
- a frame **narrower** than the pane merely has a margin.

So the two directions cannot be treated alike, and the safe direction to lag is
the widening one. Holding costs at most a column or two of unused margin until the
next render; it never costs a wrap. A focus cycle now costs nothing at all: focus
out widens by one and is held; focus back narrows to the width we are already
rendering at, so the guard answers `skip`.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Adopt every width change (the status quo) | A one-column chrome jitter re-wraps the document under the reader's eye while they are looking at another pane. The reflow is honest — the glass did change — but it responds to something the reader did not do and cannot perceive as a resize. |
| Ignore small changes in *both* directions | A frame wider than the pane is wrapped by the terminal. That is the defect the fence and diagram budgets carried for a day (elided lines landing on the glass's last column) and it is not a trade this house makes. |
| Ignore any change smaller than the threshold, including height | A height change moves the viewport, not the content, and the anchor work (ADR-RESIZE-GEOMETRY-046) depends on re-laying. It costs a repaint of identical lines and is always right. |
| Debounce: hold every resize for a beat, then adopt | The jolt happens while the reader is looking away, so delaying it by 200ms moves it rather than removing it — and during the beat the frame may be wider than the pane, which is the wrap case. |
| Host-side: an outline that does not change the pane's box | Not rejected — *preferred*, and out of our hands. This decision is what okuda owes while the host does it that way. |

## Consequences

**What became easier:**
- Focus changes no longer move text in a pane the reader is not looking at. The
  pane reads as stable under the peripheral-vision test, which is the only test
  the eye actually applies.
- The direction is now explicit in the code, so the next reader sees the asymmetry
  rather than inferring a bug from a lag.

**What became harder:**
- A frame may be up to `CHROME_JITTER - 1` columns narrower than the pane until
  the next render for another reason. Invisible (the margin is on the right), but
  it means "the layout matches the glass" is no longer strictly true at every
  instant. A future reader must not "fix" this as a stale width.
- One threshold, with a measured basis rather than a principled one: 1 column is
  what we observed, so 2 is the constant.

**Constraints this imposes:**
- The lag applies only to `resize`. A content change, a reload or a dereference
  renders at the live width, so the lag is bounded by the reader's next action.
- The geometry decision must precede the render. Taking it after is not a
  preference but a bug: the content gate reads frame difference, so the re-render
  the hold would have performed is itself the "content change" that overrides it.
- A resize no longer doubles as a content refresh. The watcher is the content
  channel and `r` is the manual override; a geometry event that changes no geometry
  now costs nothing rather than a full render thrown away.
- `frameStale` is pure and unit-tested, because a policy about *when* to lie (even
  in the harmless direction) should be provable rather than argued.

## Related
- ADR-ROLE-LAYOUT-022 — "render to the current state", the rule this narrows
- ADR-RESIZE-GEOMETRY-046 — the frame's second input; why a height change re-lays
- ADR-UNIVERSAL-ELISION-050 — the wrap this refuses to accept in the other direction
- `src/tui.ts` — `frameStale`, `CHROME_JITTER`, and the trace that found it
