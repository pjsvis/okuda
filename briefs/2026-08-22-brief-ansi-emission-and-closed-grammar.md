# Brief: ANSI Emission Engine & Closed Grammar Contract

**Date:** 2026-08-22
**Status:** Done (contract accepted; implementation deferred to brief 003)
**Depends on:** 2026-08-20-brief-project-initialisation.md (done)

---

## Objective

Define Okuda's rendering contract: a closed markdown grammar, precise ANSI emission rules, and the terminal rendering strategy that produces Ghostty-grade visual clarity without a TUI framework.

This brief establishes the boundary between what Bun.markdown handles (parsing, token stream) and what Okuda controls (layout, spacing, color, width math). It also records the architectural decision to **exclude CommonMark compliance** as an anti-goal.

## Scope

**In:**
- Closed grammar specification (what Okuda renders, what it ignores).
- ANSI emission rules: true-color palette, OSC 8 hyperlinks, escape sequence hygiene.
- Terminal width detection, hard-wrapping, and indentation continuation.
- Layout strategy for lists, blockquotes, code fences, tables, and Mermaid blocks.
- Decision on Rust/WASM boundary (if any).

**Out:**
- Full implementation code (that is the next brief).
- Syntax highlighting for code fences (shiki integration deferred to implementation brief).
- File watcher logic (`--watch` deferred).
- Compilation to single binary (`bun build --compile` deferred).

## Preconditions

- [x] Silo provisioned and `just check` green.
- [x] Origin doc accepted: `docs/2026-08-20-origin-doc.md`.
- [x] Toolchain verified: `bun 1.3.14`, terminal with `stdout.columns` support.

## Background: Ghostty Rendering Quality

Ghostty's visual clarity is not font-dependent. Its text rendering derives from:

1. **HarfBuzz + FreeType** — correct OpenType shaping and grid-snapped rasterization.
2. **Gamma-correct alpha blending** — preserves stroke weight instead of washing out contrast.
3. **Color space fidelity** — respects display profiles rather than blasting raw sRGB.
4. **Fractional DPI cell snapping** — subpixel-quad alignment prevents blurry misalignment at 1.25x/1.5x scale.

Okuda cannot control the terminal emulator, but it **can** control the signal it sends. If the terminal does its job, Okuda's output should be deterministic and unambiguous. That means:

- No ambiguous width characters without explicit handling.
- No escape sequences that confuse width math.
- No soft-wrapping delegation to the terminal (hard-wrap at `stdout.columns`).

## The Closed Grammar

Okuda does not parse CommonMark. It parses **Okuda Markdown** — a strict subset that matches what the agent workflow actually generates.

| Element | Rendered | Rule / Constraint |
|---|---|---|
| Heading | H1–H3 only | ATX (`# `). H4+ collapsed to bold paragraph. Cyan, bold, trailing `\n\n`. |
| Paragraph | Yes | Hard-wrapped to terminal width. Soft returns honored (output `\n` without trailing double spaces). |
| Unordered List | Yes | `- ` or `* ` at depth 0–1. Max nesting depth: **2**. Enforced loose spacing: `\n\n` between items. Continuation indented to text column. |
| Ordered List | Yes | `1. `, `2. `, etc. Same depth and spacing rules as unordered. |
| Code (fenced) | Yes | Triple backticks only. Indented code blocks **rejected** — treated as plain text. |
| Code (inline) | Yes | Backtick delimited. Green ANSI, no padding. |
| Blockquote | Yes | Single level only. Left pipe (`\x1b[90m│\x1b[0m`) + 2-space indent. Muted gray. |
| Link | Yes | OSC 8 hyperlink escape (`\e]8;;URL\e\\`) wrapping styled text. If terminal does not support OSC 8, fall back to underlined cyan text. |
| Table | Yes (loose) | No ASCII box borders. Column gutter spacing. Header row: cyan + horizontal rule. First column: amber/bold (row keys). Blank line between rows. |
| Mermaid block | Yes | Intercepted pre-render. Content piped to `mermaid-to-md` Rust CLI. Returned ASCII inserted verbatim. No wrapping applied. |
| Raw HTML | **No** | Stripped silently. No error. |
| Footnotes | **No** | Not supported. Inline parenthetical URLs only. |
| Image | **No** | Alt text emitted as `[image: alt]` if no link fallback. |
| Task list (`- [ ]`) | **No** | Treated as unordered list item. Checkbox markup printed as literal text. |
| Thematic break (`---`) | Yes | Thin horizontal rule: `\x1b[90m─\x1b[0m` repeated to terminal width. |
| Bold / Italic / Strikethrough | Yes | Bold: `\x1b[1m`, italic: `\x1b[3m`, strikethrough: `\x1b[9m`. |
| Emoji | Yes | Grapheme width calculated via `Intl.Segmenter` or equivalent. Assumes terminal supports modern Unicode. |

**Rejected elements are not errors.** The parser strips or flattens them. This keeps the renderer honest: it never has to guess how to render an edge case it did not anticipate.

## ANSI Emission Rules

### Color Mode Detection

| Variable | Behavior |
|---|---|
| `NO_COLOR` (any value) | Disable all ANSI color. Emit plain text only. |
| `TERM=dumb` | Same as `NO_COLOR`. |
| `COLORTERM=truecolor` | Full 24-bit RGB (`38;2;R;G;B`). |
| Default (modern terminal assumed) | Full 24-bit RGB. No 256-color or 16-color fallback logic. |
| `FORCE_COLOR` | Override detection, emit full color even if `TERM=dumb`. |

### Default Palette (Rosé Pine Base)

| Semantic Role | Hex | ANSI Sequence |
|---|---|---|
| Heading | `#e0def4` | `\x1b[1;38;2;224;222;244m` |
| Code text | `#eb6f92` | `\x1b[38;2;235;111;146m` |
| Code background | `#26233a` | `\x1b[48;2;38;35;58m` |
| Blockquote | `#6e6a86` | `\x1b[38;2;110;106;134m` |
| Link | `#9ccfd8` | `\x1b[4;38;2;156;207;216m` |
| Emphasis (italic) | `#f6c177` | `\x1b[3;38;2;246;193;119m` |
| Strong (bold) | `#ebbcba` | `\x1b[1;38;2;235;188;186m` |
| Table header | `#31748f` | `\x1b[1;38;2;49;116;143m` |
| Table row key (col 0) | `#f6c177` | `\x1b[1;38;2;246;193;119m` |
| Muted / rule | `#6e6a86` | `\x1b[38;2;110;106;134m` |
| Reset | — | `\x1b[0m` |

User override: `~/.config/okuda/palette.json` (JSON object mapping semantic role to `"#RRGGBB"`).

### Escape Sequence Hygiene

1. **Zero-width escapes.** All ANSI sequences must be tracked as zero display columns during width math. The layout engine must wrap based on visible characters only.
2. **No nested styles across wrap boundaries.** If bold text wraps mid-word, emit `\x1b[0m` at the wrap point and re-emit the style at the continuation indent. This prevents style bleed if the terminal soft-wraps or the user copies text.
3. **OSC 8 termination.** Every `\e]8;;URL\e\\` must have a matching `\e]8;;\e\\` after the linked text. Never leave an open hyperlink zone.
4. **No palette pollution.** Every formatted line must end in `\x1b[0m` before `\n`, or every line must start with an explicit style reset. Do not assume the terminal resets per line.

## Layout Rules

### Hard-Wrap Mandate

Okuda inserts literal `\n` at the terminal width boundary. It never delegates wrapping to the terminal emulator. This ensures:

- Indentation continuation is correct (e.g., wrapped bullet points align under text, not margin).
- Mermaid ASCII blocks are never mangled by terminal soft-wrap.
- Copy-paste from the terminal yields consistent line breaks.

### Width Math

- Use `Intl.Segmenter` with `granularity: "grapheme"` to count display columns.
- CJK characters and emoji occupy 2 columns (East Asian Width `W` / `F`).
- Combining marks occupy 0 columns.
- ANSI escape sequences occupy 0 columns.
- Tab characters are expanded to 2 spaces before width calculation.

### Indentation Continuation

| Block | First Line | Continuation Lines |
|---|---|---|
| Paragraph | Col 0 | Col 0 (no indent) |
| Bullet list item | `• ` or `- ` | 2-space indent (align under text) |
| Ordered list item | `1. ` | 3-space indent (align under text) |
| Nested bullet (depth 1) | `  • ` | 4-space indent |
| Blockquote | `│ ` | `│ ` (same indent, pipe continues) |
| Code fence | 2-space indent | 2-space indent (verbatim, no wrap) |

Code fences and Mermaid blocks are **never wrapped**. If they exceed terminal width, they overflow. The user is responsible for resizing the pane or authoring narrower diagrams.

## The Rust Boundary

The origin doc delegates Mermaid rendering to the `mermaid-to-md` Rust CLI. No other Rust/WASM component is required for Phase 1.

**Decision:** Keep the layout engine in TypeScript for the initial implementation. The Bun.markdown token stream + custom handlers cover all layout needs. Re-evaluate a Rust/WASM layout engine only if:

1. Profiled cold-start latency exceeds 50ms on a 10,000-word document, **or**
2. `Intl.Segmenter` proves unreliable for grapheme width on production documents, **or**
3. The project later expands to support streaming render of multi-megabyte files.

This avoids premature WASM complexity. The rendering pipeline is a pure function: `Token[] + Width + Palette → string[]`. It is trivial to port to Rust later if performance demands it.

## Work Plan

*This brief's deliverable is the contract itself, not code (see Scope: implementation is explicitly out). The original draft carried implementation tasks in this section — a scope contradiction, reconciled 2026-08-22: those items now seed brief 003.*

1. [x] Closed grammar specification (table above) — what renders, what strips, what flattens
2. [x] ANSI emission rules: true-color palette, OSC 8 handling, escape hygiene (4 rules)
3. [x] Layout rules: hard-wrap mandate, width math, indentation continuation table
4. [x] Rust boundary decision: TS layout engine for Phase 1, with three profiling triggers for re-evaluation
5. [x] Irreversible core contract recorded as ADR-004 (hard-wrap, never soft-wrap)

## Acceptance Criteria

- The grammar table covers every element the workflow generates, with explicit rejection (strip/flatten, never error)
- Every semantic role has a hex + ANSI byte mapping; `NO_COLOR`/`TERM=dumb`/`FORCE_COLOR` behavior specified
- Width math rules are pinned: grapheme counting, EAW 2-column, zero-width escapes and combining marks
- The contract is sufficient for brief 003 to implement without reopening spec decisions

## Notes — Barnacles & Decisions

| Decision | Rationale | Reversibility |
|---|---|---|
| Closed grammar, not CommonMark | Eliminates 70% of parser complexity. Matches actual workflow output. | Reversible: later grammar expansion is additive. |
| No Rust/WASM for Phase 1 | Bun.markdown + TS handlers are sufficient. Profile before optimizing. | Reversible: layout engine is a pure function, trivially portable. |
| True-color only, no fallback | Modern terminal assumption (Ghostty, Kitty, iTerm, WezTerm). `NO_COLOR` covers the rest. | Reversible: palette emitter can be parameterized later. |
| Hard-wrap, never soft-wrap | Correct indentation continuation; Mermaid safety; copy-paste consistency. | Irreversible: this is a core contract. |
| `mermaid-to-md` piped via `Bun.spawn` | Reuses existing Rust binary. No Mermaid parser in JS. | Reversible: could inline if binary moves. |

## Next Brief

Implementation (brief 003): the `src/` tree (`grammar`, `width`, `ansi`, `wrap`, `render`, `palette` — the six modules scoped above), `bun build --compile`, `--watch` mode, and `shiki` syntax highlighting integration. Acceptance criteria from this brief's original draft (CJK/emoji alignment, rejection-file test, `NO_COLOR` parity, Mermaid piping, loose tables, wrap property tests) carry forward verbatim to brief 003.
