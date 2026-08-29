import { describe, expect, test } from "bun:test";
import {
  avoidingCollisions,
  bootstrapCallsign,
  docCallsign,
  ensureFrontmatter,
  fmValue,
  renderIndexDoc,
  splitFrontmatter,
} from "../scripts/reg-sync";

describe("splitFrontmatter", () => {
  test("splits a fenced document", () => {
    const { fm, rest } = splitFrontmatter("---\ntype: Brief\n---\n\n# Title\n");
    expect(fm).toBe("type: Brief");
    expect(rest).toBe("\n# Title\n");
  });

  test("no fence → null fm, rest is the document", () => {
    const { fm, rest } = splitFrontmatter("# Title\n\nBody\n");
    expect(fm).toBeNull();
    expect(rest).toBe("# Title\n\nBody\n");
  });

  test("a later fence is not frontmatter", () => {
    const { fm } = splitFrontmatter("# Title\n\n---\n\ntype: not-fm\n");
    expect(fm).toBeNull();
  });
});

describe("fmValue", () => {
  test("reads a one-line key", () => {
    expect(fmValue("type: Brief\ncallsign: BRF-X", "callsign")).toBe("BRF-X");
  });

  test("absent key → null; quoted values unwrap", () => {
    expect(fmValue("type: Brief", "callsign")).toBeNull();
    expect(fmValue('name: "okuda"', "name")).toBe("okuda");
  });
});

describe("ensureFrontmatter", () => {
  test("prepends a fence to a bare document", () => {
    const out = ensureFrontmatter("# Title\n", "Brief", "BRF-X")!;
    expect(out).toBe("---\ntype: Brief\ncallsign: BRF-X\n---\n\n# Title\n");
  });

  test("inserts missing keys without clobbering existing ones", () => {
    const out = ensureFrontmatter("---\ndate: 2026-08-29\n---\n# T\n", "Debrief", "DBF-X")!;
    expect(out).toBe("---\ntype: Debrief\ncallsign: DBF-X\ndate: 2026-08-29\n---\n# T\n");
  });

  test("conformant document → null (idempotent)", () => {
    expect(ensureFrontmatter("---\ntype: ADR\ncallsign: ADR-X-001\n---\n# T\n", "ADR", "ADR-Y-002")).toBeNull();
  });

  test("an assigned callsign is never overwritten", () => {
    const out = ensureFrontmatter("---\ncallsign: BRF-OLD\n---\n# T\n", "Brief", "BRF-NEW");
    expect(out).toBe("---\ntype: Brief\ncallsign: BRF-OLD\n---\n# T\n");
  });
});

describe("docCallsign", () => {
  test("reads through from raw content", () => {
    expect(docCallsign("---\ncallsign: PLY-REGISTRY\n---\n# T\n")).toBe("PLY-REGISTRY");
    expect(docCallsign("# No fence\n")).toBeNull();
  });
});

describe("bootstrapCallsign", () => {
  test("brief: date + class prefix stripped, stopwords dropped, ≤2 tokens", () => {
    expect(bootstrapCallsign("2026-08-28-brief-index-and-jump.md", "BRF")).toBe("BRF-INDEX-JUMP");
  });

  test("decision: numeric sequence appended, zero-padded", () => {
    expect(bootstrapCallsign("021-jump-token-numbering-offset.md", "ADR")).toBe("ADR-JUMP-TOKEN-021");
  });

  test("debrief: class prefix stripped after date", () => {
    expect(bootstrapCallsign("2026-08-27-debrief-launcher-loop-runTui-blocks.md", "DBF")).toBe("DBF-LAUNCHER-LOOP");
  });

  test("playbook: the tier's own noun carries no signal", () => {
    expect(bootstrapCallsign("registry-playbook.md", "PLY")).toBe("PLY-REGISTRY");
  });

  test("no significant tokens → deterministic fallback", () => {
    expect(bootstrapCallsign("playbooks-playbook.md", "PLY")).toBe("PLY-DOC");
  });
});

describe("avoidingCollisions", () => {
  test("clean base passes through", () => {
    expect(avoidingCollisions("BRF-X", new Set())).toBe("BRF-X");
  });

  test("collision → -2, then -3 (first-come keeps the clean form)", () => {
    const taken = new Set(["BRF-X", "BRF-X-2"]);
    expect(avoidingCollisions("BRF-X", taken)).toBe("BRF-X-3");
  });
});

describe("renderIndexDoc", () => {
  test("shape: generated frontmatter, newest-first rows, deterministic bytes", () => {
    const entries = [
      { file: "a.md", date: "2026-08-28", status: "open", summary: "Older", callsign: "BRF-OLD" },
      { file: "b.md", date: "2026-08-29", status: "done", summary: "Newer | with pipe" },
    ];
    const doc = renderIndexDoc("briefs", entries);
    expect(doc.startsWith("---\ntype: Index\ngenerated: true\n---\n")).toBe(true);
    expect(doc).toContain("# briefs — silo index");
    expect(doc).toContain("| Date | Callsign | Status | Document | File |");
    // newest first; absent callsign renders empty; pipes escaped
    const rows = doc.split("\n").filter((l) => l.startsWith("| 2026"));
    expect(rows[0]).toContain("|  | done | Newer \\| with pipe | b.md |");
    expect(rows[1]).toContain("| BRF-OLD | open | Older | a.md |");
    expect(renderIndexDoc("briefs", entries)).toBe(doc); // deterministic
  });
});
