#!/usr/bin/env bun
/**
 * surface-panel.ts — the rung panel: one document, nine grounds, one grid.
 *
 * Contract: briefs/2026-11-15-brief-rung-panel.md (BRF-RUNG-PANEL)
 *
 * A COMPOSITOR, like html-package.ts: it imports okuda's exports and
 * changes no renderer byte. The question it answers is the one the ground
 * page's arithmetic cannot — *what do the nine admissible pairs look like?*
 *
 * ## The shape
 *
 * okuda's roles are absolute hexes; the pair is the terminal's default
 * fg/bg. So the ink is rendered **once** and the pair is the HTML base
 * each cell paints under the same spans: the visible variables are exactly
 * the experiment's — the ground (L, hue), the ink (L), and the muted role's
 * structure against each ground. No per-rung re-render, no drift.
 *
 * Rung 7 is refused ("reads as emitted light") and excluded; the grid is
 * the nine admissible rungs in ladder order.
 *
 * ## The pipeline
 *
 *   specimen → renderDocument (width 80) → ANSI
 *           → SGR state machine → HTML spans
 *           → nine HTML bases (bg/fg per rung) → chromium --headless
 *           → montage 3×3 with label strips → docs/…-rung-panel.png
 *
 * Usage:
 *   bun scripts/surface-panel.ts            # writes docs/2026-11-15-rung-panel.png
 *   bun scripts/surface-panel.ts --cells /tmp/cells   # keep the cells
 */

import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { PAIRS, ratio, okudaPalette, type Pair } from "./contrast";
import { renderDocument } from "../src/render";

// ── The specimen ─────────────────────────────────────────────────────
// The principal's spec: H1, H2, loose list, a diagram, a table, and a
// "sciency function." Small on purpose — a cell is a thumbnail, and a
// 3×3 grid earns its labels only if the text stays readable.

const SPECIMEN = `# Reading on glass

The pair is the terminal's, the ink is okuda's, and one document shows
both. Nine grounds, one render.

## What moves

The ground moves, not the ink. The muted pipes go with it.

## The ladder, loosely

- rung 0 is the control, the terminal's shipped default

- rung 8 is the reference, warm ground and cream ink

- rung 9 is the floor test, deeper again

## One small machine

\`\`\`mermaid
flowchart LR
    G[ground] --> I[ink]
    I --> P[page]
\`\`\`

## The reading, measured

| rung | ground | ink | prose |
|---|---|---|---|
| 0 | #282c34 | #ffffff | 14.0:1 |
| 8 | #221f1c | #d6cfc4 | 10.6:1 |

## The science of the ratio

WCAG 2.0, the legibility floor:

\`\`\`ts
const contrast = (a: Hex, b: Hex): number =>
  (Math.max(L(a), L(b)) + 0.05) /
  (Math.min(L(a), L(b)) + 0.05);   // ΔE this is not
\`\`\`

A ratio is luminance-only; L is what the eye is doing. Read both.
`;

// ── The rungs ─────────────────────────────────────────────────────────

/** The admissible rungs, in ladder order — rung 7 is refused, excluded. */
const RUNGS: Pair[] = PAIRS.filter((p) => !p.refused);

const CELL_W = 760; // 80 cols * ~8.4px @ 14px JetBrains + padding
const CELL_H = 700;

// ── ANSI → HTML ───────────────────────────────────────────────────────

interface Style {
  fg?: string;
  bg?: string;
  bold: boolean;
  italic: boolean;
}

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const rgbCss = (r: number, g: number, b: number): string => `rgb(${r},${g},${b})`;

/** SGR state machine: an ANSI stream in, HTML spans out. Only what okuda
 *  emits is parsed (38/48;2 RGB, bold, italic, reset); other CSI/OSC bytes
 *  are stripped, because a rendered document is not a cursor dance. */
export function ansiToHtml(ansi: string): string {
  let out = "";
  let text = "";
  const st: Style = { bold: false, italic: false };

  const flush = () => {
    if (!text) return;
    const css: string[] = [];
    if (st.fg) css.push(`color:${st.fg}`);
    if (st.bg) css.push(`background:${st.bg}`);
    if (st.bold) css.push("font-weight:700");
    if (st.italic) css.push("font-style:italic");
    out += css.length
      ? `<span style="${css.join(";")}">${esc(text)}</span>`
      : esc(text);
    text = "";
  };

  let i = 0;
  while (i < ansi.length) {
    if (ansi[i] === "\x1b") {
      if (ansi[i + 1] === "[") {
        const m = /^\x1b\[([0-9;]*)m/.exec(ansi.slice(i));
        if (m) {
          flush();
          const params = m[1] === "" ? ["0"] : m[1].split(";");
          let j = 0;
          while (j < params.length) {
            const p = params[j];
            if (p === "0" || p === "") { st.fg = undefined; st.bg = undefined; st.bold = false; st.italic = false; }
            else if (p === "1") st.bold = true;
            else if (p === "3") st.italic = true;
            else if (p === "23") st.italic = false;
            else if (p === "39") st.fg = undefined;
            else if (p === "49") st.bg = undefined;
            else if ((p === "38" || p === "48") && params[j + 1] === "2") {
              const c = rgbCss(+params[j + 2]!, +params[j + 3]!, +params[j + 4]!);
              if (p === "38") st.fg = c; else st.bg = c;
              j += 4;
            }
            j++;
          }
          i += m[0].length;
          continue;
        }
      }
      // Any other escape (OSC, cursor): strip the sequence, keep text.
      const osc = /^\x1b\][^\x07\x1b]*(\x07|\x1b\\)/.exec(ansi.slice(i));
      if (osc) { flush(); i += osc[0].length; continue; }
      const csi = /^\x1b\[[0-9;]*[A-Za-z]/.exec(ansi.slice(i));
      if (csi) { flush(); i += csi[0].length; continue; }
      flush(); out += "\x1b"; i += 1; continue;
    }
    if (ansi[i] === "\r") { i += 1; continue; }
    text += ansi[i];
    i += 1;
  }
  flush();
  return out;
}

// ── The cell ──────────────────────────────────────────────────────────

const htmlPage = (body: string, bg: string, fg: string): string => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; background: ${bg}; }
  pre {
    color: ${fg};
    background: ${bg};
    font-family: "JetBrainsMono Nerd Font", monospace;
    font-size: 14px;
    line-height: 1.32;
    padding: 22px 26px;
    margin: 0;
    white-space: pre-wrap;
    width: ${CELL_W - 52}px;
    min-height: ${CELL_H - 44}px;
    box-sizing: border-box;
  }
</style></head>
<body><pre>${body}</pre></body></html>`;

const labelStrip = (w: number, lines: string[], fg: string, bg: string): string => {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    html, body { margin: 0; padding: 0; background: ${bg}; }
    div {
      font-family: "JetBrainsMono Nerd Font", monospace;
      font-size: 13px; color: ${fg}; padding: 8px 26px;
      width: ${w - 52}px; box-sizing: border-box; white-space: pre;
    }
  </style></head><body>${lines
    .map((l) => `<div>${esc(l)}</div>`)
    .join("")}</body></html>`;
  return html;
};

// ── The build ─────────────────────────────────────────────────────────

const OUT = "docs/2026-11-15-rung-panel.png";
// --cells <dir> keeps the cells; the default is a fixed tmp path. argv[last]
// is the script path when no args are passed — a path that starts with "/" —
// and rmSync on it deleted the script and left a directory of cells in its
// place, caught by the first `just rung-panel` smoke. Never derive from
// argv positions; parse the flag.
const cellsIdx = process.argv.indexOf("--cells");
const keepCells = cellsIdx >= 0;
const cellDir = keepCells ? process.argv[cellsIdx + 1]! : "/tmp/rung-cells";
if (!keepCells && existsSync(cellDir)) rmSync(cellDir, { recursive: true });
mkdirSync(cellDir, { recursive: true });

const palette = okudaPalette();
console.log(`specimen: ${SPECIMEN.split("\n").length} source lines`);
const ansi = await renderDocument(SPECIMEN, { width: 80, palette });
console.log(`rendered: ${ansi.length} ANSI bytes`);
const bodyHtml = ansiToHtml(ansi);
console.log(`html: ${bodyHtml.length} bytes`);

const run = (cmd: string[]): void => {
  const s = Bun.spawnSync(cmd, { stdout: "pipe", stderr: "pipe" });
  if (s.exitCode !== 0) {
    console.error(`FAILED: ${cmd.join(" ")}\n${s.stderr.toString().slice(0, 500)}`);
    process.exit(1);
  }
};

const shots: string[] = [];
for (const r of RUNGS) {
  const n = r.n;
  const c = ratio(r.bg, r.fg);
  const base = join(cellDir, `cell-${n}`);
  const page = htmlPage(bodyHtml, r.bg, r.fg);
  writeFileSync(`${base}.html`, page);
  run([
    "chromium", "--headless=new", "--disable-gpu", "--no-sandbox",
    "--hide-scrollbars", "--force-device-scale-factor=1",
    `--window-size=${CELL_W},${CELL_H}`,
    `--screenshot=${base}.png`, `file://${base}.html`,
  ]);
  const strip = labelStrip(CELL_W, [
    `rung ${n} · ${r.name}`,
    `ground ${r.bg} · ink ${r.fg} · prose ${c.toFixed(1)}:1`,
  ], r.fg, r.bg);
  writeFileSync(`${base}-label.html`, strip);
  run([
    "chromium", "--headless=new", "--disable-gpu", "--no-sandbox",
    "--hide-scrollbars", "--force-device-scale-factor=1",
    `--window-size=${CELL_W},58`,
    `--screenshot=${base}-label.png`, `file://${base}-label.html`,
  ]);

  // label strip above cell — one unit
  const unit = `${base}-unit.png`;
  run(["magick", `${base}-label.png`, `${base}.png`, "-append", unit]);
  shots.push(unit);
  console.log(`rung ${n}: ${r.bg}/${r.fg} → cell (${CELL_W}x${CELL_H + 58})`);
}

const TITLE = [
  "okuda · the rung panel · one document, nine admissible grounds",
  "rungs 0–6, 8, 9 of scripts/contrast.ts PAIRS · rung 7 refused (reads as emitted light)",
  "ink identical across cells — the pair is the only variable",
];
{
  const strip = labelStrip(CELL_W * 3 + 64, TITLE, palette.muted!, "#161311");
  writeFileSync(`${cellDir}/title.html`, strip);
  run([
    "chromium", "--headless=new", "--disable-gpu", "--no-sandbox",
    "--hide-scrollbars", "--force-device-scale-factor=1",
    `--window-size=${CELL_W * 3 + 64},82`,
    `--screenshot=${cellDir}/title.png`, `file://${cellDir}/title.html`,
  ]);
}

run([
  "magick", "montage", ...shots,
  "-tile", "3x3", "-geometry", "+16+16",
  "-background", "#161311", "-border", "0",
  `${cellDir}/grid.png`,
]);
run([
  "magick", `${cellDir}/title.png`, `${cellDir}/grid.png`,
  "-background", "#161311", "-append", OUT,
]);
console.log(`panel: ${OUT}`);
console.log(`cells: ${cellDir} (${keepCells ? "kept" : "temporary"})`);