#!/usr/bin/env bun
// ── fgp-card.ts — the figure-ground pair, painted into the cells ─────────────
//
//  A flip needs the glass: `OSC 10`/`OSC 11` takes the host's defaults, which
//  means a tty, a read before a set, a give-back, and a refusal under any
//  multiplexer. This card takes nothing. It paints the pair into the bytes —
//  `48;2` behind every line, `38;2` as the body ink — so the page can be read on
//  a ground the machine is not on.
//
//  That is *inefficient*: the terminal would have supplied both for free by
//  inheritance, and `ADR-GLASS-INK-073` says the glass owns them. Efficiency is
//  not the axis here, legibility is. The waste is what decouples the page from
//  the host, and what it buys is a surface that travels: every admissible ground
//  on one screen, two hosts' pairs side by side, a page that survives `less -R`,
//  an HTML export, or a screenshot. A flip can only ever show the surface you are
//  already standing on.
//
//  What it does not do: read the *host*. It cannot know the host ignored your
//  config, is re-reading the hex as Display P3, or is fading the unfocused pane.
//  That is `just surface-probe`'s question, and keeping the two apart is why
//  there are two instruments.
//
//  Usage:
//    just fgp                          # every admissible rung, 80 columns
//    just fgp --rungs 8,0,5,3           # named rungs, the refused one included
//    just fgp --width 100 docs/style-guide.md
//    just fgp --color none             # the card's own control
import { renderDocument } from "../src/render";
import { type Palette } from "../src/palette";
import { displayWidth } from "../src/width";
import { okudaPalette, PAIRS, surfaceVerdict, type Pair } from "./contrast";

const ESC = "\x1b";

/** The specimen: one construct per role that can die on a ground. It lives in
 *  this file rather than in a document because a document can be edited, and the
 *  card would then silently stop covering the role it was chosen for. */
export const SPECIMEN = `# The figure-ground card

Prose in the body role, inheriting the ink you are reading on, with **strong**
and *emphasis* inside it, and \`inline code\` beside them.

## A heading one rung down

> A blockquote, whose pipe recedes and whose text is emphasis-coloured.

- a bullet, whose marker is structural ink
- a second, carrying ✓ done and ☐ todo and ✗ failed

| key | value |
|---|---|
| heading | the structural scan path |
| muted | the rule that must not shout |

---

\`\`\`
a fenced block: code-text, no background
\`\`\`
`;

export type Color = "truecolor" | "none";

export interface Patch {
  /** The rung, or null for an ad-hoc pair. */
  rung: number | null;
  pair: { bg: string; fg: string };
  /** `§8  #221f1c / #d6cfc4  10.6:1  readable · navigable  name` */
  header: string;
  /** The painted lines, or the plain ones in `none` mode. */
  lines: string[];
}

const rgb = (hex: string): [number, number, number] => {
  const s = hex.replace("#", "");
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};

const ground = (hex: string): string => `${ESC}[48;2;${rgb(hex).join(";")}m`;
const ink = (hex: string): string => `${ESC}[38;2;${rgb(hex).join(";")}m`;

/** Why the ground is re-applied after every reset: a role span ends with
 *  `\x1b[0m`, which clears `48;2` with it, so one prefix per line leaves the rest
 *  of that line on the glass's own ground — a card lying about half its patch. */
export function paintLine(line: string, pair: { bg: string; fg: string }, width: number): string {
  const g = ground(pair.bg);
  const i = ink(pair.fg);
  const body = line.replaceAll(`${ESC}[0m`, `${ESC}[0m${g}${i}`);
  const pad = Math.max(0, width - displayWidth(line));
  return `${g}${i}${body}${" ".repeat(pad)}${ESC}[0m`;
}

/** The header line. The numbers come from `contrast.ts`, never from a second
 *  calculation — a card whose arithmetic disagreed with `just surface` would be a
 *  second derivation wearing a picture. */
export function header(rung: number | null, pair: { bg: string; fg: string }, name?: string): string {
  const v = surfaceVerdict(pair);
  const label = rung === null ? "··" : `§${String(rung).padStart(2, " ")}`;
  const readings = `${v.ink.toFixed(1)}:1  ${v.readable ? "readable" : `NOT readable (${v.belowFloor.length})`}` +
    ` · ${v.navigable ? "navigable" : `NOT navigable (${v.crossed.length})`}`;
  return `${label}  ${pair.bg} / ${pair.fg}  ${readings}${name ? `  ${name}` : ""}`;
}

/** One patch per pair: the specimen rendered at that pair, painted. Pure — the
 *  renderer is called, never duplicated (`renderDocument` is the same function
 *  `okuda <file>` uses). */
export async function fgpPatches(
  source: string,
  pairs: { rung: number | null; pair: { bg: string; fg: string }; name?: string }[],
  width: number,
  color: Color = "truecolor",
): Promise<Patch[]> {
  const out: Patch[] = [];
  for (const { rung, pair, name } of pairs) {
    // `body` is the one role a principal may declare, and the card is a principal
    // for the duration of a reading: the ink is the pair's, not the glass's.
    const palette: Palette = { ...okudaPalette(), body: pair.fg };
    const rendered = await renderDocument(source, { width, palette, color });
    const plain = rendered.split("\n").filter((_, i, a) => i < a.length - 1 || a[i] !== "");
    out.push({
      rung,
      pair,
      header: header(rung, pair, name),
      lines: color === "none" ? plain : plain.map((l) => paintLine(l, pair, width)),
    });
  }
  return out;
}

function argAfter(argv: string[], flag: string): string | undefined {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}

/** The rungs a card shows by default: every admissible pair. The refused rung is
 *  printed only when it is named, so a card never quietly offers a ground the
 *  table already refuses. */
export function defaultPairs(): { rung: number; pair: { bg: string; fg: string }; name?: string }[] {
  return PAIRS.filter((p: Pair) => !p.refused).map((p) => ({ rung: p.n, pair: { bg: p.bg, fg: p.fg }, name: p.name }));
}

async function main(argv: string[]): Promise<number> {
  const color = (argAfter(argv, "--color") ?? "truecolor") as Color;
  const width = Number.parseInt(argAfter(argv, "--width") ?? "80", 10) || 80;
  const rungs = argAfter(argv, "--rungs");
  const file = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--color" &&
    argv[i - 1] !== "--width" && argv[i - 1] !== "--rungs");

  const pairs = rungs
    ? rungs.split(",").map((s) => {
        const n = Number.parseInt(s.trim(), 10);
        const p = PAIRS.find((x) => x.n === n);
        if (!p) throw new Error(`no rung ${n} — the ladder is ${PAIRS.map((x) => x.n).join(", ")}`);
        return { rung: p.n, pair: { bg: p.bg, fg: p.fg }, name: p.name };
      })
    : defaultPairs();

  const source = file ? await Bun.file(file).text() : SPECIMEN;
  for (const patch of await fgpPatches(source, pairs, width, color)) {
    console.log(`\n${patch.header}`);
    for (const line of patch.lines) console.log(line);
  }
  return 0;
}

if (import.meta.main) {
  main(process.argv.slice(2)).then((code) => process.exit(code));
}
