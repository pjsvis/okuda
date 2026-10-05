# okuda — silo workflow

Work cycle: **brief → branch → implement → check → review → debrief**

## User commands

- `just info` — what is this project?
- `just orient` — live state: branch, changed files, last commit, registry counts
- `just --list` — full recipe inventory, operator tools included

## Viewing

- `okuda <file.md>` — render to stdout (one-shot)
- `okuda <file.md> --watch` — re-render on change + resize (streaming canvas)
- `okuda <file.md> --tui` — control plane: alternate screen, viewport scroll, Gloam footer. Falls back to streaming under `NO_COLOR` / `TERM=dumb` / non-TTY.
- `cat doc.md | okuda` — stdin piping

## Operator commands

- `just ship` — the full gate: tests → check → build → install → fresh. Run before push.
- `just fresh` — is the binary on PATH this checkout's HEAD? (stale-binary gate)
- `just search-smoke` — proves the gloam `-g` content search end to end, no TTY: freshness → merge → fzf. Custom scenario: `bash scripts/search-smoke.sh <query> <expected-path>`
- `just search-replay` — opens the exact picker instance standalone: prints the entry stream + argv, then runs interactive fzf with nothing between you and it. Custom query: `just search-replay load bearing`
- `just scan` — search the silo with the dialect **and** the coverage pinned: ripgrep by absolute path, ERE, `-uu` so gitignored `tmp/` is searched, `node_modules/` excluded and stated on stderr. Prefer it to a bare `grep` — the shell's `grep` is a shimmed toybox where `\|` is a literal, so a pattern legal in both dialects returns a plausible `0`. Custom paths: `just scan 'it\(|describe\(' src/ tests/`
- `just check` — registry sync gate; fails (exit 1) on MISSING or STALE entries. Run before every commit.
- `just reg-sync` — check registries for drift
- `just reg-sync-fix` — regenerate indexes from filesystem
- `just reg-briefs` / `reg-decisions` / `reg-debriefs` / `reg-playbooks` — list one registry

## Dogfood sessions

- `just next` — the decision table (`&next.md`): what to start, what waits, what's parked.
- `just briefs` — the registry state table; the visible face of `just amp`'s drift count.
- `just ear` — the listening queue: open verdicts, one recipe per row.
- `just palette-audit` — the three audit exhibits in sequence (quit each to advance); the rig BRF-PALETTE-AUDIT names. Revisit when the brightness controller lands — the exhibits gain their α extremes.
- Older sessions live elsewhere in the menu: `just dogfood` (α), `just speech` (the speech vector), `just showcase` (the grammar tour), `just chip` / `keyboard-dogfood` / `stamp` (build group).

## Searching

One mode, live (ADR-030 + the filter model): **`gloam` is the search.**

- **No text → the shelf**: the silo's root documents only — arrive, see
  the top level. The `&`-family and the root content documents are the
  whole floor.
- **Text → the dive**: every keystroke recomputes the ranked corpus
  results — registry callsign hits, body matches with the matching line
  as evidence, filename matches. Root files are not destinations in the
  dive; the shelf steps aside once intent is expressed.
- Enter reads; Esc returns with your query; bare arguments resolve in
  order (existing file → read; callsign shape → registry; anything else
  → query). `gloam -g <query>` survives as a seed alias.
- `okuda --entries "<query>"` prints the raw entry stream (the reload
  target; handy for debugging).

## Troubleshooting

- **Staircase output after a killed picker** (`stty sane`): a hard-killed
  fzf/okuda can't restore the terminal; raw mode leaks into the shell and
  every subsequent line staircases. `reset` also works.
- **`fresh: FAIL — binary is X, checkout is Y`**: run `just ship` — the
  stale-binary gate is doing its job.

## Standing rules

- Never commit to `main`: branch `feat/<name>`, one logical change per commit.
- `just check` must pass before every commit.
- A new document and its registry entry land in the same commit.

Live state is `just orient`'s job. This page is static by design.
