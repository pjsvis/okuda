# okuda — a Leith §criptorium & Bond instrument

L§AB

LEITH §CRIPTORIUM & BOND

A terminal markdown viewer built on `Bun.markdown` and compiled to a single binary. Named for Michael Okuda — high-contrast, functional, uncluttered.

## Why

Glow enforces CommonMark tight-list rules that collapse list items, ignores soft returns, renders Mermaid diagrams as raw code fences, and draws cramped tables. 

In an agentic paired-terminal workflow (agent on the left, live preview on the right), list-heavy execution plans and markdown state diagrams need legible, immediate ASCII rendering.

`okuda` renders what your workflow actually generates:

* **Loose lists** — an empty line between items regardless of source tightness
* **Soft returns honored** — line breaks without trailing double spaces
* **Mermaid → ASCII** — ```mermaid fences piped to the `mermaid-to-md` Rust CLI
* **Loose tables** — semantic color, breathing room, no box-drawing fatigue
* **Your terminal's ink** — okuda sets no body colour; a measured set of
  foreground/background pairs to try is in
  [docs/2026-10-28-the-ground-you-read-on.md](docs/2026-10-28-the-ground-you-read-on.md)
* **Terminal-width wrapping** — bypassed on raw ASCII diagrams
* **Zero runtime deps** — a single `bun build --compile` executable

## Operating principle

**okuda renders markdown. The environment does everything else.** Three concerns, three owners:

1. **Compositing** (where the text comes from) — the environment's job. A filesystem, a chat, an agent's stream, another human's keystrokes. okuda doesn't care.
2. **Windowing** (where the text appears) — the host's job (Herdr opens tabs; okuda carries no window manager).
3. **Rendering** (markdown in, coloured bytes out, fast) — okuda's whole job.

The filesystem is the message bus; any tool that writes markdown to a file is already okuda's compositor, by accident, without an API. *We don't care where the text comes from* is not a deferral — it's the moat: the widest possible integration surface, at negative code cost. The test for any future "should we build X": if X touches the byte stream's *origin*, it belongs to the environment; if X touches the screen before the byte stream, it's okuda's.

## Status

L§AB — the Leith Scriptorium & Bond. Pre-implementation instrument. Design source: [docs/2026-08-20-origin-doc.md](docs/2026-08-20-origin-doc.md) — the *what*. Design rationale: [docs/2026-08-23-why-okuda-derrida-gate-foxtrot-oscar.md](docs/2026-08-23-why-okuda-derrida-gate-foxtrot-oscar.md) — the *why* (the Derrida gate, the Foxtrot Oscar, and the ventilator).

## Related silos

okuda is one of three silos, and each names the others without linking into them:

- **Blandings** — the speech play: the house voices Moira and Moir, the library,
  the elocution playbook, the tuning. Entertainment, not rendering.
- **speak-md** — the pipe: the flattener that turns markdown into speech-safe
  prose. okuda calls it for a recital; it owns no prose.

The boundaries are real: they reference by name, never by link. The filesystem
is the message bus, and a crossing is a copy the receiver commits, declared
(`docs/2026-10-10-the-seam.md`).

## Repository Layout

This repo is a **silo** — external tool dependencies are inventoried in [`DEPENDENCIES.md`](DEPENDENCIES.md).

One directory here is not okuda's: `packages/testcard/` publishes
[`@polyvis/testcard`](https://www.npmjs.com/package/@polyvis/testcard), the surface
conformance card. Its source is `scripts/tty-card.sh`, copied into the package at
pack time so that git keeps the only copy anyone edits. The account of what it
measures, and what it replaced, is
[`docs/2026-11-02-the-instrument-card.md`](docs/2026-11-02-the-instrument-card.md).

```bash
just help     # workflow guide
just orient   # current state
just check    # quality gate
```

---

*L§AB* — Leith Scriptorium & Bond
