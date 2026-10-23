---
type: Brief
callsign: BRF-DARWIN-CLOSE-OUT
---

# Brief: The darwin close-out — turn one promise into a measurement, and stop two paths guessing

**Date:** 2026-10-22
**Status:** Open — **P1 done on a Mac, 2026-10-17** (evidence below). P2 and P3
remain, and P2 is the operator's call: it removes verbs they use. Written on the
Omarchy box, which cannot execute any of P1.

## Context

Two sessions on the Linux box (`DBF-PLATFORM-GATE`, `DBF-TOOLCHAIN-TRUTH`,
`DBF-OMARCHY-TOOLCHAIN`) took okuda from *"compiles on Linux and cannot build"*
to `just ship` green, `bun test` 804/0, and a renderer proven byte-identical.
That work left exactly two kinds of debt, and both live on the Mac:

1. **One promise.** The darwin branch of the signature gate (`codesign
   --verify --strict`, and `codesign --force --sign -` in the sign step) was
   never executed on a Mac. It is stub-tested — a fake `codesign` that exits 0
   or 1 — which proves the dispatch, not the tool. Every other claim in
   `DEPENDENCIES.md` has an instrument that has actually failed at least once.
   This one does not.
2. **Two integrations that guess.** On Linux, `terminal` and `edit-terminal`
   refuse honestly (*"macOS-only — use ghostty, tmux, or cmd"*), and
   `ghostty`/`ghostty-edit` build a spawn spec pointing at
   `/Applications/Ghostty.app/Contents/MacOS/ghostty` — a path that cannot
   exist there, where ghostty lives at `/usr/bin/ghostty`. `scripts/paper.ts`
   does the same with the Chrome bundle path. Two paths refuse, three guess,
   and the guess is the failure `ADR-031`'s honest-refusal rule exists to
   prevent.

The Mac is the machine where all five of those paths are *supposed* to work,
which makes it the right place to decide what they should say when they don't.

## Preconditions — verify, do not assume

| Thing | Where to check | Why it matters |
|---|---|---|
| `codesign` on `PATH` | `command -v codesign` | P1's whole subject |
| `mermaid-to-md` at wrapper `51f5225` or later | `cd ~/dev/github/mermaid-to-md && git log --oneline -1` | **Before anything else.** The wrapper's bake mode reopened `/dev/stdout`, which fails with ENXIO when the caller owns the pipe — `Bun.spawn` owns it. Every mermaid fence renders to nothing on an older wrapper, on *any* platform. `git pull`, `cargo build --release`, `cp target/release/mermaid-tui ~/.local/bin/`, and confirm the symlink still points at `scripts/mermaid-to-md.sh` |
| `chroma` version | `chroma --version` | A test now asserts `2.27.0`. If brew has moved on it fails *naming the pin*, by design — either install the pin or re-pin the bytes deliberately |
| Ghostty installed at the bundle path | `ls /Applications/Ghostty.app/Contents/MacOS/ghostty` | P2's subject |
| Google Chrome installed | `ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` | P1's paper rung |

`DEPENDENCIES.md` is the source of truth and now carries a `Proven by` column —
every row names the instrument that can fail for it. A row with an empty prover
is a finding, not a gap in the table.

## P1 — the darwin verification (the promise)

Run, and **record the command and its output** for each:

```bash
just build          # compile → scripts/sign-binary.sh (codesign) → signature-check.sh
just check          # the gate, signature-check first
just ship           # tests → check → build → install → fresh
bun test            # expect 0 fail on a Mac (the three shell specs are now injected)
```

Then the four things Linux could not touch:

1. **The signature, read strictly.** `codesign -vvv okuda` and
   `codesign --verify --strict okuda` on the built binary. The gate's remedy
   text (`codesign --force --sign -`) must be the thing that actually ran.
2. **A diagram.** `just showcase`, or any doc with a mermaid fence, on a real
   terminal. Expected: the art **and** the `⋮ mermaid source elided` receipt.
   If the art is missing and a `▸ diagram unavailable · …` line is in its place,
   the receipt is doing its job — report the reason string verbatim; that is the
   string the Linux box could only simulate.
3. **`just pdf`** (the paper rung — headless Chrome). It has never run in these
   sessions on either platform.
4. **The osascript paths.** `okuda --clone terminal <doc>` and the
   `edit-terminal` verb, on a document you do not mind a new window for.

**Optional and valuable — the cross-build.** The Linux box can mint a darwin
artifact: `bun build --compile --target=bun-darwin-arm64 --define
"BUILD_SHA=\"probe\"" src/cli.ts --outfile /tmp/okuda-darwin-arm64`. That
artifact's ad-hoc linker signature audits clean from Linux (flags `0x20002`,
4 KiB pages, all 17,191 page hashes matching, `codeLimit` at the signature
offset) but **cannot be validated there** — `rcodesign verify` refuses to be a
witness. If the file is carried over, run `codesign -vvv` and execute it. That
converts the last "unverifiable" row in the cross-platform table into evidence,
in either direction.

## P1 — the evidence, recorded on a Mac (2026-10-17)

Run in one session on macOS arm64 (cut `c6ace0e` + the two fixes below).
The preconditions held except two, and both were repaired rather than worked
around.

### The preconditions

| Thing | State | Action |
| --- | --- | --- |
| `codesign` on PATH | ✓ `/usr/bin/codesign` | — |
| `mermaid-to-md` at `51f5225`+ | clone was 1 behind | fast-forwarded to `51f5225`; `scripts/mermaid-to-md.sh` is what `~/.local/bin/mermaid-to-md` symlinks to, so the fix took effect without a rebuild. The Rust binary **was** stale — re-installed from a fresh `cargo build --release` (Aug 19 build → Oct 5 build, `mermaid-tui 0.1.0`) |
| `chroma` at the pin | **failed**: `brew` 2.27.0 prints `?-?-?` | replaced with the upstream `chroma-2.27.0-darwin-arm64.tar.gz`, sha256 `92f418f…4a5115` matched against the release's `chroma-2.27.0-checksums.txt`, installed to `~/.local/bin/chroma` (position 4 on PATH, ahead of `/opt/homebrew/bin`). Now prints `2.27.0-a6d00fe2cdfc88da0b91396e577da16c75c9c7fb-2026-06-17T02:11:19Z` |
| Ghostty at the bundle path | ✓ | — |
| Chrome at the bundle path | ✓ | — |

**`brew`'s build is the wrong bytes for this purpose, not the wrong version.**
Same 2.27.0, no version metadata, so `tests/fence-colour.test.ts` could neither
prove nor disprove the pin. `DEPENDENCIES.md`'s macOS row is corrected to the
release asset, matching the Linux procedure — one prover on both platforms
instead of two.

**One test fixture was a Linux path.** `tests/table-diagram.test.ts` passed
`mermaidBin: "/bin/false"`; macOS has no `/bin/false`, `posix_spawn` returns
ENOENT, and `src/render.ts:187` correctly reported *"not found (/bin/false)"* —
the absent case, not the failing-binary case the test is about. The test now
resolves `/usr/bin/false` first, using the idiom its neighbour already used.
The production code was right and is unchanged.

### The five commands

```
$ just build
  [41ms]  bundle  17 modules
 [206ms] compile  okuda
okuda: replacing existing signature
sign-binary: re-signed with codesign (ad-hoc)
signature-check: OK — okuda verifies

$ just check
exit 0 — green, signature-check first

$ just ship
 804 pass, 0 fail · 7241 expect() calls · 42 files
signature-check: OK — okuda verifies
fresh: OK — c6ace0e = HEAD, PATH resolves to this repo

$ bun test
 804 pass
 0 fail
 7241 expect() calls
Ran 804 tests across 42 files. [4.81s]
```

### The four things Linux could not touch

1. **The signature, read strictly.**

```
$ codesign -vvv okuda
okuda: valid on disk
okuda: satisfies its Designated Requirement
$ codesign --verify --strict okuda ; echo $?
0
$ codesign -dvv okuda
Identifier=okuda-555549444c4c440c55553144a11d99d1ccbeae57
Format=Mach-O thin (arm64)
CodeDirectory v=20400 size=124263 flags=0x2(adhoc) hashes=3877+2 location=embedded
Signature=adhoc
TeamIdentifier=not set
```

2. **A diagram**, from a document in the tree
(`docs/2026-10-17-not-worth-the-candle.md`) — art **and** the receipt:

```
  │ inline token │   │ sibling plain file │         │ app-owned store │
  └───────┬──────┘   └──────────┬─────────┘         └────────┬────────┘
          └──────────┬──────────┘                       ┌────┘
                     ▼                                  ▼
             ┌───────────────┐                ┌───────────────────┐
             │ portable text │                │ locked to the app │
             └───────────────┘                └───────────────────┘
  ⋮ mermaid source elided
```

3. **`just pdf`** — first run on either platform:

```
$ just pdf docs/2026-10-17-the-passage-and-the-frame.md
paper: …/tmp/paper/2026-10-17-the-passage-and-the-frame.pdf, 107 KB
  render: compiled binary · 80 cols at 10pt · receipt dropped · 66 lines/page · html kept at tmp/paper/
```

4. **The osascript paths — not run.** `okuda --clone terminal` and
`edit-terminal` open a window on the operator's desktop; that is P2's subject
anyway, and doing it here would have decided P2 by accident.

### What this does *not* prove

**The wrapper fix cannot be exercised on this box.** macOS resolves
`/dev/stdout → fd/1` through fdescfs, where reopening a caller-owned pipe
succeeds; Linux resolves it through procfs, where the reopen is refused. This
Mac renders correctly **through the broken wrapper**, so a green diagram here is
not evidence about the bug. The control for a platform-conditional defect has to
be a test that runs the wrapper under `Bun.spawn` — until then the row is
*"fixed and verified by reading the diff"*, not *"verified"*.

Also not proven: the cross-build (no darwin artifact was carried over), and the
two `osascript` verbs above.

## P2 — stop the guessing (decision + implementation)

The decision is **already made in principle** and not made in writing: okuda's
grammar is *resolve the integration honestly, or refuse with a named error*
(`ADR-031`). Three paths currently break it. There are two ways to honour it,
and this phase needs an **ADR** either way, because they are not the same
product:

| Option | What it does | Cost |
|---|---|---|
| **A — resolve** | `which("ghostty")` first, the bundle path second, a named refusal third; same for Chrome in `paper.ts` (probe `google-chrome`, `chromium`, the bundle) | Every distro's install path becomes okuda's problem, forever. It is a window manager by increments |
| **B — delete** | Remove the `ghostty`, `ghostty-edit`, `terminal`, `edit-terminal` integrations and `just pdf`, or reduce them to refusals that name the host's job | Loses a verb that is used today. Needs a Herdr answer first: *can the host open the tab?* |

`AGENTS.md`'s scope discipline is the tiebreaker and it points at **B**:
*"opening a tab is the host's job, not the viewer's."* `ghostty` and `terminal`
are windowing wearing an integration's clothes. The Linux box's author leans B,
and does not have the standing to decide it — the operator uses these verbs.

Whichever way it goes, the deliverable is a **named failure**: a Linux box asked
for `ghostty` must be told why not, in the same voice `terminal` already uses,
and a Mac without Ghostty must get the same sentence.

If B, the ADR runs the palimpsest protocol (`playbooks/decisions-playbook.md`) —
this is a reversal of shipped behaviour, not an addition.

## P3 — the picker's corpus (investigate, decide, or report)

`rankedShortlistEntries` indexes `docs/`, `briefs/`, `debriefs/`, `decisions/`,
`playbooks/` — and **not** root-level markdown. Measured on Linux: no entry
starts with `DEPENDENCIES.md`, `AGENTS.md`, `index.md` or any `&*.md`. The table
that governs every brief's preconditions is invisible to the one tool built for
finding things.

Decide whether that is deliberate (the silo's root files are the constitution,
not the corpus) and write the answer down where the reader will hit it, or add
them. `DEPENDENCIES.md` at minimum has a claim to being findable.

## Done when

- P1: the recorded output of the five commands above, plus `codesign -vvv` on the
  built binary and a diagram rendering on a real terminal. `DEPENDENCIES.md`'s
  `codesign` row moves from *"stub-tested on Linux"* to a prover that ran.
- P2: an ADR in `decisions/`, and every clone/edit integration either resolving
  or refusing **by name** on both platforms. A test proving a Linux box gets a
  named refusal rather than a spec pointing at a Mac bundle.
- P3: a decision, written; not necessarily a code change.
- The brief's own Status line flipped, a debrief filed, registered by
  `just reg-sync-fix`, and `just check` green.

## What to hand back to the Linux box

So the claim can be re-checked from the other side, leave in the debrief:

- the exact `codesign -vvv` line for the built binary,
- the reason string a *failing* diagram prints (or "none fired" if it rendered),
- whether `just pdf` produced a PDF and where,
- the sha of the commit the Mac verified (`git rev-parse --short=7 HEAD`),
- and, if the cross-built artifact was tested: accepted or rejected, with the
  `codesign` verdict.

## Lineage

- `DBF-PLATFORM-GATE` — the format dispatch, and the darwin branch this brief verifies
- `DBF-TOOLCHAIN-TRUTH` — the four instruments, the failure receipt, the `Proven by` column
- `DBF-OMARCHY-TOOLCHAIN` — the wrapper fix (`51f5225`) and the pipe diagnosis
- `ADR-031` — the honest-refusal grammar P2 applies
- `ADR-BUILD-SIGNS-040` — the signature gate P1 exercises
- `ADR-GATE-NAMES-041` — exit 2: a missing instrument is not a verdict
