---
type: ADR
callsign: ADR-RECORD-LINKAGE-065
date: 2026-10-14
---

# Decision: The record's linkage — a debrief declares its briefs

**Date:** 2026-10-14
**Status:** Accepted
**Enforced by:** `scripts/debrief-link-lint.ts --gate` (resolution), the shrink-only baseline `scripts/debrief-link-baseline.json` (coverage), `tests/debrief-link-lint.test.ts`

## Context

A brief is the record of intent, a debrief the record of what happened, and the
edge between them is the one edge that makes a landing mechanical: given a
debrief's declared brief, the brief's status, its archive move and its panel row
are all checkable by command. That edge did not exist. `DBF-COMPRESSION:58`
measured it while doing the work by hand — only two debriefs named their brief in
a field — and the cost was a whole sitting of grep-and-hand-verify, in which
**two of six briefs that looked landed were not**: `BRF-COMMISSION-BLANDINGS`'s
own debrief says the commissioning is still open, and `BRF-PROLONGED-PRESS` has
open child tasks. *Verify against the tree, not the narrative* is only cheap once
the tree and the narrative are joined by a resolvable edge.

Four of 47 debriefs carry a brief in their registry `meta` (four, not two — the
extra two predate the panel reading), and eight carry a `**Briefs:**` body line.
The rest carry prose in `## Related`, which is a mention, not a reference.

## Decision

**A debrief's frontmatter carries `briefs:` — the brief callsigns the debrief
measures — and a lint gates resolution and ratchets coverage.**

- `briefs:` is a list of **callsigns**, not paths: a callsign is the citation
  currency (`playbooks/td-playbook.md`, the valve), it resolves live *and*
  archived (`ADR-ARCHIVE-RESOLUTION`), and `callsign-lint` validates it for
  free because frontmatter is in the scan set.
- **`briefs: []` is a legitimate and different value from absent.** Empty says
  *this work had no brief* — infra and theme work that never briefed, which
  `&briefs.md` already names as 7 of 16 debriefs. Absent says *not declared*.
  A missing row is a finding, not a default.
- **Resolution gates; coverage ratchets.** A declared callsign that does not
  resolve fails `just check`. A debrief with no `briefs:` key is grandfathered
  by `scripts/debrief-link-baseline.json`, which may only shrink — the house
  idiom (`scripts/td-id-baseline.json`, `callsign-baseline.json`,
  `lexicon-baseline.json`). New debriefs must declare; the old debt is named
  rather than hidden, and the compression sitting shrinks it.
- **The field is written at the close, beside the brief's status update** — the
  debrief post-checklist already has that step (`playbooks/debriefs-playbook.md`).

`docs/ideas.md`-style backfill is deliberately *not* attempted here: deriving 43
missing edges by inference would write claims no author verified, and an
inferred citation is an **unpaid claim** — the one thing the house refuses. The
baseline is the honest form of the same information: *not yet declared*.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| A `**Briefs:**` body field, no lint | The status quo with a nicer convention: not machine-read, not validated, and drift is silent — which is the measured defect, not a hypothesis |
| Merge `briefs/` and `debriefs/` into one folder | The two tiers answer different questions and have different lifetimes (`playbooks/playbooks-playbook.md:23,26`): a brief settles to `.archive/briefs` at `done`/`rejected` (`ADR-ARCHIVE-BREADTH-063`), a debrief is frozen and never moves. Path is tier — `reg-sync`, `archive-lint`, `EXCLUSIONS` and `loadCallsigns` all key on it (`ADR-ARCHIVE-RESOLUTION`). And a reference beats proximity: a debrief that **names** its brief resolves; one that sits beside it only suggests |
| Infer the edges mechanically and write them in | Writes citations no author verified; an inferred edge that is wrong is an unpaid claim, and the point of the edge is that it is *verified* |
| Rename the 47 debriefs to carry the literal `debrief` token | A real asymmetry — a brief's basename announces its tier out of context and a debrief's does not — but the blast radius (47 renames, every citation, the archive) is out of proportion to a defect the *directory* already covers. Deferred, recorded in the ledger |

## Consequences

**What became easier:**
- The landing pass becomes a command: declared briefs, their statuses, and
  whether the tree agrees.
- `&briefs.md`'s "landed" rows and the debriefs can be reconciled by machine.
- A debrief with no brief is now a *claim* (`[]`) rather than an omission.

**What became harder:**
- Every debrief carries a new mandatory field, and 43 of them are baselined debt
  that must be paid down by reading, not by inference.
- Frontmatter gains a list; `reg-sync` does not mirror it, so the field is
  document-side only and `callsign-lint` is the only checker of its contents.

**Constraints this imposes:**
- A `briefs:` entry must be a **callsign**; a path is a mention and will not
  resolve. (A brief's filename is not its callsign — `DBF-COMPRESSION`'s own
  residue.)
- The baseline may only shrink. A new debrief with no `briefs:` key is a
  violation, not a grandfathered omission.
- **The backfill touches frontmatter only, never the body.** A debrief's prose is
  frozen on completion (`playbooks/debriefs-playbook.md`); the 26 fields added
  here are registry-facing metadata, the same class as the callsign `reg-sync`
  writes, and each transcribes a pointer the debrief's author had already written
  in the body. No edge was reasoned out and written in.

## Related

- `BRF-IDEA-LEDGER` — the brief this decision is made under
- `playbooks/debriefs-playbook.md` — the field and the close-time step
- `scripts/debrief-link-lint.ts`, `scripts/debrief-link-baseline.json` — the gate and the debt
- `debriefs/2026-10-14-debrief-the-compression.md` — gap 3, the measurement
- `decisions/052-archive-resolution-tier.md` — why a callsign resolves after the move
- `decisions/063-archive-breadth.md` — what *settles*, for the demotion rule
- `decisions/064-idea-ledger.md` — the intake gate at the funnel's other end
