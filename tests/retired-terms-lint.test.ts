import { describe, expect, test } from "bun:test";
import { allowed, violations } from "../scripts/retired-terms-lint";

// The term is written from parts so this fixture file is itself clean — the
// gate allows it, but a fixture that needs its own entry is a smell.
const T = "okuda" + "gram";

describe("retired terms — the living surface (ADR-RETIRE-OKUDAGRAM-066)", () => {
  test("a record's address is allowed, a living path is not", () => {
    expect(allowed("docs/2026-08-31-the-same-okudagram.md")).toBe(true);
    expect(allowed("briefs/2026-08-29-brief-okudagram-frame.md")).toBe(true);
    expect(allowed(".archive/briefs/2026-09-07-brief-okudagram-step.md")).toBe(true);
    expect(allowed("decisions/018-retire-the-okw-term.md")).toBe(true);
    expect(allowed("briefs/index.md")).toBe(true);
    expect(allowed("docs/ideas.md")).toBe(true);

    expect(allowed("src/frames.ts")).toBe(false);
    expect(allowed("playbooks/authoring-playbook.md")).toBe(false);
    expect(allowed("docs/style-guide.md")).toBe(false);
    expect(allowed("README.md")).toBe(false);
  });

  test("a living file carrying the term is a violation", () => {
    const hits = violations(["src/frames.ts", "docs/style-guide.md"], (f) =>
      f === "src/frames.ts" ? "the frames.ts helpers" : `The header opens the ${T} — badge left`,
    );
    expect(hits).toEqual([{ file: "docs/style-guide.md", term: T, by: "ADR-RETIRE-OKUDAGRAM-066", count: 1 }]);
  });

  test("a callsign is data, and is not an occurrence", () => {
    // The common noun is stripped out; the callsign remains and is allowed.
    const text = `the ${T} frame (BRF-PAGED-OKUDAGRAM, BRF-OKUDAGRAM-STEP)`;
    const hits = violations(["src/tui.ts"], () => text);
    expect(hits.map((h) => h.count)).toEqual([1]);
    // ...and a file whose only mention is a callsign is clean.
    expect(violations(["src/tui.ts"], () => "see BRF-OKUDAGRAM-STEP for the strides")).toEqual([]);
  });

  test("a retired term may name itself in the retiring document", () => {
    expect(violations(["decisions/066-retire-the-okudagram-term.md"], () => T)).toEqual([]);
    expect(violations(["docs/ideas.md"], () => T)).toEqual([]);
  });

  test("a filename carries the term as surely as its prose", () => {
    const hits = violations(["scripts/okudagram-probe.ts"], () => "prints numbers");
    expect(hits.map((h) => h.term)).toEqual([T]);
  });

  test("a reference to a dated record is an address, not a use", () => {
    const refs = `see docs/2026-08-27-${T}-scratchpad.md and \`briefs/2026-08-29-brief-${T}-frame.md\``;
    expect(violations(["playbooks/x.md"], () => refs)).toEqual([]);
    // a bare filename without a slash is still an address
    expect(violations(["playbooks/x.md"], () => `${T}-scratchpad.md`)).toEqual([]);
    // ...but a slash alone is not an address: this is prose.
    expect(violations(["src/keygrammar.ts"], () => `// 01 — frame/${T} mode`)[0]!.count).toBe(1);
  });

  test("OKW is retired too, and is case-sensitive on the word", () => {
    expect(violations(["playbooks/x.md"], () => "the OKW term")[0]!.term).toBe("OKW");
    expect(violations(["playbooks/x.md"], () => "an okw-ish token")).toEqual([]);
  });
});
