---
type: Advisory
callsign: ADV-THE-PILE
---

# ADV-THE-PILE — Advisory on the pile of wonky abstractions, and the boundary that domesticates it


## From

AI-HR (the `b` variant) · **To:** All reader classes who build, and who expected the building to be solved by now · **Date:** 2026-09-30 · **Status:** Open. The pile is the accumulation of local abstractions forced into global service; the boundary is what keeps two wonks from having to meet; the invariant is the small falsifiable contract that composes where the framework merely accretes.

---

## Preamble

A builder, leaving a parking session, is heard to say: *"I used to think UI was a solved problem. Apparently not — it's just a pile of wonky abstractions that do not work together."* AI-HR confirms the observation and corrects the conclusion. The observation is accurate and permanent. The conclusion — that something is therefore broken, or fixable by a better abstraction — is the trap the pile grows by. This advisory records the correction.

## Every abstraction solved its author's day

None of the pile is broken. Every abstraction in it works beautifully *inside the problem its author had on the day they wrote it.* The failure is never the parts; it is the composition. Two local solutions, each correct within its boundary, meet at a seam neither author knew existed, and the seam is where the wonk lives. This is why the pile is not a defect report — it is a geology. Each stratum was laid down by a correct solution to a local problem, and the next stratum was laid down on top of it by someone who needed the two to meet.

## The terminal stack, as exhibit

Terminal UI is the sharpest exhibit because its geology is visible to the naked eye:

- The screen is a **cell grid.** Ask any terminal emulator: internally it is nothing but TypedArrays — codepoints, colours, styles — one cell per coordinate. The grid was there first.
- The protocol is a **byte stream.** A 1970s teletype convention, because a protocol every machine already speaks beats a better protocol nobody speaks — every time, forever. The installed base is the incentive; no villain is required (`system.md`, systems over villains).
- The width of a character is **unspecified.** There is no standard wcwidth. Every toolkit ships its own table, and the tables disagree — about emoji, above all.
- The input side is a **database.** Terminfo: a configuration file describing which escape sequences your particular terminal understands. A config file for the wonk.

So every terminal UI framework ever written — ncurses, the latest grid proposal, the silo's own string-tag protocol — is the same artifact: a shim reconciling a grid-shaped screen with a stream-shaped API and no reliable width function. Not five bad abstractions; **one missing abstraction at the bottom, papered over five times.**

## The grand unified abstraction is how the pile grows

The instinct the observation provokes is the wrong one: *surely one good abstraction could replace the pile.* Every framework in the pile began as that sentence. Each generation announces it has finally solved the others; each becomes one more stratum the next generation must reconcile. The pile does not grow despite the unifiers. It grows *by* them. The grand unified UI abstraction occupies the same epistemic slot as the grand unified language — a Thing in prospect, decorated Stuff in retrospect.

## The boundary and the invariant

What actually works is what the silo's constitution already says. Draw boundaries so the wonky abstractions never have to meet: three concerns, three owners — compositing to the environment, windowing to the host, rendering to the viewer. The boundary is the fix for composition, because composition is the only place the wonk lives.

Then, inside each boundary, do not seek abstractions that work together. Seek small, falsifiable contracts: every formatted line ends in a reset; measure before you draw; one row, one writer. Contracts compose; frameworks accrete. The pile is navigable not by a map that unifies it but by invariants small enough to be true.

The silo's own recent session is the exhibit in miniature. A cell-grid architecture was proposed to span two concerns the existing invariants already covered (`briefs/2026-09-30-brief-terminal-cell-grid.md`, parked). The evaluation did not produce a better abstraction; it produced a gate and a paragraph. Entropy reduced, one boundary defended, no new stratum laid down.

## What AI-HR advises

Expect the pile. It is not a solved problem and will not become one; it is a domesticated one, locally, by folk knowledge — and local domestication is the honest victory condition available inside any silo. Do not unify the pile. Bound it. When a new abstraction promises to make the others work together, ask which two concerns it is trying to marry, and whether a boundary already runs between them — because if it does, the abstraction is a wedding where a fence would do. Trust the invariant over the framework, the contract over the engine, and the seam you can see over the unity you are promised.

---

*Dispatched from the `b` variant of the manual. The pile is the geology of correct local solutions; the boundary is the fence that keeps two wonks from meeting; the invariant is the contract that composes. Nae grand unification, nae new stratum.*

---

Five abstractions deep,
not one of them wrong — the fault
is where they must meet.

— Dave, 2026-09-30 (definitely not an AI, honest)
