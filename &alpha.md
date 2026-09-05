# &alpha — orientation

## what is this

- **okuda** renders restricted-grammar markdown in the terminal, fast.

- **Gloam** is the search: type to find filenames and content at once;
  every keystroke re-ranks the silo. Enter reads. Rooted in a silo (a
  git repo) when launched there; over ssh or `okuda://` when the silo
  is another machine.

- **The wire is the budget.** The silo renders in place — nothing is
  sent back to be rendered by someone else's glass.

## how to move

- **Type** — the live search is the dereference path. The document's
  references are plain text; type the callsign and it resolves.

- **§NN** — rose vectors after a document's references. The section
  sign means *reference*: actuate to dereference — the target renders
  clean, and its references are not shown. The tour cannot run away.
  [The silcrow explainer](docs/2026-09-04-the-silcrow.md).

- **u** — unwind: back to the main document, annotated again.

- **99** — clone: the document you are reading becomes the main
  document of a new terminal, vectors live. Each level of the tour is
  a deliberate keystroke and a fresh, stateless instance.

- **q** — quit.

No menus, no state. The map is derived; the paint is illustrative.
(ADR-031.)

## first reads

- ADR-031 — the main document and the working copy
- ADR-030 — the live search
- BRF-PORCH-MATRIX — click a URL, land in a terminal
- [the constitution](system.md)
- [the origin doc](docs/2026-08-20-origin-doc.md)
- [dependencies](DEPENDENCIES.md)
- [today, recorded](debriefs/2026-09-04-debrief-gloam-live-search.md)

## the dogfood range — every vector case, live

This section is the test bench (`just dogfood` asserts it headless).
Each case names what should happen. If a case lies, the renderer is
lying.

1. **Callsign in prose** — ADR-030: one silcrow after the token.
2. **Callsign in bold** — **ADR-031**: the vector paints outside the
   bold, in the reserved rose.
3. **Callsign in a list item** — the *first reads* list above: every
   entry carries its silcrow.
4. **Local document link** — [the constitution](system.md): the badge
   follows the link's URL.
5. **One-to-many** — ADR-030 again: a second mention, a second vector,
   the same destination. (The map translates many vectors to one
   filename.)
6. **Garden-path regression** — [the silcrow
   explainer](docs/2026-09-04-the-silcrow.md): a noun-phrase label; the
   URL must read as an address, never as a sentence.
7. **Zero-padded numbers are text** — steps [07] and [3] are never
   vectors, whatever the brackets promise.
8. **An external URL is never a vector** — [the silo's
   repository](https://github.com/pjsvis/okuda) renders as a link;
   the web is not the silo.
9. **Legacy wiring is silent** — the token at the end of this line is
   stripped without a badge: %%okuda-rhs:11%% briefs/x.md — retired,
   not honored (ADR-022 reversed).
10. **Callsign in a table cell** — vectors paint in tables too:

| ADR | Rule |
|---|---|
| ADR-024 | callsigns are data, not machinery |
| ADR-020 | the renderer never reads registries — a closure, always |

11. **In bold, mid-sentence** — the working copy of **ADR-031** is the
    specification for everything on this page.

## notes

- This file sorts first by ASCII (`&` 0x26 beats `2` 0x32, so it
  precedes every dated file). The ugly prefix is the moat — no one else
  wants it, so it is ours alone.

- No logo, no colours, no chrome: okuda renders text in a fixed
  palette and rejects images (the grammar strips them). The branding
  *is* the absence of branding; the orientation *is* the landing page.

- The tier registries (`INDEX.jsonl`) are the data; their generated
  `index.md` views exist for other tools and are not in the search
  corpus. If you want the briefs, type `BRF-` — the picker is the
  better index.
