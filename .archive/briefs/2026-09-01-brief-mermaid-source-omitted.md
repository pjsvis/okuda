---
type: Brief
callsign: BRF-MERMAID-SOURCE-OMITTED
---

# Brief: Omit the mermaid source from the render

**Date:** 2026-09-01
**Status:** done — landed 2026-08-30 (operator first pass 2026-10-13)
**Branch:** feat/gloam-launcher

## Context

closing move on the mermaid render path, sequenced after td-b81597 (the elision primitive). A dogfood render of `docs/2026-08-29-from-intent-to-task-05.md` — three flowchart diagrams, each with a 15–20 line source block — surfaced the question: does the render need the source at all?

> **Amendment (2026-09-29, BRF-PROJECTION-LOSSES).** This brief decided *that*
> an indicator line exists and left the wording to implementation — so the
> implementation made it a ternary, and a titled fence got its title *instead
> of* the notice. 22 of the silo's 58 diagram fences therefore never stated
> that the source is not shown. `BRF-PROJECTION-LOSSES` extends the doctrine
> below — *render the **fact** of the source, not the source* — to the fences
> the ternary excluded: the notice now rides both branches. The titled branch
> appends the shorter clause (`· source elided`, not `· mermaid source
> elided`) because the caption line is RAW-protected and never wrapped, and
> the silo's longest title plus the full clause measures 79 columns against
> the body's 78-column budget at width 80. **What stays this brief's:** the
> `⋮` glyph and its state-parked role, the untitled wording `mermaid source
> elided` byte-for-byte, the decision to omit the source block, and the
> doctrine itself. Nothing here is reversed.

## The finding

Every mermaid fence renders as two stacked blocks: the classified ASCII
**art** (the diagram), and a muted **checksum** block — the mermaid
source echoed back by the binary and re-emitted beneath the art. The
checksum block was horizontally elided in td-b81597 (phase 2), so its
lines no longer overflow the terminal. But eliding a 20-line source
block still leaves 20 lines. The real fix was never a better truncation
of the source — it was not rendering the source.

## The source is tautological in the render

`extractDiagramArt` and `extractDiagramChecksum` both pull from the
*same* binary run on the *same* fence in the *same* render pass
(`interceptMermaid` → `spawnMermaid` → one output → two extracts). The
art and the source cannot disagree: they are one render. The inline
block therefore carries zero drift-detection value. The thing that
catches stale art is `mermaid-to-md --verify` (the CI step the binary
documents), which diffs the baked art against a fresh render. The
checksum block does nothing for verify; it is pure display redundancy.
"We know the document is consistent" is not a claim, it is a mechanical
fact of the single-render seam.

## What we lose if we drop it

- **The SSH-served path's only inline view of the source.** Where
  okuda is the reader's sole interface to the document (the
  ForceCommand `ssh-serve` / `ssh-view` recipes), the checksum block
  was the one place a remote viewer could read the mermaid source
  without the file. Dropping it means a remote viewer who wants the
  source must ask for the file. **This is the one case where the
  checksum earned its keep**, and the trade is real: the source is for
  *authors* (who have the `.md`); the art is for *viewers*; okuda
  renders for viewers. The trade is accepted.
- **The "availability without insistence" the scratchpad named.**
  `docs/2026-08-27-okudagram-scratchpad.md:33`: "The muted source echo:
  it does not ask to be read; it waits to be needed. Art foreground,
  structure receding, source quiet underneath." This was a real design
  intent — not an accident — and the brief retires it deliberately: the
  echo was available, but a viewer who actually *needed* the source on
  a narrow pane got elided fragments (`…Perime…`), not the source. The
  insistence it avoided was the insistence it produced once elided.
  The pointer (below) keeps availability honest: it names *where* the
  source is, without pretending to show it.

Nothing else depends on the rendered checksum. No ADR, no brief, no
test outside the one that asserts its presence (to be updated). It is
ungoverned implementation behaviour — like the old table shrink-wrap —
so no palimpsest/reversal ADR is required; this is a refinement of a
shipped surface, not the reversal of a recorded decision.

## Decision

**Omit the source block. Render an indicator in its place.**

The `diagramBlock` handler stops emitting the `checksum` block and
emits one muted indicator line instead. The art block is unchanged.
The indicator carries no content — it names the fact that the source
exists and where it lives, not the source itself.

**Indicator shape:** one muted line, `⋮` for vocabulary consistency
(the state-parked / elided glyph; `docs/showcase.md` teaches "⋮ parked
— elided into a further question"), plus a short honest pointer. Exact
wording is implementation; the doctrine is: render the *fact* of the
source, not the source. Sketch:

```
⋮ mermaid source — in the document
```

## Why it earns its place

1. **Normalises the page.** A 3-line source and a 25-line source both
   collapse to one indicator. Big diagrams stop dominating the vertical
   rhythm; the page reads as "diagrams," not "source dumps with
   diagrams attached." Stuff into things: the source dump was decorated
   Stuff, the indicator is a Thing.
2. **Retires a tautological block.** A block that cannot disagree with
   the art above it is not a checksum; it is a duplicate. Rendering a
   duplicate is entropy.
3. **Closes the half-measure.** The td-b81597 phase-2 checksum
   horizontal-elision treated a symptom (lines overflow) while leaving
   the cause (the block is rendered at all). This brief treats the
   cause. The phase-2 *code-fence* elision stands on its own; only the
   checksum half is superseded.
4. **Scope-gate honest.** This is *not* the vertical elision (`⋮`) the
   elision brief parked. The brief parked `⋮` as **viewport** vertical
   elision — "more rows than the viewport is the TUI's scroll, not the
   renderer's." Collapsing the source block is a **content decision**
   (stop emitting the source, emit a pointer), not viewport machinery.
   The gate stays intact; the `⋮` glyph is borrowed for its semantic
   ("elided into a further question"), not its parked role (scroll).

## How

- `src/render.ts`, `diagramBlock`: drop the `checksum` branch; emit the
  indicator line (muted, `⋮` + pointer) where the block was. The
  `extractDiagramChecksum` function and the `checksum` field on the
  mermaid map entry become dead — remove them in the same change
  (palimpsest discipline: no orphaned helpers).
- `src/render.ts`: `interceptMermaid` stops carrying `checksum` (the
  binary still emits the `mmd` fence; `extractDiagramArt` already
  ignores it). Confirm the binary's `mmd` fence is not parsed anywhere
  else.
- `tests/table-diagram.test.ts`: the test asserting "the mermaid source
  appears as the muted checksum block beneath the art" inverts — assert
  the indicator line is present and the source is *not* in the render.
  The "binary missing → no checksum, source dropped" assertion stays
  (binary missing → no art, no indicator).
- `docs/2026-08-27-okudagram-scratchpad.md`: the "availability without
  insistence" note (line 33) gets a one-line amendment recording the
  retirement — the echo is gone; the pointer keeps the availability
  honest. Same-change update, no orphaned instruction.
- `docs/showcase.md`: the mermaid section (if it teaches the source
  echo) moves in the same change.

## Scope / non-goals

- **Not viewport vertical elision.** `⋮` as scroll-collapse of
  arbitrary long content is still parked. This brief removes one
  specific block (the tautological source) and replaces it with a
  pointer; it does not introduce a general vertical-elision mechanism.
- **Not the diagram art.** The art block is unchanged — verbatim,
  classified, "art is art." The diagram-width leak (art authored to a
  fixed budget, overflows a narrow terminal) is a separate, upstream
  concern (pass render width to `mermaid-to-md`), explicitly out of
  scope here.
- **Not `--verify`.** The CI verify step reads source from the `.md`
  file, not the render. Unchanged.

## Risk / open questions

- **SSH-served readers** lose the inline source (above). Accepted; flag
  in the debrief.
- **Indicator wording.** "mermaid source — in the document" is a
  sketch. The pointer should survive NO_COLOR (it is content, not
  styling) and read as a pointer, not a label. Decide at
  implementation; the brief sets the doctrine (name where, not what).
- **`⋮` semantic reuse.** `⋮` is already the state-parked glyph
  (`docs/state-glyphs.md`). Reusing it as the source-elided marker
  extends its vocabulary from "a parked item" to "a parked *block*."
  The lexicon is consistent (both mean "elided into a further
  question"); confirm no test pins `⋮` to state-glyph-only contexts
  that would false-fail.

## Related

- `docs/2026-08-27-okudagram-scratchpad.md` — "availability without
  insistence" (the intent this retires)
- `briefs/2026-08-28-brief-elision-primitive.md` — td-b81597 (the
  phase-2 checksum half-measure this closes)
- `decisions/004-hard-wrap-mandate.md` — the fence/checksum elision
  amendment (the checksum half is superseded by this brief)
- `decisions/013-ssh-serving-forcecommand.md` — the SSH path (the one
  case the checksum earned its keep)
- `docs/2026-08-29-from-intent-to-task-05.md` — the dogfood doc that
  surfaced the question
- `src/render.ts` — `diagramBlock`, `extractDiagramChecksum`,
  `interceptMermaid`
- `briefs/2026-09-29-brief-projection-losses.md` — the amendment above: the
  notice's coverage, extended to every fence
- `DEPENDENCIES.md` — the `mermaid-to-md --verify` CI step (unchanged)
