---
type: Debrief
callsign: DBF-MACHINE-FORK
date: 2026-11-09
tags: [git, ref-census, sessions, accounts, npm, decisions]
agent: pi (ses_b78ac6)
environment: local
briefs: [BRF-PLATFORM-PACKAGES]
---

# Debrief: The machine forked itself, and every gate stayed green

**Date:** 2026-11-09
**Status:** Reconciled — `main` = `origin/main`, 24/24 gates in 16s, 1047 tests.
Two defects filed rather than papered over.

## What was asked

Finish the npm playbook note about lost second factors. Instead of landing it, I
found the repository had forked — across two days, on one machine, with five or
six okuda sessions alive at once and **not one gate complaining** until the very
end.

## What the state actually was

Merge-base `2398aa0`, my last push. Above it, two different histories:

| Ref | State | Whose |
|---|---|---|
| `origin/main` | five commits — the "a gate runs the file it checked" thread | pushed by one line |
| local `main` | one commit (`BRF-EDITOR-HINT`) sitting on `2398aa0`, 5 behind origin | committed **straight to main** |
| `feat/legibility-surface` | five commits, siding, one ADR among them | a live session's; the surface-pair brief and that ADR live only on the branch |

My own branch had inherited the legibility five, because I branched from local
`main` while another session had committed there. That is the moment to notice
what the house rule is for: *never commit to `main`*, and the rule is not
hygiene, it is the only thing that keeps two sessions from writing two `main`s.

## How it was reconciled, and why in that order

1. **Spot the fork** — `git merge-base --all HEAD origin/main`, then the two
   commit lists. Not `git log --graph --all`, which shows shapes; the two-set
   difference shows *ownership*.
2. **Rebase the stray commit onto origin**, not reset it. `BRF-EDITOR-HINT` is
   somebody's brief; the conflict was entirely in derived artefacts
   (`briefs/INDEX.jsonl`, `briefs/index.md`, `&briefs.md`), so the resolution was
   `git checkout origin/main -- <those>` then `just reg-sync-fix` and
   `just decide`. **A derived file is never hand-merged** — regenerate it.
3. **Declare, do not land, another session's branch.** The gate's own remedy
   reads *"rebase it, land it, or declare it"*; two of those three spend somebody
   else's decision. The declaration names what landing owes — a renumber, because
   the branch minted an `088` of its own against the published
   `ADR-GATE-RUNS-FILE-088` — and the date by which someone must look again.
4. **Then fast-forward `main`**, push, and delete every merged branch — including
   the one I had pushed mid-flight, because a merged branch still standing is a
   siding too (`ref-census` said so the moment I merged).

## Two defects, filed

**`ref-census` reads local `main`** (`scripts/ref-census.ts:42`, `BASE =
"main"`). So when *main itself* is the stale thing, the census blames every
branch: three branches read "siding (cannot fast-forward)" when all three were
clean fast-forwards of `origin/main` and the one stale artefact was local main.
A gate that points at the wrong artefact is the failure mode this file exists to
avoid — it just happened to be pointing at itself.

**Two ADRs can wear the same ordinal.** `callsign-lint` checks that a callsign
*resolves*, and both `088`s do. `reg-sync` builds one index per line, so each
line is internally consistent. The collision exists only in the **difference
between two refs**, which no gate reads — so two sessions can each mint `088`
and only a person reading both sees it. Filed with two remedies: a census over
the union of refs, and a mint-time check that refuses a number at or below the
highest on `origin/main`.

## What was actually being landed

The npm playbook's account section: publishing requires 2FA or a bypass-2FA
token; keep **two** independent factors; recovery codes belong in the key store
away from the device; link GitHub because npm's recovery documentation names it
as the verification shortcut; and the ladder when the device is gone — issuer,
stored codes, then npm's **email-verified** reset, which needs no authenticator.
Plus the timing trap that shapes the whole sequence: a recovery-code login
places a **72-hour hold** that permits adding a 2FA method but blocks publishing
and org/team membership — so recover, add the factor, let the hold expire, *then*
create the org. And the org move itself: npm's documented user→org migration
keeps the scope name, renames the account, moves the packages, and cannot be
undone.

## What this cost, and what it taught

An hour of reconciliation for a morning's confusion, and the confusion was not
about content — every commit was correct. The failure was **coordination**, and
the silo's instruments were reading the wrong witness: `ref-census` compared
branches to a `main` that had itself drifted, so the loudest signal pointed at
the branches. The lesson is one the lexicon already has a name for — *the
instrument reports a ceiling, the probe is a finder not the judge* — and one the
`ref-census` fix will make mechanical: **a census must read the shared truth, not
the local copy of it.**
