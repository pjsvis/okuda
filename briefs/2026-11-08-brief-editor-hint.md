---
type: Brief
callsign: BRF-EDITOR-HINT
---

# Brief: The editor hint — open where I'm reading, and forward the author's coordinate

**Date:** 2026-11-08
**Status:** Ready

---

## Context

`88` (`edit`, `src/keygrammar.ts`, documented at `docs/keymap.md:45`) is the spawn
pair's other half: `00` exits, `88` edits, `99` clones. It acts on `currentFile`
and nothing else — `src/tui.ts:939-954` reads `currentFile`, resolves the editor,
spawns. The glass knows exactly one thing the spawn wants and does not hand it
over: **where the reader is standing.**

`AGENTS.md` (*Reading, not editing*) states the boundary twice, and the two
statements disagree about the same act:

> **The file travels; the coordinate does not**: the spawn takes the path, and a
line hint stays prose on the page rather than becoming an argument to the editor.

> If a coordinate is ever wanted again, the shape this clause permits is
> **pass-through, not map**: forward the author's mention to the tool that
> resolves it, and store nothing.

The second sentence is the better rule, on its own stated grounds: the editor *is*
"the tool that resolves it" — it holds the file, the syntax tree and a search. This
brief takes that branch and amends the first sentence, which was written against a
line *map* and has been standing in for a line *hint*.

## Warrant

Three acts hide under one key, and the cheap one is the reason to start:

| the act | line from | rots? | value |
|---|---|---|---|
| `88` on a mention | the author | yes | **the gist** |
| `88` in `currentFile` | the glass, live | **no** | free |
| `§` then `88` | a mention left | yes, unseen | refused |

**The argument for forwarding a fallible line** is an asymmetry, not an optimism.
A coordinate is an unpaid claim **on the page** and a free gesture **in the editor**:
the same bytes change class at the seam. A miss costs a scroll; withholding the hint
costs a *find* — dearer than a scroll, and it interrupts the reading to pay for
itself. The failure is also informative rather than silent: past EOF the editor
clamps, or `nvim +N` says so, which is the prose admitting it is older than the file
at the moment the reader was going to look anyway.

The risk is a system risk and it must be named in the same breath: **an actuator
makes its input attractive.** Make coordinates payable and authors will write more
of them. So the tool is liberal in what it forwards and the prose stays strict in
what it writes — no new `file:NNN` (403 exist today; `rg` count, 2026-11-08), which
is `ADR-LINE-IS-PROSE-078`'s rule, unamended.

## Evidence

- **The coordinate is already on the glass, and already discarded.** Discovery
  swallows `:NNN` into the occurrence span and strips it from the target
  (`src/vectors.ts:126`, `pathOf` at `:135`), so the mention the cursor is on
  carries the author's line verbatim, and the jump map carries only paths. Nothing
  new has to be derived — a `lineOf` beside `pathOf` reads what the render already
  holds.
- **The editor grammar takes a hint in four shapes.** `zed <path>:<line>` and
  `subl <path>:<line>`; `code -g <path>:<line>` and `cursor -g <path>:<line>`; the
  vim family `<path> +<line>` through the terminal integration; everything else
  takes the plain path. `resolveEditor` already returns `{cmd, args, path, gui}`
  (`src/clone.ts:78-131`) and `editArgs` already builds the argv
  (`src/clone.ts:136-148`) — the table is one new function over an existing one.
- **`88` is refereed.** `tests/keymap-doc.test.ts` pins `docs/keymap.md`'s rows
  against `KEYBINDINGS`, so the page and the verb cannot drift; the description
  cell changes with the behaviour.
- **The glass already knows the cursor's line and its mention.** The deref verb
  resolves the target under the cursor; `currentFile` is a `const` read at spawn
  (`src/tui.ts:926`, `:946`).

## Objective

`88` opens the editor **where the reader is standing**: at the mention under the
cursor when there is one, at the cursor's line in `currentFile` otherwise — and it
forwards the author's own `:NNN`, verbatim, without correcting it.

## Scope

**In:** `88` only; the argv hint for the GUI set and the vim family; the degrade to
plain path for everything else; the keymap line; the `AGENTS.md` amendment.

**Out, deliberately:**

- **`§` (the jump).** The silcrow stays file-level forever: one address per
  destination, keyed on the path (`ADR-LINE-IS-PROSE-078`). A coordinate never
  enters the map, the cursor state, or the footer.
- **A line map, a line index, a symbol table.** That is the editor's job; okuda
  forwards what the author wrote and stores nothing.
- **Correction, clamping, "nearest symbol".** If okuda adjusts the number it has
  begun maintaining the map this brief refuses.
- **`99` (clone).** The clone carries the file; a hint there is a different
  question and has no reader standing on a mention.
- **Terminal-editor argv beyond `+N`.** `micro`, `nano`, `helix` and anything
  declared through `OKUDA_EDITOR` take the plain path until a reader asks.

## Preconditions

1. The cursor's mention must be recoverable at spawn time **without a second
   scan**: the TUI already holds the derived references and the cursor's column
   (`src/tui.ts:854`, `:1189-1201`). If it does not, the brief loses its cheap
   half and Phase 1 ships alone.
2. `editArgs` must stay pure — a spec in, an argv out — so the hint table is
   testable without spawning. The current signature already is
   (`src/clone.ts:136-143`).

## Work Plan

**Phase 1 — open where I'm reading (no prose coordinate needed).** `edit()`
passes the cursor's line in `currentFile`; `editArgs` gains an optional
`hint: { line: number } | null` and formats it per editor
(`zed`/`subl`: `path:line`; `code`/`cursor`: `-g path:line`; vim family and
unknown: unchanged). Tests: each editor shape; a hint of `null` produces today's
argv **byte for byte**; the terminal integration path is untouched.

**Phase 2 — the mention under the cursor.** `lineOf(mention)` beside `pathOf`;
`88` gains one precedence rule — a reference occurrence containing the cursor
wins over `currentFile`, and its span text is forwarded. The occurrence, not the
map, carries the hint: it is per-render and dies with it. Tests: a mention with a
hint, a mention without one (opens at the file), a mention whose hint points past
EOF (forwarded unchanged), a mention of a file that is not `currentFile`
(hint forwarded for *that* file), no mention (falls back to Phase 1).

**Phase 3 — the page, the clause, the receipt.** `docs/keymap.md:45` gains the
sentence (`this document, or the mention under the cursor, in the editor`);
`AGENTS.md`'s *Reading, not editing* clause is amended — the coordinate travels
**as the author's bytes, forwarded, never stored**, with the sentence that
forbids it annotated rather than deleted (palimpsest, as `ADR-LINE-IS-PROSE-078`
itself was); a debrief.

## Acceptance Criteria

1. `just check` green, including the keymap referee.
2. With no mention under the cursor, the argv is **identical** to today's — a
   test pins the byte comparison for every editor in the table.
3. The forwarded hint is the author's substring, unmodified: a mention of `:999`
   in a 40-line file forwards `999`, and no test asserts a correction.
4. `§` behaviour is unchanged: no test in `tests/vectors.test.ts` moves, and the
   jump map still keys on the path alone.
5. `OKUDA_EDITOR` and an unknown editor degrade to the plain path; nothing is
   guessed from the command name beyond the declared table.
6. `AGENTS.md`'s amendment quotes both halves of the old clause and names this
   brief; the sentence deleted is quoted, not silently replaced.

## Notes

- **Silent, always.** No flash announcing the line, no footer mark, no `§` on the
  number. Announcing it makes the coordinate a *destination*, and destinations get
  trusted. A motion stays a motion.
- **The badge already paints after the whole span** (`path:NNN`, then `§12`), so
  the page's visual grammar does not change — the number is the author's, the
  silcrow is the file's, and the two are not the same claim.
- **What this does not fix:** stale coordinates in the corpus. 403 exist; the
  editor makes each of them cheaper to discover and none of them true. The
  baseline and the no-new-ones rule are the prose half, and they stay.

## Related

- `AGENTS.md` (*Reading, not editing*) — the clause amended, both halves
- `decisions/078-the-line-is-prose.md` — the rule this brief keeps and the map it
  refuses
- `decisions/075-the-dereference-mark.md` — the rose's two channels, address and
  state
- `src/clone.ts` — `resolveEditor`, `editArgs`, the GUI set and the degrade
- `src/vectors.ts` — `pathOf`, the span that already holds the hint
- `docs/keymap.md:45` — the row the referee pins
- `briefs/2026-11-05-brief-own-surface.md` — the precedent for a brief that amends
  a written clause rather than overturning it
