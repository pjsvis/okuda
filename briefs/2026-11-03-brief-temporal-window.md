---
type: Brief
callsign: BRF-TEMPORAL-WINDOW
---

# Brief: The temporal window — the date the reader already types, and the three words beside it

**Date:** 2026-11-03
**Status:** Ready

---

## Context

The operator's report, 2026-11-03, unasked for and therefore worth more: *"the search
I find myself reaching for most often is MM-DD for today's date or yesterday's date."*

Read against the code, that is a finding and not a preference. The date sigil has
one shape — `@YYYY-MM` or `@YYYY-MM-DD`, nothing else (`src/onion.ts:56`) — so
`11-03` is not a date query at all. It works by two coincidences: every picker
entry is `path\tsnippet` and fzf exact-matches the whole line
(`src/launcher.ts:281-289`), and this corpus is date-first by convention. The most
reached-for query in the launcher is the one with **no contract behind it** — no
negation, no global scope, no test, and no year.

## Warrant

The grammar reserved this rung itself, in its own words: *"A sigil with any shape
would be a second grammar inside the grammar (elision ladder: ship two shapes, let
dogfood ask)"* (`src/onion.ts:55`). Dogfood has asked. That is the whole warrant
for touching the grammar, and it is the house's normal price.

Two facts make the work small, and both were established by reading rather than
guessed:

- **A date-only query already filters.** With no content clause, `onionMerge`
  returns every survivor through the remainder channel (`src/onion.ts:248-256`), so
  `@2026-11-03` today returns that day's documents. Nothing is missing from the
  pipeline; the shape is missing from the sigil.
- **The short form already ranks.** `11-03` matches the path inside the entry, so
  the documents from that day are already in the list. A new filename-date *channel*
  would duplicate it — this brief explicitly refuses that, having checked.

## Objective

The reader can ask for a **window** — today, yesterday, the ones from `11-02` — in
the vocabulary they already type, and the picker says what it resolved to.

## Scope

**In:**

1. **One regex arm.** `RE_DATE` gains `MM-DD` (`@11-03`), and only the sigil form:
   bare `11-03` keeps working exactly as it does now, because reclassifying it
   would break every reader searching for that literal string. The date layer then
   gives the short form global scope, `!@11-03` negation, and the filename match
   for free (`src/onion.ts:116`) — no new layer, no new IO.
2. **Three derived tokens.** `@today`, `@yesterday`, `@week`, resolved in the
   router. **The clock is injected, never read inside the module** — the same
   discipline as `deriveReferences(source, resolves, regions)` (`src/vectors.ts:313`),
   so `onion.ts` keeps its stated promise of no fs, no rg, no spawn, and its
   property tests stay property tests.
3. **The echo.** The picker header shows the absolute date a relative token
   resolved to — *"today = 2026-11-03"* — because a relative claim with no referent
   is precisely the unpaid claim this silo refuses. `--header` is fzf argv; it is
   the host's surface, not a pure layer's.
4. **Evidence for a date-only query.** `@2026-11-03` today returns path-only rows
   with no snippet (`src/onion.ts:248-250`). A day's thirty documents with no
   summaries is not a window a reader can work in. Fill the evidence the way the
   empty-query shelf already does — first line, clipped (`src/launcher.ts:283-291`).

**Out:**

- **A filename-date channel.** Verified redundant: fzf already matches the path.
  Adding a channel would double-count and re-order against `--tiebreak=index`.
- **Day separators in the list.** Would be the better instrument — let the reader
  see the days instead of typing them — and it is not available: fzf cannot insert
  non-selectable rows. Recorded because *that* is why the query is the right place.
- **A date-range grammar** (`@2026-10-01..11-03`). One ladder rung at a time.
- **Weekday names, `@last-month`, year inference.** `MM-DD` means *this year*, and
  the echo says which year it resolved to rather than guessing.
- Any change to bare-token content search, or to `--exact`, `--tiebreak` and the
  fixed fzf spine.

## Preconditions

- [ ] `bun test` green at the branch point; `onion.ts`'s property tests are the
      arbiter for everything in item 1.
- [ ] Confirm the first claim by hand before coding: `@2026-11-03` returns that
      day's documents today, path-only. If it does not, the brief's shape changes.
- [ ] The clock is a parameter of `routeQuery`, not a closure over `Date.now()`.
      A test that reads the wall clock is the defect this precondition prevents.

## Work Plan

1. Probe the date-only query and record the row count and the missing evidence.
2. `RE_DATE` gains `MM-DD`; tests for `@11-03`, `!@11-03`, and the unchanged
   content behaviour of bare `11-03`.
3. `routeQuery(query, now)` with the injected clock; three tokens; property tests
   across a year boundary and a month boundary (`@yesterday` on the 1st).
4. Header echo in the launcher's fzf argv.
5. Evidence for the date-only branch.
6. **Dogfood: one session, every query written down.** This is the acceptance step,
   not an afterthought — the brief exists because of what a session revealed.

## Acceptance Criteria

- `@11-03`, `@today`, `@yesterday` and `@week` each return the right documents, and
  `!@11-03` excludes them — with the date-only rows carrying evidence.
- The header names the resolved date for any relative token.
- Bare `11-03` behaves exactly as it does today; a test asserts it.
- `onion.ts` reads no clock, no fs, no rg: the module's header stays true.
- **The dogfood falsifier:** if, by the third day of use, the window is still
  reached by typing a date more often than by a token, then the tokens are the
  wrong shape and the answer is a different affordance — not a fourth token.

## Notes

- **The year is the silent defect, not the syntax.** `11-03` is unambiguous today
  because the corpus is one year deep. It will become ambiguous on the first
  anniversary, and nothing will error. The echo is what makes that visible; a
  silent widening to "this year and last" would be magic, and magic is where the
  glued-alternative defect came from.
- **Why the query and not the list.** The launcher owns two surfaces: the grammar
  and the fzf argv. Structure in the list is the thing that would help most, and it
  is the one thing fzf will not carry. So the window goes where we still have
  authorship.
- **Recency is already solved.** `orderByRecency` sorts every channel
  (`src/onion.ts:155`), and `ADR-SEARCH-RECENCY-053` reversed the order. This
  brief must not solve it a second time; the target is *the day itself*, not
  *what did we just do*.

## Related

- `src/onion.ts` — the staged pipeline; layers 1–4 are pure and property-tested.
- `src/launcher.ts` — the channel edges, `FZF_FIXED_ARGS`, the empty-query shelf.
- `ADR-SEARCH-RECENCY-053` — newest first; the other half of "recent", not this one.
- `docs/2026-08-30-search-conventions.md` — what the reader is taught to type.
- `docs/2026-11-03-perceptual-emphasis.md` — why the window is a perceptual
  requirement rather than a feature: it is a rank over the corpus, applied to time.
