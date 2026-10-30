---
type: Doc
date: 2026-10-30
---

# Dogfood — the cited jump

The seven rows below are real arrivals. Type a number in the TUI and the render
starts at the line named beside it; `u` comes back. Nothing here is a fixture: every
address names a file in this repo and a line that is there today, and the page's test
re-reads it and fails when a line moves.

That gate is the point. The brief that specified this verb had six silcrows and one
of them landed on `return { ok: true, out };` — measured 2026-10-30, before its
addresses were corrected. A jump is only worth having if the arrival is checkable,
so this page is the checkable version: real targets, and a test that would rather
break than agree with a stale line.

## The wired rows

| Row | proves | § |
| --- | --- | --- |
| *parseAddress* | one split: path from line | **12** <!-- %%okuda-rhs:12%% src/vectors.ts:138 --> |
| *scrollForLine* | the arrival: file line to row | **13** <!-- %%okuda-rhs:13%% src/tui.ts:634 --> |
| *buildJumpMap* | the dedupe key is the address | **14** <!-- %%okuda-rhs:14%% src/vectors.ts:305 --> |
| *wrapWholeFile* | the frame a line needs | **15** <!-- %%okuda-rhs:15%% src/render.ts:1164 --> |
| *RE_CITED_PATH* | paint and jump read one list | **16** <!-- %%okuda-rhs:16%% src/render.ts:996 --> |
| *a range* | arrives at its opening line | **17** <!-- %%okuda-rhs:17%% src/vectors.ts:138-142 --> |
| *past EOF* | clamps, never blanks | **18** <!-- %%okuda-rhs:18%% src/tui.ts:9999 --> |

Rows one and six are one file: `parseAddress` and its body as a range are two
addresses, so they are two numbers, and both arrive at the same row — *one address,
one silcrow*, and the address is the whole thing.

## How to dogfood it

```
./okuda docs/2026-10-30-dogfood-cited-jump.md --tui
```

Then type a number. The row you land on is the check: `buildJumpMap`'s number should
put the dedupe line at the top of the glass, and if it puts a neighbouring line there
instead, the constant in `scrollForLine` is wrong — and the test says so first.

## The controls — what must not arrive at a line

A document has no line, because prose wraps and a rendered row is the renderer's
invention. `docs/style-guide.md` arrives at the top of the document, and
`docs/style-guide.md:60` — the same destination written with a suffix — arrives in
exactly the same place, with the same silcrow: the line is dropped at discovery, so
the two spellings are one address. The paint still gilds the suffix, which is the one
place on this page where the render promises more than the jump keeps, and it is
deliberate.

`a.rs:1123-1142` is the other control: it gilds, because `rs` is a cited extension,
and it mints nothing, because no such file resolves — the registry gate retracts what
the shape admits. And `path:1123` and `v1.2:3` stay plain prose: a coordinate is not
an address without a file to hold it.

## What this page cannot prove

It cannot prove that a compositor writes addresses — it *is* a compositor writing
addresses, by hand, with a test holding the numbers still. A generated menu gets the
same property by construction (`scripts/jump-demo.ts`), and that is the difference
between a demo and a contract.

## Related

- `ADR-ARRIVAL-AT-LINE-077` — the decision this dogfoodes
- `tests/cited-jump-dogfood.test.ts` — the gate that holds it still
- `BRF-CITED-JUMP` — the brief, whose own addresses are annotated where the code moved
- `docs/2026-10-28-test-citations.md` — the same trick applied to the paint
