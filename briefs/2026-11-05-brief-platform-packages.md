---
type: Brief
callsign: BRF-PLATFORM-PACKAGES
date: 2026-11-05
---

# Brief: The platform packages — the binaries ride npm under `@okuda`

**Created:** 2026-11-05
**Status:** Open

## Lineage

`ADR-FAMILY-DISTRIBUTION-083`'s first channel; `ADR-EXPORT-SURFACE-082` made the
core shared; `PLY-NPM-COMMISSIONING` stands up the scope. The operator's call,
2026-11-05: *"npm scope name should be okuda, as that is the core."*

## Objective

Ship `okuda` and `cahier` as per-platform npm packages under the `@okuda` scope,
with the main package's `bin` shimming over the installed platform package, so
`npm i -g` works on every supported host without a 61 MB payload in the main
tarball.

## Scope

**In:** the platform matrix; the per-platform package shape (`os`/`cpu`, the
binary, no `bin`); the main package's `bin` shim; the release integration (the
`scripts/release.sh` `PACKAGES` list, and whether the platform `package.json`
files are generated or committed).

**Out:** the `curl | sh` installer (`ADR-FAMILY-DISTRIBUTION-083`'s second
channel); thin release repos; a Homebrew tap; the export-surface contract (done).

## The matrix

| Product | darwin-arm64 | darwin-x64 | linux-x64 | linux-arm64 |
|---|---|---|---|---|
| `okuda` | ✓ | ✓ | ✓ | ✓ |
| `cahier` | ✓ | ✓ | ✓ | ✓ |

Eight packages: `@okuda/okuda-darwin-arm64` … `@okuda/cahier-linux-arm64`. The
matrix is explicit even though `FAMILY.md` derives the *products* — the platform
list is a deployment fact, not a reading.

## The shape (the esbuild/swc/loctree pattern)

- **Each platform package**: `name`, `version` (the family version), `os`, `cpu`,
  `files: [the compiled binary]`, and **no `bin`** — it is a payload, not an
  entrance.
- **The main package**: `optionalDependencies` on its four platform packages, and a
  `bin` that shims to whichever one installed for this host.
- **The shim**: resolve the matching `@okuda/<product>-<os>-<cpu>` and `exec` its
  binary. If none installed, a **named error** naming the host and the packages
  tried — never a silent no-op.
- npm installs the matching platform package by `os`/`cpu`; the others are
  skipped, not downloaded.

## The decision, resolved

**The main package moves to `@okuda/okuda`** (operator, 2026-11-05), with the
unscoped `okuda` left as a deprecated pointer. One family name, one scope — the
core's name, so the family grows under it. The unscoped name stays on the registry
forever; the move is a one-time act, not a rename.

## Acceptance Criteria

- `npm i -g @okuda/okuda` works on darwin-arm64 and linux-x64; the `bin` resolves
  the platform binary and runs it.
- `@okuda/okuda --version` prints the `BUILD_SHA` stamp.
- The main package's tarball is small — no binary; the platform package carries it.
- A host with no matching platform package gets a named error naming the host.
- `just check` green; `FAMILY.md` lists the platform products; the registries agree.

## Notes

- The binaries are compiled per platform with `BUILD_SHA`, by the release CI or
  locally; a stale platform package is a stale renderer, so the release must build
  all four from one commit.
- `chroma` and `mermaid-to-md` remain external (`ADR-FAMILY-DISTRIBUTION-083`); a
  platform binary degrades without them, and the degradation is named.

## Related

- `ADR-FAMILY-DISTRIBUTION-083` — the channels this brief implements
- `ADR-EXPORT-SURFACE-082` — the shared core the shims speak through
- `playbooks/npm-commissioning-playbook.md` — standing up the scope
- `playbooks/publishing-playbook.md` — the release sequence
- `FAMILY.md` — the derived product list
