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
2. **State filter — the shelf and the dive (landed 2026-09-04, the
   operator's decision).** No text → **root files only**: the shelf.
   Filter text → **corpus search results, root files excluded**: the
   dive. Arrive, and either you know what you are looking for (type it,
   refine) or you do not (read the root — which links everywhere). The
   &-family vanishes while searching along with every other root file;
   the pointers had their floor at the landing.
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

**Graduated 2026-09-04 — landed** (see State filter, above). The
remaining open question is scale behaviour: whether the shelf should
grow compartments as the silo grows (tier rows that expand on
selection) or stay a strict root. Recorded; not urgent.

### 1b. Folder-listing suppression (mused 2026-09-04, not built)

The index.md exclusion generalizes: a **hand-authored folder listing** —
a document whose references enumerate one folder's contents
(`explainers/README.md` is the exhibit) — is navigational furniture,
like the `&`-family. When searching, suppress it: the reader wants the
listed documents, not the list.

- **The detector must be coverage, not clustering:** of the documents
  in folder F, how many does this document reference? High coverage +
  all targets in F + the document announcing F = a listing. A themed
  essay linking five related decisions is not a listing; do not sweep
  it.
- **Payoff:** the same calm the `&`-family exclusion bought, extended
  to every authored index.
- **Status:** one annoyance so far — the ladder rule says wait for the
  second.

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

### 3. The agent's tour — visibility and marking (mused 2026-09-04)

The shared channel means an agent can render documents, not just audit
them. An agent on a magical mystery tour — dereferencing reference
after reference, spawning instances — leaves a trail **across the
screen**, and that is the alert: spatial traversal makes the trail
glanceable (the window count grows; the tour cannot hide in a stack it
does not have).

Refinements worth considering when agents actually tour:

- **Mark agent-spawned instances** — a footer/w title marker so the
  human distinguishes *my tour* from *the agent's tour* at a glance,
  and can close the agent's trail wholesale.
- **The audit leaves no trail** — `--entries` is read-only; littering
  is a choice the agent made, which is why visibility matters.
- **The trail is a document, not a stack** — an agent that toured
  writes its trail into a `&next` row or a debrief line; the editorial
  answer, as ever.

### 4. Negation

`-parked`, `-index` — exclusion terms. Cheap to add to the fzf layer
(fzf has no native negation in `--exact` mode; this becomes a
discovery-level filter). Only worth it if the corpus grows a class of
results that repeatedly needs hiding — do not build for one annoyance.

## The house vocabulary

The terms for "looking something up", gathered from a thousand years of
the trade — and the ones this silo uses:

- **Reference / cross-reference (§)** — the pointer itself. Law's
  `§12`, the back-of-book `see also`. Ours: the silcrow vector.
- **Dereference** — hypertext and pointer-speak: follow the reference
  to the thing it names. Ours: actuating a vector. Established.
- **Consult** — the library verb: to consult a reference work. The
  polite word for what the reader does to a document.
- **Resolve** — names to addresses (DNS, linkers). Ours: target string
  → document path, at the actuator.
- **Call number** — the library address used to fetch an item from the
  stacks. Our *callsigns* are call numbers by another spelling.
- **Concordance** — an index of every word in a text with its
  locations: full-text search in print form. The live search is the
  silo's concordance, compiled per keystroke.
- **Finding aid** — the archivist's term for a guide that describes a
  collection so it can be navigated. The `&`-family documents are
  finding aids; they step aside when you consult.
- **Selective dissemination (SDI)** — 1960s library science for
  filtered alerts: the profession's word for a *filter*.
- **Retrieval / recall / precision** — information retrieval's terms
  for the act and its quality measures.
- **Jump / go to** — the editor's verbs. Ours: the two-digit actuation.
- **Browse** — aimless by design; the landing's privilege.

The house verbs: **type, dereference, unwind, promote, consult**. The
house nouns: **main document, referenced document, signpost, silcrow,
concordance**.

## The rule for adding any of these

Ladder discipline (ADR-028's, applied to features): an implied filter
earns implementation when the dogfood shows the *same* manual
workaround recurring — the way the `&`-family suppression earned its
place after one afternoon of pointer-noise. No filter ships because it
would be neat.

## Lessons from the session that produced this note

1. A filter has states; each state owes the reader something different.
   Blending them was the day's worst bug class.
2. The signposts step aside: orientation documents announce what you
   want — they are not what you want. When you consult, the signposts
   make way.
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
