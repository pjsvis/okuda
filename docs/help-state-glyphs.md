# help — state glyphs (colours, bold, brightness)

**Read this first** when working on the state-glyph vocabulary — the
`✓ ☐ ⋮ ✗` traffic-lamp colours the renderer applies to glyphs in table
cells and list leads. This file is the map: where the colours live, how
to view them, how to change them, and where the deep reference is.

**Find this file:** search `help` (the compass-rose word — `help` is the
operator's view, `docs/help.md` the general one; this is the topic
variant). Search `state-glyphs` or `state-colours` also finds it.

---

## The two commands

| Command | What it does | When |
|---------|--------------|------|
| `just state-colours` | Palette A/B in the terminal — no renderer, no chrome. Ad-hoc dim palettes vs bright. | **Tuning the colours** — eyeball hex changes before touching the palette |
| `just state-colours-doc` | `okuda docs/state-colours.md --tui` — the renderer in the wild, full chrome. | **Verifying in the wild** — confirm the colours land in content, chrome invariant held |

The two are separate by design. `state-colours` tests bytes (perceptual
tuning); `state-colours-doc` tests the renderer (the real path). Keep
them separate — different jobs.

---

## The four state colours (and where they live)

| Glyph | State | Role | Hex | Tier |
|-------|-------|------|-----|------|
| ✓ | done / shipped | `state-ok` | `#5fd35f` green | recede (expected) |
| ☐ | todo / pending | `state-todo` | `#ffe066` yellow | watch (attention) |
| ⋮ | parked / elided | `state-parked` | `#ff9933` orange | recede (expected) |
| ✗ | rejected / failed | `state-failed` | `#ff5555` red | alarm (= `alert`) |
| ◆ | load-bearing | — | uncoloured | priority, not state |

`◆` is **not** a state — it's a priority mark on the heading channel.
Colouring it would collapse two axes. Resist the temptation.

### Where to change the hexes (two files, one edit each)

Both files must match — `src/palette.ts` (the Dracula preset, in code)
and `src/palettes/okuda.json` (the okuda preset, the default). Change a
hex in **both**. The contract test (`tests/ansi-palette.test.ts`) pins
the bytes and will fail loudly if:
- the new hex collides with a document channel (`heading`, `strong`,
  `emphasis`, `link`, `code-text`, etc.) — the ADR-006 non-confusability
  guard, the test that caught the brief's first incoherence.
- the four state colours are not mutually distinct.
- the state colours are not preset-independent (okuda ≠ dracula for a
  state role fails the traffic-lamp-universality invariant).

So: change a hex → run `just check` + `bun test tests/ansi-palette.test.ts`
→ the test tells you if the new colour is honest. That's the "down pat"
property — a hex change is a one-line edit, not a refactor.

### The one allowed collision

`state-failed` (`#ff5555`) **is** `alert` — same hex, two names, by
intent (ADR-015 precedent: alarm-universality). The test skips this
collision deliberately. Don't try to make them distinct.

---

## How to change boldness

All four state glyphs render **bold** via `roleBold` — colour + bold in
one SGR sequence (`\x1b[38;2;R;G;B;1m`). Bold is the constant; colour is
the variable. The boldness is not per-glyph — it's in the emit call:

- `src/render.ts` — `styleStateGlyph()` calls `styler.roleBold(role, glyph)`.
  To make glyphs non-bold, change `roleBold` → `role` (colour only) in
  that one call. But read the brief first — bold is the second channel the
  scratchpad's "one glyph one job" rule permits when it aids perception at
  distance. Dropping it is the A/B test to run once colours are settled.

The A/B on bold is phased: hold bold *on* for the first pass so you're
judging colour-intensity in isolation; then A/B bold on the **recede tier
specifically** (done `✓`, parked `⋮`) — that's where the question lives.
The attention tiers (todo `☐`, failed `✗`) almost certainly want bold; a
bright red `✗` without bold reads as a warning label, not an alarm.

---

## How to change brightness (dim the recede tier)

Two ways to dim — and the terminal-dependent one is the wrong one:

- **Dimmer hexes (right)** — pick a lower-lightness, lower-saturation hex
  for `state-ok` / `state-parked` in both palette files. Byte-exact,
  terminal-independent, the contract test pins them. This is the
  recommended path.
- **The `\x1b[2m` faint attribute (wrong)** — terminal-dependent, often
  looks muddy. Avoid.

`just state-colours` already A/Bs this for you: the right column shows
ad-hoc dim hexes (`#3d7a3d` green, `#8a5520` orange) against the bright
set on the left. Edit the dim hexes in `scripts/state-colours.ts` to
test a different dim proposal without touching the real palette. When
you've settled on a dim hex, move it into `src/palette.ts` +
`okuda.json` (both) and run the gate.

The semantic framing: done + parked are **recede** (expected — the eye
skips); todo is **watch** (forward-looking attention, bright yellow);
failed is **alarm** (reactive attention, bright red = `alert`). The
brightness encodes urgency, not just category — expected states dim,
attention states bright.

---

## The reading order (if you want the depth)

1. **This file** — the operator's map.
2. `docs/state-colours.md` — the showcase environment. Render it with
   `just state-colours-doc`. The live exhibit: table, list, prose, and
   the judgement questions. The prose section is the P2.1 exhibit
   (inline glyphs, deferred — judge whether colour in prose reads as
   honouring the lexicon or editorialising).
3. `briefs/2026-08-28-brief-state-glyph-vocabulary.md` — the contract
   brief. The ADR-006 justification table for each colour; the
   non-confusability discipline; the ◆-is-not-a-state guard.
4. `briefs/2026-08-28-brief-state-glyph-render-path.md` — the
   application brief. The phased epic (P1 showcase, P2 render path,
   P3 perceptual tuning), the foxtrot-oscar guard (chrome invariant).
5. `decisions/015-alert-palette-role.md` — the precedent. ADR-015 set
   the discipline this vocabulary extends: alarm-universality,
   chrome-not-content, the non-confusability test.
6. `tests/ansi-palette.test.ts` — the contract. The six tests that pin
   the hexes, the convergence, the non-collision, the NOCOLOR parity.
   The test is the brief's enforcement — it caught the last incoherence
   and will catch the next one.

---

## The open work (so you know what's left)

- **P3 — perceptual tuning** (`td-8ece4e`): the knob-turning. You're
  doing this now via `just state-colours`. No new code — one-line palette
  edits the contract test catches.
- **P2.1 — inline-prose glyphs**: deferred. The showcase doc's prose
  section is the judge. Decide after living with table + list colouring.
- **P1/P2 — landed.** The showcase doc and the render-path application
  are committed; `just state-colours-doc` shows the colours in the wild.

---

## Quick reference

```
just state-colours         # A/B the palette (tuning, no renderer)
just state-colours-doc     # renderer in the wild (verify, chrome intact)
just check                 # gate (registries + facade-lint)
bun test tests/ansi-palette.test.ts   # the contract tests
```

Files to edit for a colour change (both, always):
```
src/palette.ts              # Dracula preset (code)
src/palettes/okuda.json     # okuda preset (default, JSON)
```

The closed glyph set + role mapping lives in one place:
```
src/render.ts  →  STATE_GLYPH_ROLE  (the lookup)
src/render.ts  →  styleStateGlyph() (the helper, calls roleBold)
```

Change a hex in both palette files → `just check` + the palette tests →
the test tells you if it's honest. That's the whole loop.