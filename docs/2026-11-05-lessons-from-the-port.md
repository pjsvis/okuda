# Lessons from the port — a terminal renderer, spoken in a second dialect

> Logged 2026-11-05. Status: **research record**, in the shape of
> `docs/2026-08-30-naming-like-nasa.md`: what a second output medium taught us,
> written down so the next port does not re-derive it. The work is
> `BRF-HTML-PACKAGE`; the decision is `ADR-PANEL-NOT-DOOR-081`; the build is
> `scripts/html-package.ts`.

## What was ported

A terminal renderer emits **coloured bytes into a fixed grid**. The package emits
**one self-contained HTML file** holding a document and its one-hop references,
dereferenceable in place. Nothing was re-invented: the palette, the glyph map,
the mermaid pipe, the resolver and the wrap were all already exports — the
package is the same vocabulary spoken in a second dialect.

Nine rounds of the operator reading the artefacts produced the findings below.
Five of them are the same finding, and that convergence is the useful part: the
design was finished early and the rest was fidelity.

## Lesson 1 — The medium corrects in two directions, and only one of them is yours

Every terminal-vs-page difference is one of two kinds:

| Kind | Example | What to do |
|---|---|---|
| **Weight** — a glyph rendered as a graphic | an `<hr>` of `─` characters becomes a 1px line across the measure; a table's blank row becomes a rule | **fix it** — the page is drawing heavier than the source |
| **Density** — the same element, less per screen | line-height 1.45 against the terminal's 1.0 | **leave it** — that is the medium |

Confusing the two wastes a day in either direction: chasing density makes an
unreadable page, and accepting weight makes an ugly one.

**The test:** *did the terminal draw this, or space it?* If it drew it with
glyphs, the page will draw it with pixels, and pixels are heavier.

## Lesson 2 — Every rule is heavier in pixels, so prefer space

Measured across the corpus: **656 thematic breaks outside front matter, 603 of
them (92%) immediately followed by a heading.** The heading already made the
break; the rule said it again, at a weight the terminal never used. The build
now drops a rule that a heading follows, and keeps the 53 that stand alone.

The same law, three times:

- `<hr>` before a heading — dropped.
- table row rules — replaced by a full blank line, as the terminal does.
- a heading's bottom margin at 0.6em — raised to one whole line.

**A rule made of glyphs is a pause. A rule made of pixels is a border. Same
markup, two media, and only one of them is the page's.**

## Lesson 3 — One register per token

A callsign link was carrying three signals: uppercase (its own), gold (the
**path** register), and an underline in a third colour. Measured:
`rgb(232,196,74)` text under `rgb(255,153,102)` rule — two colours on one token,
neither meaning anything.

The fix is not a prettier link; it is **one register per token**:

| Token | Register | Why |
|---|---|---|
| path (`docs/x.md`) | doc-ref gold | the style guide's address colour |
| callsign (`ADR-…`) | prose ink, quiet rule | a registered name is not an address |
| link (text → URL) | link-text | the terminal's link role |

And the rule is always the text's own colour: **the colour is the register, the
rule is only the affordance.** A rule in a second colour is a third signal that
means nothing.

## Lesson 4 — The substrate must be shared, or the rules go missing

The package re-implemented target resolution, and inherited half of it. Two
rules lived in the terminal's resolver and not in the package's:

- **The self-exclusion** (`src/root.ts:305`) — a document citing itself mints
  nothing. The package had no such rule, so `docs/showcase.md` — which names its
  own path in its first paragraph — grew a panel containing a copy of itself.
- **The archive anchor** — the package had it and the terminal did not, so a
  citation to a filed brief went quiet in the terminal and worked in the page.

Both readings are the same defect: **a substrate implemented twice will have
half the rules in each.** The rule is not "share the code" (the two consumers are
genuinely different); it is **enumerate the rules the substrate owes, and check
each one on both sides.**

## Lesson 5 — A budget must name what it costs, and say when it bites

The panel budget was **a count of 24**. A count is a proxy that does not track
what it proxies: measured 9.4 KiB per panel on one document and 18.5 KiB on
another, so 24 panels was 226 KiB in one case and 388 KiB in the other. And it
was dropping most of the references **on the documents that most wanted them** —
56 of 80 on the decisions index.

Three rules, now enforced:

- **Budget the cost, not a proxy for it.** Bytes, with a count as a backstop.
- **Say when it bites.** A dropped reference looks exactly like an unresolvable
  one — gold text, no link — so silence there is a lie by omission.
- **A dropped reference is not an error, but it is a fact.** The build reports
  the count dropped and the budget used.

## Lesson 6 — The quiet failure is the class

Every defect found by reading rather than by a gate:

| Defect | What the reader saw | What a gate saw |
|---|---|---|
| a citation to an archived brief | gold text, no link | nothing |
| a stale `⋮` in the style guide | a glyph in the wrong colour | nothing |
| a heading 50% too wide | three lines where two would do | nothing |
| a self-citing document | a panel holding the page itself | nothing |
| an artefact overwritten by a namesake | a smaller file, silently | nothing |

**None of them threw. All of them looked fine.** That is the argument for the
CSS smoke tests, and the argument for reading the artefacts rather than only
gating them.

## Lesson 7 — Measure the browser; do not reason about it

Every mechanism question that was *reasoned* was answered wrong at least once:

| Question | The reasoning | The measurement |
|---|---|---|
| Does a `:target` panel return the reader to their place? | "fragment navigation scrolls" | it does not, because a fixed element has no scroll position |
| Does `history.replaceState` re-fire `:target`? | "it changes the URL" | it does not — a class has to carry the state |
| Why does a `fixed` close button scroll away? | "the transform creates a containing block" | `content-visibility` implies `contain: layout`, which does too — and that one survives `:target` |
| Can `Bun.markdown.html()` take a handler? | "it is the same parser family" | it ignores one; `render()` with partial handlers falls back to plain text |

Each cost minutes to measure and hours to reason about wrongly.

## The checklist, for the next port

- [ ] Enumerate what the source renderer **owes** — resolution rules, self-exclusion, archive, budgets. Check each on both sides.
- [ ] Take the palette from **one** file. A derived custom-property block is not a second list.
- [ ] Distinguish **weight** from **density** before changing anything.
- [ ] Prefer **space** to rules, everywhere the source used space.
- [ ] Give each token **one** register, and make the rule the text's own colour.
- [ ] Budget the **cost**, and print when the budget bites.
- [ ] Measure the platform. Every reasoned answer was wrong once.
- [ ] Read the artefact. The gates cover behaviour; nothing covers look until you build an instrument for it.

## Naming — a proposal, not a decision

The artefact needs a human name. The house rule is NASA's fourth lesson
(`docs/2026-08-30-naming-like-nasa.md`): **a name must not lie about its
referent** (LEM → LM, 1966). And the machine code stays ugly on purpose — the
script is `html-package`, and nobody is asked to say that out loud.

What the referent is: *a small, complete set of leaves — a main document and its
references — bound as one file that carries everything it needs.*

| Candidate | The referent | The veto |
|---|---|---|
| **quire** | a gathering of leaves bound as one book | *recommended* — precise to binding, one syllable, unused in software |
| sheaf | a bundle of loose papers | **lies**: a sheaf is unbound, and this artefact holds together absolutely |
| dossier | a collection of documents about one subject | connotes espionage and a person, not a document |
| bundle / package | things carried together | no referent beyond transport; collides with software distribution |
| vade mecum | a handbook carried for ready reference | accurate but two words, and a name you would have to spell |

**Proposal:** the artefact is a **quire**. `just html <file>` produces one; a
quire of documents is the set. The machine code does not change.

## Related

- `decisions/081-the-panel-not-the-door.md` — the mechanism decision, amended once
- `docs/2026-08-30-naming-like-nasa.md` — the source of the veto applied above
- `docs/2026-11-04-font-coverage.md` — the repertoire a page cannot guarantee
- `debriefs/2026-11-05-debrief-the-panel-not-the-door.md` — the narrative
