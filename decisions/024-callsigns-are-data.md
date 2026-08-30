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
`BRF-CONTENT-SHORTLIST` (2026-08-30) made `rg -l` the launcher's content path,
and the calculus changed: a callsign lives in the frontmatter of the file it
names, so `gloam -g <callsign>` resolves it through the ordinary content
shortlist — a shortlist of one. The dedicated resolver, the bootstrap
automation, and the index column would be a second mechanism for a job the
launcher now does as a side effect.

Meanwhile the callsigns' actual job needs none of that machinery. Out-of-band
handles (voice, paper, SSH chat) require only that the callsign is written in
the file and stable across renames. The convention already lives de facto —
`callsign:` frontmatter across briefs and decisions.

## Decision

Callsigns are **assigned frontmatter data, nothing more**. Resolution is
`gloam -g <callsign>` (the content shortlist), not a dedicated registry
lookup. The bootstrap automation, the `gloam <callsign>` resolver, and the
index callsign column are deferred until the pain of hand-assignment is loud
enough to build them.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Dedicated `gloam <callsign>` resolver (registry lookup) | A second mechanism for a job `gloam -g` does as a side effect; two resolution paths means two things to keep honest |
| Build the bootstrap + registry lift now | Automation solves an assignment friction nobody has felt yet; the corpus is small enough that hand-assignment is not onerous |
| Retire the mnemonic convention | Out-of-band references happen regardless ("that butt-dial doc"); killing the convention kills consistency, not usage |

## Consequences

**What became easier:**
- No epic. BRF-SILO-MNEMONICS shrinks from an infrastructure brief to a
  naming convention.
- Resolution is uniform: every document is findable by name, by content,
  and by callsign through one pipe.

**What became harder:**
- No fuzzy guarantee — a half-remembered callsign fails exact `rg` match
  (fzf narrowing over the shortlist softens this).
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
- No new resolution paths without revisiting this ADR — if `gloam -g` ever
  cannot resolve a callsign, the ADR is wrong, not the callsign.

## Related

- Brief: `briefs/2026-08-28-silo-mnemonics.md` (amended 2026-08-30 — machinery
  deferred)
- Brief: `briefs/2026-08-30-brief-content-shortlist.md` (the brief that ate
  the mnemonic epic's lunch)
- ADR: `decisions/016-argv0-launcher-dispatch.md` (gloam/okuda dispatch — `-g`
  is a sub-dispatch within ADR-016's contract)
