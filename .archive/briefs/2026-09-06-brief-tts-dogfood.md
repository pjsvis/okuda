---
type: Brief
callsign: BRF-TTS-DOGFOOD
---

# Brief: Coupled-frame TTS dogfood (mac `say`)

**Date:** 2026-09-06
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on. Archived rather than deleted — replunder if the need returns. The idea is not judged, only its queue position.

## Lineage

dialog session (dunt demolition → protocol-free identity, `docs/2026-09-06-protocol-free-text-identity.md`). Replaces the outbound-markup core of `BRF-AUDIO-STYLE` (amplitude/pause lookup, `SRSN:` protocol) — those were the `--dunt` error pointing outbound.

## Objective

Prove the protocol-free identity on hardware: the same bytes that reach
the screen reach a speaker, the same filter applies to both, and the
host's resize signal is the frame-size control for both sinks. The
dogfood's value is confirming the *degradation* the doctrine predicts,
not papering over it.

## The dogfood, as built from what exists

One render, one frame, two sinks teed off the same bytes:

```
okuda <file.md> --no-color | tee /dev/tty | say
```

- **Coupled frame.** The audio frame length is the visual frame's text
  length, automatically, because they are the same bytes. No separate
  audio-frame-size verb to build.
- **Resize is the verb.** Terminal resize → SIGWINCH → okuda re-renders
  to new cols/rows → new chunk → both sinks get the new size. The host's
  resize signal *is* the frame-size control, and it drives both sinks
  identically. Nothing new is emitted.
- **The desync is the data.** The eye finishes the frame in ~2s; the
  ear takes ~30s (1x) or ~15s (2x). The panel contract — "there and there
  until released" — holds: the eye waits, the voice continues, both stay
  on the frame until `space`. The 2s-vs-30s gap is the physical asymmetry
  (parallel eye, serial ear) made audible. The test environment's job is
  to *feel* that gap, not to hide it.

## What the dogfood must show (acceptance is honest, not flattering)

1. **It works mechanically.** `okuda --no-color doc.md | tee /dev/tty | say`
   produces audio and visual from the same bytes. Zero new code.
2. **The degradation is real and located.** `say` reads `#` header
   markers, residual bold escapes, the right-margin border, custom list
   glyphs as noise. The visual render is *not* the audio input — that's
   the finding. The clean audio input is raw/structured markdown, not
   okuda's render. okuda is one tool among several; the audio path may
   skip okuda or strip after. We do not build the stripper (the
   environment's job).
3. **The shit filter works on the ear.** At 2x, the listener triages
   chunks faster; rejected chunks cost one `space`. The "most of it is
   shite" model is the panel contract applied to audio — the listener
   skims with their ears the way the eye skims with scroll.
4. **Heading-subtree chunk size is tested for ear-triage.** The panel
   brief's chunk = heading-subtree may be too coarse for audio triage;
   a sub-heading or paragraph chunk might serve the ear better. The
   dogfood answers this by feel, not by assertion. If too coarse, the
   panel brief gets a chunk-size note for audio — a tuning, not a new
   seam.

## Non-goals (what this brief does NOT authorise)

- **No outbound audio markup.** No amplitude/pause lookup tables, no
  `SRSN:` protocol, no `[[pause:500ms]]` in the stream. Those are
  `--dunt` pointing the other direction — a protocol for one sink,
  leaking into the text stream. Demolished
  (`docs/2026-09-06-protocol-free-text-identity.md`).
- **No audio grammar from us.** `say` already maps punctuation to
  pauses; the restricted grammar's blank lines (loose lists, soft
  returns) produce the pause structure `say` consumes. That's the
  "initial grammar" — and it costs nothing because `say` owns it.
- **No voice-command protocol.** "Come on, out with it" is the
  imperative *register* of the existing terse verbs, not a new seam.
  Voice is a transport for the same verbs the keys carry; the actuator
  is the verb, not a voice-specific protocol.
- **No production coupling claim.** Coupling (one frame, both sinks) is
  a *test-environment* property (one person, both senses, one
  terminal). Production may decouple: an audio listener at 2x may want
  smaller frames than a visual viewer. That decoupling is a future verb,
  not today's. Do not overclaim the coupling as universal.

## Preconditions

- [x] `say` present on mac (verified `/usr/bin/say`, 2026-09-06).
- [x] `okuda --no-color` produces text `say` consumes (verified — reads
      decoration as noise, confirming the degradation).
- [ ] Panel/pager view with `space` = next frame (the semantic pager,
      `BRF-PANEL-LIBRARY` work item 5 — unchecked). The dogfood can run
      *without* this (full-document `say`), but the coupled-frame test
      of "space advances both sinks" needs the pager. Sequence: run the
      degraded dogfood now (full doc), run the coupled-frame dogfood
      when the pager lands.

## Run 1 findings (2026-09-06, degraded preview — pager not landed)

Ran: `okuda docs/2026-08-25-what-it-feels-like.md --no-color | tee /dev/tty | say`

- **Mechanical success, zero new code.** 8454 bytes → simultaneous visual
  + audio (20MB AIFF, 471s).
- **`--no-color` does not fully strip ANSI — real gap.** 28 escape
  sequences survive (the `^[[1m` bold codes); raw markdown has 0. `say`
  reads them as noise. **The clean audio input is `cat doc.md`, not
  `okuda --no-color`.** okuda *adds* decoration noise for the ear.
  Action: either `--no-color` strips bold too, or the audio path skips
  okuda. Worth a td issue.
- **Other decoration read as noise:** `#` markers → "hash"; right-margin
  border glyphs; custom list bullets. All confirmed, as predicted.
- **Desync larger than estimated.** ~2s visual scan vs 471s audio =
  ~235× slower for the ear on this doc (longer than a single frame, so
  the per-frame estimate scales up). The serial ear's triage cost is
  real and bigger than the 30s guess.
- **Chunk-size test blocked on the pager.** Heading-subtree ear-triage
  sizing needs `space` = next frame (panel brief work item 5, not
  landed). This was the degraded preview; the coupled-frame test waits.

**Verdict:** the dogfood did its job — confirmed the degradation, located
it (surviving escapes + decoration), showed the clean input is raw
markdown, measured the desync. Most of it was shite (decoration noise),
exactly as the "sooner we find out the better" pass predicted. The
`--no-color` escape-survival is the actionable finding.

## Work Plan

1. [x] Run the degraded dogfood now: `okuda <small doc> --no-color |
      tee /dev/tty | say`. Record: what `say` reads as noise, the
      2s-vs-30s desync feel, whether heading-subtree chunks (if paged)
      are ear-triage-sized. This is the "sooner we find out the better"
      pass — most of it will be shite, that's the point.
2. [ ] Circle back on the good bits at leisure: replay previous chunk
      (the audio equivalent of scroll-back), rate-control via `say -r`
      (sink-side, not ours). Note which chunks survived the ear's shit
      filter and why — that's the data that tunes chunk size for audio.
3. [ ] When `BRF-PANEL-LIBRARY` work item 5 (semantic pager keys) lands,
      re-run with `space` = next frame on both sinks. This is the true
      coupled-frame test; the pre-pager run is the degraded preview.
4. [ ] If heading-subtree proves too coarse for the ear, add a chunk-size
      note to `BRF-PANEL-LIBRARY` (audio tuning of an existing param,
      not a new seam).

## Acceptance Criteria

* The degraded dogfood runs (zero new code): `okuda --no-color doc.md |
  tee /dev/tty | say` produces simultaneous visual + audio from the
  same bytes.
* The degradation is documented honestly: which decoration `say` reads
  as noise, where the clean audio input actually is (raw markdown, not
  the render).
* A chunk-size finding is recorded for the panel brief: heading-subtree
  is either adequate for ear-triage or too coarse, with evidence (the
  feel of the dogfood, not assertion).
* No outbound audio markup is built. The protocol we didn't build
  remains the feature.

## References

- `docs/2026-09-06-protocol-free-text-identity.md` — the dunt demolition
  and the protocol-free symmetry (the moat this dogfood demonstrates).
- `briefs/2026-08-27-brief-panel-library.md` — the panel view, semantic
  pager, chunk = heading-subtree (the frame whose size we test).
- `briefs/2026-08-29-audio-style-guide.md` (BRF-AUDIO-STYLE) — the prior
  brief whose outbound-markup core this dogfood replaces; its
  authoring-style-guide portion survives as compositing guidance.
