---
type: Debrief
callsign: DBF-RUNG-PANEL
date: 2026-11-15
tags: [surface, panel, tooling]
agent: pi (pjs, quattro session)
environment: local
briefs: [BRF-RUNG-PANEL]
---

# Debrief: The rung panel — one document, nine grounds, one grid

## Accomplishments

- **The panel:** `scripts/surface-panel.ts` renders the principal's specimen
  (H1, H2, loose list, mermaid, table, sciency function) **once** and paints
  it onto each of the nine admissible grounds — rung 7 stays refused. ANSI →
  SGR state machine → HTML bases → chromium headless → 3×3 montage with label
  strips and title. `docs/2026-11-15-rung-panel.png` (2376×2452),
  `docs/2026-11-15-rung-panel.md` carries the grid, the measured axes, and the
  dimension opinion.
- **The one-render insight:** okuda's roles are absolute hexes, so the pair is
  the only variable — one render, nine bases, whatever differs between cells
  *is* the experiment. This is the shape every future panel should copy.
- **Recipes:** `just rung-panel` regenerates, `just rung-panel-doc` views —
  the palette-swatch pattern, extended.

## Problems

- **The silent success (fixed):** the first build printed `panel: docs/…png`
  while the PNG was absent — three `spawnSync` calls with unchecked exits, the
  montage among them. Every subprocess now exits through `run()`; a failure
  cannot print a success line again.
- **The destructive default (fixed, caught by the recipe smoke):** `cellDir`
  derived from `argv[last]`, which with no args is the *script's own path* —
  it starts with `/`, so the first `just rung-panel` **deleted the script and
  left a directory of cells in its place**. `--cells` is now parsed as a flag
  with a value; the default is a fixed `/tmp` path. The bug shipped invisible
  through the brief's own `--cells` runs and died the moment the recipe ran
  bare — the recipe smoke is what caught it.
- **Chromium is not byte-stable (accepted):** regeneration produces the same
  pixels in different bytes; the committed PNG is canonical and a bare regen
  is restored rather than committed. Derived-artifact discipline holds at the
  pixel level, not the byte level.

## Lessons Learned

- **Smoke the recipe, not just the script.** The script had been run three
  times with args before it ever ran bare — the one invocation the recipe
  ships. A recipe's default path is a different test surface from its flags.
- **Never derive from argv positions.** `argv[last]` is the script path when
  nothing is passed; a path-shaped accidental value through `rmSync` is a
  deleted source file. Parse flags; refuse shape-checks as a substitute.
- **Unchecked exits are verification theater.** A success line after a failed
  subprocess is worse than no line — it closes the question. The same class as
  the machines wallpaper defect (link string read, target never tested).

## Observations

### The renderer
- `renderDocument` at width 80 through the compositor path: 3.5KB ANSI for a
  44-line specimen, clean SGR, no OSC surprises in a pipe.
- The mermaid render inside the panel cell is legible at thumbnail size — the
  28-char label budget holds at 14px.

### The knowledge system
- Gate upkeep arrived mid-session: `ref-census` demanded its own rules
  (expired review date → reviewed and re-dated; gone branch → declaration
  dropped). The census policing its author's table is the system working.

## Metrics

- **`just check`:** 26/26 gates green after the wrap-up (incl. `contrast`,
  `verdict`, `lightcard`, `amp-briefs` after the brief archived).
- **Panel build:** nine cells ≈ 8s wall (chromium dominates); montage instant.

## Related

- Brief: `.archive/briefs/2026-11-15-brief-rung-panel.md` (BRF-RUNG-PANEL, done)
- Companion: `docs/2026-10-28-the-ground-you-read-on.md` (the arithmetic this
  panel puts an eyeball on)
- Kin: machines `docs/theme-application.md` (the pair pin's delivery map)