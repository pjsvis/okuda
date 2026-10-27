---
type: Brief
callsign: BRF-RESTICTED-GRAMMAR
---

# Brief: Okuda Markdown AST to W3C SSML Mapping Investigation

**Date:** 2026-08-29
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on. Archived rather than deleted, so it can be **replundered** if the need returns; the idea is not being judged, only the queue position.

---

## Objective

Investigate and specify a minimal, direct mapping from Okuda's restricted Markdown AST to W3C SSML markup, prioritizing amplitude/volume dynamics and structural pauses over complex phonetic markup.

## Scope

**In:**
- Mapping Okuda's restricted grammar AST nodes (headings, lists, code spans, diagnostic `CSN:` blocks) directly to standard W3C SSML tags (`<speak>`, `<prosody>`, `<break>`, `<emphasis>`).
- Mapping visual spatial depth (near/far contrast and text weight) to SSML amplitude/volume attributes.
- Minimal string/XML templating logic required to produce valid SSML without bringing in a heavy XML parsing engine.
- Documenting the exact transformation matrix and failure modes for unsupported AST nodes.

**Out:**
- Implementing audio playback pipelines, TTS engine daemons, or audio device drivers.
- Voice-acting modulation, emotional prosody, custom phonetic dictionaries (`<phoneme>`), or dialect tuning.
- Support for arbitrary or unrestricted standard CommonMark/GFM extensions.

## Preconditions

- [ ] Okuda Markdown AST node specifications and token definitions are stable and accessible.
- [ ] Sample corpus of restricted Markdown documents representing standard layouts and `CSN:` states is available.

## Work Plan

1. [ ] Audit the Okuda AST node types to establish the minimal set of required target SSML tags.
2. [ ] Define the mapping rule for visual depth (near/far weight) to discrete decibel/volume levels (`<prosody volume="...">`).
3. [ ] Define structural boundary mappings (breaks for headers, lists, and `CSN:` alerts).
4. [ ] Produce a formal transformation spec showing raw Markdown, Okuda AST representation, and generated SSML output for all core patterns.
5. [ ] Verify that the generated SSML validates cleanly against the W3C recommendation via standard CLI validation tools.

## Acceptance Criteria

* A complete, unambiguous mapping specification document exists defining every Okuda AST node to its corresponding SSML output.
* Generated SSML relies primarily on amplitude (`volume`), standard breaks (`break`), and emphasis without complex XML nesting.
* The mapping handles `CSN:` diagnostic nodes with distinct, un-editorialized structural emphasis.
* Sample outputs pass standard W3C SSML schema validation without requiring engine-specific vendor extensions.

## Notes

Constraints and guardrails:
- Avoid the temptation to introduce full XML parser/serializer dependencies; string interpolation over a strict AST should suffice given the restricted grammar.
- Do not attempt to synthesize conversational tone; the output must remain faithful to the raw document tokens without editorializing.