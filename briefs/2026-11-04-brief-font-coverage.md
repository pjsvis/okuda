---
type: Brief
callsign: BRF-FONT-COVERAGE
date: 2026-11-04
---

# Brief: The codepoints we emit, against the fonts that must draw them

**Date:** 2026-11-04
**Status:** Open

---

## Context

okuda emits glyphs it cannot draw. `\vec{g}` rewrites to `g` + **U+20D7**
(combining right arrow above, `src/render.ts:1649`) and `\propto` to **U+221D**
(`src/render.ts:1635`) — and no monospace face installed on either machine
carries either codepoint. Measured 2026-11-04, after the operator reported *"the
parens should include a g with an arrow above it"*:

| codepoint | source | JetBrainsMono NF | FiraCode NF | Adwaita Mono |
|---|---|---|---|---|
| U+20D7 | `\vec` | absent | absent | present |
| U+221D | `\propto` | absent | absent | present |
| U+0307 | `\dot` | present | present | present |
| U+0304 | (macron) | present | present | present |

The renderer is correct: the bytes were verified at every path (stream at widths
20–120, the TUI frame, table cells, `elideToWidth`, `padDisplay`), and no
document in the corpus leaves a surviving LaTeX command. The failure is one layer
below — and it is not cosmetic:

- **A combining mark cannot be borrowed from a fallback font.** Ghostty falls
  back per codepoint, so the arrow arrives from Noto Sans Math or Arial Unicode
  as a *spacing* glyph and is drawn beside the `g`, never above it. Font fallback
  fixes a missing glyph and cannot fix a missing *mark*.
- The fallback paints a cell where okuda counted none (`src/width.ts:155`,
  `:252`), so the line's right edge goes ragged by one column wherever the mark
  appears — a layout defect on top of the glyph one.

Nothing raised, and nothing could have: `docs/ideas.md` (`font-coverage-precondition`)
predicted this class and waited for a report. This is that report.

## Warrant

Operator call, 2026-11-04: *"lets do the probe … a list of all of the symbols
that are common to all fonts, a bit of an ambition … if it's possible."*

The ambition is the instrument's second reading, and its limit is stated in the
design: an intersection over the faces a machine actually has is a **floor for
those faces**, not a claim about the next one.

## Objective

One command that answers two questions, both derived and neither hand-maintained:

1. **Does the glass's own font contain what we emit?** The primary reading — the
   defect class. This names the codepoints the reader's terminal cannot draw in
   its main face.
2. **What is common to every installed monospace?** The authoring-safe set — the
   codepoints okuda may emit without imposing a font requirement. Its complement
   is an explicit precondition, not an accident.

## Evidence

The corpus is the repository's own demo pages, because they are what the
renderer is *for*: `docs/style-guide.md` (the demo of itself), `docs/showcase.md`,
`docs/state-colours.md` (the state-glyph vocabulary),
`docs/2026-10-30-server-blades-in-space.md` (math and tables) and the current
registered index page (tables, addresses, rules). The emitted set is whatever
those pages render to — never a table in this brief, which would drift.

The font set is fontconfig's, plus the platform directories fontconfig does not
index (`fontconfig` on macOS does not see `~/Library/Fonts`; that is how
FiraCode NF and JetBrainsMono NF escaped the first query and why the check is by
TTF cmap and not by family name alone).

## Scope

**In:**

- `scripts/font-coverage.ts`: the two readings, `--json`, `--family <name>`,
  `--all-faces`, and a positional `host` for a read-only remote collection over
  ssh — the same division as `scripts/probe-surface.ts` (the machine supplies its
  font list, the instrument here judges it).
- `just fonts` — one command, both readings.
- Pure, table-tested core: charset parsing (fontconfig's `300-36f` ranges),
  codepoint extraction from rendered text, intersection, missing-set.
- A page stating the reading and its boundary, and the ledger entry promoted.

**Out:**

- **No gate in `just check`.** A gate would fail on a host whose primary font
  lacks a mark — the same trap `just surface --gate` was kept out of for a
  *surface* reason: the condition is a fact about the machine, not about the tree.
  `--gate` exists for a caller who wants it.
- **No font installation, no family recommendation.** Which face to require is
  the operator's, and `TFS` already refuses okuda an opinion about the font.
- **No change to `MATH_GLYPHS`.** Whether `\vec` keeps U+20D7 or adopts ISO
  80000-2's bold is a decision with a documented contract behind it
  (`docs/style-guide.md:223-224`) and belongs in an ADR, not in this brief.
- No Unicode name table, no distance metrics, no ligature detection. Coverage and
  cell width are the two the renderer bets on; only coverage is measured here.

## Preconditions

- [ ] `just check` green at the branch point.
- [ ] `fc-list` and `fc-query` on PATH (fontconfig); the script says so plainly
      when they are not, and refuses with exit 2 — a missing instrument is not a
      verdict.

## Work Plan

1. [x] Charset parsing + codepoint extraction + intersection, pure and tested.
2. [x] The corpus render (the source entry point, so a stale binary cannot lie).
3. [x] The font collection: `fc-list` properties in one call, plus the platform
       directories fontconfig misses, filtered to monospace.
4. [x] The two readings as text, and `--json`.
5. [x] `just fonts`; run it on this machine and over ssh on the box.
6. [x] The page, the ledger promotion, the debrief.

## Acceptance Criteria

- The control runs first: a synthetic three-face fixture where the answer is known
  by construction — the common set is the intersection, and the primary's missing
  set names exactly the codepoints it lacks. A detector whose control fails is
  measuring itself.
- The defect is reproduced on real data: on this machine, `U+20D7` and `U+221D`
  are named as missing from the configured primary, and `U+0307` is not — the
  `\dot`-works/`\vec`-doesn't asymmetry that started this.
- The intersection is printed with the face count and the boundary sentence; a
  fontconfig failure is exit 2 with a named reason, never an empty pass.
- `just fonts` is a one-line delegation in the facade and `just check` stays green.
- No font is installed, no palette or glyph table changed.

## Notes

- **The book-keeping trap this brief avoids.** The obvious implementation is a
  table of "safe codepoints". That is a *specified* structure: it records what
  someone already knew and drifts the moment a face changes. Both halves here are
  derived — the codepoints from rendering, the coverage from the fonts on the
  machine — so the instrument cannot disagree with the thing it describes.
- **What the intersection is not.** It is not "common to all fonts". It is common
  to *the monospace faces this machine has*, which is the honest and checkable
  version; the universal claim is unverifiable and would be a lie wearing the
  word "all".
