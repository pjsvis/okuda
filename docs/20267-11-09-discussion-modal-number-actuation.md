# **Discussion: Modal Number Actuation & The Perceptual State Machine**

## notes

> use # and ; as mode change keys (dogfood it, > looks good too)

> we already use slash and it does pretty much what Glow's slash does

> do we want a shift key to change modes or a special key or is ; enough or too accessible

> dogfood it, and try with the commands on the other side

> state chart for each screen and one for the whole app

> figure out how to incorporate modes into current actuator grammar

> our double tap and two key silcrows are valuable

> a command mode is something totally separate

> we need a state machine for our app TUI

## **1. Executive Thesis**

The modern GUI reactivity stack (virtual trees, reactive signals, compiler caches, asynchronous fibers) incurs massive accidental complexity to reconcile stateful DOM realities with top-down declarations. By shifting the paradigm back to a pure terminal/console architecture, we bypass these failure modes:

* **The user is the lifecycle**: The machine remains idle until explicitly prompted.
* **Sub-perceptual execution**: Transitions operate within human perceptual latency (\<16ms), rendering asynchronous scheduling and complex reconciliation redundant.
* **Pure functional state**: State is modeled strictly as parameters to pure functions, emitting declarative Markdown and immediate side effects.

## **2. Purity & The Inverted Reactivity Loop**

### **The Classical Illusion**

The classical paradigm of `UI = f(state)` in the browser collapsed under the weight of stateful DOM nodes, ordering constraints, stale closures, and intricate dependency arrays.

### **The Perceptual State Machine**

We replace implicit browser synchronization with a deterministic transition model:

`Event x State --> NextState x [SideEffects]`

* **Zero Ambient Scope**: No hidden variable captures occur; parameters hoist cleanly to function boundaries.
* **Universal IR**: Markdown serves as the single source of truth for display output, parsed and flushed in contiguous terminal writes.

## **3. Modal Number Actuation (The HomeRow Inversion)**

### **Critique of Spatial Alpha Labels**

Tools like HomeRow solve 2D spatial coordinate explosion using multi-character alpha strings (e.g., `AS`, `JK`, `FJD`).

In structured CLI workflows, this introduces cognitive friction, spatial ambiguity, and keyboard layout collisions.

### **Deterministic Number Register**

| Dimension | Multi-Character Alpha (HomeRow) | Modal Number Actuation |
| :---- | :---- | :---- |
| **Addressing Space** | Dynamic 2D spatial overlays | Bounded discrete contexts `[1..9]` |
| **Actuation Latency** | Non-zero debounce / buffer delay | Zero debounce latency (single keypress) |
| **Spatial Permanence** | Variable strings mapped per frame | Fixed index bindings (e.g., `1` is always primary) |
| **Visual Overhead** | Persistent or complex overlays | Mode-triggered ephemeral chrome |

* **Single-Digit Actuation**: Immediate dispatch with zero buffering or character timeouts.
* **Positional Permanence**: Index `1` reliably maps to the dominant contextual action across modes.
* **Ephemeral Chrome**: Badges trigger exclusively on mode switch, eliminating visual noise during normal reading and editing phases.

## **4. Next Steps & Implementation Rules**

* Define formal command budget schemas for horizontal sub-modes.
* Prototype pure transition reducer: `(Key, ModeState) -> (NextModeState, SideEffect)`.
* Establish benchmark suite verifying transition latency remains sub-perceptual (\<16ms).
