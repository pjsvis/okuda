---
date: 2026-10-08
kind: principle — the invariant a resize must hold, named from the operator's dogfood of the heading rail; a contraction of the visual design philosophy, not a rule beside it
lineage: the operator's dogfood of the heading-rail change (2026-10-08, `cb77b45`) — the wrapped badge repaint and the gap before the RHS chip — reported as *"it handles the width resize in a way that reinforces the tied-to-the-mast anchor… everything seems more predictable and reassuringly so"*, with the observation that *"the title expanding gracefully and the table underneath eliding gracefully complement each other"*
status: recorded — the property to protect when a block type is added or a wrap behaviour changes
---

# The resize contract — fixed edges, one flex region, a degradation that is lossless or marked

> A resize is a transformation of the page, and a transformation is trustworthy
> when the reader can attribute it: what changed, why, and that nothing was
> silently lost. This note names the invariant that makes the reflow legible,
> and states — because it is easy to lose — that it is the visual design
> philosophy operating under width change, not a free-standing rule.

## The occasion

The heading rail was changed on 2026-10-08: wrapped continuation lines repaint
the heading badge, and a gap column keeps the text off the RHS chip. The
operator's report was not about the rail itself. It was about the **resize**:
the title expands gracefully, the table beneath elides gracefully, and the two
complement each other. This note records why that is predictable rather than
merely pleasing, so a future block type does not quietly break it.

## The contract

Three conditions hold at once, or the transformation stops being legible:

1. **Fixed edges.** The frame columns do not move with width. The heading badge
   column on the left and the chip column on the right are references, not
   content. A frame that flexes is not a frame.
2. **One flex region.** Exactly one region absorbs the width change, along one
   axis. Two flexing behaviours in the same block make the mapping
   many-valued, and the eye can no longer predict the result.
3. **Lossless or marked.** Every degradation is either lossless (a reflow that
   moves fold points but drops no bytes) or *marked* (an elision that shows its
   cut). Never silent.

That is the whole contract. It is short because it is an invariant, not a
policy.

## Per-kind degradation — why the two behaviours complement

A block degrades in the way appropriate to its kind, and the two kinds are
complements because each is honest in its own currency:

| block kind | model | under a narrower width | degradation |
|---|---|---|---|
| heading, paragraph, prose | a **stream** | **reflows** — `wrapANSI` moves the fold points | lossless, therefore invisible — a stream has nothing to lose |
| table | a **grid with a column budget** | **elides** — `elideToWidth` cuts a cell | lossy, therefore **marked** — `…`, with open SGR closed before it (ADR-014) |

Neither pretends to be the other. A table that silently truncated, or prose
that silently dropped a clause, would break the reassurance outright — that is
the *absent output* failure `docs/2026-10-06-the-shared-artifact.md` records
(a fence that vanished with nothing to indicate absence). The `…` is what makes
the table's loss **attributable** rather than merely survivable.

## Why the resize reads as "tied to the mast"

The vertical reference is the content anchor: `anchorFor` returns the stripped
text of the non-blank line nearest the viewport middle, and the re-render
re-finds it, so the line under the eye stays under the eye after reflow
(`BRF-RESIZE-CONTENT`).

The horizontal references are the frame columns. The heading rail added a second
fixed reference on the left, so the left badge column holds while only the
middle flexes. A resize therefore changes **one axis, around fixed references**.
Predictability is exactly this: the transformation is single-valued and
invertible in the mind's eye.

## The philosophy it serves — this is the part not to lose

The contract is not a rule that stands beside the okuda visual design
philosophy. It **is** that philosophy, operating under width change, and it must
be read through it. Three statements from the corpus are the anchor:

- **The calming property is sub-cortical efficiency, not aesthetics**
  (`docs/2026-08-25-what-it-feels-like.md`). The rendered document is
  pre-structured for the pre-conscious extract-process-load pass — *"the
  'what am I looking at?' pass that determines whether the cortical system
  commits."* A resize that is attributable keeps that pass cheap; a resize that
  rearranges the frame makes the reader re-run it.
- **The LCARS rules** (`docs/2026-08-20-origin-doc.md`): *high-contrast,
  functional colour blocking* (colour signals, never decorates); *zero visual
  clutter* (no arbitrary borders or chrome); *information density tuned to the
  task*. The fixed edges are clutter-free structure; the marked elision is
  density tuned to the task rather than truncated silently.
- **The variable is an input, not state**
  (`docs/2026-09-03-the-variable-is-the-invariant.md`). Width is read, not held.
  The contract is what it means to read width without holding it.

**Why the link must be stated.** A contract read alone can be satisfied while
violating the philosophy. The cheapest way to make a resize "predictable" is to
suppress content — a table that drops columns, a heading that truncates. That
satisfies condition 3 only by deleting the thing the density rule exists to
carry. **The contract is subordinate to the philosophy**: where the two
disagree, the philosophy wins, and the contract is wrong. Naming the
subordination is what stops the invariant from being gamed.

## What must not break

Check this list before adding a block type or changing a wrap behaviour:

- A new block that re-centres, or both reflows and elides, introduces a second
  flex behaviour — it must pick one degradation and hold its edges.
- A dropped `…` on a table, or a heading badge that vanishes on a continuation
  line (the repaint guards this), converts a trustworthy transformation into an
  untrustworthy one.
- A frame column that moves with width breaks condition 1, even if the reflow
  itself is otherwise fine.

**The instrument.** `tests/render.test.ts` → *"the resize contract: the frame
columns survive a width change (fixed edges)"* renders a wrapping heading at
three widths and asserts the LHS badge column (2), the RHS chip at the line
edge, and the reserved gap — so a regression in the badge repaint or the gap
fails loudly rather than being noticed by eye.

## Related

- `docs/2026-08-25-what-it-feels-like.md` — sub-cortical ETL; the perceptual philosophy
- `docs/2026-08-20-origin-doc.md` — the LCARS rules, and invariant geometry
- `docs/2026-09-03-the-variable-is-the-invariant.md` — width as input, not state
- `docs/2026-10-06-the-shared-artifact.md` — absent output; the derived artefact declares itself derived
- `.archive/briefs/2026-08-25-brief-right-edge-lcars-tab.md` — the chip, bounded reflow
- `.archive/briefs/2026-08-26-brief-resize-content-anchor.md` — the line under the eye
- `src/width.ts` — `elideToWidth` and its marker (ADR-014)
- `src/tui.ts` — `anchorFor`, the vertical reference
