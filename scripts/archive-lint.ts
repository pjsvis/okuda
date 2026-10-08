#!/usr/bin/env bun
// ── Archive-scope consistency (ADR-DOCUMENT-LIFECYCLE-057) ──────────
//  One authority, three encodings: the STATUS is the claim, the MOVE is the
//  action, and the registry `archive` flag is derived. This gate checks that
//  the three agree — the map↔territory reading, not another hand-maintained
//  map. It is the first of the lifecycle's two teeth.
//
//  Checks (all zero today, so no baseline to grandfather):
//    1. config — a registry's `archive` flag matches its folder (`.archive/`);
//    2. the archive is settled — every entry in an archive tier carries that
//       tier's settled status (an archived document is done, by construction);
//    3. no orphan archive folders, and no registered archive tier missing.
//
//  And a READING, not a gate: the live entries whose status has settled are
//  the Phase 4 move queue. That is a judgement about the work, not a defect.
//
//  Usage: bun scripts/archive-lint.ts [--json]
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { REGISTRIES } from "./reg-sync";

export interface ArchiveConfig {
  dir: string;
  index: string;
  defaultStatus: string;
  archive?: boolean;
  csPrefix: string;
}

interface Entry { file: string; status: string }

/** Registry entries, or [] when the index is absent. */
function entries(dir: string, index: string): Entry[] {
  const p = join(dir, index);
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .flatMap((l) => {
      try {
        const e = JSON.parse(l) as Entry;
        return [{ file: e.file, status: e.status }];
      } catch {
        return []; // a malformed row is reg-sync's to report, not this gate's
      }
    });
}

/** Directories under `.archive/`, relative to the repo root. */
export function archiveDirs(root = "."): string[] {
  const base = join(root, ".archive");
  if (!existsSync(base)) return [];
  return readdirSync(base)
    .filter((f) => existsSync(join(base, f, "")) && !f.startsWith("."))
    .map((f) => `.archive/${f}`);
}

/** Pure: the three checks and the move queue, over an injected config so the
 *  test can drive it without the corpus. */
export function checkArchive(
  regs: Record<string, ArchiveConfig>,
  dirs: string[],
  read: (dir: string, index: string) => Entry[],
): { violations: string[]; queue: string[] } {
  const violations: string[] = [];
  const queue: string[] = [];
  const archive = Object.entries(regs).filter(([, d]) => d.archive === true);

  for (const [name, def] of Object.entries(regs)) {
    const inArchive = def.dir.startsWith(".archive/");
    if ((def.archive === true) !== inArchive) {
      violations.push(
        `registry ${name}: archive=${def.archive === true} but dir is ${def.dir} — the flag and the folder must agree`,
      );
    }
  }

  for (const [name, def] of archive) {
    for (const e of read(def.dir, def.index)) {
      if (e.status !== def.defaultStatus) {
        violations.push(
          `${def.dir}/${e.file}: status "${e.status}" in an archive tier — an archived document is "${def.defaultStatus}"`,
        );
      }
    }
  }

  for (const dir of dirs) {
    if (!archive.some(([, d]) => d.dir === dir)) {
      violations.push(`${dir}: an archive folder with no registry — nothing resolves it`);
    }
  }
  for (const [, def] of archive) {
    if (!dirs.includes(def.dir)) {
      violations.push(`${def.dir}: a registered archive tier with no folder`);
    }
  }

  // The move queue: a live entry whose status has settled to its tier's archive
  // default. Filing is not archiving, so this is a reading, never a failure.
  for (const [name, def] of archive) {
    const live = Object.entries(regs).find(([n, d]) => n !== name && d.csPrefix === def.csPrefix && !d.archive);
    if (!live) continue;
    const [liveName, liveDef] = live;
    for (const e of read(liveDef.dir, liveDef.index)) {
      if (e.status === def.defaultStatus) queue.push(`${liveName}/${e.file}`);
    }
  }

  return { violations, queue };
}

function main(): void {
  const json = process.argv.includes("--json");
  const { violations, queue } = checkArchive(REGISTRIES as Record<string, ArchiveConfig>, archiveDirs(), entries);
  if (json) {
    console.log(JSON.stringify({ violations, queue }, null, 2));
  } else {
    if (queue.length > 0) {
      console.log(`archive-lint: ${queue.length} live document(s) settled and awaiting the move (the queue, not a fault):`);
      for (const q of queue) console.log(`  ${q}`);
    }
    if (violations.length > 0) {
      console.error(`archive-lint: ${violations.length} archive-scope violation(s) —`);
      console.error("  the status is the claim, the move the action, the flag derived (ADR-DOCUMENT-LIFECYCLE-057).");
      for (const v of violations) console.error(`  ${v}`);
      process.exitCode = 1;
    } else {
      console.log("archive-lint: OK (the scope, the flag and the status agree)");
    }
  }
}

if (import.meta.main) main();
