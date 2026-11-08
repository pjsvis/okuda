#!/usr/bin/env bun
/**
 * lightcard.ts — a light-ground card **derived** from the dark palette, with the
 * ranking preserved.
 *
 * The question it answers is the one `docs/2026-11-03-okuda-light-theme-discussion.md`
 * left open: an Omarchy light theme puts 16–19 of 21 on-ground roles under 3:1, so
 * a page whose prose reads fine has an annotation layer that is pure texture.
 * Three answers were possible and only one is cheap:
 *
 *   - a **second palette**, re-authored role by role — refused 2026-11-03 as a
 *     second set of role meanings, and a promise to keep two identities honest;
 *   - **`paperInk`**, the print rung's mirror — refused here, on measurement: it
 *     is a *per-role floor* (darken each colour until it clears 4.5:1 on white),
 *     and a floor flattens a rank. Twelve of twenty-one roles land in two buckets
 *     of `÷ ink`; the page is legible and all its accents weigh the same;
 *   - **this file** — the same palette, opposite polarity, the role's position
 *     relative to the ink held fixed, and the floor applied as a *constraint*
 *     afterwards rather than as the target.
 *
 * ## The transform
 *
 * One invariant, stated once: **a role's meaning is `over` (`ratio to ground ÷
 * ink's ratio to ground`), not its colour.** So, with the ink's loudness held:
 *
 *     ρ_role(light) = max(FLOOR, over_role × ρ_ink(light))
 *
 * and `ρ_ink(light)` is chosen so the page's contrast is the dark page's — the
 * polarity flips, the loudness does not. `ρ` → a relative luminance, `Y` → a hex
 * by keeping the role's **hue and saturation** and solving its lightness, because
 * hue and saturation are identity and lightness is rank.
 *
 * The floor is a clamp on the *result*, not a target for each role, and that is
 * the whole difference from `paperInk`: a clamped role keeps its order among the
 * roles that did not need clamping, and the ones that did are reported as
 * crowding rather than quietly becoming each other.
 *
 * ## Status
 *
 * A **prover**, not a preset. `loadPalette` does not know this file exists: the
 * ruling that okuda ships no light palette (`briefs/2026-11-03-brief-pair-delivered.md`,
 * out of scope) stands until someone decides to spend a second identity, and this
 * script's job is to make that decision cheap by printing what the card would be
 * and what it would cost. `just check` runs `--gate`, so the *derivation* cannot
 * rot silently even while nothing consumes it.
 *
 * Usage:
 *   bun scripts/lightcard.ts                 # the derivation and the reading
 *   bun scripts/lightcard.ts --control       # the same reading, on paperInk
 *   bun scripts/lightcard.ts --ground '#fffcf0'
 *   bun scripts/lightcard.ts --gate          # the derivation's own arithmetic
 */

import { FLOOR, NOT_ON_GROUND, floor, luminance, okudaPalette, ratio, referencePair } from "./contrast";
import { paperInk } from "./paper";
import type { Palette } from "../src/palette";

/** A light ground to derive onto. `#fffcf0` is flexoki-light's — the theme the
 *  measurement that started this was taken on — and the default because a card
 *  derived for the ground that broke the palette is the honest one to ship first. */
export const LIGHT_GROUND = "#fffcf0";

/** `÷ ink` is read to about this. A rank is a position, not a number; two roles
 *  inside one bucket are two roles a reader cannot tell apart, which is the
 *  failure the ranking thesis predicts for a floor-clamped card. */
export const BUCKET = 0.05;

/** A crowd is where order stops being information: three or more roles inside one
 *  bucket of `÷ ink`. Two is a pair that may be a deliberate twin (`emphasis` and
 *  `blockquote` share a hex by design, and stay twinned). */
export const CROWD = 3;

const hex2rgb = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

const rgb2hex = (r: number, g: number, b: number): string =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

/** HSL of a hex — the same space `paperInk` mirrors in, reused so the two cards
 *  differ in *what they do with lightness* and not in how they read it. */
function toHsl(hex: string): { h: number; s: number; l: number } {
  const [r, g, b] = hex2rgb(hex).map((v) => v / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = ((h * 60) % 360 + 360) % 360;
  }
  return { h, s, l };
}

function hslHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return rgb2hex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/** The lightness at which a hue/saturation pair hits a target relative luminance.
 *  Monotone in `l`, so a bisection is exact enough and cannot wander: hue and
 *  saturation never move, which is what keeps a role recognisable as itself. */
function lightnessFor(h: number, s: number, targetY: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (luminance(hslHex(h, s, mid)) < targetY) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export interface DerivedCard {
  ground: string;
  /** The card's ink. `body` ships empty in the dark palette, so a card must
   *  *declare* one — and here the declaration is derived, not tasted: the same
   *  loudness the reference ink had, on the opposite polarity. */
  ink: string;
  palette: Palette;
}

/** **The derivation.** `over` in, the same `over` out, on a light ground.
 *
 *  `ρ_ink` is the reference pair's own ratio, so the card is as loud as the card
 *  it came from; a principal who wants a quieter light page passes `inkRatio`.
 *  Pure: no reads, no clock, no environment. */
export function deriveLightCard(
  palette: Palette = okudaPalette(),
  refPair: { bg: string; fg: string } = referencePair(),
  ground: string = LIGHT_GROUND,
  inkRatio: number = ratio(refPair.fg, refPair.bg),
): DerivedCard {
  const yg = luminance(ground);
  // On a light ground the ink is the DARK side: ratio = (Y_g + 0.05)/(Y_ink + 0.05).
  const inkY = Math.max(0, (yg + 0.05) / inkRatio - 0.05);
  // The ink is **neutral**: it is the prose, and prose carries no hue of its own
  // in either polarity. The dark card says the same thing by leaving `body` empty
  // (the glass's foreground is not a role); a card must say it by choosing one.
  // The ground's own hue is kept, faintly, so the page is one temperature.
  const gh = toHsl(ground);
  const ink = hslHex(gh.h, Math.min(gh.s, 0.06), lightnessFor(gh.h, Math.min(gh.s, 0.06), inkY));
  const out: Record<string, string> = {};
  const darkInk = ratio(refPair.fg, refPair.bg);
  for (const [role, hex] of Object.entries(palette)) {
    if (typeof hex !== "string" || !/^#[0-9a-f]{6}$/i.test(hex)) continue;
    const over = ratio(hex, refPair.bg) / darkInk;
    // The floor is applied to roles **painted on the ground**, and only those.
    // `muted` and `badge-fg` are exempt in the dark palette for stated reasons
    // (structural quiet; painted on its own partner), and clamping them here
    // would *rewrite their rank* while claiming to preserve it — measured: the
    // first cut pulled `muted` from 0.20 to 0.28 of ink and crowded it.
    const target = role in NOT_ON_GROUND ? Math.max(0.1, over * inkRatio) : Math.max(FLOOR, over * inkRatio);
    const targetY = Math.max(0, (yg + 0.05) / target - 0.05);
    const { h, s } = toHsl(hex);
    out[role] = hslHex(h, s, lightnessFor(h, s, targetY));
  }
  // `badge-fg` is painted on `badge-bg`, not on the ground; carrying it through
  // the same transform is the only defensible choice (its partner moved too), and
  // `NOT_ON_GROUND` keeps the gate from measuring it against the page.
  return { ground, ink, palette: out as Palette };
}

export interface CardRow {
  role: string;
  hex: string;
  ratio: number;
  over: number;
  headroom: number;
  onGround: boolean;
}

/** The card, read the way the dark palette is: `over` against the card's own ink,
 *  the floor against its own ground. Sorted by `over` so the ranking is the shape
 *  of the table, not a column a reader has to sort in their head. */
export function cardRows(card: DerivedCard): CardRow[] {
  return Object.entries(card.palette)
    .filter(([, v]) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v))
    .map(([role, v]) => {
      const r = ratio(v, card.ground);
      return {
        role,
        hex: v,
        ratio: r,
        over: r / ratio(card.ink, card.ground),
        headroom: r / FLOOR,
        onGround: !(role in NOT_ON_GROUND),
      };
    })
    .sort((a, b) => a.over - b.over);
}

/** Roles a reader cannot tell apart: `CROWD` or more inside one `BUCKET` of
 *  `÷ ink`. The finding `paperInk` fails on, expressed as a number. */
export function crowds(rows: CardRow[], bucket = BUCKET, crowd = CROWD): { at: number; roles: string[] }[] {
  const byBucket = new Map<number, string[]>();
  for (const r of rows) {
    const k = Math.round(r.over / bucket);
    byBucket.set(k, [...(byBucket.get(k) ?? []), r.role]);
  }
  return [...byBucket.entries()]
    .filter(([, roles]) => roles.length >= crowd)
    .map(([k, roles]) => ({ at: k * bucket, roles }))
    .sort((a, b) => a.at - b.at);
}

/** The **source** card's rows — the dark palette read the same way, so the
 *  comparison is like with like. Without this the detector measures the house
 *  palette's own deliberate twins: eight amber-family roles sit at 0.78–0.81 of
 *  ink on the reference rung by design, and a fixed crowd threshold reads that as
 *  a defect in the derivation that inherited it. */
export function sourceRows(
  palette: Palette = okudaPalette(),
  refPair: { bg: string; fg: string } = referencePair(),
): CardRow[] {
  const ink = ratio(refPair.fg, refPair.bg);
  return Object.entries(palette)
    .filter(([, v]) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v))
    .map(([role, v]) => {
      const r = ratio(v as string, refPair.bg);
      return {
        role,
        hex: v as string,
        ratio: r,
        over: r / ink,
        headroom: r / FLOOR,
        onGround: !(role in NOT_ON_GROUND),
      };
    })
    .sort((a, b) => a.over - b.over);
}

/** A crowd, as a comparable signature: `0.80:blockquote,emphasis,…`. Two cards
 *  agree when their signatures are equal — the transform's claim is that it
 *  moves the page and leaves the *order* where it found it, so any difference is
 *  the finding. */
export function signature(rows: CardRow[], bucket = BUCKET, crowd = CROWD): string[] {
  return crowds(rows, bucket, crowd).map((c) => `${c.at.toFixed(2)}:${[...c.roles].sort().join(",")}`);
}

/** The verdict the gate asks: read on the page, and ordered **as the source was
 *  ordered**. Pure.
 *
 *  Note what is *not* a failure: a crowd. The house palette has deliberate twins
 *  (`emphasis` ≡ `table-key` ≡ `blockquote`, one amber) and a transform that
 *  separated them would be inventing roles. So the test is equality with the
 *  source — and the calibration for it is `paperInk`, which passes the floor and
 *  *manufactures* crowds the source never had. */
export function cardFails(
  card: DerivedCard,
  source: CardRow[] = sourceRows(),
): { belowFloor: CardRow[]; crowded: ReturnType<typeof crowds>; extra: string[]; unordered: boolean } {
  const rows = cardRows(card);
  const belowFloor = rows.filter((r) => r.onGround && r.ratio < FLOOR);
  const crowded = crowds(rows);
  const mine = new Set(signature(rows));
  const theirs = new Set(signature(source));
  const extra = [...mine].filter((s) => !theirs.has(s));
  return { belowFloor, crowded, extra, unordered: extra.length > 0 };
}

export function cardText(card: DerivedCard, label: string, source: CardRow[] = sourceRows()): string {
  const pad = (s: string | number, n: number): string => String(s).padEnd(n);
  const rows = cardRows(card);
  const ink = ratio(card.ink, card.ground);
  const belowFloor = rows.filter((r) => r.onGround && r.ratio < FLOOR);
  const crowded = crowds(rows);
  const out: string[] = [];
  out.push(`${label} — ground ${card.ground} / ink ${card.ink} · ink ${ink.toFixed(1)}:1`);
  out.push("");
  out.push(pad("role", 16) + pad("hex", 9) + pad("ratio", 8) + pad("headroom", 10) + "÷ ink");
  for (const r of rows) {
    out.push(
      pad(r.role, 16) +
        pad(r.hex, 9) +
        pad(`${r.ratio.toFixed(2)}:1`, 8) +
        pad(r.headroom.toFixed(2), 10) +
        r.over.toFixed(2) +
        (!r.onGround ? "  (off-ground)" : r.ratio < FLOOR ? "  ← under floor" : ""),
    );
  }
  out.push("");
  out.push(
    belowFloor.length === 0
      ? `floor: every on-ground role clears ${FLOOR}:1.`
      : `floor: ${belowFloor.length} on-ground role(s) under ${FLOOR}:1 — ${belowFloor.map((r) => r.role).join(", ")}`,
  );
  const extra = [...new Set(signature(rows))].filter((s) => !new Set(signature(source)).has(s));
  out.push(
    extra.length === 0
      ? `order: HELD — the same crowd as the source palette (${crowded.length} of ${CROWD}+ roles per ${BUCKET} bucket, inherited not made).`
      : `order: CROWDED — ${extra.map((s) => `[${s.split(":")[1]}]`).join(" · ")} crowd together here and did not in the source.`,
  );
  return out.join("\n");
}

function main(argv: string[]): number {
  const argAfter = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const ground = argAfter("--ground") ?? LIGHT_GROUND;
  const palette = okudaPalette();
  const refPair = referencePair();

  if (argv.includes("--control")) {
    // The failing control: the same palette through the print rung's mirror. It
    // must *pass the floor and fail the order* — if it ever passed both, this
    // file would have no reason to exist and `paperInk` would be the answer.
    const mirrored: Record<string, string> = {};
    for (const [role, hex] of Object.entries(palette)) {
      if (typeof hex === "string" && /^#[0-9a-f]{6}$/i.test(hex)) mirrored[role] = paperInk(hex);
    }
    const control: DerivedCard = { ground: paperInk(ground, true), ink: paperInk(refPair.fg), palette: mirrored as Palette };
    const fails = cardFails(control);
    console.log(cardText(control, "control · paperInk mirror"));
    console.log("");
    console.log(
      `control verdict: floor ${fails.belowFloor.length === 0 ? "passes" : `fails (${fails.belowFloor.length})`}, ` +
        `order ${fails.extra.length === 0 ? "passes — then the transform is a card" : `fails (${fails.extra.length} crowd(s) the source never had)`}`,
    );
    return 0;
  }

  const card = deriveLightCard(palette, refPair, ground);
  const source = sourceRows(palette, refPair);
  const fails = cardFails(card, source);
  if (argv.includes("--json")) {
    console.log(JSON.stringify({ card, rows: cardRows(card), fails }, null, 2));
    return 0;
  }
  console.log(cardText(card, "derived · rank preserved", source));
  if (argv.includes("--gate")) {
    const bad = fails.belowFloor.length > 0 || fails.extra.length > 0;
    console.log(`lightcard: ${bad ? "FAILS" : "OK"} — derivation holds the floor and the order.`);
    return bad ? 1 : 0;
  }
  return 0;
}

if (import.meta.main) process.exitCode = main(process.argv.slice(2));
