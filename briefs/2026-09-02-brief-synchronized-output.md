---
type: Brief
callsign: BRF-SYNC-OUTPUT
---

# Brief: Synchronized output — deliver each paint as one frame

**Date:** 2026-09-02
**Status:** Open
**Branch:** feat/sync-output-frame

## Context

SSH dogfood, Mac → Omarchy (the Linux bring-up): visible flicker on the gloam TUI, on text content and diagrams alike. The trigger was latency; the cause was already in the renderer.

## The finding

`tui.ts` `paint()` clears then repaints on every repaint trigger —
scroll, jump, reload, resize:

```ts
process.stdout.write("\x1b[2J\x1b[H"); // clear + home
```

Locally the whole frame reaches the PTY fast enough that the
blank-to-content gap is sub-perceptual. Over SSH the frame is split
across TCP packets; the terminal composites the intermediate states —
cleared screen, then lines arriving one packet at a time. The flicker
on *text* is the tell: it was never a diagram-width problem; every
frame tears, diagrams just tear longer (more bytes on the wire).

The same paint emits multiple `write()` calls (viewport, footer
addressing, footer, hints), splitting frames further.

## The fix chosen (option 2 of the fix ladder)

Bracket every paint in **DECSET 2026 synchronized output**
(`ESC[?2026h` … `ESC[?2026l`): the terminal defers compositing until
the closer, so a frame split across packets lands as one frame.
Assemble the frame into a single string and emit it in a **single
`write()`** — one frame, delivered as one frame. This is the okudagram
claim (header, body, terminator, footer are one frame) finally made
true on the wire.

Unknown-mode-safe: terminals without 2026 support ignore the pair
(spec: unrecognised private modes are ignored). No content byte
changes; the bracket is additive.

## Honest limits — this is palliative, not curative

- The clear-then-paint blank gap **remains on the wire**; 2026 masks
  the intermediate state, it does not remove it. Repaint cost is
  unchanged.
- Efficacy is **conditional on the client terminal**: Ghostty,
  iTerm2, kitty, WezTerm support 2026 — expect the flicker to vanish.
  Terminal.app does not — expect zero change there.
- Sync windows are **capped** (~150 ms in several implementations):
  on a sufficiently congested link the terminal gives up and paints
  anyway. LAN SSH is far inside the window.

## Deferred, evidence-gated: option 1 (no-clear repaint)

Home + per-line `ESC[K` + trailing `ESC[J` — no blank gap ever, works
on every terminal including those without 2026. **The decision rule:**
if the SSH re-test on a 2026-capable terminal shows no flicker, option
1 is demoted to robustness work for non-2026 terminals; if flicker
remains, option 1 is confirmed necessary and gets its own brief.
Either result is a finding; this brief is the probe.

If option 1 is ever taken, its implementation constraints are already
known: the paint walk stays sequential (no per-row `CUP` — over-wide
mermaid lines soft-wrap onto extra rows and absolute addressing
mispaints under every wrap), and the trailing `ESC[J` is load-bearing
(a shorter re-render must not strand the previous frame's terminator
below the new one).

## Implementation

- `tui.ts`: export `SYNC_BEGIN` / `SYNC_END` / `syncWrap(frame)` —
  the one seam; `paint()` builds its frame string and emits
  `syncWrap(frame)` in a single write.
- No change to the clear strategy, the viewport math, the footer, or
  the hints row in this brief.

## Acceptance

- SSH Mac → Omarchy, 2026-capable client terminal (Ghostty/iTerm2):
  scroll and jump repaint without visible tearing.
- Non-2026 terminals: byte stream identical apart from the ignored
  bracket — behaviour unchanged.
- `bun test` green, including new tests pinning the bracket seam
  (opener first, closer last, frame untouched between).
- `just check` passes.
