---
type: Debrief
callsign: DBF-PAPER-RUNG
date: 2026-10-09
---

# Debrief: The paper rung — the same render, printed

**Date:** 2026-10-09
**Status:** Done
**Brief:** BRF-PAPER-RUNG (`briefs/2026-10-09-brief-paper-rung.md`)
**TD:** not needed — one session, landed complete

## What happened

A new projection rung for the reading path: **okuda's render, as a colour PDF.**
One CLI dial (`--no-references`), one script (`scripts/paper.ts`), one recipe
(`just pdf`), one declared dependency (Chrome, as a *printer*), eight tests.

The design was settled by the operator in one line, and the line is the
principle: *"we already have a readable render, so why not just render it on
paper … no need to get another rendering engine involved … on-screen, now, and
on-paper, now should produce similar artifacts."*

## The measurement that made it easy

Before any code: what can print an ANSI byte stream on this machine?

| candidate | verdict |
|---|---|
| pandoc → LaTeX | **impossible** — no `pdflatex`/`xelatex`/`lualatex`/`tectonic` |
| `cupsfilter` (system) | **refuses**: *"No filter to convert from text/html to application/pdf"* |
| `wkhtmltopdf`, `weasyprint`, `typst`, `aha`, `ansi2html` | absent |
| **Chrome 153, headless `--print-to-pdf`** | present, and used as a **printer** |

So "no new rendering engine" was not only the preferred answer, it was the *only*
answer — and that is worth noticing: the decision was cheap because the
environment had already narrowed it. A 404-line render became 6 pages at 100
columns / 9pt, colour lossless (the PDF's hexes are the palette's, read out of
the SGR), arrangement intact.

## Two defects, and neither was visible to a test

1. **The right-edge clip.** At 100 columns and a fixed 10pt, a monospace line is
   ~211mm against a 194mm content box, and `white-space: pre` does not wrap — so
   the browser *clipped* the last ~9 columns of every line. The heading chips sat
   half off the page. Found by **looking at the rendered page**, not by any test:
   the geometry was arithmetic, invisible to a green suite. Fixed by deriving the
   type size from the width (`paperFontPt`) so the widest line always fits — a
   pure function, now pinned by a property test (*"the widest line always fits
   the content box"* for 40→200 columns).
2. **Importing the script executed it.** `tests/paper-rung.test.ts` imports
   `paperFontPt` from the script, and the script ran its CLI on import — printing
   usage and exiting under the test runner. The fix is the pattern the house
   already uses (`scripts/reg-sync.ts`): `if (import.meta.main)`.

Both were caught by *using the thing*, and the first would have shipped a
silently lossy document — the worst possible outcome, because it looks correct.

## The one declared difference

The receipt is dropped (`--no-references` — no silcrow paint, no References
section), and this is a **third rung** rather than a convenience. ADR-047 named
two: painted silcrows on the glass, plain numbers elsewhere. Paper gets neither,
for two reasons that are already doctrine:

- **A silcrow cannot resolve on paper** — there is nothing to type `12` into.
  The printed receipt is a list of addresses that do not address: the *dead
  silcrow* class `docs/2026-09-14-derrida-and-the-decomposed-pdf.md` names as the
  defect this silo spends its life preventing.
- **The number is a render-time allocation** (ADR-032: numbers are dynamic, never
  authored). A durable artefact carrying it is *guaranteed* to disagree with the
  next render of the same document — two encodings of one fact, which drift.

Everything else is the ordinary render, byte-for-byte: the tests pin colour
(truecolour fg *and* bg), prose and layout unchanged, and a document with no
references untouched by the flag.

## The ink transform — dark on white, without a light mode

Asked for a printable page, the answer was *not* a light palette. system.md is
explicit that dark is the only mode and that a light mode would be a palette
file nobody ships; the operator's instruction was the same (*"I do not want to
create a light mode … black(ish) text on a white background … minimal tweak"*).
So the difference is made **where the difference belongs — in the printer**,
not in the renderer:

```
paperInk(hex, background?):
  L → 1 − L            (mirror lightness; hue and saturation untouched)
  backgrounds          → clamped light (paper is white, not tinted)
  foregrounds          → darkened until 4.5:1 against white
```

One pure function, no theme, no file. Body text (near-white on the glass) lands
near-black; the role hues survive as dark versions, so colour still signals
structure — only its polarity moves.

**What the probe caught, and why the plain mirror was not enough.** A
mid-lightness saturated colour mirrors to *itself*: amber at L 50% stays amber,
legible on a dark page and **~2:1 on white**. And some marks are painted in
colours that blend with the dark page (`#f3f5f7` as a foreground), which mirror
to near-*white* — invisible on paper. So legibility is a **guarantee** (a
contrast floor applied per colour) rather than a coincidence of the palette, and
the test asserts it for every colour the corpus actually emits.

The operator also named the reason the dark artefact had to go, and it is worth
recording because it is not only cost: *"it would be expensive to actually
print"* — and worse, **fragile**. Most print drivers default to dropping page
backgrounds, and a dropped background turns a dark-theme PDF into light-grey
text on white: a document that is barely there. Cheap and robust happen to be
the same fix.

**Fills — a badge is a mark, not a surface.** A background *equal* to its
foreground is not a surface behind text: it is a **fill**, and the glyph is meant
to vanish inside it. okuda emits exactly that for the heading badge
(`48;2;c` + `38;2;c` + `#`) and for the right-edge chips. Both sides of a fill
therefore take the *same* paper ink, so the mark prints as one solid dark block
and the okudagram identity reads on paper as it does on the glass. Only a
background behind *differently* coloured text is a surface, and surfaces are
white.

That was a correction to the *reason* before it was a correction to the code: the
first printable draft showed plain `##` markers and the plausible explanation was
"paint is TTY-gated, so paper never gets badges". The bytes say otherwise —
`\x1b[48;2;153;204;255m\x1b[38;2;153;204;255m#` is right there in the piped
render — and what actually lost the badge was this transform's own background
clamp, turning the fill white while the glyph stayed dark. The silcrow paint *is*
gated off-glass; the heading badge never was. **The wrong reason was the
plausible one, which is why the byte check came before the fix.**

## The habit that earned its keep

Three times in one day, the gate was green while the artefact was wrong: the
prune's census counted 175 documents against 196 and reported a complete
classification; my own commit carried a self-referential `node_modules` symlink;
and this PDF clipped every line's right edge. In all three the instrument was
*derived* and the defect was in the *thing*. **Look at the output.** For the
paper rung that meant rendering the page to a PNG and looking at it — which is
the same move as looking at a document instead of grepping it.

## Carry-forward (in the brief, not resolved here)

- **Page breaks**: the `pre` cuts lines, not sections. Section breaks need
  structure, and structure lives in the renderer — that is a `--html` rung, not a
  flag on this one.
- **Elision versus wrapping**: paper cannot widen a terminal, so an elided code
  line is permanently lost — but sameness keeps the rungs in agreement, and the
  artefact names its source. Revisit only if a printed `…` is mistaken for the
  document's own text.
- **Light paper**: dark is the palette; white paper needs a light *palette* (a
  different artefact), which `showcase.md` already frames as an override nobody
  ships by default.
- **The receipt's durable half**: the dropped section also carried durable
  addresses (`ADR-007`, `src/render.ts`). A paper "documents cited" appendix —
  addresses without numbers — is cheap and not built.

## Related

- `BRF-PAPER-RUNG` — the brief, with the measured table and the open questions
- `ADR-DOCUMENT-LIFECYCLE-057` — the ephemeral register, where the PDF is written
- `ADR-047`, `ADR-032` — the receipt, and why its numbers are volatile
- `docs/2026-10-06-the-eink-frame-is-a-second-host.md` — the sibling rung: the
  same bytes onto a slow glass, and the same discovery that the reading path is
  portable by construction
