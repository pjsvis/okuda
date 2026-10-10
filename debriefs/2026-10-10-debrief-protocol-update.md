---
type: Debrief
callsign: DBF-PROTOCOL-UPDATE
---

# Debrief: The protocol update — the file is the state, and the deploy is a message

**Date:** 2026-10-10
**Status:** Done — BRF-PROTOCOL-UPDATE shipped. The two entries and the
cut line are in `system.md`; `just protocol-install` publishes a copy into
`cool-pi-extensions`'s inbox; `just protocol-check` names who is behind. The header
sweep across the other documents is BRF-HISTORY-PREFACE, out of scope here.

## What happened

`system.md` accreted a hand-kept changelog — a `Supersedes …` chain back to a
retroactive v1.0.0 — and deployed itself through a two-hop symlink that wrote
into a second repository. The brief paired the two: the version preface is one
instance of a pattern the corpus is missing a rule for, and the chain is a
crossing that never declared itself. The fix is a rule and a mechanism — the file
states the state, the deploy sends a message.

## What was built

- **`system.md`** — the version preface replaced by one `**Cut:** 2.7.1
  (2026-10-10)` line (*this file is the state; its history is in git*), and two
  lexicon entries: **References, not recitals** (the rule) and **The comment's
  referent** (its code corollary), each with a test and prior art.
- **`scripts/protocol-install.sh`** — the write-through-chain replaced by an
  inbox send: a message JSON in `cool-pi-extensions/msgs/from-*`, carrying the
  full cut, its `source_commit`, and the receiver's next action. It writes no
  runtime path and commits nothing.
- **`scripts/protocol-check.sh`** / **`just protocol-check`** — the roster. Per
  copy: `source`, `in sync`, `declared variant`, or `BEHIND`, with the copy's own
  cut marker as evidence.
- **Supporting docs** — `DEPENDENCIES.md`, `playbooks/registry-playbook.md`, and
  `docs/2026-10-10-the-impostor-symlink.md` now describe the deploy as it is: a
  message, not a write through the chain.

## What the check found (the first run)

Seven copies of the Protocol across `~/Dev/GitHub`. Four behind — `blandings`
(v2.5.0), `contracts` (v1.2.0), `cool-pi-extensions` (v2.6.0, the runtime
target), `polyvis` (v1.1.0) — and **two declared local variants**,
`mermaid-to-md` and `jsonl-repair`, each carrying `@<repo>` in its marker.

## Lessons

- **Declared scope is the whole of it.** The `@repo` variants differ by content
  and are *not* behind, because they declare the divergence. The seam rule's
  corollary — *undeclared scope is the defect class, not non-blocking scope* — is
  the check's classification rule, not a footnote to it. A check that could not
  tell a variant from a lag would cry wolf on the two instances that are working
  as designed.
- **A cut line is an address, not a preface.** `**Cut:** 2.7.0 (2026-10-10)` is
  one line the tooling can parse and a reader can hold; the changelog it replaced
  was history git already kept. The test in the new entry — *does the document
  stand if the reader knows nothing before it?* — is what the file had been
  failing.
- **The deploy's after-state is named, not automated.** The runtime still reads
  through `~/.pi/agent/AGENTS.md`; repointing it is an operator action. The
  script says so on every run rather than reaching across the seam to do it.

## Postscript — the receiver's two findings

Cool-pi-extensions committed the 2.7.0 cut (`15732af`, `origin/main`) and
returned two findings; the cut was patched to 2.7.1 and sent again.

- **The transport dropped the last byte.** `--arg detail "$(cat …)"` strips the
  file's trailing newline in command substitution, so the message's `detail`
  hashed to `02f3dbef…` against the stated `c740e1008aec`. Fixed with `--rawfile`,
  which reads the file exactly: a cut's `detail` now hashes byte-identically to
  `system.md`. A silent one-byte loss in a deploy is the class the message was
  supposed to prevent.
- **The cut line's reference did not resolve everywhere.** `git log system.md`
  is mixed-case; the sibling tracks `SYSTEM.md`, so a case-sensitive checkout
  fails the reference. 2.7.1 makes it path-agnostic — *its history is in git* —
  which is also closer to what the line means (the state/history split, not a
  filename).

## Acceptance

Both entries in the lexicon; no `Supersedes` chain; a change lands in the
sibling's inbox with the script naming it and not committing; `just protocol-check`
lists who is behind; no command writes through the chain. Measured: `just check`
green, `protocol-check` runs, and the runtime copy is untouched by the install.

## Related

- `briefs/2026-10-10-brief-protocol-update.md` — the brief
- `docs/2026-10-10-the-seam.md` — the seam rule the mechanism obeys
- `docs/2026-10-10-the-impostor-symlink.md` — the chain, and its retirement
- `system.md` — the two entries and the cut line
