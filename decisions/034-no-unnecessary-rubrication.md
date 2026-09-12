---
type: ADR
callsign: ADR-NO-UNNECESSARY-RUBRICATION-034
---

# Decision: No unnecessary rubrication — the affordance is the affordance

**Date:** 2026-09-10
**Status:** Accepted

## Context

The TTS silcrow announcement spec (BRF-TTS-TEMPORAL) initially carried
two pauses around the spoken marker: a `vector-before` pregnant pause
("navigational incoming") and a `vector-after` pregnant pause ("time to
actuate"). The before-pause was over-engineering: the spoken word
"silcrow" *is* the affordance — the audio equivalent of the rose-bold
glyph in visual. Adding a pre-pause on top of a word that already signals
"something navigational is happening" is redundancy pretending to be
thoroughness. It is decorated Stuff: format without substance, ceremony
without function.

This is the same error in any channel: a visual affordance that adds
decoration on top of the affordance (a glyph *and* a border *and* a
blink), or an audio affordance that adds a pre-pause on top of the word
that already flags the affordance. The principle generalises.

## Decision

No unnecessary rubrication. The affordance is the affordance — one
signal is enough; adding a second to announce the first is decorated
Stuff. Do not add a framing decoration on top of a signal that already
carries the affordance.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Before-pause + after-pause (the original spec) | Redundant — the word "silcrow" is the affordance; a pre-pause decorates it. Decorated Stuff. |
| Pre-pause only (no after-pause) | Removes actuation time — the listener needs the after-pause to press the digits. Too little. |
| After-pause only (the chosen shape) | The word is the affordance; the after-pause is the actuation window. One signal, one function, no redundancy. |

## Consequences

**What became easier:**
- The pause table is simpler — one entry (`vector-after`), not two.
- The principle is citable: future "should we add a framing pause /
  border / marker on top of an existing affordance?" questions resolve
  by reference to this ADR.

**What became harder:**
- Nothing. The affordance was never weaker for the missing pre-pause;
  the word does the work.

**Constraints this imposes:**
- A proposed framing decoration on top of an existing affordance must
  justify itself: what does the second signal do that the first
  doesn't? If the answer is "announce it" and the first signal already
  announces, the proposal is rejected.

## Related

- Brief: `briefs/2026-09-09-brief-tts-temporal-punctuation.md`
  (BRF-TTS-TEMPORAL) — the pause table this ADR thins
- Brief: `briefs/2026-09-10-brief-tts-stepper.md` (BRF-TTS-STEPPER) —
  the channel that inherits the thinned table
- Lexicon: "Stuff into Things" (decorated Stuff = format without
  substance), "Saramago Barrier" (the slab is the Thing when the form
  *is* the function — the inverse of this ADR's case)
