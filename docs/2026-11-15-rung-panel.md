# The rung panel — one document, nine grounds

**Created:** 2026-11-15
**Contract:** [`briefs/2026-11-15-brief-rung-panel.md`](../briefs/2026-11-15-brief-rung-panel.md) (BRF-RUNG-PANEL)
**Derived from:** `scripts/contrast.ts` `PAIRS` by `scripts/surface-panel.ts` — the script is the source, the PNG is derived (`just`-less: `bun scripts/surface-panel.ts`)
**Companion:** [`docs/2026-10-28-the-ground-you-read-on.md`](2026-10-28-the-ground-you-read-on.md) — the arithmetic; this page is the eyeball on it.

![the rung panel](2026-11-15-rung-panel.png)

The same specimen — heading, ladder, loose list, diagram, table, and the
contrast function — rendered **once** by okuda (the ink is absolute; the pair
is the terminal's default fg/bg) and painted onto each of the nine admissible
grounds. **Rung 7 is refused and excluded** ("reads as emitted light"). The
pair is the only variable: whatever differs between two cells is the pair.

## How the grid is laid

Row-major, ladder order:

| row | rungs | what the row holds |
|---|---|---|
| top | 0, 1, 2 | the control ground, the ink ladder — prose dims, structure does not move |
| middle | 3, 4, 5 | the evening ink (3), then the cool grounds deepen (4, 5) |
| bottom | 6, 8, 9 | the warm walk — ground deepens at held ink, contrast *rises* |

## The axes, measured

`prose` — ink:ground contrast (WCAG). `L_bg` — OKLCH lightness of the ground
(the comfort axis). `rules` — the `muted` role against the ground (the pipes
and table rules). `share` — rules ÷ prose; above 1.00 a rule out-shouts what
it divides.

| rung | ground | ink | prose | L_bg | rules | share |
|---|---|---|---|---|---|---|
| 0 | `#282c34` | `#ffffff` | 14.0:1 | 0.293 | 1.82 | 0.13 |
| 1 | `#282c34` | `#dcdfe4` | 10.5:1 | 0.293 | 1.82 | 0.17 |
| 2 | `#282c34` | `#cfd3d8` | 9.3:1 | 0.293 | 1.82 | 0.20 |
| 3 | `#282c34` | `#b8bcc2` | 7.3:1 | 0.293 | 1.82 | 0.25 |
| 4 | `#23272e` | `#c8ccd4` | 9.3:1 | 0.272 | 1.95 | 0.21 |
| 5 | `#1b1e24` | `#a9aeb8` | 7.5:1 | 0.235 | 2.18 | 0.29 |
| 6 | `#262320` | `#d6cfc4` | 10.1:1 | 0.258 | 2.04 | 0.20 |
| **8** | `#221f1c` | `#d6cfc4` | **10.6:1** | **0.242** | **2.14** | **0.20** |
| 9 | `#1c1a17` | `#d6cfc4` | 11.2:1 | 0.219 | 2.26 | 0.20 |

## The dimensions that are significant — the opinion

What the grid actually varies, in order of how much it buys:

1. **Ground L (the comfort axis).** The one variable the first reader's
   verdicts tracked: 0.293 glared (rung 7 at 0.347 read as *emitted light*),
   0.24–0.26 reads as absence. The ink ladder (top row) never touches it —
   and every top-row cell was rejected as "too dim" while every bottom-row
   cell passed. **The ground is the lever, never lift it.**
2. **Ground hue.** Cool (`#282c34`, blue) vs warm (`#262320`→`#1c1a17`,
   brown-black). The ink `#d6cfc4` is warm (H≈79); a cool ground sits *under*
   it, a warm ground *with* it — rungs 6/8/9 look softer than 4/5 at equal
   depth, and the only remaining okuda variable (`muted`'s cool 249°) shows
   as a faint blue cast in the pipes on warm grounds.
3. **Muted structure.** The pipes and table rules (`#445566`) ride every
   ground at 1.82→2.26: they *gain* contrast as the ground deepens — the
   structure gets louder exactly when the prose does. Visible in the grid:
   the table and ladder pipes sharpen cell by cell down the warm walk.
4. **Accents vs prose (the inversion axis).** `just surface --gate`'s
   finding: on rung 3 three roles invert (out-rank the ink), rung 4 one,
   rung 5 twelve — amber hotter than headings is the *blown out* signature.
   The grid shows it as accents that pop harder than the paragraph they
   annotate.
5. **Ink L.** Real but secondary past the floor: 0.75 (rung 5) reads evening,
   1.00 (control) reads harsh. Held at 0.857 in the reference, deliberately.
6. **The cursor** is the one pin the grid cannot show: `bright_foreground`
   is spent twice (cursor and slot 15) and takes the ink — a static image
   has no cursor. Named here so its absence in the cells is a stated
   exclusion, not an oversight (`ADR-LEGIBILITY-SURFACE-090`).

The ratio is the **floor**, L is the **comfort**, hue and structure are the
**character**. The grid exists so those four can be judged by eye in one
glance instead of one arithmetic at a time.