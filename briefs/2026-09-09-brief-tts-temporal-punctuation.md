---
type: Brief
callsign: BRF-TTS-TEMPORAL
---

# Brief: Temporal punctuation — markdown prosody for `say`

**Date:** 2026-09-09
**Status:** Open
**Lineage:** the GLoam positioning session (2026-09-08) identified the
`say` TTS path as a real consumer of the same markdown okuda renders.
The source article (`docs/2026-09-09-say-tts-tips-and-tricks.md`)
exposed the problem: manual comma-injection in the markdown is a
visual defect in the render and a ventilator in the source. The
extractor is the right pipeline; this brief defines it so it can be
dogfooded and tuned.

---

## Objective

Build a markdown → plain-text pipeline that inserts temporal
punctuation (commas) at structural boundaries for `say`, strips visual
markup, and emits a string `say` reads with natural prosody — pauses
where a human reader would pause, no visual artefacts in the audio, no
audio artefacts in the visual.

## Scope

**In:**
- A boundary vocabulary: the markdown structures that get pauses, and
  the comma-sequence length for each.
- The pipeline: parse → insert temporal punctuation → strip markup →
  plain text out.
- The boundary-to-pause mapping as data (a lookup table), not code —
  so it can be tuned by dogfood without recompiling.
- `say` as the first consumer. The output is a plain string; `say` is
  the pipe target, not a dependency.

**Out:**
- Markup in the markdown source. The markdown stays clean; no commas in
  headings, no pauses in the visual render. The extractor is the
  compositing layer, not the source.
- TTS voices, rates, or device selection. That's `say`'s CLI surface,
  not the extractor's. The extractor emits text; `say` speaks it.
- Non-`say` TTS engines. The output is plain text; if a future engine
  wants SSML or phoneme timings, that's a different pipeline, not a
  flag on this one.
- Real-time prosody control (emphasis, pitch contour, sentence-level
  rate variation). The extractor inserts pauses; it does not
  orchestrate. `say`'s `--rate` handles rate.

## Preconditions

- [ ] `say` is available on the host (macOS built-in — verify).
- [ ] A markdown document with known structure to dogfood against
      (`docs/2026-09-09-say-tts-tips-and-tricks.md` is the candidate;
      its headings, lists, code fences, and tables exercise the
      boundary vocabulary).
- [ ] A human ear to tune against — the boundary-to-pause mapping is
      a prosody specification, and prosody is judged by listening, not
      by assertion.

## Work Plan

1. [ ] **Enumerate the boundary vocabulary.** The set of markdown
       structures that map to a pause. Starting set (to be tuned):
       - Heading end (any level) — long pause; the listener registers
         a new section.
       - Paragraph break — medium pause; the listener registers a new
         thought.
       - List-item start — short pause; the prosodic boundary between
         items.
       - Code fence start/end — medium pause; the structural shift
         into and out of a block.
       - Table row — short pause; the row boundary.
       - Mermaid linear flowchart node — treated as a list item;
         the labels are the content, the arrows are the inter-item
         commas, the boxes are visual-only. See the Mermaid
         boundary note below.
       - Blank line — the baseline; the unit of pause, not a special
         case.
       - *Excluded:* inline bold, inline code, links. These are
         emphasis, not structure; `say` does not honour them, and
         inserting pauses mid-sentence is the ventilator.
       - *Excluded:* branching/non-linear mermaid diagrams (state,
         sequence, branching flowcharts). The topological order is
         not the reading order, and "say the labels in order" loses
         the branching. Deferred — see the Mermaid boundary note.
2. [ ] **Define the boundary-to-pause mapping as a lookup table.**
       `Record<BoundaryType, string>` where the string is the
       comma-sequence. Starting values (to be tuned by ear):
       - `heading-end: ",,,,"`
       - `paragraph-break: ",,,"`
       - `list-item: ","`
       - `code-fence: ",,,"`
       - `table-row: ",,"`
       - `mermaid-flow-node: ","` (same as list-item)
       The table is the product. It is data, not code.
3. [ ] **Build the pipeline.** Three stages, one pass:
       - Walk the markdown (Bun.markdown's parser, or a lightweight
         walk — the structure is already there).
       - At each boundary, emit the comma-sequence from the table.
       - Strip visual markup (`#`, `**`, backticks, ANSI, front
         matter) — flatten to plain text.
       Output: a single string, piped to `say` or written to a file.
4. [ ] **Dogfood against the tips-and-tricks doc.** Pipe the output to
       `say`; listen; adjust the table; listen again. The dogfood
       loop is the tuning loop. The table is tuned by ear, not by
       assertion.
5. [ ] **Freeze the first version of the table** once the prosody is
       acceptable on the test doc. The table is versioned; a future
       document with different structure may surface a new boundary
       or a different pause length, and the table re-opens.

## Acceptance Criteria

- [ ] The extractor takes a markdown file and emits a plain string
      with commas inserted at structural boundaries and no visual
      markup.
- [ ] `say` reading the output of the tips-and-tricks doc sounds
      natural — pauses at section boundaries, prosodic breaks
      between list items, no mid-sentence pauses inside bold labels.
- [ ] The boundary-to-pause mapping is a lookup table, not embedded
      conditionals. Changing a pause length is a one-line edit, not a
      recompile.
- [ ] The markdown source is unchanged — no commas in the source
      headings, no pauses in the visual render. The extractor is the
      only path that inserts temporal punctuation.
- [ ] The operator, listening blind, can distinguish the
      extractor-output `say` from a comma-less `say -f` reading
      within the first two headings.

## Notes

- **Mermaid linear flowcharts — say the labels.** A linear TD
  flowchart (boxes in a vertical line, arrows top to bottom) is a
  list wearing a diagram's clothes. The labels are the content; the
  arrows are the inter-item commas; the boxes are visual-only
  artefacts that the extractor strips. No new mechanism — the
  extractor already handles lists, and a linear flow is a list. The
  mermaid source is *parsed* (the labels extracted in topological
  order), not *stripped* (the syntax removed by regex). Stripping
  the syntax would read "flowchart TD A quote Parse markdown AST
  quote dash dash arrow" — the ventilator. The extractor is a
  second consumer of the mermaid parse (mermaid-to-md is the first;
  it produces ASCII art; the TTS extractor produces labels-in-order).
  See `docs/2026-09-09-gemini-apple-say-tts-tips.md` for the
  pipeline flowchart that exercised this boundary.
- **Branching diagrams — deferred.** State diagrams, sequence
  diagrams, and branching flowcharts have a topological order that
  is not the reading order. "Say the labels in order" loses the
  branching; "A leads to B and also to C" is a different prosody
  than a list. The decision to handle these is deferred until we
  produce one — and at that point the question re-opens, with a
  new boundary (or a new prosody) as the response. The current
  vocabulary is linear flowcharts only; non-linear is out of scope
  by the same Derrida Question that Foxtrot Oscar'd the legacy tags:
  should it be in the consideration set? Not yet — we haven't
  produced any, and the linear flow is the current vocabulary.
- **The table is the product.** The pipeline is mechanics; the
  boundary-to-pause mapping is the design decision, and it is the
  thing that will be tuned by dogfood. Treat it as data.
- **One pass, one direction.** Parse → insert → strip. No
  back-references. The structure is consumed once at the boundary; the
  markup is discarded after.
- **The compositing layer.** By the three-concerns principle, this is
  a compositing concern (where the text goes — `say`), not a
  rendering concern (where the text appears — the screen). The
  extractor lives in okuda's orbit if okuda grows a `--tts` flag; it
  lives outside if it's a separate tool. Either way the markdown
  source stays clean.
- **The comma hack is the prototype, not the product.** The manual
  markup the operator is trying on the tips-and-tricks doc is the
  proof-of-concept — it confirms the pause lengths are in the right
  range and that `say` honours them. The extractor is the production
  version of the same insight, at the right layer.

## Related

- `docs/2026-09-09-say-tts-tips-and-tricks.md` — the test document
  (its structure exercises the boundary vocabulary)
- `docs/2026-09-08-gloam-the-name-is-the-gate.md` — the positioning
  context (the `say` path as a real consumer of the same markdown)
- `docs/2026-08-23-why-okuda-derrida-gate-foxtrot-oscar.md` — the
  Derrida Question / Foxtrot Oscar (the extractor is FO applied at
  the audio layer — the source stays clean, the noise goes to `say`)
- `playbooks/briefs-playbook.md` — the brief format (this document)
