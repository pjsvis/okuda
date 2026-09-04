---
type: Brief
callsign: BRF-CONTENT-SHORTLIST
---

# Brief: content shortlist — rg as the discovery source

**Date:** 2026-08-30
**Status:** Open (amended 2026-09-04 — unified ranking, see §Ranked sources)
**Branch:** feat/gloam-launcher
**Context:** the discoverability gap named in
`docs/2026-08-30-the-butt-dial-question.md` and unpacked across the
riff that followed. The launcher's no-arg picker (`fd -e md | fzf`)
matches on **filenames** — fast when you remember the name, blind
when you don't ("where did we write about diagrams?"). `docs/diagram-monster.md`
and `docs/diagram-color-filter.md` are the exhibit: rich, un-tiered,
invisible to the menu path, findable only by a separate mental mode.
This brief adds the missing half: **content discovery**, file-grain,
no ceremony. Filename search stays; content search joins it.

## The shape, in one line

`rg -l <query> --type md | fzf` → pick a file → `runTui` reads it.
rg emits the shortlist of "files that mention X"; fzf picks one from
the usual suspects; okuda reads the selection. Three tools, one pipe
each, file-grain throughout. The reader's one-document contract
(`okuda <file>`) is unchanged — no line-anchor, no compositor, no
structured rows. (Amended 2026-08-30: the shortlist **merges registry
field hits first** — see §Ranked sources. Amended 2026-09-04: the
operator's requirement is one search over **filenames and content
both, prioritised** — filename matches join the ranked merge as a
channel, and the prioritisation mechanism is feed order, not a
scorer. See §Ranked sources.)

## What

1. **rg becomes a hard runtime dep, alongside fzf.** Same clean-absence
   gate as fzf: `which("rg")` missing → `gloam: rg not found — see
   DEPENDENCIES.md`, exit 1. `DEPENDENCIES.md` gains the entry; the
   `mermaid-to-md` / `fzf` / `fd` table grows an `rg` row. `fd`
   **retires** from the launcher path (see §Source unification).

2. **Source unification — rg for both modes.** `listMarkdownFiles`
   today is `fd -e md` with an in-process `walkMarkdown` fallback.
   Under this brief both modes source from rg:
   - `gloam` (no arg) → `rg --files --type md | fzf` (filename picker,
     rg-sourced; direct replacement for `fd -e md | fzf`).
   - `gloam -g <query>` → ranked merge (see §Ranked sources, item 3):
     registry field hits first, then `rg -l <query> --type md` (content
     shortlist), deduped by path.

   `walkMarkdown` (the `readdirSync` in-process fallback) **retires**:
   it only ever worked on a local filesystem, and its `name.startsWith(".")`
   skip excluded `.archive/` while the `fd` path included it — an
   unprincipled inconsistency. `rg --files` respects `.gitignore`
   uniformly; the include/exclude-archive question becomes a single
   `.gitignore` decision, not a per-source-codepath accident.

3. **Ranked sources — the shortlist merges channels (amended 2026-08-30
   and 2026-09-04, ADR-025).** The operator doesn't always know whether
   what they remember is a callsign, a filename fragment, or a topic —
   the router between channels is the pipe, not the human. The 2026-09-04
   requirement is explicit: **filenames and content in one search,
   results prioritised.** The `-g` shortlist sources, in precision
   order, deduped by path:
   1. **Registry field hits** — `rg -i '"callsign":.*<query>' */INDEX.jsonl`
      (field-anchored: owner-only, per ADR-025's header-only rule; ranks
      first because the registry is the only truthful owner index).
   2. **Body hits** — `rg -l <query> --type md` (the content shortlist;
      files whose text mentions the query).
   3. **Filename remainder** — every other file from `rg --files --type md`.
      fzf's `--exact` still matches these by name; appending the
      remainder preserves filename search inside the same picker
      instead of splitting it into a separate mode.
   **Prioritisation is feed order, not a scorer.** The merged list is
   emitted in the order above; `--tiebreak=index` (already pinned) makes
   fzf rank ties by input position. A document that matches on registry,
   body, *and* filename appears once, at its highest channel. No custom
   ranker, no scoring pass, no second sort — the pipe is the ranker.
   Exact resolution stays out of scope: `gloam <callsign>` (shaped arg,
   registry dispatch, d39a414) remains the only path that guarantees
   exactly-one — the merged shortlist is for *not knowing*, and honestly
   returns a shortlist.

4. **The launcher loop is unchanged in shape.** `runLauncher`'s
   browse → read → browse loop, the query reseed (`--print-query` +
   `--query`), the alt-scroll policy, the callsign/silo threading —
   all identical. The only change is *what feeds `pickFile`'s stdin*:
   the file list comes from rg (filename or content mode) instead of
   `fd`/walk. `pickFile` itself is source-agnostic already; it takes
   `files: string[]`.

4. **Mode gate: `gloam -g <query>`.** The content-query mode is
   entered by an explicit flag, not by "the arg doesn't resolve to a
   file" heuristics. `gloam diagram` today would try to read a file
   named `diagram`; repurposing bare-arg as content-query would
   conflate "I want the file called X" with "I want files mentioning
   X," and the disambiguation would be a heuristic the Protocol
   dislikes. `-g` / `--grep` is the honest, zero-ceremony gate: one
   flag, no ambiguity. (The "query-as-argv" framing from the riff is
   the alternative; it's noted in Open questions, not chosen.)

## Non-goals

- **Not line-grain.** No `rg -n`, no `file:line:text` rows, no
  line-level precision. "The usual suspects" is the whole job; if the
  shortlist picks the right doc but you need the line, read the document
  like a normal person. Line-level navigation inside a rendered doc is
  a reader feature (see the in-document-search non-goal below), never
  a launcher contract — `okuda <file>` stays a file-only contract.
  *(Amended 2026-09-04, conformance: the picker's `-g` entries carry
  `path\tsnippet` — the first matching line as fzf-searchable evidence —
  because a ranker whose evidence is invisible to the matcher is not a
  search: typing a content query into a filename-matching picker
  returns zero. The snippet lives and dies in the picker; selection
  parses back to a path and the reader's file-only contract above is
  unchanged. No jump table, no line addressing — the line is evidence,
  not an address.)*
- **No previews.** No `--preview 'rg -n {1}'`, no bat, no matched-line
  display. fzf matches on the filenames of the rg-filtered set; that's
  enough for a shortlist. Previews are the `etc` that foxtrot-oscarred.
- **No `change:reload`.** ~~No interactive content-narrowing where the
  file list reloads on every keystroke.~~ **REVERSED 2026-09-04 by
  operator evidence — see ADR-030** (`decisions/030-live-search-picker.md`):
  three consecutive dogfood failures were mode-boundary failures, and
  the operator's goal — "fire up gloam, search, find, view an arbitrary
  document" — is the live search. Plain `gloam` recomputes the merge per
  keystroke via `--entries {q}`; `-g` survives as a seed alias. This
  amendment records the palimpsest; the ADR is the decision.
- **No compositor.** No structured rows, no `tableRow`-shaped output,
  no jump-wiring. The content shortlist is a plain `rg -l` pipe, not a
  jump table. (The jump-table compositor is the natural file-grain
  builder if content-match ever needs to be table-shaped — that's the
  wrinkle in "issue 1 / issue 2 are orthogonal" noted in the riff; it
  stays noted, not acted on.)
- **Not replacing the no-arg filename picker.** Both entry points earn
  their keep: `gloam` (no arg) is still the fast path when you remember
  the name and want zero ceremony. Content does not subsume filename
  here — though since the 2026-09-04 amendment, `-g` covers filenames
  too (remainder channel), so the split is about the query gate, not
  about what is searchable.
- **Not in-document search (deferred).** No `ctrl+f` / `:grep` inside
  the reader in this brief. In-document search is a *mixed* feature
  across the three-concerns line: match-highlight recolours rendered
  bytes (rendering — legitimately ours); scroll-to-match moves the
  viewport (windowing — the host's). Mixed features are where scope
  discipline dies the death of a thousand exceptions (wrap, next/prev,
  case-sensitivity, regex — each a fresh negotiation). Defer until the
  pain is loud enough to justify the negotiation; the Protocol's move
  on mixed features is don't split the difference, defer the whole
  thing.

  The deferral is honest **only because the host owns `ctrl+f` today**:
  terminal-native search (iTerm2/Ghostty/tmux copy-mode) finds text in
  the rendered output, free, by another owner. This brief does not
  touch that. The constraint this deferral carries forward: **do not
  make a rendering choice that breaks host-side search** (e.g. an
  alternate-screen mode that suppresses the host's search). The reader's
  in-document search, if it ever lands, is a separate brief that
  reopens the three-concerns negotiation explicitly — not this one.
- **Not remote-silo orchestration.** This brief makes rg the source,
  which means the launcher no longer carries a local-only filesystem
  assumption (the `walkMarkdown` fallback is gone). It does **not**
  add local-gloam + remote-rg split orchestration. The SSH win is
  uniformity: `rg` and `fzf` both run wherever `gloam` runs, so
  `ssh host gloam -g diagram` works the same as local — all three
  processes remote, fzf a TUI over the channel. The "local fzf +
  remote rg" split is a future enhancement, not this brief.

## Acceptance

- `gloam` (no arg) launches the filename picker, now rg-sourced; the
  browse → read → browse loop, query reseed, and cursor behavior are
  indistinguishable from today (regression-free).
- `gloam -g diagram` launches fzf seeded with the ranked merge (§Ranked
  sources): registry field hits for `diagram` first, then `rg -l diagram
  --type md` output, then the filename remainder — deduped by path,
  feed order = priority; selecting a file reads it; Esc returns to the
  launcher; the query is reseeded for the next round (same loop
  semantics as the filename path).
- A pure-filename query (e.g. a fragment that matches only a filename,
  no body hit) still surfaces the file via the remainder channel — a
  test pins that filename search survives inside `-g` (the 2026-09-04
  requirement: filenames and content, one search).
- A pure-registry query (e.g. `gloam -g SHORTLIST`) ranks the owning
  document first and any prose mentions later — a test pins the field-
  anchored source and the dedupe.
- `gloam -g mermaid border` narrows to files mentioning both terms
  (rg default AND across the pattern; or two-word pattern — the
  implementer picks the honest rg invocation, no custom AND logic).
- rg absent → `gloam: rg not found — see DEPENDENCIES.md`, exit 1,
  identical gate shape to the fzf absence error.
- `DEPENDENCIES.md` updated: `rg` row added (version, purpose,
  verified date); `fd` row marked "retired from launcher path
  (BRF-CONTENT-SHORTLIST)" or removed if nothing else consumes it.
- `walkMarkdown` and the `which("fd")` branch are deleted from
  `src/launcher.ts`; `listMarkdownFiles` becomes a thin rg-sourcing
  function (or is inlined into the two entry points).
- `ssh host gloam -g diagram` (dogfood, remote silo) returns the
  remote content shortlist and reads a selection — the local/remote
  behavior is the same, no special path.
- `just check` + `just ship` green; existing launcher tests pass; a
  new test pins the `-g` entry point (spawns rg, seeds fzf, returns a
  selection) and the rg-absence gate.
- **Conformance smoke (added 2026-09-04, after the first implementation
  shipped without it):** the suite drives fzf non-interactively
  (`--filter --exact --tiebreak=index --delimiter=\t`) over the real
  merge with the real query, end to end: `1.4.0` must surface
  `DEPENDENCIES.md` (the operator's scenario: locate the bun version);
  a filename query must surface its file through the same pipe. The
  failure mode this guards is structural: entries must carry the match
  evidence, or the ranking is latent and the search is broken while
  every unit test stays green.

## Open questions

- **The mode gate — flag vs query-as-argv.** This brief chooses `-g`
  for honesty (no heuristic). The alternative is `gloam <query>` where
  bare-arg is content-query when the arg isn't a readable file — less
  ceremony, more ambiguity. Two viable options, a reversed-from-riff
  choice → this may want an ADR rather than a brief-internal decision.
  Flag for review.
- **`.archive/` inclusion.** `rg --files` respects `.gitignore`;
  `.archive/` is **not** gitignored, so archived briefs surface in
  both the filename picker and the content shortlist. Today the
  `walkMarkdown` fallback excluded them and `fd` included them — an
  inconsistency this brief unifies, but the unified answer has to be
  chosen: archived briefs in discovery (add nothing, accept the
  surfacing) or out (add `.archive/` to `.gitignore`, or `rg -g
  '!archive'`). Product call; default to "in" (they're still docs)
  unless review disagrees.
- **rg pattern semantics.** `rg -l <query>` treats `<query>` as a
  regex by default; `diagram.border` would be a literal dot. Decide:
  `-F`/fixed-strings (literal, safer for non-technical queries) or
  regex (power-user default). Lean `-F` — the shortlist is for
  "files mentioning X," not pattern matching; power users opt into
  regex with `rg`'s own flags if needed (but `-g` is our flag, so
  passing through extra rg flags is a separate question). Flag for
  review.

## Sequencing

Small, standalone. No dependency on the open launcher epics
(`BRF-LAUNCHER-FUT`, `BRF-REFRESH-OFF-DISK`); it touches
`listMarkdownFiles` and the `runLauncher` entry-dispatch, not the
repaint path or the alt-screen ownership. Land independently. The
`walkMarkdown` retirement is the one deletion that could surface a
sleeper caller — grep before deleting; the function is exported, so
check for external/test callers first.

## Related

- `src/launcher.ts` — `listMarkdownFiles` (retires `walkMarkdown`),
  `pickFile` (source-agnostic, unchanged), `runLauncher` (gains `-g`
  dispatch), `invokedAsGloam`
- ADR: `decisions/025-mnemonic-namespace-model.md` — header-only
  placement is why the registry field is the only truthful owner index,
  and therefore why it can safely rank first
- `docs/2026-08-30-the-butt-dial-question.md` — where the
  discoverability gap was named (this brief is the gap's first
  graduate)
- `DEPENDENCIES.md` — gains `rg`, retires `fd` from the launcher
- `decisions/016-argv0-launcher-dispatch.md` — ADR-016 (argv[0]
  dispatch; `gloam` spawns the picker, `okuda` reads — the `-g` flag
  is a sub-dispatch within `gloam`, ADR-016's contract still holds)
- `briefs/2026-08-29-brief-fzf-owns-the-loop.md` (`BRF-FZF-OWNS-LOOP`,
  aborted) — the spawn-per-round shape this brief inherits unchanged;
  the content shortlist is a source change, not a loop change
