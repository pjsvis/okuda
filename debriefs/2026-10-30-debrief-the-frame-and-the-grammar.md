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
**Status:** Done — 14 commits, 939 tests, `just check` rc=0. One decision landed
(`ADR-MATH-GRAMMAR-076`) with five follow-ons beneath it, the last of which unblocked
itself on the review queue rather than beside it.

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
| `MATH_GLYPHS` rows | 17 | **38** |
| tests | 912 | **939** |
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

## Added after this debrief was first written

Two of the tranche's own follow-ons landed the same day, and both changed the sentence
this file had already written.

**The fraction was telling a lie, and it was ours.** `\frac{3\mu}{2R^3}` flattened to
`3μ/2R^3`, which left-associativity reads as `(3μ/2)·R³` — a governing equation that
was only true for a reader who already knew the physics. `fracSide` now brackets a side
unless it is a single factor, and the two sides are asymmetric: a numerator needs
brackets only for a loose operator, since nothing divides it from the left; a denominator
must also be *one factor*, because `a/2R` keeps multiplying outside the fraction.
`F/A` and `x/(a+b)` are untouched; `3μ/(2R³)` and `(a+b)/c` are now honest.

**Script digits are the one prettiness that is total.** `^2` and `_2` map to `²` and `₂`
for every numeral, all one column: `T⁴`, `O₂`, `H₂O`, `g/cm²`, `3μ/(2R³)`. Letters are
refused on purpose — `ₘ ₐ ₓ` exist but `b c d f g h j q w y z` have no subscript form, so
`^{n}` and `_{max}` stay as written. A partial alphabet works on the first equation and
fails on the fourth.

The asymmetry that survives both: `$T^4$` still shows its dollars. The span holds no
command, and the currency guard fires on evidence, not on a guess about intent. The
author writes `T⁴` when they mean it.

Two corrections to what this file said before that work: the table is **38** rows, not
37, and the `src/render.ts` line numbers in the ADR moved with the code — both fixed in
the same commit as this section, because a citation that resolves is not yet a citation
that means.

## The authoring half, which the code alone could not say

Two more corrections landed after the section above, and both were about what an
author sees rather than what the pass emits.

**Whitespace is syntax.** The gaps were arbitrary: a command's trailing space
survived when another command followed and vanished when an operand did, so
`\Delta \rho g L^2` rendered `Δ ρg L²` — a gap where the author typed two commands
and none where they typed a command and an operand. In LaTeX that space typesets as
nothing. A run now survives only beside a relation or operator, so `ΔρgL²`, `μσρ`,
`εσA_{rad}T⁴`, while `M ≫ M`, `α ∈ [0.2, 1.2]` and `I_max - I_min` keep theirs — and a
gap is never invented (`μ+Q` stays tight). `\text{}` bodies and `\_` are masked during
the strip, so `65 m³` keeps the ISO value–unit space and `a \_ b` keeps its word gaps.

**A word script needs no braces.** `τ_gg`, `I_max`, `μ^n`; the braces stay only where
they delimit — a letter after the closing brace (`A_{rad}T⁴`, because `A_radT⁴` is a
subscript nobody wrote) or a body that is not a bare word (`μ^{n+1}`). `^{\circ}`
turned out to be the degree sign, not a superscripted composition operator, so
`77^\circ\text{C}` now reads `77°C`. A nested fraction side parses too, which it never
did: `\frac{x}{I_{\text{max}}}` was `[^{}]*` and fell back to literal, and is now
`x/I_max`.

**And the guide carries the author's half.** `docs/style-guide.md` gains *Maths: what
renders, and what you write instead* — the classes that work, a table of what does not
with the linear form to write, and the four defaults an author gets wrong: an equation
in a table cell, whitespace treated as content, the command-free span that keeps its
dollars, and the literal fallback that is honest rather than broken. The code states
what happens; only the guide can state what to do instead.

## The mark, which waited for the bug in front of it

The declined span is now labelled (`f11f976`). A span the pass refuses is drawn in the
**source register** — the codespan paint, no new colour role — so *the renderer
declined* is read at a glance instead of inferred from two `$` signs.

The proposal had been sitting as "recorded and not adopted" in the ADR for a reason
worth keeping: the math pass is a **source pre-pass**, so an SGR injected there lands
inside a run whose enclosing style it cannot see. That is not a hypothesis — it is the
class of defect the glyph-guest reset had already fixed by moving the re-open into the
styler's wrap (`df7c5d3`), which closed on the same day and unblocked this. **The order
was the engineering**: the mark was one line of styling and two of dependency, and
sitting behind the review queue was cheaper than being the second instance of a known
bug.

Two boundaries came out of it, both now in the ADR and the guide: only a span that
*attempted* translation and failed is marked (`costs $5 and $10` is prose, not a
failure), and a rendered span is never marked (it has no state to report, and colouring
provenance would spend the glance channel on history).

## What's left

Nothing from this sitting. Both of the compositor-side defects the instrument-frame
reading turned up are closed — the cadence field widths, and the frame's own class
list, which was the acceptance test the paper adopted and could not run.
- The rest of the Greek alphabet and the other function names are one line each, on
  evidence, when a span wants them.
