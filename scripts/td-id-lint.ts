// ── The One-Way Valve, enforced (BRF-VALVE-LINT) ────────────────────
//  The valve (playbooks/td-playbook.md, codified 2026-10-02): td is
//  local and ephemeral; persisted documents cite callsigns and SHAs,
//  never td IDs. This lint is the prose rule made a gate — a NEW td-ID
//  citation in any persisted document fails `just check`.
//  Pre-codification sediment is baselined (td-id-baseline.json), inert
//  per the valve's residue clause: debriefs freeze, history is never
//  force-pushed for hygiene. The baseline may only shrink.
//  Exempt: the td manual itself (command syntax is not citation).
//  Excluded: generated index.md files (they echo baselined entries).
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Real ID shape, 6–8 hex, case-insensitive (length-proof). */
export const TD_ID = /\btd-[a-f0-9]{6,8}\b/gi;

/** The td manual documents the ephemeral layer's own command syntax. */
export const EXEMPT_FILES = new Set(["playbooks/td-playbook.md"]);

/** Registry dirs + docs/ + root files; *.jsonl registries included. */
function scannedFiles(): string[] {
  const out: string[] = [];
  const mdDirs = ["briefs", "decisions", "debriefs", "playbooks", "advisories", "docs"];
  for (const d of mdDirs) {
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (!statSync(p).isFile()) continue;
      if (f === "index.md") continue; // generated — echoes baselined entries
      if (f.endsWith(".md") || f === "INDEX.jsonl" || f === "REGISTRY.jsonl") out.push(p);
    }
  }
  for (const f of ["README.md", "AGENTS.md", "system.md", "DEPENDENCIES.md"]) {
    if (existsSync(f)) out.push(f);
  }
  return out;
}

/** Count td-ID citations in text. Pure. */
export function countIds(text: string): number {
  return (text.match(TD_ID) ?? []).length;
}

export type Verdict = "ok" | "shrink" | "violation";

/** ok: at baseline (or clean). shrink: below — drop the baseline entry.
 *  violation: over baseline, or any hit with no baseline entry at all. */
export function verdict(hits: number, baseline: number | undefined): Verdict {
  if (hits === 0) return "ok";
  if (baseline === undefined) return "violation";
  if (hits > baseline) return "violation";
  return hits < baseline ? "shrink" : "ok";
}

function readBaseline(): Record<string, number> {
  const p = "scripts/td-id-baseline.json";
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
}

function main() {
  const writeBaseline = process.argv.includes("--write-baseline");
  const baseline = readBaseline();
  const files = scannedFiles().filter((f) => !EXEMPT_FILES.has(f));
  const violations: string[] = [];
  const shrinks: string[] = [];
  const next: Record<string, number> = {};

  for (const f of files) {
    const text = readFileSync(f, "utf8");
    // line-level matches for loud messages
    const lines = text.split("\n");
    const hits: [number, string][] = [];
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i]!.match(TD_ID);
      if (m) hits.push([i + 1, m[0]!]);
    }
    const v = verdict(hits.length, baseline[f]);
    if (v === "violation") {
      const shown = hits.slice(0, 3).map(([l, m]) => `${f}:${l}: ${m}`).join(", ");
      const extra = hits.length > 3 ? ` (+${hits.length - 3} more)` : "";
      violations.push(`${f}: ${hits.length} td-ID citation(s), baseline ${baseline[f] ?? 0} — ${shown}${extra}`);
    } else if (v === "shrink") {
      shrinks.push(`${f}: ${hits.length} < baseline ${baseline[f]} — drop the entry`);
    }
    if (hits.length > 0) next[f] = hits.length;
  }

  if (writeBaseline) {
    writeFileSync("scripts/td-id-baseline.json", JSON.stringify(next, null, 2) + "\n");
    console.log(`td-id baseline written: ${Object.keys(next).length} files, ${Object.values(next).reduce((a, b) => a + b, 0)} citations grandfathered`);
    return;
  }
  for (const s of shrinks) console.log(`  baseline can shrink: ${s}`);
  if (violations.length > 0) {
    console.error(`td-id lint: ${violations.length} file(s) cite the ephemeral queue in persisted documents —`);
    console.error("  the One-Way Valve (playbooks/td-playbook.md): cite the callsign or SHA, never a td ID.");
    for (const v of violations) console.error(`  ${v}`);
    process.exitCode = 1;
  } else {
    console.log("td-id lint: OK (valve held; no new citations)");
  }
}

if (import.meta.main) main();
