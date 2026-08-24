/**
 * ansi.ts — colour mode detection and SGR emitters per semantic role.
 *
 * Contract (brief 002):
 *  - NO_COLOR (any value) or TERM=dumb → no colour, plain text only.
 *  - FORCE_COLOR overrides detection (full colour even under TERM=dumb).
 *  - Default: full 24-bit truecolor. No 256/16-colour fallback logic.
 *  - Escape hygiene: every formatted line ends \\x1b[0m; styles pair
 *    opens with full resets only (an invariant the wrap state machine
 *    relies on).
 */

import { type Palette, RESET, bg, fg } from "./palette";

/** Build \x1b[...m from params, e.g. sgr("1", "38;2;224;222;244"). */
function sgr(...params: string[]): string {
  return `\x1b[${params.join(";")}m`;
}

/** Foreground params without the wrapper, for composition. */
function fgParams(hex: string): string {
  return fg(hex).slice(2, -1);
}


export type ColorMode = "truecolor" | "none";

/** Detect colour mode from the environment. */
export function detectColorMode(env: NodeJS.ProcessEnv): ColorMode {
  if (env.FORCE_COLOR !== undefined) return "truecolor";
  if (env.NO_COLOR !== undefined) return "none";
  if (env.TERM === "dumb") return "none";
  return "truecolor";
}

/**
 * Emitter bundle. All functions collapse to identity/plain text under
 * `none` — identical line breaks and spacing either way (NO_COLOR parity).
 */
export interface Styler {
  readonly mode: ColorMode;
  /** Wrap text in a role colour. */
  role(name: keyof Palette, text: string): string;
  /** Bold + colour. */
  roleBold(name: keyof Palette, text: string): string;
  /** Italic + colour. */
  roleItalic(name: keyof Palette, text: string): string;
  /** Underline + colour (links). */
  roleUnderline(name: keyof Palette, text: string): string;
  /** Bold, no colour (H4+ collapse, table plain text). */
  bold(text: string): string;
  /** Strikethrough. */
  strike(text: string): string;
  /** Fenced code line: background + code-text colour. */
  codeLine(line: string): string;
  /** Inline codespan: backticks preserved, code colours. */
  codespan(text: string): string;
  /** OSC 8 hyperlink wrapping styled text. */
  link(text: string, url: string): string;
  /** Blockquote pipe prefix. */
  quotePipe(): string;
  /** Thematic rule to `width` columns. */
  rule(width: number): string;
  /** Open sequence for a role (for state-machine re-emission). */
  open(name: keyof Palette): string;
  /** Reset sequence (empty string under `none`). */
  reset(): string;
}

export function makeStyler(palette: Palette, mode: ColorMode): Styler {
  if (mode === "none") {
    return {
      mode,
      role: (_n, text) => text,
      roleBold: (_n, text) => text,
      roleItalic: (_n, text) => text,
      roleUnderline: (_n, text) => text,
      bold: (text) => text,
      strike: (text) => text,
      codeLine: (line) => line,
      codespan: (text) => "`" + text + "`",
      link: (text, _url) => text,
      quotePipe: () => "│",
      rule: (width) => "─".repeat(width),
      open: () => "",
      reset: () => "",
    };
  }

  const wrap = (prefix: string, text: string) => `${prefix}${text}${RESET}`;
  return {
    mode,
    role: (name, text) => wrap(fg(palette[name]), text),
    roleBold: (name, text) => wrap(sgr("1", fgParams(palette[name])), text),
    roleItalic: (name, text) => wrap(sgr("3", fgParams(palette[name])), text),
    roleUnderline: (name, text) => wrap(sgr("4", fgParams(palette[name])), text),
    bold: (text) => wrap("\x1b[1m", text),
    strike: (text) => wrap("\x1b[9m", text),
    codeLine: (line) => `${bg(palette["code-background"])}${fg(palette["code-text"])}${line}${RESET}`,
    codespan: (text) => `${bg(palette["code-background"])}${fg(palette["code-text"])}\`${text}\`${RESET}`,
    link: (text, url) =>
      `\x1b]8;;${url}\x1b\\${wrap(sgr("4", fgParams(palette.link)), text)}\x1b]8;;\x1b\\`,
    quotePipe: () => `${fg(palette.blockquote)}│${RESET}`,
    rule: (width) => `${fg(palette.muted)}${"─".repeat(width)}${RESET}`,
    open: (name) => fg(palette[name]),
    reset: () => RESET,
  };
}
