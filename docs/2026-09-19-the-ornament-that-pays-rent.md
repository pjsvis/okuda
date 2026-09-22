---
date: 2026-09-19
kind: research note — a question about ornament in writing, answered historically and then measured against this silo's own output
lineage: the operator's question, 2026-09-19 — *"is there a history of the abuse of themes, fonts, and shite … surely some gentleman from Sumer insisted on curlicues or whatever on his tablet … and the Egyptians must have been tempted to embellish their hieroglyphs"*; docs/style-guide.md §Near and far, §State glyphs; playbooks/authoring-playbook.md §The thesis. **Corrected in place** — the first run of the census read a *rendered* count as a *delta* and reported one class's total as another class's increase; see §The control.
status: open — the census is measured and reproducible. The defect it found is reproduced verbatim and its reach is bounded, but the discriminator between a torn cell and a clean one is not established.
---

# The ornament is free where it re-encodes, and costs a learner where it encodes

> ◆ This silo's authors type ornament at 0.10% of their bytes and read it at 4.11%.
> The renderer supplies the fifty-one parts between, which is why a restyle here
> costs no document pass.

## What this is

A question, not a defect: is there a history of the abuse of themes, fonts and decoration in writing, and if there is, where does this silo sit in it. The history turns out to be short enough to tell in one pass, and the answer turns out to be measurable. It was measured, and the measurement found a defect.

## The claim

Ornament has two jobs and only one of them is cheap.

- **It re-encodes.** A colour that restates a structure already on the page carries no information and costs the reader nothing to ignore. Free to apply, free to change, free to remove.
- **It encodes.** A stroke, a variant or a ligature that *is* the meaning must be learned by every reader. Each one is a new sign, and the sign inventory is the price of the system.

Every episode we call font abuse is the second kind. Every reform is a transfer back to the first.

## The story in one pass

- **Sumer, and the curlicue was grammar.** Akkadian scribes kept a class of signs called *gunû*, "coloured, decorated": a base sign with strokes hatched across it. KUR-gunû is a different sign from KUR, not a flourish on it. The extra strokes are not decoration on the sign; they are the sign. The sign lists still carry them as separate entries, TE-gunû and GAR-gunû among them.
- **Egypt, and reverence outranks reading order.** In a royal or divine name the god or the king is written first and read second: honorific transposition, layout overruled by respect. And the priestly register ran from roughly 700 signs in Middle Egyptian to about 7,000 in the Graeco-Roman period, because priests kept minting decorative and cryptographic variants. Champollion needed the Rosetta Stone because the ornamental register had drifted past legibility and the same text had to be carried three times.
- **The medieval turn, and the reform is designed.** Merovingian chancery script collapsed into ligatured illegibility; Carolingian minuscule, around 800, was a deliberate fix: one script, clear letterforms, standardised word separation, taught empire-wide. Gothic then pushed it to maximum density. The humanists of the 1400s reformed again, believing they were reviving Roman letters. They were copying Carolingian manuscripts four centuries old. **The return to the classics was a return to a previous reform.**
- **The industrial turn, and the wave at scale.** Victorian display type is the same impulse with a foundry behind it. Tschichold wrote the plainness manifesto in 1928 and then recanted it, spending his later career designing Sabon and defending the classical page. Comic Sans and the blink element are both 1994, and CSS Zen Garden is 2003.

## The shape

Each turn of the cycle pays for the last, and neither direction is a correction of an error:

```mermaid
title: The cycle — each turn pays for the last
flowchart LR
    O[Ornament] -->|costs a learner| R[Reform]
    R -->|a style| O
```

## Where this silo keeps its ornament, measured

The census: every tracked markdown document in the silo, rendered, with ornament characters counted in the source and again in the output. 350 documents, one render each, ANSI stripped before counting.

| Class | Authored | Rendered | Ratio |
|---|---|---|---|
| Box-drawing | 1,782 | 119,303 | 66.9x |
| Block elements | 34 | 3,662 | 107.7x |
| List bullets | 222 | 5,099 | 23.0x |
| State glyphs | 482 | 650 | 1.3x |

And the totals, which are the finding:

- **Source.** 2,497,598 bytes carrying 2,520 ornament characters: **0.101%**.
- **Render.** 3,131,681 visible bytes carrying 128,714: **4.110%**.
- **The ratio between them is 51.1x.**
- **The colour channel is 1,243,388 bytes, or 28.42% of the byte stream, and it carries no character at all** — 0.397 bytes of SGR for every visible byte.

The author types a tenth of a per cent and the reader sees four. The difference is not authored anywhere. The renderer supplies it, from a palette of named semantic roles (`src/palette.ts`), which means a restyle rewrites one file and touches no document.

## The control, and what it caught

A detector needs a control, and this one has a natural one. 302 of the 350 documents author no state glyph at all, so 262 of them must render none. They do.

The 40 that do not are worth reading, because the renderer turns out to have no vocabulary of its own: it borrows the author's, and it does so in one place. Rendered glyph characters run 482 authored to 650 rendered, and the +168 splits cleanly by class.

| Class | Authored | Rendered | Delta |
|---|---|---|---|
| Vertical ellipsis | 96 | 168 | +72 |
| State glyphs and diamond | 386 | 482 | +96 |

**The +72 is the renderer speaking.** `diagramBlock` (`src/render.ts:785`) emits a `⋮` lead on every diagram caption. Of the 168 rendered, **69 sit on a caption line**, and 36 of those read `mermaid source elided` because the fence carried no title. The machine uses the author's lexicon to report on a diagram, which is ornament doing a job. Three of the 72 are not attributed.

**The +96 is a defect.**

### The correction, same session

The first run of this census reported the +168 as though all of it were machine-emitted glyphs, and reported one class's *rendered total* (168 vertical ellipses) as that class's *increase*. Both were wrong, and the second is the worse error: 96 ellipses are authored, so the increase is 72, not 168. The class split above is the correction, and it is what turned a vague suspicion about the renderer into a specific defect with a specific cause. The wrong version is left here because the mistake is the instructive part — a count of what is on screen is not a count of what was added.

## The one place it stops paying rent

A table cell whose content is a coloured state glyph is wrapped as a raw string, escape sequence included. The wrapper slices through the SGR bytes, so the sequence spills onto continuation lines and the glyph itself is emitted twice. Reproduced on `docs/state-glyphs.md`:

```text
  render          ✓[38;   the render plane; every byte passes through here
                  2;95;
                  211;9
                  5;1m✓
```

Under `--no-color` the same cell tears more quietly, which is why it was missed:

```text
  render          ✓[1m✓   the render plane; every byte passes through here
```

The reader now has to decode the ornament. Colour, which re-encoded a structure one line above, has become the structure. That is the Ptolemaic failure in miniature, and it is the exact inversion of a rule this silo already wrote down: *the renderer supplies the colour, the author supplies the structure that earns it* (`docs/style-guide.md`). Here the colour is being laid out as though it were structure.

Reach, measured:

- **17 documents place a glyph in a source table row.**
- **12 of them render a torn escape.**
- **5 render clean.** The control passes, so the detector is not merely firing on "this document mentions a glyph".
- **14 documents with no table glyph also fire**, and they are the documents that quote an escape sequence as text. A named false-positive class, not a hidden one.

**What is not established:** the discriminator between the twelve and the five. The obvious hypothesis is cell width — a cell narrower than the escape sequence, about nineteen characters — and it was not tested. Two detectors were needed rather than one, because the slice lands at different offsets in different tables; used separately they disagree, and `docs/tables-monster.md` tears 68 continuation lines that the first detector missed entirely.

## The finding

Two things, and the second is the one that matters.

**The history is not a history of abuse.** It is an oscillation between two failure modes, and the reforms are as designed as the excesses. Calling it abuse is the verdict of whoever won the last reform, delivered retroactively. We call Merovingian script degenerate because the Carolingians needed it to be.

**And this silo has already made the transfer.** The census says so: the author types a tenth of a per cent and the reader sees four. The ornament is machine-applied, from semantic roles, so a restyle is a change to the renderer and not a sweep of 350 documents. That is the structural answer to the question the essay opened with, and it is why the reform here is cheap.

Which leaves the test, stated in the style guide's own words and now measurable: *a mark that duplicates an existing structure is noise; a mark that distinguishes what structure alone cannot is perception for free.* Re-encoding is free. Encoding costs a learner. **The tear is the case where this silo paid the second price by accident** — 96 duplicated glyph characters, in twelve documents, because one stage treated an escape sequence as text.

## What is not in question

- **That ornament belongs in the document.** The style guide is right that a wall of white is a refusal of structure, not restraint.
- **That the glyph lexicon earns its place.** Four states, one glyph each, declared once, held to variance. The 96 characters it costs are the author's, and they are spent deliberately.
- **That the caption `⋮` is correct.** The renderer reporting on its own diagram in the reader's vocabulary is the machine being legible about its own limits.
- **That a restyle costs no document pass.** That is what 51.1x means, and it is the property worth keeping.

## Where I would land

**Fix the tear at the wrapper and leave the budget alone.** The defect is not that this silo has ornament. It is that one stage computes width over a string that still contains escape sequences. The fix belongs where the wrapping happens, and it should be a width computation over the visible string rather than the raw one.

**What would change my mind:** a demonstration that the tear cannot be fixed without a document pass. If a cell's visible width cannot be known before the escape is emitted, the tear is structural and the remedy moves to the author — a glyph in a table cell becomes a house-style problem, not a renderer bug. I have not tested that, and it is the one result that would move this from a renderer fix to an authoring rule.

## Evidence

- `tmp/ornament-budget-probe.py` — the budget: authored vs rendered ornament per class, over `git ls-files '*.md'`, with the heaviest renders listed.
- `tmp/torn-escape-probe.py` — the glyph delta split by class, and the tear's reach with its control and its named false-positive class.
- `./okuda docs/state-glyphs.md` — the reproduced cell, verbatim, under colour and under `--no-color`.
- `src/render.ts:785` — `diagramBlock`, the `⋮` caption lead and the ternary fallback that produces `mermaid source elided`.

## Related

- `docs/style-guide.md` — the rule the defect inverts, and the near/far register
- `playbooks/authoring-playbook.md` — §The thesis, §The status-led list, §Tables have a width contract
- `src/palette.ts` — the semantic roles a restyle rewrites
- `docs/state-glyphs.md` — the lexicon, and the document that reproduces the tear
- `docs/2026-09-19-the-tag-the-renderer-eats.md` — the sibling defect: a silent loss at the same renderer seam
