---
type: ADR
callsign: ADR-DOCUMENT-LIFECYCLE-057
date: 2026-10-08
---

# Decision: The document lifecycle — ephemeral, record, addressed, retired

**Date:** 2026-10-08
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
- `docs/2026-10-08-time-is-a-claim.md` — git as a cache; the date as a claim
- `docs/2026-10-08-the-filename-is-a-record.md` — the register framing
- `ADR-ARCHIVE-RESOLUTION` — the archive as a resolution scope
- `playbooks/registry-playbook.md` — the operational how
