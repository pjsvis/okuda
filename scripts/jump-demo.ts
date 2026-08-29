#!/usr/bin/env bun
/**
 * jump-demo.ts — the menu compositor (index-and-jump, td-9d9981; the
 * three-column table form, td-bdfce0).
 *
 * The menu is a table — slug (content, emphasis) → callsign (address,
 * the registry's durable handle) → number (action, white-bold — type it
 * to jump). The number is a column near the slug, not a distant RHS
 * anchor: the eye scans words, notes the handle, acts on the number
 * sitting right there. The wiring (token + path) hides in each row's
 * HTML comment — the renderer strips it; extractJumps reads it from
 * source. State glyphs nest as a trailing mark on the slug — only
 * deviations wear theirs (style-guide); the classification prefix is
 * stripped and registry stem headings normalised (honesty brief). The
 * one-line form (`slug %%okuda-rhs:NN%%`) remains the pattern for menus
 * without an address column — the renderer's paragraph handler owns it.
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

/** First `# ` heading of pre-read content, or the basename. Pure. */
function titleOf(file: string, content: string): string {
  const m = content.match(/^#\s+(.+)$/m);
  return (m?.[1] ?? file).trim();
}

/** Strip the classification prefix the path's folder already carries —
 *  `Brief: …`, `brief: …`, `Decision: …`, etc. The slug is the
 *  descriptive name, not its classification. A registry stem heading
 *  (`decision: 011-dashed-slug`) also loses its numeric sequence prefix
 *  and is spaced + capitalised — the number belongs to the jump token
 *  (RHS), not the slug. Non-stem titles (with legitimate hyphens like
 *  `code-fence`) pass through untouched. (brief: jump-demo-honesty.) */
export function slugify(title: string): string {
  const stripped = title.replace(/^(brief|decision|debrief|playbook)\s*:\s*/i, "");
  const stem = stripped.match(/^(\d+)-(.+)/);
  if (stem) {
    const words = stem[2]!.replace(/-/g, " ");
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
  return stripped;
}

/** State glyph for a brief, derived from its `**Status:**` line — the
 *  closed lexicon (style-guide). The default (open/pending) carries no
 *  glyph: a column of ☐ is decoration, not signal. Only the deviations
 *  earn theirs. (brief: jump-demo-honesty — the state-glyph lie.) */
export function stateGlyph(content: string): string {
  const m = content.match(/\*\*Status:\*\*\s*(.+)/);
  const s = (m?.[1] ?? "").toLowerCase();
  if (/rejected/.test(s)) return "\u2717";  // ✗
  if (/parked/.test(s))   return "\u22ee";  // ⋮
  if (/accepted/.test(s)) return "\u2713";  // ✓
  return "";  // open / pending / unknown — the default; no glyph
}

/** The jump token for a zero-based index. Numbers from 11, not 01 — the
 *  0 key sits at the opposite end of the number row from 1, and the tokens
 *  are ephemeral codes (never counts), so they should be easy to type. The
 *  offset removes the 0-key stretch for the common <=~10-item list and
 *  reserves 01-09 as a free namespace. Two digits cover 11-99 (89 items);
 *  lists over ~10 are the compositor's concern, not the renderer's.
 *  (ADR-021.) */
export function jumpToken(index: number): string {
  return String(index + 11);
}

/** Compose one table row of the menu: slug (content) → callsign
 *  (address) → number (action). The glyph nests as a trailing mark on
 *  the slug — state is a property of content, not a channel. The wiring
 *  (token + path) hides in the row's HTML comment: the renderer strips
 *  it, extractJumps reads it from source. Pure. (td-bdfce0 — the
 *  three-column form; the distant-RHS number was a list-shape failure
 *  the table fixes: the number is a column near the slug, a structure.) */
export function tableRow(slug: string, glyph: string, callsign: string, n: string, file: string): string {
  const mark = glyph ? ` ${glyph}` : ""; // deviation earns its mark; default bare
  const cs = callsign || ""; // pre-migration doc — empty cell, honest
  return `| *${slug}*${mark} | ${cs} | **${n}** <!-- %%okuda-rhs:${n}%% ${file} --> |`;
}

if (import.meta.main) {
  const recent = readdirSync(join(ROOT, "briefs"))
    .filter((f) => /^2026-08-28.*\.md$/.test(f))
    .map((f) => `briefs/${f}`);
  const rejected = "briefs/2026-08-25-brief-viewport-padding.md";
  const files = [...recent, rejected].sort();

  // Callsign column: the registry is the fast index (frontmatter truth).
  // A doc without one renders an empty cell — honest, not derived.
  const csIndex = new Map<string, string>();
  for (const line of readFileSync(join(ROOT, "briefs", "INDEX.jsonl"), "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const e = JSON.parse(line) as { file?: string; callsign?: string };
      if (e.file && e.callsign) csIndex.set(`briefs/${e.file}`, e.callsign);
    } catch { /* malformed — skip */ }
  }

  const rows = files.map((f) => {
    const content = readFileSync(join(ROOT, f), "utf8");
    return { file: f, title: titleOf(f, content), content };
  });
  rows.sort((a, b) => a.file.localeCompare(b.file));

  const lines = ["# Menu — recent briefs", ""];
  // Three columns: content → address → action (slug → callsign → number).
  // The number is a column near the slug — the eye scans words, notes the
  // durable handle, acts on the number sitting right there. Widening
  // restores the slug; the number never left.
  lines.push("| Document | Callsign | # |", "|---|---|---|");
  rows.forEach((r, i) => {
    lines.push(tableRow(slugify(r.title), stateGlyph(r.content), csIndex.get(r.file) ?? "", jumpToken(i), r.file));
  });
  lines.push("");
  lines.push("---", "", "**Key** — type the number to jump · state glyphs (deviations marked):", "");
  lines.push("☐ open · ⋮ parked · ✗ rejected · ✓ accepted (as an ADR)");
  lines.push("");
  console.log(lines.join("\n"));
}