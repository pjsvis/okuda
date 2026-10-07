---
date: 2026-10-07
kind: essay — the carved version of the fantasy-engineering quarry (`docs/2026-10-07-fantasy-engineering.md`). Publishes as written: it makes no claim about any specific talk's content, so it needs no primary-source verification. The named critique of the conference framing is held behind that gate
lineage: the operator's observation, 2026-10-07 — *"one constant that seems to come out of the current agentic engineering proposals is loops: just keep going till its right, please… they seem to be relying on the agent to figure out almost everything"*; and `playbooks/defect-playbook.md` § *the third reflex*, where the same finding lives as procedure
status: draft, complete — held for a re-read rather than for a fact
---

# The Loop Is Not a Specification

*Fantasy engineering, and the one tactic that carries it.*

There is a single primitive in every proposal of this genre, and it is the loop.
Ship with an agent; run the tests; let it read the failures; run again. Inner
loop, outer loop, and a meta-loop that reads the wreckage to distil next week's
playbook. The instruction that binds them all is the same: **keep going until
it's right.**

That is not an instruction. It is an aspiration, and its meaning lives in a
value nobody wrote down. A stopping condition *is* a specification — and "until
it's right" hands the specification to the thing that was supposed to satisfy
it. You cannot iterate toward a destination that no one has named.

## Four questions, two of them never asked

Control theory asks four things of a loop: a sensor, a setpoint, an actuator,
and stability. Look at the proposals and count. They have the actuator, and they
have the iteration count. They have neither of the first two.

So they are not control loops. They are **retry generators** — and the questions
that separate the two cost nothing to ask:

> **What is the sensor — and who wrote the setpoint?**

If either answer is "the agent", the loop is grading its own homework, and its
output is a draft rather than a result. This is not a philosophical objection.
It is the difference between two behaviours with opposite signs.

**A closed loop reduces variance.** Give it a compiler, a failing test, a
measured probe, a reproduction that flips from red to green, and every iteration
is a correction. The error shrinks because the agent's opinion about whether it
is finished is irrelevant.

**An open loop amplifies variance.** With the model as its own oracle, each pass
feeds the previous pass's assumptions back in as context. Context becomes fact.
The second iteration is built on the first iteration's unexamined guess, and the
tenth is built on nine of them. That is drift with a progress bar.

Which gives the rule worth keeping: **loops search a known space; they do not
discover the space.** Where an oracle exists, loop freely and without ceremony —
that is what free retries are for. Where the oracle is human judgement — intent,
taste, *is this any good* — do not loop. Stop, ask once, and write the answer
down. That is not a failure to iterate. It is the only thing that works.

## The confession, because it is stronger than the accusation

I made this mistake this week, in a document about not making it.

A prompt was asserted to be shorter than the one it replaced. Wrong. The
corrected figure was then asserted without measuring. Also wrong. The third pass
measured first — and the measurement, one command, took less time than any of
the three claims did to write.

**Three iterations of an open loop resolved by a single oracle. The loop failed
and the sensor succeeded.** I did not need the theory; I had the specimen. And
note what the fix was: not a fourth pass. One measurement.

## Where the deferred work goes

Two things the loop hides, and both are somebody else's problem.

**The specification lands on the reviewer.** If the loop's stopping condition is
the agent's own tests, then the human stop approving designs and starts
adjudicating an unlabelled stream. Design uncertainty in, review load out — and
harder per item than before, because the reasoning that would make a change
quick to judge was the thing that was never written. A pipeline that reports an
empty backlog this way has *relocated* the queue, not emptied it. The queue is
now the human, and it is deeper than it looks because nobody dares call a
green-tested diff fine.

**Motion is visible; correctness is not.** A loop is the only thing that shows
progress per unit of spend when there is no oracle. Every pass emits text, diffs,
activity — and activity reads as progress to everyone who is not measuring. This
is why the tactic spreads. It does not require anyone to be cynical; it requires
a market that rewards visible motion. Vendors are not villains here, they are
respondents.

## What is actually being automated

Ask what the human was doing in the loop the proposal wants to close. If the
answer was "typing", the loop is a genuine win — that work was clerical, and
machines are better at it.

If the answer was "deciding what right means", then removing the human removes
the sensor, keeps the actuator, and retains the diagram. The claim to drive
manual takeovers to zero is, in that case, a proposal to run a control system
with its feedback disconnected — which is not control at all, it is just motion
with a vocabulary borrowed from engineering.

**The human is the oracle.** Everything else in a disciplined pipeline is
machinery for getting work to the oracle in a state where the judgement is
cheap. That is what a specification is *for*. Which leaves one useful
instruction in place of the aspirational one: say what right means, in writing,
before the first iteration — because after it, whatever the model believes is
what the loop will converge on.
