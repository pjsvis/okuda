---
type: Brief
callsign: BRF-FLOW-WRAP
---

# Brief: Flow wrap — internal break opportunities so paths flow as text

**Date:** 2026-09-01
**Status:** Open
**Branch:** feat/gloam-launcher
**Context:** a nit on `decisions/021-jump-token-numbering-offset.md`. The Context paragraph reads:

> The index-and-jump brief (`briefs/2026-08-28-brief-index-and-jump.md`)
> specified two-digit jump tokens…

At terminal width 80 (content width 76) the rendered line is:

```
  The index-and-jump brief (briefs/2026-08-28-brief-index-and-jump.md)
  specified two-digit jump tokens 01–99: …
```

The path sits *whole* on its own line, leaving a ~40-column hole on the
line above. At narrower widths it hard-splits mid-string
(`…-index-and-j` / `ump.md`). It never *flows* — it never breaks inside
the token to fill the line. That is the nit.

## The finding

The path is an inline **codespan** (backticks in source). Bun.markdown
delivers it to the `codespan` handler without the backticks; the styler
colourises the text and emits no delimiters (the "brackets" the eye sees
are the literal prose parentheses, not the backticks). What reaches the
wrap engine is a single spaceless run: `briefs/2026-08-28-brief-index-and-jump.md`.

`wrapANSI` (ADR-004) breaks only on space and newline. Every spaceless
run is one atomic **word**. A word either fits on the current line,
moves whole to the next, or — when even alone it overflows — is
hard-split mid-grapheme. There is no middle ground: no internal break
point. So the path jumps whole to line 2 and leaves line 1 short; only
at widths where it alone overflows does it char-split.

This is **not codespan-specific.** A plain hyphenated prose word behaves
identically — verified: `hyphenated-word-that-keeps-going-and-going-and-going`
sits whole on its own line, then hard-splits when alone-overflowing.
The atomic-word model is the wrap engine's, not the token type's.

## The crutch

Keeping the filename whole on one line serves **copy-paste**: a reader
who selects the rendered path gets the filename as one unit, no
inserted newline. That is the entire justification for the atomic-word
model when a token overflows its line: integrity for machine consumption.

It is a techie crutch. okuda is a **viewer** — rendering is its whole
concern (AGENTS.md, three-concerns principle):

1. **Compositing** (where text comes from) → the environment.
2. **Windowing** (where text appears) → the host (terminal selection,
   pane layout).
3. **Rendering** (markdown in, coloured bytes out, fast) → okuda.

Copy-paste integrity is a **windowing** concern — it lives in the
terminal's selection model, which okuda does not own and cannot see.
Optimising line layout for copy-paste is okuda reaching into the host's
lane, taxing the reading experience (flow) to subsidise a capability
that belongs to the terminal. The terminal decides whether a wrapped
selection rejoins cleanly; okuda's job is to render for the reader, and
the reader is reading prose, not selecting filenames. The one reader who
wants to copy the path can select across the wrapped lines; whether the
terminal rejoins them is the terminal's problem, not the renderer's.

## Why flow wins

The trade is **flow vs. copy-paste integrity**, and flow wins because
okuda renders for readers, not for `xclip`:

- **Reading is the common case; copying is the rare case.** Layout that
  serves the common case is the pizza shop — predictably adequate. A
  special-case integrity mode for the rare case is the chip-pan fire:
  reactive, expensive, and out of okuda's scope to deliver correctly
  anyway (the terminal owns the rejoin).
- **The crutch doesn't even work at narrow widths.** Once a token
  overflows its line *alone*, it hard-splits mid-grapheme — copy-paste
  already yields a broken filename. The integrity the atomic model
  "preserves" is a width-dependent accident, not a guarantee. Honesty
  says: either flow everywhere, or integrity everywhere; the current
  half-and-half is the worst of both.
- **Systems over villains.** This isn't a bug in `wrapANSI`; it's a
  contract (atomic words) that was never re-examined against the
  reading use case. The system optimised for the wrong consumer.

## Decision

**Give the wrap engine internal break opportunities. A word may break
*after* `/` and `-` as well as at spaces.** Flow is the goal; the
token weaves into the prose and the column budget is used honestly.

- **Break-after `/`** — `briefs/` / `2026-08-28-brief-index-and-jump.md`;
  the separator rides the first line (the path reads naturally, and a
  leading-separator continuation line is avoided).
- **Break-after `-`** — `2026-08-28-brief-` / `index-and-jump.md`; the
  hyphen rides the first line (standard typography: hyphenated words
  break at the hyphen).
- **Applied generally, not to codespans alone.** The wrap engine sees
  runs, not token types; the escape stream IS the style protocol
  (decisions/005). A hyphenated prose word (`copy-paste`, `keyboard-aware`)
  benefits identically. Carving a codespan-only exception would violate
  the clean separation and is benchmaxxing the scope. The principle
  (flow) is general; the mechanism (break opportunities) is general.

### The invariant is preserved by construction

Adding break opportunities only adds *more* places the engine may
break — never fewer. The hard-split-mid-grapheme fallback (when even
the longest sub-segment overflows) is unchanged. So the ADR-004
invariant — **every emitted line ≤ `width` display columns** — holds
without modification. The grapheme-aware width math and the East Asian
Width / zero-width handling are untouched.

### Style hygiene at the new seams is unchanged

The wrap engine closes SGR and OSC-8 zones at every `flushLine` and
re-emits the carried state on the continuation (rules 2–4). Adding
internal break points just means `flushLine` fires at more columns; the
hygiene machinery is line-boundary machinery and is indifferent to
*why* the boundary fired. A coloured codespan broken at a `/` closes its
`code-text` SGR at the line end and re-opens it on the continuation,
exactly as it does today at a space boundary. Verified by reading
`flushLine` / `trackEscape`: state folds at flush time, not scan time.

### NO_COLOR parity

In `none` mode the codespan returns its text unchanged (no SGR, no
backticks). The wrap engine consumes the same runs; the break points
apply uniformly. Styled and plain wrap to identical line counts and
widths — the existing parity test (`no-color parity: styled and plain
wrap to identical widths`) keeps its guarantee.

## This amends ADR-004 (in place, following the 2026-08-30 pattern)

The atomic-word model is governed behaviour under ADR-HARD-WRAP-004
(the mandate implies the word as the unit of reflow). Changing it is a
behavioural amendment to a core contract, so it earns a decision — but
ADR-004 has been amended in place before (2026-08-30, the fence
elision; 2026-09-01, the checksum retirement note). The same pattern
applies: append an amendment paragraph to ADR-004 recording that the
word is no longer the sole reflow unit — `/` and `-` are internal break
opportunities — and cite this brief. **No new ADR** (the contract is
refined, not reversed; no two-viable-options choice, no reversal — the
palimpsest protocol is not triggered). If implementation surfaces a
genuine either/or (e.g. whether to break at `.`), that sub-decision
gets its own ADR; the brief's core does not.

## How

- **`src/wrap.ts`** — `wrapANSI`: when a word is being assembled and a
  break opportunity (`/`, `-`) is encountered *inside* it, the engine
  treats the segment up to and including the separator as a breakable
  sub-unit. Greedy fill proceeds at the sub-unit granularity: a
  sub-unit that fits is appended; one that doesn't triggers a
  `flushLine` and continues on the next line. The hard-split fallback
  still applies to a sub-unit longer than the line. The separator stays
  at the end of the first line (break-*after*).
- **Boundary: do not break at a leading separator.** A word that
  *starts* with `/` or `-` keeps its first sub-unit intact (no
  continuation line may begin with a separator). This is a one-rule
  guard; the typography reads cleaner and it costs nothing.
- **`tests/wrap.test.ts`** — add cases:
  - A long path with `/` breaks after a slash, every line ≤ width, no
    line begins with `/`.
  - A hyphenated word breaks after a `-`, every line ≤ width.
  - A path that fits on the line stays whole (break opportunities are
    *opportunities*, not forced — the greedy fill uses them only when
    needed).
  - The existing `no-color parity` test still passes (styled vs. plain
    identical widths) with the new break points.
  - The existing `every line ≤ width` invariant holds on a path that
    overflows even when broken at every opportunity (hard-split fallback
    still fires).
- **`decisions/004-hard-wrap-mandate.md`** — append the amendment
  paragraph (citing this brief); update the "What became harder" bullet
  if the word-model note belongs there. Same-commit edit.

## Scope / non-goals

- **Not changing the hard-split fallback.** A sub-segment (or a word
  with no break opportunities) that alone overflows the line is still
  hard-split mid-grapheme — ADR-004's last-resort is intact.
- **Not breaking at `.` (open).** Breaking around `.` in
  `2026-08-28-brief-index-and-jump.md` is murkier: break-*after* `.` puts
  `md` on the next line (odd); break-*before* `.` puts `.md` on the
  next line (less odd). The `/` and `-` rules already let this filename
  flow (it breaks at the hyphens). **Decide `.` at implementation**, in
  the ADR-004 amendment, not here — the brief sets the doctrine (break
  at separators that read naturally at line end) and `/`+`-` are the
  clear cases.
- **Not a per-token-type policy.** The break opportunities are a
  wrap-engine property applied to all words, not a codespan feature.
  Codespans, link text, plain prose — all flow the same way.
- **Not copy-paste preservation.** A wrapped path copied from the
  terminal may insert a newline at the break. Accepted — that is the
  terminal's selection model (windowing), not okuda's rendering
  concern. The crutch is retired deliberately.
- **Not touching diagram/fence/mermaid handling.** Those elide
  (td-b81597) or render verbatim (art is art). Internal break
  opportunities apply to the prose/inline-content reflow path only.

## Risk / open questions

- **Copy-paste newline insertion.** A reader who selects a wrapped path
  may get a newline at the break, depending on the terminal. Accepted
  (above); flag in the debrief. The integrity the atomic model
  "preserved" was already width-dependent (hard-split at narrow
  widths), so we are not losing a guarantee — we are making the
  behaviour honest and reader-serving at all widths.
- **`.` handling.** Open (above). Implementation decides; the
  amendment records the choice.
- **Over-fragmentation at very narrow widths.** A long hyphenated
  filename at a narrow pane may break into many short segments. This is
  honest flow at a constrained width — the alternative (one line whole,
  then char-split) is worse. The greedy fill still packs as many
  sub-units per line as fit; breaks fire only when needed.
- **Greedy fill + break opportunities interaction.** The engine must
  not break *earlier* than necessary: a break opportunity inside a word
  is used only when the *next* sub-unit doesn't fit, same as a space
  boundary today. Implementation must preserve the greedy property
  (fill the line as far as possible before breaking).

## Related

- `decisions/004-hard-wrap-mandate.md` — the wrap mandate this amends
  (atomic-word model → `/` and `-` become internal break opportunities)
- `decisions/005-render-engine-string-protocols.md` — the escape stream
  IS the style protocol; the wrap engine sees runs, not token types
  (why the fix is general, not codespan-specific)
- `decisions/021-jump-token-numbering-offset.md` — the dogfood doc that
  surfaced the nit (the path reference in the Context paragraph)
- `AGENTS.md` — three-concerns principle (compositing / windowing /
  rendering); copy-paste integrity is a windowing concern, not okuda's
- `src/wrap.ts` — `wrapANSI`, `appendWord`, `flushLine` (the change site)
- `src/ansi.ts` — `codespan` (no backticks emitted; the "brackets" are
  prose parens, not delimiters)
- `tests/wrap.test.ts` — the wrap invariant tests to extend