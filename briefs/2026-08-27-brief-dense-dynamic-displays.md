# brief: Dense terminal visual primitives for dynamic telemetry

**Created:** 2026-08-26
**TD:** td-00843
**Status:** draft

## What
Catalog, benchmark, and standardize high-density Unicode/ASCII glyph sets and ANSI attribute strategies for rendering sparklines, gauges, progress indicators, and status matrices inside the Okuda layout engine.

## Why
Dynamic dashboards require high information density without full-blown graphics protocols (Sixel/Kitty). Standardizing compact glyph primitives allows the server to stream sub-character resolution telemetry while maintaining cross-emulator font stability.

## How
Investigate and classify glyph families across target emulators (Alacritty, iTerm2, Ghostty, Windows Terminal):
- **Vertical/Horizontal Resolution:** Map 1/8th block elements (Unicode `U+2581`–`U+2588` for sparklines, `U+258F`–`U+2588` for horizontal bars).
- **Sub-Cell Coordinate Grids:** Evaluate 2x4 Braille patterns (`U+2800`–`U+28FF`) and 2x2 quadrant blocks (`U+2596`–`U+259F`) for dense trend-line plotting.
- **Palette Shifting:** Use SGR foreground/background transitions to simulate continuous gradient fills on coarse characters (`░`, `▒`, `▓`, `█`).
- **Semantic Status Symbols:** Define single-cell status glyphs with universal fallback alternatives (e.g., `●`/`○`, `▲`/`▼`, `✓`/`✗`).
- **Font Degradation Matrix:** Document baseline font fallbacks (Apple SF Mono, JetBrains Mono, Consolas) to detect alignment or half-width/full-width clipping bugs.

## Acceptance criteria
- [ ] Catalog of validated glyph sets with sub-character resolution formulas documented.
- [ ] Verification table scoring visual consistency and width integrity across top terminal fonts.
- [ ] Fallback mapping implemented for plain 7-bit ASCII environments (e.g., fallback `_.-~*#` sparklines).
- [ ] Zero reliance on external pixel-graphics protocols or client-side font extensions.

## Out of scope
- Terminal pixel/canvas graphics (Kitty image protocol, Sixel, iTerm inline images).
- Dynamic SVG or vector rasterization on the server.
- Mouse-interactive charting widgets.