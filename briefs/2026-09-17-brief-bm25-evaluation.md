---
type: Brief
callsign: BRF-BM25-EVALUATION
---

# Brief: Benchmark Local BM25 Against Ripgrep and AST Traversal Over Markdown SSOT

**Date:** 2026-09-17
**Status:** Open

---

## Objective

Evaluate whether an embedded BM25 index provides sufficient precision and token-reduction advantages over linear ripgrep and AST parsing to justify its operational and indexing overhead.

## Scope

**In:**
- Construction of a representative test corpus of Markdown documents sharded into domain directories.
- Implementation of three deterministic retrieval harnesses:
  1. Baseline: `ripgrep` line-matching + heading AST expansion.
  2. Pure Python / memory-mapped BM25 over parsed Markdown sections (e.g., `rank-bm25` or `minisearch`).
  3. Embedded zero-daemon index (SQLite FTS5 using BM25 ranking).
- Measurement across 20 synthetic knowledge queries covering exact identifier matches, multi-term conceptual intersections, and ambiguous phrasing.
- Operational metrics: execution latency (cold vs. warm), index artifact size, re-index duration on file mutation, and context token payload returned to the caller.

**Out:**
- External search services, daemons, or client-server databases (Elasticsearch, OpenSearch, Meilisearch).
- Vector embedding models, neural rankers, or hybrid RAG pipelines.
- Browser-based or GUI inspection interfaces.
- Testing on raw PDF/OCR files (all inputs are pre-prepped Markdown).

## Preconditions

- [ ] Python 3.11+ runtime and `ripgrep` CLI installed and available in `$PATH`.
- [ ] A test corpus of at least 500 distinct Markdown files with realistic section nesting (`#`, `##`, `###`) and tables is assembled in `test/corpus/`.
- [ ] Ground-truth target references (file path + header section) documented for all 20 test queries.

## Work Plan

1. [ ] Parse the test corpus into structured document nodes (file path, section header, text content).
2. [ ] Write Baseline Harness 1: Script that executes `ripgrep` for query terms and pulls the enclosing Markdown AST section.
3. [ ] Write Harness 2: In-memory/flat-file BM25 index over the Markdown section nodes.
4. [ ] Write Harness 3: SQLite FTS5 database populated directly from the Markdown section nodes with BM25 ranking enabled.
5. [ ] Execute all 20 benchmark queries against each harness and record:
   - Precision@3 and Recall@3 against ground-truth targets.
   - Execution time per query (mean and 95th percentile).
   - Total token count of returned sections.
6. [ ] Measure index build time and on-disk overhead for Harness 2 and 3.
7. [ ] Document findings and run the decision through the Justify Engine to determine if BM25 warrants inclusion in the toolchain.

## Acceptance Criteria

* All 20 benchmark queries execute cleanly across all three harnesses without manual intervention.
* A comparative results table is generated containing latency (ms), disk overhead (MB), token payload size, and Precision@k.
* BM25 inclusion is formally accepted only if it achieves at least 25% higher Precision@3 on multi-term queries OR reduces returned token payloads by at least 30% compared to `ripgrep` + AST, while adding less than 100ms cold-start latency.
* If criteria are not met, the decision is recorded as an ADR confirming plain filesystem tools (`ripgrep` + AST) as the standard retrieval layer.

## Notes

- **The Lexical Fallacy:** Avoid penalizing `ripgrep` for exact-match limits; evaluate how well boolean flags (`--all-match`, regex unions) close the gap.
- **Index Staleness Risk:** If Harness 2 or 3 is adopted, every document update in the SSOT introduces index synchronization debt. Measure the pain of rebuilding the index from scratch.
- **Surface Simplicity:** Output from all harnesses must write directly to stdout or a flat `.jsonl` scratchpad—no intermediate network services or browser consumption layers.