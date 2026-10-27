---
type: Brief
callsign: BRF-DOCUMENT-SEARCH
---

# Brief: In-Document Search and Outlining — Fast Navigation in Gloam

**Date:** 2026-08-26
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on.

---

## Objective

Equip `okuda` and the `Gloam` TUI viewer with fast in-document outline jumping and full-text search navigation via an AST heading extractor and interactive picker.

## Scope

**In:**
- AST heading extractor helper in `src/render.ts` collecting `#`, `##`, `###` headings with their line numbers in the rendered output buffer.
- CLI flag `--outline` (or `--toc`) on `okuda` emitting machine-parseable heading records (`<line>:<level>:<heading_text>`) for external tooling and shell pipelines.
- In-document outline picker overlay in `src/tui.ts` bound to `o` (and `Tab`), rendering a hierarchical outline list and jumping viewport scroll directly to the selected heading.
- In-document full-text search overlay in `src/tui.ts` bound to `/`, allowing interactive string/regex query filtering across the current document with real-time match highlighting.
- Integration with viewport re-anchoring (`reanchoredScroll`) to jump to target line offsets while respecting top padding and header tabs.
- Keybinding hints update in the Gloam footer (`o outline · / search`) when viewing a document.

**Out:**
- Multi-file global codebase search (this remains the responsibility of the launcher/file picker).
- In-place buffer editing or document modification (`okuda` remains strictly a viewer).
- Introducing heavy third-party TUI frameworks; all overlays execute within the existing zero-dependency Bun game loop.

## Preconditions

- [ ] The `okuda` renderer passes all baseline checks (`just check`).
- [ ] The TUI control loop (`src/tui.ts`) correctly processes raw keystrokes and alternate screen buffers.
- [ ] Viewport scrolling machinery supports direct line target offset assignments.

## Work Plan

1. [ ] Implement `extractHeadings(doc: string, width: number, palette: Palette)` in `src/render.ts` to return an ordered array of `{ level: number, text: string, line: number }` entries matching rendered buffer line indices.
2. [ ] Add the `--outline` flag to `src/cli.ts` to output tab/colon-delimited outline entries to stdout and exit.
3. [ ] Define new `KeyAction` variants in `src/tui.ts` for `"outline"` (`o`, `Tab`) and `"search"` (`/`).
4. [ ] Implement the modal outline overlay in `src/tui.ts`: display filtered headings list, handle up/down/Enter selection, and update `scrollY` to the selected heading's line offset on Enter.
5. [ ] Implement the modal search overlay in `src/tui.ts`: prompt query input, collect matching rendered lines, preview surrounding lines, and jump `scrollY` on Enter.
6. [ ] Ensure `Escape` or `q` while inside an overlay cancels the picker and restores the previous `scrollY` position.
7. [ ] Update footer hints row in `src/tui.ts` to advertise `o outline · / search`.
8. [ ] Add unit tests in `tests/outline.test.ts` covering heading extraction accuracy, indentation formatting, and line offset mapping.
9. [ ] Run `just reg-sync-fix` and verify `just check` passes.

## Acceptance Criteria

* `okuda --outline <file>` outputs every H1–H3 heading with its 1-indexed rendered line number.
* Pressing `o` or `Tab` in the Gloam TUI opens the outline modal listing all headings with level indentation.
* Selecting an outline entry with Enter immediately jumps the viewport to that heading.
* Pressing `/` in Gloam prompts for a search query and highlights/jumps to matches.
* Pressing `Escape` or `q` inside either modal dismisses the modal without altering the previous viewport scroll position.
* `just check` passes with all registries in sync.

## Notes

- Keep the modal overlay rendering within the terminal width boundaries (`terminalCols`).
- Heading line offsets must correspond to lines in the *rendered* buffer (accounting for wrap, blank margins, and code blocks), not raw Markdown source lines.
- Modals must be lightweight and snappy, redrawing in raw mode with zero latency.
