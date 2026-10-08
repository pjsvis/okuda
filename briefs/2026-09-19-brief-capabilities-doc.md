---
type: Brief
callsign: BRF-CAPABILITIES-DOC
date: 2026-09-19
---

# Brief: The capabilities doc — a snapshot inventory, not a changelog

**Created:** 2026-09-19
**Status:** Open
**TD:** td-8f49bd

## Lineage

the reader's 2026-09-19 action list — *"we should have a changelog so that we can state what capabilities we have at any one time"* — and the triage that split it: the request names two different documents, and only one of them is worth its upkeep.

## Extends

the Base Epistemic Attitude, clause 1 (a claim owes its evidence) and clause 3 (a stale ledger is misleading confidently, the one failure ADR-027 names as worse than yapping).

## Objective

Stand up `docs/capabilities.md`: a single page that answers *"what can okuda
do right now?"* — one entry per capability, each entry a **paid claim**.

## Why not a changelog

A changelog's referents are the past; once a release ages, its lines decay and
nothing inside the silo can detect the rot. That is exactly the ledger ADR-027
refuses. The reader's actual question — *what capabilities do we have at this
moment* — wants a **snapshot**, and a snapshot whose every line cites a live
referent is drift-resistant by construction: a capability entry that names its
landing record (callsign, ADR, `file`) can be checked against that record, and
a line whose referent died is visibly unpaid.

## Form

- One section per concern okuda owns (rendering only, per the three-concerns
  test): the closed grammar (blocks, inline styles, tables, mermaid→ASCII),
  navigation (keygrammar, vectors, frames, jump list), speech-adjacent emission
  (restricted-grammar text out), theming (palette, brightness when it lands).
- Each entry: **what it does · the callsign or ADR that landed it · where it
  lives (`file` or `file:line`)**. No entry without all three — an unpaid claim
  does not ship (clause 1).
- A line for the *absence* too, where the absence is a decision: e.g. *"No
  light mode — the override is the light mode"* (docs/showcase.md) is a
  capability statement of the moat, and it belongs.
- No dates, no versions, no history. The page says *is*, never *was added*.

## Upkeep

Updated at **wrap-up**, in the same commit that lands the capability — the
entry is part of the landing, not a follow-up chore. Indexed per the registry
principle (`docs/` index, `just reg-sync-fix`).

## Neighbours — what this is not

- Not `README.md` (the pitch, aimed outward). Not `docs/showcase.md` (a
  regression smoke document — one input exercising every block; the inventory
  lists capabilities, the showcase *tests* them). Not the briefs/ADR/debrief
  tiers (those answer will-we/why/what-happened; this answers *what-is*).
- `just orient` may cite it; it does not replace orientation.

## Scope

In: `docs/capabilities.md`, its index entry, one pass over the current tree to
write it honestly (render.ts, keygrammar.ts, vectors.ts, frames.ts, palette.ts).
Out: any history, any roadmap ("Recommended" lives in `&next.md`), any
automation beyond the registry sync.
