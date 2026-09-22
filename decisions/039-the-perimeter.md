---
type: ADR
callsign: ADR-PERIMETER-039
---

# Decision: The perimeter — the voice reads okuda and does not live in it

**Date:** 2026-09-18
**Status:** Accepted (the perimeter is recorded; the eviction is not run)

## Context

The reader's proposal was to split the prosody training into a separate project so
that attention could return to GLoam and okuda. The measurement did not support the
proposal as worded, and supported something narrower.

**The split is already decided.** ADR-036: *the cue is okuda's, the voice is the
environment's.* `../speak-md/AGENTS.md`: *environment tooling, not okuda; speech is
compositing — it belongs here.* `docs/2026-09-14-speech-driven-design.md` §6: *speech
— base + prosody*, the principle that prosody belongs to the channel. That third
document is untracked, unregistered and dated `[ ]`, so by the house's rule it does
not exist — and the boundary has now been re-derived three times in three days.
**A rule that gets rediscovered is a rule with no test.**

**The project exists; the perimeter does not.** Measured 2026-09-18
(`tmp/speech-census.py`, 21 controls, all passing):

- `[moira]` is **28 recipes — the largest group in okuda's task runner**, against 27
  for `build`. **3 invoke the okuda binary** (`tts`, `tts-rate`, `speech`), 3 read an
  okuda document, and **22 touch nothing of okuda's at all**.
- **Every `.txt` file in the silo — 3 of 3 — is a rendered TTS artifact.** The
  standing directive is that documentation is markdown; the only violations in the
  tree are prosody byproducts.
- `tmp/` carries ~48 speech artifacts beside 163 of okuda's own probes.
- `just census` is filed under the **`quality gate`** group and runs
  `speak-md census`. It gates nothing about okuda.

**The coupling is real, and it is the reason this is not a deletion.** The voice is
the strictest reader of okuda's output. `terminalSize()` returns null for a non-TTY,
so the piped path falls back to `terminalCols(80)`, and `say` treats a line break as a
word boundary — a table needing more than 80 columns is broken for the ear always,
silently, with no elision notice. And `okuda --no-color` strips colour, not attributes
(`src/ansi.ts:100-104`), which a leading escape turns into a silenced line. **Both are
okuda defects found by listening.** The voice is a consumer of okuda's bytes and a
conformance oracle for them.

## Decision

**The voice is a reader of okuda's output, not a resident of okuda's repo.** okuda
keeps the facts its own bytes must satisfy under the ear, and nothing about how the
voice sounds.

Stated as the four things it fixes:

- **The task runner.** The `[moira]` group holds only recipes that invoke the okuda
  binary. A recipe that tunes the voice belongs in `../speak-md/justfile`, invoked
  across the silo boundary — the pattern `speak-md`'s own `demo` recipe already uses
  (`just -f ~/Dev/GitHub/speak-md/justfile demo NOW.md`, artifacts landing in the
  sibling's `tmp/`).
- **The doctrine.** okuda keeps *the voice reads at 80 columns* and the okuda half of
  *strip the escapes*, because those are facts about okuda's bytes. The flattener's
  rewrite rules, the cast, the specimen rationale and the probe doctrine are the
  environment's and go.
- **The records.** `decisions/033` decides `say`'s tag support, voice classes and
  SSML — all the environment's. It relocates. **A claimed number stays claimed**, so
  it leaves a tombstone at `033` naming where the decision went, and the number is not
  reissued. That is ADR-036's own lesson applied forward: a citation to a number is
  not a citation to a rule.
- **The enforcement.** A check reports the recipes that are not okuda's, and becomes a
  gate when the count reaches zero. It ships as a **report** first — the pattern
  `tables-check` already established — because a gate that fails on arrival is a gate
  that gets waived.

**The test, and it is one line.** ADR-036 asked *whose text is it?* This asks the
companion question: **whose work is it?** A recipe that does not read okuda's bytes is
not okuda's. A document that does not describe okuda's output is not okuda's.

```mermaid
title: The perimeter test
flowchart TD
    R[recipe or document] --> Q{reads okuda's bytes?}
    Q -->|yes| O[okuda's]
    Q -->|no| E[the environment's]
```

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Create a new project for prosody training | The project exists (`../speak-md/`, a sibling silo with its own `just check`, its own rules and its own scratch tier). Creating another would re-decide ADR-036 and add a fourth statement of the same boundary — the defect this ADR exists to end. |
| Leave it, and rely on discipline | The boundary has been re-derived three times in three days. Discipline is what failed; a rule with no test is rediscovered rather than applied. |
| Delete the speech work from okuda entirely | Loses the oracle. The 80-column read and the escape leak are **okuda** defects, found by listening, and nothing in the release path would have found them. |
| Move only the recipes | The doctrine outlives the recipes. `playbooks/ear-playbook.md` would keep teaching rules 4, 5 and 6 — `speak-md`'s code — to readers who cannot act on them. |
| Make the check a gate immediately | `just check` would go red on 25 pre-existing recipes. A gate that fails on arrival is a gate that gets waived, and the count is not any one commit's regression. |
| Keep `decisions/033` in place, unmarked | The perimeter would then have an exception at its own centre, and the next reader would find a decision about `say`'s voice classes filed as okuda's. |

## Consequences

**What became easier:**

- *Should okuda do X for speech?* has a one-line test — does it read okuda's bytes? —
  instead of an appeal to a principle stated in three places.
- okuda's task list opens on okuda's work. Concentration becomes a property of the
  working directory rather than of intent.
- The oracle is named. The 80-column read and the escape behaviour are now citable as
  okuda's, with a reason for staying.

**What became harder:**

- The oracle coupling is maintained by hand. Nothing in the release path reports when
  `say`'s behaviour changes, so a voice-side change that breaks okuda's output is
  found by listening, as it was the first two times.
- `just check` gains a check whose count is non-zero on arrival, which puts it in the
  *pre-existing count is not your regression* class alongside `tables-check`.

**Constraints this imposes:**

- **The `[moira]` group may contain only recipes that invoke the okuda binary.** A
  voice-tuning recipe is written in the sibling and invoked across the boundary.
- **No speech document lands in okuda's `docs/`, `briefs/` or `playbooks/` unless it
  describes okuda's output.** The test is the diagram above.
- **ADR-036, ADR-035 and ADR-032 stay.** They constrain okuda's source and okuda's
  instrument — they are the perimeter, not residents beyond it.
- **A relocated decision leaves a tombstone at its number**, and the number is not
  reissued.
- `playbooks/herdr-cast-playbook.md` **stays**: it is the windowing playbook, and
  *cast* is two different words in two different projects. A name-based sweep would
  take it.

## Notes

**The perimeter is recorded; the eviction is not run.** Three briefs carry it, and
they are independent: `BRF-PERIMETER-GATE` (the report that becomes a gate),
`BRF-PERIMETER-RUNNER` (the tuning recipes and their artifacts),
`BRF-PERIMETER-SILO` (the doctrine and the records).

The measurement is `docs/2026-09-18-a-perimeter-not-a-project.md`; the probe is
`tmp/speech-census.py` (scratch — gitignored, and not in the silo).

Two things the eviction leaves standing:

- `docs/2026-09-17-ssml-voice-tags.md` is **untracked, unregistered, has no
  frontmatter**, opens `# writing for TTS` and carries *15 to 20 words max*. It is the
  twin of the STE clip removed 2026-09-18 — a mirror of a live external document
  carrying a rule with no authority — and it re-opens the SSML question ADR-033
  settled on 2026-09-09. It goes with `BRF-PERIMETER-SILO` whatever is decided about
  ownership, because it is not in the silo.
- `&next.md`'s rows are cited by **ordinal** in three documents
  (`debriefs/2026-08-31-debrief-the-ledger-day.md`, `docs/2026-08-30-voice-actuator-testing.md`,
  `docs/2026-08-31-vector-resource-locators.md`). `§NN` is derived per render, so those
  citations were never durable and are already stale — the 08-31 debrief cites *rows
  11–13* for the callsign lint, which sits at row 6 today. The eviction adds rows and
  shifts them further. **The remedy is a drift sweep that replaces the ordinals with
  callsigns**, and it is not part of this perimeter.

## Related

- Survey: `docs/2026-09-18-a-perimeter-not-a-project.md` — the measurement, the tiers,
  and the two classifier traps
- ADR: `ADR-NO-SPEECH-CODE-036` — the cue is okuda's, the voice is the environment's;
  this ADR adds the companion test and draws the perimeter its rule implies
- ADR: `ADR-DOGFOODS-ARE-SINGLE-MODALITY-035` — the firewall that already ruled on
  bolting a second field onto okuda's instrument
- ADR: `ADR-PUNCTUATION-OVER-LEGACY-SPEECH-TAGS-033` — the decision that relocates
- Playbook: `PLY-SILO` — the scratch tier, and the release/probe language split
- Playbook: `PLY-EAR` — the two sections that stay, and the four that go
- Brief: `BRF-PERIMETER-GATE`, `BRF-PERIMETER-RUNNER`, `BRF-PERIMETER-SILO`
