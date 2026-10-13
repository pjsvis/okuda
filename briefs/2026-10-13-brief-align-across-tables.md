---
type: Brief
callsign: BRF-ALIGN-ACROSS-TABLES
date: 2026-10-13
---

# Brief: The align meta is misattributed across tables — a later table un-aligns an earlier one

**Date:** 2026-10-13
**Status:** Open — reproduced in raw Bun, **filed upstream as `oven-sh/bun#45175`**, workaround undecided
**Lineage:** the operator's reading of the rendered `docs/tables.md`, 2026-10-13 — *"the tables.md test showed all columns left aligned"* — while checking the slot-instrument work (BRF-TABLE-SLOT-INSTRUMENT).

## The observation

`docs/tables.md` §3 declares *"alignment carried through — `L` left, `C` centred, `R` right"*
over a table whose delimiter row is `| :--- | :---: | ---: |`. Rendered **alone**, it obeys:

```
  L    │   C    │     R
  ─────────────────────
  left   centre   right
  a        bb       ccc
  1        2          3
```

Rendered in the **full document**, every column is left:

```
  L    │ C      │ R
  ─────────────────────
  left   centre   right
  a      bb       ccc
  1      2        3
```

The doc's own stated expectation is falsified by the doc's own render — an **unpaid claim**
in the shipped artefact, not a matter of taste.

## The cause is upstream, and it is small

`Bun.markdown` (Bun **1.4.0**) supplies the per-cell `align` meta to the `th`/`td`
callbacks, and that meta is **not scoped to its table**. Minimal reproduction, raw Bun, no
okuda in the path:

```js
const A3 = "| L | C | R |\n| :--- | :---: | ---: |\n| left | centre | right |";
const U2 = "| a | b |\n| --- | --- |\n| 1 | 2 |";
Bun.markdown.render(A3, { th: (_s, m) => { console.log(m); return ""; } });
// {align:"left"} {align:"center"} {align:"right"}          ← correct
Bun.markdown.render(A3 + "\n\n" + U2, { th: (_s, m) => { console.log(m); return ""; } });
// {align:undefined} {align:undefined} {align:"right"}     ← left/center LOST
```

The second table — `U2`, which has no alignment at all — corrupts the **first** table's
meta. `U2 + A3` misattributes in the other direction (the unaligned table's cells are handed
the following aligned table's `left`/`center`). The `table` callback receives only the
concatenated child string, so the delimiter row is not available there; `okuda` cannot read
the alignment back out of Bun's token.

## Ruled out

- **Not okuda's renderer.** `src/render.ts` reads `meta?.align` verbatim; the raw-Bun repro
  above removes okuda entirely.
- **Not the document's source.** The delimiter row is byte-correct: `| :--- | :---: | ---: |`
  (the only delimiter in the file carrying colons).
- **Not width or the wrapped state.** The table fits at every width tested (natural 21); the
  flip tracks the presence of a *later table*, not the glass.
- **Not the slot instrument.** `BRF-TABLE-SLOT-INSTRUMENT` changed widths, not `align`;
  this reproduces before and after. (It was invisible to that brief's tests because the
  aligned fixture was the only table in its document.)

## The two options — a decision, not a patch

1. **Work around it in okuda.** Pre-scan the source for table delimiter rows, take their
   per-column alignment, and hand it to `renderTable` keyed by table order; ignore
   `meta.align`. Small and local, but it means okuda re-parses one piece of the table grammar
   that `decisions/005` assigns to `Bun.markdown` — a seam to declare, not to smuggle.
2. **Decline the workaround; report upstream and document the limit.** Record in
   `docs/tables.md` §3 that alignment is unreliable in a multi-table document under Bun
   1.4.0, and file the raw-Bun repro with Bun. Honest, and no second grammar. **The filing
   is done** — `oven-sh/bun#45175` — so this option now costs only the note in §3.

   The upstream report leads with `Bun.markdown.html()` and no callbacks, which is the
   sharpest form of the repro: with `| :--- | :---: | ---: |` followed by any second table,
   the first table emits `align="left"/"center"` dropped and only `right` kept; with the
   second table first, the *unaligned* table is handed `align="left"/"center"` borrowed
   from the aligned one. Both directions are deterministic and need no okuda.

The tilting factor is whether the corpus relies on table alignment: one delimiter row in
`docs/tables.md` carries colons, and it is the row this brief is about. If that stays the
only one, option 2 costs nothing and option 1 buys a workaround for a single exhibit.

## Acceptance

- Stated outcome, one way: either the aligned table renders centred/right **in the full
  `docs/tables.md`**, with a test that puts an aligned table *followed by a second table*
  (the case that failed here); or the limitation is documented in `docs/tables.md` §3 and the
  upstream repro is filed, with the raw-Bun output quoted.
- `just check` green; `just test` green.

## Related

- `oven-sh/bun#45175` — the upstream report (table alignment mis-attributed across tables)
- `docs/tables.md` §3 — the exhibit, and the claim the render falsifies
- `briefs/2026-10-13-brief-table-slot-instrument.md` — the sibling finding; its aligned test
  passed only because the fixture was the sole table
- `decisions/005-render-engine-string-protocols.md` — Bun.markdown owns the grammar;
  option 1 would carve an exception
