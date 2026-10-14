---
type: Debrief
callsign: DBF-LAUNCHER-LOOP
date: 2026-08-27
tags: [launcher, gloam, runTui, control-flow, debugging, harness-confound, drift, adr-016]
agent: pi (ses_b0d27c)
environment: local
td: td-17e01c
branch: feat/gloam-launcher
briefs: [BRF-GLOAM-LAUNCHER]
---

# Debrief: the launcher loop — runTui blocks, and the three bugs that were one

## Context

ADR-016 promoted the `gloam` browse→read→browse loop from a `~/.zshrc`
shell function into the binary (`src/launcher.ts`). The handoff
(`docs/2026-08-27-session-handoff-launcher-stamp.md`) named the new
session's first job: debug three launcher bugs reported after the
promotion — (1) ENTER on an fzf selection behaves weirdly, (2) fzf
scroll weirdness, (3) `q` from okuda crashes to the terminal instead of
returning to the picker. The handoff further hypothesised three
distinct root causes (pickFile spawn wiring, alt-scroll/`--no-mouse`
interaction, and `runTui` calling `process.exit(0)` in `cleanup()`).

The debrief records: the three bugs were one bug; the empirical path to
that finding (and a methodological error worth naming); and a separate
drift discovery that closed a loop ADR-016 had predicted but not
finished.

## Accomplishments

- **Root-caused the three launcher bugs as a single control-flow fault.**
  `runTui` is `async` but it never awaited anything that resolves on
  quit — it set up the stdin listener, called `paint()`, and returned
  immediately. In the standalone `okuda --tui <file>` path this worked
  by accident: the stdin `data` listener kept the event loop alive, and
  `q` → `cleanup()` → `process.exit(0)` ended the process before the
  instant-return mattered. In the launcher loop, `await runTui(...)`
  resolved the moment `paint()` returned, so the `for(;;)` loop spawned
  a *second* fzf over the reader's still-live alt-screen — producing
  all three reported symptoms (ENTER weirdness = second picker stealing
  the keystroke; scroll weirdness = two fzf instances fighting one tty;
  q-crashes-to-terminal = the second picker, or the exit, winning). The
  handoff's three hypothesised causes were three *symptoms* of one
  race.
- **Fixed the fault in one commit (`566c4bf`).** `runTui` now blocks on
  a `done` promise resolved by `cleanup()`. `cleanup()` restores the
  terminal (raw-mode off, cursor on, alt-screen exit) and **returns**
  rather than `process.exit(0)`, so the launcher's loop resumes the
  picker. `cleanup()` also removes the `SIGWINCH`/`SIGINT`/`SIGTERM`
  listeners so they don't fire across rounds. External `SIGINT`/`SIGTERM`
  (a `kill` from outside) still hard-exit via `process.exit(130)` — a
  signal is an interrupt, not a return-to-picker, but cleanup runs first
  so the terminal is never left in alt-screen. The launcher's loop is
  wrapped in `try/finally` to disable alt-scroll (`?1007l`) on exit —
  it was enabled on entry and leaked into the user's shell.
- **Verified end-to-end in a real terminal (tmux).** `pick → read → q →
  picker resumes (Esc clears the reseeded query; a second Esc exits) →
  ==EXIT=0==`. 184/184 tests pass; `just check` clean.
- **Closed the drift ADR-016 predicted but had not finished.** After
  the fix, the operator reported the fzf header still read
  `enter: read · esc: done` — missing the `ctrl-w: clear word` bind.
  `which gloam` revealed the cause: `gloam` was still a **shell
  function** in `~/.zshrc`, shadowing the symlinked binary on PATH.
  The function carried the stale header (predating the key-grammar
  parity work, `e041f4f`). The binary was correct all along — the
  shell function was winning resolution order. Removed the function
  from `~/.zshrc`, left a two-line tombstone pointing at ADR-016.
  This is the drift ADR-016 explicitly names ("a shell function the
  user maintains cannot guarantee the binds — it drifts; the deployed
  function lagged the playbook by one commit") — the retirement
  happened in the binary but had not been propagated back to the
  shell. Now it has.

## The methodological error — and the lesson

The fix itself was quick. The debugging path was not, and the
length is the lesson.

After confirming `pickFile` worked in isolation, I drove the full
launcher loop under `expect` + `script` (a PTY automation harness).
The single-round drive worked. The two-round drive (select doc →
read → quit → select again) **failed**: round-2 fzf appeared to
receive no input — Esc did not cancel it. I spent a long bisection
chasing this as a real bug: fd-0 watcher stealing bytes, `pause()`
vs `destroy()`, the `script` wrapper, output-volume/flush timing,
signal handlers, the promise-resolved-in-callback pattern, raw vs
cooked mode. Every hypothesis reproduced the "failure" or ruled
itself out in turn, but none was the cause.

The cause was the **harness**. `expect`/`script` PTY automation does
not drain or deliver input the way a real terminal does after a
large alt-screen paint — and the failure did not reproduce under
tmux (a real terminal). I should have reached for tmux *first*, the
moment the two-round drive behaved differently from the single-round
drive, and treated the harness as a suspect rather than as
ground truth. Hume's Razor: the harness was the confound. The
bisection was rigorous about everything except the one assumption
it stood on.

**The rule going forward:** when an interactive failure repros under
a PTY harness but not under a real terminal, the harness is the bug
until proven otherwise. Reach for tmux (or a real terminal) before
the bisection, not after it. A harness that cannot faithfully
reproduce a two-round loop is not a harness you can bisect against
— it will manufacture ghosts.

## What was deliberately not done

- **No new tests for the loop.** The fix is a control-flow change in
  an async I/O function that requires a TTY; `bun test` cannot drive
  it without the same PTY harness that just proved unreliable. The
  contract is pinned by the existing `launcher.test.ts` binds test
  and by the manual tmux verification. A future brief for a PTY-based
  integration test is the right home for loop coverage, not a test
  bolted on now.
- **No `--version` work.** The operator raised versioning the binary;
  the thought was prompted by the stale-binary suspicion (which
  turned out to be the stale shell function, not a versioning gap).
  Parked — the problem that prompted the thought is solved. A version
  brief can wait until the tree is clean and there's a real need.
- **No commit of the loose tree.** 15 files pre-existed this session
  (the block terminator in `src/render.ts` + tests, plus docs/briefs/
  decisions). They are the operator's in-progress work from prior
  sessions; I inventoried them in three groups but did not commit
  them — I won't vouch for work I didn't do. The operator decides
  when and how they ship.

## Handoff

- `td-17e01c` — review requested; needs an independent reviewer to
  `td approve`. The fix is committed (`566c4bf`) and pushed to
  `origin/feat/gloam-launcher`.
- The loose tree (block terminator + docs/briefs/decisions) is the
  next triage decision, not part of this debrief's scope.

## References

- Commit: `566c4bf` (fix), `2e7d4d5` (the launcher that had the bug)
- ADR-016: `decisions/016-argv0-launcher-dispatch.md`
- Brief: `briefs/2026-08-26-brief-gloam-launcher-promotion.md`
- Handoff: `docs/2026-08-27-session-handoff-launcher-stamp.md`
- td: `td-17e01c`
