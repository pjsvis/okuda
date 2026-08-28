# brief: Inline Ask-the-Doc and Local SSH Transport

> **Parked (2026-08-28):** premature — needs more thought and a *unique*
> keystroke (`?` is already the hints toggle), plus a compositing answer: the
> environment writes answer documents and okuda renders them (the filesystem
> is the message bus); an LLM client does not enter `src/`. The SSH-transport
> half is dead per ADR-013 (Option 1 landed; Option 2 parked behind the
> portal gate-probe brief). The modal-frame + scroll-anchor-preservation
> ideas below are the salvageable kernel for whenever this un parks.

**Created:** 2026-08-28
**TD:** td-okuda-ai-ssh
**Status:** parked

## What
Adds an in-TUI modal triggered by `?` to execute semantic queries and on-the-fly document summarization against the active document AST, and introduces a local SSH transport daemon to serve Okuda as a zero-dependency local service interface.

## Why
Navigating dense technical documents and runbooks during live operations requires immediate synthesis without losing viewport position or context. Serving this interface over local SSH replaces brittle IPC/custom client protocols with ubiquitous Unix terminal plumbing.

## How
- In `src/tui.ts`, intercept the `?` key to mount a bounded LCARS input overlay.
- Pass the sliced active document AST (`src/grammar.ts`) and user query (or default empty query for auto-summary) to a local/remote LLM completion worker.
- Stream the response into `src/render.ts` inside a framed modal card; pressing `Esc` dismisses the overlay and restores the anchored viewport.
- Provide a lightweight Bun SSH listener (`ssh2`) binding localhost/Unix sockets to expose the TUI session to local `ssh` invocations.

## Acceptance criteria
- Pressing `?` opens an input prompt displaying current document context.
- Entering empty input or `summary` renders a structured, on-the-fly summary of the active document within the Okuda frame.
- Pressing `Esc` dismisses the AI frame and preserves the exact scroll anchor.
- Executing `ssh -p <port> localhost` or connecting via local socket starts an interactive Okuda session with full terminal resize support.

## Out of scope
- Multi-turn autonomous tool use or arbitrary shell execution.
- Sub-second streaming refresh (hardcoded 3-second layout cadence remains intact).
- Write or edit capabilities over source Markdown files.