# DEPENDENCIES — okuda

External tools this silo depends on. Brief preconditions verify against
this file — an entry with a verified date is a claim we have checked, not
an assumption.

| Tool | Version | Purpose | Location | Verified |
|------|---------|---------|----------|----------|
| `bun` | 1.3.8 | Runtime; `Bun.markdown` renderer; runs `scripts/*.ts` | `~/.bun/bin/bun` | 2026-08-20 |
| `just` | 1.53.0 | Task facade — the shared operational lexicon | `/opt/homebrew/bin/just` | 2026-08-20 |
| `git` | 2.54.0 | Version control; the permanent record | `/opt/homebrew/bin/git` | 2026-08-20 |
| `td` | 0.60.0 | Task management and session continuity (epics/tasks) | `/opt/homebrew/bin/td` | 2026-08-20 |
| `mermaid-to-md` | 0.1.0* | Rust CLI: mermaid source on stdin → ASCII diagram on stdout | `~/.local/bin/mermaid-to-md` | 2026-08-20 |

\* Self-reports as `mermaid-tui 0.1.0` — binary name and package name
differ. The origin doc's `spacex-mermaid` is stale; `mermaid-to-md` is
the real dependency.

## Runtime dependency note

The compiled okuda binary will have zero external npm runtime
dependencies; `mermaid-to-md` is its one runtime dependency — invoked per
`mermaid` code fence, never parsed in-process.

## Verification discipline

- Preconditions in briefs verify tools listed here (existence, version, behaviour) before work starts.
- Re-verify on environment change (new machine, PATH change, major version bump) and update the Verified date.
- A missing dependency halts the brief — it does not get worked around silently.
