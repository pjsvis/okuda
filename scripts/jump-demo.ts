#!/usr/bin/env bun
/**
 * jump-demo.ts — the menu compositor (index-and-jump, td-9d9981).
 *
 * Composes a status-led menu over recent briefs: a bold `[NN]` jump
 * token (the marker — no bullet, the token is the marker), a state
 * glyph (real status variance, not noise), the title, and the trailing
 * path (doc-ref yellow under the render heuristic). A status key at
 * the bottom carries the legend. Ephemeral by design — never
 * registered, never a brief. The environment composing (filesystem as
 * the message bus), not okuda; the renderer just paints the bytes it's
 * given (ADR-020).
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

/** State-glyph vocabulary (brief: state-glyph-vocabulary). The closed
 *  lexicon maps brief status to the traffic-lamp glyph that carries it.
 *  "Ready" reads as open (a kind of pending); "accepted" as done. */
function glyphFor(status: string): string {
  const s = status.toLowerCase();
  if (s.startsWith("rejected")) return "\u2717"; // ✗
  if (s.startsWith("parked")) return "\u22ee";    // ⋮
  if (s.startsWith("accepted")) return "\u2713"; // ✓
  return "\u2610";                                 // ☐ open / pending / draft / ready
}

/** Sort: open first (the actionable), then parked, then rejected, then
 *  done — a menu of work leads with what's live. */
const ORDER: Record<string, number> = {
  "\u2610": 0, // ☐ open
  "\u22ee": 1, // ⋮ parked
  "\u2717": 2, // ✗ rejected
  "\u2713": 3, // ✓ done
};

if (import.meta.main) {
  // Recent briefs: the 2026-08-28 batch, plus the one rejected brief
  // (so ✗ earns its place on the menu, not as decoration).
  const recent = readdirSync(join(ROOT, "briefs"))
    .filter((f) => /^2026-08-28.*\.md$/.test(f))
    .map((f) => `briefs/${f}`);
  const rejected = "briefs/2026-08-25-brief-viewport-padding.md";
  const files = [...recent, rejected].sort();

  const rows = files.map((f) => {
    const glyph = glyphFor(statusOf(f));
    return { glyph, file: f, title: titleOf(f) };
  });
  rows.sort(
    (a, b) =>
      (ORDER[a.glyph] ?? 9) - (ORDER[b.glyph] ?? 9) ||
      a.file.localeCompare(b.file),
  );

  const lines = [
    "# Menu — recent briefs",
    "",
  ];
  rows.forEach((r, i) => {
    const token = String(i + 1).padStart(2, "0");
    lines.push(`**[${token}]** ${r.glyph} ${r.title} — ${r.file}`);
    lines.push(""); // separate paragraphs → bulletless, breathing
  });
  lines.push("---", "");
  lines.push("**Key** — `**[NN]**` type to jump · state glyphs:");
  lines.push("");
  lines.push("☐ open · ⋮ parked · ✗ rejected · ✓ accepted (as an ADR)");
  lines.push("");
  console.log(lines.join("\n"));
}