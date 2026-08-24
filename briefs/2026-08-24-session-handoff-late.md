# Session Handoff — 2026-08-24 (late): tweak phase, table audit, the moat

**Branch:** `feat/tui-control-plane`
**TD:** `td-52db41` (in_progress)
**State:** `017642a`, clean, 111/111 green, registries in sync
**Debrief:** `debriefs/2026-08-24-debrief-tweak-phase-and-moat.md`

## What this session did

Nine commits since the evening handoff (`a15f5c9`):

1. `1b20630` — record reconciliation (ADR-006/007 + brief 002; corrected the wrong sourcing)
2. `f1090ec` — H6 uniform-bold-purple grounded (closed tweak item 6)
3. `bf69908` — table grid header (`│` separators) + full-width rule bars
4. `89a4002` — table audit page (`docs/tables.md`, `just tables`)
5. `cba6af7` — in-cell wrap zip fix (the word-salad fault on 5/7/10)
6. `24c50ff` — soft returns stripped (foxtrot oscar; reflow prose to width)
7. `8774f23` — numbered lists restored (reflow script bug, not the wrap fix)
8. `017642a` — glow-vs-okuda manifesto (`docs/glow-vs-okuda.md`, `just manifesto`)

Plus the debrief (this session's retrospective).

## The finding (persists in the debrief)

The moat is perceptual, not benchmarks. Three properties the operator named unprompted:

1. **Calming** — loose rows reduce scan tension vs glow's dense wall.
2. **Leading** — the structure directs the eye (horiz rule → header → para → bullet); discrete placement builds a reading path for free.
3. **Bear trap** — glow's density repels the eye before reading begins; the layout defeats its own purpose.

Chalk and cheese = categorical, not incremental.

## Key learnings

- **Design by viewing stuff** — build a page that spans the territory, view it, the eye finds what the spec couldn't, fix, re-view. The audit page exposed the word-salad in 30s; code-reading couldn't.
- **The foxtrot oscar principle** — remove what doesn't earn its place; the divergence table is a living registry. Soft returns had evidence (collapsing renderers); gone now; gone.
- **Stacked-pane same-width resize** is the dynamic width instrument; the audit page spans content territory. Together they cover the 2D space where wrapping lives.
- **Reflow scripts must recognise ALL list-marker forms** (`-`/`*` AND `N.`) before joining lines — the one script bug this session.
- **The Impartial Spectator caught a wrong root-cause** ("aha our soft returns") before it triggered a doom-loop revert. The soft-returns fix was innocent; the script was guilty. Verified with a three-case test.

## What's next

- `td-52db41` is ready for `td review` → `td approve` when the operator calls it. The control plane + Glow convergence + table work is shipped, tested, documented.
- The `--no-color` valve as a future `--audit-attrs` flag — parked, only if another colour audit is anticipated.
- Showcase as byte-stable regression fixture — deferred, not started.
- The operator has further tests in mind; this is a clean seam to cut.

## How to resume

```bash
cd /Users/petersmith/Dev/GitHub/okuda
just orient
td context td-52db41        # issue state
# this brief is the session state
just manifesto             # render the glow-vs-okuda doc
just tables                # render the table audit
```
