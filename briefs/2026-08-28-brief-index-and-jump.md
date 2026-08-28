# brief: Ephemeral Index Generation and Numeric Jump Navigation

**Created:** 2026-08-28
**TD:** td-okuda-index-jump
**Status:** pending

## What
Generates ephemeral, numbered Markdown index documents for search and navigation results, enabling instant document switching via two-digit direct numeric entry and backstack traversal.

## Why
Avoids complex, fragile TUI state machines for search menus by representing result states as standard Markdown documents. Provides instant, low-cognitive-load keyboard navigation without cursor hunting or repeated search execution.

## How
- Intercept search/query output (via ripgrep, fzf, or AI synthesis) and format candidates as a structured Markdown document containing numbered reference tokens (`11`, `12`, etc.) — jump tokens number from **11**, not `01` (ADR-021: the 0 key sits at the opposite end of the row from 1; the offset removes the stretch for the common ≤ ~10-item list, and reserves `01`–`09` as a free namespace for future fixed commands).
- Pipe the generated Markdown into `src/grammar.ts` and `src/render.ts` to display within the standard Okuda frame.
- In `src/tui.ts`, implement a two-character numeric buffer that listens for digit inputs (`11`–`99`) in normal mode, immediately opening the corresponding document path or section anchor. The resolver (`extractJumps`, `RE_RHS_TOKEN`) is range-agnostic on 1–2 digits, so it is unchanged — it reads whatever token the compositor emits.
- Maintain an ephemeral document history stack so pressing `u` or `Backspace` returns to the previous index document without re-running queries.

## Acceptance criteria
- Search operations render as a numbered Markdown document within the active viewport[cite: 1].
- Entering a two-digit number (e.g., `15`) immediately loads and renders the target document or section[cite: 1].
- Pressing `Backspace` or `u` returns to the generated search index document with scroll position intact.
- Numeric input is ignored if the requested index does not exist in the active document.

## Out of scope
- Dynamic interactive selection cursors or arrow-key menu scrolling.
- Multi-digit numbers exceeding two digits (`>99`). Lists over ~10 items are "too long" by the operator's stance; okuda renders the okudagram either way — list length is the compositor's concern, not the renderer's. The addressable ceiling with the `11` offset is 89 items (item 90 → `100`), already over the two-digit bound.
- Persistent storage of ephemeral search results across separate TUI sessions.