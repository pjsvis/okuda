---
type: Debrief
callsign: DBF-COMPRESSION
date: 2026-10-14
tags: [process, archive, tables, record, gates]
agent: pi
environment: local
---

# Debrief: The compression — and the four gaps it exposed

One sitting, 15 commits, that began as a review nit on a table and ended by
compressing the briefs folder from 91 live documents to 71. The features are
not the interesting part. The interesting part is that **the sitting's real
product was four gaps in the silo's own record-keeping** — and that the
measurement discipline is what found them, while the *process* around the
record is what kept breaking.

## What landed

- **`tableSlots` exported** (`BRF-TABLE-SLOT-INSTRUMENT`) — the renderer's
  column layout, made observable. The brief's hypothesis was answered **NO**:
  no body cell overhangs its slot, there was never a drift, and the claimed
  measurement matched no table in the corpus. The instrument is the deliverable;
  the fix was a correction.
- **The grid, not the cell start.** A review nit (aligned columns) falsified the
  brief's own invariant: for centred/right columns the header's content start is
  *not* the body's, and must not be. The invariant is the shared slot grid.
- **`fff-search` declined** (`ADV-FFF-DECLINED`) — packaged state, dependencies,
  a targeted environment; the crate's value is a resident index a one-shot
  launcher cannot spend.
- **A real renderer defect found and filed**: alignment is mis-attributed across
  tables (Bun 1.4.0), reproduced in `Bun.markdown.html()` with no callbacks,
  filed as `oven-sh/bun#45175`.
- **`ADR-ARCHIVE-BREADTH-063` + the tier change** — a tier declares `settled`;
  briefs settle at `done` or `rejected`; `parked` stays live.
- **Two sweeps of the briefs folder** — 91 → 71 live, 73 archived, with
  `docs/2026-10-14-the-refused.md` as the index over the refused set.
- **`AGENTS.md` Rule 8** — stage explicitly, never blanket-add.

## The four gaps

**1. The gate had a blind spot, exactly where the defect was.** There was no
alignment instrument; `tables-check.ts` measures *fit*. The header/body question
had been filed by eye because the eye was the only instrument — and then the
instrument, once built, said the drift was not real. *A gate is only as good as
its coverage; the thing not measured is the thing that bites.*

**2. The archive could not hold a refusal.** The tier declared one
`defaultStatus` and used it for two jobs — what settles in, and what a settled
document may be. Refused briefs had nowhere to go, so they accumulated live. The
first fix proposed was *delete*, which the citation graph forbade: all fourteen
candidates are cited in live documents, ~35 sites. **Deleting is not archiving.**
Worse, `reg-sync` was *flattening every archived brief to `done`* because the
status vocabulary keyed on the registry name — so the archive could not even
record a refusal. The invariant was partly an artifact of a lookup.

**3. The record's linkage is broken.** Only **two** debriefs name their brief in
a field. Every other landing is invisible to any machine pass, so the compression
had to be done by grepping callsigns out of prose and verifying the tree by hand.
Of the six open briefs that *looked* landed, two were not
(`BRF-COMMISSION-BLANDINGS`: its own debrief says the commissioning is still
open; `BRF-PROLONGED-PRESS`: open child tasks). **Verify against the tree, not
the narrative.** This is the gap that made the sweep expensive, and it is the one
with a cheap fix — a `**Briefs:**` field, and a lint for it.

**4. My own process broke twice, the same way.** `git add -A` swept two operator
files into a commit. And I ran `just check` *after* fast-forwarding, chaining the
push with `;`, so two commit messages carry callsigns that do not resolve — a
decision cited by its **number alone** instead of by `ADR-ARCHIVE-RESOLUTION`,
and a brief cited by its **filename** instead of by `BRF-TABLE-LADDER` (the
filename is not the callsign). The lint caught both, in the unpushed range,
after the range was already pushed. **Check on the branch, before the ff, with
`&&`.** The rule is now in `AGENTS.md`; the residue is in history.

## The fifth thing, under the other four

**A conformance test pinned to a mutable corpus is a test that will break when
the corpus moves.** Two launcher tests pinned briefs that the sweeps archived —
twice, because the first repoint chose another brief. The fix chosen was a
*decision* callsign, which cannot move. The general shape: **a fixture must be
chosen for stability, not for convenience.** Three tests were rewritten for this;
none of them should have needed it.

## Lessons, stated so they can be tested

- **The instrument before the question.** Three wrong derivations preceded one
  true measurement in the *previous* sitting; this one answered its hypothesis
  NO and filed a real defect only because the instrument came first.
- **A missing measurement and a missing record are the same class of gap** —
  both are the silo unable to see its own state. The alignment instrument and the
  `Briefs:` field are the same fix at two layers.
- **Deleting is not archiving; a refusal is a decision.** The archive is where
  decisions live, and the citation graph is the oracle that says so
  (`ADR-DOCUMENT-LIFECYCLE-057`).
- **Verify against the tree, not the narrative.** Two of six "landed" briefs were
  not.
- **Choose fixtures that cannot move.** A brief archives; an ADR does not.

## Open, for the next sitting

1. **The `**Briefs:**` field + lint** — the cheapest fix with the largest effect;
   it turns the landing pass from manual to mechanical.
2. **Stable fixtures** — the three rewritten tests are a hint that conformance
   tests over a mutable corpus need a stability rule, or a lint.
3. **The two history residues** — rewrite the two commit messages
   (`--force-with-lease`) or leave them; the trees are fine, only the prose.
4. **~15 ADR-accepted briefs** whose implementation status is unverified
   (`BRF-GLYPH-LEAD`, `BRF-SRC-LINE-LEDGER`, `BRF-JUMP-LIST`, `BRF-CENSUS-MODE`,
   the perimeter family, …). Verify one at a time.
5. **The flag-table brief** — `BRF-CITTY-CLI` was superseded; its replacement
   has no home yet.
6. **The picture frame** is still five minutes of *looking*: Airplane Mode, read
   the firmware version.

## Continuity

The next sitting re-reads this debrief and `just orient`; nothing here is
carried in memory. The briefs registry is the work queue, the archive is the
record, and `docs/2026-10-14-the-refused.md` is the index over what was refused
and why.
