---
type: Playbook
callsign: PLY-DEFECT
---

# Defect Playbook

**Date:** 2026-10-07

> How to decide whether to fix a defect now, later, or never — and how to make
> a deferral legitimate rather than merely forgetful. Written 2026-10-05 after
> the operator named the practice: *"living with a defect for a while is better
> than fixing it reflexively — giving the defect time to show its colours and
> shapes allows us to diagnose better and decide better."* Both parties had
> been doing this for months without acknowledging it. This is the
> acknowledgement.

## Purpose

A defect is evidence. It is often the **only** evidence of a wrong
abstraction, and a symptom fixed in the first five minutes takes the witness
with it. This playbook exists so that the decision — fix, defer, re-understand
— is made deliberately and written down, instead of being made by whichever
reflex fires first.

## Context

Applies to anything that is wrong: a failing test, a lying ledger, a glyph out
of place, an order that reads backwards, a claim that will not verify. It
applies to *both* parties, and that is the point: an agent asked to fix a
failing test will fix it, and an operator irritated by a bad list will want it
sorted. Neither impulse is a decision.

Two reflexes, and the discipline is what you do after the reflex fires:

- **The fix reflex** — it is wrong, so change it now. Papers over the reasoning
  that produced it, and often encodes that reasoning as code.
- **The defer reflex** — park it, we will come back. Papers over the reasoning
  *entirely* unless the deferral is instrumented.

The sibling reflex is already documented in `playbooks/baby-extraction-playbook.md`:
the Foxtrot Oscar reflex, which fires when a design looks over-engineered.
Temperament is downstream of discipline there, and it is downstream of
discipline here.

## The third reflex: the loop

The two reflexes above are single acts. Their institutionalised form is a
**loop** — *just keep going until it's right* — and it is the most seductive
shape in current agentic engineering, because it looks like a control system
and moves like one.

It is not one. Control theory asks four things of a loop: a **sensor**, a
**setpoint**, an **actuator**, and **stability**. Most agent loops have the
actuator and the iteration count. Ask the two cheap questions:

> **What is the sensor — and who wrote the setpoint?**

If either answer is "the agent", it is not a loop. It is a **retry generator**,
and its output is a draft, not a result. A stopping condition *is* a
specification: "until it's right" hands the specification to the thing that was
supposed to satisfy it, and you cannot iterate toward a destination nobody wrote
down.

**Closed loops reduce variance; open loops amplify it.** With an external oracle
— a compiler, a failing test, a measured probe, a repro that flips green — each
iteration is a correction and the error shrinks. With the model as its own
oracle, each pass feeds the previous pass's assumptions back in as context, and
context becomes fact: drift with a progress bar.

**Loops search a known space; they do not discover the space.** Where an oracle
exists, loop freely and without ceremony — free retries are exactly what such a
space is for. Where the oracle is human judgement (intent, taste, *is this any
good*), do not loop: stop, ask once, and write the answer down. That is a
fermata, not a failure to iterate.

Two things the loop hides, and both land elsewhere:

- **The deferred specification becomes the reviewer's queue.** Design uncertainty
  in, review load out. An "empty backlog" produced this way is a relocation, not
  an elimination — and arriving as an unlabelled stream makes each item *harder*
  to judge than a designed change would have been.
- **Motion is visible; correctness is not.** A loop is the only thing that shows
  progress per unit of spend when there is no oracle. Any market that rewards
  visible motion will get loops, whether or not anyone involved is cynical.

**Worked specimen, from this silo.** A document asserted that one prompt was
shorter than another. Wrong. The corrected figure was then asserted without
measuring. Also wrong. The third pass measured first. Three iterations of an
open loop with no sensor, resolved by a single command: **the loop failed and
the oracle succeeded.** The case is in the museum below, beside the ticket whose
written remedy was itself the defect — a loop would have executed that remedy
eleven times.

## The protocol

### Step 1 — Name the kind before touching anything

| Kind | Test | Default move |
|---|---|---|
| **Forced** | The artifact does not do its job: it will not run, the byte is wrong, the invariant is violated, the ledger lies. | **Fix now.** No ceremony, no deliberation. Write the case afterwards if it taught something. |
| **Chosen** | The behaviour works and is defensible, but the *reason* for it is not yet written. | **Characterise first.** The fix is a decision, not a repair. |
| **Ledger** | A derived artifact that reports success while being wrong — index, checksum, cache, generated row. | **Fix or quarantine.** Never defer: the cost compounds and the lie gets inheritors. |
| **Misframing** | Not a bug at all. It is the wrong *model* of what the thing is for. | **Re-understand it.** Do not fix the symptom; it is the evidence. |
| **Cosmetic** | An aesthetic judgement with no downstream trust. | **Park with a trigger**, or leave it. |
| **Uninstrumented deferral** | Anything parked in a head, a chat, or a passing comment. | **Not a deferral.** By this silo's continuity clause it does not exist. Write it down or fix it. |

### Step 2 — Ask the five questions

1. **Symptom or cause?** Only a symptom → waiting buys the name. Cause already
   in hand → deferral buys nothing; you are postponing understood work.
2. **Forced or chosen?** If the fix is forced by the symptom, take it. If it is
   *chosen* by a principle that is not yet written, wait for the principle.
3. **Load-bearing or islanded?** If other work is built on it, or will come to
   trust it, deferral spreads the lie. Fix or quarantine.
4. **Flat or compounding cost?** Flat (an order, a colour, an unverified claim)
   → wait. Compounding (a ledger, a signature, a schema, a public interface)
   → don't.
5. **Is the delay instrumented?** If the answer to all of the above is "wait",
   the deferral must be written where the silo can see it, with a repro and a
   named trigger or dependency.

### Step 3 — Instrument the deferral

A legitimate deferral is a debt with an owner. The form is already in use:

- A **repro** when the defect is behavioural — `docs/2026-09-30-the-freeze-repro.md`
  is the model: it characterised an input freeze under `fzf execute`, decided
  whose bug it was, and left the finding standing.
- A **named dependency or trigger** in `&next.md`, as the search-area redesign
  carries: *"deferred behind the rest of the action list by dependency, not by
  date."*
- A **routing note** on the item itself, as the `--no-color` case carries:
  routed to a future dial, *"build it when the verdict confirms."*

If none of those is true, you have not deferred the defect. You have simply
stopped knowing about it.

### Step 4 — When the fix arrives, write the reversal down

A fix that changes a documented behaviour is a reversal, and reversals run the
palimpsest protocol (`playbooks/decisions-playbook.md`): the superseded rule
stays visible in prose, the new rule is recorded, and both land in the same
change. `ADR-SEARCH-RECENCY-053` is the model — the launcher playbook kept the
old claim, marked as having been true when written and false now.

## The museum — cases from this silo

Each entry is a defect that was lived with, and what the delay revealed.

| Case | Lived with | What waiting bought |
|---|---|---|
| `--no-color` "escape leak" (bold and italic survive by design) | since the TTS dogfood, 2026-09-19 | A **second consumer** (the e-ink sink) that turns a convenience into a designed dial, and the shape of the fix — strip *all* escapes, not all hues. A reflex strip would have broken the voice's bold. |
| The path predicate's case sensitivity (`tradingagents/` silent while bodies matched) | since the content channels gained their case fix | The **principle** instead of a coin flip: one search, one answer, therefore one rule at both call sites. |
| Ascending chronology in the picker | since the picker existed | The discovery that it was a **misframing** — the picker is an activity pulse, not a table of contents — and a scope that saved the channel rank from a reflex re-sort. |
| The stale derived status in the registry index, wrong since 2026-08-30 | five weeks | The **class**: eleven `parked` briefs deriving as `open`. That evidence changed the fix from "edit a row" to "refuse to guess and report". The reflexive fix — *compare the derived status*, as the ticket said — would have destroyed eleven statuses. |
| The compiled binary's invalid signature, dead for four days | four days, and this one was **forced** | Four candidate explanations, three of them plausible and wrong. The control table (`ADR-BUILD-SIGNS-040`) is what settled it. Characterisation, then fix — not fix, then hope. |
| The `columns = 0` width regression under `--compile` | permanently | A **permanent** workaround: the `tput` fallback is now load-bearing for the *next* regression, not just this one. A defect that is better lived with than removed, because removal reintroduces the failure. |
| The asserted length of a prompt ("this cut is shorter") | three passes of a loop, no sensor | **The loop failed and the oracle succeeded.** Two unmeasured claims stood for exactly as long as it took to run one command; the third pass measured first. The fix was not a fourth pass. See *the third reflex*, above. |

### And the counter-case — an uninstrumented deferral that rotted

The `&briefs.md` facade stopped reflecting new briefs and nobody noticed until
the drift was measured: twenty-eight briefs absent from the state table. No
repro, no trigger, no owner. That is the failure mode this playbook exists to
prevent, and it belongs in the museum with the successes — a playbook that only
records its wins is a brochure.

### And the case that named itself while this playbook was written

Three artifacts of a session that spanned three days carried the date of its,
first — file dates, frontmatter, and a registry row — because the date was
*inherited* from the conversation that prompted the work rather than checked
against the clock. Naming the kind gave the move in one step: it is a **ledger**
defect (a sorted, searchable field that lied), and the ledger rule is fix or
quarantine, never defer. Fixed in the same change that registered this playbook.

The general lesson is small and worth keeping: **inherited metadata is
unverified metadata.** The date came from the document, not from the day.

### Who pays the interest

Patience is a loan against the operator's tolerance. The `--no-color` deferral
was paid out in five weeks; the casing bug in irritation; the amp-check drift
in a cleanup nobody wanted to do. Waiting is justified by the information it
returns, never by a taste for waiting.

## Standards

- **A defect with a cause and a repro is knowledge. A defect with a name only
  is a symptom.** Say which one you have.
- **Never fix a ledger reflexively.** Derived artifacts are the one class where
  the fix must follow the characterisation, because a reflex fix to a lie
  either propagates it or destroys data.
- **A fix that changes documented behaviour amends the document in the same
  change.** No silent reversals.
- **The five questions are a gate, not a ritual.** When the defect is forced
  (kind 1), skip to the fix. Ceremony applied to a broken binary is another
  form of not thinking.
- **Never iterate toward an unwritten setpoint.** Name the sensor and the author
  of the setpoint before starting a loop; if either is the agent, the loop is a
  retry generator and its output is a draft.
- **Write the case while it is fresh.** The museum entries above were scattered
  across debriefs and commit messages before this playbook existed; that is one
  re-derivation per reader, forever.

## Validation

You have followed this playbook when:

- The defect is named by kind, and the move matches the kind.
- If deferred: the deferral has a repro, or a trigger, or a named dependency,
  written where the silo can see it.
- If fixed: the fix is either forced by the symptom, or justified by a
  principle that is now written down.
- If documentation asserted the old behaviour, the document carries the
  reversal visibly.
- `just check` passes, and the case — if it taught anything — is in this file's
  museum or in a debrief.

## Maintenance

- **Add the case when it teaches something.** The museum is the point of the
  playbook; a new entry is cheap and prevents one re-derivation.
- **If the gate becomes an excuse for inertia, tighten it.** "We are
  characterising it" is not a resting state for a *forced* defect.
- **Review after use.** If a defect was fixed reflexively and it cost
  something, that is a museum entry too — the acknowledgement is the point.

## Related

- `playbooks/baby-extraction-playbook.md` — the FO reflex: the same psychology,
  one layer over, applied to abstraction rather than defect
- `playbooks/decisions-playbook.md` — the palimpsest protocol, for step 4
- `playbooks/justfile-playbook.md` — a museum of symptom → cause triples in
  another register, written before this playbook existed
- `docs/2026-10-06-the-shared-artifact.md` — why a discipline that lives only
  in a head is not a discipline
