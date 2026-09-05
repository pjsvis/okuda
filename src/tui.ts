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
import { annotateSource, jumpMapFor, CLONE_TOKEN } from "./vectors";
import { cloneArgs } from "./clone";
import { frameBounds, headingLines, snapFrame } from "./frames";
import { verbFor } from "./keygrammar";
import { loadPalette, type Palette } from "./palette";
import { renderDocument } from "./render";
import { basename, dirname, join } from "node:path";
import { padStartDisplay, terminalCols, terminalRows } from "./width";

export interface TuiOptions {
  file: string;
  width: number;
  rows: number;
  palette?: Palette;
  /** Silo badge (brief: silo-mnemonics). Undefined when unrooted → today's
   *  footer, no silo badge. The renderer paints the string; it learns
   *  nothing about trees or registries. */
  silo?: string;
  /** Per-file callsign resolver (the rooted launcher passes one; the TUI
   *  knows nothing of registries — ADR-020). Called per paint with the
   *  current file, so the identity run follows jumps. */
  callsignFor?: (file: string) => string | null;
  /** Vector actuation resolver (ADR-031): vector target → document path.
   *  File-existence first, callsign dispatch where rooted; null = no
   *  document (the actuator flashes honestly). Same ADR-020 boundary —
   *  a closure, never registry knowledge. */
  resolveTarget?: (target: string) => string | null;
}

/** Decoded keystroke action. `null` = unhandled (no-op). */
export type KeyAction =
  | "quit" | "down" | "up"
  | "page-down" | "page-up"
  | "half-down" | "half-up"
  | "top" | "bottom" | "reload"
  | "help" | "back"
  | null;

const ESC = 0x1b;

/**
 * Decode a raw stdin buffer to a symbolic action. Single-byte controls
 * (Ctrl-C/D/U, q, j, k, g, G, r) and the four common arrow/page escape
 * sequences (ESC [ A/B/5~/6~). Unknown bytes and partial sequences are
 * `null` (no-op) — a split escape read is re-synthesised on the next chunk.
 */
export function decodeKey(buf: Uint8Array): KeyAction {
  if (buf.length === 0) return null;
  const b0 = buf[0]!;
  // Single-byte controls.
  switch (b0) {
    case 0x03: return "quit";            // Ctrl-C
    case 0x04: return "half-down";      // Ctrl-D
    case 0x15: return "half-up";        // Ctrl-U
    case 0x1a: return "quit";           // Ctrl-Z (raw mode swallows SIGTSTP)
    case 0x71: return "quit";           // q
    case 0x51: return "quit";           // Q (Glow's convention)
    case 0x6a: return "down";           // j
    case 0x6b: return "up";             // k
    case 0x67: return "top";            // g
    case 0x47: return "bottom";         // G
    case 0x72: return "reload";         // r
    case 0x20: return "page-down";      // space — less/man convention
    case 0x62: return "page-up";        // b — less/man back convention
    case 0x3f: return "help";           // ? — toggle verbose hints
    case 0x75: return "back";           // u — pop the backstack
    // Backspace does not unwind (keyboard-controls): the silcrow
    // vocabulary owns the exits — `u` unwinds, `00` is OFF. A stray
    // backspace in a dereferenced document must not throw the reader
    // out of it.
  }
  // Escape sequences: ESC [ <final> or ESC [ <n> ~.
  if (b0 === ESC && buf.length >= 3 && buf[1] === 0x5b) {
    switch (buf[2]) {
      case 0x41: return "up";            // ESC [ A — ↑
      case 0x42: return "down";          // ESC [ B — ↓
      case 0x35: return "page-up";      // ESC [ 5 ~ — PgUp
      case 0x36: return "page-down";     // ESC [ 6 ~ — PgDn
    }
  }
  // SS3 arrows: ESC O <final>. Sent when DECCKM (application cursor
  // mode) is on — commonly left set by the shell's line editor. The same
  // keys as CSI arrows; alt-scroll wheels emit this form too.
  if (b0 === ESC && buf.length >= 3 && buf[1] === 0x4f) {
    switch (buf[2]) {
      case 0x41: return "up";            // ESC O A — ↑
      case 0x42: return "down";          // ESC O B — ↓
      case 0x35: return buf[3] === 0x7e ? "page-up" : null;    // ESC O 5 ~
      case 0x36: return buf[3] === 0x7e ? "page-down" : null;  // ESC O 6 ~
    }
  }
  // Lone Esc (length 1) — treat as quit; common pager convention.
  if (b0 === ESC && buf.length === 1) return "quit";
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

const HINTS = "00 off · j/k · ␣/b · g/G · r reload · NN deref · 99 clone · u unwind";

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

/** Viewport height: total rows minus the footer, minus the hints row
 *  when verbose hints are toggled on — the hints own the last row,
 *  beneath the badge row (identity above, transient affordances below).
 *  Pure. */
export function contentHeight(rows: number, showHints: boolean): number {
  return rows - 1 - (showHints ? 1 : 0);
}

/** The verbose hints line, right-justified on the last row with the
 *  corner column reserved. If it can't fit, it wraps — a legible
 *  'you are too narrow' rather than silent truncation. Pure. */
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

/** The result of advancing the two-digit numeric buffer one keystroke.
 *  `buffer` is the new pending state (null = empty); `token` is the
 *  resolved two-digit number when the buffer completed, else null.
 *  Pure. */
export interface NumBufferStep {
  buffer: string | null;
  token: number | null;
}

/** Advance the numeric jump buffer: a digit accumulates; at two digits
 *  the token resolves and the buffer resets to empty. A null digit (any
 *  non-digit key — motion, escape, letters) cancels a pending buffer so
 *  a stray keystroke never ambushes a half-typed token. Pure — the
 *  caller performs the IO (jumpTo/back) the resolved token implies. */
export function advanceNumBuffer(
  prev: string | null,
  digit: string | null,
): NumBufferStep {
  if (digit === null) return { buffer: null, token: null };
  const next = (prev ?? "") + digit;
  if (next.length >= 2) return { buffer: null, token: Number(next) };
  return { buffer: next, token: null };
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

/**
 * Compose the footer: badge + silo? + callsign? + folder/filename left
 * (identity leads — the glance position), `? help` right (affordance
 * trails). Always compact — verbose hints live on the last row (see
 * hintsLine).
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
      return { ok: true, text: await f.text() };
    } catch (err) {
      return { ok: false, reason: String(err) };
    }
  };

  const renderLines = async (source: string, width: number): Promise<string[]> => {
    const out = await renderDocument(source, { width, palette, color });
    return out.split("\n");
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
  const deriveMain = (text: string): Map<number, string> => jumpMapFor(text);
  let mainText = "";
  let mainJumps: Map<number, string> = new Map();
  let backstack: { file: string; scroll: number }[] = [];
  let numBuffer: string | null = null;

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
    ? await renderLines(annotateSource(initialFetch.text, mainJumps), opts.width)
    : [];
  const init = gateFetch(null, initialFetch, initialRender);
  let lines: string[] = init.lines;
  let fetchState: FetchState = init.state; // footer stamp reads this (brief: fetch-state-stamp)
  let scroll = 0;
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
   *  (default); `frame` = the okudagram frame — j/k step header to
   *  header, arrows stay slippy within, ␣/b page within (BRF-
   *  PAGED-OKUDAGRAM). Mode is per-instance, no memory across clones. */
  let renderMode: "slide" | "frame" = "slide";

  /** Edit a blank document (`09`): a new note in the CURRENT
   *  document's directory, opened in the declared editor inside a
   *  separate terminal (the clone grammar's own spin-up). The file is
   *  the contract — the silo picks it up by search; nothing mutates. */
  const editNew = (): void => {
    const dir = dirname(currentFile);
    const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
    const note = join(dir, `note-${stamp}.md`);
    const editor = process.env.OKUDA_EDITOR ?? process.env.EDITOR ?? "vi";
    const integration = process.env.OKUDA_CLONE ?? "edit-terminal";
    const spec = cloneArgs(integration, note, process.platform, dir, editor);
    if ("error" in spec) {
      flash(`edit: ${spec.error}`);
      return;
    }
    Bun.spawn([spec.cmd, ...spec.args], { stdio: "ignore" });
    flash(`editing: ${basename(note)}`, "state-ok");
  };

  const clone = (): void => {
    const doc = currentFile;
    if (process.env.TMUX) {
      const r = Bun.spawnSync(["tmux", "new-window", "-c", process.cwd(), "gloam", doc]);
      if (r.exitCode === 0) flash(`cloned: ${doc}`, "state-ok");
      else flash(`clone failed (tmux new-window exit ${r.exitCode})`);
    } else if (process.env.OKUDA_CLONE_CMD) {
      const r = Bun.spawnSync(["sh", "-c", process.env.OKUDA_CLONE_CMD, "okuda-clone", doc]);
      if (r.exitCode === 0) flash(`cloned: ${doc}`, "state-ok");
      else flash(`clone failed (OKUDA_CLONE_CMD exit ${r.exitCode})`);
    } else {
      flash("no clone host: run inside tmux or set OKUDA_CLONE_CMD");
    }
  };

  const dims = () => ({
    // terminalCols/Rows handle the Bun --compile columns=0 bug (tput fallback);
    // opts.width/rows are the caller's fallbacks for the non-TTY case.
    rows: terminalRows(opts.rows || 24),
    cols: terminalCols(opts.width || 80),
  });

  const paint = (): void => {
    const { rows, cols } = dims();
    const height = contentHeight(rows, showHints); // footer + optional hints row
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
    frame += `\x1b[${rows - 1};1H`;
    frame += footer;
    if (flashMsg) {
      // The flash owns the last row while visible — warnings outrank hints.
      frame += `\x1b[${rows};1H`;
      frame += styler.roleBold("alert", ` ${flashMsg} `.padEnd(cols).slice(0, cols));
    } else if (showHints) {
      frame += `\x1b[${rows};1H`;
      frame += hintsLine(cols, muted);
    }
    process.stdout.write(syncWrap(frame));
  };

  /** Re-render from source through the content gate, re-anchored (ADR-010
   *  semantics) — the one repaint path: resize, manual reload, and (brief:
   *  tui-live-documents) fs.watch all pin the line under the eye to its
   *  screen row. The gate is the mechanised "neither": identical content
   *  → `same`, no repaint; a failed fetch → `failed`, retain the
   *  last-known-good, no repaint; only a real change repaints. */
  const rerenderAnchored = async (): Promise<void> => {
    if (frozen) return; // frozen mode (keyboard-controls): the document stays still
    const { rows, cols } = dims();
    const height = contentHeight(rows, showHints);
    const fetch = await readSource();
    const atMain = backstack.length === 0;
    if (fetch.ok && atMain) {
      mainText = fetch.text;
      mainJumps = deriveMain(mainText); // the map re-derives; no invalidation
    }
    // The main render annotates (ADR-031); dereferenced renders are clean.
    const next = fetch.ok
      ? await renderLines(atMain ? annotateSource(fetch.text, mainJumps) : fetch.text, cols)
      : [];
    const decision = gateFetch(lines, fetch, next);
    fetchState = decision.state;
    if (!decision.repaint) return; // gate held, or source lost — keep the screen
    const oldLines = lines;
    lines = decision.lines;
    scroll = reanchoredScroll(oldLines, lines, scroll, height);
    paint();
  };

  const reload = (): void => {
    void (async () => {
      const wasFrozen = frozen;
      frozen = false;
      await rerenderAnchored();
      frozen = wasFrozen;
    })();
  };

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
    const path = opts.resolveTarget ? opts.resolveTarget(target) : target;
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
    const next = await renderLines(annotateSource(fetch.text, mainJumps), dims().cols);
    present(fetch, next, prev.scroll);
  };

  const onKey = (data: Buffer): void => {
    const bytes = new Uint8Array(data);
    // A lone ESC (keyboard-controls: "ESC cancels partial vector") —
    // the user's escape from a half-typed sequence. Arrow sequences
    // arrive as multi-byte reads, so a single-byte ESC is genuinely
    // alone: cancel the pending buffer and stand down.
    if (bytes.length === 1 && bytes[0] === ESC) {
      if (numBuffer !== null) numBuffer = advanceNumBuffer(numBuffer, null).buffer;
      return;
    }
    // Numeric jump buffer: two digits → token lookup. Any non-digit
    // (motion, escape sequence, letters) cancels a pending buffer.
    const digit = digitOf(bytes);
    const step = advanceNumBuffer(numBuffer, digit);
    numBuffer = step.buffer;
    if (step.token !== null) {
      const verb = verbFor(step.token);
      switch (verb) {
        case "exit": return cleanup();
        case "frame": {
          renderMode = "frame";
          const { start } = frameBounds(headingLines(lines), lines.length, scroll);
          scroll = start;
          flash("frame mode — j/k steps, arrows slippy within");
          break;
        }
        case "slide":
          renderMode = "slide";
          frozen = false;
          flash("sliding mode");
          break;
        case "freeze": frozen = true; flash("frozen — the document stays still (r re-renders)"); break;
        case "editNew": editNew(); break;
        case "edit": flash("edit current — the edit brief is not wired yet"); break;
        case "clone": clone(); break;
        case "vector": void jumpTo(step.token); break;
        default: break; // reserved, unassigned — acknowledged, silent
      }
      return;
    }
    if (digit !== null) return; // first digit only — buffer pending
    const action = decodeKey(bytes);
    if (action === null) return;
    if (action === "quit") return cleanup();
    if (action === "back") { void back(); return; }
    if (action === "help") {
      showHints = !showHints;
      paint();
      return;
    }
    const { rows } = dims();
    const height = contentHeight(rows, showHints);
    const { maxScroll } = viewport(lines, 0, height);
    const half = Math.max(1, Math.floor(height / 2));
    switch (action) {
      case "down":
        if (renderMode === "frame") {
          scroll = snapFrame(headingLines(lines), lines.length, scroll, 1);
        } else scroll += 1;
        break;
      case "up":
        if (renderMode === "frame") {
          scroll = snapFrame(headingLines(lines), lines.length, scroll, -1);
        } else scroll -= 1;
        break;
      case "page-down": scroll += height; break;
      case "page-up": scroll -= height; break;
      case "half-down": scroll += half; break;
      case "half-up": scroll -= half; break;
      case "top": scroll = 0; break;
      case "bottom": scroll = maxScroll; break;
      case "reload": void reload(); return;
    }
    scroll = Math.min(Math.max(0, scroll), maxScroll);
    paint();
  };

  // runTui blocks until the reader session ends. The `done` promise is
  // resolved by cleanup — `q`/Esc/Ctrl-C (in raw mode, all decoded to
  // `quit`) restore the terminal and *return* to the caller, so the
  // launcher's browse → read → browse loop resumes the picker rather
  // than dying (the bug that dropped the reader straight to the shell).
  // External SIGINT/SIGTERM (kill from another process) still hard-exit.
  let cleaned = false;
  let resolveDone: () => void = () => {};
  const done = new Promise<void>((resolve) => { resolveDone = resolve; });
  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    process.stdin.removeListener("data", onKey);
    process.stdin.setRawMode?.(false);
    process.stdin.pause?.();
    process.stdout.write(SHOW_CURSOR + "\x1b[?1007l" + EXIT_ALT);
    process.removeListener("SIGWINCH", onWinch);
    process.removeListener("SIGINT", onSignal);
    process.removeListener("SIGTERM", onSignal);
    resolveDone();
  };

  // Enter (raw mode + listener only — the alt-screen switch happened
  // before the first read so no FUT frames the launch).
  process.stdin.setRawMode?.(true);
  process.stdin.resume();
  process.stdin.on("data", onKey);

  // Resize: re-render at the new width. Preserve the reading position by
  // anchoring on the non-blank line nearest the viewport middle (the eye
  // proxy) and pinning it back to the same screen row. The text-match is
  // bounded to one viewport — small-moderate reflow hits a near match
  // precisely; a big resize correctly misses and falls back to
  // proportional (preserve the reading fraction), which is imprecise but
  // never jumps to the top. Vertical resize doesn't reflow, so the null
  // path keeps index-preservation, honest there. (brief:
  // resize-content-anchor)
  const onWinch = (): void => { void rerenderAnchored(); };
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
