---
date: 2026-11-03
kind: position — perceptual emphasis as the specification, the renderer as one way of meeting it
lineage: the operator's turn, 2026-11-03 — *"it makes our perceptual emphasis the
  primary focus and the okuda design the means of achieving it rather than simply
  doing a star trek wannabe LCARS thingie"*, arriving from two observations in the
  same conversation: agent-authored documents are voluminous *because thorough, as
  it should be*, and reviewing them has to be fast. The framing is the operator's.
  The machinery it points at was already named in this silo, and the split between
  the two is kept below.
status: recorded — a position, with the claim it makes stated so it can be tested
---

# Perceptual emphasis is the specification; the design is one way of meeting it

> ◆ The scarce resource is the reader's attention. A renderer is the instrument
> that spends it, and an instrument is judged by what it lets you **ignore** —
> not by what it shows.

## The inversion

The ordinary order of work builds the thing and discovers the perceptual
consequence afterwards: a renderer is written, and legibility is whatever falls
out. This record puts the order the other way round, and it is worth stating
because the order is the whole content.

**The perceptual property is the specification. The design is the means.** A
change is admissible when it serves an emphasis the reader is owed, and it is
refused when it serves the renderer's own convenience. The test is one line:
*name the perceptual property this change serves.* A change that cannot name one
is the default shape wearing a diff.

That is not a slogan; it is the reason the squint ladder exists as an instrument
rather than an opinion, and the reason a rendered frame can be judged before
anyone agrees with the argument inside it.

## What is already an instrument, and what this record therefore is not

Four properties were named before this record existed, each with its own test.
The inversion above does not replace them — it says **which of them wins when
they disagree**, and the answer is always the perceptual one.

| term | what it holds | where it is defined |
| --- | --- | --- |
| **control surface** | a panel whose references **actuate** is a surface you steer from; one whose references are painted but inert is a display | `conceptual-lexicon.md:42` |
| **progressive engagement** | one artefact yields a truthful reading at each viewing distance, and the far read is not a truncated near read | `conceptual-lexicon.md:22`, tested by `docs/2026-10-12-the-squint-test.md` |
| **scan channel** | the left rail, the ragged right edge and the line count carry structure without a word being read | `conceptual-lexicon.md:185` |
| **figure and ground** | the rank a page is read through — not two colours, a hierarchy | `conceptual-lexicon.md:408` |

So this is a **reference, not a restatement**: three of the four are already
load-bearing, and restating them would re-encode what is working (`the ornament
that pays rent`, `docs/2026-09-19-the-ornament-that-pays-rent.md`). What is new
here is the ordering, the refusal below, and one claim about what the instrument
is *for*.

## The LCARS refusal — the name's referent

The tool is named after **Michael Okuda**, and the honest reading of what he did
is not the neon. It was *panels legible under stress*: one job per mark, a
declared legend, colour as subsystem signal, and a layout that survives being
glanced at by someone who is busy. The chrome was a costume worn by a working
discipline, and the costume is the part that photographs well.

Naming the tool after the designer therefore commits it to the practice, not the
fiction. A *"Star Trek wannabe LCARS"* build would make the designation lie about
its referent — the failure this silo already refuses in names
(`docs/2026-08-30-naming-like-nasa.md`, the LEM → LM veto). Two consequences,
and the split between them is the useful part:

- **The palette may pay the homage**, because colour-as-subsystem-signal *is* the
  practice: `src/palettes/okuda.json` maps roles to referents (heading = Okuda
  slate blue, badge = black on amber) and the mapping is admissible for exactly
  the reason the practice was good — each colour answers *what is this*.
- **The layout may not.** No curvature, no invented furniture, no glow for its
  own sake, no panelled borders standing in for structure. Rounded corners are
  not legibility; they are a promise that the medium is a canvas, and a terminal
  is a glass of fixed cells. A mark earns its place by carrying state — *a mark
  that duplicates existing structure is noise, and noise is the enemy of a
  glance* (`docs/2026-10-06-the-shared-artifact.md:92`).

## Why agent documentation is the workload, and why it is not a length problem

The target author is the agent, the reader is the human, and the transaction is a
**decision**: the agent has done the work and needs a human to choose. Agent
documents are voluminous because they are thorough, and thoroughness is correct —
the argument is the evidence, and a summary is how the argument gets lost.

The defect is not length. It is **uniformity**: every paragraph carries the same
ink, so thoroughness arrives at equal weight, and equal weight is why scanning
finds nothing. A reader can only move quickly through a document whose parts
differ; where every line shouts at the same volume, the reader has to read them
all to find the three that matter.

So the instrument's work is **rank**, not selection: the ask at one salience, the
evidence at another, the process at a third. The palette already carries that
rank and does not need extending — ink is the document, rose+bold is the control
channel and nothing else (`src/tui.ts:690-694`), muted is state. *Subtracting
contrast from the parts that can wait* is not the same as subtracting the parts.

## The claim, stated so it can fail

> **okuda does not make agent documentation faster to read. It makes skipping
> safe.**

Volume is the author's, not the renderer's, and a renderer that shortened it
would be lying about the work. What a renderer can guarantee is that a reader who
skips a section is still **correct** about what it said — and that guarantee is
only available when the document declares its own shape. Fast review is a
consequence of safe skipping, and safe skipping is a property of the document,
not of the paint.

**Test:** hand a reader a real handover with the instruction *"go to the
decision"*, then check whether they are wrong about anything they passed on the
way. **Falsified** if reviewers who skip are routinely mistaken about what they
skipped — that would make the rank decorative, and the claim about the instrument
false along with it.

## Proposal — three instruments, none of them new constructs

Marked *proposal*: none is built.

| instrument | what it shows | why it cannot drift |
| --- | --- | --- |
| **the ask**, in a fixed place | the one thing the reader must decide | it is a conditional element: present exactly when an ask exists, absent otherwise |
| **the shape, before the reading** | how many parts, and what each is for | derived from the headers at render time, so it cannot disagree with the body |
| **rank** | decision and evidence at ink, process at muted | it is the channel the palette already carries |

The second is the one worth arguing about, and the argument is the house's own:
**derived, not specified.** A contents list that someone types can be wrong; one
computed from the headers cannot, and it costs a walk over a structure the
renderer already has.

## How this arrived — and what that says about the record

Two positions in this conversation were re-derived before they were written
down: this one, and the shared artifact's statement of purpose
(`docs/2026-10-06-the-shared-artifact.md`), which already holds *purposive* — *it
exists to change a decision, not to be produced* (`:32`). Independent derivation
is good evidence a position is right. It is equally good evidence the position is
not in the path an agent is required to read, because *a rule that gets
rediscovered is a rule with no test* (`ADR-PERIMETER-039`).

That is why this is a record and not a lexicon entry. The lexicon's append rule
is usage-first — *a term is added when it has been used a few times, or when it is
sufficiently good that forgetting it would be a loss* — and the candidate term
here has one use. When a second document cites the inversion, the term earns its
entry. Writing it now would be the parallel store the house refuses.

## What this is not

- **Not a licence for chrome.** *Progressive engagement* carries its own refusal
  (`conceptual-lexicon.md:22`): a terminal has one type size, so distance is
  bought with glyph density and colour block, never with added furniture.
- **Not a dashboard.** No vitals strip of numbers nobody acts on; a metric that
  changes no decision is decoration with a decimal point
  (`docs/2026-10-06-the-shared-artifact.md:32`).
- **Not a theme.** The palette is the instrument's ink, and it is already gated:
  `just surface --gate` holds 21 roles on the ground.
- **Not a claim that the renderer improves comprehension.** That is untested and
  stated as untested. The command is *skip safety*, which is measurable, not
  *understanding*, which would need readers this silo does not have.

## References

- `conceptual-lexicon.md:42` — *control surface*; the panel term, already named
  2026-10-13, with the standing test *do the references actuate?*
- `conceptual-lexicon.md:22`, `:185`, `:408` — *progressive engagement*, *scan
  channel*, *figure and ground*: the perceptual machinery this record orders
  rather than invents.
- `docs/2026-10-12-the-squint-test.md` — the far read, measured.
- `docs/2026-10-06-the-shared-artifact.md:32`, `:92` — *purposive*, and one job
  per mark.
- `docs/2026-08-30-naming-like-nasa.md` — the designation must not lie about its
  referent; applied here to a name the silo already bears.
- `.archive/briefs/2026-08-25-brief-okuda-palette-and-chrome.md:54-68` — the
  LCARS mapping as it actually exists, confined to the palette.
- `system.md` — **ventilator**, **wading**: what a panel is not.
