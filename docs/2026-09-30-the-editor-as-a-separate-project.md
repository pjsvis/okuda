---
date: 2026-09-30
kind: design note — a capability assessed against the ledger, and the fork it leaves open
lineage: the operator's question, 2026-09-30 — "lets consider the editor as a separate project ... can we create an editor using our box model and the refresh on change logic ... the render would be a separate issue ... how small could it be given our model". Assessed per the refusal-first order in the okuda-assess-capability skill; nothing is built.
status: open — the direction is assessed, the fork is not chosen, no brief exists
---

# The editor is the reader with three substitutions — and the box model's policy inverts

> ◆ Buffer for file, cursor for anchor, insert keymap for verb grammar: everything else
> is inherited. The delta is roughly **400–700 lines** on top of **1000–1500** already
> written and tested — against `gloam-edit`'s **54**. The model makes the editor's
> *frame* cheap. It makes nothing about *editing* cheap.

## What we are deciding

Whether to build a markdown editor as a project of its own, using the reader's screen
machinery — the frame, the content gate, the anchored repaint — with rendering treated
as a separate concern.

The question as asked hides an assumption worth surfacing: that an editor is something
to **build**. It has three slots, and the ledger has closed only one of them.

## Three slots, one closed

- **Editing *inside* okuda.** Closed, and not as a technicality. AGENTS.md's test is
  *does X touch the byte stream or the screen?* An editor touches the byte stream's
  **origin** — compositing — which belongs to the environment. The pattern is already
  implemented rather than merely declared: `09`/`editNew` (`src/tui.ts:609-626`) spawns
  `$EDITOR` in a second terminal, and its docstring states the discipline — *"The file is
  the contract — the silo picks it up by search; nothing mutates."*
- **okuda as the *render half* of an editor.** **Already built.** `scripts/gloam-edit.zsh`
  — 54 lines — with `playbooks/gloam-preview-playbook.md`: editor left, okuda right,
  `--watch` joins them, Herdr places. Zero window management in okuda.
- **The correspondence between source and render.** **Open**, and briefed:
  `BRF-SRC-LINE-LEDGER` (the `10` verb, today a stub at `src/tui.ts:808`) and
  `BRF-TUI-LIVE` (holding scroll across saves, the preview playbook's own named gap).

So the composition is not a compromise to be replaced. It is the built answer, and the
two open briefs are what would make it *good* rather than merely working.

## What the model gives, and what it must invert

The box model, in the silo's own words, is the **frame**: *"a header and its content,
from the header to the next header (or EOF) ... content taller is **cut**, not
slippy-within"* (`docs/2026-09-05-frame-as-shite-filter.md`). It is two things, and only
one transfers.

- **It gives the anchor** — *"the one invariant that survives every glass change."* In an
  editor the cursor *is* the anchor, and pinning the viewport to a text fingerprint
  rather than a row index is precisely what stops the view jumping when you type above
  it. This is the best thing in the model for an editor.
- **It must be inverted.** Cut-and-defer is a *reader's* posture: *"the tail is shite
  until the glass confirms it."* An editor is typing in the tail. The policy becomes
  scroll-and-reveal — which is the **slippy-within that the frame doc explicitly
  replaced**. Adopt the box model whole and you cut off the line being edited.

The refresh logic fits better than the box model does:

- **`needsRepaint(content OR geometry)`** transfers verbatim. It is today's fix
  (ADR-RESIZE-GEOMETRY-046), and an editor has both axes constantly.
- **`renderEqual`** reads as *"a save is not a change"* — a write that changes nothing
  should not repaint. Note the inversion: for a file watcher the gate is essential; for a
  live buffer you already know it changed, so the gate earns its keep on the
  **external-modification** path.
- **The sync write** (ADR-028: one frame, one write, DECSET 2026) is the piece an editor
  needs *more* than a reader. An editor repaints per keystroke, and a tear per keystroke
  is unusable. Inherit that first.

## How small, measured

`wc -l` over `src/`, 2026-09-30, total **5015** lines. The renderer is `render.ts`,
`grammar.ts` and `vectors.ts`. The screen machinery is `tui.ts`, `width.ts`, `wrap.ts`,
`ansi.ts`, `palette.ts`, `frames.ts` and `keygrammar.ts`. The launcher and search are
`launcher.ts`, `onion.ts` and `cli.ts`.

| Part | Lines | For an editor |
|---|---|---|
| the renderer | 1759 | not needed — the separate issue |
| the screen machinery | 2263 | inherited, ~1000–1500 of it |
| the launcher and search | 993 | not needed |

The **delta** is roughly 400–700 lines: the buffer and cursor; splice; the insert keymap;
save; and — where the bugs live — the **wrapped-row cursor arithmetic**, mapping
(line, col) to (display row, display col) under wrapping. `wrap.ts` wraps; it does not
*address*. That gap is the whole difficulty, and it is the part the model does not help
with.

## The gate

`ADR-TTY-ACTIVE-INPUT-023` froze the reader under fzf `execute` and asked for a minimal
repro as its revisit precondition. Measured 2026-09-30 with
`scripts/input-freeze-repro.ts`: a **standalone** TUI receives keys under a draining pty,
and okuda's own `--tui` does too in the same harness. So the aborted ADR does **not**
block a standalone editor. The repro, its three-row table, and the two ADR-023 findings
it contradicts are in `docs/2026-09-30-the-freeze-repro.md`.

## The fork

- **Compose.** Keep `gloam-edit` and spend the effort on the two open briefs. 54 lines
  today; the ledger and live documents are what make two panels good rather than
  adequate. Nothing new to maintain, and the editor stays a real editor — undo, macros,
  registers, search-and-replace, multi-file, decades of muscle memory, all free.
- **Build.** One binary, built from the reader's own screen machinery. Delta ~400–700
  lines, inheritance ~1000–1500 already tested, and the input path measured clear. The
  cost is not the screen — it is that you then own *editing*, forever, and the box model
  and the gate say nothing about it.

## What is not in question

- **Editing stays out of okuda.** Both branches respect this: `gloam-edit` is a script,
  and a built editor would be its own project — which is the operator's own framing.
- **The composition works.** It is not a prototype awaiting replacement.
- **The model is genuinely reusable.** The three substitutions are real; this is not a
  hypothetical architecture.

## Where I would land

**Compose, and spend the budget on the ledger.** The box model makes the editor's frame
cheap, and the frame was never the expensive part — so a build buys the cheap half and
signs up for the expensive one. If the goal is minimality, 54 lines already wins by an
order of magnitude. If the goal is *one binary built from our own screen machinery*,
that is a legitimate goal and the measurements above say it is affordable — but it should
be chosen as that goal, explicitly, and not as a way to get a smaller editor.

**What would change my mind:** a concrete case where the two-panel composition fails and
a single process would not. `BRF-TUI-LIVE`'s scroll-across-saves gap is the likeliest
candidate, and it is cheaper to close in the composition than to build around.

## Evidence

- `wc -l src/*.ts` — the sizing table above, 2026-09-30, src total 5015
- `scripts/input-freeze-repro.ts` and `docs/2026-09-30-the-freeze-repro.md` — the input
  path, measured rather than argued
- `scripts/gloam-edit.zsh` — 54 lines, the composition that exists

## Related

- `scripts/gloam-edit.zsh` — the composition; editor left, okuda right
- `playbooks/gloam-preview-playbook.md` — PLY-GLOAM-PREVIEW; the shape and its one gap
- `briefs/2026-09-24-brief-source-line-ledger.md` — the `10` verb, and the `srcLine[]`
  ledger that would land the editor at the eye line
- `briefs/2026-08-26-brief-tui-live-documents.md` — holding scroll across saves
- `docs/2026-09-05-frame-as-shite-filter.md` — the frame, and the cut-and-defer policy
  this inverts
- `decisions/046-resize-geometry.md` — `needsRepaint`, the piece that transfers verbatim
- `decisions/023-tty-active-input-reader.md` — the aborted input reader, and its gate
- `docs/2026-09-30-the-freeze-repro.md` — that gate, measured
