---
type: Playbook
callsign: PLY-NPM-COMMISSIONING
date: 2026-11-05
---

# The npm Commissioning Playbook

Standing up a new **location** on npm — a scope (`@name`) owned by a user or an
organisation, under which the family's packages are published. The release
*sequence* is `PLY-PUBLISHING`'s; this playbook owns the *boundary*: the scope,
its first package, and the trusted publisher that lets CI publish without a token.

Read it when you are about to create a scope. Add to it every time one is made.

## What the two kinds of location are

| Kind | Example | Who owns the name |
|---|---|---|
| unscoped | `okuda` | the world — first come, globally unique |
| scoped | `@polyvis/testcard` | the scope's owner; package names under it are yours |

The repo already ships one of each (`okuda`, `@polyvis/testcard`), which is why a
new scope — not a new unscoped name — is the way the family grows: **a scope owns
a namespace, so a new product never races the world for a name.**

## The principle — commission the scope, then the first package, then the pipeline

The order is forced, and each step's urgency differs:

> **The scope is permanent; the trusted publisher is ephemeral.** Create the
> scope when you know the family; create the trusted publisher when you are ready
> to tag, because it **expires if it does not see a successful publish within two
> days**.

That two-day window is the trap this playbook exists to name. A configuration
that looks done — and then is silently gone — is the stale-ledger failure in npm
clothing: `config silently gone` in `PLY-PUBLISHING`'s failure table is that trap
already observed.

## Commissioning the scope — the operator's hands

1. **Create the org on npmjs.com**, or use a personal scope. An org carries
   membership and billing; a personal scope does not. Pick by whether more than
   one human will publish.
2. **Claim the scope name.** It is permanent and it is what every package name
   will be prefixed with (`@<scope>/okuda`, `@<scope>/cahier`).
3. **Require 2FA and disallow tokens** on the org's Publishing access settings.
   This is the posture OIDC depends on: if a token route stays open, the leak
   surface stays open, and the reason to use OIDC is exactly to not have one.
4. **Note the owner string and the repo name** — the trusted publisher matches
   them *character for character*.

## The package's side — the repo's acts

Per package, in the package's own `package.json`:

1. `"name": "@<scope>/<pkg>"` and `"publishConfig": { "access": "public" }` —
   a scoped package defaults to private, and a private package cannot carry
   `--provenance`.
2. `"repository.url"` matches the GitHub repo exactly. npm does not validate it on
   save; the mismatch surfaces only at publish.
3. The package root is added to `PACKAGES` in `scripts/release.sh`, so the
   sequence derives its version and dist-tag from the package's own manifest.
4. A **BOOTSTRAP** publish — a human, once, holding the credential — because
   trusted publishing is configured on a package's settings page and the package
   must exist before an OIDC relationship can point at it.
5. Then **NORMAL**: tag → push → CI publishes under OIDC. No token to hold,
   nothing to rotate.

## Setting up the trusted publisher

npmjs.com → package → Settings → **Trusted publishing** → GitHub Actions:

- Organization/user, repository, and **workflow filename** — the filename only,
  with `.yml`, case-sensitive. One character wrong refuses the publish.
- **Allowed actions: allow `npm publish`.** The default is stage-only, which
  stops the workflow cold.
- Enable **Allow npm dist-tag** if the sequence publishes with `--tag`, because
  npm treats a publish-time tag as a dist-tag operation
  (`PLY-PUBLISHING` records this as a watch item, not yet verified here).

Then Settings → **Publishing access** → require 2FA and disallow tokens.

## What the scope does not decide

- **The binaries.** A compiled binary is not a package; it ships as a platform
  package under the same scope (`@<scope>/okuda-<os>-<cpu>`) with the main
  package's `bin` as the shim, or via the family installer
  (`ADR-FAMILY-DISTRIBUTION-083`). The scope carries both; this playbook is about
  the scope, not the payload.
- **The version.** Each package's `package.json` owns its own version and its own
  implied dist-tag (`-alpha` → `alpha`, else `latest`), derived per package per
  run. A shared tag is the failure `PLY-PUBLISHING` already names.

## Verification

```sh
npm view @<scope>/<pkg> version              # is the version there
npm view @<scope>/<pkg> dist-tags --json     # which tag it landed on
just release-status                          # the sequence's own reading
```

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `E404` on a scoped publish | the scope is unclaimed or the name is wrong | claim the scope; match `@<scope>/<pkg>` exactly |
| `E402` / "payment required" | the scope is private and needs a paid plan | make the package `access: public`, or the org public |
| `ENEEDAUTH` at publish | npm < 11.5.1, or `id-token: write` missing in the workflow | Node 24; check the workflow's `permissions` |
| trusted publisher refuses | owner, repo, or workflow filename does not match exactly | delete the config, recreate, match character for character |
| config silently gone | it expired — no successful publish within two days | recreate it *when ready to tag*, and publish promptly |
| provenance missing | repo private, or published without OIDC | both must hold; verify the repo is public |

## Related

- `playbooks/publishing-playbook.md` — the release *sequence* this boundary serves
- `ADR-FAMILY-DISTRIBUTION-083` — what the family ships, and through which channel
- `FAMILY.md` — the derived product list
- `scripts/release.sh` — the sequence, and the `PACKAGES` array a new package joins
