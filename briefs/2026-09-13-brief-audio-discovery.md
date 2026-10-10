---
type: Brief
callsign: BRF-AUDIO-DISCOVERY
---

# Brief: Audio discovery — the actuator grammar, heard

**Date:** 2026-09-13
**Status:** Open

## TD

td-d9e3fb (epic) — td-49bd49 cue seam, td-9f0ee6 patience contract, td-f0ff06 the cast principle, td-ec7f7f CSN is Moir's line, td-a42095 environment binding, td-e29b31 mode cue, td-fc17e9 the mis-numbered citation (resolved — ADR-036 written), td-08ee48 dogfood by ear

## Lineage

the reader's proposal — *hit a `9` and a TTS unit alerts the reader that the CLONE actuator is pending* — and its second half, which is the better half: *spin up Moira and tell her to wait five seconds before speaking; if another key is pressed inside Moira's pause she abandons the recital.* Then a third: *the recital could be done in a lower register — not quite a whisper, more of an aside*, which resolved into a cast rather than a pitch (see Register). Also the visibility gap BRF-PROLONGED-PRESS found and parked (td-51d5f4 — a pending digit is never painted), and ADR-032's own sentence, *doubled = the system talks, mixed = the document moves*, which turns out to describe an audio channel as well as a grammar.

## Objective

The actuator grammar is silent, and for one state it is also invisible. Give the
reader a second channel for the state they cannot see: the environment voices
what the grammar is doing. **okuda owns the cue; the environment owns the
voice.** And by the end of the Register section, one voice: **Moira narrates the
document, Moir speaks for okuda** — every cue class, alerts and notifications
included.

## The proposal, corrected

The proposal as stated is right in spirit and wrong in one arithmetic detail
that changes the design.

**A pending digit cannot name the actuator.** On a single `9` the actuator is not
yet determined, and for `9` the odds are stark: `9` then `9` is the clone, but
`9` then any of `0`–`8` resolves `90`–`98`, every one of which is a **vector**
(`src/keygrammar.ts`'s `verbFor`: `12`–`98` less the doubled pairs are vectors, `99`
is the clone).
Announcing *"clone pending"* on a single `9` would be **wrong nine times out of
ten** — and it would be wrong about the one thing the reader most needs to know.

So there are **two cues, not one**, and they are different in kind:

| Cue | Fires on | Can name | Right form |
|---|---|---|---|
| **State** | the first digit of a pair | the *digit* only | a **tone** — it must arrive instantly |
| **Identity** | the token resolving | the *actuator*, exactly | a **word** — `"clone"`, `"exit"` |

The split is not cosmetic. Prevention needs latency under ~50 ms and a tone
gives it; attribution can afford a word, because a word arrives after the fact
and by then the reader only needs to know *what happened*, not *what is about to*.

```mermaid
title: Two cues on one gesture
flowchart LR
    D[first key] --> T[tone]
    T --> E[second key]
    E --> W[actuator name]
    E --> S[silent]
```

Two cues, and only one of them can prevent. The tone says *something is
waiting*; the word says *what just happened*. The silent branch is the common
case — a jump — and it is deliberately silent.

## Patience — the pause belongs to the voice

A cue that speaks on the first key is a cue that speaks on every key. The
reader's proposal solves this without putting a clock in okuda:

> Spin up Moira and tell her to wait five seconds before speaking. If another key
> is pressed inside Moira's pause, she abandons the recital.

**Why this does not break the no-timer rule.** The rule exists so that the
reader's tempo is never an input to the *grammar* — a pending digit must not
expire because the reader was slow. A delayed announcement expires nothing: the
digit still waits forever, and the pair still resolves whenever the reader gets
there. The clock is in the *cue*, not the grammar. Concretely, and this is the
test of it: **okuda holds a handle, not a clock, and there is no pause constant
anywhere in the repo.** okuda says *"a pending cue, of this class"*; the silo
decides how long to wait. That is also what ADR-033 requires — the voice is not
ours to tune, and the silo's own doctrine is that a lexicon is *earned by ear*.
Five seconds is a starting value for the silo, not a number for us.

**And patience is what makes speech affordable at all.** Speech is expensive in
time — a word costs ~400 ms — so a channel that speaks on every keystroke is
unusable. Waiting for a *hesitation* is how the channel earns the right to speak.
A reader who types `12` in 150 ms never hears anything; a reader who presses `9`
and then stops has announced, by stopping, that they want to know. **The pause is
not a timeout. It is a hesitation detector**, and hesitation is exactly the state
in which a cue is worth its 400 ms.

**Abandonment is a correctness requirement, not a nicety.** Without it, a
delayed cue would be a **lie**: it would announce *"nine is pending"* after the
reader had already resolved `99` or aborted with `ESC`. The general rule is
cleaner than "abandon on keypress":

> **A cue is bound to a state, and it is spoken only if that state still holds.**

That is the same rule as the grammar's swallow, one layer up — a superseded event
is *dropped, not queued*. The grammar swallows the remainder of a run; the voice
swallows a cue the reader has moved past. Two layers, one principle, and it
generalises: if a new token resolves before an older cue has spoken, the older
cue is void.

**The delay is per cue class**, which is why the classes exist:

| Cue class | Patience | Why |
|---|---|---|
| **Pending** | patient — the voice waits | A cue about a hesitation should wait for a hesitation |
| **Identity** | immediate | The reader just acted; the receipt is the point |
| **Mode** | immediate | A focus transition is useless five seconds late — this is the cue that must not wait |

**The one thing the pause makes worse, and the answer to it.** The pending digit
is invisible (td-51d5f4), so for the five seconds before Moira speaks the reader
has **no feedback at all** — and silence for five seconds is indistinguishable
from a keypress that never registered. Delay and invisibility compound. The answer
is that the tone and the word do different jobs and only the word is patient:

- **The tone is immediate** — a cheap, non-linguistic acknowledgement that the
  key registered. It costs ~50 ms and needs no patience.
- **The word is patient** — the elaboration, spoken only if the reader actually
  stops.

So the proposal's mechanism is exactly right for the second half, and the first
half still wants an instant tick.

**And the canon already decides which tokens speak.** ADR-032: *doubled = the
system talks, mixed = the document moves.* A doubled pair is a system verb; a
mixed pair moves the document. So **only the doubled pairs are voiced** — `00`,
`99`, and the pocket's `11`–`88` as they bind. Vectors get nothing by default.
That single rule kills the chatter problem before it starts: jumps are the common
case (`12`, `13`, `14` …), system verbs are rare, and voicing the common case
would make the channel unusable within a minute.

## Register — the aside is a cast, not a pitch

The reader's instinct was that the pending recital should not sound like an
announcement. It should be an **aside** — lower, subordinate, *"not quite a
whisper."* Right about the quality, and the design already agrees with it: the
word is the patient half of a two-cue pair, spoken only into a hesitation, so it
is *already* the subordinate one.

The mechanism, though, is the one axis the silo has already ruled out. `&ear.md`
carries it as a **landed verdict**:

> **The register** — verdict A, by reframe: pitch-down is a **casting axis, not
> an attitude axis**. Below base, Moira doesn't get somber — her auntie fills in.

So `[[pbas -10]]` on the cue would not produce an aside. It would produce **a
second character** — and the corpus already has one at exactly that offset:
`tmp/aunt-interleave.txt` is a live specimen where `[[pbas -10]]` *is the
Reverend's dialogue*. A cue at minus ten would be **indistinguishable from the
document's own voices**, which is the one failure a cue cannot afford. The cue's
non-negotiable property is **identity** — the listener must know this is okuda
and not the text — and pitch-shifting the narrator makes the cue *more* like the
document, not less.

**ADR-033 says the same thing from the other side.** It rejected `[[pbas]]` and
`[[volm]]` because they are voice-class-specific: classic voices honour them,
neural and Siri voices *drop or vocalize* them. Vocalize is the dangerous half —
a tag that fails loudly speaks its own characters aloud. So pitch is not merely
the wrong axis; it is the **non-portable** one.

Which leaves the resolution the reader found, and it is the portable one:

> **Cast the voice. Don't modulate it.**

**Moir** — Moira's aunt, husky on account of the fags and whiskey. She is not a
lower register; she is a different speaker. A voice is portable where a tag is
not (`say -v Moir`, `espeak -v`, any engine), it cannot collide with the document
because a different speaker is unmistakable, and it costs the grammar nothing.
`&ear.md` has Moir in the queue already — *the names session*, the play
silo's `just house` (Blandings),
verdict pending: **mwah** vs **mwar** vs **more**. The cue channel gives that row
a reason to land.

```mermaid
title: Two ways to mark a cue
flowchart LR
    C[cue] --> P[lower pitch]
    P --> X[collides with dialogue]
    C --> V[own voice]
    V --> D[unmistakable]
```

```mermaid
title: Two voices, two jobs
flowchart LR
    D[the document] --> N[Moira narrates]
    S[okuda's state] --> R[Moir speaks]
```

**This is the consequence of ADR-033, not a violation of it.** The ADR chose
punctuation over tags because one protocol must serve every voice class. Casting
is that same principle applied to register: *the voice is the parameter, not the
tag.* Nothing in the cue path needs a prosody tag at all.

## The cast generalises — Moira narrates, Moir speaks for okuda

The reader's next step is the right one, and it is a *smaller* rule than the one
it replaces. Moir is not the pending cue's voice. She is **the system's voice**:

> **Moira narrates the document. Moir speaks for okuda.**

The channel no longer has to be enumerated. Any time okuda has something to say
— a pending digit, a resolved actuator, a focus change, a refusal, a limit — it
is Moir. Anything the document says is Moira. One rule, and it retires the
per-cue-class voice question entirely.

**And it maps onto a canon that already exists.** ADR-032 split the world in two
— *doubled = the system talks, mixed = the document moves* — and the reader has
now **named the speaker on the system's side of that line.** Moir *is* the
doubled-pair voice. The canon drew the boundary; the cast says who stands on each
side of it.

```mermaid
title: The cast follows the canon
flowchart LR
    A[a doubled pair] --> T[the system talks]
    T --> R[Moir]
    B[a mixed pair] --> M[the document moves]
    M --> Q[silent]
```

**Alerts are the one thing this generalisation puts under strain, and they are
worth answering rather than assuming.** The aside was *subordinate* — that was
its whole quality. An **alert** must be *noticed*, which is the opposite
requirement. If one voice carries both, the listener must be able to tell a
confiding aside from an alarm. Three answers, in order of preference:

1. **The tone is not Moir.** The earcon — the immediate half — is
   non-linguistic and therefore has **no voice at all**. It is unmistakably
   not-speech and unmistakably not-document, and it is where *noticeability*
   lives. So **earcons alert; Moir confides.** The two-cue split already
   separates them; this only says which half is a voice.
2. **Where Moir does speak an alert, urgency comes from *when* and *what*, not
   from *how loud*.** An alert fires immediately (no patience) and is short and
   declarative — *"no"*, *"gone"*, *"limit"*. An aside waits, and is
   conversational. The listener learns the difference from timing and content,
   and **neither one is a performance**.
3. **Rarity is the amplifier.** The canon split is now doing a second job:
   because vectors are silent and system verbs are rare, Moir's airtime stays
   low — and a voice that speaks seldom is a voice that is heard. **Chatter would
   not merely annoy; it would make the alerts inaudible.** The anti-chatter rule
   is a *noticeability* rule.

**And the one answer to reject:** making Moir louder, higher or faster for
alerts. That is per-class modulation — the thing BRF-AUDIO-STYLE's surviving
clause and ADR-033 both push against — and it would make her two people. A cast
is one voice; the moment it performs a mood per class, it is a narrator again.

**So the aside has two honest halves, and the alert does too:**

- **The word is Moir's** — patient, spoken only into a hesitation when it is the
  aside; immediate and declarative when it is the alert.
- **The tone is nobody's** — immediate, non-linguistic, and the half that can
  actually prevent. It needs no patience and no voice.

**The alert under-shoot answers itself.** The one real worry about a subordinate
cue is that an *alert* must be noticed. But the alert was never the word's job:
the tone is immediate and cannot be mistaken for the document, and the word
speaks only after the reader has already stopped — by which point they are
attending, and an aside is exactly what an attending listener wants. **The tone
prevents; Moir confides.**

**The price, and it is dearer now: Moir must be reserved.** Casting solves the
collision only if the cue's voice is one the document cannot be using.
`tmp/aunt-recital.txt` is a document whose *content* is an aunt with a husky voice
— so a cue in Moir over a document read in Moir would be the original collision
again, one layer down. And the reservation cannot be enforced by **voice name**,
because `&ear.md` records that *below base, Moira doesn't get somber — her auntie
fills in*: a document's own character voice can land in Moir's register by pitch
alone (`tmp/aunt-interleave.txt` is the Reverend at exactly `[[pbas -10]]`). So
the rule has to be stronger than "don't select Moir":

> **Moir is never a character in the document.**

Not as a narrator, not as a character, not by pitch. Otherwise a document about a
husky aunt eats the system's voice — and `tmp/aunt-recital.txt` is precisely that
document. That belongs in the lexicon doctrine, and it is the honest cost of a
cue with a personality: **the personality has to be unavailable to the text.**

**And it has one live consequence in the ear queue.** `&ear.md`'s CSN row —
*"the rate-only Computer Says No; does the drawl land without the husk"* — is
auditioning a **refusal**. But `CSN` is the *renderer's* diagnostic (`CSN: too
wide`, `CSN: too narrow / too complex`, BRF-MERMAID-HARD): a refusal is **okuda
talking**, which under the cast principle makes it Moir's line. **That row is
testing the wrong speaker, and it is trying to make Moira sound like a system by
removing the one thing that would have marked it as one.** Re-run it against Moir,
husk and all — the husk *is* the identity.

**What okuda does about any of this: nothing — and the generalisation makes the
seam *simpler*.** okuda emits a cue **class and its text**; it does not emit a
voice, and under the wider cast it does not even imply one. The mapping becomes
`class → (text, patience)` and `channel → voice` — one rule instead of one rule
per cue class. **The cast is entirely the silo's, and okuda's job got smaller as
the idea got bigger.** No prosody parameter, no pause constant, no voice name:
the same criterion as before, now load-bearing for a larger claim.

## Three reasons this is worth having

1. **It closes a gap this project already found and parked.** `numBuffer` is
   never read by the painter (td-51d5f4), so a pending digit waits — forever, now
   that there are no timeouts — with nothing on screen to say so. Audio is the
   natural second channel, and for this particular state it is *better* than the
   visual one: the pending state is transient and the reader's eyes are on the
   text, not the footer. A cue does not require looking away.
2. **The original defect was a focus failure, and focus is what audio is good
   at.** The reader's report was a held `0` spraying the *launcher's* query box:
   they had lost track of where their keystrokes were going. A cue at the session
   boundary — *"reader"*, *"launcher"* — fixes the **class** of failure, not the
   instance. **This is the highest-value cue in the whole idea, and it is not the
   one in the proposal.** The actuator cues are a nice-to-have; the mode cue is
   the one that would have prevented the bug that started all of this.
3. **Discovery — the reader's own word, and the right one.** A reader who hears
   *"clone"* when they press `99` has learned that `99` is clone. That is how a
   grammar is learned without a manual, and it is the audio pendant to the keymap
   reference (td-101a0f). Attribution and teaching are the same act.

## The collision, settled — the rule, and its missing record

**The settled rule.** `&speak.md` and BRF-OKUDAGRAM-STEP are unambiguous:
*"okuda owns the paragraph **bounds**, not the voice… okuda reacts, it never
narrates. No speech code lands in this repo."*

**This brief does not overturn it, and does not need to.** That rule governs two
things — *code* and *narration* — and this proposal is neither:

- It is not **code**: okuda must not call `say`, or any engine. It emits a cue;
  the environment voices it. That is exactly the `OKUDA_CLONE_CMD` pattern, where
  okuda delegates the tab to the host and carries no window manager.
- It is not **narration**: narration is egress of *content* (the document,
  spoken). This is feedback about *state* (the grammar, acknowledged). Different
  direction on the same channel.

So the design that satisfies both: **an environment binding, silent by default.**
`OKUDA_CUE_CMD` (name to be settled), run with the cue text as its argument;
unset means silent, and okuda's output is byte-identical to today. `say` is one
possible binding, not a dependency. Nothing speech-specific enters the repo.

**The citation, now answered — and it was overstating the rule, and pointing at
the wrong document.** BRF-CENSUS-MODE's non-goals cited *"No speech anywhere
(ADR-035)"*. Two things were wrong with that, and the missing document was the
lesser one.

1. **The number was already taken.** `ADR-035` is *Dogfoods are single-modality
   — the primary field is the test field* (2026-09-12), committed on
   `feat/keyboard-dogfood` — an **unmerged branch**, which is why `decisions/` on
   `main` appeared to end at 034. So the citation named a number that belonged to
   a different decision entirely. **This ADR is 036.** The generalisable lesson,
   and the reason this is worth writing down: *a number that looks free on `main`
   may be claimed on a branch* — check every branch before minting one.
2. **A rule with no record cannot be applied, only invoked.** This brief's entire
   scope argument rests on the *code/narration* versus *state feedback*
   distinction — and a brief is the party with an interest. It cannot be the
   authority for what a rule governs.
3. **"No speech anywhere" has no boundary**, so read literally it forbids the cue
   channel the canon itself invites — ADR-032 says *doubled = the system talks*.
   A citation that **overstates** a rule is worse than a missing one, because it
   can be used to forbid things.

**Resolved 2026-09-13: ADR-036 is written** (*No speech code in this repo — the
cue is okuda's, the voice is the environment's*), and BRF-CENSUS-MODE's citation is
sharpened to the rule's actual, narrower form. The ADR carries the boundary test
this brief depends on — *whose text is it?* — and names the hard edge: a cue that
says *"clone"* speaks a verb from the **reader's grammar**, not a word from the
document. See td-fc17e9.

## Two clients, one channel

BRF-TTS-STEPPER established TTS as a *configuration of the render/egress
pipeline* — the TUI's own actuator loop, with egress routed to `say` — and ruled
out a separate TTS key grammar (*"TTS doesn't get its own verbs"*). This brief
does not add a verb, so that non-goal stands untouched. But it does add a
**second client of the same channel**: egress of content, and now feedback about
ingress. They need a policy, because both can want the speaker at once:

- A document is being read aloud, and a keystroke resolves an actuator. Duck the
  speech, interrupt it, or queue the cue?
- `&speak.md` already gives `00` a meaning in this space — *"`00` stops anything
  Moira is saying mid-sentence"* — so an **interrupt precedent exists for exactly
  one actuator**, and it is the exit. That is a good place to start rather than a
  blank page: the grammar already has one audio contract, and it is
  one-directional (stop, not announce).

## Non-goals

- **No speech code in okuda.** No `say` call, no engine detection, no voice or
  rate selection. `&speak.md`'s rule stands.
- **No new key grammar.** No cue verbs, no audio-toggle key invented here. If a
  toggle is wanted it goes in the pocket, and the pocket's ledger owns it
  (BRF-TTS-STEPPER's non-goal).
- **No cues for the vector space by default.** Mixed pairs move the document,
  which the document itself already shows. Voicing them is the chatter failure.
- **No audio for the *content*.** This is not a second narration channel; that is
  BRF-TTS-STEPPER's.
- **No timer in okuda, and no pause value.** The patience lives in the voice
  process; okuda emits a *class* and holds a *handle*. The no-timeout rule
  (BRF-PROLONGED-PRESS) is about the grammar and it stands untouched — a cue that
  waits is not a digit that expires.
- **No pitch, volume, rate, or register — and no voice name.** The cue's *quality*
  is a casting decision and casting is the silo's (ADR-033, `&ear.md`); okuda
  emits a class and its text, and nothing else. The non-portable axes stay out of
  the byte stream entirely.
- **No engine, voice, or device selection.** That is the silo's (ADR-033), tuned
  by ear, out of band. Which is where Moir lives.
- **No per-class modulation of the voice.** Alerts do not get a louder Moir, a
  higher Moir, or a faster Moir. Urgency comes from *when* and *what* (and from
  the earcon); a cast that performs a mood per class is a narrator again, and the
  tag-based version of it is exactly what ADR-033 rejected.

## Scope

**In:**

- The **cue seam**: a pure function from (pending digit | resolved token) to a
  **cue class and its text** — testable with no audio device, and the piece that
  makes the whole thing unit-testable.
- The **patience contract**: okuda emits a class; the silo owns the pause. No
  pause constant in the repo.
- The **abandonment handle**: a cue is spoken only if the state it describes
  still holds, which means okuda must be able to void an in-flight recital.
- The **environment delegation**: one binding, silent when unset, no engine
  knowledge in the repo.
- **The cue's identity**: a cue must be unmistakable as *a cue* and not as the
  document. okuda's half is the **class** (which is what lets the silo pick a
  voice); the silo's half is the **cast and its reservation** — Moira narrates,
  Moir speaks for okuda, and no document may use her.
- **The cue vocabulary** — every class okuda can announce, not just the actuator
  cues: the pending digit, the resolved actuator, the mode/focus change, a
  refusal (`CSN`), a limit (the appetite guard). The cast is one rule for all of
  them; this brief enumerates only the first three.
- **The canon split**: system verbs voiced, document motions silent.
- **The mode/focus cue** — the reader/launcher boundary, which is the reason this
  brief exists.
- **The channel policy**: what a cue does to an in-flight utterance.

**Out:**

- The voice, the silo, the engine, the lexicon, **the pause value**, and **the
  cast** (`../speak-md/` owns all of it; Moir is theirs to name and to keep).
- Any change to the token space, the canon, or the grammar of BRF-PROLONGED-PRESS.
- The pending-digit *visual* indicator — td-51d5f4, separate, and the two should
  not be conflated: a listener needs the tone, a sighted reader needs the glyph,
  and neither substitutes for the other.

## Open questions

- **Is the state cue worth it at all, once the identity cue exists?** The
  argument for it is prevention: `99` *clones* — it opens a new instance — and
  with no timeouts a pending digit can sit for minutes. A cue at the first key is
  the only warning that exists. Leaning yes, but it should be dogfooded by ear
  rather than argued.
- **Tone or word for the state cue?** Both — patience separates them. The tone is
  immediate and cheap; the word is patient and only speaks into a hesitation.
  Answered by the proposal (see Patience).
- **Is the cue a cast or a cadence?** Settled in favour of the **cast**, and then
  generalised: not one cue class's voice but **the system's voice** — *Moira
  narrates the document, Moir speaks for okuda*. Pitch is the non-portable axis
  and it collides with the document's own voices (see Register). The residual is
  whether the *tone* also comes from Moir or stays a neutral earcon: a hum is
  cheaper and unambiguous, a word is warmer and risks being heard as the
  document. Dogfood it (td-08ee48) rather than argue it. Leaning: the tone is
  **not** Moir — noticeability is the earcon's job, and a voice is the wrong
  instrument for it.
- **Does the CSN audition belong to Moir?** `&ear.md`'s CSN row tests a
  **refusal** in Moira's voice, rate-only, husk suppressed — but `CSN` is the
  renderer's diagnostic (`CSN: too wide`, BRF-MERMAID-HARD), so a refusal is
  **okuda talking**. Under the cast principle that row is testing the wrong
  speaker, and it is trying to make Moira sound like a system by removing the one
  thing that would have marked it as one. Re-run it against Moir, husk and all.
  Leaning strongly yes — and it is the cheapest test of the whole cast principle,
  because the material already exists.
- **Is Moir reserved, or merely preferred?** The cast only buys identity if the
  document cannot be narrated in the same voice — and the reservation cannot be
  enforced by **voice name**, because a document's own character can land in
  Moir's register by pitch alone (`tmp/aunt-interleave.txt`: the Reverend at
  `[[pbas -10]]`). So the rule is stronger: **Moir is never a character in the
  document.** Record it in the lexicon doctrine, not just in this brief.
- **Does the cast principle extend past audio?** If Moir is *the system's voice*,
  the same question applies to the visual channel: is there a system register that
  is never the document's? The state-glyph tiers (`recede` / `watch` / `alarm`,
  ADR-015) already answer yes in colour. Worth checking the two vocabularies
  against each other before either grows.
- **How is a recital abandoned, mechanically?** The pause lives in the voice, so
  okuda must hold a handle it can close. Two shapes:
  - **Spawn a child per cue and kill it on the next key.** Simple and stateless,
    but it costs a spawn *and* a kill per jump, and a stale child is a cue that
    speaks over the reader's next action.
  - **Signal a long-lived voice process.** No per-key spawn, but it is a daemon —
    and `docs/2026-08-30-voice-actuator-testing.md` ruled out a custom audio
    daemon. That ruling was about *ingress* (a background listener for speech
    recognition), and a speaker for cues is not the same animal; still, the
    spirit needs addressing rather than assuming.
  Settle this before the seam, because it decides whether the seam *emits* a cue
  or *schedules* one.
- **Who reaps a cue at exit?** `cleanup()` already gains the drain
  (BRF-PROLONGED-PRESS, layer 3); it now also owns killing in-flight cue
  children, or a cue speaks after the terminal has been restored and handed back.
  The two mechanisms touch — sequence them together rather than in parallel.
- **What is the pause, and who owns the number?** The silo, not us (ADR-033).
  Which means okuda never contains it — the strongest available proof that the
  grammar stayed clock-free.
- **Opt-in, or always on when bound?** Silence by default is settled; whether the
  cues are individually selectable (pending / identity / mode) is not. Leaning:
  one binding, three cue classes, all on — a reader who binds it wants to hear it.
- **Added 2026-09-21 — does the cast survive a device boundary?** The voice inventory is
  not shared across macOS, iOS and iPadOS, so *Moir is never a character in the document*
  cannot be enforced by name on a device whose voice set differs. Proposal: declare the
  cast as a **role with a per-device binding** (`role → voice`), which is the shape the
  cue seam already uses for `class → text`. `docs/2026-09-21-the-model-beside-the-loop.md`.
- **Added 2026-09-21 — is the phrase set safe per recognizer?** The destructive tokens
  (`99`, `00`) are the two whose failure mode is worst, and a phone's recognizer is not
  the Mac's, so the adversarial pass over the spoken phrases wants running once per
  recognizer, with the ear as the judge. Same document.
- **Added 2026-09-21 — the mapping table has an inert row.** `"Vector one one"` injects
  `11`, a doubled pair that resolves to `null`; the phrase does nothing. The live claim is
  `docs/2026-08-30-voice-actuator-testing.md:69`, and the sweep is scoped in
  `docs/2026-09-21-the-model-beside-the-loop.md`.
- **Does the mode cue belong at the session boundary or in the grammar?** It is
  arguably the *host's* (it is a focus transition, and windowing is the host's).
  But okuda is the thing that knows the session ended, so okuda is the thing that
  can emit it. Resolve with the ADR.

## Acceptance Criteria

* With the cue binding **unset**, okuda's output is byte-identical to today —
  silent, no new writes, no process spawns.
* **okuda contains no pause constant.** The word `5000` (or any duration) does not
  appear in the input or cue path; the patience is the silo's.
* **okuda contains no prosody parameter.** No pitch, volume, rate, register, or
  voice name appears in the input or cue path — no `pbas`, no `volm`, no `Moir`.
  The cue's *quality* is a casting decision, and casting is the silo's.
* **okuda implies no voice.** The seam maps `class → (text, patience)` and stops;
  no cue class carries a voice hint, and the cast is resolved entirely on the silo
  side. This is what lets one cast serve every class — and it is the test that the
  generalisation actually simplified the seam rather than moving work into it.
* With it set, a **doubled pair emits exactly one cue**, naming the actuator
  (`"clone"`, `"exit"`).
* A **mixed pair emits no identity cue** by default.
* A **pending digit emits at most one state cue**, and it names the digit — never
  the actuator.
* **A cue is spoken only if the state it describes still holds.** A pending cue is
  abandoned when the pair resolves or is aborted, and a cue in flight is voided
  when a newer one supersedes it. Asserted as: after a fast `12`, nothing is ever
  spoken about the `1`.
* The **tone is immediate and the word is patient** — a fast keystroke produces no
  speech at all.
* No cue is emitted after the session ends (`cleanup`), and a held key does not
  emit a cue per repeat byte.
* The cue seam is pure and unit-tested: a table of (input → class, text) with no
  audio device in the test.
* `just check` passes and `bun test` is green.

## Risks

- **Latency makes a bad cue worse than no cue.** A word arrives after the reader
  has acted; the tone is the half that can prevent, and it must not be delayed
  with the word.
- **Delay and invisibility compound.** For the seconds before a patient cue
  speaks, a reader with no visual indicator has *no* feedback at all — and
  silence is indistinguishable from a lost keystroke. This is the strongest
  argument for the immediate tone, and the second-strongest for td-51d5f4.
- **A stale recital is a cue that lies.** Abandonment must be reliable, and it
  must survive the session ending — a cue that speaks after `cleanup()` is both
  wrong and intrusive.
- **The spawn lifecycle is a new failure surface.** A spawn and a kill per jump is
  a lot of plumbing in a keystroke path; a long-lived voice process is cleaner but
  collides with the no-daemon stance. Settle it before building.
- **Chatter is one wrong decision away — and under the wider cast it is worse
  than annoying.** Voicing the vector space would make the channel unusable; but
  now that Moir carries *every* alert, chatter would also **drown the alerts**,
  because noticeability rests on rarity once the voice identity is constant. The
  canon split is the guard, and it should be stated in the seam's comment rather
  than left to discipline.
- **A cue that sounds like the document is not a cue.** The cue's non-negotiable
  property is *identity*; a pitch-shifted narrator makes it *more* like the text,
  and the document already contains voices at the offset that reads as "aside"
  (`tmp/aunt-interleave.txt`). Casting is the fix — and under the wider cast the
  reservation gets harder, not easier: it cannot be enforced by **voice name**,
  because a document's own character lands in Moir's register by pitch alone. The
  rule has to be *Moir is never a character in the document.*
- **A cue with a personality can wear — and she now speaks more often.** Moir is
  charming once and possibly grating on the hundredth alert. The mitigation is
  structural (the canon split keeps her airtime low; the aside still only speaks
  into a hesitation), but the generalisation raises the stakes, and it should be
  dogfooded by ear rather than assumed.
- **One voice carrying both the aside and the alarm.** The aside is subordinate
  and the alarm must be noticed — opposite requirements, one speaker. Answered by
  the earcon carrying noticeability and by urgency living in *when* and *what*
  rather than *how loud* (see Register), but it is the load-bearing assumption of
  the generalisation and the first thing a dogfood should try to break.
- **Two clients, one speaker.** An in-flight spoken document plus a cue is a
  policy question with no precedent except `00`.
- **The classification edge is the "clone" case.** ADR-036's test is *whose text
  is it?* — and a cue naming an actuator speaks a word that *looks* like content.
  The ADR answers it (a verb from the reader's grammar, not a word from the
  document), but the edge will be tested again by the next cue anyone proposes,
  and each answer belongs in the ADR as a sentence rather than a fresh argument
  in a brief.
- **Discovery could become dependence.** A reader who learns the grammar by ear
  may not learn the keys. The cue teaches the binding; it must not become the
  only place the binding is recorded — td-101a0f stays the refereed place.

## Related

- ADR-032 — *doubled = the system talks, mixed = the document moves*: the canon
  this brief makes literally audible
- BRF-PROLONGED-PRESS (td-f62045) — the three-gesture contract, td-51d5f4 (the
  visibility gap this closes for a listener), and the **swallow rule**, whose
  voice-layer instance is abandonment: a superseded event is dropped, not queued
- BRF-TTS-STEPPER — TTS as a configuration of the egress pipeline; the non-goal
  this brief must not break (no separate key grammar)
- BRF-TTS-TEMPORAL — the egress extractor, the other direction of the channel
- ADR-033 — punctuation over legacy speech tags: why the voice — and the pause —
  is not ours to tune, and (see Register) why **casting is the consequence of that
  decision rather than a violation of it**: a voice is portable where a tag is not
- `&ear.md` — the **landed register verdict** (*pitch-down is a casting axis, not
  an attitude axis; below base, Moira doesn't get somber — her auntie fills in*),
  Moir's open name row (*mwah* vs *mwar* vs *more*) which this brief gives a
  reason to land, and the **CSN row**, which under the cast principle is
  auditioning the wrong speaker
- BRF-MERMAID-HARD / td-3f5fa1 — where `CSN` lives: *too wide*, *too narrow / too
  complex*. A refusal is the renderer's diagnostic, which makes it **okuda
  talking** and therefore Moir's line
- ADR-015 (alert palette role) and BRF-STATE-GLYPH — the visual
  precedent for a **system register that is never the document's**: the
  `recede` / `watch` / `alarm` tiers are already a cue vocabulary in colour
- `tmp/aunt-interleave.txt` — the specimen: `[[pbas -10]]` is already the
  Reverend, so a pitch-shifted cue collides with the document's own dialogue
- `tmp/aunt-recital.txt` — the other half of the reservation argument: a document
  whose content *is* a husky aunt, and therefore the document that would eat a
  Moir cue
- BRF-AUDIO-STYLE — the surviving bound (*volume adjustments and pause durations
  without requiring voice-acting modulation*): a cue is a **state signal**, not a
  visual-to-audio mapping, so the bound's subject is the demolished outbound
  markup; and a fixed cast for a fixed channel is one voice doing one job, which
  is the opposite of per-element acting
- `docs/2026-09-06-protocol-free-text-identity.md` — *the protocol we didn't build
  is the feature*; casting is that thesis applied to register
- ADR-036 — *No speech code in this repo — the cue is okuda's, the voice is the
  environment's*: the record this brief's whole scope argument rests on, written
  2026-09-13, with the boundary test (*whose text is it?*) and the *"clone"* edge.
  Numbered 036 because **035 was already claimed on an unmerged branch**
- ADR-035 — *Dogfoods are single-modality — the primary field is the test field*
  (2026-09-12, on `feat/keyboard-dogfood`): the decision that took the number, and
  the reason a "free" number on `main` isn't free
- BRF-CENSUS-MODE — carried the mis-numbered citation, now answered and
  sharpened to the rule's narrower form
- `&speak.md` — the silo, *no speech code in this repo*, and `00`'s existing
  stop-the-voice meaning
- `docs/2026-08-30-voice-actuator-testing.md` — the no-custom-audio-daemon
  stance the abandonment mechanism has to answer (it was about *ingress*; say so
  explicitly rather than quietly) 
- `explainers/accessibility.md` — the ladder (screen → TTS → braille → paper),
  "no essential was ever audio-only", "every voice command has a keystroke
  equivalent" — the claim this brief extends to the *feedback* direction
- `src/tui.ts:527` — `flash`: the visual precedent for an actuator receipt, and
  the shape the cue seam should mirror
- td-101a0f — the keymap reference: the refereed place the bindings are recorded
- `docs/2026-09-21-the-model-beside-the-loop.md` — the capability assessment that
  cross-references this brief: the three clocks, the model beside the loop, the cast as a
  role bound per device, and the `11` defect in the voice mapping
