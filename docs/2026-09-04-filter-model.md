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

### 4. Negation — `!term`, the reader-side filter (unparked 2026-09-05)

**Status: unparked.** The gate was "only worth it if the corpus grows a
class of results that repeatedly needs hiding — do not build for one
annoyance." Two dogfoods in one session cleared the gate: the 8742
search (judgement-of-shite), and `state colours` vs `state !colours`
(set-difference, 3 docs vs 69). The principle is on the record in
`advisories/ADV-READER-SIDE-FILTER.md`; the build is licensed, not yet
landed.

**Grammar: `!term`** — a term prefixed with `!` excludes documents
matching it from the results. `state colours` finds the 3 palette/glyph
docs; `state !colours` finds the 69 docs that mention "state" but
aren't about the colours. The reader-side filter is the half that
completes the shite-filter loop: the system assumes shite; the reader
inspects; the reader confirms shite; the filter learns. Without it, the
filter assumes but never learns; with it, the reader feeds back.

**The seam, corrected on inspection.** The original note here claimed
"fzf has no native negation in `--exact` mode." That is wrong as of fzf
0.73.1: `state !colours` under `--exact` returns exactly the docs
matching "state" but not "colours", today, with no flag change.
`--exact` is load-bearing (it switches fzf from fuzzy subsequence to
exact substring matching — without it, `state` matches `estate` and
`distatect`, the fuzzy soup the filter exists to refuse) and coexists
with `!` cleanly. The seam is not at fzf.

The real seam is in the silo's own query parsing. `rankedShortlistEntries`
builds the entry list from three channels (registry, body, filename) via
`rg`, and `rg` doesn't see the `!` — it sees the raw query. So `!colours`
would filter fzf's view of the entries, but the entries themselves would
still include `colours`-docs from the body channel, because the body
channel's `rg` matched `colours` before fzf ever saw the query. The build
is a pre-filter pass that strips `!term` from the query before the `rg`
channels run, and excludes `term`-matching docs from the entry list
before fzf. The principle doesn't specify the implementation; the
implementation respects the silo's own seam, not fzf's (which doesn't
exist).

**Status: landed 2026-09-06.** The pre-filter is built
(`BRF-CONCORDANCE-PREFILTER`). `parseQuery` splits `|` into
alternatives and extracts `!term` exclusions; the `rg` channels run
per-alternative; negated docs are excluded from the entry list before
fzf. fzf's native `--exact` `!` and `|` coexist (verified) for in-fzf
refinement, but the entry list is already correct.

### 4b. Case contract — the modern concordance style (landed 2026-09-06)

**Status: landed.** The concordance is case-insensitive across all
channels — the modern concordance style. The scriptorium's concordance
indexed every word regardless of capitalisation; the word is the word
whether the scribe wrote it in title case or not. Case-sensitive search
penalises the reader for not knowing the corpus's casing, and casing is
an accident of authoring.

**The fix:** `rg -i` on the single-word body channel (the outlier).
The registry channel was already `-i`; the multi-word body channel was
already `-i`; the single-word body channel was `rg -F` (case-sensitive).
One line: `bodyArgs.push("-F", "-i", pattern)`. The concordance is now
case-consistent across all three channels.

**The uppercase escape hatch — parked.** Smart-case (`-S`) gives the
reader a force-sensitive escape hatch: lowercase matches any case,
uppercase forces case-sensitive. The dogfood (`zod` finds `ZOG`)
cleared the case-insensitivity gate but not the escape-hatch gate.
Same discipline as `!` (section 4): build when the corpus grows a class
of queries that need it, not for one annoyance.

### 4c. OR — `|`, the concordance's union (landed 2026-09-06)

**Status: landed.** `a | b | c` returns the union of `a`, `b`, and `c`
results. The silo's `parseQuery` splits on `|`, runs one `rg`
invocation per alternative, and unions the entry lists (deduped,
rank-preserved via feed order). fzf's `--exact` does the final
substring refinement over the pre-OR'd list.

**The coincidence, explained.** Before the pre-filter, `filter |
filters` returned "most results" not because `|` was OR (it was a
literal in `rg`'s regex) but because markdown tables use pipes: the
body channel's regex `filter.{0,3}\|.{0,3}filters` matched a table row
where "filter" sits next to a pipe next to "filters". After the
pre-filter, `filter | filters` ORs correctly — the union of "filter"
results and "filters" results — and the table-pipe coincidence is
irrelevant. The OR is real, not accidental.

**fzf issue #412.** `|` as OR was added to fzf in v0.11.0 (2015),
closed by junegunn. Verified 2026-09-06: fzf `--exact` supports `|`
natively (`echo -e "alpha\nbeta\ngamma" | fzf --exact --filter="alpha
| gamma"` returns both). The silo's pre-filter resolves `|` upstream
so the entry list is correct; fzf's native `|` coexists for in-fzf
refinement.

### 4d. Spaces vs pipe — phrase-recall vs theme-recall (dogfood 2026-09-07)

**Status: documented (no code change — the grammar already works; the
lesson is which operator to reach for).** The OR grammar (4c) and the
phrase-tolerant body regex (the `.{0,3}` bounded gap) answer two
different recall questions, and the dogfood that surfaced the
distinction was a query that returned zero when it should have surfaced:

- `foucault car park` (spaces) → **0 body hits.** The body regex
  becomes `foucault.{0,3}car.{0,3}park` — three words joined by a
  3-character leash, on one line. The only line carrying both
  `foucault` and `car park` is `We fight Foucault in the car park` —
  the gap is ` in the ` (8 chars). The leash allows 3. Miss.
- `foucault | car park` (pipe) → **4 body hits, target at #1.** The
  union of the `foucault` hits and the `car park` hits; the target is
  a hit on both, so dedup ranks it first.
- `foucault` (alone) → **1 body hit, the target.** The quiet coda: one
  distinctive word beats a three-theme phrase every time.

The distinction the two operators express:

- **Spaces = phrase-recall.** You remember a phrase that sits together:
  `load bearing`, `car park`. The 3-char gap tolerates prose glue
  (hyphens, table pipes) — `load-bearing` and `load | bearing` — but
  not whole intervening phrases. Spaces answer "is this phrase in the
  corpus?"
- **Pipe = theme-recall.** You remember themes that may not co-occur on
  one line: `foucault` and `car park`, a paragraph apart. `|` unions
  the per-theme hit sets; a document in *both* sets ranks high. The
  pipe answers "which documents carry any of these themes?"

**Why the anti-shite filter survives.** The two operators live at
different layers, as 4c established: `|` runs upstream in the silo
pre-filter (widens the entry list honestly — a union, not a guess);
fzf `--exact` runs downstream (narrows it with substring AND). The
pipe does not weaken the anti-soup guarantee; it feeds the soup-filter
an honest union instead of the falsely-narrow zero that spaces
produced. `--exact`'s job (refuse `state` matching `estate`) is
untouched — it never saw the gap, and the pipe never asks it to.

**The web-search habit, named.** Typing three space-separated themes is
a web-search reflex — the web's inverted index ORs them silently and
ranks by co-occurrence. The concordance does not share the reflex:
space-separated words are a *phrase* here, not an implicit OR. The
honest operator for theme-union is `|`, explicit and upstream. The
discipline is the same as `!`'s (section 4) and the uppercase escape
hatch's (4b): reach for the operator when the dogfood shows the need,
not from habit. The three-word phrase that returns zero is the dogfood;
the pipe is the operator.

**The extension token — kind-recall (dogfood 2026-09-10).** A
filename-fragment term narrows by *evidence shape*, not topic:
`delusion` returns three (two documents discussing it, one named it);
`delusion .md` returns one, because `.md` appears in an evidence row
only where the evidence is path-shaped — a filename, a citation, a
mention. The term selects documents *named* X against documents
*discussing* X: the use/mention distinction
(`docs/2026-09-10-use-vs-mention.md`) surfaced in the query grammar,
where nobody put it. The operator taxonomy stands: spaces =
phrase-recall; pipe = theme-recall; `!` = negation; extension token =
kind-recall — name-shape vs theme-shape. Found by typing an extension
into the search for no reason; the composition produced a feature
nobody specified.

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

### 5. The sqlite temptation — declined, with reasons (2026-09-04)

The challenge was posed honestly: *compose the silo into a browser-like
experience with a small local sqlite database — make something you
already have, out of stuff you already have, to do something it already
does.* Declined, because the sentence is a self-portrait of the
redundant abstraction:

- **What the database would buy** — a persisted working set across
  sessions. The silo's answer already exists in its own idiom: the
  working set persisted is a **document** (a `&shelf.md`, written when
  you stand up, read when you sit down) — the trail-is-a-document rule,
  applied to sessions.
- **What the database would cost** — the first global state in the
  system: a cache that can go stale, a schema that can drift, a
  coherence problem where there used to be a file.
- **What the browser experience already is** — tabs = tmux windows;
  history = the window list; bookmarks = the shelf and the silcrows;
  reload = `r`; the address bar = the concordance; back = unnecessary.
  The composition exists. Only the chrome is missing, and chrome is
  where browsers go to die.

If the experiment is ever run, it runs in a scratch branch as a lab —
it must not merge, because its deliverable is the invariant this system
is built on refusing: global state. The seniority test is knowing that
the correct output of the challenge is the refusal, written down. This
is that.

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
7. A pure system fails totally and immediately — and that is good. A
   stateful system fails partially and silently: it runs, looks fine,
   and is quietly wrong. Total failure with trivial recovery beats
   partial failure with forensics. The corollary: when philosophy and
   ergonomics disagree, check whether the architecture has already
   resolved the philosophy's concern (the depth-one stack made the
   Backspace restoration safe before it was argued).

## Related

- ADR-030 (the live search) · ADR-031 (the main document)
- BRF-CONTENT-SHORTLIST (ranked sources) · BRF-PORCH-MATRIX (the
  scheme matrix — filters across silos is its distant cousin)
- `docs/2026-09-04-the-silcrow.md` — the notation this filtering serves
