---
type: Brief
callsign: BRF-HERDR-DASHBOARD
---

# Brief: Herdr Dashboard — the Build's Exhaust, Composed

**Date:** 2026-08-26
**Status:** Ready (v0 config-not-code; premium path gated)

## Depends on

`2026-08-26-brief-telemetry-conventions.md` (the files); `briefs/…-brief-tui-live-documents.md` (parked — **this brief is its unpark trigger**); `2026-08-26-brief-document-links.md` (index pane)

## What

A live dashboard assembled in herdr panes/tabs, every pane an okuda
render of a file the build itself writes. v0 is assembly, not code:

1. **Pane map** (initial): pipeline state (`state.md`, mermaid — a live
   architecture diagram), ingest feed (`ingested.md`), errors
   (`errors.md`), throughput (`throughput.md`, sparkline block).
2. **Renderer per pane:** v0 `okuda <file> --watch` (exists today);
   premium `okuda --tui --follow` once `tui-live-documents` lands
   (anchored re-render — ADR-010 machinery — no flicker, position kept).
3. **`just dashboard`** (working title): opens the pane map in herdr —
   a recipe, not a daemon. Maybe `just dash-state`, `just dash-feed`
   for single panes.
4. **Index pane:** the dashboard's home screen is a README linking the
   panes — gopher hypertext (document-links) once that lands; until
   then, `fd`-pick as usual.

## Why

Observability debt cancelled by construction: components already write
markdown; the operator's view is composed from exhaust, never
constructed. The web, if ever needed, is another consumer of the same
files — an afternoon, not a project (origin/renders doctrine; see
`docs/2026-08-26-the-porch-without-the-zapper.md`).

## Constraints

- **v0 ships as recipes + herdr layout only** — no new src. The premium
  path is the parked TUI-live brief, unparked by this brief's existence
  (the dashboard is its killer use case), implemented under its own td.
- **No daemons.** Producers run because the build runs; the dashboard
  renders because a pane is open. Nothing watches when nobody looks
  (the zapper check, structural).

## Verification

- A producer updates `state.md`; the pane re-renders without operator
  action; no pane dies on rotation.
- `just dashboard` from clean clone → panes up in one command.

## Out of scope

- Web render (a consumer, built when a second human needs it);
  alerting (the errors pane *is* the alert); metrics databases.
