---
date: 2026-09-16
kind: survey — what a browser text-layout engine offers a terminal renderer, and what survives contact with okuda's code
lineage: github.com/chenglou/pretext, cloned to tmp/pretext/ 2026-09-16; reviewed against src/width.ts and src/wrap.ts
status: corrected — two of the three claims do not survive contact with the code; see below
---

# pretext lessons learned

[pretext](https://github.com/chenglou/pretext)

> **Corrected 2026-09-16, after measuring.** The summary below was written from
> the repository's own documentation. Two of its three recommendations do not
> survive contact with okuda's code, and its closing verdict is backwards. The
> errors are left standing below rather than rewritten — the reasoning that
> produced them is the useful part. The measurements are in
> `docs/2026-09-16-what-the-corpus-found.md`.
>
> - **§2A, "borrow `string-width` or an equivalent `wcwidth` port" — already
>   done, and a downgrade if taken.** `src/width.ts` measures grapheme clusters
>   via `Intl.Segmenter`, not code points. Measured: okuda gives the ZWJ family
>   emoji 2 columns, `wcwidth` gives it 8. **okuda is right** — a terminal draws
>   one glyph in two cells. `wcwidth` has no ZWJ concept.
> - **§2B, "return integer ranges, not `string[]`" — does not apply.** The cost
>   it targets is real but small: the largest document in the silo wraps in
>   **5.58 ms**, while the mermaid re-spawn on the same resize path is **68 ms**
>   for a 4-fence document. And `reanchoredScroll` anchors by a **bounded text
>   match on the rendered lines**, so source ranges do not give it what it needs
>   without running the wrap anyway.
> - **§2C, the punctuation glue rules — correct, and the most valuable item
>   here.** It lands on `BRF-FLOW-WRAP`, which is Open and which scoped the same
>   mechanism to `/` and `-` alone. Measured: okuda breaks on **one** character,
>   U+0020, and misses U+200B, U+00AD and U+3000.
> - **The verdict at the foot — "leave the repository on GitHub, borrow only the
>   range-based cursor abstraction" — is exactly inverted.** The cursor is the
>   one thing that does not transfer. What does transfer is not discussed in this
>   document at all: the **corpus** and its **miss taxonomy**.

### 1. What to Completely Ignore

* **The Canvas Measurement Engine:** Pretext’s entire `prepare()` phase exists to call `CanvasRenderingContext2D.measureText()` in batch without touching DOM nodes. In a terminal, this is completely useless overhead.
* **Proportional Font Metrics & Kerning:** Variable-width glyph bounding, fractional pixel line heights, and font-family fallbacks simply don't exist on a standard cell grid.
* **The Rich Inline Module:** Terminal ANSI/SGR escape sequences work fundamentally differently than browser inline CSS styles.

---

### 2. What Is Still Worth Plundering

Even in a terminal, text layout gets messy around Unicode, width budgets, and cursor anchoring.

#### A. Unicode Segment Widths (The East Asian & Emoji Trap)

In a terminal, `string.length` $\neq$ printed cell width. If your pure function assumes 1 character = 1 column:

* CJK characters occupy 2 cells (fullwidth).
* Zero-Width Joiners (ZWJ), variation selectors, and combining accents occupy 0 cells.
* Emojis often occupy 2 cells (though terminal emulators still fight over this).

Pretext separates text into **atomic wrapping units** that cannot be split across line breaks. If you haven't hardened your terminal layout engine against grapheme clusters, steal their approach: **measure strings in visual column widths, not code points or UTF-16 units.** (In the terminal ecosystem, this is usually handled by `string-width` or an equivalent `wcwidth` port).

#### B. The Zero-Allocation Cursor Model (`LayoutCursor`)

Pretext's line range walker is brilliant for terminal virtualisation:

```ts
// Pretext concept:
type LayoutCursor = { byteOrCharIndex: number }
type LineRange = { start: number, end: number, visualColumns: number }

```

If your anchor system keeps the document steady under $(X, Y)$ shifts (e.g., scrolling, resizing rows/columns, pan/zoom), you do **not** want your line-wrapping function returning `string[]` arrays:

* Allocating hundreds of substrings on every terminal resize event burns through the V8/JS garbage collector.
* Instead, return **integer slices over your source text buffer** (`[startIdx, endIdx]`).
* Your anchor logic can calculate line offsets and row spans strictly through integer arithmetic. You only materialize strings and inject ANSI escapes for the exact lines currently visible inside the viewport bounds.

#### C. Kin-soku (Punctuation) & Non-Breaking Rules

Terminal line-wrappers often break naively on spaces. If a user prints Japanese or Chinese prose into your terminal box, naive breaking puts opening punctuation at the end of lines or closing punctuation at the start. Pretext's segment gluing rules (`glueToPrevious`, `glueToNext`) are clean reference implementations for keeping punctuation attached to the appropriate word token.

---

### Terminal-Specific Architecture Summary

| Concern | Pretext Approach (Browser) | Your Terminal Engine Approach |
| --- | --- | --- |
| **Measurement** | Offscreen Canvas 2D | `wcwidth` / terminal cell units (integers) |
| **Line Splitting** | Fractional pixel greedy break | Integer column greedy break |
| **Viewport Anchor** | Pixel-height translation | Row/Column cell offset |
| **Rich Styling** | CSS inline spans | ANSI escape sequence state tracking |

**Verdict:**
Leave the repository on GitHub. Borrow only the **range-based cursor abstraction** (to keep your anchor fast and garbage-collector light) and ensure your column-counting logic respects multi-cell Unicode graphemes instead of raw string indices.