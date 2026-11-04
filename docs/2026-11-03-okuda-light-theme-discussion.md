---
date: 2026-11-03
kind: discussion — Okuda's palette under a light Omarchy theme
status: open — destined for Okuda; persist here, moved manually
destination: okuda (docs/ or decisions/ as the receiver sees fit)
---

# Discussion: Okuda on a light Omarchy theme

**From:** mermaid-to-md session on Omarchy
**To:** okuda
**Date:** 2026-11-03
**Status:** discussion — observed behaviour, one design question, no decision claimed

## Observation

The operator switched Omarchy from a dark theme to a light one. The next `okuda`
render changed with it: the page ground and prose ink flipped, code fences
followed, while the accent roles (headings, links, diagrams, table keys) stayed
at their dark-theme hexes. The operator's report: *"the whole Okuda render has
changed with it."*

## What follows the glass — by design

- **`body` ships empty (`""`)** — prose, list text and table cells inherit the
  terminal foreground. `ADR-BODY-INK-072`.
- **`code-background` ships empty (`""`)** — fences sit on the terminal's own
  ground, not a second panel. `src/palette.ts`.
- **Fence syntax colour is `chroma --formatter terminal16`** — "the tool
  classifies, the terminal themes"; the 16 ANSI slots supply the hues.
  `src/render.ts`, `spawnChroma`.
- **Absolute luminance and contrast belong to the terminal**, not the renderer.
  `ADR-GLASS-INK-073`: okuda owns only the relative hierarchy among its roles.

So the ground and default ink moving is the declared boundary, not drift.

## What does not follow

- Headings, links, diagram border/arrow/text, table header/key, doc-refs, state
  glyphs and the vector paint are **fixed TrueColor hexes** in the palette.
- There is **no `~/.config/okuda/palette.json`** on this box, and Omarchy does
  not write one.
- There is no `OSC 11;?` background query; `ADR-GLASS-INK-073` deferred it.

The result is a mixed page: inherited ink and ANSI-fence hues follow the new
ground, while the accents remain tuned for a dark one. That is why the render
feels wholly changed even though the palette file did not move — the parts that
did not move are now the visually loud ones.

## The question, for okuda to decide

Is the light-theme render acceptable as the declared boundary, or should okuda
ship a **named** light preset (`--palette light`)?

`ADR-GLASS-INK-073` closes the lightness family and forbids a renderer-side
absolute-luminance knob; it keeps `body` empty by default and makes it a
*declared relation*. **It does not discuss presets** — the word does not appear in
it, so the sentence that stood here ("permits a named preset the principal
selects explicitly") was an unpaid claim, and is corrected rather than dropped.
The corpus rule that does speak to it is `BRF-PAIR-DELIVERED`'s out-of-scope:
*no light palette, and no second set of role meanings*.

## Options

> **Received and answered, 2026-11-03.** The operator's ruling: **the light preset
> is out.** Option 2 is refused on the tax — a light palette is a second set of
> role meanings, re-authored rather than re-tuned (`conceptual-lexicon.md`, TFS).
> What actually answered the light case was pinning the ground dark into the
> host's own override: 16 of 21 on-ground roles sat under 3:1 on flexoki-light.
> Option 3 (a probe) is not refused by this; it is simply not this question. The
> page carrying the position for humans is `explainers/colours.md`.

1. **Do nothing in the renderer.** Document a `body` hex and any accent
   overrides in `~/.config/okuda/palette.json`. Cheapest, but pushes a
   multi-role tuning job onto the principal, and `body` alone does not fix the
   accents.
2. **Add `--palette light`.** Re-tune every accent for a light ground (heading,
   link text/url, diagram channels, table roles, doc-ref, vector, state lamps),
   and add a prover that renders a fixed document under it. This is a product
   commitment: a second palette to keep honest.
3. **Add a palette contrast probe.** Measure the active palette against a
   declared ground and name the roles that fail (WCAG or the house contrast
   instrument), so the principal authors overrides with evidence rather than
   guesswork. No renderer change, no second palette to maintain.
4. **Reopen `OSC 11;?` derivation.** Already deferred in `ADR-GLASS-INK-073`;
   do not reopen without the measurement gate that decision named.

## Recommendation

Option 3 first: a probe names the failing relations without claiming a new
default, and it serves every palette, not just this theme. Option 2 only if the
operator actually wants a shipped light identity; if so, it should be measured
against the same contrast instrument as the dark preset, not eyeballed. Option 1
remains the honest fallback if the operator prefers to keep all ink in the
terminal.

The mermaid-to-md side has no colour to follow here: baked art is plain text.
This is an okuda palette question, which is why it is being delivered here.

## Receipts

- `src/palette.ts` — `body: ""`, `code-background: ""`, fixed accent hexes
- `src/render.ts` — `spawnChroma`, `terminal16`
- `decisions/072-body-ink.md`
- `decisions/073-the-glass-owns-its-ink.md`
- `~/.config/okuda/palette.json` — absent on this box
- Omarchy theme switch observed 2026-11-03; `COLORTERM=truecolor`, `TERM=xterm-256color`
- `briefs/2026-11-03-brief-pair-delivered.md` — the pin, and the out-of-scope this
  ruling rests on
- `explainers/colours.md` — the human-facing position, updated 2026-11-03
