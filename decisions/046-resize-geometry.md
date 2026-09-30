---
type: ADR
callsign: ADR-RESIZE-GEOMETRY-046
---

# Decision: The repaint decision — the gate reads the content, the glass is a second input

**Date:** 2026-09-30
**Status:** Accepted (implemented on `fix/resize-height`, commit `76cb44b`; brief BRF-REFRESH-OFF-DISK)

## Context

`rerenderAnchored` is the one repaint path: resize (SIGWINCH), manual reload
(`r`), and fs.watch all go through it. It asks the content gate whether to
repaint, and the gate answers from the **content** — `gateFetch` returns
`repaint: false` when `renderEqual` holds, which is the mechanised *neither*
(*mtime is not meaning*).

A resize is a **geometry** event. For a width change the two coincide, because
a reflow changes the lines. For a height change they do not: `cols` is
unchanged, so `renderLines(text, cols)` is byte-identical, the gate reads
`same`, and the caller returned at the guard **before** `paint()`. The frame
was never laid out at the new height — shrinking left the footer's cursor
address (`rows - 1`) pointing at a row that no longer existed, and growing left
the newly uncovered rows blank.

This is a regression, and it dates precisely. The gate entered at `dbf1d17`
(2026-08-27, *fetch union + content gate + retain-on-failure*); before it,
`rerenderAnchored` ended with an unconditional `paint()`. The gate made the
repaint conditional on the content, and a height change is not content.

## Decision

**The repaint decision gains the glass as a second input: repaint when the
content changed, or when the geometry differs from the geometry last painted.**

The gate keeps its meaning. `geometryOf(rows, cols)` reduces the glass to one
comparable token and `needsRepaint(contentChanged, geometry, paintedGeometry)`
is the rule; both are pure and tested. `paint()` is the sole writer of
`paintedGeometry`, so the token always describes what is **on the screen**, not
what was asked for.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Widen the gate to compare geometry | Pollutes the gate's meaning: *mtime is not meaning* becomes *mtime or size is meaning*, and the gate would have to carry rows and cols — the glass's vocabulary, not the document's. The gate is about content and stays about content. |
| Force a repaint whenever `reason === "resize"` | Repaints even when nothing moved (a SIGWINCH with no geometry change, e.g. a pane focus in tmux), and leaves the same gap on `reload` and `watch`, which share the path. Key on the property, not the trigger. |
| Let `paint()` compare geometry and no-op when unchanged | Inverts the dependency: `paint()` would need to know *why* it was called, and the early return exists precisely to skip the re-anchor work. One pure predicate keeps `paint()` single-jobbed. |
| Track `lastRows` and `lastCols` separately | Two tokens that can disagree; one comparable string cannot. |

## Consequences

**What became easier:**

- The resize path is correct on both axes, and the rule has a name
  (`needsRepaint`) rather than living as a bare early return.
- The same gap on the `failed` branch is closed: a resize during an unreadable
  source now re-lays-out the last-known-good instead of leaving rows blank,
  while the gate still retains it and the footer still reads `failed`.
- `paint()` now records the geometry the glass holds. Any future geometry work
  (the edges indicator, the frame's cut-and-defer) has the fact it needs.

**What became harder:**

- One more piece of state to keep true. Mitigated by `paint()` being its only
  writer.
- The pre-existing race (`BRF-REFRESH-OFF-DISK` fault 1: `paint()` re-reads
  `dims()` live, so a resize landing between `renderLines` and `paint()` can
  paint at a geometry the caller did not measure) becomes **visible** in the
  token rather than silent: the two disagree, so the next resize repaints. That
  is fail-safe, and it is not a fix — fault 1 remains that brief's.

**Constraints this imposes:**

- The repaint decision stays a pure predicate; no geometry knowledge enters
  `gateFetch`.
- `paintedGeometry` is written only where the frame is written. A second writer
  would make the token a claim about intent instead of about the screen.

## Related

- Brief: BRF-REFRESH-OFF-DISK — the brief this decision extends; it owns the
  same function and its two other faults
- Brief: BRF-FETCH-STATE — the gate's `changed` / `same` / `failed` semantics,
  whose meaning this decision deliberately leaves intact
- Brief: BRF-TUI-LIVE — fs.watch shares the repaint path
- ADR: ADR-010 — the re-anchor semantics `rerenderAnchored` implements
- ADR: ADR-SILCROW-PATHS-045 — the numbering neighbour (it lives on
  `feat/silcrow-paths`, not `main`); an unrelated gate, cited so the sequence is
  traceable
- `docs/2026-08-31-the-same-okudagram.md` — the anchor as the invariant that
  survives every glass change
- `docs/2026-09-05-frame-as-shite-filter.md` — the frame's cut-and-defer and the
  edges, which will need the geometry this records
