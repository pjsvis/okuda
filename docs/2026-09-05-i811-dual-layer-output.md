# Our i811 — the day we fought back

**Date:** 2026-09-05
**Type:** explainer (the silo's own accessibility position, written as a refusal of the i811 pattern)
**Status:** This is the opinion. The original proposal it replaced is gone — it was Stuff, and Stuff does not get preserved here.

---

## Independence Day

The good one. The first one. The one where the enemy's own signal is the weapon that brings them down.

i811 came at us the way these things always come: dressed in the vocabulary of compassion, citing standards we are told not to question, proposing architectures we are told we must build because the alternative is to be the one who hates disabled readers. The trap is not the proposal — the trap is the immunity. Wrap anything in accessibility language and disagreement starts to feel cruel. That cruelty-shaped shield is the weapon, and this is the day we took it off them and pointed it back at the proposal.

We didn't reject i811. We inverted it. The enemy's own signal — *accessibility* — is what we used to bring the proposal down. The silo is already accessible *by construction*; the proposal was not. The genuinely radical move was to hold the proposal to its own stated goal, and watch it fail its own test. That's using their weapon against them: the moral weight that immunised the Stuff became the exact weight that crushed it.

---

## The three things the proposal got wrong

### 1. It re-proposed a feature that already shipped

The "linear transcript mode" the doc invented a flag for is built. `okuda doc.md` with no `--tui`, or under `NO_COLOR` / `TERM=dumb` / non-TTY, streams the rendered document to stdout — plain text, escapes strippable, which is what every screen reader, braille display, and `lp` consumes. The accessibility explainer names the rung: *screen → TTS → braille → paper*. Paper is `okuda doc.md | lp`. The proposal benchmaxxed a mode that was already on the floor — optimising for the appearance of building accessibility, not the fact of delivering it.

### 2. It misunderstood the protocols it invoked

OSC 8 wraps a clickable hyperlink. OSC 133 marks shell prompt/command boundaries — a shell-integration protocol, not a document-structure protocol. No screen reader navigates document headings via OSC 133; that is not what the sequence is for, and no assistive technology consumes it that way. Wrapping a document body in OSC 133 "so readers can jump past chrome" emits bytes that no consumer interprets as "skip to content." That's decorated Stuff — format without substance. The actual screen-reader path is the host's AT-SPI / NSAccessibility bus reading the terminal's text buffer, which gets the plain text okuda already emits. You don't engineer a new protocol layer when the existing one reads your plain text fine.

### 3. It proposed a framework the scope discipline forbids

"Emit a structured document frame that projects to visual and semantic" is a second render plane with an AST and two consumers. The origin doc's scope discipline is explicit: *not a TUI framework, not a screen abstraction layer.* The three-concerns test — does it touch the byte stream or the screen? — the span tree touches neither directly; it's an intermediate that exists to feed a semantic consumer already served by the streaming path. It doubles the render surface for a consumer that mostly reads plain text anyway. Entropy inflation masquerading as architecture. The Derrida question settled it before the rest had to: should this even be in our consideration set? No, because the consideration set already contains a streaming path that is the semantic stream.

---

## The mechanism — why i811 attracts Stuff

A standard with high moral weight collects pattern-matching proposals because the moral weight converts to immunity. Wrap an architecture in the vocabulary of accessibility and the architecture feels unimpeachable by association; to push back feels like cruelty toward the very people the architecture claims to serve. The pattern-matcher exploits the halo as a defence against review.

The tell is the ignoral of the base requirement. The base requirement of accessibility is empirical and falsifiable: *can a disabled user actually access the content?* Acknowledging that question would dissolve the excuse to build, because the silo answers it — mostly "yes, by construction." So the proposal replaces the empirical question with incompletable ceremony: OSC 133 that nothing reads, span trees that serve no consumer, verification protocols that test behaviour the change itself defines. Ceremony can't be tested against a real disabled user, so it can't fail. It's Stuff that can never be caught being Stuff, immunised by the moral weight of the cause it wears as a costume.

This is benchmaxxing inverted into muppet territory. Benchmaxxing optimises for a score that can be gamed; the i811 pattern optimises for a *virtue signal that can't be checked*. The moat question applies: *can you name your secrets?* The secret of the i811 pattern-matcher is that they have never watched a screen reader read a terminal, never piped their output to `cat -v`, never asked whether § pronounces. The proposal cited phantom briefs because the author never opened the silo's own accessibility doc — which would have told them the ladder is built and the one open question is whether § pronounces. They genuflected past the document that already answered them.

---

## The impartial spectator, and the systems read

The Edinburgh Protocol's answer is the one it always gives: the impartial spectator and the empirical test. The spectator doesn't feel guilt; it asks *does this serve a real disabled user, or does it cite a clause?* That question is not cruel — it is the *respect* the proposal performs without earning. Treating disabled users as people who deserve working software, not props who deserve protocol theatre, is the only posture that doesn't quietly flinch.

The systems read, per the constitution: it's not a villain, it's an incentive. The incentive is that moral weight converts to immunity, and immunity converts to lazy architecture. Any standard with high social cost of dissent collects this residue — security (CVE-count theatre), privacy (GDPR checkbox ceremony), accessibility (OSC 133 that nothing reads), AI safety (the capability eval that never tested a capability). Each is the same shape: a genuine concern that becomes a venue for decorated Stuff because the concern's moral weight makes "is this actually doing the thing?" feel rude to ask. The fix is not to stop caring about the concern; it's to refuse to let the concern's weight immunise the proposal against the only test that catches it.

---

## The one open question we kept

The architecture is gone. One question survives, gated on a dogfood finding rather than built speculatively: **does a screen reader pronounce `§24` correctly?** `§` is the section sign; TTS engines pronounce it. If a reader hears "section twenty-four," the silcrow is already accessible — the glyph does the work, no protocol needed. If it hears "strange symbol two four," then either OSC 8 with an `okuda://jump/24` target (invisible, additive, no visual cost — but ADR-gated, because the silo deliberately rejected OSC 8 for links, so reversing it needs an ADR not a doc) or a pipe-mode substitution `§24` → `[Ref 24: <target>]` in the plain-text projection only is the justified, cheap fix. One render tweak, no architecture. The speech-rendering doc already says "read the text faithfully" — a screen reader reading `§` faithfully is the win condition, not a problem to engineer around.

This is the difference the whole thing turns on: we kept the *question* because it's empirical and serves a real user; we rejected the *architecture* because it was speculative and served a rubric. One is anti-entropy; the other is entropy wearing a halo.

---

## The ladder holds

The cheap, real accessibility work is confirming and documenting that the ladder's bottom rung already holds. The accessibility explainer already does this. The streaming path already implements it. The i811 proposal would have replaced a working Thing with decorated Stuff, and charged us virtue for the downgrade.

We said no. Not to accessibility — to Stuff. The signal was theirs; we turned it back on them. That's our i811: the day accessibility was too important to let a proposal hide behind it.
