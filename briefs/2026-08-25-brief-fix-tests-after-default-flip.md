# Brief: Fix tests after default-palette flip (Dracula → Okuda)

**Date:** 2026-08-25
**Status:** Open
**Branch:** feat/rhs-chip-headers
**Context:** the default palette was flipped from Dracula (glow parity)
to Okuda (LCARS identity) — convergence achieved, now diverging. Tests
that relied on the *default* palette being Dracula now fail because
they assert Dracula colour values but receive Okuda colours. The fix is
narrow: make the tests explicit about which palette they're testing.

## What

Fix the ~20 failing tests across `tests/render.test.ts`,
`tests/table-diagram.test.ts`, and `tests/ansi-palette.test.ts`. The
tests verify the *rendering contract* (specific ANSI bytes for specific
roles) against known Dracula colour values — they are not testing the
*default-palette choice*. The fix is to pass the palette explicitly
where the test doesn't already.

## How

### `tests/render.test.ts`

Already fixed in the flip commit: the `render()` helper passes
`palette: DEFAULT_PALETTE` explicitly. This anchors the rendering-
contract tests to the Dracula values they assert. (The chip tests
assert `DEFAULT_PALETTE.muted` and `DEFAULT_PALETTE.heading` — both
Dracula — so they're covered by the same fix.)

### `tests/table-diagram.test.ts`

The `renderDocument` calls don't pass a palette. Add
`palette: DEFAULT_PALETTE` to each call (or to a shared helper if the
file has one). These tests assert Dracula diagram/table colours
(border `#585858`, arrow `#00af5f`, text `#d7d7d7`, table-header
`#bd93f9`, table-key `#ffff87`).

### `tests/ansi-palette.test.ts`

Already imports `DEFAULT_PALETTE` and passes it to `makeStyler` — these
tests test the styler directly, not via `renderDocument`. Check whether
the `loadPalette()` tests (override loader, malformed JSON, missing
file) now return Okuda as the base instead of Dracula. Two options:

- **(a)** Assert against the Okuda preset values (the new default) —
  tests the actual default behaviour.
- **(b)** Assert against `DEFAULT_PALETTE` explicitly — tests the
  override loader independently of which palette is default.

Prefer **(b)** where the test is about the override mechanism (load +
merge), not the default choice. Where the test is specifically about
"what does `loadPalette()` with no args return?", assert Okuda.

## Scope

- Test-only changes. No source changes (the flip is already committed).
- No new tests — the flip doesn't add behaviour, it changes a default.
- The existing "plain output is the colored output minus escapes"
  parity test must still pass (blank lines are blank in both modes).

## Out of scope

- An ADR for the default-palette flip (separate; capture as a
  divergence row in ADR-007 or a new ADR-010).
- Updating `docs/` prose that references "the default is Dracula."
