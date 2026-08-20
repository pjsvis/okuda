# okuda

A terminal markdown viewer built on `Bun.markdown` and compiled to a single binary. Named for Michael Okuda — high-contrast, functional, uncluttered.

## Why

Glow enforces CommonMark tight-list rules that collapse list items, ignores soft returns, renders Mermaid diagrams as raw code fences, and draws cramped tables. In an agentic paired-terminal workflow (agent on the left, live preview on the right), list-heavy execution plans and markdown state diagrams need legible, immediate ASCII rendering.

`okuda` renders what your workflow actually generates:

* **Loose lists** — an empty line between items regardless of source tightness
* **Soft returns honored** — line breaks without trailing double spaces
* **Mermaid → ASCII** — ```mermaid fences piped to the `mermaid-to-md` Rust CLI
* **Loose tables** — semantic color, breathing room, no box-drawing fatigue
* **Terminal-width wrapping** — bypassed on raw ASCII diagrams
* **Zero runtime deps** — a single `bun build --compile` executable

## Status

Pre-implementation. Design source: [`docs/2026-08-20-origin-doc.md`](docs/2026-08-20-origin-doc.md)

## Repository Layout

This repo is a **silo** — external tool dependencies are inventoried in [`DEPENDENCIES.md`](DEPENDENCIES.md).

```bash
just help     # workflow guide
just orient   # current state
just check    # quality gate
```
