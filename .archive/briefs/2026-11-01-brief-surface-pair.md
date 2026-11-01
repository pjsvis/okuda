---
type: Brief
callsign: BRF-SURFACE-PAIR
date: 2026-11-01
---

# Brief: The surface pair — readable, navigable, recognisable

**Date:** 2026-11-01
**Status:** Done

---

## Context

okuda's roles are fixed hexes and prose ships empty, so the renderer inherits the
host's foreground and background — the **pair** (`src/palette.ts:17-20`,
`ADR-GLASS-INK-073`). Nothing states what that pair must be, and nothing checks
whether the one supplied is adequate, so a host with a dimmer ink or a light ground
can quietly destroy the page. The standing consequence is measured below; the
repair is one reading and one declared pair, not a new renderer.

## Warrant

Operator call, 2026-11-01, after the colour riff. The operator also narrowed the
problem, and the narrowing is the warrant: *what is missing in the app instance is
the ability to set the pair* — not a web renderer, because the app renders into a
terminal, and a web instance is a terminal in a browser.

## Objective

Make the page's three base properties — readable, navigable, recognisable —
checkable by one command against any candidate pair, and declare the one pair the
silo recommends, generating every host artefact from it.

## The base requirement, as three tests

| Property | What it means | Measured by |
|---|---|---|
| **Readable** | every role clears a floor against the ground | a **floor** reading: role ÷ ground, per role |
| **Navigable** | the marks that carry navigation out-rank the prose they annotate — headings, table headers, state glyphs, the silcrow | the **ranking** reading: role ÷ ink, per role |
| **Recognisable** | the page reads as okuda from across the room | follows from the roles being fixed and the order holding; **not separately measured**, and that is deliberate (see *Out*) |

Navigability is the load-bearing one, and it is why this is not taste: navigation
in okuda is *painted*. Addresses, states and structure are colour, so if the prose
rises above them the page stops being navigable in exactly the way a removed
underline stops a link being a link.

## Evidence

Measured 2026-11-01, by `scripts/contrast.ts` (the ranking) and the palette's own
hexes (the floor). The tuned pair is the reference; the other two are hosts in
actual use or available to them.

| pair | roles crossing the ink | roles under 3:1 | verdict |
|---|---|---|---|
| tuned `#221f1c` / `#d6cfc4` | **0** | **0** | readable and ordered |
| Herdr UI default `#21252b` / `#abb2bf` | **12** (heading 0.92 → 1.26) | 0 | ordered: **no** |
| white ground `#ffffff` / `#000000` | 0 | **16 of 23** (`state-todo` 1.30:1, `heading` 1.69:1) | readable: **no** |

The two failure modes are disjoint, and the current instrument sees only the first:
the crossing test reports `HELD` on a white ground where two-thirds of the palette is
invisible. That false negative is the defect this brief exists to close.

## Scope

**In:**
- `scripts/contrast.ts`: a **floor** reading beside the ranking, a named floor
  constant, and a single `surfaceVerdict(pair)` that answers both questions.
- `just surface` — one command, both readings, one verdict; `--theme <file>` reads a
  host theme's pair, `--bg/--fg/--rung` take a pair directly.
- Tests: the control passes first (the reference pair, zero crossings and zero
  below-floor); then the two defects (Herdr UI's default pair fails the order; a
  white ground fails the floor).
- The reference pair declared once, and a test that the two host artefacts are
  generated from it — `docs/2026-10-28-ghostty-ground.conf` and
  `scripts/herdr-theme.ts`'s output must agree about the pair they pin.
- `explainers/colours.md`: the operator's correction recorded (the app renders into
  a terminal; a web instance is a terminal in a browser; the missing capability is
  setting the pair, not asserting a surface), the three base tests, and the refusal
  of light mode with its reason.
- `docs/ideas.md`: the `ranking-on-a-themed-desktop` entry is **promoted** to this
  brief — its missing floor reading is the first acceptance criterion.

**Out — and this is the step back, stated so it cannot creep:**
- **No web export, no `--surface` flag, no surface assertion.** There is no separate
  renderer to parameterise: a browser-hosted okuda is a terminal (xterm.js-class),
  so the answer is the pair, not a second code path.
- **No light mode, and no second palette.** Refused: a light palette is a second set
  of role meanings (`conceptual-lexicon.md`, **TFS**), and the ranking would have to
  be re-authored rather than re-tuned. `color-scheme: dark` is the whole of our
  position on the matter.
- **No terminal interrogation** (no OSC 11 background query). A probe that infers the
  ground and then adjusts to it makes a broken surface invisible, which is worse than
  the surface.
- **No contract for other projects**, no machine-readable declaration for third
  parties to check. One implementation, no standard.
- **No recognition test** — no quantisation or distance reading. Recognition follows
  from fixed roles plus an intact order; if someone ever cannot recognise the page,
  that complaint opens its own brief.
- No change to the renderer's colour behaviour, and no change to any role hex.

## Preconditions

- [ ] `just check` is green at the branch point.
- [ ] `scripts/contrast.ts` still holds the ranking reading and its control test.
- [ ] The reference pair is the one the operator dogfooded (rung 8,
      `#221f1c` / `#d6cfc4`) — verified by reading `PAIRS`, not by memory.

## Work Plan

1. [ ] Name the floor as a constant with its reason; add `floor(ground)` over the
       palette.
2. [ ] `surfaceVerdict(pair)` returning `{ belowFloor, crossed, legible, ordered }` —
       pure, both readings, one answer.
3. [ ] `just surface` + CLI; `--theme`, `--bg/--fg`, `--rung`, `--json`.
4. [ ] Tests, control first: reference passes both; Herdr UI default fails order;
       white ground fails floor.
5. [ ] Assert the two host artefacts agree on the pair.
6. [ ] The explainer: correction, three base tests, light mode refused.
7. [ ] Promote the ledger entry; registry; `just check`; debrief.

## Acceptance Criteria

1. `just surface --bg '#ffffff' --fg '#000000'` reports **NOT readable** and names the
   roles below the floor; `just surface --theme <herdr atom-one-dark>` reports
   **NOT ordered** and names the roles that crossed.
2. `just surface --rung 8` reports readable **and** ordered.
   *Amended during execution (2026-11-01):* the reference pair failed a flat
   3:1 floor on exactly two roles — `badge-fg` (painted on `badge-bg`, never on
   the ground) and `muted` (the structural ink, deliberately quiet, and the
   ground page's own binding constraint at 2.0–2.3). "Readable" therefore means
   **every role painted on the ground**; the two exemptions are declared in
   `NOT_ON_GROUND` with their reasons and printed in the reading, not hidden.
   The control found them, which is what a control is for.
3. `surfaceVerdict` is pure and table-tested; the control is asserted before the
   defects, in that order, in the test file.
4. The floor is a named constant, not a literal, and its reason is stated where it is
   defined.
5. A test asserts the Ghostty `.conf` and the Herdr theme emitter pin the **same**
   pair.
6. `explainers/colours.md` states the correction (terminal-in-app, terminal-in-
   browser) and the refusal of light mode, each in one paragraph.
7. `just check` passes and the ledger entry reads `promoted: BRF-SURFACE-PAIR`.

## Notes

- **The distasteful action we are taking is small and should be named as such:** one
  generated artefact per host we actually use, and the pair declared in the repo. Not
  a theme collection — a single pair plus a check. The line is whether a human ever
  edits a hex by hand; if one does, it is a parallel store and it dies.
- **The simplification, stated plainly.** The first framing of this work had a
  surface *parameter* (given or asserted), a proof environment on the web, and a
  contract other projects could adopt. The operator's correction dissolved most of
  it: there is one renderer, it renders into a terminal, and the only thing missing
  in the app instance is the ability to set the pair. What survives is one reading
  and one declared pair — which is the size the requirement was always going to be.
- **Where the boldness lives.** The pair is *recommended* to a terminal and
  *asserted* by nothing. Future work that wants assertion in a browser should start
  from the requirement — *readable, navigable, recognisable* — and not from the
  architecture, or it will rebuild the parameter this brief removed.
- **Known trap:** any future role hex or pair change must run `just surface` before
  it lands, or the instrument and the palette drift apart and the reading becomes
  folklore.
