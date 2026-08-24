# okuda ↔ Glow — Snagging List

Observed at dogfood: `okuda docs/audit.md` and `glow docs/audit.md` side
by side in a real terminal. Each entry states what the eye sees in each
tool, the byte ground where it's already measured, and the likely class.

This is the **unintentional-divergence** list — the complement of
ADR-007's *intentional*-divergence table. Items here are drift or bugs to
resolve by converging to Glow (the reference) or grounding as an okuda
thing. An item leaves this list when it either matches Glow byte-for-byte
or earns a row in ADR-007.

Byte ground was captured this session via `script -q /dev/null glow
docs/audit.md | cat -v` (TTY-faithful) — the real reference, not
glamour's ANSI-256 `DarkStyleConfig` (the wrong source ADR-006 used).

---

## 1. Heading colour — glow purple, okuda blue

- **Glow:** purple `#bd93f9` + bold (`\x1b[38;2;189;147;249;1m…`)
- **okuda:** blue `#00afff` + bold
- **Class:** wrong reference (same root as the emphasis error). ADR-006
  sourced "39, bright blue — the signature Glow header" from glamour's
  DarkStyleConfig; glow-CLI renders Dracula purple `#bd93f9`. The
  "signature Glow header" is purple, not blue.
- **Fix direction:** converge `#00afff` → `#bd93f9` (and its aliases:
  table-header, which reuses heading).

## 2. Bold (strong) — glow orange, okuda yellow/gold

- **Glow:** orange `#ffb86c` + bold (`\x1b[38;2;255;184;108;1m…`)
- **okuda:** gold `#ffd700` + bold
- **Class:** pending divergence, flagged in `palette.ts`. Same wrong-source
  root: glamour's strong is near-white `#d7d7d7`; glow-CLI's is Dracula
  orange `#ffb86c`. okuda's gold was an ungrounded "okuda identity" that
  never made it into ADR-007's table.
- **Fix direction:** converge `#ffd700` → `#ffb86c`.

## 3. Inline code — glow green no background, okuda green + gray background

- **Glow:** green `#50fa7b`, **no background** (`\x1b[38;2;80;250;123m…`)
- **okuda:** green `#5fd700` on background `#303030` (lighter gray)
- **Class:** two sub-divergences. (a) Shade: `#5fd700` vs `#50fa7b` —
  wrong-source drift, converge. (b) Background: okuda emits a `#303030`
  bg; glow emits none. The background is an ungrounded okuda addition
  (brief 002 specified it; glow-CLI doesn't have it). Converge (drop bg)
  or ground as an okuda thing.
- **Fix direction:** converge colour to `#50fa7b`; decide on the
  background (drop vs ground).

## 4. Backticks — glow drops them, okuda keeps them

- **Glow:** code span renders as *just the content*, no backticks.
- **okuda:** `codespan` emits `` `<content>` `` — backticks preserved.
- **Class:** rendering divergence, not colour. Brief 002's `codespan`
  keeps backticks literally. Glow strips them (the colour/monospace is
  the signal, not the delimiters).
- **Fix direction:** decide — strip backticks to match Glow, or keep as
  an okuda thing (ground it). This is a grammar choice, not a byte fix.

## 5. Link — glow shows text + URL, okuda shows only clickable text

- **Glow:** link text in rose, URL in cyan, both visible inline.
- **okuda:** link text only, as an OSC 8 hyperlink (clickable, invisible
  in scrollback). URL not displayed.
- **Operator note:** this terminal requires the URL to be *displayed*
  (visible), not just clickable. okuda's OSC 8-only approach doesn't meet
  that need.
- **Class:** feature gap, not a colour swap. The fix is a rendering
  change: show the URL inline (text rose + url cyan, Glow-faithful),
  possibly retaining OSC 8 for clickability. Needs a design decision
  (where the url sits, wrapping of long urls, keep/drop OSC 8).
- **Bytes (measured):** glow link text `38;2;255;121;198m` (rose
  `#ff79c6`, **no underline**); glow URL `38;2;139;233;253;4m` (cyan
  `#8be9fd` + underline `4`); **no OSC 8** — glow shows the URL as visible
  cyan text. okuda currently: OSC 8 wrapping `38;2;0;175;95;4m` (green +
  underline) text only, no URL.

## 6. Blockquote text — glow yellow italic, okuda plain

- **Glow:** the `> Quote — muted pipe, single level.` line renders as
  **yellow italic** text (with a left border).
- **okuda:** renders as **plain text** with a muted pipe prefix; no text
  colour, no italic.
- **Class:** styling divergence. okuda's `quoteBlock` only adds the
  muted pipe; glow also styles the text (italic + colour). The pipe is
  okuda's addition (glow uses a left border bar in `#6271a3`, not a `│`
  glyph) — a separate structural choice.
- **Decision (operator):** converge the text styling; **keep the `│`
  pipe** (review later). So this is a hybrid — text styling converges,
  pipe glyph stays as an okuda divergence (candidate for an ADR-007 row).
- **Bytes (measured):** glow blockquote text `38;2;241;250;140;3m`
  (yellow `#f1fa8c` + italic — **identical to emphasis**); glow left
  border `38;2;97;113;163m` (`#6271a3` muted-blue bar, not a glyph).
  okuda: plain text + `│` pipe in `#767676`.

---

## Sequence note

Items 1, 2, 3a are the same class as the emphasis fix already shipped
(wrong reference → converge the hex). They're one-line palette edits +
test retunes, mechanically the same as this session's emphasis work.
Items 3b, 4, 5, 6 each carry a design decision (drop vs ground; strip vs
keep; url display; pipe vs border) and need discussion before code.
