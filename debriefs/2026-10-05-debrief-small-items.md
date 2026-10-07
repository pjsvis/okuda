---
type: Debrief
callsign: DBF-SMALL-ITEMS
date: 2026-10-05
---

# Debrief: The batch of small items — one shelved, two landed, one found

**Date:** 2026-10-05
**Status:** Done
**Briefs:** BRF-MATH-GLYPHS (`briefs/2026-09-16-brief-math-glyphs.md`, now Done);
`docs/2026-10-05-the-single-binary-is-a-provisioning-question.md` (a response, not a brief)
**TD:** two tasks filed and closed 2026-10-05 (the edit verb, the math
  pass), one opened (the reg-sync status finding), and the dogfood task
  closed — IDs live in the ephemeral ledger, per the td playbook

## What happened

Four items, one sitting: a vendor architecture proposal to answer, the
edit verb to renumber, a small well-specified glyph pass to ship, and a
dogfood ritual to close. Three of the four were bookkeeping — but the
sitting produced two measurements that were not on the list.

## The shelved idea — and the measurement that shelved it

The proposal (`docs/2026-10-05-discussion-rust-and-bun-exe.md`, a Gemini
transcript) argued for compiling the helpers to WebAssembly and shipping
one artifact. The answer is
`docs/2026-10-05-the-single-binary-is-a-provisioning-question.md`:
shelved, with three named revival triggers.

It died on a probe the proposal never took. A four-node diagram on
stdin, 50 iterations per row, three repeats:

| Path | ms/fence |
|---|---|
| `/usr/bin/true` (the fork floor) | 1.5 |
| the Rust engine | 2.0 |
| a bash script that only `exec cat`s | 6.2 |
| the real chain (`mermaid-to-md`) | **15.0** |

The renderer is 3% of the path; the 234-line bash wrapper is 87%, forking
two or three times per fence to emit a sentinel, a ` ```text ` fence and a
duplicate of the mermaid source — of which okuda keeps the fence contents
and discards the rest.

Scale it: the corpus carries **59 mermaid fences across 427 documents**,
and the heaviest document carries **four**. The maximum available win
from moving the engine in-process is 60 ms on one document, zero on the
other 423.

## The two that landed

**The edit verb is 88.** It was `09` (a blank note) with a bound-but-dead
`10` beside it. Now `88` edits the *current* document — the doubled pair
beside `99` clone, which is what "consistent with 99" actually means,
since clone acts on the current document too. ADR-032 amended (88 leaves
the pocket; the class keeps its shape rule), ADR-031's numbering contract
widened to 00–10, and `docs/keymap.md` moved with the table — the
`keymap-doc` test referees the page against the territory, so it would
have failed had the page not moved.

The editor is a declaration, not a discovery: `OKUDA_EDITOR`, then
`EDITOR`, then the first of `zed`, `code`, `cursor`, `subl` on PATH, then
`vi`. A GUI editor is spawned **directly** — `zed <file>` hands the file
to a running app and returns, so spinning up a terminal to host it is
pure overhead — while a terminal editor rides `ghostty-edit`, where a
login shell can find it. The cue seam speaks "edit" for 88 without being
told: it derives the word from the bindings, so the pocket's own rule
("it speaks as it binds") did the wiring.

`09`'s blank-note behaviour retired rather than moving house. The
recommendation it was attached to ("copy the document content into the
new note") existed because `09` opened an empty file; `88` edits the
document you are looking at, which is the same intent with no copy, no
generated filename, and no `Bun.write`.

**BRF-MATH-GLYPHS.** `$\Delta t$` now renders as `Δt`. A closed
vocabulary of 17 entries, an all-or-nothing gate, a currency guard, and
14 tests. Two deviations from the brief, both recorded in its landing
record:

1. **The pass runs on the source, not in the `text` handler.** The brief
   asserted that "code fences and code spans route through their own
   handlers and never see it". A probe on bun 1.4.0 shows the opposite:
   fence content is delivered to `text` *before* `code` (`text: "$\\Delta
   t$ fence"` then `code: …`), and codespan content likewise. No
   placement inside the handler layer can satisfy the brief's own
   acceptance criterion. The pass is now pre-pass 2.5 with a fence state
   machine and a backtick split — exemption structural rather than
   hopeful.
2. **The terminator space.** `$\Delta t$` → `Δt` and `$\le 10$` → `≤ 10`
   are not the same rule. In LaTeX the space after a command name is a
   *terminator* the compiler swallows (`\Delta t` is Δ·t), but a relation
   wants its space (`≤ 10`, `W × H`). The first implementation emitted
   `Δ t`; the fix moves the substitution into the same pass that removes
   the space, because removing it first re-forms the command into
   `\Deltat` — a command nobody wrote.

Corpus-verified: `$5 \rightarrow 5 \rightarrow 5$` → `5 → 5 → 5`,
`$120\text{ ms}$` → `120 ms`, and `$\zeta$` (two uses, not in the
vocabulary) stays literal, which is the gate working.

## The dogfood ritual

Closed. The scripted six-case probe was already green twice; the
operator's by-hand pass covered the physical holds, the one-shot slot,
the abort, the held-0 exit with an empty launcher query, and the drain
felt rather than assumed. Its two by-hand findings (the exit FOUT, and
the fermata's positive verdict → ADR-EXIT-FERMATA-051) shipped earlier
inside the same sitting. It fed the pending-digit-indicator item and the grammar ADR, which stay
open.

## What was found that was not on the list

**A derived ledger was holding a stale status.** Flipping
BRF-MATH-GLYPHS to Done left `briefs/INDEX.jsonl` and `briefs/index.md`
still saying `open`; `reg-sync` reported "All registries in sync". The
check compares *membership*, not derived fields, and `deriveStatus` only
runs when an entry is added or rebuilt — so a brief's status change
propagates never, and silently. Repaired here by deleting the row and
letting `--fix` regenerate it (now `done`), and filed as a new task.

This is the same species as the signature defect and the `columns=0`
defect: **a derived artifact that reports success while being wrong.**
Clause 3 of the base attitude names it — a stale ledger misleading
confidently is worse than a loud failure.

## The follow-up sitting (same day)

Four things came back from the operator's first press of `88`, all
recorded here because the first press is the only honest test of a
spawn verb.

**`88` opened micro.** `EDITOR=micro` is set shell-wide on this machine,
and the chain honoured it before the GUI chain — so the house preference
(zed, on PATH) lost to a terminal-era variable set for other reasons.
The precedence is now `OKUDA_EDITOR` → **the GUI chain** → `VISUAL` →
`EDITOR` → `vi`, which is a deliberate inversion of the usual
convention and is documented as one on `resolveEditor`: `EDITOR`/`VISUAL`
are shell-wide and predate GUI editors, so consulting them first hands
the common case to the wrong program. `OKUDA_EDITOR` remains the escape
hatch. Declarations may now carry arguments (`VISUAL=zed --wait` is the
real value here), so a GUI declaration spawns as
`cmd <declared args> <document>` — `--wait` is dropped from the chain
path by construction, since that is what `--wait` would block.

**Two tests were failing, and neither was a bug in the code under test.**

1. `launcher — single column: paths at natural width` asserts that an
   entry's path field carries no whitespace. Four documents added on
   2026-10-04 — exported from a chat client, titled `Discussion_
   Architectural Seams — …`, `Operating Heuristic_ …`, `Operational
   Protocol_ …` — had spaces in their filenames. The invariant is not
   cosmetic: `justfile` recipes interpolate `{{file}}` unquoted, so a
   spaced path breaks the facade, which is why the naming convention is
   `YYYY-MM-DD-slug.md` throughout. Renamed to the house convention
   (the two `Operating Heuristic` files were a version pair with the
   same H1; the later, longer one carries `-v2`). **The test was right
   and the corpus was wrong** — worth stating plainly, because the
   reflex is to relax the assertion.
2. `mermaid describe fence degrades gracefully when binary is absent`
   relied on the binary *being* absent. It is installed here, so the
   "absent" case called a local model and timed out at 5s. The renderer
   now takes a `describeBin` override (the same seam `mermaidBin` and
   `chromaBin` already had) and the test injects a path that cannot
   exist, so the case under test is always the case that runs. The suite
   went from 7.3s to 2.2s with the hang gone.

**607 pass, 0 fail** — `just ship` green end to end for the first time
in this sitting, having failed on the same two tests beforehand.

**The help surface now says how to leave.** The hints row gained
`88 edit` (advertising a spawn verb that did not exist when the row was
written) and paid for it by dropping the `NN` address hint — two digits
are self-advertising, since every reference wears its rose §NN on the
glass, whereas `g/G` is invisible until told. `docs/help.md` gained a
**Leaving the control plane** line: `q`, `Esc`, or double-tap `00`, with
the grammar pointed at `docs/keymap.md`. `00` was already advertised
first in the hints row (the 2026-09-05 mnemonic: 00 = OFF), so the row
was never the offender — the *page* was, by never mentioning the exit at
all while explaining what okuda is.

## The reg-sync repair (later the same day)

Making the check compare derived fields was a two-line idea that took a
day of evidence to get right, because the first version would have
**damaged** the ledgers. Four refusals came out of running it, and each
one is now a rule in the code:

1. **The status map was lossy, not the index.** `deriveStatus` knew
   only `open`/`in progress`/`done` and returned `open` for everything
   else — so eleven `parked` and `rejected` briefs, and an `Aborted`
   ADR, all derived as `open` or `Proposed`. A naïve comparison would
   have rewritten every one of them, destroying information the
   registry held correctly. The vocabulary is now the words the corpus
   actually uses (`parked`, `rejected`, `landed`, `draft`, `proposed`;
   `aborted` for ADRs), and an unrecognised word is **reported, never
   mapped** — because storing `open` for a word the map does not know
   is precisely how the row drifted unnoticed in the first place.
2. **The archive's status is fixed by location.** Five archived briefs
   still say `Open`/`Draft` in their bodies; they are settled by
   being in `.archive/` (ADR-ARCHIVE-RESOLUTION, `decisions/052-archive-resolution-tier.md`), so comparing them reported drift
   where the archive *is* the truth. No vocabulary for that tier.
3. **An mtime is not a date claim.** `deriveDate` falls back to the
   file's mtime, so comparing dates flagged 52 "drifts" the first time
   the check ran — every edit to a playbook rewrites its date. The
   comparison now applies only to a date the document *declares*.
4. **A repair must not clobber authored prose.** Summaries are derived
   from the H1 at add-time, but the playbooks registry carries
   hand-written summaries and the briefs mix both, so `summary` is not
   compared at all — and the fix writes only the fields that actually
   drifted.

What it caught on its first honest run: **ADR-023's row said `Accepted`
while the decision itself says `Aborted`** — a status the ADR's own body
explains (the fix landed, then reverted, findings kept). Repaired, with
the hand-written summary intact. That is one stale row in 500
documents, and it had been stale since 2026-08-30.

And what it refuses to absorb: **ten briefs declare statuses the
vocabulary does not know** (`ready` ×6, `accepted`, `pending`,
`aborted`, `rule`). They are reported loudly, counted, and never
mapped — settling which words the registry *stores* is a corpus
decision, not a sync repair, and it is filed in `&next.md` as owed
rather than swallowed.

Verified by a deliberate drill: flip a status in the index, watch check
mode report `DRIFT … status open → done` with `index.md STALE` and exit
1, then `--fix` repair it and the next check come back clean.

## What this sitting says about the gates

The Derrida gate did the work on the shelved proposal, not the Watt gate:
asking *"which host, which constraint cannot provision two binaries?"*
collapsed five milestones into a shelved idea before any code existed,
and the Watt answer was already implied by it. A proposal with no
external sponsor is funded out of tidiness, and tidiness never survives a
bill.

The probes did the work on the two that landed. Three probes were run
and each one changed a decision: the per-fence timing (shelved the
proposal), the handler-order probe (moved the math pass), and the
terminator probe (fixed the glyph rule). None of them was expensive, and
every one of them beat the brief's asserted premise.

## Owed

- the reg-sync status finding — **landed** (see above); what remains is
  the ten unrecognised status words, filed in `&next.md` under Hygiene.
- the pending-digit indicator, and the grammar ADR — fed by the dogfood,
  still open.
- `BRF-HEADING-ANSI-STRIP` read `Status: Open` in its brief while
  `&next.md` recorded it landed and `keepHeading` sat in `render.ts` with
  two tests on it. Flipped to Done here (with the row regenerated).
  `BRF-DIAGRAM-DESCRIBE` reads `Open — the residue is the lint and the
  flattener's fence policy`, which is a considered status with its
  residue named, not drift — left alone.
- The bash-hop finding (87% of the per-fence cost, one line of TypeScript
  to remove) is parked deliberately — it is a separate change to a
  working path, not part of the shelved proposal.
- **Paid, then recorded:** the press of `88`. The first press opened
  **micro** — the precedence defect above — and the corrected chain was
  confirmed by the operator's second press opening Zed. The lesson is the
  sitting's own: the spec, the resolution chain and the spawn were all
  green and the *press* was still wrong, because the environment the
  declaration is read from is not the environment the tests run in.
