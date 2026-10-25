# Brief: Dual-dataset lookup tables for the Gloam telemetry surface

**Date:** 2026-10-23
**Revised:** 2026-10-25 — rewritten against the measurements in `ADR-PANE-NOT-CANVAS-069`
and the resize work in `ADR-RESIZE-GEOMETRY-046` / `ADR-WIDENING-LAG-054`. The
earlier draft asserted a performance cause that does not survive measurement;
the section *What would settle the ordering* replaces it.
**Status:** Open

## Boundary

A **Gloam/Omarchy** brief. It describes a compositor — a party that *writes*
telemetry — filed in this silo as related reading. It is not okuda's work queue,
and no okuda ADR should cite it as authority.

okuda's entire obligation to it is one property: the glyphs it emits must measure
what the author intended. That is verified and pinned (§Preconditions).

## Context

The silo's telemetry surfaces — status islands, `&alpha`, `&stack` — are
generated as markdown by scripts and rendered by okuda. Their content is
*quantitative*: a magnitude channel (0–100%) and a texture channel (a normalised
secondary metric). The available glyph vocabularies are dense and exact:

| channel | vocabulary | states |
|---|---|---|
| magnitude | 1/8th block elements, `▏▎▍▌▋▊▉█` (U+258F…U+2588) | 10 cells × 8 eighths + 1 = **81** |
| texture | Braille density, U+2800–U+28FF (2×4 dot matrix) | **256** |

Both are drawn from the terminal's own font, need no graphics protocol, and cost
one cell each. What a generator needs is a deterministic map from a measurement
to a glyph, and that is all this brief proposes to build.

## The claim, stated so it can be wrong

**O(1) quantisation, O(cells) emission.**

A lookup table turns the *quantisation* step — measurement → glyph — into an
array index, removing per-cell division and string assembly from the hot loop.
It does **not** make rendering O(1): every cell must still be emitted, and the
terminal still writes each one. The earlier draft's headline ("O(1) terminal
rendering engine", "instantaneous O(1) memory fetch") promised a complexity
result the design cannot deliver. The per-cell property is real and worth
having; the rendering-complexity property is not, and stating it invites a
counter-argument that misses the point.

## Why a table at all — the argument the earlier draft missed

Not speed. **Enumerability.**

81 magnitude states and 256 texture states are a *finite, nameable set*, and a
finite set can be asserted exhaustively: every state's glyph, its display width,
and its monotonicity against the measurement it represents. Arithmetic over a
float cannot be tested that way — it can only be sampled.

A lookup table converts "do the bars look right?" into "do all 337 states hold
their contract?", which is a test that either passes or fails rather than a
judgement that drifts. That is the reason to build it, and it survives even if
the arithmetic turns out to be free.

## Evidence: what a render actually costs

Measured on the macOS box, `renderDocument`, three warm runs averaged:

| surface | at 80 cols | at 200 cols |
|---|---|---|
| 120 paragraphs of prose (wrap, measure, emit — the arithmetic a LUT replaces) | 4.5 ms | 3.8 ms |
| the twelve-diagram fixture (same arithmetic + 12 subprocess spawns) | 65 ms | 53 ms |

Read: the arithmetic is **~4 ms** of a render; diagram fences are ~92% subprocess
spawn. And the resize cost this brief was written about has already been
diagnosed and fixed elsewhere, structurally rather than algebraically — `src/tui.ts`
records *"fifteen rapid resizes produced 39 renders and 1.15 s of CPU on a
400-line document (~77 ms per event)"*, and the fix was **coalescing** (one
render in flight, latest wins) plus geometry gating for height-only resizes.

A third possibility the earlier draft did not consider: some of the "jitter on
resize" reported before 2026-10-25 was not latency at all but **discontinuity** —
the pane's width reached the diagram layout, so resizing made whole blocks appear
and vanish (`ADR-PANE-NOT-CANVAS-069`). A faster table would not have touched it.

## What would settle the ordering

One measurement, before the generator is written. Take the actual target surface
— Gloam telemetry, glyphs and prose, no diagram fences — and attribute a render's
time across three terms: subprocess spawn, emission, arithmetic.

- **If the surface spawns nothing per frame**, the arithmetic is the whole cost
  and the table is the right instrument.
- **If it spawns anything**, the table optimises the minor term and the ordering
  is wrong.

Prediction, offered so it can be refuted: on a spawn-free surface the render is
single-digit milliseconds and no jitter reproduces after coalescing.

## Scope

**In**

- A magnitude LUT: 0–100% → 1/8th-block string, one glyph per cell.
- A texture LUT: normalised secondary metric → Braille density glyph.
- Figure/ground classification computed **once at ingestion**, cached for
  presentation — the two-dataset split is the point, not an optimisation.
- An exhaustive state assertion (337 states), not a sample.

**Out**

- Any graphics protocol (Kitty, sixel, pixel surfaces).
- Font-dependent or colour-dependent behaviour. The two channels must be legible
  with the terminal's own colours and no extras.
- Drawing anything okuda already draws. Borders, rules, headings and tables are
  the renderer's; a telemetry generator emits data, not frames.

## Preconditions

- [ ] **The glyph width contract holds.** Verified 2026-10-25: all 32 codepoints
      of U+2580–U+259F and all 256 of U+2800–U+28FF measure exactly **1 column**
      in `src/width.ts`. Pinned by a test in that file's suite, so a terminal or
      profile change that makes them ambiguous fails visibly rather than
      silently skewing every bar.
- [ ] A generator that can write markdown to a file or stdout. The filesystem is
      the message bus; okuda needs no API and no notification.

## Work plan

- [ ] Enumerate the 81 magnitude states; assert the glyph and its width.
- [ ] Enumerate the 256 texture states; assert the glyph and its width.
- [ ] Assert monotonicity: state *n* must never be lighter than state *n−1*.
- [ ] Compute figure/ground once at ingestion; carry it as data, not as a
      decision taken at paint time.
- [ ] Emit the surface as markdown; render through okuda at 40/80/160 columns and
      confirm the bars are identical at every width.
- [ ] Only then: wire the generator into the frame path, and measure the
      attribution above rather than assuming it.

## Acceptance criteria

- Every one of the 337 states has a glyph, a width of 1, and a monotone
  measurement ordering — asserted exhaustively, not sampled.
- The same measurement produces the same glyph at 40, 80 and 160 columns. A bar
  that changes with the pane is a bar that is not a measurement.
- Rendering the surface performs no division and no string assembly per cell.
  (This is the per-cell claim; it is not a claim about total render cost.)
- Attribution measured and recorded: spawn / emit / arithmetic, on the real
  surface, before any performance claim is made in a commit message.

## Notes

Keep the footprint negligible; a table of 337 short strings is a few kilobytes and
should stay that way. Restful aesthetic: muted tones, stable geometry, no flashing,
no animation. If a measurement cannot be represented in 8 steps, it needs a bigger
cell, not a smarter glyph.
