# Implementation Brief: `termcomp`

## Introduction

This text was pasted from a Brave AI session. It has some interesting ideas. 
But it seems to reject true colour, which is a bit harsh. 

Let's not throw out the baby with the bathwater and rather implement the Baby Extraction Protocol.

## What it is

A PTY filter that sits between a CLI tool and the terminal. It intercepts SGR escape sequences and enforces one invariant: **explicit truecolor background color is stripped, preserving the terminal's fg/bg rest state as the ground.** It does not render. It does not theme. It does not interpret semantic intent.

## Architecture

```
┌──────────┐  slave   ┌──────────────┐  stdout  ┌──────────┐
│  child    │◄────────►│  termcomp    │─────────►│ terminal │
│  (tool)   │  master  │  (filter)    │◄─────────│          │
└──────────┘          └──────────────┘  stdin   └──────────┘
```

- Single process, no daemon, no IPC.
- Opens a PTY pair via `openpty()` (or `posix_openpt`/`grantpt`/`unlockpt`/`ptsname` on systems without `openpty`).
- `fork()` + `execvp()` for the child.
- `poll()` loop on the master fd and `STDIN_FILENO`.
- Terminal size propagated via `TIOCSWINSZ` on slave; `SIGWINCH` handler re-propagates.
- No dependencies beyond libc (Rust: `nix` crate for `openpty`/`ioctl`, or pure `libc` calls).

## State machine

Four states. Byte-oriented, not line-oriented. State persists across `read()` calls.

```
NORMAL
  on 0x1b → ESC
  else    → emit byte

ESC
  on 0x5b ('[') → CSI, clear accumulator
  else          → emit 0x1b + byte, → NORMAL

CSI
  on byte in 0x40..0x7e (final byte) →
      if byte == 'm' → parse SGR from accumulator, apply policy, emit result
      else → emit ESC [ accumulator + byte verbatim
      → NORMAL
  else → append byte to accumulator
```

OSC sequences (`ESC ]`) are **passed through untouched** in v1. Do not parse them.

## SGR parsing

On entering the SGR path, split the accumulator on `;` into a list of integers (default 0 if empty). Walk the list:

| Param | Action |
|-------|--------|
| `0` | Pass through (full reset) |
| `30`–`37`, `90`–`97` | Pass through (fg ANSI) |
| `38;5;N` | Pass through (fg 256-color) |
| `38;2;R;G;B` | If `--remap-fg-to-ansi16`: compute nearest ANSI 16 index, emit `38;5;N`. Else pass through. |
| `39` | Pass through (default fg) |
| `40`–`47`, `100`–`107` | Pass through (bg ANSI) |
| `48;5;N` | If `--strip-bg256`: drop. Else pass through. |
| `48;2;R;G;B` | If `--strip-bg` (default on): **drop**. Else pass through. |
| `49` | Pass through (default bg) |
| `1`, `3`, `4`, `5`, `7`, `21`–`29`, `52`–`58`, `100`–`107` | Pass through (attributes) |
| Unknown | Pass through |

When dropping a param group, remove it from the output list. If the resulting list is empty, emit `ESC[0m` (full reset) — do not emit a bare `ESC[m`.

**Nearest-ANSI-16 remap** (for `--remap-fg-to-ansi16`): use the standard 16-color RGB values (black `#000000`, red `#800000`, green `#008000`, yellow `#808000`, blue `#000080`, magenta `#800080`, cyan `#008080`, white `#c0c0c0`, and bright variants at `#808080`, `#ff0000`, `#00ff00`, `#ffff00`, `#0000ff`, `#ff00ff`, `#00ffff`, `#ffffff`). Euclidean distance in RGB space.

## CLI

```
termcomp [FLAGS] <command> [args...]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--strip-bg` | **on** | Drop `48;2;R;G;B` |
| `--strip-bg256` | off | Drop `48;5;N` |
| `--remap-fg-to-ansi16` | off | Remap `38;2;R;G;B` to nearest ANSI 16 |
| `--log` | off | Dump stripped sequences to stderr as hex |
| `--help` | — | Print usage |

No config file. No environment variables. The flags are the policy.

## Edge cases

- **Partial sequence at buffer boundary**: state machine carries state across `read()` calls. A `CSI` sequence split across two reads is a continuation.
- **Binary data**: if the child pipes binary (e.g. `cat image.png`), `0x1b` bytes in the data will enter `ESC` state. The next byte will not be `[`, so both bytes are emitted and state returns to `NORMAL`. This is correct and matches `less`/`tmux` behavior.
- **Interleaved SGR in one write**: `ESC[48;2;30;30;46mESC[32m` in a single buffer. The state machine handles this sequentially — strip the bg, pass through the fg.
- **Empty SGR** (`ESC[m`): treat as `ESC[0m` (full reset), pass through.
- **Multiple SGR in one sequence** (`ESC[1;31;42m`): parse all params, apply policy to each, re-emit the surviving params.
- **`SIGWINCH`**: re-issue `TIOCSWINSZ` on the slave fd.
- **Child exit**: close master, exit with child's exit code.
- **`STDIN` EOF**: write `EOF` to master (or close it), let child see EOF.

## Constraints — what NOT to build

- No theme engine. No palette remapping beyond the single `--remap-fg-to-ansi16` flag.
- No OSC parsing. Pass through.
- No alternate screen handling.
- No scrollback.
- No session management.
- No plugin system.
- No config file format.
- No "compositor manifest."
- No dependencies beyond `libc` (Rust: `nix` for `openpty`, or `libc` directly).
- No CI matrix. One platform (Linux or macOS) is fine for v1.

## Acceptance criteria

1. `termcomp ls --color=always` produces identical output to `ls --color=always` (no truecolor bg in `ls` output, so no-op).
2. `termcomp --log python3 -c "print('\033[48;2;30;30;46mhello')" ` outputs `hello` with the bg stripped, and logs the stripped sequence to stderr.
3. `termcomp --strip-bg -- python3 -c "print('\033[48;2;30;30;46m\033[32mhello')" ` outputs `hello` in green on the terminal's default bg.
4. `termcomp --remap-fg-to-ansi16 -- python3 -c "print('\033[38;2;255;0;0mred')" ` outputs `red` in ANSI red (`ESC[38;5;1m`), not truecolor.
5. `termcomp bash` gives a fully interactive shell with no latency perceptible to a human.
6. `termcomp -- python3 -c "import sys; sys.stdout.buffer.write(b'\x1b[48;2;1;2;3m')"` followed by `cat` does not break the terminal (state machine doesn't get stuck in `CSI`).
7. Binary is < 2 MB static. Compiles in < 30 seconds.

## Language

Rust. Edition 2021. Single `src/main.rs`. No workspace. `Cargo.toml` with `nix` as the only dependency (for `openpty`, `ioctl`, `poll`). If `nix` is unavailable or the agent prefers C, C is acceptable: single `.c` file, `gcc -O2 -o termcomp main.c -lutil`.

