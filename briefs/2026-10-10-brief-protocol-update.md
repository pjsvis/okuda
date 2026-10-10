---
type: Brief
callsign: BRF-PROTOCOL-UPDATE
---

# Brief: The protocol update — self-contained documents, and a deploy that crosses the seam honestly

**Date:** 2026-10-10
**Status:** Done
**TD:** the BRF-PROTOCOL-UPDATE epic (tracked in td; four tasks)

## Context

`system.md` accretes a version preface (`Supersedes … v1.0.0`) and is deployed to
the runtime through a **symlink chain that writes into a second repository**. The
preface is one instance of a pattern the operator finds across the corpus; the
chain is a bad idea. This brief adds the rule the corpus is missing, and replaces
the chain with a message.

## Objective

Add two lexicon entries to `system.md` — **references, not recitals** (a document
is its current state; git is the history) and its code corollary **the comment's
referent** — and replace the symlink-chain deploy with an **inbox message** to
`cool-pi-extensions`, whose receiver commits.

## Evidence

- **The history preface is everywhere**: 22 documents carry a visible
  `Supersedes` chain or an `amended 2026…` preamble — `system.md`, `&briefs.md`,
  `docs/style-guide.md`, ten-plus decisions, several briefs. Measured 2026-10-10.
- **The chain**: `scripts/protocol-install.sh` writes `system.md` through
  `~/.pi/agent/AGENTS.md → cool-pi-extensions/prompts/edinburgh-protocol.md →
  cool-pi-extensions/SYSTEM.md` — two hops into a foreign repo, declared only by
  the script's own output.
- `system.md`'s header is a hand-kept changelog (v2.6.0 back to v1.0.0) — history
  that git already holds.

## Scope

**In:** the two lexicon entries; replacing `system.md`'s version preface with a
single **cut** line; retiring the write path through the symlink chain; delivering
a `system.md` change as an **inbox message** to `cool-pi-extensions`; a check that
lists **every silo whose `system.md` copy is behind**.

**Out:** repointing the runtime symlink on the machine — an operator action
outside the silo; the sibling's commit — the receiver's, per the seam rule; the
broader history-preface sweep across the 22 documents (a follow-on pass).

## Preconditions

- [x] `cool-pi-extensions` has an inbox (`msgs/`) — the seam's message mechanism.
      Verify; if it has none, creating it is the first deliverable.

## Work Plan

1. [x] Add the two entries; replace `system.md`'s version preface with one **cut**
      line (git is the changelog).
2. [x] Replace `protocol-install.sh`'s write-through-chain with an **inbox send**:
      write the new `system.md` (or its diff) into `cool-pi-extensions`' inbox and
      **print** the destination and the receiver's next action.
3. [x] `just protocol-check`: `cmp` the source against each silo's `system.md` and
      **list who is behind** — the roster the operator asked to keep.
4. [x] The runtime stops reading through the chain; the operator repoints it. Named,
      not automated.

## Acceptance Criteria

- Both entries are in `system.md`'s lexicon.
- `system.md` has no `Supersedes` chain; a single cut line replaces it.
- A `system.md` change lands in `cool-pi-extensions`' inbox; the script **names it
  and does not commit it**.
- `just protocol-check` lists every silo whose copy is behind.
- No command writes through the symlink chain.

## Notes

The entries:

> - **References, not recitals**: a document states what is true *now* and
>   **references** what it needs; it does not recite or assume a history. A
>   version preface, a `Supersedes …` chain, an "amended on / amended on"
>   preamble — each asks the reader to hold a past the file does not need and the
>   repo already keeps. **Git is the history; the file is the state.** Reference
>   the thing; do not recite its timeline. Test: does the document stand if the
>   reader knows nothing before it? A sentence that only makes sense with the
>   history is a preface — reference it or cut it. (A decision that *reverses*
>   another may still cite it — by reference, not by recital.)
>   *Prior art:* clause 3 (*the repo is the memory*); references, not hypertext.
>
> - **The comment's referent**: a comment is a claim about a function, and it owes
>   a referent **in that function's scope** — or an explicit pointer to where the
>   referent lives. A comment that names a feature while sitting in the half of
>   the code that only *parses* it is an **unpaid claim in prose form**. The rule:
>   **a comment lives with the contract it describes, not with the bytes it
>   consumes.** Test: name the symbol in this file that cashes the claim; if there
>   is none, point to it or trim. Worked instance 2026-10-10: `splitKeyEvents`'
>   comment named the header-to-header jump, three files away — and the jump it
>   named was dead.
>   *Prior art:* clause 1 (*every output is a claim*); the audit surface.

The deploy, in one line: **edit `system.md` → send it to the sibling's inbox →
the sibling commits → `just protocol-check` names who is still behind.** No chain,
no cross-repo write, no sender-side commit.

## Related

- `system.md` — the protocol these entries join
- `scripts/protocol-install.sh` — the write-through-chain this replaces
- `docs/2026-10-10-the-seam.md` — a crossing declares itself; messages, not shared files
- `docs/2026-10-10-the-wall-and-the-seam.md` — the impostor-symlink chain, documented
- BRF-SEAM-AUDIT — the comment rule's worked instance
