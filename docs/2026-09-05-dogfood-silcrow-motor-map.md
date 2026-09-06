# Dogfood: the silcrow invites, the grammar is a motor map, the repetition calibrates

**Date:** 2026-09-05
**Type:** dogfood note (the grammar confirmed from the reader's side)
**Status:** The accessibility explainer's claims, read back from use. The design aimed at this; the dogfood confirms it was felt, not just argued.

---

## The finding

The rubricated silcrows are really effective — they invite investigation of the reference. As you come across the first silcrows you see the familiar numbers `11`, `12`, … and you know, from experience, what is behind those numbers: more stuff related to the current stuff, and it is all there at the LHS of the keyboard just waiting for a quick tap. And the return is Backspace — just keep hitting it until you are happy you are back in your main document. And if you want to search, keep hitting the zero key to get to the search, and then keep hitting Esc to get to the root view. Repeated keys in appropriate areas of the keyboard.

## The silcrow is the clickbait that delivers

"Invites investigation of the reference" — that's the hook. `§11`, `§12` at the LHS of the line, rose-and-bold, the number you have seen before. You know from experience what is behind those numbers (more stuff related to the current stuff), and you know it is one tap away on the LHS. That is *curiosity with a key* — the clickbait promises something interesting and delivers a popup farm; the silcrow promises something related and delivers a document. The invitation is honest because the destination is honest, and the destination is honest because the silcrow is a vector (a real address in the map), not a lure. This is the "show clickbait, have them punch keys" objective from `docs/2026-09-05-no-tree-no-outline.md`, *working* — the silcrow is the clickbait that earned its headline, and the LHS digits are the keys it asks for.

## The grammar is a motor map the hands learn by zone

The muscle-memory claim is the real finding. Repeated keys in appropriate areas of the keyboard. The two-digit grammar clusters by *frequency and ergonomics*, not by semantic category, and the body learns it fast because the clustering matches the hand:

- **The LHS is where you tap to go deeper.** Low-number silcrows (`11`, `12`, `13`) are the commonest vectors because numbering follows visible order and visible order follows likelihood. The left hand is where it lives for reading; the jump is a lateral twitch, not a reach.
- **The RHS is where you tap to come back.** Backspace, the right-hand rest, repeated to unwind the stack. A repetitive key wants to be where the hand that presses it rests.
- **The verb region (00–10) is where you tap to change mode.** Zero to approach the search, Esc to clear back to root, double-zero to leave. The mode-changes live where the hand goes when it is done with the document.

The whole keyboard is partitioned by *what the hand is doing there* — go-deep, come-back, change-mode — and the repetition is the confirmation that the zone is right. The two-digit grammar is not just a bounded keyspace; it is a *motor map*, and the reader's hands learn the map by zone, not by token. That is why `§11` at the LHS is instantly actuable — the eye saw it, the left hand knew, the tap was already on its way before the conscious "I'll jump to 11" completed.

## The repetition is the calibration; the screen is the proof

The return mechanic — repeated Backspace — is a use of the verb that the design did not model: not "press once to unwind one level," but "press repeatedly to *calibrate* your sense of where you are." The repetition is the proof — each press is a step back, and you stop when the screen shows the main document, the visual confirmation that matches the proprioceptive count of how many times you pressed. Repeated Esc at the search is the same mechanic at the other scale: a repetitive key that calibrates the state by clearing it, one press at a time, until the screen shows the shelf. Same mechanic at two scales: repetition as calibration, the screen as the proof, the key as the unit of "one more step toward where I want to be."

## The prediction, confirmed

The accessibility explainer (`explainers/accessibility.md`) claimed: *the most likely actions carry the lowest numbers, because numbering follows visible order, and visible order follows likelihood. For someone with limited reach or fatiguing hands, the common case is always the shortest press, always in the same place. Motor ergonomics for free.* That was an argument from design. The dogfood confirms it from use: the free ergonomics are *felt*, not just theorised. The LHS low numbers are where the left hand already is when reading; the jump is a reflex, not a decision. The claim held, from the reader's side.

## Emergence, when the abstractions don't hamper

This is the broader finding the dogfood carries, beyond the silcrow and the grammar: emergent things emerge if given freedom from hampering abstractions. The grammar was not designed top-down as a motor map — it was designed as a bounded keyspace with a density profile biased low, and the *motor-map* property emerged from the combination of bounded keyspace + low-density bias + the hands that use it. Nobody specified "LHS = go-deep, RHS = come-back, verb region = change-mode"; those zones appeared in use, because the grammar was tight enough to *have* zones and loose enough to let the hands find them. A heavier abstraction (a menu, a command palette, a mode-per-action) would have *specified* the zones and thereby prevented the hands from discovering them. The grammar's value is partly in what it gives the reader and partly in what it *doesn't* give the designer — the absence of the hampering abstraction is what let the motor map emerge. Same lesson as the minimap (emergent, promoted) and the shite filter (emergent, named): the silo's best properties are the ones it didn't build, only refused to prevent.

## One line

The silcrow is the clickbait that delivers; the grammar is a motor map the hands learn by zone; the repetition is the calibration; the screen is the proof; and emergence happens when the abstractions don't hamper.

## Related

- `explainers/accessibility.md` — the prediction (low numbers, motor ergonomics for free) this dogfood confirms.
- `docs/2026-09-05-no-tree-no-outline.md` — the clickbait objective; the silcrow delivers it.
- `docs/2026-09-05-keyboard-controls.md` — Backspace restored on RHS ergonomics; the dogfood shows why the right hand's rest matters (repetitive unwinding).
- `docs/2026-09-04-minimap-reversal.md` — emergence as the pattern: refused, then rediscovered, then promoted. The motor map is the same shape.
