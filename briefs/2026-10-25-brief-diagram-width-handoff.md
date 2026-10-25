---
type: Brief
callsign: BRF-DIAGRAM-WIDTH-HANDOFF
---

# Brief: One width, or two? — the diagram pipe's second opinion

**Date:** 2026-10-25
**Status:** Open

## Context

`docs/2026-10-25-test-diagrams.md` (12 mermaid fences, one per diagram family
and shape) renders inconsistently: some fences draw, some report *too wide*,
some draw and are then cut with *art elided*. The same document in the same
pane behaves differently between runs.

The cause is not the fixtures. It is that the render is composed for **two
different widths**, and only one of them is okuda's:

- okuda's diagram budget is `ctx.width` — `src/render.ts:377` sets
  `width: Math.max(10, opts.width - 4)`, and `diagramBlock` elides art at
  exactly that budget (`src/render.ts:1399`, `const budget = ctx.width`).
- the engine is told **nothing**. `spawnMermaid` spawns with no `-w` and no
  environment override (`src/render.ts:168`), so `mermaid-tui` falls back to
  `$COLUMNS`, then 80 (`mermaid-to-md/src/main.rs:67-70`, and
  `mermaid-tui --help`). `$COLUMNS` is the *ambient* shell value — an
  environment variable that has no relationship to the width okuda was
  invoked with, and is absent entirely when okuda's stdout is a pipe (fzf
  preview, `| less`, this session's own probe).

The engine then treats that number as a hard canvas bound: a layout whose
canvas exceeds it returns `Oversize::Width` (`mermaid-to-md/src/mermaid.rs:1903`,
`:3385`) and `render()` maps that to `fallback(…, too_wide = true)`
(`:132-137`) — the bordered source box plus *"This diagram is too wide to
display here — open the image to view it in full."*

So both symptoms are the same defect seen from two sides:

| Pane is… | `$COLUMNS` | Result |
|---|---|---|
| 100 wide, `$COLUMNS` unset (pipe) | 80 | engine bails on diagrams whose canvas is 81–100 |
| 80 wide, `$COLUMNS=120` (inherited shell) | 120 | engine lays out at 120, okuda cuts to 76, receipt says *art elided* |
| 120 wide, `$COLUMNS=120` | 120 | art fits, nothing said |

Measured on the test document (art width in display columns, bail = the
engine's own refusal):

| fence | w=60 | w=80 | w=100 | w=120 | w=160 |
|---|---|---|---|---|---|
| d01 flowchart LR, 3 subgraphs | BAIL | BAIL | BAIL | BAIL | BAIL |
| d03 flowchart TB | BAIL | art 80 | art 80 | art 80 | art 80 |
| d04 sequenceDiagram | BAIL | BAIL | BAIL | art 108 | art 108 |
| d09 erDiagram | BAIL | BAIL | art 92 | art 92 | art 92 |
| d10 flowchart TB | BAIL | BAIL | BAIL | BAIL | art 121 |
| d11 flowchart + init | art 60 | art 80 | art 100 | art 120 | art 160 |

Two properties follow, and both are the point:

1. **The engine never exceeds the width it is given.** At every width probed,
   every art line fit the bound — the bail is its refusal, not an overflow.
   Art elision by okuda is therefore unreachable *when the width is handed
   over*, and only reachable today because it is not.
2. **A diagram's canvas is a fixed number.** d01 lays out at 241 columns and
   d10 at 121, at every probed canvas from 200 to 800. "Too wide" is a
   comparison against a constant, not an opinion — which means the receipt
   can state the constant.

Two further inconsistencies sit downstream of the same pipe:

3. **The bail receipt contradicts itself.** `fallback` returns its box inside
   a ```` ```text ```` fence, so `extractDiagramArt` hands the box back as
   *art*; `diagramBlock` then appends `⋮ mermaid source elided` beneath a box
   that is showing the source. And the hint's remedy — *open the image* —
   names an artefact that does not exist in this medium.
4. **The bail box wraps mid-token.** `fallback` wraps source lines to the
   canvas, so `B[Delta]` renders as `B[De` / `lta]`. A wrapped diagram is
   already the thing ADR-UNIVERSAL-ELISION-050 refuses; a *diagram-shaped box
   of wrapped source* is that refusal wearing a border.

The playbook states the fix's premise as already true:
`playbooks/mermaid-diagrams-playbook.md:60` — *"okuda sees the flag and paints
accordingly."* It does not see the flag. The wrapper flattens the engine's
`too_wide` into a text fence, and okuda's only access to it is the hint
string. That claim is unpaid, and this brief pays it or corrects it.

## Objective

**One width source.** okuda's diagram budget is the number the engine lays
out to; art then fits by construction, and a diagram that cannot fit is
**stated with the reason and the requirement**, never elided and never
wrapped.

## The four changes

| # | Change | Where | Fails by |
|---|---|---|---|
| 1 | `spawnMermaid` sets `COLUMNS = ctx.width` on the child — the engine's documented width channel | `src/render.ts:159-190` | a diagram elided in a pane with room |
| 2 | a bailed fence becomes okuda's own receipt, `▸ too wide · needs 241+ columns (116 here)`, with the requirement *measured*, not guessed | `diagramBlock` / `diagramUnavailableBlock` | a receipt with no number, or a number that is not the engine's |
| 3 | when the extracted "art" *is* the source box (bail or unsupported type), the `source elided` clause is suppressed — the source is on screen | `diagramBlock` | "source elided" printed above the source again |
| 4 | the playbook's unpaid claim is replaced by what is true, and the width channel is named in `DEPENDENCIES.md` | `playbooks/…`, `DEPENDENCIES.md` | a future session looking for a flag that is not there |

**The measurement (#2).** The requirement is the art width the engine
produces once unconstrained: probe at `2×`, `4×`, `8×` the budget (capped) and
stop at the first canvas that renders. That number is the layout's natural
width, and it is evidence rather than a guess. Only bailed fences pay the
probe, and the spawns stay inside the existing `Promise.all`.

## Rejections

- **Retry at natural width, then elide.** Produces a diagram that is true on
  its left half and a `…` where its conclusion was. ADR-UNIVERSAL-ELISION-050
  exists to stop okuda pretending; a cut diagram pretends hardest of all,
  because the visible part still parses.
- **Give the engine a generous bound always, keep eliding.** This is today's
  behaviour with a different constant. It keeps two widths and keeps the
  inconsistency, and it renders 241 columns of art to throw 125 of them away.
- **Add `--width` to `mermaid-to-md` and pass it.** Correct, but it is a change
  in *another silo* (the seam rule: a crossing declares itself). `$COLUMNS` is
  the engine's documented default and needs no crossing. If upstream grows a
  `--width`, that is the migration, and the receipt does not change.
- **Suppress the box for unsupported types too.** The box is the only
  rendering a gantt/mindmap fence will ever get here; deleting it removes
  information. Keep the box, drop the false clause (#3).
- **Print the upstream hint verbatim.** *"open the image to view it in full"*
  is advice only true where there is an image. Its presence in okuda is a
  claim about a medium okuda is not in.

## Out of scope

- The **`Oversize::Cells`** refusal collapses into the unsupported-type shape
  upstream (`mermaid-to-md/src/mermaid.rs:133-136`): a diagram too *large* is
  indistinguishable from a type not rendered. Not fixable from here; recorded
  in `DEPENDENCIES.md` and owned by a td task, not by a comment.
- Which of the 12 fixtures are *useful* to the silo. The document is an
  instrument for the pipe, not a design target; d01 is genuinely 241 columns
  and no width handoff will make it a 120-column diagram.
- Colouring (`classifyDiagramLine`), `NO_COLOR` parity, and the fence
  placeholder protocol. Untouched.

## Tests

- **The invariant, over the real document:** for each of the 12 fences at
  widths 60/80/100/120/160, every emitted line fits `width`, and no fence
  reports *art elided* when the engine was given the budget. This is the
  test that would have caught the defect, and it is a property, not a
  fixture.
- **One width, one source:** a fence rendered with `COLUMNS=200` in the
  parent environment produces the same bytes as one rendered with it unset —
  the ambient value no longer reaches the art.
- **The receipt:** a bailed fence states a requirement that is *at least* the
  budget and *exactly* the art width the engine produces at a generous canvas.
- **No false clause:** a fence whose art is a source box does not claim the
  source was elided.

## Done when

`docs/2026-10-25-test-diagrams.md` renders at 120 columns with **zero** `…`
in any diagram region, zero *art elided*, and each bailed fence stating the
width it needs — and `just check` is green.
