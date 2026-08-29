---
type: ADR
callsign: ADR-DIAGRAM-BORDERS-008
---

# Decision: Diagram borders are blueline, not recessive

**Date:** 2026-08-25
**Status:** Accepted

## Context

Brief 003 (`briefs/2026-08-23-brief-diagram-colour-classification.md`)
established the three-channel diagram colour scheme: border (recedes),
arrow (leads), text (foregrounds). The principle was "borders recede —
structure, not content," and the okuda palette's `diagram-border` was
set to `#6688aa` (muted slate), deliberately pushed back so the eye
would land on content and flow.

This remained a nagging issue through multiple dogfood passes. The
diagram's topology — the boxes and connectors that define the state
machine or flowchart — was hard to trace. The muted slate read as
neither blue nor receded; it was present enough to notice but recessed
enough to be indistinct. The shape of the diagram, which is the point of
a structural diagram, was not legible. The brief's principle conflated
two things that should be separated.

## The blueline distinction

Blueline is the diazo reprographic process — blue lines on white paper,
the successor to blueprint, standard in the 1980s for engineering
drawings and seismic sections. A seismic section is a data diagram of
extreme density: hundreds of wiggle-trace plots stacked to show a
cross-section of the earth's subsurface. The geophysicist traces
continuous horizons *by eye* across that field, under time pressure, to
pick where to drill. Legibility is not aesthetic; it's economic. The
blue line *is* the data; it does not recede.

The brief's "borders recede" principle conflates:

- **Ornamental borders** — a box that decorates a label. These should
  recede.
- **Structural lines** — the connectors and rails that define topology.
  These should be visible as the blueline, because the topology is the
  information.

A mermaid diagram's borders are structural, not ornamental. The boxes
and connectors are the shape; the shape is the point. Receding them
defeats the diagram's purpose — the layout defeats its own function, the
bear trap applied to diagrams.

## Michael Okuda's approach (the source of the principle)

Returning to Okuda's original work (the Okudagram, TNG 1987 onward):

- **Blue as the primary structural/display colour.** The main LCARS blue
  is the dominant field; structural elements read in blue.
- **Amber/orange for active elements, alerts, the accent channel.**
- **Thin, flat, geometric lines.** No faux-3D, no decorative weight.
- **Integrated text labels in a grotesque sans.**
- **Readable at a glance** — the shape before any label.

This maps to the three channels: structure (boxes, connectors) = blue;
flow (arrows) = amber; content (node labels) = cream/high-contrast. The
arrow and text channels were already Okuda-faithful. The border channel
drifted: muted slate instead of a definite blue. The blueline principle
corrects it — the structure becomes a definite, restrained blue, present
as the shape without competing with the amber flow.

## Decision

**Diagram borders are blueline — a definite, restrained blue — not
recessive gray.** The `diagram-border` role in the okuda palette shifts
from `#6688aa` (muted slate) to `#5e8bbf` (blueline blue): definitely
blue (the structural colour), not loud (not competing with amber
arrows), readable as a line (the topology traces cleanly).

The default palette's `diagram-border` stays `#585858` (glow-parity
monochrome — no diagram colour). The blueline is an okuda-palette
affordance, layered on top of the glow-parity default, same as the code
panel and the heading badge. Two palettes, two diagram philosophies,
both coherent.

The principle, generalised: **structural lines are visible as blueline;
ornamental lines recede.** This is the reusable rule, not the hex value.
Future diagram elements are classified by asking "is this structural or
ornamental?" — structural gets blue, ornamental gets muted.

## Amendment to brief 003

The "borders recede — structure, not content" rationale in brief 003's
Palette section is superseded by: "borders are blueline — structural
lines visible as a definite blue, not recessed. The topology is the
information; receding it defeats the diagram." The three-channel scheme
(border / arrow / text) is unchanged; only the border channel's
justification and colour are sharpened.

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| Keep `#6688aa` muted slate | The nagging issue. Topology indistinct; the shape doesn't read. Conflates structural and ornamental. |
| Bright blue (`#3399ff`) | Too loud — competes with amber arrows, breaks the three-channel hierarchy. Blueline is restrained, not shouting. |
| Match the default's `#585858` in the okuda palette | Abdicates the okuda identity layer. Diagrams in the okuda palette should be blueline; diagrams in the default stay monochrome (glow parity). |
| Per-node-type colouring | Tips into decoration; three channels is the semantic minimum (brief 003). |

## Consequences

**What becomes easier:**
- Diagram topology traces cleanly in the okuda palette — the shape reads
  before any label, which is the LCARS "readable at a glance" property.
- The three-channel hierarchy is sharper: blue bones (structure), amber
  flow (arrows), cream labels (content). Each channel has a distinct
  hue, no overlap.
- The principle generalises: future diagram elements classify as
  structural (blue) or ornamental (recede).

**What became harder:**
- The border is now more present, which could compete with prose
  rhythm if a diagram sits in a dense document. Dogfood will tell; the
  restraint in `#5e8bbf` is the hedge.

**Constraints:**
- The blueline is an okuda-palette affordance only. The default stays
  monochrome (glow parity). Anyone switching palettes sees two diagram
  philosophies, by design.
- Brief 003's border rationale is amended (pointer above); the brief's
  three-channel scheme stands.

## Related

- Brief: `briefs/2026-08-23-brief-diagram-colour-classification.md` (three-channel scheme; border rationale amended here)
- ADR: `decisions/007-glow-visual-reference.md` (the mermaid → ASCII pipe + three-channel colour is a divergence row)
- ADR: `decisions/006-glow-dark-palette.md` (palette sourcing)
- Brief: `briefs/2026-08-25-brief-okuda-palette-and-chrome.md` (the okuda palette preset)
