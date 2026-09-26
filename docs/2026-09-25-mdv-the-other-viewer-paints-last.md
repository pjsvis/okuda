---
date: 2026-09-25
kind: research note — a second implementation of okuda's job, assessed as a reference
lineage: the reader's pointer to axiros/terminal_markdown_viewer, and the question
  *opinion, and any ideas or techniques we can adapt*. Read against ADR-004,
  ADR-005, ADR-007, ADR-014, `src/wrap.ts`, `src/width.ts`, `src/render.ts`,
  `briefs/2026-09-01-brief-flow-wrap.md`,
  `briefs/2026-09-14-brief-table-width.md`, and `DEPENDENCIES.md`.
status: open — no integration proposed; two findings routed, one to BRF-FLOW-WRAP
  and one to BRF-TABLE-WIDTH
---

# The other viewer paints last, and that is why it flows

> ◆ mdv is a Python terminal markdown viewer, and it is not an integration
> candidate. It is the first *reference implementation* this silo has had of its
> own job, and the one place it differs architecturally is the place okuda is
> weakest: mdv wraps **unstyled** text and colours it at the end. Given the same
> string at the same width, the reference flowed where okuda cut.

## The question, restated

The pointer arrived with a question: *opinion, and any ideas or techniques we can
adapt.* Taken literally, *adapt* presumes a slot, and the first job is to check
whether the slot is open. It is not — twice over.

**mdv cannot be a dependency.** It is Python 3 with `markdown`, `pygments`,
`tabulate`, `pyyaml` and `docopt` behind it. `DEPENDENCIES.md`'s runtime note is
*the compiled okuda binary has zero external npm runtime dependencies*, with
`mermaid-to-md` as the single exception — one 0.1.0 binary invoked per fence. A
Python interpreter and a package tree is a **change of kind**, not a new row.

**mdv is already a solved category here, and the silo solved it by choosing a
reference.** ADR-007 makes Glow (glamour) the visual reference and states the rule
that governs this note: *Glow is the reference, not the spec — okuda does not
vendor glamour's `styles.go`*. A second viewer is the same object: something to
render the same file with and read the difference. So the honest form of the
question is narrower, and it is the interesting one:

> **What does a second implementation of the same job disagree with us about?**

It disagrees about one thing, and it is not styling.

## What mdv is

A single-module Python program (`mdv/markdownviewer.py`) behind a CLI wrapper.
Version 1.7.5, last activity on the repository **2023-10-06** — dormant by about
three years. Its own README calls it *a proof of concept hack* and says *for
complex markdown you want to use other tools. Especially for inlined html it
simply fails.* That is the honest framing for a reference: it is not a competitor
to lose to, and its self-report is more accurate than most.

What it does have is a set of decisions okuda also had to make, made differently,
and therefore legible.

## The two engines disagree on the same string

Both viewers hard-wrap to the terminal width, both refuse to let the terminal do
it, and they differ in the order of two passes.

```mermaid
title: The order of the two passes
flowchart TB
    A[markdown] --> B[wrap plain]
    B --> C[paint last]
    D[markdown] --> E[paint first]
    E --> F[wrap stream]
```

- **mdv wraps plain text and paints last.** The tree walk replaces inline markup
  with **non-ANSI sentinel control characters** — `code_start` and `code_end` are
  `\x07` and `\x08`, and there are ten more. `rewrap()` then calls
  `textwrap.fill(dedented, width=cols)` on text carrying no escape sequences at
  all. The sentinels become SGR in a final pass, `col()`, which is a
  `str.replace` over the finished string.
- **okuda paints first and wraps the stream.** The emitter produces the escape
  stream as it walks, and `wrapANSI` consumes that stream directly — *the escape
  stream IS the style protocol* (`src/wrap.ts:18`, ADR-005). The wrapper is
  therefore ANSI-state-aware by necessity: it tracks open SGRs and OSC-8 zones and
  re-emits the carried state at every line boundary (`flushLine`, `trackEscape`).

The two are not equivalent, and the difference is why BRF-FLOW-WRAP is work.
okuda owns its break rules because it owns the wrap pass; mdv inherits them from a
standard library. Measured on the string the flow brief already uses:

```text
textwrap.fill, width 30
  |briefs/2026-08-28-brief-index-|
  |and-jump.md|

okuda, FZF_PREVIEW_COLUMNS=40
  |briefs/2026-08-28-brief-index-and-ju|
  |mp.md followed by ordinary prose so|
```

| engine | width | where it broke |
|---|---|---|
| `textwrap.fill` | 30 | at a hyphen |
| okuda | 40 | mid-token |

**The reference flows; okuda cuts.** And it flows for a reason worth naming:
`textwrap`'s `break_on_hyphens` defaults to **True**, so the break-after-hyphen
rule okuda is still designing arrived free in the other engine, by default,
unremarked. BRF-FLOW-WRAP already anticipated this — *the `/` and `-` rules
already let this filename flow (it breaks at the hyphens)* — and the measurement
confirms which half does the work.

### A control, because the first reading was wrong

At width 12, `textwrap` appeared to break at `/`, `.` and `-` alike. It does not.
The segments were 4 characters and the width was a multiple of 4, so a **blind
hard-split landed exactly on each separator** and read as separator-aware
breaking. At a coprime width the truth appears:

- `-` — breaks at the separator. `break_on_hyphens=True`.
- `/`, `.`, `_` — do **not**. Each is hard-split mid-token, like any other run.

So of BRF-FLOW-WRAP's two proposed break opportunities, **`-` is the convention
and `/` is the extension.** The brief lists `/` first. Nothing in the brief is
wrong; it is worth knowing which rule a reader arriving from another viewer would
already expect, and it is the hyphen.

## The third remedy for a wide table

BRF-TABLE-WIDTH's ladder has two rungs, and ADR-014 named a third it never built.
The brief's remedies are: fix the allocator's floor to the longest word, edit the
document (attack the dominant column), or elide — elision being the fallback for
the nine irreducible. ADR-014's decision was *elide, not shrink-wrap*, and its
stated invitation to the reader is to *widen the matrix, or page within the
panel*. **Paging is named and unbuilt.**

mdv builds it. `split_blocks` takes the table when it exceeds the width, slices
each rendered line into a first segment of `cols` and continuations of `cols - 2`,
and stacks the segments as **side-by-side blocks**, each re-bordered, with the
continuation dimmed.

The idea is a rung. The implementation is not adoptable, and the probe shows why
in two ways:

- **It is blind to overflow size.** A table 81 columns wide at `cols=80` — one
  column over — produces a *whole second block* carrying one character per row.
- **It is blind to row identity.** The second block carries columns 4 onward and
  **does not repeat a key column**, so its rows are unlabelled. In the palette
  table's split, `249`, `220` and `264` sit under no `heading`, `link` or `muted`.

Both are fixable, and the fix is not mdv's. okuda's own table format already has
the answer: it renders loose tables with a header rule and a body gutter, so a
**row-group chunk that repeats the header** is natural where a column slice is
not. That is a proposal, not a finding — I have not measured it against the nine —
and it belongs in BRF-TABLE-WIDTH's ladder as a fourth rung, to be adopted or
refused on measurement.

One mdv technique does not transfer, and it is worth saying why. mdv measures the
table's rendered width off the **first line of `tabulate`'s output** — safe,
because that output is ANSI-free and its first line is a separator. okuda cannot
use that trick: it renders styled text directly, and BRF-TABLE-WIDTH's *Method*
note is a page of care about which line is trustworthy — *the first line is not
reliable when the table is not isolated*. okuda's `displayWidth()`
(`src/width.ts:255`) is the escape-aware instrument mdv lacks. **The reference
solves a problem okuda does not have, by avoiding the styling okuda applies
first.**

## What I would take, and what I would not

- **Take: the two-pass order, as evidence for BRF-FLOW-WRAP.** Not as a rewrite —
  ADR-005 is a core contract and the cost is already paid — but as a datum. Every
  break rule okuda adds is a rule it must implement ANSI-aware; mdv gets `-` free
  and has no `/` at all. If the `/` rule proves expensive at the seams, the honest
  reading is that the break set is smaller than proposed, not that the
  architecture was wrong.
- **Already closed: the palette audition.** mdv's `-t all` flag renders every
  theme against one file so the eye compares them, and it reads as a proposal
  until you find `just palette-audit` (`justfile:348`) and BRF-PALETTE-AUDIT. The
  brief already owns this: a per-role holds/folds verdict at α = 0.2 and
  α = 1.2, taken against the house's own exhibits, and it states that *nothing
  new needs building*. It also rules out the catalogue half in terms — *no light
  mode, no theme files* — so mdv's 200 themes are not a resource here, and its
  luminosity-sorted ids are a curiosity about someone else's problem. The one
  thing the flag has that the rig does not is a **sweep**: many variants in
  sequence rather than two extremes. If the audit finds a fold, a sweep would
  locate where it begins. That is a bisection aid for a brief already open, not
  a new proposal.
- **Refuse: the execed config.** mdv runs `$HOME/.mdv.py` if it exists. A config
  file that is arbitrary Python, executed at startup, is not an extensibility seam
  okuda wants. okuda has no config tier and no runtime exec.
- **Refuse: admonitions.** A markdown construct okuda's grammar does not carry and
  this silo does not use — zero occurrences across the corpus. A document that
  wants one wants a heading and a blockquote.
- **Refuse: the file-change monitor.** A watcher that re-renders on change is
  *when the text appears*, which is the host's concern. Same lane as the launcher.

## The dependency verdict

**No `DEPENDENCIES.md` entry.** Optional, off the path, never required by the
gate — and in fact not used at all. The reference status needs no row.

The silo has already stated the shape of this answer once, about a different
borrow. BRF-PI-MARKDOWN, parked, asks whether the Pi harness should render
through okuda, and answers: *okuda is a clean standalone renderer; it should not
grow host-integration code.* That is the same gate in the other direction. okuda
neither absorbs a foreign renderer nor offers itself as one — the seam is
keystrokes and bytes, and everything else is the host's.

## What is not in question

- **It is not a judgement on mdv.** It is a 2023 proof of concept that does its
  stated job, and its self-assessment is candid. The claim is that the job is
  already done here.
- **It does not reopen ADR-005.** The escape-stream protocol stands. This note
  reads the alternative and finds okuda's cost inherent to its choice, not a
  mistake in it.
- **It proposes no new ADR.** Nothing reverses a decision and no new pattern is
  introduced. If the split-block rung or the palette audition is pursued, *that*
  earns a record.

## Where I would land

- **The flow finding goes to BRF-FLOW-WRAP** as a measurement, not a task: the
  reference flows the same string, at a hyphen, from a stdlib default. It makes
  the brief's case stronger and narrows which half of its rule is conventional.
- **The split-block rung goes to BRF-TABLE-WIDTH** as a fourth candidate, with
  mdv's two blindnesses named, to be adopted or refused on measurement.
- **The palette idea is not mine to route.** `just palette-audit` and
  BRF-PALETTE-AUDIT own it, and the brief's instrument section already says the
  rig needs nothing new. The sweep observation is a note for that brief at most.

## Evidence

- `tmp/mdv-probe.py` — the `textwrap` defaults, the coprime-width control, and a
  verbatim port of `split_blocks` run over the palette table at `cols` 80 and 40.
- `tmp/flow-probe.md` — the fixture, rendered with `./okuda --no-color` at 80
  columns and at `FZF_PREVIEW_COLUMNS=40`.
- `mdv/markdownviewer.py` — `rewrap`, `col`, `split_blocks`, `borders`, and the
  marker table. Read from the repository, not executed.

**Not verified.** mdv's licence: the repository shows `LICENSE.txt` and a
`licenses/` directory, and neither was opened, so the terms are unknown. The star
count and any formal archived status are also unread. The `split_blocks` port is a
port, not mdv's own output; it drops the `col()` dimming, which changes colour and
not geometry.

## Related

- `briefs/2026-09-01-brief-flow-wrap.md` — the `/` and `-` break opportunities,
  and the atomic-word contract this note measures
- `briefs/2026-09-14-brief-table-width.md` — the remedy ladder, the irreducible
  nine, and the geometry method
- `decisions/005-render-engine-string-protocols.md` — the escape stream IS the
  style protocol, the choice mdv does not make
- `decisions/004-hard-wrap-mandate.md` — okuda owns the line break
- `decisions/007-glow-visual-reference.md` — *the reference, not the spec*, the
  rule that makes a rival viewer legible here
- `decisions/014-table-elision-over-shrink-wrap.md` — superseded, and the only
  place *page within the panel* is named
- `briefs/2026-08-25-brief-pi-markdown-rendering-via-okuda.md` — parked, and the
  silo's existing statement that okuda stays a clean standalone renderer
- `briefs/2026-09-19-brief-palette-audit.md` — the brief that already owns the
  audition, and rules theme files out
- `src/wrap.ts` — `wrapANSI`, `flushLine`, `trackEscape`
- `src/width.ts` — `displayWidth`, the escape-aware measure
- `DEPENDENCIES.md` — the dependency class this note declines to widen
- axiros/terminal_markdown_viewer — `mdv/markdownviewer.py`, `README.md`
