# The orientation gap — `&alpha.md` and the active vector file

> The human's `just orient`: not a command, a place. The user hits Enter
> on the first file and gets what they need. No code, no new surface —
> a convention over the existing jump-table machinery.

## The gap

Open Gloam without a filename. The raw file list — every `.md`, flat,
in fzf. Correct, fast, disorienting: a wall of filenames with no "you
are here." Not an okuda problem, not a Gloam problem — a human
orientation problem. The agent has `just orient`; the human gets `ls`.

## `&alpha.md`

An ugly prefix sorts first by ASCII (`&` 0x26 beats `2` 0x32, so it
precedes every date-prefixed file in this silo) and self-polices the
namespace — no one else wants an `&`-prefixed filename, so the prefix is
ours alone. The pun is load-bearing: `&alpha;` is the HTML entity for α,
the ugliness encoding the meaning. The user hits Enter on the first
file and lands on orientation. No typing, no arrows — Enter.

## The alpha-doc, described (not implemented)

The agent in the repo writes `&alpha.md` by hand — what a human needs on
first encountering the silo, like a useful about page. Two objects
survive the examination:

- **Orientation** — one paragraph: what this silo is, how to move
  (press a two-digit number to jump, `u` to go back), and a pointer to
  `NOW.md` for live state. The how-to folds in as a sentence; the status
  does not survive as a section (it is the agent's frame, not the
  human's — a pointer is honest, a duplicate is leakage).
- **The jump table** — the useful part. A root menu into the tiers,
  riding the existing `%%okuda-rhs:NN%%` wiring: press `11` for briefs,
  `22` for decisions, … One double-tap from orientation into a tier.

Not five sections — two objects. The agent writes it; the human reads
it; the code is unchanged. The moment we write `scripts/alpha-doc.ts`
we cross from convention into code; the doc holds the line at "by hand"
until the operator decides the habit is worth automating.

## The protocol: one active vector file

The jump table is **not special to `&alpha.md`** — it is the existing
machinery, and any markdown file with `%%okuda-rhs:NN%%` wiring is a
vector file. The protocol is short:

- **One active vector file at a time.** The numeric keys resolve
  against the jump table of the document currently in the frame.
- **`&alpha.md` is the default** — the one the user lands on at entry,
  the root orientation menu.
- **Loading another vector file rebinds the keys.** If the user opens
  any vector file (a tier menu, a composed trajectory, whatever the
  repo holds), *that* file's jump table is the current set of
  destinations. The keys follow the frame.
- **`u` returns to the previous frame** — and to its jump table. The
  backstack already restores scroll; the jump table is re-extracted
  from the returned-to source. Context is maintained, not thrown
  around.

No new action, no new key, no new mode. The "dashboard" is a document;
the "menu" is a jump table; the "back" is `u`. Conceivably there are
many vector files in the repo; only one is active at a time, the one
in the frame.

## Open questions

- **Which ugly prefix?** Settled: `&alpha.md`. (Recorded; the pun on
  alpha-dog is the bonus.)
- **Does `&alpha.md` belong in the registry?** Navigation affordance
  (like `NOW.md`, unregistered) or durable document (registered)? The
  review decides.
- **One root file, or one per tier?** The root `&alpha.md` is the
  minimum; per-tier landing files are a follow-on, not a prerequisite.
- **Maintenance cadence** — the agent writes it when the human's
  cold-entry needs change. Orientation is stable, so rarely. If it
  needed constant regeneration it would be `NOW.md`; because it
  doesn't, it is a hand-written page.

## Related

- `src/launcher.ts` — `listMarkdownFiles` (the ASCII sort), the
  browse → read → browse loop
- `src/tui.ts` — `extractJumps` (the jump table), `jumpTo`, the
  backstack (context already maintained)
- `scripts/status-doc.ts` / `NOW.md` — the agent's orientation, the
  parallel the human lacks
- `decisions/002-date-first-brief-naming.md` — why the silo is
  date-prefixed (the cause `&` resolves)
- `decisions/021-jump-token-numbering-offset.md` — the jump-token
  spacing the alpha-doc's table would use
- `docs/2026-08-30-from-babylon-to-the-stars.md` — the vector-table
  vision (system-level; this doc holds the line at convention)
- `AGENTS.md` — the three-concerns principle (the scope gate: no
  code, no compositor, no pane manager)