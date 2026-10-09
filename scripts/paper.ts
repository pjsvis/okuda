#!/usr/bin/env bun
/**
 * paper.ts — the paper rung: okuda's render, printed to PDF.
 *
 * One render, two artefacts. okuda lays the page out — width, wrapping, colour
 * roles, elision — and this script does exactly two things: turn its ANSI bytes
 * into HTML spans, and hand that to a printer. Nothing here reflows, re-wraps,
 * re-colours or re-typesets; the `pre` is `white-space: pre`, so the browser
 * cuts pages and changes nothing else.
 *
 * That is why there is no document engine in the chain. pandoc would need a
 * LaTeX engine (none installed), cupsfilter refuses `text/html`, wkhtmltopdf and
 * weasyprint are absent. Chrome is used as a PRINTER, not as a renderer.
 *
 * The receipt is dropped on purpose (`--no-references`): on paper a silcrow
 * cannot resolve, and its number is a render-time allocation (ADR-032), so a
 * durable artefact carrying it is guaranteed to disagree with the next render.
 *
 * Usage: bun scripts/paper.ts <file.md> [-o out.pdf] [--width <cols>] [--keep-reference-section]
 */

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { loadPalette } from "../src/palette";

const ROOT = resolve(dirname(Bun.file(import.meta.path).name ?? import.meta.path), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/** Page geometry: A4 portrait. */
export const PAGE_MM = { width: 210, margin: 8 };
/** Monospace advance, in em. Menlo 0.6023, SF Mono 0.600 — 0.61 leaves slack. */
export const ADVANCE_EM = 0.61;
/** The largest type the paper rung will use, in points. */
export const MAX_FONT_PT = 10;

/** ── The printer's terminal palette ──────────────────────────────────
 *
 *  okuda pipes tagged fences through chroma with `--formatter terminal16`, on
 *  purpose: "16-colour class codes, the terminal's palette supplies the hues"
 *  (`src/render.ts`, BRF-FENCE-COLOUR). The tool classifies; the terminal themes.
 *
 *  **On paper there is no terminal**, so the printer plays that role — otherwise
 *  chroma's 130 class codes per showcase render are silently dropped and every
 *  fence prints in one ink. These are the standard xterm-16 values, because the
 *  alternative (the reader's own theme) is unknowable from a pipe: the workspace
 *  declares a terminal, and the ink transform then mirrors whatever it emits.
 *  A metric: three families arrive — truecolour 356, 16-colour 130, no 256.
 */
export const XTERM16: readonly string[] = [
  "#000000", "#cd0000", "#00cd00", "#cdcd00",
  "#0000ee", "#cd00cd", "#00cdcd", "#e5e5e5",
  "#7f7f7f", "#ff0000", "#00ff00", "#ffff00",
  "#5c5cff", "#ff00ff", "#00ffff", "#ffffff",
];

/** A 16-colour SGR code (30-37, 90-97 fg; 40-47, 100-107 bg) → its hex, or null. */
export function sgr16Hex(code: string): string | null {
  if (/^3[0-7]$/.test(code)) return XTERM16[Number(code) - 30]!;
  if (/^9[0-7]$/.test(code)) return XTERM16[Number(code) - 90 + 8]!;
  return null;
}

/** The okuda preset's `muted` — the CHIP's colour (`src/palettes/okuda.json`,
 *  via `headingChip`), and therefore the paper rung's mark ink. The CLI passes
 *  the live palette's instead (so a `--palette` render keeps the relationship);
 *  this default exists so the transform is testable without the machine's
 *  palette file. */
export const DEFAULT_MUTED = "#445566";

/** WCAG relative luminance of an `#rrggbb` string, 0 (black) to 1 (white). */
export function relLum(hex: string): number {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = ch.map(f) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio against white — what paper gives a foreground. */
export function contrastWhite(hex: string): number {
  return 1.05 / (relLum(hex) + 0.05);
}

/** The floor the paper rung guarantees for any foreground: WCAG AA for small
 *  text, which is what a 9pt monospace page is. */
export const CONTRAST_FLOOR = 4.5;

/** hsl → `#rrggbb`, the inverse of the parse in `paperInk`. */
function hslHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const seg = Math.floor(h / 60) % 6;
  const [r1, g1, b1] = (
    [
      [c, x, 0],
      [x, c, 0],
      [0, c, x],
      [0, x, c],
      [x, 0, c],
      [c, 0, x],
    ] as const
  )[seg]!;
  const to255 = (v: number) => Math.round((v + m) * 255);
  return `#${[to255(r1), to255(g1), to255(b1)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/** Lower `l` until the colour clears CONTRAST_FLOOR against white, or the floor
 *  of lightness is reached. Hue and saturation never change. */
function darkenToContrast(h: number, s: number, l: number): number {
  let v = l;
  while (v > 0.02 && contrastWhite(hslHex(h, s, v)) < CONTRAST_FLOOR) v -= 0.01;
  return v;
}
/**
 *  Paper is opaque, white, and charged by the page. The render is dark because
 *  the terminal is; so the print rung **mirrors the lightness of every colour**
 *  rather than shipping a second palette. There is no light mode here and no
 *  palette file: the transform is applied to the emitted bytes, per colour, on
 *  the way to the printer.
 *
 *    - **foreground**: L → 1 − L, hue and saturation kept. Body text (near-white
 *      on the glass) lands near-black on paper; the role hues survive, so the
 *      colour still signals structure — only its polarity moves.
 *    - **background**: the same mirror, then clamped light. A page-wide tint is a
 *      page of toner, and worse, a print driver that drops backgrounds would
 *      turn light-on-dark into light-on-white: invisible. Paper gets white.
 *
 *  Colour PAIRS both pass through, so a light-on-dark span becomes dark-on-light
 *  with no special case. A chip (`48;2;c` + `38;2;c` over a `█` glyph) keeps its
 *  block because the glyph carries the foreground. Pure. */
export function paperInk(hex: string, background = false): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l0 = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l0 - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = ((h * 60) % 360 + 360) % 360;
  }
  // The mirror. Backgrounds are then clamped light: paper is white.
  let l = 1 - l0;
  if (background) l = Math.max(l, 0.96);
  // A mid-lightness saturated colour mirrors to itself (amber at L 50% stays
  // amber) — legible on the glass, ~2:1 on white. So a foreground is then
  // DARKENED until it clears the contrast floor: hue and saturation are kept,
  // only lightness gives way, and the guarantee is legibility rather than a
  // coincidence of the palette.
  else l = darkenToContrast(h, s, l);
  return hslHex(h, s, l);
}
/** Column count for the paper rung when none is given.
 *
 *  **80, because that is the printer's width, not because it is the terminal's**
 *  (the agreement is not a coincidence — both media are 8.5in of monospace on
 *  white). Paper is the one output whose geometry we do NOT control: the page is
 *  A4 by declaration and the *printer* decides what it does with that. So the
 *  rung declares the conservative default — a printable 8.5in at 80 columns,
 *  where the type takes the full 10pt cap — and the driver may scale from there.
 *  100 columns is available (and prints at ~9pt); it is not the default because
 *  the medium's habit is 80. */
export const PAPER_DEFAULT_COLS = 80;

/** Lines a page holds at a given type size, from this rung's own page box.
 *  "How long is a page" is answerable for the artefact we emit — A4, known
 *  margins, known line height — and the printer's own fidelity (Letter, fit-to-
 *  page, a scale factor) is the printer's business. Pure. */
export function paperLinesPerPage(fontPt: number): number {
  const contentHeightMm = 297 - PAGE_MM.margin - 12; // top margin, bottom margin
  const linePt = fontPt * 1.18;
  return Math.floor(((contentHeightMm / 25.4) * 72) / linePt);
}

/** The font size that makes `cols` columns fit the page — never more than
 *  MAX_FONT_PT, and never so large that the right edge is clipped. Clipping
 *  is silent byte loss on every line (`white-space: pre` does not wrap), so
 *  the size is DERIVED from the width rather than fixed: a 100-column render
 *  prints at ~9.2pt, an 80-column one at the 10pt cap. Pure. */
export function paperFontPt(cols: number): number {
  const contentPt = ((PAGE_MM.width - PAGE_MM.margin * 2) / 25.4) * 72;
  const fit = contentPt / (cols * ADVANCE_EM);
  // One decimal, rounded DOWN, so rounding can never push a column past the edge.
  return Math.floor(Math.min(MAX_FONT_PT, fit) * 10) / 10;
}

// ── Args ─────────────────────────────────────────────────────────────

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const hex = (n: string) => Number(n).toString(16).padStart(2, "0");

/** The ANSI→HTML pass. Exported for its own test: the fill rule is a decision,
 *  not an implementation detail. */
export function toHtml(src: string, markInk: string = paperInk(DEFAULT_MUTED)): string {
  let out = "";
  let last = 0;
  /** The style of the span currently open, or null. Spans are opened LAZILY, on
   *  the first byte that needs them: an SGR run with nothing inside it (a
   *  surface background ahead of a fill, as a badge arrives `48;2;c` then
   *  `38;2;c`) would otherwise emit an empty `<span>` carrying only a colour. */
  let open: string | null = null;
  let attrs: string[] = [];
  let fg: string | undefined;
  let bg: string | undefined;

  /** The run's CSS. A background EQUAL to its foreground is a **fill**, not a
   *  surface: the glyph is meant to vanish inside it — the heading badge
   *  (`48;2;c` + `38;2;c` + `#`) and the chips.
   *
   *  On paper EVERY fill takes the chrome ink — the palette's `muted`, which is
   *  what the RHS chip is painted in. The glass deliberately colours the LHS
   *  badge with the heading role (*heading blue on top+LHS (content), muted on
   *  RHS+footer (chrome)*), and on paper that diagonal collapses: the heading's
   *  colour is already carried by its own title text, so spending a second hue
   *  on the marker is ink for no information. One ink for the frame, colour for
   *  the roles, and the two ends of a heading line match by construction.
   *
   *  A background behind differently-coloured text is a *surface*, and paper's
   *  surfaces are white. (Inverse is emitted nowhere in the corpus.) */
  const style = (): string => {
    const parts = [...attrs];
    if (fg !== undefined && fg === bg) {
      parts.push(`color:${markInk}`, `background-color:${markInk}`);
    } else {
      if (fg !== undefined) parts.push(`color:${paperInk(fg)}`);
      if (bg !== undefined) parts.push(`background-color:${paperInk(bg, true)}`);
    }
    return parts.join(";");
  };

  /** Emit text in the current style, opening or switching the span if needed. */
  const emit = (text: string): void => {
    if (text === "") return;
    const want = style();
    if (open !== want) {
      if (open !== null) out += "</span>";
      if (want !== "") out += `<span style="${want}">`;
      open = want === "" ? null : want;
    }
    out += esc(text);
  };

  for (const m of src.matchAll(/\x1b\[([0-9;]*)m/g)) {
    emit(src.slice(last, m.index));
    last = (m.index ?? 0) + m[0].length;
    const p = (m[1] ?? "").split(";");
    for (let i = 0; i < p.length; i++) {
      const code = p[i]!;
      if (code === "0") {
        attrs = [];
        fg = undefined;
        bg = undefined;
      } else if (code === "1") attrs.push("font-weight:700");
      else if (code === "3") attrs.push("font-style:italic");
      else if (code === "4") attrs.push("text-decoration:underline");
      else if (code === "9") attrs.push("text-decoration:line-through");
      else if ((code === "38" || code === "48") && p[i + 1] === "2") {
        const rgb = `#${hex(p[i + 2]!)}${hex(p[i + 3]!)}${hex(p[i + 4]!)}`;
        if (code === "38") fg = rgb;
        else bg = rgb;
        i += 4;
      } else if (/^(3[0-7]|9[0-7])$/.test(code)) {
        fg = sgr16Hex(code)!; // chroma's class codes — the printer is the terminal
      } else if (/^(4[0-7]|10[0-7])$/.test(code)) {
        bg = XTERM16[(/^10/.test(code) ? Number(code) - 100 : Number(code) - 40) + 8]!;
      }
    }
  }
  emit(src.slice(last));
  return open !== null ? out + "</span>" : out;
}

if (import.meta.main) {
const argv = process.argv.slice(2);
let file = "";
let out = "";
let width = PAPER_DEFAULT_COLS;
let receipt = false;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i]!;
  if (a === "-o" || a === "--out") out = argv[++i] ?? "";
  else if (a === "--width") width = Number(argv[++i] ?? 100);
  else if (a === "--keep-reference-section") receipt = true;
  else if (!file) file = a;
  else {
    process.stderr.write(`paper: unexpected argument '${a}'\n`);
    process.exit(2);
  }
}
if (!file) {
  process.stderr.write("usage: bun scripts/paper.ts <file.md> [-o out.pdf] [--width <cols>]\n");
  process.exit(2);
}
const dashed = file.startsWith("-") ? [] : [file];
if (!/^\d+$/.test(String(width)) || width < 20) {
  process.stderr.write(`paper: --width wants a column count of 20 or more, got '${width}'\n`);
  process.exit(2);
}

// ── 1. okuda's bytes ─────────────────────────────────────────────────

const bin = join(ROOT, "okuda");
const useBinary = Bun.file(bin).size > 0;
const cmd = useBinary ? [bin] : ["bun", "run", join(ROOT, "src", "cli.ts")];
const okudaArgs = [...dashed, "--width", String(width)];
if (!receipt) okudaArgs.push("--no-references");

const rendered = spawnSync(cmd[0]!, [...cmd.slice(1), ...okudaArgs], {
  env: { ...process.env, FORCE_COLOR: "1" }, // the paper rung is colour by construction
  maxBuffer: 64 * 1024 * 1024,
});
if (rendered.status !== 0) {
  process.stderr.write(`paper: okuda failed (exit ${rendered.status})\n${rendered.stderr.toString()}`);
  process.exit(1);
}
const ansi = rendered.stdout.toString();

// ── 2. ANSI → HTML (the only transform) ──────────────────────────────


const commit = spawnSync("git", ["rev-parse", "--short=7", "HEAD"], { cwd: ROOT })
  .stdout.toString()
  .trim();
const fontPt = paperFontPt(width);
const linesPerPage = paperLinesPerPage(fontPt);
// The palette the render used (loadPalette reads the machine's override, as
// okuda does), so the mark ink follows a --palette render.
const markInk = paperInk(loadPalette().muted);
const html = `<!doctype html>
<meta charset="utf-8">
<title>${esc(basename(file))}</title>
<style>
  @page { size: A4 portrait; margin: ${PAGE_MM.margin}mm ${PAGE_MM.margin}mm 12mm; }
  html, body { background: #ffffff; }
  pre { white-space: pre; font-family: "SF Mono", Menlo, monospace;
        font-size: ${fontPt}pt; line-height: 1.18; color: #101014; margin: 0;
        -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .prov { font-family: "SF Mono", Menlo, monospace; font-size: 6pt;
          color: #6b7280; margin-top: 6mm; -webkit-print-color-adjust: exact;
          print-color-adjust: exact; }
</style>
<pre>${toHtml(ansi, markInk)}</pre>
<div class="prov">rendered projection · okuda&nbsp;${esc(commit)} · ${esc(file)} · ${width} cols at ${fontPt}pt · ${new Date().toISOString().slice(0, 10)} · no silcrows (they cannot resolve on paper) · ink mirrored for paper</div>
`;

// ── 3. print it ──────────────────────────────────────────────────────

const outPath = out || join(ROOT, "tmp", "paper", `${basename(file).replace(/\.md$/, "")}.pdf`);
mkdirSync(dirname(outPath), { recursive: true });
const htmlPath = join(ROOT, "tmp", "paper", `${basename(file).replace(/\.md$/, "")}.html`);
writeFileSync(htmlPath, html);

const printed = spawnSync(
  CHROME,
  [
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${outPath}`,
    `file://${htmlPath}`,
  ],
  { maxBuffer: 64 * 1024 * 1024 },
);
if (printed.status !== 0) {
  process.stderr.write(`paper: chrome print failed (exit ${printed.status})\n${printed.stderr.toString()}`);
  process.exit(1);
}

const pages = (() => {
  const buf = Bun.file(outPath);
  return buf.size > 0 ? `, ${(buf.size / 1024).toFixed(0)} KB` : "";
})();
process.stdout.write(
  `paper: ${outPath}${pages}\n` +
    `  render: ${useBinary ? "compiled binary" : "bun run src/cli.ts (no binary — run just build)"}` +
    ` · ${width} cols at ${fontPt}pt${receipt ? " · receipt kept" : " · receipt dropped"} · ${linesPerPage} lines/page · html kept at tmp/paper/\n`,
);
}
