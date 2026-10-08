---
type: ADR
callsign: ADR-DOCUMENT-LIFECYCLE-057
date: 2026-10-08
---

# Decision: The document lifecycle — ephemeral, record, addressed, retired

**Date:** 2026-10-08 · **amended 2026-10-08** (the built class, and the warrant
as a claim — the dispositions the prune batches produced)
**Status:** Accepted
**Answers:** `BRF-DOCUMENT-LIFECYCLE`

## Context

A silo with no exit is additive by construction. This one carried around two
hundred documents in `docs/` with no registry, a growing tail of deliberation
whose verdicts had already landed, and no operation for *this is finished* other
than leaving it in place.

Three distinctions did the work, and each had been collapsed:

- **Audit is not address.** Git audits — who, when, what — for anything
  committed. A callsign *cites*: it is the name the silo speaks. Requiring a code
  for auditability inflates the address space until a code means nothing.
- **Dates are broad; codes are narrow.** The date prefix is mechanical and
  belongs on every dated document (`BRF-DATE-INVARIANT` enforces the agreement).
  A callsign is a curated currency — *names arrive when earned*.
- **Git is a backup, not a memory.** "It's in history" is the code argument, and
  it is cheap when you know the symbol. For a document, recovery is excavation,
  and excavation is not recovery for a reader who arrives without the thread.

## Decision

**Four registers, each with an obligation. A document moves between them by
decision, not by clock.**

| register | lives in | owes | cost |
|---|---|---|---|
| **ephemeral** | `tmp/` (gitignored) | nothing — un-audited by design | none |
| **record** | `docs/`, `MEMORY/WORK/` | committed, dated; auditable by path and date | the date prefix |
| **addressed** | briefs, decisions, debriefs, playbooks, advisories | a callsign: citable, movable, resolvable | curated, earned |
| **retired** | the archive scope (`.archive/…`) | still resolves by callsign; out of the work queue | a move |

**The predicates.**

1. The date prefix applies to every dated document, and the name agrees with the
   content.
2. A callsign is **earned** when something will cite the document by name, or the
   document *is* a tier's unit by construction. A document nothing will cite
   needs its date, not its name.
3. **Retirement is for an addressed document that has also settled** — cited,
   and done. Filing is not archiving.
4. **Zero-effort metadata, curated codes.** A script may date a document; only a
   decision may name it.

**The keep-class — never deleted.** Rejections and reversals: what was tried and
refused, what was decided and undone. The expensive failure of a knowledge silo
is re-deciding.
**The operation is a move, not a deletion.** Extract-then-delete: a discussion
whose verdict landed is retired only once the Thing it fed carries the decisive
warrant, not merely the alternative's name.

**The oracle is the citation graph.** Code deletion has a compiler. Document
deletion has citations, and nothing else screams.

## Amendment (2026-10-08): the built class, and the warrant as a claim

Five prune batches produced two tests this ADR does not contain — containment
(one document's prose inside another's) and the disposition question — and the
fifth met a document class the question has no slot for. The question, from
`DBF-PRUNE-BATCH-4`: *is the design here the one the system built, the one it
refused, or one it never noticed? Only the third is disposable.*

`DBF-PRUNE-BATCH-5` met the missing case and left the finding as a **standing
doctrine candidate** — "*built* as a missing class; *noticed-but-uncarried* as
the honest sub-case". A candidate becomes policy here, because the alternative
is that a disposition applied four times stays in four debriefs and nowhere the
next pruner reads.

The hole is **built**. A document stating a design the system *built* is not a
refusal (the keep-class is absolute) and not a never-noticed one (which the line
above makes disposable) — so a deletion of that class rests on a different
ground, and an unexamined disposition is taste. The ground was named in batch 5
(`4d5efb2`) and is now the doctrine.

**The dispositions, complete:**

| disposition | test | outcome |
|---|---|---|
| **refused / reversed** | the document records a decision the system made *against* a design | keep-class — absolute, no further test |
| **never noticed** | no Thing carries it, no citation names it, nothing was built | disposable |
| **built, statement carried** | the design is live *and* an addressed Thing states it | disposable on the **derivative ground** |
| **built, statement uncarried** | the design is live but only this document *states* it | disposable only if the **practice is live**; else it is the only record, and it stays |

The fourth line is the addition. Its test is not textual — nothing will contain
it — so it must be answered by reading, and the answer is about *practice*: the
silo continues to do the thing even after the sentence describing it is gone.
Where the practice is live, the framing retires and the work continues; where it
is not, deleting the only statement is how a silo forgets a capability it once
had.

**The derivative ground, stated.** A built design whose statement is carried by
an addressed Thing is disposable *because the Thing carries the warrant*, not
because the document was uninteresting. This is the same predicate as the
keep-class, read forwards: the keep-class protects a decided-against design
because nothing else will record it; the derivative ground releases a
built-and-carried one because something else already did.

**The warrant must be a claim, not a name.** This ADR already says a document is
retired only once the Thing it fed carries the decisive warrant "not merely the
alternative's name". That sentence turned out to govern the *carriers* too: in
batch 5 a carrier cited by name passed the check while stating a different
design — two unrelated claims share the token *Janeway*, one a viewport
assertion, one a command topology with retained root access. A citation that
resolves is not yet a citation that **means**. The carriers are read, and what
they say is stated alongside what they are.

**Register is not a disposition.** A narrative that carries no claim, cites
nothing, and records no refusal is not a fifth kind of keep — rhetoric is not a
disposition, whatever its quality. Batch 5 waived extraction for one such story
on a **reproducibility** call rather than a doctrinal one (*we can always
rewrite a blog post*). That is a judgement available case by case; it is not a
general licence to delete prose, and it does not make the register disposable.

**A reading's limits are part of its record.** `DBF-PRUNE-BATCH-4` requires that
every deletion past the duplicates rests on a reading, and that the reading be
recorded. Record its reach as well: which elements of the retired document had
no carrier, and why that was admissible under the fourth line above. A warrant
recorded without its limits is read by the next batch as coverage.

## Alternatives Considered

| alternative | why rejected |
|---|---|
| Delete like code — git is the record | Documents fail silently. Removing a function breaks a build; removing a rationale breaks nothing until someone re-decides. The rejected path is the moat. |
| Address everything — a callsign for every document | The code is scarce and earned; minting it for intermediate documents debases it (*cool is curated, never generated*). Zero-effort belongs to the metadata layer, never the identity layer. |
| Time-based retention — archive after N months | A clock is not a status. Retirement is *settled*, a judgement about the work; a calendar would retire live documents and keep dead ones. |
| The archive as a name convention only | The resolver reads the archive **scope** (`ADR-ARCHIVE-RESOLUTION`); a folder without the flag resolves nothing, and two encodings of one fact drift. |

## Consequences

**What became easier:**
- The silo has an exit. The working set can shrink, and a callsign can mean
  something again.
- The record register is explicitly allowed to be untidy — kept, dated, uncoded.

**What became harder:**
- The prune is editorial, not mechanical. Extracting the warrant a Thing needed
  requires reading the deliberation it came from.
- The read order is fixed: enumerate, derive the reference graph, classify, then
  retire in batches. A prune without the census is taste.

**Constraints this imposes:**
- The keep-class is absolute. "Importance" is derived from the citation graph,
  not judged.
- A name is minted once, by the first to land it. The shared history is "our
  context", not the individual clone.

## Related

- `BRF-DOCUMENT-LIFECYCLE` — the brief this answers
- `DBF-PRUNE-BATCH-2`, `DBF-PRUNE-BATCH-3` — containment, the test that carries
  no reading: a document inside another is a duplicate, and the reading
  instrument is not needed
- `DBF-PRUNE-BATCH-4` — the disposition question (*built, refused, or never
  noticed*) and the rule that every deletion past the duplicates rests on a
  reading that must be recorded
- `DBF-PRUNE-BATCH-5` — the built class met, the Janeway conflation, and the
  *noticed-but-uncarried* name this amendment settles (`4d5efb2`)
- `docs/2026-10-08-time-is-a-claim.md` — git as a cache; the date as a claim
- `docs/2026-10-08-the-filename-is-a-record.md` — the register framing
- `ADR-ARCHIVE-RESOLUTION` — the archive as a resolution scope
- `playbooks/registry-playbook.md` — the operational how
