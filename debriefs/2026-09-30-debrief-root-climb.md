---
type: Debrief
callsign: DBF-ROOT-CLIMB
---

# Debrief: The root climb — same-day, one spawn, three seams

**Date:** 2026-09-30
**Status:** Done — BRF-ROOT-CLIMB shipped; ADR-048 accepted; td-8c1650

## What happened

The day opened parked (BRF-TERMINAL-CELL-GRID: solved problems already
solved), detoured through television (BRF-TELEVISION-PREVIEW: built,
shelved, predictably adequate), and produced its value in the last hour: a
live confusion — gloam in cool-pi-extensions "missing" briefs/ — resolved
into a measured defect in our own silo (`detectRoot("okuda/src")` → null),
an ADR, and an implementation, all in one session.

## What was built

* `siloRoot(cwd)` in `src/root.ts` — `git rev-parse --show-toplevel`,
  cached per cwd per process; non-git cwd → itself (today's behaviour,
  the guaranteed fallback).
* Threading, no surgery: every layer already took an explicit `cwd`
  parameter (`detectRoot`, the five corpus functions, the callsign
  validator/resolver, the path validator's new second anchor). The climb
  resolved once at the two entry points (`runLauncher`, `cli.ts main`) and
  passed it down. The seams existed by prior design; the climb only gave
  them the right value.
* `makePathValidator(mainFile?, cwd)` — ADR-045's second anchor becomes
  the silo root anchor.
* Tests: five, in `tests/root.test.ts` — the fallback, the climb from two
  levels down, the cache (delete `.git`, the cached toplevel survives),
  the contract (`detectRoot(siloRoot(sub))` roots where
  `detectRoot(sub)` was null), the validator anchor. Plus
  DEPENDENCIES.md's runtime note (git joins rg/fzf as a launcher
  runtime dep).

## What the dogfood showed

| Launch cwd | Corpus | Badge |
|---|---|---|
| `okuda/src` | full silo — briefs/ found | `okuda` (via `okf`) |
| `cool-pi-extensions/docs` | their corpus — briefs/ found (the original complaint) | none — honestly unrooted |
| `/tmp` (non-git) | cwd, byte-identical to today | none |

## What was learned

* **The confusion was the gift.** The television detour taught the
  integration; the subfolder confusion exposed the cwd-scoping defect
  beneath it. Both are recorded where future sessions can find them.
* **Seams by prior design made the change cheap.** The audit found zero
  layer surgery: the estimate ("resolver plus threading") held because
  earlier work parameterised `cwd` everywhere it mattered.
* **macOS `/var` vs `/private/var`** — git returns the canonical path;
  the tests normalise with `realpathSync`. First failure of the suite,
  fixed in the same minute.

## What's left

* The shelved television branch (`feat/television-preview`) does not
  carry the climb; unparking it means a rebase — trivial, noted in
  td-c05892's handoff.
* Watch television's #999 (fzf-style preview envs) — landing it retires
  OKUDA_WIDTH for free.
* `feat/search-surface` (+3, epic open) predates the climb; its session
  should rebase when it resumes.
