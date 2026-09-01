# The diagram tool — how okuda draws mermaid fences

> Status: **aligned**. Human-facing explainer — plain names, no callsign
> (explainers/ is unregistered by design). The agent-side procedure
> lives in `playbooks/mermaid-diagrams-playbook.md`; this page explains
> the same machine for people.

Write a mermaid code fence in any document in this silo, and okuda draws
it — right there in the terminal, as ASCII art. No browser, no image
export, no plugin. The diagram appears between the paragraphs, drawn
from the same characters that would open a web page somewhere else.

## What kind of diagrams work

Five families, today:

- **Flowcharts** (`flowchart` or `graph`) — boxes, arrows, decisions.
  Subgraphs become grouped regions.
- **State diagrams** (`stateDiagram`) — machines and their modes.
- **Class diagrams** (`classDiagram`) — types and their relations.
- **Entity–relationship diagrams** (`erDiagram`) — data and its keys.
- **Sequence diagrams** (`sequenceDiagram`) — who talks to whom, in
  what order.

Anything else (gantt charts, pie charts, mindmaps) doesn't draw — the
document shows the mermaid source instead, under a small
`mermaid: <type>` label. That's the tell: if you see your source, the
tool didn't recognise the type. Fix the type line, and the diagram
appears.

## How big can a diagram be?

The renderer is deliberately bounded, because ASCII art on a terminal
has honest limits:

- Keep **under about 30 nodes**. The renderer won't break before 128,
  but legibility fades long before the hard limit — and past the cap,
  extra nodes are *dropped silently*, which is worse than ugly.
- Keep labels **short**: roughly 28 characters, up to 4 lines.
- Very large layouts refuse to compute at all and fall back to showing
  the source — never garbage, never a crash.

The one-line habit: **diagrams are sentences, not atlases.** If a
diagram needs more than a screen, split the document.

## Why ASCII?

Because the terminal is the one screen that is always available — over
SSH, on a phone, in a ten-year-old emulator, on the train. A diagram
that only renders in a browser doesn't survive the trip. The ASCII
version is also *greppable and diffable*: it lives in the same stream
as the text, and it survives every renderer, everywhere, forever.

## Try it

```bash
./okuda docs/2026-08-31-actuator-inputs.md
```

That document contains a state machine about halfway down. Find it,
narrow your terminal slowly, and watch the art hold its shape.
