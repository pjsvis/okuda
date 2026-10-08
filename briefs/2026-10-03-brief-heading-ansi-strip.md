---
type: Brief
callsign: BRF-HEADING-ANSI-STRIP
---

# Brief: Strip ANSI from heading children — the heading role owns every byte of colour

**Date:** 2026-10-03
**Status:** Done

## Landed

2026-10-03 — `stripANSI(stripHtml(children))` plus `keepHeading`   in `render.ts` (the heading re-opens after a guest paint's full reset);   pinned by two tests in `tests/render.test.ts`. Status corrected   2026-10-05 — it read Open while the code, the tests and `&next.md` all   said landed.
**TD:** the heading-strip task (closed with the index row regeneration)

## Objective

Strip embedded ANSI escape sequences from heading children before the heading
handler colours them. The heading role must own every byte of colour in its
paint — no guest brush leaks through.

## Problem

Bun.markdown pre-renders inline formatting (bold, italic, etc.) into the
`children` string before the heading handler sees it. When a heading contains
`# **text**`, the children arrive with the strong role's ANSI colour already
applied:

```
[fg=heading bold] [fg=strong bold] text [reset] [heading reopen]...
```

The strong SGR sits *after* the heading SGR in the byte stream and overrides it
— gold where blue belongs. `stripHtml` strips the HTML tags but misses the
ANSI codes.

This surfaced in `docs/2026-09-13-monastic-engineering.md`, whose headings use
`# **...**`, but it's a general hazard: any inline formatting inside a heading
can leak its colour.

## Design

One call: `stripANSI(stripHtml(children))` in the heading handler's wrap line.
`stripANSI` already exists (`src/width.ts`), already imported in render.ts.
The heading badge and RHS chip are unaffected — they build their own ANSI from
scratch and don't touch children.

### What this does NOT do

- Does not strip guest paints (silcrows, state glyphs) — those are emitted by
  the renderer itself and `keepHeading` handles their resets correctly.
- Does not change how other block handlers treat children — the heading role
  is structurally different: it's the primary orienting signal, and its colour
  authority is absolute.

## Rationale

The heading is the reader's structural anchor. A colour leak in a heading is
not cosmetic — it mis-signals depth and breaks the visual hierarchy the reader
relies on to navigate. The fix is one function call on a line that already
strips HTML; the cost is zero and the benefit is a closed class of bugs.

## Conflicts / Dependencies

None. Self-contained. One line.