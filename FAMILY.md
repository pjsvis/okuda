# FAMILY — the products this tree ships

> Derived by `scripts/family.ts` from the justfile, the package manifests, and
> each product's own imports. **Do not hand-edit** — `just check` runs
> `family.ts --gate` and fails when a product has no row, or a row that moved.

The public surface of the core (`src/`) is a contract by fact, not by
declaration (ADR-EXPORT-SURFACE-082): it is what the product entries import.
Adding an import is additive; removing or changing one a product imports is a
breaking change.

## Products

| Product | Kind | Entry | Recipe | Version |
|---|---|---|---|---|
| `okuda` | binary | `src/cli.ts` | `build` | — |
| `cahier` | binary | `scripts/html-package.ts` | `cahier-build` | — |
| `okuda` | package | `.` | — | 0.1.0-alpha.1 |
| `@polyvis/testcard` | package | `packages/testcard` | — | 0.1.0 |

## What each binary imports from the core

| Binary | Core files |
|---|---|
| `okuda` | `src/ansi`, `src/launcher`, `src/palette`, `src/render`, `src/root`, `src/tui`, `src/vectors`, `src/width` |
| `cahier` | `src/render`, `src/root` |
