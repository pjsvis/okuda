# Gloam Launcher Playbook

How to pick and read markdown documents without typing filenames — and get
back to the picker when you're done.

## The problem

Okuda's entry contract is an exact path: `okuda briefs/2026-08-23-brief-gloam-tui-footer.md --tui`.
That demands *recall* of a high-entropy string when the reader only needs
*recognition*. Mistyped dates and hyphen-vs-underscore slips are the symptom;
the cause is recall where recognition would do.

## The shape that survived: browse → read → browse

Every wound in this playbook's history came from one design choice: a
preview pane embedding a rendered document *inside* the picker (see
"Retired: the preview"). The surviving shape separates the surfaces —
fzf picks, Gloam reads, the loop joins them:

```zsh
# ~/.zshrc — gloam launcher: browse → read → browse.
gloam() {
  local out q="" f
  printf '\e[?1007l'   # alt-scroll off: dead wheel in the picker
  while :; do
    out=$(fd -e md |
          fzf --no-mouse --prompt='gloam ❯ ' --query="$q" --print-query \
              --header='enter: read · esc: done') || break
    q=$(head -1 <<<"$out")            # reseed the query next round
    f=$(tail -n +2 <<<"$out")         # the selection
    [[ -n "$f" ]] || break
    printf '\e[?1007h'   # alt-scroll on: the wheel scrolls Gloam while reading
    okuda --tui "$f"
    printf '\e[?1007l'   # and off again for the picker
  done
  printf '\e[?1007h'     # leave the terminal as we found it
}
```

## Why each piece is the size it is

- `fd -e md` — respects `.gitignore`, skips hidden files, current folder
  down. Exactly Glow's local discovery scope, minus the cloud stash.
- The `while` loop — browse→read→back, the one gap composition had.
  Quit Gloam (`q`) and the picker is back, query intact. Esc in the
  picker ends the session.
- `--print-query` + `--query="$q"` — fzf exits on selection, so each
  round is a fresh process; the query is carried across rounds by
  printing it (first line of `--print-query` output) and reseeding.
- `--no-mouse` — keyboard-only picking; an Apple Magic Mouse's momentum
  scroll turns the wheel into a burst of line-events that flies the list.
  `wheel-up` is not a bindable key (fzf 0.73.1: "unsupported key"), so
  mouse is all-or-nothing; all-off is right for a picker.
- `printf '\e[?1007l'` / `h` — **alt-scroll mode (DECSET 1007), the
  wheel's last routing layer.** With mouse off and no scrollback,
  Alacritty still translates wheel events into ↑/↓ arrows for alt-screen
  apps — a courtesy for `less`/`man` that made the wheel the arrow keys.
  Off around the picker; **on around the read** — in Gloam those
  translated arrows hit `decodeKey`'s up/down and the wheel scrolls the
  document natively. The same terminal courtesy that sabotaged the
  picker is exactly what the reader wants. (1007 is implemented in
  Alacritty 0.17.0, `alacritty-escapes(7)`; sources: alacritty issues
  #2727/#4583.)
- Full-screen fzf (no `--height`) — inline mode put the window inside
  terminal scrollback, where `resize:refresh-preview` corrupted geometry
  and the wheel dragged the whole window. The alt screen has no
  scrollback; resize repaints natively.
- `[[ -n "$f" ]] || break` — fzf's exit-0 empty-selection case (Enter on
  an empty list): end the session rather than launch `okuda --tui ""`.

## Retired: the preview (and its casualty list)

`--preview='okuda {}'` put a document inside the picker, and every
failure that followed traced to that choice:

1. **Width** — preview commands run with stdout piped, so renders wrapped
   to the 80 fallback while the pane was another width. Fixed in src:
   `terminalCols()` honours `FZF_PREVIEW_COLUMNS` (env > TTY > fallback;
   verified e2e). The fix ships and stays — correct for any future
   preview consumer — but the launcher no longer previews.
2. **Resize** — fzf caches preview output and re-clips on resize;
   `--bind 'resize:refresh-preview'` reflowed but corrupted the inline
   window mid-relayout (no debounce knob). Full-screen mode was the
   escape hatch; retiring the preview retires the question entirely.
3. **The wheel, four incarnations** — list machine-gun (fzf mouse),
   window drift (scrollback routing), synthesized arrows (alt-scroll),
   and finally frozen content (no preview scroll without mouse). Retiring
   the preview retires the content window; the wheel is dead in the
   picker and alive in Gloam, where it belongs.

The preview was always a degraded read — a frozen top-slice. The loop
replaces it with the real one: full Gloam (footer, hints, j/k, half-page,
anchored reload), starting at the top (`scroll = 0`), which is where a
reader belongs.

## Known limits (deliberate)

- Each round re-runs `fd` and a fresh fzf; the query survives (reseeded),
  the list scroll position does not. Cost: a keystroke, at most.
- No cloud/stash/recents — a siloed viewer does not grow a cloud.
- The promotion brief (`briefs/2026-08-26-brief-gloam-launcher-promotion.md`)
  covers moving the loop into the binary if the shell loop's frictions
  (query reseed, scroll memory) ever itch harder than config maintenance.

## Dependencies

`fd` and `fzf` — see `DEPENDENCIES.md`. Both must be on PATH. `okuda`
installed via `just install`. The shell function named `gloam` shadows
the `~/.local/bin/gloam` symlink harmlessly — it calls `okuda`, so no
recursion.
