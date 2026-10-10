---
type: Brief
callsign: BRF-READ-ACTUATOR
---

# Brief: Read actuator — the current document, handed to the voice

**Date:** 2026-10-10
**Status:** Open
**TD:** (to create)

## Context

The keymap reserves an actuator pocket and lists `speak` as a candidate; ADR-036
forbids speech code and narration **in okuda**, and ADR-039 puts the voice in the
environment. What is missing is the actuator that hands the current document to the
environment's reader — okuda emits an address, the environment reads the file.

## Objective

Add one bound doubled-pair actuator that passes the current document's path to an
environment binding which reads it aloud — no speech code, no document text, and a
silent no-op when the binding is unset.

## Evidence

- **The boundary test (ADR-036, *whose text is it?*).** okuda emits the path — the
  reader's own input, *"read this"* — and never the document's text. That is the
  legal side.
- **The precedent binding.** `OKUDA_CLONE_CMD` hands the tab to the host and keeps
  no window manager; unset, okuda's output is byte-identical. This actuator copies
  that shape.
- **The keymap pockets.** `docs/keymap.md` reserves the doubled pairs and lists
  `speak` in the pocket ledger: *"if it ever exists it is a bound actuator, never
  an ambient hook."*
- **The environment's reader already exists.** `just tts <file>` and `speak-md`
  are the read and the flatten; neither is okuda's (ADR-039).

## Scope

**In:** one reserved doubled pair bound to the read verb; an environment binding
(name chosen at implementation) invoked with the current document's path; the
`docs/keymap.md` row moved from pocket to bound, with the pocket ledger updated;
the `tests/keymap-doc.test.ts` row.

**Out:** any speech engine, voice, rate, or prosody in `src/`; the flattener
(`speak-md`'s work); the cue grammar beyond one actuation cue; any `[moira]`
recipe (the perimeter, ADR-039).

## Preconditions

- [ ] ADR-036 is accepted and its boundary test is available (`decisions/036-no-speech-code.md`).
- [ ] A reserved doubled pair is free — 11, 22, 33, 44, 55, 66, 77 are all reserved (ADR-032).
- [ ] The environment-binding pattern is readable at implementation (`src/clone.ts`, the `OKUDA_CLONE_CMD` precedent).

## Work Plan

1. [ ] Choose the token (a reserved doubled pair) and the binding name; bind in one
      line in `src/keygrammar.ts`.
2. [ ] Implement the spawn: pass the current document's absolute path to the
      binding; a silent no-op when it is unset.
3. [ ] Move the keymap row from pocket to bound; update the pocket ledger.
4. [ ] Decide at implementation whether to emit an actuation cue (class *identity*,
      text *"read"*); wire it through the existing cue channel if so.

## Acceptance Criteria

- With the binding set, the bound token makes the environment read the current
  document aloud.
- With the binding unset, okuda's output is byte-identical and the press is a no-op.
- No speech token — voice, rate, prosody, pause — appears in `src/`.
- `tests/keymap-doc.test.ts` referees the new row in both directions.
- `just check` passes.

## Notes

The classification is the hard edge ADR-036 names (its *"clone"* case): okuda
emits an **address** (state), never content. Record the egress-binding pattern as
an ADR during implementation — it is the first actuator whose effect leaves okuda
as a read, and the pattern is not yet on the record.

okuda holds a handle, never a clock, and cannot observe whether the read happened.
An actuator that reports success would be a lie about a process okuda does not own.

The details the operator deferred — the token, the binding name, the cue — are
implementation decisions. The **constraints** are not: a doubled pair, bound never
ambient, silent when unset, path not text.

## Related

- `decisions/036-no-speech-code.md` — the cue/voice boundary and the test
- `decisions/039-the-perimeter.md` — the voice is the environment's
- `decisions/032-repeated-digit-actuators.md` — doubled pairs are the actuator class
- `docs/keymap.md` — the pockets, the ledger, and the binding discipline
- `playbooks/ear-playbook.md` — how a document reaches a voice today
