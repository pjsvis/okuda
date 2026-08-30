---
type: Brief
callsign: BRF-MERMAID-HARD
---

# Brief: Mermaid Rendering Hard Boundary State Machine (CSN Diagnostics)

**Date:** 2026-08-29[cite: 1]
**Status:** Open[cite: 1]

NOTE: CSN === Computer Says NO

---

## Objective

Implement a binary validation state machine in Okuda's Mermaid ASCII renderer that either renders clean diagram geometry ("Computer Says YES") or replaces the output with a telegraphic `CSN:` diagnostic block ("Computer Says NO") instead of wrapping, clipping, or displaying broken visual artifacts[cite: 1].

## Scope

**In:**
- Physical matrix width constraint check ($diagram\_min\_width > cols$) emitting `CSN: too wide`[cite: 1].
- Topological complexity limit check (node count, edge density, or layout matrix bounds) emitting `CSN: too complex`[cite: 1].
- Replacing the diagram viewport block with the standardized `CSN:` placeholder text[cite: 1].
- Preserving surrounding document rendering flow while skipping broken diagram rendering[cite: 1].

**Out:**
- Soft line wrapping, auto-scaling fonts, or dynamic ASCII compression heuristics[cite: 1].
- Interactive pan/zoom controls or viewport sliders inside the terminal matrix[cite: 1].
- Parsing or rendering diagrams outside the restricted Mermaid subset grammar[cite: 1].

## Preconditions

- [ ] Okuda Mermaid parser emits a deterministic layout bounding box ($width \times height$) and node/edge count prior to matrix drawing[cite: 1].
- [ ] Active terminal matrix dimensions ($cols \times rows$) are accessible to the rendering pipeline[cite: 1].
- [ ] Consider the the Okuda anchored reflow and any  jankiness implications in the seam between the CSN and CSY states.

## Work Plan

1. [ ] Implement a pre-render gate in Okuda that compares computed diagram layout dimensions against active terminal matrix column bounds[cite: 1].
2. [ ] Add a structural complexity gate evaluating total node and edge counts against the bounded-context limit[cite: 1].
3. [ ] Define standard `CSN:` diagnostic string templates for matrix boundary failures (`CSN: too wide`) and complexity violations (`CSN: too complex`)[cite: 1].
4. [ ] Wire the decision loop: if checks pass, emit the rendered ASCII grid; if any check fails, emit the single-line `CSN:` diagnostic block enclosed in standard delimiter markers[cite: 1].
5. [ ] Verify terminal resize events trigger immediate re-evaluation of the `CSN: too wide` gate without crashing the document session[cite: 1].

## Acceptance Criteria

* A Mermaid diagram whose rendered ASCII width exceeds current terminal columns renders `CSN: too wide` with zero line-wrapping or matrix corruption[cite: 1].
* A Mermaid diagram exceeding the node/complexity threshold renders `CSN: too complex` without attempting ASCII layout calculation[cite: 1].
* Resizing the terminal to exceed the minimum required width immediately clears `CSN: too wide` and renders the valid ASCII diagram on the next draw tick[cite: 1].
* Documents containing `CSN:` blocks continue to render all preceding and subsequent Markdown text sections normally[cite: 1].

## Notes

Constraints and failure modes:
- Never fall back to native terminal line wrapping for diagrams; wrapped ASCII art completely destroys character grid alignments[cite: 1].
- The `CSN:` output must be deterministic and plain ASCII to ensure screen readers and speech pipelines digest the failure state without reading fragmented line-drawing characters[cite: 1].