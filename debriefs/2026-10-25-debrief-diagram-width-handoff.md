---
type: Debrief
callsign: DBF-DIAGRAM-WIDTH-HANDOFF
briefs: [BRF-DIAGRAM-WIDTH-HANDOFF]
---

# Debrief: The diagram pipe had a second opinion about width

**Date:** 2026-10-25
**Status:** Done — one width source shipped. `just check` green, `bun test`
815/0. One upstream gap recorded in `DEPENDENCIES.md` (*known limits*) and
owned on the board, not worked around here.

## What was asked

*"Make our diagram renderer a bit more robust — some diagrams work and others
report too wide or elided; the results do not seem consistent."* With
`docs/2026-10-25-test-diagrams.md` as the instrument: twelve fences, one per
diagram family and shape.

The operator's framing was exact. The results were not inconsistent *with each
other* — each was perfectly consistent with a width okuda never chose.

## The defect

`mermaid-tui` takes its canvas from `-w`, else `$COLUMNS`, else 80
(`mermaid-to-md/src/main.rs:67-70`). The wrapper passes no `-w`
(`scripts/mermaid-to-md.sh:232`). okuda passed nothing at all
(`src/render.ts:168`), and cut the result at `ctx.width`
(`src/render.ts:1399`).

So the art was composed for the *ambient* `$COLUMNS` — the shell's width, or 80
when stdout was a pipe — and elided to okuda's budget. Two widths, one of them
invisible:

| pane | `$COLUMNS` | what happened |
|---|---|---|
| 100 | unset (pipe) | engine bailed on any diagram with a canvas of 81–100 |
| 80 | 120 (inherited) | engine laid out at 120, okuda cut to 76, receipt said *art elided* |
| 120 | 120 | art fit, nothing said |

The same fence, the same pane, three behaviours — chosen by whichever shell
launched the viewer. That is what "not consistent" was.

## The fix, and why it is one line

Set `COLUMNS` to okuda's budget on the spawn. The engine treats it as a hard
bound (`mermaid-to-md/src/mermaid.rs:1903`, `:3385`), so **art composed at
okuda's budget fits okuda's budget by construction** — measured, at five
widths, on all twelve fences: no art line exceeded the budget, once.

Two consequences fell out, and they are the point:

- **Elision of art became unreachable.** It is still in the code as a net, and
  the two tests that cover it now stub an engine that ignores its canvas —
  which is the only way to fall in. A net you can only reach by asking nicely
  is not tested.
- **"Too wide" became a number.** A diagram's canvas is fixed (d01 is 241
  columns at every canvas from 200 to 800); the pane is not. So the refusal
  can state the requirement — and does: `▸ too wide · needs 241 cols · 116
  here`.

## What the test found that the document did not

The first pass looked clean on the document at 80–160 columns and was still
wrong: the bail is detected by matching the engine's hint string, and **the hint
is wrapped to the canvas**. At 76 columns it reads `This diagram is too wide to
display here`, contiguous; at 26 it reads `too wide` / `to display here — open
the` / `image…`, and `"too wide to display"` is not a substring.

The property test at `width: 30` caught it because it went below the width where
the sentence fits on one line. The lesson is the protocol's own: **a probe
reports a ceiling**. My document probe was comfortable; the trap was in the
narrow case I did not run.

Anchoring the match on the fallback box's title (`╭ mermaid: `, which real art
never has) fixed it and removed the false-positive risk of a node labelled
"too wide".

## Two receipts that were lying

Found while mapping the refusal paths, both instances of *misleading
confidently*:

1. **`⋮ mermaid source elided`, printed above a box displaying the source.**
   The engine's fallback returns its source listing inside a ```` ```text ````
   fence, so `extractDiagramArt` hands it back as *art*, and `diagramBlock`
   appends a receipt denying what is on screen. Now the receipt states what is
   true: `⋮ source shown · gantt not drawn by the engine`.
2. **`open the image to view it in full.`** The engine's hint presumes a medium
   that has images. In a terminal viewer it is advice with no referent. Gone:
   a refused diagram gets okuda's receipt, which names the pane's width and the
   layout's.

And one lie retired from the playbook: *"the renderer falls back to the source
listing with a `too_wide` flag — okuda sees the flag and paints accordingly"*
(`playbooks/mermaid-diagrams-playbook.md`). **There is no flag.** The wrapper is
a shell script that flattens the flag into a text fence. That claim was never
true; the width handoff gave okuda a real way to see the refusal, so the
paragraph now says what the channel actually is.

## Numbers

The instrument document, same 120-column pane, run three times with a
different ambient `$COLUMNS` — old binary against new. This is the
inconsistency, made measurable rather than argued:

| build | ambient `COLUMNS` | diagrams drawn | of those, cut | fences that printed a source box | `…` in the render |
|---|---|---|---|---|---|
| `793e5db` | unset (engine → 80) | 5 | 0 | 7 | 0 |
| `793e5db` | `200` | 9 | **2** | 3 | **61** |
| `793e5db` | `60` | 2 | 0 | 10 | 0 |
| after | unset | **8** | **0** | 2 | **0** |
| after | `200` | **8** | **0** | 2 | **0** |
| after | `60` | **8** | **0** | 2 | **0** |

Read the middle rows: the same document, the same pane, and the ambient
environment decided whether you got five diagrams, nine, or two. The nine was
the worst case, not the best — two of those nine were composed at 200 columns
and sliced at 118, sixty-one cut lines, a diagram whose right edge was gone.
*Nine drawn* and *nine legible* were never the same claim, and nothing in the
old render distinguished them.

After: eight whole diagrams, two refusals carrying their requirement, two
source-only fences that say so — identical in all three environments.

The honest remainder at 120 columns: d01 needs 241, d10 needs 121 (five columns
short of the 116 budget), and `mindmap`/`gantt` are families the engine does not
draw. Twelve fences, four receipts, each stating its own cause.

## What was declined

- **Retry at natural width, then elide.** A diagram true on its left half and a
  `…` where its conclusion was. ADR-UNIVERSAL-ELISION-050 exists to stop okuda
  pretending, and a cut diagram pretends hardest — the visible part still
  parses.
- **Give the engine a generous bound and keep cutting.** Today's behaviour with
  a different constant: two widths, same inconsistency, 125 columns of art
  rendered to be thrown away.
- **Add `--width` to `mermaid-to-md`.** Correct, and a crossing into another
  silo. `$COLUMNS` is the engine's documented default, and `DEPENDENCIES.md`
  now records it as the channel in use. If upstream grows the flag, that is the
  migration; the receipt does not change.
- **Suppress the source box for unsupported types.** For a `gantt` fence it is
  the only rendering there will ever be here. Keep the box, drop the false
  clause.
- **A test that reads `docs/2026-10-25-test-diagrams.md`.** It is the operator's
  working file (untracked). The property is asserted over inline fixtures
  instead, so the gate does not depend on a document nobody has committed; the
  real document stays the manual instrument.

## Outstanding

- **`Oversize::Cells` and "no parser matched" share one upstream fallback**
  (`mermaid-to-md/src/mermaid.rs:133-136`), so a diagram too *large* reads as
  *"this family is not drawn"*. Upstream's gap; no receipt here can tell them
  apart. Stated in `DEPENDENCIES.md` and carried on the board rather than
  absorbed into a comment — a deferral with no owner is a wish.
- **The visible change to existing documents.** Of the four fences in
  `docs/diagram-monster.md`, the one the author labels *deliberately hostile*
  needs 414 columns. It used to render as a bordered copy of its own source
  under a `⋮ mermaid source elided` receipt — the source, shown, declared
  absent. It now states `▸ too wide · needs 414 cols · 116 here`, in every
  environment. Everywhere else in the silo's documents the change is
  invisible: the diagrams that fit, fit; the art that used to be cut was the
  art composed at a width nobody chose.
