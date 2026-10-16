---
type: Brief
callsign: BRF-SEARCH-ROW
---

# Brief: The search row — the contract, frozen by the probe

**Date:** 2026-10-16
**Status:** Open

## Context

The search screen's row was settled by looking at a live frozen capture, not by
argument: a dozen renderings, judged and cut. The shape is decided and the
rejections are measured, but the contract lives in a conversation, so every
session rebuilds it. This brief is the write-down.

## Objective

Build the search row as a pure renderer over the ranked row array — its fields,
their order, their roles, the selected row's band, the token highlight, and the
elision — testable without a terminal and ready for the loop.

## Lineage

- **Extends** `BRF-JUMP-LIST` (the search screen as the jump list's projection)
  and `BRF-SEARCH-SURFACE` (the row array, the register reader, the state
  machine). This brief owns the **row**, and forks neither.
- **Depends on** `BRF-GLOAM-OWNS-LOOP` — the row renderer cannot land until
  the render is ours, because the probe's paint is fzf's today.
- **The instrument** is `scripts/silcrow-look.ts` with `just silcrow`,
  `just silcrow-control`, `just silcrow-attrs`, `just silcrow-freeze`. The row was
  derived by looking at a **frozen capture** (throwaway, in `tmp/`), so two
  parties address the same bytes.

## The row contract

Fields, left to right. The two leftmost cells are fixed so the two ordinal axes
align; only the last field is ragged.

| # | Field | Cells | Role |
|---|---|---|---|
| 1 | `§NN` | 3 fixed | `muted`; `vector` rose + bold when selected |
| 2 | date | 10 fixed | mid — between `muted` and content |
| 3 | callsign, else slug | — | content |
| 4 | text | — | content |

The rules that go with it:

1. **Only the selected `§` is rubricated.** The address column is the cursor
   column; the unselected addresses recede to `muted`.
2. **The date is on every row**, ISO, from the register (named rows) or the
   path (unregistered `docs/` rows). It is not suppressed in runs: the column's
   job is comparison — latest, oldest, a window — and a column that vanishes is
   a column you cannot rank by eye.
3. **The date takes the aligned slot ahead of the name**, because alignment
   serves comparison, not recognition. The comparable field must start at a
   fixed x; the recognised field may be ragged.
4. **A match lights the whole callsign token**, not the matched run. The
   callsign is a name and `CALLSIGN_SHAPE` is already token-boundaried; a match
   inside a token expands to the token, and other matches are untouched.
5. **The selected row is banded above and below by muted rules** — the fermata.
   A single rule below is an incomplete figure. The band is `muted` because it
   does structural work; `vector` is reserved for the control.
6. **The selected row is not bold.** Bold is the match's channel; selection is
   positional (the rose `§` and the band).
7. **The path is elided when a callsign names the row** — and returns when the
   match lies *only* in the path, so the elision never hides the evidence.
8. **Unregistered rows keep their identifier**, with the date prefix stripped so
   the column does not repeat it.

## Evidence

Measured 2026-10-16 against the frozen capture (`just silcrow-freeze`; its sha
prints at the head of every run, and now reproduces — two freezes of one set give
one sha):

- **The instrument renders the contract.** `just silcrow` paints the row above;
  `just silcrow-control` paints fzf's row from the same bytes.
- **Rank determinism — fixed 2026-10-16.** Before the fix, two runs of
  `./okuda --entries silcrow` moved **32 of 448** rows (measured then; the first
  move at row 8), because `orderByRecency` kept rg's thread-scheduled discovery
  order. Ties now break by path (`src/onion.ts`), so a channel's order is a
  function of its member set — asserted by `tests/launcher.test.ts` (two runs,
  one stream) and `tests/onion.test.ts` (permutation-invariance). *The address is
  a name now*: `§NN` names the same document across renders.
- **A match can fall off the right edge.** Two rows in the set match at chars 92
  and 105, past the ~96-cell clip at width 100; the snippet is clipped from the
  start, not around the match.
- **The attributes render.** `SGR 1` (bold) and `SGR 4` (underline) are both
  distinguishable on the glass — verified by `just silcrow-attrs`.
- **The roles exist.** okuda preset: `muted #445566`, `vector #fb7185`, content
  `#cacacc`, match `#dfa21a`.

## Scope

**In:** the row's fields, order, roles (colour, weight), the token-scoped
match, the band, the elision and its return condition; the pure renderer and its
tests.

**Out:** the loop and the input path (`BRF-GLOAM-OWNS-LOOP`); the
TAB/`INPUT`/`LIST` focus machine and the digit-/query-collision resolution
(`BRF-JUMP-LIST`); the ear's cue text (`BRF-SEARCH-SURFACE`, the row seam);
match-centred clipping; the register's missing playbook dates. (Rank
determinism was listed here as a dependency and is **fixed** — see Evidence.)

## Preconditions

- [x] `./okuda --entries <query>` runs headless and prints the ranked rows.
      **Verified 2026-10-16.**
- [x] The frozen capture exists; both parties read one sha.
      **Verified: `cd74ced3…`, 448 rows.**
- [x] `just silcrow` renders the contract row on the frozen capture.
      **Verified 2026-10-16.**
- [x] `SGR 1` and `SGR 4` render on the glass. **Verified via `just silcrow-attrs`.**
- [ ] The mid date role is registered in the palette. **Not yet — the probe uses
      an ad-hoc blend (`#878f99`).**

## Work Plan

1. [ ] Register the mid date role in the palette (an ADR; a fourth level).
2. [ ] Extract the row renderer into `src/` as a pure function over
       `Row[]` × (query, cols, focus, register).
3. [ ] Unit tests: field order, the address mapping, token-scoped highlight,
       the band, the elision and its return.
4. [ ] Wire the renderer into the loop when `BRF-GLOAM-OWNS-LOOP` lands.
5. [ ] Dogfood against the frozen capture; compare to `just silcrow`.

## Acceptance Criteria

* The row renders `§NN DATE CALLSIGN text`, and `§NN DATE slug text` for an
  unregistered row.
* The date is present on every row and occupies a fixed column.
* Only the selected `§` is rubricated; the selected row is banded above and
  below by muted rules; no per-match underline is drawn.
* A match inside the callsign lights the whole callsign.
* The path is absent when a callsign names the row, and present when the match
  lies only in the path.
* The renderer is pure: identical inputs produce identical bytes, with no
  terminal.

## Notes

**The rejections, with their reasons.** Named so scope creep has nowhere to
hide, and so the reasons are not re-litigated:

| Rejected | Why |
|---|---|
| per-match underline | the count scales with hits — a ragged ladder, noise |
| rose band | paints the *frame* in the *control's* colour; the L overpowers |
| selected-row bold | takes the match's channel; the match loses its weight |
| callsign before the date | the comparable field needs the aligned slot |
| address in a far-right gutter | it aligns, but the eye travels the whole row |
| blank lines between rows | wrong whitespace; the wall breaks on field structure |
| suppressing repeated dates | the ear's rule; the eye reads a column, and ranks |
| dropping the date | it is the evidence that the query was satisfied |
| elision marks on every row | chrome; a mark on every row is on no row |

**Two reversals are recorded here on purpose** — callsign-first became
date-first, and the per-match underline became a row band. Both reversed on
evidence, and a silent reversal is a drift source.

## Related

- `docs/2026-09-15-the-search-panel-speech-first.md` — the two economies; *the
  row carries only what neither the filter nor the gesture supplies*
- `docs/2026-09-04-the-silcrow.md` — *names for recognition, numbers for
  actuation*; controls earn both channels
- `briefs/2026-09-14-brief-jump-list.md` — the search screen as the jump list's
  projection; the address space; defect 2 (the rank is not yet authoritative)
- `tmp/_search-surface-brief.md` — the row array, the register, the invariants
  (**not in the silo** — the unlanded `BRF-SEARCH-SURFACE`)
- `src/ansi.ts:104-110` — the heading chip, *muted … because it does structural
  work (coordinate frame), not declarative work*
- `decisions/034-no-unnecessary-rubrication.md` — one mark per affordance
- `scripts/silcrow-look.ts`, `just silcrow` — the instrument (the look gate)
