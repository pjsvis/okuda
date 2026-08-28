#!/usr/bin/env bun
/**
 * jump-demo.ts — the menu compositor (index-and-jump, td-9d9981).
 *
 * The line, under the near/far pattern (the gloaming):
 *   chip (solid block, the action indicator — type it to jump) →
 *   slug (emphasis, near-but-lesser, the content) →
 *   path (muted, far — on its own line beneath, no dash: the line
 *   break is the separator). No state glyph on the line — the chip
 *   (action) outranks the glyph (state) for the eye's first stop; the
 *   key below keeps the glyph vocabulary in reserve. The `Brief:` /
 *   `Decision:` classification prefix is stripped — the path's folder
 *   already says it.
 *
 * Ephemeral — never registered, never a brief. The environment
 * composing (filesystem as the message bus), not okuda (ADR-020).
 *
 * Usage:
 *   bun scripts/jump-demo.ts          # markdown to stdout
 *   just jump-demo                    # generate + frame in the TUI
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** First `# ` heading, or the basename. Pure-ish (reads fs). */
function titleOf(file: string): string {
  try {
    const text = readFileSync(join(ROOT, file), "utf8");
    const m = text.match(/^#\s+(.+)$/m);
    return (m?.[1] ?? file).trim();
  } catch {
    return file;
  }
}

/** Strip the classification prefix the path's folder already carries —
 *  `Brief: …`, `brief: …`, `Decision: …`, etc. The slug is the
 *  descriptive name, not its classification. */
function stripClass(title: string): string {
  return title.replace(/^(brief|decision|debrief|playbook)\s*:\s*/i, "");
}

if (import.meta.main) {
  const recent = readdirSync(join(ROOT, "briefs"))
    .filter((f) => /^2026-08-28.*\.md$/.test(f))
    .map((f) => `briefs/${f}`);
  const rejected = "briefs/2026-08-25-brief-viewport-padding.md";
  const files = [...recent, rejected].sort();

  const rows = files.map((f) => ({ file: f, title: stripClass(titleOf(f)) }));
  rows.sort((a, b) => a.file.localeCompare(b.file));

  const lines = ["# Menu — recent briefs", ""];
  rows.forEach((r, i) => {
    const n = String(i + 1).padStart(2, "0");
    // slug (emphasis) → RHS number (the action). Visual order follows
    // action order: consider the slug, then execute the number. The path
    // is wiring in an HTML comment the renderer strips but extractJumps
    // reads. One line — truncate to fit, never wrap (brief: index-and-jump).
    lines.push(`*${r.title}* %%okuda-rhs:${n}%% <!-- ${r.file} -->`);
    lines.push(""); // blank line between items → bulletless, breathing
  });
  lines.push("---", "", "**Key** — type the number to jump · state glyphs (held in reserve):", "");
  lines.push("☐ open · ⋮ parked · ✗ rejected · ✓ accepted (as an ADR)");
  lines.push("");
  console.log(lines.join("\n"));
}