import { describe, expect, test } from "bun:test";
import {
  VECTOR_MIN,
  VECTOR_MAX,
  CLONE_TOKEN,
  MAX_REFS,
  discoverReferences,
  buildJumpMap,
  jumpMapFor,
  annotateSource,
} from "../src/vectors";

describe("vectors — discovery (optimistic, reading order, unique)", () => {
  test("callsign-shaped tokens are references", () => {
    const refs = discoverReferences("see ADR-030 and ADR-028 for the wire.");
    expect(refs).toEqual(["ADR-030", "ADR-028"]);
  });

  test("markdown links to .md paths are references (target is the path)", () => {
    const refs = discoverReferences("read [the brief](briefs/2026-09-04-brief-porch-matrix.md) first.");
    expect(refs).toEqual(["briefs/2026-09-04-brief-porch-matrix.md"]);
  });

  test("reading order across both shapes", () => {
    const refs = discoverReferences(
      "first [a doc](docs/x.md), then ADR-030, then [another](docs/y.md).",
    );
    expect(refs).toEqual(["docs/x.md", "ADR-030", "docs/y.md"]);
  });

  test("unique by target — first occurrence wins the number", () => {
    const refs = discoverReferences("ADR-030 early, ADR-028, ADR-030 again.");
    expect(refs).toEqual(["ADR-030", "ADR-028"]);
  });

  test("zero-padded and single-digit bracketed numbers are never vectors", () => {
    const refs = discoverReferences("steps [07] and [3] and even [14] — but 14 has no callsign shape.");
    expect(refs).toEqual([]); // [14] is user text, not a reference
  });

  test("false-positive shapes are optimistic references (the actuator decides)", () => {
    // SSH-2 has callsign shape; discovery paints it; actuation fails honestly.
    expect(discoverReferences("the SSH-2 protocol")).toEqual(["SSH-2"]);
  });

  test("legacy okuda-rhs wiring is not honored — and is not a reference", () => {
    // The legacy row's path lives in an HTML comment as wiring; bare .md
    // paths in prose are provenance (the near/far register), not
    // references. The authored number is not honored. The row is inert.
    const src = "| *slug* | CS | **14** <!-- %%okuda-rhs:14%% briefs/x.md --> |";
    expect(discoverReferences(src)).toEqual([]);
  });

  test("cap: discovery stops at MAX_REFS", () => {
    const src = Array.from({ length: 120 }, (_, i) => `ADR-${1000 + i}`).join(" ");
    const refs = discoverReferences(src);
    expect(refs.length).toBe(MAX_REFS);
    expect(MAX_REFS).toBe(VECTOR_MAX - VECTOR_MIN + 1);
  });
});

describe("vectors — the jump map", () => {
  test("numbers run from 11, in discovery order", () => {
    const map = jumpMapFor("AAA-2 and ADR-002 and [x](docs/z.md).".replace("AAA-2", "ADR-002"));
    expect(map.get(11)).toBe("ADR-002"); // duplicated in prose, deduped in the map
    expect(map.get(12)).toBe("docs/z.md");
    expect(map.has(10)).toBe(false);
    expect(map.has(13)).toBe(false);
  });

  test("buildJumpMap caps at MAX_REFS", () => {
    const refs = Array.from({ length: 120 }, (_, i) => `ADR-${i}`);
    const map = buildJumpMap(refs);
    expect(map.size).toBe(MAX_REFS);
    expect(map.has(VECTOR_MAX + 1)).toBe(false);
  });

  test("99 is not derivable — the clone verb is reserved", () => {
    expect(CLONE_TOKEN).toBe(99);
    expect(VECTOR_MAX).toBe(98);
  });
});

describe("vectors — annotation (illustrative paint markers)", () => {
  test("injects the marker after each reference occurrence", () => {
    const map = buildJumpMap(["ADR-030"]);
    const out = annotateSource("the live search is ADR-030, amended.", map);
    expect(out).toBe("the live search is ADR-030 %okuda-vector:11%, amended.");
  });

  test("every occurrence carries the same number", () => {
    const map = buildJumpMap(["ADR-030"]);
    const out = annotateSource("ADR-030 once, ADR-030 twice.", map);
    expect(out.match(/%okuda-vector:11%/g)!.length).toBe(2);
  });

  test("links: badge after the closing paren", () => {
    const map = buildJumpMap(["docs/x.md"]);
    const out = annotateSource("see [the doc](docs/x.md) here.", map);
    expect(out).toBe("see [the doc](docs/x.md) %okuda-vector:11% here.");
  });

  test("targets with regex metacharacters are literal", () => {
    const map = buildJumpMap(["docs/x(1).md"]);
    const out = annotateSource("read docs/x(1).md now.", map);
    expect(out).toContain("%okuda-vector:11%");
  });

  test("no references → source unchanged", () => {
    const map = buildJumpMap([]);
    expect(annotateSource("plain text.", map)).toBe("plain text.");
  });
});
