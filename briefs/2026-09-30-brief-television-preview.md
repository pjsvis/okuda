---
type: Brief
callsign: BRF-TELEVISION-PREVIEW
---

# Brief: Television Preview — okuda as the renderer, OKUDA_WIDTH as the width knob

**Date:** 2026-09-30
**Status:** Open

---

## Objective

Make okuda a first-class preview renderer inside [television](https://github.com/alexpasmantier/television), the hackable Rust fuzzy finder (v0.15.9 installed locally) — markdown through the full grammar, code files through the `wrapWholeFile` fence → chroma path — and close the one gap that makes the integration imprecise: width.

## Background — why this works at all

Television channels are TOML recipes (`~/.config/television/cable/*.toml`) with a `[preview] command` templated on the selected entry. The preview command's stdout is a pipe into television's ratatui panel. That is the entire interface — the three-concerns boundary (ADR: origin doc): television owns windowing, okuda owns rendering, the pipe is the message bus, no API in either direction (`advisories/ADV-THE-PILE.md`).

Empirically verified (2026-09-30 session):

* Truecolor survives the pipe — `detectColorMode` has no TTY gate.
* Code files render chroma-coloured — `wrapWholeFile` + chroma's live alias table.
* Escape hygiene holds in a foreign panel — every line ends `\x1b[0m`.
* The clear/home escape is `--watch`-gated — piped output is clean.
* Cold start 52ms — fine for a preview command; television caches preview output by default.
* Graceful degradation by construction — absent chroma/mermaid renders byte-identical plain (BRF-FENCE-COLOUR).

## Scope

**In:**

* `terminalCols()` honours `OKUDA_WIDTH` as a width override, FZF-precedence shape.
* Unit tests for the precedence chain.
* An example cable channel shipped in the repo (explainer + TOML).
* The live channel file in `~/.config/television/cable/docs.toml` on this machine.

**Out:**

* A `--width` CLI flag (the env covers the preview hosts; a flag can ride a later brief).
* Any television-side code (we consume their config surface; their issue #999 — exporting preview dimensions as `FZF_PREVIEW_COLUMNS`/`LINES` to preview commands — is *their* fix, and when it lands okuda is pixel-perfect with zero further changes, since the FZF var is already honoured and takes host authority).

## Work Plan

1. [x] Empirical smoke: markdown + code through a pipe, latency, watch-gating (session 2026-09-30).
2. [ ] `OKUDA_WIDTH` in `terminalCols()` — host authority order: `FZF_PREVIEW_COLUMNS` (a live pane claim) > `OKUDA_WIDTH` (a user pin) > TTY read > fallback 80.
3. [ ] Unit tests in `tests/width.test.ts` mirroring the existing FZF tests.
4. [ ] Explainer + example channel in the repo (`docs/television-preview.md` + the TOML inline).
5. [ ] Write the live channel to `~/.config/television/cable/docs.toml`.
6. [ ] `just ship` (tests, check, build, install, fresh); dogfood in television.

## Acceptance Criteria

* With `OKUDA_WIDTH=60` and no TTY: width resolves to 60; with both `FZF_PREVIEW_COLUMNS` and `OKUDA_WIDTH` set, the FZF var wins (the pane is more specific than the pin).
* Piped preview output is unchanged when no width envs are set — the 80 fallback and every existing test stand byte-identical.
* `tv docs` on this machine previews `.md`/code files okuda-rendered; panel scrolling works on okuda's output.
* `just check` green.

## Notes

* The channel (exact file):

```toml
[metadata]
name = "docs"
description = "Code and markdown, okuda-rendered"
requirements = ["fd", "okuda"]

[source]
command = "fd -t f -e md -e markdown -e ts -e rs -e go -e toml -e json -e sh"

[preview]
command = "okuda '{}'"
# Pin the pane width to match [ui.preview_panel] size on your terminal —
# e.g. 50% of a 140-col terminal: env = { OKUDA_WIDTH = "70" }
```

* Cycling previewers is built in (PR #808): `command = ["bat -n --color=always '{}'", "okuda '{}'"]` cycles on ctrl-f.
* Television's `offset` template and preview scrolling operate on okuda's output as-is — nothing needed on our side.
* The moat answer: okuda does not care where the text comes from ("we don't care where the text comes from" — origin doc), and television does not care who renders it. This brief is the doctrine finding a second consumer.
