# State Colours — the showcase environment

The live rendered exhibit of the state-glyph vocabulary, in the wild, inside the frame. Every glyph in every content path: table cells, list leads, prose. The chrome — H1 badge + RHS chip on the header, two-chip bookend terminator on the close — comes from the renderer, not the author; it is a system invariant, and this document is its watchdog. If the chrome ever drifts (the terminator stops closing, the chip misaligns), this doc catches it.

**Landed, and now a watchdog.** The palette pins four state roles — `state-ok`,
`state-todo`, `state-parked`, `state-failed` — and the render path applies them to
standalone state glyphs in every content path: table cells, list leads, inline prose.
This document was written as the gap made legible (*the glyphs are here, the colours are
absent*); the gap closed, and what is left is the exhibit plus the checks. Read it by
looking, then read `--no-color`: the state is in the glyph, the colour is the glance,
and losing the colour must not lose the state.

A document about the vocabulary is the last place allowed to teach a retired one, so it
is now checked: `tests/doc-vocabulary.test.ts` derives the glyphs from the renderer's own
map and asserts this file against it — the four marks, their hexes, and the alignment of
the byte fence below.

**The vocabulary:**

| Glyph | State | Role | Tier |
|-------|-------|------|------|
| ✓ | done / shipped | `state-ok` | recede (expected) |
| ☐ | todo / pending | `state-todo` | watch (forward-looking) |
| ⸮ | parked — a comment on the plan | `state-parked` | commentary — `#a06fa8` (aubergine) |
| ✗ | rejected / failed | `state-failed` | alarm (= `alert`) |
| ◆ | load-bearing | — (heading/strong) | priority, not state |

`◆` is not a state. It is a priority mark on the heading channel. Colouring it would collapse the priority axis into the state axis — the lexicon leak this document tests for.

**How to read it:** `okuda docs/state-colours.md --tui`. Then `--no-color`: the glyphs survive by shape alone. The state is in the glyph; the colour is the glance.

---

## In a table — the state column

A glyph column compresses state to a glance. Each row is assessed before it is read. Real subsystem content, the monster-tables shape:

| Subsystem | State | Note |
| --- | --- | --- |
| render | ✓ | the render plane; every byte passes through here |
| tui | ✓ | control plane; the game loop |
| launcher | ✓ | ADR-016; argv[0] dispatch |
| wrap | ✓ | grapheme-true hard-wrap; the invariant |
| grammar | ⸮ | parked (the irony mark); Bun.markdown owns the grammar |
| OSC 8 | ✗ | rejected; URL detection is the terminal's job |
| ◆ elision | ☐ | `td-b81597`; the gap ADR-014 names |
| in-doc search | ☐ | brief open; the length axis earns its vector |

Key: ☐ to do · ✓ done · ✗ rejected · ⸮ parked. ◆ in the notes column marks the row that reframes the table.

---

## In a list — the status-led items

The glyphs lead, carrying state the bullet cannot. One glyph, one job, one channel:

- ✓ **Wrap engine.** Grapheme segmentation verified on CJK, emoji, combining marks.
- ✓ **Mermaid intercept.** Art on show; source omitted, a `⋮` elision mark names what was elided.
- ☐ **Lexer EAW audit.** Token widths against the EAW table — not yet checked.
- ⸮ **OSC 8.** Parked under Pass C; reopen on terminal evidence.
- ✗ **Autolink pass.** Rejected — URL detection is the terminal's job.
- ◆ **Elision primitive.** The load-bearing row — the gap ADR-014 names; `td-b81597` closes it.

---

## In prose — the inline glyphs

Glyphs inline in sentences carry the same state, compressed to one cell. This was the
last path to be coloured, and the argument against it was that colouring prose
*editorialises* it — the viewer appearing to have an opinion about the author's sentence.
The judgement made: the glyph is standalone, the lexicon is closed, and the colour follows
the mark rather than the author's whim, so what the reader sees is the vocabulary being
applied, not a reading being imposed. It reads as the lexicon. Judge it here:

The render plane is ✓ shipped; the launcher loop is ✓ shipped (ADR-016); the fetch-state stamp is ⸮ parked; the autolink pass is ✗ rejected. The elision primitive is ☐ todo — the one productive attention state. ◆ marks the load-bearing note: the elision gap is the governance gap ADR-014 names.

Read that paragraph twice — once in colour, once under `--no-color`. In colour: does it
read as the lexicon being honoured, or as the viewer editorialising the sentence? Under
`--no-color`: do the states survive on shape alone? The answers are the P2.1 verdict, and
they have to hold together: a mark that needs its colour to mean something is decoration.

---

## The ANSI bytes — what the renderer emits

The exhibit is painted above and in the tables, because those are ordinary prose and the
renderer colours them. The fence below is the **bytes quoted**, and a fence is code:
nothing inside it is painted, so every glyph there reads in the code colour — a property
of the fence, not of the glyph. The contract test pins these byte-exactly: colour + bold
in one SGR sequence.

```text
state-ok     ✓   \x1b[38;2;95;211;95;1m✓\x1b[0m      green + bold
state-todo   ☐   \x1b[38;2;255;224;102;1m☐\x1b[0m    yellow + bold
state-parked ⸮   \x1b[38;2;160;111;168;1m⸮\x1b[0m     aubergine + bold
state-failed ✗   \x1b[38;2;255;85;85;1m✗\x1b[0m      red + bold  (= alert)
```

`roleBold(name, glyph)` emits `\x1b[38;2;R;G;B;1m` + glyph + `\x1b[0m` — colour and bold in one SGR, the same emitter `strong` uses.

---

## What to judge

1. **Does the chrome hold?** The H1 badge + chip on the header, the two-chip bookend at the foot. If the terminator stops closing or the chip misaligns, the system invariant broke — foxtrot oscar. This doc is the watchdog.
2. **Does every content path colour?** Table cells, list leads, inline prose. A path that stays plain is a hole in a closed lexicon, and the one place a second vocabulary can start.
3. **Do the glyphs read at 3× distance?** With colour + bold, a `✓` should scan as "done" before the row is read. If you have to read the glyph to know the state, the colour isn't earning its place.
4. **Do `◆` and the state glyphs stay on separate axes?** `◆` should read as a different *kind* of mark — priority, not lifecycle. If it reads as a fifth state, the lexicon has leaked.
5. **Does NOCOLOR survive?** `okuda docs/state-colours.md --no-color` — the glyphs are shape-only; the states still distinguish. The colour is the glance; the glyph is the meaning.

Where the answers surprise, that's a brief.