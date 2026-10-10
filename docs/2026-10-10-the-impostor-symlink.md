---
date: 2026-10-10
kind: finding and fix — the deploy target is a symlink chain into another repository; the install first resolved the chain and declared what it wrote, then the write itself was retired for an inbox message (BRF-PROTOCOL-UPDATE)
lineage: found on 2026-10-10 while checking whether bold/italic styles could be added to the Pi theme — reading `~/.pi/agent/settings.json` and the `cool-pi-extensions` theme exposed the `AGENTS.md` symlink. Residue of the Blandings spin-off: the commissioning work that placed a copy of the Protocol in a second repository.
status: recorded — the finding; the write path is retired (the deploy is now a message; the receiver commits), and the copy-versus-symlink decision is recorded (ADR-SEAM-COPY-059)
---

# The impostor symlink — `AGENTS.md` is not a file

## The finding

`~/.pi/agent/AGENTS.md` is a symlink, and the chain has two hops:

```
~/.pi/agent/AGENTS.md
  -> /Users/petersmith/Dev/GitHub/cool-pi-extensions/prompts/edinburgh-protocol.md   (symlink, tracked)
     -> ../SYSTEM.md                                                                 (a regular file)
```

So `just protocol-install` — `cp system.md "$HOME/.pi/agent/AGENTS.md"` — was
never a local deploy. It followed both hops and overwrote
`cool-pi-extensions/SYSTEM.md`, a file in **another repository**, and left that
repo dirty with nothing on screen saying where the write went.

The path is an **impostor**: it presents as the agent's config and resolves into
a foreign repo. That is the silo's own class, applied to a deployment rather than
a document — *a derived artefact declares itself derived; a pointer resolves.*
`cp` followed a pointer in silence, and a pointer that does not resolve out loud
is the shape the whole corpus is built against.

## Why it happened

Residue of the Blandings spin-off. Commissioning a second silo needed the
Protocol present in that repo, and it was placed there as a **copy**:
`system.md` (this silo) is the authority, `cool-pi-extensions/SYSTEM.md` is a
refreshed copy. Copies drift — and this one drifts in a repository this silo
does not commit to, which is the worse half.

## The fix — declare, don't refuse

`scripts/protocol-install.sh` now:

1. **resolves the chain** — a symlink loop, because macOS ships no `readlink -f`;
2. writes the **real** file, not the path it was handed;
3. prints the path it actually wrote, and when that path came through a symlink,
   says so;
4. if the real file is inside a git repository, **names the repository** and
   reports whether the copy is uncommitted there.

The deploy is not refused. The wiring is deliberate — the pi prompt *should*
live in a versioned repo — but it can no longer be silent, and it can no longer
leave a repo dirty without naming the file and the repo. **The impostor is now
an announced address.**

**Superseded 2026-10-10 (BRF-PROTOCOL-UPDATE):** declaring the chain was still
a write *through* the seam. The deploy is now a **message** — `just
protocol-install` publishes a copy of `system.md` into `cool-pi-extensions`'s
inbox (`msgs/from-*`), and the receiver owns `SYSTEM.md` and the commit. The
chain is the runtime's *read* path; this silo no longer writes through it. See
`docs/2026-10-10-the-seam.md`, the seam rule.

## The residue still standing

`cool-pi-extensions/SYSTEM.md` is currently modified — byte-identical to
`system.md` — and uncommitted. That is not a defect; it is the deploy doing its
job with no commit to land it. It belongs in that repository's history.

## Open — the decision this finding exposes

A copy that must be re-committed in a second repository is a **parallel store**
with a manual sync. Two ways out, and it is the operator's call:

- **(a) keep the copy**, and treat the install as a cross-repo deploy whose
  commit belongs in `cool-pi-extensions`. This is the convention the theme
  playbook already uses for the palette — copy, with a documented sync
  direction.
- **(b) make `cool-pi-extensions/SYSTEM.md` a symlink** to
  `../../okuda/system.md`: one file, no copy, no drift, and the install becomes a
  *check* rather than a write. That is *no parallel stores* read strictly.

Each has a cost, and they are different costs. **(a)** leaves a commit owed in
another repo, every time `system.md` moves. **(b)** couples that repo to this
one's path — move the silo and its `SYSTEM.md` stops resolving — and it trades an
owed commit for a hard path dependency.

Unrecorded as a decision. If the operator picks one, it earns an ADR; the
finding does not need one, because the fix (declare the write) is right under
either.

**Decided 2026-10-10 — ADR-SEAM-COPY-059**: the copy is kept, refreshed by a
message whose commit belongs in `cool-pi-extensions` (option **(a)**); the
cross-repo symlink, the declared `cp`, and reading the source directly were
refused, with reasons. The section above is the finding as it stood before the
choice.

## Related

- `scripts/protocol-install.sh` — the fix; the resolution and the declaration
- `DEPENDENCIES.md` — the deploy target declared as an external consumer
- `docs/2026-09-14-derrida-and-the-decomposed-pdf.md` — *a derived artefact declares itself derived; a pointer resolves*
- `playbooks/registry-playbook.md` — *no parallel stores*; the cache-versus-shadow test
- `docs/2026-10-06-the-shared-artifact.md` — the artifact carries what both parties must see
- `briefs/2026-10-10-brief-commission-blandings.md` — the spin-off this is residue of
