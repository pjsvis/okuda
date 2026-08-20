# Briefs Playbook

## Writing a Brief

Every brief is a single `.md` file in `briefs/`. Use this format:

```markdown
# Brief: [Post Topic]

**Date:** [YYYY-MM-DD]
**Status:** [Open | In Progress | Done]

---

## Objective

One sentence. What are we publishing and why?

## Post Details

**Proposed Title:**
**Target Platform(s):** [substack | medium | hn | twitter | all]
**Categories:** [comma-separated tags]

## Content Outline

1. **Hook** — Opening problem or question
2. **Body** — Key points (3-5 sections)
3. **Resolution** — What we're arguing or demonstrating
4. **CTA** — What should the reader do next?

## Research Needed

- [ ] Source links / references verified
- [ ] Code examples tested (if any)
- [ ] Any existing posts on this topic checked for overlap

## Export Checklist

- [ ] Front-matter complete (title, date, categories, canonical_target)
- [ ] Run `bun run scripts/export-all.ts`
- [ ] Review `_exported/` output
- [ ] Commit to `main` → GitHub Pages deploys

## Notes

Any non-obvious constraints, dependencies, or decisions about framing.

---

## Done

When all `[ ]` items are checked and exports reviewed.
```

**Rules:**
- One brief per post or epic series
- Epic = multi-post series, single brief = one deliverable post
- File name: `brief-[topic]-[YYYY-MM-DD].md` or `epic-[name].md`
- Be specific in the objective — "write about AI" is not a brief, "explains why flat code improves LLM comprehension" is

## Executing a Brief

1. **Review** the brief before starting
2. **Verify** conditions at the top (what must already exist)
3. **Check off** items as you complete them
4. **Draft** in `_drafts/` — do not publish until brief is done
5. **Update Status** to Done when verified

## Archiving

Completed briefs stay in `briefs/`. Keep them — they're a record of what was decided and why.

## Epic Structure (Multi-Post Series)

An epic groups related posts. Use this in `epic-[name].md`:

```markdown
# Epic: [Series Name]

**Date:** [YYYY-MM-DD]
**Status:** [Open | In Progress | Done]
**Posts:** [01 through 0N]

---

## Vision

One paragraph. Why does this series matter? What's the through-line?

---

## Posts

### 01 — [Post name]

**What:** [Description]
**Platform:** [substack | medium | all]
**Brief:** `briefs/brief-[topic]-[date].md`

### 02 — [Post name]

...

## Exit Criteria

What must be true for the epic to be considered complete?
```

## Capturing Decisions

Briefs are aspirational — they describe what you plan to write. The actual decisions made during drafting (framing choices, structural trade-offs, rejected alternatives) should be captured as **Architecture Decision Records (ADRs)** in `decisions/`.

When drafting a brief:
- If you make a choice between two viable framings, write an ADR
- If you discover a constraint that changes the structure, write an ADR
- If you adopt a new pattern or approach, write an ADR

See `playbooks/decisions-playbook.md` for the ADR format and process.

## Review Checklist

Before committing a brief:
- [ ] Objective is specific and actionable
- [ ] Content outline has clear structure (hook, body, resolution, CTA)
- [ ] No ambiguous language ("should", "maybe", "consider")
- [ ] Research checklist is realistic
- [ ] Export checklist is complete
- [ ] Significant framing decisions have corresponding ADRs in `decisions/`