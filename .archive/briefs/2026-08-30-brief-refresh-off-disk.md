---
type: Brief
callsign: BRF-REFRESH-OFF-DISK
---

# Brief: refresh off disk — the resize race + the R placebo

**Date:** 2026-08-30
**Amended:** 2026-09-30 — fault 3 added; fault 2's mechanism corrected (ADR-RESIZE-GEOMETRY-046)
**Status:** Rejected — 2026-10-26, the operator's call. The resize race it diagnosed was settled structurally elsewhere (`ADR-RESIZE-GEOMETRY-046`: content and geometry are the two inputs of a repaint, and the gate compares both), so what remained here was a second path to the same behaviour. Refused for that reason, recorded rather than deleted.
**Branch:** fix/resize-height (fault 3); `feat/gloam-launcher` no longer exists

## Context

surfaced during the fzf-owns-the-loop retrospective (`debriefs/2026-08-30-debrief-fzf-owns-the-loop-aborted.md`). The wrap engine is correct (verified standalone: zero overflows across widths 5/10/13/21/80); the tearing on horizontal resize is the repaint path, not the wrap. Three faults in `src/tui.ts`, all in the default (non-spike) path — so they survived the abort revert and remain live.

## The three faults

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

### 3. The height-only resize — the geometry the gate cannot see

**Added 2026-09-30.** Fixed on `fix/resize-height` (`76cb44b`). Decision:
ADR-RESIZE-GEOMETRY-046.

The gate decides the repaint from the **content**. A resize is a **geometry**
event. For a width change the two coincide, because a reflow changes the lines.
For a height change they do not:

- `cols` is unchanged, so `renderLines(text, cols)` is byte-identical.
- `renderEqual` holds, so `gateFetch` returns `{ state: "same", repaint:
  false }`.
- The guard returned **before** `paint()`, so the frame was never laid out at
  the new height.

The symptom is what the operator reported. **Shrinking** pushes the visible part
up the viewport and loses the footer, because the old frame is truncated by the
terminal and the footer's cursor address (`rows - 1`) names a row that no longer
exists. **Growing** leaves the newly uncovered rows blank, because nothing was
ever written into them.

This is a **regression**, dated precisely: the gate entered at `dbf1d17`
(2026-08-27), and before it `rerenderAnchored` ended with an unconditional
`paint()`. It is also **deterministic** — unlike fault 1 it needs no race, so one
settled height change reproduces it every time.

The fix adds the glass as the decision's second input rather than widening the
gate: `geometryOf` and `needsRepaint` (pure, tested), with `paint()` the sole
writer of `paintedGeometry`. The gate keeps its meaning, and the same gap on the
`failed` branch closes with it — a resize during an unreadable source now
re-lays-out the last-known-good instead of leaving rows blank.

**Why the tests did not catch it, and could not.** `renderEqual` and `gateFetch`
are well covered (`tests/tui.test.ts:368`, `:383`), and the suite asserts
`same → no repaint` as *correct* behaviour — because it is. The defect lives in
the **caller's use of** the gate, and `rerenderAnchored` is a closure, so no test
spanned the seam. Seven cases now pin it.

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

Three small, separable fixes in `src/tui.ts`:

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
   geometry, or (b) make `reload` repaint when the **geometry** changed
   since the last render (the gate still holds for unchanged content at the
   same geometry — the honest "neither"; the force is only when the glass
   moved). Option (b) keeps the gate's property for the live-documents
   path; option (a) is simpler. Brief decides.

   **Corrected 2026-09-30.** This read *"when the **width** changed"*.
   ADR-RESIZE-GEOMETRY-046 settles the mechanism on **both axes** —
   `needsRepaint(contentChanged, geometryOf(rows, cols), paintedGeometry)` —
   so option (b)'s shape is implemented, and a `reload` after a height-only
   resize repaints. The residual fault 2 asked for is **not** delivered: `r`
   on an unchanged file at an unchanged geometry still does nothing, and that
   is correct — the gate's *neither*. Whether R also deserves a force-redraw
   (option (a)) stays open, and it is now the smaller question, because the
   resize half is gone.
3. **The repaint rule gains the glass** (fault 3, added 2026-09-30).
   `geometryOf(rows, cols)` and `needsRepaint(contentChanged, geometry,
   paintedGeometry)`, with `paint()` the sole writer of `paintedGeometry`.
   Landed on `fix/resize-height`.

## Acceptance

- **Vertical resize, both directions** (added 2026-09-30, fault 3).
  Growing the terminal paints the newly uncovered rows; shrinking
  re-lays-out the frame so the footer lands on a row that exists. No blank
  band, and no content left above the fold.
- **A height-only resize repaints** although the content is unchanged:
  `needsRepaint(false, geometryOf(40, 80), geometryOf(24, 80))` is true,
  while `needsRepaint(false, G, G)` is false — the gate's property survives
  (added 2026-09-30).
- **A failed fetch re-lays-out at the new geometry** while retaining the
  last-known-good and reading `failed` (added 2026-09-30).
- Horizontal resize (drag the terminal wider/narrower) produces no
  tearing: every painted frame is wrapped at the width of that frame.
- A rapid drag-resize burst triggers one rerender at the settled width,
  not N concurrent rerenders.
- `r` on a changed file still reloads content (no regression); `r` repaints
  when the geometry moved since the last paint. `r` on an unchanged file at
  an unchanged geometry still does nothing — the gate's honest *neither*.
  **Corrected 2026-09-30:** this line read *"`r` on an unchanged file
  repaints at the current width (the placebo is gone)"*, which
  ADR-RESIZE-GEOMETRY-046 makes false.
- The content gate still holds for the `BRF-TUI-LIVE` path: identical
  content at the same **geometry** → no repaint (the live-documents contract
  is intact). **Corrected 2026-09-30:** read *"at the same width"*.
- `just check` + `just ship` green; existing tui tests pass; a new test
  pins the debounce/serialise property (a synthetic SIGWINCH burst
  produces ≤1 rerender at the settled width).
- **Mobile SSH re-test (dogfood, 2026-08-30):** re-test resize on
  Echo-over-SSH (iPhone, then iPad) after landing. The dogfood found
  that keystrokes act but resize does nothing and the soft-keyboard
  dismiss leaves a void — both are consistent with `SIGWINCH` not
  arriving over the SSH channel, *or* arriving and the rerender being
  stale/torn. The brief's fixes resolve the second; only after landing
  can we distinguish. If resize *still* does not fire on mobile post-fix,
  document it as an Echo/pty-SIGWINCH limitation (windowing — the
  host's concern, not okuda's), not an okuda bug. iPad with a hardware
  keyboard isolates the resize-only path (no soft-keyboard void).

## Sequencing

This is the natural follow-on to the abort: the default path is simple
again, and its real bugs are now isolated and named. Land this before
revisiting `BRF-TUI-LIVE` (fs.watch reuses `rerenderAnchored` — fixing
the race first means the live-documents path inherits a correct repaint).

Fault 3 is already fixed and does not wait on faults 1 and 2: it was
deterministic, operator-visible on the desktop, and one predicate wide.
Fault 1 (the race) is the one that blocks `BRF-TUI-LIVE`, and it is untouched
here — `paint()` still re-reads `dims()` live, so a resize landing between
`renderLines` and `paint()` can paint at a geometry the caller did not
measure. ADR-RESIZE-GEOMETRY-046 makes that disagreement **visible** (the
token mismatches, so the next resize repaints) rather than silent. Fail-safe
is not a fix, and fault 1 remains this brief's.

## Notes

1. **Amendment, 2026-09-30 — fault 3 added, and fault 2's mechanism
   corrected.** Reported by the operator as *"terminal width changes result
   in a rerender; terminal height changes are broken"*, with a hypothesis
   that it was a regression. It was. The cause is the content gate
   (`dbf1d17`, 2026-08-27) suppressing the repaint for a height-only resize,
   because a height change alters the geometry and not the content. Fixed on
   `fix/resize-height` (`76cb44b`) under ADR-RESIZE-GEOMETRY-046.
2. **This brief's original framing was width-scoped, and that is why the
   height case hid here.** Fault 1 is titled and reasoned about horizontal
   resize; fault 2's mechanism said *"when the width changed"*; every
   acceptance criterion said width. A reader diagnosing a *height* symptom
   would have found this brief, read it as horizontal, and moved on. Both
   lines are corrected above, with the original wording quoted so the record
   stays legible.
3. **Why the tests missed it.** `renderEqual` and `gateFetch` are covered
   (`tests/tui.test.ts:368`, `:383`), and the suite asserts `same → no
   repaint` as correct — because it is. The defect is in the caller's use of
   the gate, and `rerenderAnchored` is a closure, so no test spanned the
   seam. The fix extracts the decision into `needsRepaint` precisely so it
   can be pinned; seven cases do.
4. **`&next.md` filed this as "bites on mobile SSH only".** It bites on the
   desktop, deterministically, for a height change. That assessment is why
   the brief sat open for a month; the line is corrected in the same commit.

## Related

- `src/tui.ts` — `rerenderAnchored`, `onWinch`, `reload`, `paint`,
  `gateFetch`, `geometryOf`, `needsRepaint`
- ADR-RESIZE-GEOMETRY-046 — the repaint decision's second input; the
  decision fault 3 is fixed under
- `briefs/2026-08-27-brief-fetch-state-stamp.md` (`BRF-FETCH-STATE`) — the
  gate's `changed/same/failed` semantics (this brief's R fix must not
  break the gate's property)
- `briefs/2026-08-26-brief-tui-live-documents.md` (`BRF-TUI-LIVE`) — fs.watch
  reuses the same repaint path; fix this first
- `debriefs/2026-08-30-debrief-fzf-owns-the-loop-aborted.md` — where the
  race was found