---
date: 2026-10-10
kind: principle — the document is the unit of context; references, not hypertext; derivation, not specification
lineage: the operator's closing observation, 2026-10-10 — *"the way the world works is by passing documents round… we do not use telepathy, we use units of context called documents"*, and *"to implement a graph you have to specify the nodes and the edges, which once you have done all that work, what do you have? a map of a territory that you already know"*
status: recorded — a principle with ancestors, not a discovery
---

# The unit of context — documents, not hypertext, not graphs

> **The world works by passing documents round.** No telepathy — a unit of context
> that can be written, sent, kept, cited and found. A workplace is a flow of them
> (the email that says what to do); a household is a flow of them (the demand for
> payment that says what is owed). And the reader does the rest — the relations,
> the synthesis, the decision — **inside** the reader, from documents taken at
> specific places for specific tasks.

## The three substitutes, and why each is a detour

- **Hypertext** made the *link* the primitive and lost the document. The cost has a
  name in the literature — *disorientation*, "lost in hyperspace" — and the remedy
  the literature reached for was always **maps**. A link is a door you walk
  through; a reference is a map you hold. See **references, not hypertext**.
- **Knowledge graphs** promise to hold the relations, but **building one means
  specifying the nodes and the edges** — and specifying them requires the
  knowledge the graph was meant to give you. You finish with a map of a territory
  you have already traversed. See **derived, not specified**.
- **Vector databases** are the same error with the names filed off: an unanchored,
  derived, uninspectable stand-in for the document
  (`docs/2026-09-14-derrida-and-the-decomposed-pdf.md`).

## Why documents win: they arrive already related

A document arrives with its relations attached — **by the author, for the author's
own reasons**: its sender, its date, its file, its **references**. So the graph
can be **derived** from what is already written instead of **specified** by
someone who must already know it. That difference is the whole of it, and it has
one great historical proof: the **citation index** works because authors *cite* —
the edges exist before anybody builds the graph. Every graph that has worked at
scale was extracted from documents. Every one that had to be authored was a
project.

## The evidence is ordinary life

At work, what to do arrives as a document from a place with authority — an email,
a brief, a ticket. At home, obligations arrive as documents from the world — an
invoice, a renewal, a form. Nobody telepathises, nobody maintains a graph, and
nobody needs one, because **the document states what it is and where it came
from**, and the reader supplies the task. Context is *situated*: the work
documents at work, the household documents at home — **places for tasks**. That
is the bounded context, and the silo is its implementation, not its invention.

## What Gloam and the silo compose

The silo makes the references **real** (callsigns, citations, the census, the
keep-class); Gloam makes them **navigable** (the jump map, the receipt, the
backstack, the identity header). Neither half is the point. **The document plus
its references is the unit**, and the composed apparatus is what lets a reader
*hold* a map instead of walking one.

## Prior art — it is old, and that is the point

- **Suzanne Briet**, *Qu'est-ce que la documentation?* (1951) — the document as
  **evidence in support of a fact**: a document is not a format, it is a situated
  evidentiary thing.
- **Paul Otlet**, *Traité de documentation* (1934) — documentation science, and
  the **monographic principle**: decompose documents into their parts and
  reassemble the parts. Cited deliberately as the **ancestor of the anti-pattern**
  as well — the decomposed PDF, a century early (`…derrida-and-the-decomposed-pdf.md`,
  *the schema is the argument*).
- **Vannevar Bush**, *As We May Think* (1945) — the Memex, and **trails**: a
  reader-built path through documents, stored. The ancestor of both hypertext
  (the door) and the reference trail (the derived map).
- **Eugene Garfield**, the citation index (1960s) — the one large graph that
  worked, **because it was derived from citations rather than specified**.
- **Max Weber**, *Wirtschaft und Gesellschaft* — bureaucracy constituted by
  **the files** (*die Akten*): the office *is* its documents.
- **Jeff Conklin** (1987), *Hypertext: An Introduction and Survey* —
  **disorientation** and **cognitive overhead**, the two named hypertext
  problems, and the map as their remedy.

The correction is not new. What is new is that the AI age is re-proposing graphs
and vectors as though the document were the obsolete unit — when the document is
the only unit that has ever worked.

## Related

- `system.md` — **references, not hypertext**; **derived, not specified**
- `docs/2026-10-10-the-seam.md` — crossings are messages; the seam
- `docs/2026-10-06-the-shared-artifact.md` — the document contract; referential stability
- `docs/2026-09-14-derrida-and-the-decomposed-pdf.md` — the supplement; the schema is the argument
- `docs/2026-10-09-silo-genesis.md` — the container; places for tasks
