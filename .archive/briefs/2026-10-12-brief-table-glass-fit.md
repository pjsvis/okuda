---
type: Brief
callsign: BRF-TABLE-GLASS-FIT
---

# Brief: Table fit — wrap to the glass, elide only the floor

**Date:** 2026-10-12
**Status:** Done
**TD:** BRF-TABLE-GLASS-FIT (an issue was created in td when the brief was written)

## Context

okuda composes a table at the cap (`BAND_CONTENT` 116) and cuts the composed line
at `min(glass, 116)` (`src/render.ts:1570,1589,1613`), so below the cap the last
column is elided even where a narrower wrap would show it.
`tests/fixtures/contracts-contact-map.md` — a contact map whose cells are
prose — loses its `Notes` column at 80 and 100, and the silo's own instrument names
the fault (`STARVED`, 3 tables / 19 cells). Zed's markdown preview solves the same
problem by wrapping cell text so a table never renders past its available width
(PRs #42674, #46834, #50839, #61773); the same source renders whole there, and a
table drafted for Zed must render whole here.

## Objective

Make table elision a monotone function of glass width — wrap columns to the glass
while their longest unbreakable segment fits, elide only the column that cannot,
and show the whole table at its natural width — and amend ADR-055 to say so.

## Evidence

**The render** (`./okuda tests/fixtures/contracts-contact-map.md --width W`,
2026-10-12). The Scott Logic contacts table, 3 columns:

| glass | `Notes` column | hidden |
|---|---|---|
| 80 | `No…` header; body `Ed…`, `co…`, `Mo…` | the whole column |
| 100 | `Notes` header; body `Edinburgh-based. Leads…` | the prose |
| 120 | wraps as a block, reads whole | none |
| 160 | identical to 120 (capped) | none |

**The instrument** (`bun scripts/tables-check.ts --width 80 <fixture>`):

```
design width   8 of 8 tables exceed 76 (the 80-col design width)
shape          design 0, band 2, matrix 4, prose 2
STARVED        3 tables, 19 elided cells, 4 header labels cut
hidden at cap  0
```

**The code** (the formula for getting it wrong):

- composition width = `BAND_CONTENT` = 116 — `src/render.ts:1589` (the wrap trigger),
  `src/render.ts:1599` (the wrap allocates across 116; otherwise `slots` is the
  author's natural widths, `src/render.ts:1597`);
- cut width = `Math.min(width, BAND_CONTENT)` — `src/render.ts:1570`, applied at
  `src/render.ts:1613`.

When `glass < 116` the line is composed to 116 and then elided at the glass; since
the prose column is authored last, it is always the casualty. The word floor is
whitespace-only (`src/render.ts:1546-1547`, `split(/\s+/)`), so a URL is one
unbreakable word today even though it has delimiters.

**The doctrine we are overturning, stated by ADR-055 itself.** Its *Alternatives*
table rejects *"Wrap at the glass, any width"*: *"The floor test then runs below the
cap, where the reader has a lever; it also reflows on every resize… The wrap targets
the cap; a narrower glass cuts recoverably."* Its *Consequences* assign the
not-widenable reader to the environment: *"This is the condition under which the
model holds, and it is the environment's to meet, not the renderer's."* The fixture
is evidence the environment does not meet it.

## Scope

**In:** the table-fit decision in `src/render.ts` (target `min(glass, cap)`, wrap
trigger `natural > target`, the edge cut reserved for floor-failing columns,
headers never `…` on the cut branch); a delimiter-aware word floor (split at
`/ . _ @ -`) so URLs and paths break without an inserted mark; the monotone
invariant as a test; `scripts/tables-check.ts` gains a width-sweep monotonicity
reading, and `--strict-starved` is promoted from report to gate once the corpus is
clean; an ADR-055 palimpsest amendment.

**Out:** horizontal scroll (Zed removed it, and we refuse a second pane model); a
wrap-height threshold (ADR-055 settled it: height is reported, not capped); an
authoring pass on the corpus / enforcement of the 76-column design width; the
fixture itself as a deliverable — it is evidence, not output; the pane's width
(windowing is the host's); the cap (`BAND_CONTENT` stays 116).

## Preconditions

- [x] ADR-055 read in full, the *Alternatives* and *Consequences* included; the
      palimpsest amendment route agreed (`playbooks/decisions-playbook.md`).
- [x] The fixture moved to `tests/fixtures/contracts-contact-map.md` (out of the
      date-lint scan set; it is a regression input, not a silo record).
- [x] Baseline captured: `bun scripts/tables-check.ts --width 80 <fixture>`
      reports the 3 starved tables / 19 cells (it does).
- [x] The third branch (the wrapped row block) is reachable: a table with
      `natural > 116` renders wrapped at width 120.

## Work Plan

1. [x] Record the baseline (tables-check at 74 / 80 / 100 / 120) for the debrief.
2. [x] Write the tests in `tests/table-fit.test.ts`: the fixture's contacts table
       shows `Notes` at 80; the width sweep is monotone; zero hidden at the natural
       width.
3. [x] Retarget the wrap: trigger `natural > target` and allocate across
       `target = Math.min(width, BAND_CONTENT)` (`src/render.ts`); `cut` stands only
       for a column whose floor exceeds the budget.
4. [x] Make the word floor delimiter-aware (`src/render.ts` `longestWord`) and
       prefer a break after a delimiter in `wrapANSI` (`src/wrap.ts`).
5. [x] Headers wrap whole whenever the table is in the wrap state; at 40 the
       fixture's 24 header cells report none cut (below a floor sum the table is
       the named too-narrow state).
6. [x] Assert the monotonicity invariant in `tests/table-fit.test.ts` (a width
       sweep), and correct `scripts/tables-check.ts`'s readings for the new model
       (`elided`/`hidden`/`starved`/`word`); `--strict-starved` now exits 0 on the
       corpus. *(Plan deviation: the sweep lives in the test, where it is isolated
       and fast, rather than as an instrument mode.)*
7. [x] Amend ADR-055 (palimpsest, 2026-10-12): the monotone invariant; the overturn
       of the *"Wrap at the glass, any width"* rejection; the resize/reflow cost.
8. [x] `just check`; the fixture and the silo corpus run through tables-check at
       74 / 80 / 100 / 120 (all clean).

## Acceptance Criteria

- On the fixture at width 80, every table renders with zero hidden cells and
  `bun scripts/tables-check.ts --width 80 --strict --strict-starved <fixture>` exits
  0; the Scott Logic contacts table shows its `Notes` text.
- Monotone: over a width sweep 40…200, hidden cells at width *w* never exceed hidden
  cells at any narrower width, and are 0 for all *w* ≥ the table's natural width.
- No header renders `…` at the design width (74 / 80) or above. Below the
  smallest floor sum the table is the too-narrow state and the instrument reports
  the cut (`5 labels cut` at 40 on the fixture), not a wrap failure.
- A URL/path cell (exemplar `blog.scottlogic.com/ceberhardt`) wraps at its
  delimiters and is never elided at width ≥ 80.
- `tables-check --strict-starved` exits 0 across `briefs/`, `docs/`, `decisions/`.
- `just check` passes.
- ADR-055 carries the 2026-10-12 amendment, and the amendment cites this brief.

## Notes

**The tension this brief must settle, not hide.** ADR-055 rejected wrap-at-the-glass
for two named costs: reflow on every resize, and running the floor test below the
cap. Answer both in the amendment, not in a code comment. Reflow: above the natural
width nothing wraps (the second state); below it, reflow is inherent to the rule, and
ADR-WIDENING-LAG-054 already holds a one-column widening for the glass that can. The
floor test: it is O(columns), and it is exactly what buys monotonicity.

**The rule is two states and a total order.** *Wide-enough*: every column's floor
fits → wrap, show everything. *Too-narrow*: a column fails its floor → name it and
elide that column only. Widen monotonically and hidden content only decreases.

**The exception is a segment, not a hyphen.** Long tokens in this corpus are URLs,
paths and emails — they have delimiters. Break at the delimiter the token already
has; never insert a `-` as a break mark, because `-` is content (`Kurtoglu`,
`2019-2023`, a path). A genuinely atomic token keeps `…`; the delimiter-aware floor
is what shrinks that set.

**The fixture stays an outlier.** All 8 tables exceed the 76-column design width.
This brief bends the renderer, not the document; it does not make a prose matrix
compliant, it stops losing it.

## Related

- ADR-TABLE-EDGE-CUT-055 — the decision amended here, and its *Alternatives* entry
  this brief overturns
- ADR-TABLE-ELISION-014 — a shrink-wrapped table is a broken table
- ADR-UNIVERSAL-ELISION-050 — the elision law the table's own line extends
- ADR-WIDENING-LAG-054 — the held one-column widening the reflow answer cites
- `tests/fixtures/contracts-contact-map.md` — the fixture and the evidence
- `scripts/tables-check.ts` — the instrument that already names the fault (STARVED)
- BRF-WRAP-AT-CAP — the brief that added the third branch this brief retargets
