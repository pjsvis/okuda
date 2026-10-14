import { describe, expect, test } from "bun:test";
import { census, parseLedger, parseOutcome, ENTRY } from "../scripts/idea-lint";

const HEAD = `# The idea ledger

**The test for what belongs here.** Does it say *we will*? Then it is a decision.

**How to read an entry**

\`\`\`markdown
- **\`slug\`** · the date raised · \`cluster\` · the outcome
  the idea, in one sentence
  **Trigger:** the observation that would make it worth doing
\`\`\`
`;

describe("idea ledger — the trigger gate (ADR-IDEA-LEDGER-064)", () => {
  test("an entry is a block, and the file's own prose is inert", () => {
    const { ideas, faults } = parseLedger(
      HEAD +
        `
- **\`remote-is-one-decision\`** · 2026-10-14 · \`remote\` · **open**
  Six parked briefs may be one decision rather than six.
  **Trigger:** the parked pile is re-read and the same question is asked of each.
`,
    );
    expect(faults).toEqual([]);
    expect(ideas).toHaveLength(1);
    expect(ideas[0]!.slug).toBe("remote-is-one-decision");
    expect(ideas[0]!.cluster).toBe("remote");
    expect(ideas[0]!.outcome).toBe("open");
    expect(ideas[0]!.trigger).toContain("the parked pile is re-read");
  });

  test("a trigger may wrap, and it is the whole rest of the block", () => {
    const { ideas, faults } = parseLedger(
      HEAD +
        `
- **\`a\`** · 2026-10-14 · \`process\` · **open**
  An idea.
  **Trigger:** a first line of the trigger,
  and a second that continues it.
`,
    );
    expect(faults).toEqual([]);
    expect(ideas[0]!.trigger).toBe("a first line of the trigger, and a second that continues it.");
  });

  test("no trigger is a slogan, and it fails", () => {
    const { ideas, faults } = parseLedger(
      HEAD +
        `
- **\`b\`** · 2026-10-14 · \`record\` · **open**
  An idea with nothing behind it.
`,
    );
    expect(ideas).toHaveLength(1);
    expect(faults).toHaveLength(1);
    expect(faults[0]).toContain("`b` names no trigger");
  });

  test("an outcome outside the vocabulary is a finding, not a synonym", () => {
    const { faults } = parseLedger(
      HEAD +
        `
- **\`c\`** · 2026-10-14 · \`record\` · **done**
  The word is borrowed from another tier.
  **Trigger:** never, because the word is wrong.
`,
    );
    expect(faults).toHaveLength(1);
    expect(faults[0]).toContain("not a word of the vocabulary");
  });

  test("the file's own spec is a fence, and a fence is inert", () => {
    const { ideas, faults } = parseLedger(HEAD);
    expect(ideas).toEqual([]);
    expect(faults).toEqual([]);
  });

  test("a head that opens like an entry but does not parse is named, never skipped", () => {
    const { faults } = parseLedger(
      HEAD +
        `
- **\`d\`** 2026-10-14 \`record\` **open**
  The separators are missing.
  **Trigger:** an observation.
`,
    );
    expect(faults).toHaveLength(1);
    expect(faults[0]).toContain("entry head does not parse");
  });

  test("the outcome vocabulary is three words and two payloads", () => {
    expect(parseOutcome("open")).toEqual({ outcome: "open", onto: "" });
    expect(parseOutcome("promoted: BRF-X")).toEqual({ outcome: "promoted", onto: "BRF-X" });
    expect(parseOutcome("refused: built already")).toEqual({ outcome: "refused", onto: "built already" });
    expect(parseOutcome("deferred")).toBeNull();
    expect(parseOutcome("promoted:")).toBeNull();
  });

  test("the census prints clusters and the falsifier's number", () => {
    const { ideas } = parseLedger(
      HEAD +
        `
- **\`a\`** · 2026-10-14 · \`process\` · **promoted: BRF-X**
  **Trigger:** one.
- **\`b\`** · 2026-10-14 · \`process\` · **open**
  **Trigger:** two.
- **\`c\`** · 2026-10-14 · \`record\` · **refused: not worth it**
  **Trigger:** three.
- **\`d\`** · 2026-10-14 · \`record\` · **open**
  **Trigger:** four.
`,
    );
    const c = census(ideas);
    expect(c.total).toBe(4);
    expect(c.byCluster).toEqual({ process: 2, record: 2 });
    expect(c.byOutcome).toEqual({ open: 2, promoted: 1, refused: 1 });
    expect(c.promotionRatio).toBe(0.25);
    expect(census([]).promotionRatio).toBeNull();
  });

  test("the entry pattern is anchored at column zero", () => {
    expect(ENTRY.test("  - **`a`** · 2026-10-14 · `c` · **open**")).toBe(false);
    expect(ENTRY.test("- `**`slug`**` · the date raised · `cluster` · the outcome")).toBe(false);
    expect(ENTRY.test("- **`a`** · 2026-10-14 · `c` · **open**")).toBe(true);
  });
});
