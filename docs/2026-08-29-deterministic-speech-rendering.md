# Discussion: Deterministic Speech Rendering for Restricted Markdown

**Context:** Gloam / Okuda Renderer  
**Topic:** Semantic Audio Rendering vs. Monotone TTS  
**Date:** 2026-08-29

---

## 1. The Core Premise

Standard OS text-to-speech engines flatten documents into an unvarying, robotic drone. Conversely, conversational LLM audio interfaces over-index on conversational filler, hesitation tokens, and synthetic "personality." 

For technical documentation, both fail.

Audiobook narration works because professional voice actors follow a strict professional discipline: **read the text faithfully, stay neutral, but use pacing, cadence, and tonal dynamics to reflect semantic structure without editorially commenting on the content.**

Because Okuda operates on a **restricted, deterministic Markdown grammar**, an audio renderer can map structural and visual semantics directly to auditory acoustics without guessing or hallucinating.

---

## 2. Audio-Visual Semantic Mappings

Instead of treating speech as an afterthought alt-text stream, the audio renderer maps the document AST and matrix styling into an acoustic hierarchy:

* **Visual Contrast (Near / Far Colors) $\rightarrow$ Audio Dynamics:** 
  * Foreground / focused text renders at standard volume (0 dB) and crisp presence.
  * Dimmed, background, or contextual metadata renders slightly attenuated (-3 to -6 dB) with a subtle low-pass rolloff, creating spatial depth.
* **Headings $\rightarrow$ Cadence and Pitch Shifts:**
  * No verbose announcements (e.g., avoid saying *"Heading Level Two"*).
  * `H1`: Pronounced pause, lowered baseline pitch, authoritative weight.
  * `H2 / H3`: Shorter breath pause, slight upward inflection on entry, standard cadence.
* **Lists and Sequential Steps $\rightarrow$ Rhythmic Meter:**
  * Bullet points trigger predictable, rhythmic micro-pauses (150ms) to delineate items without reading out bullet symbols.
  * Numbered items announce their ordinal crisply, followed by an immediate transition to the item body.
* **Code and Inline Monospace $\rightarrow$ Flat Cadence:**
  * Inline tokens (paths, commands, identifiers) drop emotional inflection and adopt a measured, dry, literal pronunciation.
* **Blockquotes $\rightarrow$ Pacing Shift:**
  * Subtle change in vocal tempo or a minor stereo pan offset to indicate nested intent without theatrical roleplay.

---

## 3. Operational Heuristics for Speech Narrators

The speech pipeline adheres to four fundamental narrator rules borrowed from classical technical reading:

1. **Faithful Delivery:** Read the exact tokens on the page. Do not summarize, rephrase, or drop filler words.
2. **Zero Editorializing:** No affective coloring, no synthesized sighs, no subjective emphasis on words unless marked by formatting (e.g., bold or italic AST nodes).
3. **Punctuation as Pacing:** Commas, colons, em-dashes, and periods dictate silence durations, creating a natural respiratory rhythm.
4. **Instant Interruption:** The moment navigation occurs in the matrix (scroll, section switch, escape), the audio stream cuts out instantly with zero tail latency.

---

## 4. Use Cases

* **Eyes-Free Matrix Verification:** Developers auditing a runbook, playbook, or ADR while keeping their eyes on a build log or debugging terminal.
* **Accessible Section Review:** Low-vision and screen-reader users navigating dense technical structures via rapid sectional jumping with full tonal hierarchy.
* **Proofreading Cadence:** Hearing raw Markdown read aloud with accurate structural pauses immediately exposes clumsy prose, run-on sentences, and broken list structures.

---

## 5. Next Steps

* Define an open specification for the AST-to-SSML (Speech Synthesis Markup Language) or CLI parameter mapping.
* Prototype a lightweight parser pipe that converts restricted Markdown AST blocks into parameterized inputs for tools like `say`, `piper`, or `espeak-ng`.