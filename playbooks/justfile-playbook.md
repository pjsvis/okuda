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

**No new runtime deps.** Piping help to glow (or any renderer) is declined on grounds of self-refutation: okuda's origin doc opens with glow's rap sheet. The facade must not depend on what the project exists to replace.

## Revit Protocol

As development continues, revit the facade: when a recipe is added, changed, or removed, check this playbook in the same commit. If a new trap is observed (not speculated — observed), record it under Tricky Parts. If a style rule proves wrong in practice, amend the rule and note why — this document is the living record of how the facade is kept.

## Tricky Parts

The observed traps, in order of encounter:

1. **Attribute order** — see house style above. Symptom: `error: extraneous attribute` with the caret on `[group(...)]`; cause: attribute placed above the doc comment.
2. **Command echo** — a recipe without `@` prints its own command line before the output. Symptom appears only when you *run* the recipe; `--list` and `--check` stay silent about it.
3. **`--list` is alphabetical within groups** — structure comes only from `[group()]`; there is no way to order recipes manually within a group. Name for alphabetical sense (`reg-briefs` before `reg-sync`) or accept the sort.
4. **`docs/` is not a registry** — files there don't need index entries; `briefs/`, `debriefs/`, `decisions/`, `playbooks/` do. Check `scripts/reg-sync.ts` before assuming.

## Cross-References

- Facade pattern rationale: `decisions/001-silo-pattern-adoption.md`
- Registry index rules: `playbooks/registry-playbook.md`
- The delve surface: `docs/help.md`
