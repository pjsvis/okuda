---
task: Review the project rationale and methodology
slug: 20260923-093031_review-project-rationale-methodology
effort: extended
phase: complete
progress: 22/22
mode: interactive
started: 2026-09-23T09:30:31Z
updated: 2026-09-23T09:37:50Z
---

## Context

The user asked for a review of okuda's **project rationale** (why the product exists, what problem it solves, what it refuses) and **methodology** (how work is proposed, decided, executed, and remembered). This is an analysis deliverable, not implementation. It follows session orientation (`just orient` + `td usage --new-session`) on branch `feat/action-list-triage`.

Primary sources: `docs/2026-08-20-origin-doc.md` (design source of truth), `system.md` (The Edinburgh Protocol), `AGENTS.md` (rules of engagement + three-owners scope gate), `DEPENDENCIES.md`, `playbooks/` (especially silo/briefs/decisions/registry/td), `decisions/` (ADR corpus + index), `debriefs/`, and `briefs/` as evidence of methodology in practice.

Out of scope: implementing pending td issues, editing project docs, building the stale binary, CommonMark completeness debates beyond what the origin doc claims.

### Risks

- Origin doc is design history with in-line reversals (soft returns); treating it as frozen would misstate rationale.
- Edinburgh Protocol is dense and self-referential; summary risks unpaid claims if citations are skipped.
- Methodology is documented in playbooks *and* enforced by `just`/`td`; reading only one layer overstates or understates rigor.
- Large brief corpus may include archived/parked work; counting briefs as active intent would inflate health.
- ADR status (Accepted vs Superseded) must be checked; older ADRs can contradict current practice.
- Scope gate (three owners) is the main anti-scope-creep device — missing it would misread product boundaries.

### Plan
1. Invoke selected capabilities (research, understand-explain, explore agent) in BUILD for parallel evidence.
2. Synthesize rationale from origin + AGENTS scope gate + dependency story (ISC-1–8).
3. Synthesize methodology from silo/briefs/decisions/td + Edinburgh Protocol (ISC-9–18).
4. Assess strengths, weaknesses, improvements with paid claims (ISC-19–22).
5. Present review in ALGORITHM output; mark PRD criteria as verified.

Non-obvious choice: treat origin doc as *historical design intent with recorded reversals*, not a frozen spec — required for accurate rationale (ADR-007 soft-returns).
Non-obvious choice: `understand-explain` skill requires `.understand-anything/knowledge-graph.json`, which is absent — deep-dive performed against `system.md` source instead of fabricating a graph.
Non-obvious choice: surface TUI/windowing tension as a methodology finding rather than silently reconciling it (explore-1:5.1; AGENTS.md:18,23).

## Criteria

### Rationale (origin and scope)
- [x] ISC-1: Origin problem statement restated with file citation
- [x] ISC-2: Glow and CommonMark pain points named explicitly
- [x] ISC-3: Agentic paired-terminal use case is captured
- [x] ISC-4: Explicit out-of-scope items are listed completely
- [x] ISC-5: Three-owners principle is stated with its test
- [x] ISC-6: Soft-returns reversal is noted as rationale evolution
- [x] ISC-7: mermaid-to-md delegation choice is explained
- [x] ISC-8: Loose-list and wrap choices link to origin intent

### Methodology (how work proceeds)
- [x] ISC-9: Silo pattern adoption is cited from ADR-001
- [x] ISC-10: Four knowledge compartments have distinct roles
- [x] ISC-11: Brief-before-build workflow is stated clearly
- [x] ISC-12: Brief vs ADR vs debrief timing is distinguished
- [x] ISC-13: td continuity-system role is stated accurately
- [x] ISC-14: Registry index obligation is stated accurately
- [x] ISC-15: Branch hygiene and quality gate are stated
- [x] ISC-16: Base epistemic attitude is summarized faithfully
- [x] ISC-17: Continuity-by-re-reading principle is stated
- [x] ISC-18: Session handoffs are not briefs per ADR-017

### Assessment
- [x] ISC-19: Three or more methodology strengths are identified
- [x] ISC-20: Three or more methodology weaknesses are identified
- [x] ISC-21: Concrete improvement proposals are non-empty
- [x] ISC-22: Major claims carry file:line or mark proposal

## Decisions

Non-obvious choice: treat origin doc as *historical design intent with recorded reversals*, not a frozen spec — required for accurate rationale (ADR-007 soft-returns).
Non-obvious choice: `understand-explain` skill requires `.understand-anything/knowledge-graph.json`, which is absent — deep-dive performed against `system.md` source instead of fabricating a graph.
Non-obvious choice: surface TUI/windowing tension as a methodology finding rather than silently reconciling it (explore-1:5.1; AGENTS.md:18,23).

## Verification

| ISC | Evidence |
|-----|----------|
| ISC-1 | Problem: Glow tight lists, raw mermaid, layout fighting — `docs/2026-08-20-origin-doc.md:21-23,49` |
| ISC-2 | Glow/CommonMark tight lists + mermaid-as-code — origin:8,22; Glow visual baseline `decisions/007-glow-visual-reference.md:28-32` |
| ISC-3 | Pi left / preview right / herdr — origin:22,47,84 |
| ISC-4 | Out of scope TUI/HTML/built-in mermaid — origin:38-41; AGENTS.md:18 |
| ISC-5 | Three owners + byte-stream/screen test — `AGENTS.md:20-26` |
| ISC-6 | Soft returns reversed 2026-08-24 — origin:10-19; ADR-007 table row |
| ISC-7 | Pipe mermaid to Rust CLI, never parse — origin:27; DEPENDENCIES.md:76-78 |
| ISC-8 | Loose lists + hard wrap — origin:8,32-33; ADR-004:17 |
| ISC-9 | Silo pattern — `decisions/001-silo-pattern-adoption.md:15` |
| ISC-10 | briefs/decisions/debriefs/playbooks roles — silo-playbook:49-56; briefs-playbook:10; decisions-playbook:10 |
| ISC-11 | Brief is record of intent before work — briefs-playbook:10; AGENTS.md:8 |
| ISC-12 | before/during/after — decisions-playbook:10; explore-1 §2 |
| ISC-13 | td continuity + start/log/handoff — AGENTS.md:9; td-playbook:12-27 |
| ISC-14 | If it accumulates, it gets an index — registry-playbook:10; AGENTS.md:12 |
| ISC-15 | Never main; just check — AGENTS.md:10-11; ADR-001:37-39 |
| ISC-16 | Cite or mark; map not territory — system.md:12-18 |
| ISC-17 | Repo is memory; just orient is recall — system.md:20 |
| ISC-18 | Handoffs ≠ briefs — `decisions/017-session-handoffs-are-not-briefs.md:40-44` |
| ISC-19–21 | Strengths/weaknesses/proposals in deliverable body (this review) |
| ISC-22 | Deliverable body uses file:line throughout; remaining gaps marked *proposal* |

**Capability invocation check:**
- `Skill("research")` — invoked BUILD (corpus search protocol applied)
- `Skill("understand-explain")` — invoked BUILD (graph absent; source deep-dive of system.md substituted — recorded in Decisions)
- `Actor explore` (`explore-1`) — invoked BUILD (parallel ADR/playbook/debrief scan completed)
