# Concepts and terms — the vocabulary of the silo

> Status: **aligned**. Read this whenever a word on another page is
> unfamiliar. Every term gets a one-line definition and a pointer to the
> longer story. The order is roughly the order a newcomer meets them.

## The silo

A **silo** is a repository that behaves like a knowledge base: plain
markdown files, organised into compartments, rendered beautifully. This
repository — okuda — is one. A silo is just files on disk; any editor,
any machine, any decade can read it. That is deliberate, and it is the
reason nothing here holds your knowledge hostage.

## okuda and gloam

**okuda** is the renderer: give it a markdown file, and it draws the
document in your terminal — colours, tables, diagrams, the works.

**gloam** is the finder: it shows a list of documents, you pick one, and
it opens in okuda. They are the same binary — the name you type decides
the role (`docs/2026-08-20-origin-doc.md` explains why).

## The okudagram

An **okudagram** is a composed screen: the document as okuda has laid it
out for your current terminal width — headings anchored, tables fitted,
diagrams drawn. Not a scroll of text; a page. The word comes from the
early design notes, and its values are *on screen now* (what you see is
composed for this moment) and *tied to the mast* (a screen that stays
put while you study it).

## Callsigns

A **callsign** is a short, stable, human-friendly name for one document
— like `BRF-BUTT-DIAL` — written in the document's front matter. Say it
on a phone call, jot it on paper, type it to gloam: it always finds the
same document, even after the file is renamed. The rule that makes them
trustworthy: a callsign appears in exactly one place, the front matter
of the document it names.

## Jump tokens

**Jump tokens** are the two-digit numbers you see beside rows in index
pages (`&briefs`, `&next`). Type the digits and you jump to that row's
document. Unlike callsigns, they are **ephemeral** — session codes that
die with the page. Callsigns are for next week's phone call; jump tokens
are for right now.

## The & family

Files starting with `&` — `&alpha`, `&briefs`, `&next` — are **vector
tables**: hand-built pages of links and jump wires that always sort to
the top of any file list. They are the silo's home screens: orientation,
state, decisions. Anyone (human or AI) can author one; they are plain
markdown with invisible wiring.

## The ledger

The **ledger** is the set of registered compartments that record how the
silo thinks:

- `briefs/` — *what will we build?* (intent, before code)
- `decisions/` — *why did we choose this?* (each with its rejected
  alternatives)
- `debriefs/` — *what happened when we built it?*
- `playbooks/` — *how do we do this?* (procedures, for agents)

Together they are the reason the same debate never happens twice, and
the reason a newcomer — human or AI — can reach full speed in one
session. Internally: **the ledger is the moat.**

## The diagram tool

Write a **mermaid** fence; okuda draws it as ASCII art in the terminal.
Five diagram families, honest size limits, no browser ever required.
See [the diagram tool](the-diagram-tool.md).

## SSH

The silo over the network: a terminal on any device, no install, the
same rendering. Some of this is working, some is on the drawing board —
see [SSH](ssh.md) for the honest state.

## States

Documents in this silo have lifecycles. A foreign draft lands *fresh*,
gets checked against the house rules (*reconciled*), and settles in
(*aligned*) — the status is stamped in its opening note. You will spot
the pattern on any recent document's first lines.
