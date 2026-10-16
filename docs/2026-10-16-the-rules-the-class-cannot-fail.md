---
date: 2026-10-16
kind: survey — an external STE linter tested against the silo's own failure text, and where it lands
lineage: the reader's link to webSTE100 (Mysore, 2026-10-14), which extends Karpathy's ASD-STE100 ladder; tested against the ☐ left open by docs/2026-09-18-simplified-technical-english.md
status: open — the style ☐ closes as already true; what it leaves is a completeness worklist, and that is not a linter's job
---

# The rules the class cannot fail

> ◆ The article's linter scores our failure text 100, because every rule it checks is about
> length or diction and a diagnostic is short and plain by construction. **A rule a class cannot
> fail is not a check, it is a formality** — and the one column that varies is the one the
> article had to add by hand.

## What we are deciding

Whether anything in the article is usable here. The reader flagged the STE linter as the
candidate, and the silo has had a ☐ open on exactly this ground since 2026-09-18.

## What the article is

A browser tool built on **ASD-STE100**, the controlled language the September survey tested.
Three parts, and only the first is a candidate:

- **A deterministic linter** — about 300 lines, no model. The same shape as `scripts/prose-check.ts`.
- **A lint-and-repair loop** — the linter's output is fed back as rewrite instructions, up to three
  passes, and the best-scoring version is kept.
- **A 10-rule system prompt**, with rule 10 added by hand to close a loophole the author found.

## The test

The September survey ✗'d linting the corpus and ☐'d **STE strict for the CSN class** — the
system's own failure text — held by hand rather than by instrument. That ☐ has been open a month.
So the class is the one place a probe is owed, and it is small enough to census.

`tmp/csn-ste-probe.py` carries **24 reader-facing strings** extracted by hand from `src/` with
provenance: the 21 failure lines (`okuda:` and `gloam:` diagnostics, the TUI flashes, the vector
refusal) plus 3 mode notices. Successes — `cloned:`, `editing:` — are excluded by name, because
the class is failure text and its neighbours. The article's rules 3, 4, 6, 8 and 9 are implemented
mechanically, at the 25-word description cap rather than the 20-word instruction one, since a
diagnostic is a description. Two controls run first and halt the sweep if either fails.

| Rule | Article's check | Breaks |
| --- | --- | --- |
| 3 | over the 25-word cap | 0 |
| 4 | passive voice | 0 |
| 6 | a banned word | 0 |
| 8 | an introduction or filler | 0 |
| 9 | over 6 sentences | 0 |
| — | names a lever (read, not matched) | 16 |

## The finding

**The class is already STE, and it could not have been otherwise.** Word counts run 2 to 16, median
6. Not one string is passive, uses a banned verb, pads, or runs long. Every rule the linter checks
is a rule about *length or diction*, and a diagnostic is a headline by genre — so the standard's
mechanical half is **vacuous on this class**. A score of 100 here is not a measurement; it is the
same shape as the probe's own negative control passing.

**What varies is completeness, and it is not a style question.** The column that stands in for the
article's takeaway 3 — *style, completeness and correctness are separate measures* — is whether the
message names an act the reader can take. It reads 16 of 24, and the aggregate is not one class, so
it splits:

- **9 name only the refusal.** `okuda: unexpected argument: --frobnicate` — the reader does not learn
  the accepted set, though the `usage:` line at `src/cli.ts:142` already exists. `§14 — no document
  to render` — the reference failed, or the file is missing, and the string does not say which.
- **7 name the variable, constraint or object**, so the act is inferable. `--width wants a column
  count of 20 or more, got '9'` gives both the floor and the value it got; `edit: no $EDITOR is set`
  names the variable.

**The loophole was tested and it did not hold.** The article's first lesson is that a small model
found the cheapest way to score well — *say less* — so the missing levers should be the shortest
strings. They are not: the two subsets differ by **one word at the median, 5 against 6**, and the
longest string in the class (12 words) is in the *inferable* set. The gaps do not track length.
They track whether the message stops at the refusal. That is a different defect from the one the
article names, and it is not reachable by a word cap.

**Rule 10 is not applicable, and that is worth recording.** It is a rewrite rule — keep every fact
and value — and it needs a source to compare against. A hand-authored message has none, so the
rule has no purchase here, and no linter could apply it.

## What is genuinely new in the article

Two things, and neither is the linter.

- **The repair loop is non-monotone.** *Pass 2 scored lower than Pass 1; keeping the best-scoring
  version prevented a regression.* That is the class `scripts/elision-monotone.ts` already names and
  gates: **cut lines are non-increasing as the glass widens, and a document that cuts more at a
  wider rung is a hide** (ADR-TABLE-EDGE-CUT-055). Keeping the best-scoring version is what you
  reach for when no monotone criterion can be stated. Ours is the stronger move, and we made it.
- **The completeness argument for the ✗, sharper than the one we wrote.** The September refusal
  rested on the counter's inability to separate use from mention. The article adds a second reason:
  *a style score with no completeness floor rewards saying less.* On this silo that is clause 1 of
  the Base Epistemic Attitude failing by construction — **a claim owes its evidence, and a score
  that pays for brevity pays for the evidence.** ✗ linting the corpus now stands on two arguments,
  and this is the better one.

The article's third piece is the linter's own bug: its first version flagged `approximately`, an
approved word, and the fix was that a controlled language needs a controlled source of truth rather
than memory. That is the rule `scripts/lexicon-lint.ts` already gates on — every coined term states
its `**Prior art:**`, and the baseline may only shrink. The article arrives at the rule; the silo
already has the instrument.

## Where I would land

- ✓ **The style ☐ closes as already true.** STE strict for the CSN class is not a rule to adopt but
  a property the class already has — and one it cannot lose while it stays a diagnostic. Verified on
  24 strings rather than assumed, which is the whole point of running it.
- ☐ **The completeness worklist is the live item, and it is a prose job.** The 9 strings that name
  only the refusal want a lever, held by hand. No linter: the column is read, not matched, and the
  class is a few dozen strings.
- ⋮ **Rule 3.5 and the `-ing` probe** stay as the September note left them — untouched here, and
  still the one STE rule with a measurement attached.
- ✗ **Do not lint the corpus, and do not adopt the score.** Unchanged, and now on two arguments.

What would change my mind: a CSN string that breaks a mechanical rule. The probe found none, so on
this class the standard's mechanical half has nothing left to say.

## What is not in question

- **The binary.** STE is a writing standard; okuda renders. No STE rule touches the byte stream. A
  check like this one could live in `scripts/`, but only as a probe — never on the gate.
- **`prose-check.ts` stays a meter.** The article's linter is a gate with a score; ours is explicitly
  *a meter, not a gate* that always exits 0, with `--strict-leaks` the one class that gates. The
  article's own second lesson — a deterministic judge is only as good as its rules — is the reason a
  score is the wrong shape for a class this small.
- **The prefix question is noted, not answered.** The prefix slot does two jobs: `okuda:` 7 and
  `gloam:` 6 are programs, while `read-only:` 2, `edit:`, `clone:` and `usage:` are mode or kind.
  Whether a reader can tell those apart is a cast question, and ADR-032 and `&ear.md` own the cast.

## Evidence

- `tmp/csn-ste-probe.py` — 24 strings with `src/` provenance, the article's rules 3, 4, 6, 8 and 9,
  two controls, the completeness column and its split, the length check, and the prefix census.
  Run 2026-10-16.
- `docs/2026-09-18-simplified-technical-english.md` — the survey whose ☐ this closes, and the
  control that failed its own lint.
- `scripts/elision-monotone.ts` — the monotonicity law the article's repair loop breaks.
- `scripts/lexicon-lint.ts` — the prior-art gate the article's bug rediscovers.

## Related

- The article `https://medium.com/@visrow/karpathy-says-make-your-llm-write-like-an-aircraft-manual-i-built-a-browser-tool-to-measure-it-17f0aaeb86b4`
- Karpathy's ladder, reviewed `docs/2026-10-14-the-outcrop-and-the-orifice.md`
- The use/mention distinction the counter cannot make `docs/2026-09-10-use-vs-mention.md`
- The gate family `justfile:123`
