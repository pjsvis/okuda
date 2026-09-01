---
type: Brief
callsign: BRF-TERMINAL-SPEECH
---

# Brief: Terminal Speech Pipeline Easter Egg

**Date:** 2026-08-29
**Status:** Open

---

## Objective

Implement a lightweight, non-blocking keybinding in Gloam that pipes the active sectional plain text or full document buffer directly to the host OS native text-to-speech binary (`say`, `spd-say`/`espeak-ng`, or PowerShell `System.Speech`).

## Scope

**In:**
- Detection of native OS speech binaries (`say` on macOS, `spd-say` or `espeak-ng` on Linux, PowerShell fallback on Windows).
- Keybinding handler in Gloam (e.g., `s`) to trigger text-to-speech for the currently focused section AST buffer.
- Process spawn/exec logic that executes asynchronously without blocking the terminal event loop or UI redraw.
- Silent degradation when no native speech binary exists on `$PATH`.

**Out:**
- In-process speech synthesis libraries, heavy neural TTS models, or external cloud API calls.
- Real-time audio streaming, duplex audio controls, playback progress bars, or pause/resume state machines.
- Custom pronunciation dictionaries or AST-to-phoneme parsing.

## Preconditions

- [ ] Gloam section-view AST provides access to clean, un-rendered plain text slices prior to ANSI escape code formatting.
- [ ] Terminal key event listener is hooked and capable of dispatching commands based on current section context.

## Work Plan

1. [ ] Implement OS platform detector to resolve the default CLI speech command (`say`, `spd-say`, `espeak-ng`, or `powershell.exe`) from the host environment.
2. [ ] Add execution wrapper that detaches and pipes a string buffer via standard input or CLI arguments to the resolved binary.
3. [ ] Bind the trigger key in the Gloam matrix view to extract the active section plain text and pass it to the speech wrapper.
4. [ ] Add process lifecycle handling to kill any active speech child process before triggering a new one to prevent audio overlapping.
5. [ ] Verify silent error handling so execution failures do not crash the terminal matrix or interrupt navigation.

## Acceptance Criteria

* Pressing the assigned speech key while viewing a section spawns the host native speech utility with the plain text of that section.
* Triggering speech on a subsequent section immediately terminates the previous speech process and starts the new section.
* Navigating, scrolling, and switching views in Gloam remains completely responsive while speech is actively playing.
* Running Gloam on a system without a recognized speech binary fails silently without error dialogs, crashes, or UI disruption.

## Notes

Constraints and pitfalls:
- Raw ANSI escape codes passed into native CLI synthesizers cause speech engines to read control characters aloud; only raw AST text must be forwarded.
- Spawning child processes synchronously will freeze the TUI matrix draw cycle; process invocation must run detached or non-blocking.
## The egress template — amplitude and pauses (added 2026-08-31)

The work plan pipes *plain text* to the synthesizer; that is the
substrate. The layer above it is the **Okudagram voice-rendering
template**: the document is composed visually, so it can be composed
vocally — deterministically, because the grammar is bounded. A bounded
visual grammar has a bounded audio grammar.

The contour, per surface:

- **Action blocks** (`&next`, `&now`): *name* — pause — *verdict* —
  pause — *cost*. The block reads as one sentence, because it is one.
- **Headings** — an amplitude step (the aural equivalent of the
  heading band).
- **Jump numbers** — radiotelephony: `[15]` is spoken *vector one
  fiver*, never "fifteen" (the fifteen/fifty ambiguity dies at the
  grammar layer — see `BRF-RESTRICTED-GRAMMAR`).
- **Elided content** — silence. Elision renders as a pause, not an
  apology.

Engine rule unchanged: native binaries only (`say`, `spd-say`),
on-device, no cloud — the same sovereign-local argument as the M4
ingress pipeline (`docs/2026-08-30-voice-actuator-testing.md`), applied
to egress. `say` takes embedded pauses (`[[slnc 400]]`) and voice
selection; the template emits plain text plus pause directives, and the
soft-Irish-voice casting decision is config, not code.

Dogfood: one script, `say`, one document, judged by ear — the mangle
demo's dogfood-as-QA trick, for the ear instead of the eye.

## The dunt — the attention trigger (added 2026-08-31)

Egress and ingress both need an *attention gate* — the signal that
means "listen now" / "act now" — and the wake word is the wrong
primitive: conversational, false-trigger-prone, socially awkward in a
room. The correct primitive is the one early radio and television
operators used on stubborn hardware: **the dunt.** Give the device a
dunt; if that fails, give it a good dunt. The grading runs from light
slap to solid thump, and the level *is* the urgency.

For voice listening actuation, the dunt is the trigger: a percussive
transient — a knock on the desk, a tap on the bezel, a slap on the lid
— detected as a sharp impulse in the mic or accelerometer channel. It
is silent to bystanders, unambiguous against conversation (speech has
no impulse transient at that energy), and it costs no words before the
words start. The actuation chain becomes:

`[DUNT]` → `[Lead-In]` ("Vector…") → `[Coordinate]` ("one fiver") →
`[Actuation]`

The dunt is the `[Attention]` state the grammar was missing — and it
sits *before* the Lead-In, the PTT for the ambient era (the Caspian
discipline: press, pause, fire).

Contemporary hardware makes the dunt portable: accelerometers and
always-on mics are everywhere, so **the dunt could come from anywhere**
— desk, lid, bezel, wall the device is leaning against. Detection is a
sharp-transient heuristic, not a model: impulse energy, rise time,
decay. No daemon in this silo — the detection belongs to the OS/voice
layer, the same compositor boundary as the ingress pipeline. Route:
ingress vocabulary input to `BRF-RESTRICTED-GRAMMAR`; the M4 is the
proving ground (`docs/2026-08-30-voice-actuator-testing.md`).

*Provenance:* the dunt is operator lore — the radio/TV heuristic is
real and widespread, the Fleet Air Arm grade of attribution (claimed,
not cited). The design use is ours.

### The dunt as a carrier — spacing, not force (added 2026-08-31)

The operator's extension, and it changes the primitive's class: force
(slaps to thumps) was a one-bit urgency flag; **spacing is a full
channel**. Sharp or protracted dunts — the quality measured by the
gaps between them, not the impacts. A dunt detector plus an interval
decoder is Morse code: the oldest attention-gated, sender-and-receiver-
only protocol on record, purpose-built for low-bandwidth covert
channels.

Two encodings fit the grammar: **ITU Morse digits** (unambiguous, five
symbols per digit) and **tap-count** (digit N = N dunts, gap, next
digit — the POW code, three times faster). Either way the actuation
chain gains a first-class acoustic register: `[DUNT-stream] → decode →
[Coordinate] → [Actuation]` — silent, hands-busy-compatible, and the
terminal never knows.

The acoustic register stack is now three deep, one decoder: voice
(conversational), radiotelephony (command cadence), rhythm (covert) —
each gated by the dunt that says listen. **Status: routed proposal** —
the decoder is ~30 lines and the M4 mic is the hardware, but it waits
on a named consumer like everything else in the blue-sky pile. The
design note is the persistence, not a build ticket.
