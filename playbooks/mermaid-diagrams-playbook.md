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
   `MAX_CANVAS_CELLS` or the width cannot fit, the layout returns
   `Oversize::Width` / `Oversize::Cells`, and the renderer falls back to
   the source listing with a `too_wide` flag — okuda sees the flag and
   paints accordingly.
3. **CSN diagnostics (proposed, unshipped).** `BRF-MERMAID-HARD` reserves
   standard diagnostic strings (`CSN: too wide`, `CSN: too complex`) so
   okuda can paint a *stated* boundary instead of a silent truncation —
   "state the fact, infer the action." The complexity gate evaluating
   node/edge counts is that brief's open work.

## Authoring workflow

```bash
# fast iteration on one diagram
mermaid-to-md < diagram.mmd

# full render, the way the silo will see it
./okuda docs/your-doc.md

# verification: does the diagram parse as an intended type?
./okuda docs/your-doc.md | grep -m1 "mermaid:"   # a hit means fallback fired
```

A ` mermaid: flowchart ` title line in the render means the diagram
**fell back** — the type was unsupported or the source didn't parse.
That grep is the smoke test.

## Related

- Brief: `briefs/2026-08-29-mermaid-hard-boundary-CSN.md` (the CSN
  diagnostics and complexity gate, open)
- Brief: `briefs/2026-08-27-brief-dense-dynamic-displays.md`
- Doc: `docs/2026-08-31-mangle-demo.md` (Trick 2 — mermaid as ASCII art)
- External: `~/Dev/GitHub/mermaid-to-md` (the renderer; `src/mermaid.rs`
  is the code-truth for every limit in this playbook)
