import { describe, expect, test } from "bun:test";
import {
  VECTOR_MIN,
  VECTOR_MAX,
  CLONE_TOKEN,
  MAX_REFS,
  RESERVED_VECTORS,
  scanReferences,
  buildJumpMap,
  jumpMapFor,
  annotateSource,
} from "../src/vectors";

describe("vectors — discovery (occurrences, reading order, one-to-many)", () => {
  test("callsign-shaped tokens are references", () => {
    const refs = scanReferences("see ADR-030 and ADR-028 for the wire.").map((r) => r.target);
    expect(refs).toEqual(["ADR-030", "ADR-028"]);
  });

  test("markdown links to .md paths are references (target is the path)", () => {
    const refs = scanReferences("read [the brief](briefs/2026-09-04-brief-porch-matrix.md) first.").map((r) => r.target);
    expect(refs).toEqual(["briefs/2026-09-04-brief-porch-matrix.md"]);
  });

  test("reading order across both shapes", () => {
    const refs = scanReferences(
      "first [a doc](docs/x.md), then ADR-030, then [another](docs/y.md).",
    ).map((r) => r.target);
    expect(refs).toEqual(["docs/x.md", "ADR-030", "docs/y.md"]);
  });

  test("one-to-many: repeated references keep one vector each, same filename", () => {
    // The footnote model: each mention is its own actuation point; the
    // map translates several vectors to one filename.
    const refs = scanReferences("ADR-030 early, ADR-028, ADR-030 again.").map((r) => r.target);
    expect(refs).toEqual(["ADR-030", "ADR-028", "ADR-030"]);
  });

  test("zero-padded and single-digit bracketed numbers are never vectors", () => {
    const refs = scanReferences("steps [07] and [3] and even [14] — but 14 has no callsign shape.");
    expect(refs.length).toBe(0); // [14] is user text, not a reference
  });

  test("false-positive shapes are optimistic references (the actuator decides)", () => {
    // SSH-2 has callsign shape; discovery paints it; actuation fails honestly.
    expect(scanReferences("the SSH-2 protocol").map((r) => r.target)).toEqual(["SSH-2"]);
  });

  test("the callsign scan is token-boundaried — no mid-word anchoring", () => {
    // The phantom-§13 in Babylon-to-Stars: the matcher anchored one
    // character inside YYYY-MM-DD and read YYY-MM-DD; ISO-Date truncated
    // to ISO-D. A token has boundaries; a date template is not a call.
    expect(scanReferences("dates like (YYYY-MM-DD-mnemonic-slug.md) and ISO-Date anchors.")).toEqual([]);
    expect(scanReferences("ADR-031's clause and BRF-X, pinned.").map((r) => r.target)).toEqual(["ADR-031", "BRF-X"]);
  });

  test("discovery stops at fences — a badge that cannot paint is not a reference", () => {
    // The phantom-§12 in Babylon-to-Stars: ISO-Date inside a mermaid
    // fence took the floor; the mermaid pipe swallowed its badge. The
    // fence is not prose.
    const fenced = '```mermaid\nF3["Flat Silo (ISO-Date Anchored)"]\n```\n\nADR-031 in prose.';
    expect(scanReferences(fenced).map((r) => r.target)).toEqual(["ADR-031"]);
    const linked = '```text\nsee [x](docs/z.md)\n```\n\n[real](docs/y.md)';
    expect(scanReferences(linked).map((r) => r.target)).toEqual(["docs/y.md"]);
  });

  test("an unterminated fence fences the rest — no half-open escape hatch", () => {
    expect(scanReferences('```\nADR-031\n').map((r) => r.target)).toEqual([]);
  });

  test("legacy okuda-rhs wiring is not honored — and is not a reference", () => {
    // The legacy row's path lives in an HTML comment as wiring; bare .md
    // paths in prose are not references — discovery scans links and
    // callsigns only, and colour is a separate register question. So the
    // authored number is not honored, and the row is inert.
    const src = "| *slug* | CS | **14** <!-- %%okuda-rhs:14%% briefs/x.md --> |";
    expect(scanReferences(src).length).toBe(0);
  });

  test("the frontmatter is not scanned — a document's own callsign is not a reference", () => {
    const src = "---\ntype: Brief\ncallsign: BRF-WORKING-COPY\n---\n\nRides on ADR-030 and the wire.";
    const refs = scanReferences(src).map((r) => r.target);
    expect(refs).toEqual(["ADR-030"]); // own callsign skipped
  });

  test("cap: discovery stops at MAX_REFS", () => {
    const src = Array.from({ length: 120 }, (_, i) => `ADR-${1000 + i}`).join(" ");
    const refs = scanReferences(src);
    expect(refs.length).toBe(MAX_REFS);
    // The canon (2026-09-12): the doubled pairs reserved → 80 addresses.
    expect(MAX_REFS).toBe(80);
  });

  test("the pocket Set's invariant: exactly the doubled pairs in range", () => {
    // MAX_REFS derives from RESERVED_VECTORS.size — the derivation is
    // only honest while the Set is the doubled-pair class *inside* the
    // vector range. This is the check that keeps it so.
    for (const n of RESERVED_VECTORS) {
      expect(Math.floor(n / 10)).toBe(n % 10); // a doubled pair…
      expect(n).toBeGreaterThanOrEqual(VECTOR_MIN); // …inside the range
      expect(n).toBeLessThanOrEqual(VECTOR_MAX);
    }
    expect(RESERVED_VECTORS.size).toBe(7);
  });
});

describe("vectors — the jump map (the translation table)", () => {
  test("numbers run from 12, in reading order — one destination, one silcrow", () => {
    const map = jumpMapFor("ADR-002 early, ADR-002 again, [x](docs/z.md).");
    expect(map.get(12)).toBe("ADR-002");
    expect(map.get(13)).toBe("docs/z.md");
    expect(map.has(14)).toBe(false); // the repeat reuses §12
    expect(map.has(10)).toBe(false);
    expect(map.has(11)).toBe(false);  // the double-tap pocket — never a silcrow
  });

  test("buildJumpMap caps at MAX_REFS", () => {
    const refs = Array.from({ length: 120 }, (_, i) => ({ pos: i, end: i + 1, target: `ADR-${i}` }));
    const map = buildJumpMap(refs);
    expect(map.size).toBe(MAX_REFS);
    expect(map.has(VECTOR_MAX + 1)).toBe(false);
  });

  test("the allocator skips the reserved actuators (the doubled-pair canon)", () => {
    // 84 distinct refs: fills 12-21, skips 22, fills 23-32, skips 33, …
    const refs = Array.from({ length: 84 }, (_, i) => ({ pos: i, end: i + 1, target: `ADR-${i}` }));
    const map = buildJumpMap(refs);
    expect(map.size).toBe(MAX_REFS); // 80 — four short of 84
    for (const r of [11, 22, 33, 44, 55, 66, 77, 88]) expect(map.has(r)).toBe(false);
    expect(map.get(12)).toBe("ADR-0");
    expect(map.get(21)).toBe("ADR-9");  // last before the 22 gap
    expect(map.get(23)).toBe("ADR-10"); // first after the 22 gap
  });

  test("99 is not derivable — the clone verb is reserved", () => {
    expect(CLONE_TOKEN).toBe(99);
    expect(VECTOR_MAX).toBe(98);
  });
});

describe("vectors — annotation (illustrative paint markers)", () => {
  test("injects the marker after each reference occurrence, per the map", () => {
    const map = jumpMapFor("the live search is ADR-030, amended.");
    const out = annotateSource("the live search is ADR-030, amended.", map);
    expect(out).toBe("the live search is ADR-030 %okuda-vector:12%, amended.");
  });

  test("repeated references reuse the silcrow (the citation convention)", () => {
    const src = "ADR-030 once, ADR-030 twice.";
    const map = jumpMapFor(src);
    const out = annotateSource(src, map);
    expect(out.match(/%okuda-vector:12%/g)!.length).toBe(2); // same number, both cites
  });

  test("links: badge after the closing paren", () => {
    const map = jumpMapFor("see [the doc](docs/x.md) here.");
    const out = annotateSource("see [the doc](docs/x.md) here.", map);
    expect(out).toBe("see [the doc](docs/x.md) %okuda-vector:12% here.");
  });

  test("targets with regex metacharacters are literal", () => {
    const map = jumpMapFor("see [x](docs/x(1).md) here.");
    const out = annotateSource("see [x](docs/x(1).md) here.", map);
    expect(out).toContain("%okuda-vector:12%");
  });

  test("no references → source unchanged", () => {
    expect(annotateSource("plain text.", jumpMapFor("plain text."))).toBe("plain text.");
  });
});
