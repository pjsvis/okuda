---
date: 2026-10-19
kind: discussion — over-completeness as a checksum, the registry as its syndrome, and the band where intent lives
lineage: the operator, 2026-10-19, reading the prose corpus — *"over-completeness can work as a Shannon style checksum"*, *"the registry maintenance is a useful entropy indicator"*, *"there must be some sort of mechanical checksum style process available to go wrong or be truncated"*, *"the presence of the checksum provides a trigger for the consistency check process"*. The thesis is the operator's; the correction and the roster are this document's.
status: discussion — position stated, applied to one worked instance, and one edge left open
---

# The checksum is the constraint

> ◆ The operator's thesis is right and one amendment away from being usable:
> **redundancy is not a checksum — the constraint is.** A second copy is a
> checksum only where an invariant relates it to the first, so that an error
> leaves a non-zero syndrome. Everything else follows from that: a registry is a
> syndrome rather than a thermometer, detection is not arbitration, and a check
> that cannot go wrong is not yet a check. The silo already runs **18** mechanical
> gates in `just check`, and every one of them is a constraint of exactly this
> shape.

## The claim

Over-completeness can serve as a checksum. If a document set says the same thing
in more than one place, then an edit that breaks one copy breaks the agreement
between them, and the disagreement is the signal. The value is not that the
redundant copy is read — it is that the redundant copy **can disagree**, and that
the possibility of disagreement is what gives a consistency pass something to
fire on.

The registry is the same argument at corpus scale. A JSONL index that lists every
document in a tier is a second, cheap statement of the same fact the directory
makes. Maintain it and you have a standing inconsistency detector: the corpus
grows, the index does not, and the delta is an entropy reading.

The lesson taken is that the mechanical artifact must exist, must be able to be
wrong, and must be able to be truncated — because a checksum that cannot fail is
indistinguishable from a checksum that has nothing to check.

## The correction — redundancy is not the checksum, the constraint is

A CRC works for a reason the analogy usually skips. The redundant bits are a
**known function** of the data, so the receiver recomputes and compares; an error
produces a non-zero syndrome, and the polynomial's structure localises it. Two
copies of a paragraph have none of that. They will disagree, and you will not know
which one is lying, because nothing relates them but the coincidence that someone
wrote both.

So the admission test for any redundant artifact is one question:

> **Can one copy be computed from the other, and can the invariant between them be
> stated?**

Where the answer is yes, the copy is a checksum and costs nothing to keep true —
it is regenerable, and the test is idempotence (regenerate, then diff). Where the
answer is no, it is a second authored surface, and its maintenance cost is a
permanent tax with no syndrome attached.

Okuda's registry is the good case. `scripts/reg-sync.ts:3-12` detects drift between
a tier directory and its JSONL index, exits 1 on any, and repairs under `--fix`.
The index is derived, so the invariant is stated in code, so the check is free.

The other silo's version fields are the bad case, and they are clean evidence
because they are otherwise identical: **231** contracts in the prose corpus carry a
`version:`, **220** of them say `0.15.0`, one says `0.5.0`, and nothing governs the
field — `.version-bump.json` covers the skill and plugin envelopes only. That is
over-completeness with no invariant, so it is not a checksum; it is 231 claims
resolving to nothing.

## A registry is a syndrome, not a thermometer

A consistent registry means *no detectable error of the class this index covers*.
It does not mean the tier is healthy, and it says nothing about the documents'
truth. The registry sees the corpus outgrowing its map; it cannot see a document
that is indexed, cited, resolves cleanly, and is wrong.

Which makes coverage part of the artifact. A gate that states its limit is not a
false signal; only a silent one is. `scripts/date-lint.ts:1-20` is the model: it
names what it gates (filename against declared date), what it merely reports (an
undated `docs/` document is UNCORROBORATED), and why the second half is not yet
gated — the registry that would corroborate it does not exist.

The statuses in `scripts/reg-sync.ts:30-40` are worth naming separately, because
they are the part a naive census gets wrong: `settled`, `parked`, `archive`. A
document in a terminal state is not drift, and the distinction between finished
and refused is what keeps the census readable. `docs/ideas.md` carries the same
insight as `open` / `promoted: <callsign>` / `refused: <why>`.

## What over-completeness actually buys

Shannon's result is a trade, not a free lunch: reliability bought with redundancy,
at a cost in rate. The document version: detection bought with maintenance, at a
cost in **every future change**. Each new document must now be reflected in N
places.

So the efficient point is not maximal completeness. It is:

> **The minimum redundancy that produces a syndrome over the invariants you
> actually care about.**

Which makes placement the whole design decision, and it sorts into two kinds:

| redundancy | cost | test | verdict |
|---|---|---|---|
| **derived** (index, census, frontmatter lifted from the file) | free to keep true | regenerate, diff, idempotence | a checksum |
| **authored** (a second description of the same mechanism) | a tax on every change | none — no invariant relates the copies | drift with extra steps |

Repairability is the second half of placement, and the half usually skipped. A
checksum whose failure is expensive gets suppressed by the person running it; one
whose failure is a one-line repair gets used. `reg-sync --fix` is what makes
`reg-sync --all` survive. That is also why `just check` runs the detector and
never the repair: the gate reports, the operator fixes, in that order.

## Detection is not arbitration

Derived copies can **detect**. They cannot arbitrate, because they are computed
from the same source, so a disagreement tells you *where* and never *who*. That is
sufficient, provided the failure names the place (`file:line`).

Correction needs something the derivation cannot supply: an independent witness.
In this silo that is the argument — the brief's acceptance criteria, the ADR's
reason, the debrief's residue. So the two purchases are distinct, and the design
rule falls out:

- **Detection** wants derived redundancy and a stated invariant.
- **Correction** wants an independent source.

Over-completeness buys the first cheaply and the second not at all. A census can
never replace a decision, and a registry cannot tell you whether the document it
indexes still says something worth saying.

## The control — what a mechanical check owes

The operator's fourth sentence is the one that does the work, and it is not yet in
the discipline: *the checksum must be able to go wrong.* Over-completeness supplies
the lever; only a **known-bad input** proves the lever is connected. This is the
house disposition — a detector needs a control, and the control must pass first —
applied to gates rather than to probes.

So every mechanical check owes four things:

1. **Coverage** — what class of error it sees, and what it does not.
2. **A fixture that makes it fail** — truncate the index, delete an entry, move the
   file, and confirm the exit code.
3. **A repair** — one command, or the failure is a nag.
4. **A last-fired date** — a gate that has never fired, with no fixture, is
   unproven decoration.

`scripts/idea-lint.ts:1-20` is the closest existing model and it is already
test-bearing: entries must name their trigger, the screen prints the promotion
ratio, and the decision names its own falsifier (a ledger whose lines grow while
its promotions do not is a graveyard, and is to be deleted rather than curated).

## The band — ideas, intentions, promises

Reading the corpus against this thesis exposes a gap that is not about checksums
and is worth the same discussion.

`docs/ideas.md` holds *wouldn't it be interesting if*, and demands a trigger. A
brief holds *we will*, and demands acceptance criteria. Between them sits the
band where most of the silo's trouble actually lives: **we intend to** — a
direction, chosen, not yet a promise, not yet an idea.

That band has no container, so it accumulates in conversation, and the silo's own
history says what happens next: too much unrealised intent, and nobody able to say
which vector was next. The register that would hold it is the idea ledger
generalised, with two fields it does not currently ask for:

- **owner** — whose intention it is, because an unowned intention is a topic.
- **review date** — when it must be re-affirmed, converted, or refused.

Test-bearing applies to intentions exactly as it applies to ideas and heuristics:
an intention that cannot name the observation that would cancel it is a slogan
with a ticket number. With one, it can be refused on evidence — and refusal is the
operation that keeps a register small enough to read at the top of a session.

## Worked instance — the other silo's over-completeness

The prose repository is the negative case, and it is instructive because its
intent discipline is genuinely good: its own gap list is tight, dated, and names
what would close each item.

Its checksum layer is where it fails, on all three clauses at once:
three authored descriptions of one language (README, `spec/`, `skills/`), no
invariant relating them, and a gate whose perimeter is one of the three
(`tests/open-prose/stale-docs/stale-docs.test.ts:40` scans `skills/open-prose`
only). So the redundancy costs maintenance and returns no syndrome. Measured
consequence: `prose/spec/01-Language.md:295` retires `prose wire` while
`prose/packages/std/ops/wire.prose.md` ships it; `prose/spec/02-Harness.md:22`
declares `ContinuousOutcomes.md` out of scope, and no such file exists in `spec/`;
and `prose/spec/01-Language.md:240` states a skill version two releases stale.

The remedy there is not less duplication. It is to constrain the duplication that
is already there: one canonical description, the others derived or gated to agree —
which is the same weekend's work, now with a reason rather than a preference.

For contrast, the silo's own referents are in better order than its vocabulary:
**449** markdown files scanned for relative links, **128** links, **0** dead. The
looseness is not in the links. It is in the claims that nobody re-measures.

## Open edges

- **The semantic residue.** No checksum in this document sees a claim whose
  references all resolve and whose content has gone stale. That class has one
  instrument — a reading pass — and it does not scale, which is why it is a
  rotation off the citation census rather than a gate. Naming it matters: a roster
  of checks that does not state this gap reads as full coverage.
- **Coverage needs its own control.** The coverage declaration is authored prose.
  Nothing yet verifies that a gate's stated limit is the limit it enforces, which
  makes the declaration a claim of the same class the gate exists to catch.
- **The band's first container.** Whether the intention register is a new file, a
  promoted status in `docs/ideas.md`, or a section on the board is a decision not
  taken here. The fields are the argument; the container is the next question.

## References

- The registry as a derived checksum — `scripts/reg-sync.ts:3-40`, `playbooks/registry-playbook.md`
- The idea ledger as the existing cheap container — `docs/ideas.md`, `scripts/idea-lint.ts:1-20`, `ADR-IDEA-LEDGER-064`
- Coverage declared, not implied — `scripts/date-lint.ts:1-20`
- The citation as an audit surface — `ADR-DOCUMENT-LIFECYCLE-057`
- Misleading confidently, the failure this is aimed at — `decisions/027-temperament-is-downstream-of-discipline.md`
- The seam, for the crossing into the other silo — `docs/2026-10-10-the-seam.md`
- The other silo, referenced by name and not linked — `prose` (`spec/01-Language.md`, `spec/02-Harness.md`, `packages/std/ops/`, `tests/open-prose/stale-docs/`)
