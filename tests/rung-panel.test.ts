import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BAND,
  CEILING_L,
  FLOOR_PROSE,
  PAIRS,
  STANDING_MARK,
  measureLines,
  oklch,
  oklchL,
  oklchText,
  panelLine,
  panelLines,
  rows,
  standing,
  tierLines,
  tiers,
  type Row,
} from "../scripts/contrast";

// The panel page is the eyeball on the arithmetic, and its labels are the one
// place where a *picture* of the ladder is compared with a *table* of it. So the
// page is pinned the way the ground page is pinned: every line rendered by the
// instrument and asserted here, so the PNG's strips and the page's list cannot
// quote different numbers and the page cannot quietly go stale.
//
// The two opinions this file turns into checks are the ones the range question
// rests on: which rungs are comfortable, and whether an ink-side measure could
// have told us instead of the ground.

const DOC = join(import.meta.dir, "..", "docs", "2026-11-15-rung-panel.md");
const page = (): string => readFileSync(DOC, "utf8");

const at = (n: number): Row => rows().find((r) => r.n === n)!;

describe("the rung panel — the page is the instrument's rendering", () => {
  test("every rung on the page is the instrument's own line, verbatim", () => {
    const text = page();
    for (const line of panelLines()) expect(text).toContain(line);
  });

  test("the tier block on the page is the instrument's own, verbatim", () => {
    const text = page();
    for (const line of tierLines()) expect(text).toContain(line);
  });

  test("panelLine is measureLines and a standing — there is no third renderer", () => {
    // The PNG's label strips call `measureLines`; the page's list calls
    // `panelLine`, which is that same pair of strings. Asserted structurally so
    // a future edit cannot give the page its own formatting of the same facts.
    for (const r of rows().filter((x) => !x.refused)) {
      const rendered = panelLine(r);
      expect(rendered).toContain(`- **${r.n} · ${r.name}** — ${STANDING_MARK[standing(r)]}`);
      for (const line of measureLines(r)) expect(rendered).toContain(`  - ${line}`);
    }
  });

  test("the panel draws nine admissible rungs and refuses the tenth", () => {
    // Rung 7 is out of the grid on purpose, and the page says so. If a future
    // edit included it, the picture would be making a claim the verdicts deny.
    expect(panelLines()).toHaveLength(PAIRS.filter((p) => !p.refused).length);
    expect(panelLines().join("\n")).not.toContain("lifted ground");
    expect(page()).toContain("**Rung 7 is refused and excluded**");
  });

  test("the page names its instruments — a claimed fact names how it was made", () => {
    expect(page()).toContain("scripts/contrast.ts");
    expect(page()).toContain("scripts/surface-panel.ts");
    expect(page()).toContain("tests/rung-panel.test.ts");
  });
});

describe("the band — three tiers, and the rungs that sit in them", () => {
  test("the band is 6 and 8, and nothing else", () => {
    // The comfortable interval is the narrow one the measured walk settled on.
    // Asserted by rung number: a palette or pair change that moved a rung into
    // or out of the band would fail here, which is the point — the band is a
    // claim about what reads well, and it is not allowed to drift silently.
    expect(tiers().comfort).toEqual([6, 8]);
  });

  test("the tiers partition the admissible rungs — no rung stands in two", () => {
    const t = tiers();
    const all = [...t.comfort, ...t.region, ...t.outside].sort((a, b) => a - b);
    expect(all).toEqual(rows().filter((r) => !r.refused).map((r) => r.n));
    expect(new Set(all).size).toBe(all.length);
  });

  test("the refused rung is in no tier: a glare refusal is not a legibility verdict", () => {
    expect([...tiers().comfort, ...tiers().region, ...tiers().outside]).not.toContain(7);
  });

  test("standing() agrees with the intervals it names", () => {
    for (const r of rows()) {
      if (r.refused) continue;
      const inBand =
        r.lBg >= BAND.groundL[0] && r.lBg <= BAND.groundL[1] &&
        r.ratio >= BAND.prose[0] && r.ratio <= BAND.prose[1];
      if (inBand) expect(standing(r)).toBe("comfort");
      else if (r.lBg <= CEILING_L && r.ratio >= FLOOR_PROSE) expect(standing(r)).toBe("region");
      else expect(standing(r)).toBe("outside");
    }
  });
});

describe("the two opinions the range question rests on", () => {
  // The verdicts on the record (docs/2026-10-28-the-ground-you-read-on.md:95):
  // rungs 1–3 rejected as "too dim", 4–6 and 8 kept, 9 the floor test, 7 refused
  // as emitted light, 0 the control. These are a reader's judgements, not
  // arithmetic, so they are a fixture with a citation — and everything derived
  // from them is checkable.
  const KEPT = [4, 5, 6, 8];
  const REJECTED_INK = [1, 2, 3];

  test("the ground alone separates every kept rung from every ink-rejected one", () => {
    // The sharpest claim on the page, and the reason it can be stated at all:
    // no kept rung's ground is as light as any rejected rung's. The whole verdict
    // set is one threshold on one axis, which is why "where are we happy" has a
    // one-interval answer at all.
    const deepestKept = Math.max(...KEPT.map((n) => at(n).lBg));
    const shallowestRejected = Math.min(...REJECTED_INK.map((n) => at(n).lBg));
    expect(deepestKept).toBeLessThan(shallowestRejected);
  });

  test("the lift does not separate them — the negative the page turns on", () => {
    // And this is why a second ink-side measure cannot repair the ratio's
    // blindness: the ranges overlap, so a threshold on `lift` would refuse a rung
    // the reader kept. Checked as an overlap rather than a specific pair, so it
    // survives a pair change that keeps the finding true.
    const kept = KEPT.map((n) => at(n).lift);
    const rejected = REJECTED_INK.map((n) => at(n).lift);
    expect(Math.min(...kept)).toBeLessThan(Math.max(...rejected));
  });

  test("the two rows of the grid are opposite trades, not two depths", () => {
    // Top row: the ground is held and the lift falls. Bottom row: the ink is held
    // and the lift rises. That is what the page means by "opposite trades", and
    // it is a property of the set, not a sentence about it.
    const top = REJECTED_INK.map((n) => at(n));
    for (const r of top) expect(r.lBg).toBeCloseTo(at(0).lBg, 6); // ground held
    for (let i = 1; i < top.length; i++) expect(top[i]!.lift).toBeLessThan(top[i - 1]!.lift);

    const bottom = [6, 8, 9].map((n) => at(n));
    for (const r of bottom) expect(r.lFg).toBeCloseTo(at(6).lFg, 6); // ink held
    for (let i = 1; i < bottom.length; i++) {
      expect(bottom[i]!.lBg).toBeLessThan(bottom[i - 1]!.lBg);
      expect(bottom[i]!.lift).toBeGreaterThan(bottom[i - 1]!.lift);
    }
  });

  test("the amber's early warning agrees with the band's far edge", () => {
    // The page calls amber the early-warning channel and says it crosses 13:1
    // before anything looks wrong. It crosses at exactly one rung, and that rung
    // is the deepest admissible ground and the only one whose prose passes 11:1 —
    // two independent boundaries meeting on the rung the stop rule was written
    // for. If a pair change moved that, the page's agreement claim is false.
    const crossing = rows().filter((r) => (r.watched["state-todo"] ?? 0) >= 13);
    expect(crossing.map((r) => r.n)).toEqual([9]);
    expect(crossing[0]!.ratio).toBeGreaterThan(BAND.prose[1]);
  });
});

describe("oklch — the triple, and the hue that is not there", () => {
  test("the scale's ends, and mid grey where the eye puts it", () => {
    expect(oklch("#000000").L).toBeCloseTo(0, 3);
    expect(oklch("#ffffff").L).toBeCloseTo(1, 3);
    expect(oklch("#808080").L).toBeGreaterThan(0.55);
    expect(oklch("#808080").L).toBeLessThan(0.65);
  });

  test("oklchL is the L of the triple — no second implementation to drift", () => {
    for (const p of PAIRS) {
      expect(oklchL(p.bg)).toBe(oklch(p.bg).L);
      expect(oklchL(p.fg)).toBe(oklch(p.fg).L);
    }
  });

  test("an achromatic colour prints no hue — a number with no referent is a defect", () => {
    // White's chroma is 0.000 and its angle is atan2 of two zeros: arithmetic
    // noise. A page that prints `90°` there is inviting the reader to read
    // meaning into it, and the reader will.
    expect(oklch("#ffffff").C).toBeLessThan(0.002);
    expect(oklchText("#ffffff")).toEndWith("—");
    expect(oklchText("#000000")).toEndWith("—");
  });

  test("the grounds are chromatic and their hues part warm from cool", () => {
    // The page's hue claim, checked: the cool rungs cluster near 264° and the
    // warm walk near 67–78°, and the warm grounds carry visibly less chroma.
    const cool = [0, 4, 5].map((n) => oklch(at(n).bg));
    const warm = [6, 8, 9].map((n) => oklch(at(n).bg));
    for (const c of cool) expect(c.h).toBeGreaterThan(250);
    for (const w of warm) expect(w.h).toBeLessThan(90);
    expect(Math.max(...warm.map((w) => w.C))).toBeLessThan(Math.min(...cool.map((c) => c.C)));
  });

  test("the lift is the triples' difference, for every rung", () => {
    for (const r of rows()) expect(r.lift).toBeCloseTo(r.lFg - r.lBg, 9);
  });
});
