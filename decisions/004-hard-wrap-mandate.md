---
type: ADR
callsign: ADR-HARD-WRAP-004
---

# Decision: Hard-wrap always — Okuda never delegates wrapping to the terminal

**Date:** 2026-08-22
**Status:** Accepted (amended 2026-08-30 — the fence exception closed; see below)

## Context

Okuda renders markdown to stdout in paired-terminal workflows: agent on the left, live preview on the right, panes resized mid-session. Terminals will soft-wrap long lines themselves if a program emits them, but terminal soft-wrap is invisible to the program: it ignores indentation intent, mangles unwrappable blocks (ASCII diagrams), and makes copied text line-break at whatever the pane width happened to be. The rendering contract (brief 002) had to choose who owns the line break.

## Decision

Okuda inserts literal `\n` at the terminal width boundary (`stdout.columns`) itself, always. It never emits a line longer than the display width and never relies on terminal soft-wrapping.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Soft-wrap (emit long lines, let terminal wrap) | Continuation lines lose indentation alignment (wrapped bullets align to margin, not text column); Mermaid/ASCII blocks get mangled on pane resize; copy-paste yields inconsistent breaks |
| Configurable per-block | Two behaviors means two code paths and a config surface for no user benefit; ambiguity about who owns width math defeats the deterministic-signal goal |
| Wrap everything including code fences/mermaid | Diagrams are authored to a width; wrapping them is corruption. Fences **elide** instead (amended 2026-08-30 — `…` at the cut, td-b81597) — the user resizes or authors narrower |

## Consequences

**What became easier:**
- Indentation continuation is exact: wrapped list items align under text, blockquote pipes continue at the same column
- Copy-paste from the terminal reproduces the rendered line breaks
- Width math is a single, testable invariant: every emitted line ≤ `stdout.columns` display columns
- Mermaid ASCII blocks arrive unmangled

**What became harder:**
- The wrap engine must be grapheme-aware (`Intl.Segmenter`, East Asian Width, zero-width ANSI) — no naive `string.length` cuts
- Styles must re-emit at wrap boundaries (no style bleed across lines)
- ~~Code fences and Mermaid blocks that exceed terminal width overflow ugly by design; the user, not okuda, resolves that~~ **Amended 2026-08-30 (td-b81597):** code fences (and the mermaid checksum block) no longer overflow — they elide at the content width with `…` at the cut (`elideToWidth`). The exception was the lesser evil when wrapping was the only alternative; elision is crueler and more useful — the line stays one line, the reader sees less but truthfully, and widening restores the bytes. Mermaid ASCII **diagrams** remain verbatim (art is art; the binary authors to width) **Note (2026-09-01, td-b81e58, brief mermaid-source-omitted): the checksum half is superseded — the source block is no longer rendered at all (tautological in a single-render seam); a `⋮` indicator names where the source lives. The code-fence elision half stands.**

**Constraints this imposes:**
- **Irreversible core contract** (per brief 002's decision table): layout, tests, and user expectations all assume okuda owns every `\n`. Reversal would break the copy-paste and diagram guarantees simultaneously.
- okuda must re-render on terminal resize (`--watch` re-renders; a resize listener is implementation scope, brief 003).

## Related

- Brief: `briefs/2026-08-22-brief-ansi-emission-and-closed-grammar.md` (Layout Rules → Hard-Wrap Mandate)
- Origin: `docs/2026-08-20-origin-doc.md`
