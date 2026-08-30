---
type: ADR
callsign: ADR-ROLE-LAYOUT-022
---

# Decision: Right-anchored role layout for patterned surfaces

**Date:** 2026-08-29
**Status:** Accepted

## Context

The index-and-jump menu and the jump-demo/reg-menu compositors compose
navigation surfaces as three-column tables (slug → callsign → number). Two
problems surfaced at the close of td-bdfce0 / the reg-menu follow-up
(td-012c5d):

1. **The fit algorithm wraps mid-token.** `renderTable` (src/render.ts) fits
   by *proportional* shrink — every wide column gets a cut. A long title
   (observed: 215 chars) blows out the Document column and starves the
   callsign, which wraps (`ADR-RETIRE-OK` / `W-018`) — a navigation
   primitive that breaks its own address column is unfit for purpose.

2. **The compositor guesses width it doesn't have.** reg-menu caps slugs
   at 50 chars as a stopgap. It's a fixed ceiling blind to the terminal —
   wastes space at 200 cols, starves at 60. The compositor doesn't know the
   render width; the renderer does, at render time. A compositor-level cap
   is a layer violation.

The operator's articulation across the discussion reframes the problem
entirely: the surface is a **return-to** — contents always change, the
actions stay the same — so the layout must give the actions stable homes
that don't relearn. The fit policy follows from that: layout to the space
we have, by priority, and the space is the operator's to change.

## Decision

okuda renders **patterned surfaces** (menus, indexes, status pages — the
docs with no content depth to hide behind, where the look *is* the
legibility) with a **right-anchored role layout** that grows leftward as
space allows, suppressing the lowest-priority role in place rather than
wrapping:

```
   <─────────────── content width ───────────────>
  ┌ slug (low) … callsign … number (floor) ┐
  └ leftmost              rightmost ┘
```

**The role ladder, right-anchored:** `number` is the floor (an action
needs a referent — callsign + number, never number alone); `callsign`
next; `slug` fills the remainder leftward. Widening restores the slug
(the truncation reverses); the number never leaves its home. The strong-
stop (the bold action at the far edge) and the stable home are the *same
thing* — the number is always at the right edge; the handoff's believed
trade (coherence vs. far-edge anchor) was a misframe. There is no trade.

**Suppression, not wrap.** When space is short, the lowest-priority role
is suppressed in place — the remaining roles do not reflow or recenter;
the freed space is empty left, not a centred reflow (reflow would unlearn
the homes). Truncation is the transition rung between the full slug and
slug-suppressed, not the headline. **Wrap is the fallback** for content
the renderer cannot suppress by role.

**Render to current state.** okuda already re-renders on every SIGWINCH
(width, height, zoom — zoom is a SIGWINCH, cell-size change) and on
content change (td-450944). The fit is computed against the live width at
each render — there is no cached layout. This is what makes truncate-to-
live-width viable: the renderer knows the width at render time, so it
chops precisely; wrapping is what you do when you don't know better.

**The two keys.** The model is two levers and no third:
okuda renders to the live state (priority suppression is *inside* this —
it is what the render does); the operator resizes (widening, or tucking a
panel away to the mnemonics + number). okuda does not resize anything; it
renders correctly at any width it is handed, with a graceful ladder, so
the operator's widen/tuck lands on a sensible view at every size. The
expand-the-width and tuck-the-panel actions are windowing — Herdr's job,
the seam ADR-016 drew.

## Scope gate (load-bearing)

The renderer owns the **menu pattern** as a closed vocabulary: right-
anchored roles, priority suppression. Templates (the compositor's reuse
unit — a stash of roles + priorities + data source, authored once per
surface kind) *select within* that vocabulary; they do not invent new
roles. A surface needing a role the pattern lacks is not a new template —
it's a generic table.

**Generic tables** (ADR alternatives matrices, "why rejected" columns —
prose tables with no role or priority) do **not** suppress; they wrap, and
the operator widens. The width lever, not suppression, serves reading
tables — a truncated reason loses the point, a wrapped one keeps it. The
renderer cannot tell a scanning table from a reading table, so it does
not try: patterned surfaces okuda renders specially; prose tables ride
the operator's width lever.

The moment templates define new renderer roles, okuda is a layout engine,
and layout engines are entropy.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Proportional shrink (current `renderTable`) | Wraps the callsign mid-token under a long title — breaks the address column, the thing a navigation surface exists to show |
| Compositor-level slug cap (reg-menu stopgap) | A fixed ceiling blind to terminal width — wastes space wide, starves narrow; a layer violation (compositor doesn't know the render width) |
| Wrap as the headline fit policy | Preserves information but unlearns the homes — a return-to surface must give actions stable positions; wrap is the fallback, not the fit |
| Generic priority-aware layout engine | Would require okuda to maintain role/priority for every table shape — a layout engine is entropy; bound it to the closed menu pattern |

## Consequences

**What became easier:**
- Navigation surfaces render correctly at any width the operator hands
  okuda, with a graceful ladder down to callsign + number. The operator's
  widen/tuck always lands on a sensible view.
- The strong-stop and the stable home are unified — one grammar at three
  role-visibilities (list / wide table / tucked), not three patterns.

**What became harder:**
- The renderer must know the menu's role priority. This is bounded: the
  menu is a closed pattern (right-anchored roles + suppression), not an
  open vocabulary — see the scope gate.

**Constraints this imposes:**
- Compositors emit full content; the renderer truncates to the live
  budget by priority. The reg-menu 50-char slug cap becomes a stopgap to
  *remove* against this ADR's renderer-level fit.
- Suppression is a renderer-known pattern only. Templates select within
  the closed vocabulary; a surface needing a new role is a generic table.

## Related

- ADR-016 `decisions/016-argv0-launcher-dispatch.md` (the okuda/Herdr seam)
- ADR-020 `decisions/020-zero-notification-stillness.md` (the renderer
  paints the strings it is given; knows nothing of trees or registries)
- ADR-021 `decisions/021-jump-token-numbering-offset.md` (ephemeral tokens)
- Brief: `briefs/2026-08-28-brief-index-and-jump.md` (menus as documents —
  no TUI state machine; the constraint this ADR respects)
- td-b81597 (the elision primitive — table consumer, reframed against
  this ADR: not `elideToWidth` but right-anchored role fit)
- td-012c5d (reg-menu — the slug cap is the stopgap this ADR retires)
- Deferred: template system for menu kinds (fires on the second kind —
  `briefs/2026-08-29-brief-menu-templates-deferred.md`)
