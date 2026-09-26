---
type: Brief
callsign: BRF-PI-MARKDOWN
---

35;76;24M35;75;24M35;73;24M35;70;23M35;69;23M35;69;22M35;68;22M---
type: Brief
callsign: BRF-PI-MARKDOWN
---

# Brief: Pi markdown rendering via okuda (PARKED — Pi's issue)

**Date:** 2026-08-25
**Status:** Parked (Pi-side spike; okuda stays clean standalone)
**Context:** blue-sky riff during td-96c759 review wait. Captured before
the ideas disappear "like tears in the rain."

## What

Pi (the coding agent harness) could render its own markdown — READMEs,
agent messages, doc previews — through okuda, closing the loop: the agent
writes to the house style, the host renders to the house style, the
operator sees calm scans everywhere, not just when they remember to pipe
through okuda.

## Why it's the right shape

The moat is the coupling. The bold-lead pattern only scans if the
renderer colours `strong` high-contrast. If pi renders through a generic
renderer (glow, raw text), the coupling breaks and the house style is
just slightly-heavier prose. Embedding okuda makes the coupling total —
every markdown surface in pi benefits from the house style.

## The approach (the operator's insight)

**Render in batches** — paragraphs, lists, tables, headers, diagrams as
discrete render units, not token-by-token. This sidesteps the streaming
friction: pi buffers until a block boundary, renders that block through
okuda, emits it. The display grows block by block, not character by
character. Warp previewed a similar treatment in its UI.

This maps exactly to okuda's discrete-block philosophy — the renderer
already treats each block as a unit (the wrap engine, the table fitter,
the mermaid intercept). Batch rendering is the same model at the host
layer: block in, block out. The hard problem (streaming width math)
dissolves because each block is rendered against a stable width.

## Why it's parked (and who owns it)

This is Pi's issue, not okuda's. Three reasons:

1. **The constraint is pi's.** Streaming feel, token boundaries, render
   cadence — all pi-side concerns. okuda is a clean standalone renderer;
   it should not grow host-integration code.
2. **Product coupling.** Embedding okuda couples pi's release cycle to
   okuda's. That's fine for first-party ownership but needs a decision
   in pi's repo, not here.
3. **The Derrida question is unanswered.** Does pi's architecture permit
   a preferred renderer, or is renderer-choice the user's? If pi is
   "bring your own viewer," embedding violates the design. If pi is
   "opinionated stack," it's coherent. That's pi's call.

## What okuda owes pi (if pi says yes)

- A stable rendering API (`renderDocument(source, opts)` already exists).
- A no-op mermaid fallback (already exists — placeholder drops silently;
   pi users get degraded diagrams silently, which is a foot-gun worth
   noting but not blocking).
- Nothing else. okuda stays clean; pi wraps it.

## Unpark trigger

Pi-side decision: does pi want an opinionated renderer? If yes, spike the
batch-rendering approach against pi's streaming model. okuda needs no
changes for the spike.
