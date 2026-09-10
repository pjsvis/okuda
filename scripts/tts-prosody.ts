#!/usr/bin/env bun
/**
 * tts-prosody.ts — the TTS prosody render pipeline (prototype).
 *
 * Reads a markdown source, a JSON lookup table, and emits the
 * comma-marked plain text that `say` reads with prosody.
 *
 * The pipeline (BRF-TTS-TEMPORAL): flatten → apply edge-then-breath
 * → elide provenance. Pure function: same source + same table =
 * same output. Restartable: clone the repo, run the script, same
 * result.
 *
 * Edge-then-breath: the punctuation stays (the edge — the prosodic
 * boundary, the drop, the rise), and silence follows it (the breath
 * — `[[slnc N]]`, the gap where the speaker draws air). Two signals,
 * two jobs, no smearing. The comma hack conflated them; the stutter
 * at 6 commas was the proxy breaking. The breath is not a comma —
 * the breath is silence.
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
  silcrow_after: number;
}

function loadTable(path: string): ProsodyTable {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as ProsodyTable;
}

// ─── Stage 1: flatten ─────────────────────────────────────────
// Walk the markdown; strip visual markup; emit structural markers.
// The markers are sentinels (\x00..) that survive the character walk
// and get replaced with silence in the breath stage.

const PARA_BREAK = "\x00PARA\x00";
const HEADER_END = "\x00HEAD\x00";

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
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
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

// ─── Stage 2: edge-then-breath ────────────────────────────────
// Walk the flattened text. Each punctuation mark stays (the edge);
// silence follows it (the breath). Structural sentinels are
// replaced with their silence values. The marks are the prosody;
// the silence is the breath. Two signals, two jobs, no smearing.

function applyProsody(flat: string, table: ProsodyTable): string {
  // Punctuation → edge (kept) + breath (silence after)
  const breath: Record<string, string> = {
    ",": `[[slnc ${table.comma}]]`,
    ";": `[[slnc ${table.semicolon}]]`,
    ":": `[[slnc ${table.colon}]]`,
    "?": `[[slnc ${table.question}]]`,
    ".": `[[slnc ${table.full_stop}]]`,
    "!": `[[slnc ${table.exclamation}]]`,
  };

  // Character walk: punctuation stays, silence follows
  let result = "";
  for (const ch of flat) {
    if (ch in breath) {
      result += ch + breath[ch];
    } else {
      result += ch;
    }
  }

  // Structural sentinels → silence (no edge — the newline before
  // the sentinel is the edge; the sentinel is the breath)
  result = result.replaceAll(
    PARA_BREAK,
    `[[slnc ${table.para_break}]]`,
  );
  result = result.replaceAll(
    HEADER_END,
    `[[slnc ${table.header_end}]]`,
  );

  return result;
}

// ─── Stage 3: elide provenance ────────────────────────────────
// The spoken shit filter — replace .md paths with a bare audible
// `[[slnc]]` (not silent; lying by absence is not ok).
// TODO: implement when the dogfood surfaces provenance noise.

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
