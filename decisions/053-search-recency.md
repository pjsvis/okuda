---
type: ADR
callsign: ADR-SEARCH-RECENCY-053
date: 2026-10-07
---

# Decision: Recency first in the picker — newest at the top, and case-insensitive directories

**Status:** Accepted

## Context

Two reports from the operator, one sitting (2026-10-07), both from the
same place — a `gloam` search run from `~/Dev/GitHub` (a folder of
repositories, not a silo):

1. **`TradingAgents/` did not match.** The directory exists; the query
   `tradingagents/` matched it not at all, while the *content* channels
   found `TradingAgents` inside file bodies without complaint. One
   search, two answers.
2. **The list ran oldest-first.** A date-prefixed corpus sorts
   ascending under the canonical collation, so the newest document
   sits at the bottom of the picker — four hundred rows away from the
   cursor. The operator's rationale, verbatim: *"we want the more recent
   stuff at the top of the list."*

The first is a defect; the second is a reversal, and this record treats
them separately.

## The defect: one search, two answers

The content channels have been case-insensitive since the case fix
(`rg -i`, `registryRows` and `bodyHitsFor` both). The path layer never
was: `matchPathPredicate` and the clause filter compared with
`startsWith` on raw bytes. So the same reader typing the same word got
a hit through the body and silence through the path, and the silence
looked like "no such directory".

**Decided: directory predicates are case-insensitive**, in both
directions (positive `dir/`, negated `!dir/`), at both call sites
(`matchPathPredicate` and `applyPathPredicates`), because two
implementations of one rule is how the inconsistency arose.

The honest cost: on a case-sensitive filesystem two directories
differing only in case (`Notes/` and `notes/`) both match a query for
either. That is the correct reading of a *search* — the reader is
asking for the directory, and a directory's casing is not their
business. A search that silently refuses a real directory is worse than
a search that occasionally offers two.

## The reversal: which end of the chronology is at the top

Two viable options, and the incumbent was deliberate — the launcher
playbook documents it, including the "weird order" report that turned
out to be fzf's layout rather than collation:

- **Option A (the incumbent): ISO-ascending.** The stream carries the
  canonical `LC_ALL=C` collation, dates therefore run oldest-first, and
  `--tiebreak=index` preserves that order as the picker narrows in
  place. The argument: a date-prefixed corpus *has* a canonical order;
  the file list starts where the alphabet starts; nothing is
  re-derived.
- **Option B (chosen): recency-first among dated rows.** Within each
  channel, rows whose basename carries a date come first, newest first;
  undated rows follow in the canonical collation, untouched.

**Decided: Option B.** The picker is not a library index, it is an
activity pulse: the reader is asking *what changed recently*, and in a
silo that grows at the end, an ascending list buries today's work under
everything ever written. The corpus that made the case is this one —
427 documents, most of them date-first, all of them appended.

## What the reversal does NOT change

- **The channel rank is authoritative** (BRF-JUMP-LIST, defect 2).
  Recency orders *within* a channel; it never promotes a body hit above
  a registry hit or a remainder row above either. The stream order is
  still the screen order.
- **Undated rows are untouched.** They keep the canonical collation in
  the order the channel produced them, so the playbook's claim — the
  file list starts where the alphabet starts, `AGENTS.md` at the top —
  remains true verbatim for the case it describes.
- **The shelf is untouched.** A bare `gloam` with no query is a
  different code path (root files, first-line evidence); the reversal
  applies to the dive only.
- **Determinism survives.** The comparator is a stable sort over ISO
  prefixes, which compare correctly as strings: `2026-10-05` > `2026-09`
  > `2026-08-20`. Equal dates keep their input order.

## Consequence, stated plainly

Reading a corpus front-to-back now means scrolling to the end of a
picker page. That is the accepted cost: the *documents* keep their own
narrative order and their own chronology, and the picker's job is to
point at the newest thing, not to serve as a table of contents.

## Palimpsest

The superseded rule lives in prose, so the abandonment surface is prose:
`playbooks/gloam-launcher-playbook.md` asserted ascending chronology and
verified it against fzf 0.73.1. That entry is amended in the same change
— the old rule, the new rule, and the reason, visible together — rather
than silently rewritten. No code artifact of the old rule survives: the
collation stays, and only the comparator inside each channel changed.

## Related

- `playbooks/gloam-launcher-playbook.md` — the ordering contract, amended
- `briefs/2026-09-14-brief-jump-list.md` (BRF-JUMP-LIST) — the rank as the
  screen's order; this refines the stream it makes authoritative
- `briefs/2026-09-04-brief-onion-search-grammar.md` (BRF-ONION-SEARCH-GRAMMAR)
  — the layered grammar this edits, not a new layer
- `src/onion.ts` — `matchPathPredicate`, `applyPathPredicates`,
  `pathDate`, `orderByRecency`, `onionMerge`
