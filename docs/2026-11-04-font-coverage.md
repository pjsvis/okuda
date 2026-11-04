# The glyphs we emit and the fonts that must draw them

**Created:** 2026-11-04
**Status:** reference — the reading behind the vector change, and the instrument that keeps it honest
**Instrument:** `scripts/font-coverage.ts` (`just fonts`) · **Brief:** `BRF-FONT-COVERAGE`

okuda emits 64 non-ASCII codepoints across its demo corpus. Coverage across the
faces a terminal might use ranges from 36 to 64 of them, and the failure is not
uniform: it splits by **failure mode**, and the split is the finding.

## The two readings

```
just fonts                    # this machine
just fonts omarchy            # another machine's fonts, judged here
just fonts --family "…"       # when the terminal's font is undeclared
```

- **primary** — does the glass's own face draw what we emit? This is the defect
  class: a codepoint the reader's terminal cannot draw in its main font, named
  with the page that uses it.
- **common** — what is common to every terminal-candidate family installed? The
  authoring-safe set. Its complement is a precondition, stated rather than
  discovered.

Both halves are **derived**: the codepoints come from rendering the corpus, the
coverage from the fonts on the machine. There is no table to maintain, so the
instrument cannot disagree with what the renderer emits.

## What the measurement said

Measured 2026-11-04 against the emitted set, by `fc-query` on faces fetched into
`tmp/` (DejaVu, JuliaMono, Noto Sans Mono) and on the installed faces of this Mac.
These per-face numbers are **not pinned by a test** — they are a reading of two
machines and a handful of downloads on one day, not a property of the tree.

| face | covers | what it misses |
|---|---|---|
| JuliaMono | **64/64** | — |
| **DejaVu Sans Mono** | 62/64 | `⋮` `≫` |
| Menlo (macOS default) | 61/64 | `⋮` `≫` `ₘ` |
| Noto Sans Mono | 57/64 | `✓` `✗` `☐` `⋮` `∑` `≫` `∝` |
| JetBrainsMono NF | 57/64 | `☐` `⸮` `ṁ` `ₘ` `ₐ` `ₓ` `∝` |
| Fira Code | 54/64 | twelve |
| .SF NS Mono | 51/64 | thirteen |
| PT Mono | 36/64 | twenty-eight |

The intersection across **all eight** is 22 of 64. That is what "lowest common
denominator" literally costs: the state glyphs, the maths and half the arrows for
the box drawing. Nobody wants that page.

## The split that matters

- **A combining mark cannot be borrowed from a fallback.** It positions only over
  a base drawn by the *same* font, so a per-codepoint fallback supplies a
  *spacing* glyph — drawn beside the base, in a cell okuda counted as zero. This
  is the only *destructive* failure, and it is not the host's to fix.
- **A missing single-cell glyph falls back fine.** `✓ ✗ ☐ ⋮ ∑ ≫ ∝` arrive from
  another installed font, maybe a cell off-grid, but they arrive.

So there are two different problems wearing one costume, and only the first needs
a renderer change.

## What changed in the renderer

`\vec{g}` used to emit `g` + **U+20D7** COMBINING RIGHT ARROW ABOVE — which exists
in exactly **one** of the eight faces measured. Since no fallback can position it,
the arrow landed beside the `g` on every other face. `docs/style-guide.md` promised
`v⃗` and the terminal drew `g→`.

**ISO 80000-2 sets vectors in bold.** Weight costs no codepoint, is one column by
construction, and survives `NO_COLOR` (the weight channel already does). `\vec{g}`
now emits a bold **g**; `\vec` remains a recognised rewrite whose output is weight
rather than a character, and a span whose braces are missing still declines whole.

That is the whole repair: after it, **no emitted codepoint is a combining mark**,
so okuda's width arithmetic and the terminal's painting agree by construction, and
the remaining misses are all fallback-tolerable single-cell glyphs.

## The boundary, stated where the number is printed

The intersection is common to **the monospace families this machine has**. "Common
to all fonts" is not checkable and would be a lie wearing the word *all*: it is a
floor for the faces measured, not a prediction about the next one. Windows is
unmeasured here — there is no Windows box in this silo, so Consolas and Cascadia
are knowledge, not measurement, and the page says so.

`just fonts` is not in `just check`: a runner has no fonts, and a machine whose
primary lacks a mark would go red for a reason no commit can fix. A reading the
principal runs, like `just surface-probe`.
