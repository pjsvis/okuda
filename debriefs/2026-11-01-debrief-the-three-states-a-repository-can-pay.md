---
type: Debrief
callsign: DBF-SILO-STATUS
date: 2026-11-01
tags: [scripts, orient, status, seam, herdr, decisions]
agent: pi (ses_099037)
environment: local
briefs: [BRF-SILO-STATUS]
---

# Debrief: The three states a repository can pay

**Date:** 2026-11-01
**Status:** Done — 970 tests, `just check` rc=0, four commits fast-forwarded into
`main`. The host view was deliberately not built.

## What was asked

Promote the Herdr riff into work: give the silo's vitals a machine face, and give
a suite one line a host can read. `BRF-SILO-STATUS` scoped two rungs — the JSON
render, and the status line — and named the third (a mod-only tab) as a separate
deliverable, because the app's config directory was not to be written in this
session.

The premise that survived contact: `docs/2026-10-28-the-instrument-frame.md:196`
already says it — *"the silo already derives its vitals to stdout; what is missing
is a frame that does not scroll away."* A host is that frame, and the only thing
missing was the second render.

## The correction the brief needed

The brief assumed the derivation would be extended in place, `--json` bolted onto
83 lines of bash. It was ported instead, because the *mapping* — repository state
to host state — is the part that must be tested, and a mapping tested through a
shell script is a mapping tested by a subprocess and a grep.

So `scripts/orient.ts` (201 lines) owns the reading, and `scripts/orient.sh` is
twelve lines of shim. The port's acceptance criterion was the strict one: the text
render had to be **byte-identical**, verified by diffing the port against the
pre-port script on the same repository state, not by reading both. It was, but the
first draft of it was not — the `-x` test on the binary had been translated to
`existsSync`, which turns "present but not executable" from `absent` into
`unstamped`, a one-word lie in a frame people read daily. That is the class of
defect a golden-file diff catches and a code review does not.

## The claim the design refuses

Herdr's `Status` is four states and the derivation emits three. `working` is not
derivable: a dirty tree is evidence of an *edit*, not of an agent at work, and
unpushed commits are evidence of a chore. The derivation can see no process, so it
claims none — an agent that is working emits its own line, being the only observer
that holds the fact.

That refusal is the design, and it is asserted as a prohibition rather than
documented as a preference: the test walks the full grid of the fields the mapping
reads (detached × upstream × ahead × behind × tree × binary × reviews — 384
combinations) and asserts no combination yields `working`, with a control that the
grid actually reaches all three payable states. A test that only ever sees `done`
would pass for the wrong reason.

Two smaller refusals fell out of the same discipline:

- **`done` requires a review count, never an unknown.** `td` unreadable yields
  `null`, and `null` cannot produce `done` — silence reported as completion is the
  failure `ADR-027` names, one layer down.
- **`fetch: "skipped"` is not `"failed"`.** `--no-fetch` is the caller saying "do
  not ask the network"; a report that called that offline would blame the mode for
  a failure it did not have.

## The four gates that bit, and what each was about

| Gate | What it refused | The rule it was enforcing |
|---|---|---|
| `ref-census --gate` | `feat/silo-status` with no commit on it | a branch whose tip is in `main` carries nothing |
| `td-id-lint` | `**TD:** td-ab59c0` in the brief | *cite the callsign or SHA, never a td ID* — the one-way valve |
| `amp-check` | the new brief with no `&briefs` row | the table reconciles or it is not the table |
| `brief-queue --gate` | `Done` while still in the live tier | a settled status must move; the status is the claim and the folder disagrees |

Each one demanded a derived surface catch up, which is the loop working as
designed — and the last one is worth naming, because `Done`-in-live is exactly the
`MOVE` defect the queue exists to find. Archiving is part of landing, not
paperwork after it.

## The numbers

| reading | value |
|---|---|
| tests before / after | 958 → 970 (+12) |
| text render vs the shell it replaced | byte-identical (`diff`, same state) |
| files touched | 10 (606 insertions, 83 deletions) |
| new pure functions | 4 (`deriveOrient`, `renderOrientText`, `siloState`, `statusLine`) |
| shell shrunk | `orient.sh` 83 lines → 12 |

## Dogfood

The instrument reads itself:

```
$ just silo-status
idle — 5 changed file(s) · no upstream · binary stale

$ bun scripts/silo-status.ts | xxd
00000000: 1b5d 3735 3031 3b73 7461 7465 3d69 646c  .]7501;state=idl
00000010: 653a 6170 703d 7369 6c6f 1b5c            e:app=silo.\
```

The honest reading of this repository at the moment of the dogfood is `idle`: work
in flight, nobody blocked. That is a less flattering answer than `working`, and it
is the correct one — which is the argument for the refusal.

## Findings recorded, not fixed

- **The perimeter gate's arithmetic is stale.** `briefs/2026-09-18-brief-perimeter-gate.md`
  quotes *"22 of the 28 `[moira]` recipes"* and *"the 25 recipes it names"*; the
  group is six recipes today, of which two invoke `./okuda`. The report's content
  is its deliverable, so the measurement must be retaken before it is written.
  Filed as a td task in the same sitting (rule 7: a deferral with no owner is a
  wish).
- **The `brief-queue` decide-defects are the obvious second `blocked` signal** —
  one subprocess, already gated. Deferred so the emitter stays inside a host's
  short exec budget; noted in the brief rather than half-wired.

## What was not built, and why that is the answer

The mod-only tab. Two reasons, and only one of them is the operator's constraint on
the app's config directory:

1. **The one-liner is the load-bearing part.** A sidebar that says *blocked* needs
   no rendering work at all — it needs the line, and the line is now emitted.
2. **The view is a separate deliverable with its own seam.** Its code belongs in
   the repository and its copy in `~/.config/herdr-app/mods/`, installed by a recipe
   that declares the crossing. That is a different brief, and writing it before the
   line has been seen in a sidebar would be building the render before the reading
   is trusted.

The debrief's own prediction, for the next session to falsify: rung 2 will do most
of the work and rung 3 will be pleasant rather than load-bearing. If the sidebar
turns out to want the tab, that is a fact about attention, and it will be measured
before it is built.
