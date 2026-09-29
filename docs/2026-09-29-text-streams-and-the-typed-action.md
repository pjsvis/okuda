---
date: 2026-09-29
kind: survey note — a field direction, the two instruments it is being tested on, and a fork the house has not chosen
lineage: the operator's question about text streams against UI operation and building; Jev (TypeSafe AI) applied to browser and desktop control; written against fzf 0.74.4 and the silo at af081f1
status: open — no code is proposed; the fork is named and not chosen
---

# Text is the state, the enum is the action, and rendering belongs to the reader

> ◆ The question "streams of text, or UI" is three questions. Answering it as one is how a
> display surface becomes a machine's interface — and this silo has already paid for that
> three times, most recently on a version of `fzf` it had never tested.

## What we are deciding

The operator's question, in his words: people reach for UI and components where the Unix
world reaches for streams of text; the Unix world has shown that a stream of text is a good
API and saves a great deal of useless abstraction; and recent work has taken Jev and applied
it to running browser and computer UIs. So which direction is more likely to be productive —
strings of text, or UI operation and building?

**The question as asked presumes one slot, and there are three.** A system that acts has a
state channel, an action channel, and a presentation channel. They are not the same interface
with different content; they have different consumers, different failure modes, and — as the
Jev work shows — different right answers. This note separates them, measures the failure the
conflation produces in this silo, and names a fork the house has not chosen.

## The three channels

Three channels, one model. The picture is the shape, not the contract:

```mermaid
title: Three channels, one model
flowchart TD
    M[The model] -->|reads| S[Numbered text table]
    M -->|writes| A[Eight typed verbs]
    M -->|renders for| P[A person only]
```

- **State in — the world to the model.** Text, enumerated and typed. `jev-ultrafast` sends a
  numbered table of visible actionable elements with references to real DOM nodes: 90,558
  input tokens, zero images. `agent-desktop` reads the operating system's accessibility tree.
  Pixels are the fallback, not the default, because a screenshot is lossy, costs vision
  tokens, and cannot be re-derived to the same bytes twice.
- **Action out — the model to the world.** A closed, typed set. Eight verbs: CLICK, TYPE_TEXT,
  SELECT, SCROLL_UP, SCROLL_DOWN, WAIT, DONE, BLOCKED. Not prose, not a selector, not a
  coordinate, not JavaScript. The executor can validate the whole space before it runs
  anything, which is `argv` with a type system.
- **Presentation — the system to a person.** UI and components, and this is the *only* channel
  where building a UI is the right answer. The property that makes it safe is that nothing
  parses it. The failure mode is exactly that it gets read back.

## What the field is actually doing

Jev is a judgement-only model from TypeSafe AI. It does not generate text: it receives a state
and a candidate set and returns a typed choice with a probability, scored from the hidden
state rather than decoded token by token. Input is $0.042 per million tokens and output is
free, because there is no output text. The name is the thesis — **Jevons**, the paradox that a
collapse in the cost of a thing produces an explosion in its use.

The canonical application is `jev-ultrafast` (Browser Use with TypeSafe AI, MIT, 2026-09-17,
six files). A Google Flights one-way search from Zürich to London:

- **7.073 s** end to end, excluding browser launch and the first navigation.
- **17 Jev requests**, median latency 178 ms.
- **101 browser protocol calls**, against 1,092 in the implementation it replaced.
- **90,558 input tokens**, no images; roughly $0.0039 for the run.

Splitting that time against their published figures, which is my arithmetic and not their
claim: judgement is **3.03 s** (43%), text generation is **0.93 s** (13%), and browser
protocol calls plus execution are **3.12 s** (44%). **The judgement is no longer the
bottleneck, and the speed-up came from cutting round trips rather than from a better model.**

The family around it holds the same discipline in different places. `jev-desktop` sits inside
`agent-desktop` and reads the accessibility tree, gating by risk — 0.70 for an ordinary step,
0.90 for a destructive one, nothing below 0.55 — and stopping after 40 actions, 80 model calls,
or three turns that changed nothing. `ego-jev` never lets Jev see or emit JavaScript, a CSS
selector, or a coordinate. `jev-voice-browser` has Jev pick a candidate span verbatim rather
than generate a query. And every honest README says the same thing: **a model saying DONE is
not independent proof of success.**

The paradigm is not a vendor artifact. APUS published an independent MIT replication on
2026-09-19 — `fast-browser-use` — running a local Qwen3.5-9B on an M2 Pro, fully offline, with
**four model scoring calls per task**, a Wikipedia retrieval at about 18 s median and
form-filling at about 3 s, and zero cloud spend.

## The defect in one example

The claim this note rests on is not about Jev. It is that **a projection optimised for display
silently becomes the machine's view**, and this silo has three of them. The first is worth
printing verbatim, because the control is the whole argument:

```text
fzf version                       : 0.74.4 (Homebrew)
input                             : 3 tab-delimited records, two fields
query 'bravo' is field 2; 'alpha' is field 1

A  no --with-nth           query=bravo  rc=0  hits=1
B  --with-nth=1            query=bravo  rc=1  hits=0
C  --with-nth=1 --nth=2    query=bravo  rc=1  hits=0
D  control: --with-nth=1   query=alpha  rc=0  hits=1
E  control: --with-nth=2   query=bravo  rc=0  hits=1
```

**`--with-nth` narrows the match scope to what is displayed, and `--nth` does not restore it.**
The silo recorded this at fzf 0.73.1; it is now 0.74.4 and the behaviour survives the version
bump, which is why a behaviour claim about a moving tool is a claim about a version. The two
controls matter: D shows the invocation is not simply broken, and E varies the **hidden** field,
so the cause is the display and not the flag. A control that only re-tested the visible field
would have coincided.

The second is the diagram caption. `src/render.ts:799-801` is a ternary, and the rendered
output shows what that means — a titled fence and an untitled fence, rendered side by side:

```text
rendered caption, titled fence    : ⋮ The intent and the artifact
rendered caption, untitled fence  : ⋮ mermaid source elided
```

The indicator glyph is identical in both, and the only difference is the title text. So the
indicator distinguishes nothing by itself: it fires for every fence in the silo, titled or
not, and a reader cannot tell a titled diagram from an untitled one, or either from a document
that simply ends.

## How far it reaches

Three projections in the toolchain, each optimised for a reader, each quietly narrowing what a
machine can see:

| Projection | Optimised for | Silently narrowed |
|---|---|---|
| `fzf --with-nth` | a readable list | the match scope |
| the diagram caption | one indicator per fence | whether a title exists |
| the spoken render | the ear | every diagram in 20 of 34 documents |

The corpus numbers are a re-run, not a quotation. The silo's recorded figure was 20 of 29
documents; the corpus has since moved to **57 mermaid fences in 34 documents, 21 of them
titled (37%), with 20 documents where no fence is titled** — so under the title rule those 20
lose every diagram. The denominator changed and the numerator did not, which is the whole
reason the probe is re-run rather than cited.

There is a fourth projection, and it is the one this note is written in. **Bold survives
`--no-color`; italic does not.** A fixture carrying one of each renders two bold sequences and
one italic with colour, and two bold and **zero** italic without it — because the italic
attribute rides **inside** the colour sequence rather than beside it, so dropping colour drops
the emphasis with it. The voice path is colourless, so emphasis written as italics is invisible
to the ear. That is why this note carries its emphasis as bold and as straight quotes. It is
the same defect as the other three, one layer down: a projection chosen for one reader
silently redefines what the text is. (A fixture, not a census — the count of affected italics
in the silo is not measured.)

## The finding

◆ **The interface that wins is the one narrow enough to validate, typed enough to fail loudly,
cheap enough to re-derive, and legible to a human after the fact.** Text was the 1970 answer
because it was the cheapest such thing then. The 2026 answer is text for state, a typed enum
for action, and rendering only where a person is the consumer.

Three things follow, and the third is the one I would not have said before reading the numbers.

- **Cost is round trips, not intelligence.** 1,092 browser protocol calls became 101; that is
  where the 25% came from. This is the Unix result arrived at from the other direction, and it
  is the strongest evidence for the operator's instinct that is not about text at all.
- **Widening a request is nearly free.** Speculative fan-out evaluates several questions in
  parallel inside one call, so asking whether a step is destructive costs no extra latency. The
  opposite of the one-model-call-per-field habit of component-driven agent frameworks.
- **The scarce thing is verification, not action.** Four scoring calls complete a task in the
  APUS replication. At that price you do not get fewer agents; you get more of them pointed at
  surfaces nobody needed automated. The bottleneck moves from "can it act" to "can you tell
  whether it was right" — which is why every honest README in the family disclaims its own DONE.

## The fork

**Fork A — text first, and the model stays off the clock.**

- The state is a text table, the action is a closed enum, and the model never shares a clock
  with the reader's hands. `system.md`'s actuation clock is about 50 ms and admits no model.
- The dependency class stays portable. No hosted judgement API, and no network inside the
  decision path — which is the airplane-mode premise the okuda-net is built on.
- What it costs: every new surface needs its own enumerator. The long tail — canvas, iframes,
  rich-text editors, file uploads — stays unserved, and those are exactly the exclusions
  `jev-ultrafast` itself lists.

**Fork B — act first, and accept a hosted judge.**

- Buy the judgement. The enumerator is someone else's, the coverage arrives sooner, and the
  cost is a rounding error at $0.0002 a call.
- What it costs: `jev-desktop` posts element roles, names, up to sixty characters of each
  value, state and window title to `api.typesafe.ai` on every turn. That is an unbounded,
  lossy payload crossing the wire on the decision path — inadmissible on the okuda-net's terms,
  where the sentence is "keystrokes over the wire, input at the edge".
- The admissible version of B is APUS's shape: the same paradigm with a local model, so the
  dependency verdict flips without the design changing.

## What is not in question

- **That a stream of text is a good interface.** It is not in question. The question is what it
  is a good interface **for**, and the answer is narrower than **everything**.
- **That a small model can choose well.** Jev's numbers are the evidence, and the APUS
  replication shows the paradigm is reproducible outside the vendor.
- **That this renderer is wrong to elide mermaid source.** It is a deliberate choice with a
  recorded reason. The defect is the **caption**, which claims nothing, not the elision.
- **That the corpus needs a document pass.** It does not. Three measured defects are not a
  mandate to sweep 165 files.

## Where I would land

I would land on A, and I would spend the effort on the third finding rather than the first.
Text for state, a typed enum for action, rendering only where a person is the consumer — and
then the hard part, which is a deterministic disposer for the model's answer. `okuda-assess-capability`
already has the rule and it is the right one: **a model is a finder, never a judge, and if
nothing deterministic disposes, the design is not ready.** Jev's architecture agrees with it,
which is the strongest argument for the rule I have seen from outside this repo.

What would change my mind: a benchmark on real tasks. The published comparison is one task,
three paired runs, and a two-sided sign test at **p = 0.25** — the authors say so themselves,
unprompted. And a surface class where no structured state exists at all, so pixels are the
only ingress and the enumerator cannot be built: there, Fork B's coverage argument wins
outright and the dependency verdict is the only thing left to argue about.

## Evidence

- `tmp/projection-scope-probe.py` — the fzf reproduction (cases A-E), the rendered caption
  pair, and the bold-against-italic attribute counts, all above.
- `tmp/diagram-policy-probe.py` — the corpus census: fences, titles, and the documents that
  lose every diagram.
- `tmp/projection-fixtures/` — the two fixtures the caption pair was rendered from.

## Related

- The refusals this note leans on, and the finder/judge rule — `system.md`,
  `docs/2026-09-14-qwen2-audio-at-the-ingress.md`
- The renderer statement and the elision decision — `src/render.ts:799-801`,
  `playbooks/mermaid-diagrams-playbook.md`
- The display scope of fzf — `briefs/2026-08-29-brief-fzf-owns-the-loop.md`
- The dependency class and the airplane-mode premise — `DEPENDENCIES.md`,
  `docs/2026-08-26-the-okuda-net.md`
- Jev-Ultrafast, the numbers and the self-stated limits — https://github.com/browser-use/jev-ultrafast
- The Jev-powered family, with each project's disclosures — https://aiskill.market/blog/jev-browser-and-desktop-agents
- The independent local replication — https://github.com/APUS-AI-Lab/fast-browser-use
