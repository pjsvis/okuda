---
date: 2026-09-07
kind: design riff (persisted)
lineage: illustrates docs/2026-09-04-filter-model.md (§4c OR, §4d spaces-vs-pipe); prompted by the foucault/car-park dogfood
session: ses_5dd576
---

# The search comparison — wall vs selection

A demo, not an argument. Two terminals, same query, two tools. The wall
of text on one side; the discrete selection on the other. Run them and
the filter model's case is self-evident where a doc can only assert it.

## The method

Two recipes, side by side, same query:

```
# terminal 1 — the wall
just search-regular "protocol-free | tts"

# terminal 2 — the selection
just search-ours "protocol-free | tts"
```

The same information need, served two ways. The contrast is the point.

## Three examples, measured

| Query | Regular (`rg -n`) | Flat (`rg -l`) | Ours (the dive) | Top hit |
|---|---|---|---|---|
| `protocol-free \| tts` | 57 lines | 18 files | 15 ranked | the TTS debrief |
| `foucault \| car park` | 26 lines | 5 files | 5 ranked | see the lesson, below |
| `concordance` | 24 lines | 7 files | 6 ranked | the concordance brief |

Three forms, three jobs:

- **`rg -n` — the wall.** Every matching line, every file, no ranking,
  no evidence curation. You read it like a log. This is what you get
  when you grep.
- **`rg -l` — the flat list.** One file per line, no ranking, no
  evidence. Grep's other mode. Discrete, but unranked and silent on
  *why* each file is here.
- **`gloam --entries` — the dive.** One row per document, ranked
  (registry hits first, then body hits in feed order), deduped, each
  carrying the evidence line that matched. The third option grep does
  not offer.

Ours is not "grep but better." It is a different form: the dive, ranked
and evidence-carrying — the concordance's answer to "where is the thing
I half-remember?"

## Why the selection wins

The wall makes you *read*. A 57-line grep dump is 57 lines of prose to
scan, filenames repeated on every line, no hint which document matters
most. The selection makes you *choose*: 15 discrete rows, the target on
top, each with the one line that earned it a place. The TTS debrief —
the document the TTS lister was looking for — is row one, not buried at
line 37.

The anti-shite filter is intact (filter-model §4c): the pipe runs
upstream in the silo pre-filter (an honest union, not a guess); fzf
`--exact` runs downstream (substring AND, refusing `state` matching
`estate`). The selection is smaller because it is *curated*, not because
the filter was weakened.

## The recipe shows the dive, not the shelf

`gloam --entries` outputs the ranked hits *then* the shelf — the 200+
root-and-corpus paths that form the no-query landing. For a search
comparison that is noise: the shelf is what you get when you *don't*
search, not a search result. The `search-ours` recipe filters to the
dive (rows carrying evidence), so the terminal shows the selection,
not the landing.

## A real lesson — writing about a query pollutes it

`foucault | car park` returns five ranked hits, but the top hit is the
filter model itself (§4d repeats the phrase). The real target —
`docs/2026-09-03-the-variable-is-the-invariant.md`, the essay that
actually argues in a car park — sits second. Writing about a query
inflates its term-frequency in the meta-doc; the concordance, which
ranks by where the terms cluster, promotes the document that
*discusses* the query over the document the query is *about*.

The recipe default (`protocol-free | tts`) avoids this and puts the
target on top. The lesson, not the workaround, is the point: a
concordance is only as honest as its corpus, and a corpus that
documents its own queries carries a small feedback loop. The same
discipline as `!` and the uppercase escape hatch (filter-model §4, §4b):
note it, don't build around it until it bites more than once.

## Run it

Try the foucault query, the concordance query, your own. The wall is
always longer; the selection is always ranked. The TTS lister's file is
row one, not line 37.

## Related

- `docs/2026-09-04-filter-model.md` — the model this illustrates (§4c
  OR, §4d spaces-vs-pipe)
- `briefs/2026-09-06-brief-concordance-prefilter.md` — the pre-filter
  that made the union honest