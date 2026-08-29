---
type: Brief
callsign: BRF-NOTIFICATION-STYLE
---

# decision: 011-zero-notification-stillness-and-decoupled-inbox-watchers

> **Superseded in role (2026-08-28):** the accepted decision is now
> **ADR-020** (`decisions/020-zero-notification-stillness.md`). This file is
> the option weighing that fed it — kept as record, no longer a brief in
> waiting. The "011" numbering above was this draft's own and collided with
> `decisions/011`; it means nothing. The surviving requirement — status-line
> organization (silo · callsign · filename) — lives in
> `briefs/2026-08-28-silo-mnemonics.md`.

**Date:** 2026-08-28  
**Status:** accepted (as ADR-020)  
**Context:** Evaluating how to surface incoming artifacts in `inbox/` without compromising Okuda's viewport stillness or introducing notification fatigue.

---

## Context and Problem Statement

Modern developer environments and enterprise SaaS dashboards suffer from notification sludge: unranked toast pop-ups, blinking badges, and constant focus theft. 

We considered whether Okuda should incorporate an in-frame notification glyph, badge, or toast banner to alert the operator when new documents land in a silo's `inbox/`.

## Considered Options

1. **In-Frame Okuda Badges/Toasts:** Modify the core layout renderer (`src/render.ts`) to inject dynamic notification glyphs or warning banners into the LCARS frame when files are detected in `inbox/`.
2. **Decoupled Terminal / Background Sentry (Accepted):** Keep Okuda strictly as a deterministic, static renderer of the active document AST. Outsource inbox awareness to an adjacent tiled terminal pane displaying `inbox/summary.md` or a lightweight local daemon.

## Decision Outcome

**Chosen Option:** Option 2 (Decoupled Terminal / Background Sentry).

Okuda will not render notifications, unread badges, or pop-up toasts in the primary viewport. The reading surface remains completely still and pull-based.

### Positive Consequences

* **Preserves Layout Purity:** The rendering engine (`src/render.ts`, `src/wrap.ts`) remains pure and deterministic, calculating geometry solely from the active Markdown AST without polling adjacent directories.
* **Elimination of Focus Hijacking:** Incoming cross-silo artifacts sit quietly in the `inbox/` quarantine until the operator explicitly decides to review them.
* **Unix Philosophy:** Workstation tiling (Hyprland / tmux) handles spatial layout. If an operator wants real-time inbox monitoring, they open a dedicated adjacent pane showing the `inbox/` status ledger.
* **Zero Cognitive Bleed:** The operator maintains complete unbroken concentration on the active brief or playbook currently framed on screen.

### Negative Consequences

* Operators do not get instant visual cues within a single fullscreen Okuda window when a new file lands, requiring an intentional check or a multi-pane layout.

---

## Implementation Rules

1. **No Layout Ingress:** No code in `src/` may inspect `inbox/` state to mutate active document frame headers.
2. **Summary Ledger Pattern:** The background inbox pump maintains a static `inbox/summary.md` catalog with deterministic two-digit jump mnemonics (e.g., `01: [INB-PAYLOAD-01]`).
3. **Dedicated Ingestion View:** Operators review inbound queue items by switching context to `inbox/summary.md` as an independent document slice when they choose to process mail.