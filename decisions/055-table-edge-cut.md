---
type: ADR
callsign: ADR-TABLE-EDGE-CUT-055
date: 2026-10-07
---

# Decision: A table is an artefact — render it whole, cut the edge, never squeeze it

**Date:** 2026-10-07
**Status:** Accepted

## Amended

2026-10-08 — the third branch (BRF-WRAP-AT-CAP): past the cap the columns wrap; the edge cut stands below the cap and for the irreducible set. See *The third branch* below.

2026-10-12 — the FIT WIDTH (BRF-TABLE-GLASS-FIT): the wrap targets `min(glass,
cap)`, not the cap, so a table below the cap wraps at the glass rather than
cutting at it; the edge cut stands only for the irreducible set. The *Alternatives*
rejection of *"Wrap at the glass, any width"* is overturned. See *The glass target*
below.

## Amends

ADR-UNIVERSAL-ELISION-050 (which repealed the wrap and certified the squeeze); completes the doctrine ADR-TABLE-ELISION-014 stated and ADR-022 narrowed to menus.

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

Below the cap this is the whole model. Past the cap the cut hides content with
no lever to recover it, so the third branch wraps the columns instead — added in
place, 2026-10-08, because the grammar is one decision and a second ADR for its
third branch would split the law.

## The third branch — wrap at the cap (2026-10-08)

Below the cap the edge cut is recoverable: the reader's lever is widen, and
widening brings the bytes back. Past the cap there is no lever — 120 and 200
columns render identically — so the cut no longer truncates, it **hides**, and
hiding is the one thing the table model refuses. The grammar is three branches,
one decision:

```
natural ≤ cap            draw whole; a narrow glass cuts the composed line
natural > cap,
  every word fits        WRAP the columns to the cap: rows become blocks
a word fails its share   irreducible: draw and cut; the instrument names the
                         document
```

**The word-floor test, at the cap.** A column's floor is its longest word (header
or body; a word cannot break). If the floors' sum exceeds the cap, no allocation
holds every word and the table is irreducible. Otherwise every column takes its
floor and the slack is **split evenly** — no per-column need, no completion
order, no proportional budget. The arithmetic the ladder used to reach a fit is
deliberately absent: the floor test is a *predicate at the cap*, never an
allocator across columns.

A wrapped row is a **block**: each cell composes to lines, the tallest cell sets
the block height, the shorter cells pad, and the rule brackets what is drawn.
There is **no marker** on a wrapped table, because nothing is missing — `…`
appears only where a word cannot fit, which is the irreducible case.

**Measured** (`bun scripts/tables-check.ts --width 120`, 2026-10-08, 352 tables
across 211 files): 135 tables wrap; 6 still hide content at the cap — the
irreducible set, named by file and line. Before the branch, every one of the 135
was cut at the cap with no lever; the cut reading at the cap falls from 135 to the
irreducible set. Each of the six carries a word the cap cannot hold: a 60-column
generated filename, a visible link URL, or a prose matrix (two un-holdable
columns, `docs/2026-09-17-knowledge-work.md`).

**A correction the work found.** The brief expected four irreducible tables;
render parity gives **six**. okuda prints a link's URL inline (Pass C,
`link: text + " " + url`), so the URL is visible content and its long unbroken
token is a word no wrapper can break. The instrument had been stripping link
URLs (`plain()`), which made two editorial tables in `&briefs.md` look wrappable
when the renderer could not wrap them. `plain()` now mirrors the renderer and the
two tables join the named set; the source-side four was a measurement artifact,
not the model. The same `plain()` pass learned to preserve intra-word underscores
(`NO_COLOR`, `RE_MD_LINK`) and to unescape backslash escapes, both of which had
made the retired cut detector disagree with the render.

**What was deliberately not done.** No threshold on wrap height: a table needing
twenty lines a row renders as twenty, and the instrument says so by name. No wrap
to the *glass*: the floor test only matters where the reader has no lever, so the
wrap targets the cap and a narrower glass still cuts recoverably (widen and the
bytes return). **Superseded 2026-10-12** — the wrap targets the fit width
(`min(glass, cap)`); see *The glass target* below. No wrapping of the irreducible set: a long filename or URL is the
document's problem, or the compositor's.

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
| Wrap at the glass, any width | The floor test then runs below the cap, where the reader has a lever; it also reflows on every resize and asks the words a question only the cap needs asked. The wrap targets the cap; a narrower glass cuts recoverably. **Overturned 2026-10-12** — *The glass target* below; the floor test runs at the fit width and is what buys monotonicity. |
| Leave the cap cut (no third branch) | Past the cap the cut hides content with no remedy — the one case the model cannot justify. |
| Squeeze only the widest column | Still a squeeze, still per-column arithmetic, still hides content inside a cell rather than at one honest edge. |
| Raise the cap past 120 | Beyond 120 columns a table gains air between its columns rather than information (BRF-TABLE-LADDER). The cap is a legibility boundary, not a budget limit. |

## Consequences

**What became easier:**
- One overflow policy for every raw block — table, fence, diagram — and it is the
  one already proven on two of the three.
- Past the cap the table now fits by wrapping, so the reader no longer meets a
  content cut that widening cannot undo: 135 over-cap tables render whole where
  they used to hide their tails.
- The renderer loses arithmetic: no shares, no floors, no completion order, no
  per-cell elision — except the wrap's one floor (a column's longest word) and an
  even slack split. Two equalizing moves, not a per-column budget.
- The visible prefix of a cut table is a *correct* table: aligned columns, and one
  edge that says what happened.

**What became harder:**
- The corpus owes an authoring pass. 215 of 352 tables exceed the 80-column design
  width today, so at a typical pane the cut is the common case rather than a rare
  fallback — which is acceptable only because the median cut costs one column.
- A wrapped table is taller, and reflow on resize is now part of the table's
  behaviour above the cap. Height stability is a property the tests pin (two
  renders at one width are identical).
- A reader who cannot widen (a split pane below the design width) sees a prefix and
  has no remedy but tucking the pane away. The model presupposes a pane at or above
  the authoring width; the compositor cannot supply one, and telling it the width is
  ADR-ROLE-LAYOUT-022's layer violation. This is the condition under which the model
  holds, and it is the environment's to meet, not the renderer's. **Amended
  2026-10-12** — the renderer now wraps to the glass rather than presupposing one;
  see *The glass target* below.

## The glass target — the fit width, not the cap (2026-10-12)

BRF-TABLE-GLASS-FIT retargets the wrap from the cap to the FIT WIDTH —
`target = Math.min(glass, cap)`. The old model composed to the cap and cut at the
glass, so below 116 columns the difference was taken from the last column; on a
table whose cells are prose that is always the column the author wrote last,
which is where the argument lives. On `tests/fixtures/contracts-contact-map.md`
at 80 the `Notes` column was elided to `Ed…` before and wraps whole after; the
fixture's eight tables report 0 hidden and 0 starved
(`bun scripts/tables-check.ts --width 80 <fixture>`).

**The law is two states and a total order.** WIDE-ENOUGH: every column's floor
fits the target → the columns wrap to the target and nothing is hidden.
TOO-NARROW: a floor does not fit → the table draws at the author's widths and
the composed line is cut at the target. Widening never reveals less, and at the
table's natural width nothing is hidden. The tests assert this as a width sweep
(`tests/table-fit.test.ts`, *elision is monotone in the glass*).

**This overturns the *Alternatives* rejection of "Wrap at the glass, any
width."** Its two costs are answered, not denied:

- *"It reflows on every resize."* Above the natural width nothing wraps — the
  second state — so only a glass below the table's own width reflows, which is
  ADR-WIDENING-LAG-054's territory and the condition any fit model must move
  under.
- *"It asks the words a question only the cap needs asked."* The floor test is
  O(columns), and it is what buys monotonicity: it names the one case in which a
  wrap is impossible, so everything else wraps rather than cuts.

**The floor is a segment, not a word.** `longestWord` (`src/render.ts`) and the
hard-split in `wrapANSI` (`src/wrap.ts`) treat `/ . _ @ -` as break
opportunities: a URL or path is not atomic, so its floor is its longest segment
and it slips at a delimiter rather than being elided or cut mid-token. A token
with no delimiter stays irreducible and still gets `…`. The instrument measures
the same segments, or it would call a table irreducible that the renderer wraps.

**Instrument** (`scripts/tables-check.ts`): `elided` skips a column whose source
carries a literal `…` anywhere (a mid-cell ellipsis in prose had been read as a
cut); `hidden` requires the target to have reached the cap (below the cap an
elision is recoverable, not hidden); `starved` requires the table to have been
wrappable at the fit width (a too-narrow table is a state, not an allocator
fault); `word` measures segments.

**Measured 2026-10-12** (`bun scripts/tables-check.ts --width W`, the silo's
tracked `.md`): at 80, starved tables 127 → 0 (the wrap now happens at the
glass); at 120, hidden 6 → 0 and starved 4 → 0 (delimiter-aware floors and the
retired prose-matrix guard let more tables wrap). `--strict --strict-starved`
exits 0 at 74, 80 and 120. The 6 hidden at 80 under the old instrument were
elisions below the cap that widening recovers; the too-narrow state proper lives
below the smallest floor sum.

- **Unverified:** the tall-row cost of wrapping a `prose`-shaped table has not
  been measured against a reader. The tests pin height stability, not height.

**Constraints this imposes:**
- The instrument's `starved` reading becomes meaningless (nothing is squeezed) and
  is replaced by the cut: how deep, how many columns, and by name for the outliers
  past the cap.
- The cap must stand. Past it, widening cannot restore, so the remedy moves to the
  document — but only for a word the cap cannot hold; a table whose words fit wraps
  instead, and the instrument reports the hidden set by file and line.
- The instrument must measure what the renderer DRAWS. A link's URL is visible
  inline; a source-side model that strips it will call a table wrappable that the
  renderer cannot wrap.

## Related
- BRF-WRAP-AT-CAP — the brief that added the third branch, and the measurements
  (`scripts/tables-check.ts`) that gate it
- ADR-TABLE-ELISION-014 — the doctrine, stated first, that a shrink-wrapped table is
  a broken table pretending to be whole
- ADR-UNIVERSAL-ELISION-050 — the elision law this extends to the table's own line,
  and the certification it withdraws (annotated in place)
- ADR-ROLE-LAYOUT-022 — the right-anchored menu, and the scope gate that keeps the
  compositor out of it
- ADR-WIDENING-LAG-054 — why a one-column widening is held rather than reflowed
- BRF-TABLE-LADDER — the brief, and the ladder this ADR retires to the role of
  evidence for removing it
