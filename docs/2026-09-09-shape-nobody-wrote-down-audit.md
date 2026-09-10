# The shape nobody wrote down — an audit of our process

**Date:** 2026-09-09
**Source article:** `docs/2026-09-08-unnecesary-abstractions-considered-harmful.md`
*(Bruno Baketarić, "The Shape Nobody Wrote Down", Medium 2026-09-05)*

## What the article claims

The "shape" of a system — the tacit judgment a senior carries about what
the parts are *for* and what has already been pushed against the
structure and didn't go in — is produced by **deciding**, not by
**reading**. Documentation is a by-product of deciding, never an input to
it. Remove the deciding (delegate to a second team, or to an agent) and
the supply of the shape dries up, no matter how much you document.

Two closing questions any process must answer:

1. Does the process stay open to signals that only arrive later?
2. Is there anybody still present who can act on them and pass them on?

The article's specific critiques, each load-bearing:

- An ADR captures reasoning *before* the decision met anything; the
  post-hoc revision is the valuable part, and by then the document has
  stopped being edited.
- Commit messages are thin on *why* precisely where the writer's
  understanding is thickest — the inverse of what a later reader needs.
- Version control preserves what someone chose to record; a dead end is
  the least likely thing to be committed. The record is incomplete in
  exactly the dimension that carries the rationale.
- The paragraph a senior carries is compression against a long sequence
  of outcomes; a summary is compression against a current query. Anything
  that has only ever answered a query has only ever performed the first.
- Presence (long-term memory) is not what generates the paragraph. An
  observer who did not decide accumulates a record — the artefact
  problem relocated, not solved.

## Where the article is right, and where I'd push

Strongest moves: the gap between expectation and outcome is information
nobody else can receive (a reader gets the result without the
expectation); the Mona Lisa overpainting analogy correctly distinguishes
*structural* preservation from *chosen* preservation; the
paragraph-vs-summary distinction cleanly separates a senior from a search
engine.

Two pushbacks, neither fatal:

- The Mona Lisa asymmetry is stated as structural law; in practice
  reflog, stash, and abandoned branches survive unchosen, so the "dead
  ends don't get committed" claim is empirical, not structural. The
  conclusion holds; the mechanism is slightly weaker than painted.
- The article treats "deciding" as monadic — you held the shape or you
  didn't. But Naur's own remedy, which it cites, is *co-deciding under
  guidance*: the newcomer makes small decisions, trips, asks, the answer
  sticks because it met a confusion they were holding. The gradient is
  *read < co-decide < decide*, not a cliff. This matters for our
  process, below.

## The two-question audit, run against our process

### Q1 — Does the process stay open to signals that only arrive later?

**Yes. The mechanism is visible and load-bearing.**

Nine ADRs carry non-trivial status lines, and they are not ceremony:

- `decisions/011` — *"Accepted (recorded retrospectively 2026-08-25;
  the flip landed unrecorded and was surfaced by the `DRACULA_PALETTE`
  rename)"*. A decision that happened before the ADR existed, recorded
  after the fact, with the surfacing event named. This is the post-hoc
  paragraph the article says ADRs can't carry.
- `decisions/004`, `007`, `008`, `016`, `024`, `025`, `032` —
  **amended**, with the amendment and date in the status line.
- `decisions/010` — *"Superseded (by ADR-022 — 2026-08-29; closure
  landed 2026-08-30, td-b81597)"*. The supersession carries the closure
  date *and* the td ticket. Late signal recorded at the point of
  re-closure.
- `decisions/023` — *"Aborted (2026-08-30)"*. A dead end, recorded as a
  dead end, not deleted.

The mechanism is codified: `playbooks/decisions-playbook.md` →
**Palimpsest Mitigation Protocol**, Step 3: *"If no ADR exists,
consider writing one briefly to capture why the approach was abandoned —
this is exactly the kind of context that vanishes over time."*

The frozen-record rule (`debriefs-playbook.md`: "frozen on completion,
never edited for content") is honored by *appending*, not by
*overwriting*. The resize-anchor debrief carries a **"Dogfood addendum
(2026-08-25, post-freeze)"** — a use case that "emerged in practice"
after the debrief was frozen, appended rather than smoothed in. The
document stopped being edited; it did not stop accumulating. That is the
correct answer to "the document has stopped being edited."

**Verdict: the process stays open. The status line and the addendum are
the late-signal carriers, and they are being used.**

### Q2 — Is there anybody still present who can act on them and pass them on?

**Yes, currently — and this is the load-bearing assumption, not a
settled fact.**

Evidence that the shape is held by a present decider:

- Debriefs are authored by the agent (`pi (ses_cd5d7b)`) but they record
  **"the operator's articulation"** and **"the operator proposed a
  calculation."** The human is the decider; the agent is the scribe.
- The debrief's method is human-in-the-loop: **"Dogfood catches boundary
  conditions the spec can't… build the feature → drag the width → the
  eye finds what the spec couldn't."** The *eye* is the human's. The
  boundary conditions (the eye boundary, the unbounded-search boundary)
  surfaced only when a human dragged a terminal. No amount of the agent
  reading `tui.ts` would have found them — the article's exact claim,
  confirmed by our own record.
- ADR-011's "surfaced by the rename" — the human surfaced it; the agent
  recorded it.

The gradient the article warns about — *"an observer who did not decide
accumulates a record"* — is the failure mode to watch, not the current
state. Our process holds because the human forms the expectation and
meets the outcome. The moment that inverts (the human rubber-stamps
agent decisions), three things go silent simultaneously and for one
reason:

- The status lines stop carrying amendments (nothing to amend — the
  agent's expectation met its own outcome, zero discrepancy).
- The debriefs stop recording discrepancies ("met the letter, missed
  the spirit" requires a spirit the agent didn't hold).
- The briefs stop recording failures ("An abort with a recorded
  gate-failure is a successful experiment" requires gates the human
  designed).

The documents won't degrade. They'll go quiet in the dimension that
carries the shape.

**Verdict: the operator is present and is the decider. The risk is not
current; it is the gradient.**

## Where our process already counters the article's critiques

| Article's critique | Our counter (with evidence) |
|---|---|
| An ADR captures reasoning *before* the decision met anything; the post-hoc is the valuable part | ADR-011 "recorded retrospectively"; status-line amendments on 7 ADRs; debrief addenda. The post-hoc is carried in the status field and in appendenda, not omitted. |
| Commit messages are thin on *why* precisely where the writer's understanding is thickest | Debriefs invert this: the discrepancy ("met the letter, missed the spirit") is the spine, not the omission. The *why* is the load-bearing content. |
| The revisions that carried the most reasoning were mostly never committed | `briefs/2026-08-29-brief-fzf-owns-the-loop.md` — an aborted experiment, committed as aborted, with "The analysis below stands — spawn-per-round structurally cannot preserve the cursor." ADR-023 marked Aborted. Dead ends are first-class records. |
| A dead end is the least likely thing to be recorded | Our process *explicitly* records dead ends: aborted briefs, ADR-023, "the road not taken" sections in debriefs with the rejection reason. This is the deliberate remedy, and it is firing. |
| Explicit statement does not substitute, because what fails to transmit is not a set of statements | Agreed and uncontested. The documents are by-products; they transmit because the decider is present (Q2), not because the statements are complete. |

## The one thing we should not assume we've solved

The article's deepest point is not about documentation quality. It is
that the shape is produced by **deciding**, and our process is a
*by-product system* — it works iff the deciding is done by someone who
holds the shape. The evidence shows the operator is that someone *today*.
The audit confirms the mechanism is firing. It does **not** confirm the
mechanism is self-sustaining.

The two questions are not answered once; they are answered
*continuously*, and the answer to Q2 can flip from "yes" to "no" without
any document changing — only by the human stepping back from deciding.

The operational tests are already in our lexicon: muppet-exclusion (the
admission gate) and the moat question ("can you name your secrets?"). If
the operator can still name the standing invariants — "spawn-per-round
structurally cannot preserve the cursor; only fzf-owns-the-loop can" —
the shape is held. The day that sentence has to be re-derived from the
records instead of spoken from memory, the process has become the
article's case study.

## Opinion, compressed

The article is right, it is well-argued, and it is the rare case where
"relevant to our process" means *it is describing the load-bearing
assumption of our process and the precise way it fails*. It does not
refute the Edinburgh Protocol or the okuda knowledge system — both are
by-product systems and work fine *as long as the human is the decider*.
It does refute the comfortable version where the agent decides and the
docs transmit. The line to hold: the human forms the expectation and
meets the outcome; the agent is the steam engine, not James Watt. The
moment that inverts, every document downstream is decorated Stuff, and no
quantity of it closes the gap — because the gap was the shape, and the
shape went with the deciding.

## Related

- Source article: `docs/2026-09-08-unnecesary-abstractions-considered-harmful.md`
- Palimpsest protocol: `playbooks/decisions-playbook.md`
- Debrief discipline: `playbooks/debriefs-playbook.md`
- Evidence specimens:
  - `decisions/011-default-palette-okuda-identity.md` (retrospective ADR)
  - `decisions/022-right-anchored-role-layout.md` (supersession with closure date)
  - `decisions/023-tty-active-input-reader.md` (aborted, recorded)
  - `debriefs/2026-08-26-debrief-resize-anchor-boundary-conditions.md` (discrepancy as spine)
  - `briefs/2026-08-29-brief-fzf-owns-the-loop.md` (aborted experiment, standing invariant)
