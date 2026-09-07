---
type: Brief
callsign: BRF-DIAGRAM-INGESTION
---

# Brief: The diagram ingestion pipeline — mermaid-to-md as the show/elide/hide gate

**Date:** 2026-09-07
**Status:** Open
**Lineage:** dogfood (the onion brief's four mermaid blocks, 2026-09-07).
One block fell back to a source-echo box; bisecting it surfaced three
distinct engine defects, only one of which was the fallback. This brief
gathers them as one piece of work: the ingestion pipeline is where the
choice is made to show, elide, or hide a diagram, and that choice is
not yet the one we want.

## The three findings

### 1. Too-big diagrams show the source, and the source is never required

When `mermaid-to-md` cannot lay out a diagram, it falls back to a
boxed echo of the mermaid *source* — the `╭ mermaid: flowchart ───╮`
block. This was observed on the onion brief's Layers 2–4 diagram: a
box reprinting the `flowchart TD` source lines verbatim, where ASCII
art was wanted.

**The source is never required in the render.** The reader did not
open a document to read mermaid syntax. A source echo is the ventilator
at the diagram layer: full flow of the wrong thing, no signal/noise
separation. The fallback exists to *not crash*; it should not exist to
*show source*. The honest options when layout fails are:

- **Elide** — a marker (`⋮` or `…`, the silo's existing elision
  glyphs) that says "diagram omitted — too big to render here." This is
  the vertical-elision primitive from the frame-as-shite-filter doc,
  applied to diagrams. The reader who wants it grows the glass (resize)
  or switches to sliding mode (`[02]`).
- **Hide** — emit nothing, or a one-line caption, if the diagram is
  structurally unable to render (parse error, empty). The reader sees
  the caption, not the syntax that failed.

The source echo is a debug surface for the renderer's author, shown to
the reader by accident. It should not ship to the reader at all. The
ingestion pipeline chooses show/elide/hide; the source echo is the
default the pipeline currently falls through, and it is the wrong
default.

### 2. mermaid-to-md is an ingestion pipeline — emit what we want, test for it in the document

`mermaid-to-md` is not a renderer. It is the **ingestion stage** of
okuda's render pipeline: the place where a mermaid source is converted
to the bytes okuda renders, and where the decision is made to show,
elide, or hide. That decision belongs *here*, not in okuda's render
engine — because the choice is about the *diagram's* fitness (too big?
parseable? titled?), not about the byte stream's fitness.

The contract should be: **mermaid-to-md emits the output we want to
render, and the document tests for it.** Concretely:

- **Emit the show/elide/hide decision as the output.** Today the
  engine emits art on success and a source echo on failure. The
  emission should be: art on success; an elision marker + caption on
  "too big"; nothing or a caption on "unparseable." The decision is
  made upstream of okuda; okuda renders what it's given.
- **Test the output in the document.** A diagram in a brief or doc is
  a test case: the document asserts, by rendering, that the diagram
  emits the chosen output. The onion brief's four blocks are exactly
  this — each is a render assertion. When one falls back, the document
  fails its own test. The fix is not "make the document tolerate the
  fallback"; the fix is "make the ingestion emit the right output so
  the document passes." The `just check` gate should catch a
  fallback-echo the same way it catches a registry drift: a document
  that renders a source echo is out of conformance.

This reframes `mermaid-to-md` from "a Rust CLI that happens to feed
okuda" to "the ingestion gate, where the diagram's fate is decided."
The architecture has three concerns (compositing/windowing/rendering);
ingestion is the front edge of rendering, and the show/elide/hide
choice is its job.

### 3. All diagrams require a title

Every diagram in the silo carries a title. This is not decoration — a
diagram without a title is a diagram the reader cannot refer to, cite,
or navigate to. The title is the diagram's callsign; without it, the
diagram is anonymous content, and anonymous content is the entropy the
registry principle exists to prevent.

**The requirement:** every mermaid block is preceded by a title (a
heading, or a bolded caption line immediately above the fence). The
ingestion pipeline (`mermaid-to-md`) should enforce this: a mermaid
block with no title is a conformance failure, surfaced at `just check`
the same way a missing registry entry is. The title is part of the
document, not part of the mermaid source — it lives in the markdown,
above the fence, and the ingestion pipeline reads it as the diagram's
name.

The onion brief's four diagrams already follow this (each under a
`###` heading naming the layer). Promote the convention to a rule: no
untitled diagrams, enforced at the gate.

## The bisect that surfaced the findings (evidence)

The Layers 2–4 block fell back to source echo. Bisecting:

| Test | Shape | Result |
|---|---|---|
| 3 three-line labels fanning from one source | tall fan-out | FALLBACK |
| 2 three-line labels fanning | smaller fan-out | RENDERED |
| 4 three-line labels in a line | no fan | RENDERED |
| 3 two-line labels fanning + convergence | shorter fan + converge | RENDERED |
| + a side-input into a mid-fan node | side-edge into fan | FALLBACK |
| + L5/SEL tail instead of side-input | linear tail | RENDERED |

Two triggers, not one: (a) multiple multiline-label nodes fanning from
a single source, and (b) a side-edge into a node already in fan-out
and convergence. Both are layout-engine limits the ingestion pipeline
should absorb by eliding, not by echoing source. The bisect is the
evidence the fallback is reached by ordinary diagrams, not edge cases —
the onion brief's block was a normal channel-flow diagram, and it hit
the fallback on the first try.

## Scope / non-goals

- **Not replacing the mermaid engine.** `mermaid-to-md` (the Rust CLI)
  stays the layout tool. This brief changes its *output contract* (what
  it emits on success/failure) and the *conformance gate* (what `just
  check` asserts about diagrams in documents), not the layout
  algorithm. Improving the layout (so fewer diagrams hit the fallback)
  is a separate, harder piece of work — this brief makes the fallback
  honest while that work waits.
- **Not a config surface for elision.** The show/elide/hide decision is
  the pipeline's, not the reader's. No per-diagram "force render" flag;
  the reader who wants the elided diagram grows the glass or switches
  modes, the same escape hatches the frame provides.
- **Not titles as mermaid `title` statements.** The title lives in the
  markdown (heading/caption above the fence), not in the mermaid source.
  Mermaid's own `title` property is a render-time label inside the
  diagram; we want a document-level name above it. Don't conflate the
  two.

## How

1. **`mermaid-to-md` output contract** — replace the source-echo
   fallback with: (a) an elision marker + the diagram's title on
   "layout too big," and (b) a caption-only emission on "unparseable."
   The source echo is retained behind a debug flag (`--debug-source`)
   for the renderer's author, never the default.
2. **Title enforcement** — a lint pass (or `just check` step) that
   asserts every ` ```mermaid ` fence is preceded by a heading or bold
   caption. Failure surfaces as a conformance error naming the file and
   the untitled block.
3. **Document tests** — the onion brief's four blocks (and future
   diagrams) are render assertions. `just check` catches a
   fallback-echo as a conformance failure: a document rendering source
   echo is out of conformance, same tier as a registry drift.

## Why it earns its place

1. **Closes a reader-facing defect.** Source echo in a document is the
   ventilator at the diagram layer — full flow of the wrong thing.
   This brief replaces it with elision (honest) or a caption (honest),
   never the syntax the reader didn't ask for.
2. **Names the ingestion pipeline as a concern.** `mermaid-to-md` is
   the show/elide/hide gate; the choice belongs there, not in okuda's
   render engine. Naming the concern is the prerequisite to owning it.
3. **Makes diagrams testable in the document.** A diagram is a render
   assertion; the document tests its own ingestion. The `just check`
   gate catches fallback-echoes the same way it catches registry drift
   — the document is in conformance or it isn't.
4. **Titles as a rule, not a convention.** The onion brief's four
   titles were a convention; promote them to an enforced rule so the
   next untitled diagram fails the gate rather than shipping as
   anonymous content.

## Related

- `briefs/2026-09-07-brief-onion-search-grammar.md` — the brief whose
  four mermaid blocks surfaced all three findings. The blocks are the
  test cases.
- `docs/2026-09-05-frame-as-shite-filter.md` — the vertical-elision
  primitive (`⋮`) this brief applies to diagrams. "The mermaid elision
  is the first instance, not a special case" — this brief generalises
  it from "too narrow / too complex" to "too big to lay out."
- `decisions/008-diagram-borders-are-blueline.md` — the diagram-border
  decision; the elision marker sits inside the same border vocabulary.
- `DEPENDENCIES.md` — `mermaid-to-md` as the external Rust CLI. This
  brief re-scopes it from "a CLI that feeds okuda" to "the ingestion
  gate."
