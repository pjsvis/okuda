---
type: Playbook
callsign: PLY-CRAFT
---

# Craft Playbook

## Purpose

The **craft pass** is one of the two reviews (`system.md`, *Craft pass and safety
pass*): the **safety pass** asks *"is this right?"* and everything gets it; the
**craft pass** asks *"is this as good as it could be?"* and is spent where a
second mind is worth the cost, never by habit. This is the craft pass's
procedural home — what to wander, what to ignore, and what a finding looks like.

It is **not a standard of care and not a gate**. A craft pass is intuited and
as-required; a prescriptive version produces the act without the finding, which is
ceremony in a control's clothes.

## What a craft pass is not

- **Not a full read of the code.** *"Have you read the code?"* presumes total
  coverage, which is neither possible nor wanted; terminal control codes and
  escape plumbing are a read nobody should have to make. The honest claim is
  narrower and stronger: *the prose claims were checked against the referent.*
- **Not the safety pass.** Correctness belongs to the tests and `just check`.
- **Not gated.** You cannot assert that someone wandered. Its evidence is the
  finding it produces.

## The comment probe — the recipe

The comments are where the code states its intent in prose, and the one part of
the repo **no test re-reads** — so barnacles (the unpaid-claim class,
`decisions/027-temperament-is-downstream-of-discipline.md`; `system.md`, *unpaid
claim*) accrete there fastest.

1. The human reads the comments.
2. Where one does not land, ask **"what did you mean?"** — not *"does this make
   sense?"*, which invites agreement and gets it.
3. The agent answers with the **referent**: what the code actually does.
4. The **barnacle** is where the text and the referent disagree.
5. The fix is a **diff**, and it names which is stale — the comment, or the
   code's obedience to the intent the comment records.

A comment rewritten without step 2 is a **cosmetic scrape**: the text stops
lying, the behaviour stays wrong, and the next reader inherits a smooth lie.

## Where to wander (the surfaces)

- **Comments** — the probe above.
- **Globals** — constants that carry meaning, read against the tables and lexers
  that consume them (`VECTOR_MIN` / `VECTOR_MAX`, `src/vectors.ts:68-69`, against
  the zone table and the lexer, `src/keygrammar.ts:67`).
- **Names** — a name that no longer matches its job.
- **A number in two places** — one fact maintained twice; one copy will drift.
- **State variables and control surfaces** — the numeric key actuator control
  surface, aligned against the doubled-pair canon before `11` joined the pocket
  (`src/keygrammar.ts:11-30`).

## Smell triggers (when to spend it)

- a new global crosses a module boundary;
- a comment's referent has moved;
- a name and its use have diverged;
- the same constant is written down twice;
- a control surface (bindings, zones, a table) and its consumer no longer agree.

## Scope by subtraction

Subtract the surfaces where a mechanical oracle already decides — byte-exact
colour output, the wrap state machine, the escape plumbing — because the tests
and `just check` are the oracle there, and a craft pass buys nothing a green tick
has not. What remains is where judgement is un-gated: **prose, globals, names**.
The parts you do not wander are the parts that already have an opinion.

## The asymmetry that makes it work

The human holds the **naive reader**; the agent holds the **referent**. Neither
closes the loop alone — the agent reads its own comment as true, because it wrote
it from the referent, and the human cannot know the intent except from the text.
It is a **checksum on intent**: the comment is the redundancy, *"what did you
mean?"* is the retransmission. (The shape, not the algorithm: a CRC is
*specified* and mechanical; this is *derived* and interpretive — which is why it
cannot be gated.)

Corollary: the pass cannot be delegated back to the agent (it would hold both
halves, and lose the naive reader), and a second agent sharing context does not
supply one either (same referent). The difference has to be **knowledge state**,
not model — the same condition the record review states at one level up
(`decisions/060-docs-direct-code-pr.md`, *the risk, named*).

## Failure modes

- **The cosmetic scrape** — the comment rewritten to match the code without
  asking whether the code is right.
- **The scraper as barnacle** — a "fix" that normalises the drift instead of
  removing it (`debriefs/2026-08-31-debrief-the-ledger-day.md:59`).
- **Correlated review** — two readers with the same knowledge state share the
  blind spot, and it looks like review (`decisions/060-docs-direct-code-pr.md`).

## Validation

The **finding is the evidence**: a rename, a retired global, a trimmed comment, a
control surface re-aligned. Test: *name one change the pass produced.* Nothing
over a stretch means either the surface is clean or the pass is not happening —
and the two look identical from outside. That is why this is a playbook and not a
gate.

## Worked instances

- `src/keygrammar.ts` — its header says the file is a grammar and some actuators;
  the zone table and `KEYBINDINGS` are the control surface. Commit `68cb5c2` is a
  comment whose referent had moved (`system.md`, *the comment's referent*).
- `VECTOR_MIN` / `VECTOR_MAX` (`src/vectors.ts:68-69`) — the numeric floor read
  against the doubled-pair canon and the lexer's classification.

## Related

- `system.md` — *Craft pass and safety pass* (the term; the comment probe)
- `decisions/060-docs-direct-code-pr.md` — the record review, and correlated review
- `decisions/027-temperament-is-downstream-of-discipline.md` — the barnacle class
- `playbooks/authoring-playbook.md` — the markdown-side counterpart (prose craft)
