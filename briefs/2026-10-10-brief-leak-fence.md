---
type: Brief
callsign: BRF-LEAK-FENCE
---

# Brief: The leak gate's fence exemption — anchor on the source, not a rendered match

**Date:** 2026-10-10
**Status:** Open

## Context

`prose-check --strict-leaks` is a zero-ratchet gate: any markdown emphasis that
survived the render fails the run. It **intends** to exempt code — *"a fence full
of asterisks is not a finding"* — and enforces that by matching each *rendered*
line against a 20-char slice of each *source* fence line. When the renderer
changes a fence line, the match fails, and the fence's literal `**` is reported as
a leak.

## Objective

Make the fence exemption robust by anchoring the scan on the **source** — where
the fence structure is known — instead of on a rendered-line substring match.

## Evidence

Two files, `just prose-check --strict-leaks`, 2026-10-10:

| file | carries | result |
|---|---|---|
| `tmp/leak-a-header.md` | `**Status:**` as a bold field line | **passes** |
| `tmp/leak-b-fence.md` | `**Status:** <word>` inside a `markdown` fence | **FAILS**, reported as `**Status:**` |

The reported line is `**Status:**` — the `<word>` was shed by the renderer, so the
source slice `**Status:** <word>` is not a substring of the rendered line, the
exemption misses, and a verbatim fence line is called a leak. **The gate fires on
a correct document.**

## Scope

**In:** `scripts/prose-check.ts` — `leaks()` and its fence handling; a test.

**Out:** the wall meter (editorial, never gates); the leak *rule* itself — a `**`
that fails to render **in prose** is still the one defect class worth gating.

## Work Plan

1. [ ] Anchor on the source: iterate the non-fence, non-frontmatter source lines
      (the `units()` set), extract the emphasis-shaped spans, and report those the
      rendered output printed literally.
2. [ ] Keep the two exclusions that are about *content*, not position: a code span
      that deliberately displays markup, and a `**` that is not emphasis (a glob, a
      URL's `__`).
3. [ ] Test both directions: a fence with `**X**` passes (tagged and untagged); a
      prose `**X**` that fails to render fails.

## Acceptance Criteria

- `tmp/leak-b-fence.md` passes; `tmp/leak-a-header.md` passes.
- A prose line whose `**` fails to render still fails the gate.
- A test pins both directions.

## Notes

The class is **undeclared scope**: the gate *says* it exempts code, and it does
not — by accident of a fragile match, not of intent. A gate whose scope is stated
but not enforced is a false signal, the same shape `docs/2026-10-10-the-seam.md`
names at the boundary. Here the scope is **prose**, and the robust expression of
it is the source's own fence structure — not a guess made from the rendered bytes.

## Related

- `scripts/prose-check.ts` — the gate
- `playbooks/authoring-playbook.md` — the leak ratchet
- BRF-HISTORY-PREFACE — the sweep that hit it
