# Brief: Omarchy Dual-Dataset Lookup Table (LUT) Rendering Engine

**Date:** 2026-10-23 **Status:** Open

---

## Context

Current terminal interfaces and custom desktops either subject users to zero-discovery black boxes or heavy, uncalibrated UI frameworks that sacrifice performance on window resize. To implement a deterministic, Okuda-styled shared-cognition interface for Omarchy, we need a high-performance rendering engine that decouples data analysis from pixel/cell presentation, avoiding dynamic math overhead on every `SIGWINCH` event.

## Objective

Implement a pure-function, O(1) lookup table (LUT) rendering pipeline in Gloam that maps dual-dataset telemetry (scalar magnitude and structural texture) directly to Unicode character primitives without runtime calculation overhead.

## Evidence

- Dynamic statistical calculations (`median`, `std_dev`) and floating-point fractional arithmetic during terminal resizes cause UI jitter and high CPU overhead.  
- Quantizing terminal cell widths (e.g., max width 10 cells \$\\times\$ 8 sub-character steps \= 81 discrete states) allows pre-compiled string arrays to handle rendering instantly.

## Scope

**In:**

- Pre-computed Magnitude LUT using 1/8th horizontal block elements (`▏` through `█`).  
- Pre-computed Texture LUT using Braille density matrices (`U+2800` to `U+28FF`).  
- Two-phase Figure-Ground classification (computed once upon data ingestion, cached for presentation).  
- O(1) terminal resize rendering loop.

**Out:**

- Kitty terminal graphics protocol or external pixel-based rendering engines.  
- Dynamic color themes or heavy font-dependent dependencies.

## Preconditions

- [ ] Gloam markdown and terminal viewport engine is accessible.  
- [ ] Unicode UTF-8 character rendering support verified in the terminal environment.

## Work Plan

- [ ] Implement the magnitude LUT generator mapping 0–100% metrics to 1/8th block element strings.  
- [ ] Implement the texture LUT generator mapping normalized secondary metrics to Braille density glyphs.  
- [ ] Separate data ingestion analysis from display rendering so figure-ground baselines are pre-calculated.  
- [ ] Wire the O(1) lookup calls into the Gloam viewport resize handler (`SIGWINCH`).  
- [ ] Smoke-test using dogfood datasets ranging from nominal states to critical failure thresholds.

## Acceptance Criteria

* Terminal window resizing triggers zero runtime math or division operations for bar charts and textures.  
* Magnitude and texture channels render cleanly in parallel using pure O(1) array lookups.  
* Okuda-styled structural borders and visual alignment remain perfectly stable across viewport changes.

## Notes

Constraints: Keep the memory footprint negligible and adhere strictly to the Okuda restful aesthetic (muted tones, structured geometry, zero flashing neon).