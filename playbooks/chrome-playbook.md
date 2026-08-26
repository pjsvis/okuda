# Chrome Playbook

## What this is

The chrome-playbook captures the *viewer-side* conventions — the
non-content elements that frame the reading experience. The authoring
playbook captures what the writer does; this one captures what the
renderer's chrome does. Both serve the same property: readability at
every layer.

## The Gloam badge — environmental readability

### Identity in chrome, not content

When okuda runs in TUI mode, it signs itself **Gloam** in a coloured
badge at the bottom-left of the terminal. This is the only piece of
chrome that persists identity when the content scrolls, clears, or swaps
to an alternate screen. Everything else in a tmux pane is ephemeral; the
badge is the anchor.

### The problem it solves

A pane running a CLI in raw mode has no persistent label — the content
*is* the only identity. When the content is a wall of log output or a
half-rendered TUI, you can't tell what produced it. Then comes the
exit-key guessing game: `q`? `:q`? `Ctrl+C`? `Esc`? Some of those
mutate state before they exit — you start editing the document you were
trying to leave, save something you didn't mean to, or crash out and
hope. That's the bear trap, pointed at the *operator*, not the reader.
The layout (a pane with no label) defeats its own purpose (letting the
operator switch contexts confidently).

The badge inverts it: identity is in chrome, so the operator knows the
tool and therefore knows the keys. Identity → correct interaction model.
That's the dividend, and it's not aesthetic — it's a reduction in
destructive mistakes.

### Coupling to the identity layer

Under the Okuda palette the badge is amber-on-black (LCARS label
convention); under the default it's pink-on-near-white (Dracula). The
badge's colour is the palette's signature — at a glance, not just "this
is okuda" but "this is okuda in Okuda mode" vs "this is okuda in
glow-parity mode." Two pieces of information in one badge: tool identity
and configuration identity. The badge is a tiny dashboard.

### The sixth readability layer

The authoring playbook's thesis is readability at five layers:
documents, authored source, rendered output, silo state (the browser, to
come), ambient (host integration, parked). The badge adds a sixth:
**environmental** readability — knowing what tool you're in, in a
multiplexed terminal. The badge is the anchor that makes a tmux pane
navigable rather than a guessing game.

## The stacked comparison view — the dynamic width instrument

### Two vertical panes, the same document

The stacked comparison is glow in one pane and okuda in another, both
rendering the same document at the same width, resized together. It is
the method that found the table word-salad fault, the soft-return
orphaned fragments, and the glow emphasis defect — all in seconds of
viewing, none from reading source.

### The LCARS tab as alignment marker

Scrolling is required to line the two panes up for comparison. A plain
line of text is hard to align on — you concentrate on the line itself,
and the comparison breaks. The LCARS tab (the heading badge) provides a
marker that pops: you scroll until the section header and its badge
align, and the content alignment follows. The badge is a visual anchor
for the *eye*, not just for identity. The same element that marks
structure (authoring) and identity (chrome) also marks position
(navigation). One signal, three jobs.

### The continuation is obvious and inviting

If a section is longer than the viewport shows, the vertical spacing
(loose rows, blank lines between blocks) makes the continuation obvious
and inviting — the eye sees the rhythm continues below the fold, and
scrolling is the natural response. There is no "is this the end?"
ambiguity. The rhythm promises more; the reader follows. Dense viewers
(glow) do not make this promise — the wall reads as complete at the
viewport edge, and scrolling feels like a discovery rather than a
continuation.

### The Gloam anchor as perceptual container

The Gloam badge at the bottom-left ensures the operator's perceptual
field is contained within the okuda viewer pane. When comparing two
panes, the eye knows which pane it's reading because the badge is always
there at the field's edge. Without it, the two panes can blur into one
perceptual field, and the comparison becomes "which of these walls am I
looking at?" The badge is the frame that keeps the pane a pane. This is
environmental readability in the service of comparison readability —
the sixth layer enabling the second.

## No copy key — foxtrot oscar then copy

The temptation: add a `y` (yank) keystroke to copy the mermaid source
(or the document) to the system clipboard from inside the TUI. The
Leith position rejects it, and the order inversion is the principle.

**Foxtrot oscar then copy — not copy then foxtrot oscar.** The content
is all in a document on disk. The viewer is a view; the document is the
source of truth. Copying from the view duplicates what the file already
provides. The right order: quit the viewer (foxtrot oscar), then copy
from the document with your shell tools (`cat`, `pbcopy < file`, `grep`,
whatever). The viewer was the thing standing between you and the raw
document; quitting it gives direct access to the source.

**Why no copy key.** The document is persistent; the viewer is ephemeral.
Copying from the ephemeral view when the persistent source is right there
is solving the problem in the wrong place — the same class of error as
the mermaid `--color` flag (binary reaching into the consumer's palette).
The diagram's mermaid source is already surfaced as the muted checksum
block; the document is already on disk. The escape hatch exists; okuda
doesn't need to be the agent that opens it. The operator's tools (shell,
multiplexer) open it.

**The Derrida question, answered.** Is copy okuda's job, or the host's?
The host's. okuda renders; the document persists; the shell copies.
Adding `y` would be okuda reaching into the host's competence — scope
creep dressed as a feature. Parked behind a real need (none evidenced:
the operator runs okuda in a terminal, the terminal has a shell, the
shell has clipboard tools).

## Heuristics, emerging

Chrome-side conventions, added as they surface from dogfooding. Each
entry: the chrome element, why it earns its place, the perceptual
property it serves.

- **Gloam badge.** Environmental readability — identity in chrome, not
  content. Reduces destructive mistakes (wrong exit keys). Coupled to
  the palette (configuration identity). Calming + leading (anchors the
  perceptual field).
- **LCARS tab as alignment marker.** One signal, three jobs: structure
  (authoring), identity (chrome), position (navigation). The badge pops
  for alignment where a plain line does not. Leading.
- **Loose-row continuation.** Vertical spacing promises more below the
  fold; scrolling is inviting, not a discovery. Calming.
- **No copy key (foxtrot oscar then copy).** The document is the source
  of truth; the viewer is a view. Copy from the file, not the view.
  Scope discipline — okuda doesn't accrete host competence. Calming
  (one less key to learn) + scope integrity.

## Terminal-gifted capabilities — the restraint ledger

The reader deliberately advertises for **none** of the terminal's input
facilities: no mouse reporting (DECSET 1000/1002/1006 never emitted), no
bracketed-paste handling, no focus reporting. Every capability below is
therefore owned and implemented by the *terminal*, not by okuda — free
features, zero code, zero maintenance, present on every terminal that
speaks the standard escape protocols.

- **Text selection + copy.** With no app owning the mouse, native drag
  selection works everywhere (Alacritty ⌘C, iPad SSH long-drag). An app
  that enables mouse reporting forfeits this — drags route to the app.
- **OSC 8 hyperlinks.** `wrap.ts` embeds `\x1b]8;;URL\x1b\\` around link
  text; any OSC-8 terminal (Alacritty, most modern clients) renders
  tappable/clickable links. SSH is a byte pipe — the sequences cross it
  intact, so the feature rides to the iPad for free if the client speaks it.
- **Alt-scroll arrows (DECSET 1007).** When the terminal translates wheel
  to ↑/↓ for alt-screen apps, the reader's keymap (CSI + SS3 arrows)
  receives them — mouse-wheel scroll without owning the mouse.
- **Scrollback, resize, bracketed paste.** The alternate screen handles
  geometry; the terminal handles the rest.

**The trade this ledger records:** owning the mouse (wheel/swipe scroll
inside the reader) would cost native selection and add terminal-state
management — the parked `reader-mouse-wheel` brief exists, and this
ledger is the argument for keeping it parked. Pick terminals that gift
capabilities; write less code. The doctrine's story:
`docs/2026-08-26-the-porch-without-the-zapper.md`.

- **Hue-per-role census (2026-08-26).** Blue was two hexes over four
  roles (heading + table-header shared `#99ccff`; link-url +
  diagram-border shared `#5e8bbf`) — tables and URLs masqueraded as
  headings. The settled map: **blue = document structure** (headings,
  diagram blueline per ADR-008), **warm gold/amber/sand = voice and
  data** (emphasis/table-key `#e0b45c`, strong `#cc8800`, table-header
  `#c8b878` — quieter than key: headers repeat, keys carry), **sea
  green = links** (`link-url` `#4d9e7a`, reviving the palette's legacy
  link role — and the web's own link affordance). URLs are the quietest
  chromatic role (27% luminance): plumbing, readable when sought.

  **Census addendum (same day): luminance is not perceptual weight.**
  Strong at 50 luminance "overshadowed" a 57 heading — because census
  luminance × typographic weight is perceived brightness, and bold gold
  outshouts pale blue at equal numbers. Rule: a role that carries its
  own typographic weight (bold) gets *less* colour — but never *below
  its plain-text peers*: weight may discount colour, not demote the role
  beneath non-bold neighbours (contradictory signals — bold weight says
  'prominent', buried colour says 'recede' — read as unsettlement, the
  page's texture lies). Dogfood bracket: 50 (#ffaa00) overshadowed the
  heading; 30 (#cc8800) sank beneath khaki table chrome; 41.6
  (#dfa21a) settles — heading 57 > emphasis/key 49 > table-header 48 >
  link-text 45 > strong 42×bold-weight > URL 27 > muted 9.
