# &alpha — orientation

## what is this

- **Okuda** renders restricted-grammar markdown in the terminal, fast.

- **Gloam** is the search: type to find filenames and content; Enter reads the document. 

- **Silo** a ailo is a folder or a git repo on your machine

- **Over `ssh://`** the silo is on another machine


## how to operate

- **§NN** — rubricated silcrows actuate via [12-98] to render references : the reference renders
  without silcrows, see [The silcrow explainer](docs/2026-09-04-the-silcrow.md).

- **BKSP** — unwind: back to the main document, annotated again.

- **00** — return to he search/filter panel

- **CNTRL+C** — quit

## the words

- **A silo** is a repo that indexes itself — five tiers of documents,
  one registry each. The registries are the data; the picker is the
  better index of them.

- **A callsign** is the human code — `ADR-031`,
  `BRF-ONION-SEARCH-GRAMMAR`. Tier prefix plus slug. Type it; the
  search resolves it.

- **A silcrow §NN** is a painted jump. The references in the document
  you are reading carry their numbers, and every painted number
  resolves — the registry validates before the paint. (ADR-044.)

- **Shelf and dive** — an empty search is the shelf: the silo's top
  level, root files as destinations. Any query is the dive: the
  corpus, ranked, evidence attached.

- **The onion** is the search grammar — staged narrowing, one concern
  per layer. The next section is the whole grammar. 
  (BRF-ONION-SEARCH-GRAMMAR.)

## the search — the onion grammar

- **`dir/` is a path; `dir` is content.** `decisions/` lists the tier;
  `decisions` finds documents about decisions, in any tier, with the
  matching line attached. The trailing slash is the signal — stated,
  never guessed.

- **`@YYYY-MM` scopes the date** across the whole query:
  `briefs/ @2026-09` is the month's briefs. The day shape too:
  `@2026-09-02`. The date is a path predicate — it filters the
  stream, not the view.

- **`!` excludes.** `!word` removes bodies that mention it; `!dir/`
  removes a path. Two operators, two layers.

- **`|` is OR** — `debriefs/ | decisions/ | docs/`. Flat, no brackets;
  every real query fits.

- **Words AND within a clause** — `@2026-09 briefs/ elision` is all
  three at once.

- **The picker refines, exactly.** What you keep typing is an
  exact-match AND over what survived. Watch fzf's counter: the
  `@`-form narrows the stream itself; the bare word narrows the
  view. Same destination, different layer.

The worked example — September outside briefs:
`!briefs/ @2026-09 debriefs/ | decisions/ | docs/`

## the state — where we are

- [the island](NOW.md) — today, generated: branch, counts, the
  board. Stale on creation; `just island` regenerates.

- [the decision table](&next.md) — what is next, what is outstanding,
  what landed: name, verdict, cost.

- This month is a query away: `@2026-09`. Outstanding work is the
  table's to answer — the grammar does not yet filter status, and
  the curated table does it better than a filter would.

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
5. **Repeat citation** — ADR-030 again: a second mention, the SAME
   silcrow (§13). One destination, one number — the citation
   convention, everywhere.
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
