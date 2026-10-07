import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { displayWidth } from "../src/width";

const CLI = join(import.meta.dir, "..", "src", "cli.ts");
const DOC = join(import.meta.dir, "..", "docs", "showcase.md");

/** Run the real CLI (no TTY) and return its stdout. */
function run(args: string[]): { out: string; code: number } {
  const p = Bun.spawnSync(["bun", "run", CLI, ...args], { stdout: "pipe", stderr: "pipe" });
  return { out: p.stdout.toString(), code: p.exitCode };
}

/** Every emitted line, minus ANSI, measured. */
function widest(out: string): number {
  let max = 0;
  for (const line of out.split("\n")) {
    const w = displayWidth(line.replace(/\x1b\[[0-9;]*m/g, ""));
    if (w > max) max = w;
  }
  return max;
}

describe("--width — a panel is not a terminal (BRF-KINDLE-PORCH)", () => {  test("the declared glass is honoured, and honoured exactly", () => {
    // Piped output has no TTY, so without the flag the renderer falls back
    // to 80 — the whole point of declaring it. 63 is a Paperwhite-shaped
    // cell count.
    for (const cols of [40, 63, 100]) {
      const { out, code } = run([DOC, "--no-color", "--width", String(cols)]);
      expect(code).toBe(0);
      expect(widest(out)).toBeLessThanOrEqual(cols);
    }
  });

  test("a narrow glass wraps rather than eliding the prose (elision is for art)", () => {
    const wide = run([DOC, "--no-color", "--width", "100"]).out;
    const narrow = run([DOC, "--no-color", "--width", "40"]).out;
    expect(narrow.split("\n").length).toBeGreaterThan(wide.split("\n").length);
  });

  test("--no-color strips every hue — and keeps bold and italic, by design", () => {
    const { out } = run([DOC, "--no-color", "--width", "63"]);
    // No colour of any kind: no truecolour fg/bg, no 16-colour hue set.
    expect(out).not.toMatch(/\x1b\[(3[0-79]|4[0-79]|9[0-7]|38;5;|48;5;|38;2;|48;2;)[0-9;]*m/);
    // Weight and slant survive — roleBold emits a standalone SGR 1, which
    // is why bold outlives NO_COLOR (the voice relies on it). A sink that
    // wants *no escapes at all* needs the plain dial, not --no-color.
    expect(out).toMatch(/\x1b\[1m/);
    expect(out).toMatch(/\x1b\[0m/);
  });

  test("a bad width fails loudly rather than silently rendering at 80", () => {
    for (const bad of ["abc", "0", "5"]) {
      const { code } = run([DOC, "--width", bad]);
      expect(code).toBe(1);
    }
    const { code } = run([DOC, "--width"]);
    expect(code).toBe(1);
  });

  test("the flag is advertised in usage", () => {
    const { out } = run(["--help"]);
    expect(out).toContain("--width <cols>");
  });
});
