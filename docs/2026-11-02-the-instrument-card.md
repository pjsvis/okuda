---
date: 2026-11-02
kind: extraction — four proposed surface invariants, measured; three were already owned and one was not ours to hold
lineage: a conformance suite supplied by a model working without this silo's context, reviewed against the instruments it duplicated (`scripts/contrast.ts`, `scripts/probe-surface.ts`); `playbooks/baby-extraction-playbook.md`, *when the carrier is fluent*; the ten claims that a tape measure refuted
status: recorded — the surviving invariant, the two rules the review produced, and the card that carries them
---

# The instrument card

A model was asked for a conformance suite for terminal surfaces. It came back
fluent: five files, four numbered invariants, a bibliography of five intellectual
lineages, and a thesis — *a terminal is an optical instrument, not a web page* —
that is exactly right.

It was also, in the ways that matter, wrong. This is what survived the review, and
why the survival is more interesting than the suite.

The model was working blind. It had no access to this repository's instruments,
only to `docs/2026-08-20-origin-doc.md` — which still names a Mermaid renderer
that was retired months ago. So it cited the stale name faithfully, three times,
and built a fifth document around a dependency that does not exist. That is a fair
copy of a bad source, and the fault is ours for leaving the source in place.

## The carrier was fluent, so nothing fired

The reflex that kills over-engineered work fires on *visible* complexity. This
arrived smooth: confident headings, a numbered invariant table, a bibliography with
dates. Nothing about it announced a problem, which meant the only way to find one
was to run it.

So it was run. Ten claims, one tape measure:

| The document says | What the bytes said |
|---|---|
| ruler at column 51 | the markers land at 68, 64, 68, 68 |
| elides at column 80 | the `BOUNDARY-80` row is 81 cells |
| elides, never soft-wraps | its own `BUS-80` row wrapped to 3 lines |
| the Mermaid renders | `needs 83 cols` — the art elided |
| hierarchy via weight | all four levels, one colour |
| automates the plates | exit 1 — it named a missing file |

A ruler that does not align with itself cannot measure alignment. The suite's
central probe failed its own control, which means the probe was reporting nothing
at all — and would have reported a clean pass to anyone who glanced at it.

Five of those are arithmetic. The sixth is structural: *a hierarchy test inside
a code fence*. A fence has exactly one colour by construction, so the four levels
it claimed to distinguish were painted identically. The test was void before it
ran, and no amount of care in the ruler would have fixed it.

## Who owns which invariant

Strip the decoration and four candidate invariants remain. Asked whose property
each one actually is, three turn out to already have an owner here:

| Invariant | Whose property | Where it was already answered |
|---|---|---|
| I1 figure-ground orthogonality | the host surface | `scripts/probe-surface.ts` reads the machine's actual config |
| I2 perceptual contrast floor | the host's fragment shader | `scripts/contrast.ts` — WCAG ratio and OKLCH lightness |
| I3 relative semantic transforms | the byte stream | `src/palette.ts` against `tests/fence-colour.test.ts` |
| I4 monospace cell isomorphism | the surface's glyph atlas | **nobody.** This is the finding |

So the suite was a *third derivation* of a question the repo already had two gated
instruments for. `scripts/probe-surface.ts` contains the sentence that predicted
this folder:

> A probe that reimplemented the reading on the far side would be a second
> derivation, and the two would drift.

Three copies of the artefact had drifted from each other inside a single day.

## The claim that survived

I4 is not okuda's question, and that is why it is worth keeping.

okuda's contract ends at coloured bytes. Glyph-atlas registration happens on the
other side of the PTY, where a block element becomes an integer number of pixels —
so a renderer cannot verify it, and asking a renderer to is a category error. The
model that wrote the suite assumed it was okuda's, because it was vendored into
okuda's `scripts/` directory. The filing error produced the conceptual error.

What the surface can get wrong, and the stream cannot see:

| Failure mode | Mechanism | Symptom on the card |
|---|---|---|
| Theme-coupled polarity | canvas ink and GUI chrome share one theme file | you cannot invert the ground without breaking the sidebar |
| Hardcoded hex, no clamp | a program emits one fixed colour and the host never clamps it | one trap vanishes on the ground it matches |
| Chrome-to-canvas bleed | the viewport is forced to match low-contrast app chrome | dim ink and shade textures wash into the frame |
| Atlas fracturing | block and braille glyphs come from font fallback, not the GPU atlas | the spine kinks at a row where it should be straight |

The third one is a design opinion and the fourth is the only one the card can
show you directly. The first two are testable in one line each.

## Two rules the extraction left behind

The suite is gone. These outlived it.

**A ruler must not be built from the family under test.** The original grid was
drawn in box-drawing and block characters — the very glyph range it claimed to
measure. A systematic atlas error cancels against itself when the ruler carries
the same error, exactly as a miscalibrated gauge cannot find a miscalibration. In
the card, every *measuring* element is ASCII and every *measured* element is
Unicode, and the two are separated by a spine you can sight down.

There is a second-order version of the same trap. `▍`, `█`, `│`, `─`, `▁` are all
Unicode **East Asian Ambiguous** width: their cell count depends on a terminal
setting the card cannot read. A ruler made of them measures the locale. ASCII has
one width everywhere, which is why the spider holds the web.

**The control passes first.** The card prints an ASCII row directly beneath the
scale, above every Unicode row. If that row's spine is not on the column the marks
row points at, the card's own arithmetic is broken and every reading below it is
void. It is not a nicety; it is the difference between a probe and a decoration.

Its `--assert` mode checks that arithmetic and nothing else. It cannot check your
terminal, because asserting the wcwidth you are testing is circular — so the card
declares the boundary rather than shading it in:

```
PASS  spine at col 55, every ASCII row 72 cells
      Unicode rows measured: 72 cells each
      Boundary: this checks the card. It does not check your terminal.
```

## The card

One file, `scripts/tty-card.sh`, POSIX shell, no dependencies, no vocabulary from
any particular viewer. Every measuring column is computed from the width; nothing
in the output is a hand-typed ruler. This is a snapshot at 72 columns:

```text
| tty-card  surface invariants  72 cols                                |
| spine col 55  ruler ASCII  subjects Unicode                          |
| -------------------------------------------------------------------- |
| RULER     | ....:....1....:....2....:....3....:....4|...:....5....:..|
| MARKS     | ........................................^................|
| ASCII     | ----------------------------------------|----------------|
| EIGHTH    | ▁▂▃▄▅▆▇█▁▂▃▄▅▆▇█▁▂▃▄▅▆▇█▁▂▃▄▅▆▇█▁▂▃▄▅▆▇█|▁▂▃▄▅▆▇█▁▂▃▄▅▆▇█|
| DITHER    | ░▒▓█░▒▓█░▒▓█░▒▓█░▒▓█░▒▓█░▒▓█░▒▓█░▒▓█░▒▓█|░▒▓█░▒▓█░▒▓█░▒▓█|
| BRAILLE   | ⠁⠃⠇⡇⣇⣧⣷⣿⠁⠃⠇⡇⣇⣧⣷⣿⠁⠃⠇⡇⣇⣧⣷⣿⠁⠃⠇⡇⣇⣧⣷⣿⠁⠃⠇⡇⣇⣧⣷⣿|⠁⠃⠇⡇⣇⣧⣷⣿⠁⠃⠇⡇⣇⣧⣷⣿|
| BLOCK     | ▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄|▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄|
| -------------------------------------------------------------------- |
```

Each subject row is a *ramp*, not a solid field, and that is deliberate: a constant
run cannot show sub-cell drift, because every cell is identical and every error
looks identical too. Put a diagonal in it and one bad cell is a kink.

It is published as `@polyvis/testcard`, so it has an address and a version and a
bug report can name which card it used — the thing a test card has to have if
two people are to agree they are looking at the same one:

```sh
npx @polyvis/testcard
```

The source never moves: the package copies `scripts/tty-card.sh` at pack time, so
git keeps the only copy anyone edits.

Below the geometry the card emits two truecolor traps — `#242424` and `#EBEBEB` —
each invisible on the ground it matches. If your host clamps minimum contrast, both
become legible. If it does not, exactly one disappears, and you have found the
failure mode in a single line:

```sh
sh scripts/tty-card.sh
```

## Out of scope

- **VT escape-sequence compliance.** `vttest` and `esctest` own that, and own it
  more thoroughly than a card can.
- **Colour correctness beyond a luminance floor.** Whether a palette is good is a
  design argument; the card only asks whether the ink can vanish into the ground.
- **Anything requiring an index.** A card you read has no symbol table, no call
  graph, and no state between runs.
- **Claims about your terminal.** The card shows; it does not assert. The only
  assertion in it is about its own arithmetic.

## The tell

The suite was five files and 26,788 characters. What replaced it is one script and
this document, at 19,311 — two files instead of five, and the shorter one is the
instrument. The corpus got simpler, not heavier, and no decision
record was needed because nothing was reversed — okuda's boundary already said
rendering stops at bytes. All the review did was apply the boundary to a document
that had been written in ignorance of it.

That is the whole finding: the model did not fail at structure. It failed at
*ownership*, and ownership is exactly the context it did not have. The lesson is
not "check the model's arithmetic" — it is that a document asserting whose property
an invariant is will be authored confidently and wrongly by anything that has not
read the boundary.

## Sources

Cited because they bear on the card. Claims about named projects' internals are
*not* made here: the surface-side names in this silo are our own and their
behaviour is ours to prove.

- **Rubin, E.** *Synsoplevede Figurer* (1915) — figure and ground as a perceptual
  primitive rather than a stylistic choice.
- **CIE 1976 L\*a\*b\*** — perceptual lightness, the scale behind the `ΔL*` floor.
- **APCA / Somers, A.** — contrast as a function of spatial frequency, which is why
  thin monospace strokes need a stronger floor than body text.
- **ECMA-48 / ISO/IEC 6429** — SGR, the reason a stream can express hierarchy
  without naming a colour.
- **Unicode Standard, ch. 32** — `U+2580–259F` block elements and `U+2800–28FF`
  braille patterns, the two families the card measures.
- **Tufte, E.** *The Visual Display of Quantitative Information* (1983) — density
  without chartjunk; the origin of the asymmetric spine.
- **Few, S.** *Information Dashboard Design* (2006) — the bullet graph, the closest
  ancestral form to a labelled gauge on a fixed grid.
