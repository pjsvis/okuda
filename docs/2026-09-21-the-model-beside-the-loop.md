---
date: 2026-09-21
kind: design note — three capability assessments against the ledger, and the drift one of them exposed
lineage: the reader's three questions — a local model for repo hygiene, foundation models in the
  voice-control grammar, and the phone as a remote ingress for the MacBook. Read against
  `decisions/027`, `decisions/031`, `decisions/032`, `decisions/036`,
  `briefs/2026-09-13-brief-audio-discovery.md`, `docs/2026-08-30-voice-actuator-testing.md`,
  `docs/2026-08-26-the-okuda-net.md`, `briefs/2026-08-30-ipad-mini-demo.md`, `src/keygrammar.ts`.
status: open — nothing is built. Two defects are reported with their measured reach: eight stale
  `11` claims (one corrected in place, seven listed for a sweep), and a silent failure in
  `scripts/facade-lint.sh` that exits with the violation code and names nothing. **Amended
  2026-09-21** — the `facade-lint` defect is fixed (`ADR-GATE-NAMES-041`); the `11` sweep is not.
---

# The model beside the loop

> ◆ Three questions about putting a model to work here, and every answer came from a rule written
> for a different purpose. The third question was about a *device* — and it found a phrase in the
> voice mapping that does nothing: `"Vector one one"` injects `11`, and `verbFor(11)` is `null`.

## The question, three times over

**Hygiene.** Could a local model inspect the repo and report barnacles and inconsistencies?

**The voice grammar.** The system is voice-first and the grammar is under construction. Is there
an opening for a foundation model in it?

**The transport.** The same capabilities now exist on iPhone and iPad. Could the phone be a remote
microphone for the MacBook?

They read as three questions and they are one: **where may a model live in this system?**

## The answer, in one rule

**A model is a finder, never a judge, and it may not share a clock with the reader's hands.**

The first half is already house law, written for the ear queue: *the probe is a finder, not the
judge.* The second half falls out of the corpus once the clocks are separated. There are three of
them, and only the third admits a model:

- **The actuation clock.** First key to cue, budget under ~50 ms. No model, and none needed.
- **The identity clock.** The cue word, ~400 ms of speech, but *deterministic by contract* — the
  word names the actuator exactly, and a receipt is not an interpretation.
- **The learning and authoring clocks.** Human-paced. This is the model's lane, and it is the only
  one.

A corollary worth stating, because it is what makes the whole thing cheap: **putting the model off
the clock means it never needs to be resident.** No daemon, no load time in a keystroke path, and
no latency argument to have. `BRF-AUDIO-DISCOVERY` already flags that *a long-lived voice process
is cleaner but collides with the no-daemon stance*; staying on the authoring path means that
question never has to be answered.

```mermaid
title: The finder, and the judge
flowchart LR
    P[the probe] --> M[the model]
    M --> C[cited candidates]
    C --> L[the ledger]
```

The middle box is where the design lives. **The probe's job is to make the window big enough** —
the model reads an *excerpt pair*, never the corpus.

## What the code does

The grammar is `src/keygrammar.ts`, 98 lines, and it is a table rather than code. `verbFor` is pure
and total: every token in `00`-`99` resolves to a verb, to a vector, or to a deliberate `null`.
Censused by `tmp/grammar-census.ts`:

| Class | n | The tokens |
|---|---|---|
| verb | 7 | `00 01 02 03 09 10 99` |
| vector | 80 | `12` to `98`, less the doubled pairs |
| reserved | 13 | `04`-`08`, and the doubled pairs |

**This is why the loop is closed, and the reason is determinism rather than latency.** There is no
ambiguity in the token space for a model to resolve, so a model has nothing to earn there and one
thing to lose — an error mode added to a function that has none. `verbFor` being *pure and total*
is a code-quality note that turns out to be the load-bearing answer to a question about models.

## The defect in one example

`docs/2026-08-30-voice-actuator-testing.md:69` maps a spoken phrase to a keystroke pair:

```text
| "Vector one one"   | 1, 1 | Reader | jump buffer dereferences token 11 |
```

The phrase is inert. `11` is a doubled pair — the reserved actuator class — and `verbFor(11)` is
`null` by range, below the floor at `12`. The call site drops it silently:

```text
src/tui.ts:757  const verb = verbFor(step.token);
src/tui.ts:758  if (verb === "vector") {
src/tui.ts:759    void jumpTo(step.token);
src/tui.ts:760  } else {
src/tui.ts:761    verbHandlers[verb]?.();   // no handler for null
src/tui.ts:762  }
```

The code is right and *tested* — `tests/keygrammar.test.ts:30` asserts `11` resolves to `null`
alongside `22`-`88`. The document is the stale thing, and it is stale for a reason worth naming:
the voice-actuator document is dated **2026-08-30**, and `[11]` joined the actuator pocket on
**2026-09-12**. The document predates the change; its own correction note did not reach the mapping
table.

**The reach is larger than the one row, and it is the same defect class.** Four of the five digit
rows in that mapping are honest; the fifth silently does nothing, and nothing in the repo would
ever have said so — `just check` is registry and facade-lint, and a phrase that resolves to a
no-op is neither.

## How far it reaches

Classified by the drift-sweep's table — live claim, the record, an incomplete flag, or not a claim
at all. Eight live claims across eight files:

- **`docs/2026-08-30-voice-actuator-testing.md:69`** — the mapping row above. **Inert: the phrase
  does nothing.** The only instance with a functional consequence.
- **`briefs/2026-09-13-brief-audio-discovery.md:42`** — *"`11`-`98` are vectors, `99` is the
  clone"*. The floor is `12`. **Corrected in this commit** (the arithmetic above it survives: `9`
  then `0`-`8` really is nine out of ten).
- **`decisions/031-main-document.md:30`** — *"references annotated as vectors — `§11` … `§98`"*.
  Contradicted by the same ADR's own numbering contract at `:58`, *"Vectors run **12–98**"*.
- **`explainers/looking-things-up.md:44`** — *"`§11` is always the eleventh reference"*. The
  eleventh reference is `§12`.
- **`&next.md:6`** — *"Actuate the rose vectors §11-§98"*. Contradicted by `&next.md:20-23`,
  which carries the correction to `12`-`98` three lines below.
- **`&briefs.md:48`** — *"keyspace unified 11–99"*.
- **`playbooks/authoring-playbook.md:268`** — *"(`§11` … `§98`, gold, in the reserved paint)"*.
- **`briefs/2026-08-26-brief-document-links.md:26`** — *"Jump tokens and link numbers share one
  space: **11–99**"*.

Two documents already carry the correct form, and they are the pattern to copy rather than
rewrite: `docs/2026-09-04-the-silcrow.md:29-30` states the range *and* the move (*"12 through 98,
the floor moved from 11 to 12"*), and `decisions/032-repeated-digit-actuators.md:40` disambiguates
in place — *"11–98 addresses (vectors/silcrows; 12–98 once this ADR landed)"*. That is the smallest
honest move the sweep asks for.

**Deliberately left, with the class:**

- **The record** — `debriefs/2026-08-29-debrief-index-and-jump.md:35` (a dated debrief),
  `docs/2026-09-05-dogfood-silcrow-motor-map.md:25` (a dated narrative, pre-`2026-09-12`),
  `docs/2026-08-30-from-babylon-to-the-stars.md:78` (a rendered sample),
  `briefs/2026-09-14-brief-address-cap.md:117` (describes the prior state: *"was 88 before"*),
  `decisions/021-jump-token-numbering-offset.md` (its title is the record; its amendment at `:95`
  already carries the change).
- **Not a claim at all** — `explainers/looking-things-up.md:33` (a sample of the glyph),
  `decisions/026-wire-format.md:20,55` and `docs/2026-08-31-okuda-precedents.md` (paint samples and
  the BBS precedent), `docs/2026-09-02-i811-glyph-stress-test.md:20,42` (list-item numbering in a
  glyph test).
- **A different namespace** — `decisions/019-okf-v02-conformance.md:15` and
  `docs/2026-09-19-the-standard-we-already-adopted.md` are citing OKF `§11`, not a silcrow.
- **Not in the silo** — `tmp/census.md:8`, which `git ls-files` does not track, so by the silo
  principle it does not exist.

**Not performed here.** The sweep is a separate piece of work and it touches eight files including
two registered tiers. One instance is corrected in place because this note edits that file anyway;
the rest are listed so the sweep can be scoped rather than discovered.

## A defect in the gate itself

Found while verifying this note, and it is the same class as the phrase that does nothing: **a
check that reports a verdict it did not compute.**

`scripts/facade-lint.sh` is half of `just check`. It opens by deriving the comment column from
`just --list`:

```text
scripts/facade-lint.sh:28-30
  col=$(just --justfile "$JUSTFILE" --list 2>/dev/null \
    | grep '#' | head -1 \
    | awk '{...}')
```

The script sets `set -euo pipefail` at `:18`. On a machine without `just` on `PATH` — this one —
the first stage of that pipeline exits `127`, `pipefail` makes the pipeline's status `127`, and
`set -e` aborts the script **before any diagnostic is printed**. Measured: `bash
scripts/facade-lint.sh` exits **1 with zero bytes of output** — and `1` is the script's *violation*
code, whose contract is *"1 with a named violation list"*. The list is empty. Nothing is named.

So the gate's failure mode is indistinguishable from a ragged facade: a `just check` on a machine
without `just` reports a lint violation that does not exist, and says nothing about why.

Two readings, and they differ in cost:

- **The script should not use `pipefail` to guard a probe it can survive.** Without it the script
  reaches the next line with `col` empty — which it already handles deliberately (*"No commented
  recipes — vacuously in band"*). Measured: the same one-liner without `pipefail` prints
  `REACHED: []` and exits `0`.
- **A missing dependency should halt loudly.** `DEPENDENCIES.md`'s discipline is that a missing
  dependency halts the brief and does not get worked around silently. Here it halts *silently*,
  which is the one outcome that discipline exists to prevent — and it halts in the direction of a
  false failure rather than a false pass, so it is loud in the wrong place.

The first is a one-line change; the second is a decision about what the gate owes the operator.
Both are out of scope here. Recorded because a sweep that fixed the eight `11` claims and left this
would have traded a visible defect for an invisible one — and because it is the third instance
today of the same shape: **the instrument, not the artifact.**

**Amended 2026-09-21 — the second reading was taken, and the defect is fixed.** The gate now
guards its own precondition: absent `just`, `facade-lint.sh` names the missing instrument and
exits **2**, leaving `1` to mean *"a named violation list"*. The first reading was rejected
because the script already treats an empty `col` as *"vacuously in band"* — so dropping `pipefail`
would have converted a false failure into a false **pass**, the worse trade. The asymmetry is the
rule, and `signature-check.sh` supplies the other half: **skip where the absence is a legitimate
state, halt where it means the check did not happen.** Verified: `bash scripts/facade-lint.sh`
exits 2 and names `just`, and `just check` is green with `just` on `PATH`. `ADR-GATE-NAMES-041`.
The `11` sweep below is still outstanding.

## The finding

Three loops, three refusals, and one rule.

**The hygiene loop.** A model asked to *keep the repo clean and tidy* is asked the wrong question.
The debt is already enumerated in `&next.md` — the duplicate-callsign lint, the `briefs/evals`
barnacle, the perimeter — and a known debt needs a lint, not a reader. What a model earns is the
residue: use versus mention (a counter cannot tell them apart, and a banned-word rule fires hardest
on the document that *lists* them), record versus live claim (the classification above, which is
exactly the sweep's bottleneck), and near-miss judgement. The unit of work is the **excerpt pair**,
because the window is 4,096 tokens and the silo is not.

**The voice loop.** Refused, and the reason is `verbFor`. But there is one opening, and it is the
strongest of the three: an **adversarial pass over the phrase set against the destructive tokens.**
`99` clones a terminal and `00` stops the voice mid-sentence; the design's defence is to keep
anything probabilistic away from that pair, and that defence holds. The unasked question is what
else could be *misheard* as `"Vector nine nine"`. This is a near-miss judgement rather than a
distance metric — `"Vector one fiver"` was chosen over `"Vector one five"` **by hand** for exactly
this reason, and the hand does not scale as the set grows. Output: candidate collisions. Judge: a
listen. That is the ear queue's existing institution, not a new one.

**The transport.** *"The iPhone as a remote microphone"* is the wrong shape, and the corpus says
why. There is no need for the microphone to be remote, because the recognition can stay local to
the phone: what crosses the wire is **two keystrokes**, not audio. `docs/2026-08-30-voice-actuator-testing.md:27-34`
already made this cheap — *"the terminal running gloam has no idea voice was involved"* — so the
phone is simply a second ingress compositor, and the one-ingress rule means okuda needs no change.

The test that decides it is the **payload class**. A bounded, deterministic payload survives a
network hop; an unbounded, lossy, latency-sensitive one does not, and audio in the recognition path
would contradict the airplane-mode premise (`briefs/2026-08-30-ipad-mini-demo.md:13`). The
okuda-net's own sentence, run backwards: *finished pixels over the wire, display at the edge*
becomes **keystrokes over the wire, input at the edge**.

And the thing that genuinely breaks is not latency. **The cast is a voice, and the voice inventory
is not shared** across macOS, iOS and iPadOS. `ADR-033` refused voice-class-specific tags because
*classic voices honour them, neural and Siri voices drop or vocalize them*; devices are the same
failure on a different axis. The iPad brief already assumes the iPad narrates with its own
synthesiser, so the cast is per-device in practice while the rule (*Moir is never a character in
the document*) is written as though one inventory exists. The fix is the shape the cue seam already
uses: **declare the cast as a role with a per-device binding**, `role → voice`, the way the seam
does `class → text` and the channel does `→ voice`.

**A correction this note owes.** `docs/2026-08-26-the-okuda-net.md:200-206` already proposed the
model opening that the first two answers missed: *"Point your local model at the file: poll on
cadence, diff against the last state, decide, act. The feed is the agent's `/proc`, and the reaction
loop lives at the edge, where it belongs."* That is a cross-device claim, because the edge is
wherever the reader is. And `:179-184` supplies the piece that dissolves the window problem:
*"the document feed and the data feed are the same pattern with different projections — pick per
reader."* **The projection is the context strategy.** A small model does not need the corpus; it
needs a projection of the corpus, and the okuda-net is already a projection engine with a cadence
dial and a meaning-change repaint predicate. Off the Mac, the window stops being the binding
constraint.

## The fork — the write path

`docs/2026-08-26-the-okuda-net.md:195-196` states the feed's firewall: *"No write path. The feed is
a publication, not a form. That is the firewall, not a gap."* But `09` is the `editNew` verb
(`src/keygrammar.ts:34`), and it opens an editor and writes a note into the current directory. **A
remote ingress that can speak `09` has a write path**, and the person writing is no longer at the
machine — which is what a remote ingress is *for*. The ingress you want and the firewall you have
are the same object.

- **A — name the verbs a remote ingress may reach.** An allowlist per ingress, declared beside the
  binding. Small, explicit, and it makes the exception visible in the config rather than in the
  grammar. The cost: a second vocabulary to keep true, which is the defect class ADR-032's tidy
  removed.
- **B — leave the grammar whole and treat the transport as trusted.** No new vocabulary, and the
  write path is exactly as reachable as the ssh key that already grants it. The cost: the firewall
  is stated in one document and contradicted by a verb in another, and nothing says which wins.

Leaning **A**, because the honest reading of the bound is that it was written about the *feed* and
`09` is not part of the feed — so the bound is not wrong, it is scoped. Naming the scope is cheaper
than re-litigating it.

## What is not in question

- **No model in the loop.** Determinism, not latency. `verbFor` is pure and total.
- **No model on the destructive pair.** The corpus's own arithmetic: announcing on a single `9` is
  wrong nine times out of ten.
- **No model that speaks.** ADR-036, and the cast principle: a cast that performs a mood per class
  is a narrator again. A model phrasing Moir per cue class makes her two people.
- **No paraphrase acceptance.** If a synonym is accepted the grammar stops being finite, and
  finiteness *is* the accessibility claim that every voice command has a keystroke equivalent.
- **No second ranker in the search path.** `gloam`'s ranking is okuda's, and a second ranker on the
  keystroke is the enumeration-on-the-fast-path mistake.
- **No dependency on the path.** The Foundation Models framework ships on all three devices, but
  `fm` is a macOS system binary and apfel is macOS-only; on the phone the model is reachable only
  through an app or Shortcuts. Under *a missing dependency halts the brief*, a capability
  scriptable on one device and app-only on two cannot go on a path.

## Where I would land

**The model's job in a voice-first system is to keep the grammar small enough that no model is
needed in the loop.** That is why every opening above sits *beside* a loop rather than in one, and
it is why the strongest of them is an audit of the phrase set rather than an addition to it.

The safety argument the grammar rests on is *"small enough that its errors are unnecessary and
catastrophic"* — and that premise is exactly what is under construction when the grammar is
growing. A natural-language front end becomes tempting in proportion as the grammar becomes harder
to hold in a head. So the useful work is the work that keeps the head big enough.

And the habit that produced this note is worth keeping for a reason the note demonstrates rather
than asserts. **None of the three questions was answered by the rule it appeared to be about**, and
the one finding with a functional consequence came from the question about a *device*. A new
capability is worth a look because it is a probe, not because it is a candidate.

## Evidence

- `tmp/grammar-census.ts` — the token-space census, and the two voice-mapping digit rows resolved
  through `verbFor`. Run with `bun` (extensionless imports; `node` fails
  `ERR_MODULE_NOT_FOUND`). The probe reports the count; the classification table above is a read of
  the documents the grep returned, not a probe output.
- `src/tui.ts:751-763` — the call site, which is what makes `null` mean *nothing happens* rather
  than *something unhandled*.
- `tests/keygrammar.test.ts:30` — the assertion that fixes `11` as `null`, i.e. the code's
  intent is not in doubt.
- The `facade-lint` finding is reproduced without editing anything: `bash scripts/facade-lint.sh`
  exits `1` and prints nothing; the same pipeline shape under `set -euo pipefail` with a missing
  first stage aborts before reaching the next line, and without `pipefail` it reaches the next line
  with an empty value and exits `0`. Bash here is `3.2.57`, so this is not a version artefact.
  `just` is absent from `PATH` on this machine, which is what makes the probe fire.

## Related

- `decisions/027-temperament-is-downstream-of-discipline.md` — the ledger governs, not the model;
  barnacles-per-kilobyte as a metric for judging the *detector*
- `docs/2026-09-14-qwen2-audio-at-the-ingress.md` — the earlier assessment, and the shape this one
  copies: find the slot, then say whether the design already closed it
- `briefs/2026-09-13-brief-audio-discovery.md` — the cue seam, the two cues on one gesture, the
  ~50 ms state cue, and the cast principle this note extends to devices
- `docs/2026-08-30-voice-actuator-testing.md` — the mapping table the defect is in, the radiotelephony
  grammar, and the no-LLM-in-the-loop invariant
- `docs/2026-08-26-the-okuda-net.md` — ssh as the transport, the projections, and the model-at-the-edge
  paragraph this note had missed
- `briefs/2026-08-30-ipad-mini-demo.md` — the airplane-mode premise, and the iPad's own synthesiser
- `decisions/032-repeated-digit-actuators.md` — the reservation that made `11` a no-op
- `decisions/036-no-speech-code.md` — the cue is okuda's, the voice is the environment's
- `decisions/031-main-document.md` — the self-contradicting live claim at `:30` against `:58`
- `docs/2026-09-04-the-silcrow.md` — the correct form of the range statement, and the model for the fix
