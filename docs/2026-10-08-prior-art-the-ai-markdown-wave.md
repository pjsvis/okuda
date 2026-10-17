---
date: 2026-10-08
kind: register — adjacent tools seen in the wild, each entry stating its substrate, its accessibility posture, and which of our exclusions it sells; append here, one entry per sighting
lineage: the operator's sighting of Markdific, 2026-10-08 — *"looks like we are not the only ones thinking about markdown rendering"* — and the framing this register adopts: *"the first of the new markdown tools that we have seen, ie developed after and probably by AI"*. **Extended 2026-10-16:** Entries 2 and 3 — the operator's question *"we have the SpaceXAI diagraming code which we use to convert mermaid to markdown; are there any other things out there in the world that we should consider using"*, answered as sightings rather than as a shopping list. Both entries were read from their own repositories on the sighting date. **Extended 2026-10-17:** Entry 4 — the operator's link to the ZenNotes TUI page (2026-10-17), and the judgement it drew: *"not worth the candle... you can only use ZenNotes to get the extras"*. This is the first entry that is a **probe** rather than a read: the shipped binaries were run against a throwaway vault. The full review is `docs/2026-10-17-not-worth-the-candle.md`.
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

## Entry 2 — mermaid-ascii (observed 2026-10-16)

**What it is.** A terminal renderer for Mermaid source, written in **Go**, with a CLI, a
local web UI and Docker packaging. MIT. It reaches a machine as a prebuilt binary per
release, a `go build`, a Nix flake, an Arch `PKGBUILD`, or the Docker image. Source:
https://github.com/AlexanderGrooff/mermaid-ascii (read 2026-10-16).

It is registered because it is the nearest sibling to the thing we built: it occupies the
same *shape* — Mermaid on stdin, art on stdout, no browser, no image export.

**Substrate — rendering only.** It composites nothing and windows nothing. It is a pipe
with a parser behind it, which is the whole of its footprint and the reason it can be
compared to `mermaid-to-md` at all.

**Rendering, where it differs from ours.** It emits **both** character sets we bake:
Unicode box-drawing by default, and a plain-ASCII form under `--ascii` (`+---+`, `---->`,
`v`). It claims three families — graphs/flowcharts, sequence diagrams and
entity-relationship — and lists **state and class diagrams in its own TODO**, against the
five `mermaid-to-md` renders. **Its README contradicts itself**: subgraph layout, `graph
TD`, labelled edges, `classDef` and multiple-arrows-on-one-line appear in both the
supported list and the not-yet-supported list. Real coverage is therefore **unverified**,
and would take a probe rather than a read.

The sharp difference is the width behaviour. `--max-width` retries the layout with compact
spacing (`paddingX=1`, `paddingY=1`), and its README states that content is **never
wrapped, truncated, cropped or removed**. Where okuda refuses — `CSN: too wide`, the space
reserved, the dimension stated — this shrinks the diagram until it fits and says nothing.
That is the ventilator at the diagram layer in its politest form: a diagram quietly made
smaller, with no marker that anything was given up. `briefs/2026-08-29-mermaid-hard-boundary-CSN.md`

**Accessibility posture: none stated.** No speech path, no tempo contract, no description,
no address discipline. Colour is opt-in and off by default — the correct default, and the
only accessibility-adjacent choice in it.

**Which of our exclusions it sells.** None of the three. No themes, no fonts, no export
formats, no presentation mode. By the register's test this is a **null row**: it is not
competing for the surface we excluded, so it neither confirms nor threatens the exclusion
principle. It is here for the register's other reason — one tool is an anecdote, and this
is the second sighting in the category.

## Entry 3 — beautiful-mermaid (observed 2026-10-16)

**What it is.** A **TypeScript** library from Craft (craft.do), MIT, v1.1.3, built to power
diagrams in "Craft Agents". Zero DOM dependencies, pure TypeScript, dual exports — raw
`.ts` for Bun consumers and a built ESM `.js` for Node, webpack and vite. Source:
https://github.com/bitdata/beautiful-mermaid (read 2026-10-16).

**Substrate — rendering only, and it renders twice from one parse.** `renderMermaidSVG()`
and `renderMermaidASCII()`. No compositing, no windowing.

**Rendering, where it differs from ours.** It is **a port of Entry 2's engine**: its README
states the ASCII renderer is "based on mermaid-ascii by Alexander Grooff. We ported it from
Go to TypeScript and extended it." It claims six families — flowchart, state, sequence,
class, ER and XY charts — with layout from **ELK.js**, run **synchronously** through what
it calls a "FakeWorker bypass". It advertises "100+ diagrams in under 500ms" and "no
`await`, no promises".

Two of those claims matter and neither is verified. The **synchronous** one is
architectural: this is the only candidate that is **in-process**, which is the one shape
`docs/2026-10-05-the-single-binary-is-a-provisioning-question.md:126-142` priced rather
than dismissed — the 13 ms bash wrapper and the 1.5 ms fork floor both disappear. The
**speed** one is a README number with no method, no conditions and no owner: unpaid by
clause 1, classified exactly as that document classifies the vendor's "sub-30 ms to first
paint". Its ASCII fidelity on our 70 fences is **unmeasured**.

**Accessibility posture: none for the reader.** It has **15 built-in themes**, "any VS Code
theme" through Shiki, and live theme switching by CSS custom property. That is the whole
of it, and it is a cosmetic story.

**Which of our exclusions it sells.** **Themes and fonts** — named and refused in
`docs/2026-08-29-tfs-exclusion-principle.md`. Fifteen themes plus the VS Code theme corpus
is the exclusion principle meeting the market, as with Entry 1.

**The row that is not like the others.** It also sells something we **kept**: a mermaid
fence rendered as text art, in-process, with no viewer dependency. By the register's own
test — *if they are selling the things we kept, the exclusion needs revisiting* — this is
the first entry that asks a question instead of answering one. The answer is narrower than
the tool. The ASCII renderer has been commoditised by a port of a port, so **the renderer
was never the non-commodity**. What is absent from both entries is the rest of the seam:
the freshness check that makes art fail loudly when it stops matching its source, the
elision that reserves the space a too-wide diagram would have taken, and the reader keyed
on the fence info string that already sends one fence to art and another to prose.
`decisions/004-art-first-layout.md`, `src/render.ts:574`

## Entry 4 — ZenNotes CLI + TUI (observed 2026-10-17)

**What it is.** A terminal notes application — TUI, scriptable CLI and MCP server in one
binary — sitting on a folder of markdown. Go, MIT, v0.8.0. macOS (arm64/x86_64), Windows,
Linux; 9.3–10.5 MB per platform, static, no runtime. Homebrew, `go install`, or a direct
download. Source: https://zennotes.org/tui (probed 2026-10-17).

**Substrate — the vault, and a hidden `.zennotes/` beside it.** Unlike every other entry,
this one owns compositing and windowing as well as rendering: `zn capture` from any shell,
`zn open -n` for a second desktop window, and eleven `zn server` verbs for a self-hosted
sync server. It is the first entry that is a **platform** rather than a pipe, and the
three-concern test is what names it.

**Rendering, where it differs from ours.** Glamour — *"the renderer behind Glow"*
(`README.md:605`) — with `zen` as a built-in alternative and custom JSON style sheets.
Mermaid fences draw **as text through a pure-Go renderer**, or as pictures when `mmdc` is
installed (`README.md:615`). That is a thing we kept, sold by a competitor — Entry 3's
question asked a second time, and answered the same way: the ASCII renderer is not the
non-commodity.

**Accessibility posture: an input posture, not a reading one.** which-key, a `Ctrl+G`
palette, `F2` context actions, and Vim motions *or* a plain editor — stated, good, and
verified in `--help`. No speech path, no tempo contract and no colour contract are stated;
`NO_COLOR` is honoured. Not tested with a screen reader, so this is an absence of
*statement*, not of provision.

**Which of our exclusions it sells.** Themes, keymaps and export styles — the same row as
Entries 1 and 3. The row it adds is the interesting one: **the workflow**. Tasks, boards,
calendars, databases, comments, templates, daily notes. Those were never on the exclusion
list, because we never considered them; they are the veto arriving from the other
side.

**The row worth carrying out of this register.** What a tool *writes* matters more than
what it displays. Nearly all of ZenNotes is inline markdown — `@status:` on the checkbox
line, `status:` in frontmatter, `.base` folders whose rows are `.md` — which makes it a
**dialect**, not a hostage. The exception is comments:
`.zennotes/comments/<note>.comments.json`, keyed by filename, demonstrated to orphan on an
ordinary rename. Probe, tiers and verdict: `docs/2026-10-17-not-worth-the-candle.md`.

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
- `docs/2026-10-17-not-worth-the-candle.md` — Entry 4's full review: the footprint test,
  and Glow as the zero-footprint control
