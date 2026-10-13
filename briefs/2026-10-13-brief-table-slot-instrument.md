---
type: Brief
callsign: BRF-TABLE-SLOT-INSTRUMENT
date: 2026-10-13
---

# Brief: The table's columns are unobservable — a slot instrument, and a header/body alignment test

**Date:** 2026-10-13
**Status:** Open — measurement made, cause **unattributed**, instrument not built
**Lineage:** the operator's observation while reading the rendered `docs/tables-monster.md`, 2026-10-13 — *"noting a right alignment in the columns"* — and the investigation it forced, in which **three of my own derivations were wrong before the fourth measurement held**

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

- `tableSlots` (or equivalent) is exported and unit-tested.
- The hypothesis is answered **yes** (a bug, with a reproduction and a fix) or **no** (an
  artifact, with the measurement corrected) — stated in this brief, whichever way it falls.
- A rendered-output test asserts header/body column agreement in the natural **and** wrapped
  states.
- `just check` green; `just test` green.

## Preconditions

- [x] The drift is reproduced and recorded (the table above), with its ruled-out causes.
- [x] The three failed derivations are recorded, so the next attempt does not repeat them.
- [ ] `just check` and `just test` green before starting.

## Related

- `decisions/055-table-edge-cut.md` — the wrapped row block, the even-slack allocation, and
  *the instrument must measure what the renderer DRAWS*
- `scripts/tables-check.ts` — the instrument that measures **fit**; this brief is about the
  property it does not measure
- `briefs/2026-10-12-brief-table-glass-fit.md` — the fit width, and why the wrapped state is
  the common one
- `docs/2026-10-13-the-mechanism-is-the-fallible-half.md` — the three wrong derivations, in
  their natural habitat
