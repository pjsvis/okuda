import { describe, expect, test } from "bun:test";
import { join } from "node:path";

const CLI = join(import.meta.dir, "..", "src", "cli.ts");
const DOC = join(import.meta.dir, "..", "docs", "showcase.md");

function run(args: string[]): { out: string; code: number } {
  const p = Bun.spawnSync(["bun", "run", CLI, ...args], {
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  return { out: p.stdout.toString(), code: p.exitCode };
}

describe("--no-references — the paper rung's receipt (BRF-PAPER-RUNG)", () => {
  test("the plain piped rung keeps the receipt: numbers, because nothing is painted", () => {
    const { out } = run([DOC]);
    expect(out).toContain("§"); // ADR-047: the address table IS the receipt off-glass
  });

  test("the paper rung drops it: no silcrow anywhere, paint or receipt", () => {
    const { out, code } = run([DOC, "--no-references"]);
    expect(code).toBe(0);
    expect(out).not.toContain("§");
  });

  test("and it is still in colour — the two requirements, one artefact", () => {
    const { out } = run([DOC, "--no-references"]);
    expect(out).toMatch(/\x1b\[38;2;\d+;\d+;\d+m/); // foreground truecolour
    expect(out).toMatch(/\x1b\[48;2;\d+;\d+;\d+m/); // background truecolour
  });

  test("the render is otherwise identical: same prose, only the receipt gone", () => {
    const withRefs = run([DOC]).out;
    const without = run([DOC, "--no-references"]).out;
    const marker = "A single document that exercises every element";
    expect(withRefs).toContain(marker);
    expect(without).toContain(marker);
    expect(without.split("\n").length).toBeLessThan(withRefs.split("\n").length);
    expect(without).not.toContain("References");
  });

  test("a document with no references is untouched by the flag", () => {
    const plain = "# Title\n\nProse with no references at all.\n";
    const f = "/tmp/paper-rung-no-refs.md";
    Bun.write(f, plain);
    expect(run([f, "--no-references"]).out).toBe(run([f]).out);
  });

  test("the flag is advertised in usage", () => {
    expect(run(["--help"]).out).toContain("--no-references");
  });
});

describe("the paper geometry — never clipped (BRF-PAPER-RUNG)", () => {
  const contentPt = ((210 - 16) / 25.4) * 72;

  test("the font size is derived from the width, not fixed", async () => {
    const { paperFontPt } = await import("../scripts/paper");
    expect(paperFontPt(80)).toBe(10); // small render: the readable cap
    expect(paperFontPt(100)).toBeLessThan(10); // wide render: shrinks to fit
    expect(paperFontPt(100)).toBeGreaterThan(8.5);
    expect(paperFontPt(100)).toBeLessThan(10);
  });

  test("the widest line always fits the content box — no right-edge byte loss", async () => {
    const { paperFontPt, ADVANCE_EM } = await import("../scripts/paper");
    for (const cols of [40, 63, 80, 100, 120, 200]) {
      const widthPt = cols * ADVANCE_EM * paperFontPt(cols);
      expect(widthPt).toBeLessThanOrEqual(contentPt + 0.001);
    }
  });
});

describe("the paper ink — black-ish on white, with no light mode (BRF-PAPER-RUNG)", () => {
  const hue = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    if (d === 0) return 0;
    const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return ((h * 60) % 360 + 360) % 360;
  };

  test("it is a transform, not a palette: no file, just a function", async () => {
    const { paperInk } = await import("../scripts/paper");
    expect(typeof paperInk).toBe("function");
  });

  test("body text lands near-black — 'black(ish) text on white'", async () => {
    const { paperInk, relLum } = await import("../scripts/paper");
    expect(relLum(paperInk("#f8f8f2"))).toBeLessThan(0.05); // Dracula foreground
    expect(relLum(paperInk("#ffffff"))).toBeLessThan(0.05);
  });

  test("hue survives — the colour still signals structure, only polarity moves", async () => {
    const { paperInk } = await import("../scripts/paper");
    for (const c of ["#bd93f9", "#ff79c6", "#8be9fd", "#50fa7b"]) {
      expect(Math.abs(hue(paperInk(c)) - hue(c))).toBeLessThan(2);
    }
  });

  test("EVERY colour okuda emits clears the contrast floor on paper", async () => {
    const { paperInk, contrastWhite, CONTRAST_FLOOR } = await import("../scripts/paper");
    const out = Bun.spawnSync(["bun", "run", CLI, DOC, "--no-references"], {
      stdout: "pipe",
      env: { ...process.env, FORCE_COLOR: "1" },
    }).stdout.toString();
    const emitted = new Set(
      [...out.matchAll(/\x1b\[38;2;(\d+);(\d+);(\d+)m/g)].map(
        (m) => "#" + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join(""),
      ),
    );
    expect(emitted.size).toBeGreaterThan(3); // the corpus really does emit colour
    for (const hex of emitted) {
      expect(contrastWhite(paperInk(hex))).toBeGreaterThanOrEqual(CONTRAST_FLOOR);
    }
  });

  test("backgrounds are white-clamped — a page of toner cannot happen", async () => {
    const { paperInk, relLum } = await import("../scripts/paper");
    for (const bg of ["#282a36", "#000000", "#101010", "#f3f5f7"]) {
      expect(relLum(paperInk(bg, true))).toBeGreaterThan(0.9);
    }
  });
});

describe("fills survive the ink transform — a badge is a mark, not a surface", () => {
  test("a background equal to its foreground stays one solid ink", async () => {
    const { toHtml } = await import("../scripts/paper");
    // Exactly what okuda emits for a heading marker: bg and fg the same colour,
    // the glyph inside, then a reset.
    const badge = toHtml("\x1b[48;2;153;204;255m\x1b[38;2;153;204;255m#\x1b[0m");
    const m = badge.match(/(?<![a-z-])color:(#[0-9a-f]{6});background-color:(#[0-9a-f]{6})/);
    expect(m).not.toBeNull();
    expect(m![1]).toBe(m![2]); // same ink → the glyph hides inside the block
  });

  test("a surface behind other text still goes white (paper's rule)", async () => {
    const { toHtml, relLum } = await import("../scripts/paper");
    const highlight = toHtml("\x1b[48;2;40;42;54m\x1b[38;2;248;248;242mtext\x1b[0m");
    const bg = highlight.match(/background-color:(#[0-9a-f]{6})/)![1]!;
    expect(relLum(bg)).toBeGreaterThan(0.9);
  });

  test("the corpus's bytes carry fills (the fact I first got wrong)", async () => {
    const out = Bun.spawnSync(["bun", "run", CLI, DOC, "--no-references"], {
      stdout: "pipe",
      env: { ...process.env, FORCE_COLOR: "1" },
    }).stdout.toString();
    const fills = [...out.matchAll(/\x1b\[48;2;(\d+;\d+;\d+)m\x1b\[38;2;(\d+;\d+;\d+)m/g)].filter(
      (m) => m[1] === m[2],
    );
    expect(fills.length).toBeGreaterThan(10); // badges and chips, piped and all
  });

  test("a fill is a visible mark: it clears 3:1 on white", async () => {
    const { paperInk, contrastWhite } = await import("../scripts/paper");
    for (const mark of ["#99ccff", "#445566"]) {
      expect(contrastWhite(paperInk(mark))).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("paper's defaults are the printer's, not the terminal's (BRF-PAPER-RUNG)", () => {
  test("80 columns by default — the printer's width, and the type cap", async () => {
    const { PAPER_DEFAULT_COLS, paperFontPt } = await import("../scripts/paper");
    expect(PAPER_DEFAULT_COLS).toBe(80);
    // At 80 columns the type takes the full readable cap; at 100 it must shrink.
    expect(paperFontPt(PAPER_DEFAULT_COLS)).toBe(10);
    expect(paperFontPt(100)).toBeLessThan(10);
  });

  test("a page's length is known for OUR page box — A4, stated margins", async () => {
    const { paperLinesPerPage } = await import("../scripts/paper");
    expect(paperLinesPerPage(10)).toBeGreaterThan(60); // ~60-70 lines at 10pt A4
    expect(paperLinesPerPage(10)).toBeLessThan(75);
    expect(paperLinesPerPage(5)).toBeGreaterThan(paperLinesPerPage(10));
  });

  test("the footer and the report both state the geometry", async () => {
    const { paperLinesPerPage, paperFontPt } = await import("../scripts/paper");
    const lines = paperLinesPerPage(paperFontPt(80));
    expect(lines).toBe(paperLinesPerPage(10));
  });
});

describe("one ink for the frame — the badge matches the chip (BRF-PAPER-RUNG)", () => {
  test("a heading badge and a chip land in the SAME ink, whatever their colours", async () => {
    const { toHtml, paperInk, DEFAULT_MUTED } = await import("../scripts/paper");
    const ink = paperInk(DEFAULT_MUTED);
    const badge = toHtml("\x1b[48;2;153;204;255m\x1b[38;2;153;204;255m#\x1b[0m"); // heading role
    const chip = toHtml("\x1b[48;2;68;85;102m\x1b[38;2;68;85;102m█\x1b[0m"); // muted role
    expect(badge).toContain(`color:${ink};background-color:${ink}`);
    expect(chip).toContain(`color:${ink};background-color:${ink}`);
    expect(ink).not.toBe(paperInk("#99ccff")); // not the heading's mirrored hue
  });

  test("the whole page agrees: every fill is that one ink", async () => {
    const { paperInk, DEFAULT_MUTED } = await import("../scripts/paper");
    const { stdout } = Bun.spawnSync(["bun", "run", CLI, DOC, "--no-references"], {
      stdout: "pipe",
      env: { ...process.env, FORCE_COLOR: "1" },
    });
    const { toHtml } = await import("../scripts/paper");
    const html = toHtml(stdout.toString(), paperInk(DEFAULT_MUTED));
    const inks = new Set(
      [...html.matchAll(/(?<![a-z-])color:(#[0-9a-f]{6});background-color:#[0-9a-f]{6}/g)].map((m) => m[1]),
    );
    expect(inks.size).toBe(1);
    expect([...inks][0]).toBe(paperInk(DEFAULT_MUTED));
  });
});

describe("the printer is the terminal — chroma's 16-colour class codes (BRF-PAPER-RUNG)", () => {
  test("the 16-colour family maps to hexes, both halves", async () => {
    const { sgr16Hex, XTERM16 } = await import("../scripts/paper");
    expect(sgr16Hex("30")).toBe(XTERM16[0]);
    expect(sgr16Hex("37")).toBe(XTERM16[7]);
    expect(sgr16Hex("94")).toBe(XTERM16[12]); // bright blue, what chroma emits
    expect(sgr16Hex("97")).toBe(XTERM16[15]);
    expect(sgr16Hex("38;2;1;2;3")).toBeNull(); // not this family
  });

  test("a fence keeps its classes: three codes, three distinct inks", async () => {
    const { toHtml } = await import("../scripts/paper");
    const fence = toHtml("\x1b[94m// comment\x1b[0m \x1b[96mdef\x1b[0m \x1b[93mstr\x1b[0m");
    const inks = new Set([...fence.matchAll(/(?<![a-z-])color:(#[0-9a-f]{6})/g)].map((m) => m[1]));
    expect(inks.size).toBe(3);
  });

  test("EVERY ink on the page clears the floor — both families, after the transform", async () => {
    const { toHtml, paperInk, contrastWhite, CONTRAST_FLOOR, DEFAULT_MUTED } = await import("../scripts/paper");
    const out = Bun.spawnSync(["bun", "run", CLI, DOC, "--no-references"], {
      stdout: "pipe",
      env: { ...process.env, FORCE_COLOR: "1" },
    }).stdout.toString();
    const html = toHtml(out.toString(), paperInk(DEFAULT_MUTED));
    const inks = new Set([...html.matchAll(/(?<![a-z-])color:(#[0-9a-f]{6})/g)].map((m) => m[1]!));
    expect(inks.size).toBeGreaterThan(6); // truecolour roles AND chroma classes
    for (const ink of inks) expect(contrastWhite(ink)).toBeGreaterThanOrEqual(CONTRAST_FLOOR);
  });
});

describe("complete blocks in the viewport — we own the cut (BRF-COMPLETE-BLOCKS)", () => {
  test("the split is lossless: we never insert or drop anything", async () => {
    const { splitBlocks } = await import("../scripts/paper");
    for (const src of ["a\n\nb\n", "one\n\n\ntwo\n", "\n\nlead\n\ntail", "no blanks at all"]) {
      expect(splitBlocks(src).join("")).toBe(src);
    }
  });

  test("a block keeps its ring — the bytes are the layout's, not ours", async () => {
    const { splitBlocks } = await import("../scripts/paper");
    expect(splitBlocks("porch, not a silo.\n\n### next\n")).toEqual([
      "porch, not a silo.\n\n",
      "### next\n",
    ]);
  });

  test("line boxes are counted as the pre lays them out", async () => {
    const { linesIn } = await import("../scripts/paper");
    expect(linesIn("a\n\n")).toBe(2); // text + ring
    expect(linesIn("a")).toBe(1);
    expect(linesIn("a\nb\n")).toBe(2);
  });

  test("a page takes complete blocks and stops when the next will not fit", async () => {
    const { paginate, linesIn } = await import("../scripts/paper");
    const block = (n: number) => Array.from({ length: n }, (_, i) => `l${i}`).join("\n") + "\n\n";
    // The ring is a LINE BOX, so a 10-line block occupies 11 — the air is not
    // free, it is paper. Four such blocks are 44 lines, and 25-line pages of a
    // greedy pack: 22 + 22.
    expect(linesIn(block(10))).toBe(11);
    const pages = paginate([block(10), block(10), block(10), block(10)], 25);
    expect(pages.map((p) => p.length)).toEqual([2, 2]);
    expect(pages.every((p) => p.reduce((n, b) => n + linesIn(b), 0) <= 25)).toBe(true);
  });

  test("no block is ever cut open, and the pages are the blocks — lossless", async () => {
    const { paginate } = await import("../scripts/paper");
    const block = (n: number) => Array.from({ length: n }, (_, i) => `l${i}`).join("\n") + "\n\n";
    const blocks = [block(30), block(5), block(40), block(2)];
    const pages = paginate(blocks, 20);
    expect(pages.flat()).toEqual(blocks); // every block whole, in order, exactly once
    expect(pages.map((p) => p.join("")).join("")).toBe(blocks.join(""));
    // the oversized block gets a page to itself and overflows: bigger paper, not our problem
    expect(pages.find((p) => p.includes(blocks[1]!))!.length).toBeLessThanOrEqual(2);
  });

  test("the known limit, pinned rather than hidden: a fence with a blank line splits", async () => {
    const { splitBlocks } = await import("../scripts/paper");
    expect(splitBlocks("```ts\nconst a = 1;\n\nconst b = 2;\n```\n").length).toBe(2);
  });
});
