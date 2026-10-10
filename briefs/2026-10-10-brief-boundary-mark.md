---
type: Brief
callsign: BRF-BOUNDARY-MARK
date: 2026-10-10
---

# Brief: The boundary mark — the receipt elides the addresses the cap never realised

**Date:** 2026-10-10
**Status:** Open
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

- [ ] BRF-ADDRESS-CAP fork B landed: `scanReferences` returns every occurrence, and the
      remaining cap is on destinations (`briefs/2026-09-14-brief-address-cap.md`;
      `docs/2026-09-15-the-cap-is-on-the-wrong-quantity.md`). Without it the predicate
      cannot tell full from truncated.
- [ ] A truncated fixture exists — a source with 81+ distinct destinations, or the
      corpus's own `briefs/index.md` at its current count.
- [ ] The false-positive control exists — a source with exactly 80 distinct destinations
      and no repeats.
- [ ] `just check` and `just test` green before starting.

## Work Plan

1. [ ] Return `truncated` from the derivation: the document's distinct destinations
      exceed the map's entries after the address cap applies.
2. [ ] Emit the mark in `referencesSection` when `truncated` — the final line, muted,
      no silcrow.
3. [ ] Add the term to the suppression: a truncated map is never suppressed.
4. [ ] Thread the fact through the `cli.ts` and `tui.ts` call sites.
5. [ ] Pin it: the vectors test gets the truncated case, the exact-80 control, the
      self-tabling-truncated case, and the no-silcrow-on-the-mark assertion.
6. [ ] The record: amend ADR-047 (its suppression condition gains `!truncated`) and
      record the boundary-mark pattern — a new ADR if it outgrows the amendment; run the
      palimpsest protocol on any amendment (`playbooks/decisions-playbook.md`).
7. [ ] `just check` green; `just test` green.

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
