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

**Everything else falls back cleanly**: an unsupported or unparseable diagram
renders its *source* **as a code listing** — okuda's own code-block styling,
elided at the glass, with `⋮ source shown · <why>` above it. No garbage, no
crash — but no diagram. (The engine hands back a bordered box of the source;
okuda discards the box and renders the fence it already holds, because the box
was a foreign frame in okuda's byte stream: its title came from the source's
first word — `%%{init:` when a directive led — and it re-flowed its content
when the canvas was narrow.)
**The list below is the whole of what we do not draw**, and it is the
renderer's to keep: okuda holds no type whitelist of its own, because a
second copy of the engine's dispatch chain is a store that drifts
(`ADR-PANE-NOT-CANVAS-069`, and the *derived, not specified* rule).

## Not supported — and what it looks like

One closed dispatch chain (`src/mermaid.rs`, five families above) decides
what is drawn. Everything else is a **declared exclusion**, not a defect we
are working toward. Three classes, three remedies — the taxonomy matters
because they do not look alike in the render:

| class | in the render | what is true | the author's remedy |
|---|---|---|---|
| **not a family we draw** — `gantt`, `pie`, `journey`, `mindmap`, `gitGraph`, `timeline`, `quadrantChart`, `sankey-beta`, `xychart-beta`, `block-beta`, `packet-beta`, `requirementDiagram`, `C4Context`, `architecture-beta`, `kanban`, `treemap` | source as a code listing + `⋮ source shown · gantt not drawn by the engine` | parsed or not, never laid out | write it as a `flowchart` — the grammar that draws what it parses |
| **too large for the engine** — a legal fence whose canvas exceeds `MAX_CANVAS_CELLS` | the *same* listing, same receipt, *without* the type name | refused before layout | split it; no pane will help |
| **wider than the glass** — any diagram past the pane | art, cut at the right edge with `…`, receipt names `needs N cols` | drawn at its natural width, shown partly | widen the pane, or narrow the diagram (`ADR-PANE-NOT-CANVAS-069`) |

Two honesty gaps live in the first two rows and are **upstream's**, not
okuda's to repair:

- `Oversize::Cells` and "no parser matched" share one fallback
  (`src/mermaid.rs:133-136`), so a diagram too *large* is indistinguishable
  from a family we do not draw. Both arrive as the same listing with the same
  receipt; only the absence of the `too wide` hint separates them from a width
  refusal, and nothing separates them from each other.
- Beyond `MAX_NODES` and `MAX_EDGES` the parser **drops content silently**
  (`over_cap` is set and never surfaced), so an over-cap diagram renders as a
  *truncated* diagram that looks whole. `BRF-MERMAID-HARD` owns this; nothing
  in okuda can see it.

If you are choosing a diagram syntax for a document that will be read here,
**choose from the five**. If what you want is a picture rather than a
topology — a release calendar, a pie chart, a roadmap — it is prose, a table,
or an image link, and none of those are the engine's business.

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
   returns `Oversize::Cells` / `Oversize::Width`, and the engine falls back
   to a bordered listing of the source. **There is no flag on the pipe**:
   `mermaid-to-md` is a shell wrapper that flattens the refusal into a
   ```` ```text ```` fence, so the only channel is the shape of what comes
   back — a `╭ mermaid: ` box title (never present in real art) plus, for
   `Oversize::Width` only, the appended hint. okuda reads both to learn *that*
   there is no diagram, then discards the box and renders the fence's own
   source as a code listing. The two refusals are indistinguishable for
   `Oversize::Cells`, which is a gap upstream, not here.

   **The canvas is a constant, and it is never the pane**
   (`ADR-PANE-NOT-CANVAS-069`). `mermaid-tui` takes its canvas from `-w`,
   else `$COLUMNS`, else 80, and the wrapper passes no `-w` — so okuda sets
   `COLUMNS` to `LAYOUT_CANVAS` (2048, derived from `MAX_NODES`), and the
   pane is not an input to layout at all. What follows from that:

   - a diagram is drawn at its **natural width** wherever it is read; the
     glass decides only where to cut;
   - a cut says `⋮ … · art elided · needs 241 cols` — the number is the art's
     own width, and it is what widening the pane would buy;
   - `▸` means *no art at all*, and only two things reach it: a broken pipe,
     and a diagram the engine will not lay out even at 2048 columns.

   Two earlier policies are recorded and dead: the **ambient** canvas (the
   shell's width, or 80 in a pipe — the same diagram rendered differently
   depending on which shell launched the viewer), and the **pane-bound**
   canvas (a diagram too wide for the window vanished into a receipt, so
   resizing the terminal added and removed content from the document).
   If you see art with a `…` in it, that is the cut, and it is correct. If
   you see a diagram *refused* for width, the renderer has regressed.
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

**Budget rule.** A diagram's width is fixed; the pane is not. Before
committing one to a document, look at it at the narrowest width the
document will be read at. A `flowchart LR` with three subgraphs and
phrase-length labels is a 241-column diagram and no pane will make it a
120-column one (`docs/2026-10-25-test-diagrams.md` holds one, and the
receipt names its 241).

There are two remedies and they are not interchangeable. **Widening the
pane** shows more of the diagram you have — the right first move, because
the diagram is already drawn and the only thing missing is glass. **Narrowing
the diagram** — fewer columns of rank, shorter labels, split by view — is the
one that helps every reader, including the ones who cannot widen. Do not
widen to avoid reshaping a diagram that was too wide for its job; the
receipt staying at `needs 241 cols` in a 200-column pane is that diagram
telling you it is the wrong shape.

## Related

- Brief: `briefs/2026-08-29-mermaid-hard-boundary-CSN.md` (the CSN
  diagnostics and complexity gate, open)
- Brief: `briefs/2026-08-27-brief-dense-dynamic-displays.md`
- Doc: `docs/2026-08-31-mangle-demo.md` (Trick 2 — mermaid as ASCII art)
- External: `~/Dev/GitHub/mermaid-to-md` (the renderer; `src/mermaid.rs`
  is the code-truth for every limit in this playbook)
