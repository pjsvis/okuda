---
type: Debrief
callsign: DBF-BARNACLE
date: 2026-10-14
tags: [record, naming, gates, process]
agent: pi
environment: local
briefs: [BRF-RETIRE-OKUDAGRAM]
---

# Debrief: The barnacle — one word, three referents, and a gate that holds the line

An operator request to "scrape a terminology barnacle" turned out to be a naming
decision the silo had never made. The measurement is what made it one.

## What the measurement said

`grep -ri okudagram` found **463 occurrences** — but the interesting number was
inside it: the corpus **defined the word twice, differently**.
`explainers/concepts-and-terms.md` said *"An okudagram is a composed screen"* (the
whole render); the head comment of `src/frames.ts` said *"okudagram (the
diagrams)"*; and `okudaframe` was a third word for the header-to-header unit. A
reader landing on either definition meant something different by the same word,
with no way to tell which was canon — the **LEM → LM veto** in its purest form,
except LEM had one referent it could fail to describe and this word had two.

## What landed

- **`ADR-RETIRE-OKUDAGRAM-066`** — and the reason it is a decision rather than a
  rename: the slot the fan word filled was real. `ADR-RENDERER-READER-029` had
  disambiguated the reader, okuda and the glass, and left the *composite*
  unnamed. Retiring the word without naming the thing would have invited the next
  barnacle. The table gains its fourth role: **the render**; one portion of a
  render is **the frame**; a drawing inside it is **a diagram**. Okuda's screens
  are cited in prose — the readable range of distance, detail, structure and
  colour — and nothing of ours wears his name.
- **`scripts/retired-terms-lint.ts`** — the boundary as a gate. It read **24
  living paths** before the tidy and reads zero after. The rule is
  `ADR-RETIRE-OKW-018`'s, applied: history keeps its words (date-prefixed
  documents, `.archive/`), data is never renamed (a callsign is not an
  occurrence), an address is not a use (a path into a dated record is allowed),
  and everything read forward is refused.
- **The tidy itself** — 24 living paths: comments in `src/`, `tests/` and
  `scripts/`, five playbooks, two explainers, the lexicon candidate list, the `&`
  panels, and four undated `docs/` references. Two files renamed, with the map in
  the ADR because a dated record still points at the old names.
- **The ledger's first promotion.** `retire-okudagram` → this brief. The gate
  built this morning recorded its first outflow the same day, and the ratio moved
  from 0% to 25% — which is the smallest possible test of a container, and it
  passed.

## Three things the gate taught the author

**1. A callsign is data, and stripping it is the lint's first duty.** The head
comment of `src/tui.ts` carried the word *inside* `BRF-PAGED-OKUDAGRAM`. A gate
that reads callsign text would fail the very document that keeps the citation
alive — so the term is stripped of callsigns before it is matched, and the
stripping is a test.

**2. An address is not a use — but "contains a slash" is not an address.** The
first heuristic stripped any token with a `/`, which silently let
`frame/okudagram mode` through: prose, not a path. The rule is now that an
address carries a **file extension**, and the failure became a test. A lint that
reads the surface it polices will find its own edges, and each edge is worth a
test rather than a comment.

**3. `just amp-regen` reintroduced the term into a living surface.** The panel's
membership is derived and its notes are the editor's; the appended row took the
brief's title verbatim, and the title names the retired word. Rewritten in the
panel (the note is the editor's, `ADR-DERIVED-AMP-TABLE-058`). It is a small
standing hazard of deriving membership and authoring notes in the same table, and
it is named rather than patched quietly.

## The process failure, recorded

**The commit was made on `main` before a branch existed** — Rule 4, broken. The
work was written, checked and committed before `git checkout -b` was run, and
`ref-census` did not catch it because the check ran *after* the commit, by which
point `main` was simply ahead. Repaired unpushed (`git branch
feat/retire-okudagram`, then a reset of `main`), so nothing is lost and no
history was rewritten; the tree is identical.

The lesson is not "remember to branch" — that is the unpaid-claim class this
silo keeps naming. It is that **the branch is the thing `just check` is checking
for currency**, so a check that runs on `main` after the fact is checking the
wrong ref. The order is: branch, work, commit, check, fast-forward.

## What is owed

- The retired term remains in **date-prefixed records and `.archive/`** by
  design, and in two callsigns. Anyone reading `docs/2026-08-31-the-same-okudagram.md`
  finds the map in `ADR-RETIRE-OKUDAGRAM-066`.
- **`scripts/frame-probe.ts` and `explainers/the-render-as-context.md`** are
  referenced by their old names in a dated record, a discussion document and a
  debrief. Those are not rewritten; the ADR is the map.
- The three remaining ledger entries stand at `open` with their triggers, and the
  20-debrief linkage baseline is still owed.

## Lessons, stated so they can be tested

- **A name with two definitions is not a style problem; it is a defect.** Look
  for the word that is defined twice — that is where the barnacle is.
- **Scrape the name, fill the slot.** A barnacle that grew in a gap will regrow
  unless the gap is closed with a name from the same pattern as its neighbours.
- **A retirement needs an instrument, or it is advice.** The count was 24 and is
  0, and the gate is what keeps it there; the ADR says so in its `Enforced by`
  line rather than hoping.
- **A gate that reads the surface will find its own edges.** Every edge found
  here became a test; none was left as a comment.

## Continuity

The next sitting re-reads this and `just orient`; nothing here is carried in
memory. `docs/ideas.md` holds the ledger, `scripts/retired-terms-lint.ts` holds
the boundary, and `ADR-RETIRE-OKUDAGRAM-066` holds the map.
