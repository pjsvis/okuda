# Actuator Noise

Actuator noise is noise that is outwith the intent of the sender.

Cybernetics doesn't look at a human body as "broken" or "spastic"; it looks at the whole loop—brain, nerve, muscle, keyboard switch, serial pipe, and terminal renderer—as a **single closed-loop control system**.

When Norbert Wiener and his peers analyzed human-machine systems during and after WWII, they had to solve this exact problem: target-tracking radar operators under artillery fire or pilots with high-G tremors.

In cybernetic and systems engineering terms, what you are calling a "spasm" is treated mathematically:

---

### The Cybernetic Nomenclature

1. **Hunting / Limit Cycle Oscillation**
In feedback control, "hunting" happens when a controller (the nervous system) tries to correct an error but overshoots, correcting in reverse, overshooting again, and entering a rhythmic loop. In neurology, this is an "intention tremor"; in cybernetics, it’s simply **hunting oscillation** or an unstable feedback gain.
2. **Somatic Jitter (or Neuromotor Jitter)**
In signal transmission, jitter is the unwanted, high-frequency variation in the timing of a signal. Calling physical tremors or involuntary twitch pulses **somatic jitter** places the phenomenon right alongside clock jitter in hardware circuits—an expected, high-frequency physical noise floor.
3. **Biological Transients / Stochastic Bursts**
A sudden, involuntary myoclonic jerk or muscle spike is an uncommanded impulse. Control theory treats this as a **transient impulse** or a **stochastic burst** (an unpredictable energy spike outside the operational band).
4. **Channel Noise (Actuator Noise)**
The human hand and the physical keyboard are the *ingress transducers*. When unwanted mechanical strikes occur, cybernetics models them simply as **actuator noise on the ingress channel**. The channel has a high noise-to-signal ratio, and the receiving system's job is not to complain about the noise, but to filter it.

---

### How Cybernetics Deals with It

Cybernetics never asks the human to "calm down" or "stop spasming." The human neuromuscular loop is what it is. Instead, cybernetics manages the noise at the interface boundaries:

* **Bandpass and Low-Pass Filtering (Temporal Domain):**
A low-pass filter passes low-frequency signals (deliberate, steady keystrokes) and attenuates high-frequency signals (fast double-strikes, chatter, tremors). Your $120\text{ ms}$ debounce threshold is literally an **input low-pass filter**.
* **Hysteresis (Threshold Separation):**
Instead of having a single trigger point, systems use hysteresis (a gap between the "on" state and the "off" state) to prevent rapid toggling when an input hovers near the boundary.
* **State Invariance / Idempotence (Logical Domain):**
If a control loop receives three rapid bursts of the same input ($5 \rightarrow 5 \rightarrow 5$), cybernetics dictates that the system should transition to the state on the first pulse and remain invariant on the second and third. This is why mapping repeated inputs (`55`, `77`) to idempotent side effects works so well: the extra energy dissipates without destabilizing the system.
* **Ross Ashby’s Law of Requisite Variety:**
*"Only variety can absorb variety."* If the human input channel produces a wide variety of states (deliberate hits, rapid double-taps, dragging rolls), your input parser must have enough internal states to absorb that noise without collapsing into a panic/error state.

---

### Better Terminology for GLoam

If you want language that matches GLoam’s technical rigor and avoids clinical, patronizing, or archaic labels:

| Common/Clinical Word | Cybernetic / Systems Equivalent | Operational Feel |
| --- | --- | --- |
| **Spasm / Clonus** | **Transient Burst / Somatic Jitter** | Treats the body's movement as ordinary signal noise. |
| **Spasticity / Tremor** | **Actuator Hunting / Ingress Noise** | Places the design focus on the transducer boundary. |
| **Spasm-Safe** | **Jitter-Tolerant / Fault-Tolerant Ingress** | Sounds like an aerospace or mission-critical spec. |
| **Double Tap Filter** | **Low-Pass Channel Filter / Debounce Gate** | Clear, mathematical, and free of medical baggage. |

Calling the architecture **"Jitter-Tolerant Ingress"** or designing for **"Actuator Transients"** accurately reflects what the system actually does: it provides deterministic signal processing over a noisy biological channel.