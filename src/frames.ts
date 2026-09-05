/**
 * frames.ts — the okudaframe helpers (BRF-PAGED-OKUDAGRAM, ADR-031
 * frame mode, keyboard-controls [01]).
 *
 * Naming (the attribution badge): Okuda's name goes on artifacts that
 * carry the design language — okudagram (the diagrams), okudaframe
 * (these reading frames), okuda (the palette and the badge). The
 * suffix names the artifact; the prefix is the attribution.
 *
 * The rule, from the brief: **a frame is a header and its content, from
 * the header to the next header (or EOF).** The frame fills the
 * terminal from the top; content shorter than the glass leaves blank
 * below (the boundary — step on); content taller is slippy within.
 *
 * Pure functions over the rendered line array — derived per use, no
 * state. The heading detection reads the *rendered* lines (ANSI
 * stripped, margin removed): a heading is a line starting with `#`.
 */

/** Strip SGR sequences and the 2-char left margin the TUI adds. */
const bare = (line: string): string => line.replace(/\x1b\[[0-9;]*m/g, "").replace(/^ {1,2}/, "");

/** Indices of rendered heading lines (`#`–`######` at line start). */
export function headingLines(lines: string[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^ {0,2}#{1,6} /.test(bare(lines[i]!))) out.push(i);
  }
  return out;
}

/** The frame containing `line`: its heading index and the exclusive
 *  end (next heading, or EOF). */
export function frameBounds(
  headings: number[],
  total: number,
  line: number,
): { index: number; start: number; end: number } {
  let index = 0;
  for (let i = 0; i < headings.length; i++) {
    if (headings[i]! <= line) index = i;
    else break;
  }
  const start = headings[index] ?? 0;
  const end = index + 1 < headings.length ? headings[index + 1]! : total;
  return { index, start, end };
}

/** The scroll offset of the frame `step` frames from the one containing
 *  `line`, clamped to the document. Step -1 from mid-frame snaps to the
 *  CURRENT frame's header first (you are inside it); the next -1 goes
 *  to the previous — the standard outline-navigation ergonomic. */
export function snapFrame(
  headings: number[],
  total: number,
  line: number,
  step: number,
): number {
  if (headings.length === 0) return line;
  const { index, start } = frameBounds(headings, total, line);
  if (step < 0) return line > start ? start : headings[Math.max(index + step, 0)]!;
  const next = Math.min(index + step, headings.length - 1);
  return headings[next]!;
}
