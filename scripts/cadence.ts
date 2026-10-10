#!/usr/bin/env bun
// ── Cadence — the spine's tempo (a derived vitals reading, not a metric) ──
//  An entropy indicator, and NOT a velocity dashboard. It reads the corpus's
//  own claims — the filename dates the registries mirror and the callsign
//  citation graph — never git, because a file's date is a claim while a
//  committer timestamp is a host observation (date-lint; reg-sync).
//
//  What it shows is the coherence between intent and product over time: a
//  brief is a claim about what should exist, the Thing that cites it is what
//  exists, and the lag between them is the window in which the two can
//  disagree. Stretched, the brief outlives its context (the stale ledger);
//  compressed, arrivals outrace intake (Mercury tempo). Good is a band.
//
//  Derive, never judge. Shown, not tracked — there is no store and no trend;
//  run it, read it, and after a while it means something or it does not, both
//  of which are results. Every line names its instrument.
//
//  Usage: bun scripts/cadence.ts [--json]
import { readFileSync, existsSync } from "node:fs";
import { scannedFiles } from "./td-id-lint";
import { extractCallsigns } from "./callsign-lint";
import { REGISTRIES } from "./reg-sync";

interface Row { tier: string; file: string; date: string; status: string; callsign?: string }

const DAY = 86_400_000;
const ORDER = ["briefs", "decisions", "debriefs", "playbooks", "advisories", ".archive/briefs"];
const IN_FLIGHT = new Set(["open", "in_progress"]);
const PARKED = new Set(["parked"]);

/** Days from `a` to `b` (YYYY-MM-DD), or null when either is missing. Pure. */
export function lag(a: string, b: string): number | null {
  if (!a || !b) return null;
  const t0 = Date.parse(a), t1 = Date.parse(b);
  if (Number.isNaN(t0) || Number.isNaN(t1)) return null;
  return Math.round((t1 - t0) / DAY);
}

/** Median and p90 of a sorted-ascending copy. Pure. */
export function quantiles(xs: number[]): { n: number; min: number; median: number; max: number; p90: number } | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((x, y) => x - y);
  const at = (q: number) => s[Math.min(s.length - 1, Math.floor(q * s.length))]!;
  return { n: s.length, min: s[0]!, median: at(0.5), max: s[s.length - 1]!, p90: at(0.9) };
}

function loadRows(): Row[] {
  const rows: Row[] = [];
  for (const [tier, def] of Object.entries(REGISTRIES)) {
    const p = `${def.dir}/${def.index}`;
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      if (!line.trim()) continue;
      try {
        const e = JSON.parse(line) as { file: string; date?: string; status?: string; callsign?: string };
        rows.push({ tier, file: e.file, date: e.date ?? "", status: (e.status ?? "").toLowerCase(), callsign: e.callsign });
      } catch { /* a malformed row is reg-sync's to report */ }
    }
  }
  return rows;
}

/** The cited-brief edges: for each decision/debrief, the briefs it names (by
 *  callsign or by file). Pure over (derived text, briefs). */
export function edges(text: string, briefs: Row[]): Row[] {
  const cs = new Set(extractCallsigns(text));
  return briefs.filter((b) => (b.callsign && cs.has(b.callsign)) || text.includes(b.file));
}

function main(): void {
  const json = process.argv.includes("--json");
  const rows = loadRows();
  const briefs = rows.filter((r) => r.tier === "briefs" && r.callsign);
  const derived = rows.filter((r) => r.tier === "decisions" || r.tier === "debriefs");

  const lags: number[] = [];
  const cited = new Set<string>();
  const cov = new Map<string, { hit: number; total: number }>();
  for (const d of derived) {
    const def = REGISTRIES[d.tier];
    const path = def ? `${def.dir}/${d.file}` : null;
    const c = cov.get(d.tier) ?? { hit: 0, total: 0 };
    c.total++;
    cov.set(d.tier, c);
    if (!path || !existsSync(path)) continue;
    const refs = edges(readFileSync(path, "utf8"), briefs);
    if (refs.length > 0) c.hit++;
    for (const b of refs) {
      const l = lag(b.date, d.date);
      if (l !== null && l >= 0) { lags.push(l); cited.add(b.file); }
    }
  }

  const q = quantiles(lags);
  const flight = { open: 0, parked: 0 };
  for (const b of rows.filter((r) => r.tier === "briefs")) {
    if (IN_FLIGHT.has(b.status)) flight.open++;
    else if (PARKED.has(b.status)) flight.parked++;
  }

  if (json) {
    console.log(JSON.stringify({ tiers: rows.length, cited: cited.size, latency: q, coverage: Object.fromEntries(cov), flight }, null, 2));
    return;
  }

  console.log("cadence — the spine's tempo");
  console.log(`  instrument: ${Object.values(REGISTRIES).map((d) => `${d.dir}/${d.index}`).filter(existsSync).join(", ")}`);
  console.log(`              + the callsign citation graph over ${scannedFiles().filter((f) => f.endsWith(".md")).length} scanned documents\n`);

  console.log("  tier cadence (by claimed date)");
  for (const tier of ORDER) {
    const rs = rows.filter((r) => r.tier === tier);
    if (rs.length === 0) continue;
    const ds = rs.map((r) => r.date).filter(Boolean).sort();
    const span = ds.length ? lag(ds[0]!, ds[ds.length - 1]!) : null;
    const rate = span && span > 0 ? `  ≈ ${(rs.length / (span / 7)).toFixed(1)}/wk` : "";
    console.log(`    ${tier.padEnd(15)} ${String(rs.length).padStart(3)}   ${ds[0] ?? "—"} .. ${ds[ds.length - 1] ?? "—"}${rate}`);
  }

  console.log("\n  brief latency (brief date → the date of the Thing that cites it)");
  if (q) console.log(`    n=${q.n}   min ${q.min}d · median ${q.median}d · p90 ${q.p90}d · max ${q.max}d`);
  else console.log("    no citing edges found");

  console.log("\n  derivation coverage (a decision/debrief citing a brief)");
  for (const tier of ["decisions", "debriefs"]) {
    const c = cov.get(tier);
    if (!c) continue;
    console.log(`    ${tier.padEnd(12)} ${c.hit}/${c.total}  ${c.total ? Math.round((100 * c.hit) / c.total) : 0}%`);
  }

  console.log("\n  in flight (briefs not settled)");
  console.log(`    open ${flight.open} · parked ${flight.parked}`);

  console.log("\n  what would give this meaning: a band in the latency line, stable over");
  console.log("  weeks — or nothing. Both are results.");
}

if (import.meta.main) main();
