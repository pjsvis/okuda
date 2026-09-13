---
type: ADR
callsign: ADR-NO-SPEECH-CODE-036
---

# Decision: No speech code in this repo — the cue is okuda's, the voice is the environment's

**Date:** 2026-09-13
**Status:** Accepted

## Context

The rule is old; the record is new. Since the silo was born, two documents
have said the same thing in prose. `&speak.md`: *"the silo is a sibling, not
a subordinate: okuda renders what the environment points at — the filesystem
is the message bus — and no speech code lives in this repo."* BRF-OKUDAGRAM-STEP:
*"okuda owns the paragraph **bounds**, not the voice… okuda reacts, it never
narrates. No speech code lands in this repo."*

What was missing was the record. BRF-CENSUS-MODE's non-goals cite *"No speech
anywhere (ADR-035)"* — and **ADR-035 was never written**; `decisions/` ended at
034, and the number's only occurrence in the corpus was that citation. Two
problems, and the second is the serious one:

0. **The number was already taken, and the citation pointed at the wrong
   document.** `ADR-035` is *Dogfoods are single-modality — the primary field is
   the test field*, dated 2026-09-12 and committed on `feat/keyboard-dogfood` —
   **an unmerged branch.** So the citation named a number that belonged to a
   different decision entirely. This ADR is therefore **036**, not 035: the
   number was claimed first, and a citation to a number is not a citation to a
   rule. (Found during the tidy-first pass, 2026-09-13. The lesson generalises:
   *a number that looks free on `main` may be claimed on a branch* — check
   `git for-each-ref` across branches before minting one.)
1. **A rule with no record cannot be applied, only invoked.** When
   BRF-AUDIO-DISCOVERY proposed a cue channel — feedback about the actuator
   grammar, not speech — its whole scope argument rested on a distinction
   between *speech code* and *narration* (forbidden) and *state feedback*
   (proposed). That distinction was real in prose and had nowhere to live. A
   brief cannot be the authority for what a rule governs; the brief is the
   party with an interest.
2. **The citation as written overstates the rule.** *"No speech anywhere"* has
   no boundary, so it forbids by assertion rather than by test — and read
   literally it would forbid the cue channel that the canon itself invites.
   ADR-032 says *doubled = the system talks, mixed = the document moves*: a
   grammar in which the system is already the party that speaks. A dangling
   citation that overstates a rule is worse than a missing one, because it can
   be used to forbid things.

So the ADR gets written, and the citation gets sharpened to match it. The rule
was never *no speech anywhere*; it was always narrower, and the narrow form is
the one with a boundary.

## Decision

**No speech code lands in okuda, and okuda never narrates.** okuda emits
**cues** — a class and its text; the environment emits **voice**. The rule
governs *code* and *narration*; it does not govern *state feedback*.

Stated as the two things it forbids:

- **No code.** okuda does not call `say`, or any engine; it does not detect a
  voice, choose a rate, or hold a lexicon. It delegates through a single
  environment binding, silent when unset — the `OKUDA_CLONE_CMD` pattern, where
  okuda hands the tab to the host and carries no window manager. With the
  binding unset, okuda's output is byte-identical to today.
- **No narration.** Narration is **egress of content** — the document, spoken.
  That is BRF-TTS-STEPPER's pipeline, configured on the silo side. Feedback
  about **state** is a different thing on the same channel: the reader's own
  grammar, acknowledged.

**The boundary test — whose text is it?** A document's text is content, and
okuda never speaks it. A report about the reader's own input is state, and
okuda may name it. The one edge worth naming, because it looks like content and
isn't: a cue that says *"clone"* speaks a **verb from the reader's grammar**, not
a word from the document. It is the reader's input, echoed back.

```mermaid
title: The division of labour
flowchart LR
    O[okuda] --> K[the cue: class and text]
    K --> E[the environment]
    E --> V[the voice]
```

```mermaid
title: The category error
flowchart LR
    O[okuda] --> S[say]
    S --> V[a voice okuda chose]
```

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Write the rule as *"no speech anywhere"* (the citation as it stood) | Overstates the rule and forbids the cue channel the canon invites. Worse, it has no boundary, so it cannot be applied — only invoked. A rule you can't test is a rule that decides nothing. |
| okuda calls `say` directly, behind a flag | Puts engine, voice and rate selection in the renderer — the category error ADR-033 already rejected, and it makes okuda's output depend on a voice class. It also forfeits the byte-identical-when-unset property. |
| A narration channel in okuda (okuda speaks the document) | That is BRF-TTS-STEPPER's egress pipeline, and duplicating it here forks the channel. It also breaks BRF-OKUDAGRAM-STEP's one real coupling: the paragraph *definition* must be identical in both silos or the screen and the voice desync. |
| Fix the citation, don't write the ADR | Leaves the rule with no record at the exact moment a brief begins relying on its scope. The prose rule is real; the record is what's absent. Both fixes are cheap and the record is worth more. |

## Consequences

**What became easier:**
- The cue channel is legitimate **by decision** rather than by inference from a
  brief that wants it.
- *"Should okuda speak X?"* now has a one-line test — *whose text is it?* —
  instead of a prose appeal.
- The byte-identical-when-unset property is a citable requirement rather than a
  hope, which is what makes the binding safe to add to a keystroke path.
- BRF-CENSUS-MODE's citation resolves without weakening its point: census mode
  is still actuation-side only, and now cites a rule that says so.

**What became harder:**
- Every future audio idea must be **classified** before it is designed. The
  distinction is cheap to state and easy to fumble at the edges; the *"clone"*
  case above is the worked example of the hard edge.
- okuda acquires a second outbound channel whose delivery it cannot observe. It
  holds a handle and can void a cue; it can never know whether one was spoken.
  A cue path that reports success would be a lie about a process okuda doesn't
  own.

**Constraints this imposes:**
- **okuda contains no prosody parameter and no pause constant.** No pitch,
  volume, rate, register, voice name, or duration in the input or cue path.
- The binding is **silent when unset**, and with it unset okuda's output is
  byte-identical to today: no new writes, no process spawns.
- A cue is emitted as a **class and its text**. Everything about how it sounds —
  engine, voice, cast, pause — belongs to the environment (ADR-033).
- okuda never reads a document aloud, and never emits a document's text on the
  cue channel.

## Related

- Brief: `briefs/2026-09-13-brief-audio-discovery.md` (BRF-AUDIO-DISCOVERY) —
  the cue channel this ADR authorises, and the brief that found the dangling
  citation
- Brief: `briefs/2026-09-12-brief-census-mode.md` (BRF-CENSUS-MODE) — carried
  the citation to a document that did not exist; the citation is sharpened here
- Brief: `briefs/2026-09-07-brief-okudagram-step.md` (BRF-OKUDAGRAM-STEP) —
  *okuda owns the paragraph bounds, not the voice… okuda reacts, it never
  narrates*
- Brief: `briefs/2026-09-10-brief-tts-stepper.md` (BRF-TTS-STEPPER) — the
  egress pipeline that is the silo's, and the non-goal that TTS gets no separate
  key grammar
- ADR: `decisions/033-punctuation-over-legacy-speech-tags.md` — why the voice
  is not ours to tune
- ADR: `decisions/035-dogfoods-are-single-modality.md` — the decision that had
  already claimed 035 (on `feat/keyboard-dogfood`, unmerged), which is why this
  one is 036
- ADR: `decisions/032-repeated-digit-actuators.md` — *doubled = the system
  talks, mixed = the document moves*: the canon that decides which tokens are
  voiced
- `&speak.md` — the silo, *no speech code lives in this repo*, and `00`'s
  existing stop-the-voice meaning
- `docs/2026-09-06-protocol-free-text-identity.md` — a text receiver and a
  restricted-grammar text emitter, protocol-free on both ends
