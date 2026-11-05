// ── The One-Way Valve, enforced (BRF-VALVE-LINT) ────────────────────
//  The valve (playbooks/td-playbook.md, codified 2026-10-02): td is
//  local and ephemeral; persisted documents cite callsigns and SHAs,
//  never td IDs. This lint is the prose rule made a gate — a NEW td-ID
//  citation in any persisted document fails `just check`.
//  Pre-codification sediment is baselined (td-id-baseline.json), inert
//  per the valve's residue clause: debriefs freeze, history is never
//  force-pushed for hygiene. The baseline may only shrink.
//
//  The baseline is PER TOKEN ({file: {token: count}}), not per file
//  (BRF-COUNT-BASELINE-TOKENS, ADR-ALLOWANCE-NAMES-REFERENT-084): a count
//  cannot say which citation it permits, so a file that drops one
//  grandfathered ID and gains a different one at equal count read `ok`.
//  Both gates share this core.
//  Exempt: the td manual itself (command syntax is not citation).
//  Excluded: generated index.md files (they echo baselined entries).
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Real ID shape, 6–8 hex, case-insensitive (length-proof). */
export const TD_ID = /\btd-[a-f0-9]{6,8}\b/gi;

/** Files that MENTION the vocabulary without minting it. The td manual
 *  documents the ephemeral layer's own command syntax; the decision template
 *  shows a callsign SHAPE (`callsign: ADR-<WORDS>-NNN`) so the next author
 *  copies a legal one — and the census read that placeholder as a minted code
 *  the moment it landed (2026-10-13: *"ADR- — unregistered and uncited; it owes
 *  a date, not a name"*). Both are exemptions of the same class: a document
 *  about the notation, not a use of it. */
export const EXEMPT_FILES = new Set(["playbooks/td-playbook.md", "decisions/TEMPLATE.md"]);

/** Registry dirs + docs/ + root files; *.jsonl registries included.
 *  Exported: one scan set, two gates (this lint + the callsign
 *  checksum) — no drift between what each gate sees. */
export function scannedFiles(): string[] {
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

/** A file's grandfathered tokens: token → how many times it may appear.
 *  A set with multiplicity, not a total. */
export type TokenCounts = Record<string, number>;

/** The baseline: file → its grandfathered tokens. */
export type Baseline = Record<string, TokenCounts>;

/** The td-ID token as the baseline stores it. The pattern is
 *  case-insensitive, so the key must be too — a case flip is the same
 *  citation, never a swap. */
export const tdToken = (t: string): string => t.toLowerCase();

/** Tally tokens into counts, normalised. Pure. */
export function tally(tokens: readonly string[], normalise: (t: string) => string = (t) => t): TokenCounts {
  const out: TokenCounts = {};
  for (const t of tokens) {
    const k = normalise(t);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export interface Judgement {
  verdict: Verdict;
  /** Tokens the baseline has never seen — a violation at ANY count. */
  newTokens: string[];
  /** Tokens over their own grandfathered count: token, hits, baseline. */
  grown: [string, number, number][];
  /** Tokens under count or gone — the prune, named token by token:
   *  a CLEAN file with entries is the loudest shrink (a stale entry is a
   *  silent allowance, demonstrated live in the checksum review, 2026-10-02). */
  shrunk: [string, number, number][];
}

/** Judge one file's tokens against its own grandfathered tokens. Pure.
 *  The count is subsumed, never recomputed: a rising total must have raised
 *  some token, and this says which. So the same-edit SWAP — drop one
 *  baselined token, gain a different one, count unchanged — fails here, where
 *  a count comparison read `ok` (BRF-COUNT-BASELINE-TOKENS). */
export function judge(hits: TokenCounts, baseline: TokenCounts | undefined): Judgement {
  const newTokens: string[] = [];
  const grown: [string, number, number][] = [];
  const shrunk: [string, number, number][] = [];
  for (const [t, n] of Object.entries(hits)) {
    const b = baseline?.[t];
    if (b === undefined) newTokens.push(t);
    else if (n > b) grown.push([t, n, b]);
    else if (n < b) shrunk.push([t, n, b]);
  }
  for (const [t, b] of Object.entries(baseline ?? {})) {
    if (hits[t] === undefined) shrunk.push([t, 0, b]);
  }
  const verdict: Verdict =
    newTokens.length > 0 || grown.length > 0 ? "violation" : shrunk.length > 0 ? "shrink" : "ok";
  return { verdict, newTokens, grown, shrunk };
}

/** Read a baseline, refusing the legacy flat `{file: count}` shape. A count
 *  cannot be decomposed into tokens; a gate that invents a token set from a
 *  total is a gate that has stopped meaning anything. Fails loud, in the
 *  direction that matters — the migrate is `--write-baseline`, reviewed. */
export function readBaseline(path: string): Baseline {
  if (!existsSync(path)) return {};
  const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  const out: Baseline = {};
  for (const [f, v] of Object.entries(raw)) {
    if (typeof v === "number") {
      throw new Error(
        `${path}: legacy per-file count for ${f} — no token set to judge. Re-run this lint with --write-baseline after reviewing the corpus (BRF-COUNT-BASELINE-TOKENS).`,
      );
    }
    out[f] = v as TokenCounts;
  }
  return out;
}

/** The COUNT verdict, kept for baselines over a *quantity* — where the
 *  counted things are interchangeable (how many dates are wrong, how many
 *  cuts a document takes). It cannot see a swap and is not asked to: over
 *  a namespace of identifiers, take `judge()` (ADR-ALLOWANCE-NAMES-REFERENT-084).
 *  ok: at baseline. shrink: below (a stale entry is the loudest shrink).
 *  violation: over baseline, or any hit in an unbaselined file. */
export function verdict(hits: number, baseline: number | undefined): Verdict {
  if (hits === 0) return baseline !== undefined && baseline > 0 ? "shrink" : "ok";
  if (baseline === undefined) return "violation";
  if (hits > baseline) return "violation";
  return hits < baseline ? "shrink" : "ok";
}

const TD_ID_BASELINE = "scripts/td-id-baseline.json";

function main() {
  const writeBaseline = process.argv.includes("--write-baseline");
  // The writer judges nothing — it records what the corpus holds, so it does
  // not consult the shape it is replacing (it cannot: a legacy total is
  // unreadable by design). The migration's proof is equal totals per file in
  // the commit that runs it, not a claim this tool could make.
  const baseline = writeBaseline ? {} : readBaseline(TD_ID_BASELINE);
  const files = scannedFiles().filter((f) => !EXEMPT_FILES.has(f));
  const violations: string[] = [];
  const shrinks: string[] = [];
  const next: Baseline = {};

  for (const f of files) {
    // token → the lines that cite it, so a message can name both the token
    // and where it sits
    const seen = new Map<string, number[]>();
    const lines = readFileSync(f, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (const m of lines[i]!.matchAll(TD_ID)) {
        const t = tdToken(m[0]!);
        seen.set(t, [...(seen.get(t) ?? []), i + 1]);
      }
    }
    const hits: TokenCounts = {};
    for (const [t, at] of seen) hits[t] = at.length;

    const j = judge(hits, baseline[f]);
    if (j.newTokens.length > 0) {
      const shown = j.newTokens.slice(0, 3).map((t) => `${t} at line(s) ${[...new Set(seen.get(t))].join(",")}`).join(", ");
      const extra = j.newTokens.length > 3 ? ` (+${j.newTokens.length - 3} more)` : "";
      violations.push(`${f}: ${j.newTokens.length} td-ID token(s) the baseline never saw — ${shown}${extra}`);
    }
    if (j.grown.length > 0) {
      violations.push(`${f}: ${j.grown.map(([t, n, b]) => `${t} x${n} > baseline ${b}`).join(", ")}`);
    }
    if (j.shrunk.length > 0) {
      // n === 0 is the stale entry: the loudest shrink
      shrinks.push(`${f}: ${j.shrunk.map(([t, n, b]) => (n === 0 ? `${t} gone (baseline ${b})` : `${t} x${n} < baseline ${b}`)).join(", ")} — drop the entry`);
    }
    if (Object.keys(hits).length > 0) next[f] = hits;
  }

  if (writeBaseline) {
    writeFileSync(TD_ID_BASELINE, JSON.stringify(next, null, 2) + "\n");
    const tokens = Object.values(next).reduce((a, m) => a + Object.keys(m).length, 0);
    const cites = Object.values(next).reduce((a, m) => a + Object.values(m).reduce((x, y) => x + y, 0), 0);
    console.log(`td-id baseline written: ${Object.keys(next).length} files, ${tokens} token(s), ${cites} citations grandfathered`);
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
