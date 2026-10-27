---
type: Brief
callsign: BRF-AST-PROSODY
---

# Brief: AST-to-Prosody Intermediate Representation for Speech Rendering

**Date:** 2026-10-05
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on.

---

## Objective

Design and specify an AST-to-Prosody intermediate representation (IR) that decouples clean Markdown source documents from speech synthesis drivers, compiling semantic document structure to both Apple `say` (Moira) phonemic markup and acoustic LM special tokens (Orpheus-TTS).

## Scope

**In:**

* Schema definition for an intermediate prosodic representation (nodes, duration hints, pause envelopes, lexical stress overrides, and paralinguistic markers).
* AST compiler stage specification: mapping Markdown block and inline types (headers, list items, emphasis, breaks) into target-agnostic prosodic units.
* Driver backend compiler for macOS `say` (Moira voice) targeting phonemic injection (`[[inpt PHON]]`) and macro-pause tuning.
* Driver backend compiler for acoustic autoregressive models (Orpheus-3B) targeting paralinguistic and structural control tokens (`, `, ``).
* Context-sensitive rule specification for resolving heteronym stress (e.g., noun vs. verb *document*) and pronoun reduction (e.g., cliticization of *he*).

**Out:**

* Modifying the upstream Markdown grammar or altering raw `.md` source files.
* Visual compositor logic or visual display layouts.
* Direct training or fine-tuning of Orpheus weights (covered in separate ML training briefs).
* Audio playback drivers or audio device pipeline management.

## Preconditions

* [ ] Verify the current Markdown parser emits an accessible Abstract Syntax Tree (AST) with preserved token positions.
* [ ] Verify macOS `say` Moira voice responds to embedded phoneme syntax (`[[inpt PHON ...]]`) without discarding adjoining tokens.
* [ ] Verify token vocabulary and exact special token formats for target acoustic LM (`unsloth/orpheus-3b-0.1-ft`).

## Work Plan

1. [ ] Define the JSON/TypeScript schema for the intermediate Prosody IR (nodes: `Segment`, `Pause`, `PhonemeOverride`, `AcousticTag`).
2. [ ] Implement the AST transformation pass that traverses Markdown nodes and generates the linear Prosody IR sequence.
3. [ ] Implement POS/contextual heuristics within the IR emitter to detect heteronyms (*document*) and reduce function pronouns (*he*).
4. [ ] Implement the `AppleSayBackend` compiler to translate Prosody IR into text strings with embedded Apple `[[inpt ...]]` syntax.
5. [ ] Implement the `OrpheusBackend` compiler to translate Prosody IR into text paired with discrete acoustic control tokens.
6. [ ] Write end-to-end unit tests comparing reference Markdown snippets against expected compiled strings for both backends.

## Acceptance Criteria

* Running the test suite against a Markdown test fixture containing the words "document" (both as noun and verb) and "he" produces distinct, phonetically correct outputs in the Apple `say` compiler without modifying the fixture file.
* Compiling a Markdown document through the `AppleSayBackend` outputs valid strings with correct pause annotations and phoneme blocks verifiable by inspection.
* Compiling the identical Markdown document through the `OrpheusBackend` outputs strings containing appropriate acoustic delimiter tokens (`, `) without any Apple-specific phoneme tags.
* Source Markdown files remain identical byte-for-byte before and after running the speech compilation pipeline.

## Notes

* Apple `say` uses WorldBet / Apple Phonetic Alphabet, not standard IPA; ensure the phonemic translation table adheres to Apple's phoneme specifications.
* Avoid introducing trailing pauses before cliticized pronouns like *he* in the `AppleSayBackend`, as the Moira voice treats isolated pronouns with abrupt, unnatural lexical stress.
* Keep the IR format completely decoupled from the backends so additional speech synthesizers (e.g., ONNX/Piper, ElevenLabs) can be implemented later without revising the AST extractor.
