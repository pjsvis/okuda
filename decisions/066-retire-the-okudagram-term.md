---
type: ADR
callsign: ADR-RETIRE-OKUDAGRAM-066
date: 2026-10-14
---

# Decision: Retire the okudagram term — the render, the frame, and the diagram

**Date:** 2026-10-14
**Status:** Accepted
**Enforced by:** `scripts/retired-terms-lint.ts --gate` (no occurrence in a living path), `tests/retired-terms-lint.test.ts`

## Context

`okudagram` names our own output with someone else's work, and it does the
attribution the wrong way round: a **prefix** asserts that we are making more of
them, where a **citation** would say where a design came from. This silo is a
renderer, not a fan site; what it took from Michael Okuda's screens is a
*property* — the readable range of distance, detail, structure and colour — and a
property is cited once in prose, not worn on every artifact.

Worse, the word never had one referent. The corpus **defines it twice, and
differently**:

- `explainers/concepts-and-terms.md` — *"An **okudagram** is a composed screen:
  the document as okuda has laid it out for your current terminal width."*
- `src/frames.ts`'s head comment — *"okudagram (the diagrams)"*, with
  `okudaframe` as a third word for the header-to-header unit.

A reader landing on either definition means something different by the same word,
with no way to tell which is canon. That is the **LEM → LM veto** in its purest
form (`docs/2026-08-30-naming-like-nasa.md`): a name must not lie about its
referent — except LEM at least had one referent it could fail to describe, and
this word has two.

And the slot it filled was real. `ADR-RENDERER-READER-029` disambiguated the
human (**the reader**), the software (**okuda** / **the renderer**) and the
device (**the terminal** / **the glass**) — and left the **composite**, the
bytes as laid out, unnamed. A fan word colonised the gap because the gap was
there. Retiring the word without naming the thing would invite another.

## Decision

**Retire `okudagram` and `okudaframe` from the living surface, and complete
`ADR-RENDERER-READER-029` with a fourth role: the composite is *the render*.**

| Role | What it is | Term |
|---|---|---|
| The human | reads, forms opinions, decides | **the reader** |
| The software | renders markdown to bytes, fast | **okuda** / **the renderer** |
| The device | displays the bytes | **the terminal** / **the glass** |
| The composite | the bytes as laid out for this width | **the render** |
| One portion of it | a header and its content, to the next header | **the frame** |
| A drawing inside it | a mermaid fence rendered to ASCII | **a diagram** |

- **The render** is the composite — "the render is a pure function of source,
  width and palette" is already the corpus's own construction, so the name is
  derived from the role, not invented.
- **The frame** stays as `frames.ts` and `ADR-MAIN-DOCUMENT-031` define it;
  `okudaframe` is simply the same word with an attribution prefix bolted on.
- **A diagram** is the mermaid fence rendered to ASCII — the referent the head
  comment was reaching for.
- **Okuda is cited, not prefixed.** `README.md`'s *"Named for Michael Okuda"*
  stays, and the inspiration is a property named in prose.

**The residual is stated, so the boundary is checkable.**
`ADR-RETIRE-OKW-018` set the rule for this class: living documents take the plain
name, and *"documents dated before <date> use a term no longer defined — this ADR
is its definition and grave marker."* So the term survives, legitimately, in:

1. **date-prefixed documents** — `briefs/`, dated `docs/`, and the record tiers
   (a date is a record's address, and history is not rewritten);
2. **`.archive/`** — the permanent record;
3. **callsigns** — `BRF-PAGED-OKUDAGRAM`, `BRF-OKUDAGRAM-STEP`. Callsigns are
   data (`ADR-CALLSIGN-DATA-024`) and are cited across the corpus; renaming
   them would break the checksum that keeps citations honest;
4. **a path into a dated record** — `docs/2026-08-27-okudagram-scratchpad.md` is
   an address, not a use, and a living document must be able to cite history by
   the name history has;
5. **this ADR, its brief, and the ledger entry that raised it** — a retirement
   must be able to name what it retires.

Everything else is a barnacle, and the lint fails on it.

**Two files are renamed, and the mapping is here** because a dated record still
points at the old names and a dated record is not rewritten:

- `scripts/okudagram-probe.ts` → `scripts/frame-probe.ts`
- `explainers/the-okudagram-as-context.md` → `explainers/the-render-as-context.md`

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Keep the word and define it once, canonically | Two definitions is the evidence, not the illness: the word is doing three jobs, and one canonical definition would simply choose which two referents stay unnamed. The fan register is the other half |
| Invent a fresh replacement name | Swaps one barnacle for another. Two of the three names already exist in the corpus with definitions; the third is a role `ADR-RENDERER-READER-029` left over |
| Sweep every occurrence, dated records included | Rewrites the record. `ADR-RETIRE-OKW-018` already ruled this: the history keeps the word, and the ADR is its grave marker. A silo that edits its own past cannot be cited |
| Rename the callsigns too | Callsigns are data and are cited throughout; a rename breaks the checksum and every citation at once. The retirement must not cost the record its references |
| Delete the two files named after the term | Their names are the only problem; deleting dated records to fix a filename is the strongest possible version of rewriting the past |

## Consequences

**What became easier:**
- Three referents, three names. A reader no longer has to guess which
  "okudagram" a sentence means.
- Attribution is honest: Okuda's work is cited in prose as an influence, and
  nothing of ours wears his name.
- The gap in `ADR-RENDERER-READER-029` is closed, so a fan word has no empty slot
  to colonise next.

**What became harder:**
- Two dated records and one debrief point at paths that have moved
  (`docs/2026-10-12-the-squint-test.md`, `docs/2026-09-03-the-mental-map.md`, and
  a debrief's reference list). They are not rewritten; this ADR is the map.
- The lint needs a stated allow-set, and an allow-set can rot. It is small, and
  the lint prints it.

**Constraints this imposes:**
- No new living document uses the term. The lint is the gate, and the check is
  mechanical: `grep -ri okudagram` minus date-prefixed paths, `.archive/`,
  callsigns and this ADR is empty.
- The composite is **the render** in running prose, and the role table in
  `ADR-RENDERER-READER-029` carries the fourth row.

## Related

- `BRF-RETIRE-OKUDAGRAM` — the brief this decision is made under
- `docs/2026-08-30-naming-like-nasa.md` — the LEM → LM veto, attributed
- `decisions/018-retire-the-okw-term.md` — the precedent: the protocol for this class
- `decisions/029-renderer-reader-glass.md` — amended in place with the fourth role
- `decisions/024-callsigns-are-data.md` — why the callsigns keep the word
- `docs/ideas.md` — the ledger entry that raised this and was promoted
