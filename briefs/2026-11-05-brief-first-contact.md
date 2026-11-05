---
type: Brief
callsign: BRF-FIRST-CONTACT
date: 2026-11-05
---

# Brief: First contact — the check log names its gate, and the board stops lying

**Created:** 2026-11-05
**Status:** Open

## Lineage

Written from a fresh session's own transcript, 2026-11-05: a newly-loaded
context reports what it actually tripped on, which is the one reading the silo
cannot take of itself. `ADR-DOCS-DIRECT-060`'s four silent failures are what
`just orient` answers; these are four more, found by walking in.

## The three findings

**1. `just check` cannot name its gate.** `justfile:128` is one 860-character
line joining 23 gates with `&&`. A failure reports `error: recipe check failed on
line 128` — the least informative line in the run — and the reader walks
backwards to find which of 23 gates spoke. The gates themselves are
well-behaved: each names itself in its own output. The recipe does not.

**2. A passing check is 127 lines, of which ~100 carry no verdict.** Two
species live in that noise and only one is welcome. The **plot** — a table whose
job is to be read (the seam census, the contrast rungs) — is worth its lines. The
**wallpaper** is not: `19 doc(s) declare NO DATE`, `113 prefixed name(s)
uncorroborated`, four drift lines, one stale baseline note. Each is printed
faithfully on every run, acted on by nobody, in a lint that fails only on
violation. This is the same class as the 32 stale citation-baseline entries
pruned the same day (`DBF-ALLOWANCE-REFERENT`): a correct note, printed
reliably, read as furniture. Each is either a ticket, a baseline that fails when
it grows, or it is deleted. There is no third state, and "it is only advice" is
the third state wearing a hat.

**3. The ready list serves deferred work as startable.** `td usage
--new-session` printed a deferred P1 under READY TO START, and only its `td
context` said so (deferred until 2026-12-01). The machine view is already honest — `td list
--json` omits deferred rows (td 0.69.0) — so the defect is the *prose* view, and
the silo's remedy is the house one: a derived view over the honest source, never
a second store.

## Scope

**In:** `scripts/gates.sh` (new, the named gate table); the `--gate` render in
the six scripts that print a reading in gate mode (`ref-census`, `seams`,
`idea-lint`, `amp-check`, `contrast`, `date-lint`) and `reg-sync`'s check mode;
`scripts/next.ts` (new, the board view); the `justfile` facade; the stale
elision entry; one line in `playbooks/td-playbook.md` recording the `td usage`
trap.

**Out:** the global lexicon (`ADR-GLOBAL-TERM-086`, a separate sitting); the
playbooks' missing dates and the 113 uncorroborated names — those become
tickets, not guesses, because a date you did not verify is a claim, and the
house does not write claims it cannot pay for.

## The contract this settles

**`--gate` is the verdict render.** Passing, a gate prints one line and names
itself. Failing, it prints the findings. The reading — the table, the census,
the clusters — is a *deliberate* invocation (`just seams`, `just ideas`, `just
reg-list`), which is the "bounded doors, cheap return" shape: the gate is a
closed set of verdicts and the plot is one keystroke away, deliberately entered
rather than scrolled past. `ADR-GATE-TWO-RENDERS-085`.

## Acceptance

1. `just check` on a clean tree prints one line per gate, each naming its gate,
   and ends with the runner's summary. No advisory wallpaper.
2. A gate failure names the gate, its position, and how to re-run it alone.
3. `just gate <name>` runs exactly one gate.
4. `just next` lists the ready queue from `td list --json`, never mentions a
   deferred task as startable, and says how many rows it is not showing.
5. `just check` green; the elision baseline has no stale entry.
