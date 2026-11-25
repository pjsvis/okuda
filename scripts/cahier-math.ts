/**
 * cahier-math.ts — the maths PRE-pass for the HTML compositor (BRF-CAHIER-MATH).
 *
 * The terminal's glyph pass is one row tall by construction: a cell grid cannot
 * stack a fraction, and `ADR-MATH-GRAMMAR-076:84` says so — *one dimension →
 * the table, two dimensions → the door that already exists* (a `mermaid` fence,
 * an external CLI, text back). A browser is not a cell grid, so the export takes
 * a second door. Three stages, each strictly narrowing:
 *
 *   1. `pandoc` converts every span it identifies → MathML.
 *   2. What it declines comes back LABELLED: `<span class="math inline">$…$</span>`.
 *      That is 076's mark arriving for free — a decline the reader can see.
 *   3. On THOSE spans only, the glyph table runs. One span in the corpus needs
 *      this: `$\S$`, which the table renders `§` and the converter refuses. The
 *      corpus census (2026-11-25) found 25 spans where the converter identifies
 *      maths the guard declines, and exactly 1 where the table wins — that one
 *      span is why stage 3 exists.
 *
 * Stage 3 enters by the span wrapper, never by scanning for `$`: a currency pair
 * (`costs $5 and $10`) survives conversion as literal text, so the output
 * contains the accidental pair `$5 and $`. Scanning would find it. The wrapper
 * is the boundary, which makes this safe by structure rather than by luck.
 *
 * No new dependency reaches the artefact. MathML is native in Chrome and Safari
 * and uses SYSTEM fonts, so the guarantee *no assets, no fonts, no network*
 * (`docs/2026-11-05-the-cahier.md:28`) is untouched. Without `pandoc` on PATH
 * this degrades to the terminal's answer, byte for byte.
 */

import { applyMathGlyphs, mapMathSpans } from "../src/render.ts";
import { escapeHtml, unescapeHtml } from "./html-escape.ts";

const PANDOC_BIN = "pandoc";

/** Slot left in the marked-up source for each span, and the matching marker in
 *  the batch handed to pandoc. ASCII on purpose (a control character would have
 *  to survive a subprocess round trip), and absent from prose in practice. */
const RE_MATH_SLOT = /ZQOKUDASLOT(\d+)QZ/g;
const RE_PANDOC_MARK = /ZQOKUDA(\d+)QZ/g;

/** One pandoc call for the whole set of span bodies: each on its own line,
 *  prefixed by its index, so an answer pairs with its input **by construction**
 *  rather than by position in a stream. A first batch attempt that paired by
 *  position mis-aligned silently and inflated the corpus census — the lesson is
 *  recorded in the brief rather than here.
 *
 *  Returns `null` when the converter is absent or fails: the caller degrades. */
export function pandocMath(bodies: string[], bin: string = PANDOC_BIN): string[] | null {
  if (bodies.length === 0) return [];
  const fixture = bodies.map((b, i) => `ZQOKUDA${i}QZ $${b}$`).join("\n\n");
  let html: string;
  try {
    const proc = Bun.spawnSync([bin, "-f", "markdown", "-t", "html"], {
      stdin: new TextEncoder().encode(fixture),
      stdout: "pipe",
      stderr: "pipe",
    });
    if (proc.exitCode !== 0) return null;
    html = proc.stdout.toString();
  } catch {
    return null; // ENOENT: no converter, and no cost beyond the spawn.
  }
  const answers: string[] = new Array(bodies.length).fill("");
  const hits = [...html.matchAll(RE_PANDOC_MARK)];
  for (let k = 0; k < hits.length; k++) {
    const i = Number(hits[k]![1]);
    if (!Number.isInteger(i) || i < 0 || i >= bodies.length) continue;
    const start = hits[k]!.index! + hits[k]![0].length;
    const end = k + 1 < hits.length ? hits[k + 1]!.index! : html.length;
    answers[i] = html
      .slice(start, end)
      .replace(/^\s*<\/p>\s*$/, "")
      .trim();
  }
  return answers;
}

/** One span's answer → the markup that replaces it, or `null` to keep the
 *  author's text. The order is the ladder: MathML, then the table, then
 *  nothing (which is the author's own span, and a visible decline). */
export function resolveMathAnswer(answer: string): string | null {
  const math = /<math[\s\S]*?<\/math>/.exec(answer);
  if (math) return math[0];
  const declined = /<span class="math (inline|display)">([\s\S]*?)<\/span>/.exec(answer);
  if (declined) {
    const tex = unescapeHtml(declined[2]!);
    const glyphs = applyMathGlyphs(tex);
    if (glyphs === tex) return null;
    // Keep pandoc's wrapper — the page still says "this came from maths" rather
    // than smuggling bare prose in — and ESCAPE the glyphs: they are text going
    // into HTML, and `α < β` would otherwise open a tag.
    return `<span class="math ${declined[1]}">${escapeHtml(glyphs)}</span>`;
  }
  return null;
}

/** Replace inline maths in a markdown source with MathML, before the parser
 *  sees it. Raw HTML passes through `Bun.markdown.html` in prose and in table
 *  cells alike (measured 2026-11-25), which is what makes a PRE-pass possible. */
export function mathsPass(source: string, bin: string = PANDOC_BIN): string {
  if (!source.includes("$")) return source; // the common case costs a scan
  const bodies: string[] = [];
  const slotted = mapMathSpans(source, (_whole, body) => {
    bodies.push(body);
    return `ZQOKUDASLOT${bodies.length - 1}QZ`;
  });
  if (bodies.length === 0) return source;
  const answers = pandocMath(bodies, bin);
  if (answers === null) return applyMathGlyphs(source); // no pandoc: today's output
  return slotted.replace(RE_MATH_SLOT, (_slot, i: string) => {
    const body = bodies[Number(i)]!;
    return resolveMathAnswer(answers[Number(i)] ?? "") ?? `$${body}$`;
  });
}
