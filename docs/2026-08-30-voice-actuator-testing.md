# Voice actuator testing — the MacBook Air M4 as sovereign proving ground

> Logged 2026-08-30. Origin: Gemini conversation (foreign draft).
> Status: **reconciled** — scraped same day against the silo's contracts.
> **Scraped:** the phantom fleet (`&now.md`, `&cast.md`), the `register[]`
> array fiction, an invented `b0`–`b10` OKLCH keymap (collides with shipped
> `b` = page-up; the brightness scalar is unbuilt, td-b4bae8), the
> `.voicecommands` export format (flagged below as the load-bearing
> unverified), invented latency figures, and unstated mode assumptions
> (now a Mode column, per the two-keymap reconciliation in
> `docs/2026-08-30-search-conventions.md`). **Kept in full:** the
> stateless-injection architecture, the on-device argument, the
> radiotelephony mapping, the voice. **Routed:** the acoustic parser to
> the speech briefs; touch ambitions to td-dc0126.

Testing speech ingress on the **MacBook Air M4** is an operational
advantage: the hardware that makes voice input completely local,
zero-latency and cloud-free is already on the operator's lap.

## The architecture: stateless keystroke injection

macOS **Voice Control** runs its speech recognition entirely on-device —
no audio leaves the machine, no transcription API sits in the loop. Its
**custom commands** are phrase-matched (not free-dictation): a spoken
phrase fires an action — insert text, press keys, run a Shortcut.

The silo-relevant move: **map the radiotelephony grammar onto native
commands that inject keystrokes.** The terminal running gloam has no idea
voice was involved — it simply sees `1` then `5` arrive in the input
buffer. Per the three-concerns doctrine, the voice layer is a
**compositor**: it writes into the byte stream, and we do not care where
the text comes from. No daemon in this silo's code, no API, no new
grammar inside okuda — the entire input vocabulary (jump buffer,
backstack, picker query) is inherited for free.

```text
   ON-DEVICE M4 ACOUSTIC INGRESS PIPELINE
┌─────────────────────────────────────────────────────────────┐
│ Physical Array:  3-Mic Directional Beamforming + Isolation  │
│ Silicon Engine:  M4 16-Core Neural Engine (On-Device ASR)   │
│ Ingress Layer:   macOS Native Voice Control Custom Commands │
│ Terminal Sink:   Direct Keystroke Injection -> Gloam Keys   │
└─────────────────────────────────────────────────────────────┘
```

## Why the M4 makes this cheap

- **On-device recognition.** Speech processing runs locally on the Neural
  Engine (16-core; Apple rates the M4's ANE at 38 TOPS). The pipeline
  works in airplane mode and off-grid — no Wi-Fi loop, no cloud parse,
  no API round-trip.
- **Hardware beamforming.** The 3-mic array with directional isolation
  filters room reverberation before the parser sees the signal.
- **No custom audio daemon.** We write no background listener and compile
  no whisper model; the OS owns capture and recognition, and hands us
  phrase events.

## The mapping (with Mode — the column the draft forgot)

The two-keymap rule applies to injected keystrokes exactly as to typed
ones: the same payload means different things in the picker and the
reader, so every command declares its mode.

| Spoken command | Injected payload | Mode | Effect |
| :--- | :--- | :--- | :--- |
| `"AMPER alpha"` | `&alpha` + Enter | Picker | filters to the orientation vector, opens it |
| `"AMPER briefs"` | `&briefs` + Enter | Picker | opens the state table |
| `"AMPER next"` | `&next` + Enter | Picker | opens the decision table |
| `"Vector one one"` | `1`, `1` | Reader | jump buffer dereferences token 11 |
| `"Vector one fiver"` | `1`, `5` | Reader | dereferences token 15 (`&next` row 13) |
| `"Vector unwind"` | `u` | Reader | pops the backstack |
| `"Vector to picker"` | Esc-Esc (see keymap) | Reader→Picker | the documented bridge; empty prompt |

*Struck from the draft:* `"Bright Zero".."Bright Ten"` — a keymap that
does not exist and collides with shipped `b` = page-up. Re-propose it to
td-b4bae8 *after* the brightness scalar exists, with non-colliding
phonetics.

## The load-bearing unverified

The draft's mechanism for defining commands — a declarative
`.voicecommands` export/import file — is **unverified**. macOS Voice
Control custom commands are real and configurable (System Settings →
Accessibility → Voice Control → Commands; actions include insert text,
press shortcut, run Shortcut), but no documented file-format import is
known to this silo. If the format exists, the mapping above is a
declarative config; if it doesn't, setup is manual clicks or a Shortcut
wrapper — either way the architecture holds, because the terminal sees
keystrokes regardless. Verify before building; do not build the
verification into a daemon.

## The invariants, honestly stated

- **Distinctive phrases keep false triggers rare** — `"Vector one fiver"`
  is not ambient conversation. ("No false triggers" was the draft's
  claim; rare-and-annoying is the honest bound, and always-on listening
  is a battery/privacy trade the operator accepts at Settings level.)
- **Deterministic execution** — phrase-matched commands fire fixed
  actions; no conversational parsing, no filler, no LLM in the loop.
- **Stateless integration** — the terminal sees keystrokes; the silo's
  input grammar is unchanged; voice is one compositor among several
  (keyboard, touch-deferred td-dc0126, agent).

You lean back, say *"AMPER next... Vector one fiver"*, and the M4 punches
the keys into the terminal. Pure signal, zero lag, job done.

## Where this feeds the silo

- **`BRF-TERMINAL-SPEECH` / `BRF-RESTRICTED-GRAMMAR`** — the
  radiotelephony mapping is the constraint spec the SSML work needs:
  digit-by-digit syllabic separation, the fifteen/fifty ambiguity killed
  at the grammar layer, `[Lead-In] + [Coordinate] + [Actuation]` as the
  cadence sketch.
- **The two-keymap reconciliation** (`docs/2026-08-30-search-conventions.md`)
  — injected keys obey the seam rules like typed ones; the Mode column is
  the enforcement.
- **`td-dc0126`** — the draft's multi-modal reticle (voice + touch + keys)
  waits on SGR mouse for the touch leg; voice via keystroke injection is
  the leg that needs no new transport.
- **ADR-027** — a foreign draft, reconciled against the ledger before
  landing; this document is the pattern's second worked example.
