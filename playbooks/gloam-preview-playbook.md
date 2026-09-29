---
type: Playbook
callsign: PLY-GLOAM-PREVIEW
---

# Gloam Preview Playbook

How to write markdown with a live render beside it — editor on the left,
Gloam on the right, no mouse, no browser, no third-party preview pane.

## The problem

Markdown preview tools are mostly crap: browser extensions that lose the
scroll, app-store viewers that want to own the file, preview panes that
re-render into a different layout than any terminal will ever show. And
"write blind, render later" is recall where recognition would do — you only
find the broken table *after* the commit. Writing wants the rendered truth
in the same visual frame as the keystrokes.

## The shape that survived: editor left, Gloam right, watch joins them

`gloam-edit <file.md>` (okuda/scripts/gloam-edit.zsh, symlinked as
`~/.local/bin/gloam-edit`, delegated as `just write`) does three things,
all through Herdr — the host owns windowing per the three concerns
(okuda renders, gloam selects, Herdr places):

1. `herdr tab create --cwd <dir> --label "write ▸ …" --focus` — a tab
   rooted in the file's directory; the root pane id comes from the JSON
   response, never predicted.
2. `herdr pane run <root> $EDITOR <file>` — the editor in the root pane
   (left).
3. `herdr pane split <root> --direction right --ratio 0.5` + `pane run`
   of `okuda <file> --watch` — the preview in the right half. Every
   editor save re-renders the preview sub-second.

Two surfaces, one file, zero window management — Herdr places, AeroSpace
merely tiles whatever Ghostty windows exist.

## Why each piece is the size it is

- **Herdr, not kitty windows** — the first cut spawned two kitty windows
  and leaned on AeroSpace tiling plus focus-return tricks. It broke three
  ways (missing editor binary, floating workspace layout, spawn-env PATH).
  Herdr removes the whole failure class: placement, focus, and windowing
  are the host's job, addressed by id through the socket API. Bonus: the
  pair follows the session — `herdr --remote` puts the same tab on another
  machine; the script neither knows nor cares where the panes live.
- **Ids captured from JSON, never predicted** — herdr ids are
  workspace-qualified (`wA:p8`), not guessable. Same rule as the cast
  playbook.
- **Absolute paths for every binary** — spawned shells get a minimal
  environment; a bare `micro` died with 'No such file or directory'
  before this rule. `$EDITOR` that doesn't resolve falls back to vim,
  loudly.
- **Verify on the render, not the echo** — `pane wait-output` matching the
  filename proves nothing: the shell's command echo contains the name too.
  The wait matches the document's first heading, which only the painted
  okudagram contains. (This exact mistake was made once, in public, with
  a screenshot pending.)
- **Streaming `--watch`, not `--tui`** — the TUI has manual reload (`r`)
  but not file-watch; `tui-live-documents` (2026-08-26) is still open.
  When it ships, the preview pane graduates to the full verb grammar
  without a shape change.

## The one gap, named

Streaming mode repaints from the top of the document — scroll position is
not preserved on save (the TUI's line-anchoring, built for exactly this,
is the closed brief's payoff). For long documents: keep the preview
scrolled where you're writing, expect the reset on save, and rely on the
fact that what you're writing is at the top of your attention anyway.
When `tui-live-documents` ships, this gap closes without a shape change.

## Usage

```zsh
just write notes.md       # two-panel writing (delegates to gloam-edit)
gloam-edit notes.md       # direct
# Ctrl-S in the editor saves; the preview re-renders
# Ctrl-C in the preview pane, then :q in the editor, when done
```

The script lives at `scripts/gloam-edit.zsh`; `~/.local/bin/gloam-edit`
is the ADR-016 symlink; `just write` is the one-line facade delegation.

Requires: okuda on PATH, herdr (a running session or its server), an
$EDITOR that resolves to a real binary. AeroSpace merely tiles whatever
Ghostty windows exist — the pair works with or without it, locally or
over `herdr --remote`.

