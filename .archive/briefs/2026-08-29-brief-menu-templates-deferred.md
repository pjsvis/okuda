---
type: Brief
callsign: BRF-MENU-TEMPLATES
---

# Brief: Menu templates (deferred — fires on the second menu kind)

**Created:** 2026-08-29
**TD:** (to create when started)
**Status:** rejected — dropped 2026-10-14 (was parked) — gated on a second menu kind existing

## What

A compositor-side template system for jump-list surfaces: a stash of
templates (roles + priorities + data source), authored once per surface
kind in conjunction with the operator, reused for every instance of that
kind. The compositor reads the template and emits the menu document;
okuda renders it by the pattern in ADR-022.

## Why

The operating model (discussion closing td-bdfce0): we compose our UI on
the fly out of simple components, using the two keys — okuda renders to
state, the operator resizes. Templates are the reuse unit so a new
jump-list kind is a template, not new code. The roles are stable homes
(returns don't relearn); the content is the transient payload.

## The gate (why this is parked, not built)

There is **one** menu kind in the tree (jump-demo / reg-menu). A template
system for one consumer is premature abstraction — high-context
abstraction the protocol rejects. Hume's Razor: the second menu kind
does not exist. This brief fires when a second kind appears and forces
the extraction against real needs, not imagined ones. Until then,
reg-menu's hardcoded roles (slug, callsign, number) are the single
instance and are fine.

## How (when the gate fires)

- **Authoring-time, not render-time.** Priorities are decided once when a
  kind is created and written into the template; instances render with no
  negotiation. A render-time priority session would reintroduce the TUI
  state machine the index-and-jump brief rejected — the menu stops being a
  document.
- **Compositor-side, against the closed renderer pattern.** A template is
  a file (roles + priorities + data source) consumed by a compositor
  script. okuda knows the *menu pattern* (ADR-022: right-anchored roles,
  priority suppression) as a closed vocabulary; templates *select within*
  it, they do not invent new roles.
- **Scope gate.** A surface needing a role the pattern lacks is a generic
  table (wrap, operator widens), not a new template. The moment templates
  define new renderer roles, okuda is a layout engine — entropy.

## Out of scope

- A render-time priority/config negotiation (state machine over a widget).
- New renderer roles driven by template config (would make okuda a layout
  engine).
- The renderer-level role fit itself — that is ADR-022 / td-b81597, not
  this brief. This brief is the compositor's reuse unit layered on top.

## Related

- ADR-022 `decisions/022-right-anchored-role-layout.md` (the pattern)
- td-b81597 (the renderer fit primitive — this brief depends on it)
- reg-menu (td-012c5d) — the single instance this generalises
