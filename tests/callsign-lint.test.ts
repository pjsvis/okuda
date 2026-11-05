import { describe, expect, test } from "bun:test";
import { extractCallsigns, messageViolations, unresolvableCitations } from "../scripts/callsign-lint";
import { judge, tally } from "../scripts/td-id-lint";

describe("callsign lint — the token families (BRF-CALLSIGN-CHECKSUM)", () => {
  test("every registry family matches; ordinal prose forms included", () => {
    for (const cs of [
      "BRF-ROOT-CONTAINMENT",
      "ADR-030", // the ordinal prose form — one token
      "ADR-UNIVERSAL-ELISION-050",
      "ADV-THE-PILE",
      "DBF-REGISTRY-TRUTH",
      "PLY-BRIEFS",
      "OKF-V02-019",
      "CSN-EXAMPLE",
    ]) {
      expect(extractCallsigns(`see ${cs} for the work`)).toEqual([cs]);
    }
  });

  test("near-misses stand: lowercase, unknown family, hyphen-tail", () => {
    expect(extractCallsigns("brf-foo bar")).toEqual([]); // lowercase is not a citation
    expect(extractCallsigns("OKUDA-CLONE cmd")).toEqual([]); // OKU is not a family
    expect(extractCallsigns("BRF-")).toEqual([]); // no segments
  });

  test("a family prefix inside a longer token is ONE token, never a fragment", () => {
    // Left-to-right alternation: BRF-OKF-CALLSIGN is consumed whole —
    // the census proved the tokenizer must never see OKF-CALLSIGN
    // inside a registered BRF. (Never .test() the shared global — a
    // global regex is stateful across .test() calls and matchAll
    // inherits the poisoned lastIndex; extractCallsigns resets it.)
    expect(extractCallsigns("the BRF-OKF-CALLSIGN migration")).toEqual([
      "BRF-OKF-CALLSIGN",
    ]);
    expect(extractCallsigns("see OKF-CALLSIGN here")).toEqual(["OKF-CALLSIGN"]); // standalone still matches
  });
});

describe("callsign lint — message violations (both valves, resolver injected)", () => {
  const resolves = (t: string) => (t === "BRF-KNOWN" ? "briefs/x.md" : null);

  test("a td ID in a message is a valve violation", () => {
    expect(messageViolations("fix the thing (td-c05892)", resolves)).toEqual([
      "td ID in message: td-c05892",
    ]);
  });

  test("an unresolvable callsign is a checksum violation", () => {
    expect(messageViolations("ship it (BRF-PHANTOM)", resolves)).toEqual([
      "unresolvable callsign: BRF-PHANTOM",
    ]);
  });

  test("a resolvable callsign passes clean", () => {
    expect(messageViolations("ship it (BRF-KNOWN)", resolves)).toEqual([]);
  });

  test("both valves in one message, td ID named first", () => {
    expect(messageViolations("(td-123456, BRF-PHANTOM)", resolves)).toEqual([
      "td ID in message: td-123456",
      "unresolvable callsign: BRF-PHANTOM",
    ]);
  });
});

describe("callsign lint — the corpus core and the swap hole", () => {
  // The resolver is the oracle, injected — so the corpus gate's own reading
  // is testable without the filesystem (the export convention the tests cite,
  // tests/ref-census.test.ts:9).
  const resolve = (t: string) => (t === "BRF-KNOWN" ? "briefs/x.md" : null);

  test("only unresolvable citations are the gate's tokens", () => {
    expect(unresolvableCitations("BRF-KNOWN and BRF-PHANTOM", resolve)).toEqual(["BRF-PHANTOM"]);
    expect(unresolvableCitations("nothing to see", resolve)).toEqual([]);
  });

  test("a swap at count parity fails the checksum — the hole this closes", () => {
    // Before: one grandfathered dead name. After: it is gone and a DIFFERENT
    // dead name took its place, same count. `BRF-COUNT-BASELINE-TOKENS`.
    const before = tally(unresolvableCitations("see BRF-OLD-DEAD", resolve));
    const after = tally(unresolvableCitations("see BRF-NEW-DEAD", resolve));
    expect(Object.values(before)[0]).toBe(Object.values(after)[0]); // count parity
    const j = judge(after, before);
    expect(j.verdict).toBe("violation");
    expect(j.newTokens).toEqual(["BRF-NEW-DEAD"]);
    expect(j.shrunk).toEqual([["BRF-OLD-DEAD", 0, 1]]);
  });

  test("the same citation twice over its grandfathered count fails", () => {
    const j = judge(tally(["BRF-OLD-DEAD", "BRF-OLD-DEAD"]), tally(["BRF-OLD-DEAD"]));
    expect(j.verdict).toBe("violation");
    expect(j.grown).toEqual([["BRF-OLD-DEAD", 2, 1]]);
  });
});
