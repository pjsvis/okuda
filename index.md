---
okf_version: "0.2"
name: okuda
type: Bundle
---

# okuda — knowledge silo

An OKF v0.2 bundle (ADR-019): a directory tree of markdown documents with
parseable frontmatter. The JSONL registries are the private fast index;
each tier exports a generated `index.md` — never hand-edited.

| Tier | Registry | Export |
|---|---|---|
| briefs | `INDEX.jsonl` | `briefs/index.md` |
| decisions | `INDEX.jsonl` | `decisions/index.md` |
| debriefs | `INDEX.jsonl` | `debriefs/index.md` |
| playbooks | `REGISTRY.jsonl` | `playbooks/index.md` |

Documents carry `type` and a durable `callsign` (extension key, §4.1) in
frontmatter — the human code for low-bandwidth channels. Resolution is
registry-keyed, never filename-derived.
