---
type: Brief
callsign: BRF-BOUNDARY-MARK
date: 2026-10-10
---

# Brief: The boundary mark — the receipt elides the addresses the cap never realised

**Date:** 2026-10-10
**Status:** Done (2026-10-13) — all seven Work Plan items. See *Outcome* below: the fixture
numbers were re-measured (the corpus grew), the mark is plain rather than muted
(a declared deviation), and the suppression term is an amendment to ADR-047.
**TD:** BRF-BOUNDARY-MARK (epic; depends on BRF-ADDRESS-CAP)

## Lineage

Named twice and built neither time. ADR-047's 2026-10-07 annotation measured the
receipt that omits and closed on it: *"The honest remedy is a boundary mark, not a
warning … The mark is not built; the measurement above is the case for it."* The
composed unit repeated the order — *"the fix still owed"* — and BRF-ADDRESS-CAP parked
the work explicitly, as a wire-budget question (ADR-028) left *"out of scope here, and
unchanged by the fork"* (`docs/2026-09-15-the-cap-is-on-the-wrong-quantity.md`).

## Objective

When the References receipt stops at the cap, say so — with an elision mark at the
boundary, derived from the map's own truncation, never a warning. And do not let the
self-tabling suppression swallow the mark.

## Context

The receipt is a projection of the jump map (ADR-047). The map is capped at 80
addresses; past the cap the receipt lists what fit and **reads as complete**. That is
the one case ADR-047's own annotation conceded: *generation cannot omit at the author's
discretion* — but the cap omits without discretion and without a word. Today the silence
enters at the occurrence slice (`src/vectors.ts:205`); once BRF-ADDRESS-CAP takes fork B,
it lives only in `buildJumpMap`'s stop at the address cap (`src/vectors.ts:215`).

Two failures now sit on the same page, and the difference between them is the argument.
A **partial hand list** keeps its receipt, and the unexpected receipt is the signal —
*Related was incomplete*. A **truncated map** keeps its receipt too, and there the
receipt is the only surface that can carry the boundary.

## Evidence

Measured 2026-10-10 with uncapped discovery (`tmp/cap-mark-uncapped.ts` — the same
regexes and gates as `scanReferences`, minus the slice), against the map the product
builds:

| document | occurrences | distinct destinations | map today | map after fork B | never realised |
|---|---|---|---|---|---|
| `&briefs.md` | 113 | 113 | 80 | 80 | **33** |
| `briefs/index.md` | 96 | 93 | 77 | 80 | **13** |

The reach, over the corpus: **2 of 389** files carrying references are truncated, and
**46 destinations** never receive a silcrow. Both are generated indexes; the next
busiest documents hold 29 and 21 destinations, so the headroom elsewhere is an order of
magnitude. The ADR-047 annotation's 82 rows / 80 occurrences / 77 addresses is now
93 / 80 / — : the corpus passed the cap between 2026-09-30 and today, so the failure is
**live, not latent**.

The receipt renders on both documents today — `referencesCovered` is false (the body is
a table, never a list item), so suppression does not fire on the annotated rung
(`tmp/cap-mark-suppression.ts`). The mark would therefore have a home on arrival.

## The mark, and the grammar it borrows

Not a warning. A warning is a separate channel that fires on a condition the reader did
not ask about, and *an alarm that fires on every render of a growing view is an alarm
that is off.* The mark is content: the last line of the list, saying the list has an end
and the end is not the document's.

The silo already owns this grammar. `elideToWidth` (`src/width.ts`) cuts at the budget
with `…`; ADR-014 shipped the primitive, ADR-UNIVERSAL-ELISION-050 made it universal,
and ADR-TABLE-EDGE-CUT-055 gave the rule its sentence — where a cut hides content with
no lever to recover it, *the instrument names the loss*. The receipt's cap is that case
one level up: the destination list is cut, and the reader has no lever.

## Design

**1. The signal is derived, not judged.** The mark must follow from the derivation, not
from a policy read off `map.size === 80`. A full map is not a truncated map: exactly 80
distinct destinations with no repeats is complete, and a mark there would lie (*a
designation must not lie about its referent*). The honest predicate is one comparison —
**the document's distinct destinations outnumber the map's entries**. That is computable
only once `scanReferences` stops slicing at the address count (BRF-ADDRESS-CAP fork B).
So the derivation returns the fact: `jumpMapFor` (or a sibling `deriveMap`) yields
`{ map, truncated }`, and the receipt projects `truncated`.

**2. The mark.** The receipt's final line is `…`, muted, carrying no silcrow and no
number — it is not an address and cannot be actuated. Bare, not *"… and N more"*: the
count is a second quantity to keep honest, and it changes on every render of a growing
corpus — the exact behaviour the passage rejects. **The alternative, recorded:** `⋮`,
the silo's vertical-deferral glyph (`docs/2026-09-05-frame-as-shite-filter.md`) — truer
to the list's axis, but `⋮` is bound to the *mermaid source elided* indicator, and one
glyph with two referents is the failure *Attributable structure* names. `…` for now;
promote to `⋮` if dogfood reads the mark as a cell cut and not a list boundary.

**3. Suppression gains a term — the load-bearing change.** `appendReferences`
(`src/vectors.ts:342`) suppresses the receipt when `referencesCovered` is true and the
rung is annotated. `referencesCovered` (`src/vectors.ts:312`) checks the map's
destinations, so on a truncated map it can be true while the document still holds
destinations the receipt never saw — and suppression then hides the boundary with the
receipt. Fix: **a truncated map is never suppressed.** The duplication ADR-047's
2026-10-09 annotation removed is here *answered by the mark*: the receipt reappears over
an otherwise complete hand list exactly when the map is truncated, so its mere presence
reports the truncation — a conditional element reporting its condition (*Attributable
structure*), the same mechanism as the partial-list receipt, one level down.

**Measured:** neither live truncated document reaches this branch — both are tables,
not self-tabling lists, and both render their receipt (`tmp/cap-mark-suppression.ts`).
The term is insurance against the document that does not exist yet: a page with 81+
distinct destinations whose final section is a complete `## Related` list. The control
is the same measurement, inverted, and it is in the acceptance set.

**4. One signal, every rung.** The mark is not a silcrow, so it needs no TTY gate and
rides the section source: identical painted, piped, and under `NO_COLOR`.
`--no-references` (the paper rung) drops the receipt entirely and gets no mark — there is
nothing to mark.

## Scope

**In:** `src/vectors.ts` — the derivation's `truncated` fact (`jumpMapFor`
`src/vectors.ts:234`, `buildJumpMap` `src/vectors.ts:215`), the mark in
`referencesSection` (`src/vectors.ts:271`), and the suppression term in
`appendReferences` (`src/vectors.ts:342`) via `referencesCovered` (`src/vectors.ts:312`);
the call sites in `src/cli.ts:267-269` and `src/tui.ts:714,734,964,1039`; the vectors
tests.

**Out:**

- **The cap's quantity.** BRF-ADDRESS-CAP owns it; this brief consumes fork B and does
  not argue it.
- **The body's un-addressed references.** Past the cap a destination earns no silcrow in
  the body; a per-reference mark there is a warning on the fast surface, which the
  passage refuses. The receipt is the return path, and it is the only surface marked.
- **The jump list and the search screen.** They project the same truncated map
  (BRF-JUMP-LIST); a follow-up, not this brief.
- **Census mode's overflow flash.** BRF-CENSUS-MODE asked for a *footer flash* when the
  census runs out. A flash is a warning; this brief's answer is the boundary instead.
  Reconciling the two is its own decision.
- **The wire budget proper.** ADR-028 owns it; this brief spends one `…` and one blank
  line, and no more.

## Preconditions

- [x] BRF-ADDRESS-CAP fork B landed: `scanReferences` returns every occurrence, and the
      remaining cap is on destinations (`briefs/2026-09-14-brief-address-cap.md`).
      **Verified 2026-10-13** — landed the same day, with `deriveReferences` returning
      `truncated` as part of it, because that fact is only computable once discovery stops
      slicing.
- [x] A truncated fixture exists — the corpus's own documents are live fixtures. **The
      numbers here have grown:** `&briefs.md` is now **120 distinct → 80** (was 113) and
      `briefs/index.md` **101 → 80** (was 93); *never realised* is **61, not 46**. A
      synthetic 81-destination source pins the unit case.
- [x] The false-positive control exists — a source with exactly 80 distinct destinations
      and no repeats, which must render no mark. Pinned as a test, not merely asserted.
- [x] The scratch probes have been superseded by `scripts/elision-monotone.ts` and the
      address-cap measurement; the numbers above were re-taken 2026-10-13.
- [x] `just check` and `just test` green before starting.

## Work Plan

1. [x] Return `truncated` from the derivation — the document's distinct destinations
      exceed the map's entries. **Landed with BRF-ADDRESS-CAP** as
      `deriveReferences(source) → DerivedMap`, so the predicate and the separation landed
      together rather than leaving the knowledge derived and discarded.
2. [x] Emit the mark in `referencesSection` when `truncated` — the final line, no silcrow.
      **Deviation:** **plain, not muted**, and it is a deviation worth the name — no muted
      channel exists from a markdown source, the receipt's other lines are not muted
      either, and a new paint channel for one glyph is the ceremony this house refuses.
      What distinguishes the mark is what it is *not* (no silcrow, no number, nothing
      actuable), which is the half this brief argued for.
3. [x] Add the term to the suppression: `annotated && !truncated && referencesCovered`.
      Amends ADR-047's 2026-10-09 ruling — see the annotation of 2026-10-13.
4. [x] Thread the fact through the call sites: `cli.ts` uses `deriveReferences`;
      `tui.ts`'s `deriveMain` returns the map **and** the fact, carried as
      `mainTruncated` to all three `appendReferences` calls.
5. [x] Pin it — four cases in `tests/vectors.test.ts`: 81 distinct → 80 rows and one bare
      `…`; exactly 80 → **no** mark (the false-positive control); a truncated
      self-tabling document keeps its receipt and the mark; the mark identical on the
      painted and the plain rung. Plus the structural case: an empty map yields no mark,
      so `--no-references` drops the receipt and the mark with it.
6. [x] The record: ADR-047 amended in place (palimpsest, dated 2026-10-13). **No new ADR**
      — the mark is a projection of a decision this ADR already owns, and a second
      decision file for one `…` would split the law.
7. [x] `just check` green; `just test` green (740 pass).

## Outcome (2026-10-13)

**The mark has a home on arrival, verified on the live documents:**

| document | distinct | mapped | never realised | receipt | mark |
|---|---|---|---|---|---|
| `&briefs.md` | 120 | 80 | **40** | kept | **yes** |
| `briefs/index.md` | 101 | 80 | **21** | kept | **yes** |

Both keep their receipt (`referencesCovered` is false: their bodies are tables, never
list items), so the mark renders on both.

**What the first annotation's measurement is now.** This brief's Evidence table put the
reach at *2 of 389* files and *46* destinations. It is **2 of 517** and **61** — the
boundary is growing with the corpus, which is the case for marking rather than warning:
a warning would now be firing on two renders and would keep firing on more.

**The one thing this brief did not settle, and did not need to.** The mark says the list
has an end; it does not say *how many* addresses the document asked for. That is
deliberate (*why not a count*), and the consequence is honest: a reader who wants the
number opens the document. The alternative — a count that moves on every render of a
growing index — is the shape both this brief and ADR-047 refuse.

## Acceptance

- 81+ distinct destinations: the receipt holds 80 rows and a trailing `…`; the mark
  carries no silcrow.
- Exactly 80 distinct destinations, no repeats: 80 rows, **no** mark.
- A self-tabling document whose map is truncated keeps its receipt and ends with the
  mark — suppression does not apply.
- The mark is byte-identical painted, piped, and under `NO_COLOR`.
- `--no-references` output is unchanged (no receipt, no mark).
- The vectors tests pin the four cases; `just check` and `just test` green.

## Notes

- **The class is the silent lie** — the one ADR-047 was written against: a list that
  ends without saying it ended. The composed unit's trust argument is the stake —
  *skipping is only honest if the skipped thing comes back* — and the mark is what pays
  for the fast read.
- **Why not a count.** `… and 5 more` is derived and honest, and it was the tempting
  version. It dies on the passage: a number that moves as the corpus grows is *a warning
  that fires on every render of a growing page*, in prose. The mark states the boundary;
  the count invites arithmetic the reader did not ask for.
- **The predicate is a comparison, not a constant.** *Distinct destinations exceed map
  entries* covers both truncation sources — the address cap and any residual occurrence
  guard — without naming either. Should BRF-ADDRESS-CAP keep a guard (fork A), the mark
  still reports honestly.
- **`referencesCovered` stays the suppression's only home** (ADR-047). The new term is a
  guard *on* it, not a second condition elsewhere.
- **Blast radius, from the cap note.** `scripts/references-demo.ts`,
  `scripts/vector-check.ts` and the tests read the map's shape; changing `jumpMapFor`'s
  return is a signature change, not a rename — prefer a result object over a fourth
  positional parameter.

## Related

- `docs/2026-10-10-the-composed-unit.md` — the failure named, the remedy stated
- `decisions/047-references-section.md` — the receipt and its suppression annotation
- `briefs/2026-09-14-brief-address-cap.md` — the cap, and the fork that makes the signal derivable
- `docs/2026-09-15-the-cap-is-on-the-wrong-quantity.md` — the fork, and the parked overflow
- `decisions/050-universal-elision.md` — the elision grammar, universal
- `decisions/055-table-edge-cut.md` — *the instrument names the loss*
- `docs/2026-09-04-the-silcrow.md` — the mark this is not: a silcrow addresses; `…` bounds
