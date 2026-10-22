---
type: Brief
callsign: BRF-PLATFORM-GATE
---

# Brief: The gate names its format — building okuda on Omarchy

**Date:** 2026-10-22
**Status:** In progress

## Context

`just build` on the Omarchy box (Linux x86-64) compiles in 174 ms and then dies:

```
build: line 1: codesign: command not found
error: recipe `build` failed on line 309 with exit code 127
```

The artifact the compile produced is an **ELF 64-bit x86-64** and it runs. The
recipe's second line is `codesign --force --sign - okuda` — a darwin instrument,
unconditional, in a recipe that now runs on two platforms.

The gate is worse than the build, because it asserts a diagnosis it cannot make:

```
signature-check: FAIL — okuda does not carry a valid code signature
  scripts/signature-check.sh: line 41: codesign: command not found
```

An ELF carries no CodeDirectory, no `codeLimit`, no signed pages. Nothing is
missing from the artifact; the *instrument* is absent and the *format* has no
such concept. `ADR-BUILD-SIGNS-040` already recorded this — its Consequences say
the check "must skip, not fail, where `codesign` does not exist" — and
`ADR-GATE-NAMES-041` names the case explicitly, *"skip where the absence is a
legitimate state — … `codesign` on a non-macOS host"*. Neither is implemented:
the script skips on an absent **binary**, never on an absent **tool**.

Measured the same session: fifteen of the sixteen remaining gates pass on
Omarchy unmodified. The platform does not break the silo; one hardcoded signer
and one mis-named precondition do.

## Objective

`just build` and `just check` go green on a Linux host, without weakening the
darwin gate that `ADR-BUILD-SIGNS-040` exists to enforce.

## The dispatch, in one table

The precondition of an artifact belongs to its **format**, not to the host that
happens to be compiling it.

| Artifact | Precondition | Instrument | Absent instrument |
|---|---|---|---|
| ELF | it executes | exec smoke (`--version`, exit 0) | n/a — no instrument needed |
| Mach-O | valid code signature | `codesign --verify --strict` | exit 2, UNVERIFIED |
| anything else | unknown | none | exit 2, UNVERIFIED |

Two scripts, one verb each, both reading the file's own magic rather than
`file`'s wording:

- `scripts/sign-binary.sh` (**new**) — sign where signing is a concept: ELF is a
  no-op with a printed reason; Mach-O is signed by `codesign` where it exists,
  else by `rcodesign` (ad-hoc by default, the Linux-side equivalent — measured
  working, see below), else exit 2 with the linker signature retained and named
  unverified.
- `scripts/signature-check.sh` (rewritten) — verify per the table. The darwin
  branch keeps its current strict reading and remedy text verbatim; the ELF
  branch asserts executability; the Mach-O-without-`codesign` branch exits 2,
  because an unrun check is not a pass (`ADR-GATE-NAMES-041`).

`justfile:306-310` gains one line: the sign step becomes the script call.

## Measurement — what the probes said

| Probe | Result |
|---|---|
| `just build`, native | compile OK → ELF x86-64, 72,084,592 B, runs; dies on line 309, exit 127 |
| `bash scripts/signature-check.sh okuda` | exit 127, message *"does not carry a valid code signature"* — a false verdict |
| `just check`, mechanically minus that gate | 15/15 pass |
| `bun build --compile --target=bun-darwin-arm64` on Omarchy | works (17.8 s); 70,961,522 B Mach-O arm64 |
| Page-hash audit of that Mach-O | flags `0x20002` (adhoc, linker-signed), 4 KiB pages, 17,191 pages, **0 mismatched**, `codeLimit` = signature offset |
| `rcodesign verify` on it | exit 1, *"no cryptographic signature present"*, behind the tool's own *"known to be buggy"* disclaimer |
| `rcodesign sign` on a copy | superblob rewritten, flags `0x2`, +Requirements +empty wrapper, hashes still 0 mismatched |
| `pacman -Ss rcodesign` | absent from the Arch repos; the musl release binary (sha256 matched) runs |

The cross-built Mach-O does **not** reproduce the stale-tail-page defect
`ADR-BUILD-SIGNS-040` was written about (Bun 1.4.3 here; the ADR measured
1.4.0). Whether macOS 27 accepts it is untestable from Linux — which is exactly
why the Mach-O-without-`codesign` branch must say UNVERIFIED rather than pass.

## Rejections

| Rejected | Why |
|---|---|
| Drop signing; ship the linker signature | `ADR-BUILD-SIGNS-040` measured `zsh: killed` on macOS 27. The darwin branch keeps the strict check |
| `codesign` guarded by `command -v`, no format dispatch | A Linux build would report *"signature-check: OK"* for an artifact nothing signed and nothing checked — a false pass, the failure `ADR-GATE-NAMES-041` calls the worse trade |
| `rcodesign verify` as the Linux-side gate | Its own output says it is *"known to be buggy and gives misleading results"*, and it rejects a valid ad-hoc signature as *"no cryptographic signature present"* |
| One script with `sign`/`check` verbs | It would rename `signature-check.sh`, cited by `ADR-BUILD-SIGNS-040`, `ADR-GATE-NAMES-041`, `DEPENDENCIES.md` and the signature-triage skill. Two verbs, two scripts |
| A shared format-detection library | Six `case` patterns duplicated across two scripts, each standalone and runnable from the triage procedure. A third file for that is structure without a consumer |

## Done when

- `just build` and `just check` are green on Omarchy, and still green on darwin.
- An ELF that does not execute fails the check with a named reason and exit 1.
- A Mach-O checked without `codesign` fails with exit 2 and the word UNVERIFIED.
- `DEPENDENCIES.md` and `ADR-BUILD-SIGNS-040` say what the code now does.

## Lineage

- `ADR-BUILD-SIGNS-040` — the remedy this implements, amended today
- `ADR-GATE-NAMES-041` — the asymmetry between skip and halt, which decides the
  exit codes here
- `docs/2026-09-21-the-page-the-signature-got-wrong.md` — the measurement the
  darwin branch still protects
