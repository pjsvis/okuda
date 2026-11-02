---
date: 2026-10-02
kind: assessment — an external capability measured against the host contract; a refusal, with the cost enumerated
lineage: the reader's question about wterm.dev, 2026-10-02 — "it is interesting ... is there anything we can use it for" — and the reader's own verdict the same morning, "we achieve all of that in the terminal, and the terminal is just another surface on the desktop ... a lot of mucking about required to get Gloam running effectively in the web browser terminal". Written against the binary at bef36e9 and 400 tracked documents.
status: closed for okuda — nothing to build. One question handed back to BRF-PORCH-MATRIX.
---

# The browser terminal is a second host, and the contract is the whole cost

> ◆ Across 400 tracked documents the reading path emits **5,343,448 bytes** carrying
> **149,853 SGR sequences** and **not one byte of cursor control** — no private modes,
> no cursor CSI, no OSC. That one-line contract is why the same bytes survive `cat`, a pipe,
> an agent, SSH and a gopher feed. The TUI adds six obligations on top, and those six
> are the whole of what a browser terminal would have to rebuild before Gloam could be
> effective inside it.

## The claim, at its strongest

`wterm.dev` is a terminal emulator that renders to the DOM. Its own pitch is the
argument, and it is worth stating in its own words:

> renders to the DOM — native text selection, copy/paste, find, and accessibility
> come for free.

Four capabilities, named as free, in a medium where the reader already expects them.
The four are real. The question this note answers is whether the **medium** is what
supplies them — because if it is not, then a browser terminal is not a new capability
but a second implementation of one we already have.

The attraction is also worth naming plainly, because the reader named it plainly: the
project looks interesting **because it is in a web browser**. That is the whole of the
appeal, and it is an aesthetic appeal rather than a functional one. Nothing in this
silo is blocked by the absence of a browser.

## What the reading path actually requires of a host

Measured from the emitted bytes across the whole silo — every tracked document
rendered, every escape sequence in the output classified. Not from prose, and not
from the renderer's source:

- **24-bit colour, and only colour.** 58,385 foreground and 8,085 background
  truecolour sequences, out of 149,853 SGR sequences and 36 distinct forms.
- **Bold and strikethrough**, at 109 and 61. Bold is load-bearing: `roleBold` emits a
  standalone SGR 1, which is why bold survives `--no-color` and the voice keeps it.
- **Nothing else.** Zero DEC private modes, zero cursor or erase CSI, zero OSC of any
  kind — across all 400 documents and 5.3 MB of output.

That is the entire host contract of the reading path. It is the smallest contract a
renderer can have and still carry the palettes, and it is why okuda's output is
portable by construction rather than by effort.

## What the TUI adds, and what a browser terminal would rebuild

The interactive path is where the contract grows. Every row is an obligation on the
host, and every one of them is already discharged by a native terminal:

| Mode | What it buys | Where |
|------|--------------|-------|
| `2026h` / `2026l` | atomic frames | `src/tui.ts:411` |
| `1049h` / `1049l` | alternate screen | `src/tui.ts:739` |
| `25l` / `25h` | cursor hidden | `src/tui.ts:741` |
| `1007h` / `1007l` | wheel sends arrows | `src/tui.ts:834` |
| `2J` then `H` | clear, then home | `src/tui.ts:1010` |
| `row;1H` | absolute row address | `src/tui.ts:1024` |
| 24-bit SGR | the palettes | `ansi.ts` |
| winsize not zero | the true column count | `DEPENDENCIES.md:109` |

The last row is the one that looks trivial and is not. `bun build --compile` reports
`columns = 0` on some terminals, so okuda carries a `tput` fallback that reads the
winsize by ioctl instead — and `DEPENDENCIES.md:197` already asks for width detection
to be re-verified on every Bun major bump, **on more than one terminal emulator**.
That row is a live defect class with a measured history, and a browser terminal puts
a WebSocket, a PTY backend and a JS runtime between okuda and the answer.

## The input contract is the harder half

Output is the easy direction. The two-digit grammar is a contract on the **host's**
keystroke delivery, and it is not small: 7 bound tokens, 87 vector addresses across
`12..98`, 7 reserved pocket pairs that must be acknowledged and do nothing, plus four
arrow sequences, two page sequences, the `]]` and `[[` section motions, and a paste of
`12` that must arrive as two presses rather than one swallowed byte
(`src/keygrammar.ts:38`, `:68`). A browser terminal that merely **displays** bytes is not
effective for Gloam; it has to be faithful in both directions.

## The finding

◆ The DOM does not **give** selection, clipboard, find or accessibility. It
**re-implements** them in JavaScript, and it can only do so by discarding the host
that already had them.

That inversion is the whole answer. Selection, clipboard and find are supplied by
whatever terminal okuda is running in, because okuda emits plain bytes into a standard
grid; find is additionally supplied by gloam and ADR-030's live search; and
accessibility is the ladder in `explainers/accessibility.md`, with the honest negative
claim in `docs/2026-09-06-protocol-free-text-identity.md:68-92` — "the fit with
assistive technology is the absence of barriers, not engineering effort". wterm's
feature list is not a list of things okuda lacks. It is a list of things a browser
terminal must **rebuild**, item by item, after throwing away the host that had them.

So the "mucking about" the reader suspected is not incidental to the idea. It **is** the
idea. For Gloam to be effective in a browser terminal, that terminal must carry
DECSET 2026 with its ~150 ms window (`briefs/2026-09-02-brief-synchronized-output.md:56`),
scroll-region repaint (`BRF-SCROLL-REPAINT`), an alternate screen, wide-cell widths
including emoji presentation (`src/width.ts:40`), a non-zero winsize through a PTY,
and a colour path deep enough for 58,385 truecolour sequences per corpus pass. Each of
those is a defect class okuda has already paid for once. On the far side of a
WebSocket, each becomes a new one.

## What is not in question

- **The four capabilities are real, and okuda does answer them.** The disagreement is
  about who supplies them, not about whether they matter.
- **The refusal is already on the books.** `briefs/2026-09-04-brief-porch-matrix.md:97`
  forbids a web rendering fallback: a device that cannot terminal waits, and the
  failure mode is "no link", never "a worse copy in the browser".
- **The one question that does remain is the reader's, not this note's.** That refusal
  reads two ways. Narrow — never a **worse copy** — a web terminal is not a worse copy;
  it is the same bytes, which is the licence `briefs/2026-08-26-brief-herdr-dashboard.md:36`
  grants, that the web is another consumer of the same files. Wide — the data never
  renders in the web page — glyphs in a browser tab are still the data in a web page.
  The two readings disagree here and only here, and the porch matrix's unfilled
  iPhone, iPad and Android rows are where it would be settled. Handed back.

## Where I would land

**No integration, and no browser surface.** The reader's sentence is the finding: the
terminal is just another surface on the desktop, so a web-based surface buys a second
one at the price of a host we would have to build. The honest use of wterm is as a
**specimen** — the cleanest available statement of the case against rendering to bytes —
and the counter-argument above is what we take from it.

**What would change my mind.** One thing only, and it is not a feature: a device the
reader actually needs to read the silo on, which cannot run a terminal and cannot be
reached over SSH. That is the porch matrix's open rows, and it is a question about
hardware, not about rendering.

## Evidence

- `tmp/host-contract-probe.ts` — renders all 400 tracked documents and classifies every
  escape sequence in the output. Run under `bun`; 19.6 s, 0 render failures. Raw output
  at `tmp/host-contract-probe.out.txt`.
- The OSC 8 branch in `src/wrap.ts:9` closes and reopens zones across a wrap boundary —
  the hard half of wterm's hyperlink feature, already built and pinned by
  `tests/wrap.test.ts:53`. It fires **zero times** across the corpus, because
  `src/ansi.ts:187` declines to emit OSC 8 at all. A decision plus a dormant mechanism,
  not a gap.

## Related

- `docs/2026-09-06-protocol-free-text-identity.md` — the negative accessibility claim
- `briefs/2026-09-04-brief-porch-matrix.md` — the refusal, and the rows it leaves open
- `briefs/2026-09-02-brief-synchronized-output.md` — DECSET 2026, and its honest limits
- `decisions/028-wire-budget.md` — the wire as the budget
- `DEPENDENCIES.md` — the winsize fallback and the re-verify discipline
