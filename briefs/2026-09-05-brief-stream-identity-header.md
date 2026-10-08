---
type: Brief
callsign: BRF-STREAM-IDENTITY-HEADER
---

# Brief: Stream identity header — name the document for the unknown destination

**Date:** 2026-09-05
**Status:** Open
**Branch:** TBD

## Context

dogfood finding on the egress routes (print/braille/pipe). The streaming path (`okuda doc.md`, no `--tui`) emits the document body with no identity — no silo, no callsign, no filename. A reader holding the paper or the braille pins, or a process capturing the stream to an unknown target, has a document they cannot name.

## The finding

The TUI carries the document's identity in the footer (`silo · callsign · filename`, muted — ADR-020). The footer is chrome: it exists on the glass, the reader can glance at it, and it is always recoverable. The streaming path has no footer. When the stream goes to:

- **paper** (`okuda doc.md | lp`) — the page has the content, no name.
- **braille** (pipe to a braille display/embosser) — the pins have the content, no name.
- **a pipe** (`okuda doc.md | less`, `okuda doc.md > file.txt`) — the downstream process gets the content, no name.
- **an SSH stream** — the remote gets the content, no name.
- **an agent's context** (capture to a prompt) — the model gets the content, no name.

The destination is *unknown*. The streaming path does not know whether it is writing to a glass, a page, a pin array, a file, or a context window. A channel to an unknown destination has to carry its own identity, because the destination cannot ask the source "what is this?" The TUI knows its destination (the glass); the stream doesn't, so the content must be *self-identifying*.

## The principle

**If the destination is unknown, the content names itself.**

## What

One header line, emitted at the top of the streamed render, before the document's H1, carrying the document's identity in descending order of durability:

1. **silo name** (most durable — the repo's identity; `detectRoot().badge`)
2. **callsign** (the document's durable name; survives filename changes; `callsignFor(file)`)
3. **filename** (least durable but always present; `displayPath(file)`)

Show what is available; omit what is not; never emit a placeholder. The header is *content*, not metadata — plain text, dot-joined, human-readable. No OSC, no YAML, no semantic tag. A human reads "okuda · ADR-031 · decisions/031-main-document.md" and knows what they are holding; a machine reads the same string and can parse it if it wants, but the string does not care. The poverty of UI design (see `docs/2026-09-05-poverty-of-ui-design.md`): do not build a mediating protocol; let the plain text carry the fact, and let every consumer read it for free.

## The format

```
okuda · ADR-031 · decisions/031-main-document.md

# The silcrow

...document body...
```

- Header line, then a blank line, then the H1.
- The blank line is the separator that survives every medium — paper, braille, plain text, paste buffer. The colour is a bonus on the glass; the blank line is the contract across all media.
- On the screen rung (streaming to a TTY, truecolor), the header is muted (the same muted register the footer uses for identity — provenance, not alarm).
- On the egress rungs (pipe, NO_COLOR), the header is plain text, no escapes. The identification is the content; the colour is absent and unmissed.
- The header is emitted by the streaming path *only*. The TUI keeps the identity in the footer; the header would be redundant on the glass. (The TUI's `renderDocument` call is unchanged; the streaming path's call gains the identity.)

## The cases

| Context | Header | Why |
|---|---|---|
| Rooted, registered | `okuda · ADR-031 · decisions/031-main-document.md` | silo + callsign + filename — full identity |
| Rooted, unregistered (a note) | `okuda · decisions/note-20260905.md` | silo + filename — no callsign to show |
| Unrooted (single doc, no silo) | `decisions/some-note.md` | filename only — no silo, no callsign |
| Unrooted, root file | `README.md` | filename only |
| Pipe from stdin (`okuda < doc.md`) | *(no header)* | no file argument — the source is anonymous stdin; the content is the content |

The stdin case is the one honest null: when there is no file, there is no identity to carry, and the header is omitted entirely. This is the shite filter applied to the header — no placeholder, no "UNKNOWN DOCUMENT", just silence where there is nothing to say. The header is optional content, not a fixed row.

## How

`renderDocument` (`src/render.ts`) gains optional identity fields on `RenderOptions`:

```ts
export interface RenderOptions {
  width: number;
  palette?: Palette;
  color?: ColorMode;
  mermaidBin?: string;
  /** Identity header (streaming path only): silo · callsign · filename.
   *  Omitted when absent (stdin, or unrooted with no file). The TUI does
   *  not pass these — it carries identity in the footer (ADR-020). */
  silo?: string;
  callsign?: string;
  file?: string;
}
```

The streaming path in `cli.ts` (`draw()`) resolves the identity it already has access to — `args.file`, `detectRoot()`, `makeCallsignResolver()` — and passes it through. The TUI path (`runTui` in `tui.ts`) does not pass these fields; it keeps identity in the footer, and `renderDocument` emitting a header in TUI mode would duplicate it on the glass.

The header is emitted at the top of `renderDocument`'s output, before the existing body, when any of `silo`/`callsign`/`file` is present:

```
<muted or plain> okuda · ADR-031 · decisions/031-main-document.md \n
\n
<existing rendered body>
```

One line, one blank, the body. No protocol, no chrome, just the facts.

## Scope / non-goals

- **Not a YAML front-matter passthrough.** The render already elides front matter (pre-pass 1). The header is *new content*, generated from the identity the caller resolves, not echoed from the source.
- **Not in the TUI.** The footer is the TUI's identity surface (ADR-020); the header is the stream's. The two are separate because the glass and the unknown-destination channel are separate concerns.
- **Not a semantic protocol.** No OSC 8, no semantic tags, no machine-readable metadata block. Plain text, dot-joined, the string is the identification. A machine may parse it; the string does not invite it.
- **Not a callsign-resolution surface.** The header *displays* the callsign; it does not *resolve* it. The reader who sees `ADR-031` on paper and wants the document types `ADR-031` into the silo's search, and the registry channel finds it. The header is the name; the search is the actuator. (See `advisories/ADV-SEARCH-TWO-FILTERS.md` — the shite filter finds the callsign; the header carries it.)
- **Not for the `--entries` printer.** The entries printer emits `path\tsnippet` rows for fzf; it is its own format, not a rendered document. The header is for the *rendered document stream* only.

## Why it earns its place

1. **The egress routes are documented as real.** The accessibility explainer's ladder (`explainers/accessibility.md`) names screen → TTS → braille → paper, and the bottom two rungs are *detached from the glass* — no footer, no scroll, no re-render. A document the reader can't name is a document they can't file, cross-reference, or request. The header is the name travelling with the content.
2. **The streaming path's destination is unknown by construction.** `okuda doc.md` can go to a glass, a page, a pin array, a file, an SSH stream, an agent's context. The one format every consumer reads is plain text; the header is plain text; the identification travels for free.
3. **The identity is already resolved.** `detectRoot()`, `makeCallsignResolver()`, `displayPath()` all exist and are used by the TUI. The streaming path has access to the same resolvers; it just doesn't pass them through. The build is a threading, not an invention.
4. **It is honest under NO_COLOR.** The header is content, not styling; under NO_COLOR it is plain text, identical line breaks, the name still present. The shite filter's NO_COLOR parity holds.

## Risk / open questions

- **Does the header break any existing test?** The streaming render tests in `tests/render.test.ts` assert on the rendered body; a new first line + blank will shift line indices. The tests that anchor on the *first* line or on line-count parity will need updating. This is the "quick coding things bite" risk the brief exists to surface — the change is small, but the test surface is wider than it looks.
- **Does the header confuse `less`/`cat`/`lp`?** Unlikely — it is one line and a blank, standard document-opening shape. But dogfood: pipe to `less` and to `lp` before landing.
- **Does the header belong in `renderDocument` or in `cli.ts`'s `draw()`?** Lean: in `renderDocument`, because the identity is a render concern (the content names itself), and the streaming path is not the only caller that might want a self-identifying render (an SSH `--tui` session is self-identifying via the footer, but a future non-TUI remote render might want the header). But the TUI must not emit it, so the option is opt-in via `RenderOptions`, and only the streaming path opts in. Alternative: emit in `draw()` before calling `renderDocument`, keeping the render pure. The brief is neutral; the implementer decides based on which keeps the render's purity cleaner.
- **stdin: omit entirely, or emit a blank first line?** Lean: omit entirely. The source is anonymous; the header is the name; no name, no header. A blank first line would be noise.

## Related

- `explainers/accessibility.md` — the ladder (screen → TTS → braille → paper); the bottom two rungs are the egress routes the header serves.
- `docs/2026-09-05-poverty-of-ui-design.md` — no protocol, just the facts; the header is plain text because the destination is unknown.
- `docs/2026-09-05-i811-dual-layer-output.md` — the i811 refusal; the header is not a semantic protocol, it is content.
- `advisories/ADV-SEARCH-TWO-FILTERS.md` — the header carries the callsign; the shite filter finds it; the reader who sees the name on paper types it into the search.
- `src/root.ts` — `detectRoot()`, `makeCallsignResolver()`; the identity resolvers, already built.
- `src/tui.ts:396` — `footerLine`; the TUI's identity surface, the model the header mirrors in content.
- ADR-020 — the identity run (`silo · callsign · filename`); the header is the same run, in the content, for the unknown destination.
