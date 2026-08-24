/**
 * tui.ts — the control plane (brief: okuda-tui-control-plane).
 *
 * A game loop, not a framework. Input → update → paint → repeat.
 *
 *   alternate screen on → raw mode on → loop {
 *     read keystroke bytes
 *     advance scroll offset (or quit / reload)
 *     paint rendered lines through the viewport
 *     paint footer: keystroke hints left, Gloam right, muted
 *   } → raw mode off → alternate screen off
 *
 * Composes over the render plane (render.ts); never touches rendering.
 * NO_COLOR / TERM=dumb / non-TTY → the caller falls back to the streaming
 * renderer (brief: "falls back to the streaming renderer, no TUI").
 */

import { detectColorMode, makeStyler, type Styler } from "./ansi";
import { loadPalette, type Palette } from "./palette";
import { renderDocument } from "./render";

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
  // Lone Esc (length 1) — treat as quit; common pager convention.
  if (b0 === ESC && buf.length === 1) return "quit";
  return null;
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

const HINTS = "q quit · j/k scroll · g/G top/bottom · Ctrl-D/U half · r reload";

/** Scroll position as a percentage. Whole doc visible → 100. Pure. */
export function scrollPercent(scroll: number, maxScroll: number): number {
  if (maxScroll <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((scroll / maxScroll) * 100)));
}

/** Display path: folder/basename (Glow convention). Pure. */
export function displayPath(file: string): string {
  const parts = file.split("/").filter(Boolean);
  if (parts.length <= 1) return file;
  return parts.slice(-2).join("/");
}

/** Compact LHS: live state + help affordance. Pure. */
function compactLeft(pct: number): string {
  return `${pct}% · ? help`;
}

/**
 * Compose the footer (Glow layout): compact hints-or-percent left,
 * badge + folder/filename right, plain gap between. Pure.
 *
 * showHints=false (default): `NN% · ? help` left — live state wins.
 * showHints=true (toggled via `?`): the verbose HINTS line.
 */
export function footerLine(
  width: number,
  label: string,
  file: string,
  pct: number,
  showHints: boolean,
  muted: (s: string) => string,
  badge: (s: string) => string,
): string {
  const leftText = showHints ? HINTS : compactLeft(pct);
  const name = displayPath(file);
  // Right: badge (label + 2 padding) + space + folder/file.
  const rightWidth = label.length + 2 + 1 + name.length;
  const gap = Math.max(1, width - leftText.length - rightWidth);
  return muted(leftText) + " ".repeat(gap) + badge(label) + " " + muted(name);
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
    rows: process.stdout.rows || opts.rows || 24,
    cols: process.stdout.columns || opts.width || 80,
  });

  const paint = (): void => {
    const { rows, cols } = dims();
    const height = rows - 1; // reserve the last row for the footer
    let view = viewport(lines, scroll, height);
    if (scroll > view.maxScroll) {
      scroll = view.maxScroll;
      view = viewport(lines, scroll, height);
    }
    process.stdout.write("\x1b[2J\x1b[H"); // clear + home
    process.stdout.write(view.visible.join("\n"));
    // Footer at the last row: % left, badge + folder/file right.
    process.stdout.write(`\x1b[${rows};1H`);
    const pct = scrollPercent(view.scroll, view.maxScroll);
    process.stdout.write(footerLine(cols, "Gloam", opts.file, pct, showHints, muted, badge));
  };

  const reload = async (): Promise<void> => {
    lines = await renderLines(await readSource(), dims().cols);
    scroll = 0;
    paint();
  };

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
    const height = rows - 1;
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

  // Resize: re-render at the new width, clamp scroll.
  const onWinch = (): void => { void (async () => {
    lines = await renderLines(await readSource(), dims().cols);
    scroll = Math.min(scroll, viewport(lines, 0, dims().rows - 1).maxScroll);
    paint();
  })(); };
  process.on("SIGWINCH", onWinch);

  // Clean exit on signal.
  const onSignal = (): void => cleanup();
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  paint();
}

export { HINTS };
