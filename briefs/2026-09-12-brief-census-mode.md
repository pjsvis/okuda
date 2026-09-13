---
type: Brief
callsign: BRF-CENSUS-MODE
---

# Brief: Census mode — the mentions-inclusive map, as a reader's opt-in

**Date:** 2026-09-12
**Status:** Open
**TD:** td-39ce31
**Lineage:** the doc-ref gold dogfood (td-38bec6) surfaced the
actability asymmetry — a decision cited as a filename gets no
silcrow, cited by callsign it does; use-vs-mention
(`docs/2026-09-10-use-vs-mention.md`) adjudicated the default;
this brief proposes the opt-in that doctrine left room for.

## Objective

An opt-in render mode that silcrows **every** local file reference:
bare `.md` paths join callsigns and md links in the jump map. The
default render is unchanged — the uses map, satisficing, exactly as
adjudicated. The census is a reader's choice, made per-instance,
and it exists for one reason: accessibility.

## Why

- **The dive is sighted-assuming.** The mention's designed actuator
  is typing the path into the search — cheap for eyes that can scan
  a Related section, expensive for a screen reader walking a
  40-character filename character by character. The two-digit
  grammar is the blind reader's cheap path.
- **In the spoken render, mentions are inaudible affordances.** The
  TTS pipeline announces silcrows (the spoken word "silcrow" is the
  affordance — ADR-033's brief); a Related section written in paths
  announces nothing. The census makes the references speakable in
  the one render where they are currently silent.
- **Precedence is already on the books.** Accessibility outranks the
  on-demand discipline (ADR-032's own amendment logic). And the
  proposal does not fight use-vs-mention — it takes its maximizer
  critique seriously and answers it: maximization imposed is
  invitation-soup; maximization *chosen by the reader* is the
  reader satisficing their own intent.

## Design questions (the brief's real content)

1. **Dedup must survive the census.** One destination, one silcrow
   is the map's invariant; today dedup is by target *string*, and a
   document cited as both `ADR-032` and
   `decisions/032-repeated-digit-actuators.md` is two strings. Lean:
   normalize at the edge — resolve callsigns to paths before the
   map is built (the resolver already lives at
   `opts.resolveTarget`; the question is which layer owns
   normalization). The alternative — accept doubled silcrows —
   breaks the citation convention silently. Rejected.

2. **The cap stays the invariant.** In census mode the map inflates
   toward the 80-address buffer; discovery stops at `MAX_REFS`
   and must fail *visibly* — the reader who chose the census knows
   when the census ran out. Design the overflow signal honestly
   (a footer flash is the established failure surface).

3. **Naming.** Default: the **uses map**. The opt-in: **census**
   (enumeration vs. satisficing). Alternatives considered: "all
   refs" (describes the mechanism, not the intent); "level 1
   links" (invents a tier system the lexicon doesn't have — use
   and mention already name the split). The names ride the brief
   review.

4. **The toggle.** A doubled-pair verb from the ADR-032 pocket —
   the accessibility canon hosting an accessibility verb — plus a
   launch flag for set-and-forget operation. Binding is data
   (one-line table edit, per the keymap discipline); the pocket
   ledger gains the candidate. No decision yet on which token.

5. **Discovery mechanics.** The bare-path channel already exists as
   a regex (render.ts paints gold mentions with it); behind the
   flag, `scanReferences` admits it as a third channel. Fences
   still excluded, frontmatter still excluded, token boundaries
   still honored — the census inherits every never-vector rule.

## Non-goals

- No change to the default render. The uses map stays the floor;
  the appetite guard stands for everyone who doesn't ask.
- No speech code in okuda, and no narration (ADR-036); this is
  actuation-side only.
- No authoring-convention pressure — the census reads the corpus
  as written; promotion (use-vs-mention's rule) remains the
  author-side valve.

## Sequencing

This brief is the decision instrument. If accepted: an ADR (the
discovery contract gains its first mode-conditional entry — ADR-031
amended, ADR-021's never-vector list annotated), then the
implementation as a separate brief-scale task.

## Related

- ADR-032 — accessibility outranks the on-demand discipline; the
  pocket that would host the toggle
- ADR-031 — the main document and the map this mode inflates
- BRF-TTS-TEMPORAL — the spoken render where mentions go inaudible
