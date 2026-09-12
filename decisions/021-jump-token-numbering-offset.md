---
type: ADR
callsign: ADR-JUMP-TOKEN-021
---

# Decision: Jump tokens number from 11, not 01 — the ergonomic offset

**Date:** 2026-08-28 · **amended 2026-09-12** (floor 11 → 12; the spaced
corollary retired)
**Status:** Accepted (the 2026-08-30 spaced-double-tap corollary below is
Superseded — see the amendment at the end)

## Context

The index-and-jump brief (`briefs/2026-08-28-brief-index-and-jump.md`)
specified two-digit jump tokens `01`–`99`: type the number to jump to the
document. On the number row, `1` sits at the far left and `0` at the far
right — typing `01` (or any token `01`–`09`) is a full-width stretch across
the row. For a list under ~10 items, 9 of the tokens pay that cost; for the
common case (a handful of recent briefs), every token paid it.

The tokens were never counts — the brief names them *ephemeral jump
tokens*, "die with the index document, never jotted." They are keyboard
codes for low-bandwidth entry, not positions. Codes should be easy to type.

## Decision

Jump tokens number from **11**: item 1 is `11`, item 2 is `12`, … item 9
is `19`. The floor lifts from `01` to `11`. The two-digit ceiling stays
`99` (the resolver's `\d{1,2}` regex is range-agnostic and unchanged), so
the addressable ceiling drops from 99 items to 89 (item 90 → `100`,
three digits, already out-of-scope per the brief). Lists over ~10 items
are "too long" by the operator's stance — okuda renders the okudagram
either way; list length is the compositor's problem, not the renderer's.

The reframe that made this easy to accept: we did not *lose* the `01`–`09
` range, we *gained* a reserved zero-prefixed range. `01`–`09` is now a
free, special namespace — available for a fixed-command surface later,
unclaimed by the default numbering.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Keep `01`–`99` (ordinal, natural) | Pays the 0-key stretch on 9 of the first 9 tokens; the ordinal intuition is a habit, cheap to break for a single operator dogfooding |
| Three-digit from `001` | Worse ergonomics, more ink, no upside at our list lengths |
| Hex / non-numeric codes | Breaks the "type the number" affordance the brief is built on |

## Consequences

**What became easier:**
- The common case (≤ ~10 items) costs zero 0-key stretches; every token
  is two taps on the same-key neighbourhood (`11`–`19`).
- A reserved `01`–`09` range opens up for future fixed commands.

**What became harder:**
- The ordinal convention breaks: item 1 is labeled `11`. Onboarding cost
  is one operator (the dogfood user who proposed it).
- The addressable ceiling drops 99 → 89 (three digits already
  out-of-scope); not a real constraint at our list lengths.

**Constraints this imposes:**
- Compositors emit `String(index + 11)`, not `String(index + 1).padStart`.
- The resolver (`extractJumps`, `RE_RHS_TOKEN`) is unchanged — it reads
  any 1–2 digit token, so legacy `01` tokens and new `11` tokens both
  resolve. No migration of existing rendered docs.

## Corollary: spaced tokens for short menus (2026-08-30) — SUPERSEDED 2026-09-12

*Retired by the [11] reservation (see the amendment below). Left
visible as the record of a working pattern that the actuator grammar
outgrew.*

For a *short* menu (≤ ~9 items), compositors emit **spaced double-taps**
— `11, 22, 33, 44, …` — not the sequential `11, 12, 13`. Two reasons:

- **Ergonomics.** A spaced token is two presses of one key; the easiest
  possible double-strike, lazier even than the `11`–`19` neighbourhood
  the base decision optimised for. The short case gets the short-list
  treatment.
- **No precedence.** Sequential numbering reads as *ranking* — item 1
  more important than item 2 — even when the compositor only sorted by
  date. Spaced tokens read as *labels*, not ordinals. The token states
  identity, not rank; the only ordering that remains is top-to-bottom,
  which is structural, not semantic.

The cut-off is self-limiting: the spaced form serves ≤ ~9 items
(`11`…`99` at double-stride); beyond that, fall back to sequential
(`11`+ runs to 89). A compositor emitting `11, 22, …, 99, 110` is
broken — switch to sequential at ~10 items. Documented in
`playbooks/authoring-playbook.md` ("The jump-token menu pattern").

## Amendment (2026-09-12): the floor moves to 12; the spaced corollary retires; the doubled pairs are one class

[11] joined the ADR-032 actuator class — doubled pairs are never jump
tokens — so jump tokens number from **12** and skip the whole class in
place. Consequences:

- The 0-free neighbourhood shrinks by one: ≤ 8-item lists stay 0-free
  (was ≤ 9). The common case still costs zero 0-key stretches.
- `jumpToken` emits the index-th **mixed-digit** number from 12:
  `12…21, 23…32, 34…43, …, 89…98` — 80 tokens; a generated menu can
  never express 22, 33, or any doubled pair (an 11th row emits 23).
  The resolver is unchanged (it reads any 1–2 digit token).
- **The spaced corollary above is retired.** A spaced menu's first
  token was always [11]; with the whole doubled-pair class reserved
  (ADR-032 canon), the pattern cannot express even a two-item menu.
  Its two motives survive in weaker form: ergonomics belongs to the
  double-tap *actuators* now, and anti-precedence ordering remains
  top-to-bottom — structural, not semantic.
- Hand-authored wiring that used spaced tokens: none in the corpus
  (audited 2026-09-12; one tmp/ scratch artifact, regenerated).
- Machine-generated menus (reg-menu, jump-demo) renumber automatically
  — numbers are derived, never persisted.

## Related

- Brief: `briefs/2026-08-28-brief-index-and-jump.md` (revised by this ADR)
- Brief: `briefs/2026-08-28-brief-jump-demo-honesty.md` (the compositor)
- `scripts/jump-demo.ts` — the emitting compositor
- `src/tui.ts` `extractJumps`, `src/grammar.ts` `RE_RHS_TOKEN` — unchanged
  resolver