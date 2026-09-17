---
date: 2026-09-16
kind: design note — three claims from a web-layout engine tested against okuda's code, and what the corpus that ships with it actually buys
lineage: docs/2026-09-16-pretext-lessons-learned.md (the note under test); briefs/2026-09-01-brief-flow-wrap.md (the open brief the finding lands on); github.com/chenglou/pretext (cloned to tmp/, 2026-09-16)
status: open — nothing is built; two of the three claims are answered no, the third extends an open brief
---

# okuda breaks on one character; the corpus names the other three

> ◆ The pretext note's advice splits three ways. The Unicode width work is
> already done — and done better, since a grapheme-cluster model gets ZWJ emoji
> right where the reference gets them wrong. The range-based cursor optimises a
> 5.6 ms term against a 68 ms one, so it is not the win. The third claim is real
> and lands on an open brief — `wrapANSI` honours exactly one break character,
> U+0020, and misses U+200B, U+00AD and U+3000, which is why Khmer never wraps at
> a word boundary. And the corpus is the part worth keeping: 11 scripts that
> reach 440 width disagreements and 225 overflowing lines against a test suite
> that covers CJK and Kana and nothing else.

## What we are deciding

Three things, and they are separable:

1. Whether anything in pretext improves okuda's width and wrap engines.
2. Whether the corpus it ships with is worth having.
3. If so, in what form — vendored, or borrowed.

## The three claims, tested

The note's claims are read against the code rather than accepted, because two of
them are advice for a browser that does not survive contact with a cell grid.

| the note's claim | what the code already does |
|---|---|
| Measure in visual columns, not code points; borrow string-width | Done, and better — `src/width.ts` |
| Return integer ranges, not `string[]` | Not applicable — the anchor needs the text |
| Honour the punctuation glue rules (kin-soku) | **Real gap** — and it is on an open brief |

## The engine already does the hard part

`src/width.ts` implements the whole of the note's first claim, and it goes one
level below it. Grapheme clustering via `Intl.Segmenter`, East Asian Width W/F
at 2 columns, combining marks and ANSI at 0, VS16 forcing emoji presentation.

The note's prescription — *"usually handled by `string-width` or an equivalent
`wcwidth` port"* — would be a **downgrade**. `wcwidth` is per-code-point; okuda
is per-grapheme. Measured against the corpus, that difference is where the two
models part:

| cluster | okuda | wcwidth | who is right |
|---|---|---|---|
| `👩💻` | 2 | 4 | okuda — one glyph, two cells |
| `👨🏽🔬` | 2 | 6 | okuda |
| `👨👩👧👦` | 2 | 8 | okuda |
| `र्ट` | 1 | 2 | unresolved |

`wcwidth` has no ZWJ concept, so it sums four code points and calls a family
emoji eight cells wide. A terminal draws it in two. **So the external reference
is not ground truth here, and the corpus's 440 disagreements are not 440 bugs** —
they are one design difference, cluster model against code-point model, and on
the three cases where it is decidable okuda has the better of it.

The table also shows why the corpus matters anyway: `र्ट` is a Devanagari
conjunct, okuda calls it 1 and the reference calls it 2, and nothing in okuda's
test suite reaches it.

## The allocation is not the cost

The note's second claim is that a wrap engine should return integer ranges
rather than `string[]`, because *"allocating hundreds of substrings on every
terminal resize event burns through the GC"*.

The `string[]` is real — `wrapANSI` returns one — and the anchor path does
re-render the whole document on every SIGWINCH. Priced:

| cost | measured |
|---|---|
| largest document, full wrap at 80 columns | 5.58 ms |
| the same six largest, at 80 columns | 23.12 ms |
| the same six, at 200 columns | 24.74 ms |

And the other costs on that same path, from the scaling profile: the **mermaid
re-spawn is 68 ms for a 4-fence document and 209 ms for a 12-fence one**. So the
allocation is an order of magnitude below the thing that actually makes a resize
feel slow, and it is in a different subsystem.

There is a second reason the range model does not fit: `reanchoredScroll` pins
the line under the eye by a **bounded text match** — `findAnchor(newLines,
anchor.text, …)`. It searches the *rendered* lines, after wrapping and after
annotation. Source ranges do not give you that without running the wrap, so the
abstraction would add work rather than remove it.

## The one claim that lands — and the inventory is short

The third claim is the punctuation and break rules, and it is real. Measured
against the characters that carry them:

| character | codepoint | expected | observed |
|---|---|---|---|
| ASCII space | U+0020 | break | breaks |
| ZERO WIDTH SPACE | U+200B | break | hard-splits |
| SOFT HYPHEN | U+00AD | break | hard-splits |
| IDEOGRAPHIC SPACE | U+3000 | break | hard-splits |
| NBSP | U+00A0 | no break | no break |
| NARROW NBSP | U+202F | no break | no break |
| WORD JOINER | U+2060 | no break | no break |
| ZERO WIDTH NO-BREAK | U+FEFF | no break | no break |

`wrapANSI` honours **one** break character, U+0020, and correctly ignores the
whole non-breaking family. It is the three break opportunities it misses.

**And the brief that owns this already found the mechanism.** `BRF-FLOW-WRAP`
(2026-09-01, Open) says exactly the right thing:

> `wrapANSI` (ADR-004) breaks only on space and newline. Every spaceless run is
> one atomic **word**.

Its decision is *"give the wrap engine internal break opportunities. A word may
break after `/` and `-` as well as at spaces."* Its own reasoning says the
mechanism is general — *"the principle (flow) is general; the mechanism (break
opportunities) is general"* — and then names two ASCII characters. The brief
went looking for path flow, found the right abstraction, and gave it the
inventory its motivating nit needed.

So this is not a new brief. It is the same brief with three more characters in
the list, and one sub-rule the brief has no reason to have anticipated:

- **U+200B** — break, emit nothing.
- **U+3000** — break, emit nothing (it is a space; it must be absorbed).
- **U+00AD** — break **and emit a hyphen**. This is the one that is not merely
  a break opportunity but a break with a visible consequence, so it is a
  different rule and the brief's `/`-and-`-` framing does not cover it.

## What it costs today

The Khmer corpus is the proof, and it is unusually clean. Khmer writes its word
separator as **U+200B** — the 70 KB file holds 4,401 of them. okuda counts them
at zero width (correct) and does not break on them (the defect), so a Khmer
paragraph is **one word**. It is then hard-split at arbitrary grapheme
boundaries, and because the cluster model under-counts virama conjuncts against
the reference, the split lands past the pane:

| file | lines over 80 by the reference ruler |
|---|---|
| Khmer, volume 7 | 105 |
| Hindi, Eidgah | 94 |
| Thai, Vetal story 1 | 15 |
| Thai, Vetal story 7 | 10 |
| mixed app text | 1 |

225 lines of 10,561. And the internal invariant held perfectly throughout — **0
violations at 80 columns by okuda's own ruler, across 18 files and 11 scripts.**
That is the point: okuda is self-consistent and still wrong, because the ruler
and the model are the same object. It took an external reference to see it.

## The corpus is the asset

18 sources, 11 scripts, 1.6 MB: Arabic, Hebrew, Urdu, Hindi, Khmer, Thai,
Myanmar, Japanese, Korean, Chinese, English — plus a synthetic mixed-script
stress file. The scripts are public-domain literature (Wikisource, Gutenberg);
the code is MIT.

**One caution before vendoring: `sources.json` carries no licence field.** The
repository's MIT covers the code, and the texts are a different provenance that
the repository does not declare. That is a real reason to be careful about
copying the corpus wholesale into a project that keeps a `DEPENDENCIES.md`.

So the value splits in two, and the split is the recommendation:

- **Discovery is transient.** The literary corpus is what tells you *what to
  pin* — 440 disagreements, 225 overflowing lines, three missed break
  characters. That is a probe input. It belongs in `tmp/`, gitignored, cloned
  when wanted.
- **Regression is vendored.** What belongs in the repository is the smallest
  fixture that pins the behaviour once it is known.

And the smallest such fixture already exists and is already clean —
`mixed-app-text.txt`:

| property | measured |
|---|---|
| size | 1,381 bytes, `synthetic://` provenance |
| distinct graphemes | 182 |
| scripts | Latin, Arabic, Hebrew, Devanagari, Thai, digits |
| format characters | 6 of the 9 — U+200B, U+00AD, U+00A0, U+202F, U+2060, U+200D |
| reproduces | 1 Devanagari conjunct, 3 ZWJ emoji |

It is **pretext's own authorship**, so it travels under their MIT grant rather
than Wikisource's. It covers both disagreement classes in 182 graphemes.

**And the bulk is not the value.** `hi-eidgah.txt` is 61 KB of Devanagari and
contains **zero** format characters — so it buys nothing that the 23 Devanagari
characters in the synthetic file do not, except volume. The one thing the
synthetic file lacks is *bulk U+200B*, and that is one hand-written line, not a
70 KB novel.

## The fork

**A — extend the brief, keep the corpus transient, vendor the synthetic file.**

- Add U+200B, U+00AD, U+3000 and the hyphen sub-rule to `BRF-FLOW-WRAP`'s
  decision, with the corpus as the evidence.
- Vendor `mixed-app-text.txt` as the regression fixture, plus hand-authored
  cases for the three break characters and a ZWJ family sequence.
- Clone the literary corpus into `tmp/` when a probe needs volume; never commit
  it.
- Costs: the brief grows past its original path-flow motivation, and okuda
  acquires a small third-party fixture with a provenance note.

**B — treat it as a rendering-breadth decision, and write an ADR.**

- okuda is currently an English-prose renderer that happens to survive CJK.
  Honouring UAX #14's break classes is a claim about *which readers okuda
  serves*, and that is a scope question, not a bug fix.
- The three characters are the thin end: kinsoku (no line may begin with a
  closing bracket), Thai dictionary breaking, and Arabic shaping are all behind
  the same door.
- Costs: an ADR and a real scope commitment, where A gets the readable 90% for
  three characters.

## What is not in question

- **The three-concerns test.** Nothing here touches compositing or windowing.
  Break opportunities and cluster widths are the byte stream, which is ours.
- **The width model's shape.** Grapheme clustering is right; the corpus
  confirms it on the cases where the reference is wrong.
- **The internal invariant.** Every line ≤ width held at 10,561 lines. The
  defect is the ruler's *agreement*, not its consistency.
- **DuckDB and the index.** Unrelated, and the earlier note stands.

## Where I would land

**A, and the corpus question is the more valuable half of this document.**

The pretext note's own verdict — *"leave the repository on GitHub, borrow only
the range-based cursor abstraction"* — is exactly backwards. The cursor
abstraction is the one thing that does not transfer: okuda's anchor needs
rendered text, and the cost it targets is 5.58 ms against a 68 ms neighbour.
What does transfer is not in the note at all. It is the corpus, and it is the
`TAXONOMY.md` that comes with it.

The taxonomy is worth more than any single rule in it. It names the classes a
width miss can belong to — `corpus-dirty`, `normalization`, `boundary-discovery`,
`glue-policy`, `edge-fit`, `shaping-context`, `font-mismatch`,
`diagnostic-sensitivity` — and gives a **steering order** for ruling them out.
okuda's finding is squarely `boundary-discovery`: *"a script needs additional
glue / splitting rules around punctuation or marks."* Having that word for it
is what turns "Khmer looks wrong" into a one-line change on a brief that is
already open.

So the order:

1. **The three characters on `BRF-FLOW-WRAP`.** It is Open, `src/wrap.ts` is
   untouched, and there is no td issue — so nothing is in flight and the brief
   is still a plan. One edit, before it is implemented with the wrong list.
2. **The fixture.** Vendor the synthetic file and write the hand-authored cases
   for the three break characters and a ZWJ sequence. The suite currently
   covers CJK, Kana and *standalone* emoji; it has no ZWJ sequence and no
   Devanagari, Khmer, Thai, Myanmar or RTL at all.
3. **The cluster-width question, deliberately deferred.** Whether `र्ट` is 1 or
   2 cells is font- and terminal-dependent, the reference disagrees with itself
   across scripts, and okuda's answer is defensible. Write down that it is
   *unresolved* rather than guess.
4. **The literary corpus as a `tmp/` probe input**, with a note that its licence
   is undeclared upstream.

What would change my mind: if the intent is that okuda serves non-English prose
as a first-class case rather than a survival case, then B moves first and the
three characters become a symptom rather than the task. That is a scope
decision, and it belongs to whoever owns the product rather than the renderer.

## Evidence

Six probes, all in `tmp/` (scratch, gitignored). The corpus is cloned to
`tmp/pretext/` — 9.9 MB, shallow.

- `tmp/corpus-wrap-probe.ts` — the wrap invariant over 18 files, 10,561 lines.
- `tmp/corpus-grapheme-dump.ts` — every distinct grapheme with okuda's width.
- `tmp/corpus-width-compare.py` — the comparison against `wcwidth`.
- `tmp/corpus-width-classes.py` — the disagreements grouped by kind and script.
- `tmp/corpus-overflow-probe.ts` + `tmp/corpus-overflow-measure.py` — wrap with
  okuda, measure with the reference.
- `tmp/break-opportunity-probe.ts` — the eight break characters, one at a time.
- `tmp/resize-cost-probe.ts` — the allocation priced against the mermaid path.

## Related

- `docs/2026-09-16-pretext-lessons-learned.md` — the note under test, corrected
  in place
- `briefs/2026-09-01-brief-flow-wrap.md` — the open brief this extends
  (BRF-FLOW-WRAP)
- `decisions/004-hard-wrap-mandate.md` — the mandate the brief amends
- `src/width.ts` — the cluster model; `src/wrap.ts` — `appendWord`, the site
- `tests/wrap.test.ts`, `tests/width.test.ts` — CJK and Kana only today
- `docs/2026-09-15-the-scaling-profile.md` — the mermaid re-spawn figures
- `DEPENDENCIES.md` — where a vendored fixture's provenance belongs
