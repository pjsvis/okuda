# The mangle demo — how to abuse okuda and watch it hold

> Logged 2026-08-31. Status: **aligned** — each reproducible trick was
> executed before this document landed; results below are marked
> `verified` (run this session) or `operator-verify` (needs a live TTY;
> run them yourself, the instructions are the test). This document is
> simultaneously the QA harness and the marketing demo — the mangle and
> the jaws are the same activity with two audiences. Sculpting notes at
> the end.

## The claim

A common-or-garden markdown renderer shows you your document when
conditions are polite. okuda holds under abuse: narrow the glass, feed
it foreign drafts, strip the TTY, grep its wires — the composition
survives. Every trick below is a command; run them and watch.

## Part 1 — The mangle (reproducible, verified)

### Trick 1 — The invisible wire

The navigation machinery is in the source and absent from the render.
Same file, two audiences:

```bash
rg -c "okuda-rhs" "&next.md"        # 12 wires in the source
./okuda "&next.md" | grep -c "okuda-rhs"   # 0 in the render
```

`verified`: 12 vs 0. On GitHub, in Zed, in `cat` — the document is
ordinary markdown. The jump table exists only where it is rendered.

### Trick 2 — Mermaid becomes ASCII, in the terminal

No browser, no JS, no image. A mermaid fence becomes a character-matrix
state diagram:

```bash
./okuda docs/2026-08-31-actuator-inputs.md | grep "IDLE"
```

`verified`: the state machine renders as box art (`╭──╮ │ IDLE │ ╰──╯`),
complete with a transition loop drawn in the margin — and note the
diagram's own edge labels **elide inside the art** when they overflow
(`"cancels the buff…"`): the width primitive applies at both layers.

### Trick 3 — Boxes survive the narrow glass

An ASCII diagram wider than the viewport does not wrap into salad; it
elides. Left edge intact, right side ends where the glass ends:

```bash
./okuda docs/2026-08-31-vector-resource-locators.md | sed -n '/RESOLVES TO/,+1p'
```

`verified` at 80 columns in pipe mode: the pipeline box truncates
cleanly mid-keystroke-arrow, shape held. This is `elideToWidth` — the
code-fence soft-wrap lie, closed (ADR-004 amendment, td-b81597).

### Trick 4 — The registers are a query API

No integration needed to find a document's owner; the field is
frontmatter-lifted and greppable:

```bash
rg '"callsign":"BRF-DOCUMENT-LINKS"' */INDEX.jsonl
```

`verified`: exactly the owner, one hit — the header-only rule
(ADR-025) making search structural.

### Trick 5 — Headless composition

The renderer is a filter. Any client — agent, script, ssh pipe — feeds
markdown in, gets composed bytes out:

```bash
cat "&next.md" | ./okuda
```

`verified`: full composition from stdin, no TTY required — the
"we don't care where the text comes from" contract, demonstrated at
the command line.

## Part 2 — The jaws (operator-verify: needs a live TTY)

Run `just dev` or the binary directly; these tricks are interactive by
nature. The instructions *are* the test.

### Trick 6 — Role-fit under resize

Open `docs/tables-monster.md` (the deliberate word-salad torture
corpus). Drag the terminal from 200 columns to 60, slowly. Watch the
tables re-anchor: right-anchored role layout (ADR-022) fits slugs to
real space instead of starving columns proportionally. Nothing wraps
mid-token; nothing starves.

### Trick 7 — The two-digit grammar

Open `&next.md`. Type `13`. You are inside the content-shortlist brief.
Type `u`. You are back, scroll intact. No mouse, no menu, no link to
aim at — the address *was* the interface.

### Trick 8 — The bridge

From a document: `Esc`, `Esc` — out of the reader, into an empty
`gloam ❯ ` prompt. Type a word, `Enter`, reading again. Flow between
documents without a single glance at chrome. (Flagged in the
conventions page: the bridge is operator-observed and awaits
codification by the keymap owner — if it breaks during a demo, that's
the bug-hunt finding, not the demo failing.)

### Trick 8½ — Clear the desk (two panes, two levels)

The reset state is free: an *empty query* already renders the `&`-family
at the top of the picker — byte order puts `&` (0x26) before everything,
so the desk you want is what the picker shows when you've forgiven it.
The full two-pane flow, all shipped: tmux split, two gloams, one silo —
read a string on the anchor pane (tied-to-the-mast), type it into the
probe pane (slippy), pick from the suspects, `u` back, `Esc-Esc` to
clear the desk. Recursion in cycles, never in depth: two levels, reset
any time. The only unbuilt part is a `Ctrl-L` bind to make the reset a
gesture instead of a composition — one line in `FZF_BINDS`, a decision
for the keymap owner under the stillness ledger.

### Trick 9 — The two link species

From a rendered document in the TTY, follow a web link (OSC 8 hands it
to the browser) and a local path (okuda opens it) — same visual
register, two transports, the host doing the web work and okuda doing
the silo work.

### Trick 10 — One binary

```bash
ls -lh okuda   # one file, no runtime, no node_modules, no daemon
```

`verified`: the whole renderer is a single self-contained binary. Copy
it to any Mac, run it against any folder of markdown, and the tricks
above work — including over SSH (`ssh host okuda docs/x.md`), which is
the same demo with the glass in another city.

## The jaws (sculpting notes)

The marketing extraction, when it happens, leads with the wire trick —
*the navigation system is invisible in the source* — because it is the
one nobody believes until the grep comes back `0`. Then the resize
walk, then the binary. Keep the statuses: the demo's credibility is
that every `verified` above was executed the day this was written, and
the `operator-verify` items are instructions, not claims. If a trick
breaks during a mangle, the finding lands in td as a bug — the demo
doubles as the harness, and a broken trick is the harness working.

## Related

- `docs/2026-08-30-search-conventions.md` — the two-keymap rules and the
  ladder (Tricks 7–8 execute it); the two-pane cross-reference is its
  multi-client case
- `docs/2026-08-30-gloam-seams.md` — the seams and the moat (Trick 5 is
  Option A; Trick 10 is the deployment story)
- `docs/2026-08-31-okuda-precedents.md` — where the bracket cadence and
  the VRL lineage come from
- `docs/tables-monster.md` — the torture corpus for Trick 6
