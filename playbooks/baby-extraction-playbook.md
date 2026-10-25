---
type: Playbook
callsign: PLY-BABY-EXTRACTION
---

# The Baby Extraction Playbook

## When to use this

When a capability you reach for gets spec'd as an over-engineered plan,
and the over-engineering triggers the Foxtrot Oscar reflex. This happens
regularly: you figure you want some capability, you sketch the solution,
the solution arrives carrying a bunch of useless abstractions, and the
FO reflex fires. **Do not throw the baby out with the bathwater.**
Carefully extract the baby, dry it off with a soft towel, and place it
in a secure, comfy location.

This playbook is the drying-off.

## The pattern, stated

The cycle is a *regular occurrence* in this silo, not an accident:

1. **Want a capability.** You reach for something real — a paging
   behaviour, a search grammar, a context affordance.
2. **Over-engineer the solution.** The first sketch carries abstractions
   the reader didn't ask for: sticky headers, continuation markers,
   two-case rules, named supersessions, machinery to manufacture
   context the frame should only facilitate.
3. **See the over-engineering, trigger FO.** The plan's decoration is
   visible the moment it's written down. The FO reflex fires —
   *send it away.*
4. **Do NOT discard wholesale.** The FO was right about the
   bathwater; it would be wrong about the baby. The kernel of real
   value is in there, tangled with the abstractions.
5. **Extract the baby.** Name the one invariant or affordance that
   was real. Strip the decoration. Dry it off.
6. **Persist the baby, name the bathwater.** Land the kernel as a brief
   (or a doc, or an ADR). Record what was FO'd so the next session
   doesn't re-grow the same decoration.

## How to extract the baby

- **Find the one invariant the reader actually needs.** Not the three
  mechanisms you sketched — the one thing that, if absent, the reader
  would notice. (The step episode, `BRF-OKUDAGRAM-STEP`: "no gaps in
  coverage." Not the
  sticky header, not the continuation marker, not the two-case rule.)
- **Find the one affordance the reader fetches on demand.** Context
  the reader asks for via existing actuators is an affordance; context
  the frame pre-emptively manufactures is decoration. Facilitate, don't
  manufacture.
- **Keep what's already there.** If the kernel is an addition to an
  existing brief, it doesn't reverse the brief — it refines it. No
  palimpsest, no ADR, no supersession unless the kernel genuinely
  contradicts a settled position. The correction usually *simplifies*
  the corpus; the paperwork inflation was part of the bathwater.
- **Name the bathwater explicitly.** A "What this brief does NOT spec"
  section is the bathwater, recorded. The next session reads it and
  doesn't re-grow the decoration — because the decoration is on the
  record as FO'd, with reasons.

## When the carrier is fluent

The pattern above assumes the bathwater is **visible** — an over-engineered plan,
whose decoration announces itself and trips the FO reflex. There is a second
carrier, and it defeats that reflex: **fluent generated prose.** A well-written
document does not announce its own bathwater; that is what well-written means.
Nothing fires. The text is smooth, structured, confident and partly false, and the
only way to find the part is to put an instrument on it.

> **When the carrier is fluent, the extracting instrument is a measurement, not a
> reflex.** Complexity fails loudly; plausibility fails quietly.

Worked instance (2026-10-25): three documents arrived from a bath-time session
with a model — an Omarchy LUT brief, an Apple Foundation Models probe, and an
essay joining them. All three read well. The FO reflex never fired. The brief's
load-bearing premise — *"dynamic statistical calculations on resize cause jitter
and high CPU overhead"* — died on a stopwatch: a 120-paragraph render is 4.5 ms at
80 columns, the twelve-diagram fixture is 65 ms of which ~92% is subprocess spawn,
and the resize cost it cited had already been fixed in this repo by **coalescing**,
structurally, not by precomputation. Four flakes of gold survived. The rest was
yap.

What the measurement did that reading could not: it named *which sentence* was
false. A reader can only say "this feels like too much"; a stopwatch says
"this optimises the minor term".

## The tell that you got it right

The extracted baby is **shorter** than the over-engineered plan. The
right idea reduces entropy; the wrong one adds it. If the "dried-off"
brief is longer than the over-engineered sketch, you haven't extracted
the baby — you've re-wrapped it in a softer towel. Cut until the kernel
is bare.

**This tell inverts when the carrier is fluent.** A generated document is short
because nothing in it was decided — every claim arrived at the same confidence,
so there was nothing to argue and nothing to record. The extraction is *longer*,
because a decision owes its reason, a prediction owes its falsifier, and a
precondition owes the test that would show it unmet. Measured on the same three
documents: 387 / 338 / 710 words in, 1197 / 1137 / 1268 words out. Read that as a
cost, not a win — the redrafts also doubled the longest prose run (80→141,
88→169, 98→204 words between entry points), which makes them harder to skim than
the yap they replace. The tell is not length; it is **decidability**: can the
reader tell, per claim, whether it is decided, proposed, or open? A document that
answers that is the baby whatever its size.

The second tell: **the corpus gets simpler, not heavier.** The correct
extraction doesn't generate an ADR, a supersession, and a palimpsest; it
dissolves the paperwork the over-engineering was generating. If landing
the baby requires a palimpsest protocol, check whether the baby is
actually a reversal (sometimes it is) or whether the paperwork is still
bathwater.

## When the baby IS a reversal

Sometimes the over-engineering reveals a genuinely settled position that
needs reversing. The baby-extraction doesn't skip the palimpsest — it
*checks* whether the palimpsest is warranted:

- If the kernel contradicts a settled position → ADR + palimpsest
  (AGENTS.md rule 7). The reversal is the baby; the decoration around
  it is the bathwater.
- If the kernel is an addition that simplifies → no palimpsest. The
  addition is the baby; the "supersede two docs" impulse was the
  bathwater.

The discipline is running the check, not skipping it. Most over-engineered
plans generate supersession impulses that dissolve on inspection; a few
reveal real reversals. The playbook is the check, not the verdict.

## Worked example: the step episode (2026-09-07, `BRF-OKUDAGRAM-STEP`)

**Wanted:** a paging behaviour — step through the document, skim fast.

**Over-engineered plan:** a sticky header persisting across pages, a
continuation marker glyph on the header, a two-case page-1-vs-page-2
rule preserving the opening frame's glance-confirm, and a named
supersession of the frame brief and the shite-filter doc via the
palimpsest protocol. Four mechanisms to maintain context the frame
should only facilitate.

**FO triggered:** the decoration was visible the moment it was written.

**Baby extracted:** the one invariant — *we do not make gaps in our
coverage of the document, however shite it may be.* The one affordance —
context is the reader's to fetch via the actuators that already exist;
the frame facilitates, it doesn't manufacture.

**Bathwater named (the "does NOT spec" section of
`briefs/2026-09-07-brief-okudagram-step.md`):** no sticky header, no
continuation marker, no two-case rule, no supersession. The paperwork
the over-engineering was generating (the palimpsest, the ADR) dissolved
— the baby was an addition, not a reversal.

**The tell:** the baby brief is shorter than the over-engineered plan,
and the corpus got simpler (no new ADR, no superseded docs). The
correction reduced entropy. That's how we knew the extraction was
right.

## Related

- `briefs/2026-09-07-brief-okudagram-step.md` — the worked example's
  baby, dried off.
- `docs/2026-08-23-why-okuda-derrida-gate-foxtrot-oscar.md` — the
  Foxtrot Oscar Principle this playbook operationalises at the design
  layer. The Derrida Gate asks whether the decoration earns its place;
  the FO ejects it; this playbook extracts what was real before
  ejecting.
- `decisions/027-temperament-is-downstream-of-discipline.md` —
  temperament (the FO reflex) is downstream of discipline (the
  extraction). The reflex fires; the discipline is what you do next.
- `playbooks/decisions-playbook.md` — the palimpsest protocol; the
  baby-extraction check decides whether to invoke it.
