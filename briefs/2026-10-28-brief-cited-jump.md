---
type: Brief
callsign: BRF-CITED-JUMP
---

# Brief: Cited jump — go to the line, never show it

**Date:** 2026-10-28 · **amended the same day** (the operator's spec: actuation is
the silcrow's own; a bare address goes to the top; **code files only**)
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

The operator's call, in their words — six sentences that settle the whole shape:

> **"goto line but do not show line numbers."**
> **"actuated the same as any other silcrow — if there is no line number we goto
> the top of the file; if a line number is specified we go to that line number —
> but only for code files."**

Navigation is a verb; display is not, so **no gutter** (`ADR-074`). A bare address
is still an address, so it goes to the **top of the file** — refusing it would be
pedantry about a coordinate the reader never claimed. And the act is **the
silcrow's act**, not a new one, applied only where the gap is: a **code** file,
which okuda cannot render and therefore hands to the editor.

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

The silcrow's gesture, applied to a code citation: open the cited file in the
declared editor, at the cited line, or at the top when the address names no line.
No gutter, no OSC 8, no URL scheme, no mouse.

**The split is renderable vs not.** A `.md` address is okuda's own material and
already has an actuation — documents open in the viewer, and the silcrow jump and
the search both reach them. A code address has none, because a code file is not
something okuda renders: the editor owns it, exactly as `88` already assumes. So
this brief builds the half that is missing and leaves the other half alone.

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
- **Dispatch by extension.** The citation's suffix decides the act: a code
  extension from the closed list (`ts`, `rs`, `sh`, `py`) goes to the editor; `md`
  is left to the existing document path and is explicitly inert here.
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
- **A `.md` citation jumping anywhere.** It is already reachable; adding an editor
  spawn for it would hand a renderable document to a text editor, which is the
  wrong owner.
- **Numbering citations so they enter the jump table.** It is the literal reading
  of "the same as any other silcrow" and it is refused: numbers would have to be
  assigned by enumeration order, so reordering a document would silently retarget
  the jumps, and authored numbers would collide with the reserved vector paint
  (`ADR-031`) — the one number in a document that is visibly ours.
- Opening citations from a document's *jump table* (`§NN` menu rows) — separate
  reading, if it ever generalises.
- Editing anything: the editor owns the write, as `88` already assumes.

## Design questions to settle in the work

1. **Which citation does the gesture act on, and where does "here" come from?**
   The TUI has no text cursor — it has a scroll position and an **anchor line**
   (`anchorFor`: the stripped text of the non-blank line at the top of the
   viewport, which already survives reflow). Candidate rule, and the one this
   brief recommends: **the first code citation on the anchor line**, else flash.
   It needs no new UI, is deterministic, and matches what the reader is looking at
   at the top of the pane. The alternatives are a movable line cursor (new keys,
   new frame painting — a different feature) and enumerating citations into the
   jump table (refused above). A line holding two: the leftmost wins, and the rule
   goes in the code comment because a reader will test it by hand.
2. **Rendered or source?** Rendered is chosen above (one regex, and it matches what
   the reader sees). The cost is named in **Risks**: a wrapped citation is not
   found, because it is not one token on the line.
3. **What counts as a line?** `path:NN` and `path:NN-MM` — for a range, the opening
   line. A bare `path` goes to the **top of the file**: settled by the operator, and
   the right call — the address is still an address, and refusing a coordinate the
   reader never claimed is pedantry in place of an act.

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
- A dispatch test: a `md` citation is inert here; a code citation produces a spec;
  a bare code path produces a spec with no line argument.
- `just check` green; `bun test` green; keymap doc and `keygrammar` in step.
- Dogfood: `okuda docs/2026-10-28-test-citations.md --tui`, jump each citation in
  it, and the gold token becomes a verb.

## Notes

- **The mark already lands.** Nothing here changes what is painted; `ADR-074` is
  untouched. This brief adds the act, and the operator's principle governs it:
  *goto line, never show line.*
- **One gesture, one meaning.** The act is the silcrow's, so a reader who has
  learned to dereference `§12` has learned this. The cost of the reuse is that the
  key has to be found on a line rather than on a badge — that is design question 1,
  and it is the only part of this brief that is genuinely new.
- **The corpus is the test bed.** `docs/2026-10-28-test-citations.md` was written
  to expose the affordance's failures; it is also the natural manual test for
  this, one citation at a time.
