---
date: 2026-09-18
kind: survey — an external standard tested against the silo, and where it lands
lineage: the reader's question — "and its relevance to our Okuda project, opinion" — tested against the STE skill kit at chele.bi/videos/the-cure-for-ai-slop/kit/asd-ste100/SKILL; the local copy of that clip was removed 2026-09-18, because a mirror of a live external document cannot be kept true
status: open — nothing is built; two adoptions proposed, one collision named
---

# A standard for a reader who cannot re-read

> ◆ STE's rules are counts, and the house already ruled that a count is the measurable proxy
> over the real property. The standard is still right, for the one text okuda writes that
> nobody re-reads: its own failure lines.

## What we are deciding

Whether Simplified Technical English is relevant to okuda, and to which okuda.

The clip landed in `docs/` today, and it is not the standard: it is one person's *skill* built on
the standard, with a scope table, a lint script and a second layer of its own. Three candidates
for relevance, and they do not share a verdict: the binary, the corpus, the failure text.

## The standard, in the space it deserves

ASD-STE100 is a **controlled natural language**: 53 writing rules in nine sections, plus a
dictionary of roughly 900 approved words — one meaning and one part of speech each — and 1,200
rejected ones with alternatives. Issue 9 is January 2025, and the subtitle moved from
"specification" to "Standard for Technical Documentation".

It was built for one reader: an aircraft maintenance engineer whose English is limited, reading
under time pressure, who cannot re-read a line. ATA 100 and ATA 104, EASA, FAA and CAAC
continued-airworthiness directives, ISO 24620-4:2023.

**The reader model is the standard.** Every rule follows from it. The rules that read as
arbitrary — no semicolons, no present perfect, one instruction per sentence, a 20-word cap — are
each an attempt to stop that reader losing the thread.

## The test

A rule set that calls itself mechanical should be reproducible by a second implementer. So I
implemented the clip's mechanical rules myself in `tmp/ste-probe.py` and ran them against six
documents: the clip as the **control** (it is written in the style it prescribes), and five of
the silo's own.

Counters: sentences over 25 words, semicolons, contractions, progressive `be + -ing`,
nominalisations, phrasal verbs, the rejected dictionary words, the strict set, marketing
adjectives. Fences, tables and inline code stripped first.

| Document | Words | Flags | /100w |
| --- | --- | --- | --- |
| the kit's clip | 2402 | 89 | 3.7 |
| authoring-playbook | 3185 | 178 | 5.6 |
| briefs-playbook | 677 | 38 | 5.6 |
| system.md | 778 | 37 | 4.8 |
| ear-playbook | 912 | 39 | 4.3 |
| ADR-038 | 1248 | 49 | 3.9 |

The clip's own targets: under 2.5 per 100 words flavored, under 1.5 strict. **The control fails
its own lint**, by 48%.

## The finding

Four things. The first is about the probe, not the standard.

- **The control fails, and that is the finding.** Two readings: my counters are wrong, or the
  target is aspirational. Both hold. My counters are crude approximations of a `ste-lint.py` I do
  not have, so **the number is not reproducible by a second implementer** — and reproducibility
  is the one property a mechanical rule set has to have. A score nobody can re-derive is a
  preference with a decimal point on it.
- **The counter cannot tell use from mention.** 22 of the control's 89 flags are the clip
  *listing* the words it tells you not to use: `begin/commence/initiate`, `seamless, robust,
  powerful`. A linter that counts banned words fires hardest on the document that teaches them.
  The silo already has a note on this distinction (`docs/2026-09-10-use-vs-mention.md`), and it
  is the same distinction the callsign scanner drops when a qualifier vanishes and two
  destinations collapse onto one silcrow.
- **The counter cannot tell possession from contraction.** The authoring playbook's 33
  "contractions" are nearly all possessive `'s` (`workflow's`, `table's`, `007's`). One token,
  two grammatical readings, one of them banned, and the string does not say which. My probe
  proved this on its first run — a decent argument that the rule is not mechanical.
- **The semicolon ban fires 37 times on the document that states the house style, and not one of
  those 37 is a defect.** STE bans the semicolon (8.1) because a reader with limited English may
  not parse it. The house reaches the same conclusion by another route and stops in the right
  place: *colons over em-dashes*, because context-dependence is stress. That rule subsumes the
  ban and leaves the semicolon standing where it does work a colon cannot do. **The house derived
  it better, because the house argued from a property and the standard asserted a ban.**

## Where it lands

Two places, both narrow.

- **The system's own failure text** — the CSN class and its neighbours. The flash (`§14 — no document to render`), `gloam: rg not
  found — see DEPENDENCIES.md`, `clone failed (exit 1)`, the too-narrow notice. Each is read
  once, mid-gesture, by a reader who did not choose to read it and cannot re-read it. That is
  STE's reader exactly. And the class is already recognised: ADR-032 gives the system a doubled
  actuator (*the system talks*), and `&ear` concluded that a renderer refusal is **Moir's** line
  rather than Moira's. **The class exists, the voice exists, and the writing rule for it does
  not.** STE strict is a defensible rule for those strings.
- **The `-ing` probe.** The elocution playbook's next application is the `-ing` class: phase 0
  done, `tmp/ing-probe.md`, `just moira-ing`. STE rule 3.5 bans the `-ing` main verb where a
  simple tense works. **The standard hands the probe a hypothesis.** If the class mangles because
  a participle is doing a verb's job, the ear and the standard agree and the fix is editorial
  rather than lexical; if only lexicalised `-ing` mangles, the rule is irrelevant to the ear and
  the probe stays a lexicon job. Either outcome is a finding, and either beats a tuning list with
  no hypothesis in it.

## The collision

The one place the two standards point opposite ways, at the same object.

- **STE 2.1** caps a multi-word noun at three words, and the remedy for a longer one is to
  *unpack it into a phrase* or *hyphenate it*.
- **The width contract** (`playbooks/authoring-playbook.md`) says the opposite: a table's natural
  width is set by its longest cell, so reach for the longest cell first — the number that matters
  is 80, because the voice reads at 80.

Both remedies make a cell **wider**. Unpacking adds words. Hyphenating removes break
opportunities, and `wrapANSI` honours exactly one break character (U+0020). So the standard's
remedy for a long noun cluster is the house's defect.

**`ADR-CALLSIGN-EVERY-DOC` is the object both are describing**: a four-token hyphenated cluster,
the exact shape STE says to fix, and the exact shape `bootstrapCallsign` already fails to key.
The house's position has a measurement behind it. The standard's does not.

## What is not in question

- **The binary.** STE is a writing standard; okuda renders. A writing rule is a compositing
  concern, and compositing belongs to the environment. No STE linter enters `src/`, and no rule
  of the standard touches the byte stream.
- **The kit's Layer 2.** It is not STE, and the clip says so. Its own scope table puts a
  reference doc at *Layer 1 yes, Layer 2 no*, and okuda has no chat surface for it to shape.
- **The silo's voice.** The clip's scope table excludes *blog post, essay, video script,
  marketing copy* from both layers. The ADRs and docs are essays, and the kit strips voice on
  purpose. **A standard built for a reader who has no choice is the wrong standard for a document
  written to be argued with.**

## The thing worth fixing, and it is not STE's fault

The silo now holds three sentence-length doctrines and one position on counts.

- **The authoring playbook** refuses a count: a para-length rule is *in reserve, not decided*,
  and the only threshold that would carry a justification is glass-bound. *A line-count threshold
  would be benchmaxxing prose.*
- **The clip** carries 20 words for an instruction, 25 for a description.
- **The TTS clip** carries 15 to 20 (`docs/2026-09-17-ssml-voice-tags.md`).

**A clip carrying a rule is not inert.** It arrives with an authority and a number attached, and
nothing in the silo says which number governs, or that the house's refusal to have one is
deliberate. That is the defect the pile introduces. The remedy is a line in the authoring
playbook naming those counts as clipped authorities rather than house rules.

## Where I would land

- ☐ **Adopt STE strict for the system's failure lines**, as a section of the authoring playbook
  rather than a linter. The class is a few dozen strings, it can be held by hand, and the voice
  it belongs to is already reserved.
- ☐ **Feed rule 3.5 to the `-ing` probe** as its stated hypothesis, and let the ear rule.
- ✗ **Do not lint the corpus.** The count is the thing the house already refused, and the counter
  cannot separate use from mention, or possession from contraction.
- ⋮ **Note the noun-cluster conflict** in the width contract rather than resolving it. The
  standard is not ours to obey; the width contract is.

What would change my mind: a second implementer reproducing the clip's own score on the clip's
own text. Until then the number is not a measurement.

## Evidence

- `tmp/ste-probe.py` — the counters, six documents, run 2026-09-18.
- The clip itself, at `https://www.chele.bi/videos/the-cure-for-ai-slop/kit/asd-ste100/SKILL` — its scope table and rule numbers are what the test is calibrated against. No local copy is held: it is a mirror of a live document, and a mirror drifts.
- `docs/2026-09-10-use-vs-mention.md` — the distinction the counter cannot make.
- `docs/2026-09-17-ssml-voice-tags.md` — the TTS clip's 15 to 20 words.
- `playbooks/authoring-playbook.md` — the width contract, the rule about rules, the semicolon's
  replacement.
- `&ear.md` and `decisions/032-repeated-digit-actuators.md` — the system's voice, and who speaks.

## Related

- The elocution playbook's `-ing` phase `../speak-md/playbooks/elocution-playbook.md`
- The ear-playbook's cast principle `playbooks/ear-playbook.md`
- The wrap mechanism the collision lands on `BRF-FLOW-WRAP`
