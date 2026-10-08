---
type: Brief
callsign: BRF-FRAME-INDEX
---

# Brief: The frame index — an address two parties can both name

**Date:** 2026-10-07
**Status:** Open

## Context

the frame *rule* is settled and implemented (a frame is a header and its content, to the next header or EOF; `src/frames.ts`, BRF-OKUDAGRAM-STEP), and the shared-artefact specification is written (`docs/2026-10-06-the-shared-artifact.md`). The stepping okudagram is the next thing; what it lacks is not a rule but an **address**. Documents are addressable in this silo — callsigns, § vectors, actable paths — and *parts* of documents are not. Two parties cannot point at the same thing until a part has a name.

## Objective

Give frames a legible index: **which frame the reader is in, and how many there are**,
derived purely from the rendered lines so that two parties rendering the same document
at the same width compute the same number.

Deliverable: the number on the glass in the existing header chip, a pure derivation
in `frames.ts`, and tests that pin stability and the actuator discipline.

## Why the address is the missing piece

Frame stepping already works: two strides (page, paragraph), a `frame` verb, bounds
by heading. Speech exists as an adjacent tool (`ear-playbook`, `speak-md`, the TTS
substrate doc). The actuator discipline exists as a decision, and it is structural
rather than tuned: *an involuntary double-strike cannot navigate anywhere*, because a
repeat lands on a token that means the system acts, never that the document moves.

None of those give two parties a shared **name** for the thing being discussed. With
one, all three of the other features become actuators over the same address:

- speech reads frame *N* — the speaker resolves the number through the same index;
- voice-command arrives as a keystroke or a query that resolves to frame *N*, and
  okuda never learns there was a voice (the three concerns: *we don't care where the
  text comes from*);
- a document can cite a frame the way it currently cites a § vector.

That is what "shared cognition" means concretely here: not a richer view, an
**addressable** one. A frame nobody can name is a frame only one party can point at.

## Design

**What is indexed.** The frames the existing rule produces, in reading order:
frame 0 is the document's top; then one frame per heading. The count is a property of
the document at the current width (`frameBounds` already derives it).

**What the number means — and what it does not.** It is a **live position**, assigned
in reading order and re-derived on every render, exactly as § vectors are
(ADR-031: numbering is structural, never authored). It is therefore *not* a persistent
identifier: a section inserted above it renumbers it. Persistence stays where it
already is — the heading's own text and the document's callsign. Stating this is the
point; a number that quietly pretends to be stable is worse than no number.

**Why a shared number is even possible.** Today's work established that a render is
deterministic: the same source at the same width produces byte-identical output
(measured: 0 lines differ across two renders of a 394-line document). Without that,
a shared address is a hope. With it, the index is a function of (document, width), and
two parties holding the same two inputs hold the same numbers.

**Where it is shown.** The header chip the renderer already draws on a heading line —
it is content, so it survives `--no-color` and a pipe, unlike a vector's paint
(ADR-031's rule: the reference is the text). The form is `frame 3/12`, not `3/12`: the
word is what stops it reading as a page number or a fraction of a load.

**The constraint the index must not break.** The digit space **12–98 is already claimed
by § vectors** (ADR-REPEATED-DIGIT-ACTUATORS-032's address canon). A frame index must
therefore
not introduce a "jump to frame N" on bare digits — that is a collision, not a
feature. If frame-jumping wants digits it needs a distinct grammar, and that is a
separate decision (see Open Questions).

**Owner map — the boundary this brief holds.** Speech and voice-command are
**actuators over the address**, not features of okuda: both are external CLIs at the
binary seam the house already uses for `mermaid-to-md`, `diagram-describe` and
`chroma`. On-screen framing belongs to the **host** (windowing); okuda's part is to
render correctly to a declared glass, which `--width` now allows.

## Scope

**In:** the pure derivation of (frame number, frame count) in `frames.ts`; the index
rendered in the header chip; the tests; the note in the okudagram-frame brief that the
rule now has an address.

**Out:** the frame rule (settled); the strides and the `frame` verb (built); speech and
voice-command (actuators, adjacent tools); the PADD, tablet hosts and kiosk launchers
(host-class work — the iPad attempt recorded a result, not a task); any digit
navigation that collides with the § vector space.

## Preconditions

- [ ] `src/frames.ts` read in full — the index must be derived from the same
      `headingLines`/`frameBounds` the strides use, not from a second notion of frame.
- [ ] The header chip's rendering path read, so the index lands in content rather than
      in paint.
- [ ] Determinism confirmed at the width the tests use (it is the index's foundation;
      if a render is not reproducible, stop and report).

## Work Plan

1. [ ] `frameIndex(lines, scroll)` — pure, over the rendered line array, returning the
       current frame's number and the total. Derived per use, like the strides; no state.
2. [ ] Render it in the header chip for the frame that owns the current top-of-view,
       and confirm it survives `--no-color` and a pipe.
3. [ ] Tests: the number for a known document; stability across a re-render at a fixed
       width; the total against `frameBounds`; and that stepping changes the number only
       when the frame changes.
4. [ ] Dogfood at two widths — narrow (a split pane) and wide — because the count is a
       property of the document *at a width*.
5. [ ] Record: the okudagram-frame brief gains the address; the shared-artefact doc
       gains the sentence that the index is what makes the artefact addressable by part.

## Acceptance Criteria

- The reader can see which frame they are in and how many exist, at both dogfood widths.
- **Two renders of the same document at the same width produce the same numbers** — the
  determinism the whole idea rests on, asserted rather than assumed.
- The number is text: it appears in `--no-color` output and through a pipe.
- **An involuntary double-strike cannot move it.** A repeated token still lands on a
  system act and never on document movement — the shared-artefact rule, held by the
  existing digit grammar and asserted in its tests.
- No bare digit in 12–98 acquires a frame meaning.
- `bun test` passes; no new dependency; the derivation is pure and takes no state.

## Notes

- **The index is for pointing, not for jumping.** Its first job is that two parties can
  say "frame 3" and mean the same lines. Navigation already has a grammar; adding a
  second one to reach a number is how an address becomes a keybinding.
- **A frame number is a position, and saying so is load-bearing.** The moment someone
  treats it as a citation that survives an edit, they will be wrong in a way that is
  hard to see — the same failure mode as a stale comment, one layer out.

## Open Questions

1. **How does a party *reach* frame N, given 12–98 is the vector space?** Candidates: a
   modifier (a `g` prefix, the existing gesture grammar), a named query (`frame 3` typed
   into the launcher, which is a compositor concern and therefore free), or the frame
   index being reachable only by stepping — which may be enough, since the index's job
   is agreement rather than teleportation.
2. **Is the index the right next step after all, or does the artefact want the frame
   *hold* first?** The fermata is the existing vocabulary for a deliberately held frame
   at a boundary; a shared reading session may want "hold here" before "name here".
   Recorded, not decided.

## Related

- `src/frames.ts` — the rule, the strides, and where the derivation belongs
- `briefs/2026-08-29-brief-okudagram-frame.md` — the frame rule and its vocabulary
  (step, scroll, vector); frame 0 is its term
- `docs/2026-10-06-the-shared-artifact.md` — what two parties must be able to see, index
  and verify; the actuator discipline this brief must not break
- ADR-REPEATED-DIGIT-ACTUATORS-032 — the address canon the index must not collide with
- ADR-EXIT-FERMATA-051 — the held frame at a boundary, for Open Question 2
- `docs/2026-10-06-the-eink-frame-is-a-second-host.md` — why the PADD is a host class
