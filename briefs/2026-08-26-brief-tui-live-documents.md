---
type: Brief
callsign: BRF-TUI-LIVE
---

# Brief: TUI live documents — fs.watch → anchored re-render

**Date:** 2026-08-26
**Status:** Open
**Branch:** brief/tui-live-documents
**Context:** the okuda-stack riff (`docs/2026-08-26-the-okuda-stack-a-web-without-the-web.md`)
made live documents load-bearing: a producer writes markdown on a cadence,
a reader views it over ssh, the document is the feed. One code gap blocks
the use case: `okuda --tui --watch` silently drops watch today — the TUI
branch returns before the watch block is reached, and the streaming watch's
repaint is a clear+home top-jump, the exact behaviour ADR-010 abolished.

## What

`runTui` gains a file watch: on change (debounced), re-render through the
existing pipeline and repaint through the existing anchored paint path. The
viewport holds its position across updates — the content-anchor does for
*time* what it already does for *width*: a dashboard gaining three rows and
a terminal losing ten columns are the same event, a reflow, and the anchor
handles both with one mechanism.

## Cadence — the two clocks, and which one is real

Cadence is an "it depends" answer, which means the variables haven't been
named. Name them and it becomes tuning:

- **Decision latency.** How stale can the data be before a decision made
  from it is wrong? This is the floor.
- **Volatility.** How often does the data *meaningfully* change? Cadence
  faster than volatility wastes writes; slower than decision latency
  betrays the reader.
- **Attention budget.** A display that changes on every glance is a slot
  machine — change noise drowns signal, and readers stop looking (alarm
  fatigue is the ops term for it). This is the ceiling.
- **Production cost.** The exporter runs whether or not anyone looks.
  Below some interval, you are paying to repaint an empty room.

The dial has two failure modes and they are not symmetric: too fast
destroys *trust* (everything always changes, so nothing counts as
change), too slow destroys *use* (dead data that looks alive — honest
only if the document carries a visible "as of" timestamp). Tune to the
slowest cadence at which every decision the document informs remains
sound. Cadence is a property of the consumer's decision loop, not the
producer's capability.

**The two clocks stay separate.** The producer's cadence is the only
clock: cron, interval, event — the exporter's business. The viewer's
reactivity is event-driven and near-instant (debounce in milliseconds,
to coalesce editor save storms). The viewer must never throttle: showing
known-stale bytes while fresher ones sit on disk is the specific
dishonesty this architecture exists to avoid. If the display is too
busy, slow the producer — don't buffer the truth at the reader.

**"Neither" is mechanized, not tuned, on the display side.** The
repaint predicate is *rendered content changed*, not *N seconds
elapsed*. A cron rewrite with identical content produces zero visual
events (mtime is not meaning); a real change repaints immediately. Time
belongs to the producer; meaning belongs to the wire.

## How

0. **Fix `r` first (the manual epoch).** `r` reload exists in the TUI
today but does `scroll = 0` — a top-jump, the crime ADR-010 abolished.
Manual refresh is the correct v0 (the reader is the clock — poll rate
owned by the only party who can measure attention budget); make it
re-anchor like the resize path does, so the manual epoch is fully
pleasant before any watch code exists.
1. **Watch the directory, not the file.** The runbook mandates atomic
   writes (temp + rename), which swaps the inode — a path-based
   `fs.watch` fires once and goes stale. Watch the parent directory,
   filter events by basename, re-read on match.
2. **Debounce** (~50ms, matching the streaming watch) to coalesce
   multi-event writes.
3. **Re-render** through `renderDocument` with current width/rows/
   palette — no new render path.
4. **Content gate:** compare the rendered output (or its hash); skip
   the repaint when unchanged. This is the mechanized "neither."
5. **Repaint through the existing paint path** — no clear, no home. The
   anchor keeps the line under the eye; changed rows update, structural
   lines hold. Streaming `--watch` (non-TUI) keeps its current
   clear+home behaviour: it has no viewport state to protect.

## Scope

- `src/tui.ts` + a thin hook from `cli.ts` (the `--tui --watch`
  combination currently falls through silently — it must mean this).
- Tests: simulate a file rewrite mid-session; assert viewport position
  holds across an update that inserts lines above the anchor; assert
  identical content produces no repaint.

## Out of scope

- **Viewer-side throttling.** The producer owns cadence (see above).
- **Push/alerts.** The feed says `status: red`; the pager is a
  different channel. Cadence must not chase alerting.
- **Cell-level diffing.** Full repaint at ~10ms is far below perception;
  diffing would be benchmaxxing.
- **Footer changes** (live indicator, mtime display). The document
  carries its own "as of"; chrome can come later if dogfood demands.
- **Multiple files / option 2 server.** The gates stand.
