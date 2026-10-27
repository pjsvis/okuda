---
type: Brief
callsign: BRF-CONCEPTUAL-LEXICON
---

# Brief: Extract the Conceptual Lexicon from system.md

**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on. Its load-bearing half landed: the split into `conceptual-lexicon.md` on 2026-10-08, and its successor `BRF-SILO-LEXICON` was itself refused on 2026-10-27, so the gathering is closed for now — the lexicon stands as built, and grows only when a term is coined in use.
**Date:** 2026-XX-XX
**Origin:** Review of system.md v1.1.0 (Edinburgh Protocol)
**Predecessor:** none

---

## Intention

Split `system.md` into two peer documents:

1. **`system.md`** — the Edinburgh Protocol itself: philosophy,
   operational guidelines, tone, silo discipline, and the protocol
   *mechanics* it needs to run (locus tags, wrap-up).
2. **`conceptual-lexicon.md`** — the silo-specific registry of terms
   of art. Append-only. The semantic anchor the preflight audit
   checks against.

The two documents are peers. Each cites the other; neither
subsumes the other.

---

## Background

`system.md` v1.1.0 currently carries both the protocol and the
Conceptual Lexicon. They have different lifecycles and different
consumers:

- `system.md` is **versioned and released**. Changes are deliberate
  and noted in the header.
- The Conceptual Lexicon is **append-only**. It grows as terms are
  cited.

Forcing both into one file forces one maintenance regime on both.
They also have different audiences: `system.md` is consumed by the
agent at load time; the Lexicon is consumed by the agent during
work, and by humans reading briefs and decisions.

Additionally, the current Lexicon cites `briefs/evals` as a consumer
(a barnacle from the source silo). There is no `evals/` in this
repo's structure. The audit's anchor should resolve to a single,
unambiguous file.

---

## Deliverable

1. **A slimmed `system.md`** containing:
   - The CORE PHILOSOPHY section, unchanged.
   - The OPERATIONAL GUIDELINES section, unchanged.
   - The INTERACTION STYLE section, unchanged.
   - The SILO DISCIPLINE section, unchanged.
   - A definition of **locus tags** and **wrap-up** — the mechanics
     the protocol needs to operate. This is the part currently in
     the Lexicon that belongs in the protocol, not the registry.
   - A pointer to `conceptual-lexicon.md`.

2. **A new `conceptual-lexicon.md`** containing:
   - An opening paragraph stating what the file is, that it is
     append-only, and that it is the audit's semantic anchor.
   - The silo-specific terms of art, each with its current
     definition, consumers, and anti-pattern where present.
   - A pointer to `system.md` for protocol mechanics.

---

## The split rule

> `system.md` carries what the protocol *needs to run*.
> The CL carries what the silo *means*.

Test for any given entry: **could another silo use this term?**

- Locus tags — yes, any multi-phase agent dialog. → `system.md`.
- No muppets — no, that's ours. → CL.

---

## Locus tags — the tricky one

Locus tags have both a mechanical and a silo-specific aspect, and
the split must preserve both:

- **`system.md`:** the syntax, the rule for when to emit, the rule
  for when to omit. The agent needs this to function.
- **`conceptual-lexicon.md`:** the rationale, the consumers, the
  prior art (the parked brief
  `2026-07-12-token-compaction-hook.md`), the anti-ceremony note.

---

## Scope

**In scope:**
- The split described above.
- Fixing the `briefs/evals` barnacle — either resolve it to a real
  path or remove the reference.

**Out of scope:**
- Rewriting the philosophy, guidelines, tone, or silo discipline.
- Changing the definition of any term.
- Adding new terms.
- Resurrecting the JSON directive files. The compression from
  rules → stance is correct; the Lexicon-as-registry is the right
  residue.

---

## Acceptance criteria

- `system.md` contains no silo-specific terms of art.
- `conceptual-lexicon.md` contains no protocol mechanics.
- Locus tags are defined in `system.md` and explained in the CL.
- The `briefs/evals` reference is resolved or removed.
- Both documents cross-reference each other.
- No content has been lost — only relocated or deleted
  deliberately.

---

## Notes for the implementer

- **Session discipline:** this brief should decompose into
  individually resumable tasks. Expect one task per session; new
  session between tasks. (See The Intention Loop, §6.)
- **Terminology:** the append rule is *usage-first*. A term is
  added when it has been used a few times, or when it is
  sufficiently good that forgetting it would be a loss. State this
  rule in the CL's opening paragraph.
- **Do not over-engineer.** This is a move of text between two
  files plus a deletion. If it becomes more than that, something
  has gone wrong.