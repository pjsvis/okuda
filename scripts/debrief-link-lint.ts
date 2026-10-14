// ── The record's linkage, enforced (ADR-RECORD-LINKAGE-065) ──────────
//  A brief is the record of intent, a debrief the record of what happened, and
//  the edge between them is the one edge that makes a landing pass mechanical:
//  given the brief, its status, its archive move and its panel row are all
//  checkable by command. That edge did not exist, and DBF-COMPRESSION paid for
//  it — one sitting of grep-and-hand-verify, in which two of six briefs that
//  looked landed were not. *Verify against the tree, not the narrative* is only
//  cheap once the tree and the narrative are joined by a resolvable edge.
//
//  So a debrief declares its briefs in frontmatter:
//
//      briefs: [BRF-TABLE-GLASS-FIT]     # the briefs this debrief measures
//      briefs: []                        # the work had no brief (infra, theme)
//
//  A callsign is the citation currency — it resolves live AND archived
//  (ADR-ARCHIVE-RESOLUTION-052), and `callsign-lint` validates the contents for
//  free because frontmatter is in its scan set. `[]` is a legitimate value and
//  a DIFFERENT one from absent: empty says *no brief*, absent says *not
//  declared*. A missing row is a finding, not a default.
//
//  Resolution gates; coverage ratchets. The 43 debriefs written before the
//  field existed are grandfathered in scripts/debrief-link-baseline.json, which
//  may only SHRINK (the house idiom: td-id, callsign, lexicon). No edge is
//  inferred — an inferred citation is an unpaid claim, and the point of the
//  edge is that a person verified it.
//
//  Usage: bun scripts/debrief-link-lint.ts [--gate] [--json] [--write-baseline]
//  Exit 1 on an unresolvable declared callsign, an undeclared unbaselined
//  debrief, or a malformed field.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveByCallsign } from "../src/root";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const BASELINE = "scripts/debrief-link-baseline.json";
export const DEBRIEFS = "debriefs";

/** The frontmatter body, or null. Mirrors reg-sync's splitter. */
export function frontmatter(content: string): string | null {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?/);
  return m ? m[1]! : null;
}

export type BriefsField =
  | { present: false }
  | { present: true; callsigns: string[] }
  | { present: true; malformed: string };

/** Read the `briefs:` key from a frontmatter body. Inline lists only
 *  (`[]` or `[A, B]`): a shape with one spelling has one lint. Pure. */
export function parseBriefs(fm: string | null): BriefsField {
  if (fm === null) return { present: false };
  const m = fm.match(/^briefs:[ \t]*(.*)$/m);
  if (!m) return { present: false };
  const raw = (m[1] ?? "").trim();
  if (raw === "[]") return { present: true, callsigns: [] };
  const list = raw.match(/^\[(.*)\]$/);
  if (!list) return { present: true, malformed: raw };
  const callsigns = (list[1] ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return { present: true, callsigns };
}

export interface Link {
  file: string;
  field: BriefsField;
  /** Declared callsigns that do not resolve through the product's resolver. */
  dead: string[];
}

/** Every debrief's linkage, with the dead references named. Pure over the
 *  file list and the resolver, so the tests can inject both. */
export function survey(
  files: string[],
  read: (f: string) => string,
  resolve: (cs: string) => string | null,
): Link[] {
  return files.map((file) => {
    const field = parseBriefs(frontmatter(read(file)));
    const dead =
      field.present && "callsigns" in field
        ? field.callsigns.filter((cs) => resolve(cs) === null)
        : [];
    return { file, field, dead };
  });
}

function baseline(): Record<string, number> {
  return existsSync(join(ROOT, BASELINE))
    ? JSON.parse(readFileSync(join(ROOT, BASELINE), "utf8"))
    : {};
}

function main(): void {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");
  const gate = argv.includes("--gate");
  const writeBaseline = argv.includes("--write-baseline");

  const files = readdirSync(join(ROOT, DEBRIEFS))
    .filter((f) => f.endsWith(".md") && f !== "index.md")
    .sort()
    .map((f) => `${DEBRIEFS}/${f}`);
  const read = (f: string) => readFileSync(join(ROOT, f), "utf8");
  const links = survey(files, read, (cs) => resolveByCallsign(cs, ROOT));
  const known = baseline();

  const faults: string[] = [];
  const shrinks: string[] = [];
  const next: Record<string, number> = {};
  let declared = 0;
  let grandfathered = 0;

  for (const { file, field, dead } of links) {
    if (field.present && "malformed" in field) {
      faults.push(`${file}: \`briefs: ${field.malformed}\` — an inline list is required: \`[]\` or \`[BRF-A, BRF-B]\``);
      continue;
    }
    if (dead.length > 0) {
      faults.push(`${file}: declared brief(s) do not resolve — ${dead.join(", ")} (a filename is not a callsign)`);
    }
    if (!field.present) {
      const b = known[file];
      if (b === undefined) {
        faults.push(`${file}: no \`briefs:\` key — declare the briefs it measures, or \`briefs: []\` for work with no brief`);
        next[file] = 1;
      } else {
        grandfathered++;
        next[file] = 1;
      }
    } else {
      declared++;
      if (known[file] !== undefined) {
        shrinks.push(`${file}: now declares — drop the baseline entry`);
      }
    }
  }

  if (writeBaseline) {
    writeFileSync(join(ROOT, BASELINE), JSON.stringify(next, null, 2) + "\n");
    console.log(`debrief-link baseline written: ${Object.keys(next).length} undeclared grandfathered, ${declared} declared`);
    return;
  }

  if (json) {
    console.log(JSON.stringify({ declared, grandfathered, total: files.length, faults, shrinks }, null, 2));
  } else {
    for (const s of shrinks) console.log(`  baseline can shrink: ${s}`);
    console.log(
      `debrief linkage: ${declared}/${files.length} declare their briefs` +
        (grandfathered > 0 ? `, ${grandfathered} baselined (payment owed: read, do not infer)` : ""),
    );
    if (faults.length > 0) {
      console.error(`debrief-link lint: ${faults.length} fault(s) —`);
      for (const f of faults) console.error(`  ${f}`);
    }
  }

  if (gate && faults.length > 0) process.exitCode = 1;
}

if (import.meta.main) main();
