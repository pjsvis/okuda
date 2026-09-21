---
date: 2026-09-21
kind: design note — a measured defect in the build, its exact shape, the OS upgrade that armed it, and a fork in where the remedy goes
lineage: the reader's terminal, 2026-09-21, verbatim — `M okuda docs/ornament-that-pays-rent ● ? ✗ gloam` / `zsh: killed     gloam`; then the reader, same session — *"we have upgraded from OS 26 to OS27"*, which closed the one question this note had left open. Written against `justfile`, `.gitignore`, `tmp/macho-signature-probe.py`, `system_profiler SPInstallHistoryDataType`, and a `bun build --compile` run on Bun 1.4.0 under macOS 27.0 (26A428), arm64.
status: closed for the signature — `ADR-BUILD-SIGNS-040` landed the re-sign in `build` and the check in the gate. Open for the two further defects this note reports: the diagram-swallow at `src/render.ts:155-160`, and `facade-lint.sh`'s silent exit 1.
---

# One stale page hash is enough to kill the binary

> ◆ `bun build --compile` signs its own output and gets exactly one page wrong — the
> last one, a partial page of 672 bytes at the tail of the `__LINKEDIT` string table.
> macOS 27 requires a *valid* signature on arm64 and kills the process on exec: exit
> 137, zero bytes, no message. Every build, byte-for-byte reproducible. So this was
> never a corrupt artifact and never the sandbox — and `codesign --force --sign - okuda`
> fixes it, which is one line the `build` recipe does not have.

## What we are deciding

Where the re-signing step goes. The defect is not in question and neither is the
remedy; the only open question is whether the build owns it or the install does.

There is a second, smaller thing on the same screen, and it is worth separating
because it is a different class of error: the `gloam` the reader saw in the status
line and the `gloam` that was killed are **not the same `gloam`**. That is below, and
it is the reason the first line of the report reads as two problems when it is one.

## What the build does

`justfile:337-338` is the whole recipe:

```
@bun build --compile --define BUILD_SHA=... src/cli.ts --outfile okuda
```

One line, `justfile:338`. The elided value is the commit stamp —
`"BUILD_SHA=\"$(git rev-parse --short=7 HEAD)\""` — quoted here rather than in the
block because the block is the shape and the stamp is not part of the finding.

One command, and it produces the binary and its signature in the same pass. Bun emits
a Mach-O with an **adhoc, linker-signed** `CodeDirectory` (`flags=0x20002`) over
4 KiB pages. The file is three regions, measured — 15,498 pages from byte 0 to
63,479,808 that all verify, the 672-byte partial page at 63,479,808 that does not, and
the 496,082-byte signature blob from 63,480,480 to the end:

```mermaid
title: The page census — 15,498 pages verify, one is stale
flowchart TD
    A[63,976,562 bytes] --> B[15,498 pages verify]
    A --> C[one page is stale]
```

The middle region is the finding. The other two are why it took so long to see — a
signature that is 99.9% right is a signature that verifies everywhere except the one
place nobody looks.

**A note on the diagram's shape, and a lesson this repo had already recorded.** The
first version of this fence carried the three byte ranges as node labels, at
`flowchart LR`, and rendered as a *source box* — `This diagram is too wide to display
here` — not as art. The remedy is not a smaller diagram, it is the layout: **`flowchart
TD` with two-word labels.** That is commit `c502f10`, which took `ADR-PERIMETER-039`'s
diagram from overflow to 38 columns on 2026-09-18, and the rule is recorded twice over —
in `PLY-MERMAID-DIAGRAMS` and in `DEPENDENCIES.md`, *"Wide `flowchart LR` with long node
labels hits this; short labels at the same node count do not"* (`:59-60`). **The finding
was already in the silo, twice, and this note re-derived it** — which is the drift the
ledger exists to stop, and it is the second time in this note that the record was right
and the session did not look. Two consequences for the fence above: it is `TD`, and
**the byte ranges live in the prose, not in the picture**, because a diagram carrying
the only copy of a number can silently delete it.

`codeLimit` is 63,480,480 and the signature blob begins at 63,480,480, so the
signature covers everything it claims to and stops exactly where it should. There are
**no bytes past the signed segment.** The structure is correct. Only one hash is wrong.

## The defect in one example

`tmp/macho-signature-probe.py`, 2026-09-21, against a freshly built binary:

```
/tmp/okuda-broken
  file size              63,976,562
  LC_CODE_SIGNATURE      63,480,480  (blob 496,082)
  CodeDirectory             496,062  flags 0x20002
  page size                   4,096  (2^12)
  code slots                 15,499
  codeLimit              63,480,480
  codeLimit == sigoff?         True
  bytes past codeLimit      496,082
  final page is partial         672 bytes
  MISMATCHING SLOTS               1 of 15,499
    indices            [15498]
    last bad page at     63,479,808  (99.2% into file)
  exec --version       exit -9, 0 bytes on stdout
```

Slot 15,498 is the last slot, and the last slot is the only **partial** one — 672
bytes, the tail of the mangled-symbol string table, ending in seven null bytes. The
stored hash is not `sha256` of the bytes now at that offset, not `sha256` of an empty
slice, and not `sha256` of 672 zeros. It is a hash of *some* final page, and not this
one.

`codesign -vvv okuda` says `invalid signature (code or signature have been modified)`
— which is accurate and misleading at once: nothing modified the file after signing.
Bun wrote a hash for a page it had not finished writing.

`exit -9` is signal 9. The shell prints `zsh: killed`, and `$?` is 137. Both readings
describe one event.

## How far it reaches

Four binaries, four treatments. This is the table that took the longest to believe,
because the first two rows suggest a cause the last two refute:

| Binary | `codesign -vvv` | exec |
|---|---|---|
| `bun build --compile` output | invalid signature | **exit 137** |
| the same, then `codesign -s -` | valid on disk | exit 0 |
| the same signed, then +1 byte | failed strict validation | exit 0 |
| the same with the signature stripped | not signed at all | **exit 137** |

- **Row 3 is the control that killed the first story.** Bytes past `codeLimit` produce
  a *strict validation* warning and the binary **runs**. So trailing data is not fatal
  here, and the defect is not trailing data.
- **Row 4 kills the opposite reading** — that macOS tolerates an unsigned local binary
  and only a *broken* signature is fatal. It does not tolerate it. The requirement is a
  valid signature, not any signature and not none.
- **Row 1 reproduces from a clean build.** The tree's binary is 63,976,562 bytes with a
  `CodeDirectory` of 496,062 and one stale slot; a fresh `bun build --compile` on the
  same machine is 63,976,562 bytes with a `CodeDirectory` of 496,062 and one stale slot
  at index 15,498. Same size, same index, same defect.

So this is not a corrupted artifact, not a stale checkout, and not a sandbox artefact.
The earlier attribution of exit 137 to the agent's sandbox was wrong, and the reader's
own terminal is what falsified it.

## The change is macOS 27 — established, after being marked open

This section began as *"whether this is a Bun regression or a macOS 27 enforcement
change is not tested"*. The reader then said the machine had been upgraded from OS 26 to
OS 27, and the dates settle it. Nothing in the compiler or the binary moved; the OS did:

| Event | When |
|---|---|
| `bun` 1.4.0 installed (mtime, unchanged) | 2026-08-20 02:23 |
| `okuda` built (mtime, unchanged) | 2026-09-16 21:34 |
| last macOS **26.6.2** update | 2026-09-19 01:46 |
| **20 timed runs of `./okuda`** | **2026-09-19 09:51** |
| **macOS 27.0 installed** | **2026-09-20 16:29** |
| these measurements | 2026-09-21 |

`tmp/reload-cost-probe.py:39` runs `./okuda --entries "load bearing"` twenty times and
counts the rows on stdout; `briefs/2026-09-19-brief-gloam-owns-the-loop.md:21` records
**320 rows** at 40.3 ms. Twenty successful executions of *these exact bytes* — under
macOS 26.6.2, four days before the upgrade. So macOS 26 ran a binary whose adhoc
signature fails `codesign` verification, and macOS 27 kills it.

**The flag is not the discriminator.** A census of `~/.local/bin` finds twelve
locally-built Mach-O binaries; all twelve verify. `mermaid-tui` and `uv` are both
`flags=0x20002(adhoc,linker-signed)` — the same class as `okuda` — and both run. So this
is not macOS 27 rejecting a *class* of binary, and it is not an OS-wide breakage: it is
one invalid signature, and macOS 27 stopped tolerating it. **The mechanism inside
macOS 27 is not established.** A candidate reading — macOS 26 did not validate
linker-signed adhoc signatures and 27 does — is marked as a candidate, not a finding.

**Still not established:** *why* Bun's final page is stale. The write order above — sign,
then rewrite the tail — is consistent with the evidence, not a measurement, and would
need Bun's source to confirm.

The practical consequence is unchanged, and it is the reason the fork below still
matters: **on this machine the build has been emitting a binary that a future OS will
kill, and the OS arrived.** The defect was latent for four days and invisible because
nothing verified the signature.

## Two things called `gloam`

The status line reads as two problems and is one:

- **`gloam` (the command)** is `~/.local/bin/gloam`, a symlink to the repo's `okuda`
  (`justfile:345`). It died of the signature. `okuda` and `gloam` are one binary and
  one defect — `ADR-016`'s two names, one file.
- **`gloam` (the file in the repo root)** is not that. It is a 45-byte untracked text
  file, mode `-rw-------`, mtime 2026-09-20 03:37, whose entire content is the single
  line `/Users/petersmith/dev/github/okuda/&alpha.md`. It is not executable and has
  nothing to do with the kill. It is also not in the silo, so by the silo principle it
  does not exist — and it should not. **Deleting it is a separate, trivial act** and
  not this note's work.
- **`M okuda`** cannot be git status: `.gitignore:11` ignores `okuda`, and
  `git check-ignore -v okuda` confirms it. The `M` is the status line's own reading of
  the artifact, not a tracked modification.

A file and a command sharing a name, one of them a phantom, is the exact shape
`ADR-027`'s *phantom referents* names.

## The same shape, one layer up

A second silent failure turned up while verifying this note's own diagram, and it is the
same shape as the first — **a failure that leaves no trace.**

`okuda` pipes a mermaid fence to `mermaid-to-md` (`src/render.ts:146-155`) and, on any
non-zero exit, falls through and returns `""` (`:160`). The child's stderr is piped at
`:149` and never read. So a failed render produces **nothing**: no diagram, no fallback
caption, no warning, and exit 0.

Measured 2026-09-21. `mermaid-to-md` is a shim that resolves `mermaid-tui` with
`command -v` (`mermaid-to-md.sh:23`). In a non-interactive shell `~/.zshrc` is not
sourced, so `~/.local/bin` is not on `PATH`, and the shim exits **1** with
`Error: mermaid-tui not found` on stderr. `mermaid-tui` is installed and works
(`~/.local/bin/mermaid-tui`, 700,928 bytes, valid signature, `mermaid-tui 0.1.0`), and
the reader's own shell carries the entry (`~/.zshrc:178`). **The reader sees diagrams;
an agent shell does not.**

**The trap is the pair, not either half.** A loud upstream failure — exit 1, a clear
message — becomes a silent downstream loss, and the only evidence is a render that is
simply shorter. **An agent verifying a render must put `~/.local/bin` on `PATH` first**,
or it will diagnose its own environment as a document defect. That happened here, twice.

The correction that produced this section is worth recording for its own sake: the
first measurement of the shim's exit status was `... | head -20; echo "exit=$?"`, which
reports **`head`'s** status. The shim was written down as "exits 0" when it exits 1 —
the same pipe, and the same mistake, as `facade-lint.sh` in the gate.

## The fork — decided, and landed

Both options fix it. They differed in who is responsible when the next tool signs badly.
**Option A was chosen and landed on 2026-09-21**; the decision record is
`ADR-BUILD-SIGNS-040`, and this section is kept as the reasoning it was made from.

- **A — sign in `build`.** Append `codesign --force --sign - okuda` to
  `justfile:337-338`, so the artifact is valid the moment it exists. One recipe owns
  both halves of "produce a runnable binary", which is what the recipe claims to do
  today. Cost: `codesign` becomes a build dependency, and it is present on every macOS
  that can run this binary at all. **Chosen.** The recipe now compiles, re-signs, and
  then runs `scripts/signature-check.sh`, so the recipe's success means *runnable*
  rather than *the compiler exited 0*.
- **B — sign in `install` and `gloam`.** Leave `build` emitting what Bun emits, and
  sign at the point the binary is put on `PATH` (`justfile:342-345`) or executed
  (`justfile:349-351`). Cost: `./okuda` is still dead after a bare `just build`, and
  `gloam` pays a `codesign` on every invocation unless it checks first. **Rejected** —
  it leaves the defect in place at the point of production and repairs it downstream,
  which is the arrangement that produced this note.

**A third option is not on the table:** stripping the signature. Row 4 measured it, and
it does not run.

## What is not in question

- **The rendering path.** Nothing in `src/` is implicated *in the signature*: the binary
  was never wrong about markdown. The diagram-swallow above does implicate
  `src/render.ts:155-160`, and it is a different defect with a different owner.
- **`BUILD_SHA`.** Both the committed stamp and a test stamp produce the defect
  identically, so the `--define` is not the trigger.
- **The sandbox.** Falsified above, by the reader.
- **Bun as a runtime.** This is `bun build --compile`'s output, not Bun's execution.

## Where I landed

**Option A**, and the gate notices: `just check` runs `scripts/signature-check.sh`
first, and `just build` runs it after the re-sign — so a build that emits an unrunnable
artifact can no longer report success, which is the failure this note is about. The
verification is one command and it is already the thing we ran to find this.

What would have changed my mind: evidence that `codesign` at build time breaks a
cross-compilation or CI path this repo cares about. There is no such path today.

## Evidence

- `tmp/macho-signature-probe.py` — the instrument. Prints the mismatching **slot
  indices**, not a count, because "the last one" and "the first three" are different
  defects; runs the binary and prints its exit status in the same block, so validity
  and runnability are never inferred from each other. Its docstring carries the four
  controls and the falsified hypothesis.
- **One probe defect, found and fixed while writing this.** The first version passed a
  relative path to `subprocess.run`, which resolves through `PATH`, so `okuda` reported
  `OSError 2` — a probe artefact that reads exactly like a missing binary. Fixed to
  `os.path.abspath`. Recorded because it is the same class as the finding: a plausible
  output that names the wrong cause.
- `codesign -dvvv okuda` — `flags=0x20002(adhoc,linker-signed)`, `Identifier=a.out`.
- **`system_profiler SPInstallHistoryDataType`** — the instrument that settled the OS
  question. It reports `macOS 27.0` installed **20/09/2026 16:29**, against a last
  `macOS 26.6.2` update at 19/09/2026 01:46. Worth knowing as a probe: the upgrade date
  is not in any log this repo keeps, and it was the reader's one sentence that pointed
  at it.
- **A census of `~/.local/bin`** — twelve locally-built Mach-O binaries, **all twelve
  verify**, including two linker-signed ones (`mermaid-tui`, `uv`). This is what rules
  out "macOS 27 rejects this class of binary" and localises the defect to one artifact.
- **The mermaid shim, measured three ways.** `mermaid-to-md < d.mmd` with no `PATH`
  entry → exit **1**, 99 bytes on stderr, 0 on stdout. The same with `~/.local/bin`
  prepended → exit 0, a rendered box. `./okuda /tmp/mtest.md` on a minimal fence → the
  diagram present with the entry, absent without it, and **stderr empty in both cases**.
- The repo's `okuda` is now re-signed by hand: 63,976,562 → 63,604,752 bytes, because
  Apple's `codesign` uses 16 KiB pages (3,875 slots) where the linker used 4 KiB
  (15,499). `./okuda --version` → `okuda 0.1.0 (0a0b3b3)`, exit 0.

## Related

- `justfile` — `:337-338` the build, `:342-345` the install, `:349-351` the launcher
- `.gitignore` — `:11`, the line that makes `M okuda` impossible
- `decisions/016-argv0-launcher-dispatch.md` — the two names, one binary
- `decisions/027-temperament-is-downstream-of-discipline.md` — the barnacle classes this screen is a clean specimen of
- `briefs/2026-09-19-brief-gloam-owns-the-loop.md` — the live brief for this launcher; its preconditions assume a binary that runs, and its `:21` is the proof the binary did
- `src/render.ts` — `:146-160` the swallow, `:155` the exit-code check that discards its finding
- `~/Dev/GitHub/mermaid-to-md/scripts/mermaid-to-md.sh` — `:23` the `command -v` fallback that makes a PATH entry load-bearing
- `docs/2026-09-21-the-model-beside-the-loop.md` — the same day's note; two measured defects there, a third here
- `~/.workbuddy-ai/skills/macho-signature-triage/SKILL.md` — the reusable procedure this produced
