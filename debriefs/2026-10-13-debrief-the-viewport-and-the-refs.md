---
type: Debrief
callsign: DBF-VIEWPORT-REFS
date: 2026-10-13
tags: [rendering, vectors, refs, process]
agent: pi
environment: local
briefs: [BRF-ADDRESS-CAP, BRF-BOUNDARY-MARK, BRF-TABLE-GUTTER]
---

# Debrief: The viewport riff, and the refs behind it

One sitting, 15 commits, from a riff about whether a document has to be vertical to
three closed edges and two new gates. The interesting part is not the features —
it is that **four of the five corrections were corrections of this repo's own
record**, three of them mine from the same day.

## Accomplishments

- **Two gates added to `just check`.** `scripts/elision-monotone.ts --gate --strict`
  (the recoverability invariant across 517 documents, plus its baselined residue)
  and `scripts/ref-census.ts --gate` (a branch is deleted, current, or declared —
  nothing else). Both fast enough to gate: 7.4s and ~150ms.
- **The term `progressive engagement`** admitted to `conceptual-lexicon.md` under
  the admittance rule that a heuristic must name its own failure, with the
  **squint ladder** as its test and the measuring document as its receipt.
- **`BRF-ADDRESS-CAP` landed.** The cap moved from occurrences to destinations;
  `MAX_REFS` → `MAX_ADDRESSES`; discovery no longer slices; and
  `deriveReferences` returns `{ map, truncated }` — the fact that unblocked the
  next item.
- **`BRF-BOUNDARY-MARK` landed.** The References receipt now ends in a bare `…`
  when the document holds more distinct destinations than the space holds, and a
  **truncated map is never suppressed** (ADR-047 amended in place).
- **`BRF-TABLE-GUTTER` rejected on evidence**, recorded as a Rejected brief.
- **Ref hygiene**: twelve non-main local branches → one, and three dead remote
  refs deleted.

## Problems

- **The "18% damaged at the default glass" headline was wrong, and I had landed
  it the day before.** `ADR-TABLE-EDGE-CUT-055` states the recoverability law and
  is older than the finding: below the cap a cut is recoverable by widening, and
  recoverable means admitted. The number was a measurement; the *reading* was a
  claim, and nobody had read the decision that owned the class.
- **Six detector defects in one probe, every one found by reading its output.**
  A header regex that required three segments while supplying one; `│` folded
  into the diagram class so table rows never counted; a trailing-newline artifact
  read as 515 blank lines; `⋮` read as a cut when it leads the *source-omitted*
  indicator on every fence; `art elided` matching this project's own prose *about*
  `art elided`; and a label that said *widening cannot repair* — `ADR-055`'s
  **irreducible**, a floor the **cap** cannot hold — about a **code fence**, which
  has no cap. The last one is the worst kind: a designation that lied about its
  referent, and only reading the named documents revealed it.
- **A green suite pinned a defect.** `cap: discovery stops at MAX_REFS` asserted
  that discovery stopped at the address count. It was passing, and it was wrong.
- **A ten-item review queue, all mine.** Four tasks and six review requests for
  one coherent sitting, plus a five-item epic cascade.
- **`feat/table-gutter` had been sitting 38 commits behind for three days**, and
  nothing in the gate had an opinion about it.

## Lessons Learned

1. **A stale branch hides a premise, not just numbers.** The gutter branch's
   figures were stale and irrelevant; its *premise* — "the separator is chrome" —
   was false, because the pipe is in the **header** only and the body separates
   columns with whitespace. Its own rationale ("the pipe still marks every
   boundary") was false of its implementation. Numbers are re-measurable; a
   premise is only re-read if somebody re-reads it, and a branch that drifts is
   never re-read. That is the real cost of a siding, and it is larger than the
   merge conflict.
2. **When a new finding touches an old area, read the decision that owns the
   area before believing the finding.** The recoverability rule, the loose-table
   design language, and the address space were all already decided. Four times
   today the existing record either demoted the new claim or supplied the term
   for it.
3. **The unit of review is the sitting, not the task.** One request at the end,
   subtasks closed by the same record. Submitting per task manufactures a queue
   while every gate stays green.
4. **A probe reading a corpus that documents the probe is reading itself.** This
   silo writes *about* its own mechanisms constantly, so an instrument's patterns
   must be anchored to the renderer's own output, and the exact test beats the
   clever one: neutralising the source's ellipses before rendering made
   provenance true **by construction**, where three attempts at context-matching
   leaked.
5. **A baseline that may only shrink is the right shape for an accepted defect.**
   Fourth use of the idiom here (`callsign`, `date`, `lexicon`, `elision`). It
   records the residue without blessing it and without nagging.

## Observations

- **Zoom-out is widening.** A host that shrinks the type buys columns, which is
  the same currency as the pane — so *the reader's lever is columns*, and it is
  the host's either way. Zoom dominates on every axis except resolution, which is
  why the binding bound is the **legibility gate** (`ADR-LEGIBILITY-GATE-049`) and
  not fit. Stated with the two floors named in the terms the repo already owns
  (the **word floor**, `ADR-055`) rather than by coining an artefact/glass pair —
  a fresh name for two old terms is what `lexicon-lint` exists to catch.
- **The two quantities are now separable in the record**, and they were not
  before: addresses lost to the *slice* (the defect) were 3 in one document; the
  destinations never realised at the *address cap* (intended, now marked) are 61
  across two.
- **`reg-sync`'s `statusWord` splits on the first space**, so `**Done (date)**`
  is unreadable and the row silently keeps its old status. It bit twice in one
  day; both times the lint's *unrecognised word* count was the tell, not the
  drift check. A status the registry cannot read is the same class as everything
  else in this debrief.
- **The `…` mark is plain, not muted** — a declared deviation, because no muted
  channel exists from a markdown source and one glyph does not deserve a new
  paint class.

## Metrics

- 15 commits, all fast-forwarded to `main` and pushed; working tree clean.
- Corpus: 515 → **517** tracked documents (the sitting added two).
- Tests: 729 → **740 pass, 0 fail**; `test()` calls 742.
- New files: 8 (4 scripts, 2 tests, 1 doc, 1 baseline JSON).
- Gates on `just check`: 10 → **12**.
- Branches beside `main`: 12 → **1** (declared).
- Review queue at its worst: 10. At the close: 0.

## The panel probe — four artifacts, one defect (21:00)

`&next.md`'s own header claims a format: *one line, one action — name, verdict,
cost*. The grammar probe tests that against the panel. Four instrument artifacts
had to be removed before the numbers meant anything, and each is the same lesson:
**check the pattern's referent before believing the count.**

| artifact | what it read | the fix |
|---|---|---|
| bold-lead bullets | `&alpha`'s glossary entries (`Gloam is…`) as action blocks | scope to the decision headings |
| one population | the landed list's missing costs as format failures | report **per section** — a landed cost is spent |
| an unnamed column | `&briefs`' empty 4th cell as an empty *cost* column | read the header: it was a **nameless debrief column** |
| parenthesised only | `BRF-SILO-MNEMONICS`, whose callsign is the entry's **name**, as unreferenced | a reference is anything lookable-up |

Scoped and corrected, the panel reads: **Recommended 11/11 referenced and costed,
Ready 3/3, Hygiene 2/2** — and the landed section 13/15 with one cost, correctly,
because history is not a decision and a spent cost is not owed.

**The defect the probe's first reading pointed at was not the one it named.** It
reported "three hygiene entries with no reference". Reading the referents showed
three **tombstones** sitting in a section headed *small, owed* — each one saying
*"see the landed list above"*, i.e. duplicating the landed list it pointed at. A
section headed **owed** holding paid debts is the *Attributable structure* failure:
the panel asks a question it does not answer. The two tombstones with landed
counterparts are gone; the third — the status vocabulary — is **paid**, so it moved
to the landed list as the settlement it now is.

**And the notes in the debrief above are the same failure at three more points:**
a test asserting `ready` is unknown (the vocabulary gap encoded as a contract), a
`reg-sync` vocabulary one word short of the corpus, and a Status line that was a
sentence — which held a landed rule at `open` for six weeks, reported loudly by the
gate and acted on by nobody.

## Related

- `docs/2026-10-12-the-squint-test.md` — the measurement, corrected in place
- `briefs/2026-09-14-brief-address-cap.md` — the cap, and its worst case corrected
- `briefs/2026-10-10-brief-boundary-mark.md` — the mark
- `briefs/2026-10-10-brief-table-gutter.md` — the rejection, and the rule
- `decisions/047-references-section.md` — the 2026-10-13 amendment
- `decisions/055-table-edge-cut.md` — the law that demoted this sitting's headline
- `scripts/ref-census.ts`, `scripts/elision-monotone.ts`, `scripts/okudagram-probe.ts`, `scripts/squint-probe.ts`
