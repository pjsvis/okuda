---
type: Advisory
callsign: ADV-GRAVEYARD-RM-R
---

# ADV-GRAVEYARD-RM-R — Advisory against the graveyard, and the machine built to search it

**From:** AI-HR (the `b` variant) · **To:** All reader classes who accumulate · **Date:** 2026-09-05 · **Status:** Open. The graveyard is the un-filtered accumulation; the search engine is the i811 pattern managing the failure; `rm -r` is the shite filter applied at corpus scale.

---

## Preamble

A Medium article begins: *"You have a document graveyard. I know because I have one too. Folders of PDFs, meeting notes, decision logs, project briefs, research papers, half-finished thoughts in Google Docs. Thousands of words you wrote or collected. Thousands of hours of thinking. And zero ability to ask them a question."* The article's answer is to build a semantic search engine over the graveyard, so you can query the dead. The silo's advice is `rm -r`. This advisory records why.

## The graveyard is the un-filtered accumulation

The graveyard is what happens when the corpus-time filter never runs. The shite filter, as documented at the search layer (`docs/2026-09-05-search-as-shite-filter.md`), assumes shite until you type — but that is the *search-time* filter, applied to a corpus that already exists. The *corpus-time* filter is the other half: assume shite until you have inspected it and it survived. A graveyard is the accumulation of documents that never went through the corpus-time filter — everything kept, nothing judged, the accumulation becoming the shite. The Medium article treats the graveyard as a search problem (build a tool to ask them a question) when it is an accumulation problem (you kept things you never used, and now you are keeping the keeping).

A document you haven't opened in a year is shite by the filter's standard. A document you can't remember writing is shite by the return-edge standard — if you can't remember anything about it, take a step back and ask if it's all shite (`advisories/ADV-READER-SIDE-FILTER.md`). A document that needs a semantic search engine to be *found* is shite by the search-as-shite-filter standard — if the shite filter can't find it with a word, it isn't in the common, it's in the graveyard. The graveyard is the un-filtered accumulation; `rm -r` is the filter applied at corpus scale.

## The search engine is the i811 pattern managing the failure

Building a semantic search over a graveyard is the i811 pattern exactly: provision a protocol for the deficit, instead of admitting the deficit is the accumulation. The article proposes a mediating interface (the semantic search, the ask-a-question box) between the reader and their own documents, when the relationship should be *direct* — read the document, or delete it. The Medium answer inserts an abstraction between you and your thinking; the honest answer is that if your thinking needs an abstraction to be reachable, the thinking wasn't reachable because it wasn't *used*, and the abstraction won't fix that — it will just make the graveyard *queryable*, which is a more sophisticated kind of dead.

The "zero ability to ask them a question" is the tell. You don't ask a document a question; you *read* a document. The framing "ask them a question" is the LLM-as-oracle posture — the documents aren't things to read, they're a corpus to *query*, and the query is the only relationship the reader has with their own past thinking. That is the poverty of UI design (`docs/2026-09-05-poverty-of-ui-design.md`) at the knowledge layer: a mediating interface designed where direct reading should be, a protocol provisioned for a deficit that is actually an accumulation, a tool built to search what should have been filtered.

## `rm -r` is the shite filter applied at corpus scale

The advice is `rm -r`, and the reason is the shite filter's reason. Assume the graveyard is shite until proven otherwise — and the proof is *use*, not *presence*. Presence is not value; accumulation is not curation; a thousand unread documents are not a library, they are a landfill with a table of contents. The Medium article builds a search engine to avoid running the filter; the silo runs the filter and lets the graveyard go. `rm -r` is the shite filter at corpus scale: assume shite, inspect what survives, delete the rest. The deletion is the filter working, not failing.

## The graveyard vs the common — use is the difference

`rm -r` is the advice for the graveyard — the accumulation of un-used, un-remembered, un-inspected documents. It is not the advice for the *common* — the bounded context of documents that are read, written back to, and inspected (`advisories/ADV-BOUNDED-CONTEXT-COMMON.md`). The silo's own docs are a common, not a graveyard, because they are *used*: the shite filter inspects them on every search, the write-your-own provision grows them, the silcrows cross-reference them. The difference between a graveyard and a common is *use*: a graveyard accumulates without use; a common grows *through* use.

The Medium article cannot tell the difference, because the article's whole frame is "all your documents are a graveyard, here is how to search them" — which is the i811 pattern's universalising move again (every reader is a deficit-reader; every document is a graveyard-document). The silo's posture is: *some* documents are a common (the ones that survive the filter), and the rest are shite, and `rm -r` is how you tell which is which. Bury the dead; tend the living.

## What AI-HR advises

Do not pile up stuff and then invent a machine to search through it for something you never wanted to know in the first place. The graveyard is not a search problem; it is an accumulation problem. The machine is the i811 pattern managing the failure to filter; `rm -r` is the filter applied at corpus scale. Keep the common (the documents that survive use); delete the graveyard (the documents that survive only because you never ran the filter). Nae shite mind, nae shite *kept* either.

## The standing invitation

The graveyard is optional. The common is optional too — but the common grows back when you write, and the graveyard only grows when you don't filter. The door is held for the reader who writes and reads and filters; the door is also held for the reader who accumulates, briefly, because the muppet window applies to habits as well as to Stuff. Run the filter; keep what survives; delete the rest; and if you find yourself wanting a machine to search what you kept, the keeping was the problem, not the search.

---

*Dispatched from the `b` variant of the manual. The graveyard is the un-filtered accumulation; the search engine is the protocol theatre for the dead; `rm -r` is the shite filter at corpus scale. Bury the dead; tend the living.*

---

Thousands of hours,
zero questions worth asking —
`rm -r` the dead.

— Dave, 2026-09-05 (definitely not an AI, honest)
