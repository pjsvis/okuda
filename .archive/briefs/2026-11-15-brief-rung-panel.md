---
type: Brief
callsign: BRF-RUNG-PANEL
date: 2026-11-15
---

# Brief: The rung panel — one document, nine grounds, one grid

**Date:** 2026-11-15
**Status:** Done

## Context

The pairs are pinned (`ADR-LEGIBILITY-SURFACE-090`, verified) and the ladder
is enumerated in code (`scripts/contrast.ts`, `PAIRS` — ten rungs, one
refused, nine admissible) — but every number on the ground page is
*arithmetic*. The principal has never seen the nine grounds with an eye. The
panel is the missing instrument: the same document rendered at each admissible
rung, as images, in one 3×3 grid for review. Warrant: an operator call,
2026-11-15, with a specimen spec — H1, H2, loose list, a diagram, a table,
and a "sciency function."

## Objective

Build a review grid of the nine admissible rungs as images of one okuda-rendered
specimen, so the pair walk can be judged by eye and its significant dimensions named.

## Evidence

Measured 2026-11-15 in the okuda repo:

| Fact | Value |
|------|-------|
| admissible rungs | 9 of 10 (`PAIRS`; rung 7 refused — "reads as emitted light") |
| renderer | `renderDocument(source, { width, palette?, color? })`, async, ANSI out |
| ink vs pair | okuda roles are absolute hexes; the pair is the terminal's default fg/bg — **one render serves all nine cells**, the pair is the HTML base under the same spans |
| rasterizer | `chromium` at `/usr/bin/chromium`; `aha`/`ansi2html` absent — the SGR parser is the compositor's own |
| docs registry | none — `docs/` is unindexed prose tier |

## Scope

**In:** one compositor (`scripts/surface-panel.ts`), one specimen (embedded),
the grid PNG (`docs/2026-11-15-rung-panel.png`), the panel doc that carries
the opinion on significant dimensions.
**Out:** the renderer (no change — compositor imports exports); light grounds
(`lightcard.ts` owns that question); rung 7 (refused, excluded); any preset
change; the cursor (a static image has no cursor — named in the doc, not drawn).

## Preconditions

- [x] repo synced (fast-forward to `992412e`; the dirty
      `docs/2026-10-08-frame-defaulting.md` is another session's, declared, untouched)
- [x] `renderDocument` importable and rendering the specimen at width 80
- [x] chromium present; JetBrains Mono installed (fc-list)

## Work Plan

1. [x] Specimen markdown, embedded in the compositor: H1, H2, loose list, a
       mermaid diagram, a table, a sciency function (math glyphs + a code fence)
2. [x] SGR state machine: ANSI → HTML spans (38/48;2 RGB, bold, italic, reset)
3. [x] One ANSI render, nine HTML bases (bg=rung bg, fg=rung fg), chromium
       screenshots at a fixed window
4. [x] Montage 3×3 with label strips (rung, name, pair, measured contrast)
5. [x] The doc: grid + the axes table + the opinion on significant dimensions
6. [x] `just check` green; INDEX row `in_progress` → `done`

## Acceptance Criteria

* `docs/2026-11-15-rung-panel.png` exists, 3×3, nine labelled cells, rungs 0–6, 8, 9
* every cell is the *same* rendered specimen — only the ground/ink pair differs
* the specimen shows H1, H2, loose list, diagram, table, and a sciency function
* `just check` passes
* brief registry row matches brief status

## Notes

- The ink is fixed across cells by construction (absolute-role palette); the
  visible variables are the ground's L and hue, the ink's L, and the muted
  role's structure against each ground — that is the opinion's axis list.
- Rung 7 is excluded as refused; the doc says so where the grid is read.
- Images are derived artifacts (script → PNG); the script is the source, same
  derivation ethic as `preview-card.sh` in machines.