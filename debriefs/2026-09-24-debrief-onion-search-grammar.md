---
type: Debrief
callsign: DBF-ONION-SEARCH-GRAMMAR
date: 2026-09-24
---

# Debrief: The onion search grammar — what shipped, what the tests decided, what stayed parked

**TD:** td-d95cf3 · **Brief:** BRF-ONION-SEARCH-GRAMMAR (2026-09-07) · **Status:** done

## What shipped

The monolith dissolved. `rankedShortlistEntries` was parse + path + content +
exclude + rank in one function; now `src/onion.ts` holds the pure layers
(`routeQuery`, `applyPathPredicates`, `onionMerge` over injected channel deps)
and `launcher.ts` holds only the rg edges (`rgOverPaths` over explicit survivor
paths — rg never searches an excluded directory). Four defects closed by
construction, live-verified through the binary: the smoke query returns 56
rows, **zero briefs leaked, zero undated rows**. The 7 red-by-design tests from
2026-09-07 went green in one flip; 24 pure-layer property tests added
(`tests/onion.test.ts`). 457 green, `just check` green.

## The discrepancy that was the spine

The brief's grammar sketch and its own contract tests disagreed, and the tests
won. The sketch: "a clause of mixed predicates ANDs across layers" — clause-
scoped `@date`. The tests (written 2026-09-07, "verified against the
filesystem"): `!briefs/ @2026-09 debriefs/ | decisions/ | docs/` asserts
`every(p → p.includes("2026-09"))` — the date scopes the WHOLE query, which is
what the operator's original parenthesised query meant (the parens grouped the
*dirs*; the date scoped everything). Under clause-AND, the flat OR rewrite
would NOT have expressed the intent — and the brief's own claim was that flat
OR covers every real query. Resolution: `@date` is a global scope modifier;
dirs AND within a clause, OR across; negations global. The expressiveness lost
(per-clause dates: `@2026-08 | @2026-09`) parks on the elision ladder. Lesson
re-learned: when a brief and its tests disagree, the tests are the operator's
hand on the tiller — the sketch is the map.

## What stayed parked (named, not slipped)

- **Grouping `(a|b)`** — still no real query needs it; the flat rewrite now
  *actually* covers the smoke query (it didn't, under the sketch's reading).
- **Per-clause dates** — new park, created by the global-scope call.
- **Smart-case** — unchanged (dogfood gate, filter-model doc §4b).
- **Layer 1 → rg `-g` pushdown** — the 10×-corpus bound; ~350 paths today,
  stated in `RG_PATH_CHUNK`.

## Retirement list (palimpsest)

`parseQuery`/`ParsedQuery` (v1 grammar), `dedupeByPath`, `dedupeEntries`,
`CORPUS_EXCLUSIONS` (→ `EXCLUSIONS`, JSONL honesty globs) — all fully
replaced, no orphans; the old negation test (filename-glob semantics,
defect 3's double net) rewritten to the content exclude-by-result contract,
corpus-independent via its own rg probe.
