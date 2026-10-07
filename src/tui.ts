/**
 * tui.ts — the control plane (brief: okuda-tui-control-plane).
 *
 * A game loop, not a framework. Input → update → paint → repeat.
 *
 *   alternate screen on → raw mode on → loop {
 *     read keystroke bytes
 *     advance scroll offset (or quit / reload)
 *     paint rendered lines through the viewport
 *     paint footer: Gloam badge + folder/file left, help right, muted
 *   } → raw mode off → alternate screen off
 *
 * Composes over the render plane (render.ts); never touches rendering.
 * NO_COLOR / TERM=dumb / non-TTY → the caller falls back to the streaming
 * renderer (brief: "falls back to the streaming renderer, no TUI").
 */

import { detectColorMode, makeStyler, type Styler } from "./ansi";
import { annotateSource, appendReferences, jumpMapFor, CLONE_TOKEN } from "./vectors";
import { cloneArgs, editArgs, resolveEditor } from "./clone";
import { frameBounds, headingLines, pageStep, paragraphStarts, snapFrame } from "./frames";
import { readOnlyActive, splitKeyEvents, verbFor, type Verb } from "./keygrammar";
import { loadPalette, type Palette } from "./palette";
import { renderDocument, wrapWholeFile } from "./render";
import { isWithinRoot } from "./root";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { appendFileSync, existsSync } from "node:fs";
import { displayWidth, padStartDisplay, terminalCols, terminalRows } from "./width";

/** The frame trace — one line per resize, render and paint, appended to the file
 *  `OKUDA_FRAME_LOG` names. A FILE, never the tty: a debug line on stdout would
 *  corrupt the very frame it is tracing. Silent unless the variable is set, and
 *  it never throws — a trace that can break the frame it traces is worse than no
 *  trace.
 *
 *  Why it exists: the visual glitches of 2026-10-06/07 were all races at a pane
 *  boundary — a couple of words moving as focus leaves, self-correcting, over in
 *  a frame, and unpinnable by looking at it. `resize cols=.. rows=..` next to
 *  `paint cols=.. render=..` settles in one read whether a `cols` change is real,
 *  which DIRECTION it goes, and whether the frame we painted was rendered at the
 *  width we now hold. The direction decides whether an honest fix exists at all:
 *  narrowing must be adopted immediately (a frame wider than the pane wraps),
 *  widening may be adopted lazily (a frame narrower than the pane merely has a
 *  margin). Nothing here is inferred from the glass. */
export const frameTrace = (line: string): void => {
  const path = process.env.OKUDA_FRAME_LOG;
  if (!path) return;
  try {
    appendFileSync(path, `${new Date().toISOString()} ${line}\n`);
  } catch {
    // Silence on purpose: the trace must never break the frame it traces.
  }
};

export interface TuiOptions {
  file: string;
  width: number;
  rows: number;
  palette?: Palette;
  /** Silo badge (brief: silo-mnemonics). Undefined when unrooted → today's
   *  footer, no silo badge. The renderer paints the string; it learns
   *  nothing about trees or registries. */
  silo?: string;
  /** Silo root path (ADR-048), the containment fence
 *  (BRF-ROOT-CONTAINMENT): jump targets resolve only inside it — or
 *  the document's own directory, the HTML anchor. Undefined =
 *  unrooted, today's semantics. The path, not the badge: a boundary
 *  handed down, never detected here. */
  root?: string;
  /** Per-file callsign resolver (the rooted launcher passes one; the TUI
   *  knows nothing of registries — ADR-020). Called per paint with the
   *  current file, so the identity run follows jumps. */
  callsignFor?: (file: string) => string | null;
  /** Vector actuation resolver (ADR-031): vector target → document path.
   *  File-existence first, callsign dispatch where rooted; null = no
   *  document (the actuator flashes honestly). Same ADR-020 boundary —
   *  a closure, never registry knowledge. */
  resolveTarget?: (target: string) => string | null;
  /** The silcrow gate (ADR-044): a prospective callsign resolves through
   *  the tier registries — built launcher/cli-side (one load per run),
   *  never here. ADR-020's boundary: a closure, never registry
   *  knowledge. Undefined = the pre-ADR-044 optimism (pure scan). */
  resolves?: (target: string) => boolean;
}

/** Decoded keystroke action. `null` = unhandled (no-op). The
 *  motions are split by unit (BRF-OKUDAGRAM-STEP): line (arrows,
 *  slide-mode j/k), page (␣/b, frame-mode j/k), paragraph (}/{ — the
 *  VI stride), frame (]]/[[ — the declared header-to-header jump). */
export type KeyAction =
  | "quit" | "down" | "up"
  | "line-down" | "line-up"
  | "para-down" | "para-up"
  | "frame-down" | "frame-up"
  | "page-down" | "page-up"
  | "half-down" | "half-up"
  | "top" | "bottom" | "reload"
  | "help" | "back"
  | null;

const ESC = 0x1b;

/**
 * Decode a raw stdin buffer to a symbolic action. Single-byte controls
 * (Ctrl-C/D/U, q, j, k, g, G, r), the two vim motion pairs (}/{, ]]/[[)
 * and the four common arrow/page escape sequences (ESC [ A/B/5~/6~).
 * Unknown bytes and partial sequences are `null` (no-op) — a split escape
 * read is re-synthesised on the next chunk.
 */
export function decodeKey(buf: Uint8Array): KeyAction {
  if (buf.length === 0) return null;
  const b0 = buf[0]!;
  // Single-byte controls.
  switch (b0) {
    case 0x03: return "quit";            // Ctrl-C — the interrupt; OFF is 00
    case 0x04: return "half-down";      // Ctrl-D
    case 0x15: return "half-up";        // Ctrl-U
    case 0x71: return "quit";           // q
    case 0x51: return "quit";           // Q (Glow's convention)
    case 0x6a: return "down";           // j — the step (unit is the mode's)
    case 0x6b: return "up";             // k
    case 0x7d: return "para-down";      // } — vim paragraph motion (VI stride)
    case 0x7b: return "para-up";        // {
    case 0x67: return "top";            // g
    case 0x47: return "bottom";         // G
    case 0x72: return "reload";         // r
    case 0x20: return "page-down";      // space — less/man convention
    case 0x62: return "page-up";        // b — less/man back convention
    case 0x3f: return "help";           // ? — toggle verbose hints
    case 0x75: return "back";           // u — pop the backstack
    // Backspace unwinds — restored 2026-09-05 on ergonomics: it sits
    // on the RHS beside the less-used keys, the natural rest for the
    // right hand between reads. It has no job outside the dereferenced
    // document: at main the backstack is empty and `back` is a no-op —
    // the depth-one stack makes it safe by construction.
    case 0x7f: return "back";           // DEL (Backspace on most terminals)
    case 0x08: return "back";           // BS  (Backspace on some terminals)
  }
  // Vim's section motions, kept whole by the lexer — the declared
  // header-to-header jump (may gap; honest because named).
  if (buf.length === 2 && buf[0] === 0x5d && buf[1] === 0x5d) return "frame-down";  // ]]
  if (buf.length === 2 && buf[0] === 0x5b && buf[1] === 0x5b) return "frame-up";    // [[
  // Escape sequences: ESC [ <final> or ESC [ <n> ~.
  if (b0 === ESC && buf.length >= 3 && buf[1] === 0x5b) {
    switch (buf[2]) {
      case 0x41: return "line-up";      // ESC [ A — ↑ (slippy, always)
      case 0x42: return "line-down";    // ESC [ B — ↓
      case 0x35: return "page-up";      // ESC [ 5 ~ — PgUp
      case 0x36: return "page-down";     // ESC [ 6 ~ — PgDn
    }
  }
  // SS3 arrows: ESC O <final>. Sent when DECCKM (application cursor
  // mode) is on — commonly left set by the shell's line editor. The same
  // keys as CSI arrows; alt-scroll wheels emit this form too.
  if (b0 === ESC && buf.length >= 3 && buf[1] === 0x4f) {
    switch (buf[2]) {
      case 0x41: return "line-up";      // ESC O A — ↑
      case 0x42: return "line-down";    // ESC O B — ↓
      case 0x35: return buf[3] === 0x7e ? "page-up" : null;    // ESC O 5 ~
      case 0x36: return buf[3] === 0x7e ? "page-down" : null;  // ESC O 6 ~
    }
  }
  // Lone Esc (length 1) — the partial-vector cancel, applied by
  // applyKey before decodeKey is reached. Here it is null.
  if (b0 === ESC && buf.length === 1) return null;
  return null;
}

/** Strip ANSI SGR codes and the 2-char render margin, for anchor matching.
 *  The margin is the outermost layer (`finalize` adds it last), so strip it
 *  after ANSI. A blank line has no margin (`finalize` skips empties). Pure. */
export function stripForAnchor(line: string): string {
  return line.replace(/\x1b\[[0-9;]*m/g, "").replace(/^  /, "");
}

/** The anchor that survives reflow: the stripped text of the non-blank
 *  visible line nearest the viewport middle (the eye proxy), plus the
 *  screen row it occupied (0-based from the viewport top). Pinning the
 *  anchor back to `offset` after re-render minimises apparent vertical
 *  movement — the line under the eye stays under the eye (brief:
 *  resize-content-anchor). Returns null if the viewport is all-blank. Pure. */
export interface Anchor {
  text: string;
  offset: number;
}
export function anchorFor(
  lines: string[],
  scroll: number,
  height: number,
): Anchor | null {
  const end = Math.min(lines.length, scroll + height);
  const mid = scroll + (height >> 1); // middle screen row, as a line index
  for (let r = 0; r < height; r++) {
    const lo = mid - r;
    const hi = mid + r;
    if (lo >= scroll) {
      const s = stripForAnchor(lines[lo] ?? "");
      if (s !== "") return { text: s, offset: lo - scroll };
    }
    if (hi < end && hi !== lo) {
      const s = stripForAnchor(lines[hi] ?? "");
      if (s !== "") return { text: s, offset: hi - scroll };
    }
  }
  return null;
}

/** Find the physical index of `anchor` in re-rendered lines, biased to
 *  start near `hint` and bounded to `maxRadius` (one viewport covers
 *  small-moderate reflow; a big resize correctly misses and the caller
 *  falls back to proportional). Returns the matched index, or `-1` if not
 *  found within the radius — never grabs a distant duplicate, the bug
 *  that jumped to the top. Pure. */
export function findAnchor(
  lines: string[],
  anchor: string,
  hint: number,
  maxRadius: number,
): number {
  const n = lines.length;
  for (let r = 0; r <= maxRadius; r++) {
    const lo = hint - r;
    const hi = hint + r;
    if (lo >= 0 && stripForAnchor(lines[lo] ?? "") === anchor) return lo;
    if (hi < n && hi !== lo && stripForAnchor(lines[hi] ?? "") === anchor) {
      return hi;
    }
  }
  return -1;
}

/** Proportional scroll: preserve the reading fraction across reflow. The
 *  robust floor when a text anchor can't be found (big resize, every line
 *  split). Imprecise but never jumps to the top — the failure mode that
 *  lost the reader's place. Pure. */
export function proportionalScroll(
  oldScroll: number,
  oldMax: number,
  newMax: number,
): number {
  if (oldMax <= 0) return 0;
  return Math.round((oldScroll / oldMax) * newMax);
}

/** Viewport slice: visible lines + the clamped max scroll. Pure. */
export function viewport(
  lines: string[],
  scroll: number,
  height: number,
): { visible: string[]; maxScroll: number; scroll: number } {
  const maxScroll = Math.max(0, lines.length - height);
  const s = Math.min(Math.max(0, scroll), maxScroll);
  return { visible: lines.slice(s, s + height), maxScroll, scroll: s };
}

/** The hints row. Budget-bound: it must fit 80 columns and still
 *  right-justify (the `hintsLine` test referees both), so adding the
 *  second spawn verb (88 edit) cost the address hint — two digits are
 *  self-advertising (every reference wears its rose §NN on the glass),
 *  whereas `g/G` is invisible until told. The exit leads, always: a help
 *  row owes the reader the way out before anything else. */
const HINTS = "00 off · j/k ␣/b · }/{ para · ]]/[[ frame · g/G · r · 88 edit · 99 clone · u";

/** Display path: folder/basename (Glow convention). Pure. */
/** ADR-010 re-anchor as a pure function: given the pre- and post-re-render
 *  lines and the old scroll, return the scroll that pins the old anchor
 *  (non-blank line nearest the viewport middle — the eye proxy) back to
 *  its screen row; bounded text-match first, proportional fallback when
 *  the match misses, index-preservation when there is no anchor.
 *  Shared by reload (r) and resize (SIGWINCH); fs.watch joins them later
 *  (brief: tui-live-documents). Pure. */
export function reanchoredScroll(
  oldLines: string[],
  newLines: string[],
  oldScroll: number,
  height: number,
): number {
  const oldMax = viewport(oldLines, 0, height).maxScroll;
  const anchor = anchorFor(oldLines, oldScroll, height);
  const { maxScroll } = viewport(newLines, 0, height);
  if (anchor !== null) {
    const idx = findAnchor(newLines, anchor.text, oldScroll, height);
    if (idx >= 0) return Math.min(Math.max(0, idx - anchor.offset), maxScroll);
    return proportionalScroll(oldScroll, oldMax, maxScroll);
  }
  return Math.min(oldScroll, maxScroll);
}

/** Fetch outcome: the read path never coerces failure to empty success
 *  (brief: fetch-state-stamp). A vanished source reported as `""` rendered
 *  blank and the gate read `changed`; now failure is a distinct state the
 *  gate retains the last-known-good against. */
export type Fetch =
  | { ok: true; text: string }
  | { ok: false; reason: string };

/** The three-way value the content gate produces and the footer stamp will
 *  consume. `changed`/`same` fall out of the rendered-output comparison
 *  (the mechanised "neither" — mtime is not meaning); `failed` is the
 *  branch the coercing read path used to hide. One enum, three values,
 *  no overlap. */
export type FetchState = "changed" | "same" | "failed";

/** Content gate: two renders are the same iff every line matches. `mtime
 *  is not meaning` — a rewrite with identical content produces zero visual
 *  events. Pure, exported for gate tests. */
export function renderEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** The gate decision, pure: given the previous rendered lines and the
 *  outcome of a fresh fetch (with its rendered form when ok), return the
 *  new fetch-state, the lines to display, and whether to repaint.
 *  - failed:  retain the last-known-good (`prev`, or `[]` on the very first
 *    load), mark `failed`, no repaint — honest-stale-with-label, not blank.
 *  - same:    the content gate held, mark `same`, no repaint.
 *  - changed: content moved, mark `changed`, repaint (the caller re-anchors
 *    and paints).
 *  `prev === null` is the initial-load sentinel: a successful first fetch
 *  has no prior to compare against, so it reads as `changed`. */
export function gateFetch(
  prev: string[] | null,
  fetch: Fetch,
  next: string[],
): { state: FetchState; lines: string[]; repaint: boolean } {
  if (!fetch.ok) {
    return { state: "failed", lines: prev ?? [], repaint: false };
  }
  if (prev !== null && renderEqual(prev, next)) {
    return { state: "same", lines: prev, repaint: false };
  }
  return { state: "changed", lines: next, repaint: true };
}

export function displayPath(file: string): string {
  const parts = file.split("/").filter(Boolean);
  if (parts.length <= 1) return file;
  return parts.slice(-2).join("/");
}

/** Synchronized-output bracket (DECSET 2026, BRF-SYNC-OUTPUT). The
 * terminal defers compositing until the closer, so a frame split
 * across TCP packets (SSH) lands as one frame instead of a visible
 * blank-to-content tear. Unknown-mode-safe: terminals without 2026
 * ignore the pair. One seam, both paint paths go through syncWrap. */
export const SYNC_BEGIN = "\x1b[?2026h";
export const SYNC_END = "\x1b[?2026l";
export const syncWrap = (frame: string): string =>
  SYNC_BEGIN + frame + SYNC_END;

/** Compact LHS: the help affordance only. Pure. */
function compactLeft(): string {
  return "? help";
}

/** Viewport height: total rows minus the separator row and the badge
 *  row — CONSTANT, never hints-dependent (BRF-FOOTER-SEPARATOR): the
 *  badge owns the bottom edge (permanent chrome at the last row), the
 *  separator row above it is blank by default and carries the
 *  transient affordances (hints, flash) when shown. Identity at the
 *  true bottom, transient above it, document above that — toggling
 *  hints paints one row, never reflows the content. Pure. */
export function contentHeight(rows: number): number {
  return rows - 2;
}

/** The glass geometry as one comparable token. Pure. */
export const geometryOf = (rows: number, cols: number): string => `${rows}x${cols}`;

/** Chrome jitter: a pane that WIDENS by a column or two without the reader
 *  touching it. A focus outline can change the pane's pixel box, and the
 *  terminal's `pixels ÷ cell_width` moves the column count with it — measured at
 *  one column on focus-out (2026-10-07), which reflowed the densest paragraph in
 *  the showcase, 423 lines to 422. The threshold is the measured jitter plus one,
 *  so a deliberate drag is never mistaken for chrome. */
export const CHROME_JITTER = 2;

/** Whether the frame on the glass is stale for a live geometry. A difference is
 *  real except for a small WIDENING, which is chrome — and that exception is not
 *  a convenience, it is the asymmetry: a frame WIDER than the pane is soft-wrapped
 *  by the terminal (a lie), while a frame NARROWER than the pane merely has a
 *  margin. So narrowing is adopted at once, a height change always re-lays, and a
 *  small widening is taken on the next render that happens for another reason
 *  (ADR-WIDENING-LAG-054). Pure. */
export function frameStale(live: string, frame: string, jitter: number): boolean {
  if (frame === "") return true; // nothing rendered yet
  if (live === frame) return false;
  const [lr, lc] = live.split("x").map(Number);
  const [fr, fc] = frame.split("x").map(Number);
  if (lr !== fr) return true; // the viewport must re-lay
  if (!(lc! > fc!)) return true; // narrowing, or any drop: adopt immediately
  return lc! - fc! >= jitter;
}

/** The repaint rule: repaint when the content changed, **or** when the glass
 *  was last painted at a different geometry. The content gate reads the
 *  CONTENT — it cannot see the glass. A height-only resize re-renders
 *  byte-identical lines (`cols` unchanged), so `gateFetch` reads `same` and
 *  the frame still needs laying out at the new height: without the second
 *  input the newly uncovered rows stay blank and a shrink leaves the old
 *  footer's cursor address pointing at a row that no longer exists. Naming
 *  the input here keeps the gate's meaning intact (*mtime is not meaning*)
 *  rather than widening it. Pure. */
export function needsRepaint(
  contentChanged: boolean,
  geometry: string,
  paintedGeometry: string,
): boolean {
  return contentChanged || geometry !== paintedGeometry;
}

/** The verbose hints line, right-justified on the separator row — the
 *  row ABOVE the badge (the badge owns the last row) — with the corner
 *  column reserved. If it can't fit, it wraps — a legible 'you are too
 *  narrow' rather than silent truncation. Pure. */
export function hintsLine(width: number, muted: (s: string) => string): string {
  return muted(padStartDisplay(HINTS, width - 1)) + " ";
}

/** Decode a single-byte digit ('0'–'9') to its character, else null.
 *  Multi-byte sequences (escape codes, arrows) are never digits — only
 *  a lone 0x30–0x39 qualifies. The two-digit jump buffer collects these
 *  before falling to `decodeKey`; any non-digit cancels the buffer.
 *  Pure. */
export function digitOf(buf: Uint8Array): string | null {
  if (buf.length !== 1) return null;
  const b = buf[0]!;
  return b >= 0x30 && b <= 0x39 ? String.fromCharCode(b) : null;
}

/** A jump target lifted from a markdown inline-link token `[NN](path)`.
 *
 *  The index document is an ordinary markdown file; its `[NN](path)`
 *  links carry the target path in-band — the filesystem is the message
 *  bus. ADR-020 holds: no `src/` file reads ambient directories to mutate
 *  the frame; the TUI scans the source text it already holds. The
 *  renderer paints the link per glow parity (rose text + visible URL);
 *  callsign-column polish belongs to the silo-mnemonics brief, not here. */
export interface JumpEntry {
  token: number;
  path: string;
}

/** The numeric jump buffer's state (BRF-PROLONGED-PRESS): a digit
 *  run, held. `null` = empty; `{ keys, spent: false }` = one digit
 *  held, awaiting its pair; `{ keys, spent: true }` = the run's pair
 *  has resolved and the LATCH is set — the run is still held so its
 *  remainder can be swallowed. `keys` is the run's own digits: one
 *  held digit, or the resolved doubled pair. */
export type NumBuffer = { keys: string; spent: boolean } | null;

/** The result of advancing the numeric jump buffer one keystroke.
 *  `buffer` is the new state (null = empty); `token` is the resolved
 *  two-digit number when a pair completed, else null. Pure. */
export interface NumBufferStep {
  buffer: NumBuffer;
  token: number | null;
}

/** Advance the numeric jump buffer (BRF-PROLONGED-PRESS): the buffer
 *  knows a digit run is a run. Three states — empty, held (one digit
 *  pending), spent (the pair fired, the latch set):
 *
 *  - empty + digit → held: the run's first tap.
 *  - held + same digit → the doubled pair resolves; the run stays
 *    held, spent — the latch that swallows the tail.
 *  - held + different digit → the mixed pair resolves (a vector) and
 *    the buffer empties — a vector is never latched, which is why
 *    `12` `12` fires two jumps back to back while `9` `9` `9` `9`
 *    fires one clone.
 *  - spent + same digit → swallowed. Nothing fires, the latch holds.
 *  - spent + different digit → a new run begins (the reader has moved
 *    on; the gesture is over).
 *  - any state + non-digit (motion, escape, letters) → empty. The
 *    abort: a stray keystroke never ambushes a half-typed token, and
 *    a lone ESC stands a pending digit down.
 *
 *  Grab the actuator pair and swallow the rest of the keystrokes —
 *  the reader's phrasing, given state. A prolonged hold is one
 *  actuation, not a stream of them: a run of identical digits can
 *  only ever be a doubled pair, which by ADR-032's canon is an
 *  actuator and never a jump, so the swallow is safe by
 *  construction — no legitimate jump exists in a run.
 *
 *  The swallow is LATCHED, not read-scoped: at the terminal's repeat
 *  rate each repeat byte lands in its own read, so a swallow scoped
 *  to the current read would re-grab the pair at byte 4, 6, 8, 10 —
 *  five clones, the reported bug. Only a different byte or the
 *  abort ends the latch.
 *
 *  NO CLOCK. No expiry, no deadline, anywhere in the input path: the
 *  reader's tempo is not an input. The parked quiet period (the
 *  latch's eventual expiry) is IO and lives in the caller when it
 *  lands, clearing the latch only — never a pending digit. And this
 *  is NOT the lexer's job: `]]` is one key spelled in two bytes,
 *  `99` is one key spelled nine times — the lexer undoes the
 *  terminal's spellings, and a run is not a spelling.
 *  Pure — the caller performs the IO (jumpTo/back) the resolved
 *  token implies. */
export function advanceNumBuffer(
  prev: NumBuffer,
  digit: string | null,
): NumBufferStep {
  if (digit === null) return { buffer: null, token: null }; // the abort
  if (prev === null) return { buffer: { keys: digit, spent: false }, token: null };
  const run = prev.keys[0]!; // the run's digit, held or spent
  if (prev.spent) {
    if (digit === run) return { buffer: prev, token: null }; // swallowed — one gesture
    return { buffer: { keys: digit, spent: false }, token: null }; // a new run begins
  }
  const pair = prev.keys + digit;
  if (digit === run) return { buffer: { keys: pair, spent: true }, token: Number(pair) };
  return { buffer: null, token: Number(pair) }; // mixed pair — a vector, never latched
}

/** Scan markdown source for jump wiring — a `%%okuda-rhs:NN%%` token
 *  paired with a `.md` path on the same line — returning a token→path
 *  map. Line-scoped (the compositor's contract: the wiring shares the
 *  line with its item, hidden in a table row's HTML comment or trailing
 *  a one-line paragraph — the renderer strips the comment, this reads
 *  the source). Duplicate tokens: last wins. Pure. */
export function extractJumps(source: string): Map<number, string> {
  const out = new Map<number, string>();
  for (const line of source.split("\n")) {
    const tok = line.match(/%%okuda-rhs:(\d{1,2})%%/);
    if (!tok) continue;
    const paths = [...line.matchAll(/\S+\.md/g)].map((m) => m[0]!);
    const path = paths[paths.length - 1];
    if (path) out.set(Number(tok[1]!), path);
  }
  return out;
}

/** Resolve a jump target the way a document means it: a relative path
 *  is relative to the MAIN document's directory (HTML semantics —
 *  `&speak.md`'s `../speak-md/` targets anchor to the silo root, not to
 *  wherever the process happens to stand), and the caller's fallback
 *  (cwd, then the callsign registry — ADR-031) carries everything else.
 *  A root fences both anchors (BRF-ROOT-CONTAINMENT: existence is not
 *  permission): the doc-dir candidate must land inside the root or the
 *  doc's own directory, and an absolute target outside the root is null
 *  before the fallback. No root: the unrooted reader, today's
 *  semantics. Pure. (td-1c8fca: rows wired to sibling-silo targets failed resolve
 *  the moment the cwd moved; the anchor is the document.) */
export function resolveJumpTarget(
  mainFile: string,
  target: string,
  fallback?: (t: string) => string | null,
  root?: string,
): string | null {
  if (!isAbsolute(target)) {
    const dir = dirname(resolve(mainFile));
    const candidate = join(dir, target);
    if (
      existsSync(candidate) &&
      (root === undefined || isWithinRoot(candidate, root) || isWithinRoot(candidate, dir))
    )
      return candidate;
  } else if (root !== undefined && !isWithinRoot(target, root)) {
    return null; // outside the silo root — existence is not permission
  }
  return fallback ? fallback(target) : target;
}

/**
 * Compose the footer: badge + silo? + callsign? + folder/filename left
 * (identity leads — the glance position), `? help` right (affordance
 * trails). Always compact — verbose hints live on the separator row
 * above the badge (see hintsLine).
 *
 * The identity run is `silo · callsign · filename` (ADR-020): silo and
 * callsign both muted (provenance, not alarm), passed in by the launcher
 * when rooted — the renderer paints the strings it is given and knows
 * nothing of registries. Absent segments collapse; the run reads
 * `silo · filename`, or just the filename unrooted. The binary badge
 * (label) leads the run, unchanged in every mode (brief:
 * silo-mnemonics — okuda <file> unchanged).
 */
export function footerLine(
  width: number,
  label: string,
  file: string,
  muted: (s: string) => string,
  badge: (s: string) => string,
  silo?: string,
  callsign?: string,
): string {
  const name = displayPath(file);
  const rightText = compactLeft();
  // identity run: muted silo + callsign, dot-joined, each trailing ` · `.
  // Empty when unrooted — collapses to today's badge + filename. The
  // width math uses plain lengths (ANSI is zero-width), parity with
  // `label.length` and `name.length` — never the ANSI-wrapped run.
  const identity = [silo, callsign].filter((s): s is string => s !== undefined);
  const run = identity.length > 0 ? identity.map(muted).join(" \u00b7 ") + " \u00b7 " : "";
  const runWidth = identity.reduce((w, s) => w + s.length, 0) + identity.length * 3;
  // Left: badge (label + 2 padding) + space + identity run + folder/file.
  const leftWidth = label.length + 2 + 1 + runWidth + name.length;
  // Reserve the last column: Apple's rounded window corner clips the
  // bottom-right cell — the footer never writes it.
  const gap = Math.max(1, width - leftWidth - rightText.length - 1);
  return badge(label) + " " + run + muted(name) + " ".repeat(gap) + muted(rightText) + " ";
}

// ── I/O loop ──────────────────────────────────────────────────────────

const ENTER_ALT = "\x1b[?1049h";
const EXIT_ALT = "\x1b[?1049l";
const HIDE_CURSOR = "\x1b[?25l";
const SHOW_CURSOR = "\x1b[?25h";

/**
 * Run the TUI. Caller gates: only invoke when stdout+stdin are TTYs and
 * colour mode is not "none" (brief: NO_COLOR/TERM=dumb fall back to stream).
 */
export async function runTui(opts: TuiOptions): Promise<void> {
  const palette = opts.palette ?? loadPalette();
  const color = detectColorMode(process.env as NodeJS.ProcessEnv);
  const styler = makeStyler(palette, color);
  const muted = (s: string) => styler.role("muted", s);
  const badge = (s: string) => styler.badge(s);

  /** Read the source as a discriminated union — never coerce failure to
   *  empty success. `f.exists()` false and any thrown IO (file unlinked
   *  mid-session, permission revoked, mount vanished) both surface as
   *  `{ok:false}`; the gate retains the last-known-good against it.
   *  (brief: fetch-state-stamp — the empty-doc-on-fetch-failure lie.) */
  // `currentFile` is the live document — jumps and back-nav swap it;
  // reload/resize read it. `opts.file` only seeds the initial value.
  let currentFile = opts.file;
  const readSource = async (file: string = currentFile): Promise<Fetch> => {
    const f = Bun.file(file);
    try {
      if (!(await f.exists())) return { ok: false, reason: "missing" };
      return { ok: true, text: wrapWholeFile(file, await f.text()) };
    } catch (err) {
      return { ok: false, reason: String(err) };
    }
  };

  /** The width the lines currently on screen were rendered at — the frame's stamp
   *  is THIS, not the live glass. See `paint`: a stamp taken from the pane asserts
   *  that the glass holds a frame it does not hold, and a later event at that same
   *  width then compares equal and skips the repair. Set inside `renderLines`, the
   *  one choke point every render passes through, so it cannot drift from the
   *  content it describes. 0 until something is rendered. */
  let renderCols = 0;
  const renderLines = async (source: string, width: number): Promise<string[]> => {
    const out = await renderDocument(source, { width, palette, color });
    const lines = out.split("\n");
    renderCols = width;
    if (process.env.OKUDA_FRAME_LOG) {
      const maxline = lines.reduce((a, l) => Math.max(a, displayWidth(l)), 0);
      // maxline is the number that must not exceed the pane: everything at the
      // content width (an elided fence, diagram art, the chip-padded heading) is
      // what the terminal soft-wraps when it does.
      frameTrace(`render width=${width} maxline=${maxline} lines=${lines.length}`);
    }
    return lines;
  };

  /** The glass's live geometry — the ONE width source. The initial frame reads
   *  this as well as every repaint. A first frame rendered at a width sampled at
   *  exec is a frame the terminal soft-wraps, which is the one thing okuda never
   *  does to itself (ADR-004, ADR-UNIVERSAL-ELISION-050). Found by dogfood: the
   *  showcase's elided code fences wrapped their markers onto the next line
   *  until a SIGWINCH re-rendered at the true width, because this function was
   *  defined after the first render and that render used `opts.width` — the
   *  non-TTY fallback — in a TTY. */
  const dims = () => ({
    // terminalCols/Rows handle the Bun --compile columns=0 bug (tput fallback);
    // opts.width/rows are the caller's fallbacks for the non-TTY case.
    rows: terminalRows(opts.rows || 24),
    cols: terminalCols(opts.width || 80),
  });

  /** Render at the size the glass has NOW, re-taking if it moves underneath the
   *  render. The glass settles after exec — a host opens a pane and then sizes it
   *  — so a single render is a snapshot of a width that may already be gone, and
   *  the terminal then soft-wraps whatever filled the old one: an elided code
   *  fence, diagram art, or the chip-padded heading line, whose `…` lands on the
   *  next line until a SIGWINCH re-renders. Bounded to three takes; if the glass
   *  is still moving, paint what we have and let the resize handler finish.
   *  (Dogfood find, 2026-10-07.) */
  const renderAtGlass = async (source: string): Promise<string[]> => {
    let out = await renderLines(source, dims().cols);
    for (let take = 0; take < 2 && renderCols !== dims().cols; take++) {
      out = await renderLines(source, dims().cols);
    }
    return out;
  };

  // Enter the alt-screen *before* the first read+render: the file fetch and
  // the markdown render are async, and doing them in the primary screen
  // flashes the user's shell scrollback for a frame (the FUT — flash of
  // unstyled terminal). A blank alt-screen during the read reads as
  // "loading," not "glitch"; content of the transitional frame beats its
  // duration (brief: launcher-fut — the ordering half of the fix).
  // Alt-scroll is the reader's own mode (ADR-031 dogfood: the launcher
  // used to own it, but direct `okuda --tui` and `just dogfood` enter
  // without the launcher — the wheel died at every non-launcher door).
  process.stdout.write(ENTER_ALT + HIDE_CURSOR + "\x1b[?1007h");

  // Main-document state (ADR-031) — declared before the first render,
  // which annotates from the map. The jump map belongs to the MAIN
  // document and is derived from its source (vectors.ts) — rebuilt on
  // main reload, never on dereference. The backstack is depth one
  // (main → one dereference → u unwinds); the painted `[NN]` badges are
  // a projection of the map — the main render annotates, dereferenced
  // renders are clean.
  const mainFile = opts.file;
  const deriveMain = (text: string): Map<number, string> => jumpMapFor(text, opts.resolves);
  let mainText = "";
  let mainJumps: Map<number, string> = new Map();
  let backstack: { file: string; scroll: number }[] = [];
  let numBuffer: NumBuffer = null; // the digit-run state (BRF-PROLONGED-PRESS)

  // Initial fetch through the gate: prev=null is the initial-load sentinel,
  // so a successful first read is `changed` (content arrived) and a failed
  // first read is `failed` with empty lines (no last-known-good to retain).
  // The map is derived BEFORE the first render — the initial frame is a
  // main render and must arrive annotated. (Bug, found by dogfood: the
  // map was derived after the initial render, so the first frame
  // annotated against an empty map and opened bare.)
  const initialFetch = await readSource();
  if (initialFetch.ok) {
    mainText = initialFetch.text;
    mainJumps = deriveMain(mainText);
  }
  const initialRender = initialFetch.ok
    ? await renderAtGlass(
        appendReferences(annotateSource(initialFetch.text, mainJumps), mainJumps),
      )
    : [];
  const init = gateFetch(null, initialFetch, initialRender);
  let lines: string[] = init.lines;
  let fetchState: FetchState = init.state; // footer stamp reads this (brief: fetch-state-stamp)
  let scroll = 0;
  /** The geometry the glass currently holds — the frame's second input
   *  (ADR-RESIZE-GEOMETRY-046). `paint` is the only writer, so the token
   *  always describes what is actually on the screen, not what was asked
   *  for. Empty until the first paint. */
  let paintedGeometry = "";
  let showHints = false; // `?` toggles: compact % footer ↔ verbose hints

  /** Footer flash (ADR-031): the actuator's honest failure surface and
   *  the clone verb's receipt. Drawn on the hints row for a breath, then
   *  cleared — never a crash, never a silent nothing. */
  let flashMsg: string | null = null;
  let flashTimer: ReturnType<typeof setTimeout> | null = null;
  const flash = (msg: string, role: "alert" | "state-ok" = "alert"): void => {
    flashMsg = msg;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      flashMsg = null;
      flashTimer = null;
      paint();
    }, 2500);
    paint();
  };

  /** The clone verb (`99`, ADR-031): promote the currently rendered
   *  document to main of a NEW instance, via the host. tmux is the
   *  contract (the porch matrix's landing surface); OKUDA_CLONE_CMD is
   *  the escape hatch ($1 = the document); no host → honest flash. The
   *  clone re-derives its own map — nothing transfers, nothing mutates. */
  /** Frozen mode (`03`, keyboard-controls): the document stays still —
   *  the fs.watch auto-re-render is suppressed. `r` remains the manual
   *  override, resize still follows the glass. */
  let frozen = false;
  /** Render mode (keyboard-controls): `slide` = the continuous surface
   *  (default); `frame` = the okudagram frame — j/k and ␣/b step one
   *  contiguous glass page (height − overlap, BRF-OKUDAGRAM-STEP:
   *  no gaps in coverage), arrows stay slippy within (their own
   *  line actions — the frame brief's claim, true in code at last),
   *  }/{ and ]]/[[ serve every mode. Mode is per-instance, no memory
   *  across clones. */
  let renderMode: "slide" | "frame" = "slide";

  /** Edit the current document (`88`, the pair to `99` clone): the same
   *  document, in the declared editor. A GUI editor (zed, code, …) is
   *  spawned DIRECTLY — it hands the file to a running app and returns,
   *  so spinning up a terminal to host it would be pure overhead; a
   *  terminal editor rides the clone grammar's terminal integration,
   *  where the login shell can find it (the spawn-boundary lesson,
   *  clone.ts). The file is the contract: nothing mutates here, the
   *  editor owns the write. */
  const edit = (): void => {
    if (readOnlyActive()) {
      flash("read-only: edit disabled");
      return;
    }
    const doc = currentFile;
    const editor = resolveEditor();
    const integration = process.env.OKUDA_CLONE ?? "ghostty-edit";
    const spec = editArgs(doc, integration, editor);
    if ("error" in spec) {
      flash(`edit: ${spec.error}`);
      return;
    }
    Bun.spawn([spec.cmd, ...spec.args], { stdin: "ignore", stdout: "ignore", stderr: "ignore" });
    flash(`editing: ${basename(doc)} (${editor.name})`, "state-ok");
  };

  const clone = (): void => {
    if (readOnlyActive()) {
      flash("read-only: clone disabled");
      return;
    }
    const doc = currentFile;
    const integration = process.env.OKUDA_CLONE ?? "ghostty";
    const spec = cloneArgs(integration, doc);
    if ("error" in spec) {
      // Fall back to the inline tmux / OKUDA_CLONE_CMD paths for
      // integrations cloneArgs doesn't know (legacy compat).
      if (process.env.TMUX) {
        const r = Bun.spawnSync(["tmux", "new-window", "-c", process.cwd(), "gloam", doc]);
        if (r.exitCode === 0) flash(`cloned: ${doc}`, "state-ok");
        else flash(`clone failed (tmux new-window exit ${r.exitCode})`);
      } else if (process.env.OKUDA_CLONE_CMD) {
        const r = Bun.spawnSync(["sh", "-c", process.env.OKUDA_CLONE_CMD, "okuda-clone", doc]);
        if (r.exitCode === 0) flash(`cloned: ${doc}`, "state-ok");
        else flash(`clone failed (OKUDA_CLONE_CMD exit ${r.exitCode})`);
      } else {
        flash(`clone: ${spec.error}`);
      }
      return;
    }
    Bun.spawn([spec.cmd, ...spec.args], { stdin: "ignore", stdout: "ignore", stderr: "ignore" });
    flash(`cloned: ${basename(doc)}`, "state-ok");
  };

  const paint = (): void => {
    const { rows, cols } = dims();
    const height = contentHeight(rows); // separator row + badge row (BRF-FOOTER-SEPARATOR)
    let view = viewport(lines, scroll, height);
    if (scroll > view.maxScroll) {
      scroll = view.maxScroll;
      view = viewport(lines, scroll, height);
    }
    // One frame, one write (BRF-SYNC-OUTPUT): assembled whole, emitted
    // whole, bracketed so the terminal composites it atomically. The
    // clear strategy is unchanged in this brief — the bracket masks the
    // blank gap on the wire; removing it is option 1, deferred.
    let frame = "\x1b[2J\x1b[H"; // clear + home
    frame += view.visible.join("\n");
    const footer = footerLine(cols, "Gloam", currentFile, muted, badge, opts.silo, opts.callsignFor?.(currentFile) ?? undefined);
    // Chrome geometry (BRF-FOOTER-SEPARATOR): the badge owns the BOTTOM
    // edge — the last row, permanent identity under the transient; the
    // separator row above it is blank by default and carries hints and
    // flash when shown. The document terminator never touches the
    // badge; toggling hints paints one row, never reflows the content.
    frame += `\x1b[${rows};1H`;
    frame += footer;
    if (flashMsg) {
      // The flash owns the separator row while visible — warnings
      // outrank hints, both transient chrome above the badge.
      frame += `\x1b[${rows - 1};1H`;
      frame += styler.roleBold("alert", ` ${flashMsg} `.padEnd(cols).slice(0, cols));
    } else if (showHints) {
      frame += `\x1b[${rows - 1};1H`;
      frame += hintsLine(cols, muted);
    }
    // The stamp describes the frame the glass HOLDS, which is the geometry its
    // lines were RENDERED at — not the pane's geometry at paint time. Taking it
    // from the pane asserts that the glass holds a frame it does not hold, and
    // the next event at that width then compares equal and skips the repair.
    paintedGeometry = renderCols > 0 ? geometryOf(rows, renderCols) : "";
    // The whole point of the trace is this line beside the rerender's `skip`: a
    // pane narrower than `render` is the frame the terminal wraps, and a `skip`
    // whose cols equal the painted cols is a resize we were right to ignore.
    // `tty` is the terminal's OWN report beside our resolved width — when they
    // disagree, the fallback path is in play (the compiled-binary columns=0 bug
    // goes through `tput`), and a one-column disagreement is a jolt.
    frameTrace(
      `paint cols=${cols} rows=${rows} tty=${process.stdout.columns ?? "-"}x${process.stdout.rows ?? "-"} render=${renderCols} scroll=${scroll}`,
    );
    process.stdout.write(syncWrap(frame));
  };

  /** Re-render from source through the content gate, re-anchored (ADR-010
   *  semantics) — the one repaint path: resize, manual reload, and (brief:
   *  tui-live-documents) fs.watch all pin the line under the eye to its
   *  screen row. The gate is the mechanised "neither": identical content
   *  → `same`; a failed fetch → `failed`, retain the last-known-good. But
   *  the gate reads the CONTENT and the glass is a second input it cannot
   *  see, so the repaint decision is `needsRepaint`: a resize that changes
   *  only the height repaints on geometry, not on content
   *  (ADR-RESIZE-GEOMETRY-046). */
  const rerenderAnchored = async (reason: "watch" | "resize" | "reload"): Promise<void> => {
    // Frozen gates only the WATCHER — the document stays still while an
    // agent edits; resize follows the glass and `r` is the manual
    // override (keyboard-controls, 2026-09-05). No flag save/restore.
    if (frozen && reason === "watch") return;
    const { rows, cols } = dims();
    const live = geometryOf(rows, cols);
    // Geometry decisions happen BEFORE the fetch and the render, and they have to.
    // A re-render at a new width produces different lines, and the content gate
    // compares rendered LINES — it cannot tell that difference from a document
    // edit. So a hold taken after the render is always overridden by a "content
    // change" the hold itself caused, which is exactly how the first version of
    // ADR-WIDENING-LAG-054 failed: the pty run showed `render width=81` and a
    // repaint where it should have shown `hold`. Two things fall out of the same
    // move: a resize is a GEOMETRY signal and no longer doubles as a content
    // refresh (the watcher owns content; `r` is the manual override), and a
    // SIGWINCH whose geometry did not move costs nothing at all instead of a
    // 400-line render thrown away.
    if (reason === "resize") {
      if (live === paintedGeometry) {
        frameTrace(`skip cols=${cols} rows=${rows} (geometry unchanged)`);
        return;
      }
      if (!frameStale(live, paintedGeometry, CHROME_JITTER)) {
        frameTrace(`hold cols=${cols} render=${renderCols} (chrome jitter: widening lagged)`);
        return;
      }
    }
    const height = contentHeight(rows); // constant — separator + badge rows (BRF-FOOTER-SEPARATOR)
    const fetch = await readSource();
    const atMain = backstack.length === 0;
    if (fetch.ok && atMain) {
      mainText = fetch.text;
      mainJumps = deriveMain(mainText); // the map re-derives; no invalidation
    }
    // The main render annotates (ADR-031) and carries the generated
    // References section (ADR-047 — the map's receipt, downstream of the
    // paint so its callsigns never re-enter the map); dereferenced renders
    // are clean — no section, the two-render contract.
    const next = fetch.ok
      ? await renderAtGlass(
        atMain ? appendReferences(annotateSource(fetch.text, mainJumps), mainJumps) : fetch.text,
      )
      : [];
    const decision = gateFetch(lines, fetch, next);
    fetchState = decision.state;
    // Repaint on a content change OR a geometry change. The gate answers the
    // first; the glass answers the second — a height-only resize re-renders
    // identical lines, so the gate reads `same` and the frame still needs
    // laying out (ADR-RESIZE-GEOMETRY-046).
    if (!needsRepaint(decision.repaint, live, paintedGeometry)) {
      frameTrace(`skip cols=${cols} rows=${rows} painted=${paintedGeometry} content=${decision.repaint}`);
      return;
    }
    const oldLines = lines;
    lines = decision.lines;
    scroll = reanchoredScroll(oldLines, lines, scroll, height);
    paint();
  };

  const reload = (): void => { void rerenderAnchored("reload"); };

  /** Present a freshly fetched doc: set lines, re-extract the jump table,
   *  set scroll, repaint. Used by jump and back (forced loads — the gate's
   *  same/changed comparison is meaningless across different files, so
   *  prev=null semantics apply: the new doc always reads `changed`). The
   *  caller has already verified fetch.ok and pushed the backstack. */
  const present = (fetch: Fetch, next: string[], nextScroll: number): void => {
    lines = next;
    fetchState = fetch.ok ? "changed" : "failed";
    scroll = nextScroll;
    paint();
  };

  /** Actuate a vector: dereference the map's target and render it CLEAN
   *  (its references are not shown — the tour cannot proceed from here).
   *  Depth one: only the main document actuates. Optimistic paint means
   *  the target may not exist — the failure is a footer flash, and the
   *  wording belongs to the vector: "[14] — no document to render". */
  const jumpTo = async (token: number): Promise<void> => {
    if (backstack.length > 0) return; // dereferenced render is clean — nothing to actuate
    const target = mainJumps.get(token);
    if (!target) return; // no such vector — silent, per the old contract
    const path = resolveJumpTarget(mainFile, target, opts.resolveTarget, opts.root);
    if (!path) {
      flash(`§${token} — no document to render`);
      return;
    }
    const fetch = await readSource(path);
    if (!fetch.ok) {
      flash(`§${token} — no document to render`);
      return; // optimistic paint, honest failure — stay put, no stack push
    }
    backstack.push({ file: currentFile, scroll });
    currentFile = path;
    const next = await renderLines(fetch.text, dims().cols);
    present(fetch, next, 0);
  };

  /** Unwind (`u`): pop the dereference and re-render the MAIN document —
   *  annotated again, at its stored scroll. The map re-derives from the
   *  main source (which may have changed under us; derivation replaces
   *  invalidation). A vanished main is the one state we cannot rebuild —
   *  stay put. */
  const back = async (): Promise<void> => {
    const prev = backstack.pop();
    if (!prev) return;
    const fetch = await readSource(prev.file);
    if (!fetch.ok) return; // main gone — stay; entry dropped
    mainText = fetch.text;
    mainJumps = deriveMain(mainText);
    currentFile = prev.file;
    // Back is a MAIN render: annotated, and it ends with the map's
    // receipt (ADR-047) — the same foot the initial render carries.
    const next = await renderLines(
      appendReferences(annotateSource(fetch.text, mainJumps), mainJumps),
      dims().cols,
    );
    present(fetch, next, prev.scroll);
  };

  /** The verb handler table — the dispatch half of the grammar, beside
   *  KEYBINDINGS (the binding half). A new verb is one entry here and
   *  one there; the onKey loop never grows. */
  const verbHandlers: Partial<Record<Verb, () => void>> = {
    exit: () => cleanup(),
    frame: () => {
      renderMode = "frame";
      // Snap to the CURRENT frame's header — the frame fills from the
      // top, and a backward snap never gaps (forward would skip the
      // tail the reader is standing in; the step is theirs to take).
      scroll = frameBounds(headingLines(lines), lines.length, scroll).start;
      flash("frame mode — j/k ␣/b step a page, }/{ paragraph, ]]/[[ frame");
    },
    slide: () => {
      renderMode = "slide";
      frozen = false;
      flash("sliding mode");
    },
    freeze: () => {
      frozen = true;
      flash("frozen — the document stays still (r re-renders)");
    },
    edit: () => edit(),
    clone: () => clone(),
  };

  /** Reduce ONE key event to its effect. The reducer is pure up to the
   *  verb handlers; onKey feeds it every event in the read. Returns
   *  TRUE when this event ended the session (q/Esc/Ctrl-C, `00` exit):
   *  the caller stops feeding — a digit pair arriving in the same read
   *  as the exit key must never be reduced against a terminal that
   *  has already been restored (`0012` would jumpTo after cleanup;
   *  BRF-PROLONGED-PRESS layer 2, load-bearing independently of the
   *  burst). */
  const applyKey = (bytes: Uint8Array): boolean => {
    // A lone ESC (keyboard-controls: "ESC cancels partial vector") —
    // the user's escape from a half-typed sequence. Arrow sequences
    // arrive as multi-byte events (the lexer keeps them whole), so a
    // single-byte ESC is genuinely alone: stand the buffer down.
    if (bytes.length === 1 && bytes[0] === ESC) {
      if (numBuffer !== null) numBuffer = advanceNumBuffer(numBuffer, null).buffer;
      return false;
    }
    // Numeric jump buffer: two digits → token → verb. Any non-digit
    // (motion, escape sequence, letters) cancels a pending buffer.
    const digit = digitOf(bytes);
    const step = advanceNumBuffer(numBuffer, digit);
    numBuffer = step.buffer;
    if (step.token !== null) {
      const verb = verbFor(step.token);
      if (verb === "vector") {
        void jumpTo(step.token);
      } else {
        verbHandlers[verb]?.();
      }
      return cleaned; // the exit verb ended the session — report it
    }
    if (digit !== null) return false; // first digit only — buffer pending
    const action = decodeKey(bytes);
    if (action === null) return false;
    if (action === "quit") {
      cleanup();
      return true;
    }
    if (action === "back") { void back(); return false; }
    if (action === "help") {
      showHints = !showHints;
      paint();
      return false;
    }
    const { rows } = dims();
    const height = contentHeight(rows); // constant — separator + badge rows (BRF-FOOTER-SEPARATOR)
    const { maxScroll } = viewport(lines, 0, height);
    const half = Math.max(1, Math.floor(height / 2));
    switch (action) {
      // The step (BRF-OKUDAGRAM-STEP): the unit is the mode's. Frame
      // mode steps one contiguous glass page — height − overlap, never
      // a header-to-header leap, no gaps in coverage. Slide mode keeps
      // the line stride (the continuous surface).
      case "down":
        scroll = renderMode === "frame"
          ? pageStep(scroll, height, 1)
          : scroll + 1;
        break;
      case "up":
        scroll = renderMode === "frame"
          ? pageStep(scroll, height, -1)
          : scroll - 1;
        break;
      // The page stride: ␣/b and the Pg keys. The same contiguous unit
      // as the frame-mode step (one step, one contract); slide mode
      // keeps the full-page stride — also gap-free, zero overlap.
      case "page-down":
        scroll = renderMode === "frame"
          ? pageStep(scroll, height, 1)
          : scroll + height;
        break;
      case "page-up":
        scroll = renderMode === "frame"
          ? pageStep(scroll, height, -1)
          : scroll - height;
        break;
      // Slippy within — the arrows' own actions, in every mode.
      case "line-down": scroll += 1; break;
      case "line-up": scroll -= 1; break;
      // The paragraph motions (the VI stride): }/{ in every mode —
      // context on demand, the unit the voice interface steps by.
      case "para-down":
        scroll = snapFrame(paragraphStarts(lines), lines.length, scroll, 1);
        break;
      case "para-up":
        scroll = snapFrame(paragraphStarts(lines), lines.length, scroll, -1);
        break;
      // The frame jumps (]]/[[): the declared header-to-header skip —
      // may gap, honest because named. The step is not this.
      case "frame-down":
        scroll = snapFrame(headingLines(lines), lines.length, scroll, 1);
        break;
      case "frame-up":
        scroll = snapFrame(headingLines(lines), lines.length, scroll, -1);
        break;
      case "half-down": scroll += half; break;
      case "half-up": scroll -= half; break;
      case "top": scroll = 0; break;
      case "bottom": scroll = maxScroll; break;
      case "reload": void reload(); return false;
    }
    scroll = Math.min(Math.max(0, scroll), maxScroll);
    paint();
    return false;
  };

  /** The reader's entry point: split the read into key events, reduce
   *  each — and STOP at the first event that ended the session. The
   *  reducer is `applyKey`; the lexer is `splitKeyEvents`. (BRF-
   *  PROLONGED-PRESS layer 2: the loop is the bug's other half — the
   *  run buffer swallows a run's tail, but a token resolving in the
   *  same read as an exit used to be reduced against a restored
   *  terminal.) */
  const onKey = (data: Buffer): void => {
    for (const event of splitKeyEvents(new Uint8Array(data))) {
      if (applyKey(event)) break;
    }
  };

  // runTui blocks until the reader session ends. The `done` promise is
  // resolved by cleanup — AFTER the drain window (below) — `q`/Esc/Ctrl-C
  // (in raw mode, all decoded to `quit`) and `00` restore the terminal
  // and *return* to the caller, so the launcher's browse → read → browse
  // loop resumes the picker rather than dying (the bug that dropped the
  // reader straight to the shell). The launcher is in-process, so the
  // resolve is the query box's gate: it resumes only when the drain has
  // had its window. External SIGINT/SIGTERM (kill from another process)
  // still hard-exit.
  let cleaned = false;
  let resolveDone: () => void = () => {};
  const done = new Promise<void>((resolve) => { resolveDone = resolve; });
  /** The drain window (BRF-PROLONGED-PRESS layer 3). The bound is
   *  argued, then dogfooded — a heuristic on a queue, not a property
   *  of the grammar. Lower bound: the reader who exited by holding a
   *  key sees the restore, then lifts — a human planning+motor
   *  reaction, ~250 ms — and one further repeat interval (~33 ms at
   *  30 Hz) must still land inside the window. Upper bound: whatever
   *  the window eats is a keystroke typed at a query box that is not
   *  yet drawn, so the cost of too long is exit latency, never lost
   *  input — while too short is the original report, the spray.
   *  300 ms, with margin.
   *
   *  And OVER-DETERMINED: the dogfood verdict is that the beat is
   *  right in itself — reading is reception, the picker is
   *  selection, and the pause sets the reader up for the gear
   *  change (the exit fermata, ADR-EXIT-FERMATA-051). Two unrelated
   *  justifications, one constant — the safest kind, and never one
   *  to optimize away. */
  const DRAIN_WINDOW_MS = 300;
  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    // The flash's 2500 ms clear-timer is a LIVE-session affordance —
    // at session end it is void: an exit taken inside a flash's
    // lifetime (a clone, then `q` within the breath) left the timer
    // pending past the restore, and its repaint painted a FULL
    // document into whatever holds the tty next — against a pty that
    // is no longer being read, that paint blocks the process in
    // write forever. Found live by the dogfood probe (the second
    // session hung deterministically; the first survived by luck —
    // its flash had already cleared). Nothing paints after cleanup;
    // the drain owns the exit's every byte.
    if (flashTimer) {
      clearTimeout(flashTimer);
      flashTimer = null;
    }
    // The drain: a discarding listener, installed BEFORE onKey's
    // removal — order matters, because bytes already buffered inside
    // the Node stream (not merely the tty queue) are delivered to
    // whoever attaches next, and the launcher's picker is the next
    // attacher. Raw mode holds for the window so the discarded tail
    // never echoes.
    //
    // The EXIT ORDER (the FOUT fix): the alt-screen is left as the
    // LAST byte, after the window — not at cleanup's entry. Writing
    // the restore at entry handed the primary screen the whole window
    // as stage time (300 ms of raw terminal between leave and the
    // launcher's re-enter — the operator's report: a flash of the raw
    // terminal before the search pane). The launcher-fut brief's own
    // entry-side lesson, applied to the exit: the content of the
    // transitional frame beats its duration — a frozen document frame
    // for the window reads as a hold, an empty primary screen reads
    // as a glitch. And the direct-CLI path gets honesty for free: the
    // shell prompt now appears at +300 ms WHEN it is typeable (the
    // drain holds raw stdin until then) — later, but no longer a
    // lying prompt that eats keystrokes.
    const drain = (): void => {}; // consume — never echo, never queue
    process.stdin.on("data", drain);
    process.stdin.removeListener("data", onKey);
    process.removeListener("SIGWINCH", onWinch);
    process.removeListener("SIGINT", onSignal);
    process.removeListener("SIGTERM", onSignal);
    setTimeout(() => {
      process.stdin.removeListener("data", drain);
      process.stdin.setRawMode?.(false);
      process.stdin.pause?.();
      process.stdout.write(SHOW_CURSOR + "\x1b[?1007l" + EXIT_ALT); // last byte
      resolveDone(); // the launcher resumes here — after the drain
    }, DRAIN_WINDOW_MS);
  };

  // Enter (raw mode + listener only — the alt-screen switch happened
  // before the first read so no FUT frames the launch).
  process.stdin.setRawMode?.(true);
  process.stdin.resume();
  process.stdin.on("data", onKey);

  // Resize: re-render at the new geometry. Preserve the reading position by
  // anchoring on the non-blank line nearest the viewport middle (the eye
  // proxy) and pinning it back to the same screen row. The text-match is
  // bounded to one viewport — small-moderate reflow hits a near match
  // precisely; a big resize correctly misses and falls back to
  // proportional (preserve the reading fraction), which is imprecise but
  // never jumps to the top. A vertical resize does not reflow, so the lines
  // are unchanged and the anchor is index-preserving — but it DOES change
  // the geometry, so the repaint is forced by `needsRepaint` and not by the
  // gate; trusting the gate alone left the newly uncovered rows blank and a
  // shrink's footer addressing a row that no longer existed
  // (ADR-RESIZE-GEOMETRY-046). (brief: resize-content-anchor)
  const onWinch = (): void => {
    const d = dims();
    // The event line carries the terminal's own report beside our resolved
    // width: a SIGWINCH that arrives with the two in disagreement is the
    // fallback path answering, and a SIGWINCH that changes neither is an event
    // we are right to ignore.
    frameTrace(
      `resize cols=${d.cols} rows=${d.rows} tty=${process.stdout.columns ?? "-"}x${process.stdout.rows ?? "-"}`,
    );
    void rerenderAnchored("resize");
  };
  process.on("SIGWINCH", onWinch);

  // Clean exit on signal: restore the terminal, then hard-exit. A signal
  // from outside is a hard interrupt, not a return-to-picker; in raw mode
  // Ctrl-C is byte 0x03 (decoded `quit`), so this path is for `kill -INT`
  // only — cleanup runs first so the terminal is never left in alt-screen.
  const onSignal = (): void => { cleanup(); process.exit(130); };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  paint();
  await done;
}

export { HINTS };
