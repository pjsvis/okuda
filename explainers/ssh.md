# SSH — the silo on any device

> Status: **aligned**. Human-facing explainer. Some of what this page
> describes ships today; the parts still on the drawing board are marked
> honestly.

## The idea

A silo is just files on disk, and the terminal is just characters on a
grid. Put those two facts together and something pleasant falls out:
**you do not need to install anything to read the silo from somewhere
else.** Any device with an SSH client — a laptop, an iPad with a
keyboard, a phone with a terminal app — can attach to the machine where
the silo lives, and the whole experience arrives intact: the rendering,
the colours, the diagrams, the navigation.

This is the **gopher model** of publishing: a server serves documents; a
dumb, universal client renders them. No app store, no web framework, no
synchronisation. The connection *is* the app.

## What works today

- **Any SSH server** can already serve the raw silo: connect, and the
  files are there, readable with any pager or editor. The plain-markdown
  rule (see [the terminal](the-terminal.md)) is what makes this work —
  the corpus never depends on a specific viewer.
- **A feasibility study is on file** for serving *gloam* itself over SSH
  — connecting to a remote machine and getting the full finder-and-
  reader experience, with the rendering happening on the far side. The
  engineering answer (an OpenSSH `ForceCommand` — the server runs gloam
  the moment you connect) is worked out and recorded; it is a build, not
  a mystery. See the debrief from 2026-08-27.

## What is coming

- **The served feed** — connecting to a named endpoint and getting a
  curated, navigable reading surface (the blog-feed brief).
- **Rich deep links** — connecting *into the middle* of the experience:
  a link that opens a specific document, at the right place, on any
  device.
- **The identity question** — who is connecting, with which key, and
  what may they see. The gate here is deliberate: this waits for a
  *named* consumer (a real colleague, a real use) rather than being
  built for an imagined one.

## Why this matters more than it sounds

The terminal-over-SSH story is the reason the silo insists on plain
markdown, one binary, and no dependencies. Every one of those choices
makes the remote case easier: there is nothing to install on the far
device, nothing to synchronise, nothing to break when the network is
slow. The silo is designed so that **the connection is the only
requirement** — and connections are the one thing every device already
has.

## Try it today

If the silo lives on a machine you can reach:

```bash
ssh your-machine
cd path/to/okuda
./okuda "&alpha"
```

That is the whole tutorial. The experience is the one you know — on
whatever screen is in front of you.
