---
type: ADR
callsign: ADR-ARCHIVE-RESOLUTION
date: 2026-10-03
---

# Decision: The archive resolves — resolution and search diverge at the archive boundary

**Date:** 2026-10-03 · **Status:** Accepted

## Context

The 19-brief archive sweep (`feat/archive-sweep`) exposed a latent design gap:
the archiving procedure drops a brief's INDEX entry on move, and with
it every citation to that brief. Eleven live documents — debriefs that
must cite their briefs, a playbook, DEPENDENCIES.md, docs — went dark
the moment their targets archived. The callsign checksum (ADR-aligned
lint, 861095a) correctly refused the commit.

The prior stance — TIER_REGISTRIES as "one list, two consumers, no
drift" (src/root.ts) — holds for the *live* silo and collapses at the
archive: search must exclude the archive (the live list is the work
queue, not a graveyard — briefs-playbook), but resolution must
include it (the archive is the permanent record; a debrief citing its
brief is the citation namespace working as designed). The two
consumers genuinely diverge at this boundary; forcing one list to
serve both either orphans citations or pollutes search.

## Decision

The archive is a **resolution tier, not a search tier**:

1. `ARCHIVE_REGISTRIES` (`.archive/briefs/INDEX.jsonl` etc., as
   archive tiers accumulate) is a second, separate list in root.ts,
   maintained by the same reg-sync mechanism (one maintenance
   mechanism; `REGISTRIES` marks archive entries so the drift test
   can pin each list against its own consumer).
2. `loadCallsigns` reads live + archive registries — the resolver's
   oracle is the whole permanent record, live and settled.
3. The launcher's registry channel and silcrow validation keep
   reading live registries only — search and discovery stay scoped
   to the work queue.
4. `EXCLUSIONS` states `-g !.archive/**` — the exclusion holds by
   glob, not by rg's hidden-file default, so a future `-uu`/no-ignore
   switch (parked, not dropped) cannot silently un-hide the archive.

## Consequences

- Archived callsigns resolve: jumps, silcrows, and the unpushed
  message range stay honest against the permanent record.
- The drift test splits: live tiers stay 1:1 with reg-sync's live
  entries; archive entries pinned separately, same filename check.
- Baseline entries that become resolvable are *shrunk* — pruned on
  discovery, not grandfathered. The ratchet stays a ratchet.
