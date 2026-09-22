# Speech-Driven Design
### One canonical text, N bounded projections

**Status:** Candidate — held in `docs/`, pending review.
**Origin:** Design conversations around a restricted-grammar markdown viewer (Okuda / Gloam), a briefs-based workflow in a Git repo, and human–AI collaboration over SSH.
**Date:** [ ]
**Note:** Unregistered. Held in `docs/` pending the Derrida Gate and the Foxtrot-Oscar Gate. Not authoritative until promoted.

---

## 1. The claim

Designing for speech is not accessibility work bolted onto a visual UI. It is a **simplification discipline**.

The speech medium contracts the design space, which exposes the invariants of a system, which lets the design *close*.

> **Don't build the GUI and add speech. Build the spoken core first, find its closure, and treat the visual interface as an optional projection.**

This is the same move as a renderer that produces one abstract view and encodes it N times — one model, N presentations — except the model is *spoken*, and the visual layer is one of the encodings.

**Precondition, stated precisely:** a domain is speech-driven-designable when its content can be expressed as a **linear character stream**, with any extra structure pushed into **at most one encoding dimension per channel**. Where this holds, the design can close. Where it fails, it can't — and no amount of interface polish will fix that.

---

## 2. Why speech simplifies

A visual UI is a large, continuous space: pixels, positions, sizes, spacing, scroll, hover, focus, z-order, animation, responsive layout. Every dimension multiplies decisions, and most UI work is *pruning* that space.

Speech discards those dimensions. There is no pixel, no position, no hover, no z-order. What remains is small:

- **What can be said.**
- **What can be heard.**

A small space is a *closable* space. Speech does not add constraints — it removes dimensions, and the removal is what makes the invariant findable.

---

## 3. The four forces speech exerts

1. **Speech forces naming.** You cannot point. Everything addressable must be *utterable*. Hence bounded names, and a cap on how many things can be named at once.
2. **Speech is serial and turn-based.** One utterance at a time. State stays shallow: what was asked, what is pending, what owns the current view.
3. **Speech has no re-glance.** You cannot look back. Return and place-preservation must be explicit.
4. **Speech must linearize content.** Rich layout fights the medium. Linear-friendly content survives; spatial content requires work.

---

## 4. The method

> **Name the invariant. Bound the variable. Let the boundary do the work.**

Applied at every layer of the demonstration system:

| Layer | Invariant | Variable |
|---|---|---|
| Render | The document (a string) | Geometry (X, Y, zoom, scroll) |
| Output | The rendered bulk (one value) | Encodings (terminal, speech, …) |
| Addressing | The set + its vectors | Which are visible in the table |
| Navigation | The context that owns a view | Where you are within it |
| Depth | One level of reference | Cloning to go deeper |
| Content | The file in `briefs/` | The last render |
| Time | The user's Refresh | Everything auto |
| Transport | Text in, text out | Where it runs |

Every apparent complication dissolved into a **scope**: the set, the context, the document, the bulk, the file.

The medium and the collaborator work together: *speech shrinks the space; the collaborator finds the fixed point.* Neither alone is sufficient.

---

## 5. TFS: exclude themes, fonts, and shite

**TFS** is the egress-side twin of the addressing bounds.

- **Input side:** bound what can be named — vectors ≤90, references ≤1 deep.
- **Egress side:** bound what can be varied — **one** color set, **one** font, **no themes**.

TFS is not a taste rule. It is a **closure rule**. It removes an entire axis of variation — appearance — so the design space stays small enough to close.

Consequence: the "at most one dimension per channel" rule holds *because the user cannot add dimensions*. The only dimensions are the ones the system defines. Color and brightness count as **one fixed visual vocabulary**, not a user-facing axis.

Same discipline at both ends of the pipe: **refuse to let either side grow.**

---

## 6. The open egress

Output is **open-ended** by design.

- **One rendered bulk** → linearized to a **base character stream**.
- Each channel adds **at most one** channel-specific dimension:
  - **Terminal** — base + one fixed visual vocabulary (color, brightness).
  - **Speech** — base + prosody (pause, emphasis).
  - **Bare text** — the base. Nothing added.
  - **Braille** — the base, re-timed.
  - **Morse** — the base, re-timed.
  - **The AI** — the base, read raw. A peer viewer, not a sink.
  - **Cephalopod interfaces, etc.** — the base, plus whatever that channel adds.

**A new channel costs a new decoder, not a new renderer.** The cephalopod is not a joke; it is the evidence. The architecture's claim — *new channel, new decoder* — is demonstrated by the plausibility of channels not yet built.

**Bare text is the canonical output.** Every other channel is bare text plus a decoration. **Bare text is the invariant; the channels are variables.**

---

## 7. Gloam is inert

Gloam renders on demand and does nothing otherwise.

- It does **not** poll, watch, or auto-refresh.
- It updates **only** when the user presses **Refresh**.
- On Refresh it **re-reads the file, then re-renders.**

Therefore:

> **The file is the single source of truth. Gloam holds no copy of the content.**

Gloam's only persistent responsibility is *the conversation* — the current set, the vectors, the navigation stack. It holds **no document state**. Its "state" is the last render, and that is reconstructible from the file at any time.

So Gloam is **restartable, stateless about content, and correct by construction.**

### Manual refresh as a synchronization guarantee

The absence of auto-update removes the entire class of *"is the view current?"* problems. The user's action *defines* the state; the system never guesses.

This is **"bound the variable" applied to time.**

---

## 8. The AI as a peer viewer

When you talk to an AI with Gloam beside you, there are not two systems — there is **one artifact and two readers.**

- The AI reads the **raw text** (markdown, including diagram source such as Mermaid).
- You read the **render**.
- Gloam does not feed the AI. Gloam is beside the loop, not in it.

> **The AI is a peer viewer, not a tool.** Because the artifact is text, the AI and the human read the same thing through different decoders — one understands the source, the other the render — with no translation gap between them.

This is not a feature that was added. It is a **consequence of bare text being the invariant.** You get machine readability for free, because the system never left text.

The brief is not the AI's output. **The brief is the shared object of attention** — a file in `briefs/`, versioned, diffable, and re-renderable in Gloam at any time. The collaboration materializes as an artifact that outlives the conversation.

---

## 9. Transport is text, so transport is free

The system is a **bidirectional text transducer**: commands in, rendered text out.

Consequently it works **over SSH, unmodified, bidirectionally**, with no special remote mode.

- Terminal output is bytes in a stream.
- Speech output is text with prosody markers.
- Bare text, Braille, and Morse are the same stream.
- Input comes back over the same channel.

Local and remote are the same case. The AI, Gloam, the repo, and the user need not be co-located — because the artifact is text and the channel is text.

**Transport is text, so transport is free.** This is the same insight as *bare text is the canonical output*, applied to **location** instead of **format**.

---

## 10. What closure produced

The demonstration system closes because every risk is bounded by a rule, not managed by logic:

- Too many documents → cap at ≤90; bisect down.
- Too deep → references cannot nest; clone to reset.
- Lost your place → return restores exactly.
- Screen and speech disagree → one bulk, fanned out.
- Render cost blows up → viewport-bound, not document-bound.
- Stale references → escape returns to the owning context; empty if unqueried.
- Appearance sprawls → **TFS**.
- View goes stale → **manual Refresh**.
- Two readers disagree → **one file, one artifact.**

Not a pile of features — a **closed** design.

---

## 11. Domain generality

Speech-driven design applies to **any** domain, because all interaction reduces to **commands in, encoded output out**.

- **The input side generalizes cleanly.** Every domain is command-shaped. But the hard part reappears in each domain: *what must be nameable here, and how do you bound it?*
- **The output side generalizes conditionally.** It holds where content linearizes, and requires additional design where it doesn't.

The real work in any domain is the same: **find what must be nameable, bound it, and close the design.**

---

## 12. Honest caveats

1. **The simplification is on the design side, not the use side.** A GUI shows its state; speech makes the user *remember* it. Complexity moves from designer to user. A real trade.
2. **It leans on linear content.** The win is largest where content linearizes cleanly. Spatial content resists.
3. **Closure requires the invariant to be findable.** Speech makes it *findable*; it does not make it *easy*. The collaborator does that work.
4. **Directed interaction is stronger than undirected.** "I know what I want, I say it" is well served. "Show me what I might want" needs extra design.
5. **Diagrams are the test case.** Mermaid works because the diagram is itself text — the spatiality lives in one encoding dimension. Where a diagram *can't* be written as text, the thesis is strained.

---

## 13. The principle to carry forward

> **Speech-driven design:** build the spoken core. Treat the visual interface as an optional encoder.

The viewer is the demonstration. The discipline is the contribution. The viewer will be replaced; the discipline should outlive it.

---

## 14. Open questions

- Does the principle hold for *content-heavy* domains, or only navigation-heavy ones?
- Is there a general test for "has this design closed?" — or is closure only visible in hindsight?
- What is the visual UI's proper role once the spoken core exists: projection, debug view, or parallel first-class interface?
- Can "name the invariant, bound the variable" be taught, or only learned by doing?
- Is **speech-driven design** the right name — or does it undersell the claim by sounding like a domain rather than a method?

---

*One canonical text. Every projection bounded. Every boundary doing the work.*