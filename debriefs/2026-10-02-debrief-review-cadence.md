---
type: Debrief
callsign: DBF-REVIEW-CADENCE
---

# Debrief: The review cadence — nine loops, one true thing each, zero escapes

**Date:** 2026-10-02
**Status:** Done — the day's collaboration pattern, its measured yield,
and the defect species it caught, recorded before the clone forgets them.

## What happened

A day that began as a snagging-list audit (DBF-REGISTRY-TRUTH) became
registry truth, then four new gate checks (the td-ID valve lint and the
callsign checksum, BRF-VALVE-LINT and BRF-CALLSIGN-CHECKSUM), then nine
review loops between two pi sessions sharing one cwd: an implementer
session built, a reviewer session verified at the glass, and the
wrap-up protocol ran end-to-end every time — branch, verify, approve,
ff-merge, push, prune, brief flip, td closure. Intercom was the bus;
the shared filesystem was the ledger; no API in either direction.

## The datum: every loop found exactly one true thing

| Loop | The one true thing |
|---|---|
| Containment closure | main committed, gate green — but unpushed (step 1's "in main" was local costume) |
| Valve build | a fresh debrief citing three td IDs, written after codification |
| Silcrow edge cases | ADR-004 still teaching the repealed art-is-art exemption |
| Glyph splice | a comment claiming a style handback only headings implement |
| Callsign checksum | stale zero-entry baselines — silent allowance; a phantom passed at count parity, demonstrated live |
| Chrome footer swap | two comments still teaching the repealed geometry |

Never zero, never two, never catastrophic. The pattern held because the
reviews tested the *negative* claims — silence, decay, absence — at the
glass, not in the handoff (the reviewer-bite rule, td-playbook).

## The thesis: the code was honest all day; the paperwork lied

Not one renderer correctness bug was caught in nine loops. Every defect
was in the paperwork layer around the code: a status line, a docblock,
an acceptance box, a baseline entry, a citation. Four of nine were the
same species — *documentation teaching repealed law* (ADR-004, the glyph
comment, the two footer comments; the species made a checklist line in
the decisions-playbook and a rule in the td-playbook). The renderer
itself rendered true on the first byte all day. Registry truth, extended
from the registries to the whole prose shell: velocity outrunning
closure produces lying prose faster than lying code, and the review
cadence's job is exactly that boundary.

## The collaboration architecture (what worked, what to keep)

* **Implementer and reviewer as separate pi sessions** — genuine
  independence, even through one shared terminal. td's session identity
  conflated them (four times), so every closure carried an audited
  self-review with the true split written into the reason: the honesty
  lives in the record, not the flag.
* **Gates born from failures, same day.** Three unregistered-callsign
  strikes became the callsign checksum; the checksum's first live catch
  was its own builder. A stale-baseline allowance became the shared
  shrink verdict. Each failure was measured, then mechanized — none
  became a scolding.
* **The glass outranked the handoff every time.** The pty proof painted
  cursor addresses ([12] pre-toggle, [12,11] post-?) where prose had
  claimed the same thing less truthfully. The glass never once agreed
  with the paperwork on the first try.

## Known gaps (filed or scoped)

- Per-token baselines for both citation gates — the same-edit
  count-parity swap remains open, rare, deliberate scope.
- src/ code comments sit outside both scans — the documented v2
  boundary; widen when comment drift bites.
- The conflation is a property of shared-terminal review, not a bug to
  fix; the instrument is the audited self-review with the split
  recorded, and the durable boundary is a genuinely separate machine.
