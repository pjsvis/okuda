---
type: Brief
callsign: BRF-WRAP-AT-CAP
---

# Brief: Wrap at the cap — the third branch

**Date:** 2026-10-08
**Status:** Done (2026-10-08) — one measured correction: the irreducible set is six, not four, because the instrument had stripped the link URLs the renderer draws. Recorded in ADR-TABLE-EDGE-CUT-055.

## Context

ADR-TABLE-EDGE-CUT-055 removed the squeeze: a table renders at the author's widths and is cut at the glass, so nothing is reflowed to fit. That holds *below* the cap, where the reader's lever is widen and the cut is recoverable — widen and the bytes come back. Above the cap there is **no lever at all**: 120 and 200 columns render identically, so the cut *hides* content, and hiding is the one thing the table model refuses. The operator's own principle, from the model's first statement: *we never hide table content, we only truncate the RHS when the window is too narrow.* Past the cap the window is not too narrow. We are.

Surfaced by a real table in `docs/2026-08-30-naming-like-nasa.md`, section *Lessons,
attributed* — four columns, naturals `[51, 62, 55, 45]`, total **222** against a cap of
116, identical at 120 and 200. The Evidence and Source columns are cut at every width
the glass can offer. Longest word per column: `[13, 14, 13, 18]` — every column has
somewhere to break.

## Objective

Add the third branch: **above the cap, wrap the columns until the table fits; nothing is
hidden.** Below the cap nothing changes; where a column's longest word exceeds its share
the table stays the document's problem.

## Evidence — measured 2026-10-07, `bun scripts/tables-check.ts`

| reading | value |
|---|---|
| tables exceeding the cap (natural > 116) | 135 of 348 |
| median excess over the cap | 66 columns |
| worst excess | 484 columns |
| word-irreducible (a longest word cannot fit its share) | 4 |
| the surfaced table | 222 wide — 106 over |

**Correction (2026-10-08, render parity).** The four was a source-side artifact:
`plain()` stripped `[text](url)` to `text`, but okuda draws a link as `text url`
(Pass C), so a visible URL's long token is a word no wrapper can break. With the
instrument mirroring the render the irreducible set is **six** — the four above
plus `&briefs.md:19` and `&briefs.md:43`, both carrying visible link URLs. The
correction is recorded in ADR-TABLE-EDGE-CUT-055; the model is unchanged.

## Design — three branches, one grammar

```
natural ≤ cap            → draw whole; cut only at a narrow glass (widening recovers it)
natural > cap,
  every word fits        → WRAP the columns to fit the cap: nothing hidden, rows are blocks
a word fails its share   → irreducible: cut, and the instrument names the document
```

**The word-floor test returns — at the cap instead of the glass.** The retired ladder
asked *do the words fit?* at every width and squeezed when they did not. The question
only matters where the reader has no lever; below the cap the reader has one, so nothing
is asked. Same test, in the place it was always meant to be — and it makes the two
models a sequence rather than rivals.

**Cost, measured rather than assumed.** Every column of the surfaced table can break, so
at roughly 27 columns each the table fits under 116 at about three lines per row. Across
the over-cap set the median excess is 66 columns — about two lines a row to wrap. The
tall-table warning in ADR-TABLE-ELISION-014 still applies, and it is answered by counts
rather than policy: two to three lines a row is a table, twenty is a paragraph with
pipes, and that verdict belongs to the instrument.

**The row block returns, scoped.** Rows become multi-line blocks — leading cells padded
to the block height, the wrapped cell setting it. Increment 4 of BRF-TABLE-LADDER was
cancelled because it held a cell the *squeeze* had broken. This holds a cell the *cap*
cannot contain. Same mechanic, opposite justification, and only for over-cap tables.

**No renderer threshold on wrap depth.** A table needing twenty lines a row renders as
twenty lines a row, and the instrument says so by name. The renderer does not decide
aesthetics — *Computer says NO: Too ugly* stays where ADR-TABLE-EDGE-CUT-055 put it: in
the measured verdict, not in a policy.

## Scope

**In:** the three-branch decision in `renderTable`; the floor test at the cap; the row
block for over-cap tables; wrapping at word boundaries; tests; the instrument's cut
reading adjusted so a wrappable over-cap table is not reported as cut.

**Out:** the below-cap cut (unchanged — its recoverability is why it is acceptable); any
per-column squeeze to fit the *glass* (ADR-TABLE-EDGE-CUT-055's removal stands); a
renderer threshold on wrap height; wrapping the irreducible set (the document's problem);
the generated index tables (the compositor's — their "word" is a forty-character
filename and cannot be wrapped by anyone).

## Preconditions

- [x] ADR-TABLE-EDGE-CUT-055 read in full. This adds a branch to it; it does not reverse
      the edge cut.
- [x] The floor test re-derived from scratch. The ladder's implementation was deleted on
      2026-10-07 and must not return as code: the test is a **predicate at the cap**, not
      an allocator that distributes width. — `wordBudget <= BAND_CONTENT`; the wrap's
      allocation is a word floor plus an even slack split, no per-column need.
- [x] Determinism at a fixed width confirmed. The wrap makes row height part of the
      layout, so a non-idempotent wrap would make tables jitter under re-render. —
      `height is stable: two renders at one width are identical`.

## Work Plan

1. [x] The branch decision, with the floor test at the cap, and a comment stating why the
       cap is the boundary rather than the glass. — `renderTable`, three branches;
       `natural > BAND_CONTENT && wordBudget <= BAND_CONTENT && !giants`.
2. [x] The row block: compose each cell to lines, pad the shorter cells to the block
       height, and let the rule bracket what is drawn. — `bodyDrawn: string[][]`;
       rows joined by a blank line between blocks, lines contiguous within one.
3. [x] Tests: the surfaced table (nothing cut, no mid-word break); a word-irreducible
       table (cut, as now); a below-cap table (byte-identical to today); height stability
       across two renders at one width. — `tests/table-fit.test.ts`, five vectors,
       two captured goldens.
4. [x] Dogfood `just tables`, `just tables-monster`, and the naming document at 74, 80
       and 120 columns. — the surfaced table renders whole at 120; at 74/80 it wraps to
       the cap and the glass cuts recoverably (widen and the bytes return).
5. [x] Instrument: a wrappable over-cap table must not report as cut; the `outliers`
       list must be unchanged at four. — the broken-word detector is retired (a wrapped
       row is a block, so every legitimate wrap paired); CUT now reads content hidden at
       the cap. The outliers list is six, corrected; see the Evidence note.
6. [x] Record: ADR-TABLE-EDGE-CUT-055 gains the branch **in place** — the grammar is one
       decision, and a second ADR for its third branch would split the law. — *The third
       branch — wrap at the cap* added to the Decision, with the correction.

## Acceptance Criteria

- *Lessons, attributed* renders whole at 120 columns: no `…`, no column lost, Evidence
  and Source readable.
- Every wrappable over-cap table renders whole; the instrument's cut reading *at the cap*
  falls to the irreducible set.
- The irreducible set is unchanged at four tables, still named by file and line.
  **Corrected:** it is six — the four plus two `&briefs.md` tables carrying visible
  link URLs (render parity; ADR-TABLE-EDGE-CUT-055). The set is named by file and
  line and the count is width-independent.
- Below-cap tables are byte-identical to today's output — asserted, not assumed.
- No mid-word break inside a wrapped cell. Words break at spaces; `…` appears only where
  a word cannot fit, which is the irreducible case.
- Two renders of one document at one width are identical — height stability.
- `bun test` passes; no new dependency.

## Notes

- **The risk this brief carries is the ladder returning in disguise.** The floor test is
  a predicate at the cap; the moment any arithmetic distributes width *across* columns to
  reach a fit, the disagreement between the models is back and the brief is wrong.
- **A wrapped table carries no marker, because nothing is missing.** The cut is what earns
  the `…`. Tall is visible; hidden is not, and only one of those is a lie.

## Related

- ADR-TABLE-EDGE-CUT-055 — the model this completes
- ADR-TABLE-ELISION-014 — the tall-table warning, answered here by counts
- BRF-TABLE-LADDER — the ladder's retirement, and the word-floor test this re-homes
- `docs/2026-08-30-naming-like-nasa.md` — the surfaced table
- `scripts/tables-check.ts` — the readings that gate it
