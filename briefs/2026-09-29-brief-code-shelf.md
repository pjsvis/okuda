---
type: Brief
callsign: BRF-CODE-SHELF
date: 2026-09-29
---

# Brief: Code shelf — a dir predicate scopes the tier

**Created:** 2026-09-29
**Status:** Done — shipped 2026-09-29 (td-169fc4: 472 tests green, `just check`
green, search-smoke green; 348 doc-query entries, zero src/ leakage)
**TD:** td-169fc4
**Branch:** feat/code-shelf
**Lineage:** the operator, verbatim: *"we need to figure out how to search
for code files"*, after watching `okuda src/tui.ts` render ("tui.ts looks
spectacular") — and my opinion, accepted: *code enters as a shelf, not a
flood.*
**Grounding:** BRF-ONION-SEARCH-GRAMMAR (landed `dcbb3d0` — the grammar
is the machine, already on main), BRF-FENCE-COLOUR P2 (whole-file
rendering — the read side of the shelf, already on main), ADR-030
(the entries contract, `path\tsnippet`).

## What

One Layer-0 rule, and the shelf exists:

**A query that names a positive `dir/` predicate scopes the candidate
set to all files under it; a query that names none stays doc-scoped
(`--type md`).** Naming a directory is asking for the directory, not
for the md subset of it. `src/ elide` searches source; `render` stays
docs-about-rendering. The default corpus is never flooded — code
appears only when the query asked for the shelf it lives on.

No new syntax. `src/` was already a valid Layer-1 predicate the day
the grammar landed; it narrowed an md-only candidate set and so matched
nothing. The grammar is unchanged — this is a Layer-0 scoping decision,
exactly where the onion's separation of concerns says it belongs.

## Why — measured, not asserted

| Question | Finding | Source |
|---|---|---|
| What blocks code search today? | Layer 0 is `rg --files --type md` — one type flag. Not architecture: a scope decision. | `src/launcher.ts` `listMarkdownFiles` |
| Does `src/ elide` work today? | No — empty. The predicate routes, the candidates aren't there. | `okuda --entries 'src/ wrapWholeFile'`, 2026-09-29 |
| Does the read loop close? | Yes — the picker opens via `runTui`, whose read path is `wrapWholeFile` (BRF-FENCE-COLOUR P2, on main since `85da30c`). | `src/tui.ts` readSource |
| Is evidence a problem? | No — the body channel already takes the *matching line* (`rg -n -m 1` over survivors), so a code hit shows the hit line, not line 1. | `bodyHitsFor`, launcher |
| Do doc queries change? | No — the tier dirs are all-md, so `briefs/ load bearing` returns the same set either way. Widening only adds files where non-md files exist. | `ls briefs/ docs/` |

## How

1. `rankedShortlistEntries` routes the query **before** choosing the
   candidate set: any clause with a positive dir → `rg --files`
   (EXCLUSIONS still applied, .gitignore still respected); otherwise
   the md corpus, as today. Route once, pass the routed query down —
   no double parse.
2. Empty-query shelf (the front page): unchanged, md-only root files.
3. `@date` alone stays doc-scoped — dates-in-slugs is a docs concept.
4. `!dir/` negations do not widen — exclusion kills, it never scopes.

## The correction

BRF-FENCE-COLOUR's P2 says the picker's "rg source already indexes"
src files. False — the source was `--type md` gated. That claim is
corrected here rather than inherited.

## Acceptance criteria

- [x] `src/ wrapWholeFile` surfaces `src/cli.ts` (and every src file
      whose body matches), with the matching line as evidence.
- [x] `render` (no predicate) surfaces no `src/` paths — the default
      stays doc-scoped.
- [x] `briefs/ load bearing` returns what it returned before the change.
- [x] Picking a `.ts` result opens it rendered (TUI, whole-file).
- [x] `just test` and `just check` green.

## Out of scope

- A src/ registry (INDEX.jsonl). Code's index is rg, live. A registry
  would be benchmaxxing: an index that drifts from the thing indexed.
- Extending the front page (empty-query shelf) to code. The front page
  is docs; the shelf is reached by asking for it.
- The reading room's source shelf (BRF-SSH-HOST) — it inherits this
  through the corpus it serves, nothing to build twice.

## References

- `src/onion.ts` — Layers 1-4, the pure routing this rides on
- `src/launcher.ts` — `rankedShortlistEntries`, `listMarkdownFiles`,
  `bodyHitsFor`, `EXCLUSIONS`
- BRF-ONION-SEARCH-GRAMMAR — the grammar (landed 2026-09-29, `dcbb3d0`)
- BRF-FENCE-COLOUR — P2 whole-file rendering (landed `85da30c`); its
  "already indexes" claim corrected here
- ADR-030 — the entries contract
