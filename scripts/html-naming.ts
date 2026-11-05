/**
 * html-naming.ts — where an artefact lands, and what it is called.
 *
 * One function, two consumers: the builder and the batch gate. The gate's
 * whole job is to predict the name the builder will choose, so a second copy
 * of this logic would make the gate lie — and a gate that lies is worse than
 * none, because it is a green light nobody checks.
 *
 * The rules, in order:
 *
 *   1. The date is the DOCUMENT'S OWN. A document of record is static:
 *      re-publishing it means the same document under the same name, and a
 *      different name means a different document. Front matter first, then
 *      the source's first commit (a record's date is the date it was made,
 *      not the date it was copied), then the mtime.
 *   2. A name that already carries an ISO date keeps it — the corpus is
 *      date-first, and prefixing again would say the date twice.
 *   3. A bare `index` is qualified with its tier. `index.md` exists in every
 *      tier, so date + stem gave decisions/index.md and debriefs/index.md the
 *      same artefact name and one silently overwrote the other (measured
 *      2026-11-05: 664 KiB replaced by 515 KiB, with no message).
 */

import { statSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

export interface Meta {
  [key: string]: string;
}

/** Front matter: use it, do not render it. */
export function splitFrontMatter(source: string): { meta: Meta; body: string } {
  const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: source };
  const meta: Meta = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) meta[kv[1]!] = kv[2]!.trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body: source.slice(m[0].length) };
}

/** The source's first commit — the date the document was made. */
export function firstCommitDate(file: string): string | null {
  try {
    const p = Bun.spawnSync({
      cmd: ["git", "log", "--diff-filter=A", "--format=%ad", "--date=short", "--", file],
      stdout: "pipe",
      stderr: "pipe",
    });
    if (p.exitCode !== 0) return null;
    const lines = new TextDecoder().decode(p.stdout).trim().split("\n").filter(Boolean);
    return lines.at(-1) ?? null; // the oldest, i.e. the first commit
  } catch {
    return null;
  }
}

/** The last resort, honest about being one. */
export function mtimeDate(file: string): string {
  try {
    return statSync(file).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/** The artefact's stem, without the `.html`. */
export function artefactStem(input: string, meta: Meta): string {
  const stem = basename(input, ".md");
  const qualified =
    stem === "index" ? `${basename(dirname(resolve(input)))}-index` : stem;
  if (/^\d{4}-\d{2}-\d{2}-/.test(qualified)) return qualified;
  const date = meta.date ?? firstCommitDate(input) ?? mtimeDate(input);
  return `${date}-${qualified}`;
}

/** The artefact's filename, and where `just html` puts it by default. */
export function artefactName(input: string, meta: Meta): string {
  return `${artefactStem(input, meta)}.html`;
}
