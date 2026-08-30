---
type: ADR
callsign: ADR-TTY-ACTIVE-INPUT-023
---

# Decision: /dev/tty active-poll reader for the TUI (bypass Bun's broken passive stdin)

**Date:** 2026-08-29
**Status:** Aborted (2026-08-30) — the fix landed and verified, but its
**cost exceeded its benefit. Reverted; passive stdin restored. The
**findings below stand as knowledge. See
**`debriefs/2026-08-30-debrief-fzf-owns-the-loop-aborted.md`.

## Context

The gate-1 spike (BRF-FZF-OWNS-LOOP, td-99667d / td-7bce5e) runs the reader
as a subprocess of fzf's `execute` action. The manual test surfaced the
real gate: under `execute`, okuda's reader renders but **all input is
dead** — `q`/`j`/`k`/Esc/Ctrl-C do nothing. A pty-driven investigation
(~30 probes, td-7bce5e) isolated the behaviour precisely:

- `process.stdin.on("data")` is attached, `isTTY=true`, raw mode set, the
  event loop is **alive** (timers fire forever), `paint()` completes — but
  `data` events **never fire**.
- Nine isolated replications (each adding one more piece of okuda's
  pattern, uncompiled AND compiled) all receive keys. The bug is specific
  to okuda's real `runTui` path.
- The decisive split: a **drained** terminal (the host always drains)
  freezes; a **backpressured** terminal (output buffer filling) does not.
  Once the host drains okuda's paint write, okuda's event loop goes idle
  with only the passive `data` listener pending, and **Bun stops servicing
  it**. `Bun.stdin` (the native reader) freezes identically; a `setInterval`
  keepalive does not revive it; O_NONBLOCK on fd 0 alone does not revive it.

This is a deep Bun-event-loop / fzf-`execute`-pty interaction. The brief's
abort condition ("requires restructuring runTui's loop or abandoning
process.stdin for Bun.stdin") was the operator's gate; the human overrode
it ("we own the render and we control the keys"; "the foxtrot oscar
principle"; "don't compromise on our values") — capture all input
ourselves rather than accept the framework's "can't."

## Decision

Read the TUI's input from a **freshly-opened `/dev/tty`** via an **active
non-blocking poll** (`setInterval` doing `readSync` at ~60Hz), not the
inherited passive `process.stdin.on("data")`. `/dev/tty` is opened fresh
(bypassing fzf's poisoned fd 0); O_NONBLOCK is set on that fd via
`bun:ffi` calling libc `fcntl`; the tick reads it directly — a syscall the
OS services regardless of Bun's event-loop idle state. Raw mode (termios,
device-wide) is still set on fd 0 via `process.stdin.setRawMode`. The
`runTui` loop itself (`onKey` → update → `paint` → `await done`) is
unchanged — only the input source swaps.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| `process.stdin.on("data")` (status quo) | The freeze — the gate itself. Passive delivery stops under a drained terminal under fzf `execute`. |
| `Bun.stdin` (native reader) | Freezes identically to `process.stdin` under drain. Named in the brief's abort trigger. |
| fd-0 active poll (readSync on fd 0) | Receives under drain (fixes the freeze) **but** regresses the default spawn-per-round loop: touching fd 0's fcntl flags (even when restored) leaves the next in-process fzf unable to render its picker (round-2 hang). |
| Bun Worker doing a blocking `readSync(0)` | Receives under drain, intra-process `postMessage` is not the brief's "IPC" (inter-process) — **but** Bun 1.4.0 `--compile` does not bundle `new Worker(new URL(...))`; only an on-disk absolute path spawns, which is unshippable for a single binary. |
| `O_NONBLOCK` on fd 0 + passive listener | 0/6 — the flag alone does not revive Bun's passive delivery; the active poll is what bypasses it. |
| `bun:ffi` fcntl on fd 0 (no /dev/tty) | Works under `--compile`, but inherits the fd-0 round-2 regression of the fd-0 poll. |

## Consequences

**Original consequences (pre-revert, retained as record):**

**What became easier:**
- The fzf-owns-the-loop spike works: input unfreezes, cursor is preserved
  on resume, and the spillover symptom (leaked keystrokes filtering fzf's
  query) is gone as a consequence — the tick captures every keystroke.
- The default spawn-per-round loop is untouched (no regression): opening
  `/dev/tty` fresh leaves fd 0's fcntl flags alone, so the next fzf is
  undisturbed.

**What became harder:**
- A `bun:ffi` + libc dependency for the input path (guarded: falls back to
  the passive listener when ffi/libc or `/dev/tty` is unavailable — the
  non-fzf path still works there).
- A ~60Hz polling tick during the TUI session (cheap — one `readSync`
  returning EAGAIN when idle; negligible CPU).

**Constraints this imposes:**
- The active reader is the right discipline for any okuda run as a
  subprocess of a tool that manipulates the tty (fzf `execute`, and
  likely others). The passive listener remains the fallback for the
  in-process / normal-terminal path.

## Revert (2026-08-30)

The fix was reverted: `runTui` restores the passive
`process.stdin.on("data")` listener and the `bun:ffi` / `/dev/tty`
active-poll reader is removed. Reason: the reader ran unconditionally in
*every* `okuda file --tui` session, paying a `dlopen` of libc and a
perpetual 60Hz poll for a feature gated behind `GLOAM_SPIKE_FZF_OWNS=1`
that nobody used by default — cost and benefit on opposite paths. The
fzf-owns-the-loop spike was reverted in the same pass. The findings above
remain valid; the decision is *aborted*, not *wrong*. A clean minimal repro
for the Bun passive-stdin freeze is the precondition for any future revisit
— record it here, not as a vague intention.

## Related
- Brief: `briefs/2026-08-29-brief-fzf-owns-the-loop.md`
- Task: td-7bce5e (root-cause + fix), cascading from td-99667d (gate-1 spike)
- ADR-016 (gloam launcher promotion — the spike's parent epic, td-05c154)
