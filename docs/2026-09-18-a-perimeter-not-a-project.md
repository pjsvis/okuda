---
date: 2026-09-18
kind: survey — a proposed split, measured against okuda's own tree
lineage: the reader's proposal — *"we should split the prosody training into a separate project so that we can concentrate on GLoam and Okuda, opinion"* — tested with `tmp/speech-census.py` against the tracked tree rather than argued from the file listing
status: superseded 2026-11-05 — the eviction ran by relocation (`cc722e4`, 2026-10-10); this is the 2026-09-18 measurement, kept as the reading that sized it. Current state: `ADR-PERIMETER-039`'s *Amended* section.
---

# A perimeter, not a project

> ◆ The split is already decided — in ADR-036, in `speak-md`'s own rules, and in a
> design note the silo does not track. What does not exist is a perimeter: **22 of the
> 28 recipes in okuda's task runner have no relationship to okuda at all.**

> **Superseded 2026-11-05.** The eviction ran by relocation: `cc722e4` (*Moira's flit*,
> 2026-10-10) moved the rehearsal recipes out and deleted the casting doctrine. The
> `[moira]` group is now **6 recipes, 2 invoking `./okuda`** — not 28 and 22. The
> destination moved from `../speak-md` (gone) to `../Blandings`. The records residue is a
> separate task; `ADR-PERIMETER-039` carries the current state.

## What we are deciding

Whether the prosody loop leaves okuda, and if so what leaves and what has to stay.

The proposal is a separate project. The measurement says the project exists already and the
perimeter does not — which makes this an enforcement job rather than a greenfield one. The
difference matters, because the house has a rule for re-deciding a settled question, and no rule
for defending a boundary nobody wrote a test for.

## The measurement

`tmp/speech-census.py` classifies every recipe in the `justfile` by what it actually invokes, and
censuses the tiers against **tracked** files. It carries 21 controls, each asserted by reading a
recipe body rather than by expectation; all 21 pass.

The `[moira]` group, by what each recipe invokes:

| The recipe invokes | Recipes |
| --- | --- |
| `./okuda` — the binary | 3 |
| an okuda document, not the binary | 3 |
| nothing of okuda's at all | 22 |

**The speech group is the largest group in okuda's task runner — 28 recipes against 27 for
`build`.** Three of its recipes are okuda's: `tts` and `tts-rate` (the render→speak seam) and
`speech` (the vector). Three more read an okuda document. The remaining 22 invoke `speak-md` or
`say` against passages in `tmp/` and touch nothing of okuda's — not the binary, not a document.

One more, and it is the tidiest illustration of the leak: **`just census` is filed under the
`quality gate` group and runs `speak-md census`.** It gates nothing about okuda. It is a speech
recipe wearing a gate's label.

The rest of the census, against the silo:

| Tier | Speech by name | Total |
| --- | --- | --- |
| root nav (`&*.md`) | 2 | 5 |
| `briefs/` | 8 | 69 |
| `playbooks/` | 2 | 16 |
| `decisions/` | 2 | 40 |
| `advisories/` | 0 | 7 |
| `debriefs/` | 1 | 20 |
| `docs/` | 10 | 137 |

Two of those columns overcount and one undercounts, and the corrections are the point:
`playbooks/herdr-cast-playbook.md` is **not speech** — it is the windowing playbook, and *cast* is
two different words in two different projects. `docs/2026-09-15-the-search-panel-speech-first.md`
is okuda's, a design note about okuda's own search surface. And `docs/` is 137 tracked against 160
on disk: **23 files in that tier are not in the silo**, because `docs/` is not a registered tier
and nothing lints it.

### The silo's only non-markdown artifacts are speech

Every `.txt` file tracked in okuda — three of three — is a rendered TTS artifact:

```
docs/2026-09-10-moira-prosody-probe-rendered.txt
docs/2026-09-10-moira-showcase-rendered.txt
docs/2026-09-10-pleasant-irish-profanity-tts-rendered.txt
```

The standing directive is that documentation is markdown. The only violations in the entire tree
are prosody byproducts.

### The scratch tier is shared

`tmp/` holds 211 loose files at its top level; 48 carry speech names (`audition-*`, `aunt-*`,
`roofscape-*`, `*-flat.txt`, the probe passages) and sit beside 163 of okuda's own probes. Two
projects' scratch in one directory. The 143 MB of `tmp/scale/` and 9.9 MB of `tmp/pretext/` are
okuda's own corpora and are not part of this.

## Three statements of one boundary, and none of them is a gate

- **ADR-036, 2026-09-13.** *"The cue is okuda's, the voice is the environment's… okuda contains no
  prosody parameter and no pause constant."* This one is a constraint on okuda's source, and it is
  the only statement of the three that is in the silo and citable.
- **`../speak-md/AGENTS.md`.** *"Environment tooling, not okuda; speech is compositing — it belongs
  here."* The sibling says it about itself.
- **`docs/2026-09-14-speech-driven-design.md` §6.** *"Each channel adds at most one channel-specific
  dimension… Speech — base + prosody."* The principle that prosody belongs to the channel and not
  to the renderer, stated in a 219-line design document that is **untracked, unregistered, and
  dated `[ ]`** — so by the house's own rule it does not exist, and yet it plainly shaped the work.

The boundary has now been re-derived three times in three days. **That is what a rule without a
gate looks like from the inside:** it gets rediscovered instead of applied.

## The coupling that has to survive

This is not a clean deletion, and the reason is that **the voice is the strictest reader of
okuda's output.** Two facts are okuda's, and they are the whole reason an ear playbook exists in
this repo at all:

- **The voice reads at 80 columns.** `terminalSize()` returns null for a non-TTY, so the piped path
  falls back to `terminalCols(80)` — and `say` treats a line break as a word boundary, so a table
  needing more than 80 columns is broken for the ear *always*, silently, with no elision notice.
  That is a defect in okuda's width contract, found by listening.
- **`okuda --no-color` strips colour, not attributes** (`src/ansi.ts:100–104`), and `speak-md`
  passes the escapes through byte for byte, and a leading escape silences the line. That is
  okuda's bug, found by listening.

So the voice is not only a consumer of okuda's bytes; it is a **conformance oracle** for them.
Keep the oracle. Evict the tuning.

## This was never a dogfood

Dogfooding means using your own product to test your own product. `just moira-he` tunes a
pronunciation of the word *he*. It says nothing about okuda. It is not a dogfood; it is another
project's work happening in okuda's working directory.

**ADR-035 already ruled on the shape** — *dogfoods are single-modality; the primary field is the
test field*, with a firewall built because the temptation to bolt a spoken shadow onto okuda's
instrument had already recurred once. The `[moira]` group is on the wrong side of that firewall.
The only two recipes that are genuinely dogfoods are `tts` and `tts-rate`, and they test whether
okuda's render is speakable, which is a property of okuda's output.

## The clip that is still here

`docs/2026-09-17-ssml-voice-tags.md` is **untracked, unregistered, and has no frontmatter** — it
opens `# writing for TTS` and carries *15 to 20 words max*. It is the STE clip's twin, one tier
over: a verbatim mirror of a live external document, carrying a rule with no authority, in a tier
nothing lints. It should go whatever we decide about ownership, because it is not in the silo and
a mirror drifts. ADR-033 rejected SSML on 2026-09-09, so the document also re-opens a settled
question by accident.

## Where I would land

- ☐ **Draw the perimeter as an ADR, do not create a project.** The project exists. What is missing
  is a record that says where okuda's edge is, and the house's form for that is a decision, not a
  repository. Creating a new project would be re-deciding ADR-036.
- ☐ **Gate it on one line.** *The `[moira]` group may contain only recipes that invoke the okuda
  binary.* That is testable, it is one line, and the census above is the test. Without a gate this
  leaks again — it has leaked three times already.
- ☐ **Move the tuning**: the 25 recipes that are not okuda's, the 48 speech artifacts in `tmp/`,
  `&ear.md`, the `docs/2026-09-10-moira-*` pair and its three rendered `.txt` files,
  `briefs/2026-09-10-brief-tts-stepper.md` (a brief for *"the egress pipeline that is the silo's"*,
  by ADR-036's own description), and `decisions/033` — which decides `say`'s tag support, voice
  classes and SSML, all of them the environment's. A number once claimed stays claimed, so 033
  leaves a tombstone rather than a hole.
- ☐ **Move the wrong half of `playbooks/ear-playbook.md`**: *The rewrite rules* (rules 4, 5 and 6
  are `speak-md`'s code), *The specimen tier*'s speech rationale, *The probe is a finder*, *The
  cast*. Keep *The voice reads at 80 columns* and the okuda half of *Strip the escapes*.
- ⋮ **Decide two briefs**: `BRF-AUDIO-STYLE` and `BRF-SPEECH-STRIDE`. If they lint or stride
  *okuda's prose* for the ear they are the oracle direction and they are okuda's; if they are about
  how it sounds they are not.
- ✗ **Do not move ADR-036, ADR-035 or ADR-032.** They constrain okuda's source and okuda's
  instrument. They are the perimeter, and they stay inside it.

What would change my mind: a recipe in the `[moira]` group that reads okuda's bytes without
invoking the binary — that would mean the seam is real and the group is doing two jobs at once.

## The two traps this measurement walked into

- **A path under the repo root is not okuda's content.** The first classifier counted `tmp/` as
  okuda's, and five controls failed on it. `tmp/` is gitignored, so by the silo principle it is not
  in okuda at all — a recipe that writes there reads nothing of okuda's. *The classifier was
  measuring the repo root, not the silo.*
- **A file on disk is not a document in the silo.** The first tier census used `os.listdir`, which
  counted 23 files in `docs/` that git does not track. Corrected to `git ls-files`, the tier is 137.
  Same error class as yesterday's clip: the thing was there, and it was not in the silo.

Both are the same mistake in two costumes — *the working tree is not the silo* — and both were
caught only because a control was written down first.

## Evidence

- `tmp/speech-census.py` — the classifier, 21 controls, the tier census, run 2026-09-18.
- `justfile` — the `[moira]` group, 28 recipes; read in full, every body classified.
- `../speak-md/AGENTS.md` and `../speak-md/justfile` — the sibling's rules, and its `demo` recipe,
  which is the one place the boundary is already enforced properly: invoked from inside okuda with
  `just -f ~/Dev/GitHub/speak-md/justfile demo NOW.md`, landing its artifacts in the sibling's
  `tmp/`. **That is the pattern to generalise.**
- `decisions/036-no-speech-code.md`, `decisions/035-dogfoods-are-single-modality.md`,
  `decisions/033-punctuation-over-legacy-speech-tags.md`.
- `playbooks/ear-playbook.md` — the two sections that are okuda's, and the four that are not.
- `docs/2026-09-14-speech-driven-design.md` — §6, the boundary stated in an untracked document.

## Related

- The vector that stays `&speak.md`
- The queue that moves `&ear.md`
- The sibling's own rules `../speak-md/AGENTS.md`
- The seams precedent — an options paper, nothing decided `docs/2026-08-30-gloam-seams.md`
- The three concerns, which decide all of it `docs/2026-08-20-origin-doc.md`
