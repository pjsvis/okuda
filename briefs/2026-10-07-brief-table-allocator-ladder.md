---
type: Brief
callsign: BRF-TABLE-LADDER
---

# Brief: The band and the ladder — the table fit, from a design width of 80

**Date:** 2026-10-07
**Status:** Open
**Context:** ADR-UNIVERSAL-ELISION-050 repealed the in-cell wrap and, in the same
ruling, certified the arithmetic that remained: *"The proportional budget
computation is VALID … and stands unchanged."* It answers the question. It
answers it badly, and nobody had measured it. The instrument now has, and the
operator's framing supplies the missing invariant: **authors write to 80 columns,
120 is elbow room, below the design width we elide, and outside the band is an
authoring problem.**

## Objective

Lay a table out to a **design width of 80 with a band cap of 120**, give each of
the band's four shapes the policy its geometry earns, and gate the change on
`scripts/tables-check.ts`. The allocation arithmetic is not ours to invent: it is
a known solution with a production user (`oakoliver/glamour`, a TypeScript port
of the lipgloss/v2 table glow ships). Take the ladder, leave the box model. Same
move, and the same argument, as ADR-GLOW-DARK-006 made for the palette.

## Evidence — measured 2026-10-07

| width | cut | starved tables | columns | elided cells | air under the rule | labels cut |
|---|---|---|---|---|---|---|
| 80 | 0 | 191 of 332 | 457 | 2,887 | 128 tables, max 63 cols | 129 |
| 120 | 0 | 128 of 332 | 294 | 1,797 | 208 tables, max 103 cols | 53 |

`cut 0` is ADR-050 working — cells elide at their slot with a marker, so no word
is ever broken. **Starved** is the fault that hid behind that zero: a column
elided while the budget had room to render it whole. **Labels cut** is the same
inversion in the header: 129 of the 457 starved columns at 80 are the decode key
dying to save the value.

The shape of the corpus, which is what the design below follows:

| shape | test | tables | policy |
|---|---|---|---|
| **design** | natural ≤ 76 | 132 | Draw at natural, single-line. Nothing elides. |
| **band** | 76 < natural ≤ 116 | 76 | Draw at natural on a glass that allows it. |
| **matrix** | natural > 116, every column ≤ 116 | 65 | Ladder allocates; keys elide when the glass is narrow. |
| **prose** | natural > 116, a column past 116 | 59 | Wrap the un-holdable column; keys stay whole. |

Three findings carry the design:

- **323 of 332 tables hold every word within 76 columns.** 80 is not a
  compromise the corpus makes; it is where the corpus already is. The band is
  tolerance, not a target.
- **200 of 332 tables exceed 76**, so the band is not a nicety either — it is the
  tolerance the corpus actually needs.
- **The prose set is one column, usually last** (51 of 59), and the keys fit the
  design width comfortably (53 columns at the median; only 12 of 101 prose tables
  have keys that alone exceed 76).

## Design

### The band

```
  0               76                      116            glass
  │───────────────│────────────────────────│
     design width        elbow room          cap
     (80 cols)          (80 → 120)       (never wider)
```

80 is the authoring contract. 120 is the elbow room, and it is where the layout
strategy exists at all — the same prose cell costs 4 lines a row in a 63-column
slot and 9 in a 23-column one. Below 80 we elide and say so. Past 120 we stop: two
hundred columns of glass buy gaps between columns, not a better table.

### The shape — the classifier ADR-ROLE-LAYOUT-022 said did not exist

*"The renderer cannot tell a scanning table from a reading table, so it does not
try."* It does not need to. It needs to know whether a column **can** be drawn
whole — two comparisons against the natural widths it already computes:

| shape | glass ≥ the table's natural | glass < it |
|---|---|---|
| **design** | Single-line at natural. Nothing elides, nothing wraps. | Wrap the column that does not fit. |
| **band** | Single-line at natural — the elbow room, spent. | Wrap. |
| **matrix** | Single-line at natural. | Ladder allocates; keys **elide** (a matrix is all scan). |
| **prose** | Wrap the one column past the band; keys whole via the ladder. | Wrap the prose column; keys via the ladder. |

If the shape test ever needs a third input beyond the naturals, the design has
drifted into a layout engine and this brief is wrong.

### The ladder — the matrix path, and every narrow glass

```
B    = target − GUTTER·(cols − 1)      // target = min(glass, 116)
N[k] = natural width (longest cell)    // the whole-column target
W[k] = longest word in column k        // the elision floor

0. ΣN ≤ B              → allocate N. Nothing elides. Stop.
1. floor[k] = min(N[k], W[k])
2. Σfloor > B          → IRREDUCIBLE. No allocation holds every word; the
                         document is at fault, not the allocator.
3. Complete columns, cheapest first: by needs[k] = N[k] − W[k] ascending; pay in
   full where the budget allows; otherwise the column keeps its floor.
4. Share what is left over proportionally to each column's remaining need, then
   hand the rounding residue to the largest need.
5. Never widen past N; the rule spans the table's own width.
```

**Step 4 was written wrong, and is recorded as wrong** (increment 2, 2026-10-07).
As first drafted it said *stop, leave the remainder unspent*. The arithmetic said
otherwise: on the pilot at 80 that leaves sixteen characters on the floor while
the prose column sits at its ten-character word floor — strictly *less*
informative than the proportional allocator the ladder replaces, because a
partial gift to the widest column is still more content shown. Completion orders
the spending; the ratio decides the remainder. The floor is the protection, and
it is the only thing that changes.

**Ours, not lipgloss's.** Glamour's ladder stops at the median and grows the
narrowest column first, because glamour balances columns: it wraps, so a wider
column is always an improvement. Under elision an uncompleted column gains
nothing from a partial gift — it still shows `…` — so the objective is
*completion*, and the ordering flips to cheapest-first. Same shape, different
objective function, and the transfer only works because the objective is stated
instead of inherited. Closed-form: one sort, one pass, no per-character loop.

### Headers — the label is the key, and it wraps

A header is usually the widest cell in its column, so under squeeze it is the
first thing cut while the data it labels survives: 143 of 1038 columns are sized
by their label.

- **Rule:** headers wrap; headers never elide, at any width.
- **Floor:** the header's longest word, because a word cannot be broken.
- **Bound:** a header needing more than three lines to say is an authoring
  outlier — rename the column. "Never elide a header" stays a promise only if the
  header is bounded.
- **Not a substitute for the ladder:** `Glyph` is one word, and a single-word
  label cannot be broken. This recovers the *multi-word* surplus (a 35-character
  sentence-label over 3-character data is 33 columns of pure waste); the ladder
  covers the rest.

The classifier reads the **data**, with the header contributing only its longest
word — otherwise a prose label pushes a table into a wider shape than its data
earns. Measured migration: 3 tables.

### Outliers — the band's edge, named

Outside the band the answer is not another renderer strategy; it is a change to
the document. The set is mechanical and four tables wide:

```
  generated  word budget 170  briefs/index.md:10
  generated  word budget 130  debriefs/index.md:10
  generated  word budget 145  decisions/index.md:10
  authored   2 columns past 116  docs/2026-09-17-knowledge-work.md:20
```

Three are the registry index tables `reg-sync` generates: five or six short-key
columns summing past the band. The rethink is the **compositor**'s, and the
remedy is one fewer column — the File column is derivable from the Callsign row
beside it. The fourth is a three-column table with two columns past 200: a prose
matrix, two notes wearing pipes, and prose belongs under the table (the RD
convention ADR-REFERENCES-SECTION-047 established).

**The list is a work queue, never a category.** The instrument prints it, this
brief names it, and the count is the signal. An unnamed outlier category is an
allowance — the house's ratchet language is exact: at-count passes, over-count
fails.

## Refusals, and on what warrant

A refusal and a measurement look alike on the page, and only one is a commitment.

| refused | warrant | evidence |
|---|---|---|
| Box borders, padding, margins, background inheritance | **observed** | glow draws no box — checked at 80, 120 and 60 columns |
| `setStyleFunc`, per-cell style callbacks, theme border keys | **inherited** | ADR-ROLE-LAYOUT-022's scope gate; precedent, not re-earned here |
| `wrap` as policy — every column, proportional allocation | **measured** | 4 lines per row at the median; glow's own 60-column output is the tall-narrow pathology ADR-TABLE-ELISION-014 was written about |
| The band's edges | **measured** | 200 of 332 exceed 76; 323 of 332 hold every word within it |
| `…` on a header | **measured** | 129 labels cut at 80 — 28% of all starvation |
| Expansion — widening rows to fill the glass | **argued, not measured** | a dictionary and a matrix want opposite answers and the renderer cannot tell them apart. The design's weakest link: earn it by counting the tables that render worse under expansion, or drop it. |
| The median and narrowest-first ratios | **argued** | under elision there is no partial credit, so completion replaces balance |
| The port's `truncate`/`wrap`/`stringWidth` | **parity** | `src/width.ts` is the house oracle, and it is ANSI-run aware |

## Scope

**In:** the band target and the rule's width; the shape classifier; the ladder;
header wrapping; the prose row block (the one column that cannot be drawn whole —
`rowHeights` + `JoinHorizontal`, scoped to it); the two ADR-UNIVERSAL-ELISION-050
amendments (withdraw the certification of the arithmetic; narrow the elision law
to the matrix shape); the palimpsest correction to ADR-TABLE-ELISION-014, whose
record still teaches a repealed policy.

**Out:** the box model beyond the row block; `renderMenuTable` (the pin mechanism
is taken so unification is *possible*, whether it is worth doing is a separate
brief); compositor-side width guessing (the renderer owns the fit); the generated
index tables (a `reg-sync` change, tracked as its own issue).

## Preconditions

- [ ] ADR-UNIVERSAL-ELISION-050 read in full. The amendment must be explicit about
      which half survives — the *question* (how wide is each column) — and which
      does not (the *answer*).
- [ ] The 3-character floor confirmed as the promise the starvation predicate
      makes other columns (`floors = colWidth.map(() => 3)`, `src/render.ts`). If
      the ladder moves the floor, the predicate moves in the same commit.

## Work Plan

1. [x] **Landed 2026-10-07.** `target = min(glass, 116)`, and the rule spans the
       table's own width, measured off the lines actually drawn. Bracket slack
       went 128 tables / 63 columns → **0** at 80, and 208 / 103 → **0** at 120,
       and a 120-column glass now renders identically to a 200-column one. The
       instrument was taught the same target in the same commit: its starved
       predicate judged against the glass, and briefly over-reported at wide
       widths (371 columns at 200 versus 320 at 120) until it read the band.
       Noted cost, pending the wrap: past 120 columns a table with a natural
       width between 116 and the glass now elides where it used to sprawl.
2. [x] **Landed 2026-10-07 — then retired the same day.** The ladder is in, and the
       objective change is measured: starved columns at 80 went **489 → 192** (−61%,
       elided cells 3053 → 1812), and at 120 **320 → 111** (−65%, 1889 → 1045). The
       pilot that started this — `Element │ Channel │ Role │ Hex` squeezed to `Eleme…
       │ struct… │ purple b… │ #bd9…` — rendered every key column whole at 80. One
       deviation from the design, above.
       **Retired the same day by ADR-TABLE-EDGE-CUT-055:** the ladder answered *how do
       I make this table fit* for an artefact that was written down and cannot be
       elided. The edge cut reaches the same visible table without the arithmetic —
       639 tests passed unchanged through the removal, which is the measurement
       confirming itself — and these figures are now the evidence for retiring it,
       not the case for keeping it.
3. [x] **Headers landed 2026-10-07.** Labels cut went **129 → 0** at 80 columns and
       53 → 0 at 120. Starved columns 192 → 172, elided cells 1812 → 1483. The
       classifier now reads the body with the header floored at its longest word,
       and two tables migrated into `design`. The instrument needed the same
       correction in the same commit — and so did its cut detector, which pairs
       adjacent rendered lines to catch a broken word and therefore read a wrapped
       header's consecutive lines as a cut: four tables with no allocator fault
       were reported as cut until the detector learned that a header is a block.
       The prose column is what remains.
4. [ ] ~~Tests: one unit vector per branch (design / matrix / irreducible / prose)~~
       **Cancelled by ADR-TABLE-EDGE-CUT-055.** The branches do not exist any more:
       with one overflow policy there is nothing to branch on. What the edge cut owes
       instead is the cut's own vector — the row line elided at the budget, the marker
       only where content was lost — which is one test, not four.
       and the shape classifier. The instrument is the integration test.
5. [ ] Dogfood `just tables` at 80 and 120, and `just tables-monster`, against
       `docs/tables.md` and `&briefs.md`.
6. [x] **Landed 2026-10-07.** ADR-UNIVERSAL-ELISION-050's certification of the
       arithmetic is withdrawn in place, with the measurements that withdrew it and
       the list of what replaced it; ADR-TABLE-ELISION-014's supersession record is
       corrected — it taught in-cell wrapping (repealed by 050) and called the
       proportional shrink deliberate (replaced by the ladder). One part of the
       narrowing is still owed and is said so there: the prose column's wrap.
7. [ ] The gate enters `just check` at the commit that lands the work, never
       before — `just check` must pass on every commit. If it cannot reach zero
       in one sitting, the house ratchet pattern (`scripts/callsign-baseline.json`:
       at-count passes, over-count fails, under-count says so) is the shape.

## Acceptance Criteria

- At an 80-column glass every `design` table (natural ≤ 76) draws whole — zero
  starved columns across the 132. The authoring contract honoured.
- At 120, every `design` and `band` table (natural ≤ 116) draws whole — zero
  starved across the 208. The elbow room, spent exactly.
- `headers … labels cut` reads 0 at both widths.
- The prose shape wraps and does not elide; a `matrix` does the inverse. Rows stay
  single-line except in the prose column.
- The rule spans the table's natural width: bracket slack is 0 except where a
  table cannot fit at all.
- `cut` remains 0 at both widths — no shape buys completion with a cut.
- Any residual starvation is reported `irreducible` by the instrument's own
  predicate, and the brief names it.
- The outlier set matches the named four. An unnamed outlier is an allowance.
- `bun test` passes; the allocator makes at most one sort and one pass.
- ADR-050 carries both amendments; ADR-014's record no longer teaches repeal.

## Notes

- **Why the earlier attempts had mixed results.** Each designed the arithmetic
  from first principles on the day, and nothing in the repo could contradict it.
  ADR-014 indicted the shrink; ADR-022 fixed the patterned surface and left the
  generic path; ADR-050 repealed the wrap and certified the remainder unexamined.
  The law moved and the formula never did. This brief's discipline: **no
  arithmetic that is not in the port, or forced by elision.**
- **The corpus reading is a monitor, not a CI gate.** It moves when the corpus
  moves (this brief's own registry entry shifted a generated table's columns), and
  the render is minutes, not seconds. Record the reading with the corpus state.
- Instrument traps live in the instrument — `scripts/tables-check.ts`'s docstring
  carries them, because that is what the next developer reads and it cannot go
  stale relative to the code it sits in.

## Open questions

1. **Peel off the later phases?** Headers and the row block are `renderTable`
   work and ride the ladder; the records and the compositor change do not. If the
   brief grows further, split it in td rather than in prose.
2. **Does the prose shape want an authoring rule too?** A cell past 120 columns is
   a paragraph in a cell. `docs/tables.md` should say so: the vertical is the
   cheap dimension, and prose belongs under the table.

## Related

- ADR-TABLE-ELISION-014 — the indictment, superseded; its record is corrected here
- ADR-ROLE-LAYOUT-022 — the patterned surface's priority fit, and the scope gate
- ADR-UNIVERSAL-ELISION-050 — the law this brief keeps and partly narrows
- ADR-GLOW-DARK-006 — the precedent: source from the Charm lineage, never vendor
- ADR-REFERENCES-SECTION-047 — where prose that is not tabular goes
- External: `oakoliver/glamour` `src/table.ts` (a port of `lipgloss/v2`
  `table.go`, `resizing.go`, `rows.go`)
