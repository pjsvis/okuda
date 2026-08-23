# Brief: Table Rendering Policy — Uniform Presentation, Authored Conventions

**Date:** 2026-08-23
**Status:** Open
**Depends on:** 2026-08-22-brief-ansi-emission-and-closed-grammar.md (done — the grammar table's Table row this extends)
**Extends:** the Table row of the grammar table in brief 002 (which states the core rule tersely; this brief adds the policy around it)
**Related:** `decisions/005-no-markdown-table-rendering.md` in the `mermaid-to-md` silo — rejected *baking* tables as Unicode art; does not conflict (the Derrida tests there target the bake, not live rendering)

## Objective

Define the policy around Okuda's table rendering: a **uniform presentation layer** applied to every pipe table, with **authoring conventions** separated out as the agent's concern. The renderer is dumb and uniform — it does not detect table provenance or decide whether to reformat.

## The split (where each constraint lives)

### Render presentation — Okuda's job, applied uniformly to every pipe table

Already recorded tersely in brief 002's grammar table: no ASCII box borders, column gutter spacing, header row cyan + horizontal rule, first column amber/bold, blank line between rows. This brief adds the policy constraints that the one-line grammar entry couldn't carry:

* **Uniform — no detection.** The renderer does not inspect table provenance or width band. It always applies the same presentation layer. The moment a viewer has a "should we reformat this?" gate, it imports unpredictability — the one thing a viewer must not import.
* **Header rule kept.** "Strip the dividing lines" read literally would remove the header separator too. The header rule is the one structural cue that makes a table scan as a table — structure, not decoration. No internal `|` pipes, no `+---+` box border, but the `─` under the header stays.
* **Preserve alignment semantics.** `:---:` / `:--` / `---:` markers are author intent, not presentation. Centre-aligned cells stay centred; right-aligned stay right. Left-align is the default. Mutating alignment mutates meaning — that is the line between presentation (Okuda's business) and structure (sacred).
* **No artificial floor.** A 2-column short-cell table is naturally 20 cols; do not pad to 40. Centre if it looks lost on a wide pane; never pad for aesthetics.
* **Fit the terminal width** (`process.stdout.columns`). Never overflow the pane. This is "displaying on this screen," not "fixing your table."

### Authoring conventions — our agent's job

These apply when our agent generates a table. They live in an agent style guide, not in the renderer.

* **First column = the key/identifier.** So the render-time amber-first-column reads as structure, not noise.
* **Keep cells single-line.** Pipe tables can't express multiline cells portably — `<br>` is HTML (leaks as literal text in a terminal viewer), embedded newlines end the row. If a cell needs multiple lines, that's a signal the table is the wrong format — use a definition list, a nested list, or split into two tables.
* **Use alignment markers** when alignment carries meaning (numeric right-align, label centre-align).
* **Target ~80 cols,** keep cells terse. This is a generation-time target for our agent's tables, not a render-time law on inherited ones.

## Use cases (two authors, one treatment)

1. **We author the table** → agent follows authoring conventions → renderer applies uniform presentation → looks good.
2. **External table** (third-party README, pasted dump) → renderer applies uniform presentation → looks consistent, maybe semantically odd (first column may not be a key, alignment may be absent). Not our problem.
3. **Table inside a `​``` `code` block** → verbatim bytes (it's code, not markdown) → genuinely not our problem. Okuda passes all code blocks through unchanged by design.

Use case 3 is the only place "as-is" is literal. Use cases 1 and 2 both run the uniform presentation layer; the difference is whether the authoring conventions were followed upstream, which is not the renderer's concern.

## Why not reformat inherited tables

An earlier draft proposed: (2) display inherited tables as-is, (3) *might* reformat inherited tables. The "might" is a fuzzy semantic gate, and fuzzy gates in a viewer produce unpredictability. This brief replaces the gate with an origin test that is not the renderer's concern at all: *did our agent write this table?* If yes, the authoring conventions apply at authoring time. If no, the uniform presentation layer still runs. The renderer stays dumb and uniform.

This is the list policy wearing a different hat: presentation is Okuda's business, structure is sacred, and predictability is the whole product.

## Why the bake gate doesn't apply

`decisions/005-no-markdown-table-rendering.md` (in the `mermaid-to-md` silo) rejected *baking* pipe tables as Unicode art. Its Derrida tests — brokenness (pipe tables are already legible in `cat`, diffs, email, Glow), disclosure (art decorates, doesn't disclose), moat (column alignment is ~100 lines, not a 5,200-line engine) — all target the bake. A live viewer rendering a table is the viewer's job; none of those tests transfer. The bake stays rejected; live rendering is in scope.

## Acceptance criteria

* Every markdown pipe table in the rendered document — agent-authored or external — renders with: blank line between rows, no internal pipes or box borders, a header rule, three-channel colour, terminal-width fit, preserved alignment.
* `:---:` centre markers render centred cells; `--:` right-aligned; `---` left-aligned. Alignment carried through.
* A 2-column, 20-col-wide table is not padded to 40 cols.
* A table inside a `​``` `code` block renders as verbatim bytes — no loose spacing, no colour, no header rule.
* An external table with no first-column-key semantics still renders col 0 in amber. Predictable beats smart.

## Out of scope

* Baking tables as Unicode art (rejected per decision 005 in the `mermaid-to-md` silo).
* Detection / reformatting of inherited tables. Replaced by the uniform-presentation + authored-conventions split.
* Hard 40-col floor or hard 80-col ceiling on inherited tables. Replaced by terminal-width fit and a ~80-col *target* for agent-authored tables.
* Multiline-cell wrapping logic. Dropped — single-line cells only; multiline content is a signal to change format.
* Per-column-type colour palettes, sortable columns, interactive tables.

## Iteration note

The constraints above are the load-bearing decisions. We will tune the exact spacing, the header-rule weight, and the colour balance against real tables in real panes once the renderer exists. Do not over-spec the aesthetics before seeing real output.
