---
type: ADR
callsign: ADR-REPEATED-DIGIT-ACTUATORS-032
---

# Decision: Repeated-digit actuators — [44,55,66,77,88] reserved

**Date:** 2026-09-06
**Status:** Accepted

## Context

ADR-031 allocated the two-digit space by *range*: 00–10 verbs/modes,
11–98 addresses (vectors/silcrows), 99 the clone verb. The range split
left [99] as an awkward outlier — a verb sitting at the top of the
address range, a special case in the range rule.

A practical need arrived from the TTS dogfood session
(`briefs/2026-09-06-brief-tts-dogfood.md`): double-tap keys are valuable
actuators (audio toggle, clutter-strip, brightness), and the
repeated-digit shape (`[11]`, `[22]`, …) is a mnemonic the fingers
already know. The question was whether to take them from the address
zone, and at what cost.

Two facts made the reservation cheap:

1. **Silcrow numbers are dynamic.** The allocator
   (`src/vectors.ts:buildJumpMap`) assigns numbers at render time, in
   reading order. No document authors a silcrow number; no one
   expects `§44` specifically. The allocator simply skips the reserved
   digits — the gap is invisible.
2. **Real documents have few references.** A document with 83+ distinct
   references is a document that needs re-authoring, not a longer
   address space. The cost of losing 5 addresses (88 → 83) is zero for
   any real document.

## The decision

**Reserve the repeated-digit tokens {44, 55, 66, 77, 88} as actuators.**
[00] (exit) and [99] (clone) already set the precedent — both are
repeated-digit verbs. This ADR extends the precedent from two tokens to
seven, and in doing so discovers the grammar's real organizing
principle:

> **Repeated digit = actuator. Mixed digits = address.**

This is a *shape* rule, not a *range* rule, and shape rules are easier
to learn than range rules. ADR-031's range split had [99] as an outlier;
the shape-based reading makes [99] and [00] the pattern, not the
exception. The grammar is cleaner, not weaker.

## The numbering contract, amended

- Vectors run **11–98** *minus* the reserved actuators {44,55,66,77,88} —
  **83 addresses**. Silcrow 11 is still always the first.
- The allocator skips the reserved digits globally (see
  `src/vectors.ts:buildJumpMap`). The gap is invisible because numbers
  are dynamic, never authored.
- `MAX_REFS` is now 83, not 88 (`VECTOR_MAX - VECTOR_MIN + 1 - RESERVED_VECTORS.size`).
- `verbFor` resolves {44,55,66,77,88} to `null` (reserved-unassigned),
  not `"vector"` (`src/keygrammar.ts`).

## Discipline — non-negotiable

The reservation is **global and grammar-level, never per-document**.
If [55] is an actuator, [55] is always an actuator — the silcrow
allocator always skips it, in every document, forever. Recycling a
reserved token back into the silcrow pool is a **design-time** decision
(a future ADR revising the grammar), never a runtime one. Per-document
recycling creates ambiguity: is [55] a verb or an address *right now*?
That is entropy. Global reservation is a property of the grammar, not a
state of the document.

## The actuator pocket

Reserved for future double-tap verbs (binding is a one-line table edit
in `src/keygrammar.ts`):

- `[00]` — exit (bound, ADR-031)
- `[44]` — *unassigned* (actuator pocket)
- `[55]` — *unassigned* (actuator pocket)
- `[66]` — *unassigned* (actuator pocket)
- `[77]` — *unassigned* (actuator pocket)
- `[88]` — *unassigned* (actuator pocket)
- `[99]` — clone (bound, ADR-031)

The unassigned `[04]`–`[08]` pocket remains (single-key reserved
verbs). This ADR adds the repeated-digit pocket alongside it.

## Related

- ADR-031 (the main document) — the range-based allocation this amends;
  [99] was the outlier that revealed the shape rule
- `briefs/2026-09-06-brief-tts-dogfood.md` — the dogfood that surfaced
  the actuator need (audio toggle, clutter-strip)
- `docs/2026-09-06-protocol-free-text-identity.md` — the protocol-free
  identity the dogfood demonstrates
