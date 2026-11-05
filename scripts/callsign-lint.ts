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
//  names, and frozen-doc sediment. It is PER TOKEN ({file: {token:
//  count}}, BRF-COUNT-BASELINE-TOKENS): a token the baseline never saw
//  fails at any count, over-count fails, under-count says so and names
//  the prune remedy — the ratchet stays a ratchet, never an allowance.
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { resolveByCallsign } from "../src/root";
import { scannedFiles, judge, readBaseline, tally, TD_ID, type Baseline, type Verdict } from "./td-id-lint";

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

/** The unresolvable citations in a document, resolver injected. Pure —
 *  the corpus gate's core, testable without the filesystem. */
export function unresolvableCitations(text: string, resolve: (t: string) => string | null): string[] {
  return extractCallsigns(text).filter((t) => resolve(t) === null);
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

const CALLSIGN_BASELINE = "scripts/callsign-baseline.json";

/** The corpus scan: every persisted doc's citations resolve, or sit at
 *  their own baseline. A token with no entry is a violation at any count —
 *  the gate governs forward, from the census. */
function checkCorpus(baseline: Baseline, report = true): Verdict[] {
  const verdicts: Verdict[] = [];
  const next: Baseline = {};
  for (const f of scannedFiles()) {
    const hits = tally(unresolvableCitations(readFileSync(f, "utf8"), (t) => resolveByCallsign(t, REPO_ROOT)));
    // judged for EVERY file — a zero-hit file with baseline entries is a
    // stale entry, reported token by token as shrink, never silently
    // skipped (a skipped stale entry is an allowance: a new citation rides it).
    if (Object.keys(hits).length > 0) next[f] = hits;
    const j = judge(hits, baseline[f]);
    if (report && j.verdict === "violation") {
      const parts = [
        ...j.newTokens.slice(0, 4).map((t) => `new: ${t}`),
        ...j.grown.map(([t, n, b]) => `${t} x${n} > baseline ${b}`),
      ];
      const extra = j.newTokens.length > 4 ? ` (+${j.newTokens.length - 4} more)` : "";
      console.error(`  ${f}: ${parts.join(", ")}${extra}`);
    } else if (report && j.verdict === "shrink") {
      const gone = j.shrunk.map(([t, n, b]) => (n === 0 ? `${t} gone` : `${t} x${n} < ${b}`)).join(", ");
      console.log(`  baseline can shrink: ${f}: ${gone} — prune with --write-baseline`);
    }
    verdicts.push(j.verdict);
  }
  if (process.argv.includes("--write-baseline")) {
    writeFileSync(CALLSIGN_BASELINE, JSON.stringify(next, null, 2) + "\n");
    const tokens = Object.values(next).reduce((a, m) => a + Object.keys(m).length, 0);
    const cites = Object.values(next).reduce((a, m) => a + Object.values(m).reduce((x, y) => x + y, 0), 0);
    console.log(`callsign baseline written: ${Object.keys(next).length} files, ${tokens} token(s), ${cites} citations grandfathered`);
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
  // In write mode the baseline is not consulted: the writer records the corpus
  // and judges nothing, so it neither reads the shape it is replacing nor
  // reports verdicts against a baseline it did not read (see
  // scripts/td-id-lint.ts for where the migration's proof lives).
  const writeBaseline = process.argv.includes("--write-baseline");
  const vs = checkCorpus(writeBaseline ? {} : readBaseline(CALLSIGN_BASELINE), !writeBaseline);
  if (writeBaseline) return;
  const range = checkUnpushed();
  const corpusFail = vs.includes("violation");
  if (corpusFail) console.error("callsign lint: unresolvable citations beyond baseline — cite the registered form, or register the thing.");
  for (const v of range) console.error(v);
  if (range.length > 0) console.error("callsign lint: the unpushed range carries violations — amend while it is cheap.");
  if (corpusFail || range.length > 0) process.exitCode = 1;
  else console.log("callsign lint: OK (checksum held; every citation resolves or sits at baseline)");
}

if (import.meta.main) main();
