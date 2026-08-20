# Decision: Brief filenames are date-first

**Date:** 2026-08-20
**Status:** Accepted

## Context
Briefs are the record of intent in this silo — every decision and debrief derives from and references a brief, never the reverse. The imported blog-posts convention (`brief-[topic]-[YYYY-MM-DD].md`) buries the date mid-filename, so directory listings sort by topic and hide chronology. The okuda provisioning brief was initially named under that imported convention before this rule was set.

## Decision
All briefs are named `YYYY-MM-DD-brief-slug.md` — ISO date first, the literal token `brief`, then a hyphenated slug.

## Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| `brief-[topic]-[YYYY-MM-DD].md` (blog-posts import) | Sorts by topic; cadence and gaps invisible on inspection; date must be parsed from mid-name |
| `YYYY-MM-DD-slug.md` (no type token) | Filename loses document type when quoted out of context (ADRs, debriefs, commits) |
| UUID or sequence numbers | Opaque; carries no temporal signal at all |

## Consequences

**What became easier:**
- `ls briefs/` is a chronological ledger of intent — cadence and gaps visible instantly
- Convention now matches debriefs (`YYYY-MM-DD-topic.md`); the whole silo sorts as one timeline
- Filename is mechanically validatable (leading token must parse as an ISO date)

**What became harder:**
- Recalling a filename from memory requires the date, not just the topic — mitigate via `just reg-briefs` / index lookup

**Constraints this imposes:**
- No exceptions, including already-written briefs (the provisioning brief was renamed in this change)
- Other documents reference briefs by this exact filename form

## Related
- Playbook: `playbooks/briefs-playbook.md` (Naming Convention section)
- ADR: `decisions/001-silo-pattern-adoption.md` (first enforced adaptation of the imported playbooks)
- Brief: `briefs/2026-08-20-brief-project-initialisation.md`
