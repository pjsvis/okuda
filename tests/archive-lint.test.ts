import { describe, expect, test } from "bun:test";
import { checkArchive, type ArchiveConfig } from "../scripts/archive-lint";

const read = (data: Record<string, Array<{ file: string; status: string }>>) =>
  (dir: string, index: string) => data[`${dir}/${index}`] ?? [];

const base: Record<string, ArchiveConfig> = {
  briefs: { dir: "briefs", index: "INDEX.jsonl", defaultStatus: "open", csPrefix: "BRF" },
  ".archive/briefs": { dir: ".archive/briefs", index: "INDEX.jsonl", defaultStatus: "done", archive: true, csPrefix: "BRF" },
};

describe("archive-lint — the scope, the flag and the status (ADR-DOCUMENT-LIFECYCLE-057)", () => {
  test("a consistent configuration is clean", () => {
    const data = {
      "briefs/INDEX.jsonl": [{ file: "a.md", status: "open" }, { file: "b.md", status: "done" }],
      ".archive/briefs/INDEX.jsonl": [{ file: "c.md", status: "done" }],
    };
    const { violations, queue } = checkArchive(base, [".archive/briefs"], read(data));
    expect(violations).toEqual([]);
    // the settled live entry is the move queue, not a fault
    expect(queue).toEqual(["briefs/b.md"]);
  });

  test("the flag and the folder must agree", () => {
    const bad: Record<string, ArchiveConfig> = {
      ...base,
      ".archive/briefs": { ...base[".archive/briefs"]!, archive: false },
    };
    expect(checkArchive(bad, [".archive/briefs"], read({})).violations[0]).toContain("must agree");
  });

  test("an archived document is settled, by construction", () => {
    const data = { ".archive/briefs/INDEX.jsonl": [{ file: "c.md", status: "open" }] };
    const { violations } = checkArchive(base, [".archive/briefs"], read(data));
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('status "open" in an archive tier');
  });

  test("an archive folder with no registry resolves nothing", () => {
    const { violations } = checkArchive(base, [".archive/briefs", ".archive/notes"], read({}));
    expect(violations.some((v) => v.includes(".archive/notes"))).toBe(true);
  });

  test("a registered archive tier with no folder is a missing scope", () => {
    const { violations } = checkArchive(base, [], read({}));
    expect(violations.some((v) => v.includes("no folder"))).toBe(true);
  });
});
