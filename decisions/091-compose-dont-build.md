---
type: ADR
callsign: ADR-COMPOSE-DONT-BUILD-091
date: 2026-11-12
---

# Decision: Compose, don't build — the editor stays a real editor

**Date:** 2026-11-12
**Status:** Accepted — amended 2026-11-12 (same day): `BRF-EDITOR-HINT` was
refiled as `BRF-CODE-EDITOR-HINT` (`briefs/2026-11-12-brief-editor-hint.md`),
narrowed to code files only with
the hint derived from the scroll position (not an authored coordinate). The
"no editor-side briefs" constraint is narrowed: a scroll-position hint for code
files is a viewer-side actuator enhancement, not an editor-side brief. The
`BRF-TUI-LIVE` and `BRF-SRC-LINE-LEDGER` rejections stand. See the amendment
in **Decision** below.
**Amended 2026-11-16:** a second viewer-side actuator enhancement is admitted —
`BRF-HEADING-EDITOR-HINT` (`briefs/2026-11-16-brief-heading-editor-hint.md`),
which derives a markdown file's source line from the **ordinal of the heading
whose frame holds the viewport**. Like the scroll-position hint, it is computed
from the glass at the keypress and stored nowhere, so it is neither an authored
coordinate nor the map `ADR-LINE-IS-PROSE-078` refused. The refusal to build an
editor inside okuda is unchanged. See the second amendment in **Decision**.
**Enforced by:** `nothing — advice` — the decision is a refusal to build; no
gate enforces a non-implementation. The `88` actuator's existing behaviour
(`src/tui.ts:940`, `editArgs` in `src/clone.ts:136`) is the live instrument; this
ADR records why it is sufficient and why the brief that would have enhanced it
was rejected.

## Context

Three editor-related briefs have lived in this silo:

| callsign | what it proposed | status |
|---|---|---|
| `BRF-TUI-LIVE` | `fs.watch` into the TUI — scroll-preserving live preview | rejected 2026-10-14 (archived) |
| `BRF-SRC-LINE-LEDGER` | the `10` verb — jump from rendered line to source line | rejected 2026-10-27 (archived) |
| `BRF-EDITOR-HINT` | `88` forwards a `:NNN` line hint to the editor | rejected 2026-11-12 (archived, this ADR) |

All three are quality-of-life improvements on a composition that already works.
The composition is `scripts/gloam-edit.zsh` — 54 lines: editor left, `okuda
--watch` right, Herdr places the panes, every save re-renders. The `88`
actuator (`src/tui.ts:940`) spawns `$EDITOR` on `currentFile` from inside the
TUI. Both are live and dogfooded.

The question was assessed in `docs/2026-09-30-the-editor-as-a-separate-project.md`:
the box model makes the editor's *frame* cheap (~400–700 lines on top of
~1000–1500 inherited), but the frame was never the expensive part. The
expensive part is **editing** — the wrapped-row cursor arithmetic, the insert
keymap, the buffer — and the box model says nothing about it. A build buys the
cheap half and signs up for the expensive one.

## Decision

**The two-panel composition is the answer. No editor-side briefs will be
built. `88` to Zed (or `$EDITOR`) is sufficient.**

> **Amendment (2026-11-12, same day):** `BRF-EDITOR-HINT` was refiled as
> `BRF-CODE-EDITOR-HINT` (`briefs/2026-11-12-brief-editor-hint.md`). The refile
> narrows the scope to code files only and derives the hint from the **scroll
> position** — a live
> glass fact, not an authored coordinate. This eliminates the costs the ADR
> cited as reasons for rejection: no `lineOf` function, no precedence rule,
> no `AGENTS.md` amendment. The "no editor-side briefs" constraint is narrowed:
> a scroll-position hint for code files is a **viewer-side actuator
> enhancement** (the `88` key forwards the viewport's line to the editor),
> not an editor-side brief (which would build editing machinery inside okuda).
> The `BRF-TUI-LIVE` and `BRF-SRC-LINE-LEDGER` rejections stand unchanged.

> **Amendment (2026-11-16):** `BRF-HEADING-EDITOR-HINT` extends the exception
> from code files to markdown, by a different derivation. A code file's render
> maps 1:1 to its source (`scroll - 2`); a markdown file's does not. The smoke
> test measured the alternative the first refusal leaned on — a viewport-line
> text anchor — at **11% exact, 89% far misses** on a ground-truth fixture,
> because the anchor lands on wrapped fragments that recur. What does survive
> render exactly is the **heading ordinal**: groups of badge rows in the render
> and `^#{1,6} ` headings outside fences in the source are the same list in the
> same order (6 documents × 4 widths, exact at every width). The frame heading's
> ordinal is forwarded as the line — derived, not authored; computed, not
> stored. The synthetic `## References` receipt is excluded by the count delta
> (rendered = source or source + 1), never by name. The constraint below is
> widened to name this second shape. Search in Zed still costs seconds; what
> changed is that the cost need not be paid, not that the editor was built.

The `88` actuator opens the file the reader is standing in. The editor owns
the write, the syntax tree, the symbol search, the language server — everything
the renderer refuses to index (`ADR-LINE-IS-PROSE-078`). The file is the
message between the two panes (the seam rule, `docs/2026-10-10-the-seam.md`):
the editor writes, okuda reads, no shared mutable state.

A line hint forwarded from the render to the editor (the original
`BRF-EDITOR-HINT`, described below) is a comfort improvement on this
composition: "open at the line I'm reading" rather than "open at the top." The
cost was modest — a `lineOf` function, a precedence rule, an `AGENTS.md`
amendment — but the payoff a scroll saved, not a capability gained. **The
amendment above removes all three costs**; this paragraph is kept as the record
of what the rejection weighed, not as present law.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Build `BRF-EDITOR-HINT` (forward `:NNN` to the editor) | Quality-of-life on a working composition. The `88` actuator already opens the file; search in Zed costs seconds. The cost of building and maintaining the hint table, the precedence rule, and the clause amendment is not justified by the comfort. |
| Build `BRF-TUI-LIVE` (scroll-preserving `--watch` in the TUI) | Step 0 shipped (`r` reload re-anchors, `50b0e0e`); steps 1–5 (directory watch, debounce, content gate) never started. The streaming `--watch` resets to the top on save — a comfort gap, not a capability gap. Refile if the reset becomes a daily annoyance. |
| Build a single-process editor from okuda's screen machinery | Measured affordable (~400–700 lines delta) but signs up for *editing* forever — undo, macros, registers, search-and-replace, multi-file, wrapped-row cursor arithmetic. 54 lines of shell already gives you a real editor with all of that. The box model makes the frame cheap; the frame was never the expensive part. |
| Close the composition's gaps first, then decide | The two open briefs (`BRF-TUI-LIVE`, `BRF-SRC-LINE-LEDGER`) were already rejected. `BRF-EDITOR-HINT` was the last live editor brief. Rejecting it closes the family. |

## Consequences

**What became easier** *(as written; the first two items are amended below)*:

- **The editor brief family is closed.** Three briefs, all rejected, all
  archived. No live brief proposes to improve the editor-side of the
  composition. The work queue is honest.
  > *Amended 2026-11-12:* `BRF-EDITOR-HINT` was refiled as
  > `BRF-CODE-EDITOR-HINT` the same day. The **editor-side** family stays
  > closed — the refile builds no editing machinery. It is a viewer-side
  > actuator enhancement, which the amended constraint below permits.
- **`88` stays simple.** `editArgs` builds an argv from a path; no hint table,
  no precedence rule, no `lineOf` function. The actuator does one thing: open
  the file.
  > *Amended 2026-11-12:* `editArgs` gains an optional `hint` for code files.
  > The **precedence rule and `lineOf` function remain refused** — the refile
  > forwards the scroll position, not an authored mention. One branch, not a
  > table.
- **The boundary is clean.** okuda renders, the editor writes, the file is the
  message. No coordinate crosses the seam — which is `ADR-LINE-IS-PROSE-078`'s
  rule, unamended.

**What became harder:**

- **"Open at the line I'm reading" is not available.** `88` opens at the top of
  the file. For a 2,700-line file the reader must search in the editor. Accepted:
  the search costs seconds, and the alternative is a hint that rots
  (`ADR-LINE-IS-PROSE-078`'s finder: 11% of checkable line hints still land).
  > *Amended 2026-11-12:* this held for the authored coordinate the original
  > brief proposed. The refile's hint is a **live scroll position**, which
  > cannot rot — it is correct at the keypress and gone the moment after. For
  > code files the gap closes; for markdown files it stands (no constant offset).
  > *Amended 2026-11-16:* the markdown gap closes too, by heading ordinal rather
  > than constant offset. The prose anchor was measured first and rejected — 11%
  > exact on a ground-truth fixture, because wrapped fragments recur. Headings
  > are short, structurally marked in both spaces, and preserved through render;
  > the Nth in each list is the same section at every width tested (60–120).
- **Scroll-reset on save in the streaming `--watch` persists.** The preview
  pane jumps to the top on every save. Accepted: the content being written is
  at the top of the writer's attention anyway.

**Constraints this imposes:**

- **No editor-side briefs** (narrowed 2026-11-12). A future proposal to enhance
  the editor-side of the composition must show a concrete case where the
  two-panel composition *fails* and a single process would not — the gate the
  editor-as-separate-project doc names. **Exception:** a viewer-side actuator
  enhancement that forwards the glass's own state (scroll position, cursor
  position) to the editor is not an editor-side brief — it touches the `88`
  actuator, not the editor. `BRF-CODE-EDITOR-HINT` (the refile) is this
  exception. **Amended 2026-11-16:** `BRF-HEADING-EDITOR-HINT` is the second —
  heading ordinal for markdown files, derived from the glass's structure. The
  test is unchanged: glass state, computed at the keypress, stored nowhere.
- **`88`'s `editArgs` signature may accept a `hint`** when the hint is derived
  from the glass's state — the code-file scroll position (offset a measured
  constant) **or the markdown frame's heading ordinal** (amended 2026-11-16).
  An authored coordinate (`:NNN` from prose) is not permitted — that is
  `ADR-LINE-IS-PROSE-078`'s rule, unamended.

## Related

- Brief: `briefs/2026-11-16-brief-heading-editor-hint.md` —
  `BRF-HEADING-EDITOR-HINT`, the markdown sibling (heading ordinal, no authored
  coordinate, no map)
- Brief: `briefs/2026-11-12-brief-editor-hint.md` — `BRF-CODE-EDITOR-HINT`,
  the refile (code files only, scroll position, no authored coordinate)
- Brief: `.archive/briefs/2026-11-08-brief-editor-hint.md` — `BRF-EDITOR-HINT`,
  original (rejected, then refiled same day)
- Brief: `.archive/briefs/2026-08-26-brief-tui-live-documents.md` —
  `BRF-TUI-LIVE`, rejected 2026-10-14
- Brief: `.archive/briefs/2026-09-24-brief-source-line-ledger.md` —
  `BRF-SRC-LINE-LEDGER`, rejected 2026-10-27
- `docs/2026-09-30-the-editor-as-a-separate-project.md` — the assessment that
  measured the cost and named the fork
- `scripts/gloam-edit.zsh` — the composition (54 lines)
- `playbooks/gloam-preview-playbook.md` — `PLY-GLOAM-PREVIEW`, the shape and
  its gap
- `decisions/078-the-line-is-prose.md` — `ADR-LINE-IS-PROSE-078`, the rule that
  a line is prose and the address is the path
- `decisions/073-the-glass-owns-its-ink.md` — `ADR-GLASS-INK-073`, the boundary
  this composes with
