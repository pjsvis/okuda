# Session Handoff — 2026-08-24

**Branch:** `feat/tui-control-plane`
**TD:** `td-52db41` (in_progress, ses_a66534)
**Tests:** 102/102 green · **Registries:** all in sync
**State:** uncommitted on the branch; not ready to review yet (colour tuning in flight).

---

## What this session did

### Shipped
1. **Glow-dark palette (ADR-006).** Reversed brief 002's Rosé Pine defaults. Sourced from glamour's `DarkStyleConfig` (ANSI-256 → truecolor hex). Headers blue `#00afff`, code green `#5fd700` (okuda divergence — Glow is salmon), strong gold `#ffd700`, emphasis yellow `#ffff5f` (both okuda divergences — Glow uses near-white for both).
2. **ADR-007: Glow is the visual reference.** Governing principle: okuda matches Glow unless an element is one of its explicit "things." Living divergence table in the ADR. First application: H4+ no longer collapses to bold paragraph — all heading levels render `#`×level + blue bold.
3. **TUI control plane (briefs unparked).** `src/tui.ts` — ~180-line game loop: alternate screen, raw-mode keystrokes, viewport scroll, Gloam footer. `--tui`/`-t` flag in cli.ts with NO_COLOR/TERM=dumb/non-TTY fallback to streaming. Briefs `2026-08-23-brief-okuda-tui-control-plane.md` and `gloam-tui-footer.md` unparked (gates met).
4. **Structural convergence to Glow.** 2-char L/R margins (content width = terminal − 4), empty top line, list indent (`LIST_INDENT=2` inside margin), table closing rule.
5. **Mermaid checksum block.** The `​```mmd` source the binary emits is no longer discarded — rendered muted beneath the ASCII art. `extractDiagramChecksum` + `diagramBlock(art, checksum, ctx)`.
6. **Quit bugs fixed.** `cleanup` now `process.exit(0)` (was hanging the event loop). `Q` added (Glow convention). `reload` paints after re-render (was showing stale data).
7. **Dogfood recipes.** `just showcase` (TUI), `just audit` (TUI), `just install` (symlink `~/.local/bin/okuda`).

### Key files
- `src/palette.ts` — `DEFAULT_PALETTE` (Glow-dark, single source of truth)
- `src/render.ts` — margins in `finalize`, `LIST_INDENT`, `diagramBlock` checksum, table closing rule
- `src/tui.ts` — control plane (NEW)
- `src/cli.ts` — `--tui` flag + gate
- `docs/showcase.md` — grammar showcase (every element)
- `docs/audit.md` — formatting & colour audit (expectation vs live render)
- `decisions/006-glow-dark-palette.md`, `decisions/007-glow-visual-reference.md`
- `briefs/2026-08-22-brief-ansi-emission-and-closed-grammar.md` — two supersession notes (palette + H4-collapse)

---

## What's next — the open question

**The italic colour-masking investigation.** This is the immediate next thing; do not skip to other features.

The audit page (`docs/audit.md`, `just audit`) exists to settle it. The problem: okuda emits the correct italic escape (`\x1b[3;38;2;255;255;95m...​\x1b[0m`) but the user reported italics not rendering as slanted. Three hypotheses, ranked:

1. **Colour masks slant (most likely).** okuda's emphasis is bright yellow `#ffff5f`; the colour change dominates perception, the slant is secondary. Glow's emphasis is near-white (256-colour 252) — slant is the *only* signal, so it reads clearly.
2. **SGR parameter order.** okuda puts `3` (italic) before `38;2;...` (truecolor); Glow puts `3` after. Both spec-valid; possible Ghostty parser quirk.
3. **Truecolor vs 256-colour.** Unlikely (Ghostty is truecolor-native).

**The diagnostic the next session should run first:**
```bash
okuda --no-color docs/audit.md    # strips colour, keeps \x1b[3m italic
```
If "italic word" slants without colour → hypothesis 1 (fix is design: softer yellow, or italic-only without colour — Glow's approach). If it never slants → font/terminal limit. If it slants in Glow but not okuda with same colour → hypothesis 2 (one-line fix in `ansi.ts`: move `3` after colour params).

**Do NOT make code changes before running the diagnostic.** The doom-loop this session fell into was from fixing before observing. The audit page is the valve.

### After the italic question settles
- Colour tuning pass — the user called the current colours "indicative not actual." Likely: dial emphasis yellow back (softer), confirm gold bold reads right, possibly revisit code green.
- The three colour divergences (bold=gold, italic=yellow, code=green) need ADR-007 divergence-table rows or reversion. Currently undocumented drift — the principle erodes if they stay ungrounded. Either document as "okuda identity" (option C from last session) or revert to Glow-faithful (option B).
- TUI dogfood: `just showcase` / `just audit` in a real terminal. Watch for split escape-sequence reads (arrows dropped), SIGWINCH debounce on resize drag.

### Deferred
- Showcase as byte-stable regression fixture (mentioned earlier, not started).
- H6 uniform-bold judgement call (flagged in ADR-007, not decided).

---

## How to resume

```bash
cd /Users/petersmith/Dev/GitHub/okuda
just orient
td context td-52db41    # full context for the in-flight issue
just audit              # run the diagnostic FIRST
# then: okuda --no-color docs/audit.md  ← the test that settles the italic question
```
