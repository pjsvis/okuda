import { describe, expect, test } from "bun:test";
import { declaredDate, nameDate } from "../scripts/date-lint";

describe("date lint — the name's claim (BRF-DATE-INVARIANT)", () => {
  test("the ISO prefix is read, and only the prefix", () => {
    expect(nameDate("docs/2026-10-08-the-filename-is-a-record.md")).toBe("2026-10-08");
    expect(nameDate("briefs/2026-08-27-brief-artpack-aesthetics.md")).toBe("2026-08-27");
    // a date elsewhere in the name is not the record's date
    expect(nameDate("decisions/055-table-edge-cut.md")).toBeNull();
    expect(nameDate("docs/tables.md")).toBeNull();
    // malformed: not zero-padded, not at the head
    expect(nameDate("briefs/2026-8-27-brief.md")).toBeNull();
    expect(nameDate("briefs/x-2026-08-27-brief.md")).toBeNull();
  });

  test("the declared date is frontmatter or **Date:**, never **Created:**", () => {
    expect(declaredDate("---\ntype: Brief\ndate: 2026-10-08\n---\n# X")).toBe("2026-10-08");
    expect(declaredDate("# X\n\n**Date:** 2026-08-30\n**Status:** Done")).toBe("2026-08-30");
    // a creation stamp is a different fact, not the document's date
    expect(declaredDate("**Created:** 2026-08-26\n**TD:** …")).toBeNull();
    expect(declaredDate("# X\n\n> Logged 2026-08-30.\n")).toBeNull();
  });

  test("the invariant is equality, and absence is not a contradiction", () => {
    const agrees = (path: string, content: string) => {
      const n = nameDate(path);
      const d = declaredDate(content);
      return n === null || d === null || n === d;
    };
    // the ancestors' header, after the landing-date fix
    const ancestor = "**Date:** 2026-10-08\n**Written:** 2026-08-03\n";
    expect(agrees("docs/2026-10-08-ai-human-development-workflow-01.md", ancestor)).toBe(true);
    // a name that lies about its own record fails
    expect(agrees("docs/2026-10-08-ai-human-development-workflow-01.md", "**Date:** 2026-08-03\n")).toBe(false);
    // no declared date is uncorroborated, not a violation (reported separately)
    expect(agrees("docs/2026-08-30-naming-like-nasa.md", "# Naming like NASA\n")).toBe(true);
    // an undated name (ADR numbering) is outside the invariant
    expect(agrees("decisions/055-table-edge-cut.md", "**Date:** 2026-10-07\n")).toBe(true);
  });
});
