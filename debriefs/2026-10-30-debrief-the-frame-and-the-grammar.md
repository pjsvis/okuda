---
type: Debrief
callsign: DBF-FRAME-AND-GRAMMAR
date: 2026-10-30
tags: [instruments, math, render, decisions, measurement, width]
agent: pi (ses_94d0e6)
environment: local
briefs: [BRF-MATH-GLYPHS]
---

# Debrief: The frame and the grammar — one design that needed nothing, one that needed 18 lines

**Date:** 2026-10-30
**Status:** Done — 4 commits, 920 tests, `just check` rc=0. One follow-on task
open by choice (the declined-span mark), one decision landed
(`ADR-MATH-GRAMMAR-076`).

## What was asked, and what it turned into

Two questions in one sitting, and both of them contained a premise that had to be
corrected before the work could start.

*"Have a look at the instrument frame"* — a position paper arguing okuda already
admits an end-of-pipe deployment with zero renderer changes. The claims resolved, but
one sentence did not: **right-anchored numerics do not give column stability across
frames**, because `colWidth` is derived per frame from that frame's body
(`src/render.ts:2153-2173`). The property is real, free, and the compositor's — the
pipe fixes the field width and `ADR-022` supplies the anchoring. The paper's count
survived; its mechanism did not.

*"There are lots of equations and we do not do anything with them"* — also half wrong.
okuda transliterates `$...$` through a closed 17-row table (`BRF-MATH-GLYPHS`), with an
all-or-nothing gate. It declined that document because 18 commands were outside the
table — not because there was no machinery.

Both corrections cost about the same: one grep of a line-numbered claim, one census of
a corpus.

## The numbers

| measure | before | after |
|---|---|---|
| spans translated in the evidence document | 97 / 124 | **119 / 124** |
| relation-bearing spans translated | 9 / 23 | **23 / 23** |
| `MATH_GLYPHS` rows | 17 | **37** |
| tests | 912 | **920** |
| new dependencies | — | **0** |
| packages installed to answer the question | 2 | **0** (both removed) |

The five spans still literal are `$V$`, `$A$`, `$B_4C$`, `$T^4$`, `$T$` — command-free,
so the currency guard declines them, exactly as it declines `costs $5 and $10`. That is
unchanged behaviour and now the document's only residue.

## The investigation that was thrown away

The external-executable route was measured rather than argued, which is why the refusal
is cheap to hold. `texmath` and `groff` were installed, tested, and uninstalled in the
same session; the instrument is named in the ADR precisely because it is no longer there
to be asked twice.

| route | result |
|---|---|
| `texmath` via `pandoc -t plain` | 122/124 spans — refuses `\frac`, dropping exactly the two fraction-bearing governing equations |
| `texmath` CLI `-t asciimath` | `Unrecognised writer`; its Unicode writer is only reachable through pandoc |
| `texmath -t eqn \| eqn \| groff` | `1 over 2` → `1\b2\b_`: stacking collapses to overstrike on the tty device |
| one `pandoc` call, 124 spans | 173 ms — against a renderer whose instrument mode repaints continuously |

The in-house table won on the corpus that motivated the question, and it won *because*
of a property a typesetter treats as a compromise: `\frac` flattened to `/`. That is the
sentence to quote when the argument returns.

## Two defects, one cause, both older than this session

Landing the tranche exposed them; neither was introduced by it.

- **The rewrites ran before the substitution pass.** A rewrite that drops braces can
  weld a command name to the text it delivers: `\alpha\text{b}` became `\alphab`, a
  command nobody wrote, and the second gate threw the span away. Shipped since
  `BRF-MATH-GLYPHS`, invisible because no test ever wrote a glyph immediately before a
  `\text{}`.
- **`\frac F A` passed the gate and emitted `F A`.** The terminator rule consumed
  `\frac`'s command and left the span half-translated — the one thing the all-or-nothing
  gate exists to prevent, happening inside the gate.
- **`\%` was never substituted**, because the token pattern named `\_` as its only
  non-letter escape. The gates accepted it; the pass did not know it.

Fixed by substituting first, keeping rewrite-only commands out of the terminator rule and
the token pass, and letting the second gate reject only what is genuinely unconsumed.

## The lesson worth keeping

**A test that iterates a copy of the table is a test of the copy.** The width contract
read a hand-written list of fourteen glyphs beside a table of seventeen, and eleven of
the tranche's rows would have been added without the assertion noticing. It now iterates
the exported `MATH_GLYPHS` and permits a word its own columns (`sin` is 3, `α` is 1), so
the table is the assertion rather than the inventory of one.

The pair to that lesson: **the exemplar in a negative test decays.** `$\zeta$` was the
canonical "unknown command" for five weeks; the tranche made it translatable, and three
tests would have gone on asserting the old world had they not been read. The exemplar is
now `\oint` — a command with no evidence and no prospect.

## What the ledger looks like now

- `ADR-MATH-GRAMMAR-076` — a grammar, not an engine. One dimension to the table, two
  dimensions to the door that already exists (`mermaid`); vocabulary on evidence, ranked
  on relations; no display-math fence, no superscript machinery, no engine without a new
  decision that brings measurements.
- `docs/2026-10-28-the-instrument-frame.md` — amended: the width rule moved to the
  compositor, the squint gate's boundary declared, texture and history sections added,
  and the sources already writing to stdout tabulated.
- The declined-span mark is **recorded and not adopted**. A span the renderer refuses is
  visible but unlabelled, which is the case `ADR-UNIVERSAL-ELISION-050` forgot: in a
  table cell the refused span is usually the longest line and therefore the first thing
  the elision ladder cuts, so the reader loses the relation and the receipt in one
  gesture.

## What's left

- **The declined-span mark** — decide it (source register, or leave it bare and say so).
  Filed; the ADR records the argument and refuses to adopt it on the way past.
- **The cadence `Rate` column** — still written unpadded to markdown while the terminal
  path pads it, which is the one compositor-side defect the instrument-frame reading
  turned up.
- **The instrument class list** — without it the squint gate cannot be pointed at a
  frame, so the acceptance test the paper adopts cannot be run.
- The rest of the Greek alphabet and the other function names are one line each, on
  evidence, when a span wants them.
