---
type: ADR
callsign: ADR-<WORDS>-NNN
date: YYYY-MM-DD
---

# Decision: [Title]

**Date:** YYYY-MM-DD
**Status:** [Proposed | Accepted | Superseded]
**Enforced by:** <`scripts/x.ts --gate` | `tests/x.test.ts` | `nothing — advice`>

> The frontmatter is not decoration: `reg-sync` derives the registry row from it and
> `callsign-lint`/`date-lint` read it. It was missing from this template until
> 2026-10-13, so every ADR author copied it from a neighbour — which is how a shape
> drifts. And **`Enforced by:` is the load-bearing line**: a decision that names the
> gate, lint or test that fails when it is violated is an instrument; one that names
> nothing is **advice**, which is admissible and must be *said*, because an unmarked
> lesson kept but unapplied is the unpaid claim (`ADR-027`'s barnacle class).
> `nothing — advice` is a legitimate answer; a blank is not an answer.

## Context
What situation led to this decision? One paragraph on the project or technical context.

## Decision
What did we choose? One sentence.

## Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
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
- Brief: `briefs/YYYY-MM-DD-brief-slug.md`
- Playbook: `playbooks/*.md`
- ADR: `decisions/NNN-*.md` (supersedes / superseded by)
Notation note (use-vs-mention, 2026-09-10): cite registered tiers by
their callsign (`ADR-NNN`, `BRF-…`) — a callsign is a use, discovered
and silcrow-actuable in the reading flow. A bare path is a mention:
legible (doc-ref gold) and found by the dive, but never a vector. The
path form stays for unregistered prose-tier documents.
