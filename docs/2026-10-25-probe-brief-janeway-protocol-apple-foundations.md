# Probe brief: an on-device intent filter (Apple Foundation Models)

**Date:** 2026-10-25
**Revised:** 2026-10-25 — the seam is now stated as a rule rather than a
preference (see *Boundary*), and the probes are falsifiable one at a time.
**Status:** Open — probe, not build.

## Boundary

**It is a Unix filter.** Text or audio arrives on stdin or from the microphone;
a structured intent leaves on stdout; the exit code says whether it understood.

That single sentence settles the questions the earlier draft left open. The
actuator is a **compositor** — a party that writes — and it composes the way
every other party in this silo composes: by emitting a document, a cue, or a
line of JSON on a stream. okuda is downstream and unchanged. Nothing about this
probe requires the renderer to know a microphone exists, and anything that would
require it is out of scope by construction (the three concerns: compositing,
windowing, rendering — a voice belongs to the first).

Consequence worth stating: **the probe's output must be pipeable.** If the
harness cannot be run as `echo "on screen now" | intent && echo $?`, it is an
application wearing a filter's clothes, and the result does not compose on any
of the three platforms it is interesting on.

## Why this is worth a probe now

Apple's Foundation Models framework gives **one API across macOS, iPadOS and
iOS**, on-device, offline, with typed structured output via `@Generable`. That
is a rare shape: a capability that is the same code on a laptop, a tablet and a
phone. Whatever the "AI-OS" conversation turns out to be about, a filter that
runs unmodified on all three is a component in it rather than a spectator.

**The platform question, asked before the probe runs** (the Derrida question):
this is a **macOS-only** capability today. The fleet is two machines and
`DEPENDENCIES.md` already insists a capability claim names its platform. Omarchy
may get local inference soon; *"soon" is not a dependency* — it has no date and
no referent, and that is exactly the shape of the row that read *verified on
Linux* for a month. So: probe on the Mac, and record what the filter's *shape*
is, because the shape is what ports. The backend is not.

## The probes

Each one is separately falsifiable, and P6 can kill the rest.

| # | question | pass | fail means |
|---|---|---|---|
| **P1** | Does the on-device model exist and report itself available on this machine? | an availability call returns true, and a trivial generation returns | the whole document is fiction; stop |
| **P2** | Latency, cold and warm, utterance → payload | measured and recorded; warm is stable across repeats | if warm latency is not stable, it is not an actuator — it is a batch job with a microphone |
| **P3** | Does `@Generable` typed output ever emit a malformed payload? | zero malformed payloads over a suite of colloquial, terse, hostile and ambiguous phrasings | structured output is not the guarantee it claims; the dispatcher needs a validator and the "no fallback parsing" claim dies |
| **P4** | Does it work offline? | aeroplane mode, same results | it is not local, and the privacy argument evaporates |
| **P5** | Can every action be backed out of? | every intent has a cancel; no state exists where the operator cannot return | **the ventilator test fails** — an apparatus you cannot pause is one that runs you |
| **P6** | Does it compose as a filter? | `printf 'on screen now\n' \| intent` → JSON on stdout, correct exit code, no tty required | it is not a component; the design is wrong at the seam, and P1–P5 measure the wrong object |

P5 deserves its own sentence because it is the one acceptance criterion that is
not about capability. A voice actuator that cannot be interrupted is *worse* than
a menu, because it is faster at being wrong. The cancel path is the feature.

## What the command grammar must not be

The earlier draft's lexicon — *"roger your roger"*, *"safe as houses, mostly"*,
*"reset the dread"* — is **flavour, not interface**. It is high-context in-group
pidgin: unreadable to a stranger, unguessable under stress, and misheard exactly
when it matters. A private vocabulary is a moat with no bridge.

The grammar the probe should test is the opposite: a handful of spelled,
unambiguous verbs, each mapping to one payload, with the model doing the work of
accepting how people actually talk. **The model absorbs the variety; the wire
stays boring.** Flavour belongs in the prompt and the shell, never in the schema.

## Scope

**In**

- Availability, latency, structured-output compliance, offline behaviour.
- A command grammar small enough to enumerate and assert.
- A stdin→stdout filter with a correct exit code, on macOS.
- The cancel path, tested, not assumed.

**Out**

- Any cloud route. Any API key.
- Animation, layout, window management — the filter emits intent and text; it
  does not decide where anything appears.
- okuda changes. If this probe concludes that the renderer must change, the
  probe has drifted across the seam and should be stopped.
- The pidgin as schema.

## Work plan

- [ ] P1: availability. One file, one call, one print. If it fails, file the
      result and close this brief.
- [ ] Define the intent schema: the smallest set of payloads that covers the
      operator's actual verbs. Enumerate them; a grammar you cannot list is a
      grammar you cannot test.
- [ ] P6 before P2–P5: make it a filter first, so every later measurement is a
      measurement of the thing that ships.
- [ ] P3: a phrasing suite — formal, terse, profane, ambiguous, and one
      deliberately impossible request. Record every payload, including the bad
      ones.
- [ ] P2: latency, cold and warm, 20 runs, distribution not mean.
- [ ] P4: offline.
- [ ] P5: the cancel path, from every state.

## Acceptance criteria

- The filter composes: stdin in, JSON out, exit code meaningful, no tty needed.
- Zero malformed payloads across the phrasing suite — or a named validator and a
  revised claim.
- Warm latency measured with a distribution, and stated with its platform and OS
  version (the `DEPENDENCIES.md` rule, applied to a capability).
- A cancel path exists for every intent and is reachable from every state.
- The result states plainly what ports to Omarchy and what does not.

## Notes

Keep it small enough to delete. A probe that becomes a product by accident is how
a silo acquires a dependency it did not choose. Record the numbers; the shape is
the deliverable, and the shape is portable even where the backend is not.
