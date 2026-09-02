# Production brief: the explorer bot — Morse over SSH

> Logged 2026-08-31. Origin: silo-internal, for the script writers.
> Status: **fresh** — a production draft; nothing here is invented. Every
> technical claim is real and verified in the source silo (hashes on
> file); the drama is the only fictional layer, and it is thin, because
> the facts do the work. If a scene requires breaking one of the rules
> below, the rules win — that is what makes the fiction free.

## The scenario

An explorer bot is stranded — asteroid, deep field, your choice. Power
is scarce. The comms window is intermittent. Its luck is bad. The one
thing it still has: an SSH channel back to the ground, and a knowledge
silo it has been maintaining the whole voyage — plain markdown files,
a ledger of its own decisions, debriefs written alone in the dark.

Every so often, it opens the channel and sends an **okudagram**: a
composed status report — plain text, a few kilobytes, rendered as
colour and structure on whatever terminal the ground station points at
it. No client software needed on the far side. The connection is the
only requirement.

## What the ground sees

The operator's terminal fills with the bot's report: headings in
accent colour, tables re-fitted to the glass, a state diagram drawn as
ASCII art, a footer reading *silo · callsign · filename*. The report
is not raw telemetry — it is a **composed page**, structured for a
tired human to scan in seconds. Two digits typed at the prompt jump to
a referenced document; one letter returns.

## The three forms of Morse over SSH

The channel carries bytes. Morse is an encoding of bytes. Three ways
to play it, escalating in drama:

**1. Morse as text.** The bot types dots and dashes — `.... ..` — and
the ground reads them. Trivial, real, and it composes with the report:
the debrief assembles one symbol at a time on screen.

**2. Morse as timing.** The better form. The bot sends characters at
intervals — short gap, long gap — and *the gaps are the encoding*.
The ground's decoder measures inter-arrival timing. No Morse software
shown, no explanation needed: the rhythm arrives live in the glass,
and the audience reads it with the operator, because dots and dashes
are the one code every viewer already half-knows.

**3. Morse as the visible channel.** The ground operator watches the
terminal fill: dot, dash, gap — the okudagram of the link itself
assembling on screen. The bot's keepalive traffic *is* the message:
packet, silence, packet. Traffic timing, normally a security
vulnerability, promoted to protocol.

## The engineering, honestly

- **SSH gives encryption, authentication, and integrity for free.** The
  Morse is private, authenticated, and tamper-checked — more than
  1844 Morse ever had.
- **Morse tolerates latency.** It is timing-*relative*: the decoder
  measures intervals, and intervals survive slow or bursty links. The
  bot transmits inside its power window; the ground decodes at leisure.
- **Pacing discipline on the sender** is the one real constraint: gap
  lengths carry the meaning, so the sender must hold its rhythm.
- **The fallback ladder is doctrine:** keyboard when you have hands;
  voice when you have privacy; rhythm when all you have is a knuckle
  and a surface. The last channel standing should be the one that
  needs nothing but a surface and a rhythm.

## The dunt

Before any of it: the **dunt** — the percussive attention signal,
inherited from every radio and television operator who ever fixed a
device with a slap. Give the device a dunt; if that fails, a good
dunt. The level is the urgency: light slap to arm it, solid thump for
full attention. In the device world the dunt is measured in *time*
rather than force — sharp or protracted, meaning in the spacing — and
a dunt detector plus an interval decoder is Morse code: the oldest
attention-gated, sender-and-receiver-only protocol on record. The dunt
could come from anywhere: desk, lid, bezel, hull.

## Dialogue that is load-bearing

Lines the writers can lift directly — each one is a real convention in
the source silo:

- *"Roger your Roger."* — the double-token acknowledgment: first Roger
  receives, second Roger confirms and locks. Attributed to Fleet Air
  Arm radio procedure by hearsay; claimed by the operator.
- *"Vector one fiver."* — the jump command: number 15, spoken in
  radiotelephony so that "fifteen" can never be mistaken for "fifty."
- *"On screen now."* — the composed page is present; reading may begin.
- *"Give it a good dunt."* — escalate the attention signal.

## The rules the fiction must keep

1. The corpus is plain markdown. If a scene needs a proprietary format,
   the scene is wrong.
2. The bot's reports are *composed for the reader* — never raw dumps.
   The composing is the respect.
3. The last channel standing is the slowest, simplest one. That is not
   a failure state; that is the qualification.
4. Nothing is invented. The moment a scene requires breaking a rule
   above, write the scene about the broken rule — that scene is better.

## The degradation ladder — the Keith Richards Principle

Comms resilience as a hero's journey: the channel will be degraded by
calamities in escalating order, and at every stage the silo keeps
performing. The invariant that makes the ladder a ladder and not a
collapse: **degradation strips presentation, never content.** The
payload is plain markdown; the glass is negotiable. The principle is
named for the man who outlived every plane, every decade, and one
Fijian coconut tree: still performing, still the same set.

**1. The ordinary world — wifi.** Full okudagram: colour, diagrams,
role-fit tables, instant. Nothing to overcome.

**2. The wifi dies.** SSH over cellular. Bandwidth shrinks; the
okudagram is kilobytes, so nothing changes. The glass is smaller and
farther away; the composition holds.

**3. Congestion.** The window throttles to a trickle. The okudagram
strips to plain text — NO_COLOR parity, the composition degrades to
monospace, the content arrives intact. Less glow, same truth.

**4. The network is gone.** No infrastructure at all: the silo runs
locally — airplane mode, the iPad demo thesis. The channel is now
sneakernet: carry the files. Paper enters the ladder (`okuda docs/x.md
| lp`), and the debrief can be read by candlelight.

**5. The device dies.** The binary is one file, the corpus is flat
markdown, and the printer speaks plain text: the ledger survives on
paper — braille embossed, large-print, ink. The Vindolanda tablets are
the precedent: docket on a flat surface, legible two millennia later.

**6. The paper is gone.** Fire, flood, confiscation — but the ledger
was *pushed*: origin has it, wherever origin is. And if origin is gone
too, the callsigns and the grammar are in the operator's head — the
format is simple enough to re-derive from memory. The debriefs say
what was known.

**7. The abyss — the last channel is one bit.** Rhythm: dunt-stream,
Morse, tap-code. Five dunts is five. The slowest, simplest, unkillable
channel — the one that needs nothing but a surface, a knuckle, and
patience. The whole corpus can pass through one bit and a clock.

**8. The return.** The channel recovers, and everything degraded
*recovers with it* — colour, diagrams, composition, the full glass —
because nothing was lost: the degradation stripped presentation only,
and presentation re-renders from content. The ledger is the same
ledger. The hero returns to the ordinary world, which never stopped
being readable.

**The principle, stated:** every calamity removes a channel; no
calamity removes the content. The ladder is also the accessibility
ladder run backwards — screen, TTS, braille, paper — because disaster
and disability are the same shape: fewer channels, same content, and
the design was built for both.

## The relay — the message changes form, never content

The escalation, played as a chain: the bot's message hops through
receivers and senders, each relay re-encoding into whatever mode the
current constraint allows — and every hop ends with a roger. This is
store-and-forward relaying, the pattern real deep-space missions use
(the Mars rovers reach Earth by way of orbiters: stored, forwarded,
acknowledged).

The postman game — the telephone-chain party game where the message
degrades into comedy — fails for one reason: **nobody writes it
down.** Each hop is lossy speech-to-memory-to-speech. The silo chain
cannot play that game, because at every hop the message is *deposited*
into the relay's own registers before re-encoding: written, verified,
rogered, then forwarded in the next mode. Each relay re-derives from
its own written record, never from memory. Degradation is impossible
when every postman keeps a copy.

The beats:

1. **The bot → station A, wifi.** The okudagram arrives; station A
   reconciles it into its ledger. *"Roger your Roger."*
2. **Station A → station B, radiotelephony.** A's wifi dies; the
   message is spoken in command cadence — vector numbers, pause, key
   facts. B copies by ear into its own ledger, reads it back. *Roger.*
3. **Station B → relay C, dunt-Morse.** The radio dies; B taps the
   hull — rhythm, spaced, the decoder at C clicking along. C writes,
   confirms, *rogers*.
4. **Relay C → ground, paper.** C's device dies; the message prints,
   and is *carried* — sneakernet, the oldest relay. The ground station
   scans it, reconciles it into `main`, *rogers*.
5. **The return.** The ground sends the acknowledgment *back up the
   chain* — each relay passing the roger in its own mode, until the
   bot, watching its last pane, receives the two words its grammar
   was built for: *"Roger your Roger."*

The dramatic engine: the audience watches the message change *form*
five times — colour, voice, rhythm, paper, ledger — while the tension
is whether it survives the hops. The payoff: it was never at risk,
because every postman kept a copy, and the last hop's roger is the
first hop's message, byte-faithful, coming home.

**The principle:** the mode is negotiable at every hop; the content is
not. A chain of relays that write things down cannot lose a message —
and a chain where every hop ends in a roger is not a telephone game.
It is a ledger, distributed.

## Where the real thing lives

The silo this brief came from: `pjsvis/okuda` — a terminal markdown
renderer (one binary, no runtime, no cloud) and its knowledge ledger.
The mangle demo (`docs/2026-08-31-mangle-demo.md`) verifies every trick
referenced above; the ledger audit
(`docs/2026-08-31-the-ledger-is-the-work.md`) documents the day this
brief's facts were established. The debrief the bot pushed in the
scene? Same format as `debriefs/` — and it would be reconciled,
on arrival, by the same process that checked this one.
