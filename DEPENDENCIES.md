# DEPENDENCIES — okuda

External tools this silo depends on. Brief preconditions verify against
this file — an entry with a verified date is a claim we have checked, not
an assumption.

| Tool | Version | Purpose | Verified |
|------|---------|---------|----------|
| `bun` | 1.4.0 | Runtime & renderer | 2026-08-27 |
| `just` | 1.53.0 | Task runner | 2026-08-20 |
| `git` | 2.54.0 | Version control | 2026-08-20 |
| `td` | 0.61.0 | Task management | 2026-08-27 |
| `mermaid-to-md` | 0.1.0* | Mermaid → ASCII | 2026-09-02 |
| `fzf` | 0.73.1 | Fuzzy picker — runtime dep of no-arg `gloam` mode | 2026-08-27 |
| `fd` | 10.4.2 | File finder — preferred by `gloam` (in-process walk if absent) | 2026-08-27 |

\* Self-reports as `mermaid-tui 0.1.0`, lives at `~/.local/bin/` — binary
name and package name differ. The origin doc's `spacex-mermaid` is stale;
`mermaid-to-md` is the real dependency.

### `mermaid-to-md` platforms (verified 2026-09-02, macOS + Linux)

- **macOS**: wrapper symlinked (the upstream repo's
  `scripts/mermaid-to-md.sh`) + the compiled `mermaid-tui` binary copied
  to `~/.local/bin/`.
- **Linux (Omarchy/Arch)**: verified 2026-09-02 after `cargo build
  --release` from source. **No GitHub release assets exist** — `install.sh`
  and the npm path are unexercised escape hatches; a fresh Linux box builds
  from source: clone `pjsvis/mermaid-to-md`, `cargo build --release`,
  `cp target/release/mermaid-tui ~/.local/bin/`, symlink the wrapper.
  (The wrapper's repo-relative binary resolution does not survive the
  symlink; it finds the binary via its PATH fallback — so the binary must
  be *copied*, not linked, or installed somewhere on PATH.)
- The symptom of a missing binary on a fresh machine is four opaque
  failures in `tests/table-diagram.test.ts`; a precondition test there now
  names the dependency before the diagram tests run.

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

The pair (`fzf`, `fd`) serves the no-arg `gloam` launcher (see
`src/launcher.ts`, ADR-016). `fzf` is a runtime dep of that mode
(clean error + exit 1 if missing); `fd` is preferred but has an
in-process recursive-walk fallback. The `okuda <file>` reader does
not require either.

## Runtime dependency note

The compiled okuda binary has zero external npm runtime dependencies;
`mermaid-to-md` is its one runtime dependency — invoked per `mermaid`
code fence via `Bun.spawn`, never parsed in-process.

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

## Verification discipline

- Preconditions in briefs verify tools listed here (existence, version, behaviour) before work starts.
- Re-verify on environment change (new machine, PATH change, major version bump) and update the Verified date.
- A missing dependency halts the brief — it does not get worked around silently.
- A *silent* regression (columns=0) is a missing dependency in disguise — the `tput` fallback is the verification that the terminal, not just the runtime, reports its width. Re-verify width detection on every Bun major bump, on more than one terminal emulator.
