---
type: Brief
callsign: BRF-AUDIO-STYLE
---

# Brief: Audio-First Style Guide and Linting Heuristics

**Date:** 2026-08-29
**Status:** Open

---

## Objective

Define a style guide and structural linting specification for restricted Markdown documents that ensures high-cadence audio comprehension (audiobook readability) and mandates semantic anchors for elided blocks.

## Scope

**In:**
- Proposing prose style heuristics optimized for auditory parsing (e.g., serial comma cadence, maximum clause length).
- Mandatory title requirement for all Mermaid diagrams and code blocks to replace generic "source elided" notices.
- Specification of `SRSN:` (Speech Renderer Says NO) handling for non-narrative tokens (large ASCII matrices, raw code listings).
- Mapping document visual weights (bold, italic, headers, tables) strictly to volume (dB) and pause duration (ms) rules.

**Out:**
- Writing the speech synthesis engine or audio backend drivers.
- General copy-editing rules unrelated to document structure or acoustic cadence.
- Relaxing rules for unrestricted standard Markdown.

## Preconditions

- [ ] Okuda restricted grammar specification is established and document AST nodes are identifiable.

## Work Plan

1. [ ] Draft the core prose cadence rules, establishing explicit punctuation guidelines (e.g., commas as breath breaks, avoiding deeply nested parentheticals).
2. [ ] Define the diagram and block-level metadata rule: require every diagram to supply a title string for use when source/geometry is elided.
3. [ ] Define the `SRSN:` (Speech Renderer Says NO) diagnostic behavior for dense structures (omitting raw syntax blocks in favor of titled summaries).
4. [ ] Create an amplitude and pause lookup table defining standard decibel deltas and millisecond breaks for each AST element.
5. [ ] Collate the rules into a formal style guide document ready for future integration into the linter pipeline.

## Acceptance Criteria

* A style guide document exists that specifies how Markdown prose must be structured to pass acoustic validation.
* The specification establishes a hard rule requiring explicit titles on Mermaid diagrams, eliminating ambiguous "source elided" placeholders.
* Clear `SRSN:` criteria are defined specifying exactly when the speech pipeline must elide dense blocks rather than reading syntax.
* All visual-to-audio mappings are strictly bounded to volume adjustments and pause durations without requiring voice-acting modulation.

## Notes

Constraints and intent:
- Framing accessibility as a fundamental structural constraint enforces clean, flat document architectures across the board.
- The style guide must stand on its own as a written document standard even before active TTS audio drivers are implemented.