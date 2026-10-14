---
type: Brief
callsign: BRF-TERMINAL-CELL-GRID
---

# Brief: 2D Terminal Cell Grid Architecture (parked)

**Date:** 2026-09-30
**Status:** rejected — dropped 2026-10-14 (was parked) — gated on a real per-cell consumer

## Gate

a TUI feature that claims one cell for two producers (overlap / z-order — a dialog floating over scrolled content), a structural non-string callback contract from Bun.markdown, or a measured byte-budget ceiling on a slow link. None exists today; see *Why parked* below.

---

## Objective

Decouple Markdown layout calculation from ANSI escape code generation by introducing an in-memory 2D character-cell grid buffer as Gloam's single source of truth for rendering.

## Scope

**In:**

* Implement a 2D memory-mapped cell grid data structure (`TerminalBuffer`) backed by flat TypedArrays (codepoint, fg, bg, style attributes).
* Port layout drawing routines (boxes, borders, wrapped restricted-grammar text blocks) to write directly to discrete integer coordinates $(x, y)$ in the grid.
* Implement a sequential top-to-bottom scan serializer that translates the grid into a minimal, self-closing ANSI byte stream targeting `Bun.stdout`.
* Add basic wide-character (`wcwidth`) handling to ensure CJK and emojis correctly occupy two visual grid cells without coordinate drift.
* Snapshot testing harness that asserts raw line strings directly from grid rows without parsing ANSI codes.

**Out:**

* Differential double-buffer scanning / dirty-cell cursor addressing (rendering remains a single top-to-bottom flush per pass).
* Desktop window compositing, GPUI, or DOM/CSS-style flexible constraint solvers.
* Mouse event capture or bi-directional TUI cursor input protocols.

## Preconditions

* [ ] Existing smoke tests and dogfood test suites pass against the current baseline renderer.
* [ ] Terminal dimensions (columns/rows) are resolvable via `process.stdout.columns` / `process.stdout.rows` with a deterministic fallback (e.g., 80×24).
* [ ] Restricted-grammar AST parser output is cleanly separated from string emission points.

## Work Plan

1. [ ] Implement `TerminalBuffer` with flat typed storage for `codepoints`, `fg`, `bg`, and `styles`, with boundary clamping on `setCell(x, y, char, fg, bg, style)`.
2. [ ] Integrate a compact `wcwidth` lookup to advance columns by 2 for wide glyphs and flag the trailing cell as a non-rendering continuation cell.
3. [ ] Build the layout primitives (`drawBox`, `drawText`, `drawHorizontalRule`) that write integer cells into the `TerminalBuffer`.
4. [ ] Refactor the restricted-grammar Markdown layout engine to target the `TerminalBuffer` instead of concatenating escape-laden strings.
5. [ ] Implement the `serializeToAnsi(buffer)` pipeline: scans rows sequentially, emits style-change escape codes only on attribute shifts, emits explicit resets at line boundaries, and writes the chunk to `Bun.stdout`.
6. [ ] Replace fuzzy regex output tests with deterministic line-level grid assertions (`buffer.getLine(y)`).
7. [ ] Run smoke and dogfood test suites to verify visual parity and zero trailing ANSI state leaks.

## Acceptance Criteria

* `TerminalBuffer` rejects out-of-bounds coordinate writes without throwing exceptions or corrupting memory.
* Double-width characters occupy exactly two horizontal buffer indices without shifting subsequent layout coordinates.
* Serializer emits zero consecutive redundant ANSI style sequences for cells sharing identical attributes.
* All terminal styles (color, bold, dim, underline) are explicitly closed at the end of each rendered line; no style state leaks into the host shell prompt upon exit.
* Smoke tests assert expected layout using raw text extracted from grid rows without stripping or parsing escape sequences.
* All existing dogfood test suites pass with identical or improved rendering fidelity.

## Why parked (2026-09-30)

Assessment session findings, recorded for whoever unparks this:

* **Solved problems, already invariant.** Wide-char drift without
  coordinate shift: `width.ts` (EAW ranges, combining marks, VS16) plus
  `wrap.ts`'s property-tested "every emitted line ≤ width display columns,
  wide clusters never split." Line-end style closure: the `ansi.ts`
  contract (every formatted line ends `\x1b[0m`) that `wrap.ts` rule 4
  *relies on*. The "fuzzy regex tests" premise is overstated —
  `render.test.ts` already asserts exact line indices via `stripANSI` +
  `displayWidth`.
* **The blocker.** Layout's upstream contract is Bun.markdown's
  string-in/string-out post-order callbacks (ADR-005's string-tag
  protocol: depth probes, RAW tags, fence placeholder tokens). A grid
  forces either (a) a post-hoc rasterizer re-parsing our own escape
  output — cosmetic decoupling, layout still lives in strings — or (b) a
  rewrite of `render.ts` (~1,400 lines) + `wrap.ts` + the TUI viewport
  paint + the test suite. Multi-week, high regression risk on the dogfood
  suites, zero user-visible delta.
* **The paying features are the rejected ones.** Differential repaint and
  overlap chrome are Out-of-scope — and overlap is windowing, which the
  constitution assigns to the host (three-concerns test: compositing →
  environment, windowing → Herdr, rendering → here). What survives the
  exclusions is byte-minimality, which has no consumer.
* **Thin alternative, if the test itch ever needs scratching:** a
  test-only `gridRows(out): string[]` helper that rasterizes rendered
  output into plain row strings for assertions — ~1% of the cost, no
  production code touched.

## Notes

* **Differential diffing avoided:** We intentionally reject two-buffer differential scanning (`ncurses`-style cursor hopping). Serializing a continuous buffer top-to-bottom is significantly simpler, less error-prone under pipe redirection, and takes sub-millisecond execution time in modern terminal emulators.
* **TypedArray allocation:** Allocate the buffer once per render pass or reuse an existing buffer instance via `.fill()` to avoid memory churn and GC pressure in Bun.
* **File naming:** Saved in the repository as `briefs/2026-09-30-brief-terminal-cell-grid.md`.