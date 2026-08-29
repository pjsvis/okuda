---
type: ADR
callsign: ADR-ZERO-NOTIFICATION-020
---

# Decision: Zero-notification stillness — identity lives on the status line

**Date:** 2026-08-28
**Status:** Accepted

## Context

Incoming cross-silo artifacts land in `inbox/`. The notification-style brief
weighed in-frame badges/toasts (the renderer polling `inbox/` to mutate the
frame) against a decoupled pane. Notification sludge — unranked toasts,
blinking badges, focus theft — is the known failure mode; the reading surface
is still and pull-based by design.

## Decision

Okuda renders exactly one thing: the active document. No code in `src/`
inspects `inbox/` or any ambient directory to alter the frame. Inbox awareness
is an adjacent pane rendering `inbox/summary.md` — an ordinary index document
(jump tokens + callsigns per the index-and-jump and silo-mnemonics briefs).
What the notification question actually reduces to is **status-line
organization**: the footer identity run carries *silo name · callsign ·
filename*, composed by the launcher and passed on argv — owned by
`briefs/2026-08-28-silo-mnemonics.md`.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| In-frame badges/toasts in `render.ts` | Focus hijack; layout ingress into a pure, deterministic renderer |
| A notification daemon | Runtime + state + a process to babysit, for zero reading value |

## Consequences

**What became easier:**
- Renderer purity holds — one document in, coloured bytes out
- Inbox UX is just another rendered document; no new surface

**What became harder:**
- A fullscreen single-pane operator must switch documents to check mail —
  accepted; stillness was the point

**Constraints this imposes:**
- No `src/` file may read ambient directories to mutate the active frame
- The status-line identity contract belongs to the silo-mnemonics brief

## Related

- Brief: `briefs/2026-08-28-brief-notification-style.md` (the option weighing
  this ADR accepts; superseded as a brief)
- Brief: `briefs/2026-08-28-silo-mnemonics.md` (status-line identity)
- Brief: `briefs/2026-08-28-brief-index-and-jump.md` (index documents)
