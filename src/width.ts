/**
 * width.ts — display column math for terminal output.
 *
 * Contract (briefs/2026-08-22-brief-ansi-emission-and-closed-grammar.md):
 *  - Grapheme counting via Intl.Segmenter (granularity "grapheme").
 *  - East Asian Width W/F code points occupy 2 columns.
 *  - Combining marks occupy 0 columns.
 *  - ANSI escape sequences occupy 0 columns.
 *  - Tab characters expand to 2 spaces before width calculation.
 *  - A grapheme containing U+FE0F (variation selector-16) renders in emoji
 *    presentation and occupies 2 columns.
 */

/** ANSI CSI/SGR sequence: \x1b[ ... final-byte */
const RE_CSI = /\x1b\[[0-9;:?]*[ -\/]*[@-~]/;
/** OSC 8 hyperlink: \x1b]8;;URL\x1b\\ (or BEL-terminated) */
const RE_OSC8 = /\x1b\]8;[^\x07\x1b]*(?:\x07|\x1b\\)/;
/** Any other OSC sequence */
const RE_OSC = /\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/;

const RE_ANY_ESCAPE = new RegExp(
  [RE_CSI.source, RE_OSC8.source, RE_OSC.source].map((s) => `(${s})`).join("|"),
);

export type Run =
  | { kind: "escape"; raw: string }
  | { kind: "grapheme"; raw: string; width: number };

/** Strip all ANSI escape sequences from a string. */
export function stripANSI(s: string): string {
  return s.replace(new RegExp(RE_ANY_ESCAPE.source, "g"), "");
}

/**
 * East Asian Wide / Fullwidth ranges (Unicode EAW property, W and F).
 * Pragmatic subset covering CJK, Hangul, Kana, fullwidth forms, and the
 * emoji presentation blocks. Ambiguous-width characters (box drawing,
 * ▶, ●, …) count 1 — matching modern terminal defaults.
 */
const EAW_WIDE: Array<[number, number]> = [
  [0x1100, 0x115f], // Hangul Jamo leading consonants
  [0x2329, 0x232a], // angle brackets
  [0x2e80, 0x303e], // CJK radicals, Kangxi, CJK punctuation
  [0x3041, 0x33ff], // Hiragana, Katakana, CJK compatibility
  [0x3400, 0x4dbf], // CJK extension A
  [0x4e00, 0x9fff], // CJK unified
  [0xa000, 0xa4cf], // Yi
  [0xa960, 0xa97f], // Hangul Jamo extended-A
  [0xac00, 0xd7a3], // Hangul syllables
  [0xf900, 0xfaff], // CJK compatibility ideographs
  [0xfe10, 0xfe19], // vertical forms
  [0xfe30, 0xfe52], // CJK compatibility forms
  [0xfe54, 0xfe66],
  [0xfe68, 0xfe6b],
  [0xff00, 0xff60], // fullwidth forms
  [0xffe0, 0xffe6],
  [0x16fe0, 0x16fe4], // Tangut marks
  [0x17000, 0x187f7], // Tangut
  [0x18800, 0x18aff], // Tangut components
  [0x1aff0, 0x1b16f], // Kana extended
  [0x1f004, 0x1f004],
  [0x1f0cf, 0x1f0cf],
  [0x1f18e, 0x1f18e],
  [0x1f191, 0x1f19a],
  [0x1f200, 0x1f202],
  [0x1f210, 0x1f23b],
  [0x1f240, 0x1f248],
  [0x1f250, 0x1f251],
  [0x1f260, 0x1f265],
  [0x1f300, 0x1f320], // emoji: misc symbols and pictographs (W subset)
  [0x1f32d, 0x1f335],
  [0x1f337, 0x1f37c],
  [0x1f37e, 0x1f393],
  [0x1f3a0, 0x1f3ca],
  [0x1f3cf, 0x1f3d3],
  [0x1f3e0, 0x1f3f0],
  [0x1f3f4, 0x1f3f4],
  [0x1f3f8, 0x1f43e],
  [0x1f440, 0x1f440],
  [0x1f442, 0x1f4fc],
  [0x1f4ff, 0x1f53d],
  [0x1f54b, 0x1f54e],
  [0x1f550, 0x1f567],
  [0x1f57a, 0x1f57a],
  [0x1f595, 0x1f596],
  [0x1f5a4, 0x1f5a4],
  [0x1f5fb, 0x1f64f],
  [0x1f680, 0x1f6c5], // emoji: transport
  [0x1f6cc, 0x1f6cc],
  [0x1f6d0, 0x1f6d2],
  [0x1f6d5, 0x1f6d7],
  [0x1f6eb, 0x1f6ec],
  [0x1f6f4, 0x1f6fc],
  [0x1f7e0, 0x1f7eb],
  [0x1f90c, 0x1f93a],
  [0x1f93c, 0x1f945],
  [0x1f947, 0x1f9ff],
  [0x1fa70, 0x1fa74],
  [0x1fa78, 0x1fa7c],
  [0x1fa80, 0x1fa86],
  [0x1fa90, 0x1faac],
  [0x1fab0, 0x1faba],
  [0x1fac0, 0x1fac5],
  [0x1fad0, 0x1fad9],
  [0x1fae0, 0x1fae7],
  [0x1faf0, 0x1faf6],
  [0x20000, 0x2fffd], // CJK extension B+
  [0x30000, 0x3fffd],
];

/** Zero-width: combining marks, variation selectors, format controls. */
const ZERO_WIDTH: Array<[number, number]> = [
  [0x0300, 0x036f], // combining diacritical marks
  [0x0483, 0x0489],
  [0x0591, 0x05bd],
  [0x0610, 0x061a],
  [0x064b, 0x065f],
  [0x0670, 0x0670],
  [0x06d6, 0x06dc],
  [0x0730, 0x074a],
  [0x07a6, 0x07b0],
  [0x0816, 0x082d],
  [0x0900, 0x0902],
  [0x093a, 0x093a],
  [0x093c, 0x093c],
  [0x0941, 0x0948],
  [0x094d, 0x094d],
  [0x0951, 0x0957],
  [0x0e31, 0x0e31],
  [0x0e34, 0x0e3a],
  [0x0e47, 0x0e4e],
  [0x1ab0, 0x1aff], // combining diacritical extended
  [0x1dc0, 0x1dff], // combining diacritical supplemental
  [0x200b, 0x200f], // zero width space, ZWNJ, ZWJ, LRM, RLM
  [0x2028, 0x202e],
  [0x2060, 0x2064],
  [0x20d0, 0x20ff], // combining marks for symbols
  [0xfe00, 0xfe0f], // variation selectors
  [0xfe20, 0xfe2f], // combining half marks
  [0xfeff, 0xfeff], // BOM
  [0xe0100, 0xe01ef], // variation selectors supplemental
];

/** Emoji presentation default (renders 2-wide without VS16). */
const EMOJI_PRESENTATION: Array<[number, number]> = [
  [0x2600, 0x2604],
  [0x260e, 0x260e],
  [0x261d, 0x261d],
  [0x2620, 0x2623],
  [0x2626, 0x2626],
  [0x262a, 0x262a],
  [0x262e, 0x262f],
  [0x2638, 0x263a],
  [0x2640, 0x2640],
  [0x2642, 0x2642],
  [0x2648, 0x2653],
  [0x265f, 0x2660],
  [0x2663, 0x2663],
  [0x2665, 0x2666],
  [0x2668, 0x2668],
  [0x267b, 0x267b],
  [0x267e, 0x267e],
  [0x2692, 0x2697],
  [0x2699, 0x2699],
  [0x269b, 0x26a1],
  [0x26a7, 0x26a7],
  [0x26b0, 0x26b1],
  [0x26c8, 0x26c8],
  [0x26cf, 0x26cf],
  [0x26d1, 0x26d1],
  [0x26d3, 0x26d3],
  [0x26e9, 0x26ea],
  [0x26f0, 0x26f5],
  [0x26f7, 0x26fa],
  [0x26fd, 0x26fd],
  [0x2702, 0x2702],
  [0x2708, 0x2708],
  [0x2709, 0x2709],
  [0x270c, 0x270d],
  [0x270f, 0x270f],
  [0x2712, 0x2712],
  [0x2714, 0x2714],
  [0x2716, 0x2716],
  [0x271d, 0x271d],
  [0x2721, 0x2721],
  [0x2728, 0x2728],
  [0x2733, 0x2734],
  [0x2744, 0x2744],
  [0x2747, 0x2747],
  [0x274c, 0x274c],
  [0x274e, 0x274e],
  [0x2753, 0x2755],
  [0x2757, 0x2757],
  [0x2763, 0x2764],
  [0x2795, 0x2797],
  [0x27a1, 0x27a1],
  [0x27b0, 0x27b0],
  [0x27bf, 0x27bf],
  [0x2934, 0x2935],
  [0x2b05, 0x2b07],
  [0x2b1b, 0x2b1c],
  [0x2b50, 0x2b50],
  [0x2b55, 0x2b55],
  [0x3030, 0x3030],
  [0x303d, 0x303d],
  [0x3297, 0x3297],
  [0x3299, 0x3299],
];

function inRanges(cp: number, ranges: Array<[number, number]>): boolean {
  // binary search
  let lo = 0;
  let hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const [start, end] = ranges[mid]!;
    if (cp < start) hi = mid - 1;
    else if (cp > end) lo = mid + 1;
    else return true;
  }
  return false;
}

/** Tab → 2 spaces (contract: expanded before width calculation). */
export function expandTabs(s: string): string {
  return s.includes("\t") ? s.replace(/\t/g, "  ") : s;
}

const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

/** Display width of a single grapheme cluster (no escapes inside). */
export function graphemeWidth(cluster: string): number {
  let width = 0;
  let hasVS16 = false;
  for (const ch of cluster) {
    const cp = ch.codePointAt(0)!;
    if (cp === 0xfe0f) hasVS16 = true;
    if (cp === 0x09) return 2; // tab (defensive; expandTabs usually first)
    if (inRanges(cp, ZERO_WIDTH)) continue;
    if (inRanges(cp, EAW_WIDE) || inRanges(cp, EMOJI_PRESENTATION)) {
      width = 2;
    } else if (width === 0 && cp >= 0x20) {
      width = 1;
    }
  }
  // Grapheme of only zero-width marks → 0. VS16 forces emoji presentation.
  if (hasVS16) width = 2;
  return width;
}

/**
 * Display width of a string that may contain ANSI escapes (0 columns)
 * and tabs (2 columns each).
 */
export function displayWidth(s: string): number {
  let total = 0;
  for (const run of scanRuns(s)) {
    if (run.kind === "grapheme") total += run.width;
  }
  return total;
}

/**
 * Tokenize a string into zero-width escapes and measured graphemes.
 * The wrap engine consumes this stream to track style state and column
 * positions in one pass.
 *
 * Two-phase: first split escape spans from text spans (escapes are never
 * segmented — splitting them mid-sequence corrupts the stream), then
 * grapheme-segment each text span.
 */
export function* scanRuns(s: string): Generator<Run> {
  const text = expandTabs(s);
  const re = new RegExp(RE_ANY_ESCAPE.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  const graphemesOf = (span: string): string[] => {
    const out: string[] = [];
    for (const seg of segmenter.segment(span)) out.push(seg.segment);
    return out;
  };
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      for (const g of graphemesOf(text.slice(last, m.index))) {
        yield { kind: "grapheme", raw: g, width: graphemeWidth(g) };
      }
    }
    yield { kind: "escape", raw: m[0] };
    last = re.lastIndex;
  }
  if (last < text.length) {
    for (const g of graphemesOf(text.slice(last))) {
      yield { kind: "grapheme", raw: g, width: graphemeWidth(g) };
    }
  }
}

/**
 * Pad a possibly-ANSI string to `cols` display columns (right pad with
 * spaces). Used for table cell alignment.
 */
export function padDisplay(s: string, cols: number): string {
  const w = displayWidth(s);
  return w >= cols ? s : s + " ".repeat(cols - w);
}

/** Right-align: pad on the left. */
export function padStartDisplay(s: string, cols: number): string {
  const w = displayWidth(s);
  return w >= cols ? s : " ".repeat(cols - w) + s;
}

/** Centre-align within `cols`. */
export function padCenterDisplay(s: string, cols: number): string {
  const w = displayWidth(s);
  if (w >= cols) return s;
  const left = Math.floor((cols - w) / 2);
  return " ".repeat(left) + s + " ".repeat(cols - w - left);
}
