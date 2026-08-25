# Decision: Front matter elided, setext headings neutralised

**Date:** 2026-08-25
**Status:** Accepted

## Context

Two grammar faults surfaced while rendering the dogfood corpus under the
Okuda palette. Both are CommonMark traps — cases where the spec assigns a
second meaning to characters that, in okuda's house style, carry a
different one. The renderer was silently corrupting renders.

1. **YAML front matter** (`---\n…\n---\n` at document start). CommonMark
   parses the closing `---` as a setext h2 underline, promoting the
   front-matter keys to an H2 heading. Front matter is provenance for
   tools, not content for a reader — it must not appear in the render.

2. **Setext headings** (`text\n---` → h2; `text\n===` → h1). okuda's house
   style (see `playbooks/authoring-playbook.md`) uses ATX hashes for
   headers — gravitas, not context-dependent underlines. A `---` directly
   under a paragraph is, in the operator's intent, a thematic break
   ("`---` is a horizontal line"); an `===` under text has no alternate
   meaning in okuda's grammar at all.

The fixes landed as two pre-render passes in `src/render.ts`
(`stripFrontMatter`, `neutraliseSetext`), gate-fence-aware. They are
grammar decisions — they outlive any colour scheme and apply in every
palette, including the glow-parity default.

## Decision

Two grammar pre-passes run before `Bun.markdown.render`:

- **`stripFrontMatter`** — elide a document-start `^---\r?\n…\r?\n---\r?\n?`
  block entirely. Front matter is for tools, not readers; okuda's position
  matches glow's (silent elision).
- **`neutraliseSetext`** (outside fenced code blocks):
  - `---` / `***` / `___` directly under non-blank text → insert a blank
    line before it, so Bun.markdown parses it as a paragraph + thematic
    break (hr), the operator's intended meaning.
  - `===` directly under non-blank text → strip the line; the text above
    becomes a plain paragraph. `=` is setext-only in okuda's grammar.
- Both passes are fence-aware: setext-like lines inside a ``` or ~~~
  fence are left untouched.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Honour setext h2 (CommonMark-faithful) | The operator's intent for `---` under text is a rule, not a heading. Faithful CommonMark would promote ordinary prose to a heading whenever a `---` follows — a silent, context-dependent promotion. Anti-dogma: does it work? No. |
| Strip `---` under text (no hr) | Loses the thematic break the operator meant to draw. The neutral form must preserve the operator's meaning, not erase it. |
| Front matter → render as a styled block | Provenance is not content. Styling it dresses Stuff as a Thing; the honest move is removal. |
| Document the convention, don't fix the grammar | Convention alone leaves the trap armed — any document with front matter or a stray `---` corrupts on render. The grammar must be safe by default. |

## Consequences

**What became easier:**
- Documents with front matter render clean — no phantom heading from the
  closing `---`.
- A `---` under a paragraph is now reliably a horizontal rule, matching
  operator intent and the authoring playbook's "hash headers" convention.
- Code fences with `---` / `===` content (common in prose examples) are
  preserved verbatim.

**What became harder:**
- Two pre-passes run on every document. Both are O(lines) single-pass —
  negligible cost, but the renderer is no longer a thin pass-through.
- An author who genuinely wants a setext heading cannot get one. okuda's
  grammar accepts ATX hashes only; this is by design (gravitas, not
  underlines) and documented in the authoring playbook.

**Constraints this imposes:**
- ATX headers (`#`) are the sole heading form. Setext is out of grammar.
- Front matter is unconditionally elided at document start; there is no
  flag to preserve it. (Override would require a new render option.)
- The passes are fence-aware by tracking ``` / ~~~ state; any future
  fenced-language handling must respect the same fence tracking.

## Related
- Brief: `briefs/2026-08-25-brief-okuda-palette-and-chrome.md`
- Playbook: `playbooks/authoring-playbook.md` (hash headers heuristic)
- Tests: `tests/render.test.ts` — "grammar pre-passes" describe block
- Commit: `d8b0a01` (feat: Okuda palette preset + code-panel chrome)
