# The cahier — what it is, how to make one, and what it will not do

> Logged 2026-11-05. **Status: the reference record.** The *reading* version is
> `explainers/the-cahier.md` — narrative, why-first, for someone who has never
> heard of the silo. This one is the detail: the guarantee table, the cost
> table, the pipeline, the exclusions.
>
> **Two registers, one subject, and the division is deliberate** — the explainer
> is the living document a reader is sent to; this is the dated record of what
> was true on 2026-11-05. If the cahier changes, the explainer changes and this
> one does not, because a record that is edited is no longer a record. The
> guarantee table below is the exception: it is asserted by `just html-verify`,
> so it is a live claim and must be kept true.
>
> The name's reasoning is `docs/2026-11-05-naming-the-cahier.md`; the mechanism
> is `ADR-PANEL-NOT-DOOR-081`; the transfer lessons are
> `docs/2026-11-05-lessons-from-the-port.md`.

## What it is

**A cahier is one HTML file holding a document and its references, where the
references open in place and the reader is returned to exactly where they were.**

That is the whole of it. Everything below is a consequence.

| Property | What it means |
|---|---|
| **One file** | no assets, no fonts, no network. Email it, archive it, open it on a plane. |
| **Dereferenceable** | a reference opens a panel over the page; closing it returns you to the same scroll position |
| **One level** | a panel's own references are inert. The bound is the design, not a limitation. |
| **Addressable** | `cahier.html#ref-27` opens a specific reference. A blog post can link to one. |
| **No history pollution** | opening and closing a reference adds no browser history entry. The state is *the document, or one of its references* — not a list of pages. |
| **Self-describing** | a byline from the document's own front matter, a provenance line, and a sticky chrome naming whichever document you are inside |

## Why you would want one

**A claim with its evidence attached, in one object.** That is the use case, and
the rest are variations:

- **A blog post's evidence.** The post makes the claim; the cahier holds the
  documents behind it. The reader checks without leaving, and without a network.
- **A record.** `decisions/index.md` publishes as **80 panels, 687 KiB** — every
  decision, every reference dereferenceable, one file. The whole decision record
  in one hand.
- **A document for an outsider.** The terminal is a silo instrument: it assumes
  you know what `§27` is and can press `12`. A cahier has to earn its reader from
  its own statements, which is why the receipts carry titles and the chrome
  carries the callsign.

## How to make one

```sh
just html docs/style-guide.md      # → html/2026-08-28-style-guide.html
just serve-html                    # → http://localhost:8080/ with a listing
just html-verify                   # 35 checks in a real browser
just html-batch                    # the collision gate over 439 documents
```

**The date in the name is the document's own** — front matter, else the source's
first commit, else the mtime. Re-publishing a document of record produces the
same name, because a different name would mean a different document.

**Options:** `-o <path>`, `--root <dir>`, `--source-url` / `--source-title` (the
provenance line), `--max-panels` / `--max-bytes` (the budget).

## What it guarantees, and how each is checked

Every guarantee below is asserted by `just html-verify` in Chrome, not by
inspection.

| Guarantee | The check |
|---|---|
| closing returns to the same `scrollY` | measured at 3,000px |
| opening adds no history entry | `history.length` before and after |
| the close control stays visible when the panel scrolls | measured at `scrollTop` 600 |
| the panel chrome names the document | the identity run is non-empty |
| a self-citation mints no panel | the fixture cites itself |
| a code file dereferences into a fence | `pre.code` in a panel |
| a code fence is coloured | chroma's spans, and the keyword hue |
| a comment is readable | 4.7:1, not the dimmest slot |
| the file fetches no external asset | `src` and stylesheet links only |
| a rule before a heading is dropped | the heading is the break |
| table rows are separated by space | no `border-bottom` on `td` |
| a link's rule is the same colour as its ink | computed style |
| a callsign link stays in prose ink | computed style |
| the build says when the budget bites | the warning appears |

## What it will not do

- **N-level dereference.** A panel's references are inert. If they were live, the
  bound would be a lie and `back` would walk a stack.
- **A runtime.** The base document needs no JavaScript; a small script moves the
  address without polluting history, and with it absent every link still works.
- **Webfonts.** Typography is the reader's, per `ADR-GLASS-INK-073` — the same
  ruling that gives the glass its ink gives it its glyph coverage. A face that
  lacks a glyph falls back per-glyph, which is the reader's machine doing what it
  does.
- **Editing, a site, a feed, a tag system.** A cahier is a compositor's output.
  Publishing belongs to the environment; if you want a site, that is a different
  tool reading the same `html/` directory, and it needs no API from us.
- **An `--html` flag on the binary.** `okuda --help` is unchanged. The script
  lives in `scripts/` and imports okuda's exports; the binary's contract is
  markdown in, coloured bytes out.

## What it costs

**Bytes, in proportion to what it holds.** Measured 2026-11-05:

| Cahier | Panels | Size | Load |
|---|---|---|---|
| `decisions/index.md` | 80 | 687 KiB | ~20 ms |
| `debriefs/index.md` | 64 | 531 KiB | ~20 ms |
| `docs/showcase.md` | 5 | 569 KiB | — |
| `docs/style-guide.md` | 10 | 654 KiB | — |

The showcase is large for five panels because one of them is the whole
2,836-line renderer, and colouring it triples the panel's bytes. **That is the
honest trade: a code file costs what its tokens cost.**

For scale: a typical blog hero image is 150–300 KiB and carries nothing. A
687 KiB cahier carries eighty documents, offline, every one reachable.

## How it is built, in one paragraph

`Bun.markdown.html()` emits the block roster; three post-passes fill the gaps
(maths as a pre-pass on the source, mermaid fences through `mermaid-to-md`,
state glyphs and addresses as spans); code fences go through **chroma**, the same
classifier the terminal uses, with `--formatter html` instead of `terminal16`.
The palette is read from `src/palettes/okuda.json` at build time and emitted as
custom properties, so a palette change propagates with no second list to drift.
The resolver is okuda's own, so the page and the terminal cannot disagree about
where an address lands.

**One classifier, one palette, one resolver, two output formats.** That is the
whole architecture, and every defect this week came from a place where one of
those four was implemented twice.

## Related

- `docs/2026-11-05-naming-the-cahier.md` — why it is called that
- `docs/2026-11-05-lessons-from-the-port.md` — the ten lessons, and the checklist
- `decisions/081-the-panel-not-the-door.md` — the mechanism, and its declared gap
- `docs/style-guide.md` — what markdown to write to get the look
