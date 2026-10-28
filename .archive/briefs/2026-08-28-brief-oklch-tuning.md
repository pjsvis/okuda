---
type: Brief
callsign: BRF-OKLCH-TUNING
---

# brief: OKLCH Palette Lightness Tuning & Dynamic ANSI Scaling

**Created:** 2026-08-28
**Status:** rejected 2026-10-28 — archived. Absolute luminance is the glass's to
set, not the renderer's: `ADR-GLASS-INK-073` (which also rejects its sibling
`BRF-PALETTE-LIGHTNESS`, and says why the two contradicted each other for two
months). The OKLCH analysis in `docs/2026-09-05-palette-page.md` survives for
tuning *relative* luminance within the palette; what it may not be used for is a
page-level dial. Kept, per the keep-class: what was refused is the expensive
thing to re-decide.

## What
Implements a single global brightness scalar over a strictly fixed OKLCH palette reference, mathematically deriving 24-bit TrueColor ANSI escape sequences and hex codes at runtime without introducing theme customization or hue distortion.

## Why
Ensures consistent visual contrast and legibility across varying physical environments (e.g., bright sunlight on a tablet versus a dark datacenter or night operations) while preserving the non-negotiable invariant of a fixed, canonical palette and zero theme configuration bloat.

## How
- Define the canonical LCARS/Okuda palette as immutable base `{ l, c, h }` triples in `src/colors.ts`.
- Expose an in-memory brightness scalar $\alpha \in [0.2, 1.2]$ (default: `1.0`).
- Implement a pure, dependency-free conversion pipeline:
  $$\text{Scaled OKLCH } (L \cdot \alpha, C, H) \longrightarrow \text{Linear sRGB} \longrightarrow \text{sRGB [0–255]} \longrightarrow \text{ANSI TrueColor} \ (\verb|\x1b[38;2;R;G;Bm|)$$
- Bind discrete keyboard controls (e.g., `+` / `-` or `[` / `]`) to increment/decrement $\alpha$ in fixed 5% steps and trigger an immediate frame rerender.
- Optionally read an initial scalar override from an environment variable (`OKUDA_BRIGHTNESS`) on startup.

## Acceptance criteria
- The palette remains completely fixed; no user-defined custom colors, arbitrary palettes, or CSS-style theme files are supported.
- Adjusting brightness preserves perceptual hue and chromatic balance across all palette tokens (no mudding of ambers, no pink blowout of alert reds).
- Gamut mapping safely clamps RGB outputs to $[0, 255]$ without runtime errors or visual artifacts.
- Adjusting the brightness knob triggers a sub-millisecond rerender of the active Okuda frame without flicker.

## Out of scope
- Arbitrary theme engines, custom user stylesheets, or alternate color schemes.
- Automatic ambient light sensor integration via OS daemons.
- 16-color / 256-color indexed ANSI fallback (TrueColor 24-bit output remains the baseline requirement).