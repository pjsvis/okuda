---
date: 2026-08-22
tags: [justfile, facade, repo-infancy, knowledge-system]
agent: pi (glm-5.2, ses_7b140e→ses_aea82c)
environment: local
---

# Debrief: justfile facade cleanup (td-fab1d1)

## Accomplishments

- **Facade rebuilt:** `just help` went from a 24-line `@echo` wall (half of it duplicating `orient`'s live state) to `@cat docs/help.md` — a static guide; `orient` keeps sole custody of live state. Declined glow on self-refutation grounds: okuda's origin doc opens with glow's rap sheet.
- **Menu made honest:** recipe comments trimmed to noun phrases ("Registry sync gate", not failure modes); `[group('navigation'|'quality gate'|'registries')]` attributes restore the implicit categories in `--list`; `reg-*` recipes gained uniform one-liners (they were mute).
- **Playbook founded:** `playbooks/justfile-playbook.md` — house style, observed traps, dual-audience principle (terse menu / friendly help / discoverable prefixes), revit protocol, renames-are-API-changes.
- **Scope:** the facade and its documentation only. No `src/`, no renderer — okuda remains pre-implementation. Deferred deliberately: `help: @./okuda docs/help.md` (the dogfood handoff) belongs to the first implementation brief.

## Problems

- **`error: extraneous attribute` red herring:** `[group()]` placed above the doc comment fails with an error pointing at the attribute. Cost real minutes; resolved by isolating in `/tmp` scratch justfiles. The error names the wrong crime; the order is the crime (comment → attribute → recipe).
- **Command echo:** first `help: cat docs/help.md` run printed its own command line — missing `@`. Only visible when *running* the recipe; `--list` and the gate are silent about it.
- **Derived registry summary was a stub:** `reg-sync-fix` derived `"Justfile Playbook"` from the H1 — decorated Stuff next to real summaries. Hand-refined (reg-sync only flags missing/stale files, never content drift — the "review the derived entry" step is load-bearing and manual).
- **`td log` shell substitution:** message containing `$(...)` choked; re-issued with the literal hash. Minor.

## Lessons Learned

- **Scrape the barnacles before you proceed.** Pre-implementation is the cheapest moment to remove facade entropy: no muscle memory formed, no external references to break, and every future session (agent *and* human) reads the facade. The echo-wall would have been copied as "the house pattern" had implementation started first.
- **Menu vs. manual is the core split.** `--list` names items; `docs/help.md` carries details for those who delve. Failure modes and contracts (the beloved "fails (exit 1) on MISSING or STALE entries") live in exactly one place — the delve surface.
- **A facade has two audiences.** Agents and humans, sometimes separately, sometimes together (paired terminal: agent left, human auditing right). Terse menu for both; friendly guide a keystroke away; recipe names are the shared vocabulary — renames are API changes.
- **Playbooks record observed traps, not speculated ones.** Both just traps (attribute order, `@` echo) were encountered, not imagined. The same bar applies to future playbook entries.
- **"Small, no brief needed" grew:** 1 echo-wall removal → 5 commits + playbook + this debrief. Not scope creep — each step followed from the last. But it shows the brief threshold needs judgment; a brief for this arc would have missed most of what mattered (the traps weren't known at the start).

## Observations

### just
- 1.53's `[group()]` works on `default` too — provided the doc comment sits above the attribute.
- `--list` is alphabetical within groups; no manual ordering. Name recipes for the sort you want.
- Bare `just` → `--list` (menu) was kept over a friendlier default: the menu is the neutral shared surface; friendliness lives at `just help`.

### Knowledge system
- `docs/` is not a registry — `docs/help.md` needed no index entry; `just check` stayed green throughout. The registry principle held: playbook + `REGISTRY.jsonl` entry in one commit.
- Independent review (ses_e525fc) approved the arc before merge — fast-forward, branch deleted, intercom receipt sent. Clean closure.

## Metrics

- **Commits:** 5 on `feat/help-recipe` (1563648 → 3107de6), +120/−29 lines across 4 files
- **`just check`:** green at every commit; post-merge green on `main`
- **New knowledge artifacts:** 1 playbook, 1 registry entry, this debrief

## Related

- td: `td-fab1d1` (closed, independently reviewed)
- Facade pattern rationale: `decisions/001-silo-pattern-adoption.md`
- The playbook it produced: `playbooks/justfile-playbook.md`
