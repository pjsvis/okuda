/**
 * root.ts — rooted/unrooted detection for the gloam launcher.
 *
 * Gloam is **rooted** when launched on a self-describing knowledge tree
 * (an OKF bundle per ADR-019): a root `index.md` declaring `okf_version`,
 * or — before the OKF migration (td-bdfce0) lands — the tier registries
 * that already index this silo. Rooted gloam carries a **silo badge** the
 * renderer paints at the head of the footer identity run (brief:
 * 2026-08-28-silo-mnemonics). Unrooted (a single doc or pipe, from
 * anywhere) → today's behaviour, no badge.
 *
 * The renderer learns nothing about trees or registries; this module
 * resolves the badge string and hands it over. Pure-ish (reads fs).
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

/** Tier directories and their registry filenames. The pre-OKF fallback
 *  signature: a silo that indexes itself already has these; the OKF
 *  root `index.md` supersedes them once the migration (td-bdfce0) lands. */
const TIER_REGISTRIES: Array<[dir: string, file: string]> = [
  ["briefs", "INDEX.jsonl"],
  ["decisions", "INDEX.jsonl"],
  ["debriefs", "INDEX.jsonl"],
  ["playbooks", "REGISTRY.jsonl"],
];

/** Rooted detection result. `badge` is the silo name the renderer paints
 *  (muted, provenance register). */
export interface RootInfo {
  badge: string;
  /** Why we believe the cwd is a root — drives no behaviour, but keeps
   *  the dogfood log honest about which signature fired. */
  via: "okf" | "registry";
}

/** Extract a frontmatter value from a markdown document via a one-line
 *  regex. No YAML dependency (parity with reg-sync's derive* helpers).
 *  Returns the trimmed value or null if the key is absent / frontmatter
 *  is missing. */
function frontmatterValue(content: string, key: string): string | null {
  const fm = content.match(/^---\n([\s\S]*?)\n---/m);
  if (!fm) return null;
  const m = fm[1]!.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return m ? m[1]!.trim().replace(/^["']|["']$/g, "") : null;
}

/** Read `<cwd>/index.md` if present; return its text or null. */
function readRootIndex(cwd: string): string | null {
  const p = join(cwd, "index.md");
  try {
    if (!existsSync(p)) return null;
    if (!statSync(p).isFile()) return null;
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

/** Does a tier registry file exist at cwd? (the pre-OKF signature.) */
function hasTierRegistry(cwd: string): boolean {
  return TIER_REGISTRIES.some(([dir, file]) => {
    try {
      return statSync(join(cwd, dir, file)).isFile();
    } catch {
      return false;
    }
  });
}

/**
 * Detect whether `cwd` is a rooted knowledge silo and resolve its badge.
 * Order of precedence (the strongest signature wins):
 *   1. OKF root `index.md` with `okf_version` (ADR-019). Badge = the
 *      bundle-declared `name` (fallback `title`), stable across directory
 *      renames; absent both → `basename(cwd)`.
 *   2. Tier registry presence (the pre-OKF fallback). Badge = `basename(cwd)`.
 * Returns `null` when no signature is present — unrooted, today's
 * behaviour, no badge.
 */
export function detectRoot(cwd: string = process.cwd()): RootInfo | null {
  const rootIndex = readRootIndex(cwd);
  if (rootIndex !== null) {
    const okf = frontmatterValue(rootIndex, "okf_version");
    if (okf) {
      const name = frontmatterValue(rootIndex, "name") ?? frontmatterValue(rootIndex, "title");
      return { badge: name ?? basename(cwd), via: "okf" };
    }
  }
  if (hasTierRegistry(cwd)) {
    return { badge: basename(cwd), via: "registry" };
  }
  return null;
}

/** Read the tier registry paths present at cwd (exported for the
 *  contract test to pin the signature this silo actually has). */
export function presentRegistries(cwd: string = process.cwd()): string[] {
  const out: string[] = [];
  for (const [dir, file] of TIER_REGISTRIES) {
    try {
      if (statSync(join(cwd, dir, file)).isFile()) out.push(join(dir, file));
    } catch {
      /* absent tier — not a signature */
    }
  }
  return out;
}
