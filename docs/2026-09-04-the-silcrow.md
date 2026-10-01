# The silcrow

**Date:** 2026-09-04
**Type:** explainer

Every document in the silo is rendered twice: once as it is, and — when
it is the main document of a Gloam instance — once with its references
annotated. The annotation is the **silcrow**: `§`, the section sign,
followed by two digits. Rose, after the reference it points at — the rubricator's ink (`rubric` = *ruber*, red): the medieval navigation marks were red for the same reason we are.

```text
ADR-030 §12
BRF-PORCH-MATRIX §13
[the constitution](system.md) §14
```

## The glyph

`§` is the section sign — also the section mark, or, in the trades, the
**silcrow**. Medieval scribes drew it (`signum sectionis`) at the start
of a passage to say *this section*; the common explanation is a
ligature of two overlapping S's. For a thousand years it has had
exactly one job: point at a thing inside a document. *See § 12* is how
statutes and scholarship cross-reference. We did not invent its
meaning; we inherited it, intact.

## The notation

`§NN`, two digits, `12` through `98` (the floor moved from 11 to 12
when [11] joined the doubled-pair actuator class, 2026-09-12; the
canon: doubled = the system talks, mixed = the document moves). The
number is an **address in the
main document's jump map** — an in-memory structure derived from the
document's own text at render time: callsign-shaped tokens, local
`.md` links, and the file paths the corpus cites in prose — code
files and named documents (Ring B, 2026-10-01), all gated on
existence and legibility — in reading order, unique, capped. The paint is
**illustrative**: the source document is never modified, the map is
rebuilt on every render, and the numbers are deterministic — `§12`
means the same thing on every glass, until the document changes, at
which point the map re-derives and the numbers follow. Derivation
replaces invalidation.

The paint is **reserved**: the rose is a palette slot the markdown
grammar cannot address, and prose never types `§`. A user who writes
`[14]` in their document produces text; our numbers are visibly ours.
(Occam's addendum: don't use too many links.)

## The two-render contract

The **main document** renders annotated — it is the map, the index,
the expedition instrument. A **dereferenced** document renders clean —
its references are not shown, so the tour cannot proceed from here by
accident. `u` unwinds to the main. `99` promotes: the document you are
reading becomes the main document of a fresh, stateless instance,
where its own references gain their silcrows. Depth of traversal is
opt-in, and each level costs a deliberate keystroke.

## Why rose *and* bold

Colour answers *what is this*; the silcrow answers *what is this*;
and both together say *go look*. Most painted text in okuda answers only the first —
state glyphs inform, muted provenance recedes, emphasis is the
author's voice. The silcrow is the one element in the frame that
responds to input: a control among information. Controls earn both
channels. Either alone is a hint; both is decisive. And under
`NO_COLOR` the colour drops while the weight remains — the § carries
the rest.

## The honesty

The vectors are **optimistic**: discovery paints what looks like a
reference without asking whether the destination exists. The actuator
fails in the same vocabulary it painted in — `§14 — no document to
render` — a footer flash, stay put, no crash. A silcrow that turns out
to be mistaken was still a correct description of an intention; the
corpus may reference documents that do not exist yet.

The path gate is honest twice (ADR-045, ADR-049). Existence: a
phantom, a typo, or an illustrative URL paints nothing — the
filesystem is the gate's substrate, and it cannot drift from itself.
Legibility: a destination can exist and still not be worth the
keystroke — `.jsonl` is horizontal data, and a deref into it is a
wall of wrapped JSON, a promise kept to the letter and broken in
spirit. Exiled extensions never paint, never enter the map, never
reach the References section — one denylist at discovery, no second
filter anywhere. `.json` stays: exile on evidence, not suspicion.

## The reader's habit (found in dogfood, 2026-09-12)

At the start of any document the silcrows are always 12, 13, 14 —
floor plus offset, zero bits of information. So the eye learns in the
first ten seconds to skip the numeral and read the *name* of the
reference instead: **names for recognition, numbers for actuation.**
The callsign is stable and semantic; it survives every render. The
silcrow is a two-keystroke pointer into this render's alias table; it
evaporates with the glass. The number is furniture; the name is the
content. (Eco: *stat rosa pristina nomine* — the rose persists by its
name; the naked name is what we keep.)

The emergent flips deep in the document, and that flip is the
channel earning its keep: a *low* silcrow on page four means
"back-reference — you have seen this name before." The number is
zero-information exactly where novelty makes it redundant, and
information-bearing exactly where a repeat makes it meaningful: it
tells you novelty, while the name tells you identity.

The trap this forbids: any feature that made silcrow numbers stable
across renders (`§12 always means system.md`) would fight the trained
eye and lose. Numbers are pointers, never identities; the derived map
is the guard — keep it that way.

## The vocabulary

- **§NN** — a vector; rose, bold, on the main document only
- **NN** — actuate: dereference, render clean
- **u** — unwind: back to the main document
- **99** — promote: clone into a new instance as main
- **type** — the live search dereferences too; the callsign is the query

The silcrow marks the reference; the number is the address; the
terminal is the document.
