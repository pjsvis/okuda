# State-Glyph Vocabulary — on-screen-now

**Kind:** the live exhibit. The closed glyph vocabulary rendered as a
glance — green/yellow/orange/red, bold. If the glyphs don't read at 3×
distance with colour + bold, the vocabulary fails its job and the lexicon
is a list, not a moat.

**What this is:** the four state glyphs (`☐ ✓ ⋮ ✗`) with their traffic-
lamp colours, pinned by contract test (`tests/ansi-palette.test.ts`,
brief: `briefs/2026-08-28-brief-state-glyph-vocabulary.md`). The colours
are **lexicon-applied**, not author-editable — the renderer colours a
`✓` green because `✓` is in the closed state-glyph vocabulary, not
because an author can tag arbitrary text green. Same shape as `alert`
(ADR-015): the state colours are the lexicon's voice, applied to the
lexicon's glyphs.

**The vocabulary:**

| Glyph | State | Role | Hex | Channel | Reads as |
|-------|-------|------|-----|---------|----------|
| ✓ | done / shipped | `state-ok` | `#5fd35f` | success | "this works" |
| ☐ | todo / pending | `state-todo` | `#ffe066` | waiting | "not yet" |
| ⋮ | parked / elided | `state-parked` | `#ff9933` | caution | "deferred" |
| ✗ | rejected / failed | `state-failed` | `#ff5555` | alarm | "no" |
| ◆ | load-bearing | — (heading/strong) | — | priority, not state | "read this first" |

`◆` stays on the heading/strong channel — it's a priority mark, not a
lifecycle state. Colouring it would collapse the priority axis into the
state axis: the lexicon leak the monster docs test for. Resist the
temptation to give `◆` a colour "for consistency" — consistency would
be the leak.

**The four traffic-lamp colours are preset-independent.** Document
channels (heading, strong, link) diverge by preset identity; state
channels converge — a green check reads as a green check on every
bridge. This extends ADR-015's `alert` precedent (alarm-universality)
to the full lamp. A future palette that wants its own traffic lamp may
override the four roles via `~/.config/okuda/palette.json`.

**NO_COLOR parity:** the glyphs survive the loss of colour by shape
alone. Render with `--no-color` and `✓` is still `✓`, `✗` still `✗` —
the state is in the glyph; the colour + bold is the glance, not the
meaning. (The ADR-015 invariant, extended.)

---

## The ANSI bytes (the contract the test pins)

The contract test asserts these byte-exactly. This code fence is the
on-screen-now exhibit of what the renderer emits for each glyph under
truecolor — colour + bold in one SGR:

```text
state-ok     ✓   \x1b[38;2;95;211;95;1m✓\x1b[0m      green + bold
state-todo   ☐   \x1b[38;2;255;224;102;1m☐\x1b[0m    yellow + bold
state-parked  ⋮   \x1b[38;2;255;153;51;1m⋮\x1b[0m     orange + bold
state-failed ✗   \x1b[38;2;255;85;85;1m✗\x1b[0m      red + bold  (= alert)
```

`roleBold(name, glyph)` emits `\x1b[38;2;R;G;B;1m` + glyph + `\x1b[0m`
— colour and bold in one SGR sequence, the same emitter `strong` uses.

---

## The vocabulary in prose

The glyphs lead a list, carrying state the bullet cannot — one glyph,
one job, one channel:

- ✓ **Wrap engine.** Grapheme segmentation verified on CJK, emoji, combining marks.
- ✓ **Mermaid intercept.** Art on show; source omitted, a `⋮` renderer statement names what was elided.
- ☐ **Lexer EAW audit.** Token widths against the EAW table — not yet checked.
- ⋮ **OSC 8.** Parked under Pass C; reopen on terminal evidence.
- ✗ **Autolink pass.** Rejected — URL detection is the terminal's job.
- ◆ **Elision primitive.** The load-bearing row — the gap ADR-014 names; `td-b81597` closes it.

The `◆` is intentionally not traffic-lamp coloured — it's the priority
mark, on the heading channel. Two axes, two layers: state glyphs carry
lifecycle, `◆` carries priority. The eye reads both without collision
because they're on different channels.

---

## The vocabulary in a table

A glyph column compresses state to a glance — each row is assessed
before it is read, and the key beneath teaches the dialect in one line:

| Subsystem | State | Note |
| --- | --- | --- |
| render | ✓ | the render plane; every byte passes through here |
| tui | ✓ | control plane; the game loop |
| launcher | ✓ | ADR-016; argv[0] dispatch |
| wrap | ✓ | grapheme-true hard-wrap; the invariant |
| grammar | ⋮ | parked; Bun.markdown owns the grammar |
| OSC 8 | ✗ | rejected; URL detection is the terminal's job |
| ◆ elision | ☐ | `td-b81597`; the gap ADR-014 names |
| in-doc search | ☐ | brief open; the length axis earns its vector |

Key: ☐ to do · ✓ done · ✗ rejected · ⋮ parked. ◆ in the notes column
marks the row that reframes the table.

---

## What to judge

1. **Do the glyphs read at 3× distance?** With colour + bold, a `✓`
   should scan as "done" before the row is read; a `✗` as "no." If you
   have to read the glyph to know the state, the colour isn't earning
   its place.
2. **Do `◆` and the state glyphs stay on separate axes?** If `◆` reads
   as a fifth state, the lexicon has leaked — priority collapsed into
   lifecycle. It should read as a different *kind* of mark.
3. **Does NO_COLOR survive?** `okuda docs/state-glyphs.md --no-color`
   — the glyphs are shape-only; the states still distinguish. The
   colour is the glance; the glyph is the meaning.
4. **Does the table scan as a column?** The state column should read
   vertically as a status strip — green, green, green, green, orange,
   red, yellow, yellow — before any row is read. That's the
   traffic-lamp doing the job the plain glyphs couldn't.

Where the answers surprise, that's a brief.