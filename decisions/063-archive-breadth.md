---
type: ADR
callsign: ADR-ARCHIVE-BREADTH-063
date: 2026-10-14
---

# Decision: The archive holds the refused, not only the finished

**Date:** 2026-10-14
**Status:** Accepted

## Context

`ADR-ARCHIVE-RESOLUTION` made `.archive/briefs` the **permanent record** and
the resolver's second tier: the live registry is the work queue, the archive is
everything the silo can still cite. But the tier's config carried a single
`defaultStatus: "done"`, and one value did two jobs at once — it was both the
status that *settles* a live document into the archive **and** the only status an
archived document was allowed to carry (`scripts/reg-sync.ts:54`,
`scripts/archive-lint.ts`).

That made refusal homeless. A **rejected** brief settles nothing: it cannot stay
in the work queue (it is not work), and it cannot enter the archive (it is not
`done`). So refused briefs accumulated live forever — the compression the
operator asked for was blocked by an invariant, not by a policy.

The first instinct was to delete them. Measured, that breaks the reference graph:
**all fourteen candidates are cited in live documents** — `BRF-DOCUMENT-LINKS` in
`decisions/025` and three `docs/`, `BRF-PORCH-MATRIX` in `&alpha.md` and four
`docs/`, `BRF-TABLE-GUTTER` in a debrief, `BRF-TUI-LIVE` in `decisions/046`, and
so on — roughly **35 citation sites across ~25 documents**. Delete the brief and
each of those becomes an **unpaid claim**: a citation whose referent no longer
resolves. The citation graph is the oracle (`ADR-DOCUMENT-LIFECYCLE-057`), and
git history holds bytes the resolver cannot see.

The second instinct was to archive the **parked** set too. That is worse in the
other direction: `parked` means *deferred, will revisit* — the SSH family was
parked on 2026-10-14 precisely to be reconsidered — and a status that both
settles and defers cannot mean either.

## Decision

**A tier declares which statuses SETTLE into its archive; for briefs, `done` and
`rejected`. `parked` is not settled and stays live.**

Concretely:

- `RegistryDef` gains an optional `settled?: string[]`; unset means
  `[defaultStatus]`, so every other tier is unchanged.
- `.archive/briefs` declares `settled: ["done", "rejected"]`.
- `archive-lint` queues a live brief when its status is **in the settled set**, and
  rejects an archive entry whose status is **not** — the archive is still settled
  by construction, the set is just honest about what "settled" is.

A refusal is a decision too, and the permanent record is where decisions live.
The archive is breadth, not praise.

## Consequences

- **The live registry shrinks and the archive grows without losing a reference.**
  Refused briefs move to `.archive/briefs/`; `loadCallsigns` reads live **+**
  archive, so every existing citation keeps resolving — no citing document has to
  change.
- **`parked` means one thing again:** deferred and still live. The deferred pile is
  the "we will revisit" queue; the archive is the "this is over" record.
- **The refused set is citable and inspectable** as one tier, which is what makes
  a one-line index over it (`docs/2026-10-14-the-refused.md`) worth writing.
- **A new cost, named:** rejecting a brief is now a *move*, not just a status
  edit — `just reg-sync-fix` and the file move are the same ritual archiving
  already had. `archive-lint`'s queue makes it a reading, never a silent drop.

## Alternatives refused

- **Delete refused briefs.** Breaks ~35 citations across ~25 live documents;
  refused because the graph is the oracle, and an unresolvable reference is an
  unpaid claim.
- **Add `parked` to the settled set.** Refused because it archives the material
  the operator parked *to reconsider* — the deferred pile would vanish into the
  permanent record, which is the opposite of deferred.
