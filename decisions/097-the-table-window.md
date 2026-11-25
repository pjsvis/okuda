---
type: ADR
callsign: ADR-TABLE-WINDOW-097
date: 2026-11-25
---

# Decision: A wide table scrolls inside the paper, and says so

**Date:** 2026-11-25
**Status:** Accepted
**Enforced by:** five checks in `scripts/html-package-verify.ts`
(`just html-verify`, 48 checks): the page does not scroll sideways; a wide table
has a window of its own; the window stays inside the paper; the clip reports
itself; the window is reachable by keyboard.

## Context

The cahier's measure is `80ch` (`scripts/html-package.css:51`) — a *character*
count, so the paper is a fixed width and does not grow with the window. A
six-column table overruns it on **any** screen, and until now the table simply
left the paper: transparent background, so its cells spilled from the ground
(`rgb(34,31,28)`) onto the desk (`rgb(23,21,15)`) and the page carried a
horizontal scrollbar.

Measured 2026-11-25 in Chrome, on `docs/2026-10-30-server-blades-in-space.md`:

| reading | before | after |
|---|---|---|
| page `scrollWidth` (viewport 756) | **1383** | **756** |
| tables running past the paper | 4 of 4 (worst 583 px) | 0 |
| the reader can tell a table continues | no | yes (4 gradient layers) |

The defect was reported from the glass rather than by a measurement, and the first
hypothesis — that the new MathML in table cells had widened the tables — was
**wrong**: the same document on HEAD overflows by 627 px, with MathML by 583 px.
MathML is narrower than the glyph text it replaced.

## Decision

**The table gets a scroll window inside the paper.** Each `<table>` is wrapped in
`<div class="table-scroll" tabindex="0">` by a post-pass over the generated HTML —
the document and every panel body — with `overflow-x: auto; max-width: 100%`.

**And the clip reports itself, in CSS and in geometry rather than by a script.**
Four background layers: a ground-coloured *cover* at each end attached `local`, so
it moves with the content, over a *shadow* attached `scroll`, so it stays put. The
shadow is visible only where the cover has slid away from it, so a shadow at the
right edge means *there is more table this way*, and a table that fits shows
nothing at all. The condition is measured by the layout engine rather than
asserted by a class, which is why no second script and no `data-clipped` toggle
were needed.

**`tabindex="0"` because a clip must be readable.** A container that clips and
cannot be focused is a table a keyboard reader cannot finish.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| **Paint the table `--okuda-ground`** (the first suggestion, and the cheapest) | A repaint, not a repair: it changes no measurable geometry — the page still scrolls sideways by the same 583 px. And it trades a colour seam for a worse silhouette: the paper's edge is visible *because* the desk shows, so a ground-coloured table makes the paper grow a rectangular shelf on the right only, the left edge still sitting inside the padding. |
| Do nothing — the page scrolls, which is what the terminal's edge cut became in a browser | The page scrolling sideways at *every* window width, on a page that is a bounded artefact, is the artefact lying about its own boundary. |
| Widen the paper to fit its widest table | One wide table would then set the measure for all the prose on the page. The measure is a reading property; a table is an artefact passing through it. |
| Truncate the table (the terminal's edge cut, ported literally) | `ADR-TABLE-EDGE-CUT-055` cuts because a terminal **cannot** scroll. Porting the cut to a medium that can is porting a constraint, not a rule — **frame defaulting** in the interface. |
| Squeeze: reflow cells to fit | Refused by the same ADR, and it produces a shape the author never wrote. |
| A `data-clipped` class toggled by the existing inline script | A second runtime behaviour for something the layout engine already knows. The CSS attachment pair is the same information derived, not asserted — and it cannot drift from the geometry, because it *is* the geometry. |
| A second wrapper element for an overlay (`position: sticky` fade) | One more element and a second background to keep in step with the palette. |

## Consequences

**What became easier:**

- **The paper keeps its silhouette and its shoulder.** A wide table no longer
  touches the desk, and the page never scrolls horizontally.
- **The affordance is free of state.** No script, no class, nothing to keep in
  sync with a resize or a panel opening. A panel that opens later is clipped
  correctly the first time it is laid out.
- **Panels inherit it**, because the wrap runs on panel bodies too — the defect
  was in both places and one pass covers both.

**What became harder:**

- **The first and last two rem of a wide table are dimmed** by the covers. That is
  the cost of the trick and it is visible on a table whose content runs to the
  edge.
- **A fitting table inside a focusable div is a tab stop that does nothing** — the
  cost of `tabindex` being unconditional, accepted because the alternative is a
  keyboard reader who cannot reach a clipped table.
- **Two gradient layers must agree with the palette.** A future change to
  `--okuda-ground` moves the covers with it; the shadow's `rgba` does not. Named
  here so the next palette change checks it, since the verify check counts layers
  rather than comparing colours.

## Related

- `decisions/055-table-edge-cut.md` — `ADR-TABLE-EDGE-CUT-055`, the doctrine this
  applies to a medium that can scroll
- `scripts/html-package.css` — the `.table-scroll` block and its reasoning
- `scripts/html-package.ts` — `wrapTablesPass`
- `scripts/html-package-verify.ts` — the five checks
- `decisions/096-the-export-identifies-more-maths.md` — the change that surfaced it,
  and which made tables *narrower*, not wider
