# &speak — the speech vector

The dogfood TTS silo (`../speak-md/`), reachable from the reader. The
silo is a sibling, not a subordinate: okuda renders what the environment
points at — the filesystem is the message bus — and no speech code lives
in this repo. Each row jumps; `u` unwinds; `00` stops anything Moira is
saying mid-sentence.

Built 2026-09-11, the day the silo was born. The commendation
rehearsal (`just moira-commendation`) speaks okuda's patron wall —
the wall lives in this corpus, the rehearsal is Moira's.

Rewired 2026-09-19 (td-1c8fca): the rows carried `okuda-rhs` wires,
retired by ADR-031 the week before this page was born — the wiring
was dead on arrival, so the rows never jumped. The rows now carry
real references; the `§` vectors are derived, painted in reading
order, never authored.

## The silo's documents

| Doc | What it answers |
|---|---|
| [README.md — the register](../speak-md/README.md) | usage, the naming (elocution, auditions, repertoire, recital, drill), preferences doctrine |
| [Elocution playbook](../speak-md/playbooks/elocution-playbook.md) | here's what to do: the ear-driven tuning loop for any word class (-ent in flight, -ing pre-scanned) |
| [AGENTS.md — silo rules](../speak-md/AGENTS.md) | the six rules (lexicon earned by ear; artifacts in tmp/; oracle out-of-band) |
| [House terms](../speak-md/house-terms.md) | the proper nouns, word and lip perfect — L§AB, silcrow, the commendation standard |

## Not documents

`lexicon.json` (the repertoire — `speak-md recite` speaks it, the git
log reads it), `avionics.json` (the drill's table — tuned by ear),
`tmp/` (scratch tier — regenerated, never registered). Data, not prose;
the tools own them.
