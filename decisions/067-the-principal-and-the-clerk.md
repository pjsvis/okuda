---
type: ADR
callsign: ADR-PRINCIPAL-CLERK-067
date: 2026-10-14
---

# Decision: The principal and the clerk — the two parties, named by their standing

**Date:** 2026-10-14
**Status:** Accepted
**Enforced by:** the lexicon test below and a *usage* rule, not a gate — `nothing — advice`, said plainly, because "the reader" still has legitimate work to do (see the three senses) and a blind lint would forbid the honest sentence along with the dishonest one

## Context

The human role was named by an **activity** — *the reader* — and an activity
invites an instrument. The word carries three referents at once in this corpus:

1. **the party** — the human whose decisions are recorded, the one the silo
   serves;
2. **whoever happens to read** — the explainers, the README, prose design:
   no standing, no agency, no relationship to the work;
3. **the software's reading role** — down to a type literal, `src/cue.ts:70`
   declaring `surface: "reader" | "launcher"`, with
   `decisions/016-argv0-launcher-dispatch.md:81` saying *"the launcher inherits
   the reader's verb grammar"* — and **the device**, where *screen reader* is an
   external assistive-technology term we cite and do not own.

`ADR-RENDERER-READER-029` had already moved *reader* off the software, because
Glow calls itself a reader; the corpus put it back. So the collision is measured,
not hypothesised. *(Sense 3 and the retired *okudagram* are the same disease:
one word, several referents, no way to tell which is canon.)*

## Decision

**The two parties to the silo's transaction are named by their standing: the
human is *the principal*, and the agent — in its duty to the record — is *the
clerk*.**

- **The principal** is the party who intends, decides, and is owed the record.
  The word is the standard one for the party in an agency relationship, and it
  is a *standing*, not an activity, so it cannot be mistaken for a device.
- **The clerk** is the agent as the party who *owes the record*. This is not a
  diminution: it names the obligation rather than the capability. A clerk works
  from the files, and the clerk's memory *is* the ledger — which is clause 3 of
  the protocol (*continuity is re-reading, not recall*) given a name. It is also
  clause 4's kind of name: a post, not a person.
- **The direction of intention is the point of the pair.** Intention runs
  principal → clerk; the record runs back. *If you make a decision, it will be
  recorded; if you cause a brief to be implemented, it will be recorded.* One
  name for one party says nothing about direction; the pair says it in two words.

**The pun is ratified, not tolerated.** *Principle implies principles*: a party
with standing is a party with principles, and the near-miss carries the
accountability. Its cost is named and bounded: *principal* and *principle* are
identical in the ear and one letter apart on the page, and this corpus carries
**276** `principle(s)` — of which **28** are the bare ambiguous form *"the
principle"*, e.g. `playbooks/commissioning-playbook.md:12`. `ADR-RETIRE-OKW-018`
refused a near-miss once, against an *external standard* (OKW / Google's OKF);
this one is against a common noun of our own, and the pair is the disambiguator.
**The test:** if the sentence can be rewritten as *"the person who decides"*, it
is the **principal**; if it can be replaced by *"the rule"*, it is the
**principle**. In the ear they are indistinguishable, which is acceptable
because the cue channel speaks **states and never roles** — nothing spoken needs
the word.

**The three senses are separated, and "the reader" is not swept blindly.**

| sense | name |
|---|---|
| the party: decides, is owed the record | **the principal** |
| whoever happens to read, with no standing | **a stranger** (`docs/2026-08-20-origin-doc.md`) |
| the software's reading role | **okuda** (the argv0 name; the launcher is **gloam**) |
| the device that reads aloud | **a screen reader** — external, cited, not ours |

A substitution would make every explainer address a stranger as its principal,
which is the failure this ADR is against, one turn later. **The sweep is a
three-way triage**, and it is `BRF-PRINCIPAL-CLERK`.

**Two codes, one referent, where the two names do different jobs.** The
protocol's **agent** names what the thing *is*; **the clerk** names what it
*owes* in the record relationship. That is the two-codes lesson
(`docs/2026-08-30-naming-like-nasa.md`): machine code and human name, one
referent, different work — not a barnacle, provided each name stays in its
register. And **the retired words keep the residual rule** of
`ADR-RETIRE-OKUDAGRAM-066`: records keep their words, the living surface takes
the plain name, and this ADR is the map.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Keep *the reader* for the human | The three senses are the evidence; and an activity-word invites the instrument — a card reader, an e-reader, a screen reader |
| **the operator** (the protocol's own word) | Already in use, 509 occurrences, so it is the conservative choice — but it *narrows*: a stranger reading the README is not operating anything (LEM in reverse), and it collides with language operators in a codebase (97 of them, `src/render.ts:672`) |
| **the human** | Honest and collision-free, and it was the runner-up — but it names a *species*, not a *party*, so it says nothing about direction of intention and nothing about what is owed |
| **the client** | Already means a network peer here (333 occurrences); two senses on arrival |
| **the commissioner** | Ties to the house's own commissioning vocabulary (`playbooks/commissioning-playbook.md`) but names a one-off act rather than a standing party, and it is long in every sentence |
| Spell it *principle* (as first written) | Then the *rule* loses its word and the ambiguity lands on the more frequent noun, which is the worse trade |

## Consequences

**What became easier:**
- The parties are named by standing, so no tool, device or instrument can share
  the name. The device collision is gone by construction.
- Direction of intention is stated by the vocabulary rather than in a paragraph.
- The clerk carries the obligation in its name: a session that reads the
  protocol knows what it owes before it knows what it can do.

**What became harder:**
- *Principal* and *principle* will be confused by a careless hand, and the record
  will contain both. The test above is the remedy, and it is a reading, not a
  gate.
- *The reader* has legitimate work left (sense 2), so the retirement cannot be a
  lint. This ADR is `nothing — advice` on that half, and it says so.

**Constraints this imposes:**
- Prose about **the relationship** uses principal and clerk. Prose about **the
  runtime** may keep agent — provided it stays in that register.
- **A stranger is never a principal.** Where a document addresses an unknown
  party, it addresses a stranger, and the sweep's triage rule is the test.
- The three-sense triage governs `BRF-PRINCIPAL-CLERK`; a find-and-replace is
  forbidden on this change, and the reason is in the table above.

## Related

- `BRF-PRINCIPAL-CLERK` — the brief: the three-way triage and the sweep
- `decisions/029-renderer-reader-glass.md` — amended in place: the human row is the principal
- `decisions/066-retire-the-okudagram-term.md` — the same class, the residual rule, and the precedent
- `decisions/018-retire-the-okw-term.md` — a near-miss refused; this near-miss is ratified with a test
- `docs/2026-08-30-naming-like-nasa.md` — two codes, one referent; the veto; the pun's warrant
- `docs/2026-08-20-origin-doc.md` — *a stranger*, arriving cold
- `docs/ideas.md` — the ledger entry `reader-is-three-words`, promoted
