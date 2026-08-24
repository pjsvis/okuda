---
date: 2026-08-24
tags: [renderer, bun-markdown, ansi, wrap, mermaid, tables, lists, dogfood, knowledge-system]
agent: pi (glm-5.2, ses_7b140e)
environment: local
---

# Debrief: okuda renderer implementation (td-11e977)

## Accomplishments

- **Six modules, per the contract's split:** `grammar` (parser options + the string-tag protocol), `width` (grapheme/EAW/combining/ANSI-aware display math), `ansi` (color-mode detection + byte-exact SGR emitters), `palette` (Rosé Pine defaults + override loader), `wrap` (ANSI-state-machine hard-wrap), `render` (Bun.markdown handlers + table machinery + list placeholder protocol + mermaid pipe + diagram classification), `cli` (args, stdin, `--watch`, SIGWINCH). Strict TypeScript, no `any`, `tsc --noEmit` clean.
- **86/86 tests green** across width, wrap, ansi/palette, render (grammar, rejections, NO_COLOR parity, property invariants), and table/diagram (classification unit + integration + NO_COLOR byte-parity against the binary).
- **Single binary:** `bun build --compile` → `okuda` (63 MB, zero npm runtime deps; `mermaid-to-md` is the one runtime dep, spawned per fence). Renders `docs/help.md`, the origin doc (829 lines), and arbitrary stdin without crash or tag leak.
- **Dogfood flip landed:** `just help` is `@./okuda docs/help.md` — the project renders its own signage. Justfile gained a `build` group (`dev`/`build`/`test`); the justfile playbook records the flip (realised, not just planned) and a new trap (dogfood `help` needs the built binary on a fresh clone).
- **ADR-005** records the render-engine decision: string protocols over Bun.markdown's string-in/string-out callbacks, driven by the bun 1.3.8 `listItem`-metadata gap and the absence of a token stream.

## Problems

- **`scanRuns` cursor desync (the worst).** First implementation pre-collected graphemes over the *whole string including escape bytes*, then walked with two cursors — after consuming an atomic escape, the grapheme pointer still pointed at the escape's own characters, yielding escape fragments as "text graphemes" and splitting sequences mid-flight (`\x1b[48;2;38;3` + RESET + `5;58m`). Fixed by two-phase tokenize: split escape spans from text spans first (escapes never segmented), then grapheme-segment each text span. Caught by a smoke render of `docs/help.md`, not by a unit test — the unit tests used plain text.
- **Double spaces between words.** The wrap engine added a separator space in `appendWord` *and* pushed the raw space unit — two spaces per gap. One-line fix (the raw space only flushes the word), but it took a smoke render to spot because the wrap unit tests asserted widths, not spacing.
- **Style state tracked at scan time, emitted at flush time.** The cursors diverged: the RESET closing a bold span was tracked as soon as scanned, but the line containing the open wasn't flushed until later — so continuation lines lost their prefix and lines emitted the wrong close. Restructured to fold each line's own units positionally at flush time, carrying the result to the next line's prefix. This also fixed the double-open on line 1 (the prefix re-emitted a state already present inline).
- **Table rows swapped.** Post-order: `tr` fires before `thead`, so an `inHeader` flag set by `thead` was always wrong (header landed in body and vice versa). Fixed by classifying sections by cell type — `th` sets a per-row flag, `tr` reads it — independent of thead/tbody ordering.
- **Blockquote continuation over-indented.** First pass re-wrapped quote content with a 2-space continuation indent, then prefixed `│ ` → `│   spans`. The pipe prefix *is* the continuation; the inner wrap uses no indent.
- **OSC 8 regex captured `;params;URI` as one blob.** Close sequence set `url = ";"` (not null), producing triple-semicolon opens and stray closes. Fixed the regex to split params from URI.
- **Mermaid double blank lines.** The binary's `​```text` fence contains a leading blank line, which landed as the first art line. `extractDiagramArt` now trims structural fence padding (interior blanks preserved).
- **Diagram channel sets vs. reality.** The classification brief listed border `┌┐└┘├┤┬┴─│┼` and arrow `▲▼◄►`; the binary actually emits rounded corners `╭╮╰╯`, dashed `╌`, and `▶ ◄ △ × ●`. Extended the sets to match actual binary output. The brief's iteration note anticipated this ("the hex values are not load-bearing; tune against real diagrams"); the architecture (three channels, Unicode-only, never ASCII `^v><`) held unchanged.
- **`Bun.makeTempDir` not a function on 1.3.8** — palette tests used `node:fs.mkdtempSync` instead. Minor; caught by running the tests, not by types.

## Lessons Learned

- **Smoke-render real documents before trusting unit tests.** Three of the worst bugs (scanRuns desync, double spaces, scan-vs-flush state) survived the wrap unit tests because those tested widths and structure, not the actual byte stream on styled prose. A 3-line smoke render of `docs/help.md` surfaced all three in one pass. The lesson: the unit tests assert invariants; the smoke render asserts *output*. Both are load-bearing; neither alone is enough.
- **Post-order callbacks shape the whole engine.** `Bun.markdown` fires children before parents — so the `list` handler knows `ordered` but `listItem` (which fires inside, earlier) does not; `thead` fires after `tr`. Every structural decision (list placeholder protocol, table cell-type classification, nested-list depth tagging) is a consequence of post-order. Fighting it (pre-order markers, pre-set flags) is wasted effort; riding it (children tag, parents resolve) is the path.
- **The ANSI stream is already a protocol.** Building a separate span/marker representation for wrapping would have doubled the surface to keep in sync. Consuming the emitters' ANSI directly — escapes zero-width, state folded positionally, defensive reset per line — collapses wrapping and NO_COLOR into one code path. The invariant (emitters use full `\x1b[0m` resets only) is small and enforced in `ansi.ts`.
- **Probe the dependency before you build on it.** Four short probes of `Bun.markdown` on the actual 1.3.8 runtime (handler names, what metadata arrives for listItem/list/th/td, options that work, table-in-blockquote ordering) shaped the entire architecture. The contract brief assumed 1.3.14; the runtime is 1.3.8; the gap (listItem metadata) became ADR-005. Probing first turned a hidden dependency into a recorded decision.
- **Tune against real output, don't over-spec.** The diagram channel sets and the table aesthetics both diverged from the briefs' first guesses — and both briefs explicitly said "tune against real diagrams/tables once the renderer exists." Building first, then adjusting the sets against actual binary output, honoured that. Specifying the exact sets up front would have shipped wrong values.
- **Dogfood is a one-commit flip with a playbook revit.** `help: @cat → @./okuda` is one line; the revit (the flip is now realised, the new trap, the fresh-clone caveat) is the part that keeps the facade honest for the next implementer.

## What's Left

- **Shiki syntax highlighting** for code fences — explicitly deferred to the follow-up brief (brief 003's "Next Brief").
- **The `--watch` SIGWINCH path** is implemented but not exercised in tests (it's an event loop, not a pure function); worth a manual smoke in a real split-pane session.
- **Table in-cell wrapping** (the post-shrink fallback) is implemented but lightly exercised; the brief's "single-line cells" assumption holds for authored tables, and the rare wide-inherited table wraps cells rather than overflows. Tune against real inherited tables if any appear.
- **Diagram channel palette tuning** — the iteration note stands; tune the three hexes against real diagrams in real panes now that the renderer exists.
