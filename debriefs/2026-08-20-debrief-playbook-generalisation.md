---
type: Debrief
callsign: DBF-GENERALISATION
date: 2026-08-20
tags: [knowledge-system, playbooks]
agent: pi (claude)
environment: local
---

# Debrief: Playbook generalisation — silo de-blogging completed

## Accomplishments

- **What was built:** The okuda silo's knowledge system fully de-blogged. Five issues closed in one session: independent review of the td-playbook rewrite (td-d5db1d), registry-playbook phantom-recipe fix (td-55da8c), debriefs-playbook retrospective rewrite (td-da4124), decisions-playbook excision (td-c09f0e), playbooks-playbook example swap (td-683d9c), briefs-playbook epic/ws clarification (td-c6392a).
- **Scope:** All seven playbooks generalised across two sessions. Deliberately *not* done: merging `feat/provision-silo` to main; rewriting frozen records (ADR-001 and the initiation brief legitimately describe the blog origin — provenance, not residue).

## Problems

- **`td log` loses focus after `td review`:** submitting for review clears the focused issue, so `td log --decision` with no ID errors. Resolution: pass the issue ID explicitly on every log after review. Minor, but it taxes the review→approve sequence this session used heavily.
- **No independent reviewer available for the four implementation issues:** single-session sprint with no peer context running. Resolution: honest self-reviews with re-verification evidence (post-commit greps, diff inspection) rather than naming a reviewer that didn't review. State: inherent to solo sessions; acceptable per trusted mode.

## Lessons Learned

- **Grep-shaped acceptance criteria make review nearly free.** Every issue specified a grep that must return zero hits. Re-running it post-commit is a 2-second mechanical check that carries real assurance — the reviewer verifies evidence, not prose claims. Future briefs should prefer testable ACs of this shape.
- **Frozen-record discipline resolves the residue paradox.** A repo-wide blog grep still hits ADR-001 and the initiation brief — correctly. The distinction that made the sweep pass: live documents (playbooks, registries, templates) must be clean; frozen records (ADRs, briefs, audit logs) keep their history. Excising provenance from history is vandalism, not hygiene.
- **Grounding examples in real artefacts beats inventing generic ones.** "Registry Playbook" as the example title and "never hand-edit INDEX.jsonl" as the standards rule carry more information than invented placeholders, because they're true in this repo.

## Observations

### Knowledge system
- The generalisation was self-consistent: registry-playbook's meta schema (`adr`, `brief` for debriefs), the debriefs template, and the INDEX entry for this very debrief were written in dependency order within one session without contradiction. The four-compartment structure held under simultaneous edits to all four tiers.
- Writing the debrief immediately after writing its own template was a useful fitness test — the template's Observations/Metrics sections felt awkward with no benchmarks to cite (hence `just check` runtime below), but not so awkward as to need changing.

### td
- The review-separation spine works: as a fresh session, I could genuinely approve td-d5db1d (implemented by ses_62b675). The four later self-reviews were honest-but-weaker; the audit trail records the difference, which is the point.

## Metrics (if available)

- **`just check` runtime:** 0.023s
- **Issues closed this session:** 5 (+1 reviewed); commits: 5

## Related

- Brief: `briefs/2026-08-20-brief-project-initialisation.md` (umbrella: this generalisation completes the silo provisioning it scoped)
- Playbook: `playbooks/debriefs-playbook.md` (this debrief exercises its template)
- Playbook: `playbooks/td-playbook.md` (review workflow used throughout, verified this session)

## Post-Debrief Checklist

- [x] Frontmatter present: `date`, `tags`, `agent`, `environment`
- [x] Registered in `debriefs/INDEX.jsonl` — `status: done`, meta `adr`/`brief` as applicable
- [x] ADRs written for any decisions made during execution — none warranted (mechanical generalisation, no approach reversals, palimpsest protocol never triggered)
- [x] Status of the originating brief updated to `done` — already `done` in the registry
