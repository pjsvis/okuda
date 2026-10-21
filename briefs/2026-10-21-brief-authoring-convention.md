---
type: Brief
callsign: BRF-AUTHORING-CONVENTION
---

# Brief: Authoring Convention — Route Agents to the Style Guide

**Date:** 2026-10-21
**Status:** Open

---

## Context

`docs/style-guide.md` is the silo's written guide to producing a document. It is
not the renderer's spec — it is the author's guide, the inverse of the grammar
showcase. It already exists, is short, and renders as the demo of itself.

Nothing in `AGENTS.md` routes an agent to it. Rules 1–9 cover workflow
(orient, brief, td, branch, quality gate, registry, ADR, stage, debrief); craft
is absent. An agent authoring a document has no instruction to read the guide
before writing.

The guide itself also omits two load-bearing principles that shape okuda
documents:

- **The frame that wraps** — a shoulder or an elbow gathers a block without
  sealing it. Extensible, not closed.
- **The authoring contract** — width, split discipline, ASCII labels, and the
  prohibition on faking a fit. These are defaults an agent gets wrong unless
  stated.

## Warrant

Operator call — the gap between an existing convention and an agent that does
not know it exists.

## Objective

1. Add an **Authoring** section to `AGENTS.md` that routes agents to
   `docs/style-guide.md` before they write.
2. Add **The frame that wraps** and **Authoring contract** sections to
   `docs/style-guide.md`.
3. Register this brief in `briefs/INDEX.jsonl`.

## Scope

**In:**
- `AGENTS.md`: new **Authoring** section after *Scope Discipline*.
- `docs/style-guide.md`: new **The frame that wraps** and **Authoring contract**
  sections.
- `briefs/INDEX.jsonl`: entry for this brief.

**Out:**
- Changes to the renderer, compositor, or CLI.
- ADR (this codifies existing practice, not a new pattern).
- `briefs/index.md` (human index — not under registry drift test).

## Notes

- The frame definition in this brief is a codification, not an invention; it
  derives from the operator's description of the house style. It lands in the
  guide and is open to correction in review.
- The width ceiling (120) is a proposal, not a measurement. The authoring
  contract states 79 as the authoring width (the top rung of the squint ladder,
  `docs/2026-10-12-the-squint-test.md`) and notes the ceiling is unstated.
