---
type: ADR
callsign: ADR-MAIN-DOCUMENT-031
---

# Decision: The main document — optimistic vectors, 99 promotes, u unwinds

**Date:** 2026-09-04
**Status:** Accepted (*optimism* clause superseded 2026-09-24 by
ADR-VALIDATED-SILCROWS-044 — "discovery never validates, the actuator
fails honestly" is retired: inferred callsign-shaped tokens now gate on
the tier registries, because the probe counted 117 painted silcrows
that resolved to nothing. One clause, not the ADR: dynamism,
the one-destination-one-silcrow citation convention, the doubled-pair
reservations, and re-derivation-replaces-invalidation all stand.
Explicit `.md` links stay optimistic — the author's link is a
deliberate claim; the boundary holds by parameter, so the render path
still reads no registry itself.)
Amended 2026-09-30 by ADR-REFERENCES-SECTION-047: the map gains a
visible projection — every main-document render ends with a generated
`## References` section, the renderer's receipt for its own map. The
discovery contract itself is unchanged; discovery still mints, the
section only lists.

## Context

The link-vector machinery existed as authored wiring: menu documents
carried `%%okuda-rhs:NN%%` tokens and `[NN](path)` links (ADR-022's menu
pattern), and the two-digit jump buffer navigated them. The operator's
clarification dissolves the special case: **menu documents were always
just documents with references.** What remains is conventional
hypertext terminology — main document and referenced documents — plus
one render-mode rule and one numbering contract.

This ADR reverses ADR-022 (palimpsest: the menu pattern is recorded
there; the tokens, `just menu`, and the index-document genre are
legacy). It also supersedes the registry-gated vector idea proposed and
withdrawn during ADR-030's afterglow: vectors are **optimistic**, not
registry-validated at render time.

## The model

- **Main document**: what the instance is rooted on. Rendered with its
  references annotated as vectors — `§11` … `§98` painted after each
  reference, in the reserved vector paint (see below). The section sign
  is the semantics: it means *reference*, it is not a character prose
  uses, and the badge reads as a reference even without colour.
- **Referenced document**: what you get when you actuate a vector. It
  renders **clean** — no annotations. Its references are not shown as
  vectors, so the tour cannot proceed from here by accident.
- **`u` unwinds**: the dereference is popped; back to the main
  document. The render stack is depth one — the only state in the
  instance.
- **`99` promotes**: clones the currently rendered document into a new
  terminal via the host (tmux `new-window`), where it becomes the main
  document of that instance — and therefore renders annotated. 99 is
  not a vector; it is the clone verb, available on main and on a
  dereference alike (why hobble main by withholding what referenced
  documents have?). Its pair `88` edits this document in place — see
  the ADR-032 amendment of 2026-10-05.
- **One destination, one silcrow**: a document cited repeatedly reuses
  its number at every mention — the citation convention (IEEE reprints,
  legal §-cross-references). The number identifies the destination; the
  mentions are where it is cited from.
- **Optimistic vectors**: references are recognized by shape and
  painted without validating the destination. The **actuator fails
  honestly** — `unknown callsign: X` in the footer — when the target
  isn't there. Validation at render time is the wrong place to spend
  the cost; the web settled this thirty years ago.

## The numbering contract

- Vectors run **12–98**. The two-digit space is 00–99; **reserved:
  00–10** (unreachable padding and numeric sanity — the floor stays
  12), the **doubled pairs** (00/88/99 bound: exit, edit, clone), and
  nothing else. The buffer closes the space; no leading-zero
  ambiguity; silcrow 12 is always the first vector (12 since
  2026-09-12 — [11] joined the ADR-032 actuator pocket, and the
  padding widened to 10 on 2026-10-05 when [09] was freed and [88]
  bound to the edit verb).
- **Overflow stops**: past 98 references, the map simply ends. The
  remedy is editorial — make the document smaller, or clone and search.
- **Always two digits** in the painted form, led by the section sign:
  `§NN` — no brackets. The section sign is the marker and the boundary;
  brackets were markdown habit, and the reserved rose carries the rest
  (settled by experiment 2026-09-04: brackets dropped, colour kept).
- **Zero-padded digits in source are never vectors**: `[07]` in a
  document is text, always.
- **The reserved paint**: vector numbers render in a dedicated palette
  slot that the markdown grammar cannot address. Our numbers are
  visibly our numbers; a user who writes `[14]` in their document
  produces text, not a vector — different color, different layout,
  never confusable. (Authoring guidance follows from the same shape:
  don't write too many links.)
- **Legacy is retired**: `okuda-rhs` tokens and authored numbering are
  not honored. One map, pure derivation, nothing else.

## The architecture

The jump map is an **in-memory structure belonging to the main
document**: vector number → target, derived by scanning the main
document's source at render time. The painted `[NN]` annotations are
**illustrative text** — a projection of the map, nothing more. The
source document is never mutated; there are no side-car wiring files;
nothing persists. Re-derivation replaces invalidation: `r` reload
rebuilds the map, the numbers stay deterministic per (document,
content), and 99 carries nothing between instances because the clone
re-derives its own.

The actuator resolves a vector's target through the filesystem and
registry at use time; the footer flash is the only failure surface.

## Consequences

**Gained:** every document is a main document without ceremony; the
corpus becomes navigable by derivation alone; zero persistent state;
the renderer/registry boundary (ADR-020) holds with less machinery than
before.

**Paid:** ADR-022's menu pattern is retired (palimpsest at ADR-022);
`u` and the NN buffer change meaning slightly (u unwinds one
dereference; NN addresses only the derived map); documents with >88
references must be restructured; false-positive references cost one
honest error on actuation.

## There is no history

The model renders the back-stack unnecessary, and unnecessary abstraction
is not a simplification opportunity — it is a removal. The inventory:

- *Return to where I was* — the original instance never moved; `u`
  unwinds the one dereference.
- *Revisit something I saw* — it is still open (a clone), or re-findable
  by typing its callsign into the concordance.
- *Know what I passed through* — the set of open instances, visible in
  the window list. **The trail is spatial, not temporal.**
- *Undo* — meaningless without destruction; nothing was destroyed.

History existed because software destroyed. The browser's back-stack was
an accounting trick for in-place replacement (`docs/2026-09-04-history-is-bunk.md`).
Non-destructive dereference and promotion abolish the destruction, and
with it the ledger. The documents form a graph; a history imposes a line
through it; the walk is the reader's attention, and it owes no ledger.

## Related

- ADR-022 (menu pattern) — reversed; palimpsest there
- ADR-030 (live search) — the search is the dereference path; 99 and
  search compose as the only two ways to move
- ADR-024 (callsigns are data) — the shape scan's vocabulary
- ADR-020 (renderer/registry boundary) — holds, by parameter since
  ADR-044: the render path still reads no registry; the registry-backed
  predicate arrives launcher/TUI-side. The earlier claim "the render
  path needs no registry at all under optimism" died with the optimism
  clause
- BRF-WORKING-COPY — the implementation brief
