#!/usr/bin/env bun
// ── brief-queue.ts — the decision loop's instrument ───────────────────
//  `&briefs.md` is a hand-grouped view of the briefs registry: rows are the
//  registry's, sections and notes are the editor's (ADR-DERIVED-AMP-TABLE-058).
//  That division works — until nobody reconciles it, and then the table keeps
//  saying `· open` about briefs the registry refused weeks ago. Measured
//  2026-10-26: of eight briefs the operator listed for rejection, **five were
//  already rejected and archived**, and twenty rows disagreed with the
//  registries in total. Their memory was right; the table was wrong.
//
//  So the loop: **reconcile (derived) → review (their eye) → decide (their
//  call) → apply (a status change and a move)**. This script does the first and
//  the last, and refuses to do the middle two. It writes one derived region at
//  the top of `&briefs.md`, because a queue you scroll to is a queue you stop
//  deciding from.
//
//  Four readings, and only three of them are defects:
//
//    MOVE       settled status, still in the live tier — the archive queue.
//               A defect: the status is the claim and the folder disagrees.
//    DISAGREE   a tabled row whose glyph contradicts its registry status.
//               A defect: the table asserts a state the registry denies.
//    PHANTOM    a tabled callsign resolving to neither registry.
//               A defect: the row is a claim about nothing.
//    SILENT     live, no ticket, no citation — nothing waits on it and nothing
//               records it. **Shown, never gated**: silence is a judgement, not
//               a fault, and the question per row is "what would tell us this
//               mattered?" — a citation, a ticket, or a date.
//
//  Usage:
//    bun scripts/brief-queue.ts            # the reading (exit 0)
//    bun scripts/brief-queue.ts --write    # refill the region in &briefs.md
//    bun scripts/brief-queue.ts --gate     # exit 1 on a defect (MOVE/DISAGREE/PHANTOM)

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { REGISTRIES } from "./reg-sync";
import { archiveDirs, checkArchive } from "./archive-lint";
import { extractCallsigns } from "./callsign-lint";

const ROOT = join(import.meta.dir, "..");
const DOC = "&briefs.md";
const BEGIN = "<!-- decide:begin";
const END = "<!-- decide:end -->";

interface Row { callsign: string; file: string; date: string; status: string; summary: string }

const SETTLED = new Set(["done", "landed", "rejected"]);
/** The glyph each status must carry in `&briefs.md` — `amp-briefs.ts`'s own map,
 *  by first character, so a row's state is comparable without parsing prose. */
const GLYPH: Record<string, string> = {
  open: "·",
  in_progress: "·",
  ready: "▸",
  done: "✓",
  landed: "✓",
  parked: "↓",
  rejected: "✗",
};

function registry(dir: string, index: string): Row[] {
  const p = join(ROOT, dir, index);
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .flatMap((l) => {
      try {
        const e = JSON.parse(l) as Partial<Row> & { status?: string; summary?: string };
        if (!e.callsign || !e.file) return [];
        return [{ callsign: e.callsign, file: e.file, date: e.date ?? "", status: (e.status ?? "").toLowerCase(), summary: e.summary ?? "" }];
      } catch {
        return []; // a malformed row is reg-sync's to report, not this reading's
      }
    });
}

/** The tabled rows: callsign → the whole state cell (`✓ landed 2026-09-14`,
 *  `◆ partial`). The mark alone is half a claim; the word after it is the half
 *  that says what the mark means. Pure. */
export function tabledStates(doc: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of doc.split("\n")) {
    const m = line.match(/^\| (BRF-[A-Z0-9-]+) \| ([^|]+) \|/);
    if (m) out.set(m[1]!, m[2]!.trim());
  }
  return out;
}

/** The marks, as the house map sees them: the first character of each state. */
export function tabledGlyphs(doc: string): Map<string, string> {
  return new Map([...tabledStates(doc)].map(([cs, state]) => [cs, state.charAt(0)]));
}

const textOf = (dir: string): string =>
  existsSync(join(ROOT, dir))
    ? readdirSync(join(ROOT, dir)).filter((f) => f.endsWith(".md"))
        .map((f) => readFileSync(join(ROOT, dir, f), "utf8")).join("\n")
    : "";

interface Report {
  live: Row[]; archived: number;
  move: string[];
  disagree: Array<{ callsign: string; glyph: string; status: string }>;
  /** Rows carrying a glyph the house map does not know (the editor's own mark,
   *  e.g. `◆`). Listed, never gated: the glyph cell is the editor's surface, so
   *  an unmapped mark is a dialect, not a contradiction. */
  editorial: Array<{ callsign: string; glyph: string; status: string }>;
  /** The same rows, grouped by the mark they carry, with the word that explains it. */
  marks: Array<{ mark: string; briefs: Array<{ callsign: string; status: string }> }>;
  phantom: string[];
  silent: Row[];
  ticketed: Row[];
  tabled: number;
}

export function report(): Report {
  const live = registry("briefs", "INDEX.jsonl");
  const archived = registry(".archive/briefs", "INDEX.jsonl").length;
  const queue = checkArchive(REGISTRIES, archiveDirs(join(ROOT)), (dir, index) => {
    const p = join(ROOT, dir, index);
    return existsSync(p)
      ? readFileSync(p, "utf8").split("\n").filter((l) => l.trim()).flatMap((l) => {
          try {
            const e = JSON.parse(l) as { file: string; status: string };
            return [{ file: e.file, status: e.status }];
          } catch { return []; }
        })
      : [];
  }).queue;

  const raw = existsSync(join(ROOT, DOC)) ? readFileSync(join(ROOT, DOC), "utf8") : "";
  // Strip the derived region before parsing: its own tables carry rows shaped
  // like the editor's (`| BRF-X | ◆ | open |`), so leaving it in makes the reading
  // count itself — measured 2026-10-27, 120 tabled became 38 and the count then
  // oscillated between the write and the gate in the same run.
  const glyphs = tabledGlyphs(stripRegion(raw));

  const graph = textOf("decisions") + "\n" + textOf("debriefs");
  const cited = new Set(live.filter((b) => graph.includes(b.callsign)).map((b) => b.callsign));
  const board = Bun.spawnSync(["td", "list", "--all", "--limit", "0"], { stdout: "pipe" }).stdout.toString();
  const ticketed = new Set(live.filter((b) => board.includes(b.callsign)).map((b) => b.callsign));

  const disagree: Report["disagree"] = [];
  const editorial: Report["editorial"] = [];
  const states = tabledStates(stripRegion(raw));
  const phantom: string[] = [];
  const known_glyphs = new Set(Object.values(GLYPH));
  const known = new Set([...live.map((b) => b.callsign), ...registry(".archive/briefs", "INDEX.jsonl").map((b) => b.callsign)]);
  for (const [cs, glyph] of glyphs) {
    if (!known.has(cs)) { phantom.push(cs); continue; }
    const b = live.find((x) => x.callsign === cs);
    if (!b) continue; // archived: the row is history and its glyph is the editor's
    const want = GLYPH[b.status];
    if (!known_glyphs.has(glyph)) editorial.push({ callsign: cs, glyph, status: b.status });
    else if (want && glyph !== want) disagree.push({ callsign: cs, glyph, status: b.status });
  }

  const silent = live.filter((b) => b.status === "open" || b.status === "ready")
    .filter((b) => !ticketed.has(b.callsign) && !cited.has(b.callsign));
  const ticketedRows = live.filter((b) => ticketed.has(b.callsign) && (b.status === "open" || b.status === "ready"));

  const marks = [...new Set(editorial.map((e) => states.get(e.callsign) ?? e.glyph))].map((mark) => ({
    mark,
    briefs: editorial.filter((e) => (states.get(e.callsign) ?? e.glyph) === mark).map((e) => ({ callsign: e.callsign, status: e.status })),
  }));

  return {
    live, archived, move: queue, disagree, editorial, marks, phantom, silent,
    ticketed: ticketedRows, tabled: glyphs.size,
  };
}

/** A markdown table cell: a pipe inside prose would end the row, and the corpus
 *  is full of them (shell grammar, table syntax, this very script). Pure. */
const cell = (s: string): string => s.replace(/\|/g, "\\|");

const age = (date: string): string => {
  if (!date) return "—";
  const d = Math.round((Date.parse("2026-10-26") - Date.parse(date)) / 86_400_000);
  return `${d}d`;
};

/** The derived region. Markdown, because the reader's eye takes tables. Pure. */
export function renderRegion(r: Report): string {
  const out: string[] = [];
  const converged = r.move.length === 0 && r.disagree.length === 0 && r.phantom.length === 0;
  out.push(
    `**${r.live.length} live · ${r.archived} archived · ${r.tabled} tabled** — ` +
      `${r.move.length} to move · ${r.disagree.length} disagreeing · ${r.phantom.length} phantom · ` +
      `${r.editorial.length} editorial · ${r.silent.length} silent · ${r.ticketed.length} ticketed. ` +
      (converged ? `*Converged: nothing to reconcile, only decisions left.*` : `**Not converged — the three defects below want a fix before the judgements.**`),
  );
  out.push(`\n*Derived by \`scripts/brief-queue.ts --write\`; do not hand-edit. Regenerate: \`just decide\`.*`);

  if (r.move.length) {
    out.push(`\n### Settled, still in the live tier — move, then archive\n`);
    out.push(`| file | |`);
    out.push(`|---|---|`);
    for (const f of r.move) out.push(`| \`${f}\` | status is settled; \`git mv\` to \`.archive/briefs/\` |`);
  }
  if (r.disagree.length) {
    out.push(`\n### The table disagrees with the registry\n`);
    out.push(`| brief | table says | registry says |`);
    out.push(`|---|---|---|`);
    for (const d of r.disagree) out.push(`| ${d.callsign} | \`${d.glyph}\` | ${d.status} |`);
  }
  if (r.marks.length || r.editorial.length) {
    out.push(`\n### Editorial glyphs — the editor's own marks, not comparable to a status\n`);
    out.push(`Listed, never gated: the glyph cell is the editor's surface. If a mark here is meant to *mean* a status, map it in \`amp-briefs.ts\` so the reconciliation can read it.\n`);
    // Grouped by mark: five rows reading `◆` is a column repeating a constant,
    // which is a caption wearing a column's clothes. One row per mark says the
    // same thing once, and answers the question the table provokes — *what does
    // this mark mean?* — with the word the editor wrote beside it.
    for (const m of r.marks) {
      const briefs = m.briefs.map((b) => `${b.callsign} (${b.status})`).join(" · ");
      out.push(`- **\`${m.mark}\`** — ${m.briefs.length} brief${m.briefs.length === 1 ? "" : "s"}: ${briefs}`);
    }
  }
  if (r.phantom.length) {
    out.push(`\n### Phantom rows — tabled, resolving to nothing\n`);
    out.push(r.phantom.map((p) => `- ${p}`).join("\n"));
  }

  out.push(`\n### Silent — no ticket, no citation, live\n`);
  out.push(`Nothing waits on these and no Thing records them. The question per row is **what would tell us this mattered?** — a citation, a ticket, or a date. Silence is a judgement, so nothing here is gated.\n`);
  if (r.silent.length === 0) out.push(`_none_`);
  else {
    out.push(`| brief | age | asks |`);
    out.push(`|---|---|---|`);
    for (const b of r.silent) out.push(`| ${b.callsign} | ${age(b.date)} | ${cell(b.summary.slice(0, 58))} |`);
  }

  out.push(`\n### Ticketed, live — the load-bearing set\n`);
  if (r.ticketed.length === 0) out.push(`_none_`);
  else {
    out.push(`A row here is the only kind with an owner already: something outside\nthis table is waiting on it.\n`);
    out.push(`| brief | age | asks |`);
    out.push(`|---|---|---|`);
    for (const b of r.ticketed) out.push(`| ${b.callsign} | ${age(b.date)} | ${cell(b.summary.slice(0, 58))} |`);
  }
  out.push("");
  return out.join("\n");
}

function writeRegion(region: string): void {
  const p = join(ROOT, DOC);
  const doc = readFileSync(p, "utf8");
  const block = `${BEGIN} (derived — do not hand-edit) -->\n\n${region}\n\n${END}`;
  if (doc.includes(BEGIN)) {
    const i = doc.indexOf(BEGIN);
    const j = doc.indexOf(END);
    if (j < 0) throw new Error(`${DOC}: ${BEGIN} without ${END}`);
    writeFileSync(p, doc.slice(0, i) + block + doc.slice(j + END.length));
    return;
  }
  // Place it directly under the H1 — above the preamble, not below it. Measured
  // 2026-10-27 in a 44-column pane: the preamble alone filled the first screen, so
  // "decisions first" was true of the file and false of the view. The queue is the
  // document's job; the prose about the document can follow it.
  const h1 = doc.match(/^# .*$/m);
  if (!h1 || h1.index === undefined) {
    writeFileSync(p, `${block}\n\n${doc}`);
    return;
  }
  const end = h1.index + h1[0].length;
  writeFileSync(p, `${doc.slice(0, end)}\n\n${block}\n${doc.slice(end).replace(/^\n+/, "\n")}`);
}

/** The document with its derived region removed. Pure. */
export function stripRegion(doc: string): string {
  const i = doc.indexOf(BEGIN);
  const j = doc.indexOf(END);
  if (i < 0 || j < 0) return doc;
  return doc.slice(0, i) + doc.slice(j + END.length);
}

/** The region currently in the document, or null when there is none. Pure. */
export function regionIn(doc: string): string | null {
  const i = doc.indexOf(BEGIN);
  const j = doc.indexOf(END);
  if (i < 0 || j < 0) return null;
  return doc.slice(i + BEGIN.length, j);
}

function main(): void {
  const r = report();
  const gate = process.argv.includes("--gate");
  if (gate && existsSync(join(ROOT, DOC))) {
    const current = regionIn(readFileSync(join(ROOT, DOC), "utf8"));
    const fresh = ` (derived — do not hand-edit) -->\n\n${renderRegion(r)}\n\n`;
    if (current !== null && current !== fresh) {
      console.error("decide: the region is stale — the corpus moved and the table did not. Run `just decide`.");
      process.exit(1);
    }
  }
  if (process.argv.includes("--write")) {
    writeRegion(renderRegion(r));
    console.log(`brief-queue: region written to ${DOC} — ${r.live.length} live · ${r.move.length} to move · ${r.disagree.length} disagreeing · ${r.phantom.length} phantom · ${r.silent.length} silent`);
  } else if (gate) {
    // A gate is a verdict, not a reading: the region stands above it in the
    // document, and forty lines of table in a gate run is noise in a gate run.
    console.log(
      `decide: converged — ${r.live.length} live · ${r.move.length} to move · ${r.disagree.length} disagreeing · ` +
        `${r.phantom.length} phantom · ${r.silent.length} silent (judgement, ungated) · ${r.ticketed.length} ticketed`,
    );
  } else {
    console.log(renderRegion(r));
  }
  const defects = [
    ["MOVE", r.move.length],
    ["DISAGREE", r.disagree.length],
    ["PHANTOM", r.phantom.length],
  ].filter(([, n]) => (n as number) > 0) as Array<[string, number]>;
  if (defects.length && process.argv.includes("--gate")) {
    console.error("\ndecide: not converged — " + defects.map(([k, n]) => `${n} ${k}`).join(", "));
    process.exit(1);
  }
}

if (import.meta.main) main();
