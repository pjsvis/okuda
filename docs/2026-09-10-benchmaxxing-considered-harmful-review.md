# Review — the satisficing clip, filed as *benchmaxxing-considered-harmful*

**Date:** 2026-09-10
**Type:** review note (a reading of the external clip beside it; not a design decision)
**Status:** Closed — the clip is framed and cross-linked; the observations below are the record of why.

---

## What was reviewed

`docs/2026-09-10-benchmaxxing-considered-harmful.md` — a raw NYT opinion clip (David Epstein on Herbert Simon, satisficing vs. maximizing, 2026-05-12), read in the context of the shite-filter corpus: the filter model (`docs/2026-09-04-filter-model.md`), the search-level instance (`docs/2026-09-05-search-as-shite-filter.md`), the document-level instance (`docs/2026-09-05-frame-as-shite-filter.md`), and the two advisories (`ADV-READER-SIDE-FILTER`, `ADV-SEARCH-TWO-FILTERS`). The filename is the silo's gloss; the article never mentions AI, benchmarks, or filters.

## The verdict

The strongest external testimony the shite filter has received, from a direction nobody in the silo sent it: Simon independently derived the shite-filter posture at the *human* scale, decades before okuda applied it to a corpus. The mapping:

| Epstein/Simon | The silo |
|---|---|
| Maximizing — "searching is itself a cost" | The i811 pattern: everything ranked, autoloaded, retention-first |
| Satisficing — "good enough for me," not "the best out there" | Assume shite until inspection confirms not-shite |
| Satisficers set a good-enough standard and stop | The shelf is the inspected minimum; the dive stops at the first doc that answers |
| Comparison engines poison choice (social media, dating apps) | The flat list the folders were built to prevent; the fuzzy soup `--exact` refuses |
| "Walking away is a legitimate outcome" | Ctrl-C as the filter *succeeding*, not failing |
| Simon's one breakfast, one beret — decisions off the plate | The return edge: no recently-viewed list — if you wanted to remember it, you would have |

The last row deserves the emphasis: Epstein's core claim is that maximizers are made miserable by the **comparison engine itself**. The return edge is the one place the silo deleted a comparison engine every web system ships by reflex. Argued from the inside; now externally supported.

## The price, not the sermon

Epstein *preaches* satisficing; the silo does something smarter, and the article shows it. Simon's remedy matters most when choices are irreversible and expensive — partners, dishwashers, careers. Reading a document is neither. The silo doesn't have to make stopping attractive; it has to make starting and stopping *cheap*: the dive costs a query, the exit costs a keystroke, the unwind costs `u`. **The system prices satisficing rather than moralising about it.** That's Adam Smith, not Herbert Simon — the reader's good-enough behaviour is the emergent property of cheap reversible actions, not a virtue the UI demands.

## The benchmaxxing gloss (the filename, justified)

The link is real, not a stretch: **the maximizer is the benchmaxxer** — optimizing for the best-out-there score, less satisfied, more regret, endlessly comparing. The lexicon reads as satisficing in the Edinburgh register:

- *Predictably adequate* is Simon's "good enough for me" with a floor-raising mechanism attached.
- *Muppet-exclusion* gates on a property (refusal under temptation), not a score — a satisficing gate, ungameable precisely because it never asks "which is best."

Protocol and article converged on the same conclusion from opposite ends: one from AI evals, one from psychology.

## Hume's Razor, applied to the clip

An opinion piece: pop-psych synthesis, single studies cited casually (the video-flipping boredom study, the "100 million options" economist), and the maximization-scale literature it leans on (Schwartz et al.) has known replication friction. Also, "the best is enemy of the good" is Voltaire; Epstein hands it to Simon as "the mantra he lived by" — accurate as biography, obscured as lineage. **Convergent testimony, not proof.** It corroborates a posture already held on dogfood evidence; it upgrades nothing.

## The tension worth watching, not fixing

The dive is a *ranked* list, and Epstein would say ranking invites comparison. The honest answer is already in the filter model: the rank is admission order, not quality judgement — "the filter does not rank the corpus by quality; it assumes the corpus is shite." And the depth-one stack means no comparison is ever held open: you consult one doc, and the alternatives are gone, not parked in a tab bar begging you back. **If the silo ever grows tabs or a working-set shelf, that is where the maximizing creep enters.** The sqlite refusal (filter-model §5) was, on this reading, a refusal to build the comparison engine — good instinct, twice-justified.

## What was done with the review

The clip was Stuff — content without structure, invisible to its own filter's intent channel. Now a Thing: house header, framing coda (the evidentiary case, the Voltaire note, the Hume's Razor caveat), and a cross-link from the search-level instance. One commit.

## Related

- `docs/2026-09-10-benchmaxxing-considered-harmful.md` — the clip under review, now framed.
- `docs/2026-09-10-use-vs-mention.md` — follow-on: why the clip's citation rubricates by callsign but not by path; the promotion rule.
- `docs/2026-09-05-search-as-shite-filter.md` — the search-level instance; cross-linked from here.
- `docs/2026-09-04-filter-model.md` — the shelf and the dive; the rank-is-admission-order rule; the sqlite refusal.
- `docs/2026-09-05-frame-as-shite-filter.md` — the document-level instance.
- The lexicon (`~/.pi/agent/AGENTS.md`, Conceptual Lexicon) — *benchmaxxing*, *predictably adequate*, *muppet-exclusion*: the gloss the filename carries.
