---
type: Brief
callsign: BRF-TOOLCHAIN-TRUTH
---

# Brief: Four claims that could not prove themselves

**Date:** 2026-10-22
**Status:** Done — shipped 2026-10-22 (`95e40a6` receipt, `49d369c` shell,
`5fba500` pin, `3d2f92f` prover column). `bun test` 803/0 and `just ship` green
on Omarchy. The cross-platform review found three more gaps; all filed, none
fixed here (`DBF-TOOLCHAIN-TRUTH`).

## Context

The Omarchy bring-up (`DBF-OMARCHY-TOOLCHAIN`) ended with a toolchain installed
and a defect fixed, and left four claims standing that no instrument checked:

1. **`DEPENDENCIES.md` says "verified" and means "the tool exists."** The
   `mermaid-to-md` row read *verified 2026-09-02, Linux* while the pipe that
   consumes it produced nothing on that machine for the whole of October. A
   verification that names a date but not a *prover* is a decoration.
2. **A failed diagram renders as nothing.** `src/render.ts` drops the placeholder
   silently (`// pipe failed → drop the placeholder silently`). That silence
   converted a wrapper crash into a blank line and cost a session of diagnosis.
   It has been in `ADR-BUILD-SIGNS-040`'s *"not fixed here"* list since September.
3. **Three tests are red on Linux and they are the tests' fault.** The
   `clone`/`editor` specs inject `platform` and then assert `zsh` while the code
   correctly reads `process.env.SHELL` — `/usr/bin/bash` here. `just ship` runs
   `bun test` first, so the release path is red on the one machine we are
   bringing up, for a reason that is not a defect.
4. **`chroma`'s pin is a comment.** `tests/fence-colour.test.ts` pins 2.27.0's
   exact bytes, so a 2.28 install fails as *"colour is broken"* rather than
   *"wrong chroma"*.

And one rule the session earned: a defect recorded as *"not fixed here"* is a
debt with no owner. Two of them (the diagram swallow, the described-diagram
swallow) sat in ADRs; one cost a session.

## Objective

Every one of the four claims gets an instrument that can fail, and deferred
defects get an owner at the moment they are deferred.

## The four instruments

| Claim | Instrument | Fails by |
|---|---|---|
| the tool works *with okuda* | a `Proven by` column in `DEPENDENCIES.md` naming the gate that consumes it | an empty cell, which is visible |
| a failed diagram | a muted `▸ diagram unavailable · <reason>` line, the same shape as the existing `⋮ source elided` receipt | the render says nothing again |
| the login shell | `cloneArgs`/`editArgs` take `shell` as injected data, like `platform` | a spec asserting the machine it runs on |
| chroma's pin | one assertion reading `chroma --version` against `2.27.0`, naming the mismatch | a colour failure wearing the wrong name |

## Rejections

| Rejected | Why |
|---|---|
| Drop the three failing specs as "Mac-only" | They test a Mac path (`ghostty` at a Mac app-bundle path) whose *grammar* is portable: spawn through the user's shell. The assertion, not the subject, is machine-bound |
| Fix the swallow by keeping the source visible when the pipe fails | A single-render seam already decided the source is not shown; the defect is the silence, not the omission. One line naming the failure is the smallest honest receipt |
| Silence the CLI's own stderr instead of a marker | okuda does not read the child's stderr, and a renderer that pipes into `okuda > file.md` has no stderr to read. The receipt must be in the byte stream |
| Pin chroma by bundling its version in a constant used by the renderer | The renderer does not care; the *test* does. Assertion in the test, reading the installed tool |
| A table of proofs in a separate document | The claim and its prover belong in one row, or the second document drifts from the first |

## Done when

- `bun test` is green on Omarchy (0 red) and the three shell specs still assert
  the grammar they were written for.
- A missing or failing `mermaid-to-md` produces a named line, not a blank.
- `DEPENDENCIES.md` has a `Proven by` column, and its empty cells are the finding.
- A chroma version other than the pin fails one test that says so.
- `AGENTS.md` makes the deferred-defect rule explicit, and the two live
  deferrals are filed.

## Lineage

- `DBF-OMARCHY-TOOLCHAIN` — the session that found all four
- `DBF-PLATFORM-GATE` — the sibling, and the reason the box exists
- `ADR-BUILD-SIGNS-040` — the *"not fixed here"* note this brief retires
