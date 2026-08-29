---
type: ADR
callsign: ADR-SILO-PATTERN-001
---

# Decision: Adopt the silo pattern from blog-posts for okuda

**Date:** 2026-08-20
**Status:** Accepted

## Context
okuda begins as a greenfield repository with one design document (`docs/2026-08-20-origin-doc.md`) and a `playbooks/` folder imported wholesale from the blog-posts project. The imported playbooks define a proven knowledge architecture — briefs, playbooks, decisions, debriefs, each with a JSONL registry index, wired behind a `justfile` facade — but their content is blog-centric (Jekyll, Substack/Medium export, post briefs). A decision was needed on how much governance structure to carry over before any code is written.

## Decision
Adopt the four-compartment silo pattern (briefs / playbooks / decisions / debriefs, JSONL registries, `justfile` facade, `SILO_MANIFEST.md` — since renamed `DEPENDENCIES.md`) from blog-posts, treating the imported playbooks as templates to adapt incrementally rather than verbatim operating rules.

## Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Plain repo, README only | Ungoverned accumulation; every future agent re-derives structure from scratch; violates the "if it accumulates files, it gets an index" principle |
| Verbatim adoption including Jekyll/export flows | Imports barnacles: no `_posts/`, no export pipeline, no GitHub Pages; ceremony without underlying structure is entropy |
| Dedicated doc tooling (adr-tools, wikis) | Parallel stores; the index must be the single source of truth, and Bun scripts in-repo need zero new dependencies |

## Consequences

**What became easier:**
- Any agent (or human) can orient in seconds via `just orient` / `just help`
- Work is proposed in briefs, decided in ADRs, reviewed against registries — no silent drift
- The blog-posts playbooks remain as proven scaffolding; adaptation happens per-need with a record

**What became harder:**
- Every new document now carries an index obligation (small, but non-zero)
- Imported playbook text contains blog-specific references that must be flagged and adapted over time rather than trusted blindly

**Constraints this imposes:**
- `just check` (registry sync) must pass before every commit
- No parallel trackers (Notion, spreadsheets) — the JSONL index is the single source of truth
- Branch hygiene: never commit work directly to `main`

## Related
- Playbook: `playbooks/silo-playbook.md`
- Playbook: `playbooks/registry-playbook.md`
- Brief: `briefs/2026-08-20-brief-project-initialisation.md`
