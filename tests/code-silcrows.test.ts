import { describe, expect, test } from "bun:test";
import { commentRegions, wrapWholeFile, renderDocument } from "../src/render";
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

  test("a code render paints the comment callsign and leaves the string literal bare", async () => {
    const regions = commentRegions(CODE);
    const map = jumpMapFor(CODE, makeSilcrowGate("demo.ts", process.cwd()), regions);
    expect([...map.values()]).toEqual(["ADR-031"]); // UTF-8 gated, string excluded
    const annotated = annotateSource(CODE, map, regions);
    const body = appendReferences(wrapWholeFile("demo.ts", annotated), map, true);
    const out = stripANSI(await renderDocument(body, { width: 100, color: "none" }));

    const commentLine = lines(out).find((l) => l.includes("a comment citing"));
    expect(commentLine).toContain("§");
    const fixtureLine = lines(out).find((l) => l.includes("const fixture"));
    expect(fixtureLine).not.toContain("§");
    expect(out).toContain("## References");
    expect(lines(out).some((l) => l.includes("ADR-031"))).toBe(true);
  });

  test("an authored markdown fence still paints nothing", () => {
    expect(scanReferences("```ts\n// cites ADR-031\n```\n")).toEqual([]);
  });

  test("no vector token leaks into the render", async () => {
    const regions = commentRegions(CODE);
    const map = jumpMapFor(CODE, makeSilcrowGate("demo.ts", process.cwd()), regions);
    const out = await renderDocument(
      wrapWholeFile("demo.ts", annotateSource(CODE, map, regions)),
      { width: 100, color: "none" },
    );
    expect(out.includes("%okuda-vector")).toBe(false);
  });
});
