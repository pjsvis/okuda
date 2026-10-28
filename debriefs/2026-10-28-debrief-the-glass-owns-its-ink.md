---
type: Debrief
callsign: DBF-GLASS-INK
briefs: []
---

# Debrief — the glass owns its ink

**Date:** 2026-10-28

## What happened

A pasted proposal to attenuate dense prose by line count arrived. It was refused
on inspection, and refusing it took three more proposals out with it: a global
lightness scale, the OKLCH version of the same, and setting the terminal's
defaults at runtime with `OSC 10`/`11`. The principal's ruling — *the foreground
and background are not ours to adjust* — is now `ADR-GLASS-INK-073`, and the one
thing that survived the family is a `body` role that ships **empty** and exists
only so a principal can state a relation no terminal can express.

Three commits, two ADRs, one brief rejected and archived, one lexicon term.

## What the gates caught, which is the part worth keeping

| catch | how it surfaced |
|---|---|
| the derived swatch had drifted for weeks | regenerating it repaired a `state-parked` hex the palette had changed out from under it |
| a callsign that could never be cited | `REF-PALETTE-SWATCH` was minted by the generator, but `CALLSIGN_TOKEN` knows only `BRF/ADR/ADV/DBF/PLY/OKF/CSN` — the census read it as a permanent demotion candidate the moment the doc was regenerated |
| a `Next` section that had been a live plan for seven weeks | `docs/2026-09-05-palette-page.md` §7 proposed exactly the design `ADR-073` refuses; nothing in td named it, so it read as current |
| a commit message citing an ephemeral queue | `callsign-lint` failed the unpushed range — amend while it is cheap, which it was |

Two of these are rule 7 wearing different hats: a deferral with no owner is a
wish, and a *plan* in a reference document with no owner is the same wish with
better formatting.

## What went better than it usually does

**The control ran first.** The `body` role shipped empty, so all 886 existing
tests passed unchanged before a single new assertion was written — the default is
byte-identical, proved rather than asserted. `ADR-PROSE-MEASURE-071`'s process
finding was that the control sat one command away and was never run for two
weeks; this time the empty default *was* the control, and it cost nothing.

**One claim was checked instead of assumed.** The suggestion that Ghostty's
`minimum-contrast` would fix "too bright" reads plausibly. Its reference says it
is a floor: it forces text towards black or white when contrast is *below* the
setting, and the default `1` is no enforcement. Reading it took one tool call and
changed the ADR's content. An unchecked version of that sentence would have been
an unpaid claim that cost a future session a diagnosis.

**The disagreement was already written down.** The palette page had said *two
briefs touch palette brightness and they disagree on ground truth* since
September. The decision did not have to discover the contradiction; it had to
resolve one that the record had already flagged — which is the record working.

## What I would do differently

- **Read the token regex before minting a name.** Two rounds were spent trying to
  cite a callsign whose family the linter does not recognise. Four seconds of
  `rg CALLSIGN_TOKEN` would have shown that no citation could ever satisfy the
  census, and the fix was to drop the mint, not to appease the gate.
- **Regenerate a derived doc before editing it by hand.** The swatch is generated;
  the instinct to patch the table by hand would have left the generator and its
  output disagreeing, which is the drift the generator exists to prevent.

## What is still open

- **`OSC 11;?` — query the ground, derive the ink.** Deferred, not refused: it is
  the only mechanism that would make body ink *derived* rather than declared. It
  costs a read seam (async, needs a timeout, hostile to hermetic tests) and buys
  a half-measure, since every accent stays a fixed hex. Filed so the deferral has
  an owner.
- **The operator dogfoods a body hex.** Until that happens the role is a
  mechanism, not an answer: the complaint that started this was *"the default
  text colour is too bright"*, and the honest reply may still turn out to be
  "change your terminal theme once" — which is what the ADR already says.

## The one finding that outlives the work

Four proposals in two days, each arriving from a feeling rather than from the
record — and the record already contained a rejected brief with the same finding
in it. That is not a failure of the proposers; it is what a silo looks like when
a decision lives in one document nobody is told to read before proposing. The
fix is not more prose. It is that `ADR-GLASS-INK-073` answers the next arrival
with **one table** instead of a two-month argument, and that the lexicon now has
a term — *the glass owns its ink* — with a test in it.
