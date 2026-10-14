# Content over menu — the ZOG lineage

> Logged 2026-09-03. Status: **discussion** — what okuda *is*, seen
> from the hypertext lineage. Sibling to the anchor doc (which says
> *how it holds still*); this says *what it is that holds still*. Seed
> for a future explainer. Citations resolve against the corpus on
> `main`.

> **Terminology (2026-10-14).** The word *okudagram* is retired — the composite is **the render**, one portion is **the frame**, a drawing is **a diagram** (`ADR-RETIRE-OKUDAGRAM-066`). This record keeps its words; the ADR is the map.

## The entrancing image

An aircraft carrier. A tense situation. A rating taps numbers into a
console. A checklist appears on screen now — not a menu of choices,
but the content the situation demands. The actuation of the resolution
begins.

Aye, well. Maybe it wasn't quite like that. The image is vivid and the
provenance is real, but the scene is a composite — ZOG on the carrier,
the tense situation, the checklist, the rating. The truth is more like
Apollo 1201/1202: the computer is overloaded, the alarm fires, the
crew has seconds to decide whether to trust the guidance or abort the
landing, and the resolution is not a menu but a procedure — a content
the crew already knows, surfaced at the moment it's needed. 1201 was
the executive overflow; 1202 was the restart. The resolution in both
cases was the same: gie it a dunt, and if that doesn't work, gie it
another. Margaret Hamilton's software didn't fail; it prioritised, it
restarted, it kept the landing alive. The dunt was the interface.

The carrier and the lunar module are the same picture: a human under
pressure, a screen that shows what matters, no time for a menu. The
screen is content, not chrome. That is the lineage.

## ZOG — the menu, because there was no room for anything else

ZOG (the mid-1970s system, ancestor of HyperTies) had so little real
estate to play with that all it had room for was a menu. Every screen
was a list of choices; the menu *was* the interface because there was
no space for content. The hypertext was there — nodes, links,
dereferencing — but the constraint (bytes, columns, memory) forced the
menu to the foreground and the content out of it. ZOG was a hypertext
that could only afford to show you its skeleton.

okuda inverts the constraint. Real estate is not scarce (the terminal
fills the glass); content is preferred over menu. So the menu
disappears *into* the content. References are inline in the document
— rendered as bold numbers, wired with `%%okuda-rhs:NN%%`, dereferenced
by two keystrokes. The menu is still there; it is distributed into the
prose rather than consuming the screen. ZOG put the menu on the screen
because it had to; okuda puts it in the content because it can. Same
hypertext, opposite constraint, better outcome.

## Search it is

People like search. fzf is the google of file-based searching — or
could be considered as such, given sufficient latitude. The scratchpad's
two-axes principle assigns it the cardinality axis: the file namespace
is bounded, so a naive subsequence matcher is predictably adequate, and
any ranking is benchmaxxing a benchmark the namespace never stresses.
fzf stays dumb on purpose; it is built for a number that never arrives.

okuda owns the other two axes. The restricted markdown grammar is the
*rendering* axis — headers, loose lists, loose tables, code fences,
mermaid→ASCII, inline styles, word wrap. The inline reference
inspection is the *length* axis — a document can grow without limit,
so abstracting its structure and rendering references as actuable
vectors earns its keep. Three axes, three owners, three mechanisms:

| Axis | Owner | Mechanism | Refused |
|---|---|---|---|
| cardinality (files) | fzf | naive subsequence | ranking, frecency, embeddings |
| rendering (bytes) | okuda | restricted grammar | full CommonMark, HTML |
| length (in-doc) | okuda | inline vectors | a global index |

Each piece does its one job, and each refused the other's mechanism.
The discipline is the wickedness.

## Seriously wicked

So: search via fzf, a restricted markdown grammar rendered fast, and
the capability to inspect references inline. That is a hypertext with
search and inline dereferencing, running on anything with a terminal.
ZOG ran on a PB-250 with a few hundred words of memory; okuda runs on
whatever is in front of you. The constraint is not a limitation; it is
the noise-tolerance design (the Tamla Motown test — render for the car
radio, not the studio monitor). Every element survives hostile
conditions: a 30-column half-width pane, no OSC8, a font without
box-drawing glyphs. The constraint is the moat.

The wickedness is that the combination is more than the parts, and the
parts are each under-built on purpose. fzf is under-built (no ranking)
because the namespace is bounded. okuda's grammar is under-built (no
full CommonMark) because the silo generates a restricted dialect. The
vectors are under-built (no per-frame numbering, no global index)
because the frame is a viewport property. Three under-built things,
combined, produce a hypertext that runs anywhere and holds your place
while it does. That is seriously wicked, and it is the right register:
not *clever*, not *powerful*, *adequate* — predictably adequate,
sustainable, the pizza-shop doctrine. The wickedness is the
restraint.

## Content over menu — the constitution-level claim

okuda renders documents, not interfaces. A menu is an interface; a
document with inline references is a document. The references are
actuable (you can dereference them), but they are rendered as
*content* — bold numbers in prose, wiring in table cells — not as
*chrome* (a menu bar, a sidebar, a nav panel). The moment okuda
renders a menu, it has crossed from rendering into compositing: it has
decided what the reader should see *instead of* the document. The
three-concerns principle forbids that.

fzf owns the menu moment (it is the launcher, a separate process);
okuda owns the content moment (the document, with its references
inline). The handoff is clean: fzf gives you a file, okuda gives you
the file's content with its references dereferencable. Neither owns
the other's moment. The carrier rating doesn't see a menu of files;
they see the checklist. fzf got them to the checklist; okuda renders
it. The menu was the path, not the destination.

## The dunt

Apollo 1201/1202: the computer overloaded, the alarm fired, the
software prioritised, restarted, kept the landing alive. The dunt was
the interface.

The frame rule inherits it. Zoom, resize, re-render, back-navigate —
each is a dunt: a restart that preserves the thing that matters (the
reader's position) and recomputes everything else. The pure function
`okudagram = f(source, width, palette)` is the dunt made
deterministic — gie it the inputs, it gives you the frame back,
anchored at the same place. The dunt always works because the function
is pure and the anchor is structural.

That is the lineage: ZOG's menu, Apollo's restart, okuda's frame.
Content over menu; the dunt as the interface; the anchor as the thing
that survives the dunt.

## Do not underestimate the dunt

The feeling is older than software. It is the feeling of television or
radio in the days when you thought you had a signal — context, music,
a show — and then you had something else, and yet nothing had changed,
apart from the ambient geomagnetic field (but then who cares about that
when you are in the middle of the Archers, and that scene on the roof,
and the tragic denouement, and Nigel, ohh Nigel). So in desperation you
applied the only communications-theory heuristic you had: you
introduced a perturbation to the system and observed its behaviour. And
if it did not return to the required performance specifications, you
introduced a significant perturbation. A dunt, then a bigger dunt.

The dunt may seem a simple thing. But over centuries dunts have been
deployed in high-risk situations and proved resilient and anti-fragile.
The rating on the carrier; the crew in the lunar module; the listener
by the wireless; the reader at the terminal. Each perturbs, observes,
and the signal returns or it does not, and if it does not, you perturb
harder. The dunt is the oldest interface: *change something, see what
happens, keep what works.* okuda's contribution is to make the dunt
deterministic — the function is pure, so the perturbation always
returns the signal, and the anchor is structural, so the signal is
always the one you were reading. The dunt always works. Do not
underestimate it.

## The tagline

**A stateless traversal of state space.** Albeit more interesting if
it were a particularly spicy state space.

The stateless is the pure function and the anchor — no state about the
frame it's showing you, just the inputs recomputed. The traversal is
step, scroll, vector. The state space is the document's structure,
portioned into frames, bounded by two fixed points, dereferencable to
other state spaces and back. `less` does a stateless traversal of a
boring state space (lines); okuda does a stateless traversal of a
spicy one (structured, anchored, dereferencable, re-anchored across
perturbations). The spiciness is the moat. It could be better, but
only if it exists to be better.

## Related

- `briefs/2026-08-29-brief-okudagram-frame.md` — `BRF-PAGED-OKUDAGRAM`,
  the frame rule (the dunt, made structural)
- `docs/2026-09-03-the-anchor.md` — the anchor as system invariant (the
  thing that survives the dunt)
- `docs/2026-09-03-the-variable-is-the-invariant.md` — the thesis (the
  variable as input; three degrees of freedom; edges open, core closed)
- `docs/2026-08-27-okudagram-scratchpad.md` — the lexicon (*content
  over menu*; *pen and paper*; *render for the car radio*; *three
  concerns, three owners*; *two axes, two engines*)
- `explainers/the-hypertext.md` — the navigation system (the same
  thesis in the navigation register)
- `decisions/004-hard-wrap-mandate.md` — *okuda owns every `\n`* (the
  determinism the dunt depends on)