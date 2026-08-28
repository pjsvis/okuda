#!/usr/bin/env bun
/**
 * jump-demo.ts — the menu compositor (index-and-jump, td-9d9981).
 *
 * The line, under the near/far pattern (the gloaming):
 *   chip (solid block, the action indicator — type it to jump) →
 *   slug (emphasis, near-but-lesser, the content) →
 *   path (muted, far — on its own line beneath, no dash: the line
 *   break is the separator). State glyphs wear only on the deviations —
 *   the default (open) carries no glyph, since a column of ☐ is
 *   decoration, not signal (style-guide). The chip (action) outranks the
 *   glyph (state) for the eye's first stop on the default rows; a
 *   rejected/parked/accepted row earns its glyph because the state is the
 *   story. The `Brief:` / `Decision:` classification prefix is stripped,
 *   and a registry stem heading (`decision: 011-…`) is normalised to the
 *   descriptive title — the number sequence belongs to the jump token
 *   (RHS), not the slug. The path's folder already says the class.
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

if (import.meta.main) {
  const recent = readdirSync(join(ROOT, "briefs"))
    .filter((f) => /^2026-08-28.*\.md$/.test(f))
    .map((f) => `briefs/${f}`);
  const rejected = "briefs/2026-08-25-brief-viewport-padding.md";
  const files = [...recent, rejected].sort();

  const rows = files.map((f) => {
    const content = readFileSync(join(ROOT, f), "utf8");
    return { file: f, title: titleOf(f, content), content };
  });
  rows.sort((a, b) => a.file.localeCompare(b.file));

  const lines = ["# Menu — recent briefs", ""];
  rows.forEach((r, i) => {
    const n = jumpToken(i);
    const slug = slugify(r.title);
    const glyph = stateGlyph(r.content);
    const lead = glyph ? `${glyph} ` : "";  // deviation earns its mark; default bare
    // [glyph?] slug (emphasis) → RHS number (the action). Visual order
    // follows action order: consider the slug, then execute the number.
    // The path is wiring in an HTML comment the renderer strips but
    // extractJumps reads. One line — truncate to fit, never wrap.
    lines.push(`${lead}*${slug}* %%okuda-rhs:${n}%% <!-- ${r.file} -->`);
    lines.push(""); // blank line between items → bulletless, breathing
  });
  lines.push("---", "", "**Key** — type the number to jump · state glyphs (deviations marked):", "");
  lines.push("☐ open · ⋮ parked · ✗ rejected · ✓ accepted (as an ADR)");
  lines.push("");
  console.log(lines.join("\n"));
}