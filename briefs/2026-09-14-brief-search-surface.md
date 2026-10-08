---
type: Brief
callsign: BRF-SEARCH-SURFACE
---

# Brief: The search surface — the state machine, the array, and the invariant audit

**Created:** 2026-09-14
**Status:** Parked — code landed on `feat/search-surface` (cc3c0f9) 2026-09-15 and was never merged; the branch is three weeks behind main and a naive merge would revert newer work. Gate: rebase-and-merge while the rebase is cheaper than the rewrite — unpark is an operator call, and every day parked raises the cost. The TD set below closed as parked 2026-10-03; refile from this brief on unpark.

## TD

td-a7e532 (epic) — td-9e8ac8 the array, td-92b11c the register reader, td-22dfef the row seam, td-e3fbbf the state machine, td-a5a89a the golden, td-c23b66 the dogfood

## Lineage

the reader's two sessions of 2026-09-14 — *"how are we going to provision listeners with audio descriptions of the search screen in GLoam"* and *"lets take a step back and think of the broad accessibility pattern… the search screen is the most complex interaction… we have found that we were a bit quick to throw away information in building the search screen."*

## Extends

BRF-AUDIO-DISCOVERY. That brief owns the cue **seam** — the classes, the patience, the abandonment handle, the cast. This brief owns the **surface** and does not fork the seam.

## Objective

Make the search screen describable and addressable: name its states, keep the
information the ranked merge already computes, and state the accessibility
pattern it belongs to — so that *"find the documents as per query X, list the
results, and cast vector 15 to the projection screen"* becomes an act of
composition rather than a feature to build.

## The pattern this brief sits inside

Five statements, each already true somewhere in the corpus. The brief collects
them because the search screen is where all five meet.

1. **Text is the only wire.** Ingress and egress are strings. No protocol, no
   daemon, no structured API (`docs/2026-08-30-gloam-seams.md`; ADR-036).
2. **One ingress rule.** Any input translated to keystrokes is integrated —
   keyboard, voice, switch, Morse, a remote dunt (`explainers/accessibility.md`).
3. **The device is not ours.** okuda emits text; the far end owns the voice, the
   braille display, the embosser, the pane, the printer (ADR-033).
4. **Silence is the default.** Every optional channel is unset-able, and with it
   unset okuda's output is byte-identical to today — the `OKUDA_CLONE_CMD`
   pattern (ADR-036).
5. **Addressable text.** A rendered thing carries an address, and the address is
   actuated by whoever owns the target. The silcrow is the in-document instance;
   the result row is the in-corpus instance.

**Connectivity is a non-question.** SSH is already the channel (ADR-013,
ForceCommand; nothing listens). A cue binding is a *command*, and a command can
be `ssh host say`. So one seam serves three distances — a local process, a
remote process, a remote device — and okuda never learns which one it is.
**No work lands for SSH.** This paragraph exists so the question stops being
asked.

## Components

| Component | What it is | Owner |
|---|---|---|
| **The entry array** | `rankedShortlistEntries` — the ranked rows, with the channel restored | okuda |
| **The register reader** | tier, callsign and date per path, loaded once and shared | okuda |
| **The row seam** | pure: (row, index, count, register) → a cue class and its text | okuda |
| **The state machine** | the search screen's states, events, and the cue each transition emits | okuda |
| **The binding** | one environment variable holding a command; silent when unset | the environment |
| **The device** | voice, braille display, embosser, pane, printer | the environment |

## Boundary conditions

What crosses the seam, and what an absence means:

| Crossing | Direction | Absent means |
|---|---|---|
| cols × rows | in | — (the named invariant) |
| the voice width | in | the glass's cols — *measured, not chosen* |
| `NO_COLOR` | in | colour on, bold on |
| `argv[0]` basename | in | the reader, not the launcher |
| `stdin.isTTY` | in | pipe mode |
| the query | in | the shelf |
| the corpus | in | no results |
| the registers | in | no callsign, no date — the stem remains |
| the cue binding | in | silence; byte-identical output |
| the row cue text | out | — |
| the entry stream | out | — |
| the rendered bytes | out | — |
| the selected path | out | — |

**The degradation ladder is the invariant: the row is describable at every level
of absence.** Register present → date and callsign. Register absent but the date
is in the name → date and slug. Neither → the slug alone.

## Variables — the audit

Every environment reading that crosses into a pure function. The thesis
(`docs/2026-09-03-the-variable-is-the-invariant.md`) holds that the variable is
an *input*, not a state: *"try to hold it steady and you've built a state machine
for a thing you could have just read off the glass."* This is the standing list.

| Read | Where | Discipline | Verdict |
|---|---|---|---|
| cols, rows | `src/width.ts` | re-derived per render | input |
| `NO_COLOR` | `src/launcher.ts`, `src/render.ts` | per call | input |
| `argv[0]` | `src/cli.ts` | once, at dispatch | input |
| `stdin.isTTY` | `src/cli.ts` | once, at dispatch | input |
| cwd | everywhere | process-level | input |
| `EDITOR`, `OKUDA_EDITOR`, `OKUDA_CLONE*` | `src/clone.ts`, `src/tui.ts` | per call | input |
| **today's date** | `speak-md` rule 6 | per call | input — and it makes the flattening time-dependent *by design* |
| **collation** | `listMarkdownFiles` | fixed to codepoint order | input — declared, never read |
| **the locale** | nowhere | not read | input — width is grapheme-correct, ordering is C |
| **the silo root** | `src/launcher.ts` | **read once per session** | **held** |
| **the registry contents** | `makeCallsignResolver` | **read once per session** | **held** |
| the pending digit | `src/tui.ts` | held, deliberately | state |
| the backstack | `src/tui.ts` | held, dies with the process | state |
| the reseeded query | `src/launcher.ts` | held one round | state |

**Two rows are held where the thesis says input, and they are the same reading:
the corpus.** `makeCallsignResolver` loads the registers once, on the stated
grounds that *"the root does not move while gloam is running"* — true of the
root, false of the registers. A document registered mid-session is invisible to
the footer's identity run until gloam restarts. The reader already answers this
shape with `r` (reload off disk); the launcher's registers follow the same shape
— re-derived on demand, with the cost named.

**And the reader's question opens a third reading.** The *selection* and the
*count* are inputs too: the cursor is fzf's, the count is fzf's, and both are
read at the moment the cue is composed and never held. That is the discipline the
row seam inherits — a pure function of (row, index, count), testable with no
terminal, no fzf and no audio device.

## The glass as a control surface — measured 2026-09-14

The reminder: terminal size is *projected* as a control surface for the voice —
wider to slow it down, taller to do something else. Measured, the projection is
wrong in an interesting way, and the coupling that does exist is one nobody chose.

`docs/2026-09-03-the-variable-is-the-invariant.md` at five widths, rendered and
flattened through `speak-md --dry`:

| cols | lines | words | breaths | esc | table |
|---|---|---|---|---|---|
| 40 | 385 | 1824 | 346 | 86 | shattered |
| 80 | 211 | 1791 | 345 | 65 | spills |
| 82 | 204 | 1787 | 345 | 54 | intact |
| 120 | 156 | 1787 | 345 | 55 | intact |
| 200 | 125 | 1787 | 345 | 56 | intact |

**Pace is not coupled to the glass.** Breaths are constant (346/345/345/345) and
total added silence is constant (107,100 ms against 106,700 ms). The projected
*"wider = slower"* axis does not exist, so there is nothing to remove — a good
result, and the reason the projection is worth recording rather than fixing.

**Fidelity is coupled, and that is the leak.** A table is *layout*: okuda computes
it for the glass. Below the table's natural width the cells wrap **mid-word**, and
`say` treats a line break as a word boundary. Measured: `vector` 0.545 s against
`vec\ntor` 0.755 s — identical to `vec tor`. The fragments are separate speech
events. That document's payload table needs **82 columns**; at okuda's own
80-column fallback the reader hears the header as *"Motio … n"* with three other
column names interposed, and the row label as *"vecto … r"*. No elision notice and
no marker — plausible-looking English that is quietly wrong. The word count is not
a fidelity metric: fragmentation *inflates* it (1824 at 40 columns against 1787 at
82), so the ear is losing content while the count goes up.

**Pre-baked art is not coupled.** The same document's mermaid fences are
byte-identical at 40 and 200 columns: the diagram overflows the glass and is never
re-wrapped. So the glass is a control surface *only where okuda computes layout
from width* — prose wrapping and tables. Diagrams are safe; tables are not.

**And the escape residue is audible.** `roleBold` keeps `ESC[1m` in `none` mode
deliberately (`src/ansi.ts:100-104`: *"NO_COLOR strips colour, not attributes"*),
and `speak-md` passes it through unstripped. Measured across the whole document:
65 sequences cost **34.5 s of dead air** in a 13-minute read (822.3 s with the
residue, 787.8 s without) — the voice speaks it. The count *rises as the glass
narrows* (86/65/54/55/56), because a wrapped continuation row re-applies bold; a
shattered table costs eleven extra sequences on its own. That is a width-dependent
pace control nobody designed, running the wrong way and made of noise.

**Height is not in the byte stream at all.** `rows` reaches only `contentHeight` →
`viewport` (`src/tui.ts:593–600`). It changes what is on the glass, never what the
bytes say — so it is a *windowing* variable, and windowing belongs to the host.
**Width is a rendering variable and is ours; height is a windowing variable and is
not.** Only one of the two projected axes is even okuda's to have.

**Today the voice cannot see the glass — and the width it is pinned to is wrong.**
`terminalSize()` returns `null` for a non-TTY (`src/width.ts:286`), so in the piped
voice path (`okuda file | say`) `terminalCols(80)` returns the fallback. Verified:
the piped render is byte-identical to the 80-column render. So resize cannot reach
the voice at all — but the width it *is* pinned to is 80, which is below the 82 the
contract table needs. The voice is rendered at a width nobody chose, and it is one
that shatters the payload.

**The opportunity, recorded and not built.** The voice path takes a **voice width**
of its own — declared, not read off the glass — because the glass is the reader's
and the voice is not the glass. Same shape as the cue binding: one input, absent
means the current behaviour. `docs/2026-09-03-the-variable-is-the-invariant.md` is
right that width is an input to the pure render function; the correction is
*whose* width, and that is a question the pure function cannot ask.

## The search screen as a state machine

The search screen gets a state machine **because it has states**, not because it
has variables. Every variable above stays an input.

**States** — `SHELF` (empty query; the root files; a closed set, 9 today);
`DIVE` (non-empty query; the corpus, 264 rows of which the evidence prefix
answers); `READING` (the reader; the picker suspended).

**Events** — `open`, `keystroke`, `clear`, `select`, `unwind`, `exit`.

| From | Event | To | Cue | Class | Patience |
|---|---|---|---|---|---|
| — | `open` | SHELF | `launcher` | mode | immediate |
| SHELF | `keystroke` | DIVE | `the dive` | mode | immediate |
| DIVE | `keystroke` | DIVE | `<n> answer · <m> rows` | count | patient |
| DIVE | `clear` | SHELF | `the shelf` | mode | immediate |
| DIVE | `select` | READING | `reader` | mode | immediate |
| READING | `unwind` | DIVE | `launcher` | mode | immediate |
| any | `exit` | — | nothing | — | — |

**Invariants of the machine**

1. **The query never expires.** No timeout lives in the machine; the count cue
   waits, and the query waits longer.
2. **The entry stream is never held.** Re-derived per keystroke. The array is a
   value, not a cache.
3. **A cue is spoken only if its state still holds.** A superseded count is
   dropped, not queued.
4. **A position is valid only within one render.** A row address evaporates with
   the glass, exactly as a silcrow does.
5. **The count is two numbers, not one** — rows (what is on screen) and evidence
   (what answers). Neither substitutes for the other.
6. **No cue carries a document's text.** The snippet is content; the channel
   class is state. This is ADR-036's boundary test (*whose text is it?*) applied
   to the row.

**Transitions the machine does not have**, named so scope creep has nowhere to
hide: no depth (picker → reader → picker, two levels, never a stack of
searches); no history; no saved queries; no search-in-search.

## The array — what the merge throws away

`rankedShortlistEntries(query)` builds three channels and then flattens them:
`dedupeEntries([registryRest, bodyRest, remainder])` returns `string[]` of
`path⇥snippet`. **The channel is computed and discarded**, and with it the only
reason a row is in the list. Measured on `silcrow`: **264 rows, 37
evidence-bearing, 227 name-only filler.**

The array becomes:

```ts
type Row = {
  path: string;
  snippet: string;
  channel: "orientation" | "registry" | "body" | "remainder";
};
```

The change is additive. `--entries` prints the same lines and the picker is
untouched; what changes is that the caller can ask the question the merge already
answered.

**The second loss is the count.** Our entry count is a constant 264 for any
non-empty query, because the reload hands fzf the whole corpus and `--exact` does
the filtering. So the denominator is fzf's match count, obtained via `{*f}` (all
matched items as a temp file — present in fzf 0.73.1). `1 of 264` is a lie;
`1 of 37` is not.

## The declarative target

The sentence to grow into: *find the documents as per query X, list the results,
and cast vector 15 to the projection screen.* Read against the pattern, it
decomposes with no new mechanism:

- **find the documents as per query X** — the ranked merge, headless
  (`--entries`, exists today)
- **list the results** — the addressable array, one stable address per row
- **cast vector 15 to the projection screen** — one address, one actuation,
  against a target okuda does not own

The last clause belongs to the compositor, and the compositor is the environment:
a binding, a command, `ssh`. **okuda emits the address and the text; the target is
chosen elsewhere.** This is the silcrow's own sentence generalised — *the silcrow
marks the reference; the number is the address; the terminal is the document*
becomes *the row marks the result; the number is the address; the device is the
environment's.*

**No work lands on this clause in this brief.** It is stated so the two clauses
before it are designed with the right shape.

## Scope

**In:**

- The `Row` array, with the channel restored.
- The row seam: a pure function from (row, index, count, register) to a cue class
  and its text.
- The search screen state machine, written down and expressed as a cue table.
- The invariant audit table, and the two held readings named.
- The row's spoken form, comma-separated, asserted through the flattener.

**Out:**

- The cue seam's mechanism — patience, abandonment, the binding, the cast.
  BRF-AUDIO-DISCOVERY owns it.
- The vector **actuators**, deferred by the reader. When they land they will not
  be the digit space, because fzf's query box owns the digits.
- `speak-md`'s rewrite rules. The BRF-only expansion gap and the date/hyphen glue
  are the silo's; this brief reports them and stops.
- SSH. Nothing lands. A binding is a command, and a command can be `ssh`.
- The **voice width** — a declared width for the voice path, independent of the
  glass. Measured and named in *The glass as a control surface*; nothing lands
  here, because the reader asked not to worry about how it works until it needs
  to work.
- The pending digit's visual indicator (td-51d5f4).
- Reading any document's text aloud.

## Preconditions

- [x] `fzf --version` reports 0.73.1 or later — `{*f}` is the count's only
      source. **Verified 2026-09-14: 0.73.1 (Homebrew).**
- [x] `speak-md` is on PATH and `speak-md --dry` runs. **Verified 2026-09-14.**
- [x] `just check` passes and `bun test` is green. **Verified 2026-09-14.**
- [x] Every registered row carries a `date` and a `callsign`. **Verified
      2026-09-14: briefs 59/59, debriefs 19/19, decisions 36/36, playbooks 14/14,
      advisories 5/5 — 0 undated.**

## Work Plan

1. [ ] Branch `feat/search-surface`.
2. [ ] Return `Row[]` from the ranked merge; keep `--entries` printing
       `path⇥snippet` byte-identically.
3. [ ] Extract the register reader to one load, shared by the launcher and the
       row seam.
4. [ ] Write the row seam as a pure function with a table test — no terminal, no
       fzf, no audio device.
5. [ ] Compose the row text comma-separated, and assert it through
       `speak-md --dry` as a golden.
6. [ ] Express the state machine as the cue table in the source, not as stored
       state.
7. [ ] Dogfood: one query, one report key, by ear.
8. [ ] Report the `speak-md` gaps upstream. Land nothing there.

## Acceptance Criteria

* `rankedShortlistEntries` returns rows carrying their channel, and each of the
  three dive channels is asserted on a fixture query.
* `okuda gloam --entries <q>` output is byte-identical to today.
* The row seam is pure and table-tested: a list of (row, index, count) →
  (class, text), with no terminal, no fzf and no audio device in the test.
* The row for `briefs/2026-09-13-brief-audio-discovery.md` flattens to
  `the thirteenth of September, brief audio discovery, <position>` — asserted as
  a golden against `speak-md --dry`.
* With the cue binding unset, okuda's output is byte-identical to today — no new
  writes, no process spawns.
* Every transition in the state machine's table is walked by a test that asserts
  the cue class it emits.
* The count cue carries both numbers: rows and evidence.
* A superseded count cue is dropped, not queued.
* `just check` passes and `bun test` is green.

## Notes

- **The thesis is in tension with this brief, and the tension is the point.**
  *"Try to hold it steady and you've built a state machine for a thing you could
  have just read off the glass."* The search screen gets a machine because it has
  states — the shelf, the dive, the reader — not because it has variables. Every
  variable stays an input; the machine holds nothing but the query, and the query
  is a breadcrumb with a declared lifetime
  (`docs/2026-08-30-search-conventions.md`).
- **The two held readings are the only violations the audit found**, and both are
  the corpus. Re-derive them, or declare the freeze and its reason in the source
  comment.
- **The evidence class has three values and one is unreachable in practice.** The
  registry channel matches the *callsign* only, so a topic-word query never hits
  channel 1. Until that is addressed the class is two-valued — body against
  filler.
- **Registry gaps found while measuring, both separate work:** `advisories` is
  absent from `TIER_REGISTRIES` (`src/root.ts:24`), so advisory callsigns never
  reach the launcher's registry channel; and `advisories/AI-HR-MANUAL.md` is
  unregistered.
- **A repeated date is the ear's zero-information token.** Observed runs in the
  ranked order: 13, 13, 13, 13, 14, 5, 5, 5. The silcrow's landed lesson is the
  same shape — *the eye learns to skip the leading numeral*. Suppressing a
  repeated date is the cheap fix; reordering the fields is the expensive one.
  Decide it by ear, not by argument.
- **This brief is read by ear, so its own tables are under the rule it records.**
  The voice renders at 80 columns, and a table that needs more than 80 shatters
  silently. Any table added here — including the measurement table above — is a
  contract with the ear and is verified by rendering at 80, not by reading source.
- **The rule found its first offender in this file.** The boundary-conditions table
  had a natural width of **88**: at 80 the header shattered (`Directio`/`n`) and the
  `the registers` row wrapped. Relabelling the header did **not** help — `Direction`
  shortened to `Flow` still broke, because the allocation is dominated by the
  longest cell in the table, not by the header. Shortening that one cell
  (*"the row degrades to the stem"* → *"the stem remains"*) brought the whole table
  to **76**. The remedy that works is to shrink the longest cell; the remedy that
  reads like it should work is to rename the column.

## Related

- `briefs/2026-09-13-brief-audio-discovery.md` — the cue seam this brief extends
  and does not fork; the mode cue it already names as its reason to exist
- `docs/2026-09-03-the-variable-is-the-invariant.md` — the thesis the audit
  applies; `okudagram = f(source, width, palette)`; and the document measured in
  *The glass as a control surface*
- `src/ansi.ts:96-124` — the `none`-mode styler; `roleBold` is the escape residue
  the voice speaks
- `docs/2026-08-30-search-conventions.md` — the three breadcrumbs, the two
  keymaps, and the dual-duty digit rule the picker inherits
- `docs/2026-09-04-the-silcrow.md` — *the silcrow marks the reference; the number
  is the address* — the in-document instance of addressable text
- `decisions/030-live-search-picker.md` — the one-mode decision; the mode-boundary
  failures the state machine must not reintroduce
- `decisions/036-no-speech-code.md` — the boundary test (*whose text is it?*) that
  forbids speaking the snippet
- `decisions/032-repeated-digit-actuators.md` — *doubled = the system talks*; and
  why the vector actuators cannot land in the digit space here
- `explainers/accessibility.md` — the ladder and the first law of time
- `docs/2026-08-30-gloam-seams.md` — the seams and the anti-goals (no daemons, no
  JSON surface, no native integrations)
- `decisions/013-ssh-serving-forcecommand.md` — the connectivity this brief
  declines to build
- `src/launcher.ts` — `rankedShortlistEntries`, `dedupeEntries`, the loop;
  `src/root.ts` — `TIER_REGISTRIES`, `makeCallsignResolver`
