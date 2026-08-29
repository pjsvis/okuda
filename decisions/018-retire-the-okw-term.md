---
type: ADR
callsign: ADR-RETIRE-OKW-018
---

# Decision: Retire the "OKW" term

**Date:** 2026-08-28
**Status:** Accepted

## Context

The registry-browser brief (`briefs/2026-08-25-brief-registry-markdown-browser.md`,
renamed from `…-okw-…`) coined **OKW — "Okuda Knowledge Workflow"** as a named
standard for the knowledge system (four tiers, JSONL registries). In June 2026
Google published the **Open Knowledge Format (OKF)**
(`GoogleCloudPlatform/knowledge-catalog`, v0.2 July 2026) — a real, vendor-neutral
standard for exactly this shape of corpus: markdown trees with frontmatter. The
two names are one letter apart. A near-miss with an external standard is a
standing misattribution risk: a colleague, an agent, or a search engine resolving
"OKW" finds Google's format (or the Wehrmacht) — never our workflow. The
practices the term branded already have plain names: AGENTS.md calls it *the
knowledge system*.

## Decision

Retire the term "OKW." Living documents refer to **the knowledge system** /
registry conventions. The coining brief's naming section is marked superseded
and the file renamed; the registries keep their shape. Google's standard is
always written **OKF** (adopted additively in ADR-019).

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Keep both names, disciplined spelling ("ours is OKW, theirs is OKF") | One transposed letter from misattribution; discipline doesn't survive contact with paper notes and voice |
| Coin a replacement brand | Swaps one barnacle for another — the practice already has a plain, self-describing name |

## Consequences

**What became easier:**
- Namespace clean; no near-collision with a real standard
- One less brand to maintain; "the knowledge system" needs no definition

**What became harder:**
- Documents dated before 2026-08-28 use a term no longer defined — this ADR is
  its definition and grave marker

**Constraints this imposes:**
- New documents must not reintroduce the term; historical usage is explained
  here, not propagated

## Related

- Brief: `briefs/2026-08-25-brief-registry-markdown-browser.md` (the coining
  brief, naming clause superseded)
- ADR: `decisions/019-okf-v02-conformance.md` (the collision's other half — and
  the reason this retirement is cheap)
