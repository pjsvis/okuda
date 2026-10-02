---
type: Brief
callsign: BRF-VALVE-LINT
---

# Brief: The valve lint — td-ID citations in persisted documents fail the gate

**Date:** 2026-10-02
**Status:** Done — shipped same sitting (3e6887d): the valve is a gate in `just check`, baseline 109 files / 284 citations, bite/revert proven twice (implementer and an independent reviewer each). Reviewed by the valve's author, who re-ran the proof. v2 boundary recorded: src code comments carry 26 td citations outside the scan — documents-only is the right v1.

---

## Objective

Make the One-Way Valve (playbooks/td-playbook.md, codified 2026-10-02) a
gate, not prose. The valve: *the ephemeral may cite the persistent; the
persistent never cites the ephemeral* — td data is local and clone-bound,
so persisted documents cite callsigns and SHAs, never td IDs. Prose lost to
a fast session within thirty minutes of codification (the silcrow-edge
debrief); a check that fails `just check` does not rely on memory.

## The census (the residue, measured)

298 td-ID citations across ~120 persisted documents, plus 6 in registry
entries — the sediment of six weeks using the working queue as the
archive. All pre-codification: inert, not rewritten, per the valve's own
residue clause (debriefs are frozen; history is never force-pushed for
hygiene). The lint therefore **baselines** the sediment rather than
demanding cleanup:

- `scripts/td-id-baseline.json` — per-file counts, generated once at build
  and committed. A file passes at or below its baseline.
- The baseline may only shrink. A file under baseline prints a note (drop
  the entry); a file over baseline, or any hit in an unbaselined file,
  **fails the gate** with file:line:match.
- No auto-fix: the human replaces the citation with a callsign or SHA —
  the one act the valve actually asks for.

## Scope and exemptions

* **Scanned:** all `.md` under `briefs/`, `decisions/`, `debriefs/`,
  `playbooks/`, `advisories/`, `docs/`; root `README.md`, `AGENTS.md`,
  `system.md`, `DEPENDENCIES.md`; the registry `INDEX.jsonl` /
  `REGISTRY.jsonl` files (the valve lists "registry entries" explicitly).
* **Excluded:** generated `index.md` files (they render whatever the
  baselined registry entries say — the source is scanned, the echo is not).
* **Exempt:** `playbooks/td-playbook.md` — the td manual documents the
  ephemeral layer's own command syntax; its example IDs are syntax, not
  citations.

## Pattern

`/\btd-[a-f0-9]{6,8}\b/gi` — real ID shape, 6–8 hex (length-proof against
a future id-width change), case-insensitive for free.

## Acceptance

1. A new td-ID citation in any scanned file fails `just check` with
   file:line:match.
2. The baselined corpus passes (sediment grandfathers; gate green now).
3. Generated `index.md` files are not scanned; the registry entry that
   feeds them is.
4. Pure functions exported and tested (count, verdict: ok / shrink /
   violation, including the unbaselined-file case).
5. `just check` green, `bun test` green, baseline committed.
