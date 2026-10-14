---
type: Debrief
callsign: DBF-PRUNE-BATCH-5
date: 2026-10-08
briefs: [BRF-DOCUMENT-LIFECYCLE]
---

# Debrief: Prune batch 5 — the reading, and the thing that was noticed but not carried

**Date:** 2026-10-08
**Status:** Done
**Briefs:** `BRF-DOCUMENT-LIFECYCLE` (Phase 4)
**ADR:** `ADR-DOCUMENT-LIFECYCLE-057`
**Commit:** `4d5efb2`

## What happened

Two deletions, and the first batch where no mechanical test decided. The held
fragments `docs/2026-08-29-from-intent-to-task-01.md` and `-03.md` — the last of
the `from-intent-to-task` pile — retire as **imported Stuff**.

```
deleted: docs/2026-08-29-from-intent-to-task-01.md
deleted: docs/2026-08-29-from-intent-to-task-03.md
disposition: IMPORTED-STUFF — the design is the one the system BUILT, and its
             warrant is carried by addressed Things. Not duplicates; not
             keep-class.
```

## Not duplicates, and not independent either

The similarity claim reproduced: max pair overlap **0.4216–0.4313** Jaccard
(tokenizer-dependent; the 0.427 estimate sits between), no containment either
way. But min-normalised overlap is **0.71**, and the reviewer named what that is:
the five-stage pipeline diagram, the Accidental Typist sales paragraph, the
Janeway section, and the workflow table are near-verbatim shared. So the record
says **not duplicates by the containment standard, and not independent** — a
later census must not read the 43% as "unrelated".

## The citations, corrected

Two of the three claimed carriers hold; one was mis-cited and the reviewing hand
fixed it.

- `docs/2026-08-20-origin-doc.md:330` — *"**The Human (The Tiller):** Supplies the
  domain context, sets strategic intent"* (the earlier note said :331; 331 is the
  Agent/Mainsheet line). Content ✓, citation off by one.
- `docs/2026-08-20-origin-doc.md:444` — *"the left pane is the comms channel
  where you direct intent, and the right pane is the real-time sensor readout"*
  (the frame). ✓
- `docs/2026-08-29-tfs-exclusion-principle.md:59` — **not a carrier for this
  design.** Its "Janeway Command" is the *viewport assertion* (`on screen... [
  now ]` — summon the target to glass). The drafts' Janeway material is a
  different claim: retained root access / the away mission (95% delegation, 5%
  hands-on intervention). Same name, different design.

## Noticed-but-uncarried — the honest name

The reviewer grepped the kept corpus for the substance of the away-mission
design (`root access | root privileges | step down to | machine room | 95% | away
mission`) and for the pre-intent elicitation pattern (`"Tuvok, options?"`). Both
match **only the two deleted files**. The kept siblings carry "telemetry plane"
(`-05`) and "Jimmy" (`-05`, `-06`); these two do not.

That does not flip the verdict, because the **practice is live** — the operator's
by-hand interventions at the glass, and the elicit-before-deciding pattern that
produced this very review. The framing retires; the thing continues.

But the policy's wording is *"only the never-noticed is disposable"*, and these
are better named **noticed-but-uncarried**. The record says so rather than
letting full carriage be claimed. This is the reading batch 4 demanded, recorded.

> **The doctrine: the trichotomy built / refused / never-noticed has no class for
> "the design here was BUILT."** Retireability here rests on the **derivative**
> ground — warrant carried by addressed Things — not on the never-noticed ground,
> which fails. Recorded so the next prune does not file "built" under
> "disposable".

## The story, refused

The unique residue is the **Accidental Typist** narrative. It is a story, not
warrant, and the tell is the silo's own method (*"cite or mark"*):

- the one quantitative claim — *"We spend 80% of our cognitive bandwidth"* — has
  no source, and the only other 80% in the silo is an unrelated figure in
  `docs/2026-09-15-the-bureaucracy-trap.md`;
- its cast (`Georgie Wyse`, `tarsome`, `typist`, `switchboard`) appears nowhere
  else in the repository — orphaned ornament, the CSN signature;
- it records no refusal and no reversal, so it is not keep-class. Rhetoric is not
  a disposition.

It was **not extracted**. The named target was
`docs/2026-10-06-the-shared-artifact.md`, but the operator's call — *"we can
always rewrite a blog post"* — is that the prose is reproducible and needs no
archive. Extract-then-delete was considered and waived, not skipped.

## What the two-hander produced

Fourth batch, fourth correction in the *reading*, never the artifact:

1. The **off-by-one citation** and the **Janeway conflation** — same name,
   different design. Caught by reading the carrier, not the token.
2. The **noticed-but-uncarried** name — the record would otherwise have claimed
   full carriage for a design no kept document states.
3. The **0.71 overlap** — "not duplicates" was true but incomplete, and the
   completed sentence is the one that survives.

## What is next

- The `from-intent-to-task` pile is down to `-05` (cited, untouched) and `-06`
  (keep-class extension: considered-and-not-adopted). The family references
  (`ADR-038:158`, `the-scaling-profile:78`, the callsign brief `:219/:323`) are
  now **historical counts**, not current ones — a future census should not read
  them as the live tree.
- The 232 prose walls remain, and the `repo-sovereignty` hold is resolved.
- Standing doctrine candidates: *built* as a missing class; *noticed-but-uncarried*
  as the honest sub-case.

## Addendum (2026-10-08, on peer review)

The standing candidates above are **settled, not standing**: `ADR-DOCUMENT-LIFECYCLE-057`
now carries the completed dispositions table and the *built* class, and the
*noticed-but-uncarried* line, in its 2026-10-08 amendment (`8448cdc`), hardened the
same day on review (`ea96fb6`) so that the fourth line's test — *is the practice
live?* — is met by **naming an instance in the record**, never by the pruner's
confidence. This batch met it that way: the elicit-before-deciding pattern was
evidenced by the review request that produced the finding.

**The count is historical; the behaviour is not.** A read of the surviving two
would treat the first bullet above too broadly. I ran the mechanism: on `docs/`
registration, `bootstrapCallsign` maps **both** `-05` and `-06` to
`DOC-INTENT-TASK`, and `avoidingCollisions` hands the second `DOC-INTENT-TASK-2` —
so `the-scaling-profile:78` and the callsign brief `:219/:323` remain **valid
demonstrations** of the collapse, and must not be "fixed" away. Only
`ADR-038:158`'s inspection detail is purely historical.

**The one load-bearing fact, for the next registration — not an annotation.**
`-05` is *cited* and `-06` is *keep-class*: two documents with two dispositions,
**not a sequence**. If `docs/` registration runs on them, the mechanism above
papers the pile over with a collision suffix — precisely what `ADR-038`'s Note
exists to forbid ("No document may end in `-NN` for any reason but being part
N"). `ADR-038`'s *fix or grandfather* question is therefore **still owed** for
these two. The count never was.

## Related

- `ADR-DOCUMENT-LIFECYCLE-057` — the policy, and the keep-class
- `playbooks/registry-playbook.md` — the lifecycle checklist and both word rules
- `DBF-PRUNE-BATCH-3` — containment, and reading for the reversal
- `DBF-PRUNE-BATCH-4` — the batch that deleted nothing, and the reading it demanded
