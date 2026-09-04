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
- `just check` — registry sync gate; fails (exit 1) on MISSING or STALE entries. Run before every commit.
- `just reg-sync` — check registries for drift
- `just reg-sync-fix` — regenerate indexes from filesystem
- `just reg-briefs` / `reg-decisions` / `reg-debriefs` / `reg-playbooks` — list one registry

## Searching

- `gloam` — browse → read → browse picker over all markdown (filename search)
- `gloam -g <query>` — ranked content search: registry callsign hits first, then body matches (`path + matching-line` evidence per entry), then filename matches. One query searches both; results prioritised by channel.

## Standing rules

- Never commit to `main`: branch `feat/<name>`, one logical change per commit.
- `just check` must pass before every commit.
- A new document and its registry entry land in the same commit.

Live state is `just orient`'s job. This page is static by design.
