/**
 * vectors.ts — the main document's jump map (ADR-031).
 *
 * The main document renders with its references annotated as optimistic
 * vectors: `[11]` … `[98]`, painted after each reference in the reserved
 * vector paint. The map is an in-memory structure belonging to the main
 * document — vector number → target string — derived by scanning the
 * source at render time. The paint is illustrative; the source is never
 * mutated; nothing persists. Optimism is the contract: discovery never
 * validates, the actuator fails honestly ("[14] — no document to
 * render") when a destination isn't there.
 *
 * Discovery (reading order, unique targets, capped):
 *   - callsign-shaped tokens (`CALLSIGN_SHAPE` — ADR-024's vocabulary)
 *   - markdown inline links to local `.md` paths
 * Never vectors: zero-padded or single-digit bracketed numbers (`[07]`
 * is text, always); `okuda-rhs` tokens (ADR-022 legacy — retired, their
 * numbers not honored; their .md paths are ordinary references).
 */

export const VECTOR_MIN = 11;
export const VECTOR_MAX = 98;
/** The clone verb (ADR-031): not a vector — reserved in the two-digit space. */
export const CLONE_TOKEN = 99;
/** The two-digit buffer only ever completes on two digits, so painted
 *  forms are always two characters wide. */
export const MAX_REFS = VECTOR_MAX - VECTOR_MIN + 1;

/** Callsign shape: tier prefix + significant tokens, uppercase. Moved
 *  here from cli.ts — the dispatch and the discovery scan share one
 *  vocabulary (ADR-024: callsigns are data). */
export const CALLSIGN_SHAPE = /^[A-Z]{3}(-[A-Z0-9]+)+$/;

const RE_MD_LINK = /\[[^\]\n]*\]\((\S+?\.md)\)/g;
const RE_CALLSIGN = /[A-Z]{3}(?:-[A-Z0-9]+)+/g;

/** Discover the reference targets of a main document, in reading order,
 *  unique by target, capped at MAX_REFS. Optimistic: nothing is
 *  validated here — a target is whatever looks like a reference.
 *  Legacy `okuda-rhs` token numbers are not honored (their surrounding
 *  paths and callsigns are ordinary references like any other). Pure. */
export function discoverReferences(source: string): string[] {
  const hits: Array<{ pos: number; target: string }> = [];
  for (const m of source.matchAll(RE_MD_LINK)) {
    hits.push({ pos: m.index!, target: m[1]! });
  }
  for (const m of source.matchAll(RE_CALLSIGN)) {
    hits.push({ pos: m.index!, target: m[0]! });
  }
  hits.sort((a, b) => a.pos - b.pos);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const h of hits) {
    if (seen.has(h.target)) continue;
    seen.add(h.target);
    out.push(h.target);
    if (out.length >= MAX_REFS) break;
  }
  return out;
}

/** The jump map: vector number (11+) → target, in discovery order.
 *  Capped defensively at MAX_REFS — the map enforces the invariant even
 *  if a caller bypasses discovery. Pure; rebuilt on every render —
 *  re-derivation replaces invalidation. */
export function buildJumpMap(refs: string[]): Map<number, string> {
  const map = new Map<number, string>();
  refs.slice(0, MAX_REFS).forEach((target, i) => map.set(VECTOR_MIN + i, target));
  return map;
}

/** Convenience: derive the map straight from a main document's source. */
export function jumpMapFor(source: string): Map<number, string> {
  return buildJumpMap(discoverReferences(source));
}

/** Inject one paint marker after each reference occurrence. The marker
 *  (`%okuda-vector:NN%`) is consumed by the renderer's inline paint —
 *  the painted `[NN]` is illustrative text, and the source string this
 *  function returns is used for rendering only, never persisted. Pure. */
export function annotateSource(source: string, map: Map<number, string>): string {
  const byTarget = new Map<string, number>();
  for (const [num, target] of map) byTarget.set(target, num);
  let out = source;
  for (const [target, num] of byTarget) {
    const badge = ` %okuda-vector:${num}%`;
    // Escape regex syntax in the target — paths and callsigns are
    // literal strings, not patterns.
    const esc = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Links: badge after the closing paren. Callsigns: badge after the
    // token. Each occurrence carries the same number (the map dedupes).
    const reLink = new RegExp(`(\\[[^\\]\\n]*\\]\\(${esc}\\))`, "g");
    const reToken = new RegExp(`(?<![A-Z0-9-])${esc}(?![A-Z0-9-])`, "g");
    if (reLink.test(out)) out = out.replace(reLink, `$1${badge}`);
    else out = out.replace(reToken, `$&${badge}`);
  }
  return out;
}
