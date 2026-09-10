#!/usr/bin/env bun
/**
 * tts-prosody.ts — the TTS prosody render pipeline (prototype).
 *
 * Reads a markdown source, a JSON lookup table, and emits the
 * comma-marked plain text that `say` reads with prosody.
 *
 * The pipeline (BRF-TTS-TEMPORAL): flatten → apply character-level
 * lookup → elide provenance. Four stages, one pass. Pure function:
 * same source + same table = same output. Restartable: clone the
 * repo, run the script, get the same result.
 *
 * Usage:
 *   bun scripts/tts-prosody.ts <source.md> [output.txt]
 *   bun scripts/tts-prosody.ts <source.md> | say -v Moira
 *
 * The table is data (data/tts-prosody-table.json) — tuned by ear,
 * not by assertion. A one-line edit changes any pause length.
 */

import { readFileSync, writeFileSync } from "fs";

// ─── The table ───────────────────────────────────────────────
// Loaded from data/tts-prosody-table.json. Each value is a comma
// count; the punctuation character is replaced by that many commas
// at render time. The table is the product (BRF-TTS-TEMPORAL).

interface ProsodyTable {
  comma: number;
  semicolon: number;
  colon: number;
  question: number;
  full_stop: number;
  exclamation: number;
  para_break: number;
  header_end: number;
  silcrow_after: number;
}

function loadTable(path: string): ProsodyTable {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as ProsodyTable;
}

// ─── Structural sentinels ─────────────────────────────────────
// Non-comma markers emitted by the flattening pass, replaced with
// their comma clusters AFTER the character walk — so the commas in
// the clusters are not double-processed. (The bug that taught us
// to sentinel, not to bake.)

const PARA_BREAK = "\x00PARA\x00";
const HEADER_END = "\x00HEAD\x00";

// ─── Stage 1: flatten ─────────────────────────────────────────
// Walk the markdown; strip visual markup; emit structural sentinels.
// Code blocks skipped entirely; tables rendered as dot-separated rows;
// headers stripped of # and marked; list items stripped of bullets.

function stripMarkdown(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let prevBlank = false;
  let inCode = false;

  for (const line of lines) {
    const stripped = line.trim();

    if (stripped.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    // Table rows
    if (stripped.startsWith("|") && stripped.endsWith("|")) {
      const cells = stripped.slice(1, -1).split("|").map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) continue; // separator
      out.push(cells.join(" . ") + ".");
      continue;
    }

    if (!stripped) {
      if (out.length > 0 && !prevBlank) out.push(PARA_BREAK);
      prevBlank = true;
      continue;
    }
    prevBlank = false;

    // Headers
    if (stripped.startsWith("#")) {
      const level = stripped.match(/^#+/)![0].length;
      out.push(stripped.slice(level).trim() + HEADER_END);
      continue;
    }

    // List items
    const bulletMatch = stripped.match(/^[\*\-+]\s+(.+)/);
    if (bulletMatch) {
      out.push(stripInline(bulletMatch[1]));
      continue;
    }
    const numMatch = stripped.match(/^\d+\.\s+(.+)/);
    if (numMatch) {
      out.push(stripInline(numMatch[1]));
      continue;
    }

    // Regular paragraph
    out.push(stripInline(stripped));
  }

  return out.join("\n");
}

function stripInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1");
}

// ─── Stage 2: apply prosody ───────────────────────────────────
// Walk the flattened text; replace each punctuation character with
// its comma cluster from the table. Sentinels replaced after the
// walk so their commas are not double-processed.

function applyProsody(flat: string, table: ProsodyTable): string {
  const charTable: Record<string, string> = {
    ",": ",".repeat(table.comma),
    ";": ",".repeat(table.semicolon),
    ":": ",".repeat(table.colon),
    "?": ",".repeat(table.question),
    ".": ",".repeat(table.full_stop),
    "!": ",".repeat(table.exclamation),
  };

  // Character walk: punctuation → comma clusters
  let result = "";
  for (const ch of flat) {
    result += ch in charTable ? charTable[ch] : ch;
  }

  // Structural sentinels → their pre-baked pause strings
  result = result.replaceAll(PARA_BREAK, ",".repeat(table.para_break));
  result = result.replaceAll(HEADER_END, ",".repeat(table.header_end));

  return result;
}

// ─── Stage 3: elide provenance ────────────────────────────────
// The spoken shit filter — replace .md paths and provenance with a
// bare audible "..." (not silent; lying by absence is not ok).
// TODO: implement when the dogfood surfaces provenance noise.

function elideProvenance(text: string): string {
  return text; // placeholder — no provenance in the test doc yet
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

  const flat = stripMarkdown(source);
  const prosodied = applyProsody(flat, table);
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
