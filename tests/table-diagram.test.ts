import { describe, expect, test } from "bun:test";
import { renderDocument } from "../src/render";
import { DEFAULT_PALETTE } from "../src/palette";
import { displayWidth, stripANSI } from "../src/width";

const W = 64;

describe("render — tables (uniform presentation policy)", () => {
  test("header cyan+bold, rule kept, amber first column, loose rows", async () => {
    const out = await renderDocument(
      "| Name | Qty |\n|---|---|\n| x | 1 |\n| y | 2 |\n",
      { width: W },
    );
    const ls = out.split("\n").map((l) => l.trim() === "" ? "" : l);
    // header row: pine bold
    expect(out).toContain("\x1b[1;38;2;49;116;143m");
    // rule under header
    expect(ls[1]).toMatch(/^│?\x1b\[38;2;110;106;134m─+/);
    // amber key column
    expect(out).toContain("\x1b[1;38;2;246;193;119m");
    // blank line between body rows
    const bodyStart = ls.findIndex((l) => l.includes("246;193;119"));
    expect(ls[bodyStart + 1]).toBe("");
    // no internal pipes or box borders in rendered rows
    expect(out).not.toMatch(/\x1b\[0m\s*\|/);
  });

  test("alignment markers preserved: centre and right", async () => {
    const out = await renderDocument(
      "| L | C | R |\n|---|:---:|--:|\n| left | centre | right |\n",
      { width: W },
    );
    const ls = out.split("\n");
    const dataLine = ls.find((l) => stripANSI(l).includes("centre"));
    expect(dataLine).toBeDefined();
    // centre: content has leading spaces within the padded cell
    expect(stripANSI(dataLine!)).toMatch(/left\s+centre\s+right/);
    // the header "C" is centred: spaces on both sides
    const headerLine = ls.find((l) => stripANSI(l).trim().startsWith("L"));
    expect(stripANSI(headerLine!)).toMatch(/L\s+C\s+R/);
  });

  test("right-aligned column pads on the left", async () => {
    const out = await renderDocument(
      "| n |\n|--:|\n| 7 |\n| 42 |\n",
      { width: W },
    );
    const l7 = out.split("\n").find((l) => stripANSI(l).includes("7"));
    // "7" is right-aligned in a column of width 2: leading space
    expect(stripANSI(l7!)).toMatch(/\s7/);
  });

  test("fits the terminal width — never overflows", async () => {
    const wide = Array.from({ length: 5 }, (_, i) =>
      `cell-${i}-${"x".repeat(18)}`,
    ).join(" | ");
    const src = `| a | b | c | d | e |\n|--|--|--|--|--|\n| ${wide} |\n`;
    const out = await renderDocument(src, { width: 40 });
    for (const l of out.split("\n")) {
      expect(displayWidth(l)).toBeLessThanOrEqual(40);
    }
  });

  test("no artificial floor — narrow table stays narrow", async () => {
    const out = await renderDocument("| a | b |\n|--|--|\n| 1 | 2 |\n", { width: W });
    const widest = Math.max(...out.split("\n").map((l) => displayWidth(l)));
    expect(widest).toBeLessThan(20);
  });

  test("inline styles inside cells survive", async () => {
    const out = await renderDocument(
      "| k |\n|--|\n| **bold** cell |\n",
      { width: W },
    );
    expect(out).toContain("\x1b[1;38;2;235;188;186mbold\x1b[0m");
  });

  test("table inside code fence renders verbatim (no presentation layer)", async () => {
    const src = "```\n| a | b |\n|---|---|\n| 1 | 2 |\n```";
    const out = await renderDocument(src, { width: W });
    expect(out).toContain("| a | b |");
    expect(out).toContain("|---|---|");
    expect(out).not.toContain("1;38;2;49;116;143"); // no header colour
  });
});

// ── Mermaid ───────────────────────────────────────────────────────────

const MERMAID_SRC = "flowchart LR\n  A[Input v2.0] --> B[Render]\n";

describe("render — mermaid pipe + colour classification", () => {
  test("mermaid fence replaced by classified ASCII art", async () => {
    const out = await renderDocument("```mermaid\n" + MERMAID_SRC + "```\n", {
      width: W,
      palette: DEFAULT_PALETTE,
    });
    // border channel muted, arrow channel link-coloured, text full contrast
    expect(out).toContain("\x1b[38;2;110;106;134m"); // border
    expect(out).toContain("\x1b[38;2;156;207;216m"); // arrow
    expect(out).toContain("\x1b[38;2;224;222;244m"); // text
    // the mermaid source itself must not leak
    expect(out).not.toContain("flowchart LR");
    expect(out).not.toContain("-->");
    // node label survived
    expect(out).toContain("Input v2.0");
  });

  test("every coloured diagram line ends with reset (hygiene rule 4)", async () => {
    const out = await renderDocument("```mermaid\n" + MERMAID_SRC + "```\n", {
      width: W,
      palette: DEFAULT_PALETTE,
    });
    const art = out.split("\n").filter((l) => l.includes("38;2;"));
    for (const l of art) expect(l.endsWith("\x1b[0m")).toBe(true);
  });

  test("no ASCII character is ever an arrow: v2.0 label stays text", async () => {
    const out = await renderDocument("```mermaid\n" + MERMAID_SRC + "```\n", {
      width: W,
      palette: DEFAULT_PALETTE,
    });
    // find the "Input v2.0" label span: text-channel coloured, and the
    // arrow colour sequence must never wrap an ASCII ^v>< or alphanumerics
    const arrowRuns = out.match(/\x1b\[38;2;156;207;216m[^\x1b]*\x1b\[0m/g) ?? [];
    for (const run of arrowRuns) {
      const content = run.replace(/\x1b\[[0-9;]*m/g, "");
      for (const ch of content) {
        expect(ch).toMatch(/[▲▼◄►▶◁△▽●×✕]/);
      }
    }
  });

  test("NO_COLOR: diagram bytes identical to the binary's art", async () => {
    const plain = await renderDocument("```mermaid\n" + MERMAID_SRC + "```\n", {
      width: W,
      color: "none",
    });
    expect(plain).not.toContain("\x1b");
    // compare against a direct binary run
    const proc = Bun.spawn(
      [`${process.env.HOME}/.local/bin/mermaid-to-md`],
      { stdin: "pipe", stdout: "pipe" },
    );
    proc.stdin.write(MERMAID_SRC);
    proc.stdin.end();
    const bin = await new Response(proc.stdout).text();
    const art = bin.match(/```text\n([\s\S]*?)\n?```/)?.[1] ??
      "";
    const trimmed = art.replace(/^\n+/, "").replace(/\n+$/, "");
    for (const artLine of trimmed.split("\n")) {
      if (artLine.trim() !== "") expect(plain).toContain(artLine);
    }
  });

  test("diagram never wraps even when wider than terminal", async () => {
    // A naturally-wide LR flowchart whose ASCII art is one long line.
    const wide =
      "flowchart LR\n  A[Alpha] --> B[Beta] --> C[Gamma] --> B[Delta] --> E[Epsilon] --> F[Zeta] --> G[Eta]";
    const out = await renderDocument("```mermaid\n" + wide + "```\n", {
      width: 30,
      palette: DEFAULT_PALETTE,
    });
    // The widest art line must exceed the terminal width — okuda did not wrap it.
    const widest = Math.max(...out.split("\n").map((l) => displayWidth(l)));
    expect(widest).toBeGreaterThan(30);
  });

  test("missing binary: fence dropped silently, document renders", async () => {
    const out = await renderDocument(
      "# Doc\n\n```mermaid\nflowchart LR\n  A --> B\n```\n\nTail\n",
      { width: W, mermaidBin: "/nonexistent/mermaid-to-md", color: "none" },
    );
    expect(out).toContain("Doc");
    expect(out).toContain("Tail");
    expect(out).not.toContain("okuda-mmd");
    expect(out).not.toContain("flowchart");
  });

  test("palette override of diagram-arrow takes effect", async () => {
    const palette = { ...DEFAULT_PALETTE, "diagram-arrow": "#010203" };
    const out = await renderDocument("```mermaid\n" + MERMAID_SRC + "```\n", {
      width: W,
      palette,
    });
    expect(out).toContain("\x1b[38;2;1;2;3m");
    expect(out).not.toContain("38;2;156;207;216");
  });
});

// ── Classification unit tests ─────────────────────────────────────────

import { classifyChar } from "../src/render";

describe("classifyChar — three channels, Unicode-only arrows", () => {
  test("box drawing → border", () => {
    for (const ch of "─│┌┐└┘├┤┬┴┼╭╮╰╯╌".split("")) {
      expect(classifyChar(ch)).toBe("border");
    }
  });

  test("unicode arrows → arrow", () => {
    for (const ch of "▲▼◄►▶".split("")) {
      expect(classifyChar(ch)).toBe("arrow");
    }
  });

  test("ASCII never classified as arrow (v2.0, x > 5 stay text)", () => {
    for (const ch of "^v><V2.0x ".split("")) {
      expect(classifyChar(ch)).toBe("text");
    }
  });
});
