---
type: Brief
callsign: BRF-GLOAM-OWNS-LOOP
date: 2026-09-19
---

# Brief: GLoam owns the search TUI — the fzf dependency retires

**Created:** 2026-09-19
**Status:** Open
**TD:** none — no epic created. The direction has no settled scope, and a task list written now would be an invented plan. Scope it, then `td epic create`.
**Lineage:** the reader, 2026-09-19, verbatim: *"note we intend to remove the fzf dependency and build our own search TUI in GLoam"* — said the morning after reading `github.com/jarun/nnn`, a picker that owns its own screen and hands off to `$NNN_OPENER` (`docs/2026-09-18-nnn-the-sibling-outside-the-boundary.md`).
**Extends:** `BRF-FZF-OWNS-LOOP` (Aborted 2026-08-30). That brief tried to keep the picker's cursor by *rearranging* the fzf boundary; this one deletes the boundary, and the cursor problem with it.

## Objective

Remove `fzf` as a runtime dependency and make GLoam own the search TUI, so the entry stream is consumed **in-process** rather than piped to a picker that spawns a process on every keystroke.

## Why — measured, not asserted

`tmp/reload-cost-probe.py`, 2026-09-19, minimum of 20 runs against the compiled binary:

| Stage | Cost |
|---|---|
| `rg --files --type md` (335 files) | **8.5 ms** |
| `./okuda --entries <query>` (320 rows) | **40.3 ms** |
| everything that is not the scan | **31.8 ms — 79% of the keystroke** |

The search is cheap. The **process boundary** is what costs. 79% of a keystroke is process start, the ranked merge and the pipe, and only removing the boundary removes it. `ADR-LIVE-SEARCH-030` recorded the same shape at a different magnitude — *"~100ms per keystroke (bun spawn + rg over ~200 files)"* — and its attribution was right; the corpus has gone 200 → 335 files and the number has moved. The **share** is the part that does not move, because it is structural.

Three consequences follow, and each is already in the record:

- **The cursor problem retires for free.** `BRF-FZF-OWNS-LOOP` died because *"the cursor lives in fzf's process state, and we throw that state away every round"* — and spawn-per-round structurally cannot fix it. In-process, there is no state to preserve.
- **The self-invocation seam retires.** `ADR-LIVE-SEARCH-030` pins `execPath`/`argv[1]` because *"it is exactly the seam where a smoke-vs-operator divergence hid before."* No subprocess, no seam.
- **A runtime dependency retires.** `DEPENDENCIES.md:14`.

## What this reverses, and what it leaves alone

The house habit is to read the affected records for contradiction, not only for gaps.

- **Reverses `BRF-FZF-OWNS-LOOP`'s non-goal** — *"Not reinventing fzf. fzf stays a soft runtime dep; we use its `execute` bind, not an in-process matcher."* That brief is Aborted, so it is not a live instruction, but it is the recorded reasoning, and the reversal is deliberate.
- **Reverses `ADR-LIVE-SEARCH-030` decision 1** — *"`--bind=change:reload(<self> --entries {q})`"* — and its dispatch diagram. **Decisions 2–5 stand untouched, and they are the substance:** plain `gloam` is the live search with no mode split; `--entries <query>` is the headless printer; bare arguments resolve by existence-check, then callsign, then query; `-g` survives as a seed alias.
- **Leaves `ADR-016` alone.** `gloam` launches, `okuda <file>` reads. The two-names contract is untouched.
- **Leaves the cue seam alone.** `BRF-AUDIO-DISCOVERY` owns it, and this brief does not fork it.

## The finding — ADR-023's abort reason inverts

`ADR-TTY-ACTIVE-INPUT-023` (Aborted 2026-08-30) built a `/dev/tty` active-poll input reader and reverted it on a cost/benefit argument: *"the reader ran unconditionally in every `okuda file --tui` session, paying a `dlopen` of libc and a perpetual 60Hz poll for a feature gated behind `GLOAM_SPIKE_FZF_OWNS=1` that nobody used by default — cost and benefit on opposite paths."*

Under this intent the two paths are the same path. The search TUI is the **default entry**, so the input reader is load-bearing for the primary feature and the cost lands where the benefit is. The abort reason does not survive.

Two further points, and the second is a question rather than a claim:

- **The freeze it worked around was an fzf-`execute`-pty interaction** — ADR-023's own words: *"a deep Bun-event-loop / fzf-`execute`-pty interaction."* Removing fzf removes the trigger, so the reader may come out simpler than ADR-023's version.
- **That is not established.** ADR-023's revert note sets the precondition: *"A clean minimal repro for the Bun passive-stdin freeze is the precondition for any future revisit — record it here, not as a vague intention."* No repro exists. Until one does, this brief cannot say whether the new TUI needs an active reader at all, or keeps passive stdin.

## The unlanded brief this lands on top of

`td-a7e532` (`BRF-SEARCH-SURFACE`, open, six tasks) cites its brief at `briefs/2026-09-14-brief-search-surface.md`. **That file does not exist.** The brief exists only as `tmp/_search-surface-brief.md` — gitignored, therefore not in the silo, therefore by the silo principle not existing at all.

Two consequences, one of them urgent:

- **A live td epic points at a phantom referent.** The epic's description is the only place the path is written down, and it is wrong.
- **The unlanded brief's precondition dies with fzf** — *"`fzf --version` reports 0.73.1 or later — `{*f}` is the count's only source."* Its `{*f}` count mechanism, and its note that *"the vector actuators … will not be the digit space, because fzf's query box owns the digits"*, are both fzf-shaped. Its state machine (`SHELF` / `DIVE` / `READING`) and its invariant audit are **not** fzf-shaped, and become more valuable rather than less: they describe the screen GLoam is about to own.

**Landing `BRF-SEARCH-SURFACE` is not this brief's work.** It is named here so the epic's dangling pointer is recorded in the silo and not only in a task description.

## Scope

**In:**

- GLoam owns the search TUI — the query box, the row list, the cursor, the key map.
- The entry stream consumed **in-process**: `rankedShortlistEntries` called directly, not reached through `--entries` over a pipe.
- The input path decided on evidence: passive stdin, or an active reader, whichever the repro supports.
- `fzf` retired from `DEPENDENCIES.md`, `playbooks/gloam-launcher-playbook.md`, and the launcher's runtime gate.
- The `--entries` contract **preserved** as a headless printer. It is the seam; only its consumer changes.

**Out:**

- The cue seam (`BRF-AUDIO-DISCOVERY`); the row seam and the state machine (`BRF-SEARCH-SURFACE`, unlanded).
- `rg`. It stays: 8.5 ms over 335 files is not the problem.
- The reader's TUI, its key grammar, its alt-screen ownership.
- Any replacement dependency for fzf.
- The FUT (`BRF-LAUNCHER-FUT`). One owner of the screen may settle it; deciding that here is guessing.

## Preconditions

- [x] `--entries <query>` runs with no TTY and prints one row per line. **Verified 2026-09-19: `./okuda --entries silcrow` → 320 rows, piped.**
- [x] The reload's cost is measured and split. **Verified 2026-09-19: 40.3 ms total, 8.5 ms scan (`tmp/reload-cost-probe.py`).**
- [ ] **The Bun passive-stdin freeze is reproduced in isolation, or shown to be fzf-`execute`-specific.** ADR-023's own precondition; no repro exists. This is the gate.
- [ ] The `fzf` runtime gate in `src/launcher.ts` is located and its removal scoped. Not yet read.
- [ ] `bun test` is green. Not yet run.

## Work Plan

1. [ ] **Probe the freeze.** Smallest repro: a Bun TUI reading `process.stdin` as a subprocess of a tty-manipulating parent, against the same program run directly. One question — does the freeze need fzf, or only a drained terminal? **Everything downstream is gated on the answer.**
2. [ ] **Record the answer** against `ADR-TTY-ACTIVE-INPUT-023` — the repro it asks for, as a successor note rather than an edit to the aborted decision.
3. [ ] **The input path**, chosen from step 1: passive stdin if the freeze needs fzf, the active reader if it does not.
4. [ ] **The TUI** — query box, row list, cursor, key map, entry stream in-process.
5. [ ] **Retire fzf** — the launcher gate, `DEPENDENCIES.md`, `playbooks/gloam-launcher-playbook.md`.
6. [ ] **Amend `ADR-LIVE-SEARCH-030`** — decision 1 and the diagram. Decisions 2–5 are untouched.
7. [ ] **Dogfood** by hand, against the fzf path it replaces.
8. [ ] **Debrief** — experimental, so it debriefs shipped *or* aborted. An abort with a recorded gate-failure is a closed brief, not a failed one.

Steps 3–5 run only if step 1 returns a shape we can build on.

## Acceptance Criteria

- `which fzf` absent is not an error path: `gloam` starts and searches.
- A keystroke's entry-stream cost excludes process start — measured in-process against the 8.5 ms scan, with the 31.8 ms remainder accounted for.
- `okuda --entries <query>` output is byte-identical to today. The seam is unchanged; only its consumer is.
- The cursor survives read → Esc → return, with no `--query` reseed and no state carried between rounds.
- `ADR-LIVE-SEARCH-030`'s mode-boundary failures do not return: no flag gates the search, and the screen always says which state it is in.
- `DEPENDENCIES.md` carries no `fzf` row.
- `just check` passes and `bun test` is green.

## Notes

- **The dependency rows are stale, which is evidence for the brief rather than against it.** `DEPENDENCIES.md:14-15` records `fzf` 0.73.1 and `rg` 15.1.0. Live, 2026-09-19: **fzf 0.74.4**, **rg 15.2.0**. A dependency table nobody re-reads is a table that cannot notice a dependency has become unnecessary. Correcting the versions is separate work and is not done here.
- **The corpus figures in the older records have moved.** ADR-030's *"~200 files"*; the unlanded brief's *"264 rows"* on `silcrow`. Today: **335 tracked markdown files**, **320 rows**. Quote neither forward.
- **Why the callsign.** `BRF-FZF-OWNS-LOOP` named the picker as the loop's owner. This brief moves ownership one level up, to the process that already owns the entry stream — so the name is the predecessor's with the owner changed, and the lineage is legible from the callsign alone.
- **No branch, no commit, no epic, 2026-09-19.** The tree already carried three uncommitted paths from the previous session (`system.md` and two `docs/` notes), and `git checkout -b` would have carried them onto a branch named for this work — the trap `okuda-land-brief` names. So nothing was committed and no epic was created. `**TD:**` stays empty until the reader scopes the work.
- **This brief is the record of a direction, not of a plan.** Its one hard finding is the inversion of ADR-023's abort reason; its one hard defect is the dangling epic pointer. Both are worth more than the work plan, which is deliberately thin because the scope is not settled.

## Related

- `docs/2026-09-18-nnn-the-sibling-outside-the-boundary.md` — the reading that prompted it
- `briefs/2026-08-29-brief-fzf-owns-the-loop.md` — the predecessor, Aborted; its non-goal is the one reversed here
- `decisions/023-tty-active-input-reader.md` — Aborted; the mechanism this revives, and the repro it demands
- `decisions/030-live-search-picker.md` — decision 1 and the diagram amend; decisions 2–5 stand
- `decisions/016-argv0-launcher-dispatch.md` — untouched
- `DEPENDENCIES.md` — the `fzf` row retires
- `playbooks/gloam-launcher-playbook.md` — the procedure that amends with the change
- `tmp/_search-surface-brief.md` — **not in the silo.** The unlanded `BRF-SEARCH-SURFACE`, cited by `td-a7e532` at a path that does not exist
- `tmp/reload-cost-probe.py` — the measurement
