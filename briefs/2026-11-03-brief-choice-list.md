---
type: Brief
callsign: BRF-CHOICE-LIST
---

# Brief: The choice list — a document that is a setting, and the actuator it would need

**Date:** 2026-11-03
**Status:** Proposed — the question held here is *is this a good idea*, and the
answer is not yet given. Reviewed later, by the operator's call on 2026-11-03; no
ticket is filed against it, so `brief-queue` lists it as **silent** and the gate
shows that without failing on it.

---

## Context

The operator's proposal, in conversation on 2026-11-03:

> we have a requirement to choose between a number of options for some
> user-definable value; we define the values along with their descriptions as a
> list; we render the list with rubricated silcrows; the silcrow actuated sets the
> appropriate value.

A value with *N* discrete options, rendered as a flat document: each option on its
own line with the sentence that says why it exists, and one tap to set it. No
settings dialog, no flag to remember, no archaeology through `--help`.

The failure mode it is aimed at is **menu-itis** — menu after menu, the goal
forgotten before arrival. The case for it is that the list *is* the whole UI: the
options, the reasons and the current state on one screen, and the actuators are
already learned.

**The nearest prior art is a loss, and its cause is unrecorded.** The operator's
last wizard idea *"got reverted the following day"* (2026-11-03). The fact is
recorded here; the reason is not, and nothing below invents one — a reconstructed
cause would be a story, and the whole value of the datum is that it is a
measurement.

Two things follow, and only two. A wizard is the **multi-step** form, so the
datum argues finding 1's corner (against depth) without arguing for or against a
flat list — it is evidence *about the family*, not about this member. And
whatever killed that wizard is the likeliest thing to kill this one, which is why
the reason is a precondition below rather than a curiosity: **the revert costs a
day, and the day is cheaper than the argument.**

## Warrant

Three findings from the discussion, each of which changes the shape of the
question rather than answering it.

**1. The form is not the thing menu-itis is caused by.** A menu is apparatus you
move *through*: the goal leaves the screen behind you, and the depth is the cost
(`system.md:176-186`; **wading** against the design consequence, *a surface looked
at, never a medium waded through*). A document that lists every option with its
description is a surface — the goal, the reasons and the previous value stay on
screen while the choice is made, and the undo is the option you just left, still
one tap away. So the operator's fear is well-founded and it diagnoses the
**hierarchical** form. The failure arrives the moment a choice list contains a
choice list; the flat list is the specific antidote, not a milder dose.

**2. The actuator budget is not the constraint it looks like.** The doubled pairs
are a reserved class (`src/vectors.ts:74`), the allocator skips the seven inside
the vector range (`src/vectors.ts:84-86`), and the address count is the space
minus that pocket — 80 (`src/vectors.ts:97`). A choice list therefore cannot
silently seize a verb: it takes the low numbers in reading order and the
allocator steps over `22`…`77` and `88` for it. What the list costs is its own
rows, and a leaf document with five options has nothing else competing.

**3. The decisive fact is not the UI. A silcrow is minted per *path*.** The jump
map keys one address on one destination, and the destination is a cited path
(`src/vectors.ts:282-296`). A bare option name — `dracula`, `frame`, `strict` —
mints no address, so a list of options renders with no silcrows *today*. The
proposal needs one of two things, and they cost very differently:

| how the option gets an address | cost | what it buys |
| --- | --- | --- |
| **each option is a file** — a one-line document, a palette file, a corpus record | **zero new grammar**: discovery, allocation and actuation all already work | tapping dereferences to that file, which is the existing verb doing its existing job |
| **a new address class** — a `choice` target the allocator mints for a marked list item | new discovery, new allocation, new actuation | tapping *sets*, which is the proposal as written |

The first is cheap and does not set anything; the second sets and is the whole
cost. That division is the reason this brief exists as a proposal rather than a
task.

## The question held open

The proposal is two halves with two different verdicts, and they should not be
carried together.

| half | verdict | warrant |
| --- | --- | --- |
| **the form** — a flat document of options, each with its description | *good; already licensed* | rose+bold is the control channel, reserved for what is actuable (`src/tui.ts:690-694`); the name is for recognition and the number is for actuation, so the list reads as a list (`docs/2026-09-04-the-silcrow.md:73-82`) |
| **the actuator** — a silcrow whose verb is *set* rather than *dereference* | *open; this is the cost* | a silcrow is an address's actuation point (ADR-DEREFERENCE-MARK-075); giving it a second verb makes the glyph mean two things one row apart, and **attributable structure** is the rule that then fails |

## The terminus question — where a set value lands

Named here because *"the silcrow sets the value"* does not yet say **where**, and
every answer on hand is already spoken for.

| terminus | what it costs |
| --- | --- |
| a config or ini file | `docs/2026-08-31-actuator-inputs.md:44-45` — *no config or ini files; state lives in the corpus or in the process, never in a third file*; and `docs/2026-09-25-mdv-the-other-viewer-paints-last.md:185` — *okuda has no config tier and no runtime exec*. It would also make okuda a compositor, which is the environment's concern (`AGENTS.md`, *three concerns*) |
| the document itself | okuda becomes an editor, and *reading, not editing* is the fourth clause |
| the running process only | invisible state — a choice whose effect is not on screen is a claim with no live referent (ADR-027, *misleading confidently*) |
| **the channel** — the choice leaves on stdout; the host sets the value | the shape the 2026-08-31 control surface already specifies: *the CLI param is the boot value; the host is the config system* (`docs/2026-08-31-actuator-inputs.md:47-52`). `fzf`'s shape. Nothing in the tree emits a selection today |
| **the corpus is the value** — the choice is which document is current | lightest; needs no new capability, and the pointer is the environment's |

The operator's position is that the state question (hidden state, a chrome
indicator, a summary screen) is a **later** decision, and this brief agrees: it is
recorded under *Open questions* and not decided here.

## Objective

Held, not asserted. If promoted, the objective is: **a flat choice list renders
with its descriptions and its current value marked, and the value changes by a
mechanism that leaves a trace someone else can read.**

The second clause is the load-bearing one and it is deliberately older than this
brief — a value set with one tap and no artefact is the *silent state change*
ADR-027 names, which is why the terminus table is not a detail.

## Scope

**In** (if promoted):

- A renderer pass for *option rows*: value, description, and the current value
  marked. The marking is muted, not rose — state shares the perimeter with the
  affordance (`src/tui.ts:690-694`).
- One terminus from the table, chosen by ADR. The other four are refused in the
  same record, by name.
- The emitter path if the terminus is the channel, with the caller's own line in
  the docs (`export X=$(okuda --choose f.md)`), never a built-in applier.

**Out:**

- A nested choice document. Depth 2 is menu-itis with a bibliography, and the
  flat list's whole warrant (finding 1) dies with it.
- A settings tier. No ini, no `.okudarc`, no keymap file.
- Any write to the document. `78`/`88` exist because writing is the editor's.
- A glyph of its own for the setter, unless an ADR takes the second-verb cost
  deliberately rather than by drift.
- A summary screen. Named in *Open questions*, deferred by the operator.

## Trigger

The observation that would make this worth doing — and without one this is a
slogan by the ledger's own test (`docs/ideas.md`, ADR-IDEA-LEDGER-064):

> **A value in this silo has two or more options whose *reasons* a reader has to
> weigh, and one of them is being set from memory today** — a flag looked up, a
> hex pasted, an env var recalled. The measurement is a session where the reader
> leaves the document to find out which option they wanted.

The falsifier: if the values that arrive are the kind whose reason fits in the
option's own name (`--palette dracula`, `src/cli.ts:103`), a picker is a menu in
front of a word the reader already knows — the default shape, and the answer is
no.

## Preconditions

- [ ] An ADR choosing the terminus. Not a design note — the three refusals in the
      table are existing rulings and reversing one needs the palimpsest protocol
      (`playbooks/decisions-playbook.md`).
- [ ] **The reason the 2026-11-03 wizard was reverted, written down.** One
      sentence, from the operator, not reconstructed. Nothing is built before it
      exists: an unnamed cause is a cause that will be met again.
- [ ] The trigger observed, once, in a real session. Nothing built speculatively.
- [ ] `just check` green at the branch point.

## Open questions

1. **Hidden state.** The operator's note, 2026-11-03: the state can be shown in
   the chrome or on a summary screen, so hidden state is not the blocker. The
   narrow version costs nothing — the current value marked on the list, muted.
   Which of the two, and whether either is enough, is deferred.
2. **Does the choice list ever share a page with references?** A § that
   dereferences under one heading and sets under another is the second-verb cost
   arriving by layout instead of by ADR. A rule of *one choice list per document,
   at the head, under its own heading* would contain it; nobody has argued for
   that yet.
3. **What does the actuation look like when it does not navigate?** Dereference
   moves the reader and pushes the backstack; a setter leaves the reader where
   they are, so its only proof is re-render or flash (`docs/2026-09-04-the-silcrow.md:57`
   is the dead-silcrow flash, the existing idiom).
4. **Is the option list a list of *documents* after all?** If each option is a
   file, the whole proposal collapses into the existing grammar and the only new
   thing is the reading convention. That would be the cheapest possible answer
   and it should be tested against a real value before anything is built.

## Notes

- **The second verb is the real risk, and it is not the citation one.** Silcrows
  were never portable — numbering is derived per render and evaporates with the
  glass (`docs/2026-09-04-the-silcrow.md:78`), so a setter silcrow loses no
  standing a pasted `§12` ever had. The loss is local: two verbs in one render,
  one row apart, with no way to tell them apart but the reader's memory of the
  page. That is the *same* failure as menu-itis, arriving from underneath.
- **The operator's caution is the brief's best argument.** *"The actuators would
  run functions that might change global state, but not in a bad way"* — the bad
  way is *irreversible with no visible trace*, and the flat form answers it
  structurally rather than by discipline: the previous value is still on the page.
  A menu cannot say that, because by the time you are three levels down the old
  value is not on screen to return to.
- **A one-tap state change is a claim about state.** If the setting is not
  written where it can be read back, the choice did not happen — it is remembered
  by whoever was at the glass. That is the house's own reason for the terminus
  table, and it outlives this brief.
- **A revert is a measurement, and this brief keeps it as one.** One implemented
  wizard, one day, reverted. That is the cheapest evidence in the silo and it is
  worth more than any argument above, so it is recorded with its cause left blank
  rather than filled in.

## Related

- `ADR-DEREFERENCE-MARK-075` — *a silcrow is an address's actuation point*; the
  claim the second verb must argue with.
- `ADR-REPEATED-DIGIT-ACTUATORS-032` — the reserved class the allocator skips.
- `ADR-IDEA-LEDGER-064` — the ledger and its trigger rule, applied above so that a
  proposal brief is not a wish.
- `docs/2026-08-31-actuator-inputs.md` — *the control surface*: no config files,
  the host is the config system, nudge keys for live scalars.
- `docs/2026-09-04-the-silcrow.md` — *names for recognition, numbers for
  actuation*; the reader's habit this proposal leans on.
- `docs/2026-09-05-dogfood-silcrow-motor-map.md` — the one-tap reach the choice
  list would spend.
- `system.md` — **wading**, and the design consequence (*a surface looked at*).
