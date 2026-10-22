# DEPENDENCIES — okuda

External tools this silo depends on. Brief preconditions verify against
this file — an entry with a verified date is a claim we have checked, not
an assumption.

**`Verified` is a date; `Proven by` is the instrument that can fail.** A row
with a date and no prover is a tool nobody exercised — which is how
`mermaid-to-md` read *verified on Linux* for a month while the pipe that
consumes it produced nothing (`DBF-OMARCHY-TOOLCHAIN`). An empty prover cell
is a finding, not a gap in the table.

| Tool | Version | Purpose | Verified | Proven by |
|------|---------|---------|----------|-----------|
| `bun` | 1.4.0 | Runtime & renderer | 2026-08-27 | `bun test` (the whole suite) |
| `just` | 1.53.0 | Task runner | 2026-08-20 | `facade-lint.sh` invariant 0 names its absence |
| `codesign` | system (macOS 27.0) | Build — re-signs the compiled Mach-O (an ELF has no signature) | 2026-10-22 | `signature-check.sh` Mach-O branch (stub-tested on Linux) |
| `rcodesign` | 0.29.0 (optional) | Build — the Linux-side signer for a cross-built Mach-O | 2026-10-22 | `sign-binary.sh` Mach-O branch (hand-measured 2026-10-22) |
| `git` | 2.54.0 | Version control; launcher runtime (ADR-048 — the root climb) | 2026-08-20 | `ref-census.ts`, `fresh.sh` |
| `td` | 0.61.0 | Task management | 2026-08-27 | `td-id-lint.ts` (an absent database is loud) |
| `mermaid-to-md` | 0.1.0* (wrapper 51f5225) | Mermaid → ASCII | 2026-10-22 | `tests/table-diagram.test.ts` — the pipe smoke |
| `diagram-describe` | — | Mermaid → prose via local LLM (BRF-DIAGRAM-DESCRIBE) | 2026-10-03 | — (the absent case is injected; no live proof) |
| `chroma` | 2.27.0 (exact pin) | Code-fence colour — 16-colour class codes (BRF-FENCE-COLOUR) | 2026-10-22 | `tests/fence-colour.test.ts` (pin + bytes), `colour-smoke.sh` |
| `Google Chrome` | 153.0.8010.53 | The paper rung — headless `--print-to-pdf` (`just pdf`) | 2026-10-09 | `just pdf` |
| `fzf` | 0.73.1 | Fuzzy picker — runtime dep of the `gloam` launcher (both modes) | 2026-08-27 | `search-smoke.sh` |
| `rg` | 15.1.0 | Source for both `gloam` picker modes — file list, body shortlist, registry prefilter | 2026-09-04 | `search-smoke.sh` |
| `fd` | 10.4.2 | ~~File finder — preferred by `gloam`~~ RETIRED from the launcher path (BRF-CONTENT-SHORTLIST) | 2026-08-27 | — (retired) |

\* Self-reports as `mermaid-tui 0.1.0`, lives at `~/.local/bin/` — binary
name and package name differ. The origin doc's `spacex-mermaid` is stale;
`mermaid-to-md` is the real dependency.

### `mermaid-to-md` platforms (verified 2026-10-22, macOS + Linux x64)

- **Both platforms**: wrapper symlinked (the upstream repo's
  `scripts/mermaid-to-md.sh`) + the compiled `mermaid-tui` binary copied to
  `~/.local/bin/`. The symlink is live, so **the clone is part of the
  dependency** — it may not be deleted, and `git pull` in it updates the
  installed wrapper. Linux clone: `~/dev/github/mermaid-to-md`.
- **Linux (Omarchy/Arch)**, verified end-to-end 2026-10-22: `git pull`,
  `cargo build --release` (2.5 s warm), `cp target/release/mermaid-tui
  ~/.local/bin/`, `ln -sfn <clone>/scripts/mermaid-to-md.sh
  ~/.local/bin/mermaid-to-md`. **No GitHub release assets exist** —
  `install.sh` and the npm path are unexercised escape hatches.
- **The binary must be copied, not linked.** The wrapper resolves
  `../target/release/mermaid-tui` relative to its own (symlink) path, which
  does not exist off the build tree, then falls back to `command -v
  mermaid-tui` — the PATH fallback is what actually finds it. A symlink to
  the build-tree binary works until the tree is cleaned.
- **The wrapper must never reopen `/dev/stdout`** (upstream `51f5225`,
  2026-10-22). Bake mode redirected to `${outfile:-/dev/stdout}`, which is
  a fresh `open()` of `/proc/self/fd/1`; a caller that opened the pipe
  itself gets ENXIO there, so the render vanished and the caller saw exit 1
  with empty stdout. Measured: the same bytes succeed through a bash
  pipeline and fail under `Bun.spawn` — which is how okuda pipes every
  fence, so **every diagram in okuda rendered to nothing on a wrapper older
  than 51f5225**. If a future wrapper bump reintroduces a `/dev/stdout`
  redirect, this is the symptom: art missing, one bash error on stderr, no
  okuda error at all (the swallow at `src/render.ts`).
- The symptom of a missing *binary* on a fresh machine is opaque failures in
  `tests/table-diagram.test.ts`; the precondition test there smokes the pipe
  (spawns the wrapper, demands art) and names the dependency before the
  diagram tests run — wrapper-resolvable-but-broken is caught too, not just
  wrapper-absent.

### `mermaid-to-md` known limits (verified 2026-08-28)

- **`stateDiagram` and `stateDiagram-v2`** both render — flat state
  boxes, `[*]` as a filled `●`, transition labels as `▼<label>`, terminal
  states. The `-v2` syntax is accepted and produces the same output as
  legacy.
- **Composite (nested) states are flattened.** `state X { [*] --> A; A --> B }`
  parses without error, but `X`, `A`, `B` render as **peer nodes**, not as
  a containing box around its children. The containment is silently lost.
  If a diagram's *containment is the point* (a composite state with
  internal transitions), author it as a `flowchart` with `subgraph`
  boxes, which the renderer *does* draw as containers — its native shape.
  Don't ask the state grammar for nesting it flattens; ask the flowchart
  grammar, which draws what it parses.
- **Width guard.** A diagram whose rendered ASCII exceeds the binary's
  internal width budget is emitted as the mermaid source in a bordered
  box ("This diagram is too wide to display here") instead of ASCII art.
  This is upstream elision — the binary gives up before okuda does.
  Wide `flowchart LR` with long node labels hits this; short labels at the
  same node count do not. (`docs/diagram-monster.md` is the live exhibit.)

The pair (`rg`, `fzf`) serves the `gloam` launcher (see
`src/launcher.ts`, ADR-016; BRF-CONTENT-SHORTLIST). `gloam` (no arg)
seeds fzf from `rg --files --type md`; `gloam -g <query>` seeds it with
the ranked merge — registry field hits, body hits (`rg -l -F`),
filename remainder. Both `rg` and `fzf` are runtime deps of that mode
(clean error + exit 1 if missing); the `okuda <file>` reader does not
require either. `fd` and the in-process walk fallback retired
2026-09-04 — rg respects `.gitignore` uniformly, so the
include/exclude question is a `.gitignore` decision, not a codepath
accident.

## The paper rung — Chrome as a printer, not a renderer (verified 2026-10-09)

`just pdf <file>` renders the streaming canvas to a colour PDF. The chain is
`okuda --no-references | ansi→HTML | Chrome --headless --print-to-pdf`, and it
sits **outside** okuda: the binary neither knows nor cares that a page exists.

The dependency is declared because the recipe is: **Chrome is used as a
printer, not as a renderer.** okuda decides the layout — width, wrapping,
colours, elision — and the HTML is a single `pre` with `white-space: pre`, so
the browser cuts pages and changes nothing else. No reflow, no re-typesetting.

Alternatives measured the same day, and why they are not used:

- **pandoc → PDF is impossible here.** No LaTeX engine is installed
  (`pdflatex`, `xelatex`, `lualatex`, `tectonic` all absent), so pandoc cannot
  emit a PDF on this machine. It is also the wrong shape: a re-typeset document
  is a *different arrangement*, and the arrangement is the content
  (`docs/2026-09-14-derrida-and-the-decomposed-pdf.md`).
- **`cupsfilter` cannot do it**: `cupsfilter -m application/pdf file.html` exits
  1 with *"No filter to convert from text/html to application/pdf"*. There is no
  zero-dependency system route.
- **`wkhtmltopdf`, `weasyprint`, `typst`, `aha`, `ansi2html`** are all absent.
  The ANSI→HTML step is therefore part of the recipe rather than an installed
  tool; it is ~40 lines in `scripts/paper.ts`.

Requirement: **the compiled `okuda` must be fresh** (`just build`). The script
falls back to `bun run src/cli.ts` and says so, because a stale binary would
silently print an old render — the paper rung's own version of the stale-icon
problem.

## Runtime dependency note

The compiled okuda binary has zero external npm runtime dependencies;
`mermaid-to-md` is its one runtime dependency — invoked per `mermaid`
fence via `Bun.spawn`, never parsed in-process. `diagram-describe` is
an optional runtime dependency — invoked per `mermaid describe` fence
(BRF-DIAGRAM-DESCRIBE); absent → graceful degradation to the ASCII path.
The gloam launcher adds three more, all spawned, never parsed in-process: `rg` and `fzf` (the
search surfaces) and `git` (ADR-048 — the silo root is the git toplevel,
resolved once per process and cached; absent git, the cwd stands).

## Development dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `bun-types` | ^1.3.11 | TypeScript definitions (dev-only) |

Note: `bun-types` 1.3.11+ documents `listItem` metadata (index/depth/ordered)
that the **runtime** on bun 1.3.8 did not deliver. The render engine does
not rely on that metadata — see `decisions/005-render-engine-string-protocols.md`.
Bun was bumped 1.3.8 → 1.4.0 on 2026-08-27; the `listItem` metadata gap was
not re-checked (the renderer doesn't depend on it), but the bump did surface
a separate runtime defect — see the Bun `--compile` note below.

## Bun `--compile` columns=0 defect (load-bearing workaround)

Bun's `--compile` produces binaries where `process.stdout.columns`/`rows`
report **0** (not undefined) even when `isTTY` is true — observed in
Alacritty; Ghostty reports the real winsize and is unaffected. The naive
`process.stdout.columns || 80` idiom catches `undefined` but **not** `0`, so
the compiled binary silently regresses to 80 columns on the affected
terminals — okuda behaving like Glow, the exact behaviour the origin doc
exists to abolish. Confirmed by a published polyfill (`critique@0.1.140`,
`patch-terminal-dimensions.ts`) and Bun issue #23224 (TTY winsize reporting
is historically buggy across terminals).

**Workaround (in `src/width.ts` `terminalSize`):** treat `columns <= 0` as
falsy and fall back to `tput cols` / `tput lines`, which reads the winsize
directly via terminfo ioctl, bypassing Bun's broken path. `terminalCols()` /
`terminalRows()` are the single width source for both the streaming path
(`cli.ts`) and the TUI (`tui.ts` `dims()`). Verified on a real PTY: normal
case short-circuits, forced `columns=0` falls through to `tput` and returns
the true width.

The `tput` fallback is **load-bearing, not cosmetic**: a future Bun upgrade
that fixes the 0-bug does not make it redundant — it is the safety net for
the *next* winsize-reporting regression, and removing it reintroduces the
Alacritty failure. `tput` is present on every POSIX system with a terminfo
db; it is an implicit dependency of the compiled binary's width detection.

## Bun `--compile` signature defect (load-bearing re-sign)

`bun build --compile` emits a Mach-O whose adhoc, linker-signed
`CodeDirectory` carries **one stale page hash** — the last slot, which is
the only *partial* page (672 bytes at the tail of the `__LINKEDIT` symbol
string table). `codesign -vvv` reports `invalid signature (code or
signature have been modified)`, and macOS arm64 requires a **valid**
signature: the process is SIGKILLed on exec — exit 137, zero bytes, no
message. `zsh: killed` is that, and it reads exactly like a corrupt
artifact, a bad checkout, or a sandbox.

**macOS 26.6.2 tolerated it; macOS 27.0 does not.** Same bytes, same
compiler: the binary built 2026-09-16 ran twenty timed times on 2026-09-19
(`tmp/reload-cost-probe.py`) and was dead on 2026-09-21, the day after the
upgrade. Verified 2026-09-21, macOS 27.0 (26A428), arm64. The upgrade date
is in `system_profiler SPInstallHistoryDataType` — it is in no log this
silo keeps.

Four controls, and the first two are the ones that mislead:

| Binary | `codesign -vvv` | exec |
|--------|-----------------|------|
| as emitted | invalid signature | **exit 137** |
| re-signed `-s -` | valid on disk | exit 0 |
| signed, then +1 byte | failed strict validation | exit 0 |
| signature stripped | not signed at all | **exit 137** |

Bytes past `codeLimit` warn and the binary **runs** — so "trailing data" is
the plausible wrong answer. Stripping the signature is not a remedy either:
unsigned is killed too, so the requirement is a *valid* signature, not any
and not none.

**Workaround (in the `build` recipe):** the compile, then
`scripts/sign-binary.sh` to re-sign, then `scripts/signature-check.sh` to
verify. The re-sign must stay **after** the compile. The binary **shrinks** on
re-sign — 63,976,562 → 63,604,752 bytes — because Apple's `codesign` uses
16 KiB pages where the linker used 4 KiB. That is not damage.

`codesign` ships with macOS, so the re-sign adds no install — but it is a
**build dependency**, and the artifact's format decides what it means
(`ADR-BUILD-SIGNS-040`, amended 2026-10-22):

- **ELF (Linux native build).** No CodeDirectory, no signed pages. The sign step
  is a printed no-op and the check verifies the thing an ELF actually promises —
  that it *executes*.
- **Mach-O.** `codesign` re-signs where it exists. On a Linux host,
  `rcodesign` (apple-codesign — not in the Arch repos; the musl release binary
  works, 2026-10-22) is the same act: ad-hoc by default, `rcodesign sign okuda`.
  Measured against a cross-built darwin-arm64 artifact: superblob rewritten,
  flags `0x2`, every page hash still matching. `rcodesign verify` is **not** a
  verifier — it self-declares as *"known to be buggy"* and rejects a valid
  ad-hoc signature as *"no cryptographic signature present"* — so a Mach-O
  checked on a host without `codesign` exits **2, UNVERIFIED**, and never 0.

A Linux box therefore builds and gates natively today; minting a *darwin*
artifact from it (`bun build --compile --target=bun-darwin-arm64`) works too, but
its signature is unverifiable there. Run the gate where the artifact runs.

See `ADR-BUILD-SIGNS-040` and `docs/2026-09-21-the-page-the-signature-got-wrong.md`.

### `chroma` (verified 2026-10-22, macOS arm64 + Linux x64 — BRF-FENCE-COLOUR)

- **macOS**: `brew install chroma` (2.27.0).
- **Linux x64** (verified 2026-10-22): the release asset is a single static
  Go binary — `chroma-2.27.0-linux-amd64.tar.gz` from the GitHub release,
  checked against the release's own `chroma-2.27.0-checksums.txt`, extracted
  and copied to `~/.local/bin/chroma`. Not in the Arch repos; do not build
  from source, the pinned release is the same bytes everywhere. The
  `--version` output carries the build commit and timestamp
  (`2.27.0-a6d00fe-…-2026-06-17T02:11:19Z`), which is how a re-install is
  confirmed rather than assumed.
- **Pinned bytes**: `tests/fence-colour.test.ts` pins chroma's terminal16
  `--style monokai` output exactly; a chroma major bump re-pins (the
  version above is the pin). The colour tests `skipIf` an absent binary —
  the renderer degrades the same way the tests do.
- **Pinned style — `--style monokai`** (2026-09-29, same day): the style is
  the emphasis *map* — which token class lands in which 16-slot — while
  the hues stay the terminal's palette (no TrueColor, no 256, no hex; the
  brief's "no styles" clause meant the hue palette, which terminal16 never
  emits). Measured out: the default (swapoff) quantises identifiers — the
  bulk of every fence — to ANSI-white 37, gray on every dark terminal;
  monokai's quantised hierarchy is the classic contrast structure (cyan
  keywords, yellow function names, full-white identifiers, dim comments).
  A style change re-pins the tests and the smoke — both carry the bytes.
- **The alias table is load-bearing**: chroma never rejects an unknown
  `--lexer` (plaintext fallback, exit 0, empty stderr), so the renderer
  validates tags against `chroma --list` before piping. The table is
  chroma's; okuda owns no extension→language map.

## The protocol deploy target — a sibling silo's inbox (verified 2026-10-10)

`just protocol-install` publishes `system.md` into `cool-pi-extensions`'s inbox
(`msgs/from-*`). It is a **message, not a write**: the sender owns the cut, the
**receiver owns `SYSTEM.md` and the commit**. The machine's runtime chain —

```
~/.pi/agent/AGENTS.md
  -> cool-pi-extensions/prompts/edinburgh-protocol.md
     -> cool-pi-extensions/SYSTEM.md
```

— is the runtime's *read* path; this silo no longer writes through it. Repointing
the runtime off the chain is an operator action, named and not automated.
`just protocol-check` `cmp`s each sibling's `SYSTEM.md` against `system.md` and
names who is behind. See `docs/2026-10-10-the-seam.md` (the seam rule) and
`docs/2026-10-10-the-impostor-symlink.md`.

## Verification discipline

- Preconditions in briefs verify tools listed here (existence, version, behaviour) before work starts.
- Re-verify on environment change (new machine, PATH change, major version bump) and update the Verified date.
- A missing dependency halts the brief — it does not get worked around silently.
- A *silent* regression (columns=0) is a missing dependency in disguise — the `tput` fallback is the verification that the terminal, not just the runtime, reports its width. Re-verify width detection on every Bun major bump, on more than one terminal emulator.
- **An artifact's precondition is a dependency too.** The build emitted an unrunnable binary for four days because nothing verified the signature — the same shape as columns=0, a silent regression the runtime reports as success. `scripts/signature-check.sh`, run by `just check` and by `just build`, is that verification. **Re-run it on every OS major bump**: macOS 27 changed which signatures it enforces, and the compiler did not change at all.
