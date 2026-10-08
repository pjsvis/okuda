import { describe, expect, test } from "bun:test";
import { census } from "../scripts/citation-census";

const cited = (...files: string[]) => new Map([["BRF-X", new Set(files)]]);

describe("citation census — a code nothing cites and no tier explains", () => {
  test("a declared, unregistered, uncited code is a demotion candidate", () => {
    const { candidates } = census(
      [{ file: "docs/a.md", cs: "REF-THING" }],
      new Map(),
      new Map(),
    );
    expect(candidates).toEqual([{ cs: "REF-THING", file: "docs/a.md" }]);
  });

  test("a tier relation earns the code, cited or not", () => {
    const { candidates, uncitedRegistered } = census(
      [{ file: "briefs/b.md", cs: "BRF-X" }],
      new Map([["BRF-X", "briefs/b.md"]]),
      new Map(),
    );
    expect(candidates).toEqual([]);
    // still a reading: nobody speaks it
    expect(uncitedRegistered).toEqual(["BRF-X  briefs/b.md"]);
  });

  test("a citation earns it even without a registry row", () => {
    const { candidates } = census(
      [{ file: "docs/a.md", cs: "BRF-X" }],
      new Map(),
      cited("briefs/other.md"),
    );
    expect(candidates).toEqual([]);
  });

  test("a document citing itself does not earn its own code", () => {
    const { candidates } = census(
      [{ file: "docs/a.md", cs: "REF-THING" }],
      new Map(),
      cited("docs/a.md"),
    );
    expect(candidates).toHaveLength(1);
  });
});
