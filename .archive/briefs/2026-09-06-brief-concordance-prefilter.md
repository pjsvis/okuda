---
type: Brief
callsign: BRF-CONCORDANCE-PREFILTER
---

# Brief: The concordance pre-filter — `|`, `!`, and case at the silo's seam

**Date:** 2026-09-06
**Status:** Rejected — 2026-10-27, the operator's call: **superseded by `BRF-SEARCH-ROW`**, which froze the search contract from the probe. The pre-filter's rules are in the shipped search, not in this brief.

## Lineage

dialog session (concordance case finding → fzf #412 dogfood → ADV-READER-SIDE-FILTER re-confirmed). The advisory identified the seam; this brief implements it.

## Objective

Add a query pre-filter to the silo's launcher that parses the
extended-search grammar (`|` OR, `!` negation) and unifies case behavior
(smart-case) *before* the `rg` channels run — so the entry list fzf
receives is correctly OR'd, negated, and case-normalised. fzf's native
`--exact` refinement (which already supports `|` and `!`, verified
2026-09-06) does the final narrowing. Rich grammar upstream (silo),
anti-soup downstream (fzf), different layers, clean composition.

## The finding (three dogfoods, one session)

1. **Case inconsistency.** `zod` does not find `ZOG` in the body channel.
   The registry channel is case-insensitive (`rg -i`); the multi-word
   body channel is case-insensitive (`rg -i`); the **single-word body
   channel is case-sensitive** (`rg -F`, no `-i`). The concordance is
   case-inconsistent with itself across its own channels. A reader who
   types lowercase and gets zero results when the corpus has the
   uppercase variant has been failed by the tool.

2. **No OR — `|` is a literal in the `rg` pre-filter.** fzf issue #412
   (closed 2015, v0.11.0) added `|` as OR — in `--exact` mode, which the
   silo runs. Verified 2026-09-06: `echo -e "alpha\nbeta\ngamma" | fzf
   --exact --filter="alpha | gamma"` returns "alpha" and "gamma". But
   the silo's `rg` channels pass the raw query (including `|`) to `rg`
   as a regex pattern; `rg` treats `|` as regex alternation or a literal
   pipe depending on context, and the entry list is wrong before fzf
   ever sees it. `protocol-free | TTS dogfood | actuator pocket`
   returned zero because the `rg` channels returned zero, not because
   fzf can't do OR.

3. **No `!` at the `rg` layer — same seam.** ADV-READER-SIDE-FILTER
   identified this: "rg doesn't see the `!` — it sees the raw query. So
   `!colours` would filter fzf's view of the entries, but the entries
   themselves would still include `colours`-docs from the body channel."
   Verified 2026-09-06: fzf `--exact --filter="state !colours"` works
   natively (returns state-without-colours). The advisory was right;
   the seam is the silo's `rg` pre-filter, not fzf. (The advisory's
   `!` claim was correct — an earlier turn in this session
   "corrected" it wrongly; that correction is retracted.)

## The solution — composition by layer

```
keystroke
  → silo pre-filter: parse | (split), ! (strip), case (-i / -S)
  → rg channels: one per alternative, union the entry lists
  → fzf --exact: substring AND refinement over the pre-OR'd list
  → selection
```

- **Upstream (silo pre-filter):** the extended-search grammar lives
  here. `a | b | c` → three `rg` invocations → union. `!x` → exclude
  `x`-matching docs from the union. Case: `-i` uniformly (smart-case's
  uppercase escape-hatch waits for evidence — same gate as `!`).
- **Downstream (fzf):** `--exact` substring AND, anti-soup, no `|` or
  `!` needed — they've been resolved upstream. fzf's native `|` and `!`
  still work for in-fzf refinement (verified), but the entry list is
  already correct.

The two modes compose because they're at different layers. `--exact` is
load-bearing (anti-soup — `state` must not match `estate`); the
extended-search grammar is load-bearing (OR and negation are the
reader's authority over the corpus). They were never in conflict — they
were at different seams, and the silo's pre-filter is the bridge.

## What `filter | filters` actually does (the coincidence, explained)

`filter | filters` returns "most results" in the silo — not because `|`
is OR (it is, at fzf, but the `rg` channels return zero for the raw
pattern), but because markdown tables use pipes: `| filter | filters |`.
The `rg` body channel's regex `filter.{0,3}\|.{0,3}filters` matches a
table row where "filter" sits next to a pipe next to "filters". It's a
literal-pipe match that works by table-syntax coincidence, not an OR.
After the pre-filter lands, `filter | filters` will OR correctly (union
of "filter" results and "filters" results), and the table-pipe
coincidence becomes irrelevant — the OR is real, not accidental.

## Scope

**In:**
- `|` OR operator: `a | b | c` → split on `|`, one `rg` query per
  alternative, union the entry lists (deduped, rank-preserved).
- `!` negation: `!x` → strip `x` from the query, run `rg` for the rest,
  exclude docs matching `x` from the entry list. (ADV-READER-SIDE-FILTER's
  grammar, at the seam it identified.)
- Case unification: `-i` on the single-word body channel (the outlier).
  Smart-case (`-S`) if it composes with `-F`; full `-i` if not. The
  uppercase escape-hatch waits for evidence (same gate as `!`).
- `change:reload` interactive: `|` and `!` resolved per-keystroke
  (already the model — the pre-filter runs on every `--entries` call).

**Out:**
- Switching to fzf extended mode (loses `--exact`'s anti-soup).
- Per-row alternative highlighting (fzf visual nicety — set-union is
  sufficient).
- The uppercase escape hatch (smart-case's force-sensitive) — waits for
  evidence, same discipline as `!`.

## Non-goals

- **Don't lose `--exact`.** The anti-soup guarantee is load-bearing
  (`state` must not match `estate`); the pre-filter adds grammar
  *upstream* of `--exact`, never replaces it.
- **Don't build per-row alternative matching.** Set-union of `rg` results
  is the OR; fzf's native highlighting is a nicety, not a functional gap.
- **Don't build the uppercase escape hatch until evidence bites.** Same
  gate as `!` (ADV-READER-SIDE-FILTER): build when the corpus grows a
  class of queries that need it, not for one annoyance.

## Preconditions

- [x] fzf `--exact` supports `|` and `!` natively (verified 2026-09-06
      via `fzf --exact --filter` on test input).
- [x] The seam is the silo's `rg` pre-filter, not fzf (confirmed by the
      zero-result dogfood + the advisory's analysis).
- [ ] Case-contract section in `docs/2026-09-04-filter-model.md` (the
      contract the pre-filter implements — channel-by-channel case
      behavior).

## Work Plan

1. [ ] **Case fix** — add `-i` (or `-S` if it composes with `-F`) to the
      single-word body channel in `src/launcher.ts:rankedShortlistEntries`.
      One-line fix; makes the body channel consistent with the registry
      and multi-word channels. Dogfood: `zod` finds `ZOG`.
2. [ ] **Case-contract section** in `docs/2026-09-04-filter-model.md` —
      channel-by-channel case behavior, the smart-case rule, the
      uppercase-escape-hatch's parking gate.
3. [ ] **OR pre-filter** — parse `|` in the silo's query parser, split
      into alternatives, one `rg` invocation per alternative, union the
      entry lists (deduped, rank-preserved via feed order). Dogfood:
      `protocol-free | TTS dogfood | actuator pocket` returns the
      union of the three.
4. [ ] **`!` pre-filter** — parse `!term`, strip from the query, run `rg`
      for the rest, exclude `term`-matching docs from the union.
      ADV-READER-SIDE-FILTER's grammar, at the seam it identified.
      Dogfood: `state !colours` returns the 66, not the 3.
5. [ ] **Thorough dogfood** — the user said "we will have to dogfood our
      search thoroughly." Run real queries against the real corpus:
      - `zod` (case fix)
      - `protocol-free | TTS dogfood | actuator pocket` (OR)
      - `state !colours` (negation)
      - `filter | filters` (the coincidence — should now OR correctly)
      - Multi-word, case-mixed, negated-OR combinations
6. [ ] **Correct the retracted claim** — the session's earlier turn
      "corrected" ADV-READER-SIDE-FILTER's `!`-in-`--exact` claim; the
      correction was wrong (the advisory was right). Add a one-line note
      to the advisory or the filter model: "verified 2026-09-06: fzf
      `--exact` supports `|` and `!` natively; the seam is the silo's
      `rg` pre-filter."

## Acceptance Criteria

* `zod` finds `ZOG` (case-insensitive across all channels).
* `a | b | c` returns the union of `a`, `b`, `c` results (deduped,
  rank-preserved).
* `!x` excludes `x`-matching docs from the results.
* `--exact` anti-soup preserved (`state` does not match `estate`).
* `change:reload` interactive: `|` and `!` resolved per-keystroke.
* `filter | filters` ORs correctly (no longer a table-pipe coincidence).
* The case-contract section in the filter model documents the rule.
* ADV-READER-SIDE-FILTER's `!` claim is confirmed, not corrected.

## References

- `advisories/ADV-READER-SIDE-FILTER.md` — the `!` grammar, the seam
  identification (right about `!` in `--exact`, right about the seam)
- `advisories/ADV-SEARCH-TWO-FILTERS.md` — the two searches, the heuristic
- `docs/2026-09-04-filter-model.md` — the shelf and the dive (where the
  case-contract section lands)
- `docs/2026-09-05-search-as-shite-filter.md` — the shite filter
- `explainers/looking-things-up.md` — the concordance prior art
- fzf issue #412 — `|` OR, closed 2015, v0.11.0
