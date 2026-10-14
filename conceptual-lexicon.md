# Conceptual Lexicon — the silo's terms of art

**Status:** append-only. Grows as terms are cited.
**Founded:** 2026-10-08, split from `system.md` v2.0.0.
**Anchor:** cited terms in this silo's briefs and decisions resolve here — the semantic anchor the preflight audit checks against.
**Test for inclusion:** could *another* silo use this term? If yes, it is general and belongs in `system.md`'s lexicon (deployed to the agent runtime `AGENTS.md`). If only this silo can use it, it belongs here.

Protocol mechanics (locus tags, wrap-up) and the protocol-wide terms live in `system.md`. This file holds the silo's terms of art only.

**Append rule (usage-first):** a term is added when it has been used a few times, *or* when it is sufficiently good that forgetting it would be a loss. **Every entry cites the document that defines it — no invented definitions.**

---

* **Saramago Barrier**: the gate on slab. A wall of text is admissible in
  the silo only above the barrier — demonstrated mastery where the wall is
  the instrument (Saramago's unpunctuated flow enacts its subject), not the
  failure. The burden of proof sits with the proposer: if you think you're
  up to José's level, try it on. Below the barrier, a slab is decorated
  Stuff; above it, the slab is the Thing. Codified in the authoring
  playbook's short-paragraphs entry, 2026-09-10.

* **Progressive engagement**: one artifact yields a truthful reading at each of
  several viewing distances, and each reading is complete *at its distance* — the
  far read is not a truncated near read, and the near read is not a decoration of
  the far one. **Test:** the **squint ladder** — element-class survival flat
  across a geometric ladder of widths while damage is *marked*; the positive and
  negative controls must pass before any corpus number is read. **Observed
  2026-10-12**, 515 documents at 79/61/43/31 columns: classes survive at
  100/100/100/90 per cent, the mark of damage rises from 92 to 287 documents, and
  the line count inflates 2.4×. **Failure it names:** a class that vanishes as the
  glass narrows, or a loss that is not stated. **Not** a licence for new chrome —
  a terminal has one type size, so distance is bought with glyph density and
  colour block, never with added furniture. **Prior art:**
  `docs/2026-08-26-the-okuda-net.md:120-124` (*the two audiences were one
  artefact… the pauser was the design target*);
  `docs/2026-09-19-the-ornament-that-pays-rent.md` (a restatement re-encodes and
  is free, a new sign must be learned and is not);
  `docs/2026-10-08-the-resize-contract.md` (*a degradation that is lossless or
  marked*, applied to width rather than height);
  `docs/2026-10-12-the-squint-test.md` (the measurement and the instruments).

* **Control surface**: a panel is a **control surface** when its **references
  actuate** — reading it and operating it are one gesture, because the `§NN` a row
  carries is the actuator for the thing that row names. The distinction is a
  *property*, not a class: a panel whose references are painted but inert is a
  **display**, and one whose references resolve is a surface you steer from.
  **Observed 2026-10-13** on `&briefs` in the glass — read a row, `§NN` to
  dereference, `u` to unwind, `99` to promote; the operator's words, *"it is most
  definitely a decision control surface."*
  * **Test:** do the references actuate? If the reader cannot *act* on the thing a
  panel names, the surface is a display and any reassurance it offers is
  decorative.
  * **Failure it names:** the surface that looks actuatable and is not — the
  painted silcrow that jumps nowhere (`ADR-VALIDATED-SILCROWS-044` retired 117 of
  them), and the `§` a retraction must paint back out when the target dies or is
  exiled (`ADR-SILCROW-PATHS-045`).
  * **Prior art:** the physical and audio senses of the phrase — an aircraft's
  aileron, elevator and rudder are the moving parts that act on the medium, and a
  mixing desk is a control surface rather than a display; the panel thesis at
  `docs/2026-08-26-the-okuda-net.md:129-130` (*no interactivity, just structured
  information in a readable form… you decide what to do* — the computer retrieves,
  the human acts); the actuator grammar at `ADR-MAIN-DOCUMENT-031`; and
  **references, not hypertext** (the reference is a map you hold — this is the map
  you can act from).

---

## Register open — the gathering

This file is deliberately thin on the day it was created. The lexicon it was
split from was ~95% protocol-wide terms, and those stayed in `system.md`; the
silo's own terms of art are currently scattered across `docs/`, `playbooks/`
and `decisions/`, and are to be gathered here — each citing its defining
document — under `BRF-SILO-LEXICON`.

Candidates named so far (to be defined **only** from their source documents):

- **callsign**, **silcrow**, **vector** (`§NN` jumps), **the render**, **tier**,
  **register**, **resolver**
- **the three concerns** (compositing / windowing / rendering) — defined in
  `okuda/AGENTS.md`
- **TFS** (*Themes, Fonts, Shite*) — `docs/2026-08-29-tfs-exclusion-principle.md`
- **Gloam** / **GLöam**, **the porch**, **state glyphs**, **the resize contract**
  — `docs/2026-10-08-the-resize-contract.md`

The list is a to-do, not a registry: a candidate enters the lexicon above only
once its defining document is cited.
