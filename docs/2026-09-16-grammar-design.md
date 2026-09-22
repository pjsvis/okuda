# **Grammar Design for Context-Driven Speech: System Invariants, Pure State Transitions, and Deixis**

This specification defines the architectural framework for a high-density voice control plane. It moves away from conversational natural language processing (NLP) toward a formal language model optimized for low-latency, deterministic command execution.

# **1\. Operational Thesis: Grammar as the State Transition Function**

The system treats speech not as an open-ended dialogue, but as a formal input to a finite state machine (FSM). By constraining the grammar to a strict domain-specific language (DSL), we achieve structural reliability.

&nbsp;

* **Deterministic State Mapping:** Speech design is executed as a formal state machine. Each valid utterance corresponds to an edge transition between predefined system states.  
* **Elimination of Padding:** The architecture explicitly removes conversational padding (e.g., "Please," "Can you"), wake words, and probabilistic intent guessing. If a token does not exist in the active grammar branch, it does not exist to the system.  
* **Feature Discipline:** Every system capability is mapped to a discrete, unambiguous node. There is no "hidden" functionality or ambiguous overlap between commands.

# **2\. System Invariants vs. Variant Inputs**

The system distinguishes between the persistent state of the environment and the transient nature of spoken commands.

## **Architecture Formula**

`transition(StateInvariant, SpokenVariant) -> NextStateInvariant`

## **State Components**

* **Invariants:** The fixed control plane. This includes the currently focused Silo/Plane, the active ledger file descriptor, the current line/byte cursor offset, and telemetry subscription status. These provide the "memory" of the system.  
* **Variants:** Minimal spoken tokens—strictly verbs, steppers, and modifiers. These act as function inputs that modify the invariants.  
* **Pure Functions:** State transitions are engineered as pure functions. Given the same state and the same spoken variant, the resulting state must be identical. This allows for transition logic to be tested in isolation from audio hardware or ambient noise variables.

# **3\. Deictic Computing: The Half-Spoken Sentence**

The core efficiency of this system relies on **Deixis**: linguistic markers that point to the immediate context to provide meaning.

## **The Janeway Pattern**

Named for the high-efficiency verbal shorthand observed in tactical command environments, this pattern prioritizes semantic density.

&nbsp;

* **Examples:** "Analyze," "More," "Status," "Diff."  
* **Mechanism:** The semantic payload is supplied by the environmental context (the visual canvas or the ledger pointer). "Analyze" does not need an object if a specific data stream is already "Focused" in the Invariant state.

## **Dramatic Design as Systems Engineering**

Narrative efficiency in high-stakes environments mirrors the needs of high-density control planes. By moving from 30-word conversational prompts to single-token actuators, the operator reduces cognitive load and maximizes the bandwidth of the control loop. Context is implied by the system's current state, never explicitly restated by the operator.

# **4\. Formal Grammar Specification & Tree Structure**

The grammar is structured as a tree where the root determines the valid leaf nodes available for subsequent input.

## **Syntax Rules**

* **Root Verbs:** Action primitives (e.g., `Analyze`, `Sync`, `Halt`, `Cast`, `Tail`).  
* **Relative Steppers:** Navigation primitives for moving within a context (e.g., `More`, `Next`, `Back`, `Top`).  
* **Scope/Target Specifiers:** Explicit overrides used only when the operator intends to shift the focus from the default context (e.g., `Silo 2`, `Archive`, `Plane B`).

## **Grammar State Transitions**

| Current State | Valid Tokens | Transition Function | Next State |
| :---- | :---- | :---- | :---- |
| `IDLE` | `Analyze`, `Tail` | `initialize_stream()` | `STREAMING` |
| `STREAMING` | `More`, `Next` | `increment_cursor()` | `STREAMING` |
| `STREAMING` | `Halt` | `terminate_stream()` | `IDLE` |
| `ANY` | `Silo [N]` | `update_context_anchor()` | `CONTEXT_SHIFT` |

## **Non-matching Utterance Handling**

The system employs a **Silent Rejection** policy. If an utterance does not map to the active grammar tree, the system performs a zero-noise drop. No "I'm sorry, I didn't catch that" responses are permitted. This ensures that environmental noise or non-command speech does not pollute the state machine or the operator's auditory environment.

# **5\. Audio Ergonomics: Earcons over Chatter**

To maintain high operator focus, verbal feedback is minimized.

&nbsp;

* **Earcons:** Two-tone chimes or discrete frequencies acknowledge successful state transitions. These provide immediate haptic-like confirmation without occupying the linguistic processing centers of the operator's brain.  
* **TTS Voice Cadence:** Text-to-Speech is reserved exclusively for the output of requested data (e.g., a ledger readout or telemetry update). TTS is never used for control-plane handshakes or confirmations.  
* **Bandwidth Preservation:** By eliminating "chatty" confirmations, the system preserves the operator's auditory bandwidth for critical narrative content and environmental awareness.

&nbsp;