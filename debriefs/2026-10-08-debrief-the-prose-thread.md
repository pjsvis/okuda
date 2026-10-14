---
type: Debrief
callsign: DBF-PROSE-THREAD
date: 2026-10-08
briefs: [BRF-DOCUMENT-LIFECYCLE]
---

# Debrief: The prose thread — a meter, a gate, and the exit

**Date:** 2026-10-08
**Status:** Done
**Briefs:** none — this thread began as an observation about a wall of text
**ADRs:** `ADR-DOCUMENT-LIFECYCLE-057` (the policy); `ADR-PROSE-BREAKS-056` (the
law the meter had to obey)

## What happened

It started with one bad preface in one brief. Chasing it produced a measurer, a
gate, a corpus-wide tidy, and the silo's first lifecycle policy. The through-line
is a single rule the evening kept re-deriving: **a signal is only as trustworthy
as its invariance domain** — which is why the date moved into the filename, why
the wall meter measures the render rather than the source, and why the citation
graph, not a judgement, decides what may be deleted.

## The meter

`just prose-check` reports two readings over the scanned corpus (~5 s):

- **Walls** — prose units whose *rendered* height exceeds a dial. The height
  comes from the renderer's own wrapper over the unit's plain text: styling is
  zero-width and soft returns are inert (`ADR-PROSE-BREAKS-056`), so the
  wrapper's answer **is** the render's.
- **Leaks** — markdown emphasis that reached the glass as asterisks.

Three traps the meter found in itself, all fixed in the script's own docstring
because the next author will reach for them: dropping fence lines shifts the
line indices; neutralising code before rendering breaks a table row whose cell
holds a pipe; and a naive fence toggle desynchronises on CommonMark's closing
rule (a closing fence carries no info string), which made an unclosed fence read
its whole tail as prose.

## The numbers

| reading | before | after |
|---|---|---|
| walls ≥ 8 rendered lines (`--width 100`) | 247 | 232 |
| tallest wall | 25 lines | 18 lines |
| leaks | 5 real (10 with false positives) | **0** |

The wall drop is one structural rule: **the header keeps the single-line
identity fields; every narrative field whose value needs more than one line
becomes a `## Section`.** Consecutive field lines render as ONE paragraph, so
the header with a long `TD` or `Lineage` was absorbing everything — four of the
five tallest walls. 74 files converted, values joined (render-identical), the
rule written into the briefs template so it cannot recur.

The leaks were four malformed spans in four documents, and two were the same
inversion: a closing `**` that landed *inside* a code span, so nothing paired.

## The gate

The leak reading gates (`--strict-leaks` in `just check`), the wall reading does
not. A raw `**` reaching the reader is a failure, not a taste; paragraph length
is editorial, and the playbook keeps a hard para-length rule *in reserve*. The
corpus reads zero, so there is no baseline to grandfather — any new leak fails
the build.

## The exit

The thread ended where it began: a document too long to read. That became
`ADR-DOCUMENT-LIFECYCLE-057` — four registers, the earned callsign, the
keep-class, extract-then-delete, and the citation graph as oracle — with the
operational how in `playbooks/registry-playbook.md`. The silo has an exit now.

## What is left

- **232 walls**, all body paragraphs whose seams are editorial (the split
  caveat: the severed argument, the false topic sentence, the staccato chop). A
  sentence splitter would move the number and lie on the page.
- **The lifecycle phases 2–4**: the `docs/` census and reference graph, the two
  gates, the prune.
- **The LaTeX class** — 36 `\text{`, 6 `\longrightarrow`, 5 `\frac` in a dozen
  `docs/` files. The pass refuses half-translation by design, so the remedy is a
  document tidy or a vocabulary decision, not a fix to the renderer.

## Related

- `docs/2026-10-08-time-is-a-claim.md` — the invariance law
- `docs/2026-10-08-the-filename-is-a-record.md` — the register framing
- `ADR-DOCUMENT-LIFECYCLE-057` — the exit
- `BRF-DOCUMENT-LIFECYCLE` — the epic this thread opened
