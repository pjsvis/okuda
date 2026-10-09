---
type: Brief
callsign: BRF-SILO-LEXICON
---

# Brief: Gather the silo's terms of art into `conceptual-lexicon.md`

**Date:** 2026-10-08
**Status:** open
**Extends:** `BRF-CONCEPTUAL-LEXICON` (the split; landed as `system.md` v2.0.0)

## Objective

Populate `conceptual-lexicon.md` — the silo's own terms of art — from the
documents that define them. The split left it thin **by design**: the lexicon it
came from was ~95% protocol-wide terms, which stayed in `system.md`. This brief
does the gathering half.

## The rule

Every entry **cites the document that defines it**. No invented definitions. If
a term has no single defining document, the entry names the document that uses
it most precisely and says so. A term that turns out to be usable by another
silo moves to `system.md` instead — the test is *could another silo use this
term?*

## Why it matters

The lexicon is the **semantic anchor** a reader resolves against: a cold reader
(or a fresh agent) meeting *silcrow* or *okudagram* in a brief should find the
address that explains it. Today those terms are defined in prose documents and
scattered; the lexicon is where the silo *means* what it says.

## Scope

**In:** entries for the silo's established terms of art, each sourced. The
candidate list sits in the file's *Register open* section — callsign, silcrow,
vector, okudagram, tier, register, resolver, the three concerns, TFS, Gloam,
the porch, state glyphs, the resize contract. More will surface while gathering.

**Out:** protocol-wide terms (they live in `system.md`); new coinages (a term is
gathered, not minted, here); anything without a defining document.

## Preconditions

- [ ] The split landed (`system.md` v2.0.0, `conceptual-lexicon.md` created).
- [ ] The candidate terms checked against the test — general ones routed to
      `system.md`, not here.

## Acceptance criteria

- Every entry in `conceptual-lexicon.md` cites its defining document.
- No entry is a definition the source does not support (spot-checked against
  the cited file).
- A cold reader can resolve each candidate term from the lexicon.
- The file remains append-only in shape: no reordering, no deletion, only
  addition and correction.

## Related

- `conceptual-lexicon.md` — the file this brief fills
- `system.md` — the protocol and the general lexicon (v2.0.0, the split)
- `docs/2026-09-14-proposed-conceptual-lexicon.md` — the earlier draft of this split
- `okuda/AGENTS.md` — the three concerns, and the silo's rules of engagement
