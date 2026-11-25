---
callsign: DBF-SECOND-DIMENSION
type: Debrief
date: 2026-11-25
tags: [cahier, maths, html, tables, rendering]
agent: pi (Claude)
environment: local
briefs: [BRF-CAHIER-MATH]
---

# Debrief: The cahier's maths — the export gets the second dimension

## Accomplishments

- **Maths in the export is real maths:** `scripts/cahier-math.ts` converts every
  inline span to MathML at export time. Measured in Chrome on the habitat
  specification: 157/157 spans converted and laid out, 2/2 fractions stacked
  (28 px, 31 px boxes), 39/39 superscripts raised, 11/11 accents above their base,
  0 raw TeX left in prose. Before: 11 spans left literal, 3 of them relation-bearing.
- **No dependency reached the artefact.** MathML is native in Chrome and Safari and
  uses system fonts, so *one file, no assets, no fonts, no network* is unamended —
  a CDN KaTeX was refused for exactly that reason.
- **A wide table now scrolls inside the paper** and reports its own clip, in CSS and
  geometry rather than by a script. Page `scrollWidth` 1383 → 756 on a 756 viewport;
  zero of four tables past the paper.
- **Scope held:** the terminal's glyph pass is untouched, `ADR-MATH-GRAMMAR-076` is
  referenced not rewritten, and `tests/math-glyphs.test.ts` did not move (42 tests).
- **Not done, deliberately:** the doctor (brief steps 7–8), which stays in the queue behind `BRF-CAHIER-MATH`.

## Problems

- **The predicted divergence did not exist.** The brief claimed the decision was
  `costs $x and $y` (pandoc maths, okuda prose). Measured: pandoc declines it too.
  The real divergence is the command-free class, 25 spans, and the one span where
  the table wins (`$\S$`). **Reasoning without measurement, in a brief, about a
  rule whose whole point was measurement.** The brief now records the error rather
  than the corrected claim alone.
- **Two acceptance criteria were wrong in the direction of over-claiming.** *No
  `<script>`* — the cahier ships one inline script by design. *`src/render.ts` is
  unchanged* — the ladder needed the segmenter, and sharing it was the right answer.
  Both corrected in the brief with the reason.
- **The first census counted the wrong population.** It harvested `$(pwd)/okuda`
  out of a code fence — a span the renderer never reaches. The instrument was the
  defect, and the brief says so.
- **A cited path is a promise.** The brief cited `tmp/…` spikes; the cahier resolved
  them and **published both as panels** (14 refs against HEAD's 12) — a
  dereferenceable reference to a gitignored file. Fixed by naming the scripts without
  their paths. The rule: only committable paths are citeable.
- **Probe failures that were my own:** two stale headless Chromes holding one
  debugging port (attached to the wrong instance), then a relative path passed to
  `file://`, which Chrome read as a *host* and silently stayed on `about:blank`. Both
  reported themselves as "`main` is null". The probe now waits on `readyState`,
  resolves paths, and throws when navigation does not land.
- **`in_progress` had no glyph in `&briefs.md`** — a brief with work in it rendered
  as `· open`, and the gate passed because the glyph fell through to a default.
  Found by setting this brief to In Progress and watching nothing change.

## Lessons Learned

- **Measure before the brief as well as before the code.** The one claim this brief
  asserted from reasoning was the one that was false, and it was the claim the whole
  design hung on.
- **The converter's writer, not the converter, was the defect 076 measured.**
  `texmath` refused `\frac` in its *Unicode* writer; `-t html` refuses nothing. A
  rejection recorded against a tool should name the writer, or a later reader will
  refuse the tool.
- **A degrade ladder needs its middle rung discovered, not designed.** The
  three-stage shape — converter, then table on the marked declines, then nothing —
  came from finding one span the table won and one accidental `$…$` pair a naive
  second pass would have scanned. Neither was reachable by argument.
- **"Safe by accident is not safe."** The currency pair survives a naive
  `applyMathGlyphs` because the guard needs a backslash. Targeting the span wrapper
  makes it safe by structure, and that is a criterion rather than a comment.
- **A visual defect reported from the glass still needs measuring.** The
  table-overflow and its first fix (repaint) were both about appearance; the
  numbers showed the first fix changed no geometry at all. And the hypothesis that
  my own change caused it was backwards by 44 px.

## Observations

### Rendering

- The terminal's doctrine transfers to the browser only after asking what the
  medium can do. ADR-055 cuts a table's edge because a *terminal* cannot scroll; the
  browser can, so "whole" arrives as a window. Porting the cut would have been frame
  defaulting in the interface.
- Geometry is the only honest measure of a rendered claim. A `<mfrac>` in the DOM
  says the converter ran; the denominator sitting below the numerator says the
  browser rendered it. Every check added here measures a box.

### Knowledge system

- The registry is a good servant and a poor memory: `reg-sync` and `amp-regen` had
  to be re-run after each document change, and `just decide` after each brief added —
  four derived artefacts moved per commit. That is the price of "the repo is the
  memory", and it is cheaper than a stale panel.
- The `◆ partial` defect is the shape to watch for: a *derived* display falling back
  to a default instead of failing. A glyph table that cannot render its input should
  be loud.

## Metrics

- `just check`: 28/28 gates, ~17 s; tests 1198 → **1214** (16 new in
  `tests/cahier-math.test.ts`).
- `just html-verify`: 35 → **48** checks, all green.
- Export size on the evidence document: 53,269 B → **97,443 B** (maths-dense);
  `decisions/index.md` (94 panels, 800.9 KiB) **byte-identical** — no maths, no cost.
- Degrade, pandoc absent: **byte-identical** to HEAD (`cmp` clean, 53,269 B both).

## Related

- Brief: `briefs/2026-11-25-brief-cahier-math.md` — `BRF-CAHIER-MATH`, still open for
  the doctor (steps 7–8), tracked in the queue
- Decisions: `decisions/096-the-export-identifies-more-maths.md`,
  `decisions/097-the-table-window.md`
- Prior art: `decisions/076-a-grammar-not-an-engine.md` (referenced, unamended),
  `decisions/055-table-edge-cut.md`
- Playbooks exercised: `playbooks/briefs-playbook.md`, `playbooks/defect-playbook.md`,
  `playbooks/debriefs-playbook.md`
