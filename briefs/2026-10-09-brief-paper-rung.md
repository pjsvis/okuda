---
type: Brief
callsign: BRF-PAPER-RUNG
---

# Brief: The paper rung — the same render, printed

**Date:** 2026-10-09
**Status:** Done
**TD:** (to create if anything remains)

## The decision, in the operator's words

*"We already have a readable render, so why not just render it on paper. No need
to get another rendering engine involved. On-screen, now, and on-paper (pdf),
now should produce similar artifacts."*

That is the design: **one render, two artefacts.** The PDF is the streaming
canvas with paper under it, not a second layout. okuda keeps deciding width,
wrapping, colour roles and elision; the chain below only prints.

## What was measured first (2026-10-09)

| question | answer |
|---|---|
| does a colour PDF work at all? | yes — a 404-line render became **7 readable A4 pages** at 10pt monospace, arrangement intact |
| is the colour faithful? | **lossless** — the PDF's hexes are the palette's own, read from okuda's SGR |
| is there a document engine available? | **no** — `pdflatex`/`xelatex`/`lualatex`/`tectonic`/`wkhtmltopdf`/`weasyprint`/`typst` all absent |
| is there a system filter? | **no** — `cupsfilter -m application/pdf file.html` exits 1, *"No filter to convert from text/html to application/pdf"* |
| then what prints it? | **Google Chrome 153, headless `--print-to-pdf`** — used as a *printer*, not a renderer |

So "no new rendering engine" is not only taste: the alternative was not
available, and installing one would have produced a *different arrangement* —
which the silo's own reading of the parergon refuses
(`docs/2026-09-14-derrida-and-the-decomposed-pdf.md`: *the frame was the work*).

## The chain (all of it outside okuda)

```
okuda <file> --width N --no-references   (FORCE_COLOR=1)
  → ANSI → HTML spans                    (~40 lines, scripts/paper.ts)
  → Chrome --headless --print-to-pdf     (the printer)
```

`just pdf <file.md>` · output defaults to `tmp/paper/` (the ephemeral register —
a derived artefact belongs there) · `--width`, `-o` pass through. The HTML is a
single `pre` with `white-space: pre`, so the browser **cuts pages and changes
nothing else**: no reflow, no re-typeset, no second palette.

## The one declared difference: the receipt is dropped

`--no-references` is the third projection rung, and it is new — ADR-047 named
two ("painted silcrows on the glass, plain numbers elsewhere"). The paper rung
has neither paint nor receipt, for two reasons that are the silo's own:

1. **A silcrow cannot resolve on paper.** There is nothing to type `12` into. The
   printed receipt is a list of addresses that do not address — the *dead
   silcrow* class `docs/2026-09-14-derrida-and-the-decomposed-pdf.md` names as
   the defect this silo spends its life preventing.
2. **The number is a render-time allocation** (ADR-032: numbers are dynamic,
   never authored). A durable artefact carrying it is *guaranteed* to disagree
   with the next render of the same document — two encodings of one fact, which
   drift.

The flag removes both the paint and the receipt, and skips building the map
(nothing downstream needs it). Everything else is byte-for-byte the ordinary
render: the tests pin that the prose, the colour and the layout are unchanged.

## Provenance: the artefact declares itself

A derived artefact declares itself derived (corollary 1 of the Decomposed PDF).
The PDF's footer carries: `rendered projection · okuda <sha> · <file> · N cols ·
date · no silcrows (they cannot resolve on paper)`. The render's own header line
(`okuda · <path>`) is the first half of the same statement, and predates this
work.

## Acceptance criteria

- `just pdf <file>` writes a colour PDF to `tmp/paper/`, and prints the path.
- No silcrow appears anywhere in the printed artefact.
- Colour is present and exact (truecolour fg and bg both emitted).
- The prose and layout are identical to the piped render; only the receipt
  differs — pinned by `tests/paper-rung.test.ts`.
- No new okuda runtime dependency: the binary does not know the chain exists.
- `just check` green; `bun test` passes.

## Open questions, deliberately not answered here

- **Page breaks.** The `pre` breaks lines, not sections: pages cut mid-document.
  Breaking at headings needs *structure*, and structure lives in the renderer —
  reaching for it from the byte stream would mean re-parsing what okuda already
  knows. If paper wants section breaks, that is a second backend (a `--html`
  rung emitting semantic blocks), not a flag on this one.
- **Elision versus wrapping.** Code fences *elide* at the column edge
  (`ADR-UNIVERSAL-ELISION-050`); on screen the bytes are recoverable by widening
  the terminal, on paper they are gone. Sameness keeps the two rungs in
  agreement — the anti-drift rule — and the recovery route on paper is the
  source file, which the artefact names. Revisit only if a printed elision is
  ever mistaken for the document's own text.
- **Light paper.** The rung is dark because the palette is dark; a white-paper
  print needs a *light palette* (a different artefact), which is a palette
  question, not a print one. `showcase.md` already records the position: *dark
  is the only mode; the override is the light mode, if someone wants it.*
- **The receipt's durable half.** The dropped section also carried the cites'
  *durable* addresses (`ADR-007`, `src/render.ts`). A paper "documents cited"
  appendix — addresses without numbers — would keep the half that survives
  paper. Not built; noted because the fork is real and cheap.

## Related

- `ADR-DOCUMENT-LIFECYCLE-057` — the ephemeral register, where the derived
  artefact is written
- `ADR-047` / `src/vectors.ts` — the receipt, and why the piped rung keeps it
- `ADR-032` — silcrow numbers are dynamic, never authored
- `ADR-UNIVERSAL-ELISION-050` — one line stays one line
- `docs/2026-09-14-derrida-and-the-decomposed-pdf.md` — the frame is the work;
  a derived artefact declares itself derived; a pointer resolves
- `docs/2026-10-06-the-eink-frame-is-a-second-host.md` — the sibling rung: the
  same bytes onto a slow glass
