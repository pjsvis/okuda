---
type: Brief
callsign: BRF-TABLE-SLOT-INSTRUMENT
date: 2026-10-13
---

# Brief: The slot instrument — the table's columns made observable, and header/body alignment pinned

**Date:** 2026-10-13
**Status:** Done — answered **NO**: the drift was a **measurement artifact**, and the instrument is built
**Lineage:** the operator's observation while reading the rendered `docs/tables-monster.md`, 2026-10-13 — *"noting a right alignment in the columns"* — and the investigation it forced, in which **three of my own derivations were wrong before the fourth measurement held**

## The answer (2026-10-13, ses_4c3236)

**No drift is drawn, and none can be.** The hypothesis's *premise* holds — in the wrapped
state most body cells are wider than their slots (on the monster table's first row, 24 of
81) — but its *mechanism* cannot fire. A body cell wider than its slot is wrapped to that
slot before it is padded (`src/render.ts:1782`: the `wrapANSI(cell.text, { width: slot })` call),
and a table that is *not* wrapped has `slots = colWidth`, which is every cell's natural
width by definition. `padDisplay`'s unpadded-on-overflow branch (`src/width.ts:378`) is
therefore unreachable for a generic cell. Header and body are padded from the same `slots`
array by the same `padNatural`, so their starts agree **structurally**, not by coincidence.

**The measurement, corrected.** The output-only instrument — the header's pipes define the
grid, and every body row must show a 3-space gutter at each pipe's position — finds **0
disagreements across 1676 table×glass combinations** (every `.md` in the silo, at glass 80,
100, 120, 160). On the monster table's first row at glass 160 the drawn grid is
`2/17/32/44/54/65/73/85/97` for **both** the header and every body block.

**Why the original numbers were wrong — two traps, both now closed by the instrument:**

1. **The content width, not the glass.** The renderer receives `glass − 4`
   (`renderDocument`, the 2+2 document margin: `src/render.ts:348`). Slots computed from
   the glass disagree with slots computed from the content width, and the two look like
   drift when read against the same bytes. This is the likely origin of the artifact.
   `tableSlots` takes the **content** width, as its docstring now says.
2. **Raw source, not parsed cells.** A cell's text as `Bun.markdown` hands it over is not
   its markdown source: a `[text](url)` link flattens to `text url` (and its URL is a
   visible, unbreakable word). Slots computed from raw source are wrong for any table with
   a link — the `&briefs.md` table below the registry is the worked case.

There is also a flat contradiction in the original record: the monster table's natural
width is 158 > the band (116), so it is **always** in the wrapped state. Its claimed
*"natural state"* numbers (`2/19/34/…/107`) cannot be of this table at all — and no
nine-column table anywhere in the corpus has them. The observation was of something other
than the bytes on screen.

**What is delivered:** `tableSlots` (`src/render.ts`) is exported and unit-tested;
`renderTable` calls it, so the renderer and the instrument can no longer disagree; and
`tests/table-slot.test.ts` pins header/body column agreement in the fitted **and** wrapped
states, with the overhang control shown to fail when body wrapping is disabled.

---

## The original record (kept: the artifact is the evidence)

### The observation

## The observation

In the **wrapped** row block (ADR-TABLE-EDGE-CUT-055's third branch), the body's cell
starts and the header's cell starts **do not coincide**. Measured at width 160 on the
monster table's first row:

| column | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| header starts | 2 | 17 | 31 | 42 | 54 | 67 | 79 | 93 | 105 |
| body starts | 2 | **19** | **32** | **43** | **55** | 67 | 79 | 93 | 105 |
| drift | 0 | **+2** | **+1** | **+1** | **+1** | 0 | 0 | 0 | 0 |

**A cumulative drift that converges to zero by column six.** In the **natural** (unwrapped)
state the two agree exactly — 2/19/34/45/57/70/80/93/107, cell for cell.

**Why that matters more than an edge case:** the wrap target is `min(glass, cap)` = 116, so
a table whose natural width exceeds it is **always** in the wrapped state — the monster table
wraps at 100 *and at 320*. This is the common path for every large table in the corpus.

## What is already ruled out (each measured, not assumed)

- **The source specifies no alignment.** Byte-exact: the delimiter row `| --- | --- | … |` has
  **zero colons**.
- **The parser supplies none.** Rendering the table through `Bun.markdown` with an
  instrumented `th`/`td` shows **`align=undefined` for all 18 cells**.
- **No code path right-aligns a generic cell.** `padNatural` (`src/render.ts:1882`) defaults to
  `padDisplay` (left); every `padStartDisplay` call site belongs to the menu table or the
  `align: "right"` branch, which nothing sets here.
- **It is not positional.** A synthetic nine-column table renders all-left at every column.
- **The header is uniformly left.** With single-character header markers — so no cell's
  content can be inferred — each marker sits exactly **2 columns after its pipe**.
- **There is no right alignment.** The apparent one is *even slack*: the wrap state allocates
  `wordFloor + slack/columns` (ADR-055), so `005` sits in a slot twice its width and a lone
  `✓` in a wider one still. The gap *after* a short cell reads as right alignment; the cells
  are left-aligned inside wide columns.

**Three of my derivations of the slots were wrong before the measurement above held**, and the
brief records them because they are the reason it is a brief rather than a fix:

1. slicing *between pipes* includes the separator's own spaces at both ends, which fabricated
   a "lead" of 3–17 spaces per header cell;
2. the **marker experiment changes the slots it measures** — a header contributes its longest
   word, so one-character labels narrow every column and the table stops wrapping entirely;
3. pipe-gap arithmetic mis-models the cell/separator split, so derived slots disagreed by one
   or two columns depending on which pair of pipes it used.

## The hypothesis, untested

`padDisplay` **returns a cell unpadded when its content exceeds the slot**
(`src/render.ts:1871`: `w >= cols ? s : pad`). In the wrapped state a body cell can be *wider
than the slot it is padded to*, and the overhang **pushes every later cell right** — which is
the shape of a drift that is +2 early and 0 late (the later columns are wide enough not to
overflow). Untested: the slots are not observable from the output, which is the whole problem.

## The instrument

**The table's layout is not observable from its output.** That is the finding underneath the
finding, and it is why a defect here must be found by eye — and why `scripts/tables-check.ts`
does not cover it: that instrument measures **fit** (hidden, starved, elided), **never
alignment**. There is no alignment instrument in this silo.

Proposed, in order:

1. **Export the slot computation** from `renderTable` (`src/render.ts`) — a pure function
   `tableSlots(...)` returning the per-column widths, or a `--debug-slots` path that emits them.
   Pure and exported is the house's shape for a lint's core (`verdict`, `countIds`,
   `statusFor`), and it makes the next question answerable instead of inferable.
2. **Answer the hypothesis** with it: does any body cell's width exceed `slots[i]` in the
   wrapped state? If yes, that is the defect and the fix is in the allocation or in `cut`. If
   no, the drift is a **measurement artifact** and the measurement must be corrected — and the
   correction is itself the deliverable.
3. **A test that pins header/body column agreement**, in both states, from the rendered output:
   the header's cell starts (derive them from the pipes) must equal the body's cell starts
   (derive them from the first line of each cell's block). This is the instrument the silo does
   not have, and it is the one that would have caught this automatically rather than by eye.

## Acceptance

- [x] `tableSlots` (or equivalent) is exported and unit-tested (`src/render.ts`,
  `tests/table-slot.test.ts`).
- [x] The hypothesis is answered **no** — the measurement corrected (above): no overhang is
  drawn; 0/1676 corpus combinations disagree.
- [x] A rendered-output test asserts header/body column agreement in the natural **and**
  wrapped states (`tests/table-slot.test.ts`), and the overhang assertion is shown to fail
  when body wrapping is disabled (the gate can fail).
- [x] `just check` and `just test` green.

## Preconditions

- [x] The drift is recorded (the table above), with its ruled-out causes.
- [x] The three failed derivations are recorded, so the next attempt does not repeat them.
- [x] `just check` and `just test` green before starting.

## Related

- `decisions/055-table-edge-cut.md` — the wrapped row block, the even-slack allocation, and
  *the instrument must measure what the renderer DRAWS*
- `scripts/tables-check.ts` — the instrument that measures **fit**; this brief is about the
  property it does not measure
- `briefs/2026-10-12-brief-table-glass-fit.md` — the fit width, and why the wrapped state is
  the common one
- `docs/2026-10-13-the-mechanism-is-the-fallible-half.md` — the three wrong derivations, in
  their natural habitat
- `tests/table-slot.test.ts` — the alignment instrument: `tableSlots`' contract, and
  header/body column agreement in both states
- `src/render.ts:1628` (`tableSlots`) — the exported slot computation; `renderTable` and
  every checker now share it
