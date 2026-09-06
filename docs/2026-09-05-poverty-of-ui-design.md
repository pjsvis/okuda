# The poverty of UI design — design the actuator, the screen, the channel; let the interface emerge

**Date:** 2026-09-05
**Type:** design note (the root error the session's posture docs circle; the capstone of the shite-filter / motor-map / no-tree-no-outline triad)
**Status:** The "why" under the posture. Design the three things; the interface is what they compose to.

---

## The poverty, said plain

UI design, as a discipline, designs the *wrong thing*. It designs *interfaces* — the surface between the human and the system — when the thing that needs designing is the *actuation grammar, the screen as a rendering surface, and the communication channel between them*. The interface is what you get when those three are designed badly; the interface is the *patch* that covers the gap between a grammar that doesn't communicate and a screen that doesn't render. Design the three well and there is no "interface" to design — there's just a reader, a glass, and a grammar, and the "UI" is whatever emerges from their composition, which is the motor map, which is the shite filter, which is the silcrow. Design the "UI" directly and you get the box-drawer's drawings of boxes — an interface that has to *explain itself* because the underlying grammar, screen, and channel were never specified.

## The three things that should be designed

### The actuator

This is the grammar — what keystrokes mean, what patterns resolve to what actions, how intent becomes an effect. The two-digit chords, the verb region, the silcrow dereference. The actuator is *the contract between the reader's intent and the system's response*. UI design treats this as an afterthought (bind actions to buttons, label the buttons); the silo treats it as the *primary artifact* — everything else serves it, and the "interface" is just wherever the actuator's effects become visible. Design the actuator well and the buttons are obvious; design the buttons and the actuator is whatever the buttons happen to do, which is usually incoherent.

### The screen

This is the rendering surface — not a "view" with "widgets," but a glass that content fills like water in a cup. The frame, the anchor, the wrap, the shite filter's edges. The screen is *the physical contract between the content and the eye*. UI design treats the screen as real estate to be divided into widgets (chrome, panels, toolbars, the box-drawer's boxes); the silo treats it as a *surface the content owns*, and the only question is how much of it the content gets to fill. Design the screen as real estate and you get the toolbar; design it as a surface and you get the okudagram, which is whatever the content is, composed to the glass.

### The communication channel

This is the pipe between the reader's input and the system's output — keystrokes in, plain text out, the filesystem as the message bus. The one-ingress rule (any input translated to keystrokes), the streaming path (plain text to stdout), the write-your-own provision (the file is the contract). The channel is *the contract between the reader's surface and the system's surface*. UI design treats the channel as something the UI mediates (event handlers, component trees, state stores); the silo treats it as a *pipe the UI doesn't touch* — keystrokes in, text out, the grammar in the middle, no UI in the path. Design the channel as mediated and you get a framework; design it as a pipe and you get the one-ingress rule, which admits every surface because the pipe doesn't care what's on either end.

## Why the interface is the hampering abstraction

UI design is used to design *the interface itself* — the layer that sits between the actuator, the screen, and the channel, and *mediates* between them. That layer is the hampering abstraction. It is the thing that prevents emergence, because it *specifies* the relationship between actuator/screen/channel instead of letting the relationship compose. A command palette is a UI that mediates the actuator (it labels the verbs); a toolbar is a UI that mediates the screen (it steals real estate for chrome); a component tree is a UI that mediates the channel (it intercepts the pipe). Each is a *specified* interface that prevents the *emergent* interface — the motor map, the shite filter, the silcrow — from appearing, because the specified interface has already decided where everything goes and what everything means.

The poverty is that UI design's whole subject matter is the *layer that prevents the thing it is trying to design*. Design the actuator/screen/channel and the interface is *good by emergence*; design the interface directly and it is *bad by specification*, because specification is the wrong tool for a thing that should compose.

## The box-drawer, and the i811 pattern, as the same error

This is why the box-drawer shows up with drawings of boxes and nothing works: they have designed the interface (where the boxes go, what they look like) without designing the actuator (what the boxes *do* — which they cannot say, because the actuator was not their concern), the screen (how the boxes compose to the glass — which they cannot say, because they treated the glass as real estate), or the channel (how the boxes communicate — which they cannot say, because they treated the channel as a component tree). The drawings are beautiful and the thing does not work, because the interface was designed and the three things that *make* an interface work were ignored.

The i811 pattern is this error at the accessibility layer — it designs the *accessibility interface* (OSC markers, span trees, semantic modes) instead of the actuator/screen/channel that would *be* accessible by composition. Same error, different halo. The accessibility interface is the hampering abstraction that prevents the accessible interface from emerging — the streaming path that screen readers already read, the grammar that one-switch users already actuate, the plain text that braille displays already display. Design the three well, and accessibility is a property of the composition; design the "accessibility UI" and it is a layer that mediates the three and prevents the property from emerging.

## The capstone

This is the "why" under the session's posture. The search is a shite filter because the actuator (type a query) and the screen (the shelf, then the dive) compose to it; the frame is a shite filter because the actuator (resize/zoom, or `[02]` to slide) and the screen (the glass the content fills) compose to it; the viewer refuses the tree because the screen (content, not real estate) and the channel (the file is the contract) compose to a thing that has no room for a tree. The motor map emerged because the actuator (the two-digit grammar) and the channel (keystrokes in) and the screen (the rendered lines) composed without a UI layer specifying the zones — the hands found the zones because nothing told them where the zones weren't. The silo's whole posture is the refusal to design the interface, and the interface that emerges is better than any interface that could be designed, because it composes from the three things that actually matter.

## The one line

UI design is the discipline of designing the layer that prevents the interface from emerging; the silo designs the actuator, the screen, and the channel, and lets the interface be what it composes to.

## Related

- `docs/2026-09-05-dogfood-silcrow-motor-map.md` — emergence happens when the abstractions don't hamper; the motor map is the dogfooded instance.
- `docs/2026-09-05-search-as-shite-filter.md`, `docs/2026-09-05-frame-as-shite-filter.md`, `docs/2026-09-05-no-tree-no-outline.md` — the three filters, each an emergent interface from actuator + screen + channel.
- `docs/2026-09-05-i811-dual-layer-output.md` — the i811 pattern as the accessibility-layer instance of the same error.
- `docs/2026-09-03-content-over-menu.md` — content over menu; the menu is the mediated interface the silo refuses.
- `docs/2026-08-29-tfs-exclusion-principle.md` — TFS; the hampering abstractions are Themes, Fonts, and Shite, and excluding them is what leaves room for the interface to emerge.
