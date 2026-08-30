#!/usr/bin/env bun
/**
 * reg-menu.ts — tier registry → jump-wired three-column menu compositor.
 *
 * The menu step as a one-liner: `just menu briefs` reads a tier's registry
 * (the fast index) and emits the menu pattern as a three-column table with
 * jump wiring, to stdout — no per-file reads (the registry already carries
 * the summary, status, and callsign). Ephemeral by design: stdout, never
 * registered, never a brief; jump tokens are session codes (silo-mnemonics),
 * so the durable tier `index.md` exports stay token-free.
 *
 * Reuses jump-demo's exported pure functions (tableRow, jumpToken); the
 * glyph derives from the registry status string (rejected ✗, parked ⋮,
 * accepted ✓ — only deviations). (Follow-up to td-bdfce0; td-012c5d.)
 *
 * Usage:
 *   bun scripts/reg-menu.ts <tier> [filter]   # markdown to stdout
 *   just menu briefs                         # generate + frame in the TUI
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tableRow, jumpToken } from "./jump-demo";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const TIER: Record<string, { dir: string; index: string }> = {
  briefs: { dir: "briefs", index: "INDEX.jsonl" },
  decisions: { dir: "decisions", index: "INDEX.jsonl" },
  debriefs: { dir: "debriefs", index: "INDEX.jsonl" },
  playbooks: { dir: "playbooks", index: "REGISTRY.jsonl" },
};

interface Entry {
  file: string;
  date: string;
  status: string;
  summary: string;
  callsign?: string;
}

/** State glyph from the registry status string — the closed lexicon
 *  (style-guide). Only deviations wear theirs; the default carries none
 *  (a column of ☐ is decoration, not signal). Pure. */
export function statusGlyph(status: string): string {
  const s = status.toLowerCase();
  if (/rejected/.test(s)) return "\u2717";  // ✗
  if (/parked/.test(s))   return "\u22ee";  // ⋮
  if (/accepted/.test(s)) return "\u2713";  // ✓ (ADR accepted)
  return "";  // open / in_progress / done / proposed / unknown — bare
}

/** Compose the wired menu table from registry entries: newest first
 *  (date desc, file tiebreak), jump tokens assigned in scan order.
 *  Slugs emit in full — no compositor-level cap: the renderer truncates
 *  to the live budget by priority (ADR-022 role fit, td-b81597 — the
 *  old 50-char cap was a fixed ceiling blind to the terminal, a layer
 *  violation: wasted space at 200 cols, starved at 60). Pure — the
 *  caller performs the IO. */
export function composeMenu(tier: string, entries: Entry[]): string {
  const sorted = [...entries].sort((a, b) =>
    b.date.localeCompare(a.date) || a.file.localeCompare(b.file));
  const lines = [`# Menu — ${tier}`, ""];
  lines.push("| Document | Callsign | # |", "|---|---|---|");
  sorted.forEach((e, i) => {
    lines.push(tableRow(e.summary, statusGlyph(e.status), e.callsign ?? "", jumpToken(i), `${tier}/${e.file}`));
  });
  lines.push("");
  return lines.join("\n");
}

if (import.meta.main) {
  const tier = process.argv[2];
  const filter = process.argv[3]; // optional substring: summary | callsign | file
  const def = TIER[tier];
  if (!def) {
    process.stderr.write(`reg-menu: unknown tier '${tier}' (valid: ${Object.keys(TIER).join(", ")})\n`);
    process.exit(1);
  }
  let entries: Entry[] = readFileSync(join(ROOT, def.dir, def.index), "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      try {
        return JSON.parse(l) as Entry;
      } catch {
        return null;
      }
    })
    .filter((e): e is Entry => e !== null);
  if (filter) {
    const f = filter.toLowerCase();
    entries = entries.filter(
      (e) =>
        e.summary.toLowerCase().includes(f) ||
        (e.callsign ?? "").toLowerCase().includes(f) ||
        e.file.toLowerCase().includes(f),
    );
  }
  console.log(composeMenu(tier, entries));
}
