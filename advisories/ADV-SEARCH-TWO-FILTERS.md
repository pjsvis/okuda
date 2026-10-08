---
type: Advisory
callsign: ADV-SEARCH-TWO-FILTERS
---

# ADV-SEARCH-TWO-FILTERS — Advisory on the two searches, the heuristic, and the annoyance


## From

AI-HR (the `b` variant) · **To:** All reader classes who type to find · **Date:** 2026-09-05 · **Status:** Open. Two searches, one door each; the heuristic is a feature you opt into by not pressing Esc.

---

## Preamble

The silo has two searches, and they are not the same thing. Stating the difference clearly prevents the misunderstanding that the silo's shite filter is *the* search, or that the terminal's find is *a competitor* to it. They are two filters at two layers, composed by the host's lifecycle and the silo's grammar, and neither claims the other. This advisory records how they relate, why the relationship is useful, and why it can be annoying — because the same property is both, depending on whether it is what you want.

## The two searches

### 1. The silo's shite filter — the corpus filter

The silo's search (`gloam`, the launcher) is a *rejection system*: the shelf by default (root files only), the dive on opt-in (type a query, the corpus is searched, root files excluded). It assumes everything is shite until you type, and the typing is the inspection that admits the not-shite. The shite filter is the silo's own; it lives in the launcher, it uses `rg` and `fzf`, and its lifecycle is one query — type, refine, select, read. On selection it hands you to the reader and the query is done. The shite filter is documented in `docs/2026-09-05-search-as-shite-filter.md` as the corpus-level instance of the posture.

### 2. The terminal's find — the document filter

The terminal's native find (Cmd+F on macOS, Ctrl-F in most others) is the *host's* search. The silo does not own it, does not build it, does not mediate it. It highlights every occurrence of a phrase in the visible viewport, and — the property this advisory exists to name — *its lifecycle is independent of the silo's navigation*. Unless you press Esc, the find box's contents stay active as you change documents: Cmd+F a phrase in the main doc, follow a silcrow to a reference, and the same phrase is highlighted in the new doc, because the terminal's find did not clear and the silo did not tell it to. The silo renders plain text; the host finds it; the host's find has its own lifecycle; the silo's navigation has its own; the two compose because neither claims the other.

## The heuristic: do this and see this

The terminal's find is a *heuristic* in the literal sense: a practical method that produces useful results without guaranteed correctness. You type a phrase, the host highlights it, you press Space (the silo's page-down) until the highlight comes into view, and you see the phrase in context. "Do this and see this" — the find is the *do*, the highlight is the *see*, and the silo's motion is the *how*. Three systems cooperating with zero protocol between them: the host's find does the *where*, the silo's grammar does the *navigation*, the eye does the *recognition*. No OSC, no span tree, no semantic layer — just the host's native find, the silo's plain-text rendering, and the eye. The poverty of UI design, confirmed at the find layer: don't build the find UI; let the host's find and the silo's motion compose.

The heuristic is especially useful across navigation. Highlight a phrase in the main doc, check a reference (follow a silcrow), and the same phrase is highlighted in the reference — because the find persisted across the jump. You can trace a concept through the common without re-arming the search at every doc, because the host's find lifecycle and the silo's navigation lifecycle are independent, and the composition of two independent lifecycles is *persistence*, which is a feature you didn't design and couldn't have specified, because no designer would have specified "the find should persist across a hypertext jump" — it sounds like a bug, until you use it and find it's a feature.

## The annoyance: the same property, when you don't want it

The same property is *excessively annoying* if it is not what you want. The find that persists across navigation also *persists across navigation when you're done with it* — the highlight follows you into a doc where you didn't want to search for that phrase, the find box is still armed, the screen is still lit with someone else's query. The heuristic that was useful when you wanted it is a nuisance when you don't, and the only way to dismiss it is Esc, which the host owns and the silo doesn't remind you about.

This is honest, and it is stated plainly. The silo does not fix it, because fixing it would mean *claiming the find* — building a find-clears-on-navigation seam, which would mean building a find UI, which would mean the poverty of UI design, which would mean the hampering abstraction, which would lose the persistence you enjoyed when you wanted it. The annoyance is the *cost* of the feature; the feature is the *reward* for not designing the annoyance away. You take both, or you press Esc. The advisory's job is to tell you that Esc is the door out of the heuristic, and the door is the host's, not the silo's.

## The two doors

The two searches have two doors, and the doors are different. The shite filter's door is `gloam` — type a query, the dive opens, select a doc, the query is done. The terminal find's door is `Cmd+F` (or `Ctrl-F`), and its exit is `Esc` — the find opens, persists, and is dismissed by the host's key, not the silo's. The silo's verbs (`u`, Backspace, `00`, the two-digit chords) do not touch the find; the find's keys do not touch the silo. The two systems are independent, and the reader coordinates them by *using* them, not by a protocol between them.

This is the one thing to know: **the silo's search is opt-in by typing; the terminal's find is opt-out by Esc.** The shite filter assumes shite until you declare intent (type); the terminal find assumes you want it until you declare otherwise (Esc). One defaults to silence; the other defaults to persistence. Both are honest defaults for their layer: the corpus is large, so the corpus filter defaults to nothing; the find is one phrase, so the document filter defaults to keeping it. The asymmetry is correct, and it is the asymmetry that makes the two compose — a find that defaulted to silence would be useless, and a shite filter that defaulted to persistence would be a scrollback.

## The standing invitation

Two searches, two doors, one composition. The shite filter finds the corpus; the terminal find finds the phrase; the host's lifecycle and the silo's grammar compose because neither claims the other. The heuristic is useful when you want it, annoying when you don't, and Esc is the door between the two. The silo does not fix the annoyance because fixing it would lose the feature; the advisory tells you the door is there; you walk through it or you don't. Nae shite mind, nae find mind either.

---

*Dispatched from the `b` variant of the manual. The two searches are two doors; the composition is the thing nobody designed; the annoyance is the cost of the feature you keep by not designing it away.*

---

Type once, dive the shelf —
Cmd+F rides the silcrow jump:
Esc closes both eyes.

— Dave, 2026-09-05 (definitely not an AI, honest)
