---
type: ADR
callsign: ADR-EXPORT-IDENTIFIES-096
date: 2026-11-25
---

# Decision: The export identifies more maths than the terminal — and the guard stays

**Date:** 2026-11-25
**Status:** Accepted
**Enforced by:** `tests/cahier-math.test.ts` (the ladder's order, the currency
pair, the degrade, the batch alignment) and eight checks in
`scripts/html-package-verify.ts` (`just html-verify`, 43 checks) which measure
*geometry* in Chrome — a fraction counts as rendered only when the denominator
sits below the numerator.

## Context

`BRF-CAHIER-MATH` set out to give the cahier real maths: the export ran the
terminal's glyph pass inside a browser (`scripts/html-package.ts:567`, `:630`),
carrying a cell grid's ceiling into a medium that has none. Phase 1 measured
before writing code, and two of its findings changed the design.

**The converter is broader than the guard, in both directions.** A census of the
renderer's own population (69 files, 177 distinct prose spans, fenced blocks and
code spans stripped first) found 142 spans both rules call maths, **25 the
converter identifies and the guard declines**, and **1 the guard resolves and the
converter refuses** — `$\S$`.

**And the broader rule cannot be split by a test.** `$H_2O$` and `$PATH$` are the
same shape: a command-free span. What separates them in this corpus is a list,
not a rule. Four of the 25 are prose numbers (`$1$`, `$16,041$`, `$22, 33, …$`)
that the converter typesets as maths anyway.

## Decision

**The export adopts the converter's identification; the terminal keeps its guard.**
The asymmetry is deliberate, and it rests on what each failure costs:

- In an **export** artefact, a false positive costs a serif digit — the reader sees
  `16,041`. A false negative costs a visible dollar sign: `$16,041$`, left in place
  by the guard, in a page whose whole purpose is that a claim arrives readable.
- In the **terminal**, the guard is doing work no rule can replace: a segment grid
  renders `costs $5 and $10` and `costs $x and $y` identically, and the guard's
  refusal is the only thing that keeps the currency sentence out of the maths font.

So the two surfaces answer differently, on purpose, and neither answer is a defect.
`ADR-MATH-GRAMMAR-076` is **referenced and unamended**: the terminal keeps the table.

**The mechanism is a ladder, not a swap.** Three stages, each strictly narrowing:

1. `pandoc -f markdown -t html` converts every span it identifies → MathML.
2. What it declines comes back **labelled**: `<span class="math inline">$…$</span>`.
3. On **those spans only**, `applyMathGlyphs` runs — `$\S$` → `§`.

Stage 3 enters by the span wrapper, never by scanning the output for `$`. A
currency pair survives conversion as literal text, so the converted page contains
the accidental pair `$5 and $`. A scan would find it. It happens to be harmless
because the guard requires a backslash command — **safe by accident is not safe** —
so the boundary is structural.

**One segmenter, two policies.** `mapMathSpans` (`src/render.ts:2098`) was
extracted from `applyMathGlyphs`, which now expresses itself over it. The
fence-and-backtick split is the hard part and it is not repeated: the terminal and
the export differ in *policy*, not in what counts as code. This is the rule the
file already applies to `chroma` — one classifier, two output formats.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Swap the whole pre-pass for pandoc's document output | Pandoc's HTML is a different document. Every post-pass — mermaid, chroma fences, state glyphs, reference gold — is tuned to `Bun.markdown.html`, and the panel geometry is the artefact's identity. Converted maths spliced into Bun's output is the narrow change; swapping the converter is a different product. |
| A CDN KaTeX script | It amends the cahier's first guarantee — *one file, no assets, no fonts, no network* (`docs/2026-11-05-the-cahier.md:28`) — to *one file, a vendor, and a version of what a fraction looks like*. A record whose maths layout is resolved at read time is not a record. |
| Vendoring KaTeX into the artefact | ~270 KB of script plus a woff2 font set, against a 2 MiB budget shared with panels. It violates *no fonts* even when it fits, and 94 panels is the existing shape. |
| Converter-only, no third stage | Loses `$\S$` — the one span where the table wins, measured. One visible regression is one too many when the fix is a stage that already exists. |
| Table-only, no converter | The status quo this brief exists to fix: 11 spans left literal on the evidence document, 3 of them relation-bearing. |
| Ask the terminal's guard, ignore the converter entirely | That *is* the table-only case, and it cannot reach the command-free class at all. |
| `texmath` as a second binary | Its Unicode writer refuses `\frac` (076's measurement, re-confirmed here as a *writer* limitation, not a converter one: `-t html` emits `mfrac` 2 of 2). A wrapper around one converter's failing writer is a second binary for a worse answer. |

## Consequences

**What became easier:**

- **The export gets both dimensions without a dependency in the file.** Measured on
  the evidence document: 157/157 spans converted, all 157 laid out, 2/2 fractions
  stacked (28 px and 31 px boxes), 39/39 superscripts raised, 11/11 accents above
  their base, 0 raw TeX left in prose.
- **A document with no maths pays nothing.** `decisions/index.md` — 94 panels,
  800.9 KiB — is byte-identical to before the change. The pass short-circuits on
  the `$` scan.
- **No pandoc on PATH is today's output, byte for byte.** Verified against a HEAD
  worktree: both 53,269 B, `cmp` clean. The degrade is a real branch, not a hope.
- **A declined span is now labelled in the export**, which is 076's mark arriving
  for free — the converter's own wrapper.

**What became harder:**

- **The artefact is bigger where it has maths**: 53,269 → 97,443 B on the evidence
  document (2.83× the body, 1.83× the page). Confined to maths-dense documents;
  the corpus has essentially one.
- **A converter is now in the export path**, so the cahier's output depends on
  `pandoc`'s version. That is why the profile has to be *stamped* and not merely
  probed — the `cahier doctor` phase of the brief exists for this, and the
  artefact may differ between two machines until it lands.
- **One more policy to keep in step**: a glyph added to the terminal table changes
  what stage 3 rescues. The tests pin the direction, not the contents.

## Related

- `briefs/2026-11-25-brief-cahier-math.md` — `BRF-CAHIER-MATH`, the brief this decides
- `decisions/076-a-grammar-not-an-engine.md` — `ADR-MATH-GRAMMAR-076`, referenced
  and unamended; its `-t plain` rejection is a *writer* measurement
- `docs/2026-11-05-the-cahier.md:28` — the guarantee table this must not amend
- `src/render.ts:2098` — `mapMathSpans`, the segmenter both policies share
- `scripts/cahier-math.ts` — the ladder
- `tests/cahier-math.test.ts` — the referee
