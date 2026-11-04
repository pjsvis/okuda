#!/usr/bin/env bun
// ── contrast.ts — the ground the reader reads on ─────────────────────
//
//  ADR-GLASS-INK-073 puts absolute luminance with the terminal. This script
//  does not argue with that; it is what a principal needs to *set* it well:
//  a short list of foreground/background pairs, and the two numbers that make
//  the choice checkable rather than a matter of taste.
//
//  Why these pairs and not a thousand: okuda's role hexes are fixed, so a
//  ground is admissible only if they all survive on it. The `muted` role
//  (#445566 — horizontal rules, table pipes) is the binding constraint: it is
//  the darkest structural ink in the palette, so a ground that is too light
//  erases the rules while prose stays perfectly legible. That is the failure
//  this instrument exists to catch, and it is why the list deepens rather than
//  lifts.
//
//  The two measures:
//    ratio  — WCAG 2.0 contrast, the shared currency (1–21)
//    L      — OKLCH lightness of the ink, the perceptual scale
//  A ratio is a poor proxy for halation; L is not. Read both.
//
//  Usage: `just contrast` (or `bun scripts/contrast.ts`, `--json`).
//  The doc's numbers are pinned against this file by tests/contrast.test.ts.

import { DRACULA_PALETTE, type Palette } from "../src/palette";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface Pair {
  /** The rung's number. `0` is the control: the terminal's shipped default. */
  n: number;
  /** What the rung is for, in three or four words. */
  name: string;
  bg: string;
  fg: string;
  /** A rung the reader should skip, with the reason stated in the doc. */
  refused?: string;
}

/** The set, in the order a reader should try them. */
export const PAIRS: Pair[] = [
  { n: 0, name: "control — Ghostty's default", bg: "#282c34", fg: "#ffffff" },
  { n: 1, name: "ink off-white", bg: "#282c34", fg: "#dcdfe4" },
  { n: 2, name: "ink softer", bg: "#282c34", fg: "#cfd3d8" },
  { n: 3, name: "ink grey, evening only", bg: "#282c34", fg: "#b8bcc2" },
  { n: 4, name: "ground deeper", bg: "#23272e", fg: "#c8ccd4" },
  { n: 5, name: "deep and dim, night or OLED", bg: "#1b1e24", fg: "#a9aeb8" },
  { n: 6, name: "warm ground, cream ink", bg: "#262320", fg: "#d6cfc4" },
  {
    n: 7,
    name: "lifted ground — do not use",
    bg: "#343a45",
    fg: "#d4d8de",
    // Refused on a report from the glass, not from this script: the ground
    // reads as an *emitted light* — "glowing background sitting over the
    // viewport like a glare reflection". On an emissive display a large area of
    // grey is a lit rectangle, not an absence of light, and lifting it toward
    // the surround makes it figure instead of ground. The rules measurement is
    // the corroboration, not the cause: this is also the weakest structure in
    // the set (`muted` 1.49, the ground-to-muted gap the smallest of any rung).
    refused: "reads as emitted light — rules 1.49, the weakest here",
  },
  { n: 8, name: "ground deeper still — best so far", bg: "#221f1c", fg: "#d6cfc4" },
  { n: 9, name: "deeper again — the floor test", bg: "#1c1a17", fg: "#d6cfc4" },
];

const hex2rgb = (h: string): [number, number, number] => {
  const s = h.replace("#", "");
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
};

/** Linear-light relative luminance, WCAG 2.0. */
const lin = (c: number): number => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

export const luminance = (hex: string): number => {
  const [r, g, b] = hex2rgb(hex).map(lin) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2.0 contrast ratio, 1–21. Order-free. */
export const ratio = (a: string, b: string): number => {
  const ya = luminance(a);
  const yb = luminance(b);
  const [hi, lo] = ya > yb ? [ya, yb] : [yb, ya];
  return (hi + 0.05) / (lo + 0.05);
};

/** OKLCH lightness (the L of `oklch(L C H)`), via sRGB → linear → LMS → Lab. */
export const oklchL = (hex: string): number => {
  const [r, g, b] = hex2rgb(hex).map(lin) as [number, number, number];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
};

/** The okuda preset's own roles, read from the shipped palette file so the
 *  instrument cannot drift from the thing it is judging. */
export const okudaPalette = (): Palette =>
  JSON.parse(
    readFileSync(join(import.meta.dir, "..", "src", "palettes", "okuda.json"), "utf8"),
  ) as Palette;

/** The roles whose survival a ground must not cost: structure, then the two
 *  loudest declarative roles. */
export const WATCHED = ["muted", "diagram-border", "heading", "state-todo"] as const;

export interface Row {
  n: number;
  name: string;
  bg: string;
  fg: string;
  ratio: number;
  lBg: number;
  lFg: number;
  /** Each watched role's ratio against this ground. */
  watched: Record<string, number>;
  /** `muted` as a fraction of the ink's contrast: below 1 the hierarchy holds
   *  (a rule never out-shouts prose). */
  ruleShare: number;
  refused?: string;
}

export function rows(): Row[] {
  const p = okudaPalette();
  return PAIRS.map((pair) => {
    const watched = Object.fromEntries(
      WATCHED.map((r) => [r, ratio(p[r] ?? "#000000", pair.bg)]),
    );
    const ink = ratio(pair.fg, pair.bg);
    return {
      n: pair.n,
      name: pair.name,
      bg: pair.bg,
      fg: pair.fg,
      ratio: ink,
      lBg: oklchL(pair.bg),
      lFg: oklchL(pair.fg),
      watched,
      ruleShare: (watched["muted"] ?? 0) / ink,
      refused: pair.refused,
    };
  });
}

/** One rung, as the page states it — a single line whose fields are atomic, so
 *  it wraps at a separator and never inside a number. Rendered here and
 *  asserted verbatim by the test: the page cannot drift from the measurement. */
export function rungLine(r: Row): string {
  const mark = r.refused ? " ✗" : "";
  return (
    `**${r.n} · ${r.name}**${mark} · \`${r.bg}\` / \`${r.fg}\` · ` +
    `${r.ratio.toFixed(1)}:1 · L ${r.lFg.toFixed(3)} · ` +
    `rules ${(r.watched["muted"] ?? 0).toFixed(2)} · share ${r.ruleShare.toFixed(2)}`
  );
}

/** The paste block: a whole Ghostty fragment, every line commented, so pasting
 *  it is a no-op until the reader uncomments exactly one pair. Rendered from
 *  PAIRS — the page and the `.conf` are both checked against this, so there is
 *  one source and two renderings, never two hand-typed copies. */
export function configFile(pairs: Pair[] = PAIRS): string {
  const pad = (s: string, n: number): string => s.padEnd(n);
  const out: string[] = [];
  // Every line is kept to PASTE_LINE columns. A config file is pasted, not read,
  // and a code fence ELIDES at the glass — so a long comment line arrives in the
  // reader's editor with its tail replaced by `…`. Measured 2026-10-28: the
  // operator copied this block out of a render and the comments came back elided.
  // The mark of damage was honest; the shape was wrong. A narrow artefact cannot
  // be damaged at any sane pane width, so the shape is the fix, not a warning.
  out.push("# okuda · the ground you read on");
  out.push("#");
  out.push("# PASTE ME: `just ground` — not a copy of a render.");
  out.push("# Every line here is a comment; uncomment exactly ONE pair");
  out.push("# (`background` + `foreground`), then reload:");
  out.push("#   macOS  cmd+shift+,    Linux  ctrl+shift+,");
  out.push("# Two pairs do not compare: the later key wins silently.");
  out.push("# `foreground =` with no value resets to the default.");
  out.push("#");
  out.push("# The ground is the lever, not the ink: every ink-only rung");
  out.push("# (1-3) was rejected as the prose receding; every deepened");
  out.push("# ground was kept. 8 is the best so far. Ground L below");
  out.push("# ~0.27 stops reading as a lit panel; above ~0.29 it competes");
  out.push("# with the room, which is why 7 glows.");
  out.push("#");
  out.push("# figures for every rung: just contrast");
  out.push("#   n  bg / fg                 what it is");
  for (const r of rows()) {
    out.push(
      `#   ${pad(String(r.n), 3)}${pad(`${r.bg} / ${r.fg}`, 22)}${r.name}` +
        (r.refused ? " ✗" : ""),
    );
  }
  out.push("#");
  out.push("# why:  docs/2026-10-28-the-ground-you-read-on.md");
  out.push("# made: scripts/contrast.ts (just contrast)");
  out.push("#       ADR-GLASS-INK-073");
  out.push("#");
  out.push("# Second dial, and it is okuda's, not the terminal's:");
  out.push('# { "body": "#cfd3d8" } in ~/.config/okuda/palette.json');
  for (const p of pairs) {
    out.push("");
    out.push(`# ${p.n} — ${p.name}${p.refused ? " ✗" : ""}`);
    if (p.refused) out.push(`#     ${p.refused}`);
    out.push(`# background = ${p.bg}`);
    out.push(`# foreground = ${p.fg}`);
  }
  return out.join("\n");
}

// ── The surface pair, checked (BRF-SURFACE-PAIR) ──────────────────────
//  Two readings, because a page can fail in two disjoint ways and the first
//  instrument only saw one of them:
//
//    READABLE   every role clears a floor against the GROUND it is painted on.
//               Fails on a light ground: measured 2026-11-01, on #ffffff,
//               sixteen of twenty-three roles sit under 3:1 — `state-todo` at
//               1.30:1, `heading` at 1.69:1 — and the page is a ghost.
//    NAVIGABLE  no role that annotates prose out-ranks the INK. Fails on a
//               dimmer ink: atom-one-dark's #abb2bf crosses twelve roles.
//
//  They are disjoint on purpose-adjacent grounds: a white ground reports
//  `ordered` (nothing crosses a black ink) while being unreadable, which is the
//  false negative that made this brief necessary. One verdict, both questions,
//  because a person at a terminal needs one answer and not a diagram.

/** The floor a role must clear against the ground. **3:1**, and it is a chosen
 *  constant rather than a derived one: it is the accessible minimum for
 *  non-text marks, and below it a structural mark stops being distinguishable
 *  from the ground at a glance — which is the whole job of `muted` (rules,
 *  table pipes) and of the state glyphs. Named so a future reader can argue with
 *  the number instead of hunting a literal. */
export const FLOOR = 3;

/** Roles that are **not painted on the ground**, and so cannot be measured
 *  against it. Both were found by the control, not by argument: the reference
 *  pair failed the floor on exactly these two, and the answer was not to lower
 *  the floor.
 *
 *  - `badge-fg` is black ink on `badge-bg` (amber). Its partner is in the
 *    palette; the ground is irrelevant to it.
 *  - `muted` is the structural ink — rules, table pipes — and its job is to be
 *    quiet. The ground page treats 2.0–2.3 on a good ground as the accepted
 *    band and names it the *binding constraint* that chooses grounds
 *    (`docs/2026-10-28-the-ground-you-read-on.md`), so a 3:1 floor here would
 *    refuse every ground the palette was designed for. */
export const NOT_ON_GROUND: Readonly<Record<string, string>> = {
  "badge-fg": "painted on badge-bg, never on the ground",
  muted: "structural — deliberately quiet; the ground page's binding constraint",
};

export interface FloorRow {
  role: string;
  hex: string;
  ratio: number;
  /** Measured against the ground, or exempt with a reason. */
  onGround: boolean;
}

/** Every palette role's contrast against the ground, with the two exemptions
 *  marked rather than hidden. Pure. */
export function floor(ground: string, palette: Palette = okudaPalette()): FloorRow[] {
  return Object.entries(palette)
    .filter(([, v]) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v as string))
    .map(([role, v]) => ({
      role,
      hex: v as string,
      ratio: ratio(v as string, ground),
      onGround: !(role in NOT_ON_GROUND),
    }))
    .sort((a, b) => a.ratio - b.ratio);
}

export interface SurfaceVerdict {
  pair: { bg: string; fg: string };
  ink: number;
  belowFloor: FloorRow[];
  crossed: RankShift[];
  readable: boolean;
  navigable: boolean;
}

/** The whole answer: both readings over one pair, against the reference. Pure.
 *  `ordered` is the ranking's verdict; `readable` is the floor's. */
export function surfaceVerdict(
  pair: { bg: string; fg: string },
  refPair: { bg: string; fg: string } = referencePair(),
): SurfaceVerdict {
  const ranked = compareRanking(refPair, pair);
  const measured = floor(pair.bg);
  const belowFloor = measured.filter((r) => r.onGround && r.ratio < FLOOR);
  return {
    pair,
    ink: ratio(pair.fg, pair.bg),
    belowFloor,
    crossed: ranked.filter((r) => r.crossed),
    readable: belowFloor.length === 0,
    navigable: ranked.every((r) => !r.crossed),
  };
}

/** Does this pair fail the requirement? The one predicate `--gate` asks, kept
 *  pure so the check can be tested without a process. */
export function surfaceFails(v: SurfaceVerdict): boolean {
  return !(v.readable && v.navigable);
}

export interface GateRow {
  n: number;
  name: string;
  pair: { bg: string; fg: string };
  /** The rung the ground page refuses, with its reason — reported, never gated:
   *  a pair refused for glare cannot fail a legibility gate meaningfully. */
  refused?: string;
  verdict: SurfaceVerdict;
  fails: boolean;
}

/** **Every admissible rung, not the reference one.** A gate that checks the rung
 *  okuda recommends today is a check covering a tenth of the claim: the palette is
 *  one set of relations and every rung in `PAIRS` is a ground a principal may
 *  actually sit at. A role hex that breaks rung 3 fails the build here, which is
 *  the point — the recommended pair is a *sample*, not the surface.
 *
 *  Rungs the ground page refuses are carried with their reason and excluded from
 *  `gateFails`: rung 7 is refused for reading as emitted light, and a legibility
 *  verdict on it would answer a question nobody asked. Pure. */
export function gateRows(pairs: Pair[] = PAIRS, refPair: { bg: string; fg: string } = referencePair()): GateRow[] {
  return pairs.map((p) => {
    const verdict = surfaceVerdict({ bg: p.bg, fg: p.fg }, refPair);
    return {
      n: p.n,
      name: p.name,
      pair: { bg: p.bg, fg: p.fg },
      refused: p.refused,
      verdict,
      fails: surfaceFails(verdict),
    };
  });
}

/** The gate's two requirements, and they are deliberately different tests.
 *
 *  1. **The floor holds on every admissible rung.** Readability is a floor: a
 *     palette hex that cannot be read on *any* ground a principal may sit at is
 *     drift, and it fails the build. This is what "gate every rung" buys.
 *  2. **The order holds on the recommended rung.** Navigability is not a floor —
 *     it is a property of the pair you sit at, and the ladder deliberately
 *     contains dimmer inks whose cost is recorded in its own verdicts. Measured
 *     2026-11-04: rungs 3, 4 and 5 have accents out-ranking the ink (3, 1 and 12
 *     roles), so a gate that demanded order everywhere would fail on a document
 *     nobody has revised yet, and a red build is not a finding. The reference rung
 *     is the one okuda recommends, so the "blown-out page" failure is caught there.
 *
 *  The inverted rungs are *reported*, never hidden — see `gateText`. Pure. */
export function gateFails(rows: GateRow[], referenceRung: number = REFERENCE_RUNG): boolean {
  const floorBroken = rows.some((r) => !r.refused && !r.verdict.readable);
  const ref = rows.find((r) => r.n === referenceRung);
  const orderBroken = ref !== undefined && !ref.verdict.navigable;
  return floorBroken || orderBroken;
}

/** The gate's report: one line per rung, then the count. The failing rung is the
 *  headline, so it prints first when there is one. */
export function gateText(rows: GateRow[], refPair: { bg: string; fg: string; name?: string }): string {
  const pad = (s: string, n: number): string => s.padEnd(n);
  // Only the failures the gate *acts* on get a FAILS block: a broken floor
  // anywhere, and an inverted order on the reference rung. The other inversions
  // are printed in the table and named in the reading — a "FAILS" heading over a
  // rung the gate deliberately passes is the report contradicting its own verdict,
  // and it was misread exactly that way by a sibling session (2026-11-04).
  const floorFailed = rows.filter((r) => !r.refused && !r.verdict.readable);
  const reference = rows.find((r) => r.n === REFERENCE_RUNG);
  const referenceOrderFailed = reference !== undefined && !reference.refused && !reference.verdict.navigable;
  const out: string[] = [];
  out.push(`surface gate — ${rows.filter((r) => !r.refused).length} admissible rung(s) vs ${FLOOR}:1 and the ink`);
  if (floorFailed.length > 0) {
    out.push("");
    for (const r of floorFailed) out.push(surfaceText(r.verdict, refPair, `${r.n} · ${r.name} — FAILS THE FLOOR`));
  }
  if (referenceOrderFailed) {
    out.push("");
    out.push(surfaceText(reference.verdict, refPair, `${reference.n} · ${reference.name} — FAILS THE ORDER (the recommended rung)`));
  }
  out.push("");
  out.push(pad("rung", 6) + pad("pair", 20) + pad("readable", 11) + "navigable");
  for (const r of rows) {
    out.push(
      pad(String(r.n), 6) +
        pad(`${r.pair.bg}/${r.pair.fg}`, 20) +
        pad(r.refused ? "refused" : r.verdict.readable ? "yes" : `NO (${r.verdict.belowFloor.length})`, 11) +
        (r.refused ? "refused — not gated" : r.verdict.navigable ? "yes" : `NO (${r.verdict.crossed.length})`),
    );
  }
  out.push("");
  const gateFailure = gateFails(rows);
  const inverted = rows.filter((r) => !r.refused && !r.verdict.navigable);
  if (inverted.length > 0) {
    out.push(
      `reading: the order is inverted on rung(s) ${inverted.map((r) => `${r.n} (${r.verdict.crossed.length})`).join(", ")}` +
        ` — not a build failure, because those inks are chosen and their cost is in the page;`,
    );
    out.push(`         the reference rung's order is gated (it is the one okuda recommends).`);
  }
  out.push(
    gateFailure
      ? `FAILED — ${floorFailed.length} rung(s) break the ${FLOOR}:1 floor` +
          (referenceOrderFailed ? `, and the recommended rung's order is inverted` : "") +
          "."
      : `OK — the ${FLOOR}:1 floor holds on all ${rows.filter((r) => !r.refused).length} admissible rung(s),` +
          ` and the order holds on the reference rung.`,
  );
  return out.join("\n");
}

/** The verdict as text: the two readings named, the failures listed, one answer
 *  at the end — because the answer is the thing a person came for. */
export function surfaceText(v: SurfaceVerdict, refPair: { bg: string; fg: string; name?: string }, label?: string): string {
  const out: string[] = [];
  out.push(
    `${label ? label + "\n" : ""}pair ${v.pair.bg} / ${v.pair.fg}   ink ${v.ink.toFixed(1)}:1` +
      (refPair.name ? `   reference ${refPair.bg} / ${refPair.fg} (${refPair.name})` : ""),
  );
  out.push("");
  const all = floor(v.pair.bg);
  const exempt = all.length - all.filter((r) => r.onGround).length;
  out.push(
    v.readable
      ? `readable   YES — all ${all.length - exempt} on-ground roles clear ${FLOOR}:1` +
        (exempt > 0 ? ` (${exempt} exempt: ${all.filter((r) => !r.onGround).map((r) => r.role).join(", ")})` : "")
      : `readable   NO  — ${v.belowFloor.length} role(s) under the floor of ${FLOOR}:1: ` +
        v.belowFloor.map((r) => `${r.role} ${r.ratio.toFixed(2)}`).join(", "),
  );
  out.push(
    v.navigable
      ? "navigable  YES — no role crossed the ink; the order is intact"
      : `navigable  NO  — ${v.crossed.length} role(s) out-rank the prose: ` +
        v.crossed.map((r) => `${r.role} ${r.before.toFixed(2)}→${r.over.toFixed(2)}`).join(", "),
  );
  out.push("");
  const verdict =
    v.readable && v.navigable
      ? "OK — readable and navigable on this pair."
      : [
          v.readable ? "" : "NOT readable",
          v.navigable ? "" : "NOT navigable",
        ].filter(Boolean).join(" and ") + " on this pair.";
  out.push(verdict);
  return out.join("\n");
}

// ── The ranking ───────────────────────────────────────────────────────
//  `share` above is one role ÷ ink — the rule that a rule must not out-shout
//  the prose it divides. The ranking is that rule lifted to the whole palette,
//  because the instrument was only ever measuring one member of a set: **a
//  palette is not a set of colours, it is a ranking**, and the ranking is
//  expressed as ratios against the ink.
//
//  Why it matters, measured 2026-11-01: okuda's coloured roles are fixed hexes,
//  and prose ships EMPTY so it inherits whatever the terminal calls the
//  foreground (`src/palette.ts:17-20`). A host that supplies a dimmer ink
//  therefore changes no colour at all — it moves the prose down the ladder, and
//  every accent ends up above it. On the tuned pair (`#23272e`/`#c8ccd4`)
//  heading ÷ ink is 0.95; on atom-one-dark's defaults (`#21252b`/`#abb2bf`) it is
//  1.26. Nothing got brighter. The ORDER inverted, and that is what reads as
//  "blown out".
//
//  So the reading is a comparison, not an absolute: a pair is judged against the
//  **reference pair** — the one dogfooded on the glass — and what it reports is
//  which roles CROSSED the ink. Absolute loudness is a design choice nobody here
//  has to defend; a change in order is the defect, and it is measurable without
//  arguing about taste.
//
//  The control starts the file: reference against itself reports zero movement.
//  A detector whose control does not pass first is measuring the detector.

/** The dogfooded pair — rung 8 of `PAIRS`, *"best so far"* on the ground page.
 *  A parameter, not a truth: `--ref-rung` judges a candidate against another. */
export const REFERENCE_RUNG = 8;

/** The rung, as a pair. */
function rungPair(p: Pair): { bg: string; fg: string; name: string } {
  return { bg: p.bg, fg: p.fg, name: p.name };
}

/** **THE PAIR** — the one this silo recommends, named once so a reader does not
 *  have to know that "rung 8" is the answer. It is the dogfooded ground; every
 *  host artefact is generated from it (`docs/2026-10-28-ghostty-ground.conf`,
 *  `just herdr-theme`), and `just check` gates it (BRF-SURFACE-PAIR).
 *  `referencePair(n)` is the parameterised view, for judging a candidate against
 *  a *different* rung; the default is this pair and only this pair. */
export const PAIR = rungPair(PAIRS.find((x) => x.n === REFERENCE_RUNG) ?? PAIRS[4]!);

export function referencePair(n: number = REFERENCE_RUNG): { bg: string; fg: string; name: string } {
  return n === REFERENCE_RUNG ? PAIR : rungPair(PAIRS.find((x) => x.n === n) ?? PAIRS[4]!);
}

export interface RankRow {
  role: string;
  hex: string;
  ratio: number;
  /** role ÷ ink. Above 1.00 the role is louder than the prose. */
  over: number;
}

/** Every palette role's contrast against a ground, as a share of the ink's.
 *  Pure: a pair in, a ranking out. */
export function ranking(fg: string, bg: string, palette: Palette = okudaPalette()): RankRow[] {
  const ink = ratio(fg, bg);
  return Object.entries(palette)
    .filter(([, v]) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v as string))
    .map(([role, v]) => {
      const r = ratio(v as string, bg);
      return { role, hex: v as string, ratio: r, over: r / ink };
    });
}

export interface RankShift extends RankRow {
  before: number;
  /** Ranking movement: candidate ÷ reference. 1.00 = unmoved. */
  moved: number;
  /** It sat under the ink and now sits over it — the inversion. */
  crossed: boolean;
}

/** Two rankings, compared role by role. Pure. */
export function compareRanking(refPair: { bg: string; fg: string }, candPair: { bg: string; fg: string }): RankShift[] {
  const before = new Map(ranking(refPair.fg, refPair.bg).map((r) => [r.role, r.over]));
  return ranking(candPair.fg, candPair.bg)
    .map((r) => {
      const b = before.get(r.role) ?? r.over;
      return { ...r, before: b, moved: r.over / b, crossed: b <= 1 && r.over > 1 };
    })
    .sort((a, b) => b.moved - a.moved);
}

/** The comparison as text: the crossings first (they are the finding), then the
 *  movement, then the verdict. */
export function compareText(
  shifts: RankShift[],
  refPair: { bg: string; fg: string; name?: string },
  candPair: { bg: string; fg: string },
  label?: string,
): string {
  const pad = (s: string, n: number): string => s.padEnd(n);
  const crossed = shifts.filter((r) => r.crossed);
  const out: string[] = [];
  out.push(`${label ? label + "\n" : ""}candidate ${candPair.bg} / ${candPair.fg}` +
    `   reference ${refPair.bg} / ${refPair.fg}${refPair.name ? ` (${refPair.name})` : ""}`);
  out.push("");
  out.push(pad("role", 16) + pad("hex", 9) + pad("÷ ink now", 11) + pad("was", 7) + "moved");
  for (const r of shifts) {
    const flag = r.crossed ? "  ← crossed the ink" : "";
    out.push(pad(r.role, 16) + pad(r.hex, 9) + pad(r.over.toFixed(2), 11) + pad(r.before.toFixed(2), 7) + r.moved.toFixed(2) + flag);
  }
  out.push("");
  out.push(
    crossed.length === 0
      ? "ranking: HELD — no role crossed the ink."
      : `ranking: INVERTED — ${crossed.map((r) => `${r.role} ${r.before.toFixed(2)} → ${r.over.toFixed(2)}`).join(", ")}`,
  );
  return out.join("\n");
}

/** A host theme file, read for the pair it supplies. Herdr's `themes/<name>.json`
 *  carries `background` and `foreground`, which is exactly the surface and the
 *  ink okuda inherits and cannot see. Returns null when the file does not carry
 *  a usable pair — a theme for the app's chrome alone has nothing to report. */
export function themePair(path: string): { bg: string; fg: string } | null {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return null;
  }
  // Two syntaxes, because the two hosts we have met disagree about what a theme
  // is: Herdr writes JSON, Ghostty writes its own config (a theme there is
  // "simply another configuration file"). Both name the pair in the same two
  // words, so one reader serves both — and a host that invents a third spelling
  // gets its own branch here rather than a new instrument.
  let bg: string | null = null;
  let fg: string | null = null;
  const flat = text.trimStart().startsWith("{");
  if (flat) {
    try {
      const raw = JSON.parse(text) as { background?: unknown; foreground?: unknown };
      bg = typeof raw.background === "string" ? raw.background : null;
      fg = typeof raw.foreground === "string" ? raw.foreground : null;
    } catch {
      return null;
    }
  } else {
    // `key = value`, `#` comments, whitespace tolerated. The first assignment of
    // each wins: a config file may repeat a key, and the terminal is the authority
    // on which one it honours — we take the earliest rather than invent a rule.
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*(background|foreground)\s*=\s*(#[0-9a-fA-F]{6})\s*(?:#.*)?$/);
      if (!m) continue;
      if (m[1] === "background" && bg === null) bg = m[2]!;
      if (m[1] === "foreground" && fg === null) fg = m[2]!;
    }
  }
  return bg && fg && /^#[0-9a-f]{6}$/i.test(bg) && /^#[0-9a-f]{6}$/i.test(fg) ? { bg, fg } : null;
}

export interface ThemeRow extends SurfaceVerdict {
  name: string;
  path: string;
  /** The theme's own ink fails the floor against its own ground: a pair that
   *  cannot read *anything*, before any foreign palette is involved. Reported
   *  separately from `readable`, which asks about our roles on their ground. */
  selfBroken: boolean;
}

/** Every theme file in a directory, read and judged. The probe this exists for:
 *  a host's own shipped collection, measured by the pair it supplies. Sorted
 *  worst ink first — the weakest pairs are the ones a reader meets by default.
 *  Files that carry no usable pair are reported, not dropped: a theme that cannot
 *  state its own surface is a finding too. Pure apart from the reads. */
export function surfaceDir(dir: string, refPair: { bg: string; fg: string } = referencePair()): {
  rows: ThemeRow[];
  noPair: string[];
} {
  const rows: ThemeRow[] = [];
  const noPair: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    // Ghostty's themes are extensionless, Herdr's are `.json`, and a third host
    // will invent a third spelling. So: read everything that is not a dotfile and
    // let the reader decide, reporting what it cannot read rather than guessing
    // from a suffix.
    if (name.startsWith(".")) continue;
    const path = join(dir, name);
    const pair = themePair(path);
    if (!pair) {
      noPair.push(name);
      continue;
    }
    rows.push({ name, path, selfBroken: ratio(pair.fg, pair.bg) < FLOOR, ...surfaceVerdict(pair, refPair) });
  }
  rows.sort((a, b) => a.ink - b.ink);
  return { rows, noPair };
}

/** The directory reading as text: one line per theme, then the census. The
 *  census is the letter: how many of a host's own themes cannot be read, and how
 *  many invert a foreign palette. */
export function surfaceDirText(res: { rows: ThemeRow[]; noPair: string[] }, refPair: { bg: string; fg: string }): string {
  const out: string[] = [];
  const pad = (s: string, n: number): string => s.padEnd(n);
  out.push(`theme directory — ${res.rows.length} theme(s) with a pair, ${res.noPair.length} without`);
  out.push(`reference ${refPair.bg} / ${refPair.fg}`);
  out.push("");
  out.push(pad("theme", 34) + pad("bg/fg", 18) + pad("ink", 7) + pad("readable", 10) + pad("navigable", 12) + "self");
  for (const r of res.rows) {
    out.push(
      pad(r.name.slice(0, 33), 34) +
        pad(`${r.pair.bg}/${r.pair.fg}`, 18) +
        pad(`${r.ink.toFixed(1)}:1`, 7) +
        pad(r.readable ? "yes" : `NO (${r.belowFloor.length})`, 10) +
        pad(r.navigable ? "yes" : `NO (${r.crossed.length})`, 12) +
        (r.selfBroken ? "BROKEN" : "ok"),
    );
  }
  const unreadable = res.rows.filter((r) => !r.readable).length;
  const inverted = res.rows.filter((r) => !r.navigable).length;
  const both = res.rows.filter((r) => !r.readable && !r.navigable).length;
  out.push("");
  const broken = res.rows.filter((r) => r.selfBroken).length;
  out.push(
    `census: ${unreadable}/${res.rows.length} cannot be read at ${FLOOR}:1 · ` +
      `${inverted}/${res.rows.length} invert a foreign palette · ${both} do both · ` +
      `${broken}/${res.rows.length} cannot read anything (own ink under ${FLOOR}:1)`,
  );
  if (res.noPair.length > 0) out.push(`no pair stated (${res.noPair.length}): ${res.noPair.slice(0, 8).join(", ")}`);
  return out.join("\n");
}

function main(): void {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");

  // ── The ranking reading: a pair in, the palette ranked against its ink out.
  //    `--theme <file>` is the case this exists for — a host theme supplies the
  //    ground and the ink, and the document renderer sees neither.
  const argAfter = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const themeDir = argAfter("--theme-dir");
  if (themeDir !== undefined) {
    const refForDir = referencePair(
      Number.parseInt(argAfter("--ref-rung") ?? String(REFERENCE_RUNG), 10) || REFERENCE_RUNG,
    );
    const res = surfaceDir(themeDir, refForDir);
    if (json) console.log(JSON.stringify({ reference: refForDir, ...res }, null, 2));
    else console.log(surfaceDirText(res, refForDir));
    return;
  }
  const themePath = argAfter("--theme");
  const refRung = Number.parseInt(argAfter("--ref-rung") ?? String(REFERENCE_RUNG), 10) || REFERENCE_RUNG;
  const refPair = referencePair(refRung);
  if (argv.includes("--ranking") || argv.includes("--surface") || themePath !== undefined) {
    let cand: { bg: string; fg: string } | null = null;
    if (themePath !== undefined) {
      cand = themePair(themePath);
      if (!cand) {
        console.error(`${themePath}: no usable background/foreground pair — a chrome-only theme has nothing to report.`);
        process.exitCode = 1;
        return;
      }
    } else {
      const rung = argAfter("--rung");
      const named = rung === undefined ? undefined : PAIRS.find((p) => String(p.n) === rung);
      const bg = argAfter("--bg") ?? named?.bg;
      const fg = argAfter("--fg") ?? named?.fg;
      // `--gate` with no pair is the check `just check` runs: gate **every**
      // admissible rung, so a role hex that breaks any ground a principal may sit
      // at fails the build rather than a habit. The recommended pair is a sample.
      const gateOnly = argv.includes("--gate");
      if (!bg || !fg) {
        if (!gateOnly) {
          console.error("--ranking needs a pair: --bg <hex> --fg <hex>, --rung <n>, or --theme <file>.");
          process.exitCode = 1;
          return;
        }
        // The whole ladder, not the reference rung. Handled here and returned,
        // because the loop below is written for one pair.
        if (argv.includes("--surface")) {
          const rows = gateRows(PAIRS, refPair);
          const fails = gateFails(rows);
          if (json) console.log(JSON.stringify({ reference: refPair, rows }, null, 2));
          else console.log(gateText(rows, refPair));
          if (fails) process.exitCode = 1;
          return;
        }
        cand = { bg: PAIR.bg, fg: PAIR.fg };
      } else {
        cand = { bg, fg };
      }
    }
    if (argv.includes("--surface")) {
      const v = surfaceVerdict(cand, refPair);
      if (json) {
        console.log(JSON.stringify(v, null, 2));
        if (argv.includes("--gate") && surfaceFails(v)) process.exitCode = 1;
        return;
      }
      console.log(surfaceText(v, refPair, themePath));
      if (argv.includes("--gate") && surfaceFails(v)) process.exitCode = 1;
      return;
    }
    const shifts = compareRanking(refPair, cand);
    if (json) {
      console.log(JSON.stringify({ reference: refPair, candidate: cand, rows: shifts }, null, 2));
      return;
    }
    console.log(compareText(shifts, refPair, cand, themePath));
    return;
  }

  const rs = rows();
  if (json) {
    console.log(JSON.stringify(rs, null, 2));
    return;
  }
  const pad = (s: string, n: number): string => s.padEnd(n);
  // L_bg is the comfort axis (the ground's own lightness) and amber is the
  // early-warning channel: deepening the ground raises every role's contrast in
  // lockstep, and amber crosses 13:1 before anything on the page *looks* wrong.
  console.log(
    pad("", 3), pad("pair", 30), pad("bg", 9), pad("fg", 9),
    pad("ratio", 7), pad("L_bg", 6), pad("L_fg", 6),
    pad("rules", 6), pad("amber", 6), "share",
  );
  for (const r of rs) {
    console.log(
      pad(String(r.n), 3), pad(r.name, 30), pad(r.bg, 9), pad(r.fg, 9),
      pad(`${r.ratio.toFixed(1)}:1`, 7), pad(r.lBg.toFixed(3), 6),
      pad(r.lFg.toFixed(3), 6),
      pad((r.watched["muted"] ?? 0).toFixed(2), 6),
      pad((r.watched["state-todo"] ?? 0).toFixed(1), 6),
      r.ruleShare.toFixed(2),
    );
  }
  console.log("\nshare = muted ÷ ink. Above 1.00 a rule out-shouts prose: refused.");
  console.log("comfort band: ground L 0.24–0.26 at 10–11:1. Below it, or above it, the");
  console.log("page is high-contrast again — the ladder is a U, not a ramp.");
}

if (import.meta.main) main();
