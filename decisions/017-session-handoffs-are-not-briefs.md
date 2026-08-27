# Decision: Session handoffs are not briefs

**Date:** 2026-08-27
**Status:** Accepted

## Context

The 2026-08-27 brief tidy (13 briefs archived, 31 → 17) exposed a
taxonomy drift: `briefs/` had become the default landing zone for
anything document-shaped that didn't have an obvious home. Three
failure modes:

1. **Session handoffs filed as briefs.** Four files
   (`2026-08-24-session-handoff*.md`, `2026-08-26-session-handoff-okuda-net.md`)
   were historical context — "where was I when the session ended?" —
   not future work. They consumed INDEX space and made the open list
   unreadable.
2. **td/debrief confusion.** A handoff is *ephemeral continuity* for
   the next session; a debrief is *permanent record* for the next
   project. Both capture "what happened," but the audiences and shelf
   lives differ. Filing a handoff in `briefs/` blurred the line because
   a handoff is neither future work (brief) nor retrospective (debrief).
3. **Raw research pasted into `briefs/`.** `2026-08-27-brief-display-type.md`
   was a paste of external content — no frontmatter, no `# Brief:` title,
   no date/status. The INDEX entry had the wrong date and a summary that
   was just the title. Stuff that never got Mentated into a Thing.

The common root: `briefs/` was the path of least resistance for
paste-and-file, because the session-handoff category had no row in
the knowledge-system tier table (`AGENTS.md`), so the reflex had no
rule to hit.

## Decision

**Session handoffs go to `td handoff` (ephemeral) or `docs/` (persistent),
never `briefs/`.** A handoff is not a brief; a brief is future work with
a status, and a handoff has neither. The tier table gains a row for
session handoffs. Briefs that turn out to be handoffs are archived or
moved; the tidy is the scraping of the barnacle.

The rule for research material (the pasted-stuff failure): research →
`docs/`, work-to-do → shape into a brief with frontmatter. The INDEX
enforces a shape (date, status, summary); a raw paste fails the shape,
which is the gate, not just the index.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Keep handoffs in `briefs/`; mark them `status: handoff` | Proliferates statuses; a handoff isn't a state of a brief, it's a different document kind. Conflates "future work" with "session residue" in the same index |
| A new `handoffs/` directory | Adds a tier for a document kind that is either ephemeral (td) or persistent (docs/). Two homes, not three. The tier table stays four rows |
| Just be more disciplined | The drift happened because the category had no row in the table; discipline without a named rule is the barnacle that wasn't scraped |

## Consequences

**What became easier:**
- The `briefs/` list is a work queue, not a graveyard — every entry is
  future work with a status, readable as "what's next."
- Paste-and-file has a decision rule: research → `docs/`, work → shape
  a brief. The reflex has a rule to hit.
- The tier table is the single source of truth for "where does this
  go?" — no gaps.

**What became harder:**
- Nothing. The alternatives (td, docs/) already existed; the discipline
  was always available, it just wasn't named.

## References

- Tidy commit: `4ab0f58` (archive 13 briefs + 4 handoffs + tidy)
- AGENTS.md tier table (updated this commit)
- `playbooks/briefs-playbook.md` (updated this commit)
- `playbooks/td-playbook.md` § Handoffs (the ephemeral home)
