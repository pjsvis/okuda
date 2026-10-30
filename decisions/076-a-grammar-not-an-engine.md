---
type: ADR
callsign: ADR-MATH-GRAMMAR-076
date: 2026-10-30
---

# Decision: A grammar, not an engine — the maths okuda declines

**Date:** 2026-10-30
**Status:** Accepted — and landed. The tranche is `4ca324f`; the vocabulary is
still append-only, so this decision constrains every row that follows it.
**Enforced by:** `tests/math-glyphs.test.ts` — the all-or-nothing gate (`:39`, an
unknown command keeps the whole span literal) and the one-column assertion (`:60`).
The *no second door* rule below is **advice**: nothing in `just check` fails if a
`tex` fence appears, and the cheap gate that would make it an instrument is named in
the constraints.

## Context

`BRF-MATH-GLYPHS` shipped a closed 17-row table (`src/render.ts:1571-1591`), a span
regex that excludes newlines and `$$` (`src/render.ts:1626`), and an all-or-nothing
gate: one unknown command and the whole span stays literal, as authored
(`src/render.ts:1633-1652`). It declared three things out of scope — display math,
superscripts, any LaTeX engine — each *"none in the corpus"*, and it named the move
if the vocabulary ever needed a parser: *"the mermaid-to-md precedent: an external
CLI owns the parsing, okuda owns the paint"*
(`.archive/briefs/2026-09-16-brief-math-glyphs.md:61-63`, `:176-182`).

On 2026-10-30 a maths-dense document arrived — an orbital habitat specification,
124 inline spans. It was **untracked** when the question was forced and was committed
the same day (`25c8365`), so the corpus does contain it now and its 18 commands are
evidence rather than a desktop artefact — but at the moment of measurement they could
not vote, and that distinction is recorded here rather than tidied away. Either way
the table rendered its governing equations as raw LaTeX, which is the gate working,
exactly as the brief said `$\zeta$` staying literal was the gate working. But it
forced the question the brief had deferred: **does okuda want a typesetter?**

The measurements below were taken on this machine, `pandoc 3.11`, `texmath 0.13.3.3`
and `groff 1.24.2`. The latter two were installed for the test and **removed the
same session**, so the numbers are not re-runnable without re-installing them — the
instrument is named precisely because it is not there to be asked twice.

| reading | value |
|---|---|
| spans in the document | 124 |
| resolvable by the 17-row table | 97 (78%) |
| blocked | 27, by exactly 18 commands |
| **relation-bearing spans** (`=`, `≫`, `∝`, `≈`, `∼`) | 24 |
| **of those, blocked** | **15 (62%)** |
| `texmath` via `pandoc -t plain` (its Unicode writer) | 122/124 spans, 21/23 relations |
| `texmath` CLI `-t asciimath` | `Unrecognised writer` — no Unicode target |
| `texmath -t eqn \| eqn -Tutf8 \| groff -Tutf8` | `1 over 2` → `1\b2\b_` — vertical stacking collapses to overstrike on the tty device; `col -bx` cannot recover it |
| one `pandoc -t plain` call, all 124 spans | 173 ms |
| one call **per span** | 41 ms → 5.1 s for the document |

Two facts decided it, and neither was the throughput.

**The external executable lost on the corpus it was proposed for.** texmath refuses
`\frac` outright in its Unicode writer, and the two equation spans it dropped are the
only fraction-bearing *governing* equations in the document (`τ_gg`, `Bo`). The
in-house rewrite flattens `\frac{X}{Y}` → `X/Y` (`src/render.ts:1640`) and does not
refuse. 124 beats 122, and the two it wins are the two that matter.

**And the 2D route does not stand up.** A fraction needs two rows; a cell has one;
`eqn` is the only tool with a lineage of typesetting equations onto a terminal, and on
this build it emitted overstrike soup rather than stacked layout. All that remains
past that is an image protocol or a font dependency, which the playbook already
refuses (`playbooks/data-display-playbook.md`, rules 4 and 6).

## Decision

**okuda keeps the restricted glyph grammar and does not acquire a maths engine.** A
span whose every command is in the table is transliterated; any other span is shown
**exactly as written**, whole, and that visible degradation is the correct output
rather than a defect to be engineered around.

Three rules follow, and they are the durable part:

- **One dimension → the table. Two dimensions → the door that already exists.**
  okuda owns exactly one two-dimensional door: a `mermaid` fence, an external CLI,
  text back. It declines to open a second. A notation is admissible if it linearises
  to text; if it needs two dimensions it is a diagram and takes the existing door.
- **Vocabulary arrives on evidence, and is ranked on relations.** Every added row
  must unblock at least one span in the *tracked* corpus; rows that unblock a
  relation-bearing span are taken first, and the citation census is the ledger that
  ranks them — `\vec` blocks 5 spans and 5 of them carry a relation, `\sum` 5 and 4,
  `\approx` 4 and 4, against `\zeta` and `\circ` at five spans and no relation each.
  The span-resolution percentage flatters and must not be reported: 78% of spans
  resolve today while 62% of the physics does not.
- **The authoring answer is the primary answer.** An equation that cannot be
  linearised belongs on its own line in prose, not inside a table cell — where the
  renderer will both fail to translate it *and* elide it at the glass edge, so the
  reader gets neither the relation nor the receipt.

## What this decision does not decide

**The mark.** A declined span is currently visible but not *labelled*: the `$`
delimiters are the only receipt, so a reader cannot tell whether the renderer
declined or the author wrote LaTeX on purpose. It is the case
`ADR-UNIVERSAL-ELISION-050` (*damage marked*) forgot, and it bites hardest in a table
cell, since the declined span is usually the longest line there and therefore the one
the elision ladder cuts first. The proposal — paint a declined span in the **source**
register, the way inline code is drawn, with no new colour role — is recorded here and
**not adopted**: it changes rendering, it needs its own decision, and it has an owner
filed in td on the same day rather than a wish.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| `texmath` as the parse owner (the mermaid precedent) | Measured worse on the evidence corpus: 122/124, refusing exactly the two `\frac` equations the in-house rewrite flattens. Its CLI cannot even emit Unicode (`Unrecognised writer`); the writer that works lives inside pandoc, so any wrapper is a two-hop pipeline whose second hop is a whole document formatter. |
| `pandoc -t plain` per document | 173 ms/frame for a document, on a renderer whose instrument deployment repaints continuously. It buys `T⁴`, `∫₀¹`, `ṁ` and `v⃗` — real fidelity — and charges a subprocess in the render path for a corpus that mostly needs Greek. |
| `pandoc -t ansi` | A terminal writer that already exists in pandoc 3.11: it would make okuda a flag on someone else's renderer, and it supplies none of the house geometry (identity header, slots, elision marks, silcrows). |
| KaTeX / MathJax | A JS engine, a font set, and layout in-process. A different product with a different failure surface, and the first dependency that cannot be removed without changing output. |
| `texmath -t eqn` → `groff` (the Bell Labs route) | Measured broken here: stacking collapses to overstrike on the tty device (`1\b2\b_`). Even working, it is a block, not a span — a new fence type and a layout engine in the pipeline. |
| LaTeX → `dvipng`/`dvisvgm` → `chafa`/`img2txt`, or kitty/sixel previews | An image protocol in a character grid: poor fidelity, an emulator requirement, and an engine install (`tectonic` is 0.17 and bottled). Refused by the playbook's rules 4 and 6. |
| Add 40 rows instead of 18 | Rows are cheap; *unearned* rows are not. The 18 are the commands the evidence actually uses. A row added in anticipation is the one the gate then honours wrongly. |
| Leave the table at 17 rows and change nothing | `$e^{i\pi}+1=0$` rendered literally — `\pi` was not in the table. The promise *"we show simple equations"* was not true at 17 rows, and a promise that is not true is worse than a smaller one that is. |

## Consequences

**What became easier:**

- **Nothing was given up.** The tool that was considered is worse on the corpus that
  motivated considering it, and the alternative to a table was never a typesetter —
  it was a raster, a font dependency, or a second door.
- **Zero cost on every path that matters.** No subprocess, no dependency, no
  install, no licence question, and a telemetry frame stays at milliseconds.
- **One notation rule instead of a growing set.** The next arrival — chemistry, a
  staff, a matrix, typst maths — gets a test (does it linearise?) rather than an
  argument, and the two-dimensional answer is a door that already exists.

**What became harder:**

- **The reader meets raw LaTeX when the table runs out,** and until the mark is
  decided they meet it unlabelled. That is a real cost, paid deliberately in exchange
  for a renderer with no engine in it.
- **The grammar's promise is now a measured one, and it is not universal.**
  *Simple equations* means *every command in the table*: the evidence document went
  from 97/124 spans to **119/124**, with all 23 relation spans resolving, and the
  five that remain literal are the command-free ones (`$V$`, `$A$`, `$B_4C$`,
  `$T^4$`, `$T$`) that the currency guard has always left alone. A document whose
  maths is written in `\oint` or `\aleph` gets nothing, by design.
- **Authors carry more of the load.** A linearised equation is the author's sentence,
  not the renderer's fallback.

**Constraints this imposes:**

- **No display-math fence.** `RE_MATH_SPAN` excludes `$$` and newlines
  (`src/render.ts:1626`); a `$$…$$` block is a new fence type and therefore a renderer
  feature, refused here.
- **No superscript or subscript machinery.** `T^4` stays `T^4`; `_{max}` stays
  `_{max}`. Unicode `T⁴` is the sort of thing that looks like progress and costs the
  gate its all-or-nothing property.
- **No engine, ever, without a new decision** — and that decision must bring
  measurements against this table, not a blog post about a binding.
- **The gate stays all-or-nothing.** Partial translation is the failure mode: a span
  half-translated is a wrong equation that looks rendered.
- **The cheap gate, if this ever needs teeth:** a test asserting the renderer's known
  fence set, so a `tex` fence fails something. Until then this rule is advice, and
  saying so is the point of the *Enforced by* line.

## Related

- `BRF-MATH-GLYPHS` — the brief this decision continues, and whose three out-of-scope
  clauses it declines to reopen.
- `ADR-UNIVERSAL-ELISION-050` — *damage marked*, the principle the unlabelled decline
  has not yet paid.
- `playbooks/data-display-playbook.md` — rules 4 and 6: resolution by geometry, never
  by a font or a pixel protocol.
- The Greek and operator tranche, filed 2026-10-30 with the relation-span judgement
  rule as its acceptance criterion.
- The declined-span mark, filed the same day and deliberately not adopted here — the
  argument is above, the decision is not.
- `docs/2026-10-30-server-blades-in-space.md` — the evidence document, committed
  2026-10-30 (`25c8365`) after these measurements were taken; its 18 commands are
  corpus evidence from that commit onward.
- `docs/2026-10-28-the-instrument-frame.md` — the deployment class whose cadence a
  173 ms translation would wreck.
- Code: `src/render.ts` (`MATH_GLYPHS`, `mathSpanBody`, `mathGlyphs`),
  `tests/math-glyphs.test.ts`.
