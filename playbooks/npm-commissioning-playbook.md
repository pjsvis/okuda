---
type: Playbook
callsign: PLY-NPM-COMMISSIONING
date: 2026-11-25
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

**What the registry actually held, measured 2026-11-25:** one package,
`amalfa@1.5.1`, and nothing from this tree — `okuda`, `@polyvis/testcard` and
`@polyvis/okuda` are all 404, and a `scope:polyvis` search returns `0`. The
namespace is **unspent**, which is the only reason its shape is still a decision
rather than a deprecation pointer. **A playbook states the registry's state as
measured — with the date and the lookup — because a plan described in a
registry's voice is the one claim this file exists to stop.**

That is still why a new scope — not a new unscoped name — is the way the family
grows: **a scope owns a namespace, so a new product never races the world for a
name.**

## Where this location stands — measured 2026-11-25

The shapes above are general; this is the one location, as it is. Each row is a
lookup or a screen, and the two marked ⸮ are the ones no lookup can answer.

| Thing | State |
|---|---|
| the scope `@polyvis` | ✓ claimed, and nothing published under it |
| who owns it | ⸮ the account now answers to `pjsgloam`; org vs user unverified from outside |
| this tree's packages | ☐ none published; every name still free |
| the second factor | ✓ enabled, 1 security key |
| recovery codes | ✓ held in `skate` as `npm_recovery_code`; how many, unverified |
| trusted publishing | ☐ not configured — deliberately, it expires in two days |
| this machine's login | ✗ none; `npm whoami` answers 401 |

◆ The ⸮ rows are read from the UI while logged in, and until then they are not
facts. The ✗ row is what makes the first publish a human's job.

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

**Verify the owner with no login at all — and not with the maintainer search.**
`text=maintainer:<name>` is keyed on a *username*, and the rename below rewrites
the maintainer field to the new one, so after a migration that search returns
**empty precisely because the migration succeeded** — and an empty list reads
comfortably as "the account is new". Read the packument's own two fields
instead:

```bash
curl -s https://registry.npmjs.org/amalfa \
  | jq -c '{publishes_now: .maintainers,
            published_then: .versions[.["dist-tags"].latest]._npmUser}'
```

Two names answer two questions: the top level is **who may publish now**, a
version's `_npmUser` is **who published then** — frozen, because a packument is
append-only and history is never republished. The two differing *is* the
signature of a rename or a migration, and it needs no credentials to see.

**Measured 2026-11-25:** `publishes_now` `[{name: pjsgloam}]`, `published_then`
`{name: polyvis}` — same email on both. One account, two names.

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

**What the move leaves in the registry**, measured 2026-11-25 on an account that
took the path: the top-level maintainer field carries the **new** username, every
version snapshot keeps the **old** one, and `text=maintainer:<oldname>` returns
nothing. Nothing was republished. The old name survives inside the packument's
history and nowhere else — which makes that history the only rename-proof witness
the registry keeps.

A user's scope cannot be *shared* with a second human; an org's membership can.
That is the whole reason to make the move, and it is a bus-factor decision, not
a naming one.

## Getting back in — the second factor, and losing it

Publishing requires 2FA on the account, or a granular access token with **bypass
2FA** enabled ([configuring
2FA](https://docs.npmjs.com/configuring-two-factor-authentication/)). So the
second factor sits on the publish path, and losing it is an outage of the
namespace, not a nuisance.

**The token route is being withdrawn, so do not plan around it.** The
[2026-07-08 changelog](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/)
names both halves: a bypass-2FA token loses account, package and organisation
management from early August 2026 — creating tokens, generating recovery codes,
changing 2FA, package access, maintainers, trusted publishing, org and team
membership — and loses direct publish around January 2027, keeping only *stage*,
which a human 2FA approval releases. *(The dates are the announcement's; the
deployment is not observed from here.)* The
end state this playbook already aims at is the one that survives: **CI publishes
under OIDC, the BOOTSTRAP publish is interactive with a one-time password, and
no long-lived publish token exists anywhere.** Every other route is on a clock.

**Two independent factors, not one.** npm supports several at once — an
authenticator app *and* a security key or WebAuthn biometric
([enhanced 2FA](https://github.blog/news-insights/product-news/enhanced-2fa-experience-for-your-npm-account/)).
One factor is a phone; two are a property of the account. A dead app then costs a
convenience instead of an outage.

**Measured 2026-11-25 on this account:** *enabled for authorization and
publishing*, **1 security key**, no authenticator-app entry. So the posture is
one authenticator, and — if the codes were saved — one way back.

◆ **One key plus recovery codes is complete, and that is not a contradiction.**
Two authenticators buy a working *login* when one dies; the codes buy the
*account* when the last one does. Different failures, and the codes are the
cheaper half: they cost no ceremony at all.

**Recovery codes are the only way back without the device**, and they must live
away from it. This silo's key store is where they belong — `skate`, under a name
(`npm_recovery_code`, measured 2026-11-25), never read into a transcript.

**A name is a designation, and the referent is a set.** Each code is one-use, so
one code is one recovery and the full set is a habit — while `skate list -k`
shows the name and nothing shows the count. Count the **tokens**, which are what
a code is, by splitting the fetched value on whitespace and counting the
non-empty ones: `tr -s ' \n' '\n' | grep -c '[[:alnum:]]'`.

**`wc -l` is not that instrument** — it counts *newlines*, so ten codes on one
line with a trailing newline report `1`. Compare the token count against the
number the npm page shows under *Manage Recovery Codes*: the page is the
referent, the vault is the copy, and a mismatch means regenerate and store the
whole set.

**Store it by pipe, never by argument.** `skate set` reads the value from stdin
when no argument is given, so it never reaches `argv` — and `argv` is what shell
history records. The same form renames a key without either name touching a
command line.

◆ **A recovery code cannot be tested, only trusted.** Using one starts the
72-hour hold, so the vault's verifiable properties are *how many* and *whether
the whole set came from one regeneration* — never *whether it still works*. A
lone survivor of a superseded set is therefore the worst case: plausible,
unverifiable, and dead, since regenerating voids every earlier code.

**Measured 2026-11-25:** the vault held one code — a spare, of unknown vintage.
The rule that follows is *a set is trusted by provenance, not by preservation*:
regenerate, store the whole set at the moment it is produced, and **delete the
survivor** rather than keep it beside the new one. An older code adds no
recoverability, only the appearance of it.

**Link the GitHub account.** npm's recovery documentation names it as the
verification shortcut, and it is two minutes
([account recovery options](https://docs.npmjs.com/configuring-two-factor-authentication/)).

**A TOTP seed does not survive a dead app.** Google Authenticator can *transfer*
accounts to another device, which still requires the old device; Microsoft
Authenticator does not export TOTP seeds at all. So a broken install takes its
seeds with it — which is why one of the two factors should be a key that does not
live in an app.

### Adding a second factor, when the ceremony refuses

npm's second factor is a **WebAuthn security key**; the docs describe security
keys and nothing else, so an **authenticator-app seed is not on offer** on the
current surface. Three refusals follow, and none of their messages names a
cause. *(Measured 2026-11-25. The right column is the reading consistent with the
message, not a log — the browser's own error is the only thing that would
confirm it.)*

| Symptom | What it is | Do |
|---|---|---|
| macOS offers "Save a passkey" | the **platform authenticator** — Touch ID via iCloud Keychain — which npm accepts as a key, biometrics included | accept it, or cancel and expect the whole ceremony to abort |
| "device registration failed" | the ceremony ended without a credential: a cancelled sheet, no authenticator chosen, or one the authenticator already holds | run one ceremony to completion; a key cannot be registered twice — WebAuthn excludes a credential it already has ([registration](https://www.w3.org/TR/webauthn-3/#sect-registering-a-new-credential)) |
| a QR code no authenticator app will read | a **FIDO cross-device handoff**, not a TOTP seed; the passkey stays on the phone and is used in place | point the iPhone's *Camera* app at it — Google Authenticator expects `otpauth://` and is right to refuse |

◆ **The laptop cannot scan its own screen.** "Use the camera on your iPhone" is
addressed to the phone; reading it as an instruction to the Mac is what makes the
loop feel like a wormhole.

**The cheap exit is the recovery codes**, which need no authenticator at all:
Modify 2FA → **Manage Recovery Codes** shows the set and offers *Regenerate
Code* — and regenerating **invalidates every previous code**, so regenerate only
when the old set is lost, then save the new one before closing the tab.

### The ladder when the device is gone

Cheapest first, and **none of these needs the authenticator**
([recovering your 2FA-enabled
account](https://docs.npmjs.com/recovering-your-2fa-enabled-account/)):

1. **Look for the entry.** A legacy account may hold a TOTP seed under the issuer
   `npm`, and an unlabelled tile is the classic near-miss. An account enrolled on
   the current surface has none, because npm's factor is a WebAuthn key — so on a
   security-key-only account there is no app entry, and nothing was missed.
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

**The owner string is the GitHub side, not the npm scope** — and in this tree
they differ by one character: the repository is `github.com/pjsvis/okuda` while
the npm scope is `@polyvis`. The config wants **`pjsvis/okuda`**, character for
character, with workflow filename **`release.yml`** — `.yml`, not `.yaml`. Point
the trusted publisher at `polyvis/okuda` and every publish is refused with the
generic mismatch message, which cannot tell you which of the three fields lied.

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
| a token stops being able to publish, or to configure anything | the bypass-2FA deprecation: management from Aug 2026, direct publish from about Jan 2027, per its schedule | OIDC for CI; interactive 2FA for anything that configures |
| a 2FA setup QR that no authenticator app accepts | it is a FIDO cross-device handoff, not a TOTP seed | scan it with the phone's camera, or use the recovery codes |
| adding a key says "device registration failed" | the ceremony was abandoned, or that key is already registered | one ceremony to completion; a key cannot be registered twice |
| the maintainer search returns nothing | a rename or migration rewrote the field — not an absent account | read the packument's `maintainers` against a version's `_npmUser` |

## Related

- `playbooks/publishing-playbook.md` — the release *sequence* this boundary serves
- `ADR-FAMILY-DISTRIBUTION-083` — what the family ships, and through which channel
- `FAMILY.md` — the derived product list
- `scripts/release.sh` — the sequence, and the `PACKAGES` array a new package joins
