---
type: ADR
callsign: ADR-TABLE-EDGE-CUT-055
date: 2026-10-07
---

# Decision: A table is an artefact — render it whole, cut the edge, never squeeze it

**Date:** 2026-10-07
**Status:** Accepted
**Amends:** ADR-UNIVERSAL-ELISION-050 (which repealed the wrap and certified the
squeeze); completes the doctrine ADR-TABLE-ELISION-014 stated and ADR-022 narrowed
to menus.

## Context

ADR-UNIVERSAL-ELISION-050 repealed the in-cell wrap and left the proportional
allocation in place, certifying it as valid without a measurement. Measured at last,
it starved columns the budget could have rendered whole; BRF-TABLE-LADDER replaced
it, and starved columns at 80 fell from 457 to 192.

But the ladder answers the wrong question. It asks *how do I make this table fit*,
when the table is a fixed artefact — **it was written down, and it cannot be
elided.** A markdown table has a width the author chose. Squeezing it per column
buys fit by spending the one property a table exists to provide: the grid, and the
scan across it. The costs were visible all day: per-column budgets, a
format-vs-margin arithmetic that put elided lines on the glass's last column
(ADR-TABLE-ELISION-014's species of lie), header wrapping machinery that exists only
because squeezing starves the column's own label, and a row-block mechanic still
owed to hold a wrapped prose cell.

Diagrams and code fences already do the honest thing: the artefact is composed at
its own width and the composed **line** is elided at the glass. The table was the
exception. This removes the exception.

## Decision

**A table is rendered at its natural width — the width the author wrote — capped at
the band's 120 columns. When the glass is narrower than the table, the composed row
line is elided at the content width with `…` at the cut, exactly as a diagram line
is. Body columns are never squeezed: the visible prefix is a proper table with
aligned columns, and the tail falls off one edge.**

- **The contract:** authors write tables to 80 columns; 120 is headroom. Enforceable
  and enforced by the instrument, which already reports every table exceeding the
  design width (`design width`, measured).
- **Headers still wrap.** They are the column's decode key, a header is one block so
  its cost is O(1) table lines, and wrapping a long label *narrows* the table
  without hiding anything. That work stands; it is the body that stops being
  squeezed.
- **Widening restores.** Below the cap the cut is a window onto a fixed artefact, so
  the reader's remedy is the glass. Past the cap it is not, and the document owns
  the problem: those are the outliers the instrument names by file and line.

**"Computer says NO: Too ugly."** A table whose cut would cost more than the
authoring contract tolerates is not a rendering problem — it is a document problem,
and the answer is to reshape the table, not to teach the renderer to fold it. The
instrument is where that verdict is spoken, with the document named.

## Measurements (2026-10-07, 348 tables)

| glass | fit whole | cut | columns lost per cut table | widest loss |
|---|---|---|---|---|
| 74 — an observed split pane | 113 (32%) | 235 | **p50 = 1**, max 6 | 510 chars |
| 80 — the design width | 135 (39%) | 213 | **p50 = 1**, max 6 | 504 chars |
| 120 — the cap | 213 (61%) | 135 | **p50 = 1**, max 3 | 464 chars |

Two readings matter. **The typical cut costs one column, not half the table** — and
on the pilot it converges exactly with the ladder (keys whole, the prose tail at the
same width), because the ladder was doing arithmetic to reach the answer that not
intervening reaches. And **the model differs from the ladder only on many-column
tables**, where it trades "every column squeezed" for "the left columns intact, the
right ones off-screen" — the principle, stated as a measurement.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Keep the ladder (per-column completion) | It answers "how do I make this fit" for an artefact that does not need to fit. It costs the grid, and it carried four defects in a single day — all of them arithmetic about budgets, margins and formats that the edge cut does not have. |
| Ladder when it can, edge cut when it cannot | Two policies for one surface, and the reader cannot tell which they are looking at. The ladder's convergence with the edge cut in the median case means the second policy buys almost nothing for a second set of rules. |
| Wrap the prose column (the brief's increment 4) | It exists to hold a wrapped cell, i.e. to answer a question the squeeze created. Remove the squeeze and the question dissolves; the row block, the zip stratum and their defects go with it. |
| Squeeze only the widest column | Still a squeeze, still per-column arithmetic, still hides content inside a cell rather than at one honest edge. |
| Raise the cap past 120 | Beyond 120 columns a table gains air between its columns rather than information (BRF-TABLE-LADDER). The cap is a legibility boundary, not a budget limit. |

## Consequences

**What became easier:**
- One overflow policy for every raw block — table, fence, diagram — and it is the
  one already proven on two of the three.
- The renderer loses arithmetic: no shares, no floors, no completion order, no
  per-cell elision, no row block. The lines that remain are "compose the row, elide
  the line", the same two lines a diagram uses.
- The visible prefix of a cut table is a *correct* table: aligned columns, and one
  edge that says what happened.

**What became harder:**
- The corpus owes an authoring pass. 213 of 348 tables exceed the 80-column design
  width today, so at a typical pane the cut is the common case rather than a rare
  fallback — which is acceptable only because the median cut costs one column.
- A reader who cannot widen (a split pane below the design width) sees a prefix and
  has no remedy but tucking the pane away. The model presupposes a pane at or above
  the authoring width; the compositor cannot supply one, and telling it the width is
  ADR-ROLE-LAYOUT-022's layer violation. This is the condition under which the model
  holds, and it is the environment's to meet, not the renderer's.

**Constraints this imposes:**
- The instrument's `starved` reading becomes meaningless (nothing is squeezed) and
  is replaced by the cut: how deep, how many columns, and by name for the outliers
  past the cap.
- The cap must stand. Past it, widening cannot restore, so the remedy moves to the
  document — and the instrument has to say so rather than let a reader discover it.

## Related
- ADR-TABLE-ELISION-014 — the doctrine, stated first, that a shrink-wrapped table is
  a broken table pretending to be whole
- ADR-UNIVERSAL-ELISION-050 — the elision law this extends to the table's own line,
  and the certification it withdraws (annotated in place)
- ADR-ROLE-LAYOUT-022 — the right-anchored menu, and the scope gate that keeps the
  compositor out of it
- ADR-WIDENING-LAG-054 — why a one-column widening is held rather than reflowed
- BRF-TABLE-LADDER — the brief, and the ladder this ADR retires to the role of
  evidence for removing it
