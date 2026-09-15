---
type: ADR
callsign: ADR-CHUNK-SEQUENCE-038
---

# Decision: The chunk sequence — the head is unnumbered, the trailing ordinal is part N

**Date:** 2026-09-15
**Status:** Accepted (implementation pending — BRF-CALLSIGN-EVERY-DOC step 5)

## Context

Three places in the silo say a document that has grown too large should be
split. None of them says what the split looks like on disk.

- **The address cap.** ADR-MAIN-DOCUMENT-031: past 98 references the map
  simply ends, and *"the remedy is editorial — make the document smaller, or
  clone and search."* Its Consequences are blunter: *"documents with >88
  references must be restructured."* BRF-JUMP-LIST names the cap as the
  bisect trigger and shows the speech doctrine and the vector space arriving
  at the same bound independently.
- **The diagram.** `explainers/the-diagram-tool.md`: *"diagrams are
  sentences, not atlases. If a diagram needs more than a screen, split the
  document."*
- **The menu.** `docs/2026-09-14-speech-driven-design.md`: *"Too many
  documents → cap at ≤90; bisect down."*

So the doctrine is stated three times and the mechanism zero times. A
document that obeys the doctrine has nowhere to go: it becomes two documents
with two names, and the reader's memory burden doubles — which is the
opposite of the job the naming layer exists to do.

The instruction that produced this ADR: *provide a `slug.md`, `slug-02.md`
sequence that allows documents to be chunked.* The split rule — where a
document breaks — is explicitly deferred. The naming is not, because the
naming is what the layers need first.

## Decision

**A chunked document is a sequence of files sharing a stem: `slug.md`,
`slug-02.md`, … `slug-NN.md`. The head carries no ordinal and is the
document. The parts carry a zero-padded two-digit ordinal and are its
renders.**

Six clauses.

1. **The head is unnumbered.** `slug.md` is part one and the addressable
   file. `slug-01.md` is forbidden — the head is 01.
2. **Continuations are zero-padded, two digits, contiguous.** `-02` … `-99`,
   no gaps. Padding so that lexical order is reading order.
3. **The sequence is one document.** The callsign names the head, and
   therefore the sequence. A part carries no callsign and no registry row.
4. **Each part is a separate render with its own address space.** The vector
   map belongs to the file being rendered. So chunking *does* relieve the
   address cap — 80 addresses per part rather than per document — and it
   relieves the naming layer of nothing.
5. **The trailing ordinal means exactly one thing: part N of this
   document.** The unpadded form is retired.
6. **Ninety-nine parts.** A document needing more is not a document.

## The reversal — `avoidingCollisions` mints the ordinal this ADR reserves

`avoidingCollisions` (`scripts/reg-sync.ts:126`) suffixes `base-2`, `base-3`,
… when two files bootstrap to the same key. That is a trailing ordinal, and
after this ADR the trailing ordinal is the chunk marker. Two mechanisms, one
shape, two meanings — and they are indistinguishable in the output. Measured
by `tmp/chunk-sequence-probe.ts`:

| created as | bootstrap gives | assignment gives | it means |
|---|---|---|---|
| `a-chunked-document.md` | `DOC-CHUNKED-DOCUMENT` | `DOC-CHUNKED-DOCUMENT` | the head |
| `a-chunked-document-02.md` | `DOC-CHUNKED-DOCUMENT` | `DOC-CHUNKED-DOCUMENT-2` | part two |
| a different doc, same tokens | `DOC-CHUNKED-DOCUMENT` | `DOC-CHUNKED-DOCUMENT-2` | a collision |

The second and third rows are the same string. **Nothing downstream — reader,
lint, or resolver — can tell a chunked document from two unrelated documents
that truncated to one key.** And the distinction cannot be repaired by
padding width: the repair reaches `-12` at twelve claimants, which is padded
and indistinguishable from a twelfth part. A rule that holds below ten and
fails after is the `DBF`/`DBR` defect wearing a number.

The mechanism that produces the ambiguity is already forbidden by the silo's
own contract. `findCallsignCollisions` states that a collision *"is
unfiixable (a human renames), never silently first-wins"* — while
`avoidingCollisions` silently suffixes it. The generator does the thing the
lint forbids.

**Reversed:** the assignment path (`scripts/reg-sync.ts:252–255`) refuses on
collision and reports it. No trailing ordinal is minted. This lands with
BRF-CALLSIGN-EVERY-DOC step 5, which is already rewriting the bootstrap, and
not before — see Notes.

## The ordinal asymmetry — why the bootstrap cannot see a chunk

A **leading** ordinal survives bootstrapping, because `^(\d+)-` matches and
is re-appended. A **trailing** ordinal never does, because the token window
closes at two and the ordinal is always last. Measured:

| file | `bootstrapCallsign` |
|---|---|
| `2026-09-15-a-chunked-document.md` | `DOC-CHUNKED-DOCUMENT` |
| `2026-09-15-a-chunked-document-02.md` | `DOC-CHUNKED-DOCUMENT` |
| `2026-09-15-the-scaling-profile-of-the-store-02.md` | `DOC-SCALING-PROFILE` |
| `030-live-search-picker.md` | `ADR-LIVE-SEARCH-030` |

Six files, two names — and the long slug collapses for a second reason on top
of the first. This is not a truncation effect: there is no slug length at
which a trailing ordinal enters the window. So the ordinal survives in the
position a document never chunks from, and is lost in the position it always
does. The bootstrap's repair must therefore know the sequence, not merely
widen its window.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| `slug-01.md` for the head, no bare `slug.md` | Two files per chunk where one would do, and it makes the name a reader says and writes the longer one. The bare stem is the addressable name. |
| Unpadded `slug-2.md` | `slug-10.md` sorts before `slug-2.md`. The silo's own series is zero-padded for this reason. |
| A directory per document (`slug/02.md`) | A directory is not a document to any layer — the walk, the registry, and the search all enumerate markdown files. It hides the head from the shelf and makes the sequence invisible. |
| Keep `avoidingCollisions`, tell the two apart by padding | Padding does not separate them. See the reversal above. |
| N documents with N callsigns | The reader holds N names for one thing, which is the burden the naming layer exists to remove. It also makes the sequence a shelf, so nothing can say *this document is in three parts*. |

## Consequences

**What became easier:**

- A document that obeys the bisect doctrine has somewhere to go, and it keeps
  one name.
- The address cap is relieved by chunking without touching the vector
  machinery: 80 addresses per part.
- The trailing ordinal has one meaning, so a lint can check it by shape.

**What became harder:**

- Every layer that enumerates markdown files must learn the sequence: the
  registry (one row for the head, none for the parts), the census (a part is
  not an unnamed document), the entry stream (a part is not a search result),
  and the walk.
- A part is reachable only by its path until navigation is designed. That is
  the deferred half, and this ADR makes it a visible gap rather than an
  unnoticed one.
- The assignment path loses its collision repair, so a collision becomes a
  hard failure a human must fix. That is the intent, and it is more work at
  the moment it happens.

**Constraints this imposes:**

- The trailing ordinal is reserved. No document may end in `-NN` for any
  reason but being part N.
- `bootstrapCallsign` must see the sequence before it truncates: a chunk's
  key derives from the head's slug, and the parts take no key.
- A sequence with a gap is a broken document, and the lint should say so.

## Notes

- **The one existing series is a pile, not a sequence.**
  `docs/2026-08-29-from-intent-to-task-01..06.md` — six files, no head, no
  callsigns. Inspection: 02 is a bare table fragment, 04 and 05 carry the
  same heading, and 05 opens with *"Got it. Swapping out the sequence
  diagram…"* — a chat artefact left in the capture. It is a pile of drafts
  that share a stem. It is invalid under this convention and is the first
  case the `docs/` registration must either fix or grandfather.
- **The split rule is deliberately absent.** Where a document breaks, and
  what the viewer does with a sequence once it has one, are not decided here.
  The naming is what the layers need first.
- **The reversal is recorded, not yet run.** `avoidingCollisions` still
  mints unpadded ordinals in the tree today. It is reversed in the same
  change as the bootstrap repair, because both live in the assignment loop
  and splitting them would leave the loop half-rewritten — the palimpsest
  `playbooks/decisions-playbook.md` exists to prevent.
- **Three ordinals, two of them alive.** The silo carries a leading
  three-digit ordinal (the document's sequence in its tier, `030-`), a
  trailing two-digit ordinal (this ADR, the part), and an unpadded trailing
  ordinal (retired here). Worth stating once, because they are all ordinals
  and only two survive.

## Related

- ADR-MAIN-DOCUMENT-031 — the address cap, and the remedy *"make the
  document smaller"*, which until now had no mechanism
- ADR-MNEMONIC-MODEL-025 — exactly-one resolution, and the collision that is
  never silently first-wins
- ADR-DATE-FIRST-002 — the filenames-as-contract precedent
- BRF-CALLSIGN-EVERY-DOC — the naming layer, and the step that runs the
  reversal
- BRF-JUMP-LIST — the cap as the bisect trigger
- BRF-PANEL-LIBRARY — the heading-subtree chunk, the other reading of
  *chunk*; that one is a frame inside a document, this one is a file beside it
- `explainers/the-diagram-tool.md` — the diagram that needs more than a screen
- `docs/2026-09-14-speech-driven-design.md` — *≤90, bisect down*
- `playbooks/decisions-playbook.md` — the palimpsest protocol this defers to
