// ── The lexicon's ancestry, enforced (BRF-*: the coinage rule) ───────
//  Every entry in a lexicon — the general lexicon in `system.md` and the
//  silo's `conceptual-lexicon.md` — must state its ancestry: `**Prior art:**`
//  naming the practice, document or decision the term descends from, or an
//  explicit "none known".
//
//  Why: this corpus coins a lot of names — audit surface, attributable
//  structure, silo genesis — and a fresh name for an old practice reads as a
//  discovery. A term that cannot cite its ancestors is a coinage looking for a
//  mint, not a tool; and worse, re-naming an old practice can *lose* its
//  inherited apparatus (chain of custody, the apparatus criticus, retention)
//  and then reinvent it badly. The honesty note in `docs/2026-10-09-silo-genesis.md`
//  is the argument; this is the check.
//
//  Pre-codification sediment is baselined (`scripts/lexicon-baseline.json`) —
//  retro-fitting ancestry to fifteen older entries is editorial work, and the
//  repo's rule is not to bulk-edit history. The baseline may only SHRINK.
//
//  Exit 1 on any unbaselined entry with no prior-art statement, 0 otherwise.
//  Run: bun scripts/lexicon-lint.ts

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

interface Entry {
  term: string;
  file: string;
  hasPriorArt: boolean;
}

/** Entries: a top-level `* **Term**: …` bullet. Candidate lists in the
 *  silo lexicon use `- **term**,` — a to-do, not an entry — so they do
 *  not match. An entry runs until the next entry. */
const RE_ENTRY = /^\* \*\*(.+?)\*\*/;

function entriesIn(file: string, sectionHeader?: string): Entry[] {
  const path = join(ROOT, file);
  if (!existsSync(path)) return [];
  const lines = readFileSync(path, "utf8").split("\n");
  let start = 0;
  if (sectionHeader !== undefined) {
    const i = lines.findIndex((l) => l.startsWith(sectionHeader));
    if (i === -1) return [];
    start = i;
  }
  const out: Entry[] = [];
  let current: { term: string; body: string[] } | null = null;
  for (let i = start; i < lines.length; i++) {
    const l = lines[i]!;
    // A top-level heading other than the section's own ends the section.
    if (current !== null && /^# /.test(l) && l !== lines[start]) {
      out.push(finish(current, file));
      current = null;
      break;
    }
    const m = l.match(RE_ENTRY);
    if (m) {
      if (current) out.push(finish(current, file));
      current = { term: m[1]!, body: [l] };
      continue;
    }
    if (current) current.body.push(l);
  }
  if (current) out.push(finish(current, file));
  return out;
}

function finish(e: { term: string; body: string[] }, file: string): Entry {
  // Collapse whitespace before matching: the entry text wraps, so the marker
  // can arrive as `**Prior\n  art:**` — the same reason the render wraps.
  const text = e.body.join("\n").replace(/\s+/g, " ");
  return { term: e.term.trim(), file, hasPriorArt: /prior art/i.test(text) };
}

const all: Entry[] = [
  ...entriesIn("system.md", "# LEXICON"),
  ...entriesIn("conceptual-lexicon.md"),
];

const baselinePath = join(ROOT, "scripts/lexicon-baseline.json");
const baseline: string[] = existsSync(baselinePath)
  ? (JSON.parse(readFileSync(baselinePath, "utf8")) as string[])
  : [];
const base = new Set(baseline);

const missing = all.filter((e) => !e.hasPriorArt && !base.has(e.term));
const shrinkable = all.filter((e) => e.hasPriorArt && base.has(e.term));

if (missing.length > 0) {
  console.error("lexicon-lint: FAIL — entries with no prior-art statement:");
  for (const e of missing) {
    console.error(`  ${e.term}  (${e.file})`);
  }
  console.error(
    '  add `**Prior art:** <the practice, document or decision it descends from>`,' +
      ' or `**Prior art:** none known` if it is genuinely a new thing.',
  );
  process.exit(1);
}

const note =
  shrinkable.length > 0
    ? ` — baseline can shrink: ${shrinkable.map((e) => e.term).join(", ")}`
    : "";
console.log(
  `lexicon-lint: OK (${all.length} entries, ${baseline.length} baselined)${note}`,
);
