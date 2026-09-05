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
  /** Bold + italic + colour — the ***bold italic*** combo. Glow renders
   *  the combo in the EMPHASIS colour (not strong's), so this is emitted
   *  with the emphasis role, not strong. */
  roleBoldItalic(name: keyof Palette, text: string): string;
  /** Underline + colour (links). */
  roleUnderline(name: keyof Palette, text: string): string;
  /** Badge: bg + fg + space-padded text (TUI footer chrome). */
  badge(text: string): string;
  /** Bold, no colour (H4+ collapse, table plain text). */
  bold(text: string): string;
  /** Strikethrough. */
  strike(text: string): string;
  /** Fenced code line: background + code-text colour. */
  codeLine(line: string): string;
  /** Inline codespan: backticks preserved, code colours. */
  codespan(text: string): string;
  /** Render a hyperlink: link text (rose) + visible URL (cyan underline),
   *  glow-faithful. No OSC 8 — the URL is displayed, satisfying terminals
   *  that need it visible. (Pass C, 2026-08-24; superseded the OSC 8-only
   *  approach that hid the URL.) */
  link(text: string, url: string): string;
  /** Blockquote pipe prefix. */
  quotePipe(): string;
  /** Table header cell separator: muted `│` (colour mode) / plain `│` (none). */
  tablePipe(): string;
  /** Thematic rule to `width` columns. */
  rule(width: number): string;
  /** Heading badge: the `#` markers rendered as a solid colour block
   *  (bg = fg = heading colour → the glyph disappears into the block).
   *  Under `none`, returns the markers unchanged (NO_COLOR parity: the
   *  hashes are still there, just invisible in colour mode). */
  headingBadge(markers: string): string;
  /** Heading RHS chip: a solid muted-coloured block (bg=fg=muted on `█`),
   *  constant 1 cell — the H1 unit, a fixed reference the LHS badge is
   *  measured against (LHS encodes depth; RHS references it). Muted, not
   *  heading-coloured: the chip does structural work (coordinate frame),
   *  not declarative work — it orients without demanding attention. Same
   *  colour as the Gloam footer's structural text, completing the diagonal:
   *  heading blue on top+LHS (content), muted on RHS+footer (viewer chrome).
   *  Under `none`, the plain `█` (structural parity). */
  headingChip(): string;
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
      // NO_COLOR strips colour, not attributes — the silcrow's redundant
      // weight channel survives (SGR 1 is not colour). The doc's "weight
      // remains" claim is true. Closed with a full \x1b[0m reset per the
      // wrap invariant (no partial \x1b[22m).
      roleBold: (_n, text) => `\x1b[1m${text}${RESET}`,
      roleItalic: (_n, text) => text,
      roleBoldItalic: (_n, text) => text,
      roleUnderline: (_n, text) => text,
      badge: (text) => ` ${text} `, // padding kept in both modes (shape parity)
      bold: (text) => text,
      strike: (text) => text,
      codeLine: (line) => line,
      codespan: (text) => text, // Pass B: backticks stripped in both modes (parity)
      // Pass C: none-mode link still shows the URL (parity invariant —
      // truecolor emits 'text url', none must too, or line breaks differ).
      link: (text, url) => url ? `${text} ${url}` : text,
      quotePipe: () => "│",
      tablePipe: () => "│",
      rule: (width) => "─".repeat(width),
      headingBadge: (markers) => markers,
      headingChip: () => "█",
      open: () => "",
      reset: () => "",
    };
  }

  const wrap = (prefix: string, text: string) => `${prefix}${text}${RESET}`;
  return {
    mode,
    role: (name, text) => wrap(fg(palette[name]), text),
    roleBold: (name, text) => wrap(sgr(fgParams(palette[name]), "1"), text),
    roleItalic: (name, text) => wrap(sgr(fgParams(palette[name]), "3"), text),
    roleBoldItalic: (name, text) => wrap(sgr(fgParams(palette[name]), "1", "3"), text),
    roleUnderline: (name, text) => wrap(sgr(fgParams(palette[name]), "4"), text),
    // Gloam footer badge: pink bg, near-white fg, 1-space padding each
    // side so the bg reads as a contained pill, not a stripe.
    badge: (text) => `${bg(palette["badge-bg"])}${fg(palette["badge-fg"])} ${text} ${RESET}`,
    bold: (text) => wrap("\x1b[1m", text),
    strike: (text) => wrap("\x1b[9m", text),
    // Pass B (2026-08-24): code background dropped for glow parity (the
    // bg read as a blurry box). The `okuda` preset re-activated it
    // (2026-08-25): a content-sized coloured panel behind fenced code —
    // the LCARS affordance, a deliberate divergence from glow.
    // Retired again 2026-09-02: the panel read as a second background
    // behind a perfectly adequate one (the terminal's own). The role
    // stays — colour tuning may yet earn a subtler bg; an empty string
    // emits nothing. The rule is the user's: one background, no more.
    // Empty code-background = no bg (default); hex = bg emitted.
    codeLine: (line) => {
      const cdbg = palette["code-background"];
      return cdbg
        ? `${bg(cdbg)}${fg(palette["code-text"])}${line}${RESET}`
        : `${fg(palette["code-text"])}${line}${RESET}`;
    },
    codespan: (text) => `${fg(palette["code-text"])}${text}${RESET}`,
    // Pass C (2026-08-24): glow-faithful link — rose text + visible
    // cyan-underlined URL, no OSC 8. The URL is displayed inline (the
    // operator's terminal requires it visible, not just clickable).
    link: (text, url) =>
      `${wrap(sgr(fgParams(palette["link-text"])), text)} ${wrap(sgr(fgParams(palette["link-url"]), "4"), url)}`,
    quotePipe: () => `${fg(palette.blockquote)}│${RESET}`,
    tablePipe: () => `${fg(palette.muted)}│${RESET}`,
    rule: (width) => `${fg(palette.muted)}${"─".repeat(width)}${RESET}`,
    // Heading badge: bg = fg = heading colour. The `#` glyph renders in
    // heading colour on a heading-coloured background → a solid colour
    // block the width of the level (1 char H1, 6 chars H6). LCARS tab.
    headingBadge: (markers) =>
      `${bg(palette.heading)}${fg(palette.heading)}${markers}${RESET}`,
    // Heading RHS chip — a solid muted-coloured block (bg=fg=muted on
    // `█`), constant 1 cell. The chip does structural work (coordinate
    // frame), not declarative — muted, not heading-coloured, so it orients
    // without demanding attention. Same colour as the Gloam footer's
    // structural text, completing the diagonal: heading blue top+LHS
    // (content), muted RHS+footer (viewer chrome).
    headingChip: () => `${bg(palette.muted)}${fg(palette.muted)}█${RESET}`,
    open: (name) => fg(palette[name]),
    reset: () => RESET,
  };
}

/** If `children` is a single bold-coloured span (roleBold output for
 *  `palette.strong`), return its inner text; otherwise null.
 *
 *  Bun nests `***bold italic***` as emphasis(strong(text)) post-order —
 *  the emphasis handler is outer and receives strong's rendered span as
 *  its `children`. Glow renders the combo in the EMPHASIS colour (not
 *  strong's), so the emphasis handler uses this to detect a pure strong
 *  child and re-emit as one combined SGR (roleBoldItalic). The lazy
 *  inner stops at the first reset, so multi-span children (which would
 *  lose information if collapsed) fall through to the nested path. */
export function unwrapStrongSpan(
  children: string,
  palette: Palette,
): string | null {
  const re = new RegExp(
    "^\\x1b\\[" + fgParams(palette.strong) + ";1m([\\s\\S]*?)\\x1b\\[0m(?:\\x1b\\[0m)*$",
  );
  const m = children.match(re);
  return m ? m[1]! : null;
}
