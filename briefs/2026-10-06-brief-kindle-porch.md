---
type: Brief
callsign: BRF-KINDLE-PORCH
---

# Brief: The Kindle porch — the silo on an e-ink glass, over ssh, nothing on the device

**Date:** 2026-10-06
**Status:** Open

## Context

the operator has a Kindle and named it the first glass: *"we have a Kindle so that would be a good place to start, then we could look at an art frame."* The assessment that precedes this — why e-ink fits the reading path and not the TUI, and why okuda cannot run on the device — is `docs/2026-10-06-the-eink-frame-is-a-second-host.md`. This brief is the landing.

## Objective

Read a document from this silo on the Kindle, rendered and paginated by okuda
on a host and painted by the device, with **nothing of okuda's installed on the
device** — and record what the glass costs the reader (refresh cadence, what
the text lost at that width, how a page turns).

The deliverable is a porch-matrix row with evidence, not a product.

## The shape, in one line

`host: okuda <file> --no-color --width <cols> → page → ssh → fbink → panel` —
the host renders and paginates, the panel paints, and okuda never learns what
glass it is on (ADR-WIRE-BUDGET-028: text over the wire, never ANSI frames).

## Preconditions — verify before anything is installed

1. **Read the firmware version — in Airplane Mode.** `Settings → Device
   Options → Device Info`. **Turn Airplane Mode on first**: the community
   wiki's standing alert is that Amazon's `5.18.1.1.1` update exists to
   close these exploits permanently, and a Kindle on WiFi can take it
   overnight. The window is free to keep open and expensive to lose.
   *Reported by kindlemodding.org and the MobileRead community, mid-2026;
   verify at the device.*
2. **Gate the route on that number** (device: **Paperwhite 11th gen, PW5**,
   6.8", 1236×1648 — identified by the operator 2026-10-05):

   | Firmware | Route | State |
   |---|---|---|
   | ≤ 5.16.2.1.1 | LanguageBreak (legacy) | superseded |
   | 5.16.4 – 5.18.0 | WinterBreak (Mesquito) | works |
   | **5.16.4 – 5.18.6** | **Nosebleed** — the current standard, and it covers PW5 | **preferred** |
   | 5.18.1 – 5.18.5.0.1 | AdBreak (ad-supported devices only) | narrow |
   | 5.18.1.1.1, 5.19.x and later | none known | **park** |

   If the device is on the lockout line, the brief parks with the number
   recorded — that is a result, not a failure, and it settles the art-frame
   question cheaply too.
3. **Confirm the host end.** A machine on the same network (or the USB
   gadget) that can run this repo's binary. ADR-SSH-SERVING-013's reading
   room is the precedent shape, and `BRF-SSH-HOST` is *not* a prerequisite:
   a LAN address or the USB-net link is enough.
4. **The prerequisite chain, once jailbroken:** KUAL + MRPI (the launcher
   and its package installer), then USBNetwork for root SSH — the device
   lands on `192.168.15.244`, the host takes `192.168.15.201`, and
   `~/.ssh/id_rsa_kindle` must be **RSA** because the old dropbear does not
   speak ed25519. That chain is the same one `kinduino` documents for every
   model, and it also carries an `fbink` at `/mnt/us/usbnet/bin/fbink` (the
   newer layout uses `/mnt/us/libkh/bin/fbink`).

## The transport: the host drives, the panel paints

The device has no physical keyboard, and okuda cannot run on it — so the two
viable shapes are both **host-driven**, and the first is much the better fit:

- **Sink first (the brief's plan).** `okuda <file> --no-color --width <cols>`
  on the host is the payload: no hue, wrapped to the glass, paginated and
  painted by FBInk over ssh. **Nothing of ours runs on the Kindle.**

  `--width` did not exist before this brief — the reading path took its width
  from the terminal (`src/width.ts:308`), and a panel is not a terminal: no
  columns, no winsize, no `tput`. It is now a flag (`src/cli.ts`), tested in
  `tests/width-flag.test.ts`, and it is the *only* okuda-side change the sink
  route needs. It also serves every future non-terminal glass — a PNG
  pipeline, a pager writing a fixed page — so it is not Kindle-shaped.

  **One escape caveat, found while writing the test:** `--no-color` removes
  every *hue* and keeps bold and italic, deliberately (a standalone SGR 1 is
  load-bearing, which is why bold outlives NO_COLOR). FBInk would paint those
  escapes as literal characters. So the pager strips SGR on the host before
  painting — one `sed`, honest and local — or the plain dial lands first.
  **That is the second consumer named for `--plain`** (the first was the
  voice: `say` reads 28 bold escapes as noise): the item is no longer one
  consumer's convenience, and its gate should be read again with both.
- **Terminal client second (a bonus, not the goal).** A terminal emulator on
  the device over ssh (the `inkvt` lineage, built on FBInk) gives live
  scrolling — at the cost of typing on a touch keyboard. Worth one probe at
  M3 if the sink proves good.

**On-device page-turning is deliberately not in v1.** FBInk has an input API
(`INPUT=1`, `fbink_input_scan`, e.g. `kinduino`'s and the pointer-trail
examples), so a tap-to-page listener is buildable — but v1 pages from the
host, and the listener is a stretch goal that unblocks nothing else.

## Prior art worth reading before touching the device

- **`kindle-dashboard`** (2026-07, Oasis 3 on 5.18.2) — the status island,
  already built: FBInk + KUAL, Upstart autostart, wake/screensaver lifecycle
  handling, GC16/GL16 refresh policy, and an optional **read-only LAN data
  snapshot** with a documented protocol. This is the closest thing to
  `just island` on a wall that exists.
- **`kindle-eink-monitor`** (2026-02, Kindle 4) — the endpoint shape: capture
  a host display, convert to grey, stream to `/dev/fb0` over USB-net SSH at
  3–5 FPS. Proof the transport works and that e-ink cadence is the limit, not
  the link.
- **`InkBrief`** (2026-08, Kindle 11th gen KT5 on 5.19.2.0.1) — the image
  sink: the host renders pages, the device shows them, with a visible HOME
  target and a failsafe. Also the reminder that a model/ firmware guard in
  the installer is the honest design.
- **`kinduino`** (best-effort-labs) — the prerequisite chain, plus one hazard
  worth knowing before we stop the framework repeatedly: the Kindle's own
  reboot-loop guard can raise **"Repair Needed"**, and the fix is over
  ssh — remove `/var/local/system/.framework_reboots` and
  `.framework_retries`, then restart the framework. **Do not reboot**: a
  reboot drops usbnet and takes the ssh away with it.

## Milestones

- **M0 — the version, and the gate.** *Model identified 2026-10-05: Kindle
  Paperwhite 11th gen (PW5).* Remaining: the firmware number, read in
  Airplane Mode, mapped through the table above into a route
  (Nosebleed / AdBreak / park). Record the number either way. **Cost: five
  minutes.** If the device is on the lockout line, park the brief with the
  finding.
- **M1 — a shell on the glass, by hand.** The jailbreak, then KUAL + MRPI,
  then USBNetwork; the milestone is `ssh root@192.168.15.244` answering with
  an `uname -a`. Nothing okuda-side is involved, and this is the step most
  likely to refuse. Stop and report rather than escalating the install.
- **M2 — one document, by hand.** From the host:
  `okuda <file> --no-color --width <cols>` paginated to the panel and painted
  with FBInk. Read a real silo document — a long one, with tables, a mermaid
  fence and a sized heading. Note: the column count that a readable font
  actually yields, the line height, how long a full repaint takes, whether a
  partial refresh ghosts, and the page-turn cadence from the host.
- **M3 — the verdict, recorded.** Add the row to
  `docs/2026-10-06-the-eink-frame-is-a-second-host.md` §7 and to the porch
  matrix: what this glass cannot do, what it cost, and whether the art frame
  is now worth buying. Optional probe, only if the sink read well: an
  on-device terminal emulator, and tap-to-page via FBInk's input API.

## Acceptance criteria

- A document from this silo, read on the Kindle, with the command that produced
  it recorded verbatim.
- **Nothing of okuda's installed on the device.** If a step tries to put a
  renderer on the Kindle, that is the design failing, not the device.
- The measured facts, not impressions: the column count a readable font yields,
  full-repaint time, partial-refresh ghosting, and the failures.
- If the route does not exist for this firmware, the brief parks with the model,
  the firmware and the reason — no workaround invented at the keyboard, and
  **no firmware downgrade attempted**: stuffing an old `.bin` onto a device to
  re-open a patched window is a bricking route, not a plan.

## Out of scope

- **Running okuda on the Kindle.** It cannot: Bun needs a modern kernel and
  libc, and the Kindle is old ARM Linux.
- **The TUI on e-ink.** The verdict is already reached
  (`docs/2026-10-06-the-eink-frame-is-a-second-host.md` §3): streaming canvas
  only. Re-open only if the glass contradicts it.
- **The e-ink colour target** (1-bit / few-grey palette mode). Proposed in §6 of
  that document, triggered *only* if the glass renders okuda's output badly. The
  first probe is a pair of eyes, not a renderer change.
- **Buying anything.** The art frame waits on this verdict, and the frame is its
  own brief.
- **Jailbreak support.** The device is the operator's; the brief does not
  maintain a firmware hack, it records whether one was needed.

## Conflicts / dependencies

- Rides on `BRF-PORCH-MATRIX` (the matrix this row joins) and ADR-SSH-SERVING-013 (the ssh
  reading-room shape). Depends on `DEPENDENCIES.md` in one direction only: the
  *host* must run the binary, so the Kindle adds no row to that ledger.
- The Kindle's sleep/wake behaviour may make it a poor *status island* even if
  it is a good reader — that finding belongs to the art-frame decision, and is
  worth noting at M3 whichever way it falls.
