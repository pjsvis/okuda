---
type: Brief
callsign: BRF-COMMISSION-BLANDINGS
---

# Brief: Commission the Blandings silo — and the procedure that makes the next one routine

**Date:** 2026-10-10
**Status:** Landed — 2026-10-27. The voice work moved to the blandings silo and the migration is complete; this silo no longer carries the speech pipeline. Archived as finished, not refused.
**Origin:** the entertainment/work-product split (this session). Companion to
the repertory company doc (Blandings) and `playbooks/ear-playbook.md`.

## Objective

Commission and provision **Blandings** — a new sibling silo for the speech
*play* (the entertainment product), distinct from okuda's work product — push it
public, and **extract the procedure** by which a silo is commissioned, so the
next one is provisioning rather than a special event.

Two deliverables, the **class primary**:

1. **The procedure** — a commissioning checklist, a minimal template, and a
   `just` target: the residue after subtracting what is specific to Blandings.
2. **Blandings** — the procedure's first run and acceptance test.

Build Blandings by hand from the checklist; subtract the Blandings-specific; the
remainder becomes the template. Subtraction as discovery, and no generalising on
n=1 by inventing the template up front — the first instance is how the template
earns its shape.

## Settled decisions (this session)

- **New sibling silo** — not a promotion of `speak-md`, and not a third silo
  sitting on the coupling surface (canonical text → cue → prosody).
- **`speak-md` is kept as the actuator** (the pipe). Its library and play move;
  the pipe stays. The pig is not the pipe.
- **okuda keeps what it requires** — the frame, the cue seam, the cast verdicts,
  the standard's pedigree — and **copies the constitutional form** to Blandings.
- **Copy the form, cite the content.** The constitutional scaffold (Protocol,
  register layout, tooling) is instantiated per silo and is copied. okuda's
  *content* — frame, cue class, cast verdicts, the text standard — is **cited
  across silos, never mirrored**: two authoritative copies is the drift source
  ADR-027 names (*a stale ledger, misleading confidently*).
- **Public on day 1**, with a **corpus policy**: only texts that are PD in the
  relevant jurisdictions are committed (Wodehouse *Company for Gertrude* 1928 =
  US-PD 2024; Wells = PD). Borges and Calvino are in copyright and are **never
  committed** — referenced by title, read from local files.
- **The text standard is the property, not the canon** — the comic periodic
  sentence, densest in early-20th-century comic prose (Wodehouse, Benson), plus
  the translated Borges/Calvino. See the repertory company doc (Blandings).

## Scope

**In:**

- The minimal constitutional set for a silo (the residue after subtraction):
  `README.md`, `AGENTS.md`, the Protocol pointer / `system.md`, a `justfile`
  (the actuator surface), the registers with `INDEX.jsonl` + human index,
  `.gitignore`, the `origin` remote, and a founding record.
- Blandings: provisioning, the moved remainder, the rights/corpus decision, the
  public push.
- The commissioning procedure recorded as a playbook + template.

**Out:**

- Any speech code in okuda — the cue/voice boundary stands. No prosody
  parameter, pause constant, voice name, or lexicon lands in okuda.
- A third repo on the coupling surface.
- Committing in-copyright texts.
- Model training or fine-tuning (the unsloth *experiments* move; the *weights*
  are their own concern).

## Preconditions

- [ ] The acoustic half of `briefs/2026-10-05-brief-ast-to-prosody-unsloth.md`
      re-homed to Blandings — its prosody IR and backend compilers contradict
      the cue/voice boundary if built in okuda.
- [ ] The voice findings still in `tmp/` extracted to a record before the raw
      moves: `tmp/` owes nothing, and the auditions are the *evidence the
      practice is live* the lifecycle ADR demands.
- [ ] The rights question asked and answered — the Derrida question before the
      eval.

## Work plan

1. **Extract the constitutional residue.** Enumerate okuda's constitutional
   items; subtract okuda-specifics; the remainder is the checklist + template.
2. **Provision Blandings from the template** — its first use, which validates
   the scaffold. `git init`, GitHub remote, public.
3. **Move the remainder** — narrative library, elocution playbook, auditions,
   house-terms, the Moira recital/audition material, the acoustic half of the
   AST-to-prosody work. Cite-not-copy the okuda content.
4. **Repair the citation graph across silos** — `&speak.md`,
   `playbooks/ear-playbook.md`, the repertory company doc (Blandings). A
   moved document must not leave a dangling reference.
5. **Record the rights/corpus policy** as a decision in Blandings.
6. **Push public; run the visitor test on a cold clone.**
7. **Subtract and record** — the commissioning playbook, and a debrief. Decide
   its home: okuda's `playbooks/` (the reference implementation) or the
   protocol's own tier, by the general/local test.

## Acceptance criteria

- **The visitor test:** a cold clone → `just` → a visitor can state what the
  silo is, find the work, run the actuator, and read the standard — from the
  repository alone.
- **The barnacle test, explicit because the last spin-off failed it:** after the
  move there is no orphaned reference, no duplicated authoritative content, no
  stale index row, and no scope creep. Concretely — `just check` green in both
  okuda and Blandings; no registry drift; the citation census resolves in okuda;
  the AST-to-prosody callsign resolves to its new home.
- **The class delivered:** the commissioning playbook + template exist and were
  *used* — Blandings was provisioned from them, not hand-copied.
- **Rights:** only PD-in-jurisdiction texts committed; a decision records the
  policy; no in-copyright text in the public repository.

## The barnacle test

Named for the lesson of the previous spin-off: a spin-off leaves barnacles —
stale copies, dangling citations, an index that points at yesterday, two
authorities for one fact. The class is *the stale ledger, misleading
confidently*. The test is one line: **every citation that existed before the
move resolves after it, and every authority is single.** A spin-off that cannot
pass this is not done.

## Risks

- **Over-generalising the template on n=1** — mitigated by extracting from the
  instance rather than inventing.
- **Drift via copied content** — mitigated by copy-the-form, cite-the-content.
- **Rights** — mitigated by the corpus-policy decision, PD-only commits, and
  keeping in-copyright texts local.

## Related

- the repertory company doc (Blandings) — the casting doctrine and the
  bloodline (Wodehouse)
- `playbooks/ear-playbook.md` — the three-stage pipeline; `speak-md` the
  flattener
- `decisions/036-no-speech-code.md` — the cue/voice boundary
- `decisions/033-punctuation-over-legacy-speech-tags.md` — the voice and the
  pause are not ours to tune
- `decisions/057-document-lifecycle.md` — the registers; the citation graph as
  the oracle
- `briefs/2026-10-05-brief-ast-to-prosody-unsloth.md` — the acoustic half moves
- `&speak.md`, `&ear.md` — the speech vector and the ear queue
- `~/Dev/GitHub/speak-md` — the actuator, kept
