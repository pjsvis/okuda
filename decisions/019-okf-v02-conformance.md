---
type: ADR
callsign: ADR-OKF-V02-019
---

# Decision: Adopt OKF v0.2 conformance for the document tree

**Date:** 2026-08-28
**Status:** Accepted

## Context

Google's Open Knowledge Format (OKF v0.2, July 2026; spec verified at
`GoogleCloudPlatform/knowledge-catalog/okf/SPEC.md`) formalizes the shape this
silo already has: a directory tree of markdown documents. Conformance (§11)
costs one required key per document — parseable YAML frontmatter with a
non-empty `type` — plus structure for `index.md`/`log.md` *when present*. Our
`INDEX.jsonl` registries are not markdown; OKF consumers never see them, so
they remain the private fast index. Producers may add extension keys and
consumers must tolerate them (§4.1) — a standards-legal home for `callsign`
(brief `2026-08-28-silo-mnemonics.md`).

## Decision

The silo's document tree is a conformant **OKF v0.2 bundle**: every tier
document gains frontmatter `type: Brief | ADR | Debrief | Playbook` (other docs
an honest type), the optional `callsign` extension key, and a **generated**
`index.md` per tier exported from the registries — never hand-edited. The JSONL
registries remain canonical for our tooling.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Stay bespoke (JSONL only) | Forgoes free interoperability with any OKF consumer (Google's visualizer, other agents, Obsidian-class tools) for zero savings |
| Full OKF: `index.md` as the canonical listing | Duplicates the registries — two sources of truth, drift guaranteed; `index.md` is an export, not a master |

## Consequences

**What became easier:**
- Any OKF consumer can browse the silo without our tooling
- Callsigns ride a public spec instead of a private convention
- Rooted/unrooted gloam gains an external detection signature (`okf_version`
  in a bundle-root `index.md`)

**What became harder:**
- `reg-sync` must maintain frontmatter alongside the JSONL mirrors
- Corpus migration (~60 documents) — mechanical, but its own task

**Constraints this imposes:**
- OKF is young (v0.1 June 2026, v0.2 July 2026); adoption is additive and
  reversible — exit is deleting frontmatter
- Tier `index.md` files are generated artifacts (reg-sync output); hand-edits
  will be overwritten. The bundle root may declare `okf_version: "0.2"`

## Related

- Brief: `briefs/2026-08-28-silo-mnemonics.md` (the callsign layer, first
  consumer of the extension surface)
- ADR: `decisions/018-retire-the-okw-term.md` (the namespace this adoption clears)
