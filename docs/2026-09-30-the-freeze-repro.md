---
date: 2026-09-30
kind: design note — a measured repro for a freeze the silo has been waiting on, and the two findings of the aborted ADR it does not support
lineage: ADR-TTY-ACTIVE-INPUT-023 (Aborted 2026-08-30), whose revisit precondition is "a clean minimal repro for the Bun passive-stdin freeze — record it here, not as a vague intention"; BRF-GLOAM-OWNS-LOOP, gated on the same condition; and the editor question that made the probe worth running. Tooling traps cited to PLY-GREP, landed the same day by another session.
status: open — the repro exists and runs; the mechanism is not isolated, and no decision is made here
---

# The freeze reproduces with no okuda in it — and the paint write is not the trigger

> ◆ A bare Bun TUI under fzf's `execute` receives **0** `data` events while its timers
> fire. Remove fzf and the same program receives keys. Remove the program's terminal
> writes entirely and it still freezes. The precondition
> `ADR-TTY-ACTIVE-INPUT-023` asked for now has a repro — and two of that ADR's findings
> do not survive it.

## What we are deciding

`ADR-TTY-ACTIVE-INPUT-023` (Aborted 2026-08-30) ends with an explicit gate:

> A clean minimal repro for the Bun passive-stdin freeze is the precondition for any
> future revisit — record it here, not as a vague intention.

Nothing has revisited it since, because nothing had the repro. Two things now want to
know whether it exists:

- **`BRF-GLOAM-OWNS-LOOP`** — gloam owning the search TUI in-process. Its stated gate is
  this repro.
- **The editor question** — whether a from-scratch TUI editor is blocked by the same
  freeze. The answer turned out to be *no*, and it is why the probe was run at all.

This note records the repro and says what it does and does not establish. It does not
reopen ADR-023, and it decides nothing.

## The instrument

`scripts/input-freeze-repro.ts` — a bare Bun TUI: set raw mode, paint once, listen for
`data`, repaint per keystroke, exit on `q` or after a 5 s timeout. No okuda import, no
fzf bind, no `runTui`.

Two rules make it a measurement rather than an impression, and both are load-bearing:

- **Findings go to a file, not the terminal.** Under `execute` the pty's output path is
  exactly what is in doubt, so a result read off the screen cannot be trusted. The probe
  appends to `/tmp/probe-log.txt`; the screen is a convenience.
- **A negative result needs a positive control.** "It did not freeze" is worth nothing
  unless some configuration in the same harness does. Row 2 below is that control. The
  rule is PLY-GREP's, and it is why this note has a table at all.

## How far it reaches

Run under `script -q /dev/null` — a pty that drains — 2026-09-30, bun 1.4.0, fzf 0.74.4:

| Configuration | Paints? | `data` events | timer |
|---|---|---|---|
| standalone, no fzf | per key | **keys arrive** | fired |
| fzf `execute` | per key | **0** | fired |
| fzf `execute`, `PROBE_NOPAINT=1` | **nothing at all** | **0** | fired |

Row 2 is the control: same probe, same harness, keys fed the same way — and the freeze
appears the moment fzf owns the tty. Row 3 then removes every write to the terminal,
stderr included, and the freeze is unchanged.

okuda's own `--tui` was run in the same harness as a second control. It renders, its
footer lands, and `q` exits 0.

## The finding

**The repro exists.** About seventy lines, no okuda code, deterministic across runs.
ADR-023's precondition is met in the sense it asked for: a minimal reproduction anyone
can run.

**Two of ADR-023's findings do not survive it.**

- **"The bug is specific to okuda's real `runTui` path."** It is not. The probe imports
  nothing from `src/` and freezes identically. ADR-023 records nine isolated
  replications that all received keys, and concluded the bug needed okuda's real path;
  this is a tenth replication that receives none. The difference is in the
  **arrangement**, not in okuda.
- **"Once the host drains okuda's paint write, okuda's event loop goes idle with only
  the passive `data` listener pending, and Bun stops servicing it."** Row 3 writes
  nothing — no alt-screen, no prompt, not even the stderr line — and still freezes. The
  drained paint write is therefore **not the trigger** in this arrangement. The
  event-loop-idle story may still be the right shape; the paint write is not what causes
  it here.

**And one thing it does not establish.** Every run used `script` to obtain a pty, so the
arrangement is a **double** pty: `script`'s pty, then fzf, then the probe. This note
cannot separate *"fzf `execute` is the cause"* from *"a double pty under `script` plus
fzf is the cause"*, because there is no way to run fzf `execute` against a real terminal
from here. That is the unexcluded variable, and it is named rather than smoothed over.
**A reproduction with an unexcluded variable is evidence, not proof.**

## The fork

Two readings, and they lead different places:

- **Take the repro as the precondition met.** Record it against ADR-023, unblock
  `BRF-GLOAM-OWNS-LOOP`, and design its input path on the assumption that the freeze is
  an fzf-`execute` arrangement problem with a known workaround — the `/dev/tty` active
  poll ADR-023 built and then reverted. Cheap, and it matches the measured rows.
- **Isolate the variable first.** Run the same probe under fzf `execute` on a real
  terminal, and under a double pty with no fzf. That splits the two hypotheses in two
  runs, and it is the whole difference between *owning a reproduction* and *knowing a
  mechanism*.

## What is not in question

- **A standalone TUI's input path works.** Row 1, with okuda's own `--tui` beside it. A
  from-scratch editor that owns its terminal is not blocked by this freeze, whatever the
  mechanism turns out to be. That was the question that motivated the probe.
- **The freeze is real and reproducible.** It is not a stale report.
- **ADR-023 stays Aborted.** Nothing here reopens its decision. That decision was a
  cost/benefit call about an unconditional reader running in every session, and it is
  untouched by a better repro.

## Where I would land

**Record the repro now, and isolate before revisiting.** The repro is what ADR-023 asked
for, it costs nothing to keep, and it is this note. But **do not reopen ADR-023's
mechanism on it yet**: landing "we have a repro, cause unknown" against an ADR whose
stated cause is now contradicted would leave the record worse off than the repro alone.
The two runs in the fork are cheap and they are the difference between the two readings.

**What would change my mind:** if a real-terminal run of fzf `execute` receives keys,
then `script` is the necessary ingredient and the freeze is an artefact of this harness —
which would make the repro a finding about `script`, not about fzf. That is the outcome
to test for, not to hope against.

## Evidence

- `scripts/input-freeze-repro.ts` — the probe. Standalone:
  `(sleep 1.5; printf 'abcq'; sleep 2) | script -q /dev/null bun scripts/input-freeze-repro.ts`
- the fzf `execute` harness for rows 2 and 3, inlined so it is reproducible:
  `printf 'one\ntwo\n' | fzf --bind "ctrl-e:execute(bun $PWD/scripts/input-freeze-repro.ts)"`,
  driven as `(sleep 1.5; printf '\005'; sleep 2; printf 'abcq'; sleep 8) | script -q /dev/null bash <that>`
- `/tmp/probe-log.txt` — where the probe appends; scratch, not in the silo
- `tmp/standalone-input-probe.ts` — the original scratch probe this script came from

## Related

- `decisions/023-tty-active-input-reader.md` — Aborted; the precondition this meets, and
  the two findings it contradicts
- `briefs/2026-09-19-brief-gloam-owns-the-loop.md` — gated on the same repro
- `playbooks/grep-playbook.md` — PLY-GREP; the positive-control rule, and the BSD traps
  that manufactured findings on the way here
- `docs/2026-09-30-the-editor-as-a-separate-project.md` — the question that prompted it
