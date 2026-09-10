#!/usr/bin/env bun
/**
 * tts-prosody.ts — the TTS prosody render pipeline (prototype).
 *
 * Edge-then-breath: the punctuation stays (the edge — the prosodic
 * boundary, the drop, the rise), and silence follows it (the breath
 * — `[[slnc N]]`, the gap where the speaker draws air). Two signals,
 * two jobs, no smearing.
 *
 * Moira knows her job. The marks are the level register with
 * occasional emphasis; the breaths are the silence between them.
 * Variation keeps the listener listening.
 *
 * Usage:
 *   bun scripts/tts-prosody.ts <source.md> [output.txt]
 *   bun scripts/tts-prosody.ts <source.md> | say -v Moira -r 140
 */

import { readFileSync, writeFileSync } from "fs";

// ─── The table ───────────────────────────────────────────────
// Each value is a silence duration in milliseconds. The punctuation
// is the edge (it stays); the silence is the breath (it follows).
// The table is the product (BRF-TTS-TEMPORAL) — tuned by ear, not
// by assertion. A one-line edit changes any breath length.

interface ProsodyTable {
  comma: number;
  semicolon: number;
  colon: number;
  question: number;
  full_stop: number;
  exclamation: number;
  para_break: number;
  header_end: number;
}

function loadTable(path: string): ProsodyTable {
  return JSON.parse(readFileSync(path, "utf-8")) as ProsodyTable;
}

// ─── Stage 1: flatten ─────────────────────────────────────────
// Walk the markdown; strip visual markup; collect paragraphs.

interface Paragraph {
  text: string;
  isHeader: boolean;
}

function stripInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1");
}

function flatten(text: string): Paragraph[] {
  const lines = text.split("\n");
  const paras: Paragraph[] = [];
  let inCode = false;
  let current: string[] = [];
  let isHeader = false;

  const flush = () => {
    if (current.length > 0) {
      paras.push({ text: current.join(" "), isHeader });
      current = [];
      isHeader = false;
    }
  };

  for (const line of lines) {
    const stripped = line.trim();

    if (stripped.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    if (stripped.startsWith("|") && stripped.endsWith("|")) {
      const cells = stripped.slice(1, -1).split("|").map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      current.push(cells.join(" . ") + ".");
      continue;
    }

    if (!stripped) {
      flush();
      continue;
    }

    if (stripped.startsWith("#")) {
      flush();
      const level = stripped.match(/^#+/)![0].length;
      current.push(stripped.slice(level).trim());
      isHeader = true;
      flush();
      continue;
    }

    const bulletMatch = stripped.match(/^[\*\-+]\s+(.+)/);
    if (bulletMatch) {
      current.push(stripInline(bulletMatch[1]));
      continue;
    }
    const numMatch = stripped.match(/^\d+\.\s+(.+)/);
    if (numMatch) {
      current.push(stripInline(numMatch[1]));
      continue;
    }

    current.push(stripInline(stripped));
  }
  flush();

  return paras;
}

// ─── Stage 2: edge-then-breath ────────────────────────────────
// The punctuation stays (the edge); silence follows (the breath).
// Para breaks between paragraphs; header-end after headers.

function applyProsody(paras: Paragraph[], table: ProsodyTable): string {
  const breath: Record<string, string> = {
    ",": `[[slnc ${table.comma}]]`,
    ";": `[[slnc ${table.semicolon}]]`,
    ":": `[[slnc ${table.colon}]]`,
    "?": `[[slnc ${table.question}]]`,
    ".": `[[slnc ${table.full_stop}]]`,
    "!": `[[slnc ${table.exclamation}]]`,
  };

  const parts: string[] = [];

  for (let i = 0; i < paras.length; i++) {
    const para = paras[i]!;

    // Breath between paragraphs
    if (i > 0) parts.push(`[[slnc ${table.para_break}]]\n`);

    // Edge-then-breath: punctuation stays, silence follows
    let text = para.text;
    let result = "";
    for (const ch of text) {
      if (ch in breath) {
        result += ch + breath[ch];
      } else {
        result += ch;
      }
    }

    if (para.isHeader) {
      result += `[[slnc ${table.header_end}]]`;
    }

    parts.push(result);
    parts.push("\n");
  }

  return parts.join("");
}

// ─── Stage 3: elide provenance ────────────────────────────────
// The spoken shit filter. TODO: implement when the dogfood surfaces
// provenance noise (.md paths, fetch-state stamps, etc.).

function elideProvenance(text: string): string {
  return text;
}

// ─── Main ────────────────────────────────────────────────────

function main() {
  const sourcePath = process.argv[2];
  if (!sourcePath) {
    console.error("usage: bun scripts/tts-prosody.ts <source.md> [output.txt]");
    process.exit(1);
  }

  const tablePath = new URL(
    "../data/tts-prosody-table.json",
    import.meta.url,
  ).pathname;

  const source = readFileSync(sourcePath, "utf-8");
  const table = loadTable(tablePath);

  const paras = flatten(source);
  const prosodied = applyProsody(paras, table);
  const clean = elideProvenance(prosodied);

  const outPath = process.argv[3];
  if (outPath) {
    writeFileSync(outPath, clean);
    console.error(`Wrote ${clean.length} chars to ${outPath}`);
  } else {
    process.stdout.write(clean);
  }
}

main();
