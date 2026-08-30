---
type: Debrief
callsign: DBR-FZF-OWNS-LOOP-ABORT
---

# Debrief: the fzf-owns-the-loop away mission (aborted)

**Date:** 2026-08-30
**Branch:** feat/gloam-launcher
**Epic:** td-05c154 (fzf owns the loop)
**Related:** ADR-023 (Aborted), `briefs/2026-08-29-brief-fzf-owns-the-loop.md` (Aborted)

## What we tried

A dogfood nit — the gloam picker resets its cursor to the top file after
reading — led to an experiment: let fzf *own* the browse → read → browse
loop via its `execute` action, so fzf suspends around the reader and
resumes the same process (cursor + query + highlight surviving for free).
The brief was shaped as a gated experiment with an explicit abort path.
A spike landed behind `GLOAM_SPIKE_FZF_OWNS=1` (commit `40b5365`).

## What we found

The brief's gate 1 ("FUT-free return edge") passed cleanly at the byte
level — fzf re-enters the alt screen the instant the reader exits, zero
primary-screen flash. But the manual test surfaced the *real* gate: under
fzf `execute`, okuda's reader renders but **all input is dead**.
`process.stdin.on("data")` is attached, the event loop is alive, `paint()`
completes — but `data` events never fire once the host drains okuda's
paint write and the loop goes idle. A pty-driven investigation (~30
probes, 9 isolated replications) confirmed this is a deep Bun-event-loop /
fzf-`execute`-pty interaction, specific to okuda's real path, not a clean
minimal repro. The "cursor snaps to top" symptom was a *spillover* of the
same freeze — queued keystrokes fed fzf's query on resume.

The fix (commit `7298037`) was a `bun:ffi` `dlopen` of libc, `fcntl`
O_NONBLOCK on a fresh `/dev/tty`, and a 60Hz `setInterval` doing
`readSync` — a working, verified fix that bypassed both fzf's poisoned fd
0 and Bun's broken passive delivery. ADR-023 records the diagnosis and
the alternatives analysis.

## Why we aborted

The fix was global; the feature was gated. `startKeyReader(onKey)` ran
unconditionally in `runTui`, so *every* `okuda file --tui` session
dlopens libc and runs a perpetual 60Hz poll — paying for a feature
nobody uses by default (the spike was behind `GLOAM_SPIKE_FZF_OWNS=1`,
the default launcher still spawn-per-round). Cost and benefit landed on
opposite paths. The 60Hz poll also keeps the event loop perpetually
non-idle — the mechanism that defeats the freeze — which may mask other
Bun passive-delivery quirks we'd otherwise notice. The IO path that was
the actual bug and the actual fix had zero test coverage.

The brief's own abort trigger ("requires restructuring runTui's loop or
abandoning process.stdin for Bun.stdin") was the operator's gate; it was
overridden at the time ("we own the keys", "foxtrot oscar", "don't
compromise on our values"). The retrospective's job was to name that
honestly: principle is ideology-shaped, and the systems view says we
swapped a minor incentive problem (spawn-per-round throws state away) for
a new maintenance surface (active polling + libc sonames + an untested
ffi path). The diagnosis was excellent; the fix was heavier than the
disease it currently treats.

## What we kept

- **ADR-023** — retained, status flipped to *Aborted*. The diagnosis and
  the alternatives table are knowledge worth not re-deriving.
- **The brief** — retained, status flipped to *Aborted*. The analysis
  ("spawn-per-round structurally cannot preserve fzf's cursor; only
  fzf-owns-the-loop can") is correct and stands.
- **The Bun finding** — recorded in ADR-023 as a known interaction, clean
  repro pending. Not a vague intention to file a report; a documented
  precondition for any future revisit.

## What we reverted

Passive stdin restored (`process.stdin.on("data")`), the `/dev/tty`
active-poll reader removed (~70 lines from `src/tui.ts`), the
fzf-owns-the-loop spike removed (~57 lines from `src/launcher.ts` + 3
tests). The default spawn-per-round loop is the only path again. Cursor
resets after reading — the original minor nit, accepted.

## What's left (not part of this tidy)

The resize/rerender race in `tui.ts` (stale-width capture across awaits,
no SIGWINCH debounce, concurrent rerenders) was found while looking and
is a real bug in the *default* path. Deferred — keeping the abort a
clean single-concern change. Decide separately whether it's worth a brief.

## The shape of a closed experiment

An abort with a recorded decision and a retained logbook is a closed
loop, not a failure. The away team carried findings home; the machinery
stayed on the away planet. That's what experiments are.