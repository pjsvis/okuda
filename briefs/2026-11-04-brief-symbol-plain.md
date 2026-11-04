---
type: Brief
callsign: BRF-SYMBOL-PLAIN
date: 2026-11-04
---

# Brief: The repertoire, and the plain mode for a host that cannot draw it

**Date:** 2026-11-04
**Status:** Open

---

## Context

Three findings, all measured on this branch, and the third is the one this brief
pays for:

1. **The vector mark had no host.** `\vec{g}` emitted `g` + U+20D7
   COMBINING RIGHT ARROW ABOVE, which exists in **one of eight** monospaced faces
   measured. A fallback cannot position a combining mark, so the arrow was drawn
   beside the `g` in a cell okuda counted as zero. Landed: `\vec` now emits
   **weight** (ISO 80000-2), not a character — `src/render.ts`, `MATH_GLYPHS`.
2. **No face draws everything except one.** After the change the emitted set is
   64 codepoints; JuliaMono covers 64, DejaVu Sans Mono 62 (`⋮` `≫`), Menlo 61,
   Noto Sans Mono and JetBrainsMono NF 57, Fira Code 54, PT Mono 36. Intersection
   across all eight: 22. `docs/2026-11-04-font-coverage.md` holds the table and
   `just fonts` reproduces the reading per machine.
3. **The rendering has no way to lower its bar.** A host whose face is poor gets
   the rich repertoire and whatever the fallback does with it. Nothing in the
   renderer can say *draw this in ASCII, I know where I am.*

## Warrant

Operator call, 2026-11-04: *"a flag for math-poor would be more appropriate,
default to the bar we set as long as we do not alienate anyone."* The inversion —
rich by default, plain on request — is only safe **because of finding 1**: while
combining marks were emitted, a poor host had no legible path short of the flag,
so the flag would have been the lifeline and the default would have been broken.
With the marks gone, every remaining miss is a single-cell glyph that a fallback
draws, and the flag becomes a refinement rather than a rescue.

## Objective

A second, **deterministic** rendering of the symbol repertoire in ASCII, chosen per
invocation, leaving the grid intact and the layout arithmetic unchanged.

## Evidence

| mode | face | result |
|---|---|---|
| rich (default) | JuliaMono | 64/64 — nothing missing |
| rich (default) | DejaVu Sans Mono | 62/64 — `⋮` `≫`, both fallback-able |
| rich (default) | PT Mono | 36/64 |
| **plain** | **any face** | **nothing missing, by construction** |

And the boundary that makes plain possible: a face without box drawing cannot
render okuda in any mode, so the flag must not pretend to cover it.

## Scope

**In:**

- **`--symbols=plain|rich`**, default `rich`; `OKUDA_SYMBOLS` as the set-once form
  (the repo already reads `OKUDA_CLONE`, `FZF_PREVIEW_COLUMNS`). One config key is
  **not** in scope until a second principal asks.
- **A substitution table for the repertoire only**: the maths glyphs, the state
  vocabulary (`✓ ✗ ☐ ◆ ▶ ⸮ ⋮ …`), and the accent-derived forms. `⋮`→`:`, `≫`→`>>`,
  `∑`→`sum`, `∝`→`prop.`, `✓`→`[x]`, `✗`→`[ ]`, `☐`→`[ ]`, `⸮`→`?`, `ṁ`→`m'`.
- **Structural glyphs stay, in both modes**: box drawing (U+2500–257F), block
  elements (U+2580–259F), Braille (U+2800–28FF). They are okuda's *syntax*; a host
  without them has a different problem and this flag would be lying about it.
- **The pass runs where the maths pass runs** — on the source, before parsing and
  therefore before width is decided. A two-column `>>` must be two columns to the
  table, not one.
- Tests, control first; `--symbols=plain` documented in `docs/style-guide.md` and
  `docs/help.md`'s flags table; `just fonts` gains one line: what plain mode emits.

**Out:**

- **No per-face detection, no probing at render time.** The mode is chosen, never
  inferred: two machines running the same command must produce the same bytes, or
  the page is no longer one thing.
- **No second layout, no second palette, no light mode.** Plain changes glyphs, not
  columns-per-glyph reasoning: the substitution happens before layout, so the
  layout never learns a mode exists.
- **No font installation, no bundling, and no change to the recommended face.**
  DejaVu Sans Mono stays the recommendation (`docs/2026-11-04-font-coverage.md`);
  JuliaMono stays the maximum-fidelity alternative.
- **No change to the rich table.** `MATH_GLYPHS` is untouched except by plain mode's
  *reader*.
- **No state-glyph remapping in colour mode's semantics** — the state *roles* and
  their paints are unchanged; only the character changes.

## Preconditions

- [ ] `just check` green at the branch point (it is).
- [ ] `\vec` emits weight, and no emitted codepoint is a combining mark (it does,
      it is not).
- [ ] The emitted set can be read from `just fonts --json` without rendering twice.

## Work Plan

1. [ ] The table as a pure map, its keys a **subset of the measured emitted set** —
       derived from `just fonts`, not from taste.
2. [ ] `symbols` threaded beside `color` through `renderDocument`, applied in the
       same pre-pass as the maths, never in a handler.
3. [ ] Two tests that make the table self-checking: **no dead key**, and **no
       repertoire codepoint left unmapped**. A table that drifts from the corpus
       fails here rather than in a render.
4. [ ] The 2×2 matrix: colour × symbols, all four legible, no line-break drift
       (`--no-color` must not change breaks in either mode).
5. [ ] Facade, docs, `just fonts` line, `just check`.

## Acceptance Criteria

- The control runs first: `rich` output is **byte-identical** to today's for every
  corpus page — the no-regression control, asserted before any plain assertion.
- `plain`: no codepoint outside `{ASCII, box drawing, block elements, Braille}` is
  emitted by any corpus page, and the table's keys and the emitted repertoire are
  equal as sets (both directions).
- A table containing `≫` and `⋮` renders with its pipes aligned in plain mode —
  the substitution is pre-layout, and the test proves it (a post-layout pass would
  break here, which is why the position is asserted rather than assumed).
- `--symbols=plain --no-color` is legible and has identical line breaks to
  `--symbols=plain`.
- `just check` passes; no role hex, no palette, no `MATH_GLYPHS` entry changes.

## Notes

- **The naming, decided here and reversible.** `--symbols`, not `--math`: the set
  the flag rewrites is the maths *and* the state vocabulary, and a flag that says
  `math` would quietly under-describe a fifth of the page. `plain`/`rich` is the
  pair rather than `poor`, because the mode describes what is emitted and not a
  judgement about the host: a machine that chooses plain has chosen a smaller
  repertoire, not a worse one.
- **Why a table is admissible here when the lexicon distrusts them.** A *specified*
  structure records what someone knew and drifts. This one cannot: its keys are
  checked against the measured emission, so an entry dies when the corpus stops
  emitting its subject and a new codepoint fails the test until it is mapped. The
  specification is the corpus; the table is the ASCII it chose.
- **What this does not fix.** A face that lacks box drawing still cannot render a
  table, and a face with a broken cell width still cannot render the grid. Those
  are the host's, and `just fonts` names them rather than papering over them.
