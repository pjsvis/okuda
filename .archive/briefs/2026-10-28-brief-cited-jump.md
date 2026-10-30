---
type: Brief
callsign: BRF-CITED-JUMP
---

# Brief: Cited jump — the render starts at the line, and never shows it

**Date:** 2026-10-28 · **amended the same day**, twice: the operator's spec
deleted the first draft's editor hand-off and its cursor. What remains is smaller
and is the tool's own mechanism.
**Status:** Open

---

## Context

`ADR-ADDRESS-NOT-COORDINATE-074` made a citation an address — `src/render.ts:274`
paints as one `doc-ref` token — and its first version claimed the *terminal* could
act on it. That was false (Ghostty's `link` regex is unimplemented), which is now
recorded. What follows is the verb, and the operator has specified it precisely
enough that most of the first draft is deleted:

> **"no cursors"** · **"our current silcrow is actuated by a two digit number which
> dereferences a document"** · **"if the document is a code file and a line number
> is specified then set the top of the render at that line number"**

The insight is that this is not a hand-off. **okuda already renders code files** —
`wrapWholeFile` turns `okuda src/render.ts` into a single fence, chroma colours it,
and the fence *is* the file. So dereferencing a code address at a line is a
**render**, not an editor spawn: the same jump, arriving at a different offset. The
first draft specified an editor spawn, an `editArgs` line-argument column and a
rule for "which citation the gesture acts on". All three are gone; there is no
cursor and nothing to select, because **the two-digit number is the actuator**.

## Warrant

The operator's call. Navigation is a verb, display is not — so no gutter, no line
numbers on screen (`ADR-074`) — and the act is the silcrow's own, so a reader who
has learned to dereference `§12` has learned this.

## Evidence

| Observation | State |
| :--- | :--- |
| `cmd+click` on a gold citation | does nothing — reported from the glass, 2026-10-28 |
| Ghostty custom link rules | not settable (`error.NotImplemented`) |
| `extractJumps` target | `.md` only: the regex is `/\S+\.md/g` (`src/tui.ts`) |
| `jumpTo` arrival | `present(fetch, next, 0)` — always the top |
| Code rendering | exists: `wrapWholeFile`, `isWholeFileFence` (`src/render.ts`) |
| Vertical elision in a code path | **none** — lines are elided horizontally only, so the count is exact |
| Rendered index of file line 1 | **measured, not derived**: CLI shows the identity header at 0 and the fence body from 2; the TUI has no header (ADR-020) so the offset differs. The test measures it. |
| Two references to one file, different lines | **collapse today**: `buildJumpMap` skips a repeated target — `if (seen.has(ref.target)) continue; // one destination, one silcrow` (`src/vectors.ts:271`). Correct under the old grammar, wrong the moment an address can name a line. |
| A silcrow placed inside a range | **fails silently**: `path:1123 §14-1142` gilds `path:1123` and leaves ` §14-1142` as prose (probed 2026-10-28). `path:1123-1142 §14` gilds whole. |
| An authored `§14` | inert — the badge is painted from the wire, never from text (`ADR-031`). The silcrow is the compositor's, not the author's. |

## Objective

A jump target may name a **code file** and a **line**. Arriving there renders that
file with the cited line at the top of the viewport. A `.md` target behaves exactly
as it does today.

## Scope

**In:**

- `extractJumps` accepts a code target with an optional line — `src/render.ts:274`,
  `a.rs:1123-1142` — using the closed extension list the renderer already cites
  (`RE_CITED_PATH`, `src/render.ts`), not a second list. A range arrives at its
  opening line.
- The target becomes `{ path, line? }` (or the string is parsed once at the jump
  boundary — one of the two, chosen for how the map is consumed).
- `jumpTo` passes the line as the **initial scroll** instead of `0`.
- **The offset is measured.** File line N → content index *k*, where *k* is
  whatever the TUI's frame actually puts there. The fixture: a three-line file, a
  jump to line 3, and the test asserts the third line is the first non-blank row.
- A line past EOF clamps to the end rather than blanking the pane.
- `back()` is untouched: it restores the main document at its stored scroll.

**Out:**

- Cursors of any kind, and a rule for "which citation the gesture acts on" — there
  is no gesture on a citation; the number is the actuator.
- An editor spawn, `editArgs` line arguments, or anything that hands a code file to
  something that is not okuda. okuda renders code; the editor *edits* it (`88`).
- Numbering prose citations so they enter the jump table. It is the literal reading
  of "the same as any other silcrow" and it is refused: enumeration-order numbers
  silently retarget when a document reorders, and authored numbers collide with the
  reserved vector paint (`ADR-031`).
- Gutters, OSC 8, editor URL schemes, mouse.

## The consequence to state plainly

**A prose citation is a mark, not a jump.** The silcrow numbers come from the
compositor's wiring (`%%okuda-rhs:NN%%` sharing a line with its target). A bare
`src/render.ts:274` in a paragraph has no number, so nothing can actuate it, and
this brief does not invent one. What becomes jumpable is a **wired** target — the
menu row, the index line — which is where the compositor already writes addresses.

## Design questions to settle in the work

1. **The offset, as a pure function.** Measure it in the TUI (leading blank line
   from `finalize`, no identity header). The CLI's numbers are not the TUI's —
   measured 2026-10-28, a three-line file renders with the header at index 0 in
   streaming mode. Expose the mapping as a pure `scrollForLine(lines, n)` in the
   shape `anchorFor`/`reanchoredScroll` already have (`src/tui.ts`, tested in
   `tests/tui.test.ts`), so the probe runs headless rather than through a
   terminal. Assume nothing; the function is the instrument.
2. **An `.md` target with a `:NN`.** Ignore the line, or flash that a document has
   no line? Candidate: ignore — a `.md` line number has no meaning in a render that
   wraps prose, and a flash would be noise about a coordinate nobody will read.
3. **Two-digit ceiling.** Tokens are `\d{1,2}`. A line number is not a token, so
   this bounds nothing here — noted only so a later reader does not mistake
   `:274` for an actuator.
4. **One ADDRESS, one silcrow.** The dedupe in `buildJumpMap` must key on the
   address (path **and** line), not on the path: two references to one file at
   different lines are two destinations and therefore two silcrows. The same
   applies to the truncation fact in `deriveReferences`, which counts
   `new Set(refs.map((r) => r.target)).size` — counting paths would let a document
   of a hundred addresses in one file read as one destination, and the receipt
   would state a fullness that is not there. Both sites, one rule.
5. **The canonical authoring form.** `path:NN-MM §TT` — the token last, after the
   whole range. The interleaved `path:NN §TT-MM` is probed above and fails
   silently, splitting the range's tail into prose: the compositor writes both
   halves, so it never interleaves, and the style guide states the form so an
   author does not.

## Risks

- **The compositor must write the address.** Nothing in the renderer can make a
  prose citation jumpable without numbering it, so the benefit lands wherever
  wiring exists. If that turns out to be nowhere, the finding is about the
  compositor, not this brief.
- **Elision is horizontal only**, so a code line cut at the glass still occupies one
  index — the mapping survives. A future vertical budget would break it, and the
  test is what would catch that.
- **The render is not the file for `.md`**, which is why the line applies only to
  code: prose wraps, so its rendered line numbers are the renderer's invention.

## Acceptance criteria

- `extractJumps` accepts `path:NN` and `path:NN-MM` for the cited code extensions,
  and still accepts the `.md` form unchanged (existing `tests/tui.test.ts` cases
  must stay green).
- A jump to a fixture's line 3 renders that line at the top: asserted, not eyeballed.
- A `.md` target renders exactly as before, at scroll 0.
- **Two references to one file at different lines get two silcrows**, and each
  arrives at its own line — the dedupe test, and the one this brief would fail
  today.
- A line past EOF clamps; a target outside the root still refuses
  (`BRF-ROOT-CONTAINMENT`).
- The offset mapping is asserted through a pure function, not through a spawned
  terminal.
- `just check` green; `bun test` green.

## Notes

- **The mark already lands.** `ADR-074` is untouched by this brief: nothing here
  changes what is painted.
- **Dogfood:** wire a row in a scratch document to `docs/2026-10-28-test-citations.md`
  with a line, jump it, and confirm the render starts there. The corpus page was
  built to break the affordance; this is the same trick applied to the verb.
