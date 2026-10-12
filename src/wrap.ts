/**
 * wrap.ts — the hard-wrap engine.
 *
 * Contract (brief 002 + ADR-004):
 *  - Hard-wrap at terminal width; never delegate to the terminal.
 *  - Wraps on visible characters only (escapes are 0-width).
 *  - Style hygiene at wrap boundaries: \\x1b[0m at the break point,
 *    style re-emitted at the continuation line (rule 2).
 *  - OSC 8 zones are closed at line ends and reopened on continuation
 *    (rule 3). Every formatted line ends in \\x1b[0m (rule 4).
 *  - Existing newline in input is a word separator, not a forced
 *    break (soft returns stripped 2026-08-24, ADR-007 amendment — the
 *    foxtrot oscar principle; see the ADR for the rationale).
 *  - Words longer than the width are hard-split; every emitted line is
 *    ≤ `width` display columns (the property-test invariant).
 *
 * The engine is ANSI-state-aware: it consumes the emitter's output
 * directly — the escape stream IS the style protocol (decisions/005).
 * Invariant relied upon: emitters pair opens with full \\x1b[0m resets
 * only; no partial resets (\\x1b[22m etc.) are emitted by okuda.
 */

import { scanRuns, type Run } from "./width";

const RE_SGR_RESET = /^\x1b\[0*m$/;
// A token may slip AFTER one of these: the delimiters a reader already parses
// as separators (BRF-TABLE-GLASS-FIT). A URL or path hard-splits at a
// separator rather than mid-token.
const RE_BREAK_CHAR = /^[/._@-]$/;
// OSC 8: \x1b]8;<params>;<URI>ST — params usually empty, URI empty on close.
const RE_OSC8 = /^\x1b\]8;([^\x07\x1b;]*);([^\x07\x1b]*)(?:\x07|\x1b\\)$/;

export interface WrapOptions {
  /** Max display columns per emitted line (incl. indents). */
  width: number;
  /** Prefix on the first line. */
  firstIndent?: string;
  /** Prefix on continuation lines (aligned under the text column). */
  indent?: string;
}

type Unit = Run; // escape or grapheme

interface ActiveState {
  sgr: string[]; // open SGR sequences, in order
  url: string | null; // active OSC 8 URL
}

function emitState(st: ActiveState): string {
  let out = st.sgr.join("");
  if (st.url !== null) out += `\x1b]8;;${st.url}\x1b\\`;
  return out;
}

function closeState(st: ActiveState): string {
  // Reset covers open SGRs; OSC 8 needs its own terminator (rule 3).
  return (st.url !== null || st.sgr.length > 0 ? "\x1b[0m" : "") +
    (st.url !== null ? "\x1b]8;;\x1b\\" : "");
}

/** Display width of a unit list. */
function unitsWidth(units: Unit[]): number {
  let w = 0;
  for (const u of units) if (u.kind === "grapheme") w += u.width;
  return w;
}

/** Feed an escape unit into the tracked state. */
function trackEscape(st: ActiveState, raw: string): void {
  const m = raw.match(RE_OSC8);
  if (m) {
    st.url = m[2] === "" ? null : m[2]!;
    return;
  }
  if (raw.startsWith("\x1b]") || raw.startsWith("\x1bP")) return; // other OSC/DCS: ignore
  if (RE_SGR_RESET.test(raw)) {
    st.sgr = [];
    return;
  }
  if (raw.startsWith("\x1b[")) st.sgr.push(raw);
}

/**
 * Hard-wrap `text` to `width` display columns. Returns lines without a
 * trailing newline; every line honours the hygiene rules above.
 */
export function wrapANSI(text: string, opts: WrapOptions): string[] {
  const width = Math.max(1, opts.width);
  const firstIndent = opts.firstIndent ?? "";
  const indent = opts.indent ?? "";
  const state: ActiveState = { sgr: [], url: null };

  const lines: string[] = [];
  // Pending line parts: prefix already emitted, units accumulating.
  let lineUnits: Unit[] = [];
  let lineIsFirst = true;
  let lineHasContent = false; // any non-space unit on this line

  const currentBudget = () =>
    width - displayUnits(lineUnits) -
      (lineIsFirst ? strWidth(firstIndent) : strWidth(indent));

  const strWidth = (s: string): number => {
    let w = 0;
    for (const r of scanRuns(s)) if (r.kind === "grapheme") w += r.width;
    return w;
  };
  const displayUnits = unitsWidth;

  const flushLine = (): void => {
    // Trim trailing spaces from units
    while (
      lineUnits.length > 0 &&
      lineUnits[lineUnits.length - 1]!.kind === "grapheme" &&
      lineUnits[lineUnits.length - 1]!.raw === " "
    ) {
      lineUnits.pop();
    }
    if (lineUnits.length === 0) {
      lines.push("");
      lineIsFirst = false;
      return;
    }
    // Fold this line's escapes positionally: prefix re-emits the carry
    // from the previous line; suffix closes whatever remains open at the
    // line's end; the fold result carries to the next line.
    const lineState: ActiveState = { sgr: [...state.sgr], url: state.url };
    let sawEscape = false;
    for (const u of lineUnits) {
      if (u.kind === "escape") {
        sawEscape = true;
        trackEscape(lineState, u.raw);
      }
    }
    const carry: ActiveState = { sgr: [...lineState.sgr], url: lineState.url };
    // Rule 4: every formatted line ends \x1b[0m (idempotent even when the
    // line already closed its styles mid-stream).
    const suffix = (sawEscape || carry.sgr.length > 0 ? "\x1b[0m" : "") +
      (lineState.url !== null ? "\x1b]8;;\x1b\\" : "");
    const prefix = (lineIsFirst ? firstIndent : indent) + emitState(state);
    lines.push(prefix + lineUnits.map((u) => u.raw).join("") + suffix);
    state.sgr = carry.sgr;
    state.url = carry.url;
    lineUnits = [];
    lineHasContent = false;
    lineIsFirst = false;
  };

  let word: Unit[] = [];

  const appendWord = (): void => {
    if (word.length === 0) return;
    const wordW = unitsWidth(word);
    const sep = lineHasContent ? 1 : 0;
    const budget = currentBudget();

    if (lineHasContent && budget >= sep + wordW) {
      if (sep) lineUnits.push({ kind: "grapheme", raw: " ", width: 1 });
      lineUnits.push(...word);
      lineHasContent = true;
      word = [];
      return;
    }

    if (!lineHasContent && budget >= wordW) {
      lineUnits.push(...word);
      lineHasContent = true;
      word = [];
      return;
    }

    // Doesn't fit: break the current line first.
    if (lineHasContent) flushLine();

    // Now on a fresh line; hard-split if still too wide.
    let remaining = width - (lineIsFirst ? strWidth(firstIndent) : strWidth(indent));
    if (wordW <= remaining) {
      lineUnits.push(...word);
      lineHasContent = true;
      word = [];
      return;
    }
    // Hard-split the word across lines, preferring a break AFTER a delimiter
    // so a URL or path slips at a separator rather than mid-token
    // (BRF-TABLE-GLASS-FIT). The last delimiter that fits the line wins, and
    // only a token with no fitting delimiter is cut mid-word.
    let rest = word;
    while (rest.length > 0) {
      const available = width - (lineIsFirst ? strWidth(firstIndent) : strWidth(indent));
      let fit = 0;
      let w = 0;
      let lastDelim = -1;
      while (fit < rest.length) {
        const u = rest[fit]!;
        const uw = u.kind === "grapheme" ? u.width : 0;
        if (w + uw > available) break;
        w += uw;
        if (u.kind === "grapheme" && RE_BREAK_CHAR.test(u.raw)) lastDelim = fit;
        fit++;
      }
      if (fit === 0) fit = 1; // never stall on a zero-width budget
      const split = lastDelim > 0 && lastDelim + 1 < fit ? lastDelim + 1 : fit;
      lineUnits.push(...rest.slice(0, split));
      lineHasContent = true;
      rest = rest.slice(split);
      if (rest.length > 0) flushLine();
    }
    word = [];
  };

  for (const run of scanRuns(text)) {
    if (run.kind === "escape") {
      word.push(run);
      continue; // state folds at flush time, not scan time (see flushLine)
    }
    const g = run.raw;
    if (g === "\n") {
      appendWord();
      continue;
    }
    if (g === " ") {
      // appendWord owns separator emission — a raw space only flushes
      // the pending word (double-space bug: never push the space here).
      appendWord();
      continue;
    }
    word.push(run);
  }
  appendWord();
  if (lineUnits.length > 0 || lines.length === 0) flushLine();

  return lines;
}

/**
 * Pad each line of a block with `indent` (continuation alignment) —
 * used when a container re-wraps content that carries its own breaks.
 */
export function indentLines(lines: string[], indent: string): string[] {
  return lines.map((l, i) => (i === 0 ? l : indent + l));
}
