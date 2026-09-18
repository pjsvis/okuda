---
type: Brief
callsign: BRF-PERIMETER-SILO
date: 2026-09-18
---

# Brief: The perimeter silo — the speech doctrine and its records leave okuda

**Created:** 2026-09-18
**Status:** Open
**Lineage:** ADR-PERIMETER-039 and the tier census in `docs/2026-09-18-a-perimeter-not-a-project.md` — the silo carries 25 speech-named documents, and every `.txt` file git tracks in okuda is a rendered TTS artifact
**Extends:** `BRF-PERIMETER-GATE` and `BRF-PERIMETER-RUNNER` — those clear the task runner; this clears the silo.

## Objective

Leave okuda's silo holding only the speech documents that describe okuda's own output,
and relocate the rest to `../speak-md/` with their registry entries.

## Scope

**In:** `playbooks/ear-playbook.md`, `&ear.md`, the Moira documents in `docs/`, the three
rendered `.txt` files, `briefs/2026-09-10-brief-tts-stepper.md`, the relocation of
`decisions/033`, the two untracked speech candidates, and the `&next.md` row that carries
the speech set.

**Out:** the `justfile` and `tmp/` (`BRF-PERIMETER-RUNNER`); `ADR-PERIMETER-039`,
`ADR-NO-SPEECH-CODE-036`, `ADR-DOGFOODS-ARE-SINGLE-MODALITY-035` and
`ADR-REPEATED-DIGIT-ACTUATORS-032`, which constrain okuda's source and instrument and
stay; `&speak.md`, which is okuda's pointer at the sibling; and
`docs/2026-09-15-the-search-panel-speech-first.md`, which is a design note about okuda's
own search surface.

## Preconditions

- [x] `ADR-PERIMETER-039` is Accepted. **Verified 2026-09-18.**
- [x] The tier census is taken against **tracked** files. **Verified 2026-09-18** — 137
      tracked in `docs/` against 160 on disk; a directory listing overcounts by 23.
- [x] `../speak-md/` carries its own registry convention: **the README is the registry**
      (`../speak-md/AGENTS.md` rule 5). **Verified 2026-09-18.**
- [x] `decisions/INDEX.jsonl` and `decisions/index.md` are both editable by hand, and
      `reg-sync-fix` regenerates `index.md` only. **Verified 2026-09-18** —
      `playbooks/registry-playbook.md`.
- [x] `docs/2026-09-17-ssml-voice-tags.md` is untracked. **Verified 2026-09-18.**

## Work Plan

1. [ ] Split `playbooks/ear-playbook.md`. **Keep** *The voice reads at 80 columns* and the
       okuda half of *Strip the escapes before you judge* — `terminalSize()` returning null
       for a non-TTY, the `terminalCols(80)` fallback, `say` treating a line break as a word
       boundary, and `roleBold` emitting `\x1b[1m` in `none` mode (`src/ansi.ts:100-104`).
       **Move** *The rewrite rules* (rules 4, 5 and 6 are `speak-md`'s code), *The specimen
       tier*'s speech rationale, *The probe is a finder, not the judge*, and *The cast*.
2. [ ] Retitle or keep the H1. `PLY-EAR`'s registry `summary` is derived from the H1 and
       **never re-derived**, so a retitle needs a hand-edit to **both**
       `playbooks/REGISTRY.jsonl` and `playbooks/index.md`; a retitle alone leaves the
       picker's evidence string describing the old title and `just reg-sync` reporting
       **0 missing, 0 stale**.
3. [ ] Move `&ear.md` to `../speak-md/`. It is the audition queue, and the auditions run
       in the sibling. okuda's root nav becomes `&alpha.md`, `&briefs.md`, `&next.md`,
       `&speak.md`.
4. [ ] Move `docs/2026-09-10-moira-prosody-probe.md`, `docs/2026-09-10-moira-showcase.md`
       and the three rendered `.txt` files — `2026-09-10-moira-prosody-probe-rendered.txt`,
       `2026-09-10-moira-showcase-rendered.txt`,
       `2026-09-10-pleasant-irish-profanity-tts-rendered.txt`. Those three are the silo's
       only non-markdown artifacts, and the directive is that documentation is markdown.
5. [ ] Move `briefs/2026-09-10-brief-tts-stepper.md`. ADR-036 describes it as *the egress
       pipeline that is the silo's*, so the brief follows the pipeline. Remove its
       `briefs/INDEX.jsonl` row in the same commit and run `just reg-sync-fix`.
6. [ ] Relocate `decisions/033-punctuation-over-legacy-speech-tags.md`. It decides `say`'s
       tag support, voice classes and SSML — the environment's. **Leave a tombstone at
       `033`** that keeps the number, the callsign and the date, and names the new
       location. The number is **not** reissued: a citation to a number is not a citation
       to a rule (ADR-036's own lesson). Hand-edit both registry files.
7. [ ] Adjudicate the four uncertain documents against the test — *does it read okuda's
       bytes, or describe them?* `briefs/2026-08-29-audio-style-guide.md` (BRF-AUDIO-STYLE),
       `briefs/2026-09-14-brief-speech-stride.md` (BRF-SPEECH-STRIDE),
       `briefs/2026-09-15-brief-spoken-block-grammar.md` (BRF-SPOKEN-BLOCK-GRAMMAR) and
       `docs/2026-09-14-qwen2-audio-at-the-ingress.md` (closed, no integration proposed).
       **A document cited by a live ADR in okuda's `decisions/` stays** — moving it breaks
       the record. ADR-037 cites BRF-SPOKEN-BLOCK-GRAMMAR, so that one stays.
8. [ ] Remove `docs/2026-09-17-ssml-voice-tags.md`. It is untracked, unregistered, has no
       frontmatter, opens `# writing for TTS` and carries *15 to 20 words max* — the twin
       of the STE clip removed 2026-09-18, and a mirror of a live external document cannot
       be kept true. It also re-opens the SSML question ADR-033 settled on 2026-09-09.
9. [ ] Correct `&next.md`'s *Not next — deliberately* row: the speech set leaves okuda's
       decision table. Keep the `BRF-SPOKEN-BLOCK-GRAMMAR` citation, which step 7 retains.
10. [ ] Sweep okuda's silo for references to every moved path, and correct the ones that
        are live claims. `playbooks/ear-playbook.md`'s pipeline section names `just moira-*`
        — that line goes with step 1. A **record** that cites a moved path is not
        corrected (`okuda-drift-sweep`): a debrief describing what happened keeps saying
        what happened.

## Acceptance Criteria

- `playbooks/ear-playbook.md` holds only the two okuda sections, plus its frontmatter,
  title and Related.
- `PLY-EAR`'s registry `summary` matches the playbook's current H1, and
  `just reg-sync` reports **0 missing, 0 stale**.
- okuda's root nav holds four `&` files, and `&ear.md` is not one of them.
- No `.txt` file is tracked anywhere in okuda.
- `docs/` holds no document that describes how the voice sounds, other than the two
  surviving ear-playbook sections.
- `decisions/033` exists as a tombstone naming the new location, its callsign is
  unchanged, and no other ADR has taken the number.
- The four uncertain documents each carry a recorded verdict, and each verdict names the
  test it was decided by.
- `docs/2026-09-17-ssml-voice-tags.md` is gone from disk.
- Every moved document is registered in `../speak-md/` per its rule 5.
- `just check` is green, and `just tables-check` lists none of the edited files.
- No live document in okuda's silo references a moved path.

## Notes

**The registry surgery is the dangerous half.** `reg-sync-fix` repairs the whole silo, not
your document: one run on 2026-09-18 removed a row for a file that no longer existed,
added a row for another session's untracked brief, and wrote frontmatter into a document
nobody opened. Read its banner before staging anything, and commit by explicit pathspec.

**`briefs/INDEX.jsonl` carries a foreign row today.** `2026-09-17-brief-bm25-evaluation.md`
is untracked and its registry row is unstaged in the working tree. A `git add` of the
registry file commits a stranger's work; the staged blob is built by hand instead
(`okuda-land-brief`, *hunk-level staging fails when the foreign lines sit inside your
hunk*).

**A moved document is a broken reference until swept.** The sweep in step 10 is the
acceptance criterion most likely to be skipped, and it is the one that decides whether
the perimeter holds. `okuda-drift-sweep` covers what is a live claim and what is the
record.

**This brief does not touch the `justfile`.** If it finds a recipe referencing a moved
document, it reports the path to `BRF-PERIMETER-RUNNER` rather than editing it — one
logical change per commit.

## Related

- ADR: `ADR-PERIMETER-039` — the perimeter this enforces
- ADR: `ADR-PUNCTUATION-OVER-LEGACY-SPEECH-TAGS-033` — the decision that relocates
- ADR: `ADR-NO-SPEECH-CODE-036` — stays, and supplies the test this brief applies
- Brief: `BRF-PERIMETER-GATE`, `BRF-PERIMETER-RUNNER` — the other two thirds
- Playbook: `PLY-EAR` — the document this brief splits
- Survey: `docs/2026-09-18-a-perimeter-not-a-project.md` — the measurement
