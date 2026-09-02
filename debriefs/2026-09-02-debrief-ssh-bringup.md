---
type: Debrief
callsign: DBR-SSH-BRINGUP
---

# Debrief: the SSH bring-up — glyph probes to a tear-free frame

**Date:** 2026-09-02
**Scope:** Probes 8–9 (BRF-GLYPH-STRESS), the Linux/Omarchy bring-up,
the flicker diagnosis and fix (BRF-SYNC-OUTPUT), the v0.1.0 trifecta.
One arc, one session-pair, closed with a tagged build.

## What happened, in the order it taught anything

1. **The corpus probes (8, 9).** Eight corpus lines — Cherokee, Ogham,
   Egyptian, Linear B, then Devanagari, Thai, Korean, Tamil, Greek,
   Myanmar — every line edition-verified before the doc promised it.
   Two probes, four review passes between them, and the reviewer caught
   real failures both times: Probe 8 shipped a non-edition ogham line
   and a wrong Linear B series letter; Probe 9 shipped a Myanmar teaser
   that was false about its own fixture and an fc-list sentence that
   conflated the monospace font set with the full set.
2. **The Omarchy bring-up.** A fresh Linux box failed `just ship` with
   four opaque diagram-test failures and a `gloam: command not found`.
   Root causes, in discovery order: `just build` doesn't install (the
   ship chain had aborted at `bun test`); the four failures were the
   missing `mermaid-to-md`, not Linux incompatibility; and the
   dependency's `install.sh` escape hatch dead-ends at release assets
   that don't exist.
3. **The flicker.** SSH from Mac to Omarchy showed tearing on text and
   diagrams alike. The text flicker was the tell — never a diagram
   problem. `paint()` cleared then repainted in multiple writes
   (`ESC[2J ESC[H`); over SSH the frame splits across TCP packets and
   the terminal composites the intermediate states.
4. **The fix and its verdict.** BRF-SYNC-OUTPUT: DECSET 2026
   synchronized-output bracket, one frame assembled and emitted as one
   write. Operator re-test over SSH: considerably better, **no
   tearing**. The brief's decision rule fired — option 1 (no-clear
   repaint) stays deferred as robustness work for non-2026 terminals;
   its implementation constraints (sequential walk, no per-row CUP,
   load-bearing trailing `ESC[J`) are already written down if ever
   needed.

## The lessons worth keeping

- **Fixture honesty cuts both ways, and the reviews proved it.** The
  doc's rule — *the fixture must be verified before the renderer is
  accused* — was applied to the doc's own author twice, and both times
  it found something. A verification rule that never catches its own
  author isn't a rule, it's a vibe.
- **SSH is a fluoroscope, not a fault.** The paint loop always tore;
  latency just made it visible. When behaviour degrades only over a
  wire, suspect the local implementation first — the wire is the
  diagnostic, not the disease.
- **A missing dependency should name itself.** Four opaque failures
  cost a round trip to diagnose; the precondition test (td-b1d469)
  makes the next fresh machine fail once, loudly, with the culprit
  named. Halting is correct doctrine — *halting in silence* isn't.
- **Escape hatches must be exercised or marked.** `install.sh` pointed
  at releases that don't exist — a promise the repo wasn't keeping.
  Unexercised escape hatches are now recorded as such in
  DEPENDENCIES.md.
- **Prose decisions beat remembered ones.** Option 1's constraints were
  written into the brief before the verdict came in, so the deferred
  decision costs nothing to revive. A deferred decision with no
  recorded constraints is a decision you'll get to make twice.

## Numbers

- 312 tests, 0 fail (was 308 at session start; +1 precondition, +3
  sync-seam, +1 version-seam — minus one self-contradictory draft
  caught before commit).
- 10 commits across 4 branches; two probes, one dependency note, one
  precondition test, one paint fix, one version dedupe, one debrief,
  two review-correction commits from the independent reviewer.
- Corpus: 10 scripts, 15 edition-verified lines, 0 translations given.

## What's left

- Review queue: `td-b1d469`, `td-32458d` (this trifecta's `td-29bc01`
  joins them). Merges follow approval; the `v0.1.0` tag is provisional
  until then — it moves if the reviews move the commits.
- Option 1 (no-clear repaint): dormant, constraints recorded, wake only
  on a non-2026 terminal that matters.
- The stale Mac binary: this machine's `./okuda` predates the sync fix;
  a local `just build` restores the natural order.
- Open questions 5–6 of the i811 doc (combining-mark width,
  dictionary-less wrap) remain the renderer's next real exam — the
  corpus is ready for it.
