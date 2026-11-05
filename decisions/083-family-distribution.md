---
type: ADR
callsign: ADR-FAMILY-DISTRIBUTION-083
---

# Decision: The family distributes as N binaries — one generated installer, and the npm location

**Date:** 2026-11-05
**Status:** Accepted

## Context

The family builds locally (`just ship` → `okuda`, `cahier`, the `gloam` alias). Getting
it to a machine that is not this one is the next question, and the wild offers four
shapes, all of which are answers to one question — *is the family one artefact or N?*

| Shape | Instance | What it costs |
|---|---|---|
| one binary, `argv[0]` dispatch | BusyBox, Toybox | cheapest to ship; one contract for all names; `--help` becomes a multiplexer |
| one repo per tool | Charm (glow/gum/vhs) | most independence, most drift — a brand, not a build unit |
| one monorepo, thin per-product release repos | loctree | clean per-product install; a repo and a tap per product |
| one installer script | uv (~2,000 lines), `just` (~180) | no registry dependency; the script *is* the hard part |

`FAMILY.md` (ADR-EXPORT-SURFACE-082) already knows what the family is, and the
`bin` key is already a seam — `PLY-PUBLISHING` names `@polyvis/okuda-<os>-<cpu>` as
the platform-package form it has not taken yet.

## Decision

**N binaries, not one multicall binary.** `okuda` and `cahier` are separate binaries
with separate contracts; `gloam` is a symlink alias. Two channels carry them:

1. **The npm location** — the primary channel for npm users. The binaries ride as
   scoped platform packages (`@<scope>/okuda-<os>-<cpu>`, `@<scope>/cahier-<os>-<cpu>`),
   and the main `okuda` package's `bin` shims over them (the esbuild/swc/loctree
   pattern). npm carries integrity, so no checksum script is owed. This is what the
   commissioning of a new scope is *for*; see `PLY-NPM-COMMISSIONING`.
2. **A generated installer** — the fallback for a machine with neither npm nor bun.
   A `curl | sh` that detects OS/arch, fetches the per-target tarballs, verifies
   checksums, and drops the binaries plus the `gloam` symlink.

**The installer is generated from `FAMILY.md`.** The asset list and the release matrix
are derived from the manifest, not hand-written; a new product is one row and one
tarball. This is the manifest's whole point, one layer out.

**No Homebrew tap until a stable release.** Homebrew holds one version and has no
prereleases; `0.1.0-alpha.1` would land on `latest` and the next alpha would
obliterate it. A tap is for a stable release, and okuda is not one.

**No thin release repos yet.** The loctree pattern is the graduation path when
products have independent cadences; it is ceremony for two binaries on one box.

**The multicall question is deferred, and named.** One binary with N names would halve
the distribution — one artefact, one download. It is refused *for now* because the
house refused an `--html` flag on okuda's binary for the contract reason, and a
multicall binary is that refusal undone by the back door. Revisit when a stranger
installs it and the 61 MB actually bites.

**The installer takes `just`'s compromises, not uv's.** One static build (no
glibc/musl detection), `--to` rather than mutating `PATH`, checksums verified inline,
near 180 lines.

**The commit is the identity; the tag is the distribution name.** The release note
carries the commit the binaries were built from (the `BUILD_SHA` stamp), so a tag and
a byte-stream cannot drift.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| One multicall binary (`argv[0]` dispatch) | The two contracts differ clearly, and the house already refused the merged form as an `--html` flag. Deferred, not forbidden — named as the fork this decision turns on. |
| Homebrew tap now | One version, no prereleases; an alpha would eat `latest`. Premature until a stable release. |
| Thin release repos now | Ceremony for two binaries on one box; the graduation path, not the first step. |
| Publish the compiled binaries as the primary npm artefact | A single `bin` carrying a 61 MB binary per platform re-downloads on every install; the platform-package split is what npm is for. |
| `cargo-dist` / `goreleaser` / `releasor2000` | They automate the matrix admirably and ride Cargo/Go metadata a Bun/TS family does not have. |
| A `curl \| sh` installer as the *only* channel | The npm location already exists and carries integrity; the installer is the non-npm fallback, not the primary. |

## Consequences

**What became easier:**

- *How does a stranger get this?* has one answer per audience — `npm i -g okuda` for
  an npm machine, the installer otherwise — and both are derived from `FAMILY.md`.
- A new product is a manifest row and a tarball; the gate that fails a product with
  no row already exists.

**What became harder:**

- The npm platform matrix is N products × M platforms of packages; the manifest
  carries the products, the platform list is still explicit.
- The installer is a new artefact to build and test, and its failure modes (wrong
  arch, partial download) are the ones the wild's 2,000-line scripts exist to cover.

**Constraints this imposes:**

- The npm location is commissioned before the platform packages can ship; until then
  only the installer channel exists.
- The binaries do not go into the JS entry packages; the `bin` key is the shim seam,
  never the payload.

## Related

- `FAMILY.md` — the derived manifest the installer and the matrix are generated from
- `ADR-EXPORT-SURFACE-082` — the export surface as contract, which makes the core shared
- `briefs/2026-11-05-brief-cahier-binary.md` — the second product that made the family real
- `playbooks/publishing-playbook.md` — the release *sequence*
- `playbooks/npm-commissioning-playbook.md` — standing up the npm location
