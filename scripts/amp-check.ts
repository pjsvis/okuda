#!/usr/bin/env bun
/**
 * amp-check.ts — AMPER drift report: the &-family documents vs. reality.
 *
 * The & docs (&alpha, &briefs, &next, &stack) are editorial state documents, not
 * generated ones — the grouping and the verdicts are the value, so this
 * script never writes them. It reads only, and reports:
 *   1. Jump-wire targets — every %%okuda-rhs:NN%% line's .md paths must exist.
 *   2. Duplicate jump numbers within a file (session codes collide silently).
 *   3. Registry coverage — briefs/INDEX.jsonl callsigns missing from &briefs,
 *      and &briefs callsigns absent from the registry.
 *   4. Staleness — days since each & doc was last committed.
 *
 * Exit 1 on hard drift (missing target, unknown callsign); advisory drift
 * (staleness) prints but exits 0 — the eyeball decides, the machine counts.
 *
 * Usage: bun scripts/amp-check.ts   (wrapped by `just amp`)
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AMPERS = ["&alpha.md", "&briefs.md", "&next.md", "&stack.md"];

let hardDrift = 0;

for (const doc of AMPERS) {
  const path = join(ROOT, doc);
  if (!existsSync(path)) {
    console.error(`✗ ${doc} — missing`);
    hardDrift++;
    continue;
  }
  const lines = readFileSync(path, "utf8").split("\n");
  const seen = new Map<string, string>(); // jump number → first line no
  let wires = 0;

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes("%%okuda-rhs:")) continue;
    wires++;
    for (const m of lines[i].matchAll(/%%okuda-rhs:(\d+)%%/g)) {
      const prev = seen.get(m[1]);
      if (prev !== undefined) {
        console.error(`✗ ${doc}:${i + 1} — jump ${m[1]} already wired at line ${prev}`);
        hardDrift++;
      } else {
        seen.set(m[1], String(i + 1));
      }
    }
    // Every .md path mentioned on a wired line must exist (targets and
    // debrief links ride the same line by convention).
    for (const p of lines[i].match(/[\w./-]+\.md/g) ?? []) {
      if (!existsSync(join(ROOT, p))) {
        console.error(`✗ ${doc}:${i + 1} — wire target missing: ${p}`);
        hardDrift++;
      }
    }
  }
  console.log(`  ${doc} — ${wires} wire(s), ${seen.size} distinct jump number(s)`);
}

// ── Registry coverage: every brief callsign in the INDEX must sit in
// &briefs, and vice versa (the state table claims "all N").
const ampBriefs = join(ROOT, "&briefs.md");
const ampText = readFileSync(ampBriefs, "utf8");
const ampCallsigns = new Set(ampText.match(/BRF-[A-Z0-9-]+/g) ?? []);
const registry = readFileSync(join(ROOT, "briefs/INDEX.jsonl"), "utf8")
  .trim()
  .split("\n")
  .map((l) => JSON.parse(l));
const regCallsigns = new Set(registry.map((e: any) => e.callsign as string));

for (const c of regCallsigns) {
  if (!ampCallsigns.has(c)) {
    console.error(`✗ &briefs — registry brief absent from the state table: ${c}`);
    hardDrift++;
  }
}
for (const c of ampCallsigns) {
  if (!regCallsigns.has(c)) {
    console.error(`✗ &briefs — tabled brief not in registry: ${c}`);
    hardDrift++;
  }
}
console.log(`  registry — ${regCallsigns.size} briefs; &briefs carries ${ampCallsigns.size}`);

// ── Staleness: advisory only. The judgment pass is human; the calendar
// is not.
for (const doc of AMPERS) {
  const mtime = statSync(join(ROOT, doc)).mtime;
  const days = Math.floor((Date.now() - mtime.getTime()) / 86_400_000);
  if (days >= 3) console.log(`  ~ ${doc} — last touched ${days}d ago (drift likely)`);
}

if (hardDrift > 0) {
  console.error(`\namp-check: FAIL — ${hardDrift} hard drift item(s)`);
  process.exit(1);
}
console.log("\namp-check: OK — AMPER documents ride the current state");
