---
type: Debrief
callsign: DBF-OMARCHY-TOOLCHAIN
briefs: []
---

# Debrief: The toolchain answers — and the diagram pipe was already dead

**Date:** 2026-10-22
**Status:** Done — mermaid-to-md built from source and installed on Omarchy,
chroma 2.27.0 installed at the pin, `DEPENDENCIES.md` carries the verified
procedures. One upstream defect found and fixed (`51f5225`). Three test failures
remain, filed as an opinion rather than repaired here.

## What was asked, and what it turned into

Three small provisioning acts — build `pjsvis/mermaid-to-md`, install `chroma`,
refresh `DEPENDENCIES.md` — and one of them answered a question the previous
session had left open with *"the diagram pipe is dead on this box."*

The install worked. The pipe did not, and not for the reason anyone would have
guessed from the dependency table: both binaries were present and correct, the
wrapper resolved, the engine rendered, and **every diagram okuda drew still came
out as nothing**. Measured before and after, same document:

```
  okuda · tmp/diag.md            ← before: header, then empty space
  okuda · tmp/diag.md            ← after: the diagram, then `⋮ source elided`
  ┌───────┐    ┌─────────┐
  │ okuda ├───▶│ diagram │
  └───────┘    └─────────┘
```

## The defect: reopening a pipe you were handed

The wrapper's bake mode ended with `} > "${outfile:-/dev/stdout}"`. That is not
"write to stdout" — it is a **fresh `open()` of `/proc/self/fd/1`**, and it only
works if the opener and the fd's owner agree about what that path means. A caller
that created the pipe itself gets `ENXIO`:

```
bun spawn, stdout=pipe : bash: line 234: /dev/stdout: No such device or address
same bytes, bash pipe   : renders, exit 0
```

okuda pipes every mermaid fence through `Bun.spawn`, so the wrapper failed on
every fence, printed one line to stderr that okuda does not read, and exited 1
with empty stdout — which the renderer treats as *nothing to draw*. The swallow
recorded at `src/render.ts` (in `ADR-BUILD-SIGNS-040`'s "not fixed here" list)
turned a loud failure into a blank line. Two defects, stacked, either of which
alone would have been visible.

Fixed upstream in `pjsvis/mermaid-to-md` (`51f5225`): emit to the fd already
inherited, and `exec > "$outfile"` only when `-o` names a file. Their suite:
66/66 assertions. The local clone is symlinked into `~/.local/bin`, so the fix
went live without reinstalling anything.

## The measurement ladder, since "it works on my terminal" was true and useless

| Caller | `<cmd>` | `<cmd> > /dev/stdout` |
|---|---|---|
| bash, terminal | 0 | 0 |
| bash, pipeline | 0 | 0 |
| `Bun.spawn`, pipe | 0 | **1, `ENXIO`** |

The rule this leaves behind: **write to the fd you were given; do not reopen it
by path.** A path that names "myself" is a claim about who owns the process
topology, and the caller owns it.

## What landed

- `mermaid-to-md` — cloned, pulled to `793a7d3`, `cargo build --release`
  (2.5 s warm), binary copied to `~/.local/bin/mermaid-tui`, wrapper symlinked.
  The symlink is live: **the clone is part of the dependency**, and `git pull`
  in it updates the installed wrapper.
- `chroma` — 2.27.0, the exact pin, because `tests/fence-colour.test.ts` pins
  its terminal16 `--style monokai` bytes. Release tarball checked against the
  release's own `chroma-2.27.0-checksums.txt` (sha256 matched), extracted,
  copied to `~/.local/bin`. Not an Arch package; do not build from source. A
  re-install is confirmed by the version's build stamp
  (`2.27.0-a6d00fe-…-2026-06-17T02:11:19Z`), not by its presence.
- `DEPENDENCIES.md` — the two rows re-dated and re-versioned, the Linux
  procedure written as it was actually run, and the `/dev/stdout` regression
  recorded with its symptom, so a future wrapper bump that reintroduces it is
  recognised in one reading instead of one session.

`bun test`: **796 pass, 3 fail** (was 779/12). `just colour-smoke` green:
3/3 classes painted across the corpus.

## The three failures that remain — a test defect, not a product one

`clone`/`editor` assert that the spawn rides `zsh`. The *code* reads
`process.env.SHELL ?? "/bin/zsh"`, correctly; on Omarchy that is
`/usr/bin/bash`, so the spec returns bash and the test fails. The grammar under
test is *"spawn through the user's interactive login shell"*, and the assertion
hardcodes one machine's shell instead. Not repaired here: it is a hermeticity
defect in a test, it wants its own decision (inject the shell, or assert against
the environment), and this session was already carrying an upstream fix.

## Files

- `DEPENDENCIES.md` — rows and the two procedure sections
- `~/dev/github/mermaid-to-md` (separate repo) — `51f5225`, pushed to `main`
- `debriefs/2026-10-22-debrief-the-gate-names-its-format.md` — the sibling session
  this one inherited its dead-pipe question from
