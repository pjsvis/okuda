# Decision: Glow is the visual reference; diverge only for an okuda thing

**Date:** 2026-08-24
**Status:** Accepted

## Context

okuda is being dogfooded side-by-side with Glow (glamour). Glow is the
calibrated baseline — the audience's eyes know it, and it is the tool
okuda exists to improve upon, not to ignore. The first dogfood pass
revealed drift: the Rosé Pine palette read washed-out (ADR-006) and H4+
headings collapsed to bare bold prose while Glow rendered them as styled
`####` headings. Both were cases where okuda had silently diverged from
Glow without an explicit grammar reason.

The risk of unprincipled divergence is a palimpsest: okuda accumulates
styling choices that are neither Glow-faithful nor grounded in the
closed grammar, and the viewer becomes a worse Glow rather than a better
one. The map drifts from every territory at once.

## Decision

**Glow (glamour dark) is the default visual reference.** okuda matches
Glow's rendering unless a element is one of okuda's explicit "things" —
a closed-grammar rule or origin-doc behaviour that *deliberately*
diverges. Each divergence must be grounded in a brief, ADR, or the
origin doc; ungrounded divergence is entropy.

The okuda things (the divergence set, maintained here as the living
registry):

| Thing | Ground | Behaviour vs Glow |
|------|--------|-------------------|
| Loose lists | origin doc, grammar | empty line between items regardless of source tightness (Glow: tight) |
| Soft returns honored | origin doc | `\n` is a hard break, no trailing-double-space tax (Glow: soft break) |
| Mermaid → ASCII pipe | origin doc, diagram brief | `mermaid` fences piped to `mermaid-to-md`, three-channel colour (Glow: raw fence) |
| Loose tables + grid header | table policy brief (amended 2026-08-24) | blank line between body rows (loose; Glow: tight grid) + `│` separators between header cells + full-content-width `─` bars top and bottom (Glow: box-drawing grid). Body rows keep a 3-space gutter (header-separator width, columns align). The header grid is the table-scan cue; the loose body is the okuda readability thing |
| Closed grammar | grammar | rejected elements (task lists, indented code, footnotes, images, raw/inline HTML) degrade silently to text, never error |
| Hard-wrap mandate | ADR-004 | wrap never delegated to the terminal |
| Two-level list cap | grammar | nesting beyond 2 flattens to continuation text |
| Visible `#` markers on all heading levels | this ADR | `#`×level prefix kept on H1–H6 (Glow: H1 gets a background bar, no marker) |
| H6 uniform-bold-purple | this ADR (operator call, 2026-08-24) | H6 keeps `######` + purple bold like H1–H5; glow drops H6 to green non-bold. Ground: H6 is rarely produced by the workflow, so the cost of diverging from glow is low and marker-rule uniformity (every heading level: purple bold) is simpler than reproducing glow's one-off green-non-bold |
| Blockquote `│` pipe colour | this ADR (operator call, 2026-08-24 convergence) | pipe rendered gray `#767676` `│`; glow uses a `#6271a3` border bar. The blockquote **text** matches glow (yellow-italic, Pass B) — only the pipe colour diverges |
| Emphasis colour | _(converged — no row needed)_ | ~~diverges~~ okuda now matches glow-CLI Dracula yellow `#f1fa8c` (converged 2026-08-24, ADR-006 Amendment). Recorded here as a non-divergence so a future agent doesn't re-flag it |

Anything not in this table matches Glow.

## First application: H4+ no longer collapses

The grammar table in `briefs/2026-08-22-brief-ansi-emission-and-closed-grammar.md`
specified "H4+ collapsed to bold paragraph." The origin doc scoped
headers to `#`–`###` but never mandated collapse as a closed-grammar
rejection — collapse was an ungrounded styling choice. Under this
decision, H4–H6 now render the Glow way: `#`×level marker + heading
colour (~~blue~~ purple, bold). The visible-marker thing (above) means H1 keeps its
`#` rather than Glow's background bar; H2–H6 match Glow's marker + ~~blue~~
purple bold, except H6 — Glow drops H6 to green non-bold; okuda keeps H6 ~~blue~~
purple bold for marker-rule uniformity (~~simplification, flagged for revisit~~ grounded as the H6 uniform-bold-purple thing; see the divergence table above).

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Glow-exact everywhere (no divergences) | Throws away okuda's reason to exist: loose lists, mermaid piping, the closed grammar. Glow is the floor, not the ceiling |
| Ignore Glow, tune freely | Loses calibration; colours and layout become unanchored opinion (the Rosé Pine washout was this failure mode) |
| Per-element ADR for each divergence | Ceremony tax; the principle needs one ADR, divergences are tracked in the table above and grounded in existing briefs/docs |
| Keep H4 collapse as "a thing" | Not grounded in the origin doc or grammar as a *rejection*; was a styling default. Promoting it retroactively to "a thing" would be rationalising drift, not principled divergence |

## Consequences

**What became easier:**
- Dogfood comparison is now the test: render the same file in Glow and okuda; differences should each map to a row in the divergence table or be a bug
- New styling decisions have a default answer (Glow) and a bar to clear (name the thing, ground it)
- The divergence set is auditable in one place — a future agent can see exactly where okuda intentionally parts from Glow

**What became harder:**
- The divergence table must be maintained; a divergence not listed is drift by definition
- Glow's own evolution does not auto-propagate; "match Glow" is a manual intent, not a live sync (same constraint as ADR-006's palette coupling)
- ~~H6 uniform-bold is a deliberate simplification of Glow's green-non-bold; flagged here as the one heading-level judgement call~~ H6 uniform-bold-purple is now grounded in the divergence table (operator call, 2026-08-24: H6 is rare, uniformity is simpler); no longer flagged

**Constraints this imposes:**
- **Every divergence needs a ground.** A styling choice that matches neither Glow nor a row in the divergence table is a defect, not a feature. Fix it toward Glow or name the thing.
- **The divergence table is the living registry.** Adding a row requires citing the ground (brief/ADR/origin doc). Removing a row (converging back to Glow) is always allowed and needs no ADR.
- **Glow is the reference, not the spec.** okuda does not vendor glamour's styles.go; the palette is hand-translated truecolor (ADR-006). Visual parity is the intent, measured by eye at dogfood, not by byte-equality with glamour.

## Palimpsest check (reversal of the H4-collapse grammar rule)

The H4+ collapse was a single branch in `src/render.ts`'s `heading`
handler, exercised by one test (`H4+ collapses to bold paragraph`) and
demonstrated in `docs/showcase.md`. The reversal:

- **Orphaned:** the `if (level <= 3)` branch and its "collapse to bold
  paragraph" comment — removed.
- **Shared:** the `heading` handler itself, the showcase's H4 section, the
  render test — updated in place.
- **Valid:** the heading role colour (~~`#00afff`~~ `#bd93f9` Dracula purple — converged 2026-08-24, see ADR-006 Amendment), the visible-marker
  rule, the wrap path — unchanged.

No ghost of the collapse remains. The grammar table entry in brief 002
is superseded by this ADR (pointer added to the brief's supersession
note); the brief's text is otherwise frozen.

## Related
- Brief: `briefs/2026-08-22-brief-ansi-emission-and-closed-grammar.md` (grammar table H4-collapse row — superseded by this ADR)
- Brief: `briefs/2026-08-20-origin-doc.md` (the origin-doc things: loose lists, soft returns, mermaid pipe)
- Brief: `briefs/2026-08-23-brief-table-rendering-policy.md` (loose-table thing)
- Brief: `briefs/2026-08-23-brief-diagram-colour-classification.md` (mermaid three-channel thing)
- ADR: `decisions/004-hard-wrap-mandate.md` (hard-wrap thing)
- ADR: `decisions/006-glow-dark-palette.md` (palette: the first Glow-alignment)
- External: [charmbracelet/glamour](https://github.com/charmbracelet/glamour) `DarkStyleConfig`
