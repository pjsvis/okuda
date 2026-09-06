#!/usr/bin/env bun
/**
 * reg-sync.ts — detect (and with --fix, repair) drift between registry
 * directories and their JSONL indexes; maintain OKF frontmatter
 * (`type` + `callsign`) across the corpus (ADR-019; brief
 * 2026-08-29-brief-okf-callsign-migration).
 *
 * Usage:
 *   bun scripts/reg-sync.ts <registry>   # check one: briefs|debriefs|decisions|playbooks
 *   bun scripts/reg-sync.ts --all        # check all
 *   bun scripts/reg-sync.ts --all --fix  # add MISSING, drop STALE, rewrite index,
 *                                        # ensure frontmatter, lift callsigns
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
  /** OKF frontmatter `type` value and callsign prefix for this tier. */
  fmType: string;
  csPrefix: string;
}

const REGISTRIES: Record<string, RegistryDef> = {
  briefs: { dir: "briefs", index: "INDEX.jsonl", defaultStatus: "open", exclude: ["index.md"], fmType: "Brief", csPrefix: "BRF" },
  debriefs: { dir: "debriefs", index: "INDEX.jsonl", defaultStatus: "done", exclude: ["index.md"], fmType: "Debrief", csPrefix: "DBF" },
  decisions: { dir: "decisions", index: "INDEX.jsonl", defaultStatus: "Proposed", exclude: ["TEMPLATE.md", "index.md"], fmType: "ADR", csPrefix: "ADR" },
  playbooks: { dir: "playbooks", index: "REGISTRY.jsonl", defaultStatus: "canonical", exclude: ["index.md"], fmType: "Playbook", csPrefix: "PLY" },
  // advisories: deadpan AI-HR dispatches for reader classes by persona
  // (capability-named, not deficit-named — the i811 policy in microcosm).
  // The manual (AI-HR-MANUAL.md) is the tier's constitution, excluded
  // from the dispatch index like TEMPLATE.md is excluded from decisions.
  advisories: { dir: "advisories", index: "INDEX.jsonl", defaultStatus: "open", exclude: ["index.md", "AI-HR-MANUAL.md"], fmType: "Advisory", csPrefix: "ADV" },
};

interface Entry {
  file: string;
  date: string;
  status: string;
  summary: string;
  meta?: Record<string, unknown>;
  /** Durable human code (silo-mnemonics); frontmatter is the source of
   *  truth, the registry the fast index. Absent pre-migration. */
  callsign?: string;
}

const BRIEF_STATUS: Record<string, string> = {
  open: "open",
  "in progress": "in_progress",
  done: "done",
};

// ── Frontmatter (pure) ────────────────────────────────────────────────

/** Split a document into frontmatter body and rest. Returns null fm when
 *  the document does not open with a `---` fence. Pure. */
export function splitFrontmatter(content: string): { fm: string | null; rest: string } {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: null, rest: content };
  return { fm: m[1]!, rest: content.slice(m[0].length) };
}

/** One-line `key: value` read from a frontmatter body. No YAML dependency
 *  (parity with root.ts frontmatterValue). Pure. */
export function fmValue(fm: string, key: string): string | null {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return m ? m[1]!.trim().replace(/^["']|["']$/g, "") : null;
}

/** Ensure `type` and `callsign` keys exist in a document's frontmatter,
 *  prepending a fence when absent and inserting missing keys after the
 *  opening one. Never touches existing keys — assigned callsigns are
 *  never re-derived (silo-mnemonics: resolution, not derivation).
 *  Returns the new content, or null when already conformant. Pure. */
export function ensureFrontmatter(content: string, type: string, callsign: string): string | null {
  const { fm, rest } = splitFrontmatter(content);
  if (fm === null) {
    return `---\ntype: ${type}\ncallsign: ${callsign}\n---\n\n${rest}`;
  }
  const hasType = fmValue(fm, "type") !== null;
  const hasCs = fmValue(fm, "callsign") !== null;
  if (hasType && hasCs) return null;
  const ins: string[] = [];
  if (!hasType) ins.push(`type: ${type}`);
  if (!hasCs) ins.push(`callsign: ${callsign}`);
  return `---\n${ins.join("\n")}\n${fm}\n---\n${rest}`;
}

/** Token words that carry no identity: connectives and the tier's own
 *  nouns (a "playbook" inside playbooks/ says nothing). */
const STOPWORDS = new Set(
  ("a an the and or of to in on for with via not no is are as at by from into over under " +
    "playbook playbooks").split(" "),
);

/** Bootstrap a document's callsign from its filename: tier prefix + the
 *  first ≤2 significant slug tokens, ADRs appending their zero-padded
 *  sequence. Deterministic; collision suffixing happens at assignment.
 *  (silo-mnemonics: run once per document, never re-derived.) Pure. */
export function bootstrapCallsign(file: string, prefix: string): string {
  let stem = file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const seq = stem.match(/^(\d+)-/);
  if (seq) stem = stem.slice(seq[0].length);
  stem = stem.replace(/^(brief|decision|debrief)-/, "");
  const tokens = stem
    .split("-")
    .filter((t) => t.length > 0 && !STOPWORDS.has(t))
    .slice(0, 2)
    .map((t) => t.toUpperCase());
  const base = tokens.length > 0 ? [prefix, ...tokens].join("-") : `${prefix}-DOC`;
  return seq ? `${base}-${String(Number(seq[1])).padStart(3, "0")}` : base;
}

/** Assign a fresh callsign avoiding the taken set: base, then -2, -3, …
 *  First-come keeps the clean form; order is the caller's (registries in
 *  fixed order, files sorted). Pure. */
export function avoidingCollisions(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const c = `${base}-${n}`;
    if (!taken.has(c)) return c;
  }
}

/** A document's effective callsign: frontmatter's if assigned (never
 *  re-derived), else null until the migration assigns one. Pure. */
export function docCallsign(content: string): string | null {
  const { fm } = splitFrontmatter(content);
  return fm ? fmValue(fm, "callsign") : null;
}

// ── Registry derivation (unchanged semantics) ──────────────────────────

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
  if (fm) return fm[1]!;
  const bold = content.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
  if (bold) return bold[1]!;
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
    if (m) return m[1]![0].toUpperCase() + m[1]!.slice(1).toLowerCase();
    return def.defaultStatus;
  }
  return def.defaultStatus;
}

function deriveSummary(content: string, file: string): string {
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1]!.replace(/^Decision:\s*/i, "").replace(/^Brief:\s*/i, "").trim();
  return file.replace(/\.md$/, "");
}

// ── Frontmatter migration (the corpus pass) ────────────────────────────

interface MigrationResult {
  /** registry name → (file → callsign), for registry lift. */
  perRegistry: Map<string, Map<string, string>>;
  /** Docs whose frontmatter needed (and in fix mode, received) keys. */
  fmDrift: number;
}

/** Migrate frontmatter across all tiers. Phase A collects assigned
 *  callsigns (frontmatter is truth); phase B assigns bootstraps to the
 *  remainder, deterministically, avoiding collisions globally. In check
 *  mode nothing is written — drift is counted only. */
function migrateCorpus(fix: boolean): MigrationResult {
  const perRegistry = new Map<string, Map<string, string>>();
  const taken = new Set<string>();
  const pending: { name: string; def: RegistryDef; file: string; path: string; content: string }[] = [];

  for (const [name, def] of Object.entries(REGISTRIES)) {
    for (const file of listDocs(join(ROOT, def.dir), def.exclude)) {
      const path = join(ROOT, def.dir, file);
      const content = readFileSync(path, "utf8");
      const cs = docCallsign(content);
      if (cs) taken.add(cs);
      else pending.push({ name, def, file, path, content });
    }
  }

  let fmDrift = 0;
  const writes: { path: string; content: string }[] = [];
  for (const doc of pending) {
    const base = bootstrapCallsign(doc.file, doc.def.csPrefix);
    const cs = avoidingCollisions(base, taken);
    taken.add(cs);
    const next = ensureFrontmatter(doc.content, doc.def.fmType, cs);
    if (next !== null) {
      fmDrift++;
      if (fix) {
        writes.push({ path: doc.path, content: next });
        doc.content = next;
      }
    }
  }

  // Docs already carrying frontmatter may still lack type/callsign keys
  // (debriefs predate the migration; the keys land now, nothing clobbers).
  for (const [name, def] of Object.entries(REGISTRIES)) {
    const map = new Map<string, string>();
    for (const file of listDocs(join(ROOT, def.dir), def.exclude)) {
      const path = join(ROOT, def.dir, file);
      let content = readFileSync(path, "utf8");
      const pendingWrite = fix ? writes.find((w) => w.path === path) : undefined;
      if (pendingWrite) content = pendingWrite.content;
      let cs = docCallsign(content);
      if (!cs) continue; // unreachable post-fix; check mode counts via fmDrift
      const ensured = ensureFrontmatter(content, def.fmType, cs);
      if (ensured !== null) {
        fmDrift++;
        if (fix) {
          writes.push({ path, content: ensured });
          content = ensured;
          cs = docCallsign(content) ?? cs;
        }
      }
      if (fix) map.set(file, cs);
    }
    perRegistry.set(name, map);
  }

  if (fix) {
    const seen = new Set<string>();
    for (const w of writes) {
      if (seen.has(w.path)) continue;
      seen.add(w.path);
      writeFileSync(w.path, w.content);
    }
  }
  if (fmDrift > 0) {
    console.log(`  frontmatter: ${fmDrift} doc(s) ${fix ? "ensured" : "missing"} type/callsign`);
  }
  return { perRegistry, fmDrift };
}

// ── Index sync (membership + callsign lift) ────────────────────────────

function deriveEntry(dir: string, file: string, def: RegistryDef, registry: string, callsign?: string): Entry {
  const path = join(dir, file);
  const content = readFileSync(path, "utf8");
  const entry: Entry = {
    file,
    date: deriveDate(content, path),
    status: deriveStatus(content, def, registry),
    summary: deriveSummary(content, file),
    meta: {},
  };
  if (callsign) entry.callsign = callsign;
  return entry;
}

function syncOne(name: string, fix: boolean, csMap: Map<string, string>): { missing: number; stale: number; csDrift: number; indexDoc: number } {
  const def = REGISTRIES[name]!;
  const dir = join(ROOT, def.dir);
  const indexPath = join(dir, def.index);
  const entries = readIndex(indexPath);
  const docs = listDocs(dir, def.exclude);
  const indexed = new Set(entries.map((e) => e.file));

  const missing = docs.filter((f) => !indexed.has(f));
  const stale = entries.filter((e) => !docs.includes(e.file));

  for (const f of missing) {
    const entry = fix ? deriveEntry(dir, f, def, name, csMap.get(f)) : null;
    console.log(`  ${name}: MISSING ${f}${fix ? ` → added (${entry!.status}, ${entry!.date})` : ""}`);
    if (entry) entries.push(entry);
  }
  const staleFiles = new Set(stale.map((e) => e.file));
  for (const e of stale) {
    console.log(`  ${name}: STALE ${e.file}${fix ? " → removed" : ""}`);
  }

  // Callsign lift: frontmatter is truth; the registry mirrors it.
  let csDrift = 0;
  for (const e of entries) {
    if (staleFiles.has(e.file)) continue;
    const cs = csMap.get(e.file);
    if (cs && e.callsign !== cs) {
      csDrift++;
      if (fix) e.callsign = cs;
    }
  }
  if (csDrift > 0) {
    console.log(`  ${name}: ${csDrift} callsign(s) ${fix ? "lifted" : "drifting"} (frontmatter → registry)`);
  }

  const kept = entries.filter((e) => !staleFiles.has(e.file));
  if (fix) {
    if (missing.length || stale.length || csDrift > 0) {
      kept.sort((a, b) => a.file.localeCompare(b.file));
      writeFileSync(indexPath, kept.map((e) => JSON.stringify(e)).join("\n") + "\n");
      console.log(`  ${name}: index rewritten (${kept.length} entries)`);
    } else {
      console.log(`  ${name}: OK (0 missing, 0 stale)`);
    }
  } else if (missing.length || stale.length || csDrift > 0) {
    console.log(`  ${name}: ${missing.length} MISSING, ${stale.length} STALE`);
  } else {
    console.log(`  ${name}: OK (0 missing, 0 stale)`);
  }

  const indexDoc = syncIndexDoc(name, def, kept, fix);
  return { missing: missing.length, stale: stale.length, csDrift, indexDoc };
}

// ── Tier index.md export (ADR-019: generated, never hand-edited) ───────

/** Render a tier's `index.md` from its registry entries — the OKF-visible
 *  export. Deterministic: same entries, same bytes. Bare `.md` path tokens
 *  render as doc-refs in okuda; external OKF consumers get a table they
 *  can parse. Pure. */
export function renderIndexDoc(tier: string, entries: Entry[]): string {
  const rows = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date) || a.file.localeCompare(b.file))
    .map((e) => `| ${e.date} | ${e.callsign ?? ""} | ${e.status} | ${e.summary.replace(/\|/g, "\\|")} | ${e.file} |`);
  return [
    "---",
    "type: Index",
    "generated: true",
    "---",
    "",
    `# ${tier} — silo index`,
    "",
    "Generated from the registry by `reg-sync --fix`; hand-edits are overwritten.",
    "",
    "| Date | Callsign | Status | Document | File |",
    "|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
}

/** Sync the generated tier index.md against its registry. Returns drift
 *  count (0 = current). */
function syncIndexDoc(name: string, def: RegistryDef, entries: Entry[], fix: boolean): number {
  const path = join(ROOT, def.dir, "index.md");
  const want = renderIndexDoc(name, entries);
  let have: string | null = null;
  try {
    have = readFileSync(path, "utf8");
  } catch {
    // absent — drift unless fix writes it
  }
  if (have === want) return 0;
  if (fix) {
    writeFileSync(path, want);
    console.log(`  ${name}: index.md ${have === null ? "generated" : "regenerated"} (${entries.length} rows)`);
  } else {
    console.log(`  ${name}: index.md ${have === null ? "MISSING" : "STALE"}`);
  }
  return 1;
}

// ── Main ────────────────────────────────────────────────────────────────

if (import.meta.main) {
  const args = process.argv.slice(2);
  const fix = args.includes("--fix");
  const all = args.includes("--all");
  const names = all || args.length === 0 ? Object.keys(REGISTRIES) : args.filter((a) => !a.startsWith("--"));

  console.log(`reg-sync ${fix ? "(fix mode)" : "(check mode)"} — ${names.join(", ")}`);
  const { perRegistry, fmDrift } = migrateCorpus(fix);
  let drift = fmDrift;
  for (const n of names) {
    const { missing, stale, csDrift, indexDoc } = syncOne(n, fix, perRegistry.get(n) ?? new Map());
    drift += missing + stale + csDrift + indexDoc;
  }
  if (drift > 0) {
    console.log(`${drift} drift item(s) ${fix ? "repaired" : "found"} — run reg-list to review`);
    if (!fix) process.exitCode = 1;
  } else {
    console.log("All registries in sync");
  }
}
