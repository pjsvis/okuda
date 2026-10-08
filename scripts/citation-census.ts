#!/usr/bin/env bun
// ── The citation census (ADR-DOCUMENT-LIFECYCLE-057) ────────────────
//  The second of the lifecycle's two teeth, and the complement of
//  `callsign-lint`. That gate catches a citation that resolves NOWHERE; this
//  one catches a minted code that nothing cites and no tier explains — the
//  flood the policy forbids (zero-effort metadata, curated codes).
//
//  A DEMOTION CANDIDATE is a declared callsign that is:
//    - not in any registry (no tier relation), and
//    - cited by nothing (nobody speaks it).
//  Such a document owes its date, not its name: drop the code, or promote the
//  document into a tier. A registered callsign cited by nothing is a READING,
//  not a fault — a tier unit's code is earned by construction.
//
//  `--strict` fails on any candidate; `just check` runs it that way, at zero.
//
//  Usage: bun scripts/citation-census.ts [--json] [--strict] [files...]
import { readFileSync, existsSync } from "node:fs";
import { scannedFiles, EXEMPT_FILES } from "./td-id-lint";
import { extractCallsigns } from "./callsign-lint";
import { REGISTRIES } from "./reg-sync";

/** Document-declared callsigns and the citation edges, as data. Pure. */
export function census(
  declared: Array<{ file: string; cs: string }>,
  registered: Map<string, string>,
  citedBy: Map<string, Set<string>>,
): { candidates: Array<{ cs: string; file: string }>; uncitedRegistered: string[] } {
  const candidates: Array<{ cs: string; file: string }> = [];
  const uncitedRegistered: string[] = [];
  for (const { file, cs } of declared) {
    const cited = [...(citedBy.get(cs) ?? [])].some((f) => f !== file);
    const reg = registered.get(cs);
    if (!reg && !cited) candidates.push({ cs, file });
    if (reg && !cited) uncitedRegistered.push(`${cs}  ${reg}`);
  }
  return { candidates, uncitedRegistered };
}

function main(): void {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");
  const strict = argv.includes("--strict");
  const files = argv.filter((a) => !a.startsWith("--"));
  const corpus = files.length > 0 ? files : scannedFiles().filter((f) => f.endsWith(".md"));

  // Registered codes, from the config (the playbooks index is REGISTRY.jsonl).
  const registered = new Map<string, string>();
  for (const def of Object.values(REGISTRIES)) {
    const p = `${def.dir}/${def.index}`;
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      if (!line.trim()) continue;
      try {
        const e = JSON.parse(line) as { file: string; callsign?: string };
        if (e.callsign) registered.set(e.callsign, `${def.dir}/${e.file}`);
      } catch {
        // a malformed row is reg-sync's to report
      }
    }
  }

  const declared: Array<{ file: string; cs: string }> = [];
  const citedBy = new Map<string, Set<string>>();
  for (const f of corpus) {
    if (EXEMPT_FILES.has(f)) continue;
    const text = readFileSync(f, "utf8");
    const m = text.match(/^---\n[\s\S]*?callsign:\s*([A-Z0-9-]+)/m);
    if (m) declared.push({ file: f, cs: m[1]! });
    for (const t of extractCallsigns(text)) {
      if (!citedBy.has(t)) citedBy.set(t, new Set());
      citedBy.get(t)!.add(f);
    }
  }

  const { candidates, uncitedRegistered } = census(declared, registered, citedBy);
  if (json) {
    console.log(JSON.stringify({ declared: declared.length, registered: registered.size, candidates, uncitedRegistered: uncitedRegistered.length }, null, 2));
  } else {
    console.log(
      `citation-census: ${declared.length} declared, ${registered.size} registered; ` +
        `${candidates.length} demotion candidate(s), ${uncitedRegistered.length} registered but uncited (a reading)`,
    );
    for (const c of candidates) console.log(`  candidate  ${c.cs}  ${c.file} — unregistered and uncited; it owes a date, not a name`);
  }
  if (strict && candidates.length > 0) {
    console.error(`\ncitation-census: FAIL — ${candidates.length} minted code(s) that nothing cites and no tier explains.`);
    process.exitCode = 1;
  }
}

if (import.meta.main) main();
