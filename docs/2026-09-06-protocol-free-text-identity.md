---
date: 2026-09-06
kind: design rationale — identity finding
lineage: dialog session (dunt mode demolition → protocol-free symmetry). Companion to docs/2026-08-20-origin-doc.md (the three-concerns doctrine) and docs/2026-08-30-gloam-seams.md (the seams).
---

# Protocol-free text identity

> A text receiver and a restricted-grammar text emitter. Protocol-free,
> serving any text consumer.

This is the identity that subsumes the three-concerns doctrine. It does not
contradict the origin doc; it states the *two directions* the doctrine's three
owners imply — and it names the property that makes the design fit a wider
world than "a terminal markdown viewer" suggests.

## The negative finding (dunt mode, demolished)

A `--dunt` flag was proposed: when gloam starts in dunt mode, the search
entry inspects the first glyph of input; dot or dash enables "morse
ingress," otherwise standard text; "no default ingress mode."

Three errors, in ascending severity:

1. **"No default" is false.** The rule *is* a dispatcher — a one-glyph
   heuristic with standard text as the else-branch. Calling that "no
   default" is naming entropy; it's a default in disguise.
2. **The first-glyph heuristic is fragile.** Morse's dot/dash collide with
   the two most common leading glyphs in real queries: `.` (dotfiles —
   `.gitignore`, `.env`) and `-` (flag prefixes — `-v`, `--dunt` itself).
   A query for `.archive` is one character from misrouting into a decoder.
   The moment a detection rule needs an escape hatch for *itself*, the rule
   is wrong. Hume's Razor: the heuristic does not survive contact with the
   real input distribution.
3. **It names no user.** The moat question, unanswered. Paths aren't stored
   in morse; the search entry matches file paths. So morse ingress means
   decode → text → fzf, inserting a pipeline to produce keystrokes the user
   could have typed as letters. Worse, morse distinguishes dit from dah by
   *duration*, not glyph — a TUI keystream carries no timing, so what's
   proposed is a `.`/`-` substitution cipher (`.-` = 'A'), strictly more
   keystrokes per character than the letter. It imports the connotation of
   a real encoding while discarding the property that makes it work.

**The resolution:** the dunt actuator is the *device in the world* —
microphone, accelerometer, morse key against a desk. Whatever turns the
physical dunt into electrical signal is a **compositing** problem. By the
time anything reaches gloam's search entry, the transduction is done and the
result is text. `--dunt` as a gloam flag is a category error: it reaches
*behind* the byte stream to specify how the byte stream was made. That's the
environment's job, not the renderer's.

**The honest gloam position:** gloam receives a string. The string is text.
Period. Whether a human typed it, an agent composed it, or a dunted device
decoded it — we cannot know, and we decline to care. That negative stance
*is* the integration surface; it is the moat restated.

## The positive finding (protocol-free, symmetric)

The demolition's symmetric half: **we don't care where text *goes* either.**
The doctrine was asymmetric in the docs (it named three *owners* — compositing,
windowing, rendering — all framed around inbound text and a screen). The
symmetric form names the *two directions*: a text receiver and a text emitter,
protocol-free on both ends.

- **Inbound:** a stream of text. Origin uninterrogated.
- **Outbound:** a stream of text, restricted to the okuda grammar —
  headers, loose lists, loose tables, code fences, mermaid→ASCII, inline
  styles, word wrap. Rubricated silcrows (§) where a document carries
  references we can resolve, one hop only.

And the outbound serves **N sinks, all text consumers** — human terminals,
agent pipes, screen readers, braille displays, switch-input systems,
voice I/O via STT/TTS. The reason isn't a feature we built; it's a protocol
we *didn't* build. By declining to specify one, we maximise the integration
surface. The fit with assistive technology is the absence of barriers, not
engineering effort.

## One honest seam (the overclaiming boundary)

"Most" AT is defensible for text-centric rendering — prose serves screen
readers and braille well. The boundary is **mermaid→ASCII**. ASCII art is a
*visual* encoding; a screen reader reads it as noise. For diagrams, the
*pre-render* mermaid source is arguably more accessible than okuda's
render. The same applies, weaker, to tables: aligned columns are optimised
for the eye; a screen reader reading left-to-right garbles row/column
relationships. Prose degrades gracefully; structure degrades unevenly.

The resolution, consistent with the doctrine: okuda renders *one way*,
optimised for the visual sink. When an AT needs a different rendering
(mermaid source instead of ASCII, markdown table syntax instead of aligned
columns), that's the environment's job — `cat` the file, don't pipe through
okuda. We are one tool among several, not the only accessibility path. The
claim is the negative one: we don't *block* AT by requiring a protocol. We
do not claim to *be* the AT-optimal renderer for every document type.
Overclaiming here would be the same error as `--dunt`, pointing the other
direction.

## Why this is the README's real first paragraph

The current opening — "a terminal markdown viewer" — is true but passive,
and hides the agent-tool duality, let alone the AT surface. "A text receiver
and a restricted-grammar text emitter, protocol-free, serving any text
consumer" is shorter and explains more: why gloam fits a paired-terminal
workflow *and* why a braille terminal or a switch-input system can drive it
without us writing a line of code for either. The protocol we didn't build
is the feature.
