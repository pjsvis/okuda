#!/usr/bin/env bun
/**
 * html-batch.ts — the collision gate, and the batch build.
 *
 * Why a batch: a collision is a property of the SET. Two documents with the
 * same artefact name is invisible to either document on its own — the builder
 * sees one source and one target, and writes. Measured 2026-11-05, before
 * this gate: decisions/index.md and debriefs/index.md both became
 * 2026-08-29-index.html, and the larger artefact (664 KiB, 80 panels) was
 * replaced by the smaller (515 KiB, 64) with no message at all.
 *
 * The gate predicts the name with `artefactName` — the same function the
 * builder uses, so it cannot drift from it. A second copy of the naming rule
 * would make this gate lie, and a gate that lies is worse than none.
 *
 * Usage:
 *   bun scripts/html-batch.ts            check for collisions, exit 1 on any
 *   bun scripts/html-batch.ts --build    check, then build everything
 *   bun scripts/html-batch.ts --tier docs --tier decisions
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { artefactName, splitFrontMatter } from "./html-naming.ts";
import { siloRoot } from "../src/root.ts";

const args = process.argv.slice(2);
const build = args.includes("--build");
const tierArgs = args
  .map((a, i) => (a === "--tier" ? args[i + 1] : undefined))
  .filter((t): t is string => Boolean(t));

const TIERS = ["docs", "decisions", "briefs", "debriefs", "playbooks", "advisories"];
const tiers = tierArgs.length > 0 ? tierArgs : TIERS;

const root = siloRoot(process.cwd());

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const st = statSync(path);
    if (st.isDirectory()) out.push(...walk(path));
    else if (entry.endsWith(".md")) out.push(path);
  }
  return out;
}

// ── The set ───────────────────────────────────────────────────────────

interface Doc {
  source: string; // relative to the silo root
  artefact: string;
}

const docs: Doc[] = [];
for (const tier of tiers) {
  const dir = join(root, tier);
  if (!existsSync(dir)) continue;
  for (const abs of walk(dir)) {
    const { meta } = splitFrontMatter(readFileSync(abs, "utf8"));
    docs.push({
      source: relative(root, abs),
      artefact: artefactName(abs, meta),
    });
  }
}

// ── The collisions ────────────────────────────────────────────────────

const byArtefact = new Map<string, Doc[]>();
for (const d of docs) {
  const list = byArtefact.get(d.artefact) ?? [];
  list.push(d);
  byArtefact.set(d.artefact, list);
}

const collisions = [...byArtefact.entries()].filter(([, list]) => list.length > 1);

console.log(
  `html-batch — ${docs.length} document(s) across ${tiers.length} tier(s), ${byArtefact.size} artefact name(s)`,
);

if (collisions.length > 0) {
  console.error(
    `\n✗ ${collisions.length} artefact name(s) claimed by more than one document:`,
  );
  for (const [name, list] of collisions) {
    console.error(`\n  ${name}`);
    for (const d of list) console.error(`    ← ${d.source}`);
  }
  console.error(
    `\nTwo documents, one artefact name: the last build wins and the others vanish.`,
  );
  console.error(`Rename one, or pass -o to the builder.`);
  process.exit(1);
}

console.log(`✓ no collisions — every document has its own artefact name`);

if (!build) process.exit(0);

// ── The build ─────────────────────────────────────────────────────────

let failed = 0;
for (const d of docs) {
  const p = Bun.spawnSync(
    ["bun", "scripts/html-package.ts", d.source],
    { cwd: root, stdout: "pipe", stderr: "pipe" },
  );
  if (p.exitCode !== 0) {
    failed++;
    console.error(`✗ ${d.source}\n${p.stderr.toString().trim()}`);
  }
}

console.log(
  failed === 0
    ? `✓ built ${docs.length} artefact(s) into html/`
    : `✗ ${failed} of ${docs.length} failed`,
);
process.exit(failed === 0 ? 0 : 1);
