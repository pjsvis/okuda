---
type: Playbook
callsign: PLY-DEBRIEFS
---

# Debriefs Playbook

## Purpose

A debrief is a retrospective written after completing significant work. It captures what was built, what went wrong, and what was learned — so the next session starts from evidence, not folklore.

**Debriefs are required for significant work** (AGENTS.md rule 8). A debrief documents what *actually happened*, not what the brief planned. Discrepancies between plan and reality are the **content**, not the garnish — record them, don't smooth them over.

The trigger is *significant*, not *surprising*, and that was tested rather than assumed (2026-10-07): the registry's summaries are already near-uniformly surprise reports, and a threshold of "debrief when it surprised you" cannot be gated at all — the surprise is the thing the debrief discovers. Keep the trigger you can answer before the fact.

**Frozen on completion.** A debrief is a record, not a living document. Once written it is never edited for content; corrections or later insights go in a new debrief or an ADR, not retroactive edits to the frozen record.

## File Naming

- **Convention:** `YYYY-MM-DD-topic.md` (date first, always — the silo sorts as a timeline)
- **Final Location:** `debriefs/`

## Template

```markdown
---
date: [YYYY-MM-DD]
tags: [area, tooling]
agent: [agent identity]
environment: [local | development | production]
briefs: [BRF-…]   # the briefs this debrief measures; [] if the work had none
---

# Debrief: [Work Title]

## Accomplishments

- **[What was built]:** [Feature, fix, or refactor shipped]
- **[Scope]:** [What the work covered — and what it deliberately did not]

## Problems

- **[Problem 1]:** [Issue encountered — defect, tooling failure, misestimate]
- **[Resolution]:** [Fix or workaround applied; or "open" with a pointer to where it's tracked]

## Lessons Learned

- **[Lesson 1]:** [Insight for future work — process, tooling, estimation]
- **[Lesson 2]:** [What to do differently next time]

## Observations

Per-area notes on how the work revealed the system behaving:

### [Component/area 1 — e.g. rendering]
- [How it behaved under this work — surprises, rough edges]

### [Component/area 2 — e.g. knowledge system]
- [What helped, what got in the way]

## Metrics (if available)

- **`just check` runtime:**
- **[Benchmark or measurable, if the work has one]:**

## Related

- Brief: `briefs/YYYY-MM-DD-brief-slug.md`
- Decision: `decisions/NNN-*.md`
- Playbook: `playbooks/*-playbook.md` (if the work changed or exercised one)

## Post-Debrief Checklist

- [ ] Frontmatter present: `date`, `tags`, `agent`, `environment`, **`briefs:`**
- [ ] Registered in `debriefs/INDEX.jsonl` — `status: done`, meta `adr`/`brief` as applicable
- [ ] ADRs written for any decisions made during execution (not just those planned in the brief)
- [ ] Status of the originating brief updated to `done`
```

## The `briefs:` field

A debrief's frontmatter declares the briefs it measures:

```yaml
briefs: [BRF-TABLE-GLASS-FIT]   # the brief(s) whose landing this records
briefs: []                      # the work had no brief — infra, theme, a defect
```

**Callsigns, not paths.** A brief's filename is not its callsign, and a callsign
resolves live *and* archived (`ADR-ARCHIVE-RESOLUTION`), so the edge survives
the brief's move to `.archive/briefs/`.

**`[]` is not the same as absent.** Empty says *no brief*, which is a claim and a
common one — work that never briefed. Absent says *not declared*, which is a
finding. This is the edge that makes a landing pass mechanical instead of
grep-and-hand-verify (`ADR-RECORD-LINKAGE-065`), and its absence is why gap 3 of
`DBF-COMPRESSION` cost a whole sitting.

**Frontmatter only, and it is not a content edit.** A debrief's prose is frozen
on completion; the field is registry-facing metadata, like the callsign
`reg-sync` adds, and backfilling it does not unfreeze the body.

## Guidance

- **Honesty over polish.** A debrief that hides a mess is worse than no debrief — it launders failure into the record.
- **Systems over villains.** When something went wrong, name the incentive or gap that allowed it, not the person who tripped it.
- **Estimation is a measurement.** If the work took longer or shorter than the brief implied, record the delta and the suspected cause. The timeline of debriefs is how estimates calibrate.
- **Cite forward.** Lessons that imply a process change should point at the playbook or ADR that will carry it — otherwise the lesson evaporates with the session.
