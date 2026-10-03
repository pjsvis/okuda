---
type: Brief
callsign: BRF-RIGHT-EDGE
---

# Brief: Right-edge LCARS tab on headers — the visible right bound

**Date:** 2026-08-25
**Status:** Implemented (feat/rhs-chip-headers; td-9fdca0) — final form: muted solid block (bg=fg=muted on `█`), constant 1 cell, at the content boundary. Dogfooded across two documents; emergent earneds (bounded section, reflow legibility, transition smoother, vocabulary coherence) captured for the debrief. Extend to non-header blocks parked behind further dogfood.
**Context:** dogfood finding during the stacked comparison — the left
margin implies the LHS of the render area, but the RHS is unbounded
visually. Reflow on horizontal resize has no visible bound, so the
reader can't tell at a glance whether the text wrapped correctly or
overflowed.

## What

A single LCARS-coloured character at the extreme right of each header
line — the right-edge bookend to the left badge. The left badge is the
hash wearing a heading-coloured coat; the right tab is a space wearing
the same coat (`bg=heading` on a space). One column, heading colour,
implying the right border of the header panel.

## Why it earns its place

1. **Symmetry with the left.** The left margin implies the LHS border;
   the right tab implies the RHS border. Both bounds visible = the
   header reads as a panel, not a marginless flow.
2. **Bounded reflow.** On horizontal resize, the wrap recalculates and
   the tab moves with it. The reader sees the text stay within the
   tab → the reflow is bounded, not unbounded. The visible bound is
   reassuring: "it wrapped correctly" is visible, not assumed.
3. **LCARS panel metaphor.** LCARS panels have left labels and
   right-edge markers. The header is a labelled panel; the left badge
   is the label, the right tab is the edge. The bookend completes the
   panel shape.

## Parity

The tab is a space wearing `bg=heading` in colour mode. In NO_COLOR,
it's a plain space — invisible but present. Strip the escapes: the
space is there in both modes. Line counts are identical. Parity is
structural (same characters), not handled.

## Scope questions (design, before code)

1. **Every line or first line only?** The left badge is on the first
   line (the `#` markers are at the source start). The right tab on
   every line = a right-edge bar (full header height). On the first
   line only = a single top-right tab. The bar reads as a panel wall;
   the single tab reads as a close-tab. Dogfood decides.
2. **Headers only, or all blocks?** Code blocks, blockquotes, tables —
   do they get right tabs too? The left margin applies to all; the
   right bound could too. But the header is the structural anchor; the
   others are content. Start with headers; extend only if the dogfood
   demands it.
3. **Width model.** The tab is at the last column of the content area
   (`content_width`). The 2-char right margin follows. Header text
   wraps at `content_width - 1` (the tab takes a column). Body wraps
   at `content_width`. A 1-column header/body inconsistency — likely
   invisible on short headers, worth noting.

## Divergence from glow

Glow has no right-edge marker — the text ends where it ends, and the
right margin is empty space. This is a deliberate okuda divergence
(ADR-007 divergence table needs a row): the visible right bound is an
okuda thing, grounded in the bounded-reflow perceptual property.

## Out of scope

- Right tabs on non-header blocks (parked behind dogfood).
- A full right-margin border (full-height coloured bar on every line of
  every block). That's a different element; the tab is the minimal
  version.
