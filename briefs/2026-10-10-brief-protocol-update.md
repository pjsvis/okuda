---
type: Brief
callsign: BRF-PROTOCOL-UPDATE
---

# Brief: The protocol update — add the comment-referent rule, and a process that is one edit, one command, one commit

**Date:** 2026-10-10
**Status:** Open
**TD:** (to create)

## Context

`system.md` is the protocol, and updating it should be as cheap as updating any
other document — but it is not obvious how. It is versioned, it is deployed to
the agent runtime across a symlink chain into a **second repository**, and the
current ritual (edit, bump the growing version line, `just protocol-install`,
commit here, commit there) is heavier than the rule it carries. This brief adds
the comment-referent rule and settles the process.

## Objective

Add the **comment's referent** entry to `system.md`'s lexicon, and record a
protocol-update process that is one edit, one command and one commit per repo —
the deploy a build step, not a ritual.

## Evidence

The mechanism today (`scripts/protocol-install.sh`; `just protocol-install`):

- `system.md` is the source; the runtime target `~/.pi/agent/AGENTS.md` is a
  **symlink chain** into `cool-pi-extensions/SYSTEM.md` — so an install writes a
  *second repository's* file.
- The script `cmp`s, copies, and **declares** the chain and the sibling's
  uncommitted state (the impostor-symlink rule, `docs/2026-10-10-the-seam.md`).
- The header carries a version and a growing `Supersedes …` chain (v2.6.0 today,
  back to v1.0.0).
- There is no drift check beyond the install's own `cmp`, which is silent when
  in sync.

So the process is five steps — edit · bump · install · commit okuda · commit
sibling. Four are mechanical; the version line grows without bound.

## Scope

**In:** the lexicon entry (drafted in Notes); the process, recorded where the
next editor will find it; a `just protocol` wrapper if the install and its
declaration are worth one command.

**Out:** *where the protocol should live* — the copy-vs-retire question is an
ADR, not this brief; the content of any other lexicon addition.

## Preconditions

- [x] `system.md` and the deployed copy are in sync. **Verified 2026-10-10**
      (`protocol-install` reports `already in sync`).

## Work Plan

1. [ ] Add the lexicon entry to `system.md`; bump the version clause (one line).
2. [ ] Record the process beside the mechanism (a short section in
      `scripts/protocol-install.sh`'s header, and one line in the playbooks).
3. [ ] Cap the `Supersedes` chain at the last three cuts (prune older), so the
      header cannot grow without bound.
4. [ ] `just protocol-install`; commit `system.md` here; commit the sibling copy
      there (the script names the repo and the file).

## Acceptance Criteria

- The **comment's referent** entry is in `system.md`'s lexicon, with its test and
  its prior art.
- The process is written where the next editor finds it, and is four steps.
- The header's `Supersedes` chain is bounded to three cuts.
- `just protocol-install` reports `already in sync` after the commit.

## Notes

The draft entry:

> - **The comment's referent**: a comment is a claim about a function, and it
>   owes a referent **in that function's scope** — or an explicit pointer to
>   where the referent lives. A comment that names a *feature* while sitting in
>   the half of the code that only *parses* it is an **unpaid claim in prose
>   form**: the reader greps where the comment points, finds nothing, and
>   correctly concludes "half-implemented". The rule: **a comment lives with the
>   contract it describes, not with the bytes it consumes.** Test: name the
>   symbol in this file that cashes the comment's claim. If there is none, point
>   to it or trim the comment to its own scope. Worked instance, 2026-10-10:
>   `splitKeyEvents`' comment named the header-to-header jump, three files from
>   it — and the jump it named was dead.
>   *Prior art:* clause 1 (*every output is a claim*); the audit surface.

The process, in one line: **edit `system.md` → `just protocol-install` → commit
here → commit there.** The deploy is a build step; the drift check is the
install's own `cmp` (idempotent — it prints `already in sync` when there is
nothing to do).

## Related

- `system.md` — the protocol this governs
- `scripts/protocol-install.sh` — the deploy, and the impostor-symlink declaration
- `docs/2026-10-10-the-seam.md` — a crossing declares itself
- `docs/2026-10-10-the-wall-and-the-seam.md` — the same shape (a claim whose referent is elsewhere) one layer up
- BRF-SEAM-AUDIT — the rule this entry records
