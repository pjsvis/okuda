---
type: Brief
callsign: BRF-CITTY-CLI
---

# Brief: the CLI contract — adopting citty for the okuda/gloam surface

**Date:** 2026-08-31
**Status:** Ready — decision made pending the three gates
**Branch:** feat/gloam-launcher
**Context:** the CLI surface has reached hand-rolling's cost curve.
`src/cli.ts` now carries the argv[0] dispatch (ADR-016), the TTY gates,
`CALLSIGN_SHAPE`, and a growing flag set (`-g`, `--mci`, `--mce`,
`--brightness` pending) — each new flag is manual parsing plus manual
help plus manual drift risk. The surface is also the silo's *contract*:
it is how agents and scripts address everything. A growing contract
without generated documentation is the keymap problem wearing a suit.

## The stance this brief must not violate

**The binary is stateless — params in, bytes or actuation out.** No
config files, no session state, no polling. citty parses; it does not
state. The stance is recorded in the seams paper's anti-goals and is
an acceptance gate below.

## Decision

Adopt **citty** (the unjs CLI framework — used successfully in prior
projects) as the CLI contract layer: declarative verbs, typed args,
generated help. The hand-rolled parsing retires; the *behaviour* is
unchanged bit for bit at every gate.

## The three gates (acceptance, not preferences)

1. **ADR-016's argv[0] dispatch survives.** okuda/gloam is resolved
   from `argv[0]` basename *before* citty sees the args — dispatch
   first, then hand off per verb. If citty fights the pre-parse
   dispatch, the adoption fails.
2. **The TTY gates stay explicit.** Picker (no arg, TTY), callsign
   (shaped arg, TTY), pipe (non-TTY stdin) — the modes remain gated by
   explicit checks, never inferred from parsed flags.
3. **The stateless stance holds.** citty parses args; it adds no state,
   no config reading, no session. Params in, bytes or actuation out.

## What citty buys

- **Generated help** — the accessibility win: the growing surface
  becomes discoverable (`--help` per verb) without hand-maintained
  usage strings.
- **Typed args** — the flags (`-g`, `--mci`, `--mce`, `--brightness`)
  become declarations, killing the manual drift risk per flag.
- **Subcommands, if ever wanted** — the door opens without ceremony.
- **One dependency, no runtime** — citty is tiny and unjs-consistent.

## Scope

**In:** the CLI contract layer (`src/cli.ts`); the existing verbs
(okuda reader, gloam picker, callsign dispatch, `-g` when it lands);
the pending flags; generated help. The argv[0] dispatch stays above
the framework.

**Out:** the TUI keymap (hand-rolled, sacred, one screen); the Herdr
cast script (`scripts/cast.ts` shells out to the herdr CLI — no
framework); the registers (data, not interface); anything that reads
config.

## Work plan

1. Spike on a branch: wrap the current surface in citty; verify the
   three gates; the ADR-016 dispatch resolves before citty.
2. `--help` for every verb — audit the generated help against the
   conventions page's ladder.
3. Land behind the existing behaviour: bit-for-bit at every gate
   (same args, same bytes, same exit codes).
4. Retire the hand-rolled parsing; keep `CALLSIGN_SHAPE` as data.

## Alternatives

| Alternative | Why Rejected (for now) |
|---|---|
| Stay hand-rolled | Each new flag is parse + help + drift risk; the surface grows every session; the help is never written |
| yargs / commander | Heavier, older idioms; citty is the known-good prior experience and unjs-consistent |
| No CLI growth | The surface grows regardless; the flags are already ruled in (modes, brightness) |

## Verification

- All existing behaviour: same args → same bytes, same exit codes
  (the 308-test suite stays green).
- `--help` per verb, generated, audited against the conventions page.
- The three gates, each with a test.
- ADR-016's dispatch: okuda/gloam resolution verified against the
  argv[0] basename.

## Related

- ADR: `decisions/016-argv0-launcher-dispatch.md` (gate 1)
- Brief: `briefs/2026-08-29-brief-terminal-speech.md` (`--mci`/`--mce`)
- Doc: `docs/2026-08-30-gloam-seams.md` (the stateless stance, the
  seams, the anti-goals)
- td: the citty spike task, filed with the three gates as acceptance
