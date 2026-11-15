import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BAND,
  PAIRS,
  STANDING_MARK,
  fromOklch,
  luminance,
  measurePair,
  oklch,
  perturbInk,
  perturbText,
  ratio,
  standing,
} from "../scripts/contrast";

// The perturbation: one knob, everything else held, and the measures that follow
// it. This file is what makes a perturbation an *instrument* rather than a
// spreadsheet: the inverse conversion is exact, the held things hold, the moving
// things move in one direction, and a candidate that could not be painted says so.
//
// The finding it protects is a negative one about our own band — the prose
// ceiling refuses the move that improves the hierarchy — so the assertions are
// written as properties of the direction, not of the six numbers chosen today.

describe("fromOklch — the inverse, and its honesty about the display", () => {
  test("every colour in the set survives oklch → hex → oklch exactly", () => {
    // The round trip is the whole basis of a perturbation: a request stated in
    // OKLCH has to come back as a hex a terminal can paint, and the hex's own
    // lightness is the number that renders.
    for (const p of PAIRS) {
      for (const hex of [p.bg, p.fg]) {
        const o = oklch(hex);
        const back = fromOklch(o);
        expect(back.hex).toBe(hex);
        expect(back.L).toBeCloseTo(o.L, 6);
        expect(back.clipped).toBe(false);
      }
    }
  });

  test("a colour sRGB cannot paint is reported, not silently clamped", () => {
    // A warm chroma at near-white has no sRGB representative. Clamping quietly
    // would report a pair nobody can paint; `clipped` is the difference between
    // "we moved the ink" and "we moved it as far as the display allows".
    const out = fromOklch({ L: 0.98, C: 0.2, h: 79 });
    expect(out.clipped).toBe(true);
  });

  test("the achieved L is the hex's, not the request's", () => {
    const out = fromOklch({ L: 0.8911, C: 0.017, h: 79 });
    expect(out.L).toBeCloseTo(oklch(out.hex).L, 9);
  });
});

describe("the ink perturbation — one knob, held everything else", () => {
  const ps = perturbInk();
  const base = PAIRS.find((p) => p.n === 8)!;

  test("the ground, the hue and the chroma are held for every step", () => {
    const ink = oklch(base.fg);
    for (const p of ps) {
      expect(p.row.bg).toBe(base.bg); // the ground never moves
      // Hue is held **in the request**; the artefact's hue drifts, because one
      // 8-bit step at C 0.017 is worth several degrees. Bounded, not ignored —
      // the drift is printed by `perturbText` and measured here.
      const hueDrift = Math.abs(oklch(p.row.fg).h - ink.h);
      expect(Math.min(hueDrift, 360 - hueDrift)).toBeLessThan(5);
      expect(Math.abs(oklch(p.row.fg).C - ink.C)).toBeLessThan(0.005);
      expect(p.base).toBe(8);
      expect(p.clipped).toBe(false);
    }
  });

  test("raising the ink raises prose, lift and emitted light — monotonically", () => {
    for (let i = 1; i < ps.length; i++) {
      expect(ps[i]!.asked.L).toBeGreaterThan(ps[i - 1]!.asked.L);
      expect(ps[i]!.row.ratio).toBeGreaterThan(ps[i - 1]!.row.ratio);
      expect(ps[i]!.row.lift).toBeGreaterThan(ps[i - 1]!.row.lift);
      expect(ps[i]!.row.yFg).toBeGreaterThan(ps[i - 1]!.row.yFg);
      expect(ps[i]!.row.lFg).toBeGreaterThan(ps[i - 1]!.row.lFg);
    }
  });

  test("the gold's own ratio is unmoved and its share falls — hierarchy improves", () => {
    // The finding: the gold is measured against the *ground*, so it cannot move
    // when the ink moves; what changes is its share of a prose that grew. A bold
    // lead at 0.52 of the paragraph is more of a lead than one at 0.69.
    for (const p of ps) expect(p.row.watched["strong"]).toBeCloseTo(ps[0]!.row.watched["strong"]!, 9);
    for (let i = 1; i < ps.length; i++) {
      expect(ps[i]!.row.goldShare).toBeLessThan(ps[i - 1]!.row.goldShare);
    }
  });

  test("rules and amber do not move: they are measured against a held ground", () => {
    for (const p of ps) {
      expect(p.row.watched["muted"]).toBeCloseTo(ps[0]!.row.watched["muted"]!, 9);
      expect(p.row.watched["state-todo"]).toBeCloseTo(ps[0]!.row.watched["state-todo"]!, 9);
      expect(p.row.ruleShare).toBeLessThan(ps[0]!.row.ruleShare! + 0.05);
    }
  });

  test("the band refuses every step past the first, on a number that improved", () => {
    // The result the page turns on. Not a defect in the perturbation — a defect
    // in reading the band's prose interval as a guard.
    expect(standing(ps[0]!.row)).toBe("comfort");
    for (const p of ps.slice(1)) expect(standing(p.row)).toBe("region");
    expect(ps[1]!.row.ratio).toBeGreaterThan(BAND.prose[1]);
    // and the thing that pushed it there is separation, not glare:
    expect(ps[1]!.row.goldShare).toBeLessThan(ps[0]!.row.goldShare);
    expect(ps[1]!.row.yBg).toBe(ps[0]!.row.yBg);
  });

  test("the candidate left standing is inside the corpus median", () => {
    // Step 3 (`L` 0.891) is the page's recommendation. Its ink is brighter than
    // rung 8's and dimmer than the corpus median (0.912) — the field's number,
    // not ours, as the upper reference.
    const step3 = ps[2]!;
    expect(step3.row.lFg).toBeGreaterThan(ps[0]!.row.lFg);
    expect(step3.row.lFg).toBeLessThan(0.912);
    expect(step3.row.yFg).toBeLessThan(0.8);
  });

  test("the text names what held and what would stop it", () => {
    const t = perturbText(ps);
    expect(t).toContain("the ground is held");
    expect(t).toContain(`${BAND.prose[1]}:1`);
    expect(t).toContain("12:1");
    expect(t).toContain("the hex is the referent, the request is the intent");
  });
});

describe("the perturbation page — its table is its own arithmetic", () => {
  const DOC = join(import.meta.dir, "..", "docs", "2026-11-15-rung-panel.md");
  const rows = (): string[][] =>
    readFileSync(DOC, "utf8")
      .split("\n")
      .filter((l) => /^\| \d\.\d{3} \| #[0-9a-f]{6} \|/.test(l))
      .map((l) => l.split("|").map((c) => c.trim()));

  test("every perturbation row recomputes from the hex in its own row", () => {
    const table = rows();
    expect(table.length).toBe(perturbInk().length);
    for (const cells of table) {
      const hex = cells[2]!;
      const ground = "#221f1c"; // stated in the page's prose and in the grid title
      const row = measurePair({ n: 0, name: "row", bg: ground, fg: hex });
      expect(cells[3]).toBe(row.yFg.toFixed(3));
      expect(cells[4]).toBe(`${row.ratio.toFixed(1)}:1`);
      expect(cells[5]).toBe(row.lift.toFixed(3));
      expect(cells[6]).toBe((row.watched["strong"] ?? 0).toFixed(2));
      expect(cells[7]).toBe(row.goldShare.toFixed(2));
      expect(cells[8]).toBe(STANDING_MARK[standing(row)]);
      // the asked lightness is the hex's achieved one, to a quantisation step
      expect(Math.abs(Number(cells[1]) - row.lFg)).toBeLessThan(0.003);
      expect(luminance(hex)).toBeCloseTo(row.yFg, 9);
      expect(ratio(hex, ground)).toBeCloseTo(row.ratio, 9);
    }
  });

  test("the page carries the image, the finding and the two guards", () => {
    const page = readFileSync(DOC, "utf8");
    expect(page).toContain("![the ink perturbation](2026-11-15-ink-perturbation.png)");
    expect(page).toContain("is route-blind");
    expect(page).toContain("What bounds the ink route is `Y_fg`, not prose");
  });
});
