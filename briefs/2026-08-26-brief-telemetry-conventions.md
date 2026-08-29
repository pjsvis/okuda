---
type: Brief
callsign: BRF-TELEMETRY-CONVENTIONS
---

# Brief: Telemetry Conventions — Markdown as Message Bus

**Date:** 2026-08-26
**Status:** Ready (small; contracts, not code)
**Feeds:** `2026-08-26-brief-herdr-dashboard.md`; generalises to any producer

## What

The producer contract for telemetry-as-markdown — the files the dashboard
(and any future render, including web) consumes.

1. **Format:** plain markdown within okuda's grammar — loose lists,
   loose tables, code blocks (ASCII sparklines), mermaid fences for
   state diagrams. No HTML, no templating, no client-side anything.
2. **Write discipline:** append-only (`>>`) for streams; full rewrite
   for snapshots (state.md); **no fsync** (the OS buffer is a feature);
   one writer per file (producers own their files, no shared mutables).
3. **Rotation:** size-bounded (e.g. 1MB) or count-bounded (last N
   entries) — for the *reader's* sake, not the SSD's (wear arithmetic:
   1KB/s ≈ 31.5GB/yr vs ~600TBW rating — a non-issue; recorded here so
   nobody re-derives the fear).
4. **The line (porch doc, cited):** telemetry measures **our own
   systems** — the porch meter. Never visitors, never readers, never
   attention. A file that measures a person's dwell time is a bug zapper
   and gets deleted on sight.

## Why

Files as the interface: every stage greppable, diffable, git-able —
`git log` on the telemetry directory is time-travel dashboards. The
build's exhaust becomes the dashboard; no second system to rot.

## Verification

- `okuda file.md --watch` survives a producer appending mid-read
  (partial last line — watch debounce already tolerates; confirm and
  record the worst case).
- Rotation swaps files without the watch pane dying (watch follows the
  path, not the inode — verify).

## Out of scope

- The dashboard itself (sibling brief); producer implementations
  (scripts arrive with the pipeline that needs them).
