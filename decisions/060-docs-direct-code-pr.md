---
type: ADR
callsign: ADR-DOCS-DIRECT-060
---

# Decision: Match the review to the risk — docs merge direct, PRs are for code

**Date:** 2026-10-10
**Status:** Accepted

## Context

The two-machine protocol (2026-09-02) carried one rule for every merge: *merges
go through PRs*. It was written when the silo had one kind of change. It now has
two, and they do not carry the same risk.

Review is a **control**, and a control earns its cost only where the failure it
catches is real. The two artefacts fail differently:

- **Code** — the compiler and the test suite prove nothing *semantic*. A wrong
  design compiles and passes until it doesn't; the failure is a broken binary,
  and a second reader is where correctness and craft get their check.
- **Docs** — the machine-checkable properties (registry agreement, citations,
  dates, prose leaks) are already gated by `just check`. What a PR adds is a
  second *reader for claims* — and the claim is the one thing no gate can check
  (*a citation that resolves is not yet a citation that means*). The worst case
  of a bad doc is a wrong sentence, cheap to annotate in place, because git is
  the record and a doc is not executed.

The review itself did not go away — it **moved**. The **two-hander** (a near-hand
agent on the task, a far-hand agent on the review, recorded in `td`) is the review
mechanism, and it reviews docs as it reviews code. What the PR added on top, for a
doc, was faff.

## Decision

**Docs and doc changes merge to `main` without a PR. PRs are reserved for code.**

- A doc change still **branches** (`feat/<name>`, or the tier's own convention),
  commits, and **fast-forwards into `main`** — branch hygiene is unchanged; the
  PR gate is what is dropped.
- **Code keeps the PR**, where it serves the **craft** review — *is this as good
  as it could be?* — distinct from the **safety** review the two-hander performs
  (*is this right?*).
- **The two-hander is the review for docs.** "No PR" means the review moved, not
  that docs are unreviewed.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Keep PRs for everything | The ceremony this removes: a doc's PR buys a GitHub round-trip for a failure the gates largely catch and git cheaply reverses. |
| Commit docs directly to `main` (no branch) | Loses branch hygiene and the one-commit-per-change history the orient protocol relies on. "No PR" is not "no branch". |
| No review at all for docs | Removes the control and keeps the green tick. Docs are the artefact a machine gate *cannot* fully check; they lean hardest on a reader, not least. |

## Consequences

**What became easier:** a doc change lands in one step — branch, `just check`,
fast-forward, push.

**What became harder:** the two-hander now **must** cover docs, and its
independence is load-bearing. A near-hand and far-hand sharing a session or model
share blind spots — correlated review, which looks like review and is not. The
far-hand must be a genuinely independent session (ideally a different model),
recorded in `td`.

**Constraints this imposes:**

- `scripts/orient.sh` no longer says *merges go through PRs*; it states the
  two-tier rule.
- The **craft** review is reserved for code. Dropping PRs for code would cost the
  aspiration, not just the faff — this decision drops them for docs only.
- A default, not a prohibition: a doc that wants eyes may still take a PR.

## Related

- `scripts/orient.sh` — the orientation report; the rule lived in its header
- `AGENTS.md` — the rules of engagement (branch hygiene)
- `playbooks/td-playbook.md` — the review workflow the two-hander runs
- `docs/2026-10-10-the-seam.md` — the review moves; the control is matched to the
  risk
