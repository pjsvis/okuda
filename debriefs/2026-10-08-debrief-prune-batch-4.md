---
type: Debrief
callsign: DBF-PRUNE-BATCH-4
date: 2026-10-08
---

# Debrief: Prune batch 4 — the batch that deleted nothing, and why

**Date:** 2026-10-08
**Status:** Done
**Briefs:** `BRF-DOCUMENT-LIFECYCLE` (Phase 4)
**ADR:** `ADR-DOCUMENT-LIFECYCLE-057` — the keep-class, and the read

# Debrief: Prune batch 4 — the batch that deleted nothing, and why

## What happened

Batch 4 was the first that no mechanical test could decide: the unique fragments
`docs/2026-08-29-from-intent-to-task-01/03/06.md`. Neither is a duplicate —
nothing in the corpus contains ≥85% of any of them (checked against every
document in all six tiers) — so the containment standard that decided batches 2
and 3 returned nothing.

That leaves the **extract check**: is the lesson they carry already stated in a
Thing? It is a read, and the read was done for the smallest, `-06`.

## The read that saved a document

`-06` is *"Ephemeral UI Rendering & Mnemonic Recall Specification"* — an imported,
uncited, AI-generated spec. Every mechanical signal said **delete**: unique,
uncited, unaddressed, "imported Stuff", the scratch class.

Reading it says **keep**, and the reason is the policy's own keep-class. The
document specifies a design the system did **not** build and quietly refused:

- a `$REPO_ROOT/.telemetry/index.json` parallel store — refused by the registry
  playbook's *no parallel stores*, and by the actual design (a derived jump map);
- `[domain]-[subdomain]-[descriptor]` mnemonic handles — a different addressing
  scheme from the callsign convention that won;
- a "Jimmy / Fleet" orchestrator — a component that does not exist.

> **Rejections are the moat.** This is the record of a considered design the
> system diverged from, and it is the species of document a keyword grep cannot
> classify. Its one claim that *is* canonical (mermaid `flowchart TD` only) is
> already an authoring rule — which is exactly why the rest, the part nobody
> built, is the part worth keeping.

## The doctrine, applied

Batch 3's rule was *a keyword grep flags candidates; keep-class is read for the
reversal*. This batch is that rule doing work in the other direction: the
heuristics — not a grep this time, but uniqueness, citation, and register — all
said *deletable*, and the read said *this is a refusal's record*. The instrument
that saved it was the one the policy names: **read the document**.

`-01` and `-03` (619 and 443 words) need the same read and did not get it here:
this session's context is spent, and a judgement made on a skim would be the
thing the policy forbids. They are held.

## What is next

- `-01` and `-03`: the same extract check, by a fresh hand, with the question
  stated per document — *is the design here the one the system built, the one it
  refused, or one it never noticed?* Only the third is disposable.
- The pattern this batch establishes: past the duplicates, the pruner's tests run
  out, and every further deletion rests on a reading that must be recorded.

## Related

- `ADR-DOCUMENT-LIFECYCLE-057` — the keep-class
- `playbooks/registry-playbook.md` — the lifecycle checklist
- `DBF-PRUNE-BATCH-3` — containment, and the doctrine this batch applies
