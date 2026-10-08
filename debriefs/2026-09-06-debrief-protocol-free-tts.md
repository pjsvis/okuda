---
type: Debrief
callsign: DBF-PROTOCOL-FREE-TTS
---

# Debrief: the protocol-free TTS day — a dunt demolished, a moat proven

**Date:** 2026-09-06
**Status:** Shipped (identity doc + dogfood brief + ADR-032 + actuator reservation; `just check` green, 385 tests pass)

## What was built

A single dialog session that started with a bad idea and ended with the
project's identity restated. Five artifacts:

1. `docs/2026-09-06-protocol-free-text-identity.md` — the identity
   finding. The dunt demolition's positive form: gloam is a text
   receiver and a restricted-grammar text emitter, protocol-free on
   both ends, serving any text consumer (human terminal, agent pipe,
   screen reader, braille, switch input) at zero code cost. The protocol
   we didn't build is the feature.
2. `briefs/2026-09-06-brief-tts-dogfood.md` (BRF-TTS-DOGFOOD) — the
   coupled-frame dogfood: `okuda doc.md --no-color | tee /dev/tty | say`.
   One render, one frame, two sinks. Resize is the frame-size verb for
   both (host signal, not ours). Run 1 findings recorded.
3. `justfile` — `tts` and `tts-rate` recipes for the dogfood.
4. `decisions/032-repeated-digit-actuators.md` (ADR-032) — reserve
   {44,55,66,77,88} as double-tap actuators. The shape rule (repeated
   digit = actuator, mixed digits = address) supersedes ADR-031's range
   split.
5. Code: `src/vectors.ts` + `src/keygrammar.ts` — the allocator skips the
   reserved actuators; `MAX_REFS` is 83, not 88; `verbFor` resolves them
   to null. Tests updated.

## The lessons — the valuable part

**1. The Derrida gate fires from the inbound side too.** We had the
moat framed as "we don't care where text comes *from*." The dunt
demolition found the symmetric half: "we don't care where text *goes*."
The doctrine was asymmetric in the docs; the dialog made it symmetric.
The lesson: state the identity in *both directions*, or you've stated
half of it. The README still leads with "a terminal markdown viewer"
(passive, inbound-only); the identity doc leads with the two-direction
form. Worth promoting.

**2. Outbound markup is inbound protocol, pointing the other way.**
`--dunt` reached *behind* the byte stream (specify how text was made).
Amplitude/pause audio grammar (`BRF-AUDIO-STYLE`'s `SRSN:`, volume
mappings) reaches *outside* the byte stream (specify how text is
consumed). Both leak another concern into the renderer. Same error,
both directions. The clean line: a render *dial* (like `--no-color`,
or a future `--plain`) reduces decoration for any text consumer — ours.
A sink-specific *protocol* (pause markup for `say`) adds protocol — not
ours. The test: does it touch the byte stream's *profile* (rendering)
or add sink-specific *protocol* (compositing leak)?

**3. The dogfood's value is confirming the degradation, not hiding it.**
Run 1 found `--no-color` leaks 28 bold escapes — `say` reads them as
noise. The clean audio input is `cat doc.md`, not `okuda --no-color`.
That's the actionable finding. We did not build a stripper (the
environment's job); we recorded the gap. The dogfood is a probe, not a
fix. "Most of it is shite anyway" is the panel contract applied to
audio — the listener skims with their ears, rejects fast, and the
filter is upstream of the sink.

**4. The "already there" finding is the common one.** Three of four
proposals demolished because the feature was already in the doctrine:
dunt (gloam receives text), resize (host signal, not ours), silcrow-deref
(the resolve seam is text-addressable). The one that survived (TTS via
`say`) survived *because it used an existing seam* (pipe mode), not a
new protocol. The method: propose, demolish, keep what's left, notice
it was already there.

**5. A bad first idea pressure-tests the doctrine harder than a good
one.** The dunt embarrassment paid for itself four times over: each
wrong proposal tested the identity from a new angle (inbound, outbound,
between seams, same-bytes-to-all-sinks) and left it stronger. The
honest move when you have a shoddy edifice is to demolish it cleanly —
the demolition produces a better foundation than starting from nothing.

## What's left

- The semantic pager (panel brief work item 5) — needed for the true
  coupled-frame test (`space` = next frame on both sinks). Run 1 was the
  degraded preview.
- The `--no-color` escape leak — either strip bold too, or accept the
  audio path skips okuda. Worth a td issue.
- The actuator pocket {44,55,66,77,88} — five verbs to bind when the
  frame work lands (audio toggle, clutter-strip, brightness, …).
- README first paragraph — promote the two-direction identity over
  "a terminal markdown viewer."
- External test: Nate B Jones + wife, read-and-listen to the same
  document, discuss with references. The real dogfood.

## References

- `docs/2026-09-06-protocol-free-text-identity.md` — the identity
- `briefs/2026-09-06-brief-tts-dogfood.md` — the dogfood brief (Run 1)
- `decisions/032-repeated-digit-actuators.md` — the actuator reservation
- `briefs/2026-08-29-audio-style-guide.md` — the prior brief partially
  superseded (outbound markup demolished, authoring guidance survives)
