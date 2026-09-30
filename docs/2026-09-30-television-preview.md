# Television preview — okuda as the renderer (BRF-TELEVISION-PREVIEW)

Television ([alexpasmantier/television](https://github.com/alexpasmantier/television)) is a
fuzzy finder whose channels are TOML recipes with an arbitrary preview command. The
preview command's stdout is a pipe into television's ratatui panel. That pipe is the
entire interface: television owns windowing, okuda owns rendering, neither knows the
other exists. This doc records the integration (brief
`briefs/2026-09-30-brief-television-preview.md`).

## The channel

`~/.config/television/cable/docs.toml`:

```toml
[metadata]
name = "docs"
description = "Code and markdown, okuda-rendered"
requirements = ["fd", "okuda"]

[source]
command = "fd -t f -e md -e markdown -e ts -e rs -e go -e toml -e json -e sh"

[preview]
command = "okuda '{}'"
```

Run `tv docs`. Panel scrolling works on okuda's output as-is; television caches
preview output by default, so okuda's ~50ms cold start is a non-issue.

## Width

A preview pane is not a TTY, so okuda cannot read its width — the 80 fallback would
serve. The pin: television's `[preview] env` is static, but the pane is a fixed
percentage the user chose (`[ui.preview_panel] size`), so pin both to match:

```toml
[preview]
command = "okuda '{}'"
env = { OKUDA_WIDTH = "70" }   # 50% of a 140-col terminal
```

`OKUDA_WIDTH` outranks the TTY read and the fallback; `FZF_PREVIEW_COLUMNS` (fzf's
live pane claim) still outranks the pin — a globally exported pin must not veto the
pane it is actually rendering into. When television lands its issue #999 (exporting
fzf-style preview dimensions), okuda is pixel-perfect with no further change.

## Why it works (the doctrine, cashed)

* Truecolor survives the pipe — `detectColorMode` has no TTY gate.
* Code files — `wrapWholeFile` fences them, chroma colours through the pipe.
* Escape hygiene in a foreign panel — every line ends `\x1b[0m` (no state leaks into
  the panel).
* The clear/home escape is `--watch`-gated; piped output is clean.
* Graceful degradation — absent chroma/mermaid renders byte-identical plain.

Cycle bat and okuda on ctrl-f with `command = ["bat -n --color=always '{}'", "okuda '{}'"]`.
