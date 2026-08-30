# Naming like NASA — patterns and practices, attributed

> Logged 2026-08-30. Status: **research record.** Follows from ADR-024
> (callsigns are data, not machinery) and the BRF-SILO-MNEMONICS amendment.
> External lessons, verified against sources this session where noted;
> general-knowledge items flagged as such. Lessons-learned in the past are
> still lessons-learned today — but only if attributed.

## Why this document exists

The callsign discussion (cool · short · unique) reached for a NASA analogy,
and the analogy was correct enough to deserve verification. This document
records what NASA actually does, with sources, so the lessons survive the
conversation that produced them. An unattributed lesson decays into anecdote;
an attributed one is a citation away from re-verification.

## The four-part machine

**1. Two codes, deliberately separated — the machine code is ugly on purpose.**
Voyager was *Mariner Jupiter-Saturn 1977* (MJS77) for four years; Apollo
vehicles carried serials like AS-506; every spacecraft gets a COSPAR designator
(Voyager 1: 1977-084A). Unique by construction, greppable, unlovable — and
nobody is asked to say "MJS77" on a phone call. The human name exists *on top
of* the machine code, never instead of it.

**2. The convention does the heavy lifting, not the namer.** May 1960: NASA's
*Ad Hoc Committee to Name Space Projects and Objects* minuted a policy — crewed
programs "will be named after the gods and heroes of mythology, thus continuing
in the present class begun by Mercury." One register, bounded vocabulary. Abe
Silverstein picked *Apollo* from a mythology book one evening; when asked why,
he said there was "no specific reason for it… just an attractive name." Even
the namer of Apollo could not articulate a rubric. Taste is real but not
processable — so build rails around it.

**3. Curation, never generation — sourced from outside when inside taste runs
dry.** Voyager: the team found MJS77 "a mouthful," wrote *Nomad, Pilgrim,
Antares* and others on a blackboard, and voted. The rovers went further: names
from schoolchildren's essay contests, selected by panels. Generate many, select
few, taste applied only at the point of selection. No naming factory; part
numbers for the fleet, earned names for flagships, names arriving when the
thing distinguishes itself (Voyager was named in March 1977, months before
launch, precisely because the design had outgrown the Mariner family).

**4. The veto — names are reviewed for honesty, not just aesthetics.** The
Project Designation Committee renamed the *Lunar Excursion Module* to *Lunar
Module* (1966) because "excursion" implied mobility the vehicle did not have.
A name must not lie about its referent.

## Lessons, attributed

| Lesson | Evidence | Source | okuda mapping |
|---|---|---|---|
| Two codes, one referent | MJS77 / Voyager; AS-506 / Apollo; COSPAR IDs | Kohlhase interview (2002); Butrica (1998) | BRF-SILO-MNEMONICS "two codes"; ADR-024 |
| Machine code unique by construction, ugly by design | COSPAR 1977-084A; VGR 77-1 | Butrica (1998); Wikipedia (Voyager program) | filenames + frontmatter |
| Conventions beat generators | Ad Hoc Committee minutes, 1960-05-16 | NASA Apollo Chronology, pt. IV | type-prefix + slug convention |
| Cool is curated, never generated | blackboard vote; rover essay contests | Kohlhase interview (2002); general knowledge (flagged) | human spends cool sparingly |
| Names arrive when earned | MJS77 → Voyager, March 1977 | JPL Slice of History (2017) | callsigns assigned, never re-derived |
| The veto — a name must not lie | LEM → LM, 1966 | Project Designation Committee memo (Scheer, 1966-06-09) | facade lint, honesty line |
| Unqualified collisions cost real anxiety | Mars *Voyager* curse worry, 1977 | Kohlhase interview (2002) | silo-scoped uniqueness; qualified addresses |
| Rejected names are part of the record | Gilruth's "Project Astronaut" (feared to centre personalities) | Astronomy.com (2019), citing Hersch | — (taste has veto power; note the rejections) |

## Sources

Verified this session (2026-08-30):

- NASA, *Abe Silverstein* (nasa.gov biographies, Glenn Research Center) —
  Silverstein as Chief of Space Flight Programs; "credited with naming both
  the Mercury and Apollo programs."
- *The Apollo Spacecraft: A Chronology*, vol. I, pt. IV (NASA History Office)
  — Apollo named at a January 1960 luncheon; Ad Hoc Committee to Name Space
  Projects and Objects minutes, 1960-05-16 (mythology policy); Julian Scheer
  memo on the Project Designation Committee, 1966-06-09 (LEM → LM).
- A.J.S. Rayl, "The Stories Behind the Voyager Mission: Charles Kohlhase,"
  The Planetary Society, 2002-09-05 — MJS77, the blackboard vote, the
  Mars-Voyager superstition ("We're not weirdoes. We're scientists.").
- Andrew J. Butrica, "Voyager: The Grand Tour of Big Science," in *From
  Engineering Science to Big Science* (NASA SP-4219, 1998) — Grand Tour →
  MJS77 → the March 1977 renaming competition.
- JPL, "Slice of History — Mariner Jupiter Saturn 1977," 2017-09-06.
- Astronomy.com, "Naming Apollo: Why NASA chooses Greek gods as names"
  (2019) — the Silverstein NYT-obituary quote; Gilruth's rejected *Project
  Astronaut*; the Artemis symmetry.

General knowledge, not re-verified this session (flagged per Hume's Razor):

- Rover names from schoolchildren's essay contests: Sojourner (Valerie
  Ambroise), Spirit/Opportunity (Sofi Collis), Curiosity (Clara Ma),
  Perseverance (Alexander Mather); Ingenuity (Vaneeza Rupani).
- COSPAR designator scheme; JWST naming controversy as the cautionary tale
  for naming after people.

## Internal precedents

- `briefs/2026-08-28-silo-mnemonics.md` — "two codes, one referent" (the
  brief's Why, which survived amendment).
- `briefs/2026-08-30-brief-content-shortlist.md` — rg as the resolution path.
- `decisions/024-callsigns-are-data.md` — the division of labor this
  research supports.
- `decisions/019-okf-v02-conformance.md` / the badge work — the silo name as
  namespace, predating the callsigns (the qualified address is free).
- `decisions/020-zero-notification-stillness.md` — the register: provenance,
  not alarm. Names are provenance.

## Open flag

This document carries no callsign: docs/ is outside the registry set
(ADR/BRF/DBF/PLY prefixes) and has no INDEX.jsonl. Under the current
convention that is correct — a research record is referenced by its filename
like any other doc. Whether docs ever earn badges is a separate decision and
should not be made incidentally by this document. The irony of an unbadged
document about badges is noted and left standing.
