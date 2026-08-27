# Brief: Elision primitive — close ADR-014, fix the code-fence soft-wrap lie

**Date:** 2026-08-28
**Status:** Open (dogfood-fired; retires a deferred note and an unimplemented ADR)
**Branch:** feat/gloam-launcher
**Context:** dogfood finding on `feat/gloam-launcher`. Long lines inside
code fences wrap instead of being chopped at the content boundary, and
there is no horizontal-overflow ellipsis. On inspection this is two
manifestations of one root cause: the elision primitive was designed
(`docs/2026-08-27-okudagram-scratchpad.md` — "the elision fringe"),
decided (ADR-014), and never built. Anywhere.

## The two findings, one root cause

1. **Code fences soft-wrap — the terminal doing okuda's job badly.**
   The `code` handler (`src/render.ts:530`) emits each line verbatim:
   `styler.codeLine("  " + l)`. No chop, no ellipsis. A line longer than
   the content width is emitted longer than the display width, and the
   *terminal* soft-wraps it. That "wrap" is not okuda wrapping — it's
   the terminal soft-wrapping a line okuda let through. This is the
   exact failure mode ADR-004 was written to prevent ("terminal soft-wrap
   is invisible to the program… mangles unwrappable blocks"). ADR-004
   carved out an exception: "Fences overflow ugly by design." That
   exception was the lesser evil *when the only alternative was
   wrapping*. It is no longer the only alternative.

2. **The missing ellipsis is a deferred note come due.** The session
   handoff (`docs/2026-08-27-session-handoff-launcher-stamp.md:25`)
   flagged it explicitly: "Code blocks currently wrap, which looks bad.
   Apply the overflow ellipsis chips… Same doctrine as tables (ADR-014
   elision over shrink-wrap), one layer over." The gate fired in dogfood.

3. **ADR-014 is Accepted but unimplemented** — the governance gap. The
   table code at `src/render.ts:802` still does *shrink-wrap* ("Shrink
   wide tables by wrapping the widest columns to a proportional
   budget") — the exact behaviour ADR-014 reverses. An Accepted ADR the
   code contradicts is entropy: the map and territory diverged.

## What

One elision primitive, two consumers, one doctrine.

**The primitive** — `elideToWidth(line, width)`: hard-truncate a line
to the content width; when the line overflowed, replace the last column
with `…` (the horizontal-continuation glyph). Pure, grapheme-aware (the
width engine already is; `src/width.ts` measures display columns). This
is the single-cell form of the scratchpad's "elision fringe" — the
fringe (three stacked `…`) is the block-level decoration that *rows*
of elided lines produce collectively. The primitive is per-line; the
fringe is the visual emergent when a block of overflowed lines all
carry the marker on the same edge. Build the per-line primitive; the
fringe comes free from a block of code that overflows together.

**Consumer 1 — code fences.** Replace the verbatim emit in the `code`
handler with `elideToWidth`. Closes the soft-wrap lie (a wrapped code
line is one line pretending to be two) and restores ADR-004's "never
emit a line longer than display width" invariant for fences too — the
fence exception closes, not by wrapping but by eliding.

**Consumer 2 — tables.** Replace the shrink-wrap block
(`src/render.ts:802–814`) with "render to natural column width, elide
columns that run off the right edge." Closes the ADR-014 divergence:
the code matches the decision. A wide table keeps its columns and its
vertical scan; the reader sees *less* but *truthfully*, with `…` at the
edge inviting the remedy (widen the matrix, or page within the panel).

## Why it earns its place

1. **Closes a governance gap.** ADR-014 is Accepted; the code
   contradicts it. Either build it (closes the gap) or mark it
   `Accepted::Deferred`. Building is the honest fix; re-statusing is
   honest parking; leaving it as-is is neither. This brief builds.
2. **Retires the code-fence half of the FUT session's deferred note.**
   The scoping half (alt-screen) is briefed separately
   (`briefs/2026-08-28-brief-launcher-fut.md`); this brief retires the
   other half — "Code blocks currently wrap, which looks bad."
3. **One primitive, two consumers, one doctrine.** No-reflow brutalism
   (the scratchpad's "a wrapped diagram is a broken diagram pretending
   to be whole; elision is crueller and more useful") applied uniformly
   to the two block types that exceed width: code and tables. One
   `elideToWidth`, two call sites, no second code path.
4. **Restores ADR-004's invariant for fences.** okuda owns every `\n`;
   today it leaks that ownership to the terminal for code fences. The
   fence exception in ADR-004 was "overflow ugly by design" — elision
   is the same intent (never wrap raw content) without the leak.

## How

**The primitive** (`src/render.ts` or `src/wrap.ts` — it's a width
operation, so `wrap.ts` is the natural home):

```ts
/** Hard-truncate `line` to `width` display columns. When the line
 *  overflowed, replace the last column with `…` — the horizontal-
 *  continuation glyph. The per-line form of the elision fringe
 *  (scratchpad: a block of overflowed lines carrying the marker on the
 *  same edge renders the fringe collectively). Pure, grapheme-aware. */
export function elideToWidth(line: string, width: number): string
```

- Measure with the existing `displayWidth` (`src/width.ts`).
- If `displayWidth(line) <= width`, return `line` unchanged.
- Else truncate to `width - 1` columns (grapheme-safe) and append `…`.
- ANSI-safe: the code line carries styling; truncate on the *stripped*
  string then re-apply, or truncate with a width-aware slicer that
  preserves SGR runs. The wrap engine already solves this (`wrapANSI`
  re-emits styles at boundaries) — reuse that machinery, don't
  reinvent it. (Implementation detail; the brief sets the contract:
  ANSI-styled lines elide without losing their styling.)

**Code fences** (`src/render.ts`, the `code` handler):
```ts
.map((l) => (l === "" ? "" : styler.codeLine("  " + elideToWidth(l, contentWidth))))
```
where `contentWidth` is the per-fence content budget (terminal width
minus the 2-char LHS margin that `"  " +` already consumes). The line
okuda emits is now ≤ display width; the terminal never soft-wraps it.

**Tables** (`src/render.ts`, the shrink-wrap block):
- Drop the proportional-shrink loop (`colWidth[i] = Math.min(w, share)`).
- Render columns to natural width; emit cells left-aligned.
- Where a row's total exceeds `width`, the row elides: the last visible
  column gets `elideToWidth` to its remaining budget, and columns
  beyond it are dropped (the `…` is the signal they were there).
- This is the table-specific shape of the same primitive: the *row* is
  the unit that overflows, and the `…` marks where the columns continue
  off-screen. (The scratchpad's table elision shows the marker on every
  overflowed row — the fringe again, emergent from rows that overflow
  together.)

## Scope / non-goals

- **Vertical elision (`⋮`) is out of scope.** The scratchpad names two
  fringes; this brief builds only the horizontal one (`…`). Vertical
  overflow (more rows than the viewport) is the TUI's scroll, not the
  renderer's — the renderer emits all lines; the TUI windows them.
  `⋮` belongs to a future "elided viewport" brief, not here.
- **Not a reflow engine.** `elideToWidth` truncates; it never wraps.
  No-reflow brutalism is the doctrine.
- **Not changing the 2-char margin.** The margin is a render decision
  (ADR-007); elision happens inside the content width it leaves.
- **Not a config surface.** No "wrap vs elide" toggle — elision is the
  one behaviour, for code and tables alike. Two behaviours means two
  code paths and the ambiguity ADR-004 refused.

## Risk / open questions

- **ANSI preservation.** Code lines and table cells carry styling. The
  primitive must elide without losing SGR runs or leaking a style past
  the truncation. The wrap engine already solves this for wrapping;
  the elision primitive should reuse `wrapANSI`'s style-re-emission
  rather than a naive `string.slice`. Validate with a test that elides
  a mid-style-run line and asserts the trailing `\x1b[0m` lands.
- **NO_COLOR parity.** `…` is a Unicode glyph; under NO_COLOR it stays
  `…` (it's not a styled glyph, it's the content). Confirm the width
  engine counts it as 1 column (it's in the `…`/box-drawing set
  `width.ts` already handles — the scratchpad's examples use it).
- **Table-elision shape.** "Drop columns beyond the budget and mark
  the boundary" is the obvious shape; the scratchpad shows the marker
  on every overflowed row. A single `…` at the row's truncation point
  may suffice (the fringe is the *block* reading, not a per-cell
  decoration). Decide at implementation; the brief sets the doctrine
  (elide, don't shrink-wrap), not the exact pixel.
- **Interaction with the FUT brief.** None. This is a render-plane
  change; the FUT brief is a control-plane (alt-screen) change. They
  touch different files and compose without conflict.

## Related

- ADR-014 (`decisions/014-table-elision-over-shrink-wrap.md`) — the
  decision this brief implements (Accepted, unimplemented until now).
- ADR-004 (`decisions/004-hard-wrap-mandate.md`) — the fence exception
  ("overflow ugly by design") this brief closes by replacing "overflow"
  with "elide."
- Scratchpad (`docs/2026-08-27-okudagram-scratchpad.md`) — "the elision
  fringe," "pleasantly brutal," "elision as invitation." The design
  vocabulary this brief operationalises.
- Deferred note (`docs/2026-08-27-session-handoff-launcher-stamp.md:25`)
  — "Code blocks currently wrap, which looks bad." The gate firing.
- `briefs/2026-08-28-brief-launcher-fut.md` — the other half of the FUT
  session's deferred work (alt-screen scoping). Independent; composes.
- `src/render.ts:530` (code handler), `src/render.ts:802` (table
  shrink-wrap) — the two call sites.