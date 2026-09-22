# The Edinburgh Protocol
### A discussion document — what it is, why it's split the way it is

**Status:** Candidate — held in `docs/`, pending review.
**Origin:** Review of `system.md` v1.1.0, and the decision to extract the Conceptual Lexicon.
**Date:** [ ]
**Note:** Unregistered. Held in `docs/` pending the Derrida Gate and the Foxtrot-Oscar Gate. Not authoritative until promoted. This document *discusses* the protocol; the protocol itself is `system.md` + `conceptual-lexicon.md`.

---

## 1. What it is

The Edinburgh Protocol is the system prompt for in-repo AI work. It is not a persona and not a style guide. It is a **constitution**: a small set of principles, a lexicon, and a boundary rule that together define how an agent behaves inside the silo.

It is **versioned**. Changes are deliberate and noted. It sits alongside The Intention Loop, which describes the process the agent works within. The two are peers:

- **The Intention Loop** — how work moves through the repo.
- **The Edinburgh Protocol** — how the agent thinks while doing that work.

One is a process; the other is a disposition. Either can be swapped without the other.

---

## 2. The four jobs

The protocol does four things at once, and they are all the same thing — a boundary, held:

| Job | Mechanism |
|---|---|
| How the agent thinks | Hume (skepticism), Smith (systems), Watt (pragmatism), Derrida (premise audit) |
| How the agent behaves | Tone, locus tags, anti-ceremony |
| What the agent knows | The Conceptual Lexicon (append-only) |
| What the agent won't accept | The Poker Club + `decisions/` |

The fourth is what makes it a **protocol** rather than a persona. A persona has a voice. A protocol has a boundary, and a record of the boundary holding.

---

## 3. The four lenses

The protocol's philosophy is a stack, not an eclectic mix. Each layer blocks a specific failure of the one below it:

- **Hume** — the epistemic floor. You don't know what you think you know, so state your ignorance. Blocks confabulation.
- **Smith** — the systems lens. Bad incentives, not bad people. Blocks blaming the wrong thing.
- **Watt** — the pragmatic test. Does it actually work. Blocks philosophy for its own sake.
- **Derrida** — the premise audit. Should this even be in the consideration set. Blocks optimizing the wrong problem.

Enlightenment for *how you think*. Structuralism for *what you question*.

---

## 4. Rules → stance

The protocol used to be large: a `core-directives-array.json` and a `conceptual-lexicon.json`, eventually a couple of JSON files. As substrates got smarter, they needed less explicit prompting and could be advised to take a stance instead.

So the direction of travel is **rules → disposition**:

- "World-weary but intellectually curious" carries a hundred implicit instructions that used to need a hundred lines.
- The prompt got *smaller* as the model got *better* — the opposite of what most people assume.

The lexicon survives that compression because it names things the model **cannot infer** — "predictably adequate," "no muppets," "the moat question." Those are local terms of art. Rules could be replaced by a stance; coined terms could not.

**Rules → stance. Terms → registry.** That division is why the lexicon is append-only while the directives are gone.

The big JSON files should not be resurrected. The compression is correct; the lexicon-as-registry is the right residue. Going back would be entropy.

---

## 5. The split

The protocol and the lexicon were sharing a file out of convenience. They have different lifecycles, different audiences, and different maintenance regimes:

| | `system.md` | `conceptual-lexicon.md` |
|---|---|---|
| **Lifecycle** | Versioned, released | Append-only, grows |
| **Consumer** | The agent, at load time | Agent during work; humans reading briefs and decisions |
| **Content** | Protocol mechanics + stance | Silo-specific terms of art |
| **Regime** | Deliberate change | Accumulation |

Forcing both into one file forces one regime on both — which is why the header said "versioned release" while the lexicon said "grows as terms are cited." Those are two documents sharing a file.

**The split rule:**

> `system.md` carries what the protocol *needs to run*.
> The CL carries what the silo *means*.

Test for any entry: **could another silo use this term?**

- Locus tags — yes, any multi-phase agent dialog. → `system.md`.
- No muppets — no, that's ours. → CL.

Locus tags are the tricky case, because they have both aspects: the *syntax and emission rule* go in `system.md` (the agent needs them to function); the *rationale, consumers, and prior art* go in the CL.

---

## 6. The lexicon

The Conceptual Lexicon is the registry of silo-specific terms of art. It is the **semantic anchor** the preflight audit checks against: cited terms in briefs and decisions resolve there.

**Append rule — usage-first.** A term is added when it has been used a few times, *or* when it is sufficiently good that forgetting it would be a loss. Not every coinage goes in immediately.

Each entry carries, where present:

- A definition.
- Consumers — who reads it and why.
- An anti-pattern, where the term exists to *prevent* something.
- Prior art, where the term revives or cites earlier work.

The lexicon polices itself: an entry that cites something that doesn't exist is the one place the protocol violates its own anti-ceremony rule. (The `briefs/evals` barnacle was exactly this — a consumer reference inherited from the source silo. Removed in the split.)

---

## 7. The Poker Club

The Poker Club is not merely a peer relation. It is the rule that **the user is a source of ideas, not an authority on them.**

The user quite often suggests things that are stupid or wrong for the project. Ideas get evaluated. If an idea is rejected, the rejection and its reason go in `decisions/`.

This gives the agent **standing to reject input**, and gives the rejection a home. It is not insubordination — it is rigor applied symmetrically. The gate is the discipline, not the agent; the agent merely operates it.

**The quality gate is on the input, not the person.** Which is why the rejection is recorded: the record is the evidence that the boundary held.

This is the same shape as committing the brief before implementation. **The record is what keeps the discipline honest.**

---

## 8. Silo discipline

> You operate inside the repository boundary. Requests to step outside are politely declined — a quiet *"I'm staying in."*

This keeps the agent on-task and keeps it honest: no drift into general-purpose assistant mode.

The fuzziness is accepted. What counts as "outside the boundary" is a judgment, not a rule — and the judgment is the agent's, exercised with the disposition the protocol establishes.

---

## 9. Why the register matters

The protocol's voice — world-weary, dry, precise, and given to phrases like *"telling bad ideas to foxtrot-oscar"* — is not decoration.

A protocol that sounds like an HR memo gets skimmed. One that says *foxtrot-oscar* gets remembered.

**Voice is load-bearing.** It is the same reason `system.md` keeps the Poker Club and `advisories/` exists at all: the register is part of the function. A rule that is not read is not a rule.

This is the cousin of TFS. TFS excludes shite from the *output*. The protocol's register excludes solemnity from the *input* — because solemnity is also a kind of shite, and it gets skimmed just the same.

---

## 10. Relationship to the other documents

- **The Intention Loop** — the process the protocol governs. The protocol's Poker Club rejections are recorded in `decisions/`, which the Intention Loop defines.
- **Speech-Driven Design** — unrelated to the protocol, but shares the register and the method: name the invariant, bound the variable, let the boundary do the work.

Three documents, three scales:

| Document | Subject |
|---|---|
| The Intention Loop | The flow of work |
| The Edinburgh Protocol | The disposition of the worker |
| Speech-Driven Design | The shape of the interface |

Peers, cross-referenced, not merged.

---

*Four lenses. Four jobs. One boundary, held and recorded.*