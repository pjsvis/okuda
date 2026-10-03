---
type: Brief
callsign: BRF-REFERENCES-SECTION
---

# Brief: The References section — the renderer emits its own map

**Date:** 2026-09-13
**Status:** Done — shipped 2026-09-30 on `feat/references-section` (ADR-047;
the URL channel td-9eb7a4 stays open, out of scope by design)
**TD:** td-e45bda
**Lineage:** the References-section design sessions (2026-09-13); the
hand-written convention it retires; BRF-CENSUS-MODE's unanswered cap
question; BRF-STREAM-IDENTITY-HEADER, the precedent for the renderer
emitting content the author did not write.

## Objective

okuda emits a level-2 `## References` section at the end of the rendered
document, listing the main document's jump map: every reference the renderer
found, in reading order, as `§NN` plus the target. The author writes nothing.

## Why — the dogfood that settled it

The hand-written section was polished across three passes and was still
wrong. `scripts/references-demo.ts` generates a fixture carrying nine
references; `tmp/section-diff.ts` diffs the hand-written section against the
map the renderer derived:

```text
the map knows:                     9 references
the hand-written section lists:    6 references

in the map, MISSING from the section:
  §12  ADR-034
  §13  BRF-CENSUS-MODE
  §20  ADV-READER-SIDE-FILTER
```

A third of the document's references were absent — and the two body citations
were missing *precisely because* they were cited in the body. The author
listed what came to mind, not what the document cites. This is the ladder
rule's own test (the manual workaround recurring), with the section itself as
the workaround. A hand-written index omits by omission; generation cannot.

The second half of the diff is empty, and the emptiness is a finding too:
*in the section, not in the map: (none)*. The fzf issue is in the section, but
`scanReferences` has no URL channel, so it is invisible to the map and to the
diff alike. That is the one tier generation loses (see Non-goals).

## The design

**It is rendering, not compositing.** The section's text comes from the
document's own map, so it never touches the byte stream's origin. The
precedent is already on the books: the muted mermaid source echo is "the
renderer's own receipt — what it understood, not what you hoped"
(`playbooks/authoring-playbook.md`). `## References` is the receipt for the
jump map. Three concerns, three owners: the environment composes, the host
windows, the renderer renders — and a receipt for its own derivation is
rendering.

**Order is map order.** Reading order, ascending, `§12` first. The order is
the map's, so it cannot read as ranking; and the ascent is the motor-map
property the silcrow dogfood found. Grouping by entry shape (callsigns first,
paths last) was considered and rejected: a callsign already looks like a
callsign and a path already looks like a path, so the grouping tells the
reader nothing, while scattering the numbers would cost the one property that
makes the list scannable.

**Generate from the map, not from the painted text.** `cli.ts:198` gates
annotation on `process.stdout.isTTY`, so a section built from painted text
would be empty when piped or under `NO_COLOR`. Built from the map it is
identical on every rung: painted silcrows on the glass, plain numbers
elsewhere. On paper the numbers are inert and the paths are the bibliography,
which is why `styler.link` displays its URL (`src/ansi.ts:64`).

**The append point is the output, never the source.** If the section's text
were written back into the source, or ever re-scanned, every callsign it lists
would become an occurrence and the map would feed itself — one new entry per
listed reference, forever. The architecture already does this correctly for
paint: `annotateSource` returns a render-only string that is never persisted.

**Main document only.** The two-render contract holds: a dereferenced document
renders clean, so it gets no section.

The shape:

```text
  ## References

  §12 ADR-034
  §13 BRF-CENSUS-MODE
  ...
  §20 ADV-READER-SIDE-FILTER
```

## Deprecations

What this retires, and what it merely de-fangs:

| What | State | Why |
|---|---|---|
| The hand-written `## Related` / `## References` convention | ✗ retired | the renderer emits it; there is nothing to author |
| `td-19f7b9` — Related sections: cite by callsign, not path | ✗ superseded | a template nudge for a section that is no longer written |
| BRF-CENSUS-MODE's "no authoring-convention pressure" non-goal | ✓ moot | nothing is authored, so nothing is imposed |
| BRF-CENSUS-MODE design question 2 — the cap must fail visibly | ✓ answered | the section is a projection of the map: it lists exactly what is addressable |
| use-vs-mention's minting debate | ✓ moot | the map is listed as it stands; mentions stay mentions |
| The `path/CALLSIGN.md` authoring shape | ⋮ de-fanged | it still splits the badge inline, but References sections no longer need it |
| BRF-INDEX-JUMP's ephemeral index docs | ⋮ boundary noted | the environment composes index docs; the renderer emits its own map — adjacent outputs, different owners |
| `playbooks/authoring-playbook.md:205` "Cap at 88" | ✓ fixed 2026-09-13 | ADR-032's amendment made it 80 addresses (12–98 minus the doubled-pair class); the playbook now says so and names the derivation |

Key: ☐ open · ✓ decided · ✗ superseded · ⋮ parked.

The 26 existing hand-written sections (23 `## Related`, 3 `## References`)
stay as written. Retiring a convention is not a bulk edit: the corpus keeps
its history, and new documents simply stop carrying the section.

## Non-goals

- **No URL channel.** External links are in no map — `RE_MD_LINK` matches
  `.md` only — so the generated section cannot list them, and the named tier
  ("beyond the silo's reach") is lost from the section. Either it stays
  hand-written, or the grammar gains a channel: an ADR, tracked separately
  (td-9eb7a4). Not this brief.
- **No inline census.** This lists the map at the foot; it does not paint every
  mention in the body. BRF-CENSUS-MODE's opt-in remains its own question.
- **No source mutation, ever.** No marker, no token, no authoring form. A
  hand-written `%okuda-vector:12%` renders as `§12` and *collides* with the
  derived map — two silcrow 12s in one document, measured 2026-09-13. The
  paint is the renderer's.
- **No section on a dereferenced render.**
- **No change to the numbering contract.** `MAX_REFS` stays 80; `§12` is still
  first.

## Scope

**In:**

- `referencesSection(map)` — a pure function in `src/vectors.ts`, map to
  section lines. No fs, no rendering.
- The append in the streaming path (`src/cli.ts`, `draw()`), with the map
  built unconditionally and annotation left TTY-gated.
- The append in the TUI's main render (`src/tui.ts`).
- The playbook rule, the use-vs-mention note, the cap-arithmetic fix.
- The fixture and its assertion.

**Out:**

- The URL channel (td-9eb7a4).
- Any change to the two-render contract, or to the discovery contract beyond
  the projection itself.
- Editing the 26 existing hand-written sections.

## Work Plan

1. [ ] **Generator** (td-45f5d1) — `referencesSection(map)` in `src/vectors.ts`
      plus unit tests: order, one line per destination, an empty map yields no
      section, the header is exactly `## References`.
2. [ ] **Stream path** (td-5e51ec) — build the map always, annotate on TTY
      only, append the section always. Update `tests/render.test.ts` line
      indices.
3. [ ] **TUI** (td-e473c2) — append to the main render only.
4. [ ] **Deprecations** (td-eab6c6) — playbook, use-vs-mention note, cap fix.
5. [ ] **Dogfood** (td-3562fe) — the fixture asserts nine; `--map` stays the
      inspector.

## Acceptance Criteria

* A document with references renders a `## References` section at its foot.
* The section lists every map destination, in map order, `§12` first.
* A document with no references renders no section — no empty header.
* The section appears in a piped render and under `NO_COLOR`, with plain
  numbers.
* A dereferenced render carries no section.
* `tmp/okuda-references-demo.md` lists all nine; the hand-written section
  listed six.
* The section's own text never enters the map: a document with a section
  derives the same map as the same document without one.
* `just check` passes and `bun test` is green.

## Risks

- **Line indices shift.** Appending to `renderDocument`'s output moves every
  index after the body — the same risk BRF-STREAM-IDENTITY-HEADER flagged for
  its header. Budget for `tests/render.test.ts` churn.
- **The loop.** Any implementation that re-scans its own output, or writes the
  section into the source, grows the map without bound. The acceptance
  criterion above is the guard.
- **The author loses the ending.** The document's last word is no longer the
  author's. Accepted: it is a receipt, and receipts are not authored.

## Sequencing

Brief (this document) → an ADR amending ADR-031's discovery contract with the
projection → the generator, then the two render paths, then the deprecations.
The brief is the decision instrument; the ADR is the grammar record.

## Related

- ADR-031 — the main document, and the map this projects
- ADR-032 — numbers are dynamic, never authored; why `%35` cannot be an
  authoring form
- BRF-STREAM-IDENTITY-HEADER — the precedent: the renderer emits content the
  author did not write, and the test-shift risk it named
- BRF-WORKING-COPY — the vector render mode this extends
- BRF-INDEX-JUMP — the environment-composed index; the adjacent output with a
  different owner
- BRF-CENSUS-MODE — the census: its cap question answered here, its non-goal
  mooted
- `docs/2026-09-04-the-silcrow.md` — the notation and the two-render contract
- `docs/2026-09-10-use-vs-mention.md` — the adjudication this leaves untouched
- `playbooks/authoring-playbook.md` — "References are text"; gains the
  generated section, loses the stale cap arithmetic
- `scripts/references-demo.ts`, `tmp/section-diff.ts` — the fixture and the
  diff instrument

*(This list is the last generation of the pattern it retires: once the renderer
emits its own map, a hand-written account of what this document referenced is
redundant by construction.)*
