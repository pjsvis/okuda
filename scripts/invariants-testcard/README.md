# OPTICAL INSTRUMENT CONFORMANCE // SYSTEM INVARIANTS & AUDIT PROTOCOL

**Directory:** `scripts/invariants-testcard/`
**Deliverables:** `invariants-test-card.md`, `tty-audit.sh`
**Architecture Target:** `gloam` | `libghostty` | `herdr-app` | `rex`

## 1. The Operational Thesis: Why This Process Exists

As the terminal transitions from a single-stream human shell into a multi-agent cognitive workspace, a quiet architectural regression is underway. "Terminal-to-app" wrappers are importing the worst habits of the modern web stack: collapsing the **physical display surface** and the **semantic application payload** into static, coupled "theme" blobs.

A terminal is not a web page; it is an **optical instrument**. 

* **The Ground** (background luminance, ambient polarity, minimum perceptual contrast floor $\Delta L^*$) is a **physiological calibration** between the human operator's retina, their monitor, and the ambient light in their physical room.
* **The Figure** (glyphs, structural weight, sub-cell telemetry) is a **symbolic projection** emitted by a CLI process or coding agent.

When application wrappers bundle figure-ground contrast inside aesthetic themes—or strip out global GPU shader contrast clamps so the terminal viewport matches custom sidebar chrome—they destroy an essential global control. The operator can no longer flip polarity when daylight hits the desk or clamp muddy 24-bit RGB hex codes into legibility without rewriting twenty configuration files.

This directory contains the conformance artifacts designed to audit both sides of the PTY boundary: ensuring that **Gloam** emits strictly orthogonal, width-deterministic streams, and exposing whether host multiplexers (**Ghostty**, **Herdr**, **Rex**) respect the underlying optical invariants.

## 2. The Deliverables

The audit suite is split into two distinct probes inside `scripts/invariants-testcard/` to isolate compositor behavior from raw host GPU rendering:

* **`invariants-test-card.md` (The Compositor & Stream Probe):** A restricted-grammar Markdown artifact piped through `gloam`. It validates how the Gloam compositor injects structural hierarchy, preserves whitespace across Unicode sub-cell instruments (1/8th fractional blocks, Braille $2 \times 4$ dot matrices, and sparklines), calls out to the external SpaceX Mermaid topology binary, and enforces deterministic right-edge elision at column 80 instead of soft-wrapping into vertical noise.
* **`tty-audit.sh` (The Raw Host Shader Probe):** A zero-dependency POSIX shell script that bypasses Markdown parsers entirely. Wrapped in DEC Private Mode 2026 (`\x1b[?2026h` ... `\x1b[?2026l`) for atomic vertical-blank frame swapping, it emits intentional 24-bit TrueColor low-contrast traps (`#242424` and `#EBEBEB`) and a strict Column 51 sprite-registration ruler directly to the host terminal's GPU shader.

## 3. The Four System Invariants

Every test in `scripts/invariants-testcard/` measures compliance against four non-negotiable system boundaries:

| Invariant | Boundary Owner | Operational Definition |
|---|---|---|
| **I1. Figure-Ground Orthogonality** | Host Surface | Default Foreground (`SGR 39`), Default Background (`SGR 49`), and Contrast Gain are global hardware/shader knobs independent of chromatic palettes. |
| **I2. Perceptual Contrast Floor** | Host GPU Shader | The host renderer must enforce a minimum luminance delta ($\Delta L^*$) in the final fragment pass, clamping illegible stream colors away from the canvas. |
| **I3. Relative Semantic Transforms** | Byte Stream (`gloam`) | Streams express hierarchy via structural SGR transforms (`1m` bold, `2m` dim, `7m` reverse video) and relative palette indices, remaining agnostic to canvas polarity. |
| **I4. Monospace Cell Isomorphism** | Both (`wcwidth` + Atlas) | Box drawing (`U+2500–U+257F`), block elements (`U+2580–U+259F`), and Braille (`U+2800–U+28FF`) must occupy exact integer cell metrics with zero font-fallback drift. |

## 4. Execution Process: Smoke Test & Dogfood Loop

Run both probes across every target terminal surface (`Ghostty`, `herdr-app`, and any candidate multiplexer) under two environmental conditions: **Dark Well** (low-luminance ground) and **Daylight Paper** (high-luminance ground).

1. **Probe the Host Shader Directly:** Execute `sh scripts/invariants-testcard/tty-audit.sh`. Verify whether both `[I2]` hex trap lines remain readable. Flip the terminal's global background polarity and re-verify without touching any CLI flags.
2. **Inspect the Column 51 Sprite Line:** On the `tty-audit.sh` output, sight down the right-hand `│<-Col 51` vertical spine across the 1/8th gauge, sparkline, Braille matrix, and box-drawing rows. Any horizontal tooth or 1px hairline seam indicates broken glyph-atlas synthesis.
3. **Pipe the Markdown Artifact Through Gloam:** Execute `cat scripts/invariants-testcard/invariants-test-card.md | gloam`. Verify that the leading `▍` vertical spines stay locked to column 1, internal instrument spacing survives the Markdown compositor, and the Mermaid diagram renders cleanly.
4. **Stress the Elision Boundary (`SIGWINCH`):** Drag-narrow the Herdr or Ghostty pane below 80 columns while viewing the Gloam output. Confirm that `BUS-80` and the instrument rows trigger clean right-edge elision marks rather than reflowing into multi-line wrap corruption.

## 5. Boundary Conditions & Failure Modes

When a terminal app or CLI tool violates the four invariants during the audit, the breakdown manifests in one of four diagnostic failure modes:

* **Failure Mode A: The Solarized Daylight Collapse (Violates I1)**
  * *Mechanism:* The host application couples canvas luminance (`bg`/`fg`) to a static theme file that also styles GUI tabs and sidebars.
  * *Symptom:* The operator cannot invert polarity or boost background contrast for daylight reading without breaking application chrome or manually editing per-tool config files.
* **Failure Mode B: The Hardcoded Hex Blindspot (Violates I2 & I3)**
  * *Mechanism:* A CLI emits fixed 24-bit RGB sequences assuming a dark canvas, and the host wrapper omits or disables `libghostty`'s `minimum-contrast` shader clamp.
  * *Symptom:* In `tty-audit.sh`, the `#242424` Dark-Trap vanishes on dark canvases and the `#EBEBEB` Lite-Trap vanishes on light canvases ($\Delta L^* \to 0$).
* **Failure Mode C: Chrome-to-Canvas Bleed (Host Wrapper Overreach)**
  * *Mechanism:* To look like a unified web app, the multiplexer forces the terminal viewport background to match low-contrast GUI sidebar chrome.
  * *Symptom:* Loss of the high-contrast optical well; dimmed telemetry (`SGR 2`) and subtle Braille dither textures (`░▒▓`) wash out into the window frame.
* **Failure Mode D: Glyph Atlas Fracturing (Violates I4)**
  * *Mechanism:* The host delegates Unicode block/Braille rendering to OS font-fallback chains (CoreText/HarfBuzz) instead of synthesizing geometric sprites directly in the GPU glyph atlas, or fails to support DEC Mode 2026 synchronized updates.
  * *Symptom:* The `Col 51` vertical marker in `tty-audit.sh` zig-zags left and right across rows, `█▀█▄` horizon blocks show horizontal gaps, and window resizing tears the frame.

## 6. Narrativised Bibliography & Intellectual Priors

The architectural stance behind Gloam and this conformance suite draws from five intersecting lineages that rarely speak to one another: psychophysical perception, high-density statistical typography, fictional flight-deck telemetry, fossilized terminal standards, and modern GPU-instanced systems programming.

**On Figure-Ground Perception & Optical Contrast:**
The foundational understanding that a symbol cannot be evaluated independently of its ground belongs to **Edgar Rubin’s *Synsoplevede Figurer* (1915)** and the broader Gestalt psychophysics tradition, later quantified into perceptual lightness ($L^*$) by the **CIE 1976 ($L^*a^*b^*$) color space** and modern **APCA (Accessible Perceptual Contrast Algorithm)** research by Andrew Somers. Unlike naive web RGB math, perceptual psychophysics proves that human contrast sensitivity is non-linear and governed by spatial frequency—meaning thin monospace strokes and $2 \times 4$ Braille dots require strict luminance floor clamping ($\Delta L^*$) controlled at the display surface, not hardcoded in application payloads.

**On High-Density Telemetry & The War on Chartjunk:**
Everything in the Gloam instrument grammar—asymmetric left-spine framing (`▍`), inline word-sized sparklines, and the abolition of four-sided "box prisons"—is a direct translation of **Edward Tufte’s *The Visual Display of Quantitative Information* (1983)** and ***Beautiful Evidence* (2006)** into a fixed character grid. Complementing Tufte is **Stephen Few’s *Information Dashboard Design* (2006)**, which introduced the **Bullet Graph**: packing a primary metric, a qualitative background range (`░▒▓`), and a comparative threshold tick (`┼`) into a single horizontal bar designed for peripheral situational awareness.

**On Deterministic Flight-Deck Panels (Okudagrams):**
The term *Okudagram* honors scenic art supervisor **Michael Okuda**, whose LCARS interface panels for *Star Trek: The Next Generation* (documented in the ***Star Trek: The Next Generation Technical Manual*, 1991**, with Rick Sternbach) rejected overlapping desktop windows and scrollbars. Okuda proved that high-contrast, fixed-geometry status panels using pill-shaped reverse-video headers (`SGR 7`) allow operators to parse complex multi-system state in a single ocular saccade.

**On Terminal Standards & Sub-Cell Unicode Hacks:**
The ironclad stability of the character stream rests on **ECMA-48 / ISO/IEC 6429** (control functions and SGR parameters) and the **DEC VT100/VT520 specification lineage**, culminating in **DEC Private Mode 2026** for tear-free synchronized frame output. The "neckbeard guild secrets" of sub-cell terminal plotting trace back to section 32 of the **Unicode Standard** (`U+2580–U+259F` Block Elements and `U+2800–U+28FF` Braille Patterns), pioneered in the wild by **asciimoo’s `drawille`** library, refined into statistical histograms by **Tammo Ippen’s `plotille`**, and pushed to maximum aesthetic density by **aristocratos in `btop++`**.

**On Modern GPU Terminal Substrates & Fleet Multiplexing:**
Finally, the recognition that the terminal is a pure-function GPU cell matrix rather than a browser DOM is anchored by **Mitchell Hashimoto’s `libghostty` / Ghostty architecture (2024–2026)** and **Rex**, which enforces shader-level minimum-contrast clamping and native GPU sprite synthesis for box/Braille glyphs, alongside **Can Celik’s `herdr-core` / `herdr-app`**, which turns that deterministic `libghostty` grid into a horizontally observable orchestration plane for asynchronous coding agents.