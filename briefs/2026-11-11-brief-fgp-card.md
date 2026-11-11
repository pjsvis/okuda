---
type: Brief
callsign: BRF-FGP-CARD
---

# Brief: The FGP card — the pair painted into the cells, so a surface can be seen

**Date:** 2026-11-11
**Status:** Open

## Context

The ladder's verdicts are arithmetic and the eye has no instrument; a live flip
needs the glass, which means a tenancy — read, take, give back — and the host we
work in answers no `OSC 10`/`OSC 11` query at all. A card needs neither: it paints
the pair into the bytes, so a page can be read on a ground the machine is not on.

## Objective

One screen showing the same document rendered at several figure-ground pairs, each
patch labelled with the numbers `just surface` measures — so the arithmetic can be
seen rather than read.

## The insight this is built on

**Painting the ground and the ink per cell is inefficient** — the terminal would
have supplied both for free by inheritance, and the renderer's own doctrine says
the glass owns them (`ADR-GLASS-INK-073`). **Efficiency is not the axis here;
legibility is.** The waste is exactly what decouples the page from the host, and
what it buys is a surface that travels: nine grounds on one screen, two hosts'
pairs side by side, a page that survives `less -R`, an HTML export, or a
screenshot. A flip can only ever show the surface you are already standing on.

## Scope

**In:**

- `scripts/fgp-card.ts`, recipe `just fgp [--rungs 8,0,5] [--width N] [file]`:
  renders a specimen (default: the built-in one) through `renderDocument` once per
  pair with `body` set to the pair's ink, paints `48;2;bg` behind every line and
  re-applies it after every internal reset, pads each patch to the width so it is
  a rectangle, and heads each patch with its rung, pair, ratio and verdicts from
  `contrast.ts`.
- The specimen carries every role that can die: heading, prose, strong, emphasis,
  inline code, a fenced block, a table with keys, a rule, a blockquote, a bullet,
  and two state glyphs — a prose-only card hides the failure modes that matter.
- A pure core (`fgpPatches(source, pairs, width, color)`) so the invariants are
  testable without a terminal.

**Out, deliberately:**

- **Tenancy.** No `OSC`, no read, no give-back, no restore. `src/surface-plan.ts`
  stays for `BRF-OWN-SURFACE`; this instrument is not a tenant.
- **Any commit path.** The card writes no pin, sets no host, selects no theme.
  Looking is not choosing.
- **The alt-screen.** It prints; a pipe, `less -R` and a screenshot are all valid
  destinations, and `--color none` is a supported reading, not a degradation.
- **A light palette mode**, auto-selection, and cell-level `code-background`.
- **Telling you whether the host is honest.** The card reads the *pair*, not the
  host: it cannot know the host ignored the config, is re-reading the hex as
  Display P3, or is fading the unfocused pane. That is `just surface-probe`'s
  question, and keeping the two apart is the point of having two instruments.

## Acceptance Criteria

1. One patch per requested rung; the default is every admissible rung in `PAIRS`
   (the refused rung is printed only when named with `--rungs`).
2. Each patch header's numbers come from `contrast.ts`, not from a second
   calculation — asserted by feeding the same pair to `surfaceVerdict`.
3. **The ground survives every internal reset**: a role span's `\x1b[0m` clears
   `48;2` too, so the ground is re-applied after each reset. Asserted on the bytes.
4. `--color none` is parity: same line count, same headers, and **no colour
   escapes** — `NO_COLOR` strips colour and keeps attributes (`src/ansi.ts:100-104`),
   so bold and italic remain and asserting "no escapes at all" would be a claim the
   renderer does not make. It doubles as the card's own control: with colour gone
   every patch is the same text, and only the headers carry the difference.
5. `bun test` green; the `surface` gate row runs both surface test files; `just
   check` green.

## Notes

- **Why the specimen is in the script, not a document.** A document can be edited
   and the card would silently stop covering the role it was chosen for.
- **Why the ground is re-applied per reset.** One prefix per line looks right and
   is wrong: the first role span resets the background and the rest of the line
   reverts to the glass's ground — a card that lies about half its own patch.
- **What a calm card does not prove.** A patch that reads beautifully is a
   statement about a pair, not about the terminal that would have to render it.

## Related

- `scripts/contrast.ts` — the ladder and the verdicts the headers print
- `scripts/tty-card.sh` — the sibling card, for invariants a renderer cannot
  verify; this one is the card for pairs
- `decisions/073-the-glass-owns-its-ink.md` — the boundary the card deliberately
  spends against, for the duration of a reading
- `decisions/090-the-legibility-surface.md` — the three instruments; this is the
  one that shows rather than measures
- `docs/2026-10-28-the-ground-you-read-on.md` — the ladder the card lays out
