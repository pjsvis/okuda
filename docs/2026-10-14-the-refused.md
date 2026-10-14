# The refused — every dropped brief, one line and a reason

**Date:** 2026-10-14

The archive holds what is *finished* and what is *refused*
(`decisions/063-archive-breadth.md`, ADR-ARCHIVE-BREADTH-063). This is the
index over the refused set: one line each, so the reason a proposal died is
legible without opening the brief. The briefs themselves live in
`.archive/briefs/` — the resolver reads them, the launcher's search never
does, and every citation to them still resolves.

A refusal is a decision, and this is its receipt. The one rule the archive
enforces is that each of these carries a settled word — `done` or `rejected` —
so `parked` does not appear here: parked is deferred, and the deferred pile
stays live.

| brief | date | why it was refused |
|---|---|---|
| `BRF-PI-MARKDOWN` | 2026-08-25 | dropped 2026-10-14 (was parked) (Pi-side spike; okuda stays clean standalone) |
| `BRF-VIEWPORT-PADDING` | 2026-08-25 | Rejected (2026-08-25, same day — operator call: "doing less to get more") |
| `BRF-DOCUMENT-LINKS` | 2026-08-26 | superseded (operator first pass 2026-10-13) |
| `BRF-PALETTE-LIGHTNESS` | 2026-08-26 | dropped 2026-10-14 (was parked) — gated on a real cross-terminal brightness itch |
| `BRF-TUI-LIVE` | 2026-08-26 | dropped 2026-10-14 (was parked) — step 0 shipped (r reload re-anchors via `reanchoredScroll`, 50b0e0e; dogf… |
| `BRF-FZF-OWNS-LOOP` | 2026-08-29 | Aborted (2026-08-30) — gate 1 passed, but the fix for the real gate (Bun's passive stdin freeze under fzf `… |
| `BRF-MENU-TEMPLATES` | 2026-08-29 | dropped 2026-10-14 (was parked) — gated on a second menu kind existing |
| `BRF-CITTY-CLI` | 2026-08-31 | superseded 2026-10-14 by the flag-table approach; a dependency for generated help we can derive. Was: decis… |
| `BRF-FLOW-WRAP` | 2026-09-01 | superseded (operator first pass 2026-10-13) |
| `BRF-PORCH-MATRIX` | 2026-09-04 | dropped 2026-10-13 (operator first pass) |
| `BRF-SEARCH-SURFACE` | 2026-09-14 | dropped 2026-10-14 (was parked) — code landed on `feat/search-surface` (cc3c0f9) 2026-09-15 and was never m… |
| `BRF-BM25-EVALUATION` | 2026-09-17 | dropped 2026-10-14 (was parked) (operator call, 2026-10-09) — on hold, gated on the scale trigger: the corp… |
| `BRF-TERMINAL-CELL-GRID` | 2026-09-30 | dropped 2026-10-14 (was parked) — gated on a real per-cell consumer |
| `BRF-DIAGRAM-DESCRIBE` | 2026-10-03 | dropped 2026-10-13 (operator first pass; the record keeps the residue) |
| `BRF-TABLE-GUTTER` | 2026-10-10 | Rejected (2026-10-13) — the gutter is the body's column boundary, not chrome. See *Rejected* at the foot: t… |

## Still live: the deferred, not the refused

The 2026-10-14 sweep kept seven briefs live because they are *deferred*, not
dead: the SSH family (`BRF-SSH-SERVED`, `BRF-SSH-BLOG`, `BRF-SSH-SERVED-2`,
`BRF-SSH-TUI`, `BRF-SSH-HOST`, and `BRF-AI-DOC`) — parked to reconsider what
remote is for — and `BRF-TELEVISION-PREVIEW`, whose declared branch
`feat/television-preview` outlives the brief. `parked` means *will revisit*;
this page is the other pile.
