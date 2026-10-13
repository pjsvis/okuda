---
type: ADR
callsign: ADR-REFERENCES-SECTION-047
---

# Decision: The References section — the renderer emits a receipt for its own map

**Date:** 2026-09-30
**Status:** Accepted (amends ADR-MAIN-DOCUMENT-031 — the discovery contract is unchanged; this adds its projection. Brief BRF-REFERENCES-SECTION.) · **amended 2026-10-09** — suppressed where the page already carries the table; see the annotation at the foot. · **amended 2026-10-13** — the receipt states its own end (a bare `…`), and a **truncated map is never suppressed**; see the second annotation at the foot.

## Context

The hand-written `## Related` / `## References` convention asked the author
to enumerate what the document cites. Measured against the renderer's own
map (`tmp/section-diff.ts`), it failed by omission: the fixture's map held
nine references, the polished hand-written section listed six — and the two
body citations were missing *because* they were cited in the body. The
author lists what comes to mind; the map lists what is there. An index
written by hand omits by omission; generation cannot.

Precedent: BRF-STREAM-IDENTITY-HEADER already has the renderer emitting
content the author did not write. The question here is which concern owns
this section — and the three-concerns test answers it. The section's text is
derived entirely from the document's own jump map; it never touches the byte
stream's origin (compositing) or the pane layout (windowing). It is the
renderer's receipt for its own derivation: **rendering**.

## Decision

**The main document's render ends with a generated `## References` section:
one line per map destination, in map order, as `§NN` plus the target. The
author writes nothing.**

Four sub-rulings, each load-bearing:

- **Generated from the map, never from painted text.** `cli.ts` gates
  annotation on `process.stdout.isTTY`; a section built from paint would be
  empty when piped or under `NO_COLOR`. Built from the map, it is identical
  on every rung — painted silcrows on the glass, plain numbers elsewhere.
- **The append point is the render input, after annotation — never the
  source.** The section joins the pipeline downstream of `annotateSource`,
  so its own callsigns are never re-scanned and never double-marked. Written
  into the source, the map would feed itself; the append site is the loop's
  only guard, and it holds by construction: the section is never an input
  to `scanReferences`.
- **Order is map order.** Reading order, ascending, `§12` first. The order
  is the map's, so it cannot read as ranking; the ascent is the motor-map
  property that makes the list scannable.
- **Main document only; empty map, no section.** The two-render contract
  holds — a dereferenced document renders clean and gets no section; a
  document with no references renders no empty header.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Keep the hand-written convention | Measured: a third of the references absent after three polishing passes — the author's recall is not an index |
| Group the section by entry shape (callsigns first, paths last) | A callsign already looks like a callsign; the grouping tells the reader nothing while scattering the ascending numbers costs the one scannable property |
| Build the section from the painted text | Empty when piped / `NO_COLOR` — the TTY gate makes paint the wrong substrate |
| Add a URL channel so external links join the section | External links are in no map (`RE_MD_LINK` matches `.md` only) — a grammar change, tracked separately (td-9eb7a4), not smuggled in here |
| Emit the section as markdown links (`[x](path)`) | Links are occurrences — re-scanned, they would re-mint destinations; the section's targets are plain text on purpose |

## Consequences

**What became easier:**
- The section cannot omit — it is a projection of the map, and the map is
  what the document actually cites.
- One authoring convention retires: there is nothing to write, nothing to
  keep current, nothing to forget to update after an edit.
- BRF-CENSUS-MODE's cap question is answered at the foot: the section lists
  exactly what is addressable, and its length is the cap made visible.

**What became harder:**
- The document's last word is no longer the author's. Accepted: it is a
  receipt, and receipts are not authored.
- Rendered output is no longer a clean re-input: the appended section (and
  its plain-text targets, e.g. a callsign) is present in the bytes, so
  piping output back through okuda is rendering a render, never a supported
  source.

**Constraints this imposes:**
- `MAX_REFS` stays 80; `§12` is still first; the numbering contract
  (ADR-031, ADR-032) is untouched — this projects the map, it does not
  change how the map is minted.
- The existing 26 hand-written sections stay as written — retiring a
  convention is not a bulk edit; the corpus keeps its history.
- The map-identity invariant: a document with a generated section derives
  the same map as the same document without one (repeats dedupe by target;
  `.md` targets listed as bare paths are mentions, not uses).

## Related

- ADR-MAIN-DOCUMENT-031 — the map this projects; its discovery contract
  stands, amended only by this pointer
- BRF-REFERENCES-SECTION — the implementation brief (the diff that settled
  it, the acceptance criteria, the deprecations table)
- BRF-STREAM-IDENTITY-HEADER — the precedent: the renderer emits content
  the author did not write
- docs/2026-09-10-use-vs-mention.md — why the section's `.md` targets are
  plain text: a bare path is a mention; the minting debate is moot for a
  generated section
- playbooks/authoring-playbook.md — "References are text": the rule that
  gains the generated section
- scripts/references-demo.ts, tmp/section-diff.ts — the fixture and the
  diff instrument that measured the omission

## Annotation (2026-10-07)

**The section can omit, in one case — and it is the case the cap creates.** The
claim above, *"written by hand omits by omission; generation cannot"*, holds
until the address cap binds. The original instrument (`tmp/section-diff.ts`)
asked whether the generated section omits; at the current corpus size it does.

Measured with the full gate (callsign ‖ path, as `src/cli.ts` composes it):
`briefs/index.md` at 82 rows yields 80 occurrences — `scanReferences` slices at
`MAX_REFS` — and 77 addresses, because `buildJumpMap` dedupes by target (three
briefs appear a second time inside another row's summary). Six rows render with
no silcrow and the receipt lists 77 of 82 destinations **while reading as
complete**. Highest address assigned: 95 of 98, so discovery binds before the
address space does.

What survives is the distinction the argument was made on: generation cannot
omit *at the author's discretion*. What dies is the absolute. The loss falls on
the oldest rows by construction — the view is recency-first
(`playbooks/registry-playbook.md`, "Ordering") — and that is the accepted trade.

The honest remedy is a **boundary mark, not a warning**: an alarm that fires on
every render of a growing view is an alarm that is off. The receipt should say
where it stops, the way `…` says where a cell stops. The mark is not built; the
measurement above is the case for it.

## Annotation (2026-10-09) — suppressed where it would only repeat the page

Amended on the operator's reading of the heuristics index in the glass: Related
then References listed the same paths, and the reader is asked *"why this
duplication?"* — a question the page cannot answer. **A prompted question left
unanswered is the defect** (not the duplication itself): the layout implies the
document knows what it is doing, and an element it cannot explain costs the
reader's trust in the whole frame.

**Ruling.** `appendReferences` suppresses the generated section when the
document is **self-tabling** — every destination in the map occurs inside a
**list item in the final section** (`referencesCovered`). The reader then sees
the table once, annotated, where the author put it.

**The condition is coverage, never "a list exists."** This ADR exists because a
hand list *omits* (measured: nine in the map, six in the polished section). A
**partial** list therefore keeps its receipt — and that is the *signal*: a list
followed by an unexpected receipt tells the reader to investigate, and the
investigation finds the omission (*Related was incomplete*). That is the
reassuring case, not the doubtful one. Suppressing on presence alone would
re-instate exactly the omission this section was written to catch.

**The annotated gate, and why it is load-bearing.** Suppression applies only
where the addresses are already on the page — the caller states this (`cli.ts`
passes `process.stdout.isTTY`; the TUI always annotates). On the plain/piped
rung `annotateSource` is skipped, so the receipt *is* the address table
("painted silcrows on the glass, plain numbers elsewhere"). Suppressing it
there would lose the addresses entirely — the opposite of the intent.

**The cost, named.** The section's *presence* is now a function of the author's
prose shape as well as the map — the determinism this ADR's sub-ruling
protected. The *information* is present on every rung either way (inline on the
glass, the receipt when plain); what moves is where it lives. Accepted on the
operator's argument above.

**Constraints this imposes.**
- `referencesCovered` is the condition's only home; changing what counts as
  "self-tabling" means changing this annotation.
- The guard is the test trio: a complete final list → suppressed (annotated
  rung) and kept (plain rung); a partial list → kept; a body-only citation →
  kept.

## Annotation (2026-10-13) — the boundary mark, and a truncated map is never suppressed

Two changes, both from BRF-BOUNDARY-MARK. The second **amends the 2026-10-09
ruling above**.

**1. The receipt states its own end.** The map is capped by the address space —
80 destinations, the mixed-digit pairs (`ADR-REPEATED-DIGIT-ACTUATORS-032`). Past the cap
the receipt listed what fit and **read as complete**: the omission the 2026-10-07
annotation conceded, entering without discretion and without a word. The last
line of the section is now a bare `…` when the document holds more distinct
destinations than the map has entries — and **only** then.

- **Derived, never judged.** The predicate is *distinct destinations outnumber the
  map's entries* (`deriveReferences`), never `map.size === 80`. Exactly eighty
  distinct destinations is **complete** — the space is exactly full — and a mark
  there would lie about its referent. The predicate is a comparison precisely so it
  covers both truncation sources without naming either.
- **Bare, never `… and N more`.** The count is a second quantity to keep honest and
  it moves on every render of a growing corpus: the warning shape this file's own
  literature refuses — *an alarm that fires on every render of a growing view is an
  alarm that is off* (BRF-BOUNDARY-MARK).
- **Not a silcrow.** It carries no number, so nothing paints it and nothing can
  actuate it. It rides the section source, so it is identical painted, piped and
  under `NO_COLOR`, and needs no TTY gate. `⋮` is the recorded alternative — truer
  to a list's axis, and it already paints `state-parked` — deferred because it is
  bound to the *mermaid source elided* indicator, and one glyph with two referents
  is what *Attributable structure* names.
- **Plain, not muted — a declared deviation.** No muted channel exists from a
  markdown source, and the receipt's other lines are not muted either (the `§NN`
  badge paints in the vector role, the target is prose). A new paint channel for
  one glyph is the ceremony this house refuses. The mark is distinguished by what
  it is *not*: no silcrow, no number, nothing actuable — the load-bearing half.

**2. A truncated map is never suppressed — this amends the 2026-10-09 ruling.**
That ruling suppresses when `referencesCovered` is true, and `referencesCovered`
checks the **map's** destinations. On a truncated map it can therefore be true
while the document still holds destinations the receipt never saw — and
suppression would hide the **boundary** along with the receipt: the very failure
that annotation exists to prevent, re-entering through its own fix. The condition
gains one term: suppress only when `annotated && !truncated && referencesCovered`.

The reader then sees a receipt reappear over an otherwise complete hand list
exactly when the map was truncated — **its mere presence reports the
condition**, the same mechanism as the partial-list case above, one level down.

**Measured, 2026-10-13** — the mark has a home on arrival. Live fixtures:
`&briefs.md` 120 distinct destinations → 80, **40 never realised**;
`briefs/index.md` 101 → 80, **21 never realised**. **61 across two documents**, up
from 46 on 2026-09-10 — the boundary is live, not latent. Both carry a receipt
today (`referencesCovered` is false for both: their bodies are tables, never list
items), so both carry the mark.

**Constraints this imposes.**
- One predicate (`deriveReferences`) and one emitter (`referencesSection`). A
  second of either is a new decision, not a patch.
- The mark lives **inside** the section, so anything that drops the section drops
  it. Intended: there is nothing left to mark. `--no-references` (the paper rung)
  is unchanged by construction.
- `…` may become `⋮`; that is a swap in one constant, and the trigger is dogfood
  reading the mark as a cell cut rather than a list boundary.
- The guard is the test quartet in `tests/vectors.test.ts`: 81 distinct → 80 rows
  and one bare `…`; exactly 80 → **no** mark; a truncated self-tabling document →
  receipt kept with the mark; the mark identical on the painted and the plain rung.
