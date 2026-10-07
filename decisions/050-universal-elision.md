---
type: ADR
callsign: ADR-UNIVERSAL-ELISION-050
---

# Decision: Elision is the universal overflow policy — the terminal never soft-wraps what okuda emits

**Date:** 2026-10-02
**Status:** Accepted (amends ADR-004 — its last exception, the raw-block
gutter, closes; rides the same sitting as its two new consumers)

## Context

ADR-004 ruled that okuda never delegates wrapping to the terminal, and
carried an exception: raw blocks may overflow the right gutter — "art is
art." ADR-014 shipped the elision primitive, ANSI-run-aware, one function
with two proven consumers (code fences, the menu role fit). The fence
exception closed on 2026-09-30: *"overflow ugly by design was the lesser
evil when wrapping was the only alternative; elision is crueler and more
useful."* The ruling never propagated past code. Two consumers kept the
exception ADR-004 no longer justifies:

1. **Diagrams.** `diagramBlock` paints the binary's art with no elision,
   and the render context documents the exemption verbatim: *"raw
   blocks bypass it and may overflow the right gutter."* Overflowing
   art lines are then soft-wrapped by the *terminal* — the exact
   delegation ADR-004's title forbids, smuggled back through its own
   exemption. A wrapped diagram is a diagram pretending to be a taller
   diagram.

2. **Generic tables.** `renderTable` documents its policy: *"Fit the
   terminal width — never overflow. Shrink wide tables by wrapping the
   widest columns to a proportional budget."* That same proportional
   shrink was indicted by ADR-022 step 1 before it shipped — *"the fit
   algorithm wraps mid-token… unfit for purpose"* — and the decision
   fixed it for patterned surfaces only, with suppression in place.
   The generic table kept the defective policy and then built a
   stratum to hold what wrapping broke: `wrapANSI` per cell, `zipRow`
   to keep columns through the wraps, the word-salad fix on top.
   BRF-TABLE-WIDTH — *the renderer breaks words the glass had room
   for* — sat open since 2026-09-14: the defect, already briefed, never
   routed to the fix the house had already written.

The operator's snagging pass (2026-10-02) named it: one of three
elision targets works. The primitive is proven; the routing was never
drawn.

## Decision

**Every rendering surface elides at its width budget; nothing okuda
emits is ever soft-wrapped by the terminal.** The two exempt consumers
are routed to the existing primitive, not to a new one:

1. **Diagram lines elide at the code-fence budget.** Classify first —
   border/arrow detection needs the glyphs intact — then elide the
   composed line (`elideToWidth` walks ANSI runs and closes open
   styles at the cut). The "art is art" gutter exemption is repealed:
   an elided diagram tells the truth about the glass. When any art line
   is cut, the fence's indicator line says so — the projection-losses
   principle extended from *mermaid source elided* to the art itself.

2. **Generic table cells elide at their column budget; the in-cell
   wrap is abolished.** The proportional budget computation is VALID —
   it answers *how wide is each column* and stands unchanged. What
   dies is the wrap: a cell over budget truncates with `…`, rows stay
   single-line, and the stratum built to make wrapping hold (`zipRow`,
   the in-cell `wrapANSI`, the word-salad machinery) is deleted with
   the policy it served — per ADV-THE-PILE, the fix for two wonks that
   have to meet is to stop making them meet. ADR-022's
   suppression-in-place ruling, already the law for patterned
   surfaces, becomes the law for all tables. BRF-TABLE-WIDTH closes:
   no word is ever broken mid-token again; the long tail truncates
   honestly and the glass is the reader's knob.

## Alternatives Considered

| Alternative | Rejection |
|---|---|
| Terminal soft-wrap (diagrams' status quo) | The lie ADR-004's title names: a wrapped line is one line pretending to be two. |
| In-cell wrapping (tables' status quo) | Indicted by ADR-022 step 1 before it shipped; the `zipRow` stratum exists only to hold what wrapping broke. |
| `--width` knob on mermaid-to-md (re-compose at source) | The better long-term seam — the binary is the compositor, okuda the renderer — but cross-repo: the Derrida question, out of this silo today. In-silo elision now; the knob stays open for a wide-diagram future. |
| Re-proportion columns without wrap | Not an alternative — the budget arithmetic already does this; keeping it (with elide, not wrap) *is* the decision. |

## Consequences

**Easier:** one overflow policy for every surface; the wrap machinery is
deleted, not maintained; BRF-TABLE-WIDTH closes; diagram and table
rendering share the same cut, the same marker, the same honest edge.

**Harder:** diagram art loses right-edge content beyond the glass —
box borders elide at the cut, cruel and visible; wide table cells lose
their tails with `…`, and the reader's remedy is a wider glass, not a
taller table; the mermaid-to-md width seam stays unbuilt until a real
need for it arrives.

## Related

- ADR-004 — the amended parent; its last exception closes here
- ADR-014 — the primitive this routes two more consumers to
- ADR-022 — suppression in place; the patterned-surface precedent, now the law for all tables
- ADV-THE-PILE — the stratum this deletes
- BRF-TABLE-WIDTH — the open brief this closes (the cut cell)

## Annotation (2026-10-07) — the certification is withdrawn

**"The proportional budget computation is VALID … and stands unchanged" was
written without a measurement, and it was wrong on both counts.** It answered *how
wide is each column* with a share proportional to natural width, so the widest
column set the scale and every other column was squeezed toward the 3-character
floor whether or not the budget ever needed those characters. Measured at last, at
80 columns: **191 of 332 tables starved at least one column, 457 columns in all,
2887 elided cells** — columns elided while the budget had room to render them
whole (`scripts/tables-check.ts`, the `STARVED` reading).

What replaced it, all in BRF-TABLE-LADDER and its ADRs:

- **The ladder** (ADR-WIDENING-LAG-054 is unrelated; the ladder landed in
  `src/render.ts` the same day): a column's floor is its longest word, columns are
  completed cheapest-first, and the remainder is shared proportionally above the
  floor. Starved columns at 80: 457 → 192. At 120: 320 → 111.
- **The band.** A table is never drawn wider than 120 columns, and a 200-column
  glass renders identically to a 120-column one.
- **The rule brackets the table**, not the glass. Taking the bar from the pane put
  up to 103 columns of air under it; the rule is now measured off the lines
  actually drawn.
- **Headers wrap and never elide.** 129 of the starved columns at 80 were the
  column's LABEL losing to its own data. Now zero. That is this ADR's elision law
  narrowed already: a header is a block, so its cost is O(1) lines where a body
  cell's is O(rows).
- **The elision law narrows further when the prose column wraps** — the one column
  in a prose-shaped table that no allowed width can hold. Not yet landed.

The lesson this ADR now carries is not about tables. It is the evidence rule the
process playbook states: **a claimed fact names its instrument.** This one named
none, stood for five days, reached the source as a comment, and cost a session to
withdraw.
