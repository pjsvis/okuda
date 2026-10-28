---
type: Brief
callsign: BRF-CITED-JUMP
---

# Brief: Cited jump — go to the line, never show it

**Date:** 2026-10-28
**Status:** Open

---

## Context

`ADR-ADDRESS-NOT-COORDINATE-074` made a citation an address: `src/render.ts:274`
paints as one `doc-ref` token, so the reader can see it is an address and not
prose. It also claimed the terminal could then act on it, and **that was false**.
Ghostty's `link` regex option is unimplemented (`Config.zig` `parseCLI` →
`error.NotImplemented`; what ships is `link-url`, `link-osc8`, `link-previews`), so
click matching covers URLs and OSC 8 hyperlinks, and okuda emits neither. The
operator built, shipped, and `cmd+click`ed a citation: nothing happened, because
nothing exists to happen.

This brief builds the missing verb, and it builds it where the tool already has
one. The TUI spawns the editor for the *current* document (`88`, `editArgs` in
`src/clone.ts`) and already carries a jump grammar for `§NN` tokens. Opening a
cited path at its line is a new act in a grammar that has the verb; the missing
part is where the cursor's address comes from, not how to open things.

## Warrant

The operator's call, in their words: **"goto line but do not show line numbers."**
Navigation is a verb; display is not. The line exists in the file, the editor and
the citation — it does not need to appear in the margin, and no gutter is built
here (`ADR-074`).

## Evidence

| Observation | State |
| :--- | :--- |
| `cmd+click` on a gold citation | does nothing — reported from the glass, 2026-10-28 |
| Ghostty custom link rules | not settable (`error.NotImplemented`) |
| `file:NN` citations in this repo | 310 (sweep, 2026-10-28) |
| The TUI's editor spawn | exists: `88`, `editArgs`, `resolveEditor`, `src/clone.ts` |
| The TUI's jump grammar | exists: `§NN` tokens via `extractJumps`, `jumpTo` |
| Line argument in `editArgs` | absent — it takes a path only |

## Objective

One keystroke opens the citation under the cursor at its line in the declared
editor. No gutter, no OSC 8, no URL scheme, no mouse.

## Scope

**In:**

- A key (candidate: `go`/`gl`-style mnemonic or an unclaimed actuator — the keymap
  decides) that reads the citation under the cursor and opens it.
- The token's source: the **rendered line at the cursor**, stripped of ANSI and
  matched with the same `RE_CITED_PATH` the renderer paints with. One regex, one
  source of truth; a citation the renderer colours is a citation this finds.
- Path resolution: relative to the current document, then contained in the silo
  root (`BRF-ROOT-CONTAINMENT` — the same gate jumps use, refusing to escape).
- The line argument in `editArgs`, as an editor-family column: `+N` (vi family),
  `-g path:N` (code), `path:N` (zed and friends), none (editors that cannot).
- `flash` on every failure: no citation on the line, path outside the root, path
  absent, editor unknown. No silent no-ops — the flash idiom already exists.
- The keymap doc (`docs/keymap.md`) and the key grammar tests updated.
- `tests/clone.test.ts` gains the line-argument cases; `tests/keygrammar.test.ts`
  gains the actuator.

**Out:**

- A gutter, any line numbers on screen, any config to enable them (`ADR-074`).
- OSC 8 and editor URL schemes (`vscode://…`) — refused in `ADR-074`; recorded
  there because it works today and is the wrong shape.
- Mouse handling, and the streaming (non-TUI) render, which has no cursor.
- Opening citations from a *document's* jump table (the `&menu` `§NN` path): this
  is the cursor's line, not a menu row. If it generalises later, that is a
  separate reading.
- Editing anything: the editor owns the write, as `88` already assumes.

## Design questions to settle in the work

1. **Which citation does the line carry?** A line may hold two. Candidate rule:
   the leftmost whose span includes the cursor column, else the leftmost on the
   line; else flash. State the rule in the code comment, because it is the sort of
   thing a reader will test by hand.
2. **Rendered or source?** Rendered is chosen above (one regex, and it matches what
   the reader sees). The cost is named in **Risks**: a wrapped citation is not
   found, because it is not one token on the line.
3. **What counts as a line?** `path:NN` and `path:NN-MM` — for a range, the opening
   line. A bare `path` with no line: open at the top, or refuse? Candidate: refuse
   the *jump* and flash `no line in the address`, since opening a file is what `88`
   and the shell already do.

## Risks

- **A wrapped citation cannot be jumped.** The known gap in
  `docs/2026-10-28-test-citations.md` (an inline address longer than the line
  breaks mid-token) is inherited: the feature finds what the renderer keeps whole,
  and the narrow pane is where it fails. Report the failure as a flash, not a
  guess.
- **Key collision.** The TUI's grammar is dense; a new actuator must not shadow a
  buffer prefix (`j`/`k` strides, `]]`, two-digit jump buffer).
- **Editor variance.** The line-argument column is a table of exceptions; an
  unknown editor must degrade to "open the file" or refuse, never to a silently
  mangled argument.

## Acceptance criteria

- A unit test for the *spec builder* — cursor line + editor → argv — with no spawn,
  in the shape `clone.test.ts` already uses for `editArgs`.
- A test that a citation inside a codespan is not picked up… **no**: the codespan
  gap (`src/render.ts`, filed) means it currently is picked up. The test asserts
  what the render does today and links the filed defect, rather than encoding a
  wish.
- A containment test: a citation resolving outside the root flashes and spawns
  nothing.
- `just check` green; `bun test` green; keymap doc and `keygrammar` in step.
- Dogfood: `okuda docs/2026-10-28-test-citations.md --tui`, jump each citation in
  it, and the gold token becomes a verb.

## Notes

- **The mark already lands.** Nothing here changes what is painted; `ADR-074` is
  untouched. This brief adds the act, and the operator's principle governs it:
  *goto line, never show line.*
- **The corpus is the test bed.** `docs/2026-10-28-test-citations.md` was written
  to expose the affordance's failures; it is also the natural manual test for
  this, one citation at a time.
