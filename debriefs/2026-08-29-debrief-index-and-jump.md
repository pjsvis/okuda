---
type: Debrief
callsign: DBF-INDEX-JUMP
date: 2026-08-29
tags: [index-and-jump, tui, navigation, backstack, adr-020, adr-021, jump-demo, dogfood, honesty]
agent: pi (ses_9e4b52)
environment: local
td: td-9d9981 · td-a87bfd
branch: feat/gloam-launcher
---

# Debrief: index-and-jump — menus as documents, and the demo that kept them honest

## Context

The brief (`briefs/2026-08-28-brief-index-and-jump.md`) proposed navigation
without a TUI state machine: search or index results are *ordinary markdown
documents* — numbered items carrying two-digit jump tokens — composed by any
tool that can write a file, rendered by the standard okuda frame, and resolved
by the TUI scanning the source it already holds. The filesystem is the message
bus; the menu is a document, not a widget. ADR-020's zero-notification
stillness holds: no `src/` file reads ambient directories to mutate the frame.

## Accomplishments

- **The mechanics, shipped and pure (`78c281f`, td-9d9981).**
  `extractJumps` scans paragraphs for the compositor-emitted
  `%%okuda-rhs:NN%%` token paired with a `.md` path in an HTML comment
  (wiring the renderer strips, the resolver reads); `advanceNumBuffer`
  accumulates a two-digit buffer where any non-digit keystroke cancels a
  half-typed token — a stray key can never ambush a pending jump. `jumpTo` /
  `back` compose them over a `{file, scroll}` backstack: `u`/Backspace
  returns with scroll position intact; a missing token or vanished target is
  a silent no-op. All four acceptance criteria verified.
- **ADR-021: tokens number from 11, not 01.** The 0 key sits at the opposite
  end of the row from 1; the offset removes the stretch for the common
  ≤ ~10-item list and reserves `01`–`09` as a free namespace for future
  fixed commands. The reframe that carried it: tokens are ephemeral codes,
  never counts — codes should be easy to type. Compositors emit
  `index + 11`; the resolver is unchanged (range-agnostic), so no migration.
- **The demo compositor (`scripts/jump-demo.ts`, `just jump-demo`) dogfoods
  the style guide** — and the dogfood caught two lies (td-a87bfd): item 06
  rendered a filename stem as a title (`slugify` didn't strip the lowercase
  `decision: NN-` stem form), and the closing status key declared a glyph
  vocabulary no line used. Both fixed (`8a9bc0a`): the slug is the
  descriptive title, hyphens preserved on non-stem titles; `stateGlyph`
  derives from the `**Status:**` line and only deviations wear theirs — a
  column of ☐ is decoration, not signal. 14 pinning tests; approved
  2026-08-29 by independent review after empirical render verification,
  not code-reading.
- **The close-out (this debrief).** Brief status → Done; registry synced.
  One residual lie found and fixed in the act of closing: the style guide's
  menu-pattern examples still taught `**01**` numbering post-ADR-021 — the
  guide the demo dogfoods lagged the ADR it must honour. Examples
  renumbered 11–13 in the same commit family.

## What was deliberately not done

- **The three-column table (slug → callsign → number).** The list's
  number-at-RHS is a position defended by truncation's column reservation;
  the table's number would be a column near the slug — fixing the
  distant-RHS flick the list can't. Deferred to td-bdfce0 (callsign
  migration): a two-column table that becomes three is churn. Column order
  settled in the handoff: content → address → action; the glyph nests as a
  trailing mark on the slug, not its own column.
- **No PTY-driven `runTui` integration test.** Matches the repo's standing
  discipline — the interactive loop was never PTY-tested, and the launcher
  debrief (`2026-08-27-debrief-launcher-loop-runTui-blocks.md`) records why:
  a harness that can't faithfully reproduce a two-round loop manufactures
  ghosts. The pure halves carry the test burden instead.
- **No search-results compositor beyond the demo.** `status-doc.ts` was
  phase zero; `jump-demo.ts` is the menu-pattern dogfood. Compositors are
  per-surface owners — the renderer's job ended at the byte stream.

## Handoff

- **td-bdfce0 carries the deferred slice**: OKF frontmatter (`type` +
  `callsign`) across the corpus via reg-sync, generated `index.md` per tier
  (ADR-019), landing *with* the three-column table restructure.
- td-a87bfd reviewed and closed 2026-08-29 (ses_9e4b52, independent).

## References

- Brief: `briefs/2026-08-28-brief-index-and-jump.md` (Done)
- Honesty brief: `briefs/2026-08-28-brief-jump-demo-honesty.md`
- ADR-019 `decisions/019-okf-v02-conformance.md` · ADR-020
  `decisions/020-zero-notification-stillness.md` · ADR-021
  `decisions/021-jump-token-numbering-offset.md`
- Style guide: `docs/style-guide.md` (the menu pattern)
- Commits: `78c281f` (mechanics) · `d1aadf5` `265edbe` `7cfd5a2` `b92f702`
  `72482a6` `ac6b53a` `ade5167` (render + menu register) · `e3a0b30`
  `99be271` (ADR-021) · `8a9bc0a` (honesty) · this close-out
