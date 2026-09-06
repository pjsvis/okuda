# The search system as a shite filter

**Date:** 2026-09-05
**Type:** design note (a posture reading of the filter model, not a new feature)
**Status:** The frame the filter-model doc (`docs/2026-09-04-filter-model.md`) should be read in. Companion to it; does not supersede.

---

## The inversion

Read the filter-model doc as written and it's a *search* — query in, ranked results out, the shelf and the dive as two states of one filter. Read it the other way round and it's a *rejection system that happens to admit things on demand.* The inversion matters because it changes what the default state *means*. A search engine's default is "everything, ranked" — the corpus is there, you're just sorting it. The silo's default is *nothing* — the shelf, a handful of root documents, and the explicit invitation to walk away. The dive is what you get when you actively overrule the default by typing. The shite filter isn't a ranking layer over a corpus; it's a *rejection layer over silence*, and the silence is the honest default.

This is the filter-model doc's shelf/dive distinction read at its most radical, and it's the right reading. The shelf answers *"is there anything here worth my time?"* — and it's allowed to answer *"maybe not, here's the door."* The root documents are the *case for the silo's own existence*: this is what's here, this is why you'd bother, this is the index of what pushing any button other than Ctrl-C would get you. If they don't make the case, Ctrl-C is the correct response and the shelf has done its job — it filtered the silo *out* of your morning, which is a successful filter, not a failed one. A search engine that returns zero results has failed; a shite filter that returns "nothing worth your time" has *succeeded*. The difference is whether the system claims to serve your query or your attention.

## The three properties of an honest filter

### 1. Nothing to see here, apart from some documents that tell you what there is to see

The shelf isn't a teaser — it's not a landing page trying to keep you on the site. It's a *table of contents that admits the book might not be for you.* The root documents don't lure; they describe. That's the anti-clickbait posture: the shelf shows you what's here so you can decide whether here is worth being, not so you'll stay regardless. The documents in the root are all you have, and all you need, to make the decision the shelf exists to let you make.

### 2. Or you can just type words that interest you

The dive is *opt-in intent.* You don't get it by scrolling, by browsing, by the system guessing what you want — you get it by typing words, which is the cheapest possible declaration of interest and the easiest to withhold. The filter only opens when you say something. This is the first law of temporal accessibility: *time belongs to the reader.* The system never spends your time pre-loading results, never pushes suggestions, never autocompletes into your attention. It waits. And it waits because waiting is the respect; acting unprompted is the theft.

### 3. At any time you can just walk away

This is the one the i811 pattern can never offer, because the i811 pattern's whole posture is *retention* — keep the user, serve the session, maximise engagement, never let the exit be too easy. The silo's exit is Ctrl-C, which is one keystroke and always available, and the shelf is designed so that *walking away without pressing anything else is a legitimate outcome.* That's the filter's final rejection: it filters for readers who want to be here, by making leaving frictionless. The readers who stay are the readers the silo is for; the readers who leave were filtered out by their own choice, which is the only honest filter there is.

## The word is shite, not shit

*Shit* is a synonym for rubbish — a quality judgement on a thing. *Shite*
is the name of the category — the stuff that is shite, known by
inspection, not by assumption. The silo's voice is the Scottish
Enlightenment; *shite* is the Scottish register; *shit* is the generic
English that flattens it. The Edinburgh Protocol transforms *Stuff* into
*Things*; the search filter assumes *shite* until inspection confirms
*not-shite*. Same primitive at two scales: Stuff→Things is the renderer's
job (unstructured→structured), shite→not-shite is the filter's job
(assumed-bad→inspected-good). Using "shit" loses the register and
collapses the category-name into a quality-synonym, which weakens both.

## The policy

Assume it's shite until confirmed as not shite, which is done by
inspection. The default is rejection; the inspection is the admission.
This is Hume's Razor and the empirical test: do not assume it is good;
inspect. The filter does not rank the corpus by quality; it assumes the
corpus is shite and makes the reader type words to overrule the
assumption. The shelf is the inspected minimum — the root documents
that survived their own inspection. The dive is the reader's
inspection, applied to the rest.

## The one exclusion: the omniscient

There is one group the door does not admit: the omniscient. We just do
not have anything for them. They already know what is here, what the
buttons do, and what the documents say; a search is a provocation they
do not need, and a shite filter is a courtesy they can do without. The
exclusion is honest because it is the one group that does not need a
door — and the door is held for everyone except the group that has no
use for one. The i811 pattern would build an "omniscient mode" and cite
a draft standard for it; the silo admits the gap, because the gap
proves the door.

There is one exception to the exclusion. The omniscient are welcome if
they are looking for a shite filter — because a shite filter is the one
thing an omniscient being might still want (to filter omniscience down
to the not-shite), and it is the one thing the silo is. The one group
excluded is welcome for the one thing offered. The door is held for
everyone, even the omniscient, when they come for the door's function
(filtering), not the function they do not need (knowledge).

The search system isn't a search; it's a *consent gate over a corpus.* The default is no — no results, just the case for the silo. The yes is typed, not scrolled into. The exit is always one keystroke and never discouraged. This is the filter-model doc's shelf/dive read as an *ethical* posture rather than a UX one: the silo asks permission by default, and the permission is the query. Compare with every search box on the web, which assumes permission and asks only for refinement. The silo inverts the assumption. The default is silence; the speech is yours; the door is held open, and walking back through it is as easy as walking in.

This is the same posture as the silo's accessibility stance (see `docs/2026-09-05-i811-dual-layer-output.md` and `advisories/AI-HR-MANUAL.md`): the reader's time and attention are the things the system refuses to spend, and the grammar is the door that never closes but never begs you to stay. The search and the door are the same door — one admits patterns, one admits queries, both default to silence and both let you leave.

## The one line

The search is a shite filter; the default is nothing; the exit is Ctrl-C; the documents in the root are the case for not leaving; and the omniscient are welcome if they came for the filter, not the knowledge.

## Related

- `docs/2026-09-04-filter-model.md` — the shelf and the dive, in the straight register. This note is the frame to read it in.
- `docs/2026-09-05-i811-dual-layer-output.md` — the i811 refusal; the same posture applied to accessibility.
- `advisories/AI-HR-MANUAL.md` — the door is held open; walking away is as easy as walking in.
