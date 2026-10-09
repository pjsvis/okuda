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

const ROOT = resolve(dirname(Bun.file(import.meta.path).name ?? import.meta.path), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/** Page geometry: A4 portrait. */
export const PAGE_MM = { width: 210, margin: 8 };
/** Monospace advance, in em. Menlo 0.6023, SF Mono 0.600 — 0.61 leaves slack. */
export const ADVANCE_EM = 0.61;
/** The largest type the paper rung will use, in points. */
export const MAX_FONT_PT = 10;

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

if (import.meta.main) {
const argv = process.argv.slice(2);
let file = "";
let out = "";
let width = 100; // paper is its own glass: the page decides, not a terminal
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

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const hex = (n: string) => Number(n).toString(16).padStart(2, "0");

function toHtml(src: string): string {
  let out = "";
  let last = 0;
  let open = false;
  let styles: string[] = [];
  for (const m of src.matchAll(/\x1b\[([0-9;]*)m/g)) {
    out += esc(src.slice(last, m.index));
    last = (m.index ?? 0) + m[0].length;
    const p = (m[1] ?? "").split(";");
    for (let i = 0; i < p.length; i++) {
      const code = p[i]!;
      if (code === "0") styles = [];
      else if (code === "1") styles.push("font-weight:700");
      else if (code === "3") styles.push("font-style:italic");
      else if (code === "4") styles.push("text-decoration:underline");
      else if (code === "9") styles.push("text-decoration:line-through");
      else if (code === "7") styles.push("filter:invert(1)");
      else if ((code === "38" || code === "48") && p[i + 1] === "2") {
        const rgb = `#${hex(p[i + 2]!)}${hex(p[i + 3]!)}${hex(p[i + 4]!)}`;
        styles.push(`${code === "38" ? "color" : "background-color"}:${rgb}`);
        i += 4;
      }
    }
    if (open) out += "</span>";
    if (styles.length) {
      out += `<span style="${styles.join(";")}">`;
      open = true;
    } else open = false;
  }
  out += esc(src.slice(last));
  return open ? out + "</span>" : out;
}

const commit = spawnSync("git", ["rev-parse", "--short=7", "HEAD"], { cwd: ROOT })
  .stdout.toString()
  .trim();
const fontPt = paperFontPt(width);
const html = `<!doctype html>
<meta charset="utf-8">
<title>${esc(basename(file))}</title>
<style>
  @page { size: A4 portrait; margin: ${PAGE_MM.margin}mm ${PAGE_MM.margin}mm 12mm; }
  html, body { background: #1e1f29; }
  pre { white-space: pre; font-family: "SF Mono", Menlo, monospace;
        font-size: ${fontPt}pt; line-height: 1.18; color: #f8f8f2; margin: 0;
        -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .prov { font-family: "SF Mono", Menlo, monospace; font-size: 6pt;
          color: #6272a4; margin-top: 6mm; -webkit-print-color-adjust: exact;
          print-color-adjust: exact; }
</style>
<pre>${toHtml(ansi)}</pre>
<div class="prov">rendered projection · okuda&nbsp;${esc(commit)} · ${esc(file)} · ${width} cols at ${fontPt}pt · ${new Date().toISOString().slice(0, 10)} · no silcrows (they cannot resolve on paper)</div>
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
    ` · ${width} cols at ${fontPt}pt${receipt ? " · receipt kept" : " · receipt dropped"} · html kept at tmp/paper/\n`,
);
}
