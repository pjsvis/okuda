# The terminal — why this silo lives in the glass

> Status: **aligned**. Human-facing explainer. If you have never worked
> in a terminal, start here: nothing on the other pages makes sense
> without this one.

## What the terminal is

The terminal is the text screen: a window (or a whole phone, over SSH)
where programs talk to you in characters. No buttons, no icons, no
scroll-capturing overlays — just a grid of characters, each one
addressable, each one yours.

That sounds like a limitation. It is actually the oldest and most
durable interface in computing: every machine you will ever log into has
one, it works over the slowest connection, and it will still work in
twenty years. The web changes its frameworks every eighteen months; the
terminal grid has not changed since the 1970s.

## What okuda does with it

okuda takes a markdown document and *composes* it into that grid. Not
just prints — composes:

- **Colours with intent.** Headings, links, code, and state flags each
  get a colour from a small, fixed palette. Colour is meaning here, not
  decoration.
- **The renderer owns layout.** Lines are wrapped by okuda itself, never
  left to the terminal's whims — so a document looks the same at any
  width, and wide content is trimmed neatly instead of folding into
  soup.
- **Tables fit the glass.** Narrow the window and the tables re-fit,
  prioritising the columns that matter, rather than starving.
- **Diagrams draw themselves.** A mermaid fence becomes ASCII art — see
  [the diagram tool](the-diagram-tool.md).
- **Chrome appears only when it acts.** Hints, footers, and state
  markers show up when they mean something and vanish when they don't.

## Next

| Open |
|---|
| [Concepts and terms](explainers/concepts-and-terms.md) — the vocabulary, defined before it is used  |

## Why this beats a web page for a knowledge base

Three reasons, in descending order of stubbornness:

1. **It is everywhere.** The same document renders on a MacBook, on an
   iPad over SSH, and on a server in another country — with no install
   and no internet beyond the connection itself.
2. **It is fast.** The whole renderer is one binary. There is no
   framework to load, no bundle to download, no spinner between you and
   the answer.
3. **It is calm.** The mouse is optional. The keyboard does everything:
   two digits to jump, one letter to move, one word to search. Your eyes
   stay on the content, because the content is the interface.

## The one rule worth remembering

The terminal is a grid of characters, and okuda is a compositor: it
decides exactly which character goes where. Everything strange and
wonderful about the silo — diagrams from text, tables that survive
narrow windows, documents that look the same on any machine — comes from
that single decision: *the renderer owns the glass.*
