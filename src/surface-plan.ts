/**
 * surface-plan.ts — the figure-ground pair's lifecycle, as bytes.
 *
 * The pair is the glass's (`ADR-GLASS-INK-073`), so a program that calibrates or
 * holds it is a **tenant**: read what the host has, take it, give it back. This
 * module is that tenancy and nothing else — pure, so the *order* is asserted
 * rather than discovered at a terminal.
 *
 * Three rules, each one a bug already paid for:
 *
 *  1. **No read, no tenancy.** A set without a give-back is a leak, and a timeout
 *     means own nothing — `scripts/probe-osc.ts`'s own rule, one level down. Here
 *     it is enforced structurally: the reply is an argument, so a plan cannot be
 *     built for a host that never answered.
 *  2. **Not ours under a multiplexer.** `$TMUX`, `$STY`, Herdr, Zellij and Wezterm
 *     proxy the answer, so the reply that comes back may describe a pane rather
 *     than the glass. Refuse, and inherit. The test is the environment, not the
 *     reply — a multiplexer that answers politely is still not the glass.
 *  3. **Give back what the host said**, the exact string, not a re-serialised hex:
 *     `rgb:1e1e/1e1e/2e2e` and `#1e1e2e` are both in the wild, and only one of
 *     them is what that host will accept as itself.
 *
 * **What this module does not own: the screen.** The alt-screen belongs to the
 * caller; what the caller must respect is that `leave` runs *before* the screen
 * is left. A full-screen program that exits the alt-screen still holding the pair
 * paints one frame of the wrong page — the FOUT class — so the pair's restore is
 * here and the screen's exit is not.
 *
 * **Why `enter` is the set half only.** A function that emits both a question and
 * its own answer cannot fail closed: it would have to write a read before knowing
 * whether it may own. So the read is `QUERY`, a separate export the caller sends
 * first, and `surfacePlan` refuses without its result.
 */

/** The wire vocabulary: CSI, the string terminator, and the bell some hosts
 *  answer with. Exported because the caller writes and reads these bytes too. */
export const ESC = "\x1b";
export const ST = `${ESC}\\`;
const BEL = "\x07";

/** The nine facts the lifecycle is allowed to know about its host. Named reads,
 *  one at a time, so no environment object is ever handed around. */
export interface HostEnv {
  TERM?: string | undefined;
  COLORTERM?: string | undefined;
  TERM_PROGRAM?: string | undefined;
  TMUX?: string | undefined;
  STY?: string | undefined;
  HERDR_ENV?: string | undefined;
  HERDR_PANE_ID?: string | undefined;
  ZELLIJ?: string | undefined;
  WEZTERM_PANE?: string | undefined;
}

/** What the host answered, byte-for-byte. The strings are kept, not their parse:
 *  the parse is for reading, the string is for giving back. */
export interface SurfaceReply {
  bg: string;
  fg: string;
}

/** A host that can be asked at all, and what it said. `reply` absent means it
 *  never answered — the case the plan must inherit on, not retry. */
export interface Host extends HostEnv {
  tty: boolean;
  reply?: SurfaceReply | null;
}

export type Command = "own" | "inherit";

export interface SurfacePlan {
  command: Command;
  /** The set bytes, in order: foreground, then background. Empty when inherit. */
  enter: string[];
  /** The give-back bytes, in order: foreground, then background. Empty when inherit. */
  leave: string[];
}

/** The read half. Background first, matching the probe's own order. */
export const QUERY = {
  bg: `${ESC}]11;?${ST}`,
  fg: `${ESC}]10;?${ST}`,
} as const;

/** One default-colour assignment. Only `OSC 10` and `OSC 11` — the palette
 *  (`OSC 4`), the cursor (`OSC 12`) and the reset-to-initial pair (`OSC 110`,
 *  `OSC 111`) are deliberately absent: the pair in play is exactly what the
 *  gates measure. */
export function setOsc(code: 10 | 11, value: string): string {
  return `${ESC}]${code};${value}${ST}`;
}

/** The host facts, named one at a time. Not a single object read and handed
 *  around: a wholesale environment read is how values that were never wanted end
 *  up in a transcript, and nothing here needs more than these nine. */
export function hostFacts(): HostEnv {
  return {
    TERM: process.env.TERM,
    COLORTERM: process.env.COLORTERM,
    TERM_PROGRAM: process.env.TERM_PROGRAM,
    TMUX: process.env.TMUX,
    STY: process.env.STY,
    HERDR_ENV: process.env.HERDR_ENV,
    HERDR_PANE_ID: process.env.HERDR_PANE_ID,
    ZELLIJ: process.env.ZELLIJ,
    WEZTERM_PANE: process.env.WEZTERM_PANE,
  };
}

/** The hosts whose answers cannot be trusted to describe the outermost glass. */
export function multiplexer(host: HostEnv): string | null {
  if (host.TMUX) return "tmux";
  if (host.STY) return "screen";
  if (host.HERDR_ENV || host.HERDR_PANE_ID) return "herdr";
  if (host.ZELLIJ) return "zellij";
  if (host.WEZTERM_PANE) return "wezterm";
  return null;
}

/** `rgb:R/G/B` with each channel 1–4 hex digits, or `#rrggbb`. Both spellings are
 *  in the wild: xterm-family hosts answer in `rgb:`, several newer ones in hex. */
export function parseOscReply(reply: string, code: number): { hex: string | null; raw: string } | null {
  // \e]11;rgb:1e1e/1e1e/2e2e\e\\   |   \e]10;#cdd6f4\a
  const re = new RegExp(`\\x1b\\]${code};([^\\x07\\x1b]*)(?:${ESC}\\\\|${BEL})`);
  const m = reply.match(re);
  if (!m) return null;
  const raw = m[1]!;
  const rgb = raw.match(/^rgb:([0-9a-f]{1,4})\/([0-9a-f]{1,4})\/([0-9a-f]{1,4})$/i);
  if (rgb) {
    const scale = (s: string): string => {
      // X11's `rgb:` syntax: each component is a *fraction of the maximum
      // representable in its width*, not a left-aligned bit pattern. So `f` is
      // 15/15 = 1.0, not 0xf000/0xffff — the difference between #ff0088 and
      // #ef007c for a one-digit reply. Real hosts answer in 2 or 4 digits, but a
      // parse that is only right for the common case is a parse that lies quietly.
      const max = (1 << (4 * s.length)) - 1;
      return Math.round((parseInt(s, 16) / max) * 255).toString(16).padStart(2, "0");
    };
    return { hex: `#${scale(rgb[1]!)}${scale(rgb[2]!)}${scale(rgb[3]!)}`, raw };
  }
  const hex = raw.match(/^#[0-9a-f]{6}$/i);
  return hex ? { hex: raw.toLowerCase(), raw } : { hex: null, raw };
}

/** Why this host must be inherited rather than owned, or null when it may be
 *  owned. Every reason is a refusal in the caller's own words, because a
 *  fail-closed path that says nothing is indistinguishable from a bug. */
export function surfaceRefusal(host: Host): string | null {
  if (!host.tty) return "not a tty — a query from a pipe would be an answer about a pipe";
  const mux = multiplexer(host);
  if (mux) return `${mux} is present and its panes are not ours`;
  if (!host.reply?.bg) return "the background never answered, so there is nothing to give back";
  if (!host.reply?.fg) return "the foreground never answered, so there is nothing to give back";
  return null;
}

/** `own` when the host may be taken and given back, `inherit` otherwise. */
export function surfaceCommand(host: Host): Command {
  return surfaceRefusal(host) === null ? "own" : "inherit";
}

/** The lifecycle for a pair. Inherit returns two empty lists — **no byte at all**,
 *  not even a read: a fail-closed path that emits a read is still a state change.
 *  Own returns the set order (fg, bg) and the give-back order (fg, bg), the latter
 *  in the host's own spelling. */
export function surfacePlan(host: Host, pair: { bg: string; fg: string }): SurfacePlan {
  if (surfaceCommand(host) === "inherit") return { command: "inherit", enter: [], leave: [] };
  return {
    command: "own",
    enter: [setOsc(10, pair.fg), setOsc(11, pair.bg)],
    leave: [setOsc(10, host.reply!.fg), setOsc(11, host.reply!.bg)],
  };
}
