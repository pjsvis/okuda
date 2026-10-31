# okuda — Project Identity

A terminal markdown viewer built on `Bun.markdown`, rendering mermaid fences via the `mermaid-to-md` Rust CLI, compiled to a single binary. Design source of truth: `docs/2026-08-20-origin-doc.md`. Constitution: `system.md` (The Edinburgh Protocol).

## Rules of Engagement

1. **Orient first.** `just orient` at session start. `td usage --new-session` for task identity.
2. **Brief before build.** Non-trivial work gets a brief in `briefs/` before code is written.
3. **td is the continuity system.** Brief-scale work (epics) and implementation tasks live in td: `td create` when work is defined, `td start` before touching files, `td log` after substantive changes, `td handoff --done/--remaining` at session end, `td review` to close. Work not in td isn't tracked.
4. **Branch hygiene.** Never commit work directly to `main`. Branch `feat/<name>`, one logical change per commit, then fast-forward into `main`. No PR for docs or code — code lands behind a **recorded td review** and a green `just check` (ADR-DOCS-DIRECT-060, amended 2026-10-12).
5. **Quality gate.** `just check` before every commit — it must pass.
6. **Registry principle.** If a directory accumulates documents, it gets a JSONL index. Add document + index entry in the same commit (`just reg-sync-fix`, then review the derived entry).
7. **Decisions get ADRs.** Two viable options, a reversed approach, or a new pattern → `decisions/NNN-*.md`. On reversal, run the palimpsest protocol (`playbooks/decisions-playbook.md`). A defect recorded as *"not fixed here"* opens a td task in the same sitting — a deferral with no owner is a wish. Two such notes sat in `ADR-BUILD-SIGNS-040`; one was repaired a day later, the other cost a session a month later.
8. **Stage explicitly.** Never `git add -A` / `git add .`. Stage only paths the agent authored or the operator named. Untracked paths the agent did not create are the operator's — surface them in `git status`, never commit them. The operator includes them by name (`include <path>`) or with *"the untracked files are mine"*.
9. **Debrief when done.** Significant work closes with a retrospective in `debriefs/`.

## Scope Discipline

okuda renders what this workflow generates: headers, loose lists, loose tables, code fences, mermaid→ASCII, inline styles, word wrap. Full CommonMark compliance, interactive TUIs, and HTML pipelines are explicitly out of scope (`docs/2026-08-20-origin-doc.md`).

**Three concerns, three owners** — the operating principle for any scope question:

1. **Compositing** (where the text comes from) belongs to the environment. okuda never composites; the filesystem is the message bus, and any tool that writes markdown to a file is already a compositor, without an API.
2. **Windowing** (where the text appears) belongs to the host (Herdr). okuda carries no window manager; opening a tab is the host's job, not the viewer's.
3. **Rendering** (markdown in, coloured bytes out, fast) is okuda's whole job.

The test for any "should we build X": *does X touch the byte stream or the screen?* If it touches the byte stream's origin (compositing) or the pane layout (windowing), it belongs outside okuda. If it touches the screen before the byte stream, it's rendering and it's ours. One line, one gate, no exceptions — *we don't care where the text comes from.*

**Reading, not editing** — the fourth clause, and the one a coordinate always breaks.
A code file renders as a **document**: one fence, its comments as prose, the same
renderer and the same silcrow as anything else (`wrapWholeFile`,
`src/render.ts:1164`; discovery in a code file runs over its comment regions only,
`src/render.ts:1217`). So a citation resolves to a **file**, and the reader browses
it here. Writing and symbol lookup belong to the editor, reached with `88` from
wherever you are standing — including a file you just dereferenced, because the verb
acts on `currentFile` (`src/tui.ts:926`), not on the file you opened.

The split is **orientation versus lookup**, not read versus write: okuda orients
(what is this, what does its header claim, where am I, what is the shape at one
screen); the editor looks up (where is it defined, who calls it, rename it). The
renderer never indexes code; the editor never renders it. Any feature that needs an
index — a line map, a symbol table, a call graph — is the editor's, and building it
here buys a stale copy of a fact the other tool keeps exact
(`ADR-LINE-IS-PROSE-078`, which is the coordinate this clause would have refused).

## Authoring

The silo has one written guide to producing a document: `docs/style-guide.md`.
It is the **author's** guide, not the renderer's spec — the inverse of the
grammar showcase, which answers *what does okuda do with my markdown*, where the
style guide answers *what markdown do I write to get the okuda look*.

Read it before authoring, not after. It is short, and it renders as the demo of
itself.

Three things it will tell you that are easy to get wrong:

- **The renderer supplies the colour; the author supplies the structure that
  earns it.** A wall of white is what an agent emits when it treats markdown as
  a plain-text dump.
- **A diagram never wraps.** A wrapped state machine is a lie about the
  topology. If it does not fit, the diagram is too big — split it by view, not
  by cutting one graph in half.
- **Structure is a choice, not a decoration.** Before each block, ask: what is
  this block's structure, and which pattern earns it?

The anti-pattern the guide refuses is prose where structure was available and
refused. That refusal is the whole of the house style.

## External Dependency

`mermaid-to-md` (Rust CLI, `~/.local/bin/`) — reads mermaid source on stdin, writes ASCII diagram to stdout. okuda never parses mermaid itself.

## Knowledge System

Briefs (`briefs/`), playbooks (`playbooks/`), decisions (`decisions/`), debriefs
(`debriefs/`), and session handoffs (`td handoff` — never a brief,
ADR-SESSION-HANDOFFS-017). The tiers, what each answers and how long each lives
are owned in one place: `playbooks/playbooks-playbook.md`.

External dependencies: `DEPENDENCIES.md`
