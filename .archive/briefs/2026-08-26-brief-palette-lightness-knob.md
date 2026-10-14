---
type: Brief
callsign: BRF-PALETTE-LIGHTNESS
---

# Brief: Palette Lightness Knob — Global Brightness, Hue Preserved (parked)

**Date:** 2026-08-26
**Status:** rejected — dropped 2026-10-14 (was parked) — gated on a real cross-terminal brightness itch

## Gate

the same document rendering pleasantly on one terminal and too bright (or too dim) on another, in regular use — e.g. the iPad's OLED against the Mac's LCD, or day/night ambient shifts. If per-role hex tweaks keep satisfying every complaint, this brief stays parked.

## What (when unparked)

A single parameter that scales the brightness of the whole palette while
preserving every hue and the entire relative hierarchy. Two designs were
considered:

1. **Load-time HSL scaling (recommended).** Palette files stay hex (ground
   truth, hand-tuned); at load, `palette.ts` converts each role
   hex → HSL → `L × k` → hex, with `k` from `--lightness <k>` (or
   `OKUDA_LIGHTNESS`), default `k = 1.0` → **byte-identical output to
   today** (the default must be a no-op, testable). H and S untouched, so
   hue families survive; the census hierarchy (heading > strong >
   emphasis/key > link-text > URL > muted) compresses or stretches
   uniformly, never inverts.
2. **Parametric palette files (rejected).** Storing HSL per role in the
   JSON is a format change across every palette + the loader + all tests,
   and it buys nothing the hex-plus-scale design doesn't already give:
   hexes remain the authored ground truth; `k` is a *view* parameter, not
   a data migration.

**The trap to avoid (recorded for the implementer):** the naive
implementation — multiplying RGB channels by `k` — drifts hue: ambers go
muddy faster than blues go navy, and the hue-per-role map
(chrome-playbook census) silently rots. Scale lightness in HSL (or OkLab
if more uniformity is needed), never RGB. Near `k = 1` HSL is adequate.

## Why park it

"Tad bright in places" was a *places* problem — specific roles at wrong
luminance — and a global knob is the wrong tool for places: it dims the
already-quiet roles (URLs at 27% luminance) along with the offenders,
destroying the hierarchy the census built. Places get hex surgery
(one commit, `#ffcc66 → #e0b45c`, 65.4 → 49.3 luminance). The knob's
real job is *terminal gamma variance* — the same hex reading differently
on different displays — which is a real but not-yet-itching need.

## Out of scope

- Per-role brightness overrides (that's just hex editing — the old way,
  which remains the tool for "places").
- Auto-brightness / ambient sensing, background daemons, anything that
  runs without the reader running.
- TUI-mode-only vs streaming parity questions — `k` applies in
  `loadPalette`, so every consumer inherits it identically.
