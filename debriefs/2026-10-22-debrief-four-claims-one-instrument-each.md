---
type: Debrief
callsign: DBF-TOOLCHAIN-TRUTH
briefs: [BRF-TOOLCHAIN-TRUTH]
---

# Debrief: Four claims, one instrument each — and the cross-platform reading

**Date:** 2026-10-22
**Status:** Done — `BRF-TOOLCHAIN-TRUTH` shipped (`95e40a6`, `49d369c`,
`5fba500`, `3d2f92f`, fast-forwarded to main and pushed). `just ship` is green on
Omarchy end to end for the first time. Three cross-platform gaps found by the
review below are filed, not fixed.

## What landed

| Claim | Instrument | Proof it can fail |
|---|---|---|
| a tool works *with okuda* | `DEPENDENCIES.md` gains `Proven by` | an empty cell — `diagram-describe`'s, visible |
| a failed diagram is not silence | `▸ diagram unavailable · <reason>` | three modes asserted: not found, `exit 1`, exit 0 with no art |
| the shell is the user's, not the box's | `cloneArgs`/`editArgs` take `shell` | a spec passes `/usr/bin/bash` and asserts it flows through |
| chroma is the pinned chroma | one assertion on `chroma --version` | measured red under a 2.28 shim, green on 2.27.0 |

The reason a failed pipe gives is now **data**, not a shrug: `spawnMermaid`
returns `{out} | {reason}`, `Ctx.mermaid` holds a union, and the placeholder
handler cannot invent a diagnosis. Silence at that one line is what turned a
wrapper crash on Omarchy into a blank page and a session of diagnosis.

`bun test`: **803 pass, 0 fail** on Linux (was 796/3). `just ship`: green —
tests, gate, build, install, freshness. The three red specs were never product
failures: they injected `platform` and then read `process.env.SHELL`, so they
asserted zsh about a bash box.

## The cross-platform reading — measured, not asserted

Every platform-bound line in `src/` is in `clone.ts`. Rendering carries none:
markdown, colour, wrap, elide and the TUI all ran identically here. That
narrowness is the whole answer to *"are we good cross-platform"* — the renderer
is portable by construction; the **integrations** are macOS-shaped, and they are
shaped inconsistently.

| Path | Linux behaviour, measured 2026-10-22 | Verdict |
|---|---|---|
| render (md → bytes) | 803 tests, colour smoke 3/3, diagrams live | portable, proven |
| build + gate + release | `just ship` green | portable, proven |
| `mermaid-to-md`, `chroma` pipes | precondition smoke, pin assertion | portable, proven |
| `terminal`, `edit-terminal` | refuses: *"macOS-only — use ghostty, tmux, or cmd"* | **honest refusal** |
| `ghostty`, `ghostty-edit` | builds `{cmd: "/Applications/Ghostty.app/Contents/MacOS/ghostty"}`, which cannot exist here; ghostty is at `/usr/bin/ghostty` | **silent guess** |
| `scripts/paper.ts` (`just pdf`) | hardcodes `/Applications/Google Chrome.app/…`; chromium is what this box has | **silent guess** |
| `codesign` branch | no `codesign` on the host → exit 2, UNVERIFIED | honest by design |
| osascript paths | `osascript` absent | unexercised |
| TUI (`--tui`) | needs a TTY; not exercised in this session | unexercised |
| cross-build `--target=bun-darwin-arm64` | builds; signature audits clean; **unverifiable** from Linux | unexercised |

The asymmetry is the finding: **two paths refuse honestly and two guess
silently**, and the guess is the same failure the refusals were invented to
prevent (`ADR-031`'s *"honest refusal, not a guess"*). The repair is one shape
for both — resolve the binary with `which()`, fall back to the bundle path,
refuse with a named error when neither exists. Filed rather than done: this
session's brief was the four claims, and inventing a fifth commit type in the
same breath is how scope grows teeth.

Two smaller findings, also filed:

- **`search-smoke` was red on main**, and nobody noticed because a red gate stops
  being run. Its fixture was a brief that had since been archived *and* rewritten
  — the phrase was gone from the file. Worse, the replacement intent (*"type a
  version number, find the dependencies row"*) pointed at a document the picker's
  corpus does not carry: **root-level markdown is not indexed**, so
  `DEPENDENCIES.md` is unfindable by the launcher. The smoke now derives its
  query from its target and cannot drift; the corpus gap is its own task.
- **The table was two machines' worth of versions** and said one. `just` 1.53
  vs 1.59, `bun` 1.4.0 vs 1.4.3, `fzf` 0.73.1 vs 0.74.5, `rg` 15.1 vs 15.2,
  `td` 0.61 vs 0.46. The rows now name the platform each version was measured on;
  a single unqualified version was a claim about the fleet that nobody had made.

## What this debrief does not claim

- **darwin has not run this code.** The `codesign` branch is stub-tested, the
  osascript paths are unexercised, and the cross-built Mach-O is unverifiable
  here. "Still green on darwin" remains a promise, and it is filed.
- **The TUI is untested on either platform this session.** No TTY.
- **`just pdf` has not run** on either box in this session.

## Files

- `src/render.ts` — the failure receipt, the `{out} | {reason}` pipe result
- `src/clone.ts` — `shell` injected, `loginShell()` reads the environment once
- `tests/table-diagram.test.ts`, `tests/clone.test.ts`, `tests/fence-colour.test.ts`
- `DEPENDENCIES.md` — the `Proven by` column and the two-machine versions
- `scripts/search-smoke.sh` — the derived scenario
- `AGENTS.md` — rule 7: a *"not fixed here"* opens a td task in the same sitting
- `decisions/040-build-signs-its-output.md` — the deferral note, retired and kept
