// ── Retired terms, refused (ADR-RETIRE-OKW-018, ADR-RETIRE-OKUDAGRAM-066) ──
//  A retired term does not stop being used because a decision says so. It stops
//  when the living surface stops carrying it — and a surface is only as good as
//  the gate that reads it, which is why ADR-RETIRE-OKUDAGRAM-066 names this file
//  rather than answering `nothing — advice`.
//
//  The rule is a boundary, not a ban: a retirement retires a *name*, it does not
//  rewrite the past. So the term is allowed where it is read as history or as
//  data, and refused everywhere it is read forward.
//
//    allowed  date-prefixed documents  (the date is a record's address, and the
//                                       rule ADR-RETIRE-OKW-018 already set is
//                                       that history keeps its words)
//    allowed  `decisions/`             (the palimpsest tier: annotated in place,
//                                       never rewritten — and a retirement must
//                                       be able to name what it retires)
//    allowed  `.archive/`              (the permanent record)
//    allowed  generated indexes        (derived echoes of the above)
//    allowed  ALLOW                    (small, printed, self-documenting)
//    allowed  a CALLSIGN               (data: `BRF-PAGED-OKUDAGRAM` is cited
//                                       throughout, and renaming it would break
//                                       the checksum that keeps citations honest)
//    refused  everything else          — `src/`, `tests/`, `scripts/`,
//                                       `playbooks/`, `explainers/`, undated
//                                       `docs/`, the root files, the `&` panels
//
//  Usage: bun scripts/retired-terms-lint.ts [--gate] [--json]
//  Exit 1 on any occurrence in a living path.

import { readFileSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** A retired term, and the decision that retired it. */
export const RETIRED = [
  { term: "okudagram", re: /\bokudagrams?\b/gi, by: "ADR-RETIRE-OKUDAGRAM-066" },
  { term: "okudaframe", re: /\bokudaframes?\b/gi, by: "ADR-RETIRE-OKUDAGRAM-066" },
  { term: "OKW", re: /\bOKW\b/g, by: "ADR-RETIRE-OKW-018" },
] as const;

/** The citation families, stripped before matching: a callsign is data and is
 *  never renamed, so `BRF-PAGED-OKUDAGRAM` is not an occurrence of the term.
 *  Kept in step with `scripts/callsign-lint.ts`'s CALLSIGN_TOKEN. */
export const CALLSIGN = /\b(BRF|ADR|ADV|DBF|PLY|OKF|CSN)(-[A-Z0-9]+)+\b/g;

/** Documents that must name a retired term, and are therefore not violations.
 *  Small on purpose: each entry is a document whose *subject* is the word. */
export const ALLOW = new Set([
  "docs/ideas.md", // the ledger entry that raised the retirement
  "scripts/retired-terms-lint.ts", // this gate
  "tests/retired-terms-lint.test.ts", // its fixtures
]);

const GENERATED = new Set(["index.md", "INDEX.jsonl", "REGISTRY.jsonl"]);

/** Is this path read as history, as a record, or as data — rather than forward? */
export function allowed(path: string): boolean {
  const p = path.replace(/^\.\//, "");
  if (ALLOW.has(p)) return true;
  if (p.startsWith(".archive/") || p.startsWith("decisions/")) return true;
  const b = basename(p);
  if (GENERATED.has(b)) return true;
  return /^\d{4}-\d{2}-\d{2}-/.test(b);
}

export interface Hit {
  file: string;
  term: string;
  by: string;
  count: number;
}

/** A token carrying a file extension is an address — `docs/2026-08-27-okudagram-
 *  scratchpad.md`, `okudagram-probe.ts` — not a use of the term. Deliberately
 *  requires the extension: `frame/okudagram mode` contains a slash but is prose,
 *  and the blunt slash test would have let it through. */
export const ADDRESS = /[\w./-]*\.\w{1,5}/;

/** Strip what is an address rather than a use: a callsign (data, never
 *  renamed) and a path token (a reference to a record whose name is allowed to
 *  carry the term). What is left is prose, and prose is where the term has to
 *  be gone. */
export function stripRefs(text: string): string {
  return text
    .replace(CALLSIGN, " ")
    .split(/(\s+)/)
    .map((tok) => (ADDRESS.test(tok) ? " " : tok))
    .join("");
}

/** Every occurrence of a retired term in a living path. Pure over the file list
 *  and the reader, so the tests can inject both. */
export function violations(files: string[], read: (f: string) => string): Hit[] {
  const out: Hit[] = [];
  for (const file of files) {
    if (allowed(file)) continue;
    const hits = new Map<string, { by: string; count: number }>();
    // The path itself carries the term as surely as its prose does.
    for (const { term, by } of RETIRED) {
      if (basename(file).toLowerCase().includes(term.toLowerCase())) {
        hits.set(term, { by, count: (hits.get(term)?.count ?? 0) + 1 });
      }
    }
    const text = stripRefs(read(file));
    for (const { term, re, by } of RETIRED) {
      const n = [...text.matchAll(new RegExp(re.source, re.flags))].length;
      if (n > 0) hits.set(term, { by, count: (hits.get(term)?.count ?? 0) + n });
    }
    for (const [term, { by, count }] of hits) out.push({ file, term, by, count });
  }
  return out;
}

/** The tracked tree, including untracked-but-not-ignored files: the set that
 *  will be committed is the set a gate should read. */
function tree(): string[] {
  const out = Bun.spawnSync(["git", "ls-files", "--cached", "--others", "--exclude-standard"], {
    cwd: ROOT,
  });
  return new TextDecoder()
    .decode(out.stdout)
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function main(): void {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");
  const gate = argv.includes("--gate");

  const files = tree();
  const hits = violations(files, (f) => {
    try {
      return readFileSync(join(ROOT, f), "utf8");
    } catch {
      return ""; // a binary or unreadable file carries no prose
    }
  });

  if (json) {
    console.log(JSON.stringify({ scanned: files.length, allow: [...ALLOW], hits }, null, 2));
    if (gate && hits.length > 0) process.exitCode = 1;
    return;
  }

  console.log(`retired terms: ${RETIRED.length} term(s) over ${files.length} tracked file(s)`);
  if (hits.length > 0) {
    console.error(
      `retired-terms lint: ${hits.length} living path(s) carry a retired term — history keeps its words, the living surface does not;`,
    );
    console.error("  the replacement is in the retiring ADR (the render · the frame · a diagram · the knowledge system).");
    for (const h of hits) console.error(`  ${h.file}: "${h.term}" ×${h.count} (retired by ${h.by})`);
    if (gate) process.exitCode = 1;
  } else {
    console.log(`retired-terms lint: OK (no retired term in a living path; allow: ${[...ALLOW].join(", ")})`);
  }
}

if (import.meta.main) main();
