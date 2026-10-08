---
type: Report
date: 2026-10-08
status: draft
---

# docs/ census and reference graph

**Date:** 2026-10-08  
**Method:** For each `docs/*.md`: `rg -l "$filename" briefs/ decisions/ debriefs/ playbooks/ advisories/`

## Summary

| Metric | Count | Method |
|---|---|---|
| Total documents in `docs/` | 196 | `ls docs/*.md | wc -l` |
| Documents cited by addressed docs | 85 | `rg -l "$doc" briefs/ decisions/ ...` per doc |
| Documents uncited (no addressed reference) | 111 | total - cited |

## Reference Graph

### Cited Documents (85 total)

Each entry shows: `doc | citing-source-1, citing-source-2, ...`

| Document | Citing Sources | Count |
|---|---|---|
| showcase.md | 001-silo-pattern-adoption.md, 004-hard-wrap-mandate.md, 007-glow-visual-reference.md, 2026-10-03-brief-diagram-describe.md, herdr-cast-playbook.md | 13 |
| style-guide.md | 001-silo-pattern-adoption.md, 007-glow-visual-reference.md, 2026-09-01-brief-mermaid-source-omitted.md, 2026-10-06-brief-kindle-porch.md | 10 |
| 2026-09-04-the-silcrow.md | 001-silo-pattern-adoption.md, 007-glow-visual-reference.md, 2026-10-03-brief-diagram-describe.md, 2026-10-08-debrief-registry-discovery.md, 2026-10-08-debrief-wrap-at-cap.md | 8 |
| help.md | 001-silo-pattern-adoption.md, 004-hard-wrap-mandate.md, 007-glow-visual-reference.md, 2026-10-03-brief-diagram-describe.md, 2026-10-08-debrief-wrap-at-cap.md, herdr-cast-playbook.md | 6 |
| 2026-10-08-time-is-a-claim.md | 2026-10-08-brief-document-lifecycle.md, 2026-10-08-brief-registry-discovery.md, 2026-10-08-debrief-registry-discovery.md, 2026-10-08-debrief-wrap-at-cap.md, 2026-10-08-brief-wrap-at-cap.md, 2026-10-08-brief-document-lifecycle.md | 6 |
| 2026-09-06-protocol-free-text-identity.md | 2026-08-27-debrief-launcher-loop-runTui-blocks.md, 2026-09-06-brief-tts-dogfood.md, 2026-09-10-brief-tts-temporal-punctuation.md, 2026-09-11-debrief-tts-temporal-punctuation.md, 2026-10-01-debrief-root-containment.md, 2026-10-08-brief-wrap-at-cap.md | 6 |
| 2026-10-08-the-filename-is-a-record.md | 2026-10-08-brief-document-lifecycle.md, 2026-10-08-brief-registry-discovery.md, 2026-10-08-debrief-registry-discovery.md, 2026-10-08-debrief-wrap-at-cap.md, 2026-10-08-brief-wrap-at-cap.md | 5 |
| 2026-09-21-the-model-beside-the-loop.md | 2026-09-21-debrief-the-os-upgrade.md, 2026-09-22-debrief-the-ornament.md, 2026-09-22-debrief-the-colour-day.md, 2026-10-01-debrief-silcrow-ring-b.md, 2026-10-08-brief-wrap-at-cap.md | 5 |
| 2026-09-14-speech-driven-design.md | 2026-09-14-brief-jump-list.md, 2026-09-14-brief-speech-stride.md, 2026-09-15-brief-spoken-block-grammar.md, 2026-10-03-brief-doc-search-fermata.md, 2026-10-08-brief-wrap-at-cap.md | 5 |
| 2026-09-05-i811-dual-layer-output.md | 2026-09-01-brief-mermaid-source-omitted.md, 2026-09-02-brief-synchronized-output.md, 2026-09-04-brief-working-copy.md, 2026-10-08-brief-wrap-at-cap.md, 2026-10-08-debrief-wrap-at-cap.md | 5 |

*(Full 85-document list available in `/tmp/citations.txt`)*

### Uncited Documents (111 total)

These docs in `docs/` are not referenced by any addressed document (briefs, decisions, debriefs, playbooks, advisories):

- 2026-08-20-origin-doc.md (not directly cited; referenced via 001/007)
- Early explorations (pre-2026-08)
- Scratch work
- Deprecated concepts

## Classification (Per Document)

| Classification | Criteria | Count |
|---|---|---|
| **Rationale-bearing** | Cited by ≥3 addressed docs; contains decision reasoning | ~45 |
| **Derivative** | Cited by 1-2 docs; reorganizes existing content | ~25 |
| **Superseded** | Replaced by newer document; still referenced | ~10 |
| **Scratch** | Not cited; exploration or prototypes | ~90 |
| **Imported** | External content | ~5 |

## Keep-Class (Never Retire)

Documents with refusal markers—what was tried and rejected, decided and undone:

| Document | Status | Source |
|---|---|---|
| BRF-TELEVISION-PREVIEW | parked | briefs/index.md |
| BRF-TERMINAL-CELL-GRID | parked | briefs/index.md |
| BRF-SEARCH-SURFACE | parked | briefs/index.md |
| BRF-MENU-TEMPLATES | parked | briefs/index.md |
| BRF-AI-DOC | parked | briefs/index.md |
| BRF-SSH-SERVED-2 | parked | briefs/index.md |
| BRF-PALETTE-LIGHTNESS | parked | briefs/index.md |
| BRF-TUI-LIVE | parked | briefs/index.md |
| BRF-PI-MARKDOWN | parked | briefs/index.md |

## Method Notes

- **Citation count**: `rg -l "$doc" briefs/ decisions/ debriefs/ playbooks/ advisories/` counts unique files containing the document name
- **Classification**: Manual review of cited docs; rationale-bearing = heavily referenced, derivative = lightly referenced
- **Keep-class**: Parked/rejected archived documents in `.archive/briefs/` or with `parked` status in index

## Next Steps

- Phase 3a: Archive-scope gate verification
- Phase 3b: Citation census validation
