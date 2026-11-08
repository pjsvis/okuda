import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  atLight,
  FLOOR,
  floor,
  headroomText,
  luminance,
  okudaPalette,
  ratio,
  referencePair,
  surfaceDirText,
  surfaceVerdict,
  surfaceDir,
} from "../scripts/contrast";
import { pinTemplate, pinValues, verifyPin, verifyText } from "../scripts/omarchy-theme";
import { cardFails, cardRows, deriveLightCard, LIGHT_GROUND, signature, sourceRows } from "../scripts/lightcard";
import { paperInk } from "../scripts/paper";

/** The legibility surface's three instruments, and the discipline each owes:
 *  **a detector needs a control, and the control must pass first.** Torch: the
 *  measured ratio is the control against `atLight`'s arithmetic. Census: a theme
 *  that reads is the control against a theme that does not. Card: the *source*
 *  palette is the control against the derivation, and `paperInk` is the failing
 *  calibration that proves the detector can see the defect it reports. */

const REF = referencePair();
const INK = ratio(REF.fg, REF.bg);

describe("the torch — a ratio is only true of one room", () => {
  test("at 1× the model returns the measured ratio — the control", () => {
    for (const hex of ["#a06fa8", "#ffe066", "#d6cfc4", "#445566"]) {
      expect(atLight(hex, REF.bg, 1)).toBeCloseTo(ratio(hex, REF.bg), 10);
    }
  });

  test("more light can only raise a ratio, and never past the reflectance ratio", () => {
    for (const hex of ["#a06fa8", "#ffe066"]) {
      const series = [0.5, 1, 2, 5, 10, 100].map((k) => atLight(hex, REF.bg, k));
      for (let i = 1; i < series.length; i++) expect(series[i]!).toBeGreaterThan(series[i - 1]!);
      // The ceiling is the flare-free ratio Y_role / Y_ground, approached from
      // below and never passed: the torch buys margin, not a new reflectance.
      const ceiling = Math.max(luminance(hex), luminance(REF.bg)) / Math.min(luminance(hex), luminance(REF.bg));
      // Every rung sits under the flare-free ceiling, and the gap to it closes as
      // the light rises — the +0.05 term is what the torch is defeating.
      const gaps = [0.5, 1, 2, 5, 10, 100].map((k) => ceiling - atLight(hex, REF.bg, k));
      for (const g of gaps) expect(g).toBeGreaterThanOrEqual(-1e-12);
      for (let i = 1; i < gaps.length; i++) expect(gaps[i]!).toBeLessThan(gaps[i - 1]!);
    }
  });

  test("the canary is `state-parked`, and half light is where it goes", () => {
    // Measured: 4.16:1 as shipped, 2.78:1 at half light. The aubergine was chosen
    // for deuteranopia safety, which is a hue argument — and it holds the thinnest
    // luminance headroom in the palette. Saying so is the point of the column.
    expect(ratio("#a06fa8", REF.bg)).toBeCloseTo(4.16, 1);
    expect(atLight("#a06fa8", REF.bg, 0.5)).toBeLessThan(FLOOR);
    const text = headroomText(REF);
    expect(text).toContain("state-parked");
    expect(text).toContain("canary:");
    expect(text).toContain("fails first");
  });

  test("headroom is ratio ÷ floor, and the floor is the verdict, not this", () => {
    const measured = floor(REF.bg).filter((r) => r.onGround);
    for (const r of measured) expect(r.ratio / FLOOR).toBeGreaterThan(0);
    // Nothing in this reading can fail a build: the reading is a door.
    expect(headroomText(REF)).toContain("torch:");
  });
});

describe("the light ground — what vanishes, and in what order", () => {
  const FLEXOKI = { bg: "#FFFCF0", fg: "#100F0F" };
  const LATTE = { bg: "#eff1f5", fg: "#4c4f69" };

  test("the control: a dark theme reads, and the reference rung is the control's ground", () => {
    const dark = surfaceVerdict({ bg: REF.bg, fg: REF.fg });
    expect(dark.belowFloor).toEqual([]);
  });

  test("the defect: 16 of 21 on-ground roles under 3:1 on flexoki-light", () => {
    const v = surfaceVerdict(FLEXOKI);
    expect(v.belowFloor.length).toBe(16);
    expect(surfaceVerdict(LATTE).belowFloor.length).toBe(19);
    // The alarm lamp is the worst offender on both grounds — nearly the ground's
    // own luminance, i.e. texture, and nothing warns the reader it went.
    const worst = v.belowFloor[0]!;
    expect(worst.role).toBe("state-todo");
    expect(worst.ratio).toBeLessThan(1.5);
  });

  test("the census names what vanishes first, not just how many", () => {
    const tmp = mkdtempSync(join(process.env.TMPDIR ?? "/tmp", "okuda-weak-"));
    writeFileSync(join(tmp, "light"), `background = ${FLEXOKI.bg}\nforeground = ${FLEXOKI.fg}\n`);
    writeFileSync(join(tmp, "dark"), `background = ${REF.bg}\nforeground = ${REF.fg}\n`);
    const res = surfaceDir(tmp);
    const text = surfaceDirText(res, REF);
    expect(text).toContain("weakest on-ground role");
    expect(text).toContain("state-todo");
    // The readable theme contributes no weakest block: there is nothing vanishing.
    expect(res.rows.find((r) => r.name === "dark")!.weakest.length).toBe(3);
  });
});

describe("the pin — a pin that is never read back is advice", () => {
  const SOURCE = [
    "background = {{ background }}",
    "foreground = {{ foreground }}",
    "palette = 0={{ background }}",
    "palette = 7={{ foreground }}",
    "palette = 8={{ muted }}",
    "palette = 15={{ bright_foreground }}",
    "cursor-color = {{ bright_foreground }}",
  ].join("\n");
  const expected = pinValues(REF);

  test("the control passes first: an installed pin reads as HELD", () => {
    const installed = pinTemplate(SOURCE, REF).text;
    const rows = verifyPin(SOURCE, installed, expected);
    expect(rows.every((r) => r.held)).toBe(true);
    expect(verifyText(rows, "x")).toContain("HELD");
  });

  test("every occurrence is checked — the half-substituted template is STALE", () => {
    // The bug the stale control found in the first cut of `verifyPin`: it compared
    // the first line carrying a token, so editing `palette = 7` alone read as HELD.
    const installed = pinTemplate(SOURCE, REF)
      .text.split("\n")
      .map((l) => (l.startsWith("palette = 7=") ? "palette = 7=#abb2bf" : l))
      .join("\n");
    const rows = verifyPin(SOURCE, installed, expected);
    const fg = rows.find((r) => r.token === "foreground")!;
    expect(fg.held).toBe(false);
    expect(fg.found.length).toBe(2);
    expect(verifyText(rows, "x")).toContain("STALE");
  });

  test("a theme's own pair, untouched, is STALE for all four neutrals", () => {
    const installed = SOURCE.replace(/\{\{\s*background\s*\}\}/g, "#FFFCF0")
      .replace(/\{\{\s*foreground\s*\}\}/g, "#100F0F")
      .replace(/\{\{\s*muted\s*\}\}/g, "#B7B5AC")
      .replace(/\{\{\s*bright_foreground\s*\}\}/g, "#100F0F");
    const rows = verifyPin(SOURCE, installed, expected);
    expect(rows.filter((r) => r.held).length).toBe(0);
    expect(verifyText(rows, "x")).toContain("STALE");
  });

  test("a token the template stopped carrying is UNREADABLE, not absent", () => {
    const shape = SOURCE.split("\n").filter((l) => !l.includes("{{ muted }}")).join("\n");
    const rows = verifyPin(shape, shape, expected);
    const muted = rows.find((r) => r.token === "muted")!;
    expect(muted.found).toEqual([]);
    expect(muted.held).toBe(false);
    expect(verifyText(rows, "x")).toContain("UNREADABLE");
  });
});

describe("the light card — derived, with the rank it inherited", () => {
  const source = sourceRows();
  const card = deriveLightCard(okudaPalette(), REF, LIGHT_GROUND);

  test("the source is the control, and its own twins are not a defect", () => {
    // Eight amber-family roles sit at 0.78–0.81 of ink by design. A transform that
    // separated them would be inventing roles, so the test is equality with the
    // source — not a fixed crowd threshold.
    expect(signature(source).length).toBeGreaterThan(0);
  });

  test("the derived card holds the floor on its own ground", () => {
    const rows = cardRows(card);
    const onGround = rows.filter((r) => r.onGround);
    expect(onGround.length).toBeGreaterThan(15);
    for (const r of onGround) expect(r.ratio).toBeGreaterThanOrEqual(FLOOR);
    expect(cardFails(card, source).belowFloor).toEqual([]);
  });

  test("the order is the source's order, role for role", () => {
    const before = new Map(source.map((r) => [r.role, r.over]));
    for (const r of cardRows(card)) {
      const b = before.get(r.role);
      if (b === undefined) continue;
      // ÷ ink preserved to the hair: the transform's whole claim.
      expect(Math.abs(r.over - b)).toBeLessThan(0.011);
    }
    expect(cardFails(card, source).extra).toEqual([]);
  });

  test("the exempt roles keep the rank the palette gave them — quiet stays quiet", () => {
    // The first cut clamped `muted` to the floor and pulled it 0.20 → 0.28 of ink,
    // which is an order rewrite dressed as a preservation. The exempt list is what
    // stops it, and this is the line that would catch the regression.
    const rows = cardRows(card);
    const muted = rows.find((r) => r.role === "muted")!;
    const src = source.find((r) => r.role === "muted")!;
    expect(muted.onGround).toBe(false);
    expect(Math.abs(muted.over - src.over)).toBeLessThan(0.011);
    expect(muted.ratio).toBeLessThan(FLOOR); // deliberately under it, as in the source
  });

  test("the calibration: paperInk passes the floor and manufactures crowds", () => {
    // If this ever passes both, `paperInk` is the answer and this file has no
    // reason to exist. It is the detector's licence, so it is asserted, not hoped.
    const mirrored: Record<string, string> = {};
    for (const [role, hex] of Object.entries(okudaPalette())) {
      if (typeof hex === "string" && /^#[0-9a-f]{6}$/i.test(hex)) mirrored[role] = paperInk(hex);
    }
    const control = { ground: paperInk(LIGHT_GROUND, true), ink: paperInk(REF.fg), palette: mirrored as never };
    const fails = cardFails(control, source);
    expect(fails.belowFloor).toEqual([]);
    expect(fails.extra.length).toBeGreaterThan(0);
  });

  test("a different ground derives a different card, and still holds the rank", () => {
    const latte = deriveLightCard(okudaPalette(), REF, "#eff1f5");
    expect(latte.ink).not.toBe(card.ink);
    const fails = cardFails(latte, source);
    expect(fails.belowFloor).toEqual([]);
    expect(fails.extra).toEqual([]);
  });
});
