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
//  Derive, never judge. Shown, not tracked — no store, no trend. `--write`
//  refills the derived region of `&cadence.md` (the editorial frame stays
//  hand-written); the default prints the same reading plain. Every line
//  names its instrument.
//
//  Usage: bun scripts/cadence.ts [--json] [--write]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { scannedFiles } from "./td-id-lint";
import { extractCallsigns } from "./callsign-lint";
import { REGISTRIES } from "./reg-sync";

interface Row { tier: string; file: string; date: string; status: string; callsign?: string }
interface Report {
  instrument: string[]; scanned: number;
  tiers: Array<{ tier: string; n: number; first: string; last: string; rate: number | null }>;
  latency: { n: number; min: number; median: number; p90: number; max: number } | null;
  coverage: Array<{ tier: string; hit: number; total: number }>;
  flight: { open: number; parked: number };
}

const DAY = 86_400_000;
const ORDER = ["briefs", "decisions", "debriefs", "playbooks", "advisories", ".archive/briefs"];
const IN_FLIGHT = new Set(["open", "in_progress"]);
const DOC = "&cadence.md";
const BEGIN = "<!-- cadence:begin";
const END = "<!-- cadence:end -->";

/** Days from `a` to `b` (YYYY-MM-DD), or null when either is missing. Pure. */
export function lag(a: string, b: string): number | null {
  if (!a || !b) return null;
  const t0 = Date.parse(a), t1 = Date.parse(b);
  if (Number.isNaN(t0) || Number.isNaN(t1)) return null;
  return Math.round((t1 - t0) / DAY);
}

/** The cited-brief edges: the briefs a derived text names (by callsign or file). Pure. */
export function edges(text: string, briefs: Row[]): Row[] {
  const cs = new Set(extractCallsigns(text));
  return briefs.filter((b) => (b.callsign && cs.has(b.callsign)) || text.includes(b.file));
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

function report(): Report {
  const rows = loadRows();
  // Live AND archived briefs: the claim being measured is "is this decision
  // anchored to an intent?", and the intent's archive status is irrelevant. Live
  // only made a healthy archive sweep read as lost coverage — measured 2026-10-26,
  // 33/70 -> 29/70 for archiving seven settled briefs. The reading names its scope
  // in `renderMarkdown` so the two definitions cannot be confused again.
  const briefs = rows.filter((r) => (r.tier === "briefs" || r.tier === ".archive/briefs") && r.callsign);
  const derived = rows.filter((r) => r.tier === "decisions" || r.tier === "debriefs");

  const lags: number[] = [];
  const cov = new Map<string, { hit: number; total: number }>();
  for (const d of derived) {
    const def = REGISTRIES[d.tier];
    const path = def ? `${def.dir}/${d.file}` : null;
    const c = cov.get(d.tier) ?? { hit: 0, total: 0 };
    c.total++; cov.set(d.tier, c);
    if (!path || !existsSync(path)) continue;
    const refs = edges(readFileSync(path, "utf8"), briefs);
    if (refs.length > 0) c.hit++;
    for (const b of refs) { const l = lag(b.date, d.date); if (l !== null && l >= 0) lags.push(l); }
  }
  const s = [...lags].sort((a, b) => a - b);
  const at = (q: number) => s[Math.min(s.length - 1, Math.floor(q * s.length))]!;
  const latency = s.length ? { n: s.length, min: s[0]!, median: at(0.5), p90: at(0.9), max: s[s.length - 1]! } : null;

  const flight = { open: 0, parked: 0 };
  for (const b of rows.filter((r) => r.tier === "briefs")) {
    if (IN_FLIGHT.has(b.status)) flight.open++;
    else if (b.status === "parked") flight.parked++;
  }

  const tiers = ORDER.flatMap((tier) => {
    const rs = rows.filter((r) => r.tier === tier);
    if (rs.length === 0) return [];
    const ds = rs.map((r) => r.date).filter(Boolean).sort();
    const span = ds.length ? lag(ds[0]!, ds[ds.length - 1]!) : null;
    return [{ tier, n: rs.length, first: ds[0] ?? "—", last: ds[ds.length - 1] ?? "—", rate: span && span > 0 ? rs.length / (span / 7) : null }];
  });

  const instrument = Object.values(REGISTRIES).map((d) => `${d.dir}/${d.index}`).filter(existsSync);
  return { instrument, scanned: scannedFiles().filter((f) => f.endsWith(".md")).length, tiers, latency,
    coverage: ["decisions", "debriefs"].flatMap((t) => (cov.has(t) ? [{ tier: t, ...cov.get(t)! }] : [])), flight };
}

/** The derived region — markdown, tables the reader's eye can take. Pure. */
export function renderMarkdown(r: Report): string {
  const out: string[] = [];
  out.push(`*Derived by \`scripts/cadence.ts --write\`; do not hand-edit. Regenerate: \`just cadence\`.*\n`);
  out.push(`**Instrument:** ${r.instrument.map((i) => `\`${i}\``).join(", ")} — plus the callsign citation graph over ${r.scanned} scanned documents.\n`);
  out.push(`### Tier cadence (by claimed date)\n`);
  out.push(`| Tier | Docs | Span | Rate |`);
  out.push(`|---|---|---|---|`);
  for (const t of r.tiers) out.push(`| ${t.tier} | ${t.n} | ${t.first} .. ${t.last} | ${t.rate ? `≈ ${t.rate.toFixed(1)}/wk` : "—"} |`);
  out.push(`\n### Brief latency (brief date → the date of the Thing that cites it)\n`);
  out.push(r.latency
    ? `n=${r.latency.n} · min ${r.latency.min}d · median ${r.latency.median}d · p90 ${r.latency.p90}d · max ${r.latency.max}d\n`
    : `no citing edges found\n`);
  out.push(`### Derivation coverage (a decision/debrief citing a brief)\n`);
  out.push(`| Tier | Citing | Coverage |`);
  out.push(`|---|---|---|`);
  for (const c of r.coverage) out.push(`| ${c.tier} | ${c.hit}/${c.total} | ${c.total ? Math.round((100 * c.hit) / c.total) : 0}% |`);
  out.push(`\n### In flight (briefs not settled)\n`);
  out.push(`open ${r.flight.open} · parked ${r.flight.parked}\n`);
  out.push(`**What would give this meaning:** a band in the latency line, stable over weeks — or nothing. Both are results.`);
  return out.join("\n");
}

function writeDoc(r: Report): void {
  const region = `${BEGIN} (derived — do not hand-edit) -->\n\n${renderMarkdown(r)}\n\n${END}`;
  const existing = existsSync(DOC) ? readFileSync(DOC, "utf8") : null;
  if (existing === null) { writeFileSync(DOC, `# &cadence — the spine's tempo\n\n${region}\n`); }
  else if (existing.includes(BEGIN) && existing.includes(END)) {
    const next = existing.replace(new RegExp(`${BEGIN}[\\s\\S]*?${END}`), region);
    writeFileSync(DOC, next);
  } else { console.error(`cadence: ${DOC} has no ${BEGIN} … ${END} region — refused`); process.exitCode = 1; }
}

function main(): void {
  const r = report();
  if (process.argv.includes("--json")) console.log(JSON.stringify(r, null, 2));
  else if (process.argv.includes("--write")) { writeDoc(r); console.log(`cadence: ${DOC} regenerated`); }
  else {
    console.log("cadence — the spine's tempo (read it as a document: just cadence)");
    console.log(`  instrument: ${r.instrument.join(", ")} + the graph over ${r.scanned} documents`);
    for (const t of r.tiers) console.log(`    ${t.tier.padEnd(15)} ${String(t.n).padStart(3)}   ${t.first} .. ${t.last}${t.rate ? `  ≈ ${t.rate.toFixed(1)}/wk` : ""}`);
    if (r.latency) console.log(`  latency  n=${r.latency.n}  min ${r.latency.min}d · median ${r.latency.median}d · p90 ${r.latency.p90}d · max ${r.latency.max}d`);
    for (const c of r.coverage) console.log(`  coverage ${c.tier}: ${c.hit}/${c.total}`);
    console.log(`  in flight: open ${r.flight.open} · parked ${r.flight.parked}`);
  }
}

if (import.meta.main) main();
