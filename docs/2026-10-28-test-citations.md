# Test — cited paths

**Created:** 2026-10-28
**For:** the `doc-ref` affordance (`ADR-ADDRESS-NOT-COORDINATE-074`), six tests in
`tests/render.test.ts`
**Read it with:** `okuda docs/2026-10-28-test-citations.md` — each block is a claim
about the affordance, and the two that **fail** are marked, because a corpus that
only shows green is a corpus that cannot tell you what broke.

The affordance: a path in prose lifts to the `doc-ref` gold, and its line lifts
with it — one token, so the whole address is a single actable unit. The
coordinate is dereferenced, never rendered: no gutters.

## Prose — the base case

The sweep that added this lives at src/render.ts:983 and paints inside the text handler.

A range states its extent: src/render.ts:1123-1142 is the whole-file fence test.

Put it last, where the eye lands after the title: scripts/contrast.ts.

## The extensions in the list

One per line, so a missing gild is visible at a glance:

- scripts/contrast.ts:34 — the closed list, defined here
- docs/style-guide.md:56 — the affordance register
- mermaid-to-md/src/main.rs:67 — an outside-and-cited path
- scripts/facade-lint.sh:10 — the comment band

`py` is in the list but has no real citation in this repo, so it is exercised in the
test only — the list's membership is the test's business, not this page's.

## The guards — these must stay prose

A version string is not an address: v1.2:3. A port is not an address:
example.com:8080. An extension nobody has cited does not gild: a.json:12 stays
plain until something in the repo cites a JSON line — the list is append-only on
evidence, the `MATH_GLYPHS` rule applied to paths.

## Content paths — the affordance is not prose-only

A list lead: **the paint is at src/render.ts:1355** — bold inside, gold around it.

| surface | citation | note |
|---|---|---|
| a table cell | src/palette.ts:63 | the role's declaration |
| and another | decisions/074-the-address-not-the-coordinate.md | a file, no line |

> A blockquote carries it too: src/ansi.ts:176 is the wrap that hands an
> enclosing style back.

A heading is its own role: the path there takes the heading colour, not the gold —
headings strip inline paint and re-apply their own (src/render.ts:1244).

## Known gap 1 — a codespan does not opt out

`src/render.ts:983` is in backticks, which an author reaches for to *mention* a
path rather than act on it. It still gilds: the paint runs on the text node
before the codespan handler wraps it. So there is currently no way to write a path
without an affordance claiming it is actable — a closed-grammar hole, filed as a task
rather than patched here, because closing it means moving the paint to a pass
that runs after inline spans compose, and that is a decision about wrap order.

## Known gap 2 — a long citation wraps mid-token

Narrow the pane to about 44 columns and this breaks: 2026-10-28-the-ground-you-read-on.md:1123-1142
splits after `1123-`, and a broken address is not an address — the house's own
word for it is *a wrapped path is a false name* (src/render.ts:78). Same defect
class as the one above: the affordance has no protection against the context it
is painted in.

## What a reader should be able to do

Select a citation whole and paste it somewhere that resolves it — a search, an
editor, a host `link` rule. If a citation cannot be selected whole, the affordance
has failed regardless of how it looks, and the two gaps above are exactly that
failure: one paints where it should not, one breaks what it paints.
