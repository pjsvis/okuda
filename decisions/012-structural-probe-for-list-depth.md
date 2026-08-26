# Decision: List nesting depth comes from a structural probe render, not counters or re-wrapping

**Date:** 2026-08-27
**Status:** Accepted

## Context

ADR-004's invariant — every emitted line ≤ `stdout.columns` display columns,
okuda owns every `\n` — was violated by list composition. `renderList` wraps
item text at `avail`, then composition shifts the block right **after**
wrapping: item continuation `+2` and the parent's `LIST_INDENT` `+2` per
level, unbudgeted. Nested (level-1) lines landed up to 2 columns past the
terminal edge (6 on the cap-flattened third level), and the terminal's
soft-wrap — invisible to okuda — tore the loose list apart. Found rendering
`briefs/2026-08-27-brief-artpack-aesthetics.md` at assorted widths.

The fix needs each list's nesting depth **at wrap time**. But ADR-005's
protocol is post-order with string-in/string-out callbacks: a nested list's
callback fires *before* its parent's. Depth is top-down information; in a
single post-order pass it cannot reach the child.

## Decision

`renderDocument` runs a **structural probe pre-pass**: one extra
`Bun.markdown.render` with the `list` handler swapped for identity tags
(`PB:<n>`). Each probe call records which descendant tags its children
contain; containment plus post-order gives `parentOf` (the *nearest later*
container is the immediate parent — ancestors fire after descendants, and
the minimum index beats every grandparent), and the ancestor chain gives
depth. The real render then consumes depths **in identical call order**
(same source, same parser → deterministic sequence), and `renderList`
budgets `avail = width − 4·depth − textCol − LIST_INDENT`.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Depth counter in `Ctx`, incremented by the `list` handler | Post-order defeats it: the child renders before the parent increments. Reads 0 at every nesting level — the obvious fix that silently doesn't work |
| Parent re-wraps child blocks at reduced width after detecting `NL:` tags (the `quoteBlock` approach) | Avoids the second parse but must re-wrap already-rendered blocks — marker prefixes, blank lines, RAW-protected art — doubling the wrap paths and their failure surface |
| Wrap everything at worst-case depth budget | Steals columns from every top-level document to fund the rare nested one; changes every existing wrap expectation |
| Emit long lines, let the terminal soft-wrap | Rejected outright by ADR-004 — the invariant this decision exists to enforce |

## Consequences

**What became easier:**
- ADR-004 holds through composition layers, and is now *tested* there: the
  nested and flattened-depth invariant tests fail on the pre-fix code.
- Depth is available to future list features (per-depth marker shaping,
  tighter caps) without further protocol surgery.

**What became harder:**
- Two parses per document (probe + render). The probe is pure string work —
  Mermaid never re-spawns (`ctx.mermaid` is pre-populated before the probe);
  measured cost is negligible at document scale, but TUI re-render paths pay
  it on every resize.

**Constraints this imposes:**
- **Call-order determinism:** probe and render must see identical `list`
  call sequences. Same source + same parser version guarantees it; a future
  bun reordering callbacks would misalign depths. Symptom is a width
  regression (the `?? 0` fallback), not corruption — and the invariant tests
  catch it.
- **Probe side-effect discipline:** the probe runs *all* handlers, not just
  `list`. Today every other handler is side-effect-free or reads
  pre-populated state (Mermaid map, table state self-resets), so the probe
  is safe by construction — but any future handler with external side
  effects (writes, counters, spawns) must be gated on `ctx.listProbe`.

## Related

- ADR: `decisions/004-hard-wrap-mandate.md` (the invariant being enforced)
- ADR: `decisions/005-render-engine-string-protocols.md` (the post-order
  string protocol that forces the probe)
- ADR: `decisions/007-glow-visual-reference.md` (soft-return stripping —
  what makes the re-wrap alternative semantically viable but no less complex)
- td: td-6aa648 (fix + invariant tests)
