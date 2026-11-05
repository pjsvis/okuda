---
type: Brief
callsign: BRF-CAHIER-BINARY
date: 2026-11-05
---

# Brief: The cahier binary — the compositor, compiled and shipped

**Created:** 2026-11-05
**Status:** Open

## Lineage

`docs/2026-11-05-the-cahier.md` — the compositor is `scripts/html-package.ts`,
built from okuda's exports. The operator's call, 2026-11-05: *"could we make a bun
executable out of this … a useful capability for a silo … it is of no interest to
okuda, it is more of a side effect."*

## Objective

Compile the cahier compositor into a standalone `cahier` binary — signed, stamped
with the build commit, shipped locally beside `okuda` — so a silo can make a cahier
without okuda's checkout or a `bun` on PATH.

## Scope

**In:** a `cahier-build` recipe (compile, sign, verify); `build` and `install` wired
to it; `--version` and `--help` on the compositor; the `.gitignore` entry; the
`fresh` check extended to the second binary.

**Out:** the export-surface contract — the ADR this needs, asking whether
`src/render.ts`'s export surface becomes a public API once a silo depends on the
binary. Also out: bundling `chroma` and `mermaid-to-md` (the tool stays a shell over
them and degrades without them); the npm release path (`scripts/release.sh`); and a
skill or MCP wrapper — an actuator needs none, and `cahier --help` is the discovery.

## The two things this must not do

- **Not a second classifier.** The binary is a second *distribution* of okuda's
  renderer, never a fork and never hand-edited. It is built from this tree, by this
  recipe, and rebuilt when the tree moves.
- **Not self-contained, and it must say so.** The artefact is one file with no
  network; the tool shells out to `chroma` (colour) and `mermaid-to-md` (diagrams).
  Without them it degrades — uncoloured code, `⋮ mermaid-to-md declined` — and the
  release note names it.

## Work Plan

1. [ ] `scripts/html-package.ts`: `--version` (`cahier (<sha>)`, the stamp the
       `fresh` gate reads) and `--help` (the usage block), before the input check.
2. [ ] `justfile`: a `cahier-build` recipe beside `build` — the same
       `--define BUILD_SHA`, `sign-binary`, `signature-check`.
3. [ ] `build` depends on `cahier-build`, so `just build` builds both binaries.
4. [ ] `install` symlinks `cahier` into `~/.local/bin` beside `okuda` and `gloam`.
5. [ ] `.gitignore`: `cahier` beside `okuda`.
6. [ ] `scripts/fresh.sh`: check both binaries — link resolves, stamp = HEAD.
7. [ ] Prove the capability: `cahier <file>` from a directory with no okuda
       checkout.

## Acceptance Criteria

- `just cahier-build` produces a signed `cahier`; `signature-check.sh cahier` OK.
- `cahier --version` prints a build stamp; `cahier --help` prints usage.
- `just build` produces both binaries; `just install` links both; `just ship` green.
- `just fresh` verifies both binaries' link and stamp.
- `just check` green.
- A cahier built by the binary is byte-identical to one built by
  `bun scripts/html-package.ts` at the same commit.

## Notes

**Why not a flag on okuda.** The house refused it (`docs/2026-11-05-the-cahier.md`,
*What it will not do*): the binary's contract is markdown in, coloured bytes out. A
separate binary keeps that contract and puts compositing where it belongs — the
environment.

**Why the binary can only be built here.** The compositor imports `src/render.ts`
and `src/root.ts` wholesale. The *capability* is the environment's; the *source* is
okuda's. So the build target lives in okuda's tree, and the artefact carries the
commit it was built from — a cahier made by a stale binary is a stale renderer.

## Related

- `docs/2026-11-05-the-cahier.md` — the compositor and its contract
- `docs/2026-11-05-lessons-from-the-port.md` — one classifier, one palette, one resolver
- `ADR-BUILD-SIGNS-040` — the signature gate the recipe reuses
- `scripts/release.sh` — the npm path this brief stays out of
