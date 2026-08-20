# Debriefs Playbook

## Purpose

A debrief is a retrospective document created after the completion of a post or series. It captures what was done, what went wrong, and what was learned to improve future writing.

**Critical:** Debriefs are **MANDATORY** for all significant posts per the writing process. A debrief documents what actually happened, not what was planned. It includes verification that the export pipeline worked correctly.

## File Naming

- **Convention:** `YYYY-MM-DD-topic.md` (date first, always)
- **Final Location:** `debriefs/` directory

## Template

```markdown
---
date: [YYYY-MM-DD]
tags: [writing, distribution]
agent: [claude | cursor | local-ai]
environment: [local | development | production]
---

# Debrief: [Post Title]

## Accomplishments

- **[What was published]:** [Platform and URL]
- **[What was exported]:** [Platforms exported to]

## Problems

- **[Problem 1]:** [Issue encountered (export formatting, platform constraints, etc.)]
- **[Problem 2]:** [Resolution or workaround applied]

## Lessons Learned

- **[Lesson 1]:** [Insight for future posts — framing, export process, platform differences]
- **[Lesson 2]:** [What to do differently next time]

## Platform Notes

### Substack
- What rendered well? What needed manual adjustment?

### Medium
- What HTML elements broke? Any image handling issues?

### Hacker News
- Did the HN export format work? How was reception?

### Twitter/X
- Were the thread segments a good length? Any content loss?

## Metrics (if available)

- **GitHub Pages views:**
- **Substack opens:**
- **Medium views:**

## Related

- Brief: `briefs/brief-[topic]-[YYYY-MM-DD].md`
- Decision: `decisions/NNN-*.md`
- Published post: `_posts/YYYY-MM-DD-slug.md`
- Export output: `_exported/[platform]/`

## Post-Debrief Checklist

- [ ] Frontmatter present: `date`, `tags`, `agent`, `environment`
- [ ] Export output reviewed in `_exported/`
- [ ] Platform distribution completed (or noted as deferred)
- [ ] ADRs written for any framing/structural decisions made during drafting
- [ ] Status of original brief updated to Done