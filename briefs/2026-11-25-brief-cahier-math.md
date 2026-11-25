---
type: Brief
callsign: BRF-CAHIER-MATH
---

# Brief: The cahier's maths — the export gets the second dimension

**Date:** 2026-11-25
**Status:** In Progress — phase 1 measured 2026-11-25; the design changed as a result.
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

The evidence document is `docs/2026-10-30-server-blades-in-space.md` — the orbital
habitat specification that forced `ADR-MATH-GRAMMAR-076` (`25c8365`), 26,191 B,
157 inline spans, 25 distinct commands. Measured 2026-11-25 on this machine,
`pandoc 3.11`, `Google Chrome 153`.

**The layout, measured in Chrome** (`spike-cahier-math`, a throwaway script in
the gitignored `tmp/` tier — named without its path, see Notes): the same document rendered two ways, wrapped in the real cahier CSS.
Markup counts say the converter ran; **boxes** say the browser rendered it, so
the probe measures geometry — a fraction counts only when the denominator sits
below the numerator.

| reading | A: glyph pass | B: pandoc MathML |
|---|---|---|
| `<math>` elements | 0 | **157** |
| laid out (box > 0) | 0 | **157** |
| `<mfrac>` — and stacked | 0 / — | **2 / 2** (28 px, 31 px) |
| `<msup>` — and raised | 0 / — | **39 / 39** |
| `<mover>` — and above the base | 0 / — | **11 / 11** |
| raw `$…$` left in prose | **11** | **0** |
| body bytes | 27,888 | 74,135 (**2.66×**) |
| whole-document conversion | — | **0.07 s** |

**The census — the ADR question, made a list.** (`spike-span-census`, same
scratch tier.
The population is the renderer's own: fenced blocks and code spans stripped
first, `src/render.ts:2087`. The first run of this spike omitted that and
harvested `$(pwd)/okuda` out of a fence — a span the renderer never reaches,
which would have inflated the gain. Recorded because the error was in the
instrument, not the subject.)

| verdict | spans | of 177 |
|---|---|---|
| both rules agree it is maths | 142 | 80% |
| **pandoc identifies, okuda declines** | **25** | **14%** |
| okuda identifies, pandoc declines | **1** | 1% |
| both decline | 9 | 5% |

69 files, 177 distinct prose spans. The 25 are all inspected, not sampled: 24
are command-free (`$V$`, `$T^4$`, `$H_2O$`, `$Z=13$`, `$O(1)$`, `$\min(80, H-4)$`)
and one is a table gap (`$\min$`). The single regression is **`$\S$`** — okuda
renders `§`, pandoc's converter declines it. That one span decides the design.

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

**A predicted divergence that does not exist.** This brief first claimed the
decision was `costs $x and $y`, where pandoc would see maths and okuda would not.
Measured: pandoc leaves it literal too — its rule needs the closing `$` to be
preceded by a non-space. `costs $x and $y` fails that test, as `from $5 to $10.`
and `$5-$10` do. **The prediction was reasoning without measurement, and it was
wrong.** The real divergence is the command-free class above.

**And the command-free class cannot be split by a rule.** `$H_2O$` and `$PATH$`
are the same shape. What separates them in this corpus is not a test but a list:
the 24 are `V`, `A`, `L`, `N`, `T`, `W`, `Z`, `T^4`, `B_4C`, `H_2O`, `Z=1`, `Z=13`,
`Z=82`, `O(1)`, `O(N)`, `-1`, `1`, `11`, `16,041`, `22, 33, …`, `(X, Y)`, `H < 84`,
`< 1:2`, `> 2:1` — and four of them (`$1$`, `$11$`, `$16,041$`, `$22, 33, …$`)
are **prose numbers, not maths**. Pandoc typesets them anyway. In an export
artefact that is the *benign* direction: the reader sees `16,041` rather than the
literal `$16,041$` that the guard leaves in their face today. **A false positive
costs a serif digit; a false negative costs a visible dollar sign.** That
asymmetry is the reason the export may accept a broader identification than the
terminal — and it is why the terminal's guard must not change.

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

- **The three-stage ladder** in `scripts/html-package.ts` at both sites (`:567`
  document, `:630` panel body). Not a swap — each stage strictly narrows:
  1. `pandoc -f markdown -t html` converts every span it identifies to MathML.
     This is where `\frac`, `\oint`, `\sum` limits and the command-free class are
     won.
  2. Spans pandoc declines come back **labelled**: `<span class="math inline">$…$</span>`,
     with a `[WARNING]` on stderr. The decline is legible in the DOM, which is
     `ADR-MATH-GRAMMAR-076`'s mark arriving for free.
  3. On **those spans only**, `applyMathGlyphs` runs. `$\S$` → `§`; anything it
     still cannot resolve keeps the existing codespan mark.

  **Stage 3 must enter by the span wrapper, never by scanning for `$`.**
  `costs $5 and $10` survives conversion as literal text, and a naive
  `applyMathGlyphs(pandocOutput)` finds the pair `$5 and $` in it. It happens to be
  safe today because the guard requires a backslash command — safe by accident is
  not safe. Targeting `<span class="math inline">` makes it safe by structure.
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

1. [x] **Measure before touching code.** Done — `spike-cahier-math`. 157/157
   laid out, 2/2 fractions stacked, 39/39 superscripts raised, 11/11 accents above,
   0 raw spans. Markup counts and geometry both taken.
2. [x] **Confirm the guard in both directions.** Done — `spike-span-census`.
   177 prose spans: 142 agree, 25 pandoc-only (24 command-free), **1 okuda-only
   (`$\S$`)**. The predicted `$x and $y` divergence does not exist.
3. [x] **Implement the three-stage ladder.** Done — it lives in
   `scripts/cahier-math.ts`, not inline in `html-package.ts`, because the script
   cannot be imported and the ladder has to be testable. Shaped like `mermaidPass`:
   one `pandoc` call for a document, one for a panel body, a present/absent branch,
   the marked-span fallback, and a degrade to today's single-pass output. Targeted
   by `<span class="math inline">`, never by scanning for `$`.
4. [x] **Measure the byte cost on a large cahier.** Done. `decisions/index.md` —
   94 panels, 800.9 KiB — is **byte-identical**: it contains no maths at all, and
   the pass short-circuits on the `$` scan. On the evidence document the page goes
   53,269 → 97,443 B. The risk this step existed to bound did not materialise.
5. [x] **Extend `just html-verify`.** Done — 35 checks → **43**, all green, the
   guarantee table unamended. The maths checks measure geometry in Chrome: a
   fraction counts as rendered only when the denominator sits below the numerator.
6. [x] **The ADR.** Done — `ADR-EXPORT-IDENTIFIES-096`. The divergence is not
   `$x$ and $y` (that prediction was wrong, see Evidence); it is the command-free
   class, and the decision is that **the export may identify more than the terminal**
   because a false positive costs a serif digit while a false negative costs a
   visible dollar sign.
7. [ ] **`scripts/doctor.ts`, surfaced as `cahier doctor`.** Probe `pandoc`,
   `chroma`, `mermaid-to-md`; print `tool · version · present/absent ·
   consequence`; `--json` emits the same fields. Exit 0 always; `--strict` exits 1
   if any rung is degraded, for a machine that wants to pin a full profile.
8. [ ] **Derive `DEPENDENCIES.md`'s version cells** from the probe and add the
   drift gate: a `just` recipe fails when a `Version`/presence cell disagrees with
   the machine. `Purpose` and `Proven by` are untouched.
9. [x] Registry: `just reg-sync-fix` run; the derived rows reviewed.

## Acceptance Criteria

1. `just check` green — **met**, 28/28 gates, 1214 tests.
2. `just html-verify` green, including the new maths checks — the guarantee table's
   rows are **all still true**, with no row amended — **met**, 43 checks.
3. On `docs/2026-10-30-server-blades-in-space.md`: **157 `<math>` elements**, **2
   `<mfrac>`**, **0** remaining literal `$…$` spans in rendered prose — measured in
   Chrome by box, not by markup — **met** (157 / 2 / 0, and 157 laid out).
4. **No regression on `$\S$`**: it renders `§`, not a literal `$\S$` — **met**, by
   test and by browser check.
5. **The currency pair survives**: `costs $5 and $10` renders as prose, and the
   `$5 and $` pair the conversion leaves behind is never entered by stage 3 — a test
   asserts the span-wrapper rule, not the happy path — **met**.
6. With `pandoc` removed from `PATH`, the output is **byte-for-byte identical** to
   today's — **met**, verified against a HEAD worktree (`cmp` clean, 53,269 B both).
7. The published file carries no `<script src>`, no `http://`/`https://` asset
   reference and no `@font-face` — **met**, three checks in `html-package-verify.ts`.
   *Corrected:* this criterion first said *no `<script>` at all*, which the cahier
   fails by design — it ships one **inline** script, the close control's toggle. The
   invariant is that nothing is **fetched**, which is what the check now asserts.
8. `tests/math-glyphs.test.ts` does not move (42 tests, unchanged) — **met**. The
   same criterion's claim that `src/render.ts` stays unchanged did **not** hold: the
   ladder needed the segmenter, and copying it would have made a second classifier.
   `mapMathSpans` was extracted from `applyMathGlyphs` and both policies now run over
   it. Behaviour is pinned by the 42 existing tests plus the 16 new ones.
9. `cahier doctor` names every rung with its consequence, and `--json` parses. With a
   rung removed from `PATH`, the row reads absent and its consequence reads the
   degrade — a test pins both.
10. `cahier doctor --strict` exits 1 on a degraded rung, 0 on a full one — a test
    pins the exit codes.
11. The `DEPENDENCIES.md` drift gate fails when a version cell is edited by hand to
    disagree with the probe, and passes when the file is regenerated.
12. `ADR-MATH-GRAMMAR-076` is not amended — **met**; `ADR-EXPORT-IDENTIFIES-096`
    references it and lands beside it.

## Notes

- **Phase 1 changed the design, and that is the phase working.** The brief opened
  proposing a swap of the pre-pass. The measurement found (a) a benign
  false-positive class in the converter, (b) one span where okuda wins, and (c) a
  `$5 and $` pair in the converted output that a naive second stage would scan.
  Three findings, no one of which was reachable by argument. The ladder replaced
  the swap.
- **The spikes are scratch and stay out of the tree.** `tmp/` is gitignored, so
  `spike-cahier-math` and `spike-span-census` are evidence a reader cannot see
  without running them. Their numbers are in this brief for that reason; the
  scripts are re-runnable instructions, not artefacts. If the census proves worth
  keeping, it graduates to `scripts/` as its own brief.
- **A cited path is a promise, so a gitignored one must not be written as a path.**
  Found 2026-11-25 by publishing this brief: the cahier resolved `tmp/…` and
  packaged both spikes as **published panels** (14 refs, against HEAD's 12) — a
  dereferenceable reference to a file that will be deleted. The scratch tier is not
  a citation target, and the fix is authoring, not code: name the script, do not
  write its path. The general rule this instance gives: **only committable paths
  are citeable**, which is the audit surface's own condition — a reference the
  reader cannot dereference tomorrow is not a reference.
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

- `decisions/096-the-export-identifies-more-maths.md` — `ADR-EXPORT-IDENTIFIES-096`,
  the decision this phase produced
- `scripts/cahier-math.ts` — the ladder, testable because it is a module
- `tests/cahier-math.test.ts` — 16 tests, each naming a span from the census
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
