---
type: Brief
callsign: BRF-PALETTE-AUDIT
date: 2026-09-19
---

# Brief: The palette audit — review the colours before the brightness controller scales them

**Created:** 2026-09-19
**Status:** Open
**TD:** td-bb44ca
**Lineage:** the reader's 2026-09-19 action list — *"we should review our colour choices and ensure they are ready for the brightness controller"* — sequenced as a **precondition**, not a follow-up: the scalar should scale a reviewed thing, not an assumed one.
**Extends:** **BRF-OKLCH-TUNING** (2026-08-28, pending) — the brightness design this audit gates. The scalar α ∈ [0.2, 1.2] multiplies lightness over fixed OKLCH triples; whether the *current* triples survive that range is unexamined.

## Objective

Audit the canonical palette (`src/palettes/okuda.json`, roles in
`src/palette.ts`) at the scalar's **extremes** — α = 0.2 and α = 1.2 — and
return a per-role verdict: **holds** (legible, distinct, on-intent) or
**folds** (loses the property it exists to carry). Retune the folding
minority before the controller lands, so BRF-OKLCH-TUNING wires keys to an
already-honest palette.

## The properties to check (per role)

1. **Legibility** — text roles must stay readable against the terminal
   background at both extremes. `muted` and `state-parked` are the expected
   casualties at α = 0.2; `alert`/`state-failed` must survive everything.
2. **Distinction** — pairs that must not converge: `link-text` vs `link-url`,
   `table-header` vs `table-key`, and the tier intent of the state roles
   (recede / watch / alarm — docs/state-colours.md) must survive scaling,
   since α moves every role's lightness together and pairs at similar L
   converge first.
3. **Tier intent** — the recede/watch/alarm ordering (docs/state-colours.md)
   is a perceptual contract; scaling must not invert it.

## Deliverables

- A verdict table (role × α extreme → holds/folds) committed as the audit
  record — this is evidence, and it should live in the silo (`docs/`), not a
  conversation.
- An ADR if any triples move: this is a palette change, and palette changes
  are decisions (the fixed palette is the invariant BRF-OKLCH-TUNING names).
- Updated hexes + tests if retuning occurs (six tests currently pin the state
  roles' hexes).

## Scope

In: the audit pass, the verdict record, retuning + ADR if the audit demands
it. Out: the brightness controller itself (BRF-OKLCH-TUNING owns the scalar,
the keys, the rerender), any theming work — no light mode, no theme files.

## Instrument

The audit is done in a real terminal at both extremes, against
`docs/state-colours.md` (the state vocabulary in the wild) and
`docs/showcase.md` (every role in one document) — the house's own exhibits are
the test rig; nothing new needs building.
