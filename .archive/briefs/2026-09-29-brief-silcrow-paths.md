---
type: Brief
callsign: BRF-SILCROW-PATHS
date: 2026-09-29
---

# Brief: Silcrow paths — the gate grows a second substrate

**Created:** 2026-09-29
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on. Archived rather than deleted — replunder if the need returns. The idea is not judged, only its queue position.

## TD

td-89d085 (epic). Only the first step's task is written (td-696449) — the operator's method: *"each step has its own wrinkles, that we have not discerned yet."* Later steps get their tasks when reached; the task list written before the step is an invented plan (BRF-SRC-LINE-LEDGER's own gate).

## Lineage

the operator, verbatim: *"we have integrated rendered code files into the Gloam ambit"* — *"lets consider extending the reach of our rubricated silcrows — ie if we mention a code file we can create a silcrow"* — *"and I am thinking for other named files and call-signed documents"* — and on method: *"there is a correct path here, so we should feel our way forward one step at a time."*

## Extends

ADR-044 (`decisions/044-validated-silcrows.md` — the gate on inferred references; this brief hands that gate a second substrate), BRF-CODE-SHELF (code entered the ambit and verified the read loop already closes: `resolveJumpTarget` existsSync's path targets, `wrapWholeFile` renders `.ts`), ADR-020 (the render-path boundary holds by parameter — unchanged), BRF-ADDRESS-CAP (the 80-address cap is the map's invariant; new token classes are new competitors for the addresses).

## Grounding

BRF-VALIDATED-SILCROWS — the gate's first substrate, reused twice here: its probe method (the Why), its gate semantics (one predicate, paint and actuator cannot disagree). `docs/2026-09-04-the-silcrow.md` — the explainer.

## Objective

A prose mention of a file that exists — `src/vectors.ts` — gets a silcrow, exactly when the filesystem says so. For paths the gate's substrate is **filesystem existence**: live, the way rg is live in the code shelf — never a second registry (BRF-CODE-SHELF already refused a src/ INDEX.jsonl; the refusal is honored from the other direction). Junk never paints: the UTF-8 lesson, inherited day one.

## Why — measured, not asserted

`tmp/silcrow-ext-probe.ts` (2026-09-29), six doc tiers, discovery discipline identical to `scanReferences` (fences excluded, frontmatter excluded), gate = fs existence at the silo root:

| Ring | Token | Mentions | Resolve | Miss (never paints) |
|---|---|---|---|---|
| A | code files (`src/tui.ts`) | 609 | 565 (93%) | 44 — external code (`src/mermaid.rs`, `mdv/markdownviewer.py`), illustrative URLs (`example.com/chime.mp3`), **phantom `palettes/okuda.json` ×9** |
| B | named md paths (`docs/help.md`) | 1,192 free-standing | 1,095 (92%) | 97 — stale briefs (renamed/dead), sibling-silo mentions without `../` |
| C | bare basenames (`help.md`) | 1,698 | — | parked, censused below |

Findings that carry the design:

- **Only 1 of 1,193 Ring B mentions sits inside link syntax** — bare mention is the corpus convention. Every number above is *new* paint; none of it is silcrowed today.
- **The actuator is finished — the asymmetry is inverted.** The usual defect is paint without landing (the optimistic silcrow that flashes on press). Here landing exists — `resolveJumpTarget` resolves path targets against the document's directory, `readSource` → `wrapWholeFile` renders any file — and only the paint is missing. 565 honest jumps wait on one regex and one predicate disjunct.
- **The probe's first live catch, before any code changed:** `palettes/okuda.json` — referenced ×9 across 5+ live documents, never committed. A resolver-gap lookalike wearing the advisories' old disguise (a tier invisible to the resolver); here, one phantom file. Whether it is a planned artifact or a dead reference is an authoring question, separate from this brief.
- **The vector budget holds at Ring A: 0 of 344 documents projected over the 80 cap** (current refs + gated Ring A). Ring B is ~2× the volume; its projection is that step's probe, not this brief's guess.

## Wrinkle census — named, not solved

The ship order *is* the operator's method: each wrinkle is probed when its ring arrives. Measured so far:

| Wrinkle | Measurement | Owned by |
|---|---|---|
| W1 — backticks | **98% of code mentions are backtick-wrapped** (594/609) — the default case, not the tail. `annotateSource` injects after token-end, so §NN lands *inside* the code span, monospace. **Decided at the glass 2026-09-29:** paint-inside-span — the callsign convention inherited (backticked `ADR-031` already painted its badge inside; glass probe verified the marker renders in-span). | Ring A — done |
| W2 — line suffixes | 119/609 mentions carry `:NNN` (`src/tui.ts:756`). **Decided at the glass 2026-09-29:** the suffix is swallowed into the occurrence span (badge paints after the whole mention) and stripped from the target — the silcrow is file-level, the line claim stays the prose's own, and BRF-SRC-LINE-LEDGER owns the line verb. Suffixed and plain mentions share the vector. | Ring A — done |
| W3 — budget | **Measured 2026-10-01** (`tmp/w3-ringb-probe.ts`, 372 docs, the real `makeCallsignValidator`/`makePathValidator` gates composed): Ring B adds **zero** docs over the 80 cap — worst Ring-B-inflated doc 34/80. The only cap-saturating doc is `briefs/index.md` (90 targets, +0 Ring B), a pre-existing property of an 88-brief index, at cap today (`tmp/w3-verify.ts`). `.jsonl` exile costs 22 mentions corpus-wide; 9 `.json` mentions survive. Ring B junk (never paints): stale renamed briefs, sibling-silo `AGENTS.md` — the W5 class, the gate holds. | Ring B — done |
| W6 — legibility (`.jsonl`) | Horizontal data is not a readable render — a `.jsonl` deref lands in `wrapWholeFile` wrapping multi-kilobyte JSON records: all the bytes, none of the reading. Decided with the operator 2026-10-01: the gate's second criterion, after existence, is **legibility**; `.jsonl` never paints (ADR-049). `.json` stays — pretty-printed JSON is indented text; exile on evidence, not suspicion (Hume). | Ring B — ADR-049 |
| W4 — URL hosts | `example.com/chime.mp3` — fs-miss, unpainted. No shape enumeration; gate on the property, not the list (ADR-044's own argument, re-worn). | solved by the gate |

## Design sketch

**One seam.** `src/cli.ts:144` — `const silcrowResolves = makeCallsignValidator()` — becomes a closure over both substrates: the callsign registry **or** fs existence, anchored to the **document's** directory (`resolveJumpTarget`'s HTML semantics — the document, not the process cwd; td-1c8fca's lesson). `scanReferences` grows one discovery regex per ring, gated by the same `resolves` parameter. ADR-020 holds by parameter: the render path stays fs-free; the launcher composes.

**Rings:**

- **A — code files**: `dir/name.ext`, non-md. The `/` in the token is near-proof of intent; the fs check is the anchor.
- **B — named md paths**: `docs/help.md`, unwrapped. Same mechanism, ~2× volume, its own commit.
- **C — parked**: bare basenames. 1,698 occurrences, 187 uniquely resolvable, 3 ambiguous (`index.md`, `AGENTS.md`, `README.md`). Resolution-is-search, not lookup — `help.md` in prose made no promise. The `&`-files (`&alpha.md`, `&ear.md`) are its strongest future argument and deserve a root-scoped rule if the ring is ever revisited. Parked with the census, not scheduled.

## Ship order — one skin at a time

1. **ADR-045 — the gate's second substrate.** Text only. Records: callsigns → registry, paths → filesystem (the domain's index is the anchor); fs-gate honesty (phantoms and typos paint nothing); re-derivation (the paint appears the day the file lands — ADR-044's self-heal precedent, re-worn).
2. **Ring A — code files.** The W1/W2 glass pass; tests (`src/vectors.ts` paints; `example.com/chime.mp3` and `src/mermaid.rs` don't); `just check`; dogfood at the glass. Own commit on `feat/silcrow-paths`. (td-696449)
3. **Ring B — named md paths.** Gated on Ring A's live behavior — at least a day at the glass before the second skin. W3's projection probe first. Own commit. Task written when reached. **Reached 2026-10-01:** P-4 satisfied, W3 passed (zero new over-cap), the legibility exile rides the same commit (ADR-049). Link-internal `.md` targets are excluded from Ring B's scan — an explicit link already mints its occurrence; a second scan would double-badge it.
4. **Ring C — parked.** Named, censused, unscheduled.

## Scope

**In:** `src/vectors.ts` (discovery rings), `src/cli.ts` (the closure), ADR-045, tests, `tmp/silcrow-ext-probe.ts` (stays as the drift detector — the junk-probe pattern, re-worn), this brief.

**Out:** W5 — the Ring B drift list's authoring pass (97 stale and sibling-silo references: prose repair the gate surfaces, out of scope exactly as BRF-VALIDATED-SILCROWS scoped its junk list); the `palettes/okuda.json` phantom's authoring question; line-suffixed jumps (BRF-SRC-LINE-LEDGER); Ring C; a paths registry (benchmaxxing — an index that drifts from the thing indexed); backtick grammar changes (paint only, never the fence rule).

## Preconditions

- [x] **P-1 — the probe ran** (`tmp/silcrow-ext-probe.ts`): the tables above. 2026-09-29.
- [x] **P-2 — ADR-045 accepted** — `decisions/045-silcrow-paths.md`, 2026-09-29.
- [x] **P-3 — Ring A glass pass** — W1: paint-inside-span (the callsign convention, glass-verified); W2: suffix swallowed into span, stripped from target. Evidence: `tmp/ring-a-glass.ts` — this brief's own mentions paint (`src/vectors.ts §18`), the phantom (`palettes/okuda.json`) and URLs don't.
- [x] **P-4 — Ring A shipped and lived-with ≥ a day** before Ring B's task list is written. Shipped 2026-09-29, reviewed 2026-10-01; task td-696449 closed on main.

## Risks

| Risk | Exposure |
|---|---|
| The fs gate hides typos — a typo'd path paints nothing; no drift is visible at the glass | The probe stays as the drift detector, run on demand. A hidden typo is a suppressed promise; an optimistic typo was a flashing one. Both wrong, one quieter. |
| Phantom suppression reads as loss | Re-derivation: the paint appears the day the file lands. The suppressed state is honest — "no promise yet" where the old paint said "promise, then flash." |
| Ring B pushes documents over the 80 cap | W3 is Ring B's entry probe, not a guess made now. The cap is the map's; reading order wins — honest overflow, measured before the second skin. |
| Two substrates, two anchors, drift between them | No: fs is the single anchor for paths. The drift ADR-044 killed was two registies; a registry and the filesystem it mirrors is the same disease. A filesystem cannot drift from itself. |

## Related

- ADR-044: `decisions/044-validated-silcrows.md`; ADR-024, ADR-025, ADR-031 (cited within)
- BRF-VALIDATED-SILCROWS, BRF-CODE-SHELF, BRF-ADDRESS-CAP, BRF-SRC-LINE-LEDGER (W2's owner)
- `docs/2026-09-04-the-silcrow.md` — the explainer
- `src/cli.ts:144` — the seam; `src/vectors.ts` — `scanReferences`, `annotateSource`; `tmp/silcrow-ext-probe.ts` — the Why
- td-89d085 (epic), td-696449 (steps 1–2)
