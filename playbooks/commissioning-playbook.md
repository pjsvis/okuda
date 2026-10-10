---
type: Playbook
callsign: PLY-COMMISSION
date: 2026-10-10
---

# Commissioning Playbook

How a new silo is born — from a name to a pushed, visitor-ready repository.
The structural reference (what a silo *is*, and its minimum shape) is
`playbooks/silo-playbook.md`; this playbook owns the **procedure**. Read it when
you are about to create a silo, and add to it every time one is made.

## The principle — impose the contract, defer the policy

A silo starts thin because **the less imposed at the beginning, the easier it is
to accommodate what is learned later**. But minimalism has a floor: below it, a
silo is not accommodating, it is absent — private conventions and a memory that
cannot be regenerated.

The test for what belongs on day 1:

> **Can this be added later without re-deciding something already decided?**
> *Yes* — defer it. *No* — impose it now.

The **registry contract** (frontmatter `type`, `callsign`, `date`; the index
agrees with the directory) fails the test — add it late and the whole corpus
migrates. It is the floor. The **lints** pass the test — each can arrive when the
corpus can feed it, without touching an earlier decision. They graduate.

**Impose the contract; defer the policy. Minimal at the edge, explicit at the
core.**

## The residue — what a silo ships with

The tree, and the rule *do not create a folder until you need it*, are
`silo-playbook.md`. On top of that minimum, commissioning adds the machinery that
makes the memory real. Day 1:

- **Identity and constitution** — `README.md`, `AGENTS.md` (scope named tightly),
  `system.md` (the Protocol), `index.md` (the bundle manifest), `DEPENDENCIES.md`,
  and `conceptual-lexicon.md` (a stub is fine).
- **Memory** — the registers it needs now (start with `briefs/`, `decisions/`,
  `playbooks/`), each with its registry; the registry tooling and the `reg-*`
  CLIs; `.gitignore` (the scratch tier); and **a founding record**, so the silo
  has memory from its first commit.
- **Actuator surface** — a `justfile` whose `orient`, `check` and `help` exist as
  vocabulary, even where a target is empty (`silo-playbook.md`).
- **Remote** — `git init`, the GitHub origin, visibility decided.

## Stamp, don't mirror

The template is a **stamper, not a directory of copies**. It reads the live
canonical items — the Protocol, the registry tooling — from the single source at
stamp time and writes them into the new silo. A checked-in copy of the
constitution is a **parallel store**: the two drift the moment either is edited,
and *less imposed* quietly becomes *more duplicated*. One authority; the stamped
files are outputs, not stores.

## The checklist

1. **Name and scope**, one line each; the name must name something that exists.
2. **Remote first** — `git init`, create the GitHub repo, decide visibility.
3. **Stamp** the identity and constitution from the canonical source —
   `just new-silo <dir> "<Name>" "<desc>"` in the incubator silo.
4. **Create the registers** it needs now, each with its registry.
5. **Wire the actuator** — `justfile`; day-1 `just check` is `reg-sync --all` and
   nothing else.
6. **Write the founding record** — a genesis brief or decision.
7. **`just check` green, then the first commit**, on a branch.
8. **`just orient`** answers state; push.
9. **The visitor test** on a cold clone.

## Acceptance

- **Visitor test** — a cold clone → `just` → a visitor can answer *what is this,
  how do I act, where is the work, how do I run it* from the repository alone.
- **Barnacle test** — every citation that existed before a move resolves after
  it, and every authority is single. The class is *the stale ledger, misleading
  confidently*; a spin-off that leaves a dangling citation, a duplicated
  authority, or a stale index row is not done (see the file
  `briefs/2026-10-10-brief-commission-blandings.md`).

## What graduates (not day 1)

`date-lint`, `archive-lint`, `td-id-lint`, `tree-lint`, the `pre-push` hook, and
the coupled checks (`callsign-lint`, `prose-check`, which need a resolver). Each
arrives when the corpus can feed it. An empty gate that always passes teaches the
next silo that gates are decorative.

## Field notes — what we learn, appended

- **2026-10-10** — first extraction, for Blandings. Findings: `reg-sync` is pure
  and portable; `callsign-lint` and `prose-check` import the product's `src/root`
  and cannot be copied, only earned — so day-1 `check` begins at registry
  agreement. The template must be a stamper, not a mirror, or the first spin-off
  reproduces the barnacle it was meant to avoid. The stamper is `just new-silo`
  (`templates/silo/` + `scripts/new-silo.sh` in the incubator); it drives
  `reg-sync` on **named tiers** (`briefs decisions playbooks`), because `--all`
  assumes every configured register directory exists and a newborn silo has only
  three. `reg-menu` pulls `jump-demo`, so it graduates rather than shipping.

## Open questions

- Where the procedure lives once it leaves the incubator — this tier, or a shared
  one — by the general/local test.

## Related

- `playbooks/silo-playbook.md` — what a silo is; the minimum shape, the scratch
  tier, the justfile facade
- `playbooks/registry-playbook.md` — the registry schema and `reg-sync` workflow
- `playbooks/playbooks-playbook.md` — the knowledge system; which artefact a
  thought belongs in
- `playbooks/td-playbook.md` — task identity, the pre-commit gate, branch hygiene
- `briefs/2026-10-10-brief-commission-blandings.md` — the commissioning of
  Blandings, this procedure's first run
