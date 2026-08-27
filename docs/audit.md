# okuda — Formatting & Colour Audit

Each entry below states **what you should see**, then renders the example live. Read the rendered output against the stated expectation. Where they diverge, that's a bug or a terminal/font limit — not a mystery.

Run `okuda docs/audit.md --tui` (or `just audit`) and compare side-by-side with `glow docs/audit.md`. The eye is the judge; the code is innocent until proven guilty.

---

## Inline styles

### Bold — should see: gold, bold
**bold word**

### Italic — should see: yellow, slanted (italic)
*italic word*

If the slant is invisible but the yellow is visible, colour is masking the slant. Test: `okuda --no-color docs/audit.md` — if it slants without colour, the font has an italic face; the issue is perceptual, not emission.

### Bold + italic — should see: gold, bold, slanted
***bold italic word***

### Strikethrough — should see: horizontal line through the text
~~struck word~~

### Inline code — should see: green text on dark background
`code span`

### Link — should see: green, underlined, clickable
[link text](https://example.com/audit)

### Plain text (reference) — should see: default terminal text, no style
plain word

---

## Combinations in prose

A paragraph with **bold**, *italic*, ~~strike~~, `code`, and a [link](https://example.com) all mixed. Each should retain its style without bleeding into the next. The word after a styled span returns to plain — **bold then** plain then *italic then* plain.

---

## Glyph coverage

### Working set — should see: all glyphs rendered, one cell each, no tofu, table column aligned

✓ yes ✗ no ⋮ elided ◆ note ☐ todo … more → flow ← return ↔ bidirectional ✓✓✗✗

| Flag | Meaning |
| --- | --- |
| ✓ | verified |
| ✗ | rejected |
| ⋮ | elided |

If any glyph shows as tofu (empty box) the font is the limit; if the table's
Flag column misaligns, the terminal's width disagrees with the engine —
report which glyph.

---

## Margins and structure (verified good — reference)

### Bold-lead list — should see: amber key column, scannable before read

- **Lists.** Indent two chars past the paragraph margin; the bold leads render high-contrast amber.
- **Tables.** A closing rule beneath the last row.
- **Code fences.** A 2-char left indent, verbatim.
- **Top margin.** An empty line sits at the very top of the document.

| Element | Channel |
| --- | --- |
| Header | blue, bold |
| Key | pale yellow, bold |
| Data | plain |

```
code fence — 2-char indent, verbatim, never wrapped
```

> Quote — muted pipe, single level.

---

## Diagnostic: italic in isolation

This section exists only to test italic rendering without competing styles. If nothing here slants, the terminal or font is the limit — not okuda.

*italic one*

*italic two*

*italic three*
