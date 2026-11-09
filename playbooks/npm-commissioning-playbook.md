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

**What the registry actually held, measured 2026-11-05:** the account `polyvis`
maintains exactly one package, `amalfa@1.5.1`, and nothing from this tree —
`okuda`, `@polyvis/testcard` and `@polyvis/okuda` were all 404. The account is
real; the tree's packages are planned. **A playbook states the registry's state
as measured — with the date and the lookup — because a plan described in a
registry's voice is the one claim this file exists to stop.**

That is still why a new scope — not a new unscoped name — is the way the family
grows: **a scope owns a namespace, so a new product never races the world for a
name.**

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

### A user's scope is already claimed

npm gives every account a scope named after it: `@polyvis` exists the moment the
user does, and there is nothing left to "claim". What remains is to **log in on
the machine that publishes** — `npm whoami` answers 401 on a machine with no
token, which is a fact about the machine and must not be read as a fact about the
scope — and to set the account's 2FA and publishing-access posture, because that
posture is the entire guarantee once a token route exists.

Verify the owner with no login at all, straight from the registry:

```bash
curl -s 'https://registry.npmjs.org/-/v1/search?text=maintainer:polyvis&size=20' | jq -r '.objects[].package.name'
```

The packages it returns are the ones the account can already publish; an empty
list means the account is new, not absent.

**An organisation is the other kind of location, and a user can become one.**
npm documents the move ([migrating a user scope to an org
scope](https://npm.github.io/private-pkgs-orgs-docs/setup/u2o.html)): attempt to
create an org whose name is already your username, while logged in as that user,
and npm offers to migrate — you pick a **new username**, everything the user
owned (its published packages included) becomes the org's, and the new user is
Super-Admin of it.

The scope name is unchanged, which is the only part the packages care about.
Three costs, and the third is why it happens **before the first publish**:

- the **username changes** — the account you log in with is not the name you
  typed;
- **package ownership moves** into the org;
- the move is **irreversible**.

A user's scope cannot be *shared* with a second human; an org's membership can.
That is the whole reason to make the move, and it is a bus-factor decision, not
a naming one.

## Getting back in — the second factor, and losing it

Publishing requires 2FA on the account, or a granular access token with **bypass
2FA** enabled ([configuring
2FA](https://docs.npmjs.com/configuring-two-factor-authentication/)). So the
second factor sits on the publish path, and losing it is an outage of the
namespace, not a nuisance.

**Two independent factors, not one.** npm supports several at once — an
authenticator app *and* a security key or WebAuthn biometric
([enhanced 2FA](https://github.blog/news-insights/product-news/enhanced-2fa-experience-for-your-npm-account/)).
One factor is a phone; two are a property of the account. A dead app then costs a
convenience instead of an outage.

**Recovery codes are the only way back without the device**, and they must live
away from it. This silo's key store is where they belong — `skate`, under a name
(`npm_recovery_codes`), never read into a transcript.

**Link the GitHub account.** npm's recovery documentation names it as the
verification shortcut, and it is two minutes
([account recovery options](https://docs.npmjs.com/configuring-two-factor-authentication/)).

**A TOTP seed does not survive a dead app.** Google Authenticator can *transfer*
accounts to another device, which still requires the old device; Microsoft
Authenticator does not export TOTP seeds at all. So a broken install takes its
seeds with it — which is why one of the two factors should be a key that does not
live in an app.

### The ladder when the device is gone

Cheapest first, and **none of these needs the authenticator**
([recovering your 2FA-enabled
account](https://docs.npmjs.com/recovering-your-2fa-enabled-account/)):

1. **Look for the entry.** npm's TOTP issuer is `npm`; an unlabelled tile is the
   classic near-miss.
2. **Recovery codes**, from wherever they were stored at setup.
3. **npm's own reset**, which is email-verified: sign in → on the 2FA page click
   *"Use a recovery code or request a reset"* → *"Try recovering your account"* →
   *"Start Account Recovery"* → enter the one-time password sent to the
   registered email → open the ticket with reason *"Reset my two-factor
   authentication (2FA)"*. Link GitHub during the ticket; it expedites
   verification.

**The 72-hour hold.** Logging in with a *recovery code* places a temporary
security hold on the account. During it you can log in, browse, and **add a new
2FA method**; you cannot publish, create access tokens, or change organisation
or team membership. It cannot be lifted early. So the order is: recover → add the
second factor → let the hold expire → *then* create the org, because the org
migration is a membership change and the first publish is a publish.

### Do not escape by making a new account

The username exists, so a fresh org would need a different *name*. And an org's
name is not reliably freed by deleting the org — a case on record needed npm
support to reuse one. That trades a permanent namespace for a support ticket,
which is the wrong way round.

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
| `E404` on a scoped publish | the name is wrong, or the account cannot publish there | match `@<scope>/<pkg>` exactly; `npm whoami` must be the scope's owner |
| `E402` / "payment required" | the scope is private and needs a paid plan | make the package `access: public`, or the org public |
| `ENEEDAUTH` at publish | npm < 11.5.1, or `id-token: write` missing in the workflow | Node 24; check the workflow's `permissions` |
| trusted publisher refuses | owner, repo, or workflow filename does not match exactly | delete the config, recreate, match character for character |
| config silently gone | it expired — no successful publish within two days | recreate it *when ready to tag*, and publish promptly |
| provenance missing | repo private, or published without OIDC | both must hold; verify the repo is public |
| a one-time password is demanded and the device is gone | the second factor is lost | the email-verified reset above; expect the 72-hour hold |
| creating the org offers to *migrate* the user | the org name is an existing username — the documented user→org path | accept deliberately: the username changes and package ownership moves |

## Related

- `playbooks/publishing-playbook.md` — the release *sequence* this boundary serves
- `ADR-FAMILY-DISTRIBUTION-083` — what the family ships, and through which channel
- `FAMILY.md` — the derived product list
- `scripts/release.sh` — the sequence, and the `PACKAGES` array a new package joins
