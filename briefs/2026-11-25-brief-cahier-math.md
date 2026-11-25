---
type: Brief
callsign: BRF-CAHIER-MATH
---

# Brief: The cahier's maths — the export gets the second dimension

**Date:** 2026-11-25
**Status:** Open
**Warrant:** operator call, 2026-11-25 — no ledger entry.

---

## Context

The cahier runs the *terminal's* maths pass inside a browser:
`Bun.markdown.html(applyMathGlyphs(source))` at `scripts/html-package.ts:567`, and
again per panel at `:630`. That pass exists because a cell grid is one row tall and
a fraction needs two — a boundary condition `ADR-MATH-GRAMMAR-076:84` states as
*"One dimension → the table. Two dimensions → the door that already exists."*

A browser is not a cell grid. The export carries the terminal's ceiling into a
medium that does not have one, which is **frame defaulting running in reverse**:
the default frame is applied where the boundary conditions have departed from it.
On the one maths-dense document in the corpus it costs **11 spans left literal**,
three of them relation-bearing — in an artefact whose entire purpose is that a
claim arrives with its evidence attached.

## Objective

The cahier renders maths as **native MathML**, converted at export time, so that
maths that needs two dimensions gets two dimensions without adding a dependency,
a font, a script, or a network to the published file — and it reports which of its
rungs are present, so a reader can tell a degraded artefact from a poor author.

**One deliverable, two phases.** The doctor is not a second feature; it is the
receipt for the rung this brief adds. Two rungs degraded silently before it
(`chroma`, `mermaid-to-md`); a third makes the silence a pattern.

## Evidence

Measured 2026-11-25 on this machine, `pandoc 3.11`. The evidence document is
`docs/2026-10-30-server-blades-in-space.md` — the orbital habitat specification
that forced `ADR-MATH-GRAMMAR-076` (`25c8365`), 26,275 B, 157 inline spans, 25
distinct commands.

| reading | value |
|---|---|
| `pandoc -f markdown -t html`: `<math>` elements | **157 / 157** |
| `<mfrac>` | **2** — both fraction equations |
| `<msup>` / `<msub>` / `<mover>` | 39 / 46 / 11 |
| whole-document export | **0.07 s** |
| output size | 26,275 B → 74,380 B (2.83×) |
| okuda's current answer: spans left literal | **11**, all command-free, 3 relation-bearing |
| currency guard: `costs $5 and $10 for two.` | pandoc leaves it **literal** ✓ |
| currency guard: `Cost: $5.` | pandoc leaves it **literal** ✓ |

**The ADR-076 failure does not reproduce, and the reason is the writer.**
076 recorded `texmath` at 122/124 because it *"refuses `\frac` outright in its
Unicode writer"*, and the two spans it dropped were the two fraction-bearing
governing equations. That measurement is about `-t plain`. `-t html` targets
MathML and refuses nothing: `mfrac` 2 of 2. **The rejected writer was the Unicode
writer, not the converter** — 076's decision stands for the terminal it was about.

**The 11 literal spans are not a vocabulary gap; they are the currency guard.**
They are `$V$`, `$A$`, `$B_4C$`×2, `$T^4$`×2, `$T$`, `$Z=13$`, `$Z=82$`, `$Z=1$`,
`$H_2O$` — every one of them command-free, so `mathGlyphs` declines to identify
them as maths at all, by design (`src/render.ts:1976-1990`). Adding table rows
cannot reach them. Pandoc *does* identify them (`H_2O` → `<msub><mi>H</mi><mn>2</mn></msub><mi>O</mi>`,
`Z=13` → `<mo>=</mo>`), and refuses both currency cases — its dollar rule requires
the closing `$` not be followed by a digit. **Its guard is not weaker than ours on
the case the guard exists for.**

**The one behaviour difference that must be decided rather than inherited:**
`costs $x and $y` — pandoc treats it as maths; okuda's guard does not. See Scope.

**Why the 173 ms objection does not apply.** `ADR-MATH-GRAMMAR-076` rejected
`pandoc -t plain` at *"173 ms/frame for a document, on a renderer whose instrument
deployment repaints continuously"*. The export path runs **once**. 0.07 s is not
tolerable in a render loop and is unmeasurable in an export. This brief does not
overturn 076; it applies 076's reason to a path 076 never considered.

**The capability profile already exists, and it is hand-written — which is the
problem.** `DEPENDENCIES.md` is a table of every external tool with a `Version`, a
`Verified` date and a `Proven by` instrument. Its own preamble records the failure
mode: *"how `mermaid-to-md` read verified on Linux for a month while the pipe that
consumes it produced nothing (`DBF-OMARCHY-TOOLCHAIN`)"*, and *"an empty prover
cell is a finding, not a gap."* A table a human types is **specified**; it drifts
from the machine and cannot notice. A probe is **derived**; it cannot drift
("Derived, not specified", `AGENTS.md`). The doctor is that probe.

**And the doctor belongs where the degrade is silent.** okuda's terminal marks its
declines *in situ*: `⋮ mermaid-to-md declined` on the page, the codespan mark on a
span it could not translate (`ADR-MATH-GRAMMAR-076`). The cahier marks the mermaid
refusal (`scripts/html-package.ts:157`) and would mark **nothing** for maths — a
flat glyph and a written-flat span are indistinguishable to the reader. That is
076's own finding one level up: *"A declined span was visible but not labelled."*
**The doctor is the receipt for the toolchain, as the mark is the receipt for the
span.**

**Why the cahier's headline guarantee survives.** It has to: *"**One file** — no
assets, no fonts, no network. Email it, archive it, open it on a plane"*
(`docs/2026-11-05-the-cahier.md:28`), asserted by `just html-verify`. MathML is
native in Chrome and Safari, uses **system** fonts, needs no script and no fetch.
A CDN KaTeX would have amended that row; MathML does not touch it.

## Scope

**In:**

- The maths pre-pass in `scripts/html-package.ts` at both sites (`:567` document,
  `:630` panel body): LaTeX → MathML via `pandoc`, replacing `applyMathGlyphs`
  **in the export path only**.
- The degrade: `pandoc` absent or failing → `applyMathGlyphs`, today's output
  byte for byte. The house pattern is already two rungs deep — `chroma` and
  `mermaid-to-md`, *"the tool stays a shell over them and degrades without them"*
  (`briefs/2026-11-05-brief-cahier-binary.md`), and `mermaidPass`'s refusal is the
  model (`scripts/html-package.ts:145-161`).
- `cahier doctor` — the capability profile as a **fourth verb** on the
  compositor (`scripts/html-package.ts:476-486` holds the two discovery verbs):
  one row per rung, naming the **consequence** rather than the binary
  (`pandoc 3.11 → maths: MathML`, `chroma absent → code: uncoloured`), the build
  stamp, and `--json` for machines.
- `DEPENDENCIES.md`'s **`Version` and presence** cells become derived from the
  probe, with a gate that fails when the file and the machine disagree. `Purpose`
  and `Proven by` stay authored — a purpose is a judgement and a prover is a
  *choice of instrument*, neither of which is measurable.
- The decision on the `$x$ and $y` divergence, recorded as an ADR.
- The measurement: `just html-verify` gains checks for maths, so the claim is
  asserted in Chrome rather than read.

**Out, deliberately:**

- **The terminal's glyph pass.** `src/render.ts:2110` is untouched. A cell grid is
  one row tall; the table is the correct answer there and stays.
- **Display math (`$$`).** The corpus has none — measured, 0 display spans. MathML
  would take it (`display="block"`), but there is no evidence to rank against and
  076's discipline is *"vocabulary arrives on evidence"*. Investigate; do not build.
- **Adding rows to the terminal table.** The 11 literal spans are unreachable by
  rows. A row added to reach them is the row the gate then honours wrongly.
- **Any script, font, or CDN in the published artefact.** Non-negotiable: it is the
  guarantee, not a preference.
- **A "view in another renderer" actuator.** Refused as a *feature* and **permitted
  as a practice** — see Notes.
- **The doctor judging adequacy.** It reports *present*, *version*, *path* and the
  consequence. It does not decide whether a rung is good enough: that is a second
  classifier, which the sibling brief forbids
  (`briefs/2026-11-05-brief-cahier-binary.md`, *"Not a second classifier"*).
- **A doctor on `okuda`.** The terminal marks every decline at the point of use;
  one `scripts/doctor.ts`, surfaced as `cahier doctor`, is the shared instrument.
- **`doctor` failing the build by default.** It reports; it does not gate. A
  degraded machine can still publish the best artefact it can make.

## Preconditions

1. `pandoc` on `PATH` at build/export time. Verified present
   (`/opt/homebrew/bin/pandoc`, 3.11). Its absence is a degrade, not a halt — so
   this precondition gates the *gain*, not the work.
2. `just html-verify` green before the change, so a regression is attributable.
   Chrome is required by that script (it names the path).
3. `applyMathGlyphs` is exported and reachable as the fallback — `src/render.ts:2110`.

## Work Plan

1. [ ] **Measure before touching code.** Export the evidence document with a local
   spike that swaps the pre-pass, and record: `<math>` count, `mfrac` count, total
   bytes, and the Chrome rendering of `\frac`, `\sum`, `\vec`, `\hat`. Confirm 157/157
   and that no span regresses to raw `$…$`.
2. [ ] **Confirm the currency guard in both directions.** `costs $5 and $10`,
   `Cost: $5.`, `costs $x and $y`, `$H_2O$`, `$Z=13$`. Record pandoc's answer and
   okuda's side by side. This is the ADR's table.
3. [ ] **Implement `mathMlPass`** in `scripts/html-package.ts`, shaped like
   `mermaidPass`: one `pandoc` call for the document, one per panel body, a
   present/absent branch, and a named degrade to `applyMathGlyphs`.
4. [ ] **Measure the byte cost on a large cahier.** `just html decisions/index.md`
   — 80 panels, 687 KiB today. Record the delta against the 2 MiB default
   (`scripts/html-package.ts:517`) and against `--max-panels`.
5. [ ] **Extend `just html-verify`** with the maths checks: `<math>` present, no
   raw `$` in rendered prose, guarantee table unamended, `#ref-27` still resolves.
6. [ ] **The ADR**: the `$x$ and $y` divergence — adopt pandoc's identification for
   export, keep okuda's for the terminal, or declare one rule for both. Two viable
   options; record the choice and its reason.
7. [ ] **`scripts/doctor.ts`, surfaced as `cahier doctor`.** Probe `pandoc`,
   `chroma`, `mermaid-to-md`; print `tool · version · present/absent ·
   consequence`; `--json` emits the same fields. Exit 0 always; `--strict` exits 1
   if any rung is degraded, for a machine that wants to pin a full profile.
8. [ ] **Derive `DEPENDENCIES.md`'s version cells** from the probe and add the
   drift gate: a `just` recipe fails when a `Version`/presence cell disagrees with
   the machine. `Purpose` and `Proven by` are untouched.
9. [ ] Registry: `just reg-sync-fix`, review the derived entry.

## Acceptance Criteria

1. `just check` green.
2. `just html-verify` green, including the new maths checks — the guarantee table's
   rows are **all still true**, with no row amended.
3. On `docs/2026-10-30-server-blades-in-space.md`: **157 `<math>` elements**, **2
   `<mfrac>`**, **0** remaining literal `$…$` spans in rendered prose.
4. With `pandoc` removed from `PATH`, `just html <file>` output is **byte-for-byte
   identical** to today's — a test pins the comparison.
5. `costs $5 and $10` and `Cost: $5.` render as prose in the cahier, by test.
6. The published file contains **no** `<script>`, no `http://` or `https://` asset
   reference, and no `@font-face` — asserted by a check in `html-package-verify.ts`.
7. `src/render.ts` is unchanged; `tests/math-glyphs.test.ts` does not move.
8. `cahier doctor` names every rung with its consequence, and `--json` parses. On
   this machine it reports `pandoc` present (maths: MathML). With a rung removed
   from `PATH`, the row reads absent and its consequence reads the degrade — a test
   pins both.
9. `cahier doctor --strict` exits 1 on a degraded rung, 0 on a full one — a test
   pins the exit codes.
10. The `DEPENDENCIES.md` drift gate fails when a version cell is edited by hand to
    disagree with the probe, and passes when the file is regenerated.
11. `ADR-MATH-GRAMMAR-076` is not amended. If the maths ADR of step 6 concludes
   otherwise, 076 is **referenced**, not rewritten.

## Notes

- **The backstop, recorded as a permission.** The operator's call, 2026-11-25:
  *"if you want or need to render your file in another viewer go ahead."* Reading a
  document in MarkText, or any other renderer, is **permitted and needs no code**.
  It is not a verb, not a keybinding, not an actuator: the coordinate cannot cross
  (`marktext --help` takes `[path ...]` — no line, no heading), so a spawn would be
  a keybinding for `open -a`. Recorded here so the permission is explicit and the
  feature is refused *while* the practice is admitted. If a future renderer gains a
  fragment argument, that is a new brief with new evidence, not a resumed one.
- **Byte cost is real and must be stated, not buried.** 2.83× on a maths-dense
  document. A document with no maths pays nothing — the pass short-circuits on a
  source with no `$`, exactly as `mathGlyphs` does (`src/render.ts:1981`).
- **The `<annotation>` is the receipt.** Pandoc keeps the author's TeX in
  `<annotation encoding="application/x-tex">`, so degradation remains *"shown
  exactly as written"* — 076's posture, now with a medium that can do better. A
  reader can recover the source from the artefact.
- **Chrome's MathML is not Safari's.** Measured in Chrome only unless `html-verify`
  is extended. Do not claim browser parity that was not run.
- **`doctor` is a third verb but not a third *discovery* verb.** The comment at
  `scripts/html-package.ts:476` says *"the actuator's two discovery verbs"* and it
  stays true: `--help` and `--version` discover the interface; `doctor` reports the
  environment. Say that in the comment rather than editing the count.
- **The reproducibility objection is the real reason for the doctor, and it should
  be stated in the output, not just the terminal.** A degrade ladder means the same
  document on two machines produces two different artefacts — and the cahier is a
  *record*. `--profile` prints the profile into the existing provenance line
  (`scripts/html-package.ts:404-408`, `:752-754`), so a reader can tell a flat
  fraction from a declined one without leaving the page. This is the strongest
  argument for the phase and the one most likely to be dropped for scope.
- **One failure risk:** the panel bodies re-run the pre-pass per panel (`:630`). If a
  `pandoc` call is added per panel, 80 panels is 80 subprocesses. Batch: one call
  per distinct body, or one call for the document and render panels from it. This is
  the step most likely to be got wrong for speed and is why step 4 exists.

## Related

- `decisions/076-a-grammar-not-an-engine.md` — `ADR-MATH-GRAMMAR-076`, referenced
  and unamended: the terminal keeps the table
- `docs/2026-11-05-the-cahier.md:28` — the guarantee row this must not amend
- `briefs/2026-11-05-brief-cahier-binary.md` — *"stays a shell over them and
  degrades without them"*, the pattern `pandoc` joins
- `scripts/html-package.ts:567`, `:630` — the two pre-pass sites
- `scripts/html-package.ts:145-161` — `mermaidPass`, the shape to copy
- `src/render.ts:2110` — `applyMathGlyphs`, the fallback and the terminal's answer
- `docs/2026-10-30-server-blades-in-space.md` — the evidence document
- `docs/ideas.md` — the ledger; this brief is an operator call, and says so
- `DEPENDENCIES.md` — the specified capability profile the doctor derives
- `briefs/2026-11-05-brief-cahier-binary.md` — *"Not a second classifier"*, the
  bound on what the doctor may decide
