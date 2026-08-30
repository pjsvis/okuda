---
type: ADR
callsign: ADR-CALLSIGN-DATA-024
---

# Decision: Callsigns are data, not machinery

**Date:** 2026-08-30
**Status:** Accepted

## Context

`BRF-SILO-MNEMONICS` (2026-08-28) proposed callsigns as durable human handles —
assigned frontmatter data, lifted into the registry, shown as an index column,
resolved by a dedicated `gloam <callsign>` path, with a deterministic bootstrap
algorithm to assign them at reg-sync time. Two days later
`BRF-CONTENT-SHORTLIST` (2026-08-30) made `rg -l` the launcher's content path.

**Correction (2026-08-30, same day, at self-review).** The first draft of this
ADR deferred "the dedicated `gloam <callsign>` resolver" as unbuilt machinery.
That was wrong: the dispatch shipped before the ADR was written — `d39a414`
(callsign layer: `gloam <callsign>` + footer identity slot, td-bdfce0), with
`resolveByCallsign` in `src/root.ts`, a `CALLSIGN_SHAPE` gate and honest errors
in `src/cli.ts`, and `tests/root.test.ts` coverage. The draft trusted the
document corpus over the source tree; the lesson is recorded in
`docs/2026-08-30-naming-like-nasa.md` — a name must not lie about its
referent, and a decision must not defer what already exists.

The corrected picture: resolution exists today as exact-match registry dispatch
(`gloam <callsign>`, offline, jotted-code fast path); fuzzy/content resolution
joins when `BRF-CONTENT-SHORTLIST` lands (`gloam -g <callsign>` over
frontmatter). These are different contracts, not duplicate mechanisms. What
remains genuinely unbuilt: the bootstrap automation and the index callsign
column.

## Decision

Callsigns are **assigned frontmatter data, nothing more**. Resolution is the
shipped `gloam <callsign>` registry dispatch (exact match, the low-bandwidth
fast path) plus `gloam -g` content search when `BRF-CONTENT-SHORTLIST` lands
(fuzzy recall over frontmatter). Deferred until the pain is loud: the
reg-sync bootstrap automation and the index callsign column.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Retire the shipped `gloam <callsign>` dispatch because the content shortlist subsumes it | Different contracts, not duplicates: exact-match dispatch of a jotted code is offline, O(registry), and fails with an honest error; the shortlist is fuzzy recall over content. Exact and fuzzy are both jobs |
| Build the bootstrap + index column now | Automation solves an assignment friction nobody has felt yet; the corpus is small enough that hand-assignment is not onerous |
| Retire the mnemonic convention | Out-of-band references happen regardless ("that butt-dial doc"); killing the convention kills consistency, not usage |

## Consequences

**What became easier:**
- No epic. BRF-SILO-MNEMONICS shrinks from an infrastructure brief to a
  naming convention.
- Resolution is uniform: every document is findable by name, by content,
  and by callsign through one pipe.

**What became harder:**
- No fuzzy guarantee on the dispatch path — a half-remembered callsign fails
  exact `rg` match (the content shortlist, once landed, softens this).
- Assignment stays manual; the moment corpus scale makes that painful, the
  deferred machinery comes back on the table.

**Constraints this imposes:**
- The searchability contract: a callsign not written in frontmatter does
  not exist. Assignment means writing the `callsign:` key; renames never
  re-derive.
- Uniqueness is scoped to the silo, not the corpus-of-the-world. The repo
  name completes the address: cross-silo references qualify with the silo
  badge (`okuda/BRF-BUTT-DIAL`), so a collision between silos is not an
  error — it is a namespace collision, resolved at reference time by
  qualification. This is what keeps local shortness cheap: uniqueness
  pressure is absorbed by the namespace, never by lengthening the name.
- Two resolution paths is the ceiling, not the floor: exact (registry
  dispatch) and fuzzy (content shortlist). A third mechanism — or a change
  to either contract — reopens this ADR.

## Related

- Brief: `briefs/2026-08-28-silo-mnemonics.md` (amended 2026-08-30)
- Brief: `briefs/2026-08-30-brief-content-shortlist.md` (fuzzy resolution,
  pending)
- Commit: `d39a414` — the callsign layer this ADR initially mistook for
  unbuilt (the correction is part of the record, not an embarrassment to
  be laundered)
- Doc: `docs/2026-08-30-naming-like-nasa.md` (the veto: a name must not
  lie about its referent — a rule this ADR broke once and fixed)
- ADR: `decisions/016-argv0-launcher-dispatch.md` (gloam/okuda dispatch —
  `<callsign>` and `-g` are sub-dispatches within ADR-016's contract)
