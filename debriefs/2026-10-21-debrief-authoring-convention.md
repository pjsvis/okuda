---
type: Debrief
callsign: DBF-AUTHORING-CONVENTION
date: 2026-10-21
tags: [docs, authoring, agents, style-guide, registry]
agent: pi (ses_4da69b)
environment: local
briefs: [BRF-AUTHORING-CONVENTION]
---

# Debrief: The authoring convention — the guide that existed and the agent that did not know

One sitting, and the finding came before the work. The silo already had a
written guide to producing a document — `docs/style-guide.md`, the author's
guide, the inverse of the grammar showcase. It was written, short, and rendered
as the demo of itself. Nothing in `AGENTS.md` pointed at it. Rules 1–9 covered
workflow — orient, brief, td, branch, quality gate, registry, ADR, stage,
debrief — and none covered craft. The gap was not a missing document. It was a
missing route.

## What landed

- **`AGENTS.md`: an **Authoring** section** — after *Scope Discipline*, because
  the numbered rules are process and this is craft. Routes an agent to
  `docs/style-guide.md` before authoring, and carries the three things the guide
  says that are easy to get wrong: the renderer supplies colour and the author
  supplies structure, a diagram never wraps, structure is a choice.
- **`docs/style-guide.md`: **The frame that wraps**** — the shoulder or elbow
  that gathers a block without sealing it. A box closes and claims the contents
  complete, which is a claim the author is rarely entitled to make. A shoulder
  turns one corner and a rule runs from it. The frame costs a glyph and a rule
  instead of a perimeter, which is what makes it survive narrowing rather than
  merely being cheaper than a box.
- **`docs/style-guide.md`: **Authoring contract**** — four defaults the guide
  stated nowhere: author to 79 columns (the top rung of the squint ladder),
  split by view and not by scissors, labels ASCII and prose free, never fake a
  fit. The last one is the sharpest — elision is marked with `…`, a faked fit is
  marked with nothing.
- **`BRF-AUTHORING-CONVENTION`** — the brief, registered in
  `briefs/INDEX.jsonl`.

Landing record `dcea2ae`.

## What the gates found

**The registry was already red, and the work inherited it.** `just check` failed
on `main` before a single file was touched: `reg-sync` reported
`briefs: MISSING 2026-10-21-brief-registered-probes-tier.md` — an operator
brief sitting untracked in the directory. The gate was failing on someone else's
drift, and my commit would have landed on a red tree.

Running `reg-sync --fix` cleared it, and that is the honest cost: **the
operator's untracked brief is now indexed** in `briefs/INDEX.jsonl` and
`briefs/index.md` while its file remains untracked in git. The registry reflects
the directory; git does not. That asymmetry is the operator's to close, not the
gate's, and it is recorded here rather than resolved by assumption.

**Then `amp-check` caught the same thing one layer up.** After the registry was
in sync, `amp-check` failed: `&briefs — 2 live brief(s) unfiled`. Two documents
had entered the registry without a row in the AMPER page. `just amp-regen` wrote
them. Two gates, two layers, same drift — the index and the page are separate
artifacts and each has to be told.

**`ref-census` wants the branch gone.** After the fast-forward, the merged branch
was flagged: *merged but still here*. `git branch -d` closed it. The gate checks
for branches that carry nothing, which is a fair test and one the operator's
`feat/television-preview` is explicitly declared against.

## What did not land, and is owed

- **The frame definition is a codification, not a citation.** It derives from
  the operator's description of the house style and not from a document that
  defines it. The lexicon's rule — *every entry cites the document that defines
  it, no invented definitions* — is not yet satisfied. It lands open, and the
  operator's wording replaces mine on correction.
- **The width ceiling is a proposal.** 79 is measured; 120 is not. The contract
  says so in as many words, because a number that looks measured and is not is
  the failure the silo's own census exists to catch.
- **The OKLCH brightness dial is unmeasured, and the reasoning is
  counterintuitive.** A uniform L offset applied to the whole palette *reduces*
  contrast, because relative luminance runs roughly as the cube of L\*: the
  lighter colour gains more luminance than the darker one, so brightening
  foreground and background together flattens the ratio. If the dial pushes text
  away from background instead, it behaves as expected. Cheap to settle —
  contrast at both endpoints, per channel pair — and it belongs in the palette
  work, not the authoring work.

## The reading

The convention was never missing. It was unrouted. That is a specific failure
with a specific fix, and it is cheaper than the alternative, which is writing a
new policy the guide already contains. The agent does not need to know what the
renderer *can* do — only where it stops, and which document says so.
