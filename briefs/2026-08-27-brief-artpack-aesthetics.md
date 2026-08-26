# brief: Plundered artpack aesthetics & high-SNR dark terminal rendering

**Created:** 2026-08-26
**TD:** td-00844
**Status:** draft

## What
Define a visual specification and rendering pass for Okuda that fuses 1990s ANSI artpack primitives (CP437 block dithering, high-density shading) with a 2026 protocol ceiling (24-bit TrueColor, Mode 2026 sync), locked exclusively to an ultra-high-contrast dark theme with a binary 7-bit ASCII fallback.

## Why
Light themes and intermediate 16/256-color paletting degrade signal-to-noise ratio and bloat rendering logic. Stealing the best raster-in-text tricks from the demoscene maximizes telemetry density on dark terminals while maintaining zero maintenance overhead.

## How
Implement an opinionated, two-tier visual pipeline:
- **The Ceiling (Rich Dark):** 
  - Shading & Depth: Map CP437 dithering blocks (`░`, `▒`, `▓`, `█`) via UTF-8 for gradients, backdrops, and card depth.
  - Telemetry Density: 1/8th vertical/horizontal fractional blocks and 2x4 Braille matrices (`U+2800`–`U+28FF`).
  - Color Tokens: Enforce a fixed, high-SNR dark palette (deep zinc/true-black canvas `#09090b`, muted structural borders `#27272a`, high-voltage phosphor accents: emerald `#10b981`, amber `#f59e0b`, cyan `#06b6d4`, crimson `#ef4444`).
  - Delivery: Atomic Synchronized Output (`CSI ? 2026 h/l`).
- **The Floor (Plain Facts):** 
  - Binary degradation triggered by `TERM=dumb`, `NO_COLOR=1`, or non-PTY pipes.
  - Strip all SGR sequences. Dither blocks collapse to spaces, gauges convert to `[###---]`, and sparklines reduce to raw comma-separated values.

## Acceptance criteria
- [ ] Visual palette renders identically across Ghostty, Alacritty, iTerm2, and Windows Terminal.
- [ ] No light theme or 16-color degradation paths exist in the codebase.
- [ ] Shading ramps and gauge primitives render sub-character precision without glyph clipping.
- [ ] Plain-text fallback emits clean, machine-parseable standard 7-bit ASCII when piped to stdout.

## Out of scope
- Light theme support or dynamic OS theme detection.
- Extended Nerd Font glyph requirements.
- 16/256-color intermediate palette quantizing.