---
type: Playbook
callsign: PLY-PUBLISHING
---

# The Publishing Playbook

**Date:** 2026-11-02

Two packages ship from this repo and they do not have the same relationship to
the word "alpha".

| Package | What it is | Version shape |
|---|---|---|
| `okuda` | the viewer | prerelease (`0.1.0-alpha.1`) |
| `@polyvis/testcard` | the surface card, generated from `scripts/tty-card.sh` at pack time | stable (`0.1.0`) |

They version independently and dist-tag independently. That is why nothing in
this path accepts a version or a tag as an argument: both are derived per package
per run, from each package's own `package.json`.

## What this playbook is for

The sequence has an order that punishes recollection. A human who has to
remember "which one first, and is it `--tag alpha` or `latest`, and do I publish
before or after the tag" will get one of the four wrong, and each of the four
wrong answers produces a green workflow reporting a failure or a `latest` tag
pointing at an alpha.

So the sequence lives in `scripts/release.sh` and the recipes are thin. This
document says *why* each check exists, so the next person can tell whether a
check is load-bearing or scenery.

## Prerequisites, one time

1. **The GitHub repo is public.** `--provenance` and npm's package links both
   fail or dangle otherwise. Verified with `api.github.com/repos/pjsvis/okuda`
   returning `200` and `"private": false`.
2. **`repository.url` in `package.json` matches the GitHub repo exactly.** npm
   does not validate this on save; the mismatch only appears at publish time.
3. **A trusted publisher per package** — see below. Configure this *when you are
   ready to tag*, because a new configuration expires if it does not see a
   successful publish within two days.

## The two orders

```
NORMAL     merge → tag → push              CI gates and publishes (OIDC, no token)
BOOTSTRAP  merge → publish → tag → push    a human publishes; CI gates, finds the
                                           version present, and skips
```

**BOOTSTRAP exists for exactly one reason.** Trusted publishing is configured on
a package's own settings page, so the package must already exist before an OIDC
relationship can point at it. The first ever publish therefore *cannot* be CI's.
After that, NORMAL is the only path anyone should use — there is no credential to
hold, so there is nothing to leak or rotate.

```sh
just release-preflight     # everything that must be true
just release-tag           # NORMAL: push the tag, CI does the rest
just release-publish       # BOOTSTRAP only: the one publish a human makes
just release-status        # what the registry actually has
```

## Setting up trusted publishing

Per package, on npmjs.com → package → Settings → **Trusted publishing** →
GitHub Actions:

- Organization/user `pjsvis`, repository `okuda`
- Workflow filename `release.yml` — the filename only, with `.yml`,
  case-sensitive
- **Allowed actions: allow `npm publish`.** The default is stage-only, which
  stops the workflow cold

Then Settings → **Publishing access** → require 2FA and disallow tokens.

npm prefers OIDC and falls back to a token, so the same workflow file serves both
orders. Switching from bootstrap to OIDC requires no edit — that is deliberate,
because an edit is a thing to forget.

## What CI gates, and what it deliberately does not

`just check` is a **silo** gate: it reads the operator's `td` database, the
machine's own terminal configs (`contrast.ts --surface`), and a locally built
binary (`signature-check.sh`). A runner has none of the three, and manufacturing
them there would be a second derivation of the gate — the two would drift, which
is the failure `scripts/probe-surface.ts:12` already names.

CI therefore gates the **artefact**: the suite runs, the binary compiles, the
card passes its own control, and both tarballs pack *and run out of the tarball*.
The silo gate stays where its three inputs are.

## The four things that were nearly wrong

Each of these was found before it shipped, and each is a class rather than an
incident.

**A shared dist-tag.** Deriving one tag from the root version publishes the card
— a stable `0.1.0` — to `alpha` and leaves `latest` unset for it, so
`npm i @polyvis/testcard` finds nothing. The tag is derived per package.

**Node 22 is not new enough.** Node 22 bundles npm 10.9.x and OIDC needs npm
≥ 11.5.1. The runner uses Node 24 and asserts the floor with the reason
attached, because the failure without it is `ENEEDAUTH`, which reads exactly like
a permissions problem and is not one.

**A publish step that had already run.** Without an "already published" guard,
any publish outside the workflow turns the next tag push red with "cannot publish
over the previously published version" — a successful release reported as a
failure. Both steps skip a version the registry already has, which is also what
makes BOOTSTRAP and NORMAL converge on the same end state.

**A `prepack` nobody exercised.** The card's `bin/` is generated at pack time and
gitignored, so a broken `prepack` is invisible until the publish that runs it.
`release-preflight` packs both packages and CI extracts the card's tarball and
runs the binary out of it.

## Failure modes and what they look like

| Symptom | Cause | Fix |
|---|---|---|
| `ENEEDAUTH` at publish | npm < 11.5.1, or `id-token: write` missing | Node 24; check the workflow's `permissions` |
| trusted publisher refuses | workflow filename, repo, or owner does not match exactly | delete the config, recreate it, match character for character |
| config silently gone | it expired — no successful publish within 2 days | recreate, publish promptly |
| `cannot publish over…` | version already on the registry and no guard | the guard exists as of 2026-11-02; a version is immutable once published |
| `npx okuda` installs an alpha | published without `--tag` | derived tag; check `just release-status` |
| provenance missing | repo private, or published without OIDC | both must hold; verify the repo is public |
| dist-tag permission refused | `--tag` treated as a dist-tag operation | enable *Allow npm dist-tag* on the trusted publisher |

That last row is a **watch item, not a verified claim**: the docs describe
`npm dist-tag` commands separately from `npm publish --tag`, and this silo has not
yet published under OIDC to find out which side a publish-time tag falls on.
Recorded as open rather than asserted.

## Out of scope

- **Platform binaries.** The `bin` key is the seam; `./src/cli.ts` becomes a shim
  over `@polyvis/okuda-<os>-<cpu>` without changing anything a user types.
- **`mermaid-to-md` releases.** A separate repo, a separate publish. Until it cuts
  per-platform binaries, a bare machine's first mermaid fence degrades with a
  named reason and okuda's CI builds the engine from source.
- **Staged publishing.** `npm stage publish` with maintainer approval is strictly
  safer and strictly slower; it is available as a trusted-publisher permission and
  not enabled.
