# Decision: Glow (glamour) dark palette as the default

**Date:** 2026-08-24
**Status:** Accepted

## Context

Brief 002 (`briefs/2026-08-22-brief-ansi-emission-and-closed-grammar.md`)
specified the default palette as **Rosé Pine Base** — a muted, desaturated
set (lavender headings `#e0def4`, pink strong `#ebbcba`, amber emphasis
`#f6c177`, cyan links `#9ccfd8`). The renderer shipped with it; all
contract tests pinned the byte-exact SGR sequences.

On dogfooding (`just showcase`, `just help`) the palette read as washed-out:
headings were a light white-lavender that failed the "high-contrast,
functional" Okuda principle. Colour was present but carried no signal load
— the very thing the origin doc warns against (Glow's "monochromatic
visual noise," just at lower saturation). The map had drifted from the
territory: a muted palette is decoration, not function.

## Decision

Replace the Rosé Pine defaults with a palette sourced from **glamour's
`DarkStyleConfig`** (ANSI-256 → truecolor hex), the scheme Glow ships with
and the one the target audience has calibrated their eyes to.

| Role | Hex | Source (glamour dark) |
|------|-----|----------------------|
| heading | `#00afff` | 39, bright blue — the signature Glow header |
| strong | `#d7d7d7` | 252, near-white — bold distinguishes, colour does not |
| emphasis | `#d7d7d7` | 252, near-white — italic distinguishes, colour does not |
| code-text | `#ff5f87` | 203, salmon |
| code-background | `#303030` | 236, dark gray |
| link | `#00af5f` | 35, sea green — underlined via OSC 8 |
| blockquote | `#767676` | 243, gray — the pipe recedes |
| muted / rule | `#585858` | 240, dim gray — glamour horizontal rule |
| table-header | `#00afff` | aligned with headings (okuda semantic layer) |
| table-key | `#ffff87` | 228, glamour H1 pale yellow |
| diagram-border | `#585858` | reuses muted |
| diagram-arrow | `#00af5f` | reuses link green |
| diagram-text | `#d7d7d7` | reuses doc near-white |

Strong and emphasis deliberately collapse to the same near-white — that
is authentic glamour: bold/italic is the distinction, colour is not. The
semantic load concentrates where it carries signal: headers (blue),
code (salmon on gray), links (green), structure (dim). Diagrams have no
glamour equivalent; their three channels reuse the new palette so the art
reads as part of the document.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Keep Rosé Pine Base | Washed out on dogfood; headings indistinguishable from body; failed the high-contrast Okuda principle the project is named for |
| Hand-tune a custom palette | Colours are hard; a bespoke scheme invites endless fiddling with no external anchor. Glow is a known, widely-calibrated scheme — start from it, diverge only with reason |
| Full CommonMark-style multi-theme system | Out of scope (origin doc: no themes); one default + override file is the contract. Benchmaxxing colour schemes is entropy |
| Keep Rosé Pine, brighten headings only | Incoherent — a bright heading against muted body reads as two documents stitched together. A palette is a system, not a flag |

## Consequences

**What became easier:**
- Headings carry signal again — the blue is the structural scan path Glow users already know
- Strong/emphasis/code/link each occupy a distinct channel; the reader's eye finds structure without reading
- Diagram channels reuse document roles (border=muted, arrow=link, text=doc), so mermaid art reads as part of the prose, not a foreign panel
- The override file (`~/.config/okuda/palette.json`) remains the escape hatch — operators who want Rosé Pine back can restore it per-machine without code changes

**What became harder:**
- The palette is now coupled to an external project (glamour). A glamour palette revision does not auto-propagate, but the *intent* — "look like Glow" — is now explicit and must be maintained by hand if glamour shifts
- Strong and emphasis are near-white; in terminals with poor italic rendering, the bold/italic distinction is the only signal. Acceptable on the target (truecolor + modern terminal) but weaker on degraded displays
- Reviewers familiar with Rosé Pine defaults must recalibrate; the byte-exact contract tests were retuned (the sequences are still byte-exact, just to new values)

**Constraints this imposes:**
- **`DEFAULT_PALETTE` in `src/palette.ts` is the single source of truth.** The contract tests assert its values byte-exactly; any palette change retunes those tests in the same commit. No other file may hardcode palette hex.
- **Diagram roles reuse document roles, not introduce new ones.** If a future diagram channel needs a distinct hue, it must justify why the existing channels fail first — the three-channel classification (border/arrow/text) is the grammar, not the colour.
- **Re-evaluation trigger:** if a future brief establishes okuda's own visual identity (e.g. an Okuda/LCARS-inspired palette grounded in the origin doc's functional-colour doctrine), this ADR is superseded. Until then, Glow-dark is the floor.

## Palimpsest check (reversal of brief 002's palette)

The Rosé Pine palette was a single source of truth (`DEFAULT_PALETTE` in
`src/palette.ts`), consumed only through the `Styler` role API. The swap
left no orphaned code:

- **Orphaned:** none — no Rosé-Pine-specific helpers, constants, or
  branches existed; the palette is a plain `Record<Role, string>`.
- **Shared:** `DEFAULT_PALETTE`, the `Styler` API, the override loader —
  all role-keyed and palette-agnostic; updated in place, still live.
- **Valid:** the role set itself (`heading`, `strong`, `emphasis`,
  `code-text`, `code-background`, `blockquote`, `link`, `muted`,
  `table-header`, `table-key`, `diagram-border`, `diagram-arrow`,
  `diagram-text`) is unchanged; only the hex values moved.

The contract tests (`tests/ansi-palette.test.ts`,
`tests/render.test.ts`, `tests/table-diagram.test.ts`, `tests/wrap.test.ts`)
were retuned to the new byte-exact SGR sequences in the same commit. No
ghost of the old palette remains in the tree.

## Related
- Brief: `briefs/2026-08-22-brief-ansi-emission-and-closed-grammar.md` (Rosé Pine defaults documented here — superseded by this ADR)
- Brief: `briefs/2026-08-23-brief-diagram-colour-classification.md` (diagram three-channel classification — roles unchanged, colours retuned)
- Playbook: `playbooks/justfile-playbook.md` (dogfood flip surfaced the contrast problem)
- External: [charmbracelet/glamour](https://github.com/charmbracelet/glamour) `DarkStyleConfig`, `styles.go`
