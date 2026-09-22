---
date: 2026-09-19
kind: design note — a measured defect: the renderer deletes anything that parses as an HTML tag, including from code spans and fences where the text was promised literal
lineage: found while verifying docs/2026-09-19-the-tidy-has-no-criterion.md, whose own `briefs/&lt;name&gt;.md` rendered as `briefs/.md`; src/grammar.ts:33 `RE_INLINE_HTML`; src/render.ts:594 `stripHtml`; briefs/2026-09-14-brief-table-width.md — the same argument about a rendering defect, for a different one
status: open — measured and reproduced, mechanism proven, no fix chosen. Nothing in src/ has changed.
---

# The renderer deletes anything that looks like a tag — and it deletes it from code

> ◆ `briefs/&lt;name&gt;.md` inside a code span renders as `briefs/.md`. **214
> placeholders across 69 files** are deleted for their shape — `docs/help.md`'s
> own usage line, `AGENTS.md`, five playbooks — and **every one of the 69 is a
> literal context** where the text was promised verbatim. There is no authoring
> workaround: the entity form is decoded and then stripped, and the backslash
> escape prints its own backslashes.

**How to read this note.** Every bracket pair below is written `&lt;` and `&gt;`.
This document cannot print the real characters — it would eat them, which is the
defect it is about — so read `&lt;name&gt;` as a bracketed `name`. The one place
the raw characters appear is where their absence is the evidence.

## What we are deciding

Where the fix belongs. Two seams can hold it and they are not equivalent:

- the **parser seam** — stop applying `stripHtml` to text that arrives inside a
  codespan or a fence;
- the **compositor seam** — protect literal spans before the parse and restore
  them after it, the way mermaid fences and vector markers are already handled.

Nothing in `src/` has changed. This note prices the defect; it does not choose.

## The defect in one example

Reproduced, verbatim. The source, its bracket pair written as `&lt;` per the
note above:

```text
inline code: `briefs/&lt;name&gt;.md` here
```

The render — where the source says a bracketed `name`, the glass says nothing:

```text
  inline code: briefs/.md here
```

The word `name` is not dimmed, not elided, not marked — it is gone, and the
result reads as a typo rather than as a loss.

## What the code does

The handler-call trace, from `tmp/codespan-parse-probe.ts`:

```text
text       "briefs/&lt;name&gt;.md"    ← the span reaches text FIRST
codespan   "[[TXT:briefs/&lt;name&gt;.md]]"
```

The `codespan` handler receives the string the `text` handler already returned —
brackets already gone — and wraps it in code colour.

`text()` (`src/render.ts:594`) calls `stripHtml` (`:773`), which applies
`RE_INLINE_HTML` (`src/grammar.ts:33`):

```text
/&lt;!--[\s\S]*?--&gt;|&lt;\/?[A-Za-z][^&lt;&gt;\n]*&gt;/g
```

Bun.markdown runs the `text` handler over a codespan's content and hands the
*result* to the `codespan` handler. So the strip lands one stage **before** the
handler whose whole job is to keep the text literal. `codespan`
(`src/render.ts:665`) is innocent — it returns `styler.codespan(children)`
unmodified, and the same is true of the `code` handler for fences.

**The prose case is shaped differently, and the difference is the fix.** In
prose the parser splits *around* the tag, delivering a node that is exactly a
tag — and that node renders as nothing at all, which is why the middle line of
this trace is empty:

```text
text       "prose: briefs/"
text       ""
text       ".md here"
```

So a rule of *"strip a text node only when the node is wholly a tag"* would
preserve every current prose behaviour and free the code paths. Whether that is
the right rule is the fork below; that it is *available* is the point.

## How far it reaches

Measured by `tmp/angle-bracket-census.py` over every tracked markdown file,
`.archive/` excluded.

| what | count |
|---|---|
| tracked markdown, `.archive/` out | 333 |
| files carrying a placeholder | 70 |
| placeholders, tag-shaped | 221 |
| **deleted by tag shape** | **214** |
| files affected | **69** |

**214 is causal, not a guess.** The naive test — *does the inner word appear in
the render?* — gives false survivals, because `&lt;file&gt;` and the word `file`
are the same string and prose is full of it. So the probe renders each file
twice: variant A as written, variant B with every placeholder rewritten as
`«inner»` — same words, not tag-shaped. A token counted in B and absent from A
was deleted *because it parsed as a tag*, which no elided diagram and no stray
prose occurrence can fake. 214 of 221 fail that test. The seven that pass are
the ones whose inner text never reaches a literal span.

**The affected set is not the deep tiers.** It is the front door and the rules:

- `docs/help.md` — **4** — the usage line itself: `okuda &lt;file.md&gt;` renders
  as `okuda `. The one document a new reader opens first.
- `docs/2026-09-17-ssml-voice-tags.md` — **28** — a document *about* SSML whose
  every tag is a placeholder. Its subject matter is what is missing.
- `AGENTS.md` — **1** — `&lt;name&gt;` in the three-owners rule.
- `docs/ssh-and-gopher.md` — **5** — `&lt;ItemType&gt;`, `&lt;Host&gt;`,
  `&lt;Port&gt;`: a protocol document whose field names vanish.
- five playbooks — `briefs`, `herdr-cast`, `justfile`, `mermaid-diagrams`, `td`
  — the recipes that tell an author how to write a document.
- 42 briefs, debriefs and decisions — the type signatures and shell placeholders
  in the record of how each thing was built.

## The finding

**The document cannot defend itself, so a document pass is not available.** This
is what separates this defect from the table cut. There, the ladder's remedy —
*attack the dominant column* — is a prose edit that works. Here the same line was
written in all four contexts a silo document has, and all four lose it:

| context | written | renders |
|---|---|---|
| prose | `briefs/&lt;name&gt;.md` | `briefs/.md` |
| code span | `briefs/&lt;name&gt;.md` | `briefs/.md` |
| fenced block | `briefs/&lt;name&gt;.md` | `briefs/.md` |
| indented block | `briefs/&lt;name&gt;.md` | `briefs/.md` |

Indenting instead of fencing changes nothing, because the parser hands indented
code to `text` as well — it is not even rendered as code. The two escapes a
markdown author would reach for next both fail for their own reasons:

- **The doubled entity** — writing `&amp;lt;` so the decoder yields a literal
  `&amp;` — survives, because the string it produces is no longer tag-shaped. It
  renders as `&lt;name&gt;`, which is not what the author meant.
- **The backslash escape** — `\&lt;name\&gt;` — is not an escape inside a code
  span at all, so the backslashes print and the brackets are stripped anyway,
  leaving `\.` where the path should be.

In prose the entity is decoded to a bracketed `name` and *then* stripped, which
is why the entity form fails there and only there. **There is no spelling of the
token that reaches the glass.**

So the 214 occurrences are not 214 edits. They are one defect, and until it is
fixed every new document that writes a generic, a shell placeholder, an XML
sample or a type signature joins the set silently.

## The fork

**A — Narrow `stripHtml` to a whole-node match.** `text()` strips a node only
when the node is entirely a tag. Behaviour-preserving for prose (the parser
already isolates tags), and it frees codespans and fences with no new state.
Cost: it does not fix a fence whose *line* is nothing but `&lt;div&gt;` — a code
block containing an HTML sample keeps losing it, because that node is also wholly
a tag. Narrower than it looks.

**B — Protect literal spans in the compositor.** Before the parse, replace `<`
with a sentinel inside every fence and code span; restore it at `finalize`. This
is the seam okuda already owns — mermaid fences, vector markers and RHS wires all
work this way — and it is correct for all 214 cases including the HTML-sample
fence. Cost: a pre-pass that must find literal spans exactly as the parser does,
which is the trap the table instrument already fell into once (an escaped pipe
inside a code span invents a column).

**C — Do nothing and stop writing the token.** Rejected on inspection: 69 files
already carry it, 5 of them playbooks, and the token is how a placeholder is
spelled. A convention that forbids it forbids the syntax.

## What is not in question

- **That this is a rendering defect, not 69 document defects.** Same ruling as
  `briefs/2026-09-14-brief-table-width.md` reached for the cut: the renderer
  owns the glass, and the documents are under a contract the renderer broke.
- **That the loss is silent.** No dimming, no marker, no warning. The reader
  cannot tell a deleted placeholder from a typo.
- **That `--no-color` is not a factor.** The loss is in the parse, upstream of
  the styler.
- **That the fix is not a document pass.** See *The finding*: there is nothing
  to edit.

## Where I would land

**B, and I would take A only as a stopping point.** The compositor already owns
"this span is literal" — it is the layer that knows a mermaid fence is not prose.
Teaching `stripHtml` about parentage means teaching the renderer about the tree
it does not have; the compositor has the text before the tree exists, which is
exactly where a literal span can still be marked.

**What would change my mind:** if Bun.markdown's `text`-before-`codespan` call
order is a bug in Bun rather than a contract, then A is a workaround for a
dependency defect and the honest fix is a pin plus an upstream report. I have not
tested another version, and this note does not claim the order is intentional —
only that it is what happens, on this Bun, today.

## Evidence

- `tmp/angle-bracket-census.py` — the classification and the two-variant causal
  test. Run with `python3`; it shells out to `./okuda` and imports nothing.
- `tmp/codespan-parse-probe.ts` — the handler trace: what Bun.markdown hands
  `text`, `codespan` and `code`, in order. Run with `bun`.
- `./okuda docs/help.md --no-color` — the usage line, missing its argument.
- `src/grammar.ts:33`, `src/render.ts:594`, `:665`, `:773` — the four lines the
  defect lives on.

## Related

- `docs/2026-09-19-the-tidy-has-no-criterion.md` — where this was found; its own
  example rendered wrong
- `briefs/2026-09-14-brief-table-width.md` — the precedent: a rendering defect,
  measured, with the same refusal to fix it in prose
- `briefs/2026-09-16-brief-math-glyphs.md` — assumes *"fences route through
  `code`/`codespan`, never `text` — structurally exempt"*; the trace above shows
  the assumption is wrong, and its `${rowStr}` example is one of the 214
- `docs/tables.md` — the table contract, the neighbouring instrument
- `AGENTS.md` — the three-owners test, which puts this on okuda's side of it
