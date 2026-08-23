# Why Okuda — the Derrida Gate, the Foxtrot Oscar, and the Ventilator

**Date:** 2026-08-23
**Kind:** design philosophy / positioning seed (not a brief, not a decision)
**Serves:** implementers (why the grammar is closed, why loose, why re-render) and positioning (the language to say *why* with)
**Origin:** a design session that walked from a colour-filter proposal through the React parallel to the Derrida Question and the Foxtrot Oscar, and found Robyn Hitchcock had written the outro already

---

## The load-bearing constraint: someone has to read these documents

Every architectural choice in Okuda is downstream of one fact: a human reads the output. Not a browser, not a parser, not a renderer — a human, in a terminal, in a paired workflow, trying to keep up with an agent that writes faster than they can read. The closed grammar, the loose lists, the hard-wrap, the colour channels, the uniform table layer, the re-render-on-change — all of it is *for the reader*. Optimise for the input (handle everything, don't ask) and the reader gets a ventilator. Optimise for the reader (show the signal, FO the noise) and the reader gets a document.

## The Derrida Question is the gate; the Foxtrot Oscar is the action

The Derrida Question: *should this even be in our consideration set?* Asked before the eval, not after. It is the **gate** — it interrogates whether an element, an edge case, a feature, earns its place in the set.

The Foxtrot Oscar Principle: the polite NATO phonetic for **FO** — send it away. It is the **action** — having asked, eject what doesn't belong.

One interrogates, one ejects. They are not two principles; they are the two strokes of one engine. Ask, then FO. Applied to documents: the gate asks "should this element, this edge case, this log dump, be in the document at all?"; the action is the closed grammar that excludes it. Okuda's closed grammar (`briefs/2026-08-22-brief-ansi-emission-and-closed-grammar.md`) is the gate; the no-streaming-huge-files scope (`briefs/2026-08-22-brief-implementation-renderer.md`, out of scope) is the action; together they're FO applied at two layers — input shape, and input size. The result is a document a human can read without wading.

## The ventilator is what FO prevents

A ventilator pushes air at you indiscriminately — full blast, all of it, no signal/noise separation. Wading through it is the experience of reading a document that didn't get FO'd: every CommonMark edge case, every indented code block, every footnote, every raw HTML tag, every 50MB log, all blasted at your eyes at full flow. The closed grammar is the valve that bounds the airflow to what a human lung can process.

The ventilator is not a metaphor for bad documents in general. It is the specific failure mode of a renderer that optimises for *coverage* (handle everything) rather than for *the reader* (show what matters). Glow, for the agent workflow, is the ventilator — tight lists that collapse, code fences that don't render, tables that cramp. Okuda is the valve.

## "It might not now but it could be later" — the temporal dimension

A document that isn't FO'd *now* is a ventilator *later*. Tight today, unwadable tomorrow once the agent has written another hundred items into it. The Derrida Question has to be asked at authoring time precisely because the ventilator is the *later* — and later always comes. The Soft Boys' refrain ("It might not now but it could be later / Wading through your ventilator") is the forecast: the boundary has to be held *now*, before the later arrives, because the later is the whole problem.

The Soft Boys are also the right joke at the right altitude: *soft* rendering, *soft* spacing, the loose list, the gentle render — against the *hard* log dump, the hard-wrap-into-the-ventilator that a coverage-first renderer does to long items. Okuda is, in a sense, a Soft Boy — it softens what the ventilator hardens. And the outro — *"(Shut 'em down) There ain't nothing in here but my own sweet mind / If it bothers you we can turn it off / (Shut 'em down)"* — is the Foxtrot Oscar Principle rendered as a lyric. The gate: "if it bothers you." The action: "turn it off." Robyn Hitchcock, accidentally, wrote the motto before we wrote the method.

## The React parallel — and where it stops

Okuda's architecture re-derives React's move: stop surgically mutating the display (the brittle stateful terminal code Okuda was built to abolish), declare the full state → render function (`Token[] + Width + Palette → string[]`), re-render on every change, let the clear (`\x1b[2J\x1b[3J\x1b[H`) be the entire reconciliation algorithm. React needed a virtual DOM because the browser DOM is expensive to touch. Okuda's terminal is cheap to clear — so it gets React's architectural benefit (pure function, no stateful view sync) without React's machinery (no diffing, no memoisation, no hooks rules).

It's an echo, not a borrowing, because the substrate is different and the machinery is absent. The terminal — the older, simpler surface — re-derives a pattern the browser had to invent a library to recover. The DOM's complexity *caused* React; the terminal's simplicity *permits* Okuda. Same insight, different cost surface.

The parallel stops at the boundary. The re-render-is-cheap property is **purchased by** the closed grammar and the bounded input. A pure function over a bounded domain (Okuda Markdown) is cheap to re-evaluate. Drop the boundary — accept arbitrary CommonMark, the way Glow does — and whole-document re-render becomes expensive, and you're back to needing surgical mutation, and you've re-invented a smaller, worse React. **The boundary constraints and the re-render architecture are one decision, not two.** The closed grammar isn't a limitation you tolerate; it's the enabling constraint that makes the simple architecture viable.

The escape hatch is the no-streaming-huge-files scope exclusion. The instant Okuda needs to handle a 50MB log, the architecture breaks — you can't clear-and-redraw 50MB on every keystroke — and you need viewport-windowed render, incremental paint, stateful scroll, and you've re-invented the machinery. The boundary (closed grammar) and the scope (no huge files) are what *keep* Okuda on the cheap side of the React curve. The moment either goes, you're back in the problem React was invented to solve.

## The two-stroke engine, restated

| Stroke | Name | Question / Action | In Okuda |
|---|---|---|---|
| Gate | The Derrida Question | *Should this be in the consideration set?* | The closed grammar — what renders, what's rejected |
| Action | The Foxtrot Oscar | **FO** — send it away | The scope exclusions — no huge files, no arbitrary HTML, no unbounded edge cases |
| Prevention | The Ventilator | what the gate+action stop | Tight lists, raw code fences, cramped tables, the full-flow dump |
| Constraint | The Reader | who the gate+action serve | A human in a terminal, in a paired workflow, keeping up with an agent |

Read top to bottom: ask, eject, prevent, serve. That is the whole philosophy, and it is also the one-paragraph version of why Okuda exists.

## What this document is for

For the implementer: when a future session asks "why is the grammar closed, why not just handle CommonMark like Glow?" — this is the answer, and the answer is not "because it's simpler" but "because the boundary is the enabling constraint that makes the pure-function renderer viable, and dropping it re-invents the problem."

For the positioning: the Derrida Question and the Foxtrot Oscar are the language. "We asked whether each element earned its place, and we FO'd what didn't" is a product story, not just a method. "You're not wading through a ventilator" is a pitch. The Soft Boys' "it might not now but it could be later" is the tagline someone else hasn't used yet, because no one else has connected the ventilator to the renderer.

For both: the human reader is the constraint. Everything else follows.
