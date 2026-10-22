---
type: Debrief
callsign: DBF-PLATFORM-GATE
briefs: [BRF-PLATFORM-GATE]
---

# Debrief: The gate names its format — okuda builds on Omarchy

**Date:** 2026-10-22
**Status:** Done — `BRF-PLATFORM-GATE` shipped (2ba1777, fast-forwarded to main the
same sitting; 68aa262 filed it on the ampersand surface). `just build` and
`just check` are green on the Omarchy box. One claim is deferred, not verified:
the darwin path was not exercised on a Mac (below).

## What happened

The Linux box could compile okuda and could not build it. `just build` reported
success for the compile — 174 ms, a 72 MB ELF that ran — then failed on the
recipe's second line, `codesign --force --sign - okuda`, exit 127. The gate was
worse than the recipe: `signature-check.sh` answered *"does not carry a valid
code signature"* about a format that has no such concept, and returned 127.

`ADR-BUILD-SIGNS-040` had written the requirement down in September — the check
"must skip, not fail, where `codesign` does not exist" — and `ADR-GATE-NAMES-041`
had named the case in its asymmetry rule. Neither was implemented. The script
skipped an absent **binary**; nobody had asked it about an absent **tool**,
because until a second platform existed nothing could ask. That is the lesson:
the recorded intent was not a decision waiting to be made, it was a branch
waiting to be written, and only the Omarchy box supplied the input.

## The measurement that changed the shape

The premise that started the session — *to build on Omarchy we need `rcodesign`* —
is half true, and the probe said which half:

- **A native Linux build needs no signer at all.** Bun emits an ELF. No
  CodeDirectory, no signed pages, no `codeLimit`. Signing was never the
  precondition; **executing** is, and that is now what the ELF branch asserts.
- **A darwin artifact built on Omarchy does need one.** `--target=bun-darwin-arm64`
  works from Linux (17.8 s, 70,961,522 B Mach-O), and the linker's ad-hoc
  signature audits **clean** — 17,191 page hashes, 0 mismatched, `codeLimit` at
  the signature offset. That is *not* the stale-tail-page defect of the parent
  ADR (Bun 1.4.3 here; the ADR measured 1.4.0).
- **`rcodesign` signs; it does not verify.** `rcodesign verify` prints its own
  disclaimer — *"known to be buggy and gives misleading results"* — and rejects a
  valid ad-hoc signature. So it is the Linux-side `codesign --force --sign -`
  (measured: superblob rewritten, flags `0x2`, hashes still clean) and it is
  **not** the Linux-side gate. Who validates a cross-built darwin binary from
  Linux is still an open question, and the answer this session chose is the
  honest one: exit 2, UNVERIFIED, not a pass.

## The shape that shipped

Two instruments, one verb each, both dispatching on the file's own magic:

| Format | `sign-binary.sh` (new) | `signature-check.sh` (rewritten) |
|---|---|---|
| ELF | no-op, reason printed | exec smoke (`--version`), exit 1 if it does not run |
| Mach-O | `codesign`, else `rcodesign`, else exit 2 | `codesign --verify --strict`, else exit 2 UNVERIFIED |
| other | exit 2 | exit 2 |

All six branches were exercised before the gate was called green: ELF that runs,
ELF that cannot (exit 1, named), absent binary (skip, 0), text file (2), Mach-O
with no signer on the host (2 from both scripts), Mach-O with `rcodesign` (signed
ad-hoc), and the darwin branches under a `codesign` stub — pass (0) and fail (1),
with the original remedy text intact.

## What was wrong with the first attempt, and how it was caught

The first cut read the magic with `IFS= read -r -N 4`. Every ELF test passed and
every Mach-O test fell through to *"unrecognised format"*: in a UTF-8 locale bash
counts **characters**, and `0xcf` is not a valid lead byte, so the Mach-O magics
never matched. Under `LC_ALL=C` — or with a hex read — they do. The gate caught
it because the probe ran both formats; had only the ELF been exercised, the
darwin branch would have shipped dead and green-local, which is the exact defect
class this brief exists to kill.

## Environment state repaired on the way (not code)

- **`td init`** — this box had no `.todos/` database, so every td call failed with
  *"run 'td init' first"*. Local runtime state, gitignored, created.
- **`git branch feat/television-preview origin/feat/television-preview`** — the
  parked pin declared in `scripts/ref-census.ts` had no local branch here, so
  `ref-census` called the declaration stale. The declaration is legitimate and
  current (review 2026-11-15); the branch now exists locally, which is what the
  declaration was always about.
- **Twelve test failures are pre-existing and environmental.** `bun test` on
  `main` in a clean worktree reports the identical 779 pass / 12 fail, both before
  and after this branch. They are the documented dependency gaps on this box: no
  `mermaid-to-md`, no `chroma`. Not touched here; installing them is a
  provisioning act, not a repair.

## What is not verified

**The darwin path has not run on a Mac.** Its code is unchanged in substance (the
same `codesign --verify --strict` reading, the same diagnosis, the same remedy
text) and it is exercised under a stub, but stub-green is not Darwin-green. The
first Mac session after this lands should run `just build` and say so. That is
the one line of this debrief that is a promise rather than a measurement.

## Files

- `scripts/sign-binary.sh` — new: the format-driven signer
- `scripts/signature-check.sh` — rewritten: format dispatch, ELF exec precondition,
  Mach-O-without-`codesign` exits 2
- `justfile` — the `build` recipe's second line is now the script, not `codesign`
- `decisions/040-build-signs-its-output.md` — amendment 2026-10-22
- `DEPENDENCIES.md` — the `codesign` row amended, `rcodesign` row added, the
  format table
- `briefs/2026-10-22-brief-platform-gate.md` — the brief
