---
date: 2026-09-15
kind: research note — an accessibility convention surveyed against okuda's own tools
lineage: the reader's question (2026-09-15) — *what do unsighted listeners do to
  navigate tables, are there conventions, what is out there in the wild, and what
  do the blind think and want*. Read against
  `docs/2026-09-06-protocol-free-text-identity.md` (the AT seam),
  `explainers/accessibility.md`, and the sibling tool `speak-md`.
status: open — the survey is complete and the recommendation is specific; none of
  it is built. The re-hear actuator needs an ear on it before it is called done.
---

# Tables for unsighted listeners — the flattening, and the one thing missing

> Aligned columns are a *visual* encoding. Every screen reader convention in the
> wild answers them the same way: flatten the grid, read one row at a time, and
> name the columns. okuda's sibling tool already does this correctly. What no CLI
> has — and what the research says is actually needed — is the ability to re-hear
> the headers.

## The question

What do unsighted listeners do with a table? Are there conventions? What is out
there, and what do blind readers say they want?

Four sources answer it, and they converge. The interesting finding is not the
convention — okuda's own voice tool already implements it — but the one affordance
that is missing from every implementation surveyed, including ours.

## How a screen reader actually navigates a table

Léonie Watson (blind; the reference account) describes the mechanics precisely.

Press **`t`** and focus moves to the table. It announces the caption and the
dimensions:

> "Average daily tea and coffee consumption / Table with 3 columns and 4 rows"

**`Ctrl+Alt+Arrow`** then moves cell by cell. Moving across a row announces the
*column* header; moving down a column announces the *row* header. Repeating a
direction at the boundary gives *"edge of table."*

The load-bearing sentence: the screen reader **"counts on you remembering which row
you're in."** It supplies one axis and the reader holds the other in working memory.

And the precondition: all of it depends on proper `th` semantics. There is no table
apparatus without markup — **so in a terminal there is no table, only lines.**

## What blind readers say they want

Michael Taylor, writing from his own daily use, gives the preference set directly.

- **Image-embedded tables are the worst case.** The screen reader announces
  "Image" and the table is gone.
- **A value without its headers is meaningless.** His example: a bare *"37 degrees
  Fahrenheit"* could be the record high, the record low, or the actual. It cannot
  be told apart.
- **Coordinates are the wrong fix.** *"37 degrees Fahrenheit, Row 5, Column 4 …
  requires users to constantly remember row and column positions, which becomes
  complex — if not impossible — in larger, more complex tables."*
- **What is wanted is labels spoken with the value:** *"37 degrees Fahrenheit,
  Tuesday, February 4, Actual Temperature."*
- Plus two constraints: **linear order** (row by row, left to right, the way a
  sighted reader reads) and **less output**.

So the preference is unambiguous. Not positions — labels.

## The convention in the wild

Every serious CLI has added a **declared screen-reader mode**, and each did it
independently:

- `gcloud` — an `accessibility/screen_reader` setting that replaces spinners with
  plain "working" text
- **GitHub CLI** — rewrote its spinner and prompt library for the same reason, then
  shipped `gh a11y`
- **Gemini CLI** — a `--screen-reader` flag
- **Claude Code** — open issue #11002, describing NVDA freezing mid-session during
  streaming output

`term-a11y` generalises the pattern and names the detection order:
`--screen-reader` / `--a11y` → `TERM_A11Y=1` → **`ACCESSIBLE=1`** → non-TTY →
`CI=true`. `ACCESSIBLE=1` is not a new invention: it is the existing convention
used by GNOME's AT-SPI stack and Debian's `dpkg-reconfigure` to mean *a screen
reader is active*.

Microsoft's PowerShell guidance converges from the other direction. It offers two
strategies: **escape the terminal** (`Out-GridView`, CSV to a spreadsheet, HTML to a
browser), or **reduce and reformat** — filter and select, then `Format-List`, which
*"provides a better narration experience for screen readers."*

Three independent answers, one shape:

| source | transform | headers |
|---|---|---|
| Microsoft `Format-List` | key/value per record | repeated per record |
| `term-a11y` | `Field: value` blocks | repeated per record |
| `speak-md` | declared, rows in order | announced once |

**Flatten, read row by row, name the columns.**

## The gap in okuda

okuda declares no screen-reader mode at all: no `ACCESSIBLE`, no `--screen-reader`,
no `a11y` anywhere in `src/`, `scripts/` or the `justfile`.

And its table render is close to the worst case for a listener. Verbatim from
`./okuda tmp/table-probe.md`:

```
  Service │ Status  │ Port
  ────────────────────────────────────────────────────────────────────────────

  api       running   8080

  worker    stopped   9090
```

Three things are wrong for the ear:

1. **Box-drawing.** The `│` separators are Unicode line-art. `term-a11y`'s linter
   flags this pattern by name (`no-box-drawing-literal`), because a screen reader
   either skips the glyph or reads it as noise.
2. **A 76-character rule run** between header and body, and again at the foot.
3. **A blank line between every row** — okuda's loose-table spacing — so the ear
   traverses **three lines per record** instead of one, and the silence between
   rows reads as structure that isn't there.

And there is **no header re-announcement**. Row two arrives as *"worker stopped
9090"*, six lines after the headers, and the listener must still be holding
"column two is Status."

**The documented escape hatch does not work for tables.**
`docs/2026-09-06-protocol-free-text-identity.md` names the seam honestly — *"prose
degrades gracefully; structure degrades unevenly"* — and offers the resolution
*"`cat` the file, don't pipe through okuda."* For mermaid that is sound: the source
genuinely is more readable than ASCII art. For tables it is not. The source is:

```
| Service | Status | Port |
|---|---|---|
```

Pipes and dashes. The hatch trades one noise for another.

## What okuda already got right

The accessible answer exists — in the sibling tool. `speak-md --dry` on the same
table:

```
Table. Columns: Service, Status and Port.
api, running, 8080.
worker, stopped, 9090.
```

Three things are correct here:

1. **It declares the table.** *"Table."* answers Watson's test — *will someone know
   what kind of content they're dealing with?*
2. **It announces the headers once**, as a joined list with natural conjunction.
3. **It reads rows linearly**, one per line, with no rule runs and no line-art.

And in one respect it is better than `Format-List`: Microsoft repeats the field
names on **every** record, which costs O(rows × columns) words. Announcing once
costs O(columns) words plus O(rows × columns) values. For a fifty-row table that is
the difference between usable and unlistenable.

**The silo built the accessible answer and documented the wrong escape hatch.**

## The one thing missing — and it is not the format

Announcing once is the right trade, but it transfers the memory burden to the
listener. That is the same problem Watson describes from the other side: the screen
reader holds one axis and the reader holds the other. Here the tool holds nothing,
and the reader holds all of it.

So the missing piece is not a better flattening. It is **the ability to re-hear the
headers on demand**.

Re-hearing is a *navigation* affordance, not a rendering one — which places it by
the silo's own division of labour (ADR-033 / ADR-036: okuda owns the cue, the
environment owns the voice). The compositor flattens; the surface re-orients.

## The recommendation

1. **`speak-md` keeps the flattening.** It is correct, and it belongs to the
   compositor. No change proposed.
2. **The surface gains a re-hear-the-headers actuator** — one key, available only
   while a table is in the current render. This is the affordance no CLI in the
   wild has, and the one the research says is needed.
3. **If a declared mode is ever added, honour `ACCESSIBLE=1`** rather than
   inventing a variable. It costs nothing and inherits any setup the reader already
   has.
4. **Correct the seam document.** The honest claim is not *"`cat` the file"*; it is
   *"tables are rendered for the visual sink, and the voice path is `speak-md`."*
   That is both stronger and truer, and it names the owner.

## A caution carried forward

From `term-a11y`'s own README, which is worth keeping in front of any work in this
area:

> This doesn't replace testing with an actual screen reader. … Secondhand
> assumptions about what "sounds right" are exactly the kind of mistake this project
> exists to avoid.

Everything above is a convention survey. The re-hear actuator in particular is
exactly the kind of thing that needs an ear on it before it is called done.

## Sources

- Léonie Watson, *How screen readers navigate data tables* — tink.uk
- Michael Taylor, *Common Accessibility Challenges When Navigating Tables* —
  blog.usablenet.com
- `term-a11y` — github.com/zaydea805/term-a11y
- *Improve the accessibility of output in PowerShell* — learn.microsoft.com
- W3C WAI, *Tables Tutorial* — w3.org/WAI/tutorials/tables

## Related

- `docs/2026-09-06-protocol-free-text-identity.md` — the AT seam this corrects
- `explainers/accessibility.md` — the accessibility position
- ADR-033 / ADR-036 — okuda owns the cue; the environment owns the voice
- `docs/2026-09-14-derrida-and-the-decomposed-pdf.md` — the same reading habit:
  a schema decides what survives
