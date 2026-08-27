# Monster Tables — the elision proof

**Kind:** monster document. The far end of `docs/tables.md`'s sparse→crowded
walk — the tables that genuinely don't fit a reasonable terminal and
force the renderer to *decide*. `tables.md` audits the shape; this doc
audits the *limit*.

**What it tests:** the table renderer at `src/render.ts:802`, which today
**shrink-wraps** (proportional column shrink + in-cell wrap) — the exact
behaviour ADR-014 reverses. ADR-014 is Accepted but unimplemented; the
table code contradicts the decision. This doc is the *before* picture
the elision brief (`briefs/2026-08-28-brief-elision-primitive.md`,
`td-b81597`) needs to prove its *after*.

**What it surfaces:** two elision shapes the brief has to handle —
*column-drop* (too many columns; drop whole columns, mark the boundary)
and *in-cell elide* (one fat column; elide within the cell). A monster
table that has both forces the elision contract to be made with evidence,
not in the abstract.

**How to read it:** run `okuda docs/tables-monster.md --tui` at two
widths — narrow (~80, the stress) and wide (~140, the relief). At narrow,
every table below overflows; at wide, most breathe. The gap between the
two is the elision's job. Status glyphs follow the lexicon: `☐` to do,
`✓` done/shipped, `✗` rejected, `⋮` parked/elided; `◆` marks the row
that reframes how you read the rest. No evaluation glyphs — opinion
lives in the notes column as text, not as a minted mark. (See the
showcase's "one glyph, one job" doctrine.)

---

## 1. The subsystem matrix — 9 columns, the stress case

Too many columns for 80, crowded at 120, breathing at 160. Each row is
a subsystem; the state column carries lifecycle glyphs; `◆` marks the
load-bearing row that changes how you read the matrix.

| Subsystem | File | ADR | State | Owner | LoC | Deps | Colour role | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| render | render.ts | 005 | ✓ | ses_a66534 | 810 | wrap, width, ansi | heading + chip | the render plane — every byte passes through here |
| tui | tui.ts | — | ✓ | ses_979415 | 490 | render, width | footer badge | control plane; the game loop |
| launcher | launcher.ts | 016 | ✓ | ses_b0d27c | 135 | tui, width | prompt | browse→read→browse; argv[0] dispatch |
| ◆ wrap | wrap.ts | 004 | ✓ | ses_a66534 | 230 | width | none | grapheme-true hard-wrap; the invariant everything rests on |
| width | width.ts | — | ✓ | ses_a66534 | 95 | — | none | display columns; Intl.Segmenter + EAW |
| ansi | ansi.ts | 006 | ✓ | ses_d0509c | 180 | palette | palette roles | styler + NO_COLOR parity |
| palette | palette.ts | 006,011 | ✓ | ses_d0509c | 70 | — | palette def | Dracula default, okuda identity |
| grammar | grammar.ts | — | ⋮ | — | 0 | — | — | parked; Bun.markdown owns the grammar |
| cli | cli.ts | 016 | ✓ | ses_b0d27c | 60 | all | none | entry point; argv[0] → gloam dispatch |

◆ The wrap engine is the invariant: every other subsystem assumes lines
≤ display width because wrap guarantees it. If you read only one row, read
that one.

---

## 2. The ADR ledger — 8 columns, real decisions

The decision log as a table. State column: `✓` accepted, `✗` superseded,
`⋮` deferred. At narrow width the long "Decision" column is what
overflows — the *in-cell elide* shape: one fat column, not too many
columns.

| # | Date | Decision | Status | Supersedes | Superseded by | Branch | Touches |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 001 | 2026-08-20 | Silo pattern adoption — one repo, one binary, one workflow | ✓ | — | — | main | all |
| 004 | 2026-08-22 | Hard-wrap mandate — okuda owns every \n, never delegates to terminal | ✓ | — | — | main | wrap, render |
| 005 | 2026-08-23 | Render engine string protocols — closed grammar, no AST | ✓ | — | — | main | render |
| 006 | 2026-08-23 | Glow dark palette — Dracula default | ✓ | — | — | main | palette, ansi |
| 007 | 2026-08-24 | Glow visual reference — the visual contract | ✓ | — | — | main | render |
| 008 | 2026-08-24 | Diagram borders are blueline — cyan structural | ✓ | — | — | main | render |
| 009 | 2026-08-25 | Front matter elided, setext neutralised | ✓ | — | — | main | render |
| 010 | 2026-08-26 | Bounded anchor + proportional fallback on reflow | ✓ | — | — | main | tui |
| 011 | 2026-08-26 | Default palette is okuda identity | ✓ | — | — | main | palette |
| 012 | 2026-08-26 | Structural probe for list depth | ✓ | — | — | main | render |
| 013 | 2026-08-26 | SSH serving forcecommand | ✓ | — | — | main | ssh |
| ◆ 014 | 2026-08-27 | Table elision over shrink-wrap | ⋮ | — | — | main | render |
| 015 | 2026-08-27 | Alert palette role (#ff5555) | ✓ | — | — | feat/gloam-launcher | palette, ansi |
| 016 | 2026-08-27 | argv[0] launcher dispatch — gloam entry point | ✓ | — | — | feat/gloam-launcher | launcher, cli |
| 017 | 2026-08-28 | Session handoffs are not briefs | ✓ | — | — | feat/gloam-launcher | docs |

◆ ADR-014 is the governance gap: Accepted, the code contradicts it. This
doc is its evidence. The elision brief (`td-b81597`) closes it.

---

## 3. The stinker — 12 columns of noise

Deliberately hostile: twelve narrow columns of synthetic data, no
semantic anchor, no key column. At any reasonable width this overflows;
the question is whether the renderer drops columns honestly (with `…`)
or shrink-wraps into a tall narrow soup that destroys the row-scan.
This is the table shrink-wrap was supposed to save and doesn't — the
case where "fit the screen" and "stay a table" can't both hold.

| id | a | b | c | d | e | f | g | h | i | j | k |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 110 | 120 |
| 2 | 11 | 22 | 33 | 44 | 55 | 66 | 77 | 88 | 99 | 111 | 122 | 133 |
| 3 | 12 | 24 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 |
| 4 | 13 | 26 | 39 | 52 | 65 | 78 | 91 | 104 | 117 | 130 | 143 | 156 |
| 5 | 14 | 28 | 42 | 56 | 70 | 84 | 98 | 112 | 126 | 140 | 154 | 168 |

---

## 4. The fat-cell stinker — 3 columns, one paragraph

The other elision shape: not too many columns, but one cell is
paragraph-length. The whole table is 3 cols but row 2's "What it tests"
runs to a paragraph. Shrink-wrap wraps that cell until the row is a
wall of text; elision would chop it at the boundary with `…`. The
honest question: which reads worse — a wrapped paragraph-cell, or a
truncated one with an invitation to widen?

| Section | What it tests | What to watch |
| --- | --- | --- |
| 1 matrix | too many columns; the column-drop shape | does the renderer drop whole columns and mark the boundary, or shrink-wrap into noise? |
| 2 ledger | one fat column (the decision text); the in-cell elide shape | does the renderer truncate within the cell, or wrap it into a paragraph wall? |
| ◆ 3 stinker | twelve columns of noise; the hostile case | does the renderer preserve the row-scan or sacrifice it to fit? The table shrink-wrap was meant to save; this is where it dies. |
| 4 this row | paragraph-length cell content under elision | a wrapped paragraph-cell vs a truncated one — which reads worse? The honest trade. |

◆ The stinker is the test, not the exception. A renderer that only
handles the well-authored matrix hides its doctrine; one that handles
the hostile table proves it. Elision is crueller than wrapping, and
crueller is what a stinker deserves.

---

## 5. The glyph garden — state axis, not evaluation

A table whose only purpose is to exercise the state-glyph column under
load. `☐ ✓ ✗ ⋮` only — no evaluation glyphs (no "neat," no "good"; the
lexicon refuses to bless an opinion axis). `◆` in the notes column, not
the state column, marks the load-bearing row. The point: the existing
vocabulary covers the cases; minting new glyphs for evaluation would
collide `✓`/`✗`'s lifecycle meaning with a quality meaning, and the
reader couldn't tell which axis a row is on.

| Subsystem | State | Note |
| --- | --- | --- |
| render | ✓ | shipped; the render plane |
| tui | ✓ | shipped; control plane |
| launcher | ✓ | shipped; ADR-016 |
| wrap | ✓ | shipped; the invariant |
| grammar | ⋮ | parked; Bun.markdown owns it |
| OSC 8 | ✗ | rejected; URL detection is the terminal's job |
| ◆ elision | ☐ | this doc's brief, `td-b81597`; the gap ADR-014 names |
| light mode | ⋮ | parked; gated on a real brightness itch |
| chip-stack minimap | ✗ | dropped 2026-08-27; chrome that editorialised |
| in-doc search | ☐ | brief open; the length axis earns its vector |

Key: ☐ to do · ✓ done · ✗ rejected · ⋮ parked. ◆ in the notes column
marks the row that reframes the table.

---

## What to judge

After reading all five at both widths:

1. **Does the matrix drop columns or shrink-wrap?** Section 1 is the
   column-drop test. At 80 cols, 9 columns can't fit; the renderer must
   decide. Today it shrink-wraps (ADR-014-divergent); after the elision
   brief, it should elide with `…` at the boundary.
2. **Does the ledger truncate or wrap the fat cell?** Section 2 is the
   in-cell test. The "Decision" column overflows; elision chops, wrapping
   walls. Which reads as a table?
3. **Does the stinker survive at all?** Section 3 is the honest limit —
   twelve columns of noise. No renderer makes this *good*; the question
   is whether it's *honestly bad* (elided, the reader knows it's wider)
   or *deceptively bad* (shrink-wrapped, the reader thinks they're
   seeing the table).
4. **Does the glyph column hold its axis?** Section 5 — do the state
   glyphs scan as one axis (lifecycle), or does the eye try to read
   them as evaluation? If the latter, the lexicon has leaked.

Where the answers surprise, that's a brief.
