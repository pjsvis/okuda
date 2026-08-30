---
type: Brief
callsign: BRF-REFRESH-OFF-DISK
---

# Brief: refresh off disk — the resize race + the R placebo

**Date:** 2026-08-30
**Status:** Open
**Branch:** feat/gloam-launcher
**Context:** surfaced during the fzf-owns-the-loop retrospective
(`debriefs/2026-08-30-debrief-fzf-owns-the-loop-aborted.md`). The wrap
engine is correct (verified standalone: zero overflows across widths
5/10/13/21/80); the tearing on horizontal resize is the repaint path, not
the wrap. Two faults in `src/tui.ts`, both in the default (non-spike)
path — so they survived the abort revert and remain live.

## The two faults

### 1. The resize/rerender race (`rerenderAnchored`)

```ts
const rerenderAnchored = async (): Promise<void> => {
  const { rows, cols } = dims();        // captured HERE
  const fetch = await readSource();     // yields
  const next  = await renderLines(fetch.text, cols); // yields — cols may be stale
  ...
  paint();                              // paint re-reads dims() live
};
```

Three sub-faults stack:

- **Stale-width capture.** `cols` is snapshotted before two `await`s. A
  resize that lands during the awaits → lines rendered at the *old* width,
  painted into a viewport measured at the *new* width. Mismatch = the
  visible tearing.
- **No debounce, no guard.** `onWinch = () => void rerenderAnchored()`. A
  drag-resize fires a burst of SIGWINCH; each spawns a concurrent
  `rerenderAnchored` racing on shared `lines`/`scroll`. N concurrent
  rerenders, each painting — last-writer-wins is not guaranteed to be the
  last *resize*.
- **`paint()` reads `dims()` live.** So even a single rerender can render
  at one width and paint at another if a resize lands between the
  `renderLines` await and the `paint()` call.

### 2. R as placebo (`reload` → the content gate)

`reload()` → `rerenderAnchored()` → `gateFetch()`. The gate's whole
purpose is the mechanised "neither": identical content → `same` → **no
repaint**. "mtime is not meaning." On an *unchanged* file — exactly the
case while resizing — R is structurally incapable of repainting. It's a
content-reload, not a redraw. The HINTS line (`r reload`) lies for the
unchanged-content case; it reloads only if content moved.

## Non-goals

- **Not fs.watch / live documents.** That's `BRF-TUI-LIVE` — the producer
  writes on a cadence, the reader watches. This brief is the operator's
  manual refresh and the resize re-render: the reader's own re-render
  triggers, not an external file-watch.
- **Not the wrap engine.** Verified correct; out of scope.
- **Not a screen abstraction.** One repaint path, three callers (resize,
  manual reload, fs.watch later) — already the design; this brief fixes
  its bugs, doesn't reshape it.

## What

Two small, separable fixes in `src/tui.ts`:

1. **Debounce + serialise SIGWINCH.** Coalesce a burst of SIGWINCH into
   one rerender at the *settled* width (~30–50ms debounce). Drop
   concurrent rerenders: one in-flight at a time; if a new request lands
   while one runs, remember the latest requested width and re-run once
   with it. The painted width is always the settled width, never a
   mid-drag snapshot. Pass the settled `cols` explicitly into
   `renderLines` so the post-await `paint()` and the render agree (don't
   re-read `dims()` mid-rerender).
2. **Give R a real job.** Either (a) a dedicated "force redraw" action
   that bypasses the gate and repaints unconditionally at the current
   width, or (b) make `reload` repaint when the width changed since the
   last render (the gate still holds for unchanged-content-at-same-width
   — the honest "neither"; the force is only when width moved). Option
   (b) keeps the gate's property for the live-documents path; option (a)
   is simpler. Brief decides.

## Acceptance

- Horizontal resize (drag the terminal wider/narrower) produces no
  tearing: every painted frame is wrapped at the width of that frame.
- A rapid drag-resize burst triggers one rerender at the settled width,
  not N concurrent rerenders.
- `r` on an unchanged file repaints at the current width (the placebo is
  gone); `r` on a changed file still reloads content (no regression).
- The content gate still holds for the `BRF-TUI-LIVE` path: identical
  content at the same width → no repaint (the live-documents contract is
  intact).
- `just check` + `just ship` green; existing tui tests pass; a new test
  pins the debounce/serialise property (a synthetic SIGWINCH burst
  produces ≤1 rerender at the settled width).

## Sequencing

This is the natural follow-on to the abort: the default path is simple
again, and its one real bug is now isolated and named. Land this before
revisiting `BRF-TUI-LIVE` (fs.watch reuses `rerenderAnchored` — fixing
the race first means the live-documents path inherits a correct repaint).

## Related

- `src/tui.ts` — `rerenderAnchored`, `onWinch`, `reload`, `paint`, `gateFetch`
- `briefs/2026-08-27-brief-fetch-state-stamp.md` (`BRF-FETCH-STATE`) — the
  gate's `changed/same/failed` semantics (this brief's R fix must not
  break the gate's property)
- `briefs/2026-08-26-brief-tui-live-documents.md` (`BRF-TUI-LIVE`) — fs.watch
  reuses the same repaint path; fix this first
- `debriefs/2026-08-30-debrief-fzf-owns-the-loop-aborted.md` — where the
  race was found