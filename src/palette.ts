/**
 * palette.ts — semantic colour roles, named presets, and the
 * ~/.config/okuda/palette.json override loader.
 *
 * Contract: briefs/2026-08-22-brief-ansi-emission-and-closed-grammar.md
 * (palette table, byte-exact ANSI mappings) +
 * briefs/2026-08-23-brief-diagram-colour-classification.md (diagram roles).
 *
 * Diagram roles reuse existing colours so diagrams read as part of the
 * document, not a foreign panel.
 */

import { existsSync, readFileSync } from "node:fs";
import okudaPreset from "./palettes/okuda.json";

export type Role =
  | "heading"
  | "code-text"
  | "code-background"
  | "blockquote"
  | "link"
  | "link-text"
  | "link-url"
  | "badge-bg"
  | "badge-fg"
  | "emphasis"
  | "strong"
  | "table-header"
  | "table-key"
  | "muted"
  | "diagram-border"
  | "diagram-arrow"
  | "diagram-text"
  | "alert" // chrome-only: the fetch-state stamp's `failed` channel (ADR-015)
  // State-glyph vocabulary (brief: state-glyph-vocabulary, 2026-08-28):
  // closed lexicon applied by the renderer to the glyphs themselves —
  // not an author colourbrush. Converges across presets (traffic-lamp-
  // universality, extending ADR-015's alert precedent). state-failed
  // === alert by intent (same hex, two names).
  | "state-ok"
  | "state-todo"
  | "state-parked"
  | "state-failed"
  // Document reference — a bare .md path token in prose (e.g. an index
  // line's trailing `decisions/foo.md`). Distinct from links (URLs only,
  // per the render policy), distinct from code, and held separate so a
  // future mnemonic/callsign role can co-exist without collision.
  // Experimental (brief: index-and-jump): a greedy heuristic — colours
  // any .md mention in prose, not just index lines. The leap; learn the
  // reach by seeing it over-reach.
  | "doc-ref"
  // The vector paint (ADR-031): the numbered jump badges the main
  // document's render projects from the in-memory jump map. Reserved —
  // the markdown grammar cannot address this role, so painted numbers
  // are visibly ours and authored `[NN]` text can never imitate them.
  | "vector";

export type Palette = Record<Role, string>;

/** The Dracula palette — glow parity: aligned to `glow` (the CLI) as
 *  dogfooded at the terminal, which renders the Dracula truecolor palette. NB: this is NOT
 *  glamour's ANSI-256 DarkStyleConfig (ADR-006's original sourcing was
 *  wrong — see its 2026-08-24 amendment); the bytes from `glow <file>`
 *  are the reference, not glamour's styles.go.
 *
 * SGR emission order is colour-then-attribute (\x1b[38;2;R;G;B;3m),
 * matching glow. Hex values:
 *   heading  #00afff  (39, bright blue)   — Glow H2-H6
 *   heading  #bd93f9  (Dracula purple) — converged 2026-08-24 (was #00afff blue, wrong source)
 *   strong   #ffb86c  (Dracula orange) — converged 2026-08-24 (was #ffd700 gold, ungrounded)
 *   emphasis #f1fa8c  (Dracula yellow)  — converged 2026-08-24 (was #ffff5f, wrong source)
 *   code     #50fa7b / #303030            — text converged 2026-08-24 (was #5fd700); bg pending (item 3b)
 *   link     #00af5f  (35, sea green)     — legacy hyperlink role (override-file
 *             compat); live hyperlinks now use link-text/link-url below
 *   link-text #ff79c6 (Dracula rose)   — converged 2026-08-24 (glow shows
 *             the link text in rose, no underline)
 *   link-url  #8be9fd (Dracula cyan)   — converged 2026-08-24 (glow shows
 *             the URL inline in cyan + underline, no OSC 8)
 *   badge-bg #ff79c6 (Dracula pink)   — Gloam footer badge background
 *             (TUI chrome, not markdown; design ref: glow's status badge)
 *   badge-fg #f8f8f2 (Dracula near-white) — Gloam footer badge foreground
 *   muted    #585858  (240, dim gray)     — Glow horizontal rule
 *   blockquote #767676 (243, gray)        — quote pipe, recedes (GLOW PARITY:
 *             this preset keeps Glow's grey pipe. The okuda preset sets the cue
 *             to the aside's own ink (#e0b45c) instead, so the pipe and the
 *             quoted text are one hue — the cue and the content agree, and a
 *             nested blockquote's single pipe reads as part of the quote.)
 * Diagram roles have no Glow equivalent; they reuse Glow channels:
 *   border = muted, arrow = link green, text = doc near-white.
 * Table roles keep okuda's semantic layer (brief: table policy), tuned
 * to the Glow palette: header = heading blue, key = Glow H1 pale yellow.
 *
 * code-background: empty string ("") = no background emitted (glow
 * parity, Pass B). The okuda preset set a real hex from 2026-08-25
 * (LCARS panel) and retired it 2026-09-02: a second background behind
 * the terminal's perfectly adequate one is ugly and superfluous. A
 * user override may still set a hex; colour tuning (td-8ece4e) checks
 * the remaining bg options once before the idea is pronounced dead.
 */
export const DRACULA_PALETTE: Palette = {
  heading: "#bd93f9",
  "code-text": "#50fa7b",
  "code-background": "",
  blockquote: "#767676",
  link: "#00af5f",
  "link-text": "#ff79c6",
  "link-url": "#8be9fd",
  "badge-bg": "#ff79c6",
  "badge-fg": "#f8f8f2",
  emphasis: "#f1fa8c",
  strong: "#ffb86c",
  "table-header": "#bd93f9",
  "table-key": "#ffff87",
  muted: "#585858",
  "diagram-border": "#585858",
  "diagram-arrow": "#00af5f",
  "diagram-text": "#d7d7d7",
  alert: "#ff5555", // Dracula red — the fetch-state `failed` channel (ADR-015)
  // State-glyph vocabulary — three lamps and one that is off the ladder by
  // design (aubergine: parked is a comment, not a rung). Preset-independent.
  // (alarm/success-universality extends ADR-015). state-failed === alert.
  // Distinct from document channels: the justification table in the brief
  // names why each existing channel fails, so the hexes must not reuse them —
  // green ≠ code-text (#50fa7b), yellow ≠ emphasis (#f1fa8c), aubergine ≠
  // table-header (#bd93f9) and ≠ strong (#ffb86c). state-failed === alert is the
  // one allowed collision.
  "state-ok": "#5fd35f",
  "state-todo": "#ffe066",
  "state-parked": "#a06fa8", // aubergine — off the lamp by design (BRF-IRONY-MARK): the parked state is a comment on the plan, not a rung on it. Measured: min ΔE 14.5 to the family, and 16.3 on the deuteranopia-safe (L,b) axis against the old orange's 2.9.
  "state-failed": "#ff5555",
  "doc-ref": "#e8c44a",
  "vector": "#fb7185", // ADR-031: the reserved vector paint — ROSE, the rubricator's ink (rubric = ruber, red); rose-end, not crimson (the alarm channel); distinct from link-text #ff79c6 and every author-addressable role
};

/** Named presets — the identity layers. The default is the okuda
 *  preset (LCARS identity, 2026-08-25 divergence); the Dracula/glow
 *  palette is retained as a named preset (`--palette dracula`) for
 *  parity comparison. Convergence is achieved; we are now diverging. */
const PRESETS: Record<string, Palette> = {
  okuda: okudaPreset as Palette,
  dracula: DRACULA_PALETTE,
};

const RE_HEX = /^#[0-9a-fA-F]{6}$/;

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** Foreground SGR: \x1b[38;2;R;G;Bm */
export function fg(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `\x1b[38;2;${r};${g};${b}m`;
}

/** Background SGR: \x1b[48;2;R;G;Bm */
export function bg(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `\x1b[48;2;${r};${g};${b}m`;
}

export const RESET = "\x1b[0m";

/**
 * Load a palette. Resolution order (later wins):
 *   1. The okuda preset (the default, LCARS identity — ADR-011) if no
 *      `name` is given.
 *   2. Named preset if given (`dracula` = glow parity, `okuda`).
 *   3. User override file (`~/.config/okuda/palette.json`, or `path`).
 *
 * Malformed override files and invalid values are ignored — the base
 * palette (default or preset) applies. Unknown roles are ignored.
 * `code-background` may be the empty string ("" = no bg, glow parity) or
 * a valid hex (panel emitted).
 */
export function loadPalette(
  opts?: { name?: string; path?: string },
): Palette {
  // Default is the okuda preset (identity, 2026-08-25 divergence).
  // `--palette dracula` selects the glow-parity palette for comparison.
  const base = opts?.name && PRESETS[opts.name]
    ? PRESETS[opts.name]!
    : PRESETS.okuda!;
  const merged: Palette = { ...base };
  const file =
    opts?.path ?? `${process.env.HOME ?? ""}/.config/okuda/palette.json`;
  if (!file || !existsSync(file)) return merged;
  try {
    const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [key, value] of Object.entries(
        parsed as Record<string, unknown>,
      )) {
        // code-background may be "" (no bg) or a hex; other roles must be hex.
        const ok =
          key === "code-background"
            ? value === "" || RE_HEX.test(value)
            : RE_HEX.test(value);
        if (key in merged && typeof value === "string" && ok) {
          merged[key as Role] = key === "code-background"
            ? (value as string)
            : (value as string).toLowerCase();
        }
      }
    }
  } catch {
    // Silently fall back to defaults — a broken override must not break the viewer.
  }
  return merged;
}
