import { describe, expect, test } from "bun:test";
import { commentRegions, regionsForFile, wrapWholeFile, renderDocument } from "../src/render";
import { scanReferences, jumpMapFor, annotateSource, appendReferences } from "../src/vectors";
import { stripANSI } from "../src/width";
import { makeSilcrowGate } from "../src/root";

/** A code file: one comment reference, one string literal holding the same
 *  token as data, one unresolved shape in a comment. */
const CODE = [
  "// a comment citing ADR-031 for the doc",
  'const fixture = "ADR-031"; // string data, not a reference',
  "// an unresolved shape: UTF-8 is not a document",
].join("\n");

const lines = (s: string) => s.split("\n");

describe("code-comment silcrows (BRF-CODE-SILCROWS)", () => {
  test("commentRegions spans line, inline, and multi-line block comments", () => {
    const src = "/* ADR-031 opens\n   still inside */ const x = 1;\n// ADR-032 closes\n";
    const r = commentRegions(src);
    expect(r(src.indexOf("ADR-031"))).toBe(true);
    expect(r(src.indexOf("still inside"))).toBe(true);
    expect(r(src.indexOf("const x"))).toBe(false);
    expect(r(src.indexOf("ADR-032"))).toBe(true);
  });

  test("regionsForFile: comments for a code file, undefined for markdown", () => {
    const code = regionsForFile("demo.ts", "// cites ADR-031");
    expect(code).toBeDefined();
    expect(code!("// cites ADR-031".indexOf("ADR-031"))).toBe(true);
    expect(regionsForFile("doc.md", "see ADR-031")).toBeUndefined();
    expect(regionsForFile(null, "// cites ADR-031")).toBeUndefined();
  });

  test("a scheme colon is not a comment start", () => {
    const src = 'const u = "https://example.com/ADR-031";\n';
    const r = commentRegions(src);
    expect(r(src.indexOf("ADR-031"))).toBe(false);
  });

  test("discovery admits the comment callsign, not the string-literal twin", () => {
    const regions = commentRegions(CODE);
    const targets = scanReferences(CODE, undefined, regions).map((x) => x.target);
    expect(targets).toContain("ADR-031");
    expect(targets.filter((t) => t === "ADR-031")).toHaveLength(1); // the string is data
  });

  // Both colour modes: plain is where a fenced token happens to paint, and
  // truecolor is the one the glass actually uses — chroma colours the fence
  // before any handler runs, so the token must survive to finalize
  // (found 2026-10-12: the first version leaked in truecolor only).
  for (const color of ["none", "truecolor"] as const) {
    test(`a code render paints the comment callsign (${color}) and leaves the string literal bare`, async () => {
      const regions = commentRegions(CODE);
      const map = jumpMapFor(CODE, makeSilcrowGate("demo.ts", process.cwd()), regions);
      expect([...map.values()]).toEqual(["ADR-031"]); // UTF-8 gated, string excluded
      const annotated = annotateSource(CODE, map, regions);
      const body = appendReferences(wrapWholeFile("demo.ts", annotated), map, true);
      const out = stripANSI(await renderDocument(body, { width: 100, color }));

      expect(/okuda-(?:vector|codevec):\d/.test(out)).toBe(false); // no leak, either mode
      const commentLine = lines(out).find((l) => l.includes("a comment citing"));
      expect(commentLine).toContain("§");
      const fixtureLine = lines(out).find((l) => l.includes("const fixture"));
      expect(fixtureLine).not.toContain("§");
      expect(out).toContain("## References");
    });
  }

  test("an authored markdown fence still paints nothing", () => {
    expect(scanReferences("```ts\n// cites ADR-031\n```\n")).toEqual([]);
  });

  test("no injected marker leaks into the render (both modes)", async () => {
    const regions = commentRegions(CODE);
    const map = jumpMapFor(CODE, makeSilcrowGate("demo.ts", process.cwd()), regions);
    for (const color of ["none", "truecolor"] as const) {
      const out = await renderDocument(
        wrapWholeFile("demo.ts", annotateSource(CODE, map, regions)),
        { width: 100, color },
      );
      expect(/okuda-(?:vector|codevec):\d/.test(out)).toBe(false);
    }
  });
});
