---
date: 2026-09-14
kind: research note — an external model assessed against the silo's contracts
lineage: the reader's request (the Qwen2-Audio blog post, and *how could we
  integrate it*). Read against `docs/2026-08-30-voice-actuator-testing.md`,
  `explainers/accessibility.md`, ADR-032 / ADR-033 / ADR-036, `&ear.md`,
  `&speak.md`, and `DEPENDENCIES.md`.
status: closed — no integration proposed. One narrow use routed to the ear
  queue as an open question, not a plan.
---

# Qwen2-Audio at the ingress — the door is already built

> A 7B audio-understanding model, evaluated for a job that a phrase list
> and the operating system already do better. The finding is not that the
> model is weak. It is that okuda's ingress door was built to make the
> question moot.

## The question, restated

The request was *how could we integrate Qwen2-Audio into okuda*. Taken
literally that is unanswerable, because okuda has nowhere to put it — and
the reason is a decision already made and written down twice.

Qwen2-Audio is an **audio-understanding** model: audio in, text out. It is
not a synthesiser. So it cannot be Moir, cannot narrate a document, and
cannot touch the speech vector in `&speak.md`. It is an **ingress** model,
and okuda's ingress is not a thing okuda owns.

Under the three-concerns doctrine, the layer that turns sound into input is
a **compositor** — it writes into the byte stream, and *we do not care where
the text comes from*. So the honest form of the question is narrower than
the one asked, and more interesting:

> **Which recogniser fills the ingress slot?**

```mermaid
title: The ingress slot
flowchart LR
    M[microphone] --> R[the recogniser]
    R --> K[keystrokes]
    K --> O[okuda]
```

Everything left of `okuda` is outside the repo, and okuda's side of that
seam is already costless: `docs/2026-08-30-voice-actuator-testing.md` settled
it as phrase-matched keystroke injection, and the one-ingress rule —
*any input is accepted as long as it is translated to keystrokes* — means
**okuda needs zero changes to accept whatever the slot holds.** The slot is
open, and it costs nothing to have it open.

Which means this document cannot recommend an okuda integration, because
there is none to make. It can only answer the narrower question.

## What the model is

- **Released** — 2024-08-09, with `Qwen2-Audio-7B` and `-7B-Instruct`.
- **Size** — 7B nominal; the HF repo counts ~8B of parameters.
- **Modality** — audio in, text out. Understanding only, no synthesis.
- **Modes** — *voice chat* (no ASR module, no text prompt) and *audio
  analysis* (audio plus a text question).
- **Language** — 8+, including English, Chinese, Cantonese, French, Italian,
  Spanish, German, Japanese.
- **Audio window** — best under **30 seconds**; the blog's roadmap promises
  longer audio later.
- **Build** — Qwen LM plus an audio encoder; multi-task pretraining, then
  SFT, then DPO.
- **Runtime** — `transformers` built **from source**, plus `librosa`;
  `device_map="auto"`, i.e. a GPU.
- **Licence** — not named in the repo README; per-model on HF, and the
  README says commercial use needs no request.
- **Latency** — none published. Turn-based, with no streaming mode claimed.

The published benchmarks (LibriSpeech, Common Voice 15, Fleurs, Aishell2,
CoVoST2, Meld, VocalSound, AIR-Benchmark) show it surpassing Qwen-Audio and
the prior state of the art on those tasks. **That is a real result, and it is
not the relevant one.** Every task on that list is a *transcription or
classification* task. None of them is *the reader's two-digit grammar*.

## The two candidates

The slot has an incumbent, and it is not a placeholder.

```mermaid
title: Two candidates for one slot
flowchart LR
    S[the ingress slot] --> V[macOS Voice Control]
    S --> Q[Qwen2-Audio-7B]
```

`docs/2026-08-30-voice-actuator-testing.md` specifies the incumbent in
detail: macOS Voice Control runs its recognition **entirely on-device**, its
custom commands are **phrase-matched rather than free-dictation**, and it
fires fixed actions — insert text, press keys, run a Shortcut. The document
lists three invariants, and the second is the load-bearing one:

> **Deterministic execution** — phrase-matched commands fire fixed actions;
> no conversational parsing, no filler, **no LLM in the loop**.

Qwen2-Audio is an LLM, and putting it in the slot is the definition of the
thing that invariant forbids. That is not a coincidence to be argued away;
it is the whole shape of the model. It is also the point of it — *voice chat
without an ASR module* is a feature, and it is a feature for a conversational
assistant, not for a grammar with ten verbs.

| Axis | macOS Voice Control | Qwen2-Audio-7B |
|---|---|---|
| Latency | native, on-device | a 7B forward pass |
| Determinism | phrase-matched | stochastic |
| Dependencies | none | torch, weights, a GPU |
| Natural speech | needs a phrase | free-form |

The last row is the challenger's only win, and it is the axis the design
deliberately refuses. The vocabulary fits on one screen; the grammar is
bounded and *learnable in an afternoon*; the accessibility page's claim is
that *every voice command has a keystroke equivalent*, which presumes there
is a command to name. A natural-language front end for a ninety-token
grammar is a solution to a problem the design says does not exist.

## The two arguments that actually decide it

The table above is a comparison. Two of its rows are not comparisons but
disqualifications, and they are worth separating out.

### Latency is not a performance question here — it is a rule

`explainers/accessibility.md` states the first law of temporal
accessibility: **time belongs to the reader; the system never spends it, and
never takes it back.** The rest of the page is a catalogue of what the silo
refuses — the session timeout, the expiring link, the auto-advancing
carousel, each one *a system spending the user's time without permission*.
The page notes that WCAG's timing guidelines are satisfied *by architecture*:
*there are no timers to adjust.*

`BRF-AUDIO-DISCOVERY` then puts a number on the tightest case: the state cue
*needs latency under ~50 ms*, because its whole job is to arrive before the
reader's second key. A 7B parameter forward pass does not meet that, and no
amount of tuning makes it meet that. An LLM in the ingress path is the
system spending the reader's time, in the one place the silo has committed
to never spending it.

### The grammar's rare verbs are the destructive ones

This is the sharper objection, and the corpus already reasons in its shape.

The grammar is **80 vector addresses** (12–98 minus the doubled-pair class)
plus ten actuators, and every action is two presses. The doubled pairs are
the system verbs, and the two that matter most are `99` — which **clones**,
opening a new terminal — and `00`, which **stops anything Moira is saying
mid-sentence**. These are the rare cases, and they are the irreversible ones.

`BRF-AUDIO-DISCOVERY` already carries the reasoning, about a *human* error:
announcing *"clone pending"* on a single `9` would be **wrong nine times out
of ten**, because `9` followed by any of `0`–`8` resolves a vector. A
probabilistic classifier in front of that pair is the same error with the
error rate set by a model instead of by arithmetic — and the two verbs it
can get wrong are the two whose failure mode is worst. A coin flip on `99`
spawns a terminal; a coin flip on `00` either fails to stop the voice or
stops it when the reader wanted something else.

**The grammar is small enough that its errors are unnecessary and
catastrophic.** Two presses, eighty addresses, a keyspace a reader can hold
in their head. There is no ambiguity for a language model to resolve, and so
nothing for it to earn.

## The dependency class is a change of kind

`DEPENDENCIES.md` is a short table, and every entry is a small POSIX CLI:
`bun`, `just`, `git`, `td`, `mermaid-to-md`, `fzf`, `rg`. Its runtime note
is explicit — *the compiled okuda binary has zero external npm runtime
dependencies* — and its discipline is a sentence: **a missing dependency
halts the brief; it does not get worked around silently.** Each row carries
a `Verified` date, because a claim in this file is a claim we have checked.

Qwen2-Audio would add Python, torch, `librosa`, model weights, and a
`transformers` build **from source** — the blog's own instructions are
`pip install git+https://github.com/huggingface/transformers`, which is not a
released version at all. That is a category change from small POSIX tools to
a model runtime, and it would arrive in the same table as `mermaid-to-md`,
which is one 0.1.0 binary invoked per fence.

The licence is a second friction: the repo README names no licence and
defers to each HF repo, which sits badly in a table whose whole point is
that a dependency is a *verified* claim.

## What this document is not saying

Two negatives, because they are easy to get wrong in a corpus this deep in
speech work.

- **It is not a judgement on the model.** Qwen2-Audio is a good model doing
  a hard job well. The claim is that the job is not this one.
- **It does not reopen the speech vector.** Audio *understanding* is the
  opposite direction from audio *egress*. `&speak.md`'s rule — *no speech
  code lives in this repo* — is untouched by this document, and ADR-036's
  boundary test (*whose text is it?*) does not apply, because nothing here
  proposes to speak anything.

## The one honest use, and it is not in okuda

There is a place where an audio-understanding model would be doing work
nothing else in the stack does — and it is the **ear queue**.

`&ear.md` holds five open verdicts, each one a human listening session
returning a string. The queue's own shape is *run this, listen for this,
return the verdict*, and the questions are genuinely answerable ones:

- *the reverend at minus ten: two speakers or one in a mood*
- *the recital holds without the husk*
- *the v-class: classical w or schoolroom v*

Qwen2-Audio's **audio analysis** mode is literally *audio plus a question →
an answer*. So it could order that queue, flag which rows are worth a human
ear, and catch the ones where the material plainly fails — a triage, in front
of the listening, not a substitute for it.

Two hard caveats, and the first is the reason this is routed rather than
proposed.

**The ear rules.** A machine verdict is a category error, and the risk is
not that the model is wrong — it is **automation bias**. A verdict string
from a model looks exactly like a landed verdict, and `&ear.md` records its
verdicts as *the row empties, the verdict lives in the commit*. A model's
answer has not been heard by anyone, and it must never be written where a
verdict goes.

**"Oracle" already means something else here.** In this corpus the oracle is
a **reference renderer** — the espeak reading whose IPA is recorded in
`house-terms.md`, against which a candidate is compared and then judged *by
ear*. It is a reference, not a judge. Introducing a model that returns
opinions is a **new role**, not an existing one being filled, and a new role
needs a decision rather than a borrow of the old name.

So if this is pursued at all, it enters the way any machine-authored
material enters this corpus: as a **foreign draft to be reconciled** — the
ADR-027 pattern that `docs/2026-08-30-voice-actuator-testing.md` itself used,
under a header block that says what was scraped and what was kept. It is a
question for the silo, not a plan for okuda, and it is left open here.

## Non-goals

- **No voice ingress code in okuda.** The compositor is not ours. ADR-036
  stands, and `&speak.md`'s rule stands.
- **No new dependency.** Nothing in this document proposes an entry in
  `DEPENDENCIES.md`.
- **No reopening of the cue channel.** `BRF-AUDIO-DISCOVERY`'s seam, the
  patience contract, and the cast principle are untouched.
- **No ADR.** Nothing here reverses a prior decision or introduces a new
  pattern; this is a record of an assessment, which is what `docs/` is for.
  If the ear-queue triage is pursued, *that* gets the ADR, because it is the
  part that would be a new pattern.

## Related

- `docs/2026-08-30-voice-actuator-testing.md` — the ingress pipeline, the
  phrase-matched mapping, the Mode column, and the invariant
  (*no conversational parsing, no filler, no LLM in the loop*) that decides
  this
- `explainers/accessibility.md` — the one-ingress rule, the ladder
  (screen → TTS → braille → paper), and the first law of temporal
  accessibility
- `briefs/2026-09-13-brief-audio-discovery.md` — the ~50 ms state cue, the
  *wrong nine times out of ten* arithmetic, and the cue channel this document
  leaves alone
- `decisions/036-no-speech-code.md` — *the cue is okuda's, the voice is the
  environment's*, and the boundary test this document does not need
- `decisions/033-punctuation-over-legacy-speech-tags.md` — why the voice is
  not ours to tune
- `decisions/027-temperament-is-downstream-of-discipline.md` — *temperament
  is downstream of discipline*: the rule that a foreign-context draft is
  reconciled against the ledger before it lands, of which the voice-actuator
  document is a worked example
- `&ear.md` — the five open verdicts, and Moir's name row
- `&speak.md` — the silo, and `00`'s existing stop-the-voice meaning
- `DEPENDENCIES.md` — the dependency class this document declines to widen
- Qwen2-Audio: the blog (`qwen.ai/blog?id=qwen2-audio`), the technical report
  (arXiv 2407.10759), and the HF repos `Qwen/Qwen2-Audio-7B` and
  `Qwen/Qwen2-Audio-7B-Instruct`
