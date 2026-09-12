---
type: ADR
callsign: ADR-PUNCTUATION-OVER-LEGACY-SPEECH-TAGS-033
---

# Decision: Punctuation over legacy speech tags — temporal prosody for portable TTS

**Date:** 2026-09-09
**Status:** Accepted

## Context

The `say` TTS pipeline (`BRF-TTS-TEMPORAL`) transforms markdown into
plain text that `say` reads with natural prosody. Apple's Speech Manager
supports embedded control tags (`[[slnc 600]]`, `[[pbas +5]]`,
`[[volm +0.1]]`, `[[char LTRL]]`) for exact silence, pitch, volume, and
character-level control — but only on *classic* voices (Alex, Victoria,
Fred). Modern neural and Siri voices drop or vocalize the legacy tags.

The dogfood (2026-09-09, manual comma markup on
`docs/2026-09-09-say-tts-tips-and-tricks.md`) confirmed that punctuation
(commas for silence, spaces for letter segmentation) produces natural
prosody on *both* voice classes. The comma is the universal prosody
protocol; the legacy tags are a voice-class-specific protocol.

The Derrida Question: should the legacy tag vocabulary be in our
consideration set? No — it is voice-class-specific, the punctuation
approach is universal and dogfooded, and the extra control (pitch,
volume, exact timing) is out of scope for the brief. Foxtrot Oscar.

## Decision

Use punctuation-based temporal prosody (commas for silence, spaces for
letter segmentation) — not legacy `[[slnc]]` / `[[pbas]]` / `[[volm]]` /
`[[char LTRL]]` Speech Manager tags.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Legacy Speech Manager tags (`[[slnc]]`, `[[pbas]]`, etc.) | Voice-class-specific: only classic voices (Alex, Victoria, Fred) honor them; neural and Siri voices drop or vocalize them. Two protocols forked by voice class is the ventilator — one protocol per medium, not two. |
| SSML (`<break>`, `<prosody>`) | The cross-platform standard, but `say` does not support it. Locks us out of the macOS built-in, which is the first consumer. Overkill for pause insertion; SSML's full prosody vocabulary is out of scope. |
| Per-element pitch/volume/rate control | Real capability the comma approach is coarser than, but explicitly out of scope (`BRF-TTS-TEMPORAL`): `say --rate` handles rate at the CLI level, not per-element. If a future document needs pitch emphasis, that's a new brief — and at that point the voice-class fork becomes a real decision, not a premature one. |

## Consequences

**What became easier:**
- One protocol, one pipeline, every voice class and every Unix TTS
  engine (`say`, `espeak`, `festival`, `flite`, `spd-say`). The
  extractor emits plain text; any engine that reads plain text speaks
  it with the same prosody.
- The boundary-to-pause mapping is a lookup table tuned by ear — no
  engine-specific tag syntax to maintain, no voice-class branching.
- The markdown source stays clean. No `[[slnc]]` tags in headings, no
  acoustic artefacts in the visual render. The extractor is the only
  path that inserts temporal punctuation.

**What became harder:**
- Per-element pitch emphasis (heading lift), volume boost (bold
  labels), and exact millisecond timing are not available. The comma
  approach is coarser: "approximately 6 commas" not "exactly 600ms."
  Accepted: the loss is the brief's scope boundary, not an oversight.

**Constraints this imposes:**
- The extractor emits plain text only. No embedded control tags, no
  SSML, no engine-specific syntax. If a future TTS engine requires
  structured markup, a new extractor (or a new output mode on the
  existing one) is the response — not a flag on this pipeline.
- The boundary-to-pause mapping is tuned by ear, not by specification.
  The table is versioned and re-opens when a new document surfaces a
  new boundary or a different pause length.

## Related

- Brief: `briefs/2026-09-09-brief-tts-temporal-punctuation.md`
  (`BRF-TTS-TEMPORAL` — the extractor specification)
- Reference: `docs/2026-09-09-gemini-apple-say-tts-tips.md` (the
  pipeline reference, stripped of legacy cruft)
- `docs/2026-08-23-why-okuda-derrida-gate-foxtrot-oscar.md` — the
  Derrida Question / Foxtrot Oscar (the gate that rejected the legacy
  tags: "should this be in our consideration set?" → no → FO)
