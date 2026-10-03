---
type: Brief
callsign: BRF-ARCHIVE-RESOLUTION
date: 2026-10-03
---

# Brief: The archive resolution tier — citations must survive the archive move

**Date:** 2026-10-03
**Status:** Done — shipped same sitting as the sweep it unblocks (commit
982056a on `feat/archive-sweep`): all five acceptance criteria green,
`just check` + 582 tests, the debrief (DBF-ARCHIVE-SWEEP) written; the
operator amended the sweep commit's message in the same sitting — the
valve caught the td-ID and the unresolvable ordinal in it before push.
**Lineage:** the 19-brief archive sweep (`feat/archive-sweep`) tripped the callsign
checksum: eleven live documents — six debriefs, a playbook, DEPENDENCIES.md,
three docs — cite callsigns whose briefs had just been archived, and
`just check` refuses to ship the sweep while its own closing ritual
orphaned the record it closes against.

## The gap, stated honestly

The archiving playbook (`playbooks/briefs-playbook.md` §Archiving) moves
the brief, drops the INDEX entry, reg-syncs, commits. What it never
answered: *what happens to the citations?* A debrief cites its brief by
callsign — that is the whole point of callsigns. Archive the brief and
every one of those citations resolves nowhere. The checksum brief's own
gate ("citations that resolve nowhere fail") then fails on the work that
*followed the playbook exactly*. The procedure was correct and incomplete.

## Two designs

**A — Archive registry tier (chosen direction, ADR-ARCHIVE-RESOLUTION):**
`.archive/briefs/` gets its own `INDEX.jsonl`, maintained by the same
reg-sync mechanism (one maintenance mechanism, two consumer scopes).
`loadCallsigns` reads live tiers + archive tier; the launcher's registry
channel keeps reading live tiers only — search stays the work queue,
resolution becomes the permanent record. The registry principle (rule 6)
already mandates this: `.archive/briefs/` accumulated 36 documents —
a directory that accumulates documents gets a JSONL index.

**B — Frontmatter fallback scan:** on registry miss, scan `.archive/**`
frontmatter directly. No second registry — but a second *resolution
path*, paid on every miss, and frontmatter-only truth in the archive
inverts the "registry is the fast index" invariant. Rejected: a code
path that exists to avoid a generated file is decorated Stuff.

## Acceptance criteria

1. The 19 swept briefs' callsigns resolve through the product's own
   resolver (`resolveByCallsign`), from live documents and from the
   unpushed commit-message range — no baseline grandfathering of
   archive-citable callsigns (the ratchet stays a ratchet; shrunk
   baseline entries are pruned, and the prune is committed).
2. `.archive/briefs/INDEX.jsonl` exists with 36 entries, reg-sync
   maintained; reg-sync reports no drift for the archive tier.
3. The launcher corpus is byte-identical before and after: archive
   paths appear in no search channel (`EXCLUSIONS` states the guard —
   `-g !.archive/**` — so the parked "view gitignored folders" switch,
   should it ever land as `rg -uu`, cannot silently un-hide the archive).
4. The drift test (`tests/reg-callsign.test.ts`) pins both lists:
   live tiers stay 1:1 with reg-sync's live REGISTRIES; archive tiers
   pinned separately, same index-filename check.
5. `just check` passes; the sweep commits green on `feat/archive-sweep`.

## Out of scope

- Debriefs do not move (shared debriefs cover live briefs; per-brief
  debriefs are the debriefs tier's own closing question).
- The gitignore switch stays parked per the operator's call.
