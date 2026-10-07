---
date: 2026-10-06
kind: assessment — external hardware classes (e-ink frames with terminals, e-ink text sinks, image art frames) measured against the reading path's host contract; a verdict per glass, and the Kindle named as the first one
lineage: the operator's question, 2026-10-05 — *"anything like an art frame that has a terminal"* — and the sequencing that followed, *"we have a Kindle so that would be a good place to start, then we could look at an art frame"*. Rides on BRF-PORCH-MATRIX (per-glass verdicts), ADR-SSH-SERVING-013 (the ssh reading room), ADR-WIRE-BUDGET-028 (the wire is the budget), and `docs/2026-10-02-the-browser-terminal-is-a-second-host.md` (the host-contract measurement this repeats on a larger corpus)
status: open — the Kindle is the first glass (BRF-KINDLE-PORCH); the art frame waits on its verdict.
---

# The e-ink frame is a second host, and the contract is the whole cost

> ◆ Across **427 tracked documents** the reading path emits **5,420,614 bytes**
> carrying **149,123 SGR sequences** and **not one byte of cursor control** —
> zero non-SGR CSI, zero OSC, no private modes. Of the SGR forms, **58,301 are
> foreground truecolour and 8,619 background**; bold appears **117** times,
> strikethrough **48**, underline and inverse **zero**. Re-measured 2026-10-06 on
> the current binary (`FORCE_COLOR=1`, every tracked `.md`, streaming path only).
> The earlier note measured 400 documents and found the same shape: 5,343,448
> bytes, 149,853 SGR, 36 distinct forms, no cursor control.

That one line is why e-ink is worth talking about at all. The reading path's
entire demand on a host is *colour, bold, strikethrough* — and nothing
positional. On a 1-bit or 16-grey panel the colour dies and what survives is
bold, strikethrough, indentation and the layout, which is exactly the half
e-ink can show. A display that cannot repaint quickly is still a fine
*reader*; it is a bad *control plane*.

## 1. Three classes of "frame", and what each costs okuda

| Class | What it is | Examples | What okuda needs |
|---|---|---|---|
| **A — the frame runs a terminal** | a computer behind the panel; a terminal emulator owns the glass | Paper-TTY (Waveshare 9.7" IT8951 on a Pi, Rust, runs a full terminal and a Sway session); reMarkable Paper Pro + `paperterm`/`remagic` (`alacritty_terminal` core, qtfb, pixel-wise partial updates); Kindle/Kobo/PocketBook through FBInk; Android e-ink (Boox, Daylight) via Termux; e-ink monitors over HDMI (Onyx Mira, Modos Paper) | **nothing** — the emulator owns colour→ink mapping, which is the host's job |
| **B — the frame is a text sink** | the host sends *rows of text*; the panel draws them | XTeInk X4 + a tmux bridge (56×28 cells, JSON frames over WiFi, partial refresh per changed line band, box-drawing downgraded to ASCII); TRMNL-class dashboards (image-driven, plugin model) | **nothing** — ADR-WIRE-BUDGET-028 already: text over the wire, never ANSI frames |
| **C — the frame is image-only** | pixels in, art out | FrameLab / Pimoroni Inky Impression 7-colour; `einkframe`; Waveshare PhotoPainter | a rasteriser (`ansi → PNG`) — which is **compositing**, and by the three-owners test it belongs outside okuda |

The asymmetry is the finding: **the two classes we could use today cost zero
okuda code, and the one class that would cost code is the one we shouldn't
build.**

## 2. The hard constraint that decides the order

**okuda cannot run on a Kindle.** It is a compiled Bun binary: modern kernel
and libc, and the artifact in this repo is macOS arm64. A jailbroken Kindle is
an old ARM Linux with an old glibc, and there is no Bun build for it. So the
Kindle is a **client or a sink, never a host** — which puts it in the same shape
as the ssh reading room (ADR-SSH-SERVING-013): the silo lives on a machine that can run
okuda, and the glass is a surface.

That is not a compromise, it is the architecture stating itself: *rendering is
ours, the glass is the host's, and the wire carries text.* The Kindle is a
porch, not a silo.

## 3. Why the reading path fits and the TUI does not

- The reading path emits 0 bytes of cursor control across 427 documents, so a
  text sink is byte-compatible with it *by construction*. Strip the SGR and a
  document is rows of text — which is what class B frames accept.
- The TUI is the opposite: alternate screen, raw mode, cursor addressing,
  SIGWINCH, a keystroke loop. E-ink refresh is ~1.7 s full and visibly slow even
  for partials, so the control plane buys nothing and costs the reader its
  page-turn cadence.
- **Verdict: the glass gets the streaming canvas (`okuda doc.md`), never
  `--tui`.** The same verdict the browser terminal earned, for a different
  physical reason.

## 4. The Kindle, as the first glass

Why it is the right first move: it is already owned, its ecosystem is the
mature one (FBInk is the *library* for exactly this — printing text to an e-ink
Linux framebuffer, with Kindle support from the K2 forward — and `inkvt` is a
terminal emulator built on it; KOReader and the KUAL extension ecosystem are how
these get installed), and it converges on the shape already built: ssh to a host
that runs okuda, over the plain `okuda <file>` path.

The silo's device is a **Paperwhite 11th gen (PW5)**, 6.8", 1236×1648. Two
facts decide whether it becomes a glass at all, and neither is about okuda:

- **The firmware number is the gate.** The community jailbreak for this
generation is *Nosebleed* (5.16.4 – 5.18.6, and it names the PW5); *AdBreak*
and *WinterBreak* cover narrower windows below it, and **5.18.1.1.1 and
5.19.x are closed** — the standing advice is to go into Airplane Mode *before*
reading the version, because the patch ships as an ordinary update. A Kindle
that has been online recently may already be past the door.
- **The transport is host-driven either way**, because okuda cannot run on the
device and the device has no physical keyboard. So the payload is
`okuda <file> --no-color --width <cols>` — the existing plain path, wrapped to
the glass — paginated and painted by FBInk over ssh. **The colour question
never arises on this glass**, which makes the Kindle the cheapest possible test
of the whole e-ink idea: if a document reads well as `--no-color` text on a
slow panel, the frame is worth buying; if it does not, nothing else would have
saved it.

Precedent worth knowing: `kindle-dashboard` (2026-07) is the always-on status
island already built on this exact stack, and accepts a read-only LAN snapshot;
`kindle-eink-monitor` streams a host display to `/dev/fb0` over USB-net at
3–5 FPS; `InkBrief` is the image-sink shape with a model/firmware guard in its
installer. The route and its hazards are in
`briefs/2026-10-06-brief-kindle-porch.md`.

## 5. The art frame, and its trigger

A frame is the better *object* — a wall-mounted silo state board is the
`just island` idea with a body, and e-ink's property of holding an image with no
power is exactly right for a state board that changes rarely. But it is the
same work as the Kindle and a purchase on top, so it waits on one thing:

> **The art frame is worth buying once the Kindle has answered whether reading
> a document on an e-ink surface is good, and once `just island` has something
> the wall would actually want to show.** If the answer to either is no, the
> frame is decoration — and this repo already has a rule about decoration.

A colour e-ink frame carries a further honest note: ACeP panels are
black/white/red/yellow/blue/green. **The Dracula palette can never appear on
one.** Any such frame needs a role→7-ink mapping, which is the palette audit
(`BRF-PALETTE-AUDIT`) with a different output space.

## 6. The one okuda-side artefact — proposed, not built

An **e-ink colour target**: a third mode beside `truecolor` and `none`, mapping
the palette roles onto 1-bit or a few greys (bold surviving as weight, the role
hierarchy surviving as ink). It is rendering — bytes out, so it is ours — and it
is useful beyond this: the speech seam already wants a `--plain` dial, and the
palette audit would gain the question every e-ink host asks and no terminal
emulator answers for you (*what does this palette look like as four greys?*).

**Trigger: build it only if a glass in hand renders okuda's output badly.** The
host owns colour→ink; if the emulator's own quantisation is good enough, this is
a solution to a problem that does not exist, and the first probe is to look at
the glass rather than to write the mode.

## 7. What each glass cannot do (the porch-matrix row)

| Glass | Cannot |
|---|---|
| Kindle + e-ink terminal emulator | run okuda locally (no Bun); drive the TUI usefully (refresh); show the palette (greyscale) |
| Kindle + text sink (FBInk over ssh) | show colour at all; show anything needing cursor addressing; turn its own pages in v1 (the host drives) |
| Terminal-on-a-Pi frame (Paper-TTY shape) | be cheap, or be quiet about being a computer on your wall |
| Colour e-ink art frame | show the palette; render markdown without an external rasteriser (compositing, not ours) |
| E-ink monitor over HDMI | be framed convincingly; cost less than the Pi it needs |

## 8. Honest unknowns (marked, not shading in the blank)

- Current pricing and availability for every class C panel — not checked.
- Which Kindle this silo owns, its firmware, and therefore its jailbreak route:
  **model answered 2026-10-05 (Paperwhite 11th gen, PW5); the firmware number
  is the operator's to read, in Airplane Mode, and it decides everything.**
- Whether a Kindle terminal emulator handles SGR 1/9 (bold, strikethrough) and
  a 63-column reflow well. That is a measurement on the glass, not a reading.
  (Moot on the sink route: `--no-color` means the panel never sees an SGR.)
- Whether the ssh route needs a host on the same network as the Kindle, and what
  the wake/sleep behaviour costs in practice.
