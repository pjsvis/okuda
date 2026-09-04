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
- `just check` — registry sync gate; fails (exit 1) on MISSING or STALE entries. Run before every commit.
- `just reg-sync` — check registries for drift
- `just reg-sync-fix` — regenerate indexes from filesystem
- `just reg-briefs` / `reg-decisions` / `reg-debriefs` / `reg-playbooks` — list one registry

## Searching

Two modes, one picker:

- **`gloam` (no params) — filenames only.** The file list as normal: every
  markdown file, one per line; what you type matches **paths**. Fast when
  you remember the name.
- **`gloam -g <query>` — content + filenames, prioritised.** One query
  searches both: fzf matches the whole row (path **and** matching-line
  evidence). Rows arrive in channel order — registry callsign hits first,
  body matches second, all remaining filenames last — so `--tiebreak=index`
  makes the feed order the ranking. The prompt reads `gloam -g ❯` so the
  mode is always visible. Unquoted multi-word queries work
  (`just gloam -g load bearing`); multi-word search is phrase-tolerant
  ("load bearing" finds "load-bearing").
- **Evidence, not documents:** each row is `path` + the first matching
  line. Widening the terminal reveals more of the line — fzf truncates at
  the glass edge, so the resize is the expansion.
- **Refinement semantics (honest):** the evidence is computed once for the
  `-g` seed; typing inside the picker narrows *within* that seed's rows.
  A new corpus-wide search = Esc, re-run with a new `-g`.

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
