---
type: Brief
callsign: BRF-SSH-SERVED-2
---

# Brief: SSH-served portal — the ADR-013 Option-2 gate probe

**Created:** 2026-08-28 (rewritten from the first draft: re-cast as the gate probe; the embedded-daemon approach re-adjudicated against ADR-013)
**Status:** parked — gate not yet fired

## What

Nothing, yet. This brief names the consumer that would reopen the SSH serving
shape's Option 2 (an embedded `ssh2` daemon with per-reader identity — e.g.
GitHub-key auth for colleagues) and records what must be true before any of it
builds.

## Why

ADR-013 adopted Option 1 (OpenSSH ForceCommand) and explicitly deferred Option
2 behind gates: *"one doc per destination is painful," or "per-reader identity
/ connect-time logging is needed."* The first draft of this brief re-proposed
Option 2 plus a fixed 3-second polling engine without naming that decision —
the palimpsest protocol exists to stop exactly that. The 3-second cadence it
cited exists nowhere in `src/`, and ADR-013 FO'd frame clocks outright: the
metric is *latency from meaningful change to screen*, zero when nothing
changed.

## The gate (falsifiable)

Option 2 is earned when a named consumer is **observed, not projected**: a
real colleague, a real key, connect-time identity in a real log — or
Match-block ergonomics genuinely breaking on a real corpus. Until then,
nothing builds.

## What changes when the gate fires

- A new ADR supersedes ADR-013's deferral through the front door — no quiet
  rebuild of Option 2.
- Transport: embedded `ssh2` daemon, PTY → gloam browser loop; window-change
  rides the landed SIGWINCH reflow path; no shell, no writes (non-goals
  survive from the first draft).
- Refresh: content-gated `fs.watch`, not polling. Dynamic dashboards are
  producers writing pre-aggregated markdown; the watch path (brief
  2026-08-26, td-450944) does the rest.
- Navigation: numeric jump + callsigns per the index-and-jump and
  silo-mnemonics briefs.

## Acceptance criteria

- Parked: none active. The gate firing *is* the acceptance criterion.

## Out of scope

- Everything, while parked.
