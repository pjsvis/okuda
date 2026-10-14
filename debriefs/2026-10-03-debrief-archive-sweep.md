---
type: Debrief
callsign: DBF-ARCHIVE-SWEEP
date: 2026-10-03
briefs: [BRF-ARCHIVE-RESOLUTION]
---

# Debrief: The archive sweep — closing the loop the procedure left open

**Date:** 2026-10-03
**Status:** Done
**Brief:** BRF-ARCHIVE-RESOLUTION (`briefs/2026-10-03-brief-archive-resolution-tier.md`)
**TD:** the sweep task, `feat/archive-sweep`, commit cbbaa28

## What happened

The operator named a gap: completed briefs were staying in `briefs/`
after landing — 19 of them, some done for five weeks. The sweep moved
them to `.archive/briefs/` per the archiving playbook and immediately
tripped the callsign checksum: eleven live documents (six debriefs, a
playbook, DEPENDENCIES.md, three docs) cited callsigns that had just
gone dark. The playbook's archiving ritual moved the files and dropped
the INDEX entries but never said what happens to the citations. Nothing
did — so they broke.

## Why

The archiving procedure treated the registry as one list serving two
consumers. It isn't. Search (the launcher's registry channel, silcrow
discovery) is the work queue and must exclude the archive. Resolution
(the resolver, the unpushed message range) is the permanent record and
must include it. A debrief citing its brief is the citation namespace
working as designed; archiving the brief must not orphan the citation.
ADR-ARCHIVE-RESOLUTION (`decisions/052-archive-resolution-tier.md`)
splits the lists:
`ARCHIVE_REGISTRIES` feeds `loadCallsigns`; `TIER_REGISTRIES` feeds the
launcher. `EXCLUSIONS` states `-g !.archive/**` so the exclusion holds
by glob, not by rg's hidden-file default.

The gate refused the sweep until the design caught up — the checksum
doing precisely what it was built to do (861095a). Without it, the
sweep would have shipped eleven silently broken citations and a commit
message that resolves nowhere.

## What's left

- The drift tests now pin both lists (`tests/reg-callsign.test.ts`):
  live tiers 1:1 with reg-sync's live entries, archive entries pinned
  separately. Future archive tiers (`.archive/debriefs/`, if the
  debriefs tier ever closes work the same way) join `ARCHIVE_REGISTRIES`
  and reg-sync together — one mechanism, growing scope.
- reg-sync bootstrapped callsign frontmatter onto the 17 pre-callsign
  archived briefs (82 insertions, zero deletions — additive only).
- The baseline shrank by one entry and was pruned, not argued with.
- The gitignore switch stays parked, per the operator's call.
