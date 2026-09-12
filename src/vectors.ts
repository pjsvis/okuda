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
 * numbers not honored; their .md paths are ordinary references); fenced
 * blocks — the fence is not prose, and a badge injected inside a fence
 * never renders (the phantom-§12 defect, found in Babylon-to-Stars
 * 2026-09-12: a mermaid node label ate the floor and the mermaid pipe
 * swallowed the badge); mid-word callsign anchoring — the scan is
 * token-boundaried (`YYYY-MM-DD` is a date template, not `YYY-MM-DD`).
 */

export const VECTOR_MIN = 11;
export const VECTOR_MAX = 98;
/** The clone verb (ADR-031): not a vector — reserved in the two-digit space. */
export const CLONE_TOKEN = 99;
/** Repeated-digit actuators (ADR-032; the canon 2026-09-12: ALL doubled
 *  pairs are one actuator class — 00, 11, 22, … 99 — system verbs,
 *  never jumps; an accessibility rule, zero exceptions). The silcrow
 *  allocator and jumpToken skip these globally — a shape rule, not a
 *  range rule: doubled pair = actuator, mixed digits = address. The
 *  grammar reserves them; documents never see the gap (numbers are
 *  dynamic). */
export const RESERVED_VECTORS = new Set([11, 22, 33, 44, 55, 66, 77, 88]);
/** The two-digit space is 00-99, partitioned by actuator type (the
 *  canon): 00-10 verbs/modes; 00,11,22,…,99 the doubled-pair class
 *  (00 and 99 bound — exit, clone — the rest the pocket); mixed
 *  digits 12-98 the jump vectors — 80 addresses, silcrow 12 always
 *  first. */
/** The two-digit buffer only ever completes on two digits, so painted
 *  forms are always two characters wide. */
export const MAX_REFS = VECTOR_MAX - VECTOR_MIN + 1 - RESERVED_VECTORS.size;

/** Callsign shape: tier prefix + significant tokens, uppercase. Moved
 *  here from cli.ts — the dispatch and the discovery scan share one
 *  vocabulary (ADR-024: callsigns are data). */
export const CALLSIGN_SHAPE = /^[A-Z]{3}(-[A-Z0-9]+)+$/;

const RE_MD_LINK = /\[[^\]\n]*\]\((\S+?\.md)\)/g;
const RE_CALLSIGN = /\b[A-Z]{3}(?:-[A-Z0-9]+)+\b/g;

/** Fenced blocks as (start, end) offset ranges. The house rule: the
 *  fence is not prose — verbatim, load-bearing input. A badge injected
 *  inside a fence never renders (mermaid fences are replaced by art;
 *  code fences render literally), so a reference born inside a fence
 *  is a hole in the numbering, not a vector. Discovery stops at the
 *  fence line. An unterminated fence fences the rest of the document.
 *  Pure. */
function fenceRanges(source: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let pos = 0;
  let open: number | null = null;
  for (const line of source.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      if (open === null) open = pos;
      else {
        ranges.push([open, pos + line.length]);
        open = null;
      }
    }
    pos += line.length + 1;
  }
  if (open !== null) ranges.push([open, source.length]);
  return ranges;
}

const inFence = (pos: number, ranges: Array<[number, number]>): boolean =>
  ranges.some(([a, b]) => pos >= a && pos < b);

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
  const fences = fenceRanges(source);
  const hits: RefOccurrence[] = [];
  for (const m of source.matchAll(RE_MD_LINK)) {
    const i = m.index!;
    if (i >= bodyStart && !inFence(i, fences)) hits.push({ pos: i, end: i + m[0]!.length, target: m[1]! });
  }
  for (const m of source.matchAll(RE_CALLSIGN)) {
    const i = m.index!;
    if (i >= bodyStart && !inFence(i, fences)) hits.push({ pos: i, end: i + m[0]!.length, target: m[0]! });
  }
  hits.sort((a, b) => a.pos - b.pos);
  return hits.slice(0, MAX_REFS);
}

/** The jump map — the in-memory translation table: vector number →
 *  filename, **one destination, one silcrow**. A destination cited
 *  repeatedly carries one number, reused at every mention (the citation
 *  convention: IEEE reprints, legal §-cross-references). First
 *  occurrence assigns; numbers ascend in reading order; capped at
 *  MAX_REFS — the cap is the map's invariant. Rebuilt on every render —
 *  re-derivation replaces invalidation. */
export function buildJumpMap(refs: RefOccurrence[]): Map<number, string> {
  const map = new Map<number, string>();
  let n = VECTOR_MIN;
  const seen = new Set<string>();
  for (const ref of refs) {
    if (n > VECTOR_MAX) break; // the cap is the map's invariant, not discovery's
    if (seen.has(ref.target)) continue; // one destination, one silcrow
    seen.add(ref.target);
    // Skip the reserved repeated-digit actuators (ADR-032): the gap is
    // invisible because numbers are dynamic, never authored.
    while (RESERVED_VECTORS.has(n) && n <= VECTOR_MAX) n++;
    if (n > VECTOR_MAX) break;
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
  const targetNum = new Map<string, number>();
  for (const [num, target] of map) targetNum.set(target, num);
  const occ = scanReferences(source);
  let out = source;
  for (let i = occ.length - 1; i >= 0; i--) {
    const num = targetNum.get(occ[i]!.target);
    if (num === undefined || !map.has(num)) continue; // the paint is a projection of the map
    const o = occ[i]!;
    out = out.slice(0, o.end) + ` %okuda-vector:${num}%` + out.slice(o.end);
  }
  return out;
}
