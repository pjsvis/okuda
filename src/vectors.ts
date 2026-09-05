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
/** The two-digit space is 00-99; reserved: 00-09 (unreachable padding),
 *  10 (numeric sanity), 99 (the clone verb). Vectors: 11-98 — 88
 *  addresses, and silcrow 11 is always the first. */
/** The two-digit buffer only ever completes on two digits, so painted
 *  forms are always two characters wide. */
export const MAX_REFS = VECTOR_MAX - VECTOR_MIN + 1;

/** Callsign shape: tier prefix + significant tokens, uppercase. Moved
 *  here from cli.ts — the dispatch and the discovery scan share one
 *  vocabulary (ADR-024: callsigns are data). */
export const CALLSIGN_SHAPE = /^[A-Z]{3}(-[A-Z0-9]+)+$/;

const RE_MD_LINK = /\[[^\]\n]*\]\((\S+?\.md)\)/g;
const RE_CALLSIGN = /[A-Z]{3}(?:-[A-Z0-9]+)+/g;

/** Reference occurrences: every reference-shaped span in the document,
 *  in reading order, **with repeats** — the vector↔filename relationship
 *  is one-to-many (two mentions of the same ADR are two vectors, both
 *  translating to the same filename; each mention is its own actuation
 *  point). Capped at MAX_REFS. Optimistic: nothing validated. The
 *  frontmatter is not scanned (a document's own callsign is identity,
 *  not a reference). Legacy `okuda-rhs` numbers are not honored. Pure. */
export interface RefOccurrence {
  pos: number;
  end: number;
  target: string;
}

export function scanReferences(source: string): RefOccurrence[] {
  const fm = source.match(/^---\n[\s\S]*?\n---/);
  const bodyStart = fm ? fm[0]!.length : 0;
  const hits: RefOccurrence[] = [];
  for (const m of source.matchAll(RE_MD_LINK)) {
    if (m.index! >= bodyStart) hits.push({ pos: m.index!, end: m.index! + m[0]!.length, target: m[1]! });
  }
  for (const m of source.matchAll(RE_CALLSIGN)) {
    if (m.index! >= bodyStart) hits.push({ pos: m.index!, end: m.index! + m[0]!.length, target: m[0]! });
  }
  hits.sort((a, b) => a.pos - b.pos);
  return hits.slice(0, MAX_REFS);
}

/** The jump map — the in-memory translation table: vector number →
 *  filename. One-to-many by design: repeated references to the same
 *  document each hold their own vector pointing at the same filename.
 *  Rebuilt on every render — re-derivation replaces invalidation. */
export function buildJumpMap(refs: RefOccurrence[]): Map<number, string> {
  const map = new Map<number, string>();
  let n = VECTOR_MIN;
  for (const ref of refs) {
    if (n > VECTOR_MAX) break; // the cap is the map's invariant, not discovery's
    map.set(n++, ref.target);
  }
  return map;
}

/** Convenience: derive the map straight from a main document's source. */
export function jumpMapFor(source: string): Map<number, string> {
  return buildJumpMap(scanReferences(source));
}

/** Inject one paint marker after each reference occurrence — the i-th
 *  occurrence carries vector `VECTOR_MIN + i`, per the map. The marker
 *  (`%okuda-vector:NN%`) is consumed by the renderer's inline paint;
 *  the painted `§NN` is illustrative text, and the returned string is
 *  used for rendering only, never persisted. Replaces from the end so
 *  positions stay valid. Pure. */
export function annotateSource(source: string, map: Map<number, string>): string {
  const occ = scanReferences(source);
  let out = source;
  for (let i = occ.length - 1; i >= 0; i--) {
    const num = VECTOR_MIN + i;
    if (!map.has(num)) continue; // the paint is a projection of the map
    const o = occ[i]!;
    out = out.slice(0, o.end) + ` %okuda-vector:${num}%` + out.slice(o.end);
  }
  return out;
}
