---
type: Debrief
callsign: DBF-PALETTE-PAGE
---

# Debrief: the palette page — hand-crafting that would have lied

**Date:** 2026-09-05
**Status:** Shipped (palette page + swatch generator; `just check` green)

## What was built

Two artifacts, one generator, against the pending `BRF-OKLCH-TUNING` and
the parked `BRF-PALETTE-LIGHTNESS`:

1. `docs/2026-09-05-palette-page.md` — the palette reference. All 22
   okuda-preset roles laid out in OKLCH (computed, not eyeballed), grouped
   by hue family, with a per-role **gamut ceiling** table showing where a
   global brightness scalar `α` breaks. The page's main finding: the
   brief's `α ∈ [0.2, 1.2]` is a lie for the high-chroma roles —
   `alert`/`state-failed` (C=0.206), `state-ok` (0.188), `vector` (0.169),
   `state-todo` (already at its ceiling at α=1.0) all clip or drift the
   moment α>1. The honest design is asymmetric: dim freely, brighten
   per-family with a cap derived from the fixed `{C,H}`.
2. `scripts/palette-swatch.ts` + `docs/2026-09-05-palette-swatch.md` — a
   generator that reads `src/palettes/okuda.json` (source of truth) and
   emits a swatch doc where each *author-addressable* role's name appears
   in its own colour via its bound markdown construct. Chrome-only roles
   (no author path) are a hex + "where seen" table. `just palette-swatch`
   regenerates; `just palette-swatch-doc` views.

## The lesson — the one worth the debrief

> **Don't hand-do what a program can do. Not because it's tedious —
> because hand-doing lets you gloss, and the program can't.**

The first ask was "colour the Note column values." The instinct was to
edit the table: wrap each note in the construct that paints it. That
would have been wrong three ways:

- **Drift.** Hand-authored hexes in a doc rot the moment the palette
  changes. The generator reads `okuda.json`; it can't drift.
- **Impossible for half the roles.** 12 of 22 roles are chrome-only —
  `badge-*`, `state-*`, `vector`, `diagram-*`, `alert`, `muted`,
  `code-background`. No markdown construct addresses them. A hand-edit
  would have either omitted them or faked them with the wrong construct.
- **Would have lied about blockquote.** The `blockquote` role paints the
  *pipe* (`#7788aa`); the aside *text* renders in emphasis-italic gold
  ("an aside is italic" invariant). Hand-wrapping would have shown blue
  text. The generator, forced to map role→construct, surfaced the truth:
  blockquote is a pipe colour, not a text colour.

The deeper point: **the generation step is where unstated assumptions get
forced into the open.** Writing `palette-swatch.ts` required deciding,
per role, *what emits this role* — and that mapping is where the real
semantics live. The blockquote-pipe fact and the `link`-is-legacy-unpainted
gap were *discovered by building the generator*, not known before it.
The registry principle (rule 6) generalises: never hand-write what you
can derive, because hand-writing is where entropy enters and the
derivation is where the truth comes out.

## The cost

One wasted round-trip. On "colour the Note column," I reached for the
edit tool and investigated inline-in-tables rendering before the user
stopped it. The reflex to fix should be: *what's the source, and what
derives this?* — not *which lines do I change?* Derived artifact → find
the source → write the derivation. That's the registry principle applied
to docs, not just JSONL indexes. Caught in one turn; the lesson is to
catch it in zero.

## What's left

The palette page and swatch generator are preliminary work for
`td-b4bae8` (OKLCH brightness scalar). The real sequence:

1. **ADR — hex → OKLCH ground truth.** Records the reversal of
   `BRF-PALETTE-LIGHTNESS`'s "hex stays ground truth" position. The page
   is the evidence; the ADR is the decision. Palimpsest protocol (rule 8)
   applies — the parked brief's position is the reversed one.
2. **Translation function** in `src/palette.ts` (extend, not a new
   `colors.ts` — per `td-b4bae8`): `oklchScale(palette, α)` returning a
   derived `Palette` of hexes, with the §4 per-family gamut ceiling baked
   in. Dim path: `L' = L · α`. Brighten path: `L' = min(L · α,
   ceiling(role))`. `H`, `C` untouched on both.
3. **Wire the dial** — `[`/`]` or `+`/`-`, 5% steps, `OKUDA_BRIGHTNESS`
   env override — per the pending brief.
4. **Test the no-op.** `α=1.0` must be byte-identical to today's hex
   output (the parked brief's invariant, carried forward).

The page is the spec; the ADR is the gate; the function is the work.
