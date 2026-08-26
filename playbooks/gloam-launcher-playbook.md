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
  printf '\e[?1007h'   # alt-scroll on, one policy: wheel scrolls list AND doc
  while :; do
    out=$(fd -e md |
          LC_ALL=C sort |
          env FZF_DEFAULT_OPTS= fzf --layout=reverse --no-mouse \
              --exact --tiebreak=index \
              --prompt='gloam ❯ ' --query="$q" --print-query \
              --header='enter: read · esc: done') || break
    q=$(head -1 <<<"$out")            # reseed the query next round
    f=$(tail -n +2 <<<"$out")         # the selection
    [[ -n "$f" ]] || break
    okuda --tui "$f"
  done
}
```

## Why each piece is the size it is

- `fd -e md` — respects `.gitignore`, skips hidden files, current folder
  down. Exactly Glow's local discovery scope, minus the cloud stash.
- `LC_ALL=C sort` — deterministic ASCII collation (uppercase-first:
  `briefs/…` before `docs/…`), identical across machines instead of
  per-locale. (The original "weird order" report turned out to be
  layout, not collation — fd was already alpha on this machine; the
  sort stays as a determinism guarantee.)
- `--layout=reverse` — **the actual "reverse alpha" culprit.** fzf's
  default layout puts the prompt at the bottom and stacks the list
  bottom-up: item #1 sits directly above the prompt, the alphabet's end
  at the screen top — an alphabetical list *displayed* in reverse.
  `reverse` puts the prompt at top, the list in reading order below,
  cursor on the first item: AGENTS.md at the top of the screen, where
  the alphabet starts. Prompt-at-top is also the layout every list-app
  (Glow, lazygit, gh dash) trains the eye to expect.
- `--exact --tiebreak=index` — **filter, don't re-rank.** Default fzf
  fuzzy is (a) *overinclusive* — a query's chars match scattered
  anywhere in the string, not as a contiguous substring — and (b)
  *score-ranked* — match offset/length differ per candidate, so results
  sort by score, not input order. The ISO-date prefixes exposed both:
  query `2026-08-2` returned 08-20, 08-26, 08-24, 08-25… — scrambled.
  `--exact` = literal substring matching only (kills overinclusion);
  `--tiebreak=index` = preserve input order (the `LC_ALL=C sort`)
  among matches. A date-prefixed corpus has a canonical order; the
  picker narrows it in place. Trade-off: scattered-token fuzzy power is
  gone (`gloamfooter` no longer matches `gloam-tui-footer`); acceptable
  for filenames — and a `toggle-exact` bind is the escape hatch if the
  itch ever arrives. Verified on fzf 0.73.1: `2026-08-2` → strict
  chronology.
- The `while` loop — browse→read→back, the one gap composition had.
  Quit Gloam (`q`) and the picker is back, query intact. Esc in the
  picker ends the session.
- `env FZF_DEFAULT_OPTS=` — **hermetic by default.** A global
  `FZF_DEFAULT_OPTS` (this machine's ships a `bat` preview with forced
  wrap — the "rubbish preview" that haunted the preview-less launcher)
  applies to every fzf invocation; the launcher blanks it for its own call.
  The picker's flags are exactly what's written here — nothing inherited.
- `--print-query` + `--query="$q"` — fzf exits on selection, so each
  round is a fresh process; the query is carried across rounds by
  printing it (first line of `--print-query` output) and reseeding.
- `--no-mouse` — keyboard-only picking; an Apple Magic Mouse's momentum
  scroll turns the wheel into a burst of line-events that flies the list.
  `wheel-up` is not a bindable key (fzf 0.73.1: "unsupported key"), so
  mouse is all-or-nothing; all-off is right for a picker.
- `printf '\e[?1007h'` — **alt-scroll mode (DECSET 1007), one policy,
  both surfaces — the wheel's fifth and final incarnation: it came
  home.** History: with mouse off and no scrollback, Alacritty still
  translates wheel events into ↑/↓ arrows for alt-screen apps — a
  courtesy for `less`/`man`. That was killed around the picker in the
  preview era (a misfire re-ran the preview process — chaos). With the
  preview retired, a misfire costs one visible row — mild overshoot —
  so the off/on dance collapsed to a single enable at entry, never
  disabled: the wheel scrolls whatever alt-screen surface is active
  (list in the picker, document in the reader), which is exactly what
  both surfaces want. **Revert criterion:** if Magic Mouse momentum
  flies the picker list again (the original cause — momentum vs a short
  discrete list — never changed, only the consequence did), restore the
  dance from git history. 1007 is implemented in Alacritty 0.17.0
  (`alacritty-escapes(7)`); sources: alacritty issues #2727/#4583.
  Portability caveat: the single enable is a no-op on default-on
  terminals and forces the mode on — leaves it on — for terminals
  configured alt-scroll-off; accepted for simplicity.
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
