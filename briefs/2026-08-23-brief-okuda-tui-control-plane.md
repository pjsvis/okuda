# Brief: Okuda TUI — the Control Plane (parked)

**Date:** 2026-08-23
**Status:** Parked
**Depends on:** 2026-08-22-brief-implementation-renderer.md (the render plane — open; the control plane composes over the render plane)
**Unparks:** 2026-08-23-brief-gloam-tui-footer.md (Gloam is the footer content this TUI displays)
**Gated on:** the render plane shipping (brief 003); the control plane is a frame around the render, and the render must exist first

## What

A TUI control plane for Okuda: alternate screen, raw-mode keystroke read, a viewport over the rendered string with a scroll offset, and a footer (Gloam ident + keystroke hints). The render plane already exists — `Token[] + Width + Palette → string[]` (brief 002). The control plane is a frame around it; it does not touch rendering.

## The split — two planes, not one app

The render plane is a pure function over a bounded doc. The control plane is a loop:

```
alternate screen on → raw mode on → loop {
    read keystroke bytes
    advance scroll offset (or quit / reload)
    paint the rendered string[] through the viewport
    paint the footer: Gloam ident + keystroke hints
} → raw mode off → alternate screen off
```

That is a game loop — input → update state → paint → repeat. The tight render loop is game-like because it *is* a game loop, and a game loop is the right shape for a viewport with a footer. "Game time" is the framing: when the job is a quick transition scene, the cheapest tool is the game engine; when the job is a viewport over a pure-function render, the cheapest tool is the 100-line keystroke loop. You don't reach for the engine when the engine is the ventilator.

## Why it's parked

Brief 003 (the render plane) is still open. The control plane composes over the render — it can't ship before the render exists. But the architectural decision (split, Bun, no framework) is load-bearing and worth recording now, so the next session inherits the shape instead of re-deriving it. The step isn't reached; the idea survives.

## Scope

**In (when unparked):**
- Alternate screen enter/exit (`\x1b[?1049h` / `\x1b[?1049l`).
- Raw mode on/off (`process.stdin.setRawMode(true)` / `false`).
- Keystroke loop: `process.stdin.on('data', ...)`; keystrokes for scroll, quit, reload.
- Viewport: paint the rendered `string[]` through a scroll offset, to `stdout.rows`.
- Footer: last row (`\x1b[<rows>;1H`), Gloam ident bottom-right, keystroke hints left, muted (`#6e6a86`).
- `--tui` flag on the CLI (or a separate `okuda-tui` entry) — the streaming renderer and `--watch` stay footer-free; the TUI is opt-in.
- Respects `NO_COLOR` / `TERM=dumb` (falls back to the streaming renderer, no TUI).

**Out:**
- The render plane (brief 002/003 — the control plane calls it, doesn't implement it).
- Widget composition: lists, spinners, file trees, forms, stateful components. None of that. A viewport + a footer.
- Mouse scrolling, reflow-on-resize beyond re-running the render plane at the new width.
- Anything that pulls in a framework.

## Why Bun, not Rust or Go — the three rejections

### ratatui (Rust)
Rust is good at TUIs in general; it's the wrong substrate for *this* one. The render plane is TS. A Rust control plane means two languages, two binaries, an IPC boundary. Worse: the `mermaid-tui` Rust engine **deliberately shed ratatui** (`src/mermaid.rs` lines 17–28 — removed the styling dependency, kept only `plain_lines`, "byte-identical to upstream"). Reintroducing ratatui into the *viewer* reverses a documented decision in the sibling silo to solve a problem the viewer doesn't have.

### Bubble Tea + Lipgloss (Go)
Go has the nicest TUI ergonomics in the ecosystem. But "nice tools" is the benchmaxxing move — optimising the tooling rather than the task. The task is a viewport + footer + keystroke loop. And the cruelest irony: **Glamour — Glow's rendering engine — is a Charm library.** Glow is a Bubble Tea app wrapping Glamour. Reaching for Bubble Tea to escape Glow is reaching for the exact stack the incumbent uses.

### Glamour-via-Go (the "shell out to Bun" trap)
You could use Bubble Tea for the control plane and *not* Glamour for the render (shell out to the Bun renderer). That's a Go binary calling a Bun binary to get a string to paint into a viewport — two languages, two binaries, an IPC boundary, to avoid a 100-line keystroke loop. A ventilator built from nice tools.

### The converging reason
The moat is the single compiled Bun binary, zero runtime deps (brief 002, load-bearing). A second language breaks it. The engine shed its framework deliberately. Glow is the Bubble Tea + Glamour app we're trying to not be. The control plane is too small to deserve a framework. **The framework is the ventilator; the 100-line keystroke loop is the valve.**

## Acceptance criteria (when unparked)

* `okuda --tui doc.md` enters alternate screen, renders the doc through a viewport, paints the Gloam footer + keystroke hints, exits clean on `q` / `Ctrl-C`.
* `NO_COLOR=1 okuda --tui` falls back to the streaming renderer (no TUI, no alternate screen).
* `TERM=dumb okuda --tui` falls back the same way.
* The compiled binary is still single, zero runtime deps — no Go, no Rust, no framework pulled in.
* The render plane is unchanged — the control plane calls `render(doc, width, palette)`, doesn't reimplement it.
* The footer is Gloam, bottom-right, muted — per `briefs/2026-08-23-brief-gloam-tui-footer.md`.

## Out of scope (beyond the control plane itself)

- Full interactive TUI navigation: file tree, fuzzy finder, tabs, split panes. A viewport + footer is the scope; the rest is a different app.
- Streaming render of multi-megabyte files (already out per brief 003; the TUI inherits the boundary).
- Mouse, scrollback beyond what the alternate screen provides.
- A second binary or a second language.

## Opinion

The control plane is a 100-line game loop — input, update, paint, repeat — and a game loop is the right shape for a viewport with a footer. "Game time" is the framing: when a movie needs a quick transition scene, the cheapest tool is the game engine, not the full CGI pipeline; when Okuda needs a TUI, the cheapest tool is the keystroke loop, not the widget framework. The game engine isn't the final product — it's the transition — and the keystroke loop isn't the widget app — it's the frame around the render. Stay in Bun, keep the single binary, keep the zero deps, and the TUI is the smallest possible thing that gives you the frame and the Gloam signature without importing the stack you're trying to escape.
