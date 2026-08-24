# okuda — Grammar Showcase

A single document that exercises every element of the closed Okuda Markdown grammar. Render it with `./okuda docs/showcase.md` and read it as a smoke test: if any block below renders wrong, the regression is localised here.

> Named for Michael Okuda: high-contrast, functional, uncluttered. The terminal is
> the display, not a browser in denial. Colour is *functional* — it signals structure,
> not mood.

---

## Structure: headings

### H1, H2, H3 are styled and bold
#### H4 and deeper now render the same way (ADR-007)

The viewer owns the layout. Under ADR-007, okuda matches Glow's heading rendering at every level — the marker count signals depth, and the blue bold is uniform across H1–H6. There is no collapse; a deep heading is still a heading.

---

## Prose: paragraphs and soft returns

This is a single paragraph split across two source lines. The soft return between them becomes a hard break — no trailing double-space tax.

Inline styles carry the semantic load: **bold for emphasis**, *italic for asides*, ~~strikethrough for the discarded~~, and `` `inline code` `` for the literal. A [hyperlink to the origin](https://example.com/origin) renders as an OSC 8 terminal hyperlink — clickable in any modern terminal, invisible to the scrollback. An image `![rejected alt](pic.png)` becomes `[image: rejected alt]`; the viewer renders text, not pixels.

---

## Code: fences are verbatim

```typescript
// Fenced code is never wrapped — long lines overflow, on purpose. // Wrapping code mangles it. The reader scrolls; the bytes stay honest. function render(source: string): string { return source .split("\n") .map((line) => line.trimEnd()) .join("\n"); }
```

---

## Diagrams: mermaid → ASCII

```mermaid
flowchart LR Draft --> Review Review -->|approved| Ship Review -->|rejected| Draft Ship -->|incident| Rollback Rollback --> Draft
```

The fence is intercepted pre-render, piped to the `mermaid-to-md` Rust binary, and the returned ASCII is coloured by channel: borders recede, arrows lead the eye, text sits in the foreground. The diagram never wraps — a wrapped state machine is a lie about the system's topology.

---

## Quotes: single-level, muted

> The map is not the territory. A viewer that pretends otherwise — rendering images,
> embedding HTML, chasing full CommonMark — has confused decoration for fidelity.
> okuda renders what your workflow generates, and refuses what it doesn't.

Nested blockquotes collapse to a single pipe; the grammar refuses to draw a staircase of `>` glyphs that no one reads.

---

## Lists: loose, nested, capped

Unordered lists breathe — an empty line between items regardless of source tightness:

- First item, with a soft return
inside it that honours the break.
- Second item, wrapping across a wide terminal to demonstrate that continuation
indentation aligns under the text, not the marker.
- Third item.

Ordered lists get the same breathing room:

1. Brief before build. 2. Branch before commit. 3. Check before merge.

Nesting is capped at two levels — beyond that, the outline is broken and the child flattens to continuation text:

- Top-level item.
  - Nested child, level one.
    - A third level would be a smell; it renders as continuation prose, not a tree.

Task lists are rejected — the checkbox markup stays literal text:

- [ ] this is not a task list, it is an unordered item
- [x] and this is too

---

## Tables: loose rows, semantic colour

| Element | Behaviour | Channel |
| ---: | :--- | :---: |
| Header | bold cyan, rule beneath | structure |
| Key column | bold amber | identity |
| Data cell | high-contrast text | payload |
| Wide table | shrinks to terminal width, wraps in-cell | containment |

Alignment is honoured per-column: right, left, centre. A table that would overflow the terminal is shrunk proportionally and wrapped in-cell rather than allowed to blow out the pane.

---

## Rejected elements

The grammar is closed. Indented code is not code — it is a paragraph:

this looks like indented code but okuda treats it as prose, because four-space fences are a footgun.

Inline `<em>HTML</em>` is stripped silently; the tags vanish, the text remains. Footnotes and raw HTML blocks produce nothing. No error, no raw markup — the viewer degrades to text, never to noise.

---

## Width: wrap and bypass

Body text wraps at the terminal column count. Raw blocks — code fences, mermaid ASCII — bypass wrapping entirely, because wrapping a diagram or a diff destroys its meaning. Resize the terminal and re-render; the prose reflows, the art holds.

---

## Closing rule

---

That is the whole grammar. Nothing more is promised; nothing more is wanted.
