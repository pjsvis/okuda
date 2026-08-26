# Brief: Document Links — Gopher Hypertext in the Reader

**Date:** 2026-08-26
**Status:** Ready (small-medium; reader surface, src work)
**Depends on:** render engine link handling (`src/wrap.ts` OSC 8 path);
follows `2026-08-26-brief-ssh-blog-feed.md` (v1) — links are what turn
the feed into a *site*.

## What

Relative markdown links between documents become in-reader navigation —
the gopher model, not the web model. A post links to another post; the
reader can follow it without leaving the session.

1. **Detect & number.** At render time, collect relative links
   (`./other-post.md`, `../folder/doc.md`) in visible order. Beneath the
   document (or in the hints row when toggled), print a numbered menu:
   `1. The Gloam Footer Story   2. Palette Census` — muted, link-text
   colour for titles.
2. **Digits follow.** `1`–`9` are unbound in `decodeKey` today (checked:
   the keymap is q/j/k/g/G/r/space/b/Ctrl-D/U/?, arrows, PgUp/PgDn —
   digits are free). `2` opens the second link's target document.
   Resolution is relative to the current document's directory; the served
   root bounds it (a link outside the root is rendered but not
   followable — it is web-bound, and OSC 8 still carries it for terminals
   that want to hand it to a browser).
3. **Navigation stack.** Following a link pushes; a bound key (proposal:
   `u`, unbound today) pops back to the previous document at the previous
   scroll — the anchor machinery (`reanchoredScroll`) already preserves
   position across re-render; reuse it across documents. `u` from the
   first document is a no-op.
4. **The loop joins in.** In the launcher/feed loop, quitting the reader
   (`q`) returns to the picker, as today; `u` walks back through followed
   links *inside* the reader session. Two layers, two back keys, no
   confusion: `q` exits the document, `u` unwinds within it.

## Why

Gopher's soul: numbered links, no chrome, reading as traversal. The
SSH feed (v1) is a file listing with a good reader; links make it a
navigable hypertext — "an ssh endpoint where we get links to other
documents might be fun" was the actual request, and it is the fun part.
Also the honest division: OSC 8 serves the *web* links (terminals hand
them to browsers); digits serve the *local* links (the session owns
them). Two link species, two affordances, no conflict.

## Constraints

- **Reader-only surface; `render.ts` gains a pure helper** (collect
  relative links from the token stream) — the streaming renderer stays
  untouched: it emits the same OSC 8 sequences as today. The numbered
  menu is TUI chrome, not document content.
- **Served-root bounding** is a *viewer* concern (the feed config pins
  the root); the reader takes a `resolveLink` hook or a root option —
  decide in implementation, keep the sandbox story unchanged.
- **Keymap discipline:** digits 1–9 and `u` join the hints line
  (`1-9 follow · u back` when a document has links; absent otherwise —
  chrome appears only when it acts).

## Out of scope

- Link *authoring* conventions for blog-posts (the palette revisit and
  link-style pass is the separate parked work — scrappy editing gets its
  own pass when the feed exists to serve the posts).
- Numbered links > 9 (a menu with 10+ links is an authoring problem, not
  a reader problem — cap at 9, log the cap in the menu row).
- Web links via digits (OSC 8 already owns those; terminals hand them to
  browsers — including on iPad clients that support it).

## Verification

- Unit: link collection (relative vs absolute vs web); digit decode;
  `u` stack push/pop; anchor preservation across document switches.
- Sandbox: follow a link between two posts over the feed; `u` returns to
  the exact scroll position; `q` from any depth exits to the picker.
- iPad dogfood: digits and `u` on the Bluetooth keyboard over Echo.
