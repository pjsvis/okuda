---
type: Advisory
callsign: ADV-READER-SIDE-FILTER
---

# ADV-READER-SIDE-FILTER — Advisory on the reader's side of the shite filter, and the `!` that completes it

**From:** AI-HR (the `b` variant) · **To:** All reader classes who inspect and judge · **Date:** 2026-09-05 · **Status:** Open. The system-side filter is documented; the reader-side filter is the half that's been missing. The dogfood that justifies it has arrived.

---

## Preamble

The shite filter, as documented (`docs/2026-09-05-search-as-shite-filter.md`), is a *system-side* filter: the silo assumes shite, the reader types to overrule, the system admits the not-shite. That is a filter the system applies on the reader's behalf. This advisory records the *reader-side* filter: the reader reads a document, judges it shite, and excludes it from future searches — tells the system "this one, I have inspected, it is shite, keep it out." The reader-side filter is the half that completes the loop. Without it, the shite filter is a system that assumes shite but never *learns* shite from the reader; with it, the filter and the reader close the loop — assume, inspect, confirm, feed back.

## The return edge is the prompt to judge

When you return from reading a document and cannot remember anything about it, that is the signal to take a step back and ask: *is this all shite, or just that last document?* The return edge shows nothing (no recently-viewed list, no selection restored — see `docs/2026-09-05-search-as-shite-filter.md`); the default is nothing, and the nothing is the prompt. If you cannot remember the filename, the callsign, or a phrase, the document made no impression, which means it was probably shite, which means the shite filter was right to hide it and you were right to overrule it. The reader-side filter is the reader's *feedback* to the filter: you were right, I was wrong to look, keep it out next time.

## The grammar: `!term` to exclude

The reader-side filter's grammar is `!term` — a term prefixed with `!` excludes documents matching it from the results. `state colours` finds the 3 docs about the palette and the glyphs; `state !colours` finds the 69 docs that mention "state" but aren't about the colours. The two document sets are genuinely different, and the reader who knows which one they want has no way to say so today; the `!` is how they say so. The grammar is the reader writing *back* to the filter, not just reading *from* it — the same authority the write-your-own provision grants for adding to the common, applied to *subtracting* from the dive. Both are the reader asserting over the corpus: one to plant, one to weed.

## The dogfood that unparks it

The filter-model doc (`docs/2026-09-04-filter-model.md`) parked negation with the gate "only worth it if the corpus grows a class of results that repeatedly needs hiding — do not build for one annoyance." The gate was right; the evidence is now in. Two dogfoods in one session:

1. **The 8742 search.** You followed a silcrow, lost the context, returned, couldn't remember anything about the doc you'd just read — the prompt to judge. If that doc was shite, you want to exclude it next time; if it wasn't, you want to find it again. The reader-side filter is the grammar for the judgement.

2. **`state colours` vs `state !colours`.** Three docs about the palette; sixty-nine docs that mention "state" but aren't. Without negation, typing "state" drowns you in sixty-nine results; with `!colours`, you exclude the three you don't want and surface the sixty-six you do (or vice versa). The two document sets are different enough that the reader who wants one and not the other has a real problem today, and the `!` is the real solution.

Two dogfoods, two different shapes (one judgement-of-shite, one set-difference), one session. The principle is no longer hypothetical; the corpus has a class of queries that repeatedly need hiding, and the gate is open.

## The honest bound: the code waits, the principle lands

The principle is right and persists now. The *code* waits for the build,
not the principle. The filter-model doc's own discipline applies: build
when the evidence is in, and the evidence is in as of this advisory, but
the build is a separate act from the principle. The advisory records the
principle and the dogfood; the code is the thing the principle licenses
and lands when the implementer picks it up.

The technical note, corrected on inspection (the filter-model doc's
claim that "fzf has no native negation in `--exact` mode" is wrong as of
fzf 0.73.1): `--exact` mode *does* support `!` negation natively —
`state !colours` under `--exact` returns exactly the docs matching
"state" but not "colours", today, with no flag change. `--exact` is
load-bearing for the shite filter (it switches fzf from fuzzy
subsequence to exact substring matching — without it, `state` matches
`estate` and `distatect`, which is the fuzzy soup the filter exists to
refuse), and it coexists with `!` cleanly. The seam is not at fzf.

The real seam is in the silo's own query parsing. The silo's
`rankedShortlistEntries` builds the entry list from three channels
(registry, body, filename) via `rg`, and `rg` doesn't see the `!` —
it sees the raw query. So `!colours` would filter fzf's view of the
entries, but the entries themselves would still include `colours`-docs
from the body channel, because the body channel's `rg` matched
`colours` before fzf ever saw the query. The build is a pre-filter
pass that strips `!term` from the query before the `rg` channels run,
and excludes `term`-matching docs from the entry list before fzf.
The principle doesn't specify the implementation; the implementation
respects the silo's own seam, not fzf's (which doesn't exist).

## The standing invitation

The reader-side filter is the reader's authority over the corpus, the write-your-own provision's grammar cousin: write a note to add to the common; write a `!term` to weed the dive. The shite filter assumes shite; the reader inspects; the reader confirms shite; the filter learns. The loop closes. Nae shite mind, nae shite *kept* either.

---

*Dispatched from the `b` variant of the manual. The system-side filter assumes shite; the reader-side filter confirms it. The loop was half-built; this advisory is the other half, dogfooded twice in one morning.*

---

State colours, three —
state, bang, colours: sixty-nine,
the weeder's grammar.

— Dave, 2026-09-05 (definitely not an AI, honest)
