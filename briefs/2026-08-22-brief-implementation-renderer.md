# Brief: Implementation — the Renderer, Compiled

**Date:** 2026-08-22
**Status:** Done (2026-08-24; renderer implemented, 86/86 tests green, binary compiles, dogfood flip landed; debrief `debriefs/2026-08-24-debrief-renderer-implementation.md`)
**Depends on:** 2026-08-22-brief-ansi-emission-and-closed-grammar.md (done — the rendering contract)

---

## Objective

Implement okuda per the accepted rendering contract: the `src/` tree, the `mermaid-to-md` pipe, a single compiled binary via `bun build --compile`, and the dogfood flip — `just help` rendering through okuda itself.

## Scope

**In:**
- `src/` modules: `grammar`, `width`, `ansi`, `wrap`, `render`, `palette` (per contract's module split)
- Bun.markdown custom handlers wiring the closed grammar
- `mermaid-to-md` interception via `Bun.spawn`
- CLI entry: `okuda <file.md>`, `--watch`, `--no-color` flag
- `bun build --compile` → single binary, zero runtime deps
- Test suite (Bun test): width math property tests, rejection file, palette override, wrap invariants
- `justfile` additions: `dev`, `build`, `test`
- Dogfood flip: `help: @./okuda docs/help.md` (or built binary path)

**Out:**
- Syntax highlighting via shiki (deferred to a follow-up brief — compile the core first)
- Streaming render of multi-megabyte files
- Any grammar expansion beyond the contract (additive later, per ADR in contract)
- Man page, Homebrew packaging, distribution

## Preconditions

- [x] Rendering contract accepted (brief 002, done; ADR-004 hard-wrap mandate recorded)
- [x] Toolchain: `bun 1.3.8` on PATH
- [x] External dependency: `mermaid-to-md` at `~/.local/bin/mermaid-to-md` (verified)
- [x] Silo governance green: `just check` passes, no pending registry drift

## Work Plan

1. [x] `src/grammar.ts` — closed-grammar parser options + rejection policy + the string-tag protocol (list placeholder, nested-list tags, RAW blocks) — see `decisions/005-render-engine-string-protocols.md`. No `any`.
2. [x] `src/width.ts` — display column calculator: `Intl.Segmenter` grapheme counting, East Asian Width (W/F = 2), combining marks = 0, ANSI escapes = 0, tabs → 2 spaces, VS16 → 2.
3. [x] `src/ansi.ts` — color mode detection (`NO_COLOR`/`TERM=dumb`/`FORCE_COLOR`), emitters per semantic role, full-reset-only invariant for the wrap state machine.
4. [x] `src/palette.ts` — default Rosé Pine Base palette (byte-exact) + `~/.config/okuda/palette.json` override loader (malformed → defaults).
5. [x] `src/wrap.ts` — hard-wrap engine; positional ANSI-state fold, style re-emit at continuations, OSC 8 pairing, defensive per-line reset. Never wraps RAW-tagged blocks.
6. [x] `src/render.ts` — Bun.markdown handlers: grammar → ansi + wrap. (a) Mermaid fences pre-passed to `mermaid-to-md` via `Bun.spawn`, ASCII classified into border/arrow/text channels and coloured per palette; (b) table handler applies uniform presentation — loose rows, no internal pipes, header rule kept, three-channel colour, alignment preserved, no provenance detection. List placeholder protocol + table cell-type classification (post-order safe).
7. [x] `src/cli.ts` — args (`<file>`, `--watch`, `--no-color`, stdin fallback), width detection (`stdout.columns`/80), `--watch` re-render on fs change + SIGWINCH.
8. [x] `tests/` — 86 tests across width, wrap, ansi/palette, render (grammar + rejections + NO_COLOR parity + property invariants), table/diagram (classification + integration + NO_COLOR byte-parity). All green.
9. [x] `justfile` — `dev`/`build`/`test` recipes in a `build` group, grouped per justfile playbook.
10. [x] Dogfood flip: `just help` → `@./okuda docs/help.md`; playbook revit in same commit.
11. [x] DEPENDENCIES.md updated: `bun-types` dev-dep noted (plus the 1.3.8 listItem-metadata-gap caveat cross-referenced to ADR-005).
12. [x] `just check` green; ADR-005 recorded; brief status → done; debrief follows.

## Acceptance Criteria

* A markdown file using only the closed grammar renders to stdout with correct alignment on CJK text, emoji, and combining diacritics.
* A markdown file containing HTML tags, footnotes, task lists, and indented code blocks renders without crash and without emitting raw markup.
* `NO_COLOR=1 okuda file.md` (and `--no-color`) emits plain text with identical line breaks and spacing to the colored render.
* Mermaid blocks are replaced by `mermaid-to-md` ASCII output; the returned ASCII is classified into border/arrow/text channels and coloured per the palette; the surrounding document layout is undisturbed; blocks wider than the terminal overflow, never wrap.
* Tables render with no ASCII box borders, amber first column, cyan header, blank lines between rows, **alignment markers preserved** (`:---:`/`--:`/`---:` carried through).
* Wrap math passes property tests: every emitted line ≤ `stdout.columns` display columns; ANSI byte length > display length.
* `bun build --compile` produces a single executable; it renders `docs/help.md` and the origin doc.
* **Dogfood:** `just help` runs through okuda itself; the justfile playbook records the flip.
* Test suite green under `bun test`; zero runtime dependencies in the compiled artifact.

## Notes — Decisions Carried In

| Decision | Source | Note |
|---|---|---|
| Hard-wrap, never soft-wrap | ADR-004 | Irreversible. Fences overflow; they never wrap. |
| Closed grammar, no CommonMark | brief 002 | Rejected elements strip/flatten silently. |
| True-color only, `NO_COLOR` escape hatch | brief 002 | No 256/16-color fallback logic. |
| TS layout engine, no Rust/WASM Phase 1 | brief 002 | Re-evaluate only on the three profiling triggers. |
| Pure-function pipeline | brief 002 | `Token[] + Width + Palette → string[]` — ported trivially if ever needed. |
| Mermaid colour classification in render layer, not on the binary | brief 2026-08-23-diagram-colour-classification | No `--color` flag on `mermaid-tui`; palette sovereignty stays with Okuda. |
| Uniform table presentation, no provenance detection | brief 2026-08-23-table-rendering-policy | Alignment preserved; single-line cells; bake stays rejected. |

## Next Brief

Follow-up: shiki syntax highlighting for code fences; packaging/distribution if warranted by use.
