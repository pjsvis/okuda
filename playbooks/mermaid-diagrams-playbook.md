---
type: Playbook
callsign: PLY-MERMAID-DIAGRAMS
---

# Mermaid diagrams playbook — authoring for the SpaceXAi renderer

## What this is

How to author mermaid fences that render well through okuda, what the
SpaceXAi Rust renderer (`mermaid-to-md`, `~/.local/bin`) supports, how
complexity is bounded, and what happens at the boundary. The renderer is
an external dependency (`DEPENDENCIES.md`); okuda pipes mermaid fences to
it and paints the returned ASCII verbatim.

## Supported diagram types (code-truth: `src/mermaid.rs` dispatch chain)

| Type | Parsed by | Layout |
|---|---|---|
| `graph` / `flowchart` | `parse_graph` | `layout_flowchart`; with `subgraph` blocks → `render_grouped` |
| `stateDiagram` | `parse_state` | `layout_flowchart` |
| `classDiagram` | `parse_class` | `render_class` |
| `erDiagram` | `parse_er` | `render_class` |
| `sequenceDiagram` | `parse_sequence` | `layout_sequence` |

**Everything else falls back cleanly**: gantt, pie, journey, mindmap,
gitgraph, timelines — an unsupported or unparseable diagram renders its
*source* as a chunked plain block under a ` mermaid: <type> ` title
(the `fallback` function). No garbage, no crash — but no diagram. Author
within the five families.

## Authoring rules (from the renderer's constants)

| Rule | Limit | Why |
|---|---|---|
| Node label | ≤ 28 chars (`MAX_LABEL`) | ASCII box width |
| Label lines | ≤ 4 (`MAX_LINES`), overflow ellipsised | box height |
| Edge labels | same label rules | arrow rows |
| Node count | ≤ 128 (`MAX_NODES`) | bounded context: beyond the cap, extra nodes are **dropped** (`over_cap` flag set) |
| Edge count | ≤ 512 (`MAX_EDGES`) | same — over-cap edges are ignored |
| Subgraphs | ≤ 24, nesting ≤ 6 deep | group layout |
| Canvas | ≤ 2,097,152 cells (`MAX_CANVAS_CELLS`) | the layout refuses (`Oversize::Cells`) |

Shapes (`Rect`, `Round`, `Diamond`), arrow heads (`-->`, `-.->`,
`==>`, circle/cross/triangle/diamond ends), and `Solid/Dotted/Thick`
line kinds are honoured. **Authoring sweet spot: keep diagrams under
~30 nodes** — the caps prevent catastrophe, not ugliness; ASCII layout
legibility degrades long before the hard boundary.

## Complexity: can we detect "too complex"?

Yes, at three levels — two shipped, one proposed:

1. **Parse-level caps (shipped).** Node/edge/group caps in the parser;
   over-cap content is silently dropped and flagged internally
   (`over_cap`). The diagram still renders — a *truncated* diagram.
2. **Layout-level refusal (shipped).** If the computed canvas exceeds
   `MAX_CANVAS_CELLS` or the canvas the engine was given, the layout
   returns `Oversize::Cells` / `Oversize::Width`, and the renderer falls
   back to a bordered listing of the source. **There is no flag on the
   pipe**: `mermaid-to-md` is a shell wrapper that flattens the refusal
   into a ```` ```text ```` fence, so the only channel is the shape of
   what comes back — a `╭ mermaid: ` box title (never present in real art)
   plus, for `Oversize::Width` only, the appended hint. okuda reads both
   and states which refusal it was. The two are indistinguishable for
   `Oversize::Cells`, which is a gap upstream, not here.

   **The canvas is okuda's budget** (`BRF-DIAGRAM-WIDTH-HANDOFF`).
   `mermaid-tui` takes its canvas from `-w`, else `$COLUMNS`, else 80, and
   the wrapper passes no `-w` — so okuda sets `COLUMNS` to the width it
   will draw into. Given that number the engine never overruns it; it
   refuses instead. Which means:

   - a diagram that fits is drawn in full, never cut;
   - a diagram that does not fit is *not* drawn, and the render says
     `▸ too wide · needs 241 cols · 116 here` — the layout's canvas is a
     **fixed number**, so the receipt can state it, and widening the pane
     either crosses it or tells you it never will.

   Before this, the engine laid out to the ambient `$COLUMNS` — the
   *shell's* width, or 80 when absent — while okuda cut at its own, and the
   same diagram in the same pane rendered differently depending on which
   shell launched the viewer. If you see art with a `…` in it, the engine
   overran its canvas, which the shipped one does not do: that is a bug.
3. **CSN diagnostics (proposed, unshipped).** `BRF-MERMAID-HARD` reserves
   standard diagnostic strings (`CSN: too wide`, `CSN: too complex`) so
   okuda can paint a *stated* boundary instead of a silent truncation —
   "state the fact, infer the action." The complexity gate evaluating
   node/edge counts is that brief's open work.

## Authoring workflow

```bash
# fast iteration on one diagram — at the canvas you actually have
COLUMNS=120 mermaid-to-md < diagram.mmd

# full render, the way the silo will see it
./okuda docs/your-doc.md

# does it need a wider pane than this one? (the number, not a guess)
./okuda docs/your-doc.md | grep "too wide"
```

A ` mermaid: flowchart ` **box title** in the render means the diagram
**fell back** — the type was unsupported or the source didn't parse. That
grep is the smoke test.

**Budget rule.** A diagram's canvas is fixed; the pane is not. Before
committing a diagram to a document, render it at the narrowest width the
document is expected to be read at. A `flowchart LR` with three subgraphs
and phrase-length labels is a 241-column diagram, and no amount of pane
will make it a 120-column one (`docs/2026-10-25-test-diagrams.md` holds
one, and the receipt names it). The fix for "too wide" is a narrower
diagram — fewer columns of rank, shorter labels, split by view — never a
wider pane.

## Related

- Brief: `briefs/2026-08-29-mermaid-hard-boundary-CSN.md` (the CSN
  diagnostics and complexity gate, open)
- Brief: `briefs/2026-08-27-brief-dense-dynamic-displays.md`
- Doc: `docs/2026-08-31-mangle-demo.md` (Trick 2 — mermaid as ASCII art)
- External: `~/Dev/GitHub/mermaid-to-md` (the renderer; `src/mermaid.rs`
  is the code-truth for every limit in this playbook)
