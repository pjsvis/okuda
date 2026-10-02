// ── The Callsign Checksum (BRF-CALLSIGN-CHECKSUM) ───────────────────
//  The Shannon checksum over the citation namespace, sibling to the
//  td-ID valve lint (which it shares its scan set and verdicts with):
//  every callsign cited in a persisted document — and in the UNPUSHED
//  commit-message range — must resolve through the product's own
//  resolver. A lint stricter than the product would flag working
//  jumps; the product's resolver is the only oracle (exact-or-ordinal,
//  unique-match-or-null — collision honesty free).
//  The baseline (scripts/callsign-baseline.json) grandfathers the
//  census residue: placeholders, documented forward references
//  (ADR-043 self-heals when it lands — the shrink note fires), dead
//  names, and frozen-doc sediment. At-count passes, over-count fails,
//  under-count says so and names the prune remedy — the ratchet stays
//  a ratchet, never an allowance.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { resolveByCallsign } from "../src/root";
import { scannedFiles, verdict, TD_ID, type Verdict } from "./td-id-lint";

/** The citation families the registries mint (ADR-024's vocabulary plus
 *  the OKF bundle prefix and the reserved CSN space — both verified in
 *  the census; a family that matches nothing today is caught the day
 *  it does). Left-to-right alternation: BRF-OKF-CALLSIGN is ONE token,
 *  never an OKF fragment inside a BRF. */
export const CALLSIGN_TOKEN = /\b(BRF|ADR|ADV|DBF|PLY|OKF|CSN)(-[A-Z0-9]+)+\b/g;

/** The repo root, pinned — the registries are read THERE, never from the
 *  process cwd. Outside a silo the registries come up empty and a lint
 *  with an empty oracle passes-or-fails everything and means nothing. */
export const REPO_ROOT = resolve(join(import.meta.dir, ".."));

/** Extract callsign-shaped tokens. Pure. */
export function extractCallsigns(text: string): string[] {
  return [...text.matchAll(CALLSIGN_TOKEN)].map((m) => m[0]!);
}

/** Message-range violations of both valves, resolver injected (pure for
 *  the tests, the product's resolver in the gate). */
export function messageViolations(
  body: string,
  resolve: (t: string) => string | null,
): string[] {
  const out: string[] = [];
  for (const m of body.matchAll(TD_ID)) out.push(`td ID in message: ${m[0]}`);
  for (const tok of extractCallsigns(body)) {
    if (resolve(tok) === null) out.push(`unresolvable callsign: ${tok}`);
  }
  return out;
}

function readBaseline(): Record<string, number> {
  const p = "scripts/callsign-baseline.json";
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
}

/** The corpus scan: every persisted doc's citations resolve, or sit at
 *  baseline. One file with no entry and any hit is a violation — the
 *  gate governs forward, from the census. */
function checkCorpus(baseline: Record<string, number>): Verdict[] {
  const verdicts: Verdict[] = [];
  const next: Record<string, number> = {};
  for (const f of scannedFiles()) {
    const text = readFileSync(f, "utf8");
    const hits = extractCallsigns(text).filter(
      (t) => resolveByCallsign(t, REPO_ROOT) === null,
    );
    if (hits.length === 0) continue;
    next[f] = hits.length;
    const v = verdict(hits.length, baseline[f]);
    if (v === "violation") {
      const shown = [...new Set(hits)].slice(0, 4).join(", ");
      const extra = new Set(hits).size > 4 ? ` (+${new Set(hits).size - 4} more)` : "";
      console.error(`  ${f}: ${hits.length} unresolvable — ${shown}${extra} (baseline ${baseline[f] ?? 0})`);
    } else if (v === "shrink") {
      console.log(`  baseline can shrink: ${f}: ${hits.length} < baseline ${baseline[f]} — prune with --write-baseline`);
    }
    verdicts.push(v);
  }
  if (process.argv.includes("--write-baseline")) {
    writeFileSync("scripts/callsign-baseline.json", JSON.stringify(next, null, 2) + "\n");
    console.log(`callsign baseline written: ${Object.keys(next).length} files, ${Object.values(next).reduce((a, b) => a + b, 0)} citations grandfathered`);
  }
  return verdicts;
}

/** The unpushed message range: origin/main..HEAD — exactly where
 *  amending is still cheap. Pushed history is never rewritten for
 *  hygiene (the valve's residue clause); a missing origin/main is a
 *  missing instrument, not a verdict. */
function checkUnpushed(): string[] {
  const has = Bun.spawnSync(["git", "rev-parse", "--verify", "--quiet", "origin/main"]);
  if (has.exitCode !== 0) {
    console.log("  no origin/main — unpushed range skipped (no instrument, no verdict)");
    return [];
  }
  const out = Bun.spawnSync(["git", "log", "origin/main..HEAD", "--pretty=format:%H%x00%B%x01"]);
  const text = new TextDecoder().decode(out.stdout);
  const violations: string[] = [];
  for (const chunk of text.split("\x01")) {
    const nul = chunk.indexOf("\x00");
    if (nul < 0) continue;
    const hash = chunk.slice(0, nul).slice(0, 7);
    for (const v of messageViolations(chunk.slice(nul + 1), (t) => resolveByCallsign(t, REPO_ROOT))) {
      violations.push(`  ${hash}: ${v}`);
    }
  }
  return violations;
}

function main() {
  const vs = checkCorpus(readBaseline());
  const range = checkUnpushed();
  const corpusFail = vs.includes("violation");
  if (corpusFail) console.error("callsign lint: unresolvable citations beyond baseline — cite the registered form, or register the thing.");
  for (const v of range) console.error(v);
  if (range.length > 0) console.error("callsign lint: the unpushed range carries violations — amend while it is cheap.");
  if (corpusFail || range.length > 0) process.exitCode = 1;
  else console.log("callsign lint: OK (checksum held; every citation resolves or sits at baseline)");
}

if (import.meta.main) main();
