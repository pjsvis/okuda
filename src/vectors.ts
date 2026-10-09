/**
 * vectors.ts — the main document's jump map (ADR-031).
 *
 * The main document renders with its references annotated as vectors:
 * `[12]` … `[98]`, painted after each reference in the reserved
 * vector paint. The map is an in-memory structure belonging to the main
 * document — vector number → target string — derived by scanning the
 * source at render time. The paint is illustrative; the source is never
 * mutated; nothing persists. Callsign optimism is retired (ADR-044 —
 * 117 corpus silcrows pointed at nothing): the inferred reference now
 * gates on the registry, and the paint and the actuator share one
 * resolution semantics, so they cannot disagree. Explicit .md links
 * stay optimistic; the actuator still fails honestly ("[14] — no
 * document to render") when a destination isn't there.
 *
 * Discovery (reading order, unique targets, capped):
 *   - callsign-shaped tokens (`CALLSIGN_SHAPE` — ADR-024's vocabulary) —
 *     gated by the `resolves` predicate (ADR-044: the tier registries,
 *     built launcher/TUI-side — ADR-020's boundary holds by parameter;
 *     no predicate = the pre-ADR-044 optimism, for the pure scan)
 *   - markdown inline links to local `.md` paths — never gated: the
 *     author's link is a deliberate claim, the shape scan's match is not
 *   - code-file mentions — `dir/name.ext`, non-md (BRF-SILCROW-PATHS
 *     Ring A) — gated like callsigns; for paths the gate's substrate is
 *     the filesystem (ADR-045): a phantom, a typo, or a URL never paints.
 *     A `:NNN` line suffix (`src/tui.ts:756`) is swallowed into the
 *     occurrence span — the badge paints after the whole mention — and
 *     stripped from the target: the silcrow is file-level, the line is
 *     BRF-SRC-LINE-LEDGER's verb, unclaimed here
 *   - named md paths — `dir/name.md` (BRF-SILCROW-PATHS Ring B) — gated
 *     like Ring A, same substrate, same suffix rule; a target inside
 *     explicit link syntax is excluded (the link already minted its
 *     occurrence — one claim, one badge)
 * Never vectors: zero-padded or single-digit bracketed numbers (`[07]`
 * is text, always); exiled extensions — ADR-049's legibility criterion:
 * `.jsonl` is horizontal data, and a deref into it is a wall of wrapped
 * JSON, a promise kept to the letter and broken in spirit — existence
 * asks "is there a document?", legibility asks "is it worth the
 * reader's keystroke?"; `okuda-rhs` tokens (ADR-022 legacy — retired, their
 * numbers not honored; their .md paths are ordinary references); fenced
 * blocks — the fence is not prose, and a badge injected inside a fence
 * never renders (the phantom-§12 defect, found in Babylon-to-Stars
 * 2026-09-12: a mermaid node label ate the floor and the mermaid pipe
 * swallowed the badge); mid-word callsign anchoring — the scan is
 * token-boundaried (`YYYY-MM-DD` is a date template, not `YYY-MM-DD`).
 */

export const VECTOR_MIN = 12;
export const VECTOR_MAX = 98;
/** The clone verb (ADR-031): not a vector — reserved in the two-digit space. */
export const CLONE_TOKEN = 99;
/** Repeated-digit actuators (ADR-032; the canon 2026-09-12: ALL doubled
 *  pairs are one actuator class — 00, 11, 22, … 99 — system verbs,
 *  never jumps; an accessibility rule, zero exceptions). This Set is the
 *  class *inside the vector range* — the unbound pocket {22,…,88}.
 *  The bound members live elsewhere: 00 and 99 in KEYBINDINGS
 *  (`src/keygrammar.ts`); 11 sits below the floor and resolves to null
 *  by range, not membership. The allocator and verbFor share this one
 *  Set — a shape rule, not a range rule: doubled pair = actuator,
 *  mixed digits = address. The grammar reserves them; documents
 *  never see the gap (numbers are dynamic). */
export const RESERVED_VECTORS = new Set([22, 33, 44, 55, 66, 77, 88]);
/** The two-digit space is 00-99, partitioned by actuator type (the
 *  canon): 00-10 verbs/modes; 00,11,22,…,99 the doubled-pair class
 *  (00 and 99 bound — exit, clone — the rest the pocket); mixed
 *  digits 12-98 the jump vectors — 80 addresses, silcrow 12 always
 *  first. */
export const MAX_REFS = VECTOR_MAX - VECTOR_MIN + 1 - RESERVED_VECTORS.size;

/** Callsign shape: tier prefix + significant tokens, uppercase. Moved
 *  here from cli.ts — the dispatch and the discovery scan share one
 *  vocabulary (ADR-024: callsigns are data). */
export const CALLSIGN_SHAPE = /^[A-Z]{3}(-[A-Z0-9]+)+$/;

const RE_MD_LINK = /\[[^\]\n]*\]\((\S+?\.md)\)/g;
const RE_CALLSIGN = /\b[A-Z]{3}(?:-[A-Z0-9]+)+\b/g;
/** Code-file mentions (BRF-SILCROW-PATHS Ring A): at least one `/`, a
 *  non-md extension, optional `:NNN` line suffix (W2: swallowed into the
 *  span, stripped from the target). The slash is near-proof of intent —
 *  `UTF-8` and `OSC-8` carry none. `.md` is excluded here: named md
 *  paths are Ring B's own regex (RE_MD_PATH), same step's commit. */
const RE_CODE_PATH = /\b[\w@&.-]+(?:\/[\w@&.-]+)+\.(?!md\b)[A-Za-z0-9]{1,5}(?::\d{1,4})?\b/g;
/** Named md paths (BRF-SILCROW-PATHS Ring B): `dir/name.md`, optional
 *  `:NNN` — same shape as Ring A with the md exclusion lifted. The
 *  corpus's own convention: 1,192 free-standing mentions, 1 inside link
 *  syntax (the P-1 probe). Gated on the same `resolves` predicate as
 *  every inferred reference; explicit links mint their own occurrence,
 *  so a hit inside a link span is skipped (one claim, one badge). */
const RE_MD_PATH = /\b[\w@&.-]+(?:\/[\w@&.-]+)+\.md(?::\d{1,4})?\b/g;
/** The legibility denylist (ADR-049): extensions whose deref is a
 *  render the silcrow cannot keep honest. `.jsonl` is horizontal data —
 *  one record per line, multi-kilobyte — and `wrapWholeFile` wraps it
 *  into a wall of JSON: all the bytes, none of the reading. Exiled at
 *  discovery, so body, actuator, and the References section (ADR-047's
 *  pure projection) retract in one move — no second filter anywhere.
 *  `.json` stays: pretty-printed JSON is indented text; exile on
 *  evidence, not suspicion. One line per future exile. */
const EXILED_EXTS = new Set(["jsonl"]);

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

export function scanReferences(
  source: string,
  resolves?: (target: string) => boolean,
): RefOccurrence[] {
  const fm = source.match(/^---\n[\s\S]*?\n---/);
  const bodyStart = fm ? fm[0]!.length : 0;
  // A document's own callsign mints nothing (td-e6e692): the frontmatter
  // names the document, and a body/H1 mention of it is a self-citation
  // — the vector would jump to the page already on the glass, and the
  // References section would list the doc beneath itself. The exclusion
  // reads the same frontmatter the body scan already skips. The PATH
  // sibling (a doc citing its own filename, the showcase §12 nit) rides
  // the caller's resolves predicate instead — the file is caller-truth,
  // not source-truth, so the scan stays pure (makeSelfExclusion).
  const self = fm?.[0]!.match(/^\s*callsign:\s*(\S+)\s*$/m)?.[1];
  const fences = fenceRanges(source);
  const hits: RefOccurrence[] = [];
  for (const m of source.matchAll(RE_MD_LINK)) {
    const i = m.index!;
    if (i >= bodyStart && !inFence(i, fences)) hits.push({ pos: i, end: i + m[0]!.length, target: m[1]! });
  }
  // The ADR-044 gate applies to the inferred reference only — the bare
  // callsign-shaped token. A bare UTF-8 in prose made no claim; the
  // registry check is the retraction.
  for (const m of source.matchAll(RE_CALLSIGN)) {
    const i = m.index!;
    if (i >= bodyStart && !inFence(i, fences) && m[0] !== self && (!resolves || resolves(m[0]!))) {
      hits.push({ pos: i, end: i + m[0]!.length, target: m[0]! });
    }
  }
  // Ring A (BRF-SILCROW-PATHS): the code-file mention, gated on the
  // filesystem (ADR-045's second substrate) and exiled by extension
  // (ADR-049's legibility criterion — the exile applies ungated: an
  // exiled target can never enter the map, so it can never paint).
  // The gate sees the stripped path — the suffix is presentation, not
  // target. One destination, one silcrow: `src/tui.ts:756` and
  // `src/tui.ts` share the vector.
  for (const m of source.matchAll(RE_CODE_PATH)) {
    const i = m.index!;
    const target = m[0]!.replace(/:\d{1,4}$/, "");
    const ext = /\.([A-Za-z0-9]{1,5})$/.exec(target)?.[1]?.toLowerCase();
    if (ext && EXILED_EXTS.has(ext)) continue; // ADR-049: never a vector
    if (i >= bodyStart && !inFence(i, fences) && (!resolves || resolves(target))) {
      hits.push({ pos: i, end: i + m[0]!.length, target });
    }
  }
  // Ring B (BRF-SILCROW-PATHS step 3): the named md path — the corpus's
  // own citation convention, bare in prose. Same gate, same substrate,
  // same suffix rule. A hit inside explicit link syntax is skipped: the
  // link's own occurrence already minted the destination, and a second
  // would double-badge one claim. (Any link span, validated or not —
  // the link is a deliberate claim whose target Ring B has no business
  // re-judging.)
  const linkSpans: Array<[number, number]> = [];
  for (const m of source.matchAll(RE_MD_LINK)) linkSpans.push([m.index!, m.index! + m[0]!.length]);
  const inLink = (pos: number) => linkSpans.some(([a, b]) => pos >= a && pos < b);
  for (const m of source.matchAll(RE_MD_PATH)) {
    const i = m.index!;
    const target = m[0]!.replace(/:\d{1,4}$/, "");
    if (i >= bodyStart && !inFence(i, fences) && !inLink(i) && (!resolves || resolves(target))) {
      hits.push({ pos: i, end: i + m[0]!.length, target });
    }
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

/** Convenience: derive the map straight from a main document's source.
 *  The optional `resolves` is the ADR-044 gate — see scanReferences. */
export function jumpMapFor(
  source: string,
  resolves?: (target: string) => boolean,
): Map<number, string> {
  return buildJumpMap(scanReferences(source, resolves));
}

/** Inject one paint marker after each reference occurrence — each
 *  occurrence carries the vector its target holds in the map. The marker
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

/** The generated References section (ADR-047, BRF-REFERENCES-SECTION):
 *  the main document's jump map projected as the render's foot — one
 *  line per destination, in map order (reading order, ascending), each
 *  line the silcrow and its target: `%okuda-vector:12% ADR-034`. The
 *  silcrow rides the same marker the body paint rides, so the renderer
 *  paints it on glass and keeps it plain piped/NO_COLOR — identical on
 *  every rung. Targets are plain text on purpose: a bare `.md` path is a
 *  mention, never a link, so the section cannot re-mint the map that
 *  lists it. Empty map, empty string — no section, no empty header.
 *  Pure: map in, section source out. */
export function referencesSection(map: Map<number, string>): string {
  if (map.size === 0) return "";
  // `[...map]` iterates insertion order — the map's minting order,
  // reading order ascending. The section reorders nothing.
  const entries = [...map].map(([num, target]) => `%okuda-vector:${num}% ${target}`);
  // Each entry is its own loose line: one paragraph per destination, so
  // the renderer keeps one § per line (consecutive bare lines would join
  // into one paragraph and lose the scannable ascent).
  return ["## References", "", entries.join("\n\n")].join("\n");
}

/** The start offset of a source's final section: the last heading outside
 *  a fence, or 0 when the source has none. Used by `referencesCovered`.
 *  Pure. */
function finalSectionStart(source: string): number {
  const fences = fenceRanges(source);
  let start = 0;
  for (const m of source.matchAll(/^#{1,6}[ \t].*$/gm)) {
    const i = m.index!;
    if (!inFence(i, fences)) start = i;
  }
  return start;
}

/** Does the document already carry its own address table? True when every
 *  destination in the map occurs inside a **list item** in the final
 *  section — the shape a hand-written `## Related` takes, and the shape the
 *  renderer's own decoration of one takes (the paths are scanned, the
 *  silcrows appended). Then the generated receipt would only repeat it.
 *
 *  The condition is **coverage, never "a list exists"** (BRF-REFERENCES-
 *  SECTION, the second): ADR-047 exists because a hand list *omits* —
 *  measured, nine destinations in the map against six in the polished
 *  section. A **partial** list therefore keeps its receipt, and the omission
 *  stays visible: the legend appearing is the signal that the hand list was
 *  incomplete. Suppressing on presence alone would re-instate the omission
 *  the generated section was written to catch.
 *
 *  Cost, named: the receipt's presence becomes a function of the author's
 *  prose shape as well as the map. The trade is recorded in ADR-047's
 *  annotation. Pure. */
export function referencesCovered(source: string, map: Map<number, string>): boolean {
  if (map.size === 0) return false;
  const start = finalSectionStart(source);
  const covered = new Set<string>();
  for (const o of scanReferences(source)) {
    if (o.pos < start) continue;
    const lineStart = source.lastIndexOf("\n", o.pos) + 1;
    const lineEnd = source.indexOf("\n", o.pos);
    const line = source.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    if (/^\s*(?:[-*+]|\d+\.)[ \t]/.test(line)) covered.add(o.target);
  }
  for (const target of map.values()) if (!covered.has(target)) return false;
  return true;
}

/** The section's junction (ADR-047, amended 2026-10-09): append the
 *  generated section to a render INPUT — never the source. The join
 *  normalises trailing whitespace to exactly one blank line so the header
 *  lands as a header whatever the document ends with. Call sites sit
 *  downstream of `annotateSource` (the section's own callsigns are never
 *  re-scanned, never double-marked — the loop's only guard, held by
 *  construction). Empty map: the source passes through untouched.
 *
 *  **Suppressed when the document is self-tabling AND annotated** — see
 *  `referencesCovered`. The layout must not prompt a question it cannot
 *  answer: Related-then-References both listing the same paths invites
 *  "why this duplication?", and nothing on the page answers it. A partial
 *  list keeps the receipt, and the reader who asks "why is this here?"
 *  finds the answer by comparison — *Related was incomplete* — which
 *  reassures rather than leaves doubt. Pure. */
export function appendReferences(
  source: string,
  map: Map<number, string>,
  annotated = false,
): string {
  const section = referencesSection(map);
  if (!section) return source;
  // Suppress only where the addresses are already ON the page: `annotated`
  // is the caller's statement that the silcrows are present (cli gates it on
  // `process.stdout.isTTY`; the TUI always annotates). On the plain/piped
  // rung the receipt IS the address table — ADR-047, "painted silcrows on
  // the glass, plain numbers elsewhere" — so it is never suppressed there.
  if (annotated && referencesCovered(source, map)) return source;
  return source.replace(/\s*$/, "\n\n") + section + "\n";
}
