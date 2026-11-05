#!/usr/bin/env bun
/**
 * amp-check.ts — AMPER drift report: the &-family documents vs. reality.
 *
 * The & docs (&alpha, &briefs, &next, &stack) are editorial state documents, not
 * generated ones — the grouping and the verdicts are the value, so this
 * script never writes them. It reads only, and reports:
 *   1. Jump-wire targets — every %%okuda-rhs:NN%% line's .md paths must exist.
 *   2. Duplicate jump numbers within a file (session codes collide silently).
 *   3. Staleness — days since each & doc was last committed.
 *
 * &briefs membership is owned by `amp-briefs.ts` (ADR-DERIVED-AMP-TABLE-058):
 * the row set is reconciled from the registry, so it is not mirrored here.
 *
 * Exit 1 on hard drift (missing target, duplicate wire); advisory drift
 * (staleness) prints but exits 0 — the eyeball decides, the machine counts.
 *
 * Usage: bun scripts/amp-check.ts   (wrapped by `just amp`)
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
/** The verdict render (ADR-GATE-TWO-RENDERS-085): the per-document wire
 *  counts and the staleness calendar are the reading — `just amp` shows them. */
const GATE = process.argv.includes("--gate");
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
  if (!GATE) console.log(`  ${doc} — ${wires} wire(s), ${seen.size} distinct jump number(s)`);
}

// ── Staleness: advisory only. The judgment pass is human; the calendar
// is not.
for (const doc of AMPERS) {
  const mtime = statSync(join(ROOT, doc)).mtime;
  const days = Math.floor((Date.now() - mtime.getTime()) / 86_400_000);
  if (!GATE && days >= 3) console.log(`  ~ ${doc} — last touched ${days}d ago (drift likely)`);
}

if (hardDrift > 0) {
  console.error(`\namp-check: FAIL — ${hardDrift} hard drift item(s)`);
  process.exit(1);
}
console.log(`${GATE ? "" : "\n"}amp-check: OK — AMPER documents ride the current state`);
