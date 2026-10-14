import { describe, expect, test } from "bun:test";
import { frontmatter, parseBriefs, survey } from "../scripts/debrief-link-lint";

const fm = (body: string) => `---\ntype: Debrief\ncallsign: DBF-X\n${body}\n---\n\n# Debrief: X\n`;

describe("debrief linkage — the edge a landing pass reads (ADR-RECORD-LINKAGE-065)", () => {
  test("present, empty, and absent are three different things", () => {
    expect(parseBriefs(frontmatter(fm("briefs: [BRF-A]")))).toEqual({ present: true, callsigns: ["BRF-A"] });
    expect(parseBriefs(frontmatter(fm("briefs: []")))).toEqual({ present: true, callsigns: [] });
    expect(parseBriefs(frontmatter(fm("tags: [a]")))).toEqual({ present: false });
    // no frontmatter at all is absent, not empty
    expect(parseBriefs(frontmatter("# Debrief: X\n"))).toEqual({ present: false });
  });

  test("a malformed value is reported with its raw text", () => {
    expect(parseBriefs(frontmatter(fm("briefs: BRF-A")))).toEqual({ present: true, malformed: "BRF-A" });
    expect(parseBriefs(frontmatter(fm("briefs:")))).toEqual({ present: true, malformed: "" });
  });

  test("a list is a list, and whitespace is not a member", () => {
    expect(parseBriefs(frontmatter(fm("briefs: [BRF-A, BRF-B]")))).toEqual({
      present: true,
      callsigns: ["BRF-A", "BRF-B"],
    });
  });

  test("a declared callsign that does not resolve is named, dead", () => {
    const files = ["debriefs/a.md", "debriefs/b.md", "debriefs/c.md"];
    const read = (f: string) =>
      f.endsWith("a.md") ? fm("briefs: [BRF-LIVE, BRF-DEAD]") : f.endsWith("b.md") ? fm("briefs: []") : fm("tags: [x]");
    const links = survey(files, read, (cs) => (cs === "BRF-LIVE" ? "briefs/x.md" : null));
    expect(links[0]!.dead).toEqual(["BRF-DEAD"]);
    expect(links[1]!.dead).toEqual([]);
    expect(links[1]!.field).toEqual({ present: true, callsigns: [] });
    expect(links[2]!.field).toEqual({ present: false });
  });

  test("the frontmatter splitter takes the first block only", () => {
    expect(frontmatter(fm("briefs: []"))).toContain("callsign: DBF-X");
    expect(frontmatter("# no frontmatter\n---\nbriefs: []\n---\n")).toBeNull();
  });
});
