---
type: Brief
callsign: BRF-READ-ACTUATOR
---

# Brief: The speech actuator — 77 calls the speech function

**Date:** 2026-10-10
**Status:** Open
**TD:** (epic tracked by callsign)

## Context

The keymap reserves the doubled pairs as one actuator class and lists `speak` in
the pocket ledger. This brief binds the token and nothing else: **77 calls a
function that does the speech thing.** What that function does is the epic's to
discover, not this brief's to fix.

## Objective

Bind `77` to a single call site that invokes the speech function, so what works
speech-wise can be found by pressing the key.

## Evidence

- `docs/keymap.md` — 77 is a reserved doubled pair, and the pocket ledger lists
  `speak` as a bound-actuator candidate.
- `decisions/032-repeated-digit-actuators.md` — the doubled pairs are one actuator
  class; binding is data, one line in `src/keygrammar.ts`.

## Scope

**In:** the `77` binding; one call site, a function named for the speech thing; the
keymap row moved from pocket to bound; the pocket ledger updated; the
`tests/keymap-doc.test.ts` row.

**Out:** deciding what the speech is. The function's content, its engine, its
voice, whether it speaks at all — the epic's work, discovered by use.

## Preconditions

- [ ] `77` is reserved and unbound (`docs/keymap.md`; ADR-032).

## Work Plan

1. [ ] Bind `77` in `src/keygrammar.ts`, with the call site.
2. [ ] Move the keymap row from pocket to bound; update the ledger.
3. [ ] Let the epic fill the function.

## Acceptance Criteria

- Pressing `77` invokes the speech function.
- `tests/keymap-doc.test.ts` referees the new row in both directions.
- `just check` passes.

## Notes

No assumption is made about the function's content. The actuator exists to make
the speech work pressable, so the epic finds what works by trying it.

## Related

- `docs/keymap.md` — the pockets and the binding discipline
- `decisions/032-repeated-digit-actuators.md` — the doubled-pair class
- `decisions/036-no-speech-code.md` — constrains the function; reconcile at implementation
- `playbooks/ear-playbook.md` — how a document reaches a voice today
