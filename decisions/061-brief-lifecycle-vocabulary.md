---
type: ADR
callsign: ADR-BRIEF-LIFECYCLE-061
date: 2026-10-13
---

# Decision: The brief's lifecycle — the vocabulary is the scale

**Date:** 2026-10-13
**Status:** Accepted

## Context

`scripts/reg-sync.ts` reported ten unrecognised status words and **declined to fix
them**: *"the tier vocabulary is incomplete (settle it, do not absorb it)."* That
refusal is the decision this ADR takes. Absorbing them — mapping each to the
nearest known word — would have been silent and lossy, and the vocabulary is not
a formality: **it is the scale.**

Any lifecycle indicator we render has to draw *positions*, and a position the
vocabulary cannot name is a position the panel will draw wrongly. That is not
hypothetical — it is the second finding below, where a landed rule sat at `open`
for six weeks and the gate said so in one line that nobody acted on.

The ten words reduced to five, and a probe named each one's class
(`tmp/status-vocab-probe.ts` — scratch tier; the numbers are stated here so the
probe need not be run):

| word | count | class | ruling |
|---|---|---|---|
| `ready` | 6 | a real state the vocabulary was missing | **added** |
| `aborted` | 1 | the decisions tier's word for the same moment | fold → `rejected` |
| `accepted` | 1 | the brief's proposal became a decision | fold → `done` |
| `pending` | 1 | no gate named | fold → `open` |
| `rule` | 1 | **not a status at all** — a sentence in a Status line | document fix |

## Decision

**One state is added and three words fold, under a stated rule: a word is a STATE
when the corpus uses it as a position between two others, and a FOLD when it names
another tier's word for the same moment, or a gate that does not exist.**

- **`ready` → `ready`.** Six briefs wrote it independently (the most-used
  unrecognised word), **and `&briefs.md` carries a hand-maintained
  `## Ready — specced, next up` section** — so the state existed in the panel and
  only the vocabulary lagged. That is the strongest available evidence that it is
  a position rather than a synonym: it is the step between *specified* and
  *started*.
- **`aborted` → `rejected`.** The decisions tier owns `aborted`
  (`ADR-MNEMONIC-MODEL-025`'s lifecycle); a brief at that moment is rejected, which
  the registry already stored. Two tiers, two nouns, one moment — recorded rather
  than renamed.
- **`accepted` → `done`.** The brief's life ended in acceptance as a decision, and
  *which* decision is in the body.
- **`pending` → `open`.** No gate was named, so there was nothing for it to be
  parked *on* — which is exactly the distinction `parked` carries.

**The lifecycle is therefore five positions:** `open` → `ready` → `in_progress` →
`done`, with `parked` and `rejected` as the off-ramps.

## The document fix, which is the sharper finding

`briefs/2026-08-29-brief-okudagram-frame.md`'s Status line read *"Rule fully
specified; v1 LANDED 2026-09-05 as the **okudaframe** …"*. A sentence, not a state,
so `statusWord` took `Rule`, the word was unrecognised, and **the row sat at `open`
for six weeks against a rule that had landed.** Corrected to `Done (2026-09-05)`.

So the ten words were not merely unread. One of them was *stored as the wrong
state*, reported by the gate, and left — which is what a background hum of
unrecognised words buys you.

## Also fixed, same panel, same rule

The `&briefs` tables' headers read `| Brief | State | Debrief | |` — the third cell
named a column that holds a *note*, and the fourth, which holds the debrief **link**,
was **nameless**. A reader cannot explain the fourth column from the page
(*Attributable structure*), and the appended rows write `—` into it, which reads as
a defect rather than as *no debrief on file*. All nine tables now read
`| Brief | State | Note | Debrief |`, matching the shape `scripts/amp-briefs.ts`
already appends.

## Consequences

- **`just check` reports zero unrecognised status words.** Any future one is a new
  finding rather than part of a hum — which is what makes the count worth printing
  at all.
- `scripts/amp-briefs.ts` gains the `ready` section prefix and glyph, so a brief
  marked ready files itself into the section the panel already had.
- Six registry rows now read `ready` where they read `open`; one reads `done` where
  it read `open` six weeks past landing. `reg-sync --fix` repaired them, which is
  the tool doing its job once the vocabulary told it the truth.
- **The precondition for a derived lifecycle indicator is met.** A lifecycle bar
  needs every position nameable; the corpus is now fully readable. Whether to render
  one is a separate, unopened question — the probes for it are
  `tmp/panel-grammar-probe.ts`, and they answer the *panel* half.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Fold `ready` → `open` | Absorbs the word, which the gate explicitly refuses; discards a distinction six documents made independently; and leaves the derived scale with no position between *specified* and *started*, which is the position the panels were already using |
| Edit the six documents to say `Open` | Same loss, six edits instead of one line, and it would have deleted a heading the panel maintains by hand |
| Leave the ten unrecognised | The status quo, and its cost is already in this ADR: one of the ten was a stale row nobody noticed for six weeks |
| Add every word as its own state | `aborted`/`rejected` and `accepted`/`done` name the same moments; two names for one position is how a scale stops being readable |

## Related

- `scripts/reg-sync.ts` — the `BRIEF_STATUS` map, and the gate that refuses to absorb
- `scripts/amp-briefs.ts` — the panel the vocabulary feeds
- `briefs/2026-08-29-brief-okudagram-frame.md` — the document fix
- `decisions/025-mnemonic-namespace-model.md` — the decisions tier's lifecycle, whose `aborted` folds here
- `docs/2026-10-09-the-heuristics-index.md` — *Attributable structure*, which the `&briefs` header violated
- `tmp/status-vocab-probe.ts`, `tmp/panel-grammar-probe.ts` — the probes (scratch tier)
