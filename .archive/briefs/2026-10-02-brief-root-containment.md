---
type: Brief
callsign: BRF-ROOT-CONTAINMENT
date: 2026-10-02
---

# Brief: Root containment — existence is not permission

**Created:** 2026-10-02
**Status:** Done — shipped 2026-10-02 (f7dd2d8, main): the predicate, the
four seams, and read-only mode landed the same sitting the brief was
filed. The two test-caught lies (resolve is lexical; join is
segment-wise) are the lesson record: DBF-ROOT-CONTAINMENT.
**Lineage:** the operator, verbatim: *"check the Gloam source files at
@src/ for the paths outside the root issue"* — the audit that found the
gap, then: *"lets file briefs for both."*
**Extends:** ADR-048 (the silo root: one static root, resolved once —
the anchor this brief's predicate borrows), ADR-044 (the silcrow gate),
ADR-045 (the path substrate of the gate), ADR-031 (the clone grammar —
whose spawn verbs the read-only mode retires).
**Grounding:** BRF-DEMO-SANDBOX — the bwrap wrapper that carries the
boundary *today*; this brief moves the boundary into the product, where
it belongs. A sandbox is the seatbelt; containment is the vehicle's own
brakes.

## Objective

One containment predicate, threaded through the three resolution
points that currently validate **existence only**, plus a read-only
mode that retires the spawn verbs. After this brief, no document —
whatever it links to — can make gloam read outside the silo root.

## Why — the audit of 2026-10-02

The corpus and the read path are already jailed: the picker lists only
`rg --files` under `siloRoot()` (`src/launcher.ts:198-207`), and there
are no writes anywhere in `src/`. The jump chain is the hole:

| Resolution point | Code | Predicate | Escape |
|---|---|---|---|
| `resolveJumpTarget` | `src/tui.ts:428-438` | `existsSync(join(docDir, target))` | `join` *normalises* — `../../etc/passwd` resolves out of the root |
| Launcher fallback (`resolveTarget`) | `src/launcher.ts:487-490` | `existsSync(target)` → return target | an **absolute path** (`/etc/passwd`) anywhere on disk renders |
| `makePathValidator` | `src/root.ts:242-249` | `existsSync(join(dir, target)) \|\| existsSync(join(cwd, target))` | same two escapes — the gate that decides which tokens are jumpable |

Existence is validated; containment never is. The boundary is
currently enforced by **repo content** (our sanitized mirrors), not by
the substrate — the product trusts every link. One malicious or
careless link in any mirrored document reads outside the silo. For the
public demo (BRF-DEMO-SANDBOX) that risk becomes load-bearing; for the
product, it is simply wrong.

## The rulings

1. **Existence never suffices.** A jump target resolves only if
   `resolve(candidate)` starts with the silo root (ADR-048's root,
   resolved once per session — never re-derived per jump) plus a path
   separator. The predicate is one line; it lives beside the resolution
   points, not inside them.
2. **The gate gains a conjunct.** `makePathValidator` (ADR-045's path
   substrate of the silcrow gate) checks containment *and* existence —
   a `../..` target paints absent, exactly like an unresolvable one.
   Absent-slot semantics carry the failure; no new flash, no new mode.
3. **Read-only mode.** An env/flag (`OKUDA_READONLY=1`) under which the
   spawn verbs retire: `09 editNew` and `99 clone` flash
   `read-only: <verb> disabled` instead of computing a write path or
   spawning. The verbs are already Linux-inert by platform accident
   (`clone.ts:63`, macOS-only default integration); the mode makes the
   retirement deliberate, on every platform, by declaration.
4. **No second registry.** Containment reads the silo root that
   ADR-048 already resolved — no new state, no drift surface.

## Acceptance criteria

- [ ] A test doc linking `../../outside.md` and an absolute path outside
  the root paints absent (no jump); a sibling doc inside the silo jumps.
- [ ] `makePathValidator` rejects out-of-root targets while passing
  in-root ones — the silcrow gate's conjunct, tested.
- [ ] `OKUDA_READONLY=1`: `09`/`99` flash, nothing spawns, nothing
  computes a write path.
- [ ] `just check` green on the branch; registries synced in the same
  commit.

## Out of scope

- **Sandboxing** — bwrap, chroot, sshd config: BRF-DEMO-SANDBOX owns
  the host side entirely. This brief is substrate, not deployment.
- **Serving shape** — ADR-013's ForceCommand loop is untouched; the
  containment predicate makes every *consumer* of jumps safer,
  serving included.

## Open questions

1. **Mode flag spelling** — env (`OKUDA_READONLY`) vs argv
  (`--readonly`), and whether the TUI footer should state it (a muted
  `ro` badge, BRF-SILO-MNEMONICS style) or stay silent.
2. **Symlinks** — `resolve()` collapses symlinks before the predicate;
  a symlink inside the silo pointing out renders the target's
  existence, not its containment. Ruling 1's `resolve` already closes
  this; a test should prove it, not assume it.
  *Amended 2026-10-02, implementation:* the test disproved the
  assumption — `path.resolve` is lexical and never follows symlinks.
  The predicate realpaths both sides (`realpathSync`,
  existsSync-gated, deletion races falling back to resolve); the
  symlink-escape test now proves the closure.

## References

- ADR-044/ADR-045 — the silcrow gate and its path substrate (where the
  conjunct lands)
- ADR-048 — the silo root (the predicate's anchor)
- ADR-031 — the clone grammar (the verbs the read-only mode retires)
- BRF-DEMO-SANDBOX — the ops-side stopgap, and the demo that made this
  brief load-bearing
