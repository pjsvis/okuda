---
type: ADR
callsign: ADR-RENDER-ENGINE-005
---

# Decision: Render engine uses string protocols over Bun.markdown's string-in/string-out callbacks

**Date:** 2026-08-24
**Status:** Accepted

## Context

`Bun.markdown.render(input, handlers, options)` invokes one callback per
element, each receiving the already-rendered children as a **string** and
optional metadata, returning a string. Callbacks fire **post-order**
(children resolve before parents). On the runtime we target (bun 1.3.8),
two structural facts shape the engine:

1. **`listItem` metadata is absent.** The handler receives `children` only —
   no `index`, `depth`, or `ordered`. (`bun-types` ≥ 1.3.11 documents this
   metadata, but the 1.3.8 runtime does not deliver it; the contract's
   precondition pins 1.3.8.) The `list` handler *does* receive
   `{ ordered, start }`, and tables' `th`/`td` receive `align`.
2. **No token-stream / AST access.** `Bun.markdown` exposes `html`,
   `render`, `react` — no lexer or AST export on 1.3.8. The only structure
   is the callback tree.

The render engine must still assign list markers, track nesting depth
(grammar caps at 2), classify Mermaid ASCII into border/arrow/text
channels, apply the table uniform presentation layer, and hard-wrap with
ANSI style hygiene across wrap boundaries — all from string callbacks.

## Decision

The engine passes structure through **private-use string tags** carried
*inside* the callback output, and the wrap engine consumes the emitters'
ANSI **directly as the style protocol**. Two concrete protocols:

- **List placeholder protocol.** `listItem` emits a `\u0000I\u0000`
  placeholder marker. The `list` handler (which knows `ordered`/`start`)
  splits on it to assign `•`/`n.` markers. Each list tags its resolved
  output `\u0000NL:<maxInternal>\u0000 … \u0000/NL\u0000`; the parent
  shifts a level-0 block +2 (col-2 markers, col-4 continuation per the
  contract's indentation table) and flattens an already-shifted block to
  continuation text, enforcing the two-level cap. Top-level tags are
  stripped at final document assembly.
- **ANSI-state-machine wrapping.** The wrap engine does not use an
  intermediate span/marker representation. It tokenises the emitter output
  into escape spans + graphemes, tracks active SGR/OSC-8 state by
  **folding each emitted line's own units positionally** (state at flush
  time, not scan time), re-emits the carry at continuation line starts,
  and appends a defensive `\x1b[0m` per formatted line (hygiene rule 4).
  Invariant relied upon: emitters pair opens with full `\x1b[0m` resets
  only — no partial resets (`\x1b[22m` etc.) — so the state list is a
  simple push/clear.

Never-wrapped blocks (code fences, Mermaid ASCII) ride in `\u0000RAW:kind\u0000
… \u0000/RAW\u0000` tags so container handlers (blockquote, list) pass them
through untouched during re-wraps.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Upgrade bun to ≥1.3.11 and use `listItem` metadata | Changes the operator's toolchain (outside the silo); the contract precondition pins 1.3.8; the gap is small and the workaround is deterministic and testable |
| Hand-roll a markdown lexer | Replaces `Bun.markdown`'s value; the contract chose Bun.markdown precisely to avoid a parser; out of scope |
| Span/marker representation for wrapping (open/close tags per inline style, separate from ANSI) | Two protocols to keep in sync; the ANSI *is* already a complete, parseable style stream — doubling it is entropy, not anti-entropy |
| Pre-order marker injection (push list context before items render) | Callbacks are post-order; there is no pre-order hook. The placeholder protocol is the post-order-compatible equivalent |

## Consequences

**What became easier:**
- The engine stays fully within `Bun.markdown`'s string-in/string-out contract — no AST, no lexer, no Bun version coupling beyond 1.3.8
- `NO_COLOR` parity is automatic: the wrap state machine collapses to identity (no escapes to track); coloured and plain output share one code path
- List depth, table rows, and never-wrapped blocks all flow as plain strings — testable with string assertions, no mock plumbing

**What became harder:**
- Three private-use tag protocols (`\u0000I\u0000`, `\u0000NL:n\u0000…\u0000/NL\u0000`, `\u0000RAW:kind\u0000…\u0000/RAW\u0000`) must all be consumed before `finalize` strips residue; a forgotten consumer leaks a `\u0000` (caught by a "no tags leak" property test)
- The wrap state machine is the load-bearing complexity; its invariants (positional fold, defensive reset, OSC-8 pairing) are covered by property tests but must be maintained
- A bun upgrade that *adds* `listItem` metadata would make the placeholder protocol redundant — the engine should be re-evaluated then (see Constraints)

**Constraints this imposes:**
- **Emitters must use full `\x1b[0m` resets only.** Any partial reset (`\x1b[22m`, `\x1b[39m`) breaks the state-list push/clear assumption. `ansi.ts` enforces this; future emitters must too.
- **Tag strips must run in `finalize`.** Any path that emits a tag without a consumer relies on the final `stripTags` sweep.
- **Re-evaluation trigger:** if bun ships `listItem` metadata in a version this silo adopts, the list placeholder protocol can be replaced with direct metadata use — a localized, reversible change. The ANSI-state-machine wrapping is independent of that and stays.

## Related

- Brief: `briefs/2026-08-22-brief-ansi-emission-and-closed-grammar.md` (the rendering contract), `briefs/2026-08-22-brief-implementation-renderer.md` (work plan item 6)
- Playbook: `playbooks/justfile-playbook.md` (dogfood flip)
- ADR: `decisions/004-hard-wrap-mandate.md` (the hard-wrap contract this engine implements)
