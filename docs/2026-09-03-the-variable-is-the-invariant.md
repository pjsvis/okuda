# The variable is the invariant

> Logged 2026-09-03. Status: **discussion** — the system's thesis in
> compressed form. Seed of the explainer; a charm with a naive
> iconoclastic quality, and a thug in the comments. Citations resolve
> against the corpus on `main`.

## The joke

The thing that changes the most is treated as the thing that's *given*.
Terminal size changes dozens of times a session — narrow to read prose,
wide for tables and diagrams, tall to land, short to scan. The system
doesn't hold it steady, predict it, smooth it, or remember it. It
takes the dimensions as input, renders to them, and forgets them. The
variable becomes invariant by *refusal to model it as variable*.

Each render is a pure function: `okudagram = f(source, width, palette)`.
The frame rule is another: `frame = g(source, width, header-anchor)`.
They share one discipline: **the thing that varies is an input, not a
state.** Treat the variable as a parameter and you don't need to model
its dynamics. Try to hold it steady and you've built a state machine
for a thing you could have just read off the glass.

It is genuinely counterintuitive — the variable is the invariant — and
it is why the system is small. Every "but what if the terminal changes?"
is answered by "we re-render," which is the same answer as "but what if
the source changes?" and "but what if the palette changes?" One
mechanism, three inputs, no special cases. The width is whatever the
glass is *right now*; the frame recomputes; the anchor re-finds. There
is no "previous width" in the state, no "preferred width," no "the user
probably wants it wider." Just the dimensions, treated as a given,
every time.

## The payload — three degrees of freedom, as required

**Step, scroll, vector.** Three motions. *As required* — no fourth
manufactured to feel complete. The space between translate and compose
is empty; paging died there, and the callsign stays to mark the grave.

| Motion | Scope | Act | Target |
|---|---|---|---|
| **vector** | cross-document | dereference a reference | another document |
| **step** | within-document | progress along structure | the next header/frame |
| **scroll** | within-frame | translate through lines | every line, continuously |

A regular Earth-normal human holds three things in working memory.
Seven is Miller's old lie; three is the honest number; three is what we
have. The scratchpad's *pen and paper* claim is exactly this: the
complexity is in the renderer's bytes; the simplicity is in the human's
gestures. The payload is three motions; the complexity is everything
the renderer does to make three motions *sufficient*. The moat is that
the competition's payload is larger — more gestures, more modes, more
settings, more state — and their complexity is *in the gestures*
because they didn't push it to the renderer.

## The expansion slots — open at the edges, closed at the core

Other character sets, semantic structures, and actuation grammars are
available should you require them. This is the honest version of
extensibility. Not plugin architecture, not configurability, not a
settings panel. The inputs to the pure function can change — palette
yields other character sets; source structure yields other semantic
structures; actuation yields other grammars — and the rule still
holds because the rule never assumed the specific values, only the
*shapes*: a header, a glass, a frame, an anchor.

The system is open at its inputs and closed at its rule. That is the
Derrida question answered correctly: the consideration set is anything
that fits the rule's shape; anything that doesn't fit is out, not
configurable in.

Note what *isn't* in the list. No "other frame shapes" — the rule is
one shape. No "other anchoring strategies" — the anchor is the header.
No "other numberings" — there is no numbering. The slots are at the
edges, not at the core. The core is closed, and that is why the edges
can be open without the system becoming a chip pan fire.

## The thug in the comments — a Foucauldian critique

Enter Michel Foucault, disrespecting our pal Jacques as usual, and
with some force. The critique, rendered plainly:

> You call this a pure function. I call it a *disciplinary apparatus*.
> The anchor is a carceral geometry — a fixed point that subjects the
> reader to a regime of located stillness. The frame is a cell. The
> terminator is the sentence's end made visible, the same way the
> panopticon makes surveillance visible so the inmate polices himself.
> The "stillness" you celebrate is surveillance *interiorized*: the
> reader carries the discipline you built, and calls it comfort.
>
> Your "no assumptions" is the most insidious assumption of all — the
> assumption that a neutral surface exists. There is no neutral
> surface. Every frame is a *decision about what to show*, and the
> decision is a power. You chose headers as the unit; that is a
> power over the document's meaning, a geometry imposed on a text
> that did not ask for it. The "pure function" launders the power as
> mathematics: *f(source, width, palette)* — as if the function's
> *form* were not itself a choice, a discipline, a way of making the
> reader legible to the system.
>
> The FiloFax is not freedom. The FiloFax is the *minimum sufficient
> apparatus* — the lightest collar that still holds. You boast it
> needs no batteries; I say a collar that needs no batteries is a
> collar that never comes off.

The thug has a point. It is not a small point. The anchor *is* a
discipline; the frame *is* a geometry; the stillness *is* imposed.
The question is whether the imposition is the kind Foucault names
(imposed, irreversible, carceral) or another kind.

## The defence — Derrida, and the difference a discipline makes

Derrida's defence is not that the anchor is *true* but that it is
*honest about being a convention*. The anchor is a *trace*, not a
presence — a marker that points to a position that is itself always
already deferred. `f(source, width, palette)` is honest precisely
because it admits it is a function, a relation, not a ground. It does
not claim to capture the document; it claims to recompute a view of it,
deterministically, from inputs that are themselves contingent (the
source can be edited; the width can change; the palette is a choice).

Foucault hears *differance* and hears evasion. Derrida hears the
*condition of honesty*. The disagreement is old and will not be
settled here. But the project can state where it stands, and it stands
with James Watt: discipline in the Edinburgh sense — *pragmatic
improvement*, the steam engine made better by a condenser — not in
Foucault's sense. The distinction is not semantic; it is operational:

- **Our discipline is self-imposed and reversible.** The reader resizes
  the glass; the discipline reflows. The reader steps away; the frame
  is gone. The reader closes the cover; the FiloFax holds its pages and
  asks nothing. The anchor holds while the document holds; the moment
  the source is deleted, the anchor degrades silently to the
  proportional fallback (the map is source-derived, and sources can
  die). The discipline is *rented from the source*, not imposed on the
  reader.
- **Foucault's discipline is imposed and irreversible.** The panopticon
  does not reflow on resize; the inmate does not step away; the collar
  does not come off. The power persists independently of the
  subjected.

The FiloFax is not the panopticon because the reader can close it.
That is the whole difference, and it is not a small one. A collar that
comes off is not a collar; a discipline that is rented from the source
and returned when the source is gone is not a disciplinary apparatus.
It is a *reading convention* — chosen, honest about being chosen, and
reversible at the reader's will.

## The car park — where the argument is actually settled

The anchor's car park of assailants — resize, re-render, back-
navigation, source mutation, width change, host restart — is where
the Foucauldian critique meets the operational test, and loses. Each
assailant is an attempt to move the reader against their will; the
anchor holds the reader's position through each. Foucault would say:
*see, the discipline holds even under assault — that is its power.*
The project answers: *the discipline holds the reader's position, not
its own. The assailants are trying to move the reader; the anchor
refuses on the reader's behalf. That is not the panopticon holding the
inmate; that is the FiloFax holding the reader's page while the train
shakes.*

If the anchor held the reader still while the *content* pushed, it
would be Foucault's apparatus. It does not. The content is static; the
reader is the one who moves (step, scroll, vector); the anchor holds
the reader's *place*, not the reader. *Slipperiness is induced, not
native* — the document is still; the input device moves. The anchor
is the stillness the document already has, made re-findable. It is not
a collar on the reader; it is a bookmark in the document. The
difference is who moves and who stays, and in this system the document
stays and the reader moves, which is the right way around.

The car park is where we fight the assailants, and the Foucauldian
critique is one of them — an assailant with a real point, met the way
all the others are met: by admitting the worst it can say and showing
the mechanism that survives it. The mechanism survives because the
discipline is rented, not owned; reversible, not imposed; held for the
reader, not over them. We fight Foucault in the car park and we win on
points, and the points are operational, not philosophical: close the
cover, the FiloFax asks nothing. Try that with a panopticon.

## The thesis, restated

The variable is the invariant. The thing that changes the most is
treated as the thing that's given. Three degrees of freedom are
sufficient — as required, no fourth manufactured. The edges are open,
the core is closed. The discipline is rented from the source and
returned when the source is gone. The FiloFax needs no batteries, and
the collar comes off. That is the whole system, and it is enough.

## Related

- `briefs/2026-08-29-brief-okudagram-frame.md` — `BRF-PAGED-OKUDAGRAM`,
  the frame rule (the thesis's mechanism)
- `docs/2026-09-03-the-anchor.md` — the anchor as system invariant (the
  car park of assailants)
- `docs/2026-08-31-the-same-okudagram.md` — the determinism (the pure
  function the thesis rests on)
- `docs/2026-08-27-okudagram-scratchpad.md` — the lexicon (*slipperiness
  is induced, not native*; *pen and paper*; *step, scroll, vector*;
  *book-binding*)
- `decisions/004-hard-wrap-mandate.md` — *okuda owns every `\n`* (the
  determinism ancestor)
- `decisions/027-temperament-is-downstream-of-discipline.md` — the
  hot-potato rule (the state held is exactly as large as the question
  requires — three motions, no more)