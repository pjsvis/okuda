---
type: ADR
callsign: ADR-SEAM-COPY-059
---

# Decision: The seam is crossed by a copy the receiver commits — not a shared symlink

**Date:** 2026-10-10
**Status:** Accepted

## Context

`okuda/system.md` is the Protocol's source of truth; a sibling silo,
`cool-pi-extensions`, carries a copy at `SYSTEM.md` that the agent runtime reads
(`~/.pi/agent/AGENTS.md`). The deploy was a `cp` through a two-hop symlink into
that repo — it wrote silently, left the receiver dirty, and no gate in either
silo could see the crossing. The finding named the fork and left it open: keep a
copy, refreshed by a commit owed in the sibling; or make `SYSTEM.md` a symlink
to `okuda/system.md`, one file and no drift
(`docs/2026-10-10-the-impostor-symlink.md`).

BRF-PROTOCOL-UPDATE picked the copy and replaced the write with a message: the
sender publishes a cut into the receiver's inbox, and the receiver owns
`SYSTEM.md` and the commit (the seam rule, `docs/2026-10-10-the-seam.md`). This
ADR records the choice, because the mechanism now rests on it.

## Decision

**The Protocol crosses the seam as a copy, sent as a message, committed by the
receiver; it is never a shared file across the boundary.**

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **A cross-repo symlink** — one file, no drift (*no parallel stores* read strictly) | The rule governs stores *inside* a boundary, where two copies must agree and nothing makes the hand copy pull. Across a seam there is no shared invariant to keep — only a message from a sender to a receiver who commits. A symlink would buy "one file" by giving *neither* side ownership, and by coupling the receiver's tree to the sender's path. |
| **Keep the `cp`-through-the-chain, declared** | Declaration fixed the *silence*, not the *crossing*: a direct cross-repo write is unverifiable by construction — no gate spans a seam — and it left a commit owed in a repository okuda does not commit to, every time `system.md` moved. |
| **Every runtime reads the source directly** (`~/.pi/agent/AGENTS.md -> okuda/system.md`) | Couples the runtime to a working tree: an uncommitted edit or a branch checkout changes what every future session loads, with no publish step between author and reader. |

## Consequences

**What became easier.** The source and the deployed copy each have one owner;
the sender cannot leave the receiver dirty; the receiver may adapt its copy
without the sender; and `just protocol-check` answers *who is behind* by `cmp`,
not by trust.

**What became harder.** There is a message to read and a commit to make on the
receiving side — a deliberately visible step where the old `cp` was invisible.
The receiver may decline or adapt the cut, and the sender waits.

**Constraints this imposes.**

- **The sender never writes through the receiver's path.** `protocol-install`
  writes only into `msgs/from-*/` — an unregistered inbox — and commits nothing.
- **The receiver owns `SYSTEM.md` and the commit.** The cut is content; the
  commit is the receiver's.
- **A crossing declares itself** — what was sent, where it landed, who commits.
- **The deployed artefact is a copy, not a link**, so no receiver path depends on
  okuda's filesystem layout.

## Related

- `docs/2026-10-10-the-impostor-symlink.md` — the finding; its open decision is this ADR
- `docs/2026-10-10-the-seam.md` — the seam rule (*messages, not shared files*)
- `briefs/2026-10-10-brief-protocol-update.md` — the brief that chose it
- `debriefs/2026-10-10-debrief-protocol-update.md` — the deploy as built
- `playbooks/registry-playbook.md` — *no parallel stores*; *across silos — the seam*
- `decisions/058-derived-amp-table.md` — the same axis inside one boundary
