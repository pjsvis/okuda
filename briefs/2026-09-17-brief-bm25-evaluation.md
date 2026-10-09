---
type: Brief
callsign: BRF-BM25-EVALUATION
---

# Brief: Benchmark Local BM25 Against Ripgrep and AST Traversal Over Markdown SSOT

**Date:** 2026-09-17
**Status:** Parked (operator call, 2026-10-09) — on hold, gated on the scale trigger: the corpus reaching the size where a linear scan stops being interactive, or multi-term Precision@3 measured insufficient. Not adopted now; the acceptance criteria below still govern any adoption, and the harness-2 instrument is `bm25s` (see the note at the foot).

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

## Note (2026-10-08) — bm25s is the instrument; adoption is a scaling option

Added on the operator's question (`bm25s` — *enhancement or a step too far?*).
This brief stays **Open**; the note records the decision so the question is not
re-decided from scratch.

- **Harness 2 is now `bm25s`, not Python.** [`oakoliver/bm25s`](https://github.com/oakoliver/bm25s)
is a **Bun-native, zero-dependency TypeScript** port of Python `bm25s` (parity
v0.3.11). It supersedes the Python `rank-bm25` / `minisearch` named in the work
plan: same runtime as the tool, no transitive dependency tree, compiles into the
binary. Upstream-parity is verified against the five BM25 variants.
- **Not adopted now — it is a scaling option for *when we get there*.** The
  corpus is **400 documents / 3.7 MB**; `rg` over it costs ~34 ms, nearly all of
  it process spawn. BM25's indexing advantage appears at **5,000 documents and
  up** (upstream benchmarks); at 400 the retrieval-latency argument does not
  exist. Retrieval speed is not a problem the silo currently has.
- **The scale trigger, whichever comes first:** (a) the corpus reaches the size
  where a linear `rg` scan stops being interactive (order 5k documents); or
  (b) the brief's own acceptance test is run and multi-term **Precision@3**
  proves insufficient. Adopt only on the criteria above — ≥25 % Precision@3 on
  multi-term queries **or** ≥30 % token-payload reduction, with <100 ms cold
  start. Otherwise record the confirming ADR for `rg` + AST, as already required.
- **If adopted, one admissible shape only.** Build the index **in memory, per
  session**, and let it die with the process — no `BM25.save()`, no persisted
  artifact. A saved index is a parallel store (the registry playbook's *No
  parallel stores*), and every corpus mutation would create sync debt. The
  in-memory index of 3.7 MB indexes in single-digit milliseconds.
- **Scope of the change, if it ever lands:** BM25 re-ranks the **content channel
  only**; filenames and registry fields keep their existing channels, and `fzf`
  keeps the final narrowing. `okuda`'s search is **addressing** (name the
  document), not relevance retrieval (answer a question); BM25 must not blur
  that line.