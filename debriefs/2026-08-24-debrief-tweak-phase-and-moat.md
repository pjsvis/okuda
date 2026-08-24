---
date: 2026-08-24
tags: [tables, wrap, soft-returns, dogfood, moat, glow-convergence, foxtrot-oscar]
agent: pi (ses_a5ee71)
environment: local
td: td-52db41
branch: feat/tui-control-plane
---

# Debrief: the tweak phase, the table audit, and the moat forming in perception

## Context

The evening session (ses_d0509c) left `td-52db41` with Glow convergence complete (all six snagging items resolved, 109/109 green) and a six-item "tweak phase" backlog. This session (ses_a5ee71) picked it up, worked through the backlog, then went further — the operator drove a dogfood loop that surfaced two rendering faults and, more importantly, named the product's moat in perceptual terms.

## Accomplishments

- **Record reconciliation (tweak-phase items 1–3).** The code had converged to glow-CLI Dracula across Passes A/B/C, but the ADRs still taught the wrong sourcing (glamour `DarkStyleConfig` instead of the glow CLI's Dracula truecolor — "two Glows, one name," the root cause of every palette defect). ADR-006 got an Amendment section with the live palette table + the NO_COLOR parity invariant; ADR-007 got the blockquote-pipe divergence row and the emphasis-convergence non-divergence; brief 002 got inline-code and link supersession notes. The map now matches the territory in the record.
- **H6 grounded (item 6).** H6 uniform-bold-purple, previously "flagged for revisit," grounded in ADR-007's divergence table — H6 is rare, uniformity is simpler than reproducing glow's one-off green-non-bold.
- **Table grid header + full-width rules (`bf69908`).** Dogfooding showed glow's grid cue (`│` between header cells + full-content-width `─` bars) is the stronger table-scan signal; okuda's gutter-only header read as a tabbed list. Added `Styler.tablePipe()` (muted `│`); header cells joined with ` │ `; header and closing rules span the full content width; 3-space gutter keeps body columns aligned with the header separators.
- **In-cell wrap zip fix (`cba6af7`).** The word-salad fault on wide/crowded tables: `pad()` returned a multi-line string, `join()` didn't zip, so a wrapped cell's `\n` dumped its tail to the left margin and dragged siblings out of column. Replaced with `padCell` (returns `string[]`) + `zipRow` (zips line N of every cell with the separator). Columns hold through in-cell wraps. This was the fix the operator's "5 and 10 look bad" report demanded.
- **Soft returns stripped (`24c50ff`).** The foxtrot oscar principle. Single `\n` in prose was a forced break (the soft-returns thing, an origin-doc divergence). That was a user-side hack against collapsing renderers; okuda is the renderer now and hard-wraps, so the hack broke layout on resize. The fault surfaced as orphaned fragments ("earning its" / "keep") in the table-audit list items at narrow widths. `wrapANSI` now treats `\n` as a word separator (reflow); `\n\n` remains a paragraph break; code/raw blocks verbatim. Converges to the Glow/CommonMark default.
- **Two diagnostic pages.** `docs/tables.md` (sparse→crowded, ten configurations) and `docs/glow-vs-okuda.md` (a manifesto exercising the full grammar while arguing for it). `just tables` and `just manifesto`.

## Problems

- **The reflow script broke numbered lists (`8774f23`).** When stripping soft returns from the doc sources, a one-off Python script's `is_structural` recognised `- `/`* ` as list markers but not `1. `/`2. `, so numbered items were classified as paragraph continuation and joined into a single line. A single line starting with "1." is not list syntax, so both glow and okuda rendered it as a paragraph. **The soft-returns fix was not the cause** — list items are separated structurally by Bun.markdown's parser (TAG_ITEM markers), not by `\n` reaching the wrap engine. Verified with a three-case test. The operator caught the symptom; the Impartial Spectator check caught the wrong root-cause hypothesis ("aha our soft returns") before it could propagate and trigger a doom-loop revert. Lesson: a reflow script must recognise ALL list-marker forms before joining lines.

## Lessons Learned

- **Design by viewing stuff.** The session's arc — build a page that spans the territory → view it → the eye finds what the spec couldn't → fix what the eye found → view again — is the method. The table audit page exposed the word-salad fault in 30 seconds of viewing; no amount of re-reading `renderTable` would have surfaced it, because `join` looks reasonable on paper. The bug only exists at the intersection of multi-line cells and naive joins, and that intersection only exists when you render a 5-column table with long cells at 80 cols. You have to view it.
- **The foxtrot oscar principle.** The willingness to remove what doesn't earn its place — the anti-palimpsest principle in operator language. The divergence table is a living registry, not a mausoleum. A thing that had evidence once and has none now, goes. Soft returns had evidence (collapsing renderers); the evidence is gone; the thing goes. This is Hume's razor (evidence over inherited authority) + Watt's improvement (shed what doesn't serve) applied to features.
- **The stacked-pane comparison is the dynamic width instrument.** The audit page spans the content territory (sparse→crowded); the stacked panes (glow + okuda at the same width, resized together) span the width territory dynamically. Together they cover the two-dimensional space where wrapping lives. Resizing both simultaneously reveals wrap faults as a function of width, not at fixed sample points.
- **The NO_COLOR parity invariant is the valve on all palette work.** "Plain output is the coloured output minus escapes, identical line breaks." It caught contract violations that eyes missed.

## The moat statement (the finding)

Three properties, all named by the operator unprompted across one dogfood session:

1. **Calming** (lower stress) — okuda's loose rows reduce scan tension; glow's density creates tension.
2. **Leading** (the sharper property) — the structure *directs* the eye; discrete placement builds a reading path (horiz rule → header → first words → first bullet) for free. The eye doesn't decide where to go; the layout decides.
3. **The bear trap** (the inverse) — glow's density repels the eye *before reading begins*, so the table's usefulness is never assessed; the layout defeats its own purpose.

These are perceptual properties, not benchmark scores — and the muppet-exclusion gate is about properties, not scores. The moat question ("can you name your secrets?") is answered: yes, and they're perceptual. The triad belongs in any future positioning. Chalk and cheese = categorical, not incremental.

## State at close

- `feat/tui-control-plane`, `017642a`, clean, 111/111 green, registries in sync.
- Nine commits since the evening handoff (`a15f5c9`).
- `td-52db41` still in_progress — the control plane + Glow convergence + table work is shipped, tested, documented. Ready for review when the operator calls it.

## What's left

- `td-52db41` review/close (`td review` → `td approve`) when the operator is ready.
- The `--no-color` valve as a future audit flag (`--audit-attrs`) — only if another colour audit is anticipated; parked.
- Showcase as byte-stable regression fixture — deferred from the morning handoff, not started.
