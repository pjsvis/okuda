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
import { loadPalette, type Palette } from "./palette";
import { renderDocument } from "./render";
import { terminalCols, terminalRows } from "./width";

export interface TuiOptions {
  file: string;
  width: number;
  rows: number;
  palette?: Palette;
}

/** Decoded keystroke action. `null` = unhandled (no-op). */
export type KeyAction =
  | "quit" | "down" | "up"
  | "page-down" | "page-up"
  | "half-down" | "half-up"
  | "top" | "bottom" | "reload"
  | "help"
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

const HINTS = "q quit · j/k scroll · ␣/b page · g/G top/bottom · Ctrl-D/U half · r reload";

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

export function displayPath(file: string): string {
  const parts = file.split("/").filter(Boolean);
  if (parts.length <= 1) return file;
  return parts.slice(-2).join("/");
}

/** Compact LHS: the help affordance only. Pure. */
function compactLeft(): string {
  return "? help";
}

/** Viewport height: total rows minus the footer, minus the hints row
 *  when verbose hints are toggled on — they get a row of their own;
 *  the verbose line never fits the footer without wrapping. Pure. */
export function contentHeight(rows: number, showHints: boolean): number {
  return rows - 1 - (showHints ? 1 : 0);
}

/**
 * Compose the footer: badge + folder/filename left (identity leads —
 * the glance position), `? help` right (affordance trails). Always
 * compact — verbose hints live on their own row (see contentHeight).
 */
export function footerLine(
  width: number,
  label: string,
  file: string,
  muted: (s: string) => string,
  badge: (s: string) => string,
): string {
  const name = displayPath(file);
  const rightText = compactLeft();
  // Left: badge (label + 2 padding) + space + folder/file.
  const leftWidth = label.length + 2 + 1 + name.length;
  // Reserve the last column: Apple's rounded window corner clips the
  // bottom-right cell — the footer never writes it.
  const gap = Math.max(1, width - leftWidth - rightText.length - 1);
  return badge(label) + " " + muted(name) + " ".repeat(gap) + muted(rightText) + " ";
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

  const readSource = async (): Promise<string> => {
    const f = Bun.file(opts.file);
    return await f.exists() ? await f.text() : "";
  };

  const renderLines = async (source: string, width: number): Promise<string[]> => {
    const out = await renderDocument(source, { width, palette, color });
    return out.split("\n");
  };

  let lines: string[] = await renderLines(await readSource(), opts.width);
  let scroll = 0;
  let showHints = false; // `?` toggles: compact % footer ↔ verbose hints

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
    process.stdout.write("\x1b[2J\x1b[H"); // clear + home
    process.stdout.write(view.visible.join("\n"));
    // Hints: own row above the footer, muted (they never fit the footer).
    if (showHints) {
      process.stdout.write(`\x1b[${rows - 1};1H`);
      process.stdout.write(muted(HINTS));
    }
    // Footer at the last row: badge + folder/file left, ? help right.
    process.stdout.write(`\x1b[${rows};1H`);
    process.stdout.write(footerLine(cols, "Gloam", opts.file, muted, badge));
  };

  /** Re-render from source, re-anchored (ADR-010 semantics) — the one
   *  repaint path: resize, manual reload, and (brief: tui-live-documents)
   *  fs.watch all pin the line under the eye to its screen row. */
  const rerenderAnchored = async (): Promise<void> => {
    const height = contentHeight(dims().rows, showHints);
    const oldLines = lines;
    lines = await renderLines(await readSource(), dims().cols);
    scroll = reanchoredScroll(oldLines, lines, scroll, height);
    paint();
  };

  const reload = (): void => { void rerenderAnchored(); };

  const onKey = (data: Buffer): void => {
    const action = decodeKey(new Uint8Array(data));
    if (action === null) return;
    if (action === "quit") return cleanup();
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
      case "down": scroll += 1; break;
      case "up": scroll -= 1; break;
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

  let cleaned = false;
  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    process.stdin.removeListener("data", onKey);
    process.stdin.setRawMode?.(false);
    process.stdin.pause?.();
    process.stdout.write(SHOW_CURSOR + EXIT_ALT);
    process.exit(0);
  };

  // Enter.
  process.stdout.write(ENTER_ALT + HIDE_CURSOR);
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

  // Clean exit on signal.
  const onSignal = (): void => cleanup();
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  paint();
}

export { HINTS };
