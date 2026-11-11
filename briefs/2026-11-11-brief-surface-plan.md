---
type: Brief
callsign: BRF-SURFACE-PLAN
---

# Brief: The surface plan — the pair's lifecycle as bytes, and nothing else

**Date:** 2026-11-11
**Status:** Open
**Split from:** BRF-SURFACE-PICKER, refused the same day

## Context

A program that calibrates or holds the figure-ground pair is a **tenant** of the
glass: it must read what the host has, take it, and give it back. The order is
where the bugs live — a set with no give-back is a leak, and a give-back after the
screen is left paints one frame of the wrong page — and today that order exists
only inside a script that cannot be called without a terminal
(`scripts/probe-osc.ts`). The picker that would have exercised it live was
refused for want of a warrant; the invariant it carried does not depend on it.

## Objective

Extract the pair's tenancy into pure bytes, so the order, the refusals and the
give-back spelling are **asserted in `bun test`** instead of discovered at a
terminal.

## Evidence

| warrant | reading |
|---|---|
| `scripts/probe-osc.ts` | the read/write/restore path exists and its verdicts stand: `OWNED-ABLE`, `QUERY OK`, `NO REPLY`, `NOT OWNED-ABLE` |
| `ADR-GLASS-INK-073` | the pair is the glass's; okuda owns only the relations between its roles |
| `ADR-LEGIBILITY-SURFACE-090` | three instruments measure the pair; none of them can *take* it |
| this session, 2026-11-11 | ten `set_theme` pins on a host whose terminal answers no `OSC 10`/`OSC 11` query at all — the refusal is not hypothetical |

## Scope

**In:**

- `src/surface-plan.ts` — `surfaceCommand(host)`, `surfaceRefusal(host)`,
  `surfacePlan(host, pair)`, `QUERY`, `setOsc(code, value)`, and the facts they
  need (`hostFacts`, `multiplexer`, `parseOscReply`).
- `tests/surface-plan.test.ts` — the order, the six refusals, the raw give-back,
  the parse.
- One derivation: the reply parse, the multiplexer test and the host facts **move
  out of `scripts/probe-osc.ts`**, which imports them back. Two derivations of
  `rgb:` scaling would drift, and the drift would appear as a colour rather than
  an error.
- A `surface` row in `scripts/gates.sh` running the pure tests.

**Out, deliberately:**

- **The picker TUI.** Refused (`BRF-SURFACE-PICKER`, `.archive/briefs/`); its
  trigger is a named person who must choose a pair and cannot edit a config file.
- **The alt-screen.** The screen is the caller's; this module is the paper's. What
  a caller must respect is that `leave` runs *before* the screen is exited, which
  is why the pair's restore is here and the screen's exit is not.
- **Session enforcement**, which is `BRF-OWN-SURFACE` and uses this module.
- **The stdout renderer.** `okuda <file>` inherits, as today.
- **`OSC 4`, `OSC 12`, `OSC 110`/`OSC 111`.** Only the two defaults, so the pair in
  play is exactly what the gates measure.

## Preconditions

The picker's precondition — a pasted `OWNED-ABLE` receipt from a real pane — is
**not** this brief's precondition, and that is the point of the split: nothing here
takes the surface. The module's whole design is that it refuses when the host
cannot be taken, so its warrant is the refusal table, not a receipt.

## Acceptance Criteria

1. `inherit` emits **no byte at all** — not the sets, not the give-back, and not a
   read. Asserted by joining the plan's bytes and asserting no escape appears.
2. The set order is foreground then background; the give-back order is foreground
   then background.
3. The pair given back is the **string the host sent**, byte-for-byte, in both
   spellings (`rgb:…` and `#rrggbb`), never a re-serialised hex.
4. Every refusal names its cause: no tty, a multiplexer by name, or the end that
   never answered.
5. The probe's verdicts are unchanged, and it imports the parse rather than
   owning it.
6. `bun test` green; the `surface` gate green; `just check` green.

## Notes

- **Why `enter` is the set half only.** A function that emits both a question and
  its own answer cannot fail closed: it would have to write a read before knowing
  whether it may own. The read is `QUERY`, sent first by the caller, and the reply
  is an argument — so a plan cannot be built for a host that never answered.
- **Why the give-back keeps the string.** `rgb:1e1e/1e1e/2e2e` and `#1e1e2e` are
  both in the wild, and only one of them is what that host will accept as itself.
  The parse is for reading; the string is for returning.
- **The shared half.** `BRF-OWN-SURFACE` needs the same lifecycle, so this module
  is built for two consumers even though only one exists today.

## Related

- `.archive/briefs/2026-11-11-brief-surface-picker.md` — the refusal this was
  split out of
- `briefs/2026-11-05-brief-own-surface.md` — the session enforcement that shares
  this module
- `decisions/073-the-glass-owns-its-ink.md` — the boundary the tenancy operates
  within
- `decisions/090-the-legibility-surface.md` — the instruments that measure the
  pair; this is the module that takes it
- `scripts/probe-osc.ts` — the instrument this module was extracted from
