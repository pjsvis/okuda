#!/usr/bin/env bun
/**
 * jump-demo.ts — the menu compositor (index-and-jump, td-9d9981).
 *
 * Composes a status-led menu over recent briefs. The line shape, under
 * the near/far pattern (the gloaming): state glyph (warm, alerts) →
 * number chip (solid block, the action indicator — type it to jump) →
 * slug (bold, near, the core content) → path (muted, far, provenance).
 * The chip is a private-use renderer token; the slug is the one bold
 * thing; the path recedes like the status bar's folder/file text.
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
import { chipToken } from "../src/grammar";

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

/** The `**Status:**` value (first match), lower-cased, or "" if none. */
function statusOf(file: string): string {
  try {
    const text = readFileSync(join(ROOT, file), "utf8");
    const m = text.match(/^\*\*Status:\*\*\s*(.+)$/m);
    return (m?.[1] ?? "").trim();
  } catch {
    return "";
  }
}

/** State-glyph vocabulary (brief: state-glyph-vocabulary). */
function glyphFor(status: string): string {
  const s = status.toLowerCase();
  if (s.startsWith("rejected")) return "\u2717"; // ✗
  if (s.startsWith("parked")) return "\u22ee";    // ⋮
  if (s.startsWith("accepted")) return "\u2713"; // ✓
  return "\u2610";                                 // ☐ open / pending / draft / ready
}

/** Sort: open first (the actionable), then parked, rejected, done. */
const ORDER: Record<string, number> = {
  "\u2610": 0, "\u22ee": 1, "\u2717": 2, "\u2713": 3,
};

if (import.meta.main) {
  const recent = readdirSync(join(ROOT, "briefs"))
    .filter((f) => /^2026-08-28.*\.md$/.test(f))
    .map((f) => `briefs/${f}`);
  const rejected = "briefs/2026-08-25-brief-viewport-padding.md";
  const files = [...recent, rejected].sort();

  const rows = files.map((f) => ({
    glyph: glyphFor(statusOf(f)),
    file: f,
    title: titleOf(f),
  }));
  rows.sort(
    (a, b) =>
      (ORDER[a.glyph] ?? 9) - (ORDER[b.glyph] ?? 9) ||
      a.file.localeCompare(b.file),
  );

  const lines = ["# Menu — recent briefs", ""];
  rows.forEach((r, i) => {
    const n = String(i + 1).padStart(2, "0");
    // state → chip → slug (bold) → path (muted by the renderer heuristic)
    lines.push(`${r.glyph} ${chipToken(n)} **${r.title}** — ${r.file}`);
    lines.push(""); // separate paragraphs → bulletless, breathing
  });
  lines.push("---", "", "**Key** — type the chip to jump · state glyphs:", "");
  lines.push("☐ open · ⋮ parked · ✗ rejected · ✓ accepted (as an ADR)");
  lines.push("");
  console.log(lines.join("\n"));
}