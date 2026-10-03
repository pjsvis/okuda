---
type: Brief
callsign: BRF-SESSION-HANDOFF
---

# Session Handoff — 2026-08-24 (evening): Glow convergence + Gloam footer

**Branch:** `feat/tui-control-plane`
**TD:** `td-52db41`
**Tests:** 109/109 green · **Registries:** in sync
**State:** committed through `fb2cc16`; working tree clean at handoff.
Supersedes `2026-08-24-session-handoff.md` (morning) for resume purposes.

---

## What this session did

### 1. The italic diagnostic ran (and was broken by design)
The morning handoff's prescribed first task — `okuda --no-color docs/audit.md`
— was a no-op: `makeStyler`'s `"none"` branch is identity for italic, so there
was no italic left to slant. The diagnostic valve itself is still broken
(deferred, see "What's next").

Byte-capturing the *real* reference settled the real question: **glow (the
CLI) renders Dracula truecolor, NOT glamour's ANSI-256 `DarkStyleConfig`**
that ADR-006 sourced from. Two different palettes share the name "Glow."
That wrong sourcing is the root cause of every colour defect this session
fixed. Measure with `script -q /dev/null glow <file> | cat -v` (TTY-faithful);
never read glamour's `styles.go` and call it Glow.

### 2. Emphasis convergence (commit `4397502`, the branch milestone)
- emphasis `#ffff5f` → `#f1fa8c` (glow Dracula yellow)
- SGR order flipped attribute-first → colour-first (`38;2;R;G;B;3m`)
- `***bold italic***` special-cased to the emphasis colour (glow-faithful):
  Bun nests `emphasis(strong(text))` post-order, so `unwrapStrongSpan`
  (ansi.ts) detects the pure strong child and `roleBoldItalic` re-emits one
  combined SGR. Without this, strong's colour overrode emphasis's.

### 3. All six snagging items resolved (docs/glow-delta-snagging.md)
- **Pass A `a8e28ee`:** heading `#bd93f9` purple, strong `#ffb86c` orange,
  code `#50fa7b` (+ table-header alias). Three hex edits, same fault class
  as emphasis.
- **Pass B `f312b33`:** code background dropped (`48;2` gone from code);
  backticks stripped from codespan in **both** colour modes; blockquote text
  styled yellow-italic (same SGR as emphasis) with the `│` pipe kept per
  operator call.
- **Pass C `c0dfe42`:** link renders rose `#ff79c6` text + visible
  cyan-underlined `#8be9fd` URL, no OSC 8. New `link-text`/`link-url` roles;
  legacy `link` role kept for override-file compat.

### 4. Gloam footer badge + layout
- `90893e8` — badge: pink `#ff79c6` bg, near-white `#f8f8f2` fg, 1-space
  padding. Dedicated `badge-bg`/`badge-fg` roles (chrome ≠ markdown — not
  aliased to link-text). `Styler.badge()`.
- `60511e3` — Glow-layout footer: `? help` + badge + folder/filename
  (`displayPath` = last two path segments). `?` (0x3f) toggles verbose hints.
- `7e54d29` — scroll percent dropped (operator call: reads 100% all day on
  short docs = noise).
- `fb2cc16` — swapped to **identity left, affordance right**: badge +
  `folder/file` lead at the glance position, `? help` trails.

## Key learnings (anti-doom-loop material)

1. **The NO_COLOR parity invariant is the valve.** "Plain output is the
   colored output minus escapes, identical line breaks" caught TWO contract
   violations mid-pass that eyes would have missed: backticks stripped in
   truecolor only (Pass B), URL dropped in none-mode (Pass C). Any change
   to *what content is emitted* must be applied to both modes or parity
   breaks.
2. **Two Glows, one name.** glamour `DarkStyleConfig` (ANSI-256) vs glow CLI
   (Dracula truecolor). The reference is the CLI at the terminal. ADR-006's
   sourcing error propagated into every palette defect.
3. **Don't byte-capture chrome.** `script` fights glow's pager alternate
   screen; three attempts, two aborts = the doom-loop. Chrome specs come
   from the operator's eyes. ADR-007's "converge to Glow" governs rendered
   markdown, not TUI footer chrome.
4. **Rebuild before dogfood.** `~/.local/bin/okuda` is a symlink to the
   compiled binary; tests pass against source. After edits: `just build`.
5. **Verify bytes with the right grep.** `38;2;R;G;Bm` doesn't match
   `38;2;R;G;B;1m` (attribute after colour). A "missing" byte can be a
   pattern bug, not a stale binary — check before rebuilding.

## What's next (the tweak phase)

1. **ADR-006/007 amendments** — form agreed with operator: inline `~~strike~~`
   on the wrong claims at the point of read + `## Amendment (2026-08-24)`
   section before `## Related`. ADR-006: wrong sourcing, wrong colour claims
   ("near-white" strong/emphasis, "salmon" code), and the doc/code split at
   adoption (ADR table said near-white; shipped code was gold/yellow/green).
   ADR-007: emphasis divergence is now converged — no row needed.
2. **Brief 002 supersession notes** — "backticks preserved" row (Pass B) and
   the link row (OSC 8 → visible URL, Pass C). Same one-line palimpsest
   pattern as the H4-collapse note.
3. **ADR-007 divergence-table row for the `│` pipe** — kept by operator call;
   glow uses a `#6271a3` border bar. Ground it or revert.
4. **The `--no-color` valve** — make `none`-mode emit text attributes
   (italic/bold/strike) with no colour, so the audit diagnostic actually
   works. This is a contract change to brief 002's NO_COLOR parity
   ("plain text only") — deliberately not bundled with convergence.
5. **Tables revisit** — operator: "Glow has an edge in the layout but is
   deficient in the colour emphasis. We can revisit tables."
6. **H6 uniform-bold** — still flagged undecided in ADR-007.

## How to resume

```bash
cd /Users/petersmith/Dev/GitHub/okuda
just orient
td context td-52db41        # issue state
# this brief is the session state
```
