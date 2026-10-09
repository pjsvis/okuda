---
date: 2026-10-08
kind: register — adjacent tools seen in the wild, each entry stating its substrate, its accessibility posture, and which of our exclusions it sells; append here, one entry per sighting
lineage: the operator's sighting of Markdific, 2026-10-08 — *"looks like we are not the only ones thinking about markdown rendering"* — and the framing this register adopts: *"the first of the new markdown tools that we have seen, ie developed after and probably by AI"*
status: open — a register, not an argument. Grows by sighting.
---

# Prior art — the AI-markdown tool wave

> A place to put the adjacent tools when they turn up, so the next one is
> compared against a written baseline instead of a memory. One entry per
> sighting: what it is, what substrate it owns, its accessibility posture, and
> which of **our declared exclusions** it sells. No scoreboard. The purpose is
> calibration, not competition.

## Why a register

`docs/2026-08-29-tfs-exclusion-principle.md` named the cosmetic surface
(*Themes: FO. Fonts: FO.*) as an opportunity cost. A register tests that
claim against the world: if the adjacent tools are selling the things we
excluded, the exclusion is holding. If they are selling the things we kept, the
exclusion needs revisiting.

The second reason is cheaper: seeing the same shape twice is what turns a
sighting into a category. One tool is an anecdote; a register is evidence.

## Entry 1 — Markdific (observed 2026-10-08)

**What it is.** A desktop Markdown viewer and editor for macOS, Windows and
Linux. One-time $12.99 for the full app; reading is free; 14-day trial. WYSIWYG
and source editing with live preview, outline, split view, macOS Quick Look.
Source: <https://markdific.com/> (read 2026-10-08).

**Substrate — it owns all three concerns.** It **composites** (pasted images are
kept with the file on save), **windows** (its own chrome and presentation mode),
and **renders**. okuda owns only the third and delegates the other two by
constitution (`AGENTS.md`, three concerns, three owners). This is the
structural difference between the two, not a feature gap.

**Rendering, and the opposite Mermaid answer.** It renders `mermaid` as
**graphics** — sequence diagrams, pie charts — plus LaTeX, footnotes, GFM
alerts (`> [!NOTE]` as coloured callouts), front-matter as a property card, and
syntax-highlighted code with a copy button. okuda renders `mermaid` as **ASCII**
through `mermaid-to-md`. Each is correct for its medium: a GUI can rasterise,
and a terminal that shipped a rasteriser would be lying about what it is.

**Accessibility posture: themes and fonts.** *"Themes and fonts for comfortable
reading. Pick a theme and a typeface that suit your eyes."* That is the whole
of it. No tempo contract, no speech or braille path, no address class that
refuses an involuntary repeat. This is the register's most useful row: it says
what a competent, current, commercial markdown tool considers accessibility to
be.

**Which of our exclusions it sells.** Themes and fonts — named and refused in
`docs/2026-08-29-tfs-exclusion-principle.md`. Export to PDF, Word and HTML —
that is compositing and production, the environment's job under the three
concerns (pandoc's ground). Presentation mode — windowing, the host's. **The
premium feature list is close to a verbatim list of our refusals**, which is
the exclusion principle meeting the market.

**It cites the same wave we are on.** Its FAQ: *"AI tools like ChatGPT, Claude,
and Gemini export their answers as markdown, which is why you see more `.md`
files than ever."* The arena is agreed; nothing about it follows from a rival's
existence.

## The category hypothesis — the part the operator supplied, and it is *marked*

The operator's framing: this is the **first of a new wave** of markdown tools,
*"developed after and probably by AI."* Recorded as a hypothesis, not a fact —
per the silo's *cite or mark* rule, and per Hume:

- **"Developed after" — supported.** The product targets the AI-output wave in
  its own copy, and the category did not exist in this form before it. This part
  is fair to treat as observed.
- **"Probably by AI" — unverified.** Inferred from register, timing and copy
  style, not evidence. **No instrument exists to check it**, and it is not
  load-bearing for the register's purpose. Marked, so a later reader does not
  inherit an assumption as a finding.

**The implication, if the category holds.** If a competent GUI markdown tool can
now be produced cheaply with AI assistance, the commodity layer **cheapens
fast** — and an AI-produced tool is drawn from the mean of its training
distribution, which is exactly themes, fonts, split view and PDF export. The
wave will therefore converge on sameness. That is an argument *for* the
exclusion principle and *for* the practice: the non-commodity is the part not in
the training-data mean — the reader's tempo, the measured geometry, the
accessibility contract, the provenance discipline. It is also an argument
against ever benchmaxxing against such a list.

## The rows every future entry should fill

- What it is — substrate, price, platforms, date observed.
- Which concerns it owns (compositing / windowing / rendering).
- Its rendering choices where they differ from ours (diagrams, callouts, export).
- Its accessibility posture, in its own words.
- Which of our exclusions it sells.

## Related

- `docs/2026-08-29-tfs-exclusion-principle.md` — the exclusions this register tests
- `AGENTS.md` — the three concerns, three owners
- `docs/2026-10-06-the-shared-artifact.md` — the practice, and the questions we would like answered
- `docs/2026-08-25-what-it-feels-like.md` — the perceptual claim a GUI tool does not make
