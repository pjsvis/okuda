---
date: 2026-10-16
kind: survey — an observed disposition of the working method, tested against the ledger rather than agreed with
lineage: the operator's observation, 2026-10-16 — *"the silo is unwilling to entertain any suggestions without first doing some testing to determine if the suggestion is of interest... i like this behaviour and it appears to be emergent(ish)"*. Tested against `system.md`, the skill that carries the procedure, and the note template.
status: open — the observation is confirmed and the attribution corrected; the promotion criterion is re-derived in the same session. One defect left open: the provenance is untracked
---

# It was written down, and it was promoted on a count

> ◆ The behaviour is not emergent. It is clause 1 of the protocol, a skill whose trigger is the
> operator's own phrasing, and a required field in every note's frontmatter — 20 of 61 notes name
> the reader's question there. What emerged was the **recognition**, and the playbook promoted it on
> a count: the one justification `system.md:28` forbids.

## What we are deciding

The operator observes a disposition — *test a suggestion before entertaining it* — says they like it,
and calls it *emergent(ish)*. The question is not whether the behaviour is good. It is whether the
description is right, because a disposition mistaken for an accident cannot be maintained, and one
mistaken for a design cannot be questioned.

## The claim, and the test

The claim has two parts and they do not share a verdict: that the behaviour exists, and that it
emerged. The first is tested by looking for the behaviour in the ledger; the second by looking for
the *rule* that requires it. The instrument is a search, and the control is the case the rule should
have caught and did.

## The finding: three layers, and none of them emergent

- **The disposition** — `system.md:10`, `:14`. A suggestion is an output, and an output owes evidence.
- **The procedure** — `okuda-assess-capability`. Nine steps, refusals, traps, a report.
- **The document shape** — the `lineage:` field. The reader's words, and what was tested.

**The disposition is a derivation, not a habit.** `system.md:10` states the whole attitude in one
line — *every output is a claim, and a claim owes its evidence* — and clause 1 (`:14`) makes a claim
carrying neither a citation nor a *proposal* mark an **unpaid claim**. A suggestion is an output. So
a suggestion arrives already owing evidence, and running a test is the cheapest way to pay. Nothing
here is emergent; this is what the first clause means when the input happens to be a proposal.

**The procedure is a skill, and its trigger is the operator's phrasing.** `okuda-assess-capability`
opens its description with the exact move: *use when the operator asks "could we use X here", "any
openings for X"*. It carries nine ordered steps (`:19-72`), a list of refusals that recur (`:74-88`),
a trap list (`:90-114`) and a report format (`:116-121`). Its first step is *read the refusals first,
not the capability* (`:21`), and its second line is *the question as asked is usually wrong* (`:11`).
The output is an opinion with citations, or a `docs/` note; **it is not a plan** (`:17`).

**And the disposition is in the template.** Every note's frontmatter carries a `lineage:` field, and
the house's shape for it is *the reader's words, and what the note was written against*. **20 of the
61 `docs/` notes name the reader in that field** — including this one, and including today's earlier
note. A disposition that every document must declare in its first four lines is not a habit; it is
a form.

## The refinement the observation misses

The test is not *is this interesting*. It is **is there a slot** — and the protocol treats
*interesting* with suspicion, as evidence **against** a candidate (`system.md:27`). The skill's first
step is to grep the proposed thing's *slot* before reading anything about the thing itself, because
a model is not a modality: *an audio-understanding model occupies the ingress; a foundation model
does not* (`:26-29`). The worked example's verdict is not *interesting, pursue it* but **there is no
integration to make** (`docs/2026-09-14-qwen2-audio-at-the-ingress.md:8`, `status: closed`).

So the silo does not test a suggestion for appeal. It tests whether the design has a place to put it,
and it is willing to answer no.

## What is emergent, and it is narrower

**The promotion path.** On 2026-09-18 the silo noticed the pattern and named it a hint:
*"A hint, not yet a playbook. 'Here is an external thing — opinion' is now twice in one day...
Not promoted to `playbooks/` yet — two instances is a hint, and the register's own posture is
impressions before ideas"* (`.workbuddy-ai/memory/2026-09-18.md:335-339`). Eleven days later it was a
skill. So the route ran: practice, then recognition, then **held as a hint**, then codified.

**The rule was designed. The recognition that it was a rule emerged.** That is the emergent part, and
it is a better claim than *emergent(ish)* — specific, dated, and the thing this silo is actually good
at.

## The sharp end: the criterion is a count

`playbooks/playbooks-playbook.md:137-147` is where a procedure becomes a playbook, and two of its
four criteria were tallies until this session:

- *Repeatability: if a task will be done **more than twice**, write a playbook.*
- *Complexity: if a task involves **more than 3 steps** or critical constraints, write a playbook.*

The re-derivation is at `:139-142`; the paragraph that records why is at `:148-157`.

`system.md:28` says the opposite, in the same house: **justify a convention by the perceptual property
it serves — a stress removed, a scan enabled — never by a count.** So the silo promoted this
procedure on the criterion the procedure's own protocol rejects. And the count was never the real
trigger: the ledger now holds **20** reader-named lineages, not two, so the tally was satisfied long
before anyone re-read it.

**The property underneath is fallibility.** A procedure earns a playbook when following it can produce
a *detectable* wrong answer — a step that can be ordered wrongly, a constraint nothing downstream
catches, a judgement a second attempt would have had to re-derive. `okuda-assess-capability` has
exactly this: its first step can return **no**, and its trap list exists because that step has
returned the wrong no before (`:97-98`, the over-broad refusal). A count cannot see that. A count is
satisfied by a tally.

## What is not in question

- **The behaviour itself.** Not questioned here and not up for revision. Every claim above is about
  where the rule lives, not about whether it should.
- **The skill.** It is the procedure's home and it is good; the trap list is the part that earns it.
- **Clause 3.** The behaviour is durable *because* it is written down. That is the clause working.

## Where I would land

- ✓ **Criteria 1 and 2 of `playbooks/playbooks-playbook.md:137-147` are re-derived as properties**,
  keeping their intent: *repeatability* is the second attempt re-deriving what the first knew, and
  *fallibility* is a step that can be ordered wrongly or a constraint nothing downstream catches.
  The playbook invited the edit itself — *if a playbook fails, update it* (`:182`), *if you find a gap
  while following a playbook, fix it and commit* (`:185`) — and it landed in this session, which is
  why the line numbers above are the post-edit ones.
- ⋮ **The provenance is still untracked, and that is a separate defect.** `git ls-files .workbuddy-ai`
  returns **0** and `.gitignore:22` excludes the store, so by clause 3 (`system.md:18`) **the story of
  how this behaviour became a rule does not exist** — the behaviour is durable, its reason is not. The
  2026-09-18 session named the same gap and left it: *a skill is machinery; the eight traps are
  knowledge — classification not done.* Not fixed here; it is a decision about authority, not a commit.
- ✓ **The observation itself stands**, with the attribution corrected.

What would change my mind: evidence that the skill predates the pattern being noticed — a commit
before 2026-09-18's *twice in one day*. That would make the procedure designed rather than recognised,
and the emergent part would go with it.

## Evidence

- `system.md:10` — every output is a claim, and a claim owes its evidence.
- `system.md:14` — clause 1, cite or mark; the unpaid claim.
- `system.md:18` — clause 3, continuity is re-reading.
- `system.md:26-28` — the three dispositions; `:28` is the count prohibition.
- `~/.workbuddy-ai/skills/okuda-assess-capability/SKILL.md` — `:3` the trigger, `:6` `agent_created`,
  `:11` the question is usually wrong, `:17` the output is an opinion, `:19-72` the nine steps,
  `:74-88` the refusals, `:90-114` the traps, `:97-98` the over-broad refusal, `:116-121` the report.
  **Outside the silo** — no `skills/` path is tracked, which is the second defect above.
- `playbooks/playbooks-playbook.md:137-147` — when to write a playbook, with `:139-142` the criteria
  re-derived in this session and `:148-157` the paragraph recording why; `:181-185` the maintenance
  rule that invited the edit.
- `docs/2026-09-14-qwen2-audio-at-the-ingress.md:4-8` — the worked example: a reader's request, and
  `status: closed — no integration proposed`.
- `docs/2026-09-18-simplified-technical-english.md:4` — the lineage convention, same shape.
- `docs/2026-09-18-nnn-the-sibling-outside-the-boundary.md` — the second instance of the pattern.
- `docs/2026-10-16-the-rules-the-class-cannot-fail.md` — the third, and the one that prompted this.
- `.workbuddy-ai/memory/2026-09-18.md:335-339` — the hint, and the count criterion. **Untracked.**
- Measurements, 2026-10-16: **61** `docs/` notes carry a `lineage:` field and **20** name the reader in
  it (`rg -l` over `docs/*.md`, pattern in this note's own review); `git ls-files .workbuddy-ai` gives
  **0**; `git ls-files` gives **0** paths under `skills/`; `.gitignore:22`.

## Related

- The procedure `okuda-assess-capability`
- The playbook that owns the tiers `playbooks/playbooks-playbook.md`
- The protocol `system.md`
