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
 *  root `index.md` supersedes them once the migration (td-bdfce0) lands.
 *  Exported: the launcher's registry channel (BRF-CONTENT-SHORTLIST)
 *  walks the same tiers — one list, two consumers, no drift. */
export const TIER_REGISTRIES: Array<[dir: string, file: string]> = [
  ["briefs", "INDEX.jsonl"],
  ["decisions", "INDEX.jsonl"],
  ["debriefs", "INDEX.jsonl"],
  ["playbooks", "REGISTRY.jsonl"],
  // advisories joined 2026-09-24 (BRF-VALIDATED-SILCROWS P-0): the tier
  // was added to reg-sync's config (69122be) but never here — 51 corpus
  // references to ADV-* callsigns painted silcrows that could not jump.
  // One list, two consumers (the resolver + the launcher channel), and
  // the drift test in reg-callsign.test.ts keeps the claim honest now.
  ["advisories", "INDEX.jsonl"],
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

// ── Callsigns (td-bdfce0: resolution, not derivation) ─────────────────

/** One registry record: a durable callsign and the path it resolves to. */
export interface CallsignRecord {
  callsign: string;
  path: string;
}

/** Parse the tier registries at cwd into callsign records. The registry
 *  is the fast index; frontmatter is the truth it mirrors — so resolution
 *  survives renames (keyed on the record, never the filename stem).
 *  Malformed lines are skipped, not fatal. Pure-ish (reads fs). */
export function loadCallsigns(cwd: string = process.cwd()): CallsignRecord[] {
  const out: CallsignRecord[] = [];
  for (const [dir, index] of TIER_REGISTRIES) {
    let raw: string;
    try {
      raw = readFileSync(join(cwd, dir, index), "utf8");
    } catch {
      continue; // absent tier — not an error
    }
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const e = JSON.parse(line) as { file?: string; callsign?: string };
        if (e.file && e.callsign) out.push({ callsign: e.callsign, path: join(cwd, dir, e.file) });
      } catch {
        /* malformed — skip */
      }
    }
  }
  return out;
}

/** The two trailing path segments — the identity a footer shows and a
 *  registry records (tier/file), however the caller got the path. Pure. */
function tierFileKey(p: string): string {
  const parts = p.split("/").filter(Boolean);
  return parts.length <= 1 ? p : parts.slice(-2).join("/");
}

/** Resolve a callsign to its path. Returns null when unknown — the caller
 *  decides what an unknown code means. Pure-ish (reads fs). */
export function resolveByCallsign(callsign: string, cwd: string = process.cwd()): string | null {
  const callsigns = loadCallsigns(cwd);
  // Exactly-one resolution (ADR-025 clause 4): a callsign resolves to one
  // path or none — never the silent first-wins of .find(). A collision
  // (two records sharing a callsign) is ambiguous → null; the reg-sync
  // lint is the loud gate, the resolver is honest. The ordinal shorthand
  // below already follows the same exactly-one-or-null rule.
  const exact = callsigns.filter((r) => r.callsign === callsign);
  if (exact.length === 1) return exact[0]!.path;
  if (exact.length > 1) return null; // collision — ambiguous, not first-wins
  // Ordinal shorthand (ADR-031 dogfood, 2026-09-04): prose says "ADR-030"
  // — tier + ordinal — the way humans abbreviate. Resolve within the
  // tier when EXACTLY ONE registered callsign carries the prefix and
  // ordinal; ambiguous or absent → null (the actuator flashes honestly).
  const m = callsign.match(/^([A-Z]{2,})-(\d{2,3})$/);
  if (!m) return null;
  const tierMatches = callsigns.filter(
    (r) => r.callsign.startsWith(`${m[1]}-`) && r.callsign.endsWith(`-${m[2]}`),
  );
  return tierMatches.length === 1 ? tierMatches[0]!.path : null;
}

/** Resolve a document's callsign from its path. Pure-ish (reads fs). */
export function callsignForFile(file: string, cwd: string = process.cwd()): string | null {
  const key = tierFileKey(file);
  return loadCallsigns(cwd).find((r) => tierFileKey(r.path) === key)?.callsign ?? null;
}

/** A per-file callsign resolver with the registry index loaded once —
 *  the shape a long-lived surface (the TUI footer, per paint) wants.
 *  Unknown files resolve to null; the caller renders an absent slot.
 *  Pure-ish (reads fs once at construction). */
export function makeCallsignResolver(cwd: string = process.cwd()): (file: string) => string | null {
  const index = new Map(loadCallsigns(cwd).map((r) => [tierFileKey(r.path), r.callsign] as const));
  return (file: string) => index.get(tierFileKey(file)) ?? null;
}
