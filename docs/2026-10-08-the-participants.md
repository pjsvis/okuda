---
date: 2026-10-08
kind: discussion — distributed cognition read against the silo's own process, prompted by the operator's observation that the method manages a project by expressing intent and monitoring the results
lineage: the operator's two turns, 2026-10-08 — *"it is coming to seem that our process is good for managing a project by expressing intent and monitoring the results of the implementation"*, and *"the participants of a silo include humans and agents; I could create the brief and delegate it to a colleague who will use an agent to implement and debrief"*
status: open — a question to nail down, eventually; a discussion, not a plan
---

# The silo's participants — humans, agents, and the roles between them

> The unit of analysis leaves the skull. The silo is a cognitive system whose
> shared representation is the corpus and whose participants are of two kinds.
> The question this discussion opens is not whether that is true — the corpus
> already assumes it — but what follows for how a brief, a debrief and a review
> are written.

## The occasion

The operator observed that the method manages a project by **expressing intent
and monitoring the results of the implementation** — the distributed-cognition
idea, with the brief as the instruction to a worker. Then sharpened it: the
participants of a silo include **humans and agents**, and the common case may be
a chain — *I write the brief, hand it to a colleague, who uses an agent to
implement it and debrief.*

That second turn is the important one. It is also the half the first framing
leaves out.

## What it confirms

The frame is not new here, and it is not speculative. `docs/cognition-in-the-wild.md`
carries Hutchins's claim that a system has cognitive properties different from
those of the individuals inside it; `docs/2026-08-20-origin-doc.md` cites
externalised cognitive scaffolding by name; and `docs/2026-10-06-the-shared-artifact.md`
states the operating clause the whole process rests on:

> **Nothing that is only remembered exists.**

The coordination medium is the corpus, not a conversation. That is the strict
Hutchins reading: the shared representation carries the coordination, and the
participants read the same thing. So the useful move is not to adopt the frame.
It is to work out where it is exact and where the vocabulary misleads.

## The frame that misleads — the three asymmetries

*Manager and employees* gets the intent axis right and the social axis wrong.
An employee and an agent are not interchangeable, and the differences are not
details:

| | memory | accountability | ambiguity |
|---|---|---|---|
| **human** | persists; carries tone, history, the thing we agreed not to do | standing; answerable; can refuse or escalate | asks, or decides and defends it |
| **agent** | none between sessions | none | invents (CSN) or fails silently |

The consequences are immediate. Because the agent has no memory, **the brief
must carry what a human organisation carries socially** — the employee analogy
makes you under-specify. Because it has no accountability, a handoff is not
delegation in any legal sense; it is execution with nobody answerable but the
person who directed it. And because it cannot ask, the process's real content is
not intent-expression but **falsification** — gates, citations, independent
review, the second reader that found a correction in every one of four prune
batches.

## The better description

Not manager and employees. A **principal with a standing of amnesiac, tireless
contractors, plus a compliance and audit function.** The artefacts map to
institutions, not an org chart:

| artefact | institution |
|---|---|
| brief | protocol, or a contract |
| debrief | results — therefore **self-report, therefore suspect** |
| ADR | case law and precedent |
| td | the docket |
| lint / gate | compliance |
| independent review | second counsel, or peer review |

The governing norm is *nullius in verba* — checkability by a stranger. That is a
scientific society or a court, not a firm. It is, not coincidentally, what
`system.md` already is.

## Roles and kinds — the formulation worth nailing down

The participants are two **kinds**; the work is a set of **roles**. They are
different axes:

| role | what it owns |
|---|---|
| author | the intent, the scope, the acceptance criteria |
| implementer | execution against the brief |
| reviewer | independent verification at a boundary |
| adjudicator | the decision that is not mechanical |

**Any role may be filled by either kind.** A human can implement; an agent can
write a brief; either can review, at least in principle.

But the **guarantees differ by kind**, and that is the design rule this
discussion proposes:

> **Write the artefact for the weakest kind that may fill the role, and welcome
> the surplus a human brings.**

A brief must hold even if an agent implements it — so it carries the acceptance
criteria, the cited constraints, and the stated non-goals. A human implementing
the same brief can absorb whatever it under-specifies, and should be welcomed
for it, but **must not be relied upon to** — because the moment the artefact
depends on that, it is no longer portable across kinds.

That portability is exactly the operator's example. The same brief can go to a
colleague (who brings judgement and asks), or to a colleague's agent (which
does not), or straight to an agent. If the brief was written for the weakest
kind, all three work.

## The human-to-human handoff — what it adds, what it costs

A chain with two humans is not a longer version of one human and an agent. It
changes four things.

1. **The brief must be legible to a cold reader** — a colleague is precisely a
   reader who was not present. `the-shared-artifact` already sets this bar; the
   delegation case makes it load-bearing rather than aspirational.
2. **Trust returns as a shortcut — and as a hazard.** A human colleague can
   infer and escalate, which absorbs ambiguity an agent cannot. The same trust
   can *silently substitute for verification*: "I trust her" is not a gate. The
   review belongs at the human boundary for exactly this reason.
3. **Accountability reappears.** A colleague can be answerable. That is a gain
   over the pure-agent case — but it also lets an author hide behind the chain
   (*the agent did it*). Systems over villains: design so the chain is
   auditable, not so it is blamed.
4. **"Delegate" is the wrong word between peers.** Delegation implies authority.
   Between colleagues it is a **handoff, or a contract** — the brief is a
   proposal the implementer accepts, and the acceptance criteria are the terms.
   The vocabulary matters, because a contract can be renegotiated and a
   delegation can only be obeyed or refused.

## The economics — adjudication is the scarce good

With employees, production is scarce and review is sampled. With agents,
production is near-free and **adjudication is the constraint** — the human's
reading time.

`system.md` already names the failure: **Mercury tempo**, throughput that
outruns the reader's intake, which reads as urgency and accumulates as
exhaustion. Its complement is the **fermata** — a deliberate held beat at a
boundary, honoured because the reader's tempo is part of the interface. The fix
for Mercury tempo is not slower agents. It is a respected intake constraint.

So the engineering target of the whole process is not better intent expression.
It is to **minimise the decisions only a human can make, and make each one
fast.** That is the mechanical/editorial boundary `BRF-REG-CLI` proposes for
`reg`, and the dispositions table as an adjudication interface. The operator's
observation and that brief are the same insight from two ends.

## Monitoring is verification, not reporting

The weak link in "monitoring the results of the implementation" is that the
debrief is written by the thing being monitored. **A principal who relies on a
self-report is being managed by it.** Hence the insistence on facts observable
without the narrative: a gate that runs, a measurement taken before belief, a
second reader who was not the implementer.

Monitoring, in this process, is a **verification** function. The debrief is an
account; the gate is the fact.

## The standing hazard — the map

There is a second hazard, older than any of this. If the briefs, indexes and
registry rows come to substitute for the work, the silo is **managing a
supplement** — the error `docs/2026-09-14-derrida-and-the-decomposed-pdf.md`
describes, wearing a management hat. The guard is already written there:

> A derived artefact declares itself derived. A pointer resolves. The document
> is the truth.

## Open questions — to nail down, eventually

Not decided here. Listed so the next pass starts from the list:

1. What must a brief guarantee for a cold reader, human or agent — are stated
   acceptance criteria, cited constraints and stated non-goals sufficient, and
   who checks?
2. Where is independent review **mandatory**, and is it mandatory at every
   human boundary?
3. Who owns a **reversal** across a human boundary — the author, the
   implementer, or the silo (the ADR)?
4. To whom is a **debrief addressed**, and to whom does it owe an answer?
5. Can an agent's output be **attributed** to the human who directed it, and
   what does that attribution mean?
6. Does the silo need a declared **standing** — who may decide what — or is
   that itself over-process, the ceremony the protocol warns against?

## Related

- `docs/cognition-in-the-wild.md` — Hutchins, the unit of analysis
- `docs/2026-10-06-the-shared-artifact.md` — the shared representation, the collaborator who forgets
- `docs/2026-08-20-origin-doc.md` — the Tiller and the Mainsheet; externalised scaffolding
- `docs/2026-09-14-derrida-and-the-decomposed-pdf.md` — the supplement, and the schema as the argument
- `docs/2026-09-17-multitask-or-multiplex.md` — the single-core human, and state-caching
- `system.md` — the Impartial Spectator, *no muppets*, Mercury tempo and the fermata
- `briefs/2026-10-08-brief-reg-cli.md` — the mechanical/editorial boundary, as adjudication relief
