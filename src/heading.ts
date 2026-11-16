/**
 * heading.ts — derive a source line from the heading the reader is looking at.
 *
 * `88` opens `currentFile` in the editor. A code file's render maps 1:1 to its
 * source (viewport top − 1, `BRF-CODE-EDITOR-HINT`); a markdown file's does not —
 * prose wraps, frontmatter folds, tables expand. The one structure that
 * survives render intact is the heading: `^#{1,6} ` in the source, a badged
 * row with a right-edge chip in the render, in the same order. The Nth of
 * each is the same section.
 *
 * Nothing is stored. Both lists are computed at the keypress from the source
 * text and the lines already on screen; the result is a line number handed to
 * `editArgs` and forgotten. This is the pass-through shape `ADR-091` permits —
 * no authored coordinate, no map, nothing that can rot (`ADR-LINE-IS-PROSE-078`).
 *
 * The smoke test behind this is recorded in `BRF-HEADING-EDITOR-HINT`:
 * 6 documents × 4 widths, exact at every width; the prose-anchor alternative
 * measured 11% exact and was refused.
 */

import { fenceRanges, inFence } from "./vectors";
import { frameBounds } from "./frames";

/** Right-edge chip — the renderer's H1 unit (`src/ansi.ts:160`), painted on
 *  every wrapped row of a heading (`src/render.ts:1306-1310`). It is what
 *  separates a heading from a table row whose first cell happens to be `#`
 *  (`briefs/2026-10-16-brief-search-row.md:40`). */
const CHIP = /\u2588\s*$/;

/** ANSI + the TUI's two-column margin, stripped for detection only. The
 *  rendered lines themselves are never changed. */
const bare = (line: string): string =>
  line.replace(/\x1b\[[0-9;]*m/g, "").replace(/^ {1,2}/, "");

const isPrefix = (line: string): boolean => /^#{1,6} /.test(bare(line));
const hasChip = (line: string): boolean => CHIP.test(bare(line));

/** 1-based source lines carrying a markdown heading, outside fences.
 *  A shell comment inside a fenced block is not a heading
 *  (`docs/2026-11-14-osc-scripts.md:8`). Uses the same fence predicate the
 *  reference derivation uses, so the two can never disagree about what is
 *  a fence. Pure. */
export function sourceHeadingLines(source: string): number[] {
  const ranges = fenceRanges(source);
  const out: number[] = [];
  let pos = 0;
  source.split("\n").forEach((line, i) => {
    if (/^#{1,6} /.test(line) && !inFence(pos, ranges)) out.push(i + 1);
    pos += line.length + 1;
  });
  return out;
}

/** Start indices of logical headings in a rendered line array.
 *
 *  A heading wraps at width−2 and the badge is repainted on every
 *  continuation row (`src/render.ts:1297-1310`), so `headingLines()` sees N
 *  "headings" for one source heading. Consecutive prefix rows are ONE logical
 *  heading when any row in the run carries the chip. A `#`-celled table row
 *  has no chip and is excluded. Pure. */
export function renderedHeadings(lines: string[]): number[] {
  const out: number[] = [];
  let i = 0;
  while (i < lines.length) {
    if (!isPrefix(lines[i]!)) { i++; continue; }
    const start = i;
    let chipped = false;
    while (i < lines.length && isPrefix(lines[i]!)) {
      if (hasChip(lines[i]!)) chipped = true;
      i++;
    }
    if (chipped) out.push(start);
  }
  return out;
}

/** The source line of the heading whose frame holds the viewport's middle.
 *
 *  The renderer appends at most one synthetic `## References` heading
 *  (`src/vectors.ts:409-420`) — empty map, or a final section that already
 *  covers every destination, suppresses it. So rendered headings are source
 *  headings, or source headings plus one last synthetic row. The delta, not
 *  the heading's name, decides: a document may carry its OWN `References`
 *  section, and that one is real.
 *
 *  A delta outside {0,1} means the two spaces disagree (a table cell that
 *  looks like a heading, a fence the render treated differently). Return
 *  `null` — never guess. A viewport above the first heading also returns
 *  `null`; the editor falls back to the top of the file, today's behaviour.
 *  Pure. */
export function headingSourceLine(
  source: string,
  lines: string[],
  scroll: number,
  height: number,
): number | null {
  const src = sourceHeadingLines(source);
  const rnd = renderedHeadings(lines);
  const delta = rnd.length - src.length;
  if (delta !== 0 && delta !== 1) return null;
  if (rnd.length === 0 || src.length === 0) return null;
  // Drop the synthetic receipt when present. The tail then resolves to the
  // last real heading — the fallback the brief asks for, with no special case.
  const real = delta === 1 ? rnd.slice(0, -1) : rnd;
  if (real.length !== src.length) return null;
  const mid = scroll + (height >> 1);
  const { start } = frameBounds(real, lines.length, mid);
  const ordinal = real.indexOf(start);
  return ordinal >= 0 && ordinal < src.length ? src[ordinal]! : null;
}
