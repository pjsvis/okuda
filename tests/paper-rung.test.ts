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
