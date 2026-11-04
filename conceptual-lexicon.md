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

* **the principal**: the party the silo serves — the human whose decisions are
  recorded, and to whom the record is owed. A **standing**, not an activity, so no
  instrument can share the name (a card reader, an e-reader, a screen reader).
  **Test:** if the sentence can be rewritten as *"the person who decides"*, it is
  the principal; if it can be replaced by *"the rule"*, it is the principle.
  **Not** a stranger: a document addressing an unknown party addresses **a
  stranger** (`docs/2026-08-20-origin-doc.md`), who has no standing and no work
  to be owed. Defined by `ADR-PRINCIPAL-CLERK-067`.
  **Prior art:** the standard name for the party in an agency relationship; the
  protocol's *operator*, which named the same party by an action on a machine and
  narrowed it; `docs/2026-08-30-naming-like-nasa.md` — a name must not lie about
  its referent, and the near-miss with *principle* is the mnemonic, not an
  accident.

* **the clerk**: the agent in its duty to the record — the party that owes the
  writing down. Intention runs principal → clerk; the record runs back, so the
  pair states **direction of intention** in two words. The clerk's memory is the
  ledger, which is continuity by re-reading given a name; and it is a *post*, not
  a person, which is what the protocol asks of a name for the agent. *The agent*
  names what the thing is (the runtime); *the clerk* names what it owes — two
  codes, one referent, each in its own register. Defined by
  `ADR-PRINCIPAL-CLERK-067`.
  **Prior art:** the record-keeping clerk of every registry — the task is old
  enough to have a name, and the name is not a diminution; the two-codes lesson
  at `docs/2026-08-30-naming-like-nasa.md`; the commissioning vocabulary at
  `playbooks/commissioning-playbook.md`, of which this names the other half.

* **Wrap is for prose**: the width law the other three constructs already
  obeyed and diagrams did not. **Wrapping is a claim that the break is
  insignificant** — true of a paragraph, where the newline is the renderer's
  business, and false of anything the author wrote as a fixed shape: a code
  line, a box edge, a table row, a diagram rank. In those, the newline *is*
  structure, so breaking it asserts a shape nobody wrote. The renderer
  therefore has exactly two behaviours and never confuses them: **prose
  wraps, structure elides**, and a structural block that outruns the glass is
  cut with `…` — plus the width it wanted, where the block can say it.
  * **Test:** does the output contain a line break the source did not? For
  prose, that is the point; for any other block, the block is wrong. The
  corollary: a structural block's *height* must not depend on the pane —
  measured on the fixture, block sequence and art-run lengths identical at
  60/80/120/160/200 columns.
  * **Failure it names:** the wrapped code line that reads as two lines; the
  wrapped state machine that reads as a different topology; the engine's
  source box that re-flowed its 272-column content into a 64-column canvas
  and thereby *inflated its own height* (29 lines wrapped, 25 at natural
  width) while claiming nothing had changed.
  * **Prior art:** the style guide's *the diagram never wraps* and *never fake
  a fit* (`docs/style-guide.md`); `ADR-UNIVERSAL-ELISION-050` (the primitive);
  `ADR-TABLE-EDGE-CUT-055` (tables composed at the author's width and cut);
  `ADR-PANE-NOT-CANVAS-069` (the width was never the pane's to decide).
  **Named 2026-10-25** from the operator's words — *we wrap prose, but we do
  not wrap and distort structure*.
  **Promotion owed:** by this file's own test — *could another silo use it?* —
  yes. It belongs in `system.md`'s protocol-wide lexicon and is recorded here
  because the silo is where it was earned and the only file this silo may
  write. Flagged, not silently localised.

* **Scoped doubt**: an elision marker is a **disclaimer, not a report**. Its
  work is not to announce a loss but to *bound* the untrustworthy region — and
  bounding it is what licenses belief in everything else. A block with no
  markers implicitly claims completeness; a block with markers claims
  completeness **for the unmarked part**, which is a claim it can honour. This
  is the real reason a marked fragment beats a refusal: not that half a diagram
  is better than nothing, but that **a scoped doubt is worth more than a blanket
  one**. Stating a loss is a transfer of trust, not only a confession.
  * **The converse is the expensive direction.** Doubt spreads where there is
    nothing to doubt and the marker stops meaning anything: a `…` printed on
    rows whose visible cells hold only padding did not merely add noise, it
    revoked the authority the marked rows had earned, and so cast doubt on the
    rows that were whole. **Over-marking spends the licence.** Measured
    2026-10-25: eight unmarked-in-view rows out of thirteen in a 241-column
    diagram, in a 60-column pane.
  * **Test:** from the artefact alone, can a reader tell of *each* claim whether
    it is whole or partial? A partial block with no marker is an **unpaid
    claim** in rendered form — it asserts a completeness it does not have. A
    whole block sprinkled with markers fails the test in the other direction:
    it teaches the reader to distrust what is intact.
  * **The receipt is the address, and the fact is one.** Where a marker scopes
    doubt, the receipt scopes the *action*, and states it as a measurement
    rather than an instruction: `needs 121 cols` is read by the reader as
    *widen* and by the author as *reshape*, and neither is told which. One
    fact, two parties, two actions — the renderer states the requirement and
    never the remedy, which is what keeps it out of window management.
  * **Prior art:** *state the fact, infer the action* (the CSN rule,
    `BRF-MERMAID-HARD`); **every projection loss is said**
    (`BRF-PROJECTION-LOSSES`); **audit surface** and **attributable structure**
    (the rendered form of the same discipline); the style guide's *never fake a
    fit* — “a faked fit is marked with nothing, which is the difference between
    a reader who widens and a reader who is misled”.
  * **Named 2026-10-25** from the operator's observation that the markers say
    *do not read or believe this row*, "which makes the non-elided lines
    readable and believable". Earned in `ADR-PANE-NOT-CANVAS-069`; the height
    axis is where the licence is hardest to hold, because a fold's marker would
    disclaim the *middle* — see `BRF-DIAGRAM-HEIGHT-AXIS`.
  * **Promotion owed:** general by this file's test — any renderer, any
    partial artefact. Recorded here for the same reason as the entry above.

* **Collapse** (a block *collapses*): a block that renders on **one line** at the
  current glass. The unit of a wide pane's value, and the thing the eye is
  actually buying when it widens: fewer lines, each one a complete thought, so the
  document becomes a column of block-starts rather than a flow to be read through.
  * **Test:** the **collapse share** — the fraction of blocks rendering on one
  line — must rise with the glass. If it does not, the wrap is not following the
  width. Measured 2026-10-26 on four documents: `docs/2026-08-20-origin-doc.md`
  20% at 80 → 46% at 120 → 60% at 200 → 77% at 320 columns, its height falling
  861 → 659 lines; `docs/showcase.md` 38% → 65% → 74% → 83%.
  * **What forbids it:** any fixed measure. `ADR-PROSE-MEASURE-070` held the line
  count constant at 120 / 200 / 400 / 1000 columns, so collapse could not happen
  above 80 at all — this is the property that clamp removed, and the reason its
  reversal (`ADR-PROSE-MEASURE-071`) needed no new mechanism.
  * **Named 2026-10-26** from the operator's reading of a wide pane: *"all our
  paras and list items become single lines. nearly, mostly, sometimes, enough…"*
  — a 60/40 property at 200 columns, not a law, which is why the hedge is part of
  the entry.
  * **Prior art:** **progressive engagement** (the same artefact read at several
  distances, each reading complete); `docs/2026-10-12-the-squint-test.md`.

* **Scan channel**: the two edges of a rendered frame that carry structure rather
  than text — the **left rail** (every block starts in one column) and the
  **ragged right edge** read together with the **line count** (a one-line block is
  short, a three-line block is long, and the raggedness says so without reading a
  word). The wide pane's whole payoff: the eye runs *down* the rail instead of
  *along* the text.
  * **Test:** without reading, can you say where each block starts and roughly how
  long it is? If a change moves the rail or equalises line lengths, the channel is
  broken — and justification, uniform cell padding, centring and a fixed measure
  are one defect class, not four.
  * **Why the rail is load-bearing:** it is the single edge the eye tracks down a
  document, so a moved rail reads as a different document. `ADR-PROSE-MEASURE-070`
  refused centring for exactly this reason, and that refusal is the part of it
  that survived its reversal.
  * **Named 2026-10-26** from the operator's practice of enlarging the pane until
  the cascade still reads — the pane set by *scan quality*, not by line length,
  which is why the width question was never the renderer's to answer.
  * **Prior art:** the squint ladder's element-class survival
  (`docs/2026-10-12-the-squint-test.md`); **collapse** (above), which is what the
  right edge is reporting; `ADR-PANE-NOT-CANVAS-069` (the frame's edges as
  information).

* **Free in prose, careful in art, never lying in a state**: the three-clause law
  of rendered text — one clause per reader, three readers in total. **Prose** is
  read for meaning, and a break inside a sentence is insignificant, so wrapping is
  honest; the failure it names is a *cap*, which made prose unread at scale
  (`ADR-PROSE-MEASURE-071`). **Art** is read for shape, and a wrapped box edge
  asserts a topology nobody drew, so art elides and never re-wraps; the failure it
  names is the *wrap* (`ADR-UNIVERSAL-ELISION-050`). **State** is read by humans
  *and* machines, and an unread mark costs nothing while a misread one costs
  everything; the failures it names are the mark that mirrors, the colour that
  collapses under deuteranopia, and the comment that outlives its system
  (`BRF-IRONY-MARK`).
  * **Test:** each clause must state the observation that would show it violated.
    A maxim whose clauses cannot be falsified is a slogan; this one is admissible
    only because all three can be.
  * **Why one sentence and not three rules:** it is the same question — *what may
    I do to the glass?* — answered for three readers. Split across separate
    documents, it is how a cap was argued as a typography preference and passed
    (`ADR-PROSE-MEASURE-070`). The epigraph of `docs/style-guide.md`'s authoring
    contract is this sentence.
  * **Prior art:** `docs/style-guide.md` (the three rules in paragraphs, before the
    epigraph tied them); **test-bearing** (below); `ADR-PANE-NOT-CANVAS-069`
    (*nothing is re-flowed into a shape it did not have*).
  * **Promotion owed:** the **term** — headword, definition and test — is general
    by this file's own test (*every renderer, every silo*) and belongs in
    `system.md`'s general lexicon, and from there in the deployed `AGENTS.md`.
    **Not this entry**: a promoted term is a *copy adapted to the general register*
    (the seam rule — the receiver owns it and may reshape it), so the silo keeps
    this entry, append-only, annotated when the copy lands, and the general lexicon
    acquires no dependency on `ADR-PROSE-MEASURE-071`, the style guide or
    `BRF-IRONY-MARK`. Recorded here first because that is where it was cited.

* **Eulogy for a missing corpse**: a retirement ceremony for something that was
  **never what the documents said it was**. The obituary is accurate about the
  *funeral* and wrong about the *deceased*: `⋮` was retired from the state
  vocabulary on 2026-10-26, and the autopsy — `unicodedata.category` — returned
  `Sm`, a mathematical operator. It had never been punctuation, let alone a state;
  the coffin was never occupied.
  * **Test:** before a retirement, ask what the thing actually *is*. If the answer
    surprises, the documents were describing a referent that never existed — and
    the defect class is larger than the artefact. It is the same family as the
    comment that outlives its system: `paint`'s receipt invariant, `ADR-070`'s
    `Enforced by:` naming a deleted test, the palette's *traffic-lamp colours*
    falsified by an aubergine.
  * **Named** in conversation 2026-10-26 by the operator, on reading the glyph's
    Unicode category alongside the law above; the phrase is the operator's, the
    autopsy is `BRF-IRONY-MARK`'s.
  * **Prior art:** the name rule — *a designation must not lie about its referent*
    (`docs/2026-08-30-naming-like-nasa.md`); the **unpaid claim**; the palimpsest
    protocol (`playbooks/decisions-playbook.md`), whose step 1 is this question
    asked deliberately rather than at the funeral.

* **The glass owns its ink**: absolute luminance and contrast are the terminal's
to set; the renderer owns only the **relations** among its own roles. 
  * **Test:** does the proposal change how bright the *page* is,
  or how its *parts* read against each other? The first is the glass's, and a
  renderer that sets it is wearing the host's coat; the second is ours, and must
  be **authored** — declared by the principal, never derived from length, density
  or viewport. 
  * **Failure it names:** the renderer-side brightness dial in every
  costume it has worn here — per-block attenuation keyed on line count, a global
  lightness scale, the same knot in OKLCH with a live keybind, and `OSC 10`/`11`
  setting the glass's defaults at runtime. Four proposals, two days, one request.
  
  * **The licensed exception:** a role whose value is a *relation* and which
  ships empty, so no absolute colour is asserted (`body`, `ADR-BODY-INK-072`). The
  terminal cannot express it: prose, a heading and an emphasis are all its
  foreground. 
  * **Prior art:** `decisions/073-the-glass-owns-its-ink.md` (the
  record and the refused family); the three owners (`AGENTS.md`, *Scope
  Discipline*); `ADR-PROSE-MEASURE-071` (the same boundary on width);
  `docs/glow-vs-okuda.md` (*no light mode; light is a palette file we don't ship*).

* **The shrinking draft**: a constraint is real only if the plan gets **smaller**
when it lands. A pass that *grows* the plan — a new mechanism, a new column, a new
actor — is evidence that the boundary has not been found yet, not evidence of
thoroughness. The measurement is not how good the draft reads; it is whether
something was deleted. 
  * **Test:** compare the plan before and after the pass; count
  mechanisms added and removed. Above zero added means the pass supplied a
  *preference*, not a *fact*. 
  * **The diagnostic pair:** reviews that shorten a plan
  supply a **fact about the territory** (the tool has no cursor; the actuator is
  already the silcrow; that is a class of thing) — reviews that lengthen it supply
  a **preference about the map**. Only facts subtract, which is why only facts
  collapse a problem space. 
  * **Failure it names:** *gloop* — rigour spent
  elaborating a mechanism the boundary question would have deleted. The worked
  instance is `BRF-CITED-JUMP`'s first draft: an editor spawn, a line-argument
  column and a cursor rule, all three invented, all three deleted by one sentence
  each — *no cursors*; *the silcrow dereferences a document*; *code files only*.
  
  * **The limitation, so the test is not misused:** *falsification* passes are not
  avoidable. A widened grammar's breakages are **discovered, not enumerated** —
  `buildJumpMap`'s path-keyed dedupe was correct until an address could name a
  line. Those passes add a test and no mechanism, and they are the ones worth
  paying for. 
  * **Prior art:** **subtraction as discovery** (removal is an instrument;
  **verifiability is downstream of subtraction**); `ADR-GLASS-INK-073`'s process
  finding (*ask whose value it is before asking whether the idea is good*);
  `.archive/briefs/2026-10-28-brief-cited-jump.md` (four drafts, each smaller);
  `ADR-ADDRESS-NOT-COORDINATE-074` (the gutter deleted by one constraint).

---

* **TFS** (*Themes, Fonts, Shite*): the exclusion principle — three categories of
  overhead a renderer declines to accommodate. **Themes**: pick high-contrast,
  respect the palette the terminal is already running, close the settings tab.
  **Fonts**: the emulator has one; okuda writes characters to stdout. **Shite**:
  un-factored prose and diagrams with no semantic title get `CSN: too wide`, not
  graceful degradation. The payoff claimed is not an empty room but velocity: a tiny
  parser, a fast engine, low entropy, prose forced to mean something.
  * **The tax, and where it stops.** A theme is a cognitive tax when it changes
  the **mapping from role to meaning** — the reader relearns what the colours
  assert, and the paint stops being a contract. It is free when it changes only the
  **ground** the roles paint on: the roles are the contract, the ground is the
  variable. The distinction is okuda's whole palette design (`src/palette.ts`: roles
  carry meaning, `scripts/contrast.ts`: grounds are measured pairs), and it is what
  makes "it looks a bit bright" a question about the glass rather than the ink.
  **Test:** does the change move a role's meaning, or the ground under it? The first
  pays the tax; the second does not. **Failure it names:** a theme that redefines
  what a colour asserts — the reader's learned vocabulary is silently rewritten, and
  every document's paint becomes a claim they must re-verify.
  **Prior art:** `docs/2026-08-29-tfs-exclusion-principle.md` (the doctrine,
  2026-08-29, the source of the term and its three exclusions);
  `src/palette.ts:17-20` (the prose role ships empty — *"the one role whose right
  value is relative to a surface okuda cannot see"*);
  `docs/2026-10-28-the-ground-you-read-on.md` (grounds measured as pairs, and why
  the honest direction for "too bright" is downward);
  `debriefs/2026-11-01-debrief-the-mark-that-was-already-decided.md` (the measured
  instance — the same rose `§` at 5.2:1 reading bright on a default ground and calm
  on a matched host pair — and the derivation of the test).

* **The pair**: the ink and the ground a page is read on — the two values a
  renderer needs and, in a terminal, does not own. It is the **only unowned
  parameter of the render**: the roles are fixed by the renderer, the bytes'
  destination belongs to the environment, and the pair is the one input chosen by
  nobody in particular and observed by nobody who could object. A theme is a
  family and is chosen; **the pair is two values and is required** — which is why
  it is a precondition and not a preference, and why it survives the exclusion of
  themes (`TFS`).
  * **Why it went unaddressed**: two parties must agree on it and neither owns it.
  The renderer cannot see the glass; the host does not know what the roles mean.
  It is not an error — nothing throws, the document renders — it is an **absence
  of agreement**, and absences do not raise exceptions. So the failure is repaired
  by whatever is at hand, which is why a decade of readers have reached for the
  brightness keys: a uniform scale cannot fix a relational defect, but it does
  produce *relief*, and relief uncorrelated with the cause teaches the wrong one.
  * **Two halves of legibility, and only one is ours.** The **device side** — the
  pair, and the contrast between its two values — is measurable and therefore
  declarable. The **room side** — the surround luminance that pulls an eye toward
  the ceiling — is not observable by any software and belongs to the person's
  lighting. A claim to have made a device "optimally legible" is only ever a claim
  about the first half, and saying which half is the honest form of the claim.
  * **The rule**: **declare it, never compensate.** An unowned parameter must be
  stated where the other party can read it — a pasteable config, a generated
  theme, a printed verdict. A renderer that infers a bad pair and adjusts to it
  makes the bad pair invisible, which is worse than the bad pair. Silence is not
  neutral: an unstated requirement is not a boundary but an omission with a good
  reputation.
  * **Test:** two readings, neither of which is taste — **readable** (every role
    painted on the ground clears a floor) and **navigable** (no role that
    annotates prose out-ranks the ink). `just surface` answers both for any
    candidate pair; `just check` gates the recommended one. **Failure it names:** a
    page that renders perfectly and cannot be read — inverted by a dimmer ink, or
    ghosted by a light ground — with no error anywhere to say so.
  * *Renamed 2026-11-01 → **figure and ground**, which is the relation; "the
    pair" was the count of values and said nothing about what they do.*
  * **Prior art:** `docs/2026-10-28-the-ground-you-read-on.md` (the grounds,
    measured as pairs; `muted` as the binding constraint); Solarized, *Precision,
    symmetry* (`ethanschoonover.com/solarized`, 2011 — palettes defined as
    lightness relationships, body text deliberately not the nearest monotone);
    `decisions/073-the-glass-owns-its-ink.md` (`ADR-GLASS-INK-073` — the renderer
    paints its roles and leaves the default ink *and* the absolute luminance to
    the glass, which is exactly what created the unowned parameter); `debriefs/2026-11-01-debrief-two-readings-one-verdict.md` (the
    control that found two roles not painted on the ground, and the dogfood on two
    live host themes); `explainers/colours.md` (the finding and the base
    requirement, *readable, navigable, recognisable*).

* **The exclusion's precondition**: what an exclusion of choice leaves behind. A
  doctrine that refuses a cosmetic choice — a theme, a font — is refusing the
  *choice*, not the *environment the choice would have controlled*, and that
  environment arrives anyway, supplied by a party who was never told what it must
  supply. So every exclusion carries a **delegation**, and every delegation carries
  an **unstated precondition** until someone writes it down.
  * **Named 2026-11-01**, when the residual under `TFS`'s Themes clause was found:
  *"pick high-contrast, respect whatever palette the terminal is already running"*
  welds an exclusion to a delegation, and the delegation presumes the palette is
  well set. Measured on the app in front of the operator, a shipped theme's
  terminal pair was **1.8:1** — the presumption was false, and had been for as long
  as it was unstated. The residual is `the pair`.
  * **Test:** name the precondition the exclusion delegates. If it cannot be named,
    the exclusion is incomplete, and the omission will be discovered as a defect in
    someone else's theme rather than as a gap in the doctrine. **Failure it names:**
  a doctrine that is right about what to exclude and silent about what it handed
  over — the surrender is invisible precisely because the choice was refused
  loudly.
  * **Prior art:** `docs/2026-08-29-tfs-exclusion-principle.md` (the doctrine and
    its three exclusions); `AGENTS.md` (*three concerns* — the same shape one level
    up: refusing compositing is also a delegation, and it names the delegate);
    `conceptual-lexicon.md` **TFS** and **the pair**.

* **Figure and ground**: the relation a page is read through. The roles are
  **figures**; the page is a **ground**; and what a renderer controls is the
  *contrast between the two*, never either value alone. This is the term **the
  pair** was reaching for and did not name: a count of two values says nothing
  about what they do, and what they do is the thing that breaks.
  * **The failure has a name already: figure–ground reversal.** When the ink dims,
    the accents become the figures and the prose recedes into ground — measured
    2026-11-01, `heading` moving from 0.92 to 1.26 of the ink as the ink itself
    dropped one OKLCH rung. Nothing errors, the document renders, and the page is
    read as "blown out" by an eye that can feel the inversion and cannot name it.
    Naming the defect after its known phenomenon means the argument needs no
    invention — only a measurement.
  * **The beholder's share, and what it costs.** A reader handed an inverted page
    does not fail to read; they *supply* the missing order — by leaning in, by
    narrowing attention, by reaching for the brightness keys. Gombrich's point that
    the viewer contributes to what is seen becomes, here, an uncompensated debt:
    the correction is continuous, invisible, and unbilled, which is why the defect
    can survive decades as a matter of taste. **The design rule that follows: never
    ask the beholder to supply the invariant.** Declare the pair; do not compensate
    for it.
  * **Test:** the two readings (`the pair`'s test) — **readable** (every role
    painted on the ground clears a floor) and **navigable** (no role that annotates
    prose out-ranks the ink). Reversal is what the navigable reading detects;
    extinction is what the readable reading detects. `just surface` answers both.
  * **Ancestry, and why this entry exists at all.** The lesson arrived without its
    address: read half a century ago, retained as a habit rather than as a
    citation — which is *retention working* and *citation failing*, the normal case
    for anything worth keeping. A lexicon's job is to hand the lesson its address
    back, so the next reader can go to the source rather than to us.
  * **Prior art:** **Edgar Rubin (1915)** — the phenomenon: the vase and the two
    faces, one contour, two readings; the **Gestalt school** (Wertheimer, Koffka,
    Köhler) — the doctrine that perception organises into figure against ground;
    **E. H. Gombrich, *Art and Illusion* (1960)** — *schema and correction*, and
    the **beholder's share**: the viewer's contribution to what is seen, which is
    the half a bad surface spends. In-repo: `conceptual-lexicon.md` **the pair**
    (the arithmetic gloss), **the exclusion's precondition** (why the delegation
    went unwritten); `docs/2026-10-28-the-ground-you-read-on.md`;
    `debriefs/2026-11-01-debrief-two-readings-one-verdict.md`;
    `explainers/colours.md`.

## Variables to invariants

- **Variables to invariants**: an **external variable** whose owner has no stake
  in our legibility will be set against us — repeatedly, and each time
  asymmetrically, because they change it once and we discover it in a render. You
  do not negotiate with it. You take it at the **host's own extension point**, and
  it stops being a variable and becomes a substrate we can build on. **Test:** can
  the host's own mechanism still change it? Yes → an invariant we own. No → we
  replaced the host, and we have built a **ventilator**. **Acceptance rule —
  the gain must be a proof, not a dial:** any move that arrives with a flag, an
  environment variable or a new config file has re-acquired a variable, and it
  will feel like progress while doing so. **Two instances earned it:** the ground
  and ink (`ADR-GLASS-INK-073` + `BRF-PAIR-DELIVERED` — delivered into Omarchy's
  own override template, verified with a live switch to a light theme, ground
  unmoved) and the character repertoire (`BRF-FONT-COVERAGE`, `BRF-SYMBOL-PLAIN`
  — measured, bounded, and lowered by a mode rather than inherited from a font).
  *Prior art:* `docs/2026-10-28-the-ground-you-read-on.md`; the **seam rule**
  (a crossing declares itself — which is why "at the host's own extension point"
  and not "in place of it"); **the default shape** (whose boundary conditions the
  modal solution encodes); `debriefs/2026-11-04-debrief-variables-to-invariants.md`.
  **And the class it refuses:** **theme-se** and **font-se** — the tuning,
  the picker, the ligature debate, *shite*'s siblings under `TFS`
  (`docs/2026-08-29-tfs-exclusion-principle.md`). TFS excludes the *choice*, never
  the *definition*: okuda defines one theme and a closed font set of three (one
  recommendation, one alternative, one plain repertoire tier), states them as
  preconditions, and checks them; the host applies them. **Test:** if the doctrine
  ever says *one font*, it will be unmet on the second machine and rot — the set
  must be closed and finite, or it is a preference wearing a precondition's coat.
  *Register:* by the inclusion test this term reads **general** — another silo
  could use it verbatim — and it is recorded here first because this silo paid for
  it in two fights. Promotion to `system.md`'s lexicon is a separate act.

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
