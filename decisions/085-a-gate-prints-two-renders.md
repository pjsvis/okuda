---
type: ADR
callsign: ADR-GATE-TWO-RENDERS-085
date: 2026-11-05
---

# Decision: A gate prints its verdict; the reading is a deliberate invocation

**Date:** 2026-11-05
**Status:** Accepted
**Enforced by:** `scripts/gates.sh` (the named table `just check` runs) and the `--gate` branch of each gate that also prints a reading

## Context

A clean `just check` printed 127 lines, of which ~100 carried no verdict: the
seam census table, the idea-ledger clusters, the branch board, the contrast
rungs, four staleness lines, and three advisory counts that nothing acts on.
Measured 2026-11-05 from a fresh session's own transcript, where the noise is
not habit but an obstacle — the first thing a new context must read.

The two species in that output pull in opposite directions, which is why they
had never been separated. A **plot** is a table whose job is to be read: the
seam census exists to be looked at, and a verdict line would throw away the
instrument. **Wallpaper** is a line printed faithfully every run that nobody
acts on: `113 prefixed name(s) uncorroborated` in a lint that fails only on
violation. Wallpaper is not wrong; it is unactioned, which in a surface read
twice a day is indistinguishable from noise and teaches the reader to skim — the
exact decay that let 32 stale citation-baseline entries print `can shrink` for
weeks (`DBF-ALLOWANCE-REFERENT`).

Meanwhile the one line that mattered on failure was the worst in the run:
`justfile:128` joined 23 gates with `&&`, so a failure said *recipe check failed
on line 128* and named no gate. Attribution existed in every gate's output and
was destroyed by the recipe that ran them.

## Decision

**`--gate` is the verdict render: one line on pass, findings on fail. The
reading is a separate, deliberate invocation. And the runner names the gate.**

- **A passing gate is one line, and it names itself.** `seams: OK — every
  crossing names its rung`. The gate's identity is in its output because the
  runner no longer prints progress: a passing run stays attributable line by
  line, and no line is spent announcing what the next line says.
- **A failing gate prints everything.** Suppressing the reading is a pass-mode
  rule only; a failure must arrive with its evidence.
- **The reading keeps an address.** `just seams`, `just ideas`, `just reg-list`,
  `just census` — bounded doors, one keystroke, cheap return. The gate is a
  closed set of verdicts; the plot is entered deliberately rather than scrolled
  past. This is the difference between a **constructed wall** and a **ventilator**
  applied to output: the same bytes, but with a door.
- **Wallpaper gets an owner, and there are four.** A standing line is a ticket
  (it is work), a baseline that fails when it grows (it is a debt with a
  ceiling), deleted (it was never true enough to keep), or **a reading moved
  behind its own address** (`just amp` prints the staleness calendar; the check
  no longer does). It is never "advice" left printing on every run: a note that
  no single action can close is a note that has not been classified.
- **The runner names the failure.** `scripts/gates.sh` runs a named table,
  fail-fast, and on failure prints the gate's name, its position in the table,
  and the single command that re-runs it. A gate is also runnable alone
  (`just gate <name>`), which the `&&` line could not do at all.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Split `check` into 23 just recipes | It fixes attribution natively, but a reader of the facade then sees 23 gate recipes beside the real verbs, and per-gate progress (`12/23`) is not available — the runner is one file with the table in it, which is also the only place the order needs to live |
| Leave the tables and pipe `check` through a filter | A filter over another program's prose is a lint on text: it breaks silently the day a gate rewords its output, and it teaches the reader that the gate's output is not to be trusted as displayed |
| Keep the readings and shorten them | Shortening a plot destroys the instrument it is; the seam census is worth 50 lines when you asked for it and worth none when you did not. The flag is the honest lever, not the length |
| Suppress output on pass entirely (silent gates) | Then a gate that silently stopped running is indistinguishable from a gate that passed — the failure `signature-check` and `facade-lint` both go out of their way to avoid (`exit 2`, not a verdict) |

## Consequences

**What became easier:** a failure names its gate and its re-run command; a clean
run is readable at a glance and a real finding cannot hide in familiarity; the
plot is available on purpose rather than by scrolling.

**What became harder:** two code paths per gate that prints a reading, and the
discipline of deciding, for each new advisory line, which of the three homes it
has. That decision was previously deferred indefinitely, which is why it
accumulated.

**Constraints this imposes:** a new gate takes `--gate` and prints one line on
pass. A new *reading* gets its own invocation, never a `--gate` branch that also
prints it. An advisory that cannot yet be closed becomes a ticket, so the check
log never carries work with no owner.

## Related

- Brief: `BRF-FIRST-CONTACT`
- Debrief: `DBF-ALLOWANCE-REFERENT` (the same decay, in the baselines)
- ADR: `ADR-DERIVED-AMP-TABLE-058` (the derived view, deliberately addressed)
