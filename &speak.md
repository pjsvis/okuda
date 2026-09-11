# &speak — the speech vector

The dogfood TTS silo (`../speak-md/`), reachable from the reader. The
silo is a sibling, not a subordinate: okuda renders what the environment
points at — the filesystem is the message bus — and no speech code lives
in this repo. Each row jumps; `u` unwinds; `00` stops anything Moira is
saying mid-sentence.

Built 2026-09-11, the day the silo was born.

## The silo's documents

| Doc | What it answers | |
|---|---|---|
| README.md — the register | usage, the naming (elocution, auditions, repertoire, recital, drill), preferences doctrine | <!-- %%okuda-rhs:11%% ../speak-md/README.md -->
| Elocution playbook | here's what to do: the ear-driven tuning loop for any word class (-ent in flight, -ing pre-scanned) | <!-- %%okuda-rhs:12%% ../speak-md/playbooks/elocution-playbook.md -->
| AGENTS.md — silo rules | the six rules (lexicon earned by ear; artifacts in tmp/; oracle out-of-band) | <!-- %%okuda-rhs:13%% ../speak-md/AGENTS.md -->

## Not documents

`lexicon.json` (the repertoire — `speak-md recite` speaks it, the git
log reads it), `avionics.json` (the drill's table — tuned by ear),
`tmp/` (scratch tier — regenerated, never registered). Data, not prose;
the tools own them.
