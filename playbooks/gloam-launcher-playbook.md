# Gloam Launcher Playbook

How to pick a markdown document without typing its filename.

## The problem

Okuda's entry contract is an exact path: `okuda briefs/2026-08-23-brief-gloam-tui-footer.md --tui`.
That demands *recall* of a high-entropy string when the reader only needs
*recognition*. Mistyped dates and hyphen-vs-underscore slips are the symptom;
the cause is recall where recognition would do.

## The answer (composition, not construction)

fd lists, fzf filters, okuda renders. No browser mode in the binary, no
in-process fuzzy matcher — reimplementing fzf is benchmaxxing. The launcher
is a shell function; the binary stays a viewer.

```zsh
# ~/.zshrc — gloam launcher: pick a markdown file, read it at the top.
gloam() {
  local f
  f=$(fd -e md |
      fzf --no-mouse --prompt='gloam ❯ ' \
          --preview='okuda {}' --preview-window=right,60% \
          --header='enter: read · esc: cancel') || return
  [[ -n "$f" ]] || return
  okuda --tui "$f"
}
```

## Why each piece is the size it is

- `fd -e md` — respects `.gitignore` (node_modules excluded by default),
  skips hidden files, walks the current folder down. Exactly Glow's local
  discovery scope, minus the cloud stash.
- `--preview='okuda {}'` — the whole point. The streaming renderer runs
  inside the finder pane, so the reader verifies the document before
  committing. This requires the width fix below.
- `okuda --tui "$f"` — the TUI opens at `scroll = 0`: the top of the
  document, which is where a reader belongs.
- **Full-screen (no `--height`), by conviction.** Inline mode was tried and
  retired: inline fzf maintains its window inside terminal scrollback, so
  (a) `--bind 'resize:refresh-preview'` (a real binding, verified with a
  bogus-action control) corrupts the window during resize bursts — no
  debounce knob exists — and (b) with `--no-mouse` the wheel, routed to
  scrollback, drags the inline window around instead of the list. The
  alternate screen retires both: resize repaints natively, and with no
  scrollback an unhandled wheel does nothing. This is also Glow's own
  mode. Residual cost: the preview shows stale width after a resize until
  the next selection change re-runs `okuda` with fresh
  `FZF_PREVIEW_COLUMNS` — one keystroke.
- `--no-mouse` — keyboard-only picking. Mouse is on by default, and an
  Apple Magic Mouse's momentum scrolling turns the wheel into a machine-gun
  of line-events that flies the list past every candidate — an analog
  momentum device matched against a 40-row discrete list. `wheel-up` is not
  a bindable key (fzf 0.73.1: "unsupported key"), so there is no
  scroll-off-click-on middle setting; mouse is all-or-nothing, and all-off
  is right for a picker. Cost: click-to-select goes too (arrows + Enter are
  the way). With mouse off, the terminal routes the wheel to its own
  scrollback — fatal in inline `--height` mode (the window lives in the
  scrollback; momentum scrolling drags the whole picker around, same
  symptom as the list-scroll bug, new victim), harmless in full-screen
  mode: the alternate screen has no scrollback, so an unhandled wheel is a
  dead wheel. That is the point. Flag verified: bogus-flag control
  rejected, `--no-mouse` accepted (hidden from terse `--help`, listed in
  `--man`).
- `|| return` — a cancelled pick (Esc) is not an error; the function
  returns silently instead of launching okuda with an empty path.
- `[[ -n "$f" ]] || return` — fzf's exit-0 empty-selection case (Enter on
  an empty list, e.g. no `.md` files in scope): exit silently rather than
  feed `okuda --tui ""` a usage error.

## The width fix the preview depends on

fzf preview commands run with stdout as a pipe, so `terminalSize()` returns
null and the render would wrap to the 80-column fallback while the preview
pane is some other width — okuda behaving like Glow, the thing the project
exists to abolish. fzf exports the pane's true width as
`FZF_PREVIEW_COLUMNS`; `src/width.ts` `terminalCols()` honours it
(precedence: env when set, then TTY read, then fallback).

## Known limits (deliberate)

- **No browse→read→back loop.** Quitting a document returns to the shell;
  re-entering the picker is one up-arrow + Enter. Predictably adequate.
  If this itches after sustained dogfooding, the promotion brief
  (`briefs/2026-08-26-brief-gloam-launcher-promotion.md`) is the escape
  hatch — parked, with an explicit gate.
- **Repo-local scope only.** The function picks from the current folder
  down; there is no global recents list, no stash. A siloed viewer does not
  grow a cloud.
- **SSH is out of scope.** The ForceCommand sandbox pins one document by
  design; a selector there is scope creep on a security boundary.

## Dependencies

`fd` and `fzf` — see `DEPENDENCIES.md`. Both must be on PATH. `okuda`
installed via `just install` (symlinks `okuda` and `gloam` into
`~/.local/bin`; the shell function named `gloam` shadows the symlink harmlessly
— the function calls `okuda`, so no recursion).
