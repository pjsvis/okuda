# Briefs Playbook

## What a Brief Is

A brief is the **record of intent** for a piece of work: what we will do, why, what "done" means, and what to watch out for. It is written before the work; the work is the execution of the brief. Everything else in the silo (decisions, debriefs) derives from and references briefs — never the reverse.

Every brief is a single `.md` file in `briefs/`.

## Naming Convention

Every brief is named `YYYY-MM-DD-brief-slug.md`. Strictly date-first.

**Why this is non-negotiable:**

- Briefs are the record of intent; ISO date strings sort lexically = chronologically, so `ls briefs/` is a timeline — cadence and gaps in intent are visible by simple inspection, no tooling required.
- The literal `brief` token keeps the document recognisable when its filename is quoted out of context (ADR Related sections, debriefs, commit messages).

Example: `briefs/2026-08-20-brief-project-initialisation.md`

## Format

```markdown
# Brief: [Title]

**Date:** YYYY-MM-DD
**Status:** [Open | In Progress | Done]

---

## Objective

One sentence. What are we doing and why?

## Scope

**In:** what this work covers
**Out:** explicit exclusions — named so scope creep has nowhere to hide

## Preconditions

- [ ] What must already exist or be verified before starting.
      Verify, do not assume. If a precondition fails, stop and report.

## Work Plan

1. [ ] Ordered, checkable steps

## Acceptance Criteria

* Testable statements. The brief is Done when all are true —
  by inspection or by command, not by vibes.

## Notes

Constraints, risks, known pitfalls, barnacles — anything the executor
needs in order to avoid known issues. Decisions made *during* execution
do not belong here; they go to ADRs (`decisions-playbook.md`).
```

## Writing Rules

- One brief per deliverable. Phased or multi-deliverable work is coordinated in td (`td epic create`), not in extra-large briefs — each phase's deliverable still gets its own brief.
- The objective must be specific: "explain why flat code improves LLM comprehension", not "write about AI".
- No ambiguous language: "should", "maybe", "consider" are banned. State what will happen.
- Acceptance criteria are testable by inspection or command.
- Preconditions are verified before work starts — that is their entire point.
- If acceptance depends on distribution or publishing steps, those steps are acceptance criteria.

## Executing a Brief

1. **Review** the brief before starting.
2. **Verify** every precondition. A failed precondition halts the brief.
3. **Check off** plan items as they complete.
4. **Record** significant choices made during execution as ADRs (`decisions/NNN-*.md`).
5. **Update** Status to `Done` only when all acceptance criteria hold.
6. **Sync** the registry: the `briefs/INDEX.jsonl` entry follows `open` → `in_progress` → `done` (see `registry-playbook.md`).

## Phased Work

Multi-deliverable or phased work is coordinated in **td**, not in epic
files. td offers two distinct constructs — pick by what you need:

- **`td ws`** (work session) — the coordination tool for phased work:
  `td ws start "<initiative>"`, one issue per phase, `td ws tag` them,
  and `td ws handoff` carries shared state across sessions. Use this
  when phases are worked sequentially and each phase's deliverable gets
  its own brief.
- **`td epic create`** — a parent/child hierarchy for reporting and
  tree visualization. Use it when you need an umbrella over issues
  that may be worked independently; it does not provide session
  continuity.

td is the continuity system — it tracks implementation state (claimed,
in progress, handed off with remaining work) across sessions, which a
static document cannot. For most phased brief work, `td ws` is the
right tool. See `td-playbook.md`.

## Archiving

Completed briefs move to `.archive/briefs/` — same filename,
checked in to git, excluded from Gloam search (`.archive` is
dot-prefixed; `walkMarkdown` and `fd` both skip it). The INDEX entry
is removed on move (`just reg-sync-fix`). A completed brief is work
that shipped; keeping it in `briefs/` makes the open list a graveyard.
The archive is the permanent record; the live list is the work queue.

**What does not go in `briefs/` (ADR-017):**

- **Session handoffs** — "where was I?" is not "what will we build?"
  Ephemeral handoffs go to `td handoff`; rich context worth persisting
  goes to `docs/`. Never `briefs/`.
- **Raw research / pasted content** — a brief has frontmatter, a
  `# Brief:` title, a date, and a status. A paste of external content
  is research material; it goes to `docs/`. The INDEX enforces the
  shape; a raw paste fails the gate.
- **Debriefs** — "what happened and why?" is retrospective, not intent.
  Goes to `debriefs/`.

The test: if it answers "what will we build?" with a status and
acceptance criteria, it's a brief. If it answers anything else, it's
in the wrong folder.

## Review Checklist

Before committing a brief:
- [ ] Filename is `YYYY-MM-DD-brief-slug.md` (date-first — see Naming Convention)
- [ ] Objective is specific and actionable
- [ ] Scope has explicit exclusions
- [ ] Preconditions are realistic and verifiable
- [ ] Acceptance criteria are testable
- [ ] No ambiguous language ("should", "maybe", "consider")
- [ ] Registry entry exists and its status matches the brief

## Related

- `playbooks/registry-playbook.md` — index schema and sync workflow
- `playbooks/decisions-playbook.md` — where mid-execution choices go
- `playbooks/debriefs-playbook.md` — the retrospective that measures the brief against reality
