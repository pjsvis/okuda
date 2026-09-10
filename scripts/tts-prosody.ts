#!/usr/bin/env bun
/**
 * tts-prosody.ts — the TTS prosody render pipeline (prototype).
 *
 * Edge-then-breath: the punctuation stays (the edge — the prosodic
 * boundary, the drop, the rise), and silence follows it (the breath
 * — `[[slnc N]]`, the gap where the speaker draws air). Two signals,
 * two jobs, no smearing.
 *
 * Content-weighted breath: the breath before a paragraph scales with
 * the paragraph's word count. A human speaker reads ahead and draws
 * a deeper breath before a longer stretch. The lungs scale with the
 * load. (NASA HR boundary condition: breathe deeper before longer.)
 *
 * Mandatory breath breaks: if a paragraph has no punctuation for more
 * than `max_words_without_breath` words, a mandatory breath is
 * inserted at the word boundary. Moira is not required to operate
 * outside the parameters defined by NASA HR and her Union. Below the
 * Saramago Barrier (`saramago_barrier: false`), the breaks are
 * required. Above it, the flow is the content and breaks would
 * destroy it — a declared exemption, not the default.
 *
 * Usage:
 *   bun scripts/tts-prosody.ts <source.md> [output.txt]
 *   bun scripts/tts-prosody.ts <source.md> | say -v Moira -r 140
 */

import { readFileSync, writeFileSync } from "fs";

// ─── The table ───────────────────────────────────────────────

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
  para_weight_rate: number;
  para_weight_max: number;
  max_words_without_breath: number;
  mandatory_breath: number;
  saramago_barrier: boolean;
}

function loadTable(path: string): ProsodyTable {
  return JSON.parse(readFileSync(path, "utf-8")) as ProsodyTable;
}

// ─── Stage 1: flatten ─────────────────────────────────────────
// Walk the markdown; strip visual markup; collect paragraphs with
// word counts for the breath-weighting pass.

interface Paragraph {
  text: string;
  wordCount: number;
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
      const joined = current.join(" ");
      paras.push({
        text: joined,
        wordCount: joined.split(/\s+/).filter(Boolean).length,
        isHeader,
      });
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
// Para breaks are content-weighted: deeper breath before a longer
// paragraph. Mandatory breaks inserted within long unpunctuated
// stretches (unless saramago_barrier is set).

function applyProsody(paras: Paragraph[], table: ProsodyTable): string {
  const breath: Record<string, string> = {
    ",": `[[slnc ${table.comma}]]`,
    ";": `[[slnc ${table.semicolon}]]`,
    ":": `[[slnc ${table.colon}]]`,
    "?": `[[slnc ${table.question}]]`,
    ".": `[[slnc ${table.full_stop}]]`,
    "!": `[[slnc ${table.exclamation}]]`,
  };

  // Insert mandatory breath breaks within long unpunctuated
  // stretches. Walks the text word by word; if no punctuation has
  // been seen for max_words_without_breath words, inserts a
  // mandatory breath at the next word boundary. Below the Saramago
  // Barrier (saramago_barrier: false), the breaks are required.
  function mandatoryBreaks(text: string): string {
    if (table.saramago_barrier) return text;
    const words = text.split(/(\s+)/);
    let wordsSincePunct = 0;
    const result: string[] = [];
    for (const word of words) {
      result.push(word);
      if (/[,.?!;:]/.test(word)) {
        wordsSincePunct = 0;
      } else if (/^\s+$/.test(word)) {
        // whitespace — don't count
      } else if (word.length > 0) {
        wordsSincePunct++;
        if (wordsSincePunct >= table.max_words_without_breath) {
          result.push(`[[slnc ${table.mandatory_breath}]]`);
          wordsSincePunct = 0;
        }
      }
    }
    return result.join("");
  }

  // Content-weighted para break: base + (wordCount * rate), capped
  // at base + max. A deeper breath before a longer paragraph.
  const paraBreak = (wc: number): string => {
    const weighted = Math.min(
      table.para_break + wc * table.para_weight_rate,
      table.para_break + table.para_weight_max,
    );
    return `[[slnc ${weighted}]]`;
  };

  const parts: string[] = [];

  for (let i = 0; i < paras.length; i++) {
    const para = paras[i]!;

    // Breath BEFORE this paragraph (content-weighted by its word
    // count). The first paragraph gets a para-break too — the
    // "clear your throat" before starting.
    if (i > 0) {
      parts.push("\n");
      parts.push(paraBreak(para.wordCount));
      parts.push("\n");
    } else {
      parts.push(paraBreak(para.wordCount));
      parts.push("\n");
    }

    // The paragraph text: edge-then-breath per punctuation mark,
    // plus mandatory breaks for long unpunctuated stretches.
    let text = para.text;
    text = mandatoryBreaks(text);

    // Character walk: punctuation stays, silence follows
    let result = "";
    for (const ch of text) {
      if (ch in breath) {
        result += ch + breath[ch];
      } else {
        result += ch;
      }
    }

    if (para.isHeader) {
      // Header: the header text already has the edge; add the
      // header-end breath after it.
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
