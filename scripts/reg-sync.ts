#!/usr/bin/env bun
/**
 * reg-sync.ts — detect (and with --fix, repair) drift between registry
 * directories and their JSONL indexes.
 *
 * Usage:
 *   bun scripts/reg-sync.ts <registry>   # check one: briefs|debriefs|decisions|playbooks
 *   bun scripts/reg-sync.ts --all        # check all
 *   bun scripts/reg-sync.ts --all --fix  # add MISSING, drop STALE, rewrite index
 *
 * Exit code 1 on any drift, 0 when clean.
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

interface RegistryDef {
  dir: string;
  index: string;
  defaultStatus: string;
  exclude?: string[];
}

const REGISTRIES: Record<string, RegistryDef> = {
  briefs: { dir: "briefs", index: "INDEX.jsonl", defaultStatus: "open" },
  debriefs: { dir: "debriefs", index: "INDEX.jsonl", defaultStatus: "done" },
  decisions: { dir: "decisions", index: "INDEX.jsonl", defaultStatus: "Proposed", exclude: ["TEMPLATE.md"] },
  playbooks: { dir: "playbooks", index: "REGISTRY.jsonl", defaultStatus: "canonical" },
};

interface Entry {
  file: string;
  date: string;
  status: string;
  summary: string;
  meta?: Record<string, unknown>;
}

const BRIEF_STATUS: Record<string, string> = {
  open: "open",
  "in progress": "in_progress",
  done: "done",
};

function readIndex(indexPath: string): Entry[] {
  let raw: string;
  try {
    raw = readFileSync(indexPath, "utf8");
  } catch {
    return [];
  }
  return raw
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((l, i) => {
      try {
        return JSON.parse(l) as Entry;
      } catch {
        console.warn(`  WARN: unparseable line ${i + 1} in ${indexPath} — skipping`);
        return null;
      }
    })
    .filter((e): e is Entry => e !== null);
}

function listDocs(dir: string, exclude: string[] = []): string[] {
  try {
    return readdirSync(dir).filter((f) => f.endsWith(".md") && !exclude.includes(f)).sort();
  } catch {
    return [];
  }
}

/** Pull `date:` frontmatter or a `**Date:**` line; fall back to file mtime. */
function deriveDate(content: string, path: string): string {
  const fm = content.match(/^---\n[\s\S]*?date:\s*(\d{4}-\d{2}-\d{2})/m);
  if (fm) return fm[1];
  const bold = content.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
  if (bold) return bold[1];
  try {
    return statSync(path).mtime.toISOString().slice(0, 10);
  } catch {
    return "1970-01-01";
  }
}

function deriveStatus(content: string, def: RegistryDef, registry: string): string {
  if (registry === "briefs") {
    const m = content.match(/\*\*Status:\*\*\s*(.+)/);
    if (m) return BRIEF_STATUS[m[1].trim().toLowerCase()] ?? "open";
    return "open";
  }
  if (registry === "decisions") {
    const m = content.match(/\*\*Status:\*\*\s*(Proposed|Accepted|Superseded)/i);
    if (m) return m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
    return def.defaultStatus;
  }
  return def.defaultStatus;
}

function deriveSummary(content: string, file: string): string {
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].replace(/^Decision:\s*/i, "").replace(/^Brief:\s*/i, "").trim();
  return file.replace(/\.md$/, "");
}

function deriveEntry(dir: string, file: string, def: RegistryDef, registry: string): Entry {
  const path = join(dir, file);
  const content = readFileSync(path, "utf8");
  return {
    file,
    date: deriveDate(content, path),
    status: deriveStatus(content, def, registry),
    summary: deriveSummary(content, file),
    meta: {},
  };
}

function syncOne(name: string, fix: boolean): { missing: number; stale: number } {
  const def = REGISTRIES[name];
  if (!def) {
    console.error(`Unknown registry: ${name} (valid: ${Object.keys(REGISTRIES).join(", ")})`);
    process.exitCode = 2;
    return { missing: 0, stale: 0 };
  }
  const dir = join(ROOT, def.dir);
  const indexPath = join(dir, def.index);
  const entries = readIndex(indexPath);
  const docs = listDocs(dir, def.exclude);
  const indexed = new Set(entries.map((e) => e.file));

  const missing = docs.filter((f) => !indexed.has(f));
  const stale = entries.filter((e) => !docs.includes(e.file));

  for (const f of missing) {
    const entry = fix ? deriveEntry(dir, f, def, name) : null;
    console.log(`  ${name}: MISSING ${f}${fix ? ` → added (${entry!.status}, ${entry!.date})` : ""}`);
    if (entry) entries.push(entry);
  }
  for (const e of stale) {
    console.log(`  ${name}: STALE ${e.file}${fix ? " → removed" : ""}`);
  }

  if (fix) {
    if (missing.length || stale.length) {
      entries.sort((a, b) => a.file.localeCompare(b.file));
      writeFileSync(indexPath, entries.map((e) => JSON.stringify(e)).join("\n") + "\n");
      console.log(`  ${name}: index rewritten (${entries.length} entries)`);
    } else {
      console.log(`  ${name}: OK (0 missing, 0 stale)`);
    }
  } else if (missing.length || stale.length) {
    console.log(`  ${name}: ${missing.length} MISSING, ${stale.length} STALE`);
  } else {
    console.log(`  ${name}: OK (0 missing, 0 stale)`);
  }

  return { missing: missing.length, stale: stale.length };
}

const args = process.argv.slice(2);
const fix = args.includes("--fix");
const all = args.includes("--all");
const names = all || args.length === 0 ? Object.keys(REGISTRIES) : args.filter((a) => !a.startsWith("--"));

console.log(`reg-sync ${fix ? "(fix mode)" : "(check mode)"} — ${names.join(", ")}`);
let drift = 0;
for (const n of names) {
  const { missing, stale } = syncOne(n, fix);
  drift += missing + stale;
}
if (drift > 0) {
  console.log(`${drift} drift item(s) ${fix ? "repaired" : "found"} — run reg-list to review`);
  if (!fix) process.exitCode = 1;
} else {
  console.log("All registries in sync");
}
