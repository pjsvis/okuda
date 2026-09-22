---
type: Brief
callsign: BRF-REMOTE-SPEECH-SEAM
date: 2026-09-19
---

# Brief: The remote speech seam — a question to settle before anything builds

**Created:** 2026-09-19
**Status:** Proposal — a seam decision, not a build brief. No TD epic until the verdict; nothing below is committed to.
**Lineage:** the reader's 2026-09-19 action list — *"remote speech and various remote ops"* — triaged: the *ops* half has prior art; the *speech* half has a boundary question that must be answered before a brief can honestly name a build.
**Extends:** ADR-PERIMETER-039 (the speech work leaves okuda; the tuning loop is `../speak-md/`'s) and the three-concerns test (compositing = environment, windowing = host, rendering = okuda).

## The question

**Whose concern is audio on the far side of a remote connection?**

Sound does not travel okuda's byte stream — okuda renders coloured bytes to a
glass; the ear is a different channel. By the three-concerns test, transporting
the voice is **compositing** (where the text's *consumption* happens), and
compositing belongs to the environment. The speech set has already been
measured out to the perimeter (ADR-PERIMETER-039: 22 of 28 `[moira]` recipes
touch nothing of okuda's).

## The likely resolution (to confirm or veto)

If the perimeter holds, okuda's entire duty for remote speech is a **clean
plain-text channel out**:

- A `--plain` render dial — the `--no-color` mode that strips **bold too**
  (Run 1 of the TTS dogfood found 28 bold escapes surviving; currently logged
  in `&next.md` as its own S-cost item). The clean audio input today is
  `cat doc.md`; `--plain` should make `./okuda --plain doc.md` equivalent.
- Nothing else. No transport, no audio, no remote-voice protocol. The
  `ssh-and-gemini` status protocol (docs/ssh-and-gemini.md) already covers the
  *ops* half — driving okuda remotely — and it is the environment's composite
  already.

## Why this is a proposal and not a build

The one okuda-side artifact (`--plain`) is real but small, and building it
before the verdict risks paying for a seam nobody confirmed. The verdict is
the reader's: **confirm** (okuda's duty ends at `--plain`; the perimeter
briefs carry the rest) or **veto** (name the property of remote speech that
touches okuda's byte stream, and this brief rewrites as a build).

## Scope

In: the verdict, and — if confirmed — the `--plain` dial as a small follow-on
task with its own TD. Out: everything remote — transport, audio, the
`[moira]` recipes, the gemini protocol's upkeep (all owned by the perimeter
briefs, td-1bb4c4 and kin).
