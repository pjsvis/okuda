---
type: Brief
callsign: BRF-SSH-TUI
---

# brief: Modern terminal escape protocol integration for SSH TUI delivery

**Created:** 2026-08-26
**TD:** td-00842
**Status:** draft

## What
Integrate modern terminal wire protocols into the Okuda SSH rendering pipeline to achieve atomic, tear-free frame updates and predictable client capability negotiation.

## Why
Delivering rendered markdown at dynamic frame rates over SSH causes cursor tearing, partial paint artifacts, and visual corruption across disparate terminal emulators without explicit frame boundaries and client-capability detection.

## How
Implement terminal capability negotiation at handshake and wrap frame emission in modern synchronization sequences:
- **Frame Synchronization:** Wrap each frame flush in Synchronized Output brackets (`\x1b[?2026h` to begin, `\x1b[?2026l` to end) with cursor-hide fallbacks (`\x1b[?25l`/`h`).
- **Capability Probing:** Issue in-band terminal identification queries (`CSI > q` for XTVERSION and `CSI ? 2026 $ p` for DECRQM mode support) on session init with a strict fallback timeout.
- **Double-Buffered Diffing:** Compare in-memory cell matrices per frame, emitting only dirty cell SGR sequences.
- **PTY Sanitization:** Guarantee closing brackets and cursor visibility on session disconnect, SIGINT, or mid-stream error to prevent freezing client terminals.

## Acceptance criteria
- [ ] Atomic frame delivery verified without tearing on DEC 2026-compliant clients (Ghostty, Alacritty, Kitty, iTerm2).
- [ ] Non-compliant terminals gracefully fall back to diffed rendering without raw escape leaks.
- [ ] Renderer guarantees safe terminal restoration (`\x1b[?2026l\x1b[?25h\x1b[0m`) on unexpected SSH disconnection.
- [ ] Capability handshake completes in <50ms or defaults to safe baseline ANSI.

## Out of scope
- Inline image protocol implementations (Kitty Graphics, Sixel).
- Interactive mouse tracking (`CSI ? 1006 h`) or custom keyboard protocol support.
- Multiplexer passthrough encapsulation (e.g., `tmux` DCS wrapping).
