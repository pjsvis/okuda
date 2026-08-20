# Decisions Playbook

## Purpose

An **Architecture Decision Record (ADR)** captures a significant choice — the *why* behind the *what*. Unlike briefs (aspirational, written before) and debriefs (retrospective, written after), ADRs are written *during* drafting, at the moment of decision.

**The ADR answers the question nobody asked at the time but everyone will ask six months later: "Why did we frame it this way?"**

## When to Write an ADR

Write an ADR when you:
- Choose between two viable framings or structures for a post
- Adopt a new tool or approach for the export pipeline
- Discover a constraint that changes the content or format
- Deprecate or supersede a previous decision

Don't write an ADR for:
- Obvious choices with no real alternative ("we used Jekyll because it auto-deploys to GitHub Pages")
- Temporary workarounds that don't shape the approach
- Personal preference (sentence length, tone) — those don't go in docs

## ADR Format

Every ADR is a single `.md` file in `decisions/`. Use numbered prefixes (`001-`, `002-`) for chronological ordering. Use the template at `decisions/TEMPLATE.md`.

```markdown
# Decision: [Title]

**Date:** YYYY-MM-DD
**Status:** [Proposed | Accepted | Superseded]

## Context
What situation led to this decision? One paragraph on the writing or technical context.

## Decision
What did we choose? One sentence.

## Alternatives Considered
| Alternative | Why Rejected |
|-------------|-------------|
| Option A | Reason |
| Option B | Reason |

## Consequences

**What became easier:**
-

**What became harder:**
-

**Constraints this imposes:**
-

## Related
- Debrief: `debriefs/YYYY-MM-DD-topic.md`
- Playbook: `playbooks/*.md`
- ADR: `decisions/NNN-*.md` (supersedes / superseded by)
```

## Status Lifecycle

```
Proposed → Accepted → Superseded
                ↓
           (never deleted — ADRs are historical records)
```

- **Proposed:** Under discussion. Not yet committed to.
- **Accepted:** The decision is in effect. The approach follows this.
- **Superseded:** A later ADR replaced this decision. Add `Superseded by: decisions/NNN-*.md` to the top.

Never delete an ADR. Even superseded decisions are valuable — they explain why something was tried and why it was abandoned.

## Location

All ADRs reside in `decisions/`.
- `decisions/TEMPLATE.md` — the template for new ADRs
- `decisions/NNN-slug.md` — individual ADRs (numbered sequentially)

## Differences from Briefs and Debriefs

| | Brief | ADR | Debrief |
|---|-------|-----|---------|
| **When** | Before | During | After |
| **Answers** | "What will we write?" | "Why did we choose X?" | "What happened?" |
| **Audience** | Implementer | Future maintainer | Future agent |
| **Lifespan** | Becomes irrelevant after publishing | Retains value indefinitely | Historical reference |
| **Updates** | Status only (Open → Done) | Status only (Proposed → Accepted → Superseded) | Never (frozen on completion) |

## Review Checklist

Before committing an ADR:
- [ ] Uses the `decisions/TEMPLATE.md` format
- [ ] Alternatives table has at least two entries with specific rejection reasons
- [ ] Consequences include both "easier" and "harder"
- [ ] Constraints are specific and actionable
- [ ] Related links are correct and files exist

---

## Palimpsest Mitigation Protocol

A **palimpsest** forms when the implementation direction shifts but the old approach is only partially removed — leaving artifacts of both paths active simultaneously. The codebase carries the ghost of the superseded strategy, and the agent continues building on a substrate it no longer fully understands.

This is especially prone to happening when:
- The new approach touches different files or layers than the old one
- The old approach involved multiple moving parts spread across the codebase
- The direction change happened mid-session without a formal cleanup step

### The Protocol

Run this whenever a decision is reversed, a tool or approach is superseded, or the implementation strategy shifts significantly.

**Step 1 — Map the abandonment surface**

Before acting on the new direction, explicitly surface what the old approach left behind:

- List files modified as part of the superseded path
- Note any stubs, helpers, or scaffolding added but no longer consumed
- Identify configuration, environment variables, or dependencies introduced by the old approach
- Flag any code paths that were conditional on the old approach (feature flags, env checks, conditional imports)

**Step 2 — Classify each artifact**

For each item surfaced in Step 1:

| Classification | Meaning | Action |
|---|---|---|
| **Orphaned** | No longer referenced by any live code | Remove or comment with `// TODO: stale — superseded by ADR NNN` |
| **Shared** | Referenced by both old and new paths | Update all references to the new approach, then treat as orphaned |
| **Valid** | Still needed regardless of direction change | Leave as-is; document why in the ADR |

**Step 3 — Update the ADR status**

If an ADR exists for the superseded approach, update its status to `Superseded` and add `Superseded by: decisions/NNN-slug.md`. If no ADR exists, consider writing one briefly to capture *why* the approach was abandoned — this is exactly the kind of context that vanishes over time.

**Step 4 — Commit the cleanup as part of the same change**

Do not leave the palimpsest cleanup for a future session. The abandonment and the new implementation belong in the same commit. A codebase with orphaned stubs from abandoned approaches is harder to reason about than one where the artifact removal is visible in the git history alongside the new direction.

### When to Skip the Protocol

- Trivial changes (renaming a variable, adjusting a CSS value) — no abandonment surface worth mapping
- Reversions back to a previous state with no new work between — git handles this cleanly
- When the old and new approaches share no files, no config, and no dependencies — the overlap is genuinely zero

---

(End of file)
