---
type: Debrief
callsign: DBF-WRAP-AT-CAP
date: 2026-10-08
---

# Debrief: Wrap at the cap — the third branch, and the count that moved

**Date:** 2026-10-08
**Status:** Done
**Briefs:** BRF-WRAP-AT-CAP (`briefs/2026-10-08-brief-wrap-at-cap.md`, now Done)
**ADR:** ADR-TABLE-EDGE-CUT-055 amended in place (*The third branch*)

## TD

the BRF-WRAP-AT-CAP epic (the ID lives in the ephemeral ledger, per the   td playbook — persisted docs cite the callsign, never the ID)

## What happened

The edge cut (ADR-TABLE-EDGE-CUT-055) stopped squeezing tables, which is right
below the cap: the reader's lever is widen, and widening brings the bytes back.
Past the cap there is no lever — 120 and 200 columns render identically — so the
cut *hides* content, and hiding is the one thing the table model refuses.

This sitting added the third branch: above the cap, wrap the columns until the
table fits; nothing is hidden.

The work was small and the measurement was not. The renderer change is a branch
and a row block. The sitting's real content is what the instrument turned out to
have been getting wrong.

## The model

Three branches, one grammar:

```
natural ≤ cap            draw whole; a narrow glass cuts recoverably
natural > cap,
  every word fits        WRAP the columns to the cap: rows become blocks
a word fails its share   irreducible: draw and cut; the document is named
```

The wrap's allocation is deliberately un-ladder-like: every column takes its
longest word as a floor, and the slack is split **evenly**. No per-column need,
no completion order, no proportional budget — the arithmetic the retired ladder
used to reach a fit is absent. The floor test is a predicate at the cap, never
an allocator across columns.

A wrapped row is a block: the tallest cell sets the height, the short cells pad,
the rule brackets what is drawn. A wrapped table carries no marker, because
nothing is missing.

## The measurement

`bun scripts/tables-check.ts --width 120`, 352 tables across 211 files:

| reading | before | after |
|---|---|---|
| tables wrapping | 0 | 135 |
| content hidden at the cap | 135 | 6 (the irreducible set) |
| outliers | 4 | 6 (corrected — see below) |

At a narrow glass the wrapped table is cut with `…`, recoverably: the wrap
targets the cap, because the floor test only matters where the reader has no
lever. The surfaced table (`docs/2026-08-30-naming-like-nasa.md`, *Lessons,
attributed*) renders whole at 120 columns; at 74/80 it wraps to the cap and the
glass shows a prefix that widening restores.

## The count that moved, and why

The brief expected four irreducible tables. Render parity says six, and the two
extras are not new faults — they were always there, hidden by the instrument.

okuda draws a link as `text url` (Pass C, the URL visible inline by the
operator's own request). So a link's URL is table content, and its long unbroken
token is a word no wrapper can break. The instrument's `plain()` had been
stripping `[text](url)` to `text`, so two editorial tables in `&briefs.md`
looked wrappable when the renderer could not wrap them.

The same pass also stripped intra-word underscores (`NO_COLOR`, `RE_MD_LINK`) and
did not unescape backslash escapes (`\-`), which had made the retired cut
detector disagree with the render in a second way.

Two instrument bugs, one root: the instrument was measuring a text the renderer
does not draw. Fixed: `plain()` now mirrors the renderer. The irreducible set is
the honest six, named by file and line, and it is width-independent — the same
six at 74, 80 and 120.

## The instrument's cut reading, retired and replaced

The old CUT detector paired adjacent rendered lines and asked whether each
fragment was a whitespace run of the source. Once a body row is a block, every
legitimate wrap is an adjacent pair, and the pairing read 18–22 phantom cuts. It
is retired.

CUT now means content hidden at the cap, observed from the render: a
table is hidden iff it is over the cap by source, did **not** wrap, and shows
`…`. That reading is 6, and it equals the outlier list by construction.

One emission the retirement left behind: the ladder-era `STARVED` reading still
prints (5 tables at 120). ADR-TABLE-EDGE-CUT-055 already declared it meaningless
after the squeeze was removed; it is now also redundant with the wrap. Retiring
it is a follow-up, named here so it is not mistaken for a live gate.

## What the tests pin

`tests/table-fit.test.ts` gained five vectors: a below-cap table byte-identical
to its pre-change bytes (two captured goldens, a fit and a narrow-glass cut); the
surfaced table whole, no `…`, every word intact; no mid-word break; the
irreducible case still cutting; and height stability across two renders at one
width. `bun test` 648 pass. `just check` passes.

## What is left

- The six irreducible tables are a work queue: three generated index tables (a
  `reg-sync` change — the File column is derivable from the Callsign beside it)
  and three documents carrying visible link URLs (authoring: move prose under the
  table, ADR-REFERENCES-SECTION-047).
- Retire the `STARVED` reading.
- Nothing else: the renderer has no threshold on wrap height, on purpose — the
  instrument says "too tall" by name, not the renderer.
