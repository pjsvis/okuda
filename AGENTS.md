# okuda — Project Identity

A terminal markdown viewer built on `Bun.markdown`, rendering mermaid fences via the `mermaid-to-md` Rust CLI, compiled to a single binary. Design source of truth: `docs/2026-08-20-origin-doc.md`.

## Rules of Engagement

1. **Orient first.** `just orient` at session start. `td usage --new-session` for task identity.
2. **Brief before build.** Non-trivial work gets a brief in `briefs/` before code is written.
3. **Claim before edit.** `td start td-xxx` before touching files; `td log` after substantive changes.
4. **Branch hygiene.** Never commit work directly to `main`. Branch `feat/<name>`, one logical change per commit.
5. **Quality gate.** `just check` before every commit — it must pass.
6. **Registry principle.** If a directory accumulates documents, it gets a JSONL index. Add document + index entry in the same commit (`just reg-sync-fix`, then review the derived entry).
7. **Decisions get ADRs.** Two viable options, a reversed approach, or a new pattern → `decisions/NNN-*.md`. On reversal, run the palimpsest protocol (`playbooks/decisions-playbook.md`).
8. **Debrief when done.** Significant work closes with a retrospective in `debriefs/`.

## Scope Discipline

okuda renders what this workflow generates: headers, loose lists, loose tables, code fences, mermaid→ASCII, inline styles, word wrap. Full CommonMark compliance, interactive TUIs, and HTML pipelines are explicitly out of scope (`docs/2026-08-20-origin-doc.md`).

## External Dependency

`mermaid-to-md` (Rust CLI, `~/.local/bin/`) — reads mermaid source on stdin, writes ASCII diagram to stdout. okuda never parses mermaid itself.

## Knowledge System

| Tier | Directory | Answers |
|------|-----------|---------|
| Briefs | `briefs/` | What will we build? |
| Playbooks | `playbooks/` | How do we do X? |
| Decisions | `decisions/` | Why did we choose X over Y? |
| Debriefs | `debriefs/` | What happened and why? |

Silo map: `SILO_MANIFEST.md`
