import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { configFile, oklchL, ratio, rows, rungLine } from "../scripts/contrast";

// The page is a claim set — every ratio on it is arithmetic, so every ratio on it
// can be checked. This file is what makes `docs/2026-10-28-the-ground-you-read-on.md`
// an instrument rather than prose: change a pair, or change a palette hex, and the
// page fails rather than quietly going stale. The generator-drift lesson is
// `just palette-swatch`'s: a derived doc nobody regenerates claimed a hex for weeks.

const DOC = join(
  import.meta.dir,
  "..",
  "docs",
  "2026-10-28-the-ground-you-read-on.md",
);
const CONF = join(import.meta.dir, "..", "docs", "2026-10-28-ghostty-ground.conf");
const page = (): string => readFileSync(DOC, "utf8");
const conf = (): string => readFileSync(CONF, "utf8");

describe("the ground page — pinned against its instrument (ADR-GLASS-INK-073)", () => {
  test("the pasteable file is the instrument's output, byte for byte", () => {
    // The `.conf` is the thing a principal pastes. It is generated, not typed,
    // so the only way it can be wrong is if it is stale — which this catches.
    expect(conf()).toBe(configFile() + "\n");
  });

  test("the pasteable file is inert: every line is a comment", () => {
    // Pasting must be a no-op until a pair is chosen. An active line here would
    // change the reader's terminal the moment they pasted it, before they had
    // decided anything — the whole point of the block's being commented out.
    const active = conf()
      .split("\n")
      .filter((l) => l.trim() !== "" && !l.trimStart().startsWith("#"));
    expect(active).toEqual([]);
  });

  test("the page's fence and the file are the same bytes", () => {
    // Two renderings, one source. The page must stand alone for a reader without
    // the repo; the file must paste without markdown fences. Neither may drift.
    expect(page()).toContain("```ini\n" + configFile() + "\n```");
  });

  test("every rung is one uncomment away: a bg line and an fg line", () => {
    // The dogfood loop is "uncomment two lines, reload". That only works if each
    // rung offers exactly one of each, adjacent, and none of them is active.
    for (const r of rows()) {
      expect(conf()).toContain(`# background = ${r.bg}\n# foreground = ${r.fg}\n`);
    }
  });

  test("the ladder table on the page is the instrument's arithmetic", () => {
    // The stop rule is a judgement ("about 12:1", "0.20"), but the figures it
    // judges are computed — so the four rows it rests on are pinned. Change a
    // pair or a palette hex and the rule's premise is republished or fails.
    const all = rows();
    for (const n of [0, 6, 8, 9]) {
      const r = all.find((x) => x.n === n)!;
      const line =
        `| ${n} | ${r.lBg.toFixed(3)} | ${r.ratio.toFixed(1)}:1 | ` +
        `${(r.watched["muted"] ?? 0).toFixed(2)} | ${(r.watched["state-todo"] ?? 0).toFixed(1)} |`;
      expect(page()).toContain(line);
    }
  });

  test("walking the ladder is deeper, and deeper raises contrast — the U, checked", () => {
    // The page's central warning: going deeper does not keep relaxing the page.
    // Asserted as a property of the set, so a future rung cannot quietly break
    // it without the sentence that depends on it being revisited.
    const all = rows();
    const ladder = [6, 8, 9].map((n) => all.find((r) => r.n === n)!);
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i]!.lBg).toBeLessThan(ladder[i - 1]!.lBg);        // deeper
      expect(ladder[i]!.ratio).toBeGreaterThan(ladder[i - 1]!.ratio); // and higher contrast
    }
  });

  test("every rung on the page is the instrument's own line, verbatim", () => {
    // One line per rung, rendered by the instrument and asserted here: the page
    // cannot drift from the measurement, and a number cannot wrap mid-value —
    // the fields are atomic, which is also why this is a list and not a table.
    const text = page();
    for (const r of rows()) expect(text).toContain(rungLine(r));
  });

  test("the hierarchy holds on every rung: no rule out-shouts the prose", () => {
    // `share` = muted ÷ ink. Above 1 the divider is louder than the thing it
    // divides. The instrument prints it; this is the pass/fail reading.
    for (const r of rows()) expect(r.ruleShare).toBeLessThan(1);
  });

  test("the refused rung is refused by its own ground, and corroborated by its rules", () => {
    // The page says the lifted ground reads as emitted light. That is a claim
    // about the *ground*, so it is checked on the ground: the refused rung must
    // be the lightest in the set — the only one above the control, which was
    // already too bright. Its weakest-in-set `rules` value is the corroboration
    // the instrument can offer, not the reason (the reader's report is).
    const all = rows();
    const refused = all.filter((r) => r.refused);
    expect(refused).toHaveLength(1);
    const lightest = all.reduce((a, b) => (a.lBg >= b.lBg ? a : b));
    expect(refused[0]!.n).toBe(lightest.n);
    const weakest = all.reduce((a, b) => (a.watched["muted"]! <= b.watched["muted"]! ? a : b));
    expect(refused[0]!.n).toBe(weakest.n);
    // And above the control's ground: lifting past the page's own base is the
    // mechanism the page names.
    const control = all.find((r) => r.n === 0)!;
    expect(refused[0]!.lBg).toBeGreaterThan(control.lBg);
  });

  test("the refusal's number is on the page", () => {
    const refused = rows().find((r) => r.refused)!;
    expect(page()).toContain(refused.watched["muted"]!.toFixed(2));
  });

  test("the page names its instrument — a claimed fact names how it was made", () => {
    expect(page()).toContain("scripts/contrast.ts");
    expect(page()).toContain("tests/contrast.test.ts");
  });

  test("a foreground change leaves the palette's contrast alone; a ground change does not", () => {
    // The page's central distinction, asserted rather than asserted-in-prose:
    // rungs 1–3 share one ground with the control, so every role reads the same
    // against it. Rung 4 changes the ground and therefore the roles.
    const [control, r1, r2, r3, r4] = [0, 1, 2, 3, 4].map(
      (n) => rows().find((r) => r.n === n)!,
    );
    for (const r of [r1!, r2!, r3!]) {
      expect(r.watched).toEqual(control!.watched);
    }
    expect(r4!.watched["muted"]).not.toBe(control!.watched["muted"]);
  });
});

describe("the contrast primitives", () => {
  test("ratio is order-free and bounded 1–21", () => {
    expect(ratio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(ratio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(ratio("#282c34", "#282c34")).toBeCloseTo(1, 5);
  });

  test("OKLCH L is perceptual: black 0, white 1, mid grey near 0.6", () => {
    expect(oklchL("#000000")).toBeCloseTo(0, 3);
    expect(oklchL("#ffffff")).toBeCloseTo(1, 3);
    // #808080 is linear-Y ≈ 0.216 (contrast 5.3:1 against white) but reads as
    // ~0.6 in L — the reason the table carries both numbers.
    expect(oklchL("#808080")).toBeGreaterThan(0.55);
    expect(oklchL("#808080")).toBeLessThan(0.65);
  });
});
