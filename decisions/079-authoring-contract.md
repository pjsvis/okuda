---
type: ADR
callsign: ADR-AUTHORING-CONTRACT-079
date: 2026-11-03
---

# Decision: Authoring is a contract, not a style — four things an author is given

**Date:** 2026-11-03
**Status:** Accepted — the operator's position, stated twice and then asked to be
persisted: *"we do not prescribe how to write… give those boundary conditions and
system invariants to an AI author and they should be able to work something out to
our mutual benefit."* This record is the writing-down, not the deliberation.
**Enforced by:** the three gates that carry the load — `just surface --gate` (the
palette), `bun scripts/citation-census.ts --strict` with
`bun scripts/callsign-lint.ts` (a reference resolves or it is a finding), and
`bun scripts/reg-sync.ts --all` (a derived ledger agrees or it is a defect); plus
`bun scripts/prose-check.ts --strict-leaks` (emphasis surviving the render is a
render failure) and `bun scripts/elision-monotone.ts --gate` (a loss is marked).
**Advice, not enforced:** *no second authoring prescription* — nothing fails if one
is written — and the **far read**: `bun scripts/squint-probe.ts` prints numbers at
five widths and is absent from `just check` on purpose, because it prints a
reading rather than a verdict.

## Context

The ordinary answer to "how should this be written" is a style guide, and a style
guide exists to defend against things the author cannot see: a hard wrap at 72
columns, two trailing spaces, a tab, a paste that dragged in a soft break. Every
house style spends most of its words on that class, and the fussing is what makes
a guide read as prescription rather than as help.

This silo removed the axis. **In prose, whitespace is editorial and inert; the only
break signal is a visible backslash** (`ADR-PROSE-BREAKS-056`) — soft breaks
joined, space runs collapsed, and the hard break moved onto a mark that is on the
glass. The measure, the vertical rhythm, the wrapping and the elision are the
renderer's (`ADR-PROSE-MEASURE-070`, `ADR-UNIVERSAL-ELISION-050`).

So the pressure that produces a style guide is gone at the source, and what is
left is a division of labour: **the author owns content and structure, the renderer
owns the paint, the grammar is the interface between them.** An agent author does
not need telling how to write; it needs to know where its authority ends.

## Decision

**An author is given four things — the grammar, the invariants, the refusals and
the gates — and no prescription of how to write.** The invariants are stated so
the author can stop worrying about them; the refusals are stated so it stops
reaching for what the paint cannot do; the gates are what make the other three
load-bearing rather than advisory.

| given | what it is | where it lives today |
| --- | --- | --- |
| **the grammar** | what counts as a block — a fence, a list, a table, a heading; and that prose whitespace is inert | `ADR-PROSE-BREAKS-056`; `docs/style-guide.md` as the map of consequences |
| **the invariants** | what the render guarantees: measure, vertical rhythm, colour, elision, reflow that holds the reader's place | `ADR-PROSE-MEASURE-070`, `docs/2026-10-08-the-resize-contract.md`; *progressive engagement*, `conceptual-lexicon.md:22` |
| **the refusals** | what the paint cannot do and what the medium will not carry: a diagram never wraps; the renderer supplies the colour; the coordinate is prose | `AGENTS.md` (authoring), `ADR-LINE-IS-PROSE-078` |
| **the gates** | where the author will be told it is wrong | `just check` — the list in *Enforced by* |

The style guide survives as a **map of the grammar's consequences** — *what markdown
do I write to get the okuda look* — which is a description of the renderer, not a
prescription of taste. That is why it stays admissible and why it is not the
contract.

## The precondition, which is the durable part

> **Prescription is unnecessary exactly to the extent that the medium refuses
> invisible input.**

A style rule is a patch over a signal the author cannot see. Remove the signal and
the rule has nothing to patch. Where the signal cannot be removed, it must be
**gated** — never left to a guide, because a guide is a claim with no instrument,
and an author optimising to a passing check will satisfy the letter and miss the
property every time.

**Test:** name an authoring dimension that cannot be seen on the glass and that
still affects the render. If it exists, it is either refused (as `ADR-056` refused
the invisible hard break) or gated. A dimension that is neither is a **silent
degradation** — the failure *progressive engagement* already names, a loss that is
not stated.

## Alternatives Considered

| Alternative | Why Rejected |
| --- | --- |
| **An authoring skill for agents** | The **no agent layer** rule (`system.md:336-352`): a skill is a parallel store of what `--help`, the README and the playbooks say, and the copy no gate can check. An agent is just another consumer of the same plain text. |
| **A longer style guide, made prescriptive** | It would be writing rules for signals the author cannot see, which is the class `ADR-056` deleted. And a prescriptive guide is over-fitted by exactly the author it is written for. |
| **The invariants as gates only, no prose** | The gates do not cover the far read (`squint-probe.ts` is a probe), so a gate-only contract would silently accept a document that is legible at 100 columns and a smear at 200. |
| **Nothing — just the CommonMark syntax** | Loses the refusals, and an author will reach for them: a diagram that wraps, a coloured mark that means nothing, an invisible break. The refusals are cheap, stable and cannot be discovered from the syntax. |

## Consequences

**What became easier:**

- An agent can author admissibly with no briefing. Observed once, 2026-11-03: two
  documents written with the grammar, the lexicon and the gates in view, the style
  guide never opened, `just check` green on the first run. **n = 1**, confounded —
  `AGENTS.md` carries three real prescriptions, and one operator's taste was the
  only judge — and in the claimed direction.
- The guidance surface stays small, so it can be re-read rather than skimmed.
- Every block type now inherits an obligation: if it cannot state the perceptual
  property it serves, it does not belong in the grammar.

**What became harder:**

- The refusals are maintained by hand. A new medium (an image, a link scheme, a
  coordinate) arrives with no refusal attached until someone writes one.
- The far read stays adjectival. `squint-probe.ts` measures it and gates nothing,
  so *big terminals work as well as regular ones* is, today, an **advice-grade**
  invariant — the one exception in the four-item contract, and the cheapest
  candidate for promotion: a fixed control pair plus a resume threshold would make
  it a gate.
- Saying "we do not prescribe" is now a claim that must be honoured. A second
  agent-facing authoring artefact — a skill, a prompt pack, a rules file — is a
  **defect against this decision**, not an addition to it.

## Related

- `ADR-PROSE-BREAKS-056` — whitespace inert, the decision this contract rests on.
- `ADR-PROSE-MEASURE-070`, `ADR-UNIVERSAL-ELISION-050` — the renderer's ownership
  of paint, which is what makes the author's freedom safe.
- `system.md:336-352` — *no agent layer*; the refusal of the wrapper.
- `conceptual-lexicon.md:22` — *progressive engagement* and the damaged-mark test.
- `docs/2026-11-03-perceptual-emphasis.md` — the perceptual property is the
  specification; this record is that position applied to the author.
- `docs/2026-10-06-the-shared-artifact.md:32` — *purposive*: a document exists to
  change a decision, which is the property an author is actually being asked for.
