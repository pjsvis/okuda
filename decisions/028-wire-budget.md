---
type: ADR
callsign: ADR-WIRE-BUDGET-028
---

# Decision: The wire is the budget

**Date:** 2026-09-02
**Status:** Accepted

## Context

okuda was deployed remotely for the first time: over SSH, from the Mac
to the Omarchy box. The wire is one metre of LAN. That metre taught more
than any synthetic benchmark could have, because local testing had been
structurally blind to it — a PTY write is effectively free, so no amount
of local dogfooding taxes the render path for what it sends. The moment
any wire exists, wire economics apply, and three findings arrived in one
afternoon:

1. **Visible tearing** (fixed by BRF-SYNC-OUTPUT): frames split across
   TCP packets composite as intermediate states. The fix was ten bytes
   of DECSET 2026 bracket — atomicity, not volume.
2. **Sticky paging** (briefed as BRF-SCROLL-REPAINT): even atomic frames
   are ~90% redundant with their predecessors; a one-line scroll re-sent
   the whole viewport. `ssh -C` confirmed the diagnosis materially —
   only redundant traffic compresses that well. Volume, not atomicity.
3. **The ladder worked**: ten bytes, then a config line, then — only
   after both were exploited and the residual persisted — real
   engineering commissioned with evidence attached.

The operator then stated the principles the ladder had already been
following. This ADR makes them standing policy so future briefs inherit
them without re-deriving them from a conversation.

## Decision

Four clauses. They collapse into one on a wire: bytes are complexity
made visible, so sending less *is* being simpler.

**1. Speed is a feature.** Responsiveness is not a property of the
renderer's internals; it is part of the product surface. A pager whose
whole job is repaint-on-keystroke is judged per keystroke. Briefs that
touch the render path state their wire impact alongside their visual
impact.

**2. Wire bytes are the budget.** The binding constraint for this
product is bytes (and packets) per interaction, not CPU, not memory,
not algorithmic elegance. Optimizations are ranked by bytes saved per
complexity spent.

**3. Cheap before clever — exploit what others already shipped.** The
smallest improvement goes first, is measured, and only its residual
commissions the next. The best optimization is one someone else already
paid for: the terminal's scroll model (ESC S/T, scroll regions) does
redundancy removal we would otherwise write, test, and own ourselves.
A general diff engine is clever; a scroll region is cheap and wins.

**4. Measured before asserted.** Speed claims meet the same standard as
the citation claims in the i811 corpus: verified before promised. Where
a pure seam makes the wire budget computable (BRF-SCROLL-REPAINT's
`scrollPlan`), the budget is pinned as a regression invariant — bytes
per scroll becomes an `expect()`, and the day a refactor quietly
triples the frame, the suite names it.

## Consequences

- Render-path briefs gain a wire-budget line in their acceptance
  criteria wherever a pure seam makes it computable.
- The 1,000 mm lesson generalizes: SSH to a second machine — even on a
  desk beside the first — is the cheapest realistic stress test this
  repo owns, and beats any simulator we could build. Local green is a
  necessary condition, never a sufficient one (the entry-guard bug of
  the same afternoon: tests that passed only under the harness's piped
  stdin).
- Complexity spent on the wire must be spent where it degrades, never
  tears: fast paths carry gates (the soft-wrap gate of
  BRF-SCROLL-REPAINT) and fall back to the full path, always.
- This ADR does not mandate premature optimization. It mandates
  *measured* optimization, triggered by evidence — the same deferred-
  decision pattern the rest of the constitution uses.
