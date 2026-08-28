# Brief: jump-demo honesty — slug derivation + state-glyph signal

**Created:** 2026-08-28
**TD:** td-okuda-jump-demo-honesty
**Status:** open

## What

`just jump-demo` (scripts/jump-demo.ts, the menu compositor for
index-and-jump) tells two lies against the style guide it dogfoods. Fix
both so the demo stops contradicting the vocabulary it exists to
demonstrate.

## Why

The demo is the canonical ephemeral document — "they have no content
depth to hide behind, so their look *is* their legibility"
(style-guide.md). A demo that decorates rather than signals teaches the
wrong thing. Two failures:

1. **Slug lie.** Item 06 renders the filename stem
   `011-zero-notification-stillness-and-decoupled-inbox-watchers` as a
   title. The brief's `# ` heading is `decision: 011-…` (lowercase,
   colon-joined), and `stripClass` only strips `Brief:`/`Decision:`
   before a colon — it doesn't handle the `decision: 011-` stem form
   (lowercase, numeric-prefixed). The readable name ("Zero-notification
   stillness…") is buried under a registry stem. The menu emits
   decorated Stuff.
2. **State-glyph lie.** The closing key declares `☐ open · ⋮ parked ·
   ✗ rejected · ✓ accepted` but no line carries a glyph. Viewport-padding
   is **Rejected** (its own `**Status:** Rejected` line) yet renders
   identical to open briefs. "Glyphs held in reserve" is the exact
   decoration the style guide warns against: "a mark that distinguishes
   what structure alone cannot is perception for free" — a key promising
   a vocabulary the menu never uses is entropy.

## How

- **Slug:** extend `stripClass` (or add a normaliser) to strip the
  `decision: NN-` / `brief: NN-` stem form — the numeric sequence prefix
  a registry filename carries. The slug is the descriptive title; the
  number sequence belongs to the jump token (RHS), not the slug.
  Verify against item 06 (the only stem-form heading today) and the
  `Brief: …` / `Decision: …` colon forms already handled.
- **State glyph:** apply the lexicon to lines with real variance. The
  demo pulls from `briefs/2026-08-28` + one rejected outlier; the
  outlier's status is already derivable from its `**Status:**` line.
  Either (a) prefix the rejected item with ✗ and keep the key, or (b)
  if the live set has no variance, drop the key entirely. The honest
  move is (a): the demo *has* variance (one rejected among opens), so
  show it.

## Acceptance criteria

- Every demo line's slug is a descriptive title, never a filename stem.
  Item 06 reads "Zero-notification stillness…", not "011-zero-…".
- The rejected item carries ✗; the key stays because the menu now uses
  the vocabulary it declares.
- `just check` green; the jump-demo's existing tests (if any) updated to
  pin the slug + glyph behaviour.
- No change to the jump mechanics (`extractJumps`, RHS token) — this is
  the compositor, not the resolver.

## Out of scope

- Generalising the demo beyond 2026-08-28 briefs (the silo dashboard is
  `2026-08-25-brief-registry-markdown-browser.md`).
- Wiring the callsign column (td-bdfce0).
- New menu patterns — fix the lies, don't add features.

## Related

- `scripts/jump-demo.ts` — the compositor.
- `docs/style-guide.md` — "the menu pattern: ephemeral documents."
- `briefs/2026-08-28-brief-index-and-jump.md` — the jump mechanics
  (untouched here).