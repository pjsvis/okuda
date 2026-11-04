#!/usr/bin/env bun
// ── font-coverage.ts — the codepoints we emit, against the fonts that draw them ──
//
//  The renderer emits glyphs it cannot draw. `\vec{g}` rewrites to `g` + U+20D7
//  (`src/render.ts:1649`) and `\propto` to U+221D (`:1635`), and no monospace face
//  on either of this silo's machines carries either codepoint. Measured 2026-11-04
//  after the operator reported *the parens should include a g with an arrow above
//  it*, and the diagnosis is worth keeping in front of the reader because it is
//  not obvious: **a combining mark cannot be borrowed from a fallback face.**
//  Ghostty falls back per codepoint, so the arrow arrives from Noto Sans Math or
//  Arial Unicode as a *spacing* glyph and lands beside the `g`. Fallback fixes a
//  missing glyph; it cannot fix a missing mark, because a mark positions only over
//  a base drawn by the same font. The fallback also paints a cell okuda counted as
//  zero (`src/width.ts:155`, `:252`), so the right edge goes ragged by one column
//  wherever the mark appears.
//
//  ## Two readings, two questions
//
//  1. **primary** — does the glass's own face contain what we emit? This is the
//     defect class: the codepoints the reader's terminal cannot draw in its main
//     font, named with the page that uses them.
//  2. **common** — what is common to every installed monospace? The
//     authoring-safe set: what okuda may emit without imposing a font
//     requirement. Its complement is a precondition to state, not an accident.
//
//  ## What is derived, and what that buys
//
//  Both halves are derived, which is the whole point — a hand table of "safe
//  codepoints" is a *specified* structure that records what someone already knew
//  and drifts the moment a face changes. The emitted set is whatever the corpus
//  *renders to*; the coverage is whatever the machine's fonts *are*. So the
//  instrument cannot disagree with the thing it describes.
//
//  The corpus is the repository's own demo pages: they are what the renderer is
//  for, and a page added to the demo set enters the reading by being there.
//
//  ## The boundary, stated where the number is printed
//
//  The intersection is common to **the monospace faces this machine has**, which
//  is the checkable claim. "Common to all fonts" is not checkable and would be a
//  lie wearing the word *all*: it is a floor for the faces measured, not a
//  prediction about the next one. Same discipline as the ground readings — a map,
//  and the edge of the map drawn on it.
//
//  ## Why this is not a gate
//
//  `--gate` exists, and `just check` does not use it. The condition is a fact
//  about a host, not about the tree: a runner has no font set and a machine whose
//  primary lacks a mark would go red for a reason no commit can fix. A reading
//  the principal can run, like `just surface-probe` — not a verdict on a diff.
//
//  Usage:
//    bun scripts/font-coverage.ts                 # this machine
//    bun scripts/font-coverage.ts host            # fonts over ssh, judged here
//    bun scripts/font-coverage.ts --family "JetBrainsMono Nerd Font"
//    bun scripts/font-coverage.ts --json
//    bun scripts/font-coverage.ts --gate          # exit 1 if the primary misses any
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { stripANSI } from "../src/width.ts";
import { PLAIN_SYMBOLS } from "../src/render.ts";

/** The pages whose render is the corpus — the repository's own demos, plus the
 *  current index (tables, addresses, rules) and the maths page (maths, tables).
 *  Adding a demo page to the facade adds it here, and the reading follows. */
export const CORPUS = [
  "docs/style-guide.md",
  "docs/showcase.md",
  "docs/state-colours.md",
  "docs/2026-10-30-server-blades-in-space.md",
  "&briefs.md",
];

/** Families that are never a terminal face and would poison the intersection
 *  with their absence: the last-resort box, emoji, symbol and invented scripts.
 *  A deny list, not an allow list — a new mono face should join the reading by
 *  being installed, not by being blessed here. */
const NOT_A_TERMINAL_FACE = /lastresort|emoji|symbol|signwriting|unifont|webdings|wingdings|dingbat/i;

export type Ranges = Array<[number, number]>;

/** fontconfig's `%{charset}`: space-separated hex codepoints and `a-b` ranges.
 *  Pure. Tolerates newlines and stray whitespace, because the same value arrives
 *  from a local call and from `ssh`. */
export function parseCharset(text: string): Ranges {
  const out: Ranges = [];
  for (const token of text.trim().split(/\s+/)) {
    if (!token) continue;
    const m = /^([0-9a-f]+)(?:-([0-9a-f]+))?$/i.exec(token);
    if (!m) continue;
    const lo = Number.parseInt(m[1]!, 16);
    const hi = m[2] === undefined ? lo : Number.parseInt(m[2], 16);
    if (Number.isFinite(lo) && Number.isFinite(hi) && hi >= lo) out.push([lo, hi]);
  }
  return out;
}

/** Is this codepoint in a parsed charset? Pure. Linear over the ranges, which is
 *  a hundred scans for a face and a few thousand for a whole palette of them. */
export function hasCodepoint(ranges: Ranges, cp: number): boolean {
  for (const [lo, hi] of ranges) if (cp >= lo && cp <= hi) return true;
  return false;
}

export interface Emitted {
  cp: number;
  /** How many times the corpus emits it — the ordering that makes a list readable. */
  uses: number;
  /** The first sighting, in context: derived, so it cannot drift from the corpus
   *  the way a codepoint-name table would. */
  example: string;
  /** A combining mark positions only over a base in the *same* font. */
  combining: boolean;
}

/** Every non-ASCII codepoint in rendered text, with its uses and first example.
 *  Pure. ANSI escapes are ASCII and fall out for free. */
export function emittedCodepoints(text: string): Map<number, Emitted> {
  const seen = new Map<number, Emitted>();
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const cp = ch.codePointAt(0)!;
    if (cp < 0x80) continue;
    const found = seen.get(cp);
    if (found) {
      found.uses++;
      continue;
    }
    // The example: the grapheme cluster this codepoint sits in, plus a little
    // prose either side, so the reader sees the glyph doing its job.
    const before = chars.slice(Math.max(0, i - 12), i).join("");
    const cluster = ch + (chars[i + 1] && /\p{M}/u.test(chars[i + 1]!) ? chars[i + 1]! : "");
    const after = chars.slice(i + 1 + (cluster.length - 1), i + 13).join("");
    seen.set(cp, {
      cp,
      uses: 1,
      example: `${before}${cluster}${after}`.replace(/\s+/g, " ").trim(),
      combining: /\p{M}/u.test(ch),
    });
  }
  return seen;
}

/** The intersection, in the order the first face lists them. Pure. */
export function commonAcross(sets: number[][]): number[] {
  if (sets.length === 0) return [];
  return sets[0]!.filter((cp) => sets.every((s) => s.includes(cp)));
}

/** The codepoints a face does not carry, ordered by the caller's priority. Pure. */
export function missingFrom(ranges: Ranges, cps: number[]): number[] {
  return cps.filter((cp) => !hasCodepoint(ranges, cp));
}

/** The population question, answered by a property rather than a list: a face
 *  that cannot set `The quick brown fox` cannot be anybody's terminal font, so
 *  basic Latin is the admission test. Without it the intersection is taken over
 *  CJK-only and decorative faces whose absence says nothing about the grid. */
const BASIC_LATIN: Ranges = [[0x20, 0x7e]];

export function isTerminalCandidate(face: Face): boolean {
  for (let cp = 0x20; cp <= 0x7e; cp++) if (!hasCodepoint(face.charset, cp)) return false;
  return true;
}

/** Range intersection. Pure. */
export function intersectRanges(a: Ranges, b: Ranges): Ranges {
  const out: Ranges = [];
  for (const [alo, ahi] of a) {
    for (const [blo, bhi] of b) {
      const lo = Math.max(alo, blo);
      const hi = Math.min(ahi, bhi);
      if (lo <= hi) out.push([lo, hi]);
    }
  }
  return out;
}

/** A family, and what **every** style it ships covers. The intersection is the
 *  conservative reading and the right one for a safety claim: a mark that only
 *  the italic has is a mark the reader may not see. */
export interface Family {
  name: string;
  files: string[];
  charset: Ranges;
}

/** Group faces into families, intersecting within each. Pure. */
export function familyOf(sets: Face[]): Family[] {
  const by = new Map<string, Face[]>();
  for (const f of sets) {
    const name = f.family.split(",")[0]!.trim();
    const bucket = by.get(name);
    if (bucket) bucket.push(f);
    else by.set(name, [f]);
  }
  return [...by.entries()].map(([name, fs]) => ({
    name,
    files: fs.map((f) => f.file),
    charset: fs.map((f) => f.charset).reduce(intersectRanges),
  }));
}

export interface Face {
  file: string;
  family: string;
  charset: Ranges;
}

const hex = (cp: number): string => `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;

/** Run a command locally, or over ssh when a host is named. Read-only on both
 *  paths: the machine supplies its font list and nothing is written anywhere. */
function collect(target: string | null, command: string): string | null {
  try {
    if (target === null) return execFileSync("bash", ["-lc", command], { encoding: "utf8" });
    return execFileSync("ssh", [target, command], { encoding: "utf8" });
  } catch {
    return null;
  }
}

/** The platform directories fontconfig may not index — measured, not guessed:
 *  on macOS `fc-list` does not see `~/Library/Fonts`, which is how FiraCode NF
 *  and JetBrainsMono NF escaped the first query on 2026-11-04. */
/** The directories fontconfig may not have indexed — a font added before a cache
 *  rebuild is invisible to `fc-list`. Measured 2026-11-04: on this Mac fontconfig
 *  *does* see `~/Library/Fonts` (2852 indexed paths), so this list is a guard
 *  against staleness, not a platform quirk. */
function looseFontDirs(target: string | null): string[] {
  const home = target === null ? homedir() : "$HOME";
  return [
    `${home}/Library/Fonts`,
    "/Library/Fonts",
    "/System/Library/Fonts",
    `${home}/.fonts`,
    `${home}/.local/share/fonts`,
    "/usr/share/fonts",
  ];
}

/** Font files in those directories, on this machine or the remote one. One call
 *  either way: a `find` over ssh, a recursive read locally. */
function looseFontFiles(target: string | null): string[] {
  const dirs = looseFontDirs(target);
  if (target !== null) {
    const script = dirs
      // No `\( … \)` group: it survives one shell and not two (measured — the
      // remote run printed a syntax error and found nothing, 2026-11-04). A
      // `grep` filter is portable to both find implementations, and the batch
      // `fc-query` below is what keeps this to one connection.
      .map((d) => `[ -d "${d}" ] && find "${d}" -maxdepth 3 -type f 2>/dev/null | grep -Ei '\\.(ttf|otf|ttc)$'`)
      .join("; ");
    const out = collect(target, `${script}; true`);
    return (out ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  }
  const files: string[] = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    try {
      for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !/\.(ttf|otf|ttc)$/i.test(entry.name)) continue;
        files.push(join(entry.parentPath ?? dir, entry.name));
      }
    } catch {
      /* an unreadable directory is not a verdict, and not a pass either */
    }
  }
  return files;
}

/** `fc-query` over every file in one invocation — it takes many paths and prints
 *  one line per face. Batching matters: the first cut spawned a process per file,
 *  and over ssh that was one connection per font (the run aborted, 2026-11-04). */
function queryFiles(target: string | null, files: string[]): Face[] {
  if (files.length === 0) return [];
  const listed = files.map((f) => JSON.stringify(f)).join(" ");
  const out = collect(target, `fc-query -f '%{file}\t%{family}\t%{spacing}\t%{charset}\n' ${listed}`);
  const faces: Face[] = [];
  for (const line of (out ?? "").split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("\t");
    if (parts.length < 4) continue;
    const file = parts[0]!;
    const spacing = Number.parseInt(parts[2]!, 10);
    if (spacing !== 100 && spacing !== 110) continue; // mono / charcell only
    const family = parts.slice(1, -1).join("\t");
    if (NOT_A_TERMINAL_FACE.test(family)) continue;
    faces.push({ file, family, charset: parseCharset(parts[parts.length - 1]!) });
  }
  return faces;
}

export function faces(target: string | null): { faces: Face[]; viaFcList: number; viaDirs: number } {
  const listed = collect(target, `fc-list :spacing=mono --format '%{file}\t%{family}\t%{charset}\n'`);
  const out: Face[] = [];
  const known = new Set<string>();
  for (const line of (listed ?? "").split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("\t");
    if (parts.length < 3) continue;
    const file = parts[0]!;
    const charset = parts[parts.length - 1]!;
    const family = parts.slice(1, -1).join("\t");
    if (NOT_A_TERMINAL_FACE.test(family)) continue;
    known.add(file);
    out.push({ file, family, charset: parseCharset(charset) });
  }
  const viaFcList = out.length;

  // The directories fontconfig had not indexed. Only files it did not already
  // report are queried, so the extra cost is the handful the index is blind to.
  const extra = queryFiles(
    target,
    looseFontFiles(target).filter((f) => !known.has(f)),
  );
  return { faces: [...out, ...extra], viaFcList, viaDirs: extra.length };
}

/** The face the glass actually uses, read from the terminal's own config — the
 *  same discipline as `probe-surface.ts`: the machine supplies its files. */
export function configuredFamily(target: string | null): { family: string; from: string } | null {
  const paths = [
    ".config/ghostty/config",
    "Library/Application Support/com.mitchellh.ghostty/config.ghostty",
    "Library/Application Support/com.mitchellh.ghostty/config",
    ".config/kitty/kitty.conf",
    ".config/alacritty/alacritty.toml",
  ];
  for (const rel of paths) {
    const text =
      target === null
        ? (() => {
            const p = join(homedir(), rel);
            return existsSync(p) ? readFileSync(p, "utf8") : null;
          })()
        : collect(target, `cat "$HOME/${rel}" 2>/dev/null`);
    if (!text) continue;
    for (const line of text.split("\n")) {
      if (/^\s*#/.test(line)) continue;
      const m = /^\s*font-family\s*=\s*"?([^"\n]+)"?/.exec(line) ?? /^\s*font_family\s+(.+)$/.exec(line);
      if (m?.[1]) return { family: m[1].trim(), from: rel };
    }
  }
  return null;
}

/** A configured name against fontconfig's comma-joined families. Pure. Loose on
 *  purpose: `JetBrainsMono Nerd Font` and `JetBrainsMono NF` are one face family
 *  under two spellings, and refusing to match them would report no primary on a
 *  machine that plainly has one. */
export function matchFamily(wanted: string, names: string[]): string[] {
  const norm = (s: string): string => s.toLowerCase().replace(/\s+/g, " ").trim();
  const want = norm(wanted);
  const exact = names.filter((n) => norm(n) === want);
  if (exact.length > 0) return exact;
  return names.filter((n) => norm(n).includes(want) || want.includes(norm(n)));
}

export interface Report {
  target: string;
  corpus: string[];
  /** Every emitted codepoint, most-used first. */
  emitted: Emitted[];
  /** The files measured: monospace, and able to set basic Latin. */
  faces: Face[];
  /** The same, collapsed to families — the unit the readings are taken over. */
  families: Family[];
  viaFcList: number;
  viaDirs: number;
  primary: {
    family: string;
    from: string;
    /** Every style the family ships, intersected — the worst case. */
    missing: number[];
    covered: number;
    /** The most complete single face in the family, and how it differs. A family
     *  is not one charset: measured 2026-11-04, Menlo Regular draws the grid and
     *  Menlo Bold does not, so the intersection reports 47/64 where the face a
     *  reader actually reads prose in reports 61/64. One number would hide that,
     *  and hiding it is the failure class this instrument exists to catch. */
    best: { file: string; covered: number; missing: number[] } | null;
    files: string[];
  } | null;
  /** The authoring-safe set: common to every terminal-candidate family measured. */
  common: { families: number; ok: number; notCommon: Array<{ cp: number; missingIn: number }> };
}

export function report(target: string | null, opts: { family?: string; allFaces?: boolean } = {}): Report {
  // Stripped first: the render carries SGR, and an example sliced out of an
  // escape sequence is noise wearing a glyph's clothes (found by running it).
  const text = stripANSI(renderCorpus());
  const emittedMap = emittedCodepoints(text);
  const emitted = [...emittedMap.values()].sort((a, b) => b.uses - a.uses || a.cp - b.cp);
  const cps = emitted.map((e) => e.cp);

  const found = faces(target);
  // The population is a property, not a list: monospace (from fontconfig's own
  // spacing) and able to set basic Latin. `--all-faces` drops the property and
  // measures the soup, which is what the first cut did — and it read 0/65 common,
  // a true answer to a question nobody asked.
  const measured = found.faces.filter((f) => opts.allFaces || isTerminalCandidate(f));
  const fams = familyOf(measured);

  const configured = opts.family ? { family: opts.family, from: "--family" } : configuredFamily(target);
  let primary: Report["primary"] = null;
  if (configured) {
    const names = matchFamily(
      configured.family,
      fams.map((f) => f.name),
    );
    const matched = fams.filter((f) => names.includes(f.name));
    if (matched.length > 0) {
      // A family's charset is already the intersection of its styles, so this is
      // the worst case: a mark absent from the slab you are reading is absent.
      const charset = matched.map((f) => f.charset).reduce(intersectRanges);
      const missing = missingFrom(charset, cps);
      const scored = measured
        .filter((f) => names.includes(f.family.split(",")[0]!.trim()))
        .map((f) => ({ file: f.file.split("/").pop() ?? f.file, miss: missingFrom(f.charset, cps) }))
        .sort((a, b) => a.miss.length - b.miss.length);
      const best = scored[0]
        ? { file: scored[0].file, covered: cps.length - scored[0].miss.length, missing: scored[0].miss }
        : null;
      primary = {
        family: configured.family,
        from: configured.from,
        missing,
        covered: cps.length - missing.length,
        best,
        files: matched.flatMap((f) => f.files).map((f) => f.split("/").pop() ?? f),
      };
    }
  }

  const sets = fams.map((f) => cps.filter((cp) => hasCodepoint(f.charset, cp)));
  const common = commonAcross(sets);
  const notCommon = cps
    .filter((cp) => !common.includes(cp))
    .map((cp) => ({
      cp,
      missingIn: fams.filter((f) => !hasCodepoint(f.charset, cp)).length,
      uses: emittedMap.get(cp)?.uses ?? 0,
    }))
    .sort((a, b) => b.missingIn - a.missingIn || b.uses - a.uses || a.cp - b.cp)
    .map(({ cp, missingIn }) => ({ cp, missingIn }));

  return {
    target: target ?? "this machine",
    corpus: CORPUS,
    emitted,
    faces: measured,
    families: fams,
    viaFcList: found.viaFcList,
    viaDirs: found.viaDirs,
    primary,
    common: { families: fams.length, ok: common.length, notCommon },
  };
}

/** Render the corpus through the *source* entry point, not the built binary: a
 *  stale `./okuda` must not be able to lie about what the tree emits. */
function renderCorpus(): string {
  const parts: string[] = [];
  for (const file of CORPUS) {
    if (!existsSync(file)) continue;
    try {
      parts.push(
        execFileSync("bun", ["bin/okuda.ts", "--width", "100", file], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }),
      );
    } catch {
      /* a page that fails to render is not evidence about fonts */
    }
  }
  return parts.join("\n");
}

function textOf(r: Report): string {
  const glyph = (cp: number): string => String.fromCodePoint(cp);
  const out: string[] = [];
  out.push(`fonts — ${r.target}   corpus ${r.corpus.length} pages · ${r.emitted.length} codepoints`);
  out.push(
    `faces ${r.faces.length} monospace files in ${r.families.length} families` +
      ` (${r.viaFcList} via fontconfig, ${r.viaDirs} from directories it had not indexed)`,
  );
  out.push("");

  const byCp = new Map(r.emitted.map((e) => [e.cp, e]));
  const line = (cp: number, tail: string): string => {
    const e = byCp.get(cp);
    return `  ${hex(cp)}  ${glyph(cp)}  ${String(e?.uses ?? 0).padStart(4)} use(s)  ${tail}`;
  };

  if (r.primary === null) {
    out.push("primary   not read — no font family is configured on this machine,");
    out.push("          so the glass is using a default this instrument cannot name. Pass --family.");
  } else {
    out.push(`primary   ${r.primary.family}   (from ${r.primary.from})`);
    const b = r.primary.best;
    if (b && b.covered > r.primary.covered) {
      out.push(
        `  covers ${b.covered}/${r.emitted.length} in ${b.file}; ${r.primary.covered}/${r.emitted.length}` +
          ` with every style it ships (a style lacks ${r.primary.missing.length - b.missing.length} more)`,
      );
    } else {
      out.push(`  covers ${r.primary.covered}/${r.emitted.length}`);
    }
    if (r.primary.missing.length === 0) {
      out.push("  nothing missing — the face draws everything we emit.");
    } else {
      out.push(`  MISSING ${r.primary.missing.length}:`);
      for (const cp of r.primary.missing) {
        const e = byCp.get(cp);
        out.push(line(cp, e?.combining ? "combining — a fallback cannot supply it" : "") + (e ? `\n        e.g. ${e.example}` : ""));
      }
    }
  }
  out.push("");

  out.push(
    `common    ${r.common.ok}/${r.emitted.length} across all ${r.common.families} terminal-candidate famil${r.common.families === 1 ? "y" : "ies"} — the authoring-safe set here`,
  );
  if (r.common.notCommon.length > 0) {
    out.push("  not common, worst first:");
    for (const { cp, missingIn } of r.common.notCommon.slice(0, 20)) {
      out.push(line(cp, `missing in ${missingIn}/${r.common.families}`));
    }
    if (r.common.notCommon.length > 20) out.push(`  … and ${r.common.notCommon.length - 20} more (--json)`);
  }
  out.push("");
  // The escape hatch, stated where the deficit is: how much of what this machine
  // cannot draw would plain mode translate (`BRF-SYMBOL-PLAIN`).
  const translated = r.emitted.filter((e) => PLAIN_SYMBOLS.some(([k]) => k === String.fromCodePoint(e.cp)));
  out.push(
    `plain     ${translated.length}/${r.emitted.length} codepoint(s) translate to ASCII (--symbols=plain);` +
      ` the rest — box drawing, blocks, Braille, Latin-1, punctuation — are kept`,
  );
  out.push("");
  out.push("boundary: an intersection is a floor for these faces, not a claim about the next one.");
  return out.join("\n");
}

function main(argv: string[]): number {
  const json = argv.includes("--json");
  const gate = argv.includes("--gate");
  const allFaces = argv.includes("--all-faces");
  const familyAt = argv.indexOf("--family");
  const family = familyAt >= 0 ? argv[familyAt + 1] : undefined;
  const target = argv.find((a, i) => !a.startsWith("--") && (familyAt < 0 || i !== familyAt + 1)) ?? null;

  const probe = collect(target, "command -v fc-list >/dev/null && command -v fc-query >/dev/null && echo ok");
  if (probe === null || !probe.includes("ok")) {
    const where = target ?? "this machine";
    console.error(
      `font-coverage: no fontconfig (fc-list/fc-query) on ${where} — the instrument cannot run.\n` +
        `  This is exit 2, not a verdict: a missing instrument is not a passing reading.`,
    );
    return 2;
  }

  const r = report(target, { family, allFaces });
  if (json) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.log(textOf(r));
  }
  if (gate && r.primary !== null && r.primary.missing.length > 0) return 1;
  return 0;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
