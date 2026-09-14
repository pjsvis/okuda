---
type: Brief
callsign: BRF-TABLE-WIDTH
---

# Brief: The cut cell — the renderer breaks words the glass had room for

**Created:** 2026-09-14
**Status:** Open
**TD:** td-b78642 (epic) — td-0949d4 the instrument, td-7b2a9c the allocator,
td-629148 the ADR, td-8cf596 the test, td-48700c the nine, td-991964 the
playbook return.
**Lineage:** the `authoring-playbook.md` section *Tables have a width contract*
(2026-09-14), which named the fault and left the silo-wide count as a number
without an instrument; the same session's count of 78 documents and 104 tables,
which this brief corrects; and the reader's instruction — *"continue"* — after
the next piece was named as *"a brief plus a `just tables-check` recipe."*

## Objective

Make the table cut measurable, and decide where it is fixed. The instrument is
`just tables-check`. The decision is that the cut is a **rendering** defect, not
106 document defects: in 97 of the 106 cases the glass already has the columns
to hold every word, and the allocator spends them on the wrong column.

## The measurement

Scan: every markdown file git tracks, `.archive/` excluded — the archived tier
is a lifecycle state and Gloam does not read it (`playbooks/briefs-playbook.md`).
Each table renders in isolation at 80 columns, which is okuda's own piped
fallback width (`terminalCols(80)`, `src/width.ts:308`) and byte-identical to a
CLI render at `FZF_PREVIEW_COLUMNS=80` (verified, md5 `ba64ba5a`).

| what | count |
|---|---|
| tracked markdown, `.archive/` out | 278 |
| documents carrying a table | 125 |
| tables | 209 |
| tables that cut a word | 106 |
| documents with at least one cut | 73 |
| individual cut points | 1490 |

The cut is not rare and it is not confined to the worst files: 51% of tables.

## The fault

`renderTable` (`src/render.ts:987–1016`) measures each column's natural width,
and when the total exceeds the content width it shrinks every column
proportionally:

```text
budget  = width - gutter * (cols - 1)
floors  = 3 for every column
share_i = floors[i] + floor((budget - floorSum) * (w_i - 3) / (sum - floorSum))
colWidth[i] = min(w_i, share_i)
```

The floor is a **constant 3**, and the remainder is handed out in proportion to
content. So the widest column sets the scale and every other column is squeezed
toward 3. When a squeezed column is narrower than its longest word, the wrapper
has nowhere to break and cuts the word.

The canonical instance is `docs/2026-09-05-palette-page.md:43`, a six-column
palette table. Rendered at 80 columns the slots are `[12,6,4,4,3,32]` and the
body reads:

```text
  heading        #99ccf   0.82   0.09   249   pale periwinkle — the H1/H6
                 f        8      0            channel
```

`#99ccff` is seven characters in a six-wide slot; `0.828` is five in a four.
The `Note` column took 32.

## The budget exists — measured

Longest word per column, summed with the gutters, is the width a word-aware
allocation needs. Against that measure:

- 209 tables; **153** exceed the 76-column content width and get shrunk;
- of those 153, **144** fit a longest-word-per-column allocation;
- of the **106 that cut**, **97** fit — the allocator had the room and spent it
  on the widest column anyway;
- **9** do not fit, and no allocation saves them (below).

So the worklist is not 106 edits. It is one allocator, and then a short list.

## The remedy ladder — measured

`docs/2026-09-05-palette-page.md:43` as authored, then five variants. Slots and
cut points as the instrument reports them.

| variant | slots | cut points |
|---|---|---|
| A as authored | 12,6,4,4,3,32 | 16 |
| B the dominant column shortened | 14,7,5,5,3,27 | 0 |
| C the dominant column dropped | 14,7,5,5,3,27 | 0 |
| D a non-dominant column shortened | 12,6,3,3,3,34 | 16 |
| E a non-dominant column dropped | 4,4,3,31,20 | 11 |

Two findings, and the second is the one that matters:

- **Attack the dominant column.** Shortening or dropping it clears the table.
- **Shortening anything else is worse than useless.** In D the values were
  rounded from `0.828` to `0.83`, and the `L` slot fell from 4 to 3: shrinking a
  non-dominant column lowers `sum`, which *raises* the dominant column's
  fraction, so it takes more and the narrow columns take less. In E, dropping
  the whole `Hex` column left 11 cut points.

This is why the document-level remedy does not scale: a mechanical edit pass
over 106 tables would have to find the dominant column in each, and the
plausible-looking edits (shorten a cell, drop a column) make it worse as often
as better. The playbook's existing guidance — *shorten the longest cell* — is
right, and it is a **rendering** remedy that happens to be spelled in prose.

## The irreducible nine

Tables where some column's longest word exceeds the whole content width. No
allocator can hold these; they need elision or a document change.

- five are the **generated registry indexes** — `briefs/index.md`,
  `decisions/index.md`, `debriefs/index.md`, `advisories/index.md`,
  `playbooks/index.md` — whose cells are unbreakable paths and filenames.
  Needs run 103 to 214 columns. These are output, so the fix is in the
  generator (`scripts/reg-sync.ts`), not the document.
- two are `docs/tables-monster.md` — a document built to be a monster.
- two are ordinary: `docs/2026-08-29-from-intent-to-task-06.md:111` (needs 77,
  one column over) and `briefs/2026-09-13-brief-tidy-first.md:101` (needs 85).

## Scope

**In:**

- `scripts/tables-check.ts` and the `just tables-check` recipe.
- The allocator in `renderTable`: each column's floor becomes its longest word
  rather than a constant 3, with the remainder distributed proportionally and
  capped at the natural width. When the floors do not fit, the existing
  proportional path stands.
- An ADR recording the allocation rule, because it reverses a deliberate one.

**Out:**

- Editing the 106 tables by hand. The measurement says the allocator is the
  fault; a document pass is the manual workaround the ladder rule warns about.
- The nine irreducible tables beyond naming them.
- The orphan-escape defect found while building the instrument — separate
  defect, separate record (see Notes).

## Preconditions

- [x] The instrument reproduces the fault and clears on a fix — positive
  control `tmp/probe-split.md` cuts `Aspec|t`, `Deter|minis`, `minis|m`;
  negative control `decisions/004-hard-wrap-mandate.md` wraps on word
  boundaries with zero cuts. **Verified 2026-09-14.**
- [x] The in-process render equals the CLI render at 80 columns.
  **Verified 2026-09-14.**
- [x] The silo is enumerable — `git ls-files '*.md'`, `.archive/` excluded,
  278 files, whole scan in 0.2 s. **Verified 2026-09-14.**
- [ ] The word-aware allocation clears the 98. The condition is measured; the
  allocator is not yet changed, so the clearing is unproven. First work-plan
  item.

## Work Plan

1. [ ] Write `scripts/tables-check.ts` — the instrument, per the *Method* note
   below — and the `just tables-check` recipe.
2. [ ] Change the allocator's floor to the longest word per column; keep the
   proportional path for when the floors do not fit.
3. [ ] Re-run `just tables-check` and record the new count against the 106.
4. [ ] Write the ADR: the allocation rule, the reversal, and the nine.
5. [ ] Add the cut case to `tests/` so the allocator is held by the suite, not
   by the recipe.
6. [ ] Report the nine: five to `scripts/reg-sync.ts`, four named in this brief.
7. [ ] Return the finding to `playbooks/authoring-playbook.md` — *Tables have a
   width contract* gains the remedy ladder and the dominant-column rule.

## Acceptance Criteria

- `just tables-check` reports the count, names each offending table as
  `file:line`, and exits non-zero under `--strict`.
- The count of cutting tables at 80 columns is 9 or fewer, and each remaining
  one is one of the nine named here.
- `just check` and `bun test` pass.
- The ADR exists and the allocator cites it.

## Notes

**Method — how the instrument finds a cut.** It is not a width prediction; it
is a read of the render.

1. Render the table in isolation at the target width.
2. Read the column geometry off the **last** line before the header rule that
   carries a `│` — the body gutter is built to align with those separators
   (`src/render.ts:1022–1027`), so slicing is exact. Taking the *first* line of
   the block instead is the trap: it is the title when the table is not
   isolated.
3. Slice each line per column and collect each cell's fragments.
4. A fragment that is not a whitespace-delimited run of that column's source
   text was cut. Fragments pair only across **adjacent** rendered lines; the
   blank line between body rows is a row boundary, and pairing across it
   invents cuts.

**Rejected: comparing rendered row count to source row count.** That was the
previous session's method and it counts *reflow*, which is intended — the
allocator wraps cells on purpose, and 50 tables reflow with no cut at all. The
cut is the defect; reflow is the design.

**Trap: an escaped pipe is cell content.** `briefs/index.md:22` carries
`` `\|` `` inside a code span. Splitting a row on every `|` invents a sixth
column in a five-column table, which inflates the word budget from 170 to 214
and moves the table's classification. Split on unescaped pipes only; the
renderer already honours the escape.

**Trap: the header's first line is not the header.** When the table is not
rendered in isolation, the first line of the block is the title, and it carries
no `│`. Geometry comes off the last line before the rule that does.

**Trap: a cut is not a wrap.** Pairing fragments across the blank line between
body rows invents cuts, and pairing them across rows at all pairs a callsign's
tail with the next row's head. Fragments pair only across adjacent lines.

**Defect found while building the instrument.** `styleStateGlyph`
(`src/render.ts:89–122`) sets `visStart` to the start of the first escape
sequence rather than the glyph's visible position, so `text.slice(visStart +
prefixLen)` cuts one byte into the escape and leaves an orphan tail. A state
glyph opening a list item emits `\x1b[1m✓\x1b[0m[1m✓\x1b[0m` — a malformed
`[1m` with no ESC, and the glyph painted twice. 72 orphans across 10 documents.
Minimal repro:

```text
renderDocument("- **✓** Wrap engine.\n", { width: 80, color: "none" })
  → "    • \x1b[1m✓\x1b[0m[1m\x1b[1m✓\x1b[0m\x1b[0m Wrap engine.\x1b[0m"
```

It reaches the byte stream, so the voice path reads it and `say` speaks it. It
also shifts every following column by four bytes, which is why the instrument
strips the tail before slicing. Filed separately; not this brief's work.

**This brief is under its own rule.** Every table above is checked by the
instrument it proposes, and the check runs on this file.

## Related

- `playbooks/authoring-playbook.md` — *Tables have a width contract*, the
  reader-facing statement of the rule.
- `docs/2026-09-03-the-variable-is-the-invariant.md` — `okudagram = f(source,
  width, palette)`; width is a rendering input, and this brief is the first
  case where the function is the thing that is wrong.
- `decisions/004-hard-wrap-mandate.md` — okuda owns the line break. A cut word
  is a break the renderer chose badly, not one it was forced into.
- `briefs/2026-08-28-brief-elision-primitive.md` — elision is the fallback for
  the nine.
- `docs/tables.md`, `docs/tables-monster.md` — the table audit documents.
