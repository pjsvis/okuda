---
type: Playbook
callsign: PLY-JUSTFILE
---

# Justfile Playbook

## What the Justfile Is

The justfile is the **facade of the silo**: the single public interface to the repository. Users and agents reach the workflow through `just <recipe>` and nothing else. All logic lives behind the facade in `scripts/` — recipes are one-line delegations, never implementations.

**Two audiences, one facade.** Agents and humans use the justfile — sometimes separately, sometimes together (paired terminal: agent runs on the left, human audits on the right). The design consequence:

- **Terse** — `just --list`: the grouped noun-phrase menu. Shared inventory, minimal tokens.
- **Friendly** — `just help`: the narrative guide (workflow, standing rules) for beings who want a sentence, not a menu.
- **Discoverable** — consistent prefixes (`reg-*`), groups mirroring sections, errors that list valid inputs (`reg-sync` does this), pointers from AGENTS.md and README.

Recipe names are the shared vocabulary: `just check` must mean the same thing in the agent's shell and the human's head. **Treat recipe renames as API changes** — same-commit update to `docs/help.md`, commit message naming the rename.

## House Style

The rules below are settled by usage (see `git log` on the justfile, Aug 2026). Follow them; change them only via this playbook.

**Recipe comments: noun phrases, no verbs.**

```make
# Registry sync gate      ✓ what it is
check:

# Registry sync check — fails (exit 1) on MISSING or STALE entries   ✗ how it fails
```

`just --list` is a menu, not a manual. It names the items; details live in `docs/help.md` for those who delve. Failure modes, arguments, caveats belong there — one delve surface, kept out of the menu.

**Comments: one or two words, terse.** The menu is a render — a uniform left block of names, a uniform comment column. Comments are labels, not sentences:

```make
# Colour audit      ✓
audit:

# Render the formatting & colour audit (stated expectations vs live output)   ✗
```

**The gate's bound is looser than the style's, and it also forbids a second line.**
`facade-lint` fails at **more than three words**, where the house asks for one or two — so
a three-word comment passes the gate and is still the wrong form. And it fails on **two
consecutive comment lines above a recipe**: the comment is single-line, always. The
reasoning a long comment wants to carry belongs in this playbook, an ADR, or a note —
never in the menu, which is a menu and not a manual. Both bounds measured 2026-09-21: a
six-line comment over `build` and a three-line one over `check` read fine, passed the
eyeball, and violated two invariants at once.

**No comments on parameterized recipes.** A recipe whose signature names its argument (`view file`, `ssh-test doc`) is self-documenting — the signature *is* the label. A comment after it only shoves the column right for every other recipe:

```make
[group('build')]
view file:                          ✓

# Render any file in the TUI        ✗ (and the default arg below is the other half of the crime)
[group('build')]
view file="docs/foo.md":
```

**No default values on parameterized recipes.** `just --list` aligns the comment column to the *longest signature including its default values*. A default like `file="docs/glow-vs-okuda.md"` pins the column at 47 for the whole menu — ragged, and the raggedness is the repo contradicting its own thesis (restful rendering). Defaults are a private convenience for one recipe; the column is a public artifact seen on every `--list`. The many outweigh the few. The only lever on the column is the signature length; use it.

```make
resize-okuda file:                  ✓ (column lands ~25, in band)
resize-okuda file="docs/glow-vs-okuda.md":   ✗ (pins column at 47)
```

The target band is **column 20–30**. The rules above are how you stay in it. The gate (`scripts/facade-lint.sh`, run by `just check`) asserts four invariants — the band, a comment of **≤ 3 words**, **no multi-line recipe comments**, and **no default values on parameterized recipes** (`scripts/facade-lint.sh:10-14`) — so regression fails the build, not the eyeball.

**The gate is unrunnable where `just` is absent**, and it fails *silently* there: `facade-lint.sh` derives its comment column from `just --list` under `set -euo pipefail`, so the first stage exits 127, `set -e` aborts, and it exits **1 with zero bytes on stdout and stderr** (measured 2026-09-21). Its verdict is therefore unavailable exactly when you cannot ask it. Port the four checks by hand before editing the facade — `:25-91` is two `awk` passes and two greps, and running them is one command.

**Recipe order: comment, attribute, recipe.** Just's parser requires the doc comment *above* the `[attribute]`:

```make
# Current state
[group('navigation')]
orient:
```

Reversing comment and attribute yields `error: extraneous attribute` pointing at the attribute — a red herring that cost real minutes. The error names the wrong crime; the order is the crime.

**Groups mirror sections.** `[group('navigation')]`, `[group('quality gate')]`, `[group('registries')]` — `--list` output is grouped, and group names stay aligned with the justfile's internal `── section ──` comments. If a group changes, both change in the same commit.

**`@` silences the echo.** Every recipe whose output is the product (e.g. `help: @cat docs/help.md`) takes the `@` prefix, or the command line prints above the output. Cosmetic commands (`@echo`, `@git`) take it too.

**Static help via `cat`.** `help` cats a static markdown file (`docs/help.md`); it never embeds live state. Live state is `orient`'s sole job — one recipe, one concern, no duplication. The long-term plan: when okuda compiles, `help` becomes `@./okuda docs/help.md` — the project renders its own signage.

**Dogfood flip (2026-08-24, realised).** `help` is now `@./okuda docs/help.md` — the project renders its own signage through its own compiled binary. The flip landed with the `build` group (`dev`/`build`/`test` recipes). `./okuda` is gitignored build output; run `just build` once after clone, then `just help` renders through okuda. A fresh clone without `just build` falls back to `bun run src/cli.ts docs/help.md` if you prefer not to commit to the binary.

**No new runtime deps.** Piping help to glow (or any renderer) is declined on grounds of self-refutation: okuda's origin doc opens with glow's rap sheet. The facade must not depend on what the project exists to replace.

## Revisit Protocol

As development continues, revisit the facade: when a recipe is added, changed, or removed, check this playbook in the same commit. If a new trap is observed (not speculated — observed), record it under Tricky Parts. If a style rule proves wrong in practice, amend the rule and note why — this document is the living record of how the facade is kept.

## Tricky Parts

The observed traps, in order of encounter:

1. **Attribute order** — see house style above. Symptom: `error: extraneous attribute` with the caret on `[group(...)]`; cause: attribute placed above the doc comment.
2. **Command echo** — a recipe without `@` prints its own command line before the output. Symptom appears only when you *run* the recipe; `--list` and `--check` stay silent about it.
3. **`--list` is alphabetical within groups** — structure comes only from `[group()]`; there is no way to order recipes manually within a group. Name for alphabetical sense (`reg-briefs` before `reg-sync`) or accept the sort.
4. **`docs/` is not a registry** — files there don't need index entries; `briefs/`, `debriefs/`, `decisions/`, `playbooks/` do. Check `scripts/reg-sync.ts` before assuming.
5. **Dogfood `help` needs the binary** — `help: @./okuda docs/help.md` requires `just build` to have produced `./okuda` (gitignored). On a fresh clone, build first; the recipe does not auto-build (navigation should stay cheap).
6. **The comment column is set by the longest signature, defaults included** — `just --list` auto-aligns comments to the longest recipe signature *whether or not that recipe has a comment*. Stripping comments from long-signature recipes does not move the column. The only lever is the signature itself: drop default values from parameterized recipes. Symptom: a 47-column gap after 4-letter recipe names, in a repo that sells restful rendering. Cause: `resize-okuda file="docs/glow-vs-okuda.md"` pinning the column. The gate (`scripts/facade-lint.sh`) asserts the band.
7. **Mechanize the causes of raggedness, not raggedness itself** — the gate checks column band, comment word count, and no-defaults-on-params because those *cause* the menu to look ragged and are measurable. It does not check "looks restful" — that's the eyeball's job, and a metric for it would be benchmaxxing. The agent measures the floor; the human eyeballs the ceiling.
8. **`{{args}}` is re-parsed by the shell; `"$@"` is not** — a variadic recipe body that interpolates `{{args}}` unquoted hands the string to `sh -c`, which parses it *again*. An argument carrying `&` is eaten as a control operator, and the recipe then runs with **no arguments at all** rather than failing: `just tables-check '&ear.md'` scanned the whole silo and reported success. Symptom: a file-scoped recipe behaves silo-wide. Cause: `sh: ear.md: command not found` printed *above* the recipe's own output, where it reads as noise. Fix: `set positional-arguments` once at the top of the justfile, then `"$@"` in the recipe — just passes the recipe's parameters to the shell as real positional parameters, so no second parse happens. `{{quote(args)}}` is not the fix: it collapses every argument into one, which breaks flags. `search-replay` and the `gloam` dispatch carry the same shape and were latent until this setting landed.

## Cross-References

- Facade pattern rationale: `decisions/001-silo-pattern-adoption.md`
- Registry index rules: `playbooks/registry-playbook.md`
- The delve surface: `docs/help.md`
