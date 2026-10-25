---
type: ADR
callsign: ADR-PANE-NOT-CANVAS-069
date: 2026-10-25
---

# Decision: The pane is not a canvas — layout at the diagram's width, elide at the glass

**Date:** 2026-10-25
**Status:** Accepted — reverses the policy shipped hours earlier in `2a11837`. The
operator set the principle (*"the vertical rhythm is maintained without things
being added or removed from the flow"*), the numbers below chose the constant, and
the record is written after the code because an ADR written first is a proposal
wearing a decision's clothes.
**Enforced by:** `tests/table-diagram.test.ts` — *"the vertical rhythm is invariant
under pane width"* (block sequence identical at 60/80/120/160/200 columns) and *"a
diagram wider than the glass is drawn and cut, never refused"* (no `▸` refusal
carries a width). Also `scripts/elision-monotone.ts --strict`, whose baseline may not
grow without a stated reason.

## Context

Every markdown construct had answered *"what does too wide mean?"* except one.

| construct | answer | where |
|---|---|---|
| prose | wrap — a break is insignificant | `src/wrap.ts` |
| code fence | elide at the glass — a break is a false line | `src/render.ts` (`code`) |
| table | compose at the author's width, cut the composed line | `ADR-TABLE-EDGE-CUT-055` |
| **diagram** | *unanswered* | this record |

The gap had been filled three times and each fill failed differently.

1. **The engine's canvas was ambient.** `mermaid-tui` takes its canvas from
   `-w`, else `$COLUMNS`, else 80; the wrapper passes no `-w`
   (`mermaid-to-md/src/main.rs:67-70`), and okuda passed nothing. So art was
   composed for *the shell's* width — or 80 when okuda's stdout was a pipe — and
   then elided at okuda's own budget. Same pane, same document, three different
   renders.
2. **`2a11837` gave the engine the pane instead.** Determinism reached: the art
   fit by construction. The cost was the diagram's **existence**: a diagram that
   did not fit the current window was replaced by a one-line receipt, so resizing
   the terminal added and removed content from the flow. Measured on
   `docs/2026-10-25-test-diagrams.md` — **268 / 374 / 431 / 467 / 467 lines** at
   80 / 100 / 120 / 160 / 200 columns. Five shapes for one document.
3. **A third was designed and never built:** re-render the engine's *source-box*
   fallback at the pane so its text would wrap to the glass. Measured and
   withdrawn — the fallback wraps **only because its canvas is narrower than its
   content** (a 272-column source: 29 lines at canvas 64, 25 at natural width). A
   generous canvas stops it wrapping, so the extra spawn bought a symptom of the
   defect it was meant to fix.

The question was wrong in all three. The engine's canvas was never okuda's to
*vary*; it was okuda's to **fix**.

## Decision

**A diagram is laid out at its own canvas and elided at the glass. The pane decides
where to cut, never what exists.**

1. The layout canvas is a constant, `LAYOUT_CANVAS = 2048`, derived from the
   engine's own ceiling: `MAX_NODES` is 128 and its LR layouts spend ~15 columns a
   node (a 127-node chain lays out at **1929**; a 100-node chain already refuses a
   1024 canvas). 2048 clears every diagram the parser will admit. It is never the
   pane, and never `$COLUMNS`.
2. Preformatted content is **elided, never re-flowed** — diagrams, code fences,
   tables and the engine's source listings alike. Underneath all four:
   **wrapping is a claim that the break is insignificant.** In prose that claim is
   true; in a code line, a box edge or a rank it is false.
3. A cut states what widening would buy: `⋮ … · art elided · needs 241 cols`. The
   number is the art's own width — measured, not probed, not asserted.
4. `▸` returns to its coined meaning, *no art at all*. One refusal survives: the
   engine will not lay the diagram out even on 2048 columns, and says so with that
   number.
5. The guarantee is **invariance of the document's blocks**, not of its line
   count: the sequence of prose-run / art-run / receipt is identical at every
   width, and art-run lengths are identical. Prose runs may change length,
   because prose wrapping is what prose is for.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| The ambient canvas (status quo ante) | Two widths, one invisible. "Consistent within itself, inconsistent between shells." |
| The pane-bound canvas (`2a11837`) | Shipped, then reversed the same day: it made existence a function of the window. 268→467 lines across the width ladder. |
| **Probe each diagram's natural width** (a doubling ladder over the canvas) | Deleted. Art width *is* the requirement, so the ladder searched for a number the art already carries — four extra spawns per wide fence to learn what the first render had already printed. |
| **Re-render source boxes at the pane** (designed, withdrawn) | They wrap only because their canvas was narrower than their content. The generous canvas removes the wrap; the extra spawn was a second opinion about a width already chosen. |
| **A canvas of 1024** | Insufficient, measurably: a 100-node chain bails at 1024. The number had to clear the engine's own node cap or it would refuse legal diagrams. |
| **Refuse and state the requirement** (i.e. `2a11837`'s receipt) | A receipt with no art is a *larger* projection loss than a marked fragment. It trades the content for tidiness, and the tidiness was mistaken for honesty. |
| **Add `--width` to `mermaid-to-md` and pass it** | Correct, and a crossing into another silo for no gain: `$COLUMNS` is the engine's documented default. If upstream grows the flag, that is the migration; the receipt does not change. |

## Consequences

**What became easier:**

- **The document has one shape.** Block sequence and art-run lengths are identical
  at 60, 80, 120, 160 and 200 columns; only the cut point moves. A resize no
  longer reflows the page.
- **Content is never withheld.** A diagram the glass cannot hold is shown as much
  of as fits, marked with `…` at the cut and with its requirement on the receipt.
- **One width source, and it is a literal.** `$COLUMNS`, `FZF_PREVIEW_COLUMNS` and
  the terminal size no longer reach layout at all.
- **Fewer moving parts.** `measureDiagramWidth` and its ladder are gone; the
  source-box special case is gone; the `tooWide` entry kind is gone.

**What became harder:**

- **A fragment can be low-information per line.** `d01` needs 241 columns: at 80
  you read one of its three subgraphs across 31 lines. The receipt names 241, so
  the reader knows it is a fragment and what would make it whole — but there is no
  pretending the fragment is the diagram.
- **The cut column is not structure-aware.** `elideToWidth` cuts at a display
  column, so a box edge or an arrow can fall at the cut. The `…` marks it; nothing
  attempts to land the cut on a rank boundary.
- **The `elision-monotone` baseline grew by two entries**, and could not
  legitimately shrink to compensate: a refused fence cut zero lines because it
  emitted none, a shown one cuts every line past the glass (measured, 0 → 14 and
  0 → 13 on the two diagram documents). The gate's own invariant — no document's
  cut count rises at a wider rung — is untouched. The growth is stated in
  `scripts/elision-baseline.json`, because a may-only-shrink baseline that grows
  silently is the drift it exists to catch.
- **A cut diagram renders a vertical `…` edge.** Where a row's content lies wholly
  past the glass, the row shows as padding plus `…`. It is honest — there *is*
  content to the right — and it reads as noise to anyone expecting a picture.

**Constraints this imposes:**

- The canvas must never be derived from the pane, the terminal, `$COLUMNS`, or
  `FZF_PREVIEW_COLUMNS`. A future width bug will arrive looking like a sensible
  optimisation ("give the engine only what it needs").
- A refusal may cite a *canvas*, never a pane. `▸` with a width in it is the
  regression signature.
- Any new preformatted block inherits the rule: elide, never re-flow. The test is
  a question, not a measurement — *does the output contain a line break the source
  did not?*

## Related

- Brief: `BRF-DIAGRAM-WIDTH-HANDOFF` (amended 2026-10-25 — its body is the record of
  the position this supersedes)
- Debrief: `DBF-DIAGRAM-WIDTH-HANDOFF`
- ADR: `ADR-UNIVERSAL-ELISION-050` (the primitive), `ADR-TABLE-EDGE-CUT-055` (the
  same policy for tables, and the source of the sentence *"the same policy a
  diagram line gets"* — true from today, aspirational before it)
- Playbook: `playbooks/mermaid-diagrams-playbook.md` (what to author, and the
  budget rule)
- Dependency: `DEPENDENCIES.md` (the canvas channel, and the `Oversize::Cells` gap)
- Out of scope, and owned: the **height** axis has no policy at all — a legal
  61-node `flowchart TB` is 303 lines of art. That is the same class of defect on
  the other axis, it is not solved here, and it is not a footnote.
