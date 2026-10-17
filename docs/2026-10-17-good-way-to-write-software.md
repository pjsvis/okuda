---
date: 2026-10-17
kind: essay — a two-part question, an entity audit, and what this silo actually does as an answer
lineage: The operator's four lines (kept below nearly verbatim) came out of a review of a Matt Pocock interview; an Argon draft elaborated them on 2026-10-17. **This version keeps the frame and replaces the elaboration**, because the draft described the genre rather than this repository — it cited no file, named the project by a designation the living surface no longer carries, and proposed a harness of mutation tests and browser scripts that this silo does not have and does not want. Every claim below that touches the process carries a path; the reading of the gate taxonomy is the agent's and is marked.
status: recorded — the frame is offered, the receipts are checkable, and the argument is open to correction by either
---

# What is a good way to write software

The operator's question, in the operator's words:

- The question becomes: **what is a good way to write software?**
- And the nuance becomes: **how can a particular entity, with known capabilities,
  leverage those capabilities to enhance the software production process?**
- There is a lot of prior art on the first question.
- And your job is to figure out the answer to the second.

Two questions, and they are genuinely separate. Fifty years of answers exist to
the first. Nothing exists to the second, because until recently there was only one
kind of entity.

## Why the split matters

The industry's confusion of the last two years is mostly the collapse of the two
questions into one. If you believe the arrival of the agent invalidated the answer
to question one, you delete the prior art and reach for vibes. If you believe it
did not, you have a discipline to keep and a *new* question to answer — the one
that has no literature.

◆ The second question is the interesting one, and it is not about the agent. It
is about the **division of labour between a probabilistic writer and a
persistent record** — and a record is a noun, not a person.

## The prior art, and which prior art

The canon is real and brief to state: complexity is the enemy
(Parnas, *information hiding*); accidental and essential costs must be told
apart (Brooks, *No Silver Bullet*); the language must be one language from the
intent to the identifier (Evans); a change must be proved by something cheaper
than a reader (Beck, Farley). Good software is *the management of complexity
over time* — true regardless of who or what types the characters.

But a prior-art list is not prior art. **This silo keeps its own**, and that is
the mechanism, not a filing habit:

- `conceptual-lexicon.md` — the terms this silo speaks, append-only. A term
  resolves here or it is not a term.
- `docs/2026-10-08-prior-art-the-ai-markdown-wave.md` — a register, one entry
  per sighting, each entry stating its substrate and which of our exclusions it
  sells. Yesterday's entry was a competitor probed rather than read
  (`docs/2026-10-17-not-worth-the-candle.md`).
- `decisions/` — the record of each choice, the alternatives refused, and why.
- `briefs/` — the question written down before the code is written, per
  `AGENTS.md`: *"Brief before build."*

The difference from a reading list is that these are **cited under a gate**. A
claim in a living document carries a `file:line` or is marked *proposal*
(`AGENTS.md`, Base Epistemic Attitude, clause 1). A claim carrying neither is an
unpaid claim, and the house name for it is the barnacle.

## The audit: three participants, not two

The draft's audit had two columns, the Human and the LLM. That is the shape the
question invites and it is wrong, because it leaves out the thing that makes the
process work. This silo's loop is three-cornered: **the operator, the agent, and
the record** — and the record is where the failures go to die.

| | **The operator** | **The agent** | **The record** |
| :--- | :--- | :--- | :--- |
| **Holds** | Intent, taste, the actual *why*; what it is like to read the output | Recall of the training distribution; speed at mechanical transformation | What was decided, why, and what it cost |
| **Strength** | Judgement under ambiguity; noticing rot before it is a bug | Near-zero marginal cost on plumbing; tireless at exhaustive revision | Does not forget, does not flatter, does not drift toward the mean |
| **Failure mode** | Fatigue; will skip the test *because it is a chore* | Optimises the prompt, not the system; invents a plausible answer where state is implicit; reproduces the modal case of its training frame regardless of the boundary conditions | Staleness. A record that is wrong and confident is worse than no record |
| **What covers it** | The brief — written before code, so intent is checkable | The gate — cheap, mechanical, and it does not care how the agent feels | `just orient` — the record is re-read at the top of every session, never recalled |

Two of those rows are worth stating plainly.

**The agent's failure mode is not hallucination, it is the mean.** The prior is
the average over the training frame, and it is applied whatever the boundary
conditions are — the house term is *frame defaulting*
(`AGENTS.md`, Lexicon). Your problem is not in the mean, so the first answer is
always somebody else's answer. The remedy is a **frame declaration**: state the
deviations from the default, so that the derivation has somewhere to check
itself.

**The record's failure mode is not forgetting, it is misleading confidently.**
That is why the house does not carry a private memory store.
*Continuity is re-reading, not recall* — what persists is what is written where
the silo can see it, and re-read at the top of one. The repository is the
memory; `just orient` is the recall (`AGENTS.md`, clause 3;
`decisions/027-temperament-is-downstream-of-discipline.md`).

◆ You do not make the agent remember. You make the record rereadable.

## The synthesis: what actually happens here

The draft proposed four leverage points. Three were roughly right in direction
and unhelpfully abstract; one was describing a tool this project does not have.
Here is the same ground with receipts.

### Prior art is read, not plundered

The draft says the agent has "ingested the entire history of open-source
software" and should be used to plunder it. The first half is an unpaid claim
about a training set nobody can inspect, and the second half is exactly the
behaviour that produces frame defaulting.

What happens instead: an external claim is **brought in and cited**, not
recalled. The prior-art register exists so that the next tool is compared
against a written baseline rather than a memory; the entry states what was
observed, on what date, and the rest is marked unverified. When this week's
review needed the competitor's task grammar, the grammar was read out of a
binary and attributed to a line number, not remembered
(`docs/2026-10-17-not-worth-the-candle.md`).

### De-risking is a protocol, not a vibe

"Socratic de-risking" describes a thing we already have written down better.
`docs/2026-10-14-flight-deck-checklist.md` is a triage matrix over *determinism*
and *blast radius*: Tier 0 is deterministic and the human is **forbidden** from
being asked to verify what a parser can prove; Tier 2 halts before implementation
and emits a spec manifest; Tier 3 is a hard pause with a **Justify Engine**
readback — a parameter, not a yes/no, because a rubber stamp is not a constraint.
Interrogation skills are the Tier 2 instrument, and they are not the whole method.

### The inversion, named honestly

Anders Hejlsberg's remark — as the Argon draft quotes it, *"Sometimes,
rather than asking your AI to do the job, it is better to ask your AI to write a
program to do the job"* — is good advice, and the draft's best idea. *As
reported:* the quotation was not checked against the interview it came from,
which is the mark the house requires and the draft did not supply. Two
corrections follow.

**It is a practice, not a principle, and not his.** Naming it a Principle
attributes an origin that does not exist, which is precisely the veto this silo
already carries: a designation must not lie about its referent
(`docs/2026-08-30-naming-like-nasa.md`, the LEM → LM ruling). Call it the
inversion; keep the attribution as a quotation.

**And the harness it produces here is not the one the draft imagined.** No
mutation tests, no property-based framework, no headless browser — the subject is
a TUI over a markdown corpus. What okuda has is **18 gates in `just check` over
686 tracked files and 547 documents** — a corpus larger than the code it ships —
plus **43 test files**. Every count in this section is the run of 2026-10-17 and
is re-derivable by running the gate; the instrument is named because the number
will drift and the gate will not. Derived from the gates'
own headers, they fall into three kinds, and the distinction is the actual
engineering:

| Kind | Rule | Example |
| :--- | :--- | :--- |
| **Gate** | Fails the build on a defect | `callsign-lint` — a citation that resolves nowhere |
| **Ratchet** | A baseline count; at it passes, over it fails, under it reports | `date-lint` (*"at-count passes, over-count fails, under-count says so"*), `elision-monotone`, `citation-census` |
| **Meter** | Always exits 0; reports for a human to judge | `prose-check` (*"a METER, not a gate"*) — paragraph height, because a threshold there is editorial |

◆ That taxonomy is the answer to "what does the agent build to trap itself" —
and it is mostly **epistemic, not executable**. The gates police *claims*, not
behaviour: 213 declared callsigns against 289 registered, 0 demotion candidates;
0 prose leaks across 440 files. A deterministic harness that only ran tests would
leave the entire knowledge base unpoliced, and the knowledge base is where this
project's failures actually live.

### Execution is bounded by the record, not by the prompt

There is no "let the entity loose in a sandbox" step. There is: a brief, a
branch, one logical change per commit, `just check` green, a recorded review
(`AGENTS.md`, rules 2–5; `decisions/060-docs-direct-code-pr.md`). The constraint
is not a clever prompt — it is that the next session can only act on what was
written down, so anything unwritten is gone by morning. That is a stronger leash
than any system prompt, and it is why the discipline is legible from the outside:
you can read the record and see the reasoning.

## What the draft got wrong, and why it read as fluent

Worth recording, because the failure is instructive and it is not a fact error.

The draft is a competent essay about the industry wearing this project's date. It
names no file. It reports capabilities in adjectives where a spec belongs, and
offers "95% of the tax" where this silo has a number it *already distrusts* —
*"variance compresses 42%, 22/24 models deployable"*, marked in place as
*"uncited figure — mark as impression until the eval is cited"*
(`docs/2026-09-14-proposed-conceptual-lexicon.md:34`). Our own figure is
quarantined and theirs is not; that is the whole difference between the two
documents.

It also argues against "massive markdown prompts" in its first paragraph and
arrives in a batch of them: two sibling drafts delivered the same day
(`docs/2026-10-17-core-architectural-heuristics.md`,
`docs/2026-10-17-hejlsberg-inversion-principle.md`, both untracked when this was
written) open with `# MASTER CONTEXT MODULE`. A rule not enforced where it counts
is a preference.

And the frame-defaulting tell is the strongest evidence for the thesis the draft
was reaching for: the prior — Brooks, Parnas, Evans, Ousterhout plus the current
discourse — was applied without the boundary conditions. The boundary conditions
were: a markdown viewer, a single operator, no browser, no database, and a
knowledge base larger than the code. None of them appear. Fluency is what the
mean sounds like.

## Verdict

The answer to the first question is that good software is the management of
complexity over time, and it is not new. The answer to the second is narrower
than the industry wants to hear:

◆ **The agent does not make rigorous engineering possible. It makes the *record*
the cheapest place to put the rigour — and then the rigour survives the context
window.**

Not enhancement: normalisation. The ceiling stays where it was. What rises is the
floor, and the floor rises because the discipline that used to live in a senior
engineer's head has somewhere to live that does not forget — and because a gate
does not care how tired anyone is.
