/**
 * vectors.ts — the main document's jump map (ADR-031).
 *
 * The main document renders with its references annotated as vectors:
 * `§12` … `§98`, painted after each reference in the reserved
 * vector paint. The map is an in-memory structure belonging to the main
 * document — vector number → target string — derived by scanning the
 * source at render time. The paint is illustrative; the source is never
 * mutated; nothing persists. Callsign optimism is retired (ADR-044 —
 * 117 corpus silcrows pointed at nothing): the inferred reference now
 * gates on the registry, and the paint and the actuator share one
 * resolution semantics, so they cannot disagree. Explicit .md links
 * stay optimistic; the actuator still fails honestly ("§14 — no
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

/**
 * The two-digit space (00–99), partitioned by actuator type rather than by
 * range — two shape rules cover all of it (ADR-031, ADR-032):
 *
 *   [01–10]                          modes and single-key verbs — what the
 *                                    instance DOES
 *   [00,11,22,33,44,55,66,77,88,99]  the doubled pairs — one actuator class,
 *                                    bound or reserved; never a jump
 *   everything else                  the silcrow vectors — what the instance
 *                                    SHOWS
 *
 * A doubled pair is always an actuator and a mixed-digit pair is always an
 * address, in every document, forever (ADR-032: global, never per-document).
 * The class wraps: 00 (exit) sits beside 99 (clone), its two bound ends and
 * adjacent keys on the number row — which is why the doubled pairs are a Set,
 * never a range.
 */

/** Vectors run 12–98: the mixed-digit pairs, used as addresses. Silcrow 12 is
 *  always first (the reading-order floor). */
export const VECTOR_MIN = 12;
export const VECTOR_MAX = 98;

/** The doubled pairs, all ten (ADR-032) — the one home of the class. 00 exit
 *  and 99 clone are bound; 11 and {22,…,77} are the reserved pocket; 88 is
 *  bound to edit. */
export const DOUBLED_PAIRS = new Set([0, 11, 22, 33, 44, 55, 66, 77, 88, 99]);

/** The clone verb (ADR-031): the 99 end of the class, never an address. */
export const CLONE_TOKEN = 99;

/** The doubled pairs inside the vector range — the seven the allocator skips
 *  and `verbFor` resolves to null. Derived from the class, never retyped, so a
 *  new doubled pair cannot silently widen the address space. (00, 11 and 99
 *  lie outside the range — below the floor, or the clone end — so a walk from
 *  VECTOR_MIN meets only these.) */
export const RESERVED_VECTORS = new Set(
  [...DOUBLED_PAIRS].filter((n) => n >= VECTOR_MIN && n <= VECTOR_MAX),
);

/** **The address count, and not an occurrence count** (BRF-ADDRESS-CAP). The
 *  two-digit space minus the pocket it skips — 80. A destination may be cited as
 *  often as the document likes; it takes **one** address, however many times it
 *  appears. Naming this after occurrences (`MAX_REFS`) was the specification's
 *  defect, and the code implemented the wrong quantity faithfully: discovery was
 *  sliced at the address count, so a document citing one target 80 times minted
 *  one address and starved the 79 that could have followed — a silent loss of up
 *  to 99% of the address space, and the mechanism is invisible because a slice
 *  leaves no marker. */
export const MAX_ADDRESSES = VECTOR_MAX - VECTOR_MIN + 1 - RESERVED_VECTORS.size;

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

/** Fenced blocks as (start, end) offset ranges. The house rule: an
 *  **authored** fence is not prose — verbatim, load-bearing input — so a
 *  reference in a sample is illustrative, not a citation, and discovery
 *  stops at the fence line. An unterminated fence fences the rest of the
 *  document. Pure.
 *
 *  Reason corrected 2026-10-12 (BRF-CODE-SILCROWS): this once claimed a
 *  badge injected inside a fence *never renders*. The exclusion was always
 *  discovery (a sample is verbatim), never a paint limit — and the paint
 *  turned out to be a separate problem the claim concealed: a prose
 *  `okuda-vector` marker is *not* consumed by the chromed fence path, because
 *  chroma colours the content before any handler sees it. A whole-file code
 *  render is not an authored fence: it is scanned in code mode (a `regions`
 *  predicate) where this exclusion is skipped, and its marker is the distinct
 *  `okuda-codevec`, painted after colour and before elision. */
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
 *  point). **Every occurrence is returned: there is no occurrence cap.** The
 *  bound on occurrences is the source itself, and a spike would be a measured
 *  decision — never a silent slice keyed on the *address* count, which is what
 *  this used to be (BRF-ADDRESS-CAP: two quantities, one name, and the cap on
 *  the wrong one). Optimistic: nothing validated. The frontmatter is not
 *  scanned (a document's own callsign is identity, not a reference). Legacy
 *  `okuda-rhs` numbers are not honored. Pure. */
export interface RefOccurrence {
  pos: number;
  end: number;
  target: string;
}

export function scanReferences(
  source: string,
  resolves?: (target: string) => boolean,
  /** Restrict occurrences to these regions — a code file's comments
   *  (BRF-CODE-SILCROWS). Present ⇒ code mode: the caller is scanning a
   *  code file, not markdown prose, so the markdown fence exclusion is
   *  skipped — a code file's backticks are not fences. */
  regions?: (pos: number) => boolean,
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
  const codeMode = regions !== undefined;
  const ok = (i: number): boolean =>
    i >= bodyStart && (codeMode || !inFence(i, fences)) && (regions === undefined || regions(i));
  const hits: RefOccurrence[] = [];
  for (const m of source.matchAll(RE_MD_LINK)) {
    const i = m.index!;
    if (ok(i)) hits.push({ pos: i, end: i + m[0]!.length, target: m[1]! });
  }
  // The ADR-044 gate applies to the inferred reference only — the bare
  // callsign-shaped token. A bare UTF-8 in prose made no claim; the
  // registry check is the retraction.
  for (const m of source.matchAll(RE_CALLSIGN)) {
    const i = m.index!;
    if (ok(i) && m[0] !== self && (!resolves || resolves(m[0]!))) {
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
    if (ok(i) && (!resolves || resolves(target))) {
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
    if (ok(i) && !inLink(i) && (!resolves || resolves(target))) {
      hits.push({ pos: i, end: i + m[0]!.length, target });
    }
  }
  hits.sort((a, b) => a.pos - b.pos);
  return hits;
}

/** The jump map — the in-memory translation table: vector number →
 *  filename, **one destination, one silcrow**. A destination cited
 *  repeatedly carries one number, reused at every mention (the citation
 *  convention: IEEE reprints, legal §-cross-references). First
 *  occurrence assigns; numbers ascend in reading order; capped at
 *  MAX_ADDRESSES — the cap is the map's invariant, and it is the *address*
 *  space, never discovery. Rebuilt on every render —
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

/** The derivation, and the fact it can now state — BRF-BOUNDARY-MARK's
 *  precondition. Returns the map, and whether the document holds more distinct
 *  destinations than the address space holds.
 *
 *  **A full map is not a truncated map.** Exactly 80 distinct destinations, no
 *  repeats, is *complete* — the space is exactly full — and a mark there would
 *  lie about its referent. The predicate is therefore a comparison rather than a
 *  constant, and it is computable only because discovery no longer slices at the
 *  address count. It also covers both truncation sources without naming either.
 *
 *  No mark is painted from this: overflow stays silent here, and the notice is
 *  the boundary-mark brief's (ADR-028's wire-budget conversation). This is the
 *  derivation stating what it knows, which is what the alternative — deriving it
 *  and discarding it — could not do. */
export function deriveReferences(
  source: string,
  resolves?: (target: string) => boolean,
  regions?: (pos: number) => boolean,
): DerivedMap {
  const refs = scanReferences(source, resolves, regions);
  const map = buildJumpMap(refs);
  const distinct = new Set(refs.map((r) => r.target)).size;
  return { map, truncated: distinct > map.size };
}

/** Convenience: the map alone, for the callers that do not need the truncation
 *  fact. A wrapper over `deriveReferences`, so the two can never disagree about
 *  what the map is.
 *
 *  The optional `resolves` is the ADR-044 gate — see scanReferences. */
export function jumpMapFor(
  source: string,
  resolves?: (target: string) => boolean,
  regions?: (pos: number) => boolean,
): Map<number, string> {
  return deriveReferences(source, resolves, regions).map;
}

/** Inject one paint marker after each reference occurrence — each
 *  occurrence carries the vector its target holds in the map. The marker
 *  (`%okuda-vector:NN%`) is consumed by the renderer's inline paint;
 *  the painted `§NN` is illustrative text, and the returned string is
 *  used for rendering only, never persisted. Replaces from the end so
 *  positions stay valid. Pure. */
export function annotateSource(
  source: string,
  map: Map<number, string>,
  regions?: (pos: number) => boolean,
): string {
  // Code mode emits a DISTINCT marker (`okuda-codevec`). The renderer paints
  // it after colour (a chroma fence is coloured before any handler sees it),
  // and the distinct name keeps a *literal* `%okuda-vector:NN%` in a code
  // sample or a test fixture untouched — an authored fence stays verbatim
  // (BRF-CODE-SILCROWS).
  const marker = regions === undefined ? "okuda-vector" : "okuda-codevec";
  const targetNum = new Map<string, number>();
  for (const [num, target] of map) targetNum.set(target, num);
  const occ = scanReferences(source, undefined, regions);
  let out = source;
  for (let i = occ.length - 1; i >= 0; i--) {
    const num = targetNum.get(occ[i]!.target);
    if (num === undefined || !map.has(num)) continue; // the paint is a projection of the map
    const o = occ[i]!;
    out = out.slice(0, o.end) + ` %${marker}:${num}%` + out.slice(o.end);
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
/** The derivation's result: the map, and whether the document holds more distinct
 *  destinations than the address space holds. **A full map is not a truncated
 *  map** — exactly eighty distinct destinations is complete — so the fact is a
 *  comparison, never `map.size === MAX_ADDRESSES`. (BRF-ADDRESS-CAP,
 *  BRF-BOUNDARY-MARK.) */
export interface DerivedMap {
  map: Map<number, string>;
  truncated: boolean;
}

/** The boundary mark — the receipt reached the address cap and says so.
 *
 *  A bare `…`: the silo's elision glyph, and **not a silcrow** — it carries no
 *  number and cannot be actuated. Bare rather than `… and N more`, because the
 *  count is a second quantity to keep honest and it moves on every render of a
 *  growing corpus: exactly the warning shape that fires on every render of a
 *  growing view (BRF-BOUNDARY-MARK, *why not a count*).
 *
 *  **`⋮` was the recorded alternative** — truer to a list's axis, and it already
 *  paints `state-parked` through the state-glyph table — and it stays deferred:
 *  it is bound to the *mermaid source elided* indicator, and one glyph with two
 *  referents is the failure *Attributable structure* names. Promote it to `⋮` if
 *  dogfood reads this mark as a cell cut rather than a list boundary.
 *
 *  The mark is plain text, not muted. **Deviation from the brief, declared:** no
 *  muted channel exists from a markdown source — the receipt's other lines are
 *  not muted either (the `§NN` badge paints in the vector role, the target is
 *  prose) — and a new paint channel for one glyph is the ceremony this silo
 *  refuses. What distinguishes the mark is what it is *not*: no silcrow, no
 *  number, nothing actuable, which is the load-bearing half. */
const BOUNDARY_MARK = "\u2026";

export function referencesSection(map: Map<number, string>, truncated = false): string {
  if (map.size === 0) return "";
  // `[...map]` iterates insertion order — the map's minting order,
  // reading order ascending. The section reorders nothing.
  const entries = [...map].map(([num, target]) => `%okuda-vector:${num}% ${target}`);
  // Derived, never judged: the mark follows from the comparison the derivation
  // already made, so a full map (eighty distinct, no repeats) carries none.
  if (truncated) entries.push(BOUNDARY_MARK);
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
 *  reassures rather than leaves doubt.
 *
 *  **A truncated map is never suppressed** (BRF-BOUNDARY-MARK, amending
 *  ADR-047). `referencesCovered` checks the *map's* destinations, so on a
 *  truncated map it can be true while the document still holds destinations
 *  the receipt never saw — and suppression would then hide the boundary with
 *  the receipt. So the receipt reappears over an otherwise complete hand list
 *  exactly when the map is truncated: its mere presence reports the
 *  truncation, a conditional element reporting its condition. Pure. */
export function appendReferences(
  source: string,
  map: Map<number, string>,
  annotated = false,
  truncated = false,
): string {
  const section = referencesSection(map, truncated);
  if (!section) return source;
  // Suppress only where the addresses are already ON the page: `annotated`
  // is the caller's statement that the silcrows are present (cli gates it on
  // `process.stdout.isTTY`; the TUI always annotates). On the plain/piped
  // rung the receipt IS the address table — ADR-047, "painted silcrows on
  // the glass, plain numbers elsewhere" — so it is never suppressed there.
  if (annotated && !truncated && referencesCovered(source, map)) return source;
  return source.replace(/\s*$/, "\n\n") + section + "\n";
}
