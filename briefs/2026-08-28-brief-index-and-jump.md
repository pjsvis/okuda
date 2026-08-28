# brief: Ephemeral Index Generation and Numeric Jump Navigation

**Created:** 2026-08-28
**TD:** td-okuda-index-jump
**Status:** pending

## What
Generates ephemeral, numbered Markdown index documents for search and navigation results, enabling instant document switching via two-digit direct numeric entry and backstack traversal.

## Why
Avoids complex, fragile TUI state machines for search menus by representing result states as standard Markdown documents. Provides instant, low-cognitive-load keyboard navigation without cursor hunting or repeated search execution.

## How
- Intercept search/query output (via ripgrep, fzf, or AI synthesis) and format candidates as a structured Markdown document containing numbered reference tokens (`[01]`, `[02]`, etc.)[cite: 1, 2].
- Pipe the generated Markdown into `src/grammar.ts` and `src/render.ts` to display within the standard Okuda frame.
- In `src/tui.ts`, implement a two-character numeric buffer that listens for digit inputs (`01`–`99`) in normal mode, immediately opening the corresponding document path or section anchor[cite: 1].
- Maintain an ephemeral document history stack so pressing `u` or `Backspace` returns to the previous index document without re-running queries.

## Acceptance criteria
- Search operations render as a numbered Markdown document within the active viewport[cite: 1].
- Entering a two-digit number (e.g., `05`) immediately loads and renders the target document or section[cite: 1].
- Pressing `Backspace` or `u` returns to the generated search index document with scroll position intact.
- Numeric input is ignored if the requested index does not exist in the active document.

## Out of scope
- Dynamic interactive selection cursors or arrow-key menu scrolling.
- Multi-digit numbers exceeding two digits (`>99`).
- Persistent storage of ephemeral search results across separate TUI sessions.