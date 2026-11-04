---
type: ADR
callsign: ADR-GATE-JUDGES-HEAD-080
date: 2026-11-04
---

# Decision: A gate judges the record, not the desk — two modes, and the shared index

**Date:** 2026-11-04
**Status:** Accepted — the remedy was chosen in conversation on 2026-11-04 (the
sibling session that found the class concurred on R4 and handed the record over);
this is the writing-down.
**Enforced by:** *nothing — advice, today.* The decision changes what
`scripts/reg-sync.ts --gate` reads, and that change is not built: the instrument it
names is a test asserting that a **dirty working tree passes `--gate`** while a
**stale committed ledger fails it**, which is one fixture and two assertions.
`td-e60434` carries the implementation.

## Context

Two commits in one hour swept work that was not theirs. Both times the *content*
survived intact and both times `git log` could not attribute it, because the
mechanism was never the content: `git commit` with no pathspec takes **the index**,
whoever staged it. `git add` by name, verified by `git diff --cached`, protected
nothing — the index is a shared variable in a shared checkout.

Underneath that sat a worse shape, and it is the one this record decides. `just
check` runs `bun scripts/reg-sync.ts --all`, which **fails** when a document and
its derived registry row disagree, and whose only remedy is `--fix` — a write to
the derived registries. So in a shared checkout **a green check is a mutation
right**: a session that needs green cannot obtain it without writing paths another
session has declared it is holding. The gate did not merely fail to prevent the
crossing; it *manufactured* it, and then the seam rule asked the crossing to
declare itself after the fact.

The class is not new to this silo. `docs/2026-10-10-the-seam.md:122-132` already
names the **second writer** — the participant inside the boundary, writing into the
shared working surface — and its failure: *"a write from the principal arrives, to
an agent, with no author and no declaration — an unattributed change
indistinguishable from drift."* Its worked instance is a sibling agent reverting a
principal's edit twice over a worktree. What today adds is not the class but the
**mechanism**: the crossing is not a file another party wrote, it is a shared
*index* plus a gate that can only be satisfied by a write.

## The class, named

> **A check that cannot be satisfied read-only demands a write, and a write needs
> an owner.** Where the checkout is shared, the demand is also a crossing.

## Decision

**Two modes, and the mode is the question of what is being judged.**

| mode | judges | who runs it | what fails |
| --- | --- | --- | --- |
| `reg-sync --gate` | **HEAD** — `git show HEAD:<index>` against `git show HEAD:<document>` | `just check`, and eventually a pre-commit hook | a committed ledger that disagrees with the committed record |
| `reg-sync --all` | **the working tree**, as today | the author, before committing | a document whose row has not been regenerated yet |

A dirty working tree is **not a defect**; it is work in progress. Demanding it be
clean asks the gate to judge the desk instead of the record, and the record is the
only thing the instrument was ever about: *"an unrecognised status must be
reported, because silently storing `open` for it is how a row drifts out of
agreement without anyone noticing"* (`scripts/reg-sync.ts:151-157`).

**Two constraints on the gate mode, both stated rather than silent:**

1. **It declares which mode it ran in.** `--gate` reading HEAD is a different
   question from `--all` reading the tree, and a verdict whose question is unknown
   is the *undisclosed scope* the seam rule names as the defect class.
2. **Outside a git repository, or in a detached state where `HEAD:` cannot be
   read, the gate falls back to the working tree and says so.** A fallback that
   reports itself is a reading; one that does not is a lie about the instrument.

**And as operational habit, not as decision: one worktree per concurrent session**
(`git worktree add`). It fixes nothing about the gate and it is not offered as a
remedy — it removes the contention that makes the gate's demand expensive, and it
is what would have prevented both sweeps.

## Alternatives Considered

| Alternative | Why Rejected |
| --- | --- |
| **The gate reports drift without failing** (a reading, like `just surface-probe`) | Loses the instrument. `reg-sync` exists precisely because a derived ledger answered confidently while wrong: a row *silently wrong for five weeks*, found only when a check was written to refuse to guess — *"a ledger that answers confidently when it does not know is worse than one that fails"* (`docs/2026-10-06-the-shared-artifact.md:102`); and `twenty rows disagreed with the registries` the day `brief-queue` was written (`scripts/brief-queue.ts:8`). The stale ledger is ADR-027's barnacle class, not a tidiness complaint. |
| **Derived registries generated at read time, never committed** | Breaks addressing. `resolveByCallsign` reads `INDEX.jsonl` off disk (`src/root.ts:181`, `:230`), so a fresh clone would resolve no callsign until something builds. That trades a coordination convenience for the property the silcrow rests on — and it is the property, not the convenience, that the corpus is for. |
| **Worktrees as the remedy** | Removes the contention, judges nothing. A gate that demands a write in a shared tree still demands one if two sessions ever share a tree again — and they will, because the operator works in one. Adopted as habit instead. |
| **Leave the gate, announce crossings better** | The seam rule already asks crossings to declare themselves, and that is what failed: the declaration arrived after two commits. **A rule that requires announcing a defect the tooling manufactures is a rule with no test** (`ADR-PERIMETER-039`). |
| **A lock file over the derived paths** | Ceremony over a problem git has already answered. `git worktree` is the environment's own response to contended working state (`ADR-ENVIRONMENT-ANSWERS-068`); a lock file is okuda inventing a worse one. |

## Consequences

**What became easier:**

- A session with dirty derived files is **green**, so a green check no longer
  requires a write into paths another session holds. The manufactured crossing
  disappears by construction, not by announcement.
- The instrument is kept: a stale *committed* ledger still fails, which is the only
  case that ever mattered.
- The house already had the shape, twice over: `prose-check` is a meter while
  `--strict-leaks` is the gate; `squint-probe` prints and does not gate;
  `just surface` reads while `--gate` acts (`justfile:128`). A gate with two
  audiences is one gate with two modes.

**What became harder:**

- **Two code paths where there was one**, and the author must know which to run
  before committing. The mitigation is the mode declaration, and it is a
  mitigation.
- **`git show` is a new dependency inside a lint** that previously read the
  filesystem only. Outside a repository the fallback has to be loud, and a
  fallback that is loud in a log nobody reads is a fallback that is silent.
- **The cheaper lesson is not the decision.** `git commit -m … -- <paths>` — a
  pathspec commit — limits *inclusion* to the named paths no matter what else is
  staged, and would have prevented both sweeps without any of this. A brand-new
  file still needs `git add` first: a path git does not yet know is a pathspec
  error, which this record learned by hitting it. It is adopted as habit on every
  session, and written here because a habit with three witnesses beats a rule with
  none.

## Related

- `docs/2026-10-10-the-seam.md:122-132` — the second writer, and the working
  surface as shared memory; the class this record supplies a mechanism for.
- `decisions/027-temperament-is-downstream-of-discipline.md` — the stale ledger
  *misleading confidently*; why the gate may not become a reading.
- `ADR-ENVIRONMENT-ANSWERS-068` — the environment's own answer outranks an invented
  convention; where `git worktree` comes from.
- `ADR-PERIMETER-039` — a rule that gets rediscovered is a rule with no test.
- `playbooks/registry-playbook.md:139` — no parallel stores; the reason two
  session-local registries are not an option.
- `td-e60434` — the class and the remedy, found 2026-11-04 in this checkout.
