---
type: Brief
callsign: BRF-CODE-EDITOR-HINT
---

# Brief: The editor hint — `88` opens a code file where you're reading

**Date:** 2026-11-12
**Status:** Open
**Refiled from:** `.archive/briefs/2026-11-08-brief-editor-hint.md` (`BRF-EDITOR-HINT`,
rejected 2026-11-12, same day — the operator re-read the brief and saw that the
scoping to code files eliminates the expensive half. The original proposed
forwarding authored `:NNN` coordinates from mentions; this refile forwards the
viewport position only, for code files only. The cost collapse is documented
below. See `ADR-COMPOSE-DONT-BUILD-091`, amended.)

**A new callsign, not a reused one.** `BRF-EDITOR-HINT` stays with the archived
original, where the citations in `ADR-COMPOSE-DONT-BUILD-091` and
`debriefs/2026-11-09-debrief-the-machine-forked-itself.md` already point. One
address pointing at two documents is a collision the resolver refuses
(measured 2026-11-12), and a refile with a different scope is a different
promise. The precedent is `BRF-SURFACE-PLAN`, split from `BRF-SURFACE-PICKER`
with its own callsign while the original kept its own in the archive.

---

## Context

`88` (`edit`, `src/keygrammar.ts`, documented at `docs/keymap.md:45`) spawns
`$EDITOR` on `currentFile`. It opens at the top of the file. For a 2,700-line
code file, the reader scrolls to the thing they want to change, presses `88`,
and lands at line 1 in the editor — then must search for the line they were
just looking at.

The original brief (`BRF-EDITOR-HINT`, archived) proposed forwarding a line
hint in three cases: the cursor's position in `currentFile`, the author's
`:NNN` from a mention under the cursor, and an `AGENTS.md` clause amendment to
permit the coordinate to cross the seam. That brief was rejected because the
cost (a `lineOf` function, a precedence rule, a palimpsest amendment) was not
justified by the comfort.

The operator re-read the brief and saw the narrowing: **code files only, viewport
position only.** No authored coordinate, no mention, no clause amendment. The
cost collapses.

## Why code files make it cheap

A code file rendered by okuda is a single fence (`wrapWholeFile`,
`src/render.ts:1175`). The fence handler (`codeBlockLines`, `src/render.ts:1149`)
**elides** (truncates with `…`), it does not wrap. So every source line maps to
exactly one rendered line — the correspondence is 1:1, always.

The rendered output for a code file is (measured 2026-11-12, `okuda
src/render.ts --no-color | cat -n`):

| rendered line | content | source line |
|---|---|---|
| 1 | `okuda · path/to/file.ts` | — (header) |
| 2 | *(blank)* | — (separator) |
| 3 | `  const x = 1;` | 1 |
| 4 | `  const y = 2;` | 2 |
| N+2 | `  source line N` | N |
| last | `█ ──── … ── █` | — (fence close) |

The header is always one line (`elideToWidth`, `src/render.ts:779` — it elides
rather than wraps). The blank after it is constant. So:

**`sourceLine = scroll - 2`**, clamped to ≥ 1.

`scroll` is the TUI's viewport top (`src/tui.ts:890`), already held in the
closure `edit()` reads. `currentFile` is `src/tui.ts:765`. Both are live facts
about the glass — not authored, not stored, not rendered on the page.

## Why markdown files are out of scope

A markdown document's rendered lines do not correspond 1:1 to source lines.
Headings, lists, tables, blank lines, and the References receipt all shift the
mapping, and wrapping is active for prose (`wrapANSI`, `src/wrap.ts`). There is
no constant offset. Deriving a source line from a markdown scroll position
would require a line map — which is `ADR-LINE-IS-PROSE-078`'s refused map, built
for a different purpose and arriving at the same cost.

Code files are the case where the hint is free. Markdown files are the case
where it is not. The scope follows the cost.

## Objective

`88` on a code file opens the editor at the source line the reader is looking
at. `88` on a markdown file opens at the top, unchanged.

## Evidence

- **The offset is a measured constant.** `okuda src/render.ts --no-color | cat -n`
  (2026-11-12): rendered line 1 is the header, line 2 is blank, line 3 is source
  line 1. The header elides (`src/render.ts:779`), so it is always one line.
- **Code fence lines do not wrap.** `codeBlockLines` (`src/render.ts:1149-1158`)
  applies `elideToWidth`, not `wrapANSI`. Each source line is one rendered line.
- **`scroll` and `currentFile` are already in scope.** `edit()` (`src/tui.ts:940`)
  reads `currentFile`; `scroll` (`src/tui.ts:890`) is in the same closure.
- **`isWholeFileFence` already exists.** `src/render.ts:1168` — the same test
  the TUI uses to decide whether to wrap a file in a fence. One import, one
  branch.
- **`editArgs` is pure and already returns a spec.** `src/clone.ts:136-148` —
  `{cmd, args}` for GUI editors, delegates to `cloneArgs` for terminal editors.
  An optional `hint` parameter is one new branch in each path.
- **The editor grammar takes a hint in four shapes.** `zed path:line`,
  `subl path:line`; `code -g path:line`, `cursor -g path:line`; vim family
  `path +line` through the terminal integration; everything else takes the
  plain path. `resolveEditor` (`src/clone.ts:78-131`) already returns
  `{cmd, args, path, gui, name}`.
- **`88` is refereed.** `tests/keymap-doc.test.ts` pins `docs/keymap.md`'s rows
  against `KEYBINDINGS`.
- **No authored coordinate crosses the seam.** The hint is the scroll position
  — a live fact about the glass, not prose on the page. `ADR-LINE-IS-PROSE-078`
  stands unamended: the line is prose, the address is the path. A scroll offset
  is neither.

## Scope

**In:** `88` only; code files only (`isWholeFileFence(currentFile)`); the
viewport position forwarded as a line hint; the argv hint for the GUI editor
set (`zed`/`subl`/`code`/`cursor`) and the vim family (`+N`); the degrade to
plain path for unknown editors; the keymap line update.

**Out, deliberately:**

- **Markdown files.** No constant offset exists; deriving a source line
  requires a map. Refused by `ADR-LINE-IS-PROSE-078`.
- **The mention under the cursor.** No `lineOf` function, no precedence rule.
  The authored `:NNN` is prose (`ADR-LINE-IS-PROSE-078`); the scroll position
  is the glass's state. This is the cost collapse: the original brief's Phase 2
  is eliminated entirely.
- **`AGENTS.md` amendment.** The clause says "the file travels; the coordinate
  does not." A scroll offset is not a coordinate on the page — it is not
  authored, not rendered, not stored. The clause stands unamended.
- **`§` (the jump).** Unchanged. The silcrow stays file-level.
- **`99` (clone).** Unchanged.
- **Correction, clamping, "nearest symbol".** The hint is forwarded as-is. If
  it points past EOF, the editor clamps; okuda does not.

## Preconditions

1. `isWholeFileFence(currentFile)` must be importable from `src/render.ts`.
   It is exported (`src/render.ts:1168`).
2. The header offset (2 rendered lines) must be stable. It is: the header is
   one elided line (`src/render.ts:779`) followed by one blank. A test pins it.
3. `editArgs` must stay pure — a spec in, an argv out. The current signature
   already is (`src/clone.ts:136-143`).

## Work Plan

**Phase 1 — the hint in `editArgs`.** `editArgs` gains an optional
`hint: { line: number } | null` (default `null`). When `hint` is non-null:
- GUI editors (`zed`, `subl`): `path:line` in the args array.
- GUI editors (`code`, `cursor`): `-g path:line` in the args array.
- Vim family (terminal integration): `+line` before the path.
- Unknown / `OKUDA_EDITOR`: plain path, hint discarded.
When `hint` is `null`: today's argv, **byte for byte**.

Tests: each editor shape with a hint; `null` hint produces today's argv
byte-for-byte; the terminal integration path is untouched.

**Phase 2 — wire the scroll into `edit()`.** In `edit()` (`src/tui.ts:940`):
- If `isWholeFileFence(currentFile)`: compute `line = max(1, scroll - 2)`.
  Pass `{ line }` as the hint.
- Else: pass `null` (no hint). Today's behaviour, unchanged.

The constant `2` is named `CODE_HEADER_LINES` and measured by a test that
renders a known file and counts the lines before the first code line.

**Phase 3 — the keymap line.** `docs/keymap.md:45` gains the clarification:
"opens the file in the editor; for code files, at the line you're reading."
The referee (`tests/keymap-doc.test.ts`) pins the change.

## Acceptance Criteria

1. `just check` green, including the keymap referee.
2. For a markdown file, the argv is **identical** to today's — a test pins the
   byte comparison.
3. For a code file, the argv includes the line hint in the editor's grammar
   (`zed`/`subl`: `path:line`; `code`/`cursor`: `-g path:line`; vim: `+line`).
4. The hint is `max(1, scroll - CODE_HEADER_LINES)` — a test renders a file,
   counts the offset, and asserts `CODE_HEADER_LINES === 2`.
5. An unknown editor (`OKUDA_EDITOR` set to an unrecognised command) degrades
   to the plain path; the hint is discarded.
6. `§` behaviour is unchanged: no test in `tests/vectors.test.ts` moves.
7. `ADR-LINE-IS-PROSE-078` is not amended; no `AGENTS.md` change.

## Notes

- **Silent, always.** No flash announcing the line. The flash says "editing:
  file.ts (zed)" — the line is not named.
- **The hint is live, not authored.** It does not rot. The scroll position is
  correct at the moment of the keypress and gone the moment after. This is the
  difference from the original brief, which forwarded an authored `:NNN` that
  could be stale.
- **Elision does not break the mapping.** A code line elided to `…` is still
  one rendered line — the source line exists, the reader was looking at it,
  and the hint points to it. The editor will show the full line.
- **What this does not fix:** the scroll-reset on save in streaming `--watch`.
  That is `BRF-TUI-LIVE`'s gap, still rejected. This brief is about the `88`
  actuator from inside the TUI, not the streaming preview.

## What changed from the original brief

The original (`BRF-EDITOR-HINT`, archived) had three phases:

| phase | original | this refile |
|---|---|---|
| 1 — cursor's line in `currentFile` | all files | code files only |
| 2 — mention under the cursor | `lineOf(mention)`, precedence rule | **eliminated** |
| 3 — the page, the clause | `AGENTS.md` amendment | **eliminated** |

The cost collapse: no `lineOf` function, no precedence rule, no palimpsest
amendment. The hint is the scroll position — a live glass fact, not an authored
coordinate. The scope is `isWholeFileFence(currentFile)` — the one case where
the offset is a constant and the mapping is 1:1.

## Related

- `decisions/091-compose-dont-build.md` — `ADR-COMPOSE-DONT-BUILD-091`,
  amended by this refile (the "no editor-side briefs" constraint is narrowed:
  a scroll-position hint for code files is not an editor-side brief, it is a
  viewer-side actuator enhancement)
- `decisions/078-the-line-is-prose.md` — `ADR-LINE-IS-PROSE-078`, unamended
- `.archive/briefs/2026-11-08-brief-editor-hint.md` — the original, rejected
  and refiled same day
- `src/clone.ts` — `resolveEditor`, `editArgs`, the GUI set and the degrade
- `src/render.ts` — `isWholeFileFence`, `wrapWholeFile`, `codeBlockLines`
- `src/tui.ts:940` — `edit()`, where `scroll` and `currentFile` meet
- `docs/keymap.md:45` — the row the referee pins
