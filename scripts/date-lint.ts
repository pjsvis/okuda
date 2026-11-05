#!/usr/bin/env bun
// ── The date invariant, enforced (BRF-DATE-INVARIANT) ───────────────
//  A filename's ISO prefix is the only date that survives a copy: mtime is
//  host-local and lost on transport, and frontmatter is invisible to `ls`.
//  But an unverified assertion can lie, so the name's claim gets a second
//  signature — the document's own declared date. Where the name carries a
//  date, `**Date:**` / frontmatter `date:` must agree with it.
//
//  This gate covers every scanned document, registered or not. The
//  name↔registry half belongs to reg-sync, which now treats the filename as
//  a claim (never mtime) — the two gates use one rule from two sides.
//
//  A prefixed name with NO declared date is UNCORROBORATED: the registry row
//  is its only signature, and where there is none (docs/) it stands alone.
//  Reported, not gated, until the docs/ registry exists to date it.
//
//  Baseline: scripts/date-baseline.json (empty — the corpus agrees today).
//  Ratchet, as everywhere: at-count passes, over-count fails, under-count
//  says so. Run with --write-baseline to record a new census.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { basename } from "node:path";
import { scannedFiles, verdict } from "./td-id-lint";

/** `YYYY-MM-DD-` at the head of a basename. */
export const NAME_DATE = /^(\d{4}-\d{2}-\d{2})-/;

/** The date the filename claims, or null. Pure. */
export function nameDate(path: string): string | null {
  const m = basename(path).match(NAME_DATE);
  return m ? m[1]! : null;
}

/** The date the document declares (`date:` frontmatter or `**Date:**`), or
 *  null. Pure. `**Created:**` is a creation stamp, not the document's date —
 *  they may differ and that is not a lie. */
export function declaredDate(content: string): string | null {
  const fm = content.match(/^---\n[\s\S]*?date:\s*(\d{4}-\d{2}-\d{2})/m);
  if (fm) return fm[1]!;
  const bold = content.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
  return bold ? bold[1]! : null;
}

/** Files with a registry row (the corroborating signature, where it exists). */
function registeredFiles(): Set<string> {
  const out = new Set<string>();
  for (const tier of ["briefs", "debriefs", "decisions", "playbooks", "advisories"]) {
    const p = `${tier}/INDEX.jsonl`;
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      if (!line.trim()) continue;
      try {
        const e = JSON.parse(line) as { file: string };
        out.add(`${tier}/${e.file}`);
      } catch {
        // a malformed row is reg-sync's to report, not this lint's
      }
    }
  }
  return out;
}

function readBaseline(): Record<string, number> {
  const p = "scripts/date-baseline.json";
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
}

function main() {
  const writeBaseline = process.argv.includes("--write-baseline");
  // The verdict render (ADR-GATE-TWO-RENDERS-085): a passing gate says one
  // line. The uncorroborated-name ceiling and the shrink notes are the
  // reading — `just dates` — because a note printed on every run is a note
  // nobody actions (the 32 stale entries pruned on 2026-11-05).
  const GATE = process.argv.includes("--gate");
  const baseline = readBaseline();
  const registered = registeredFiles();
  const files = scannedFiles().filter((f) => f.endsWith(".md"));
  const violations: string[] = [];
  const shrinks: string[] = [];
  const next: Record<string, number> = {};
  let uncorroborated = 0;
  const uncorroboratedSamples: string[] = [];

  for (const f of files) {
    const content = readFileSync(f, "utf8");
    const n = nameDate(f);
    const d = declaredDate(content);
    const mismatch = n !== null && d !== null && n !== d;
    const v = verdict(mismatch ? 1 : 0, baseline[f]);
    if (v === "violation") {
      violations.push(`${f}: name ${n} ≠ declared ${d} — the name's claim has no second signature`);
    } else if (v === "shrink") {
      shrinks.push(`${f}: now agrees — drop the baseline entry`);
    }
    if (mismatch) next[f] = 1;
    if (n !== null && d === null && !registered.has(f)) {
      uncorroborated++;
      if (uncorroboratedSamples.length < 5) uncorroboratedSamples.push(f);
    }
  }

  if (writeBaseline) {
    writeFileSync("scripts/date-baseline.json", JSON.stringify(next, null, 2) + "\n");
    console.log(`date baseline written: ${Object.keys(next).length} file(s) grandfathered`);
    return;
  }

  if (!GATE) for (const s of shrinks) console.log(`  baseline can shrink: ${s}`);
  if (!GATE && uncorroborated > 0) {
    const eg = uncorroboratedSamples.slice(0, 3).join(", ");
    console.log(
      `  ${uncorroborated} prefixed name(s) uncorroborated (no declared date, no registry row) — ${eg}` +
        (uncorroborated > 3 ? ", …" : ""),
    );
  }
  if (violations.length > 0) {
    console.error(`date lint: ${violations.length} file(s) carry a date the document contradicts —`);
    console.error("  the filename is the record's date (BRF-DATE-INVARIANT); make the content agree or fix the name.");
    for (const v of violations) console.error(`  ${v}`);
    process.exitCode = 1;
  } else {
    console.log("date lint: OK (name and content agree)");
  }
}

if (import.meta.main) main();
