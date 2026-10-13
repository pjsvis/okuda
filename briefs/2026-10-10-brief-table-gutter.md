---
type: Brief
callsign: BRF-TABLE-GUTTER
date: 2026-10-10
---

# Brief: The table's gutter — the separator is chrome, and the cap pays for it

**Date:** 2026-10-10
**Status:** Rejected (2026-10-13) — the gutter is the body's column boundary, not chrome. See *Rejected* at the foot: the premise, the re-measurement, and the rule.
**TD:** BRF-TABLE-GUTTER (epic tracked by callsign)

## Context

ADR-TABLE-EDGE-CUT-055 reasoned that a table authored to 80 columns would fit
inside a 120-column cap, so the cap is headroom and the edge cut is the rare
branch. The reasoning held for the tables it measured and not for the corpus.
Measured 2026-10-10 with `bun scripts/tables-check.ts`:

- at **80** (the design glass): 391 tables in 235 files; **127 columns across 90
  files elided while a non-squeezing allocation had room to render them whole**
  (905 cells); 6 tables cut at the cap;
- at **120** (the cap): 6 tables cut — 216 hidden cells — and 4 columns in 3
  files elided with room to be whole.

The cap is 116 content columns (`src/render.ts:284`) and the gutter is **3**
(`src/render.ts:1565`): a separator of `" │ "` in the header and `"   "` in the
body. Every table therefore spends `3 × (cols − 1)` columns before a byte of
content. A six-column table spends 15; an eight-column table 21. The headroom the
cap was supposed to hold is being spent on chrome, and the two branches that
follow from spending it are the two defects the reader sees: cells that wrap
where the table would have fit whole, and cells elided at the right edge.

Rows are already separated by a blank line (`src/render.ts:1706`,
`bodyBlocks.join("\n\n")`), so the horizontal breathing room the gutter buys is
not the thing holding the table together. The grid is held by the header's pipes
and the alignment of the body beneath them.

## Objective

At the cap, a table draws whole and reveals every cell it can hold; the gutter
stops being the term that decides which tables fit. Content decides, not chrome.

## Evidence

Baseline, `bun scripts/tables-check.ts --width 120`, 2026-10-10: 6 tables cut in
5 files, 216 hidden cells; 4 starved columns in 3 files.

| file:line | cols | word budget | hidden cells |
|---|---|---|---|
| `&briefs.md:23` | 3 | 145 | 9 |
| `&briefs.md:50` | 4 | 122 | 2 |
| `briefs/index.md:10` (generated) | 4 | 170 | 98 |
| `decisions/index.md:10` (generated) | 4 | 130 | 59 |
| `debriefs/index.md:10` (generated) | 4 | 145 | 43 |
| `docs/2026-09-17-knowledge-work.md:20` | 2 | past 116 | 5 |

The word budget is `Σ longest-word-per-column + gutter × (cols − 1)`. Every
survivor above is over the cap because of a *word*: a filename, a callsign or an
inline URL no band width holds. **The gutter is not what cuts these six** — the
after-measurement below records that honestly rather than claiming the cap got
clean. What the gutter decides is the margin by which everything else fits.

## Scope

**In:** the gutter constant in `src/render.ts` and every use of it (the header
separator, the body separator, the wrap's `avail`, the word budget, the menu
table's `GUTTER` at `src/render.ts:1726`); the same constant in
`scripts/tables-check.ts`, **imported from the renderer rather than restated**
(one constant, two readers — the drift class ADR-DERIVED-AMP-TABLE-058 names);
the tests that encode the geometry; an `## Amended` entry on ADR-055 with the new
measurement.

**Out:** the three-branch grammar and the cap itself (ADR-055, unchanged); a
mid-word break for URLs and filenames (that is a different decision, and the
six survivors above are its case); wrapping the table down to the glass when the
glass is narrower than the cap (my 2026-10-10 proposal, not adopted here); the
vertical spacing between row blocks, which stays a blank line.

## Preconditions

- [x] Baseline measured at 80 and 120 (`bun scripts/tables-check.ts`).
- [x] `bun test` baseline: 716 pass, 1 pre-existing failure
      (`launcher — conformance smoke: --entries`, unrelated).
- [ ] Branch `feat/table-gutter` cut from `main`.

## Work Plan

1. [x] Export the gutter from `src/render.ts` as the single definition; set it to
      **1** (`│` in the header, one space in the body — the narrowest grid that
      still marks every column boundary).
2. [x] Point `scripts/tables-check.ts` at the exported constant; delete its own.
3. [x] Update the geometry-bearing tests; re-render a sample table and read it.
4. [x] Re-measure at 120 and 80; record before/after in this brief.
5. [x] Amend ADR-055 with the measurement and the reason (chrome, not content,
      was deciding fit).

## After — measured 2026-10-10

| reading | at 120 before | after | at 80 before | after |
|---|---|---|---|---|
| tables over the 80-col design width | 249 | **233** | 249 | **233** |
| columns elided with room to be whole | 4 | **3** | 127 | **116** |
| elided cells in those tables | 13 | **11** | 905 | **831** |
| tables cut at the cap | 6 | **5** | 6 | 6 |
| reflow (wrapped) tables | 153 | **147** | 153 | **147** |

The chrome was worth about a column per affected table and sixteen tables' worth
of fit. It does not clear the residual, and the measurement says why.

## Findings

1. **The six survivors are word-bound, and the gutter is not their cause.** Every
table still cut at the cap carries a *word* no band width holds — the word budget
is `Σ longest-word-per-column + gutter × (cols − 1)` and it exceeds 116 whatever
the gutter is. `&briefs.md:23` (65-column token), `briefs/index.md:10` (60-column
token: `011-zero-notification-stillness-and-decoupled-inbox-watchers`), the two
sibling indexes, `&briefs.md:50`, `docs/2026-09-17-knowledge-work.md:20` (two
columns past the band). The three indexes are **generated**, so 055's rule stands:
the compositor owns them.
2. **A guard fired, and it is a measurement artifact of a known defect.** At 80
the instrument reports one `allocator fault` — a wrappable table that still hid
content — at `docs/2026-09-04-more-stuff.md:71`. The render is *unchanged* by this
work (verified side by side at width 80: one line per row cut at the glass in both
the 3-column and the 1-column gutter). The instrument's `natural` is ~14 columns
wider than the renderer's because its `plain()` keeps `<CELLS>` and `<MODE>` where
the renderer deletes them — `docs/2026-09-19-the-tag-the-renderer-eats.md`, the
known `stripHtml` defect (`src/grammar.ts:33`, `src/render.ts:594`), 214
placeholders across 69 files. A table renders narrower than it was written; the
instrument measures what was written; the mismatch reads as a wrap missed. The
guard is doing its job — it found the two measurements disagreeing, not a
regression.
3. **The menu pattern keeps its own spacing.** `renderMenuTable` is *not* piped:
whitespace is its only delimiter, so a one-space gap makes a truncated slug read
as part of the callsign (`tests/table-diagram.test.ts:188` asserts the gap). It is
right-anchored and never exceeds the glass, so it pays no cap cost. It stays at 3.

## Rejected (2026-10-13) — the gutter is the body's boundary, not chrome

Left open for three days on a branch that fell 38 commits behind `main`, and the
stale figures were not the problem. The premise is wrong, and the measurement that
shows it is one render.

**The pipe is in the header only.** The body separates columns with
`" ".repeat(gutter)` (`src/render.ts:1632`, `bodySep`), so the gutter's width **is**
the body's column boundary. A header has a pipe to mark the boundary; a body has
nothing. So the gutter is not `3 × (cols − 1)` columns spent on chrome — it is the
grid, and *"the grid, and the scan across it"* is the one property
`ADR-TABLE-EDGE-CUT-055` says a table exists to provide. The commit's own rationale
— *"the pipe still marks every boundary"* — was false of its implementation: the
pipe never marked a body boundary, in either version.

At three columns the body reads as a boundary; at one it is indistinguishable from
a word space and the grid is gone. The same three-column prose table at glass 100:

```
gutter 1   compositing the environment the origin of the byte stream
gutter 3   compositing   the environment   the origin of the byte stream
```

**Only odd gutters can centre the pipe.** `gutterSep(pipe, g)` places it at
`floor(g / 2)`: at 3 it reproduces `" │ "` exactly, at 2 it is `" │"` (no right
space, so the header reads `│owner`), at 1 it is a bare `│`. The choice is 3 or 1,
not 3/2/1 — and 2 is worse than either, because the pipe stops reading as a
boundary and starts reading as a prefix.

**What the change measures, re-run today.** The figures above predate
`BRF-TABLE-GLASS-FIT`'s amendment to ADR-055, which retargeted the wrap to
`min(glass, cap)`. On the current model the starved and hidden readings are already
**0 at 74, 80 and 120 columns with either gutter**, so the separator's only
remaining measurable cost is the design-width count:

| reading (418 tables, `bun scripts/tables-check.ts`) | gutter 3 | gutter 1 |
|---|---|---|
| tables over the 80-column design width | 263 | **247** |
| columns sized by their label | 201 / 1305 | 201 / 1305 |
| header labels cut at 74 / 80 | 3 | **2** |
| hidden at the cap | 0 | 0 |
| starved | 0 | 0 |

A gain of **16 tables in 418 (3.8%)** moving inside the design width, and one header
label — against every table's column boundary. 3.8% against 100%.

**The rule, and why the gutter cannot be paid down another way.** Body pipes are not
available: the loose table is the origin doc's design language — *"eliminating
internal ASCII box lines reduces visual noise by ~50%"*
(`docs/2026-08-20-origin-doc.md`). With whitespace as the body's only separator,
**the gutter has a legibility floor of three and three is its design**, not headroom
spent on chrome. A table wider than the design width remains the authoring
contract's business, and the remedy remains the document or the compositor — never
the column boundary (`ADR-TABLE-EDGE-CUT-055`).

**No ADR amendment, on purpose.** The decision did not change. A rejection that
changes no decision is a brief; the callsign `BRF-TABLE-GUTTER` is the pointer, and
this section is what stops the experiment being re-run.

## Still open (out of this brief's scope)

- **Wrapping the table down to the glass**: today a table below the cap is cut by
a narrow glass, recoverably. The six survivors above are unaffected either way;
the 116 columns at 80 are what that proposal would address.
- **The `stripHtml` defect itself**: `docs/2026-09-19-the-tag-the-renderer-eats.md`
waits on a seam choice, and it is what makes this instrument reading ambiguous.

## Acceptance Criteria

- One definition of the gutter exists in the tree; `tables-check` reads it.
- At 120 the starved count falls and every table that still cuts does so on a
  word the band cannot hold — named by the instrument at `file:line`.
- At 80 the count of columns elided with room to be whole falls.
- A rendered table at 120 shows every column boundary in the header and aligned
  body columns beneath it.
- `just check` passes; `bun test` shows no new failures.
