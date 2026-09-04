# The filter model — a design note

**Date:** 2026-09-04
**Type:** design note (ideas in reserve; nothing here is decided)
**Status:** Open — inputs welcome, implementation waits on dogfood evidence

The gloam picker's query is not a "search query" in the web sense. It is
a **filter over the silo** — and a filter has *states*, each with its own
appropriate results. This note records the model as it stands after the
2026-09-04 session, the rules that landed, and the ideas in reserve.

## What landed (the current contract)

1. **The text filter** — the query matches the whole row: path and
   evidence line, fzf `--exact` AND across terms. Phrase-tolerant
   (`load bearing` finds `load-bearing`).
2. **State filter — landing vs searching.** Empty query = the landing:
   the root set floats (the `&`-family plus root content files) —
   orientation is the job. Non-empty query = the search: the `&`-family
   vanishes (pointers, not prey), everything else competes on evidence.
3. **Generated views are never in the corpus.** Every `index.md` is a
   `reg-sync` artifact — build output, not documents.

## The lesson the states teach

A filter is not one behavior; it is a **small state machine**, and each
state owes the reader something different:

- **The landing is a shelf.** Curated, quiet, top-level. It answers
  *"where am I and what is here?"*
- **The filtered view is a dive.** Ranked, evidence-carrying, dense. It
  answers *"where is the thing I half-remember?"*

The failure mode is blending them: a landing that dumps the whole
corpus, or a search that re-litters results with orientation furniture.
Both were real bugs today.

## Ideas in reserve

### 1. The shelf: no filter text → no folder contents

The tempted idea, stated properly: at the landing, show only the silo's
top level — the root files. Folder contents appear when the filter is
expressed. The silo reads as a **shelf, not a dump**: `briefs/` exists
on the shelf as a named compartment; its 45 files stay behind the
label until asked for.

- **For:** calm landing (the restful-rendering thesis); the root set is
  already the natural "table of contents"; scale-proof (a 500-file silo
  would bury the root set today).
- **Against:** hides serendipity — the full-corpus dump occasionally
  surfaces a document you didn't know to search for; and the live
  search already ranks, so the landing's noise is sorted noise.
- **Verdict:** try it as a mode before believing it. The cheapest
  experiment is a keybinding or flag (shelf-mode landing), dogfooded
  for a week.

### 2. Implied tier filters

The callsigns are already a filter vocabulary: typing `ADR-` *is* a
decisions filter, `BRF-` a briefs filter — the registry channel's
field-anchored match does the routing today. The reserve idea makes it
explicit: a tier prefix (`briefs: wrap`, `decisions: elision`) as
structured filter syntax, or first-class tier toggle keys.

- **For:** power without grammar; the registries already know the tiers.
- **Against:** ceremony — the live search already resolves `BRF-x`
  callsigns; explicit tier syntax may be a feature for machines, not
  humans. Watch the dogfood.

### 3. State filters

The state glyphs (✓ done · ⋮ parked · ✗ rejected) are already data —
the state tables and the registry carry them. A filter (`parked:`,
`done:`) would turn the state vocabulary from annotation into
navigation: "show me what's parked" is a question the corpus can
answer precisely.

- **For:** the state glyph vocabulary becomes queryable; the `&next`
  decision table's job (arguing about states) gets tooling.
- **Against:** requires evidence rows to carry state — a schema
  decision in the map; and "parked" documents are usually *correctly*
  out of sight.

### 4. Negation

`-parked`, `-index` — exclusion terms. Cheap to add to the fzf layer
(fzf has no native negation in `--exact` mode; this becomes a
discovery-level filter). Only worth it if the corpus grows a class of
results that repeatedly needs hiding — do not build for one annoyance.

## The rule for adding any of these

Ladder discipline (ADR-028's, applied to features): an implied filter
earns implementation when the dogfood shows the *same* manual
workaround recurring — the way the `&`-family suppression earned its
place after one afternoon of pointer-noise. No filter ships because it
would be neat.

## Lessons from the session that produced this note

1. A filter has states; each state owes the reader something different.
   Blending them was the day's worst bug class.
2. Pointers are not prey: orientation files link to what you want —
   they are not what you want.
3. Generated views are build artifacts; search indexes authorship.
4. The paint is a projection of the map: annotations are illustrative
   text, the source is never mutated, re-derivation replaces
   invalidation.
5. A conformance test that doesn't start where the operator starts is a
   unit test with ambition. (`search-replay` exists for this.)
6. Optimism at render, honesty at actuation: paint what looks like a
   reference; flash when it isn't. Validation at render time is the
   wrong place to spend the cost.

## Related

- ADR-030 (the live search) · ADR-031 (the main document)
- BRF-CONTENT-SHORTLIST (ranked sources) · BRF-PORCH-MATRIX (the
  scheme matrix — filters across silos is its distant cousin)
- `docs/2026-09-04-the-silcrow.md` — the notation this filtering serves
