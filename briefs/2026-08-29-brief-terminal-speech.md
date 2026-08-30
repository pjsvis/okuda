---
type: Brief
callsign: BRF-TERMINAL-SPEECH
---

# Brief: Terminal Speech Pipeline Easter Egg

**Date:** 2026-08-29
**Status:** Open

---

## Objective

Implement a lightweight, non-blocking keybinding in Gloam that pipes the active sectional plain text or full document buffer directly to the host OS native text-to-speech binary (`say`, `spd-say`/`espeak-ng`, or PowerShell `System.Speech`).

## Scope

**In:**
- Detection of native OS speech binaries (`say` on macOS, `spd-say` or `espeak-ng` on Linux, PowerShell fallback on Windows).
- Keybinding handler in Gloam (e.g., `s`) to trigger text-to-speech for the currently focused section AST buffer.
- Process spawn/exec logic that executes asynchronously without blocking the terminal event loop or UI redraw.
- Silent degradation when no native speech binary exists on `$PATH`.

**Out:**
- In-process speech synthesis libraries, heavy neural TTS models, or external cloud API calls.
- Real-time audio streaming, duplex audio controls, playback progress bars, or pause/resume state machines.
- Custom pronunciation dictionaries or AST-to-phoneme parsing.

## Preconditions

- [ ] Gloam section-view AST provides access to clean, un-rendered plain text slices prior to ANSI escape code formatting.
- [ ] Terminal key event listener is hooked and capable of dispatching commands based on current section context.

## Work Plan

1. [ ] Implement OS platform detector to resolve the default CLI speech command (`say`, `spd-say`, `espeak-ng`, or `powershell.exe`) from the host environment.
2. [ ] Add execution wrapper that detaches and pipes a string buffer via standard input or CLI arguments to the resolved binary.
3. [ ] Bind the trigger key in the Gloam matrix view to extract the active section plain text and pass it to the speech wrapper.
4. [ ] Add process lifecycle handling to kill any active speech child process before triggering a new one to prevent audio overlapping.
5. [ ] Verify silent error handling so execution failures do not crash the terminal matrix or interrupt navigation.

## Acceptance Criteria

* Pressing the assigned speech key while viewing a section spawns the host native speech utility with the plain text of that section.
* Triggering speech on a subsequent section immediately terminates the previous speech process and starts the new section.
* Navigating, scrolling, and switching views in Gloam remains completely responsive while speech is actively playing.
* Running Gloam on a system without a recognized speech binary fails silently without error dialogs, crashes, or UI disruption.

## Notes

Constraints and pitfalls:
- Raw ANSI escape codes passed into native CLI synthesizers cause speech engines to read control characters aloud; only raw AST text must be forwarded.
- Spawning child processes synchronously will freeze the TUI matrix draw cycle; process invocation must run detached or non-blocking.