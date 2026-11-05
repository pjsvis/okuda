---
type: ADR
callsign: ADR-GLOBAL-TERM-086
date: 2026-11-05
---

# Decision: An entry in the loaded protocol file is a term, its test, and an attribution

**Date:** 2026-11-05
**Status:** Accepted
**Enforced by:** `nothing — advice` (the file is outside this silo's boundary, and no gate spans a seam)

## Context

The protocol file loaded into every session on this machine is 490 lines and 33
KB, most of it lexicon. Measured 2026-11-05: 13 callsign citations inside it —
`ADR-DOCUMENT-LIFECYCLE-057`, `ADR-EXIT-FERMATA-051`, `ADR-027`, `ADR-031`,
`BRF-SEARCH-ROW`, `BRF-CODE-SILCROWS` — every one of which resolves **only
inside okuda**. The file's own test is *could another silo use this term?*: the
terms pass it (a **ventilator** is a ventilator anywhere), the citations cannot.

That asymmetry is the defect. Each entry carries not just the term and its test
but the **narrative of its coining**: the evening it was noticed, the vessel it
was noticed on, the colleague's sentence, the brief that filed it. That narrative
is the silo's memory, and it lives where the silo can see it — in the origin
documents the entry cites. The loaded file was keeping a second copy, and the
copy is what grew: a fresh context now spends its first minutes reading
provenance about a project it may not be working on, and every one of those
addresses is a dangling reference in any other silo. *The declaration is not the
record*, one layer up.

## Decision

**A global lexicon entry is the term, its test, and an attribution. The history
of the coining stays in the silo that coined it.**

- **The term and the Test stay verbatim.** They are the general part: what the
  word means and the observation that would falsify it. Trimming them would make
  the file shorter and the protocol weaker, which is the trade this ADR refuses.
- **The attribution becomes a date, not an address.** *Coined 2026-10-07* instead
  of *`docs/2026-10-06-the-shared-artifact.md`*: the same claim about origin
  (the silo's git log carries the address), and one that no other silo has to be
  able to resolve.
- **The narrative is dropped, not moved.** It already exists in the silo's docs
  and in its git history. A move would create the parallel store the house
  refuses; deleting from the loaded copy loses nothing, because the record was
  never only here.
- **A term that dies with its silo does not belong in this file at all.** If an
  entry cannot be stated without an okuda-specific referent, it belongs in
  `conceptual-lexicon.md` (the silo's own, append-only), and the global file
  does not carry it. That is the local/general test applied honestly, rather
  than to the term's *name* only.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Move every okuda-born term into the silo lexicon | It would empty the general file of exactly the design vocabulary other silos need, and it re-creates each entry in a second place — the parallel store the house bans. The terms are general; their provenance is not |
| Keep the file as it is | 33 KB of loaded context, a third of it provenance for work a new session may not be doing, carrying references that dangle everywhere else. Length in a file that is *always* loaded is the most expensive length there is |
| Split the protocol: a loaded core plus a referenced lexicon document | A reference outside the prompt is a door a fresh context will not walk through on its own, and the protocol's whole value is that it is *there* at clause 3 (`just orient` is recall, not memory). The core must be in the file; the history need not be |
| Trim by deleting entries whose referent is okuda | Loses general terms (**audit surface**, **the seam rule**, **attributable structure**) that any silo can use and that were hard to state. Trim the narration, keep the terms |

## Consequences

**What became easier:** a fresh context reads a protocol that is mostly protocol;
every citation in the loaded file resolves wherever it is read; the general/local
split becomes a rule an author can apply to a *sentence* rather than to a term.

**What became harder:** the silo that coined a term must now keep its own record
of the coining, in the document that earned it — which is the correct place, and
which every silo already does for its own work.

**Constraints this imposes:** new lexicon entries in the loaded file are written
as *term, test, attribution-by-date*. The narrative goes in the silo's document
first, and the entry cites the date.

## Related

- Brief: `BRF-FIRST-CONTACT` (found it: the fresh session's own report)
- Lexicon: **unpaid claim**, **continuity by re-reading**, **the declaration is
  not the record**, **the seam rule** (the same rule, one layer up)
