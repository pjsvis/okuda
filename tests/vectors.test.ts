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
  referencesSection,
  referencesCovered,
  appendReferences,
} from "../src/vectors";
import { buildFixture } from "../scripts/references-demo";
import { makeSilcrowGate } from "../src/root";

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

  test("the ADR-044 gate: inferred callsigns resolve or are retracted; the default stays optimistic", () => {
    // The registry says ADR-031 exists and UTF-8 does not. Under the
    // gate the acronym is retracted — a bare UTF-8 in prose made no
    // claim; the registry check is the retraction.
    const resolves = (t: string) => t === "ADR-031";
    expect(scanReferences("see ADR-031 but not UTF-8", resolves).map((r) => r.target)).toEqual(["ADR-031"]);
    // No predicate = the pre-ADR-044 contract (the pure scan, the tests).
    expect(scanReferences("see ADR-031 but not UTF-8").map((r) => r.target)).toEqual(["ADR-031", "UTF-8"]);
  });

  test("the gate never touches explicit .md links — the author's link is a deliberate claim", () => {
    const none = () => false; // an empty registry: nothing resolves
    const src = "[the brief](briefs/2026-09-24-brief-validated-silcrows.md) survives; ADR-031 does not.";
    expect(scanReferences(src, none).map((r) => r.target)).toEqual(["briefs/2026-09-24-brief-validated-silcrows.md"]);
  });

  test("junk no longer consumes reading-order addresses — the 80-cap budget goes to genuine references", () => {
    const resolves = (t: string) => t === "ADR-031";
    const map = jumpMapFor("UTF-8 noise, then ADR-031", resolves);
    expect(map.get(VECTOR_MIN)).toBe("ADR-031"); // 12 is first — UTF-8 did not eat it
    // The optimistic default, for contrast: UTF-8 at 12, ADR-031 at 13.
    const optimistic = jumpMapFor("UTF-8 noise, then ADR-031");
    expect(optimistic.get(VECTOR_MIN)).toBe("UTF-8");
    expect(optimistic.get(VECTOR_MIN + 1)).toBe("ADR-031");
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

  test("legacy okuda-rhs wiring is not honored — but Ring B mints its path", () => {
    // The legacy row's path lives in an HTML comment as wiring; the
    // authored NUMBER is dead (ADR-022) and the row stays inert as
    // wiring. But the path itself is an ordinary reference since Ring
    // B — it mints a vector, dedupes with any prose mention, and the
    // References section lists it. One claim (the number) retired;
    // another (the path) honored.
    const src = "| *slug* | CS | **14** <!-- %%okuda-rhs:14%% briefs/x.md --> |";
    const refs = scanReferences(src).map((r) => r.target);
    expect(refs).toEqual(["briefs/x.md"]); // no [14] honored — the vector is §12
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

describe("vectors — the self-path exclusion, composed as cli builds the gate (the showcase §12 nit)", () => {
  test("the document's own filename mints nothing; the next reference takes §12", () => {
    // The repro: docs/showcase.md line 3 — "Render it with
    // `./okuda docs/showcase.md`" — Ring B's bare-path scan minted the
    // self-row. Composed exactly as cli.ts composes silcrowResolves.
    const cwd = process.cwd();
    // The REAL composition, as cli and the launcher both build it —
    // never a hand-copy: re-implementing the composition here re-creates
    // the drift the test exists to catch (the launcher drift, 2026-10-02).
    const resolves = makeSilcrowGate("docs/showcase.md", cwd);
    const src = [
      "Render it with `./okuda docs/showcase.md` and read it as a smoke test.",
      "",
      "Then read decisions/004-hard-wrap-mandate.md for the law.",
    ].join("\n");
    const map = jumpMapFor(src, resolves);
    expect([...map.values()]).not.toContain("docs/showcase.md"); // no self-row
    expect(map.get(VECTOR_MIN)).toBe("decisions/004-hard-wrap-mandate.md"); // §12 re-mints to the first genuine ref
    // The badge never paints beside the self-mention either (the map is
    // the projection — annotateSource paints only map members).
    expect(annotateSource(src, map)).not.toMatch(/docs\/showcase\.md.*%okuda-vector/);
  });

  test("a sibling citation still mints (the exclusion is exact, not a blanket)", () => {
    const cwd = process.cwd();
    const resolves = makeSilcrowGate("docs/showcase.md", cwd);
    const src = "docs/keymap.md is a sibling, decisions/004-hard-wrap-mandate.md is the law.";
    const map = jumpMapFor(src, resolves);
    expect([...map.values()]).toContain("docs/keymap.md");
    expect([...map.values()]).toContain("decisions/004-hard-wrap-mandate.md");
  });
});

describe("vectors — the self-citation exclusion (td-e6e692)", () => {
  test("the document's own callsign mints no vector; others still do", () => {
    const src = [
      "---",
      "type: Advisory",
      "callsign: ADV-SELF",
      "---",
      "",
      "# ADV-SELF — the heading cites itself",
      "",
      "Body cites ADR-030 for real work.",
    ].join("\n");
    const refs = scanReferences(src).map((r) => r.target);
    expect(refs).not.toContain("ADV-SELF");
    expect(refs).toContain("ADR-030");
  });

  test("no frontmatter callsign — today's behaviour stands", () => {
    expect(scanReferences("see ADR-030.").map((r) => r.target)).toEqual(["ADR-030"]);
  });

  test("jumpMapFor: self excluded, the next callsign takes vector 12", () => {
    const src = "---\ncallsign: ADV-SELF\n---\n\n# ADV-SELF\n\nBody: ADR-030.";
    const map = jumpMapFor(src);
    expect([...map.values()]).toEqual(["ADR-030"]);
    expect(map.get(12)).toBe("ADR-030");
  });

  test("annotateSource paints no self-marker (the map is the projection)", () => {
    const src = "---\ncallsign: ADV-SELF\n---\n\n# ADV-SELF and ADR-030.";
    const annotated = annotateSource(src, jumpMapFor(src));
    expect(annotated).not.toContain("ADV-SELF %okuda-vector");
    expect(annotated).toContain("ADR-030 %okuda-vector:12%");
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

describe("vectors — the generated References section (ADR-047, BRF-REFERENCES-SECTION)", () => {
  test("one line per destination, in map order, silcrow first", () => {
    const map = jumpMapFor("cite ADR-030, then BRF-CENSUS-MODE, then [a doc](docs/x.md).");
    expect(referencesSection(map)).toBe(
      [
        "## References",
        "",
        "%okuda-vector:12% ADR-030",
        "",
        "%okuda-vector:13% BRF-CENSUS-MODE",
        "",
        "%okuda-vector:14% docs/x.md",
      ].join("\n"),
    );
  });

  test("the header is exactly `## References` — a level-2 hash header", () => {
    const map = jumpMapFor("one cite: ADR-030.");
    expect(referencesSection(map).split("\n")[0]).toBe("## References");
  });

  test("empty map → no section, no empty header", () => {
    expect(referencesSection(new Map())).toBe("");
    expect(referencesSection(jumpMapFor("no references here."))).toBe("");
  });

  test("repeated references list once (the map is one-destination-one-silcrow)", () => {
    const map = jumpMapFor("ADR-030 and ADR-030 again.");
    expect(referencesSection(map)).toBe("## References\n\n%okuda-vector:12% ADR-030");
  });

  test("appendReferences: the junction normalises the tail to one blank line", () => {
    const map = jumpMapFor("cite ADR-030.");
    // trailing newlines, whatever their count, collapse to exactly one
    // blank line before the header — the header lands as a header.
    expect(appendReferences("body\n\n\n\n", map)).toBe(
      "body\n\n## References\n\n%okuda-vector:12% ADR-030\n",
    );
    expect(appendReferences("body", map)).toBe(
      "body\n\n## References\n\n%okuda-vector:12% ADR-030\n",
    );
  });

  test("suppressed when the final section is a list covering the map (self-tabling)", () => {
    const src = [
      "# T",
      "",
      "## Related",
      "",
      "- `docs/a.md` — one",
      "- `docs/b.md` — two",
      "",
    ].join("\n");
    const map = jumpMapFor(src);
    expect(map.size).toBe(2);
    expect(referencesCovered(src, map)).toBe(true);
    expect(appendReferences(src, map, true)).toBe(src); // annotated rung: suppressed
    expect(appendReferences(src, map)).toContain("## References"); // plain rung: kept
  });

  test("kept when the final list is PARTIAL — the omission stays visible", () => {
    const src = [
      "# T",
      "",
      "See `docs/a.md` and `docs/b.md`.",
      "",
      "## Related",
      "",
      "- `docs/a.md` — one",
      "",
    ].join("\n");
    const map = jumpMapFor(src);
    expect(map.size).toBe(2);
    expect(referencesCovered(src, map)).toBe(false);
    expect(appendReferences(src, map, true)).toContain("## References");
  });

  test("kept when the references are cited only in the body", () => {
    const src = "# T\n\nSee `docs/a.md` for the rest.\n";
    const map = jumpMapFor(src);
    expect(referencesCovered(src, map)).toBe(false);
    expect(appendReferences(src, map)).toContain("## References");
  });

  test("appendReferences: empty map passes the source through untouched", () => {
    expect(appendReferences("body\n", new Map())).toBe("body\n");
  });

  test("the map-identity invariant: the section never feeds the map (the loop's guard)", () => {
    // A doc with its section appended derives the same map as the same
    // doc without one — the acceptance criterion. Repeats dedupe by
    // target; .md targets listed as bare paths are mentions, not uses.
    const src = "cite ADR-030 and [a doc](docs/x.md) and src/vectors.ts, twice: ADR-030.";
    const map = jumpMapFor(src);
    const withSection = appendReferences(src, map);
    expect(jumpMapFor(withSection)).toEqual(map);
    // and the sectioned doc stays fixed-point: appending again changes
    // only whitespace, not the map.
    expect(jumpMapFor(appendReferences(withSection, jumpMapFor(withSection)))).toEqual(map);
  });

  test("the dogfood: the demo fixture asserts the generated section lists every destination (td-3562fe)", () => {
    // The brief's settling diff: the hand-written section listed 6 of
    // 9. The generated section must list every destination of the
    // fixture's map — 10 today (Ring A minted the generator's own path
    // after the brief was written; the invariant is "every", not "nine").
    const src = buildFixture();
    const map = jumpMapFor(src);
    expect(map.size).toBeGreaterThan(0); // the fixture carries references
    const rendered = referencesSection(map).replace(/%okuda-vector:(\d+)%/g, "§$1");
    const listed = new Set(
      rendered.split("\n").map((l) => l.replace(/^§\d+ /, "")).filter((l) => l !== "" && l !== "## References"),
    );
    for (const target of map.values()) expect(listed.has(target)).toBe(true);
    expect(listed.size).toBe(map.size);
  });
});

describe("vectors — Ring A: code-file mentions (BRF-SILCROW-PATHS)", () => {
  test("a dir/name.ext mention is a reference (non-md extension)", () => {
    const refs = scanReferences("the scan lives in src/vectors.ts, pure.").map((r) => r.target);
    expect(refs).toEqual(["src/vectors.ts"]);
  });

  test("bare filenames and extensionless binaries are not (no slash, no intent)", () => {
    const refs = scanReferences("see justfile, package.json, tui.ts, and UTF-8 too.").map((r) => r.target);
    // UTF-8 is the callsign loop's own optimism (the ADR-044 gate
    // retracts it at the TUI); the point here: no PATH tokens discovered —
    // Ring C owns bare basenames, none carry a slash.
    expect(refs).toEqual(["UTF-8"]);
  });

  test("named .md paths are Ring B's own regex — see the Ring B block", () => {
    // Retired here, asserted there (BRF-SILCROW-PATHS step 3): the
    // original Ring A probe of the unwired state.
  });

  test("the ADR-045 gate: the filesystem decides — phantom and URL retract", () => {
    const resolves = (t: string) => t === "src/vectors.ts";
    const src = "real: src/vectors.ts. phantom: palettes/okuda.json. URL: example.com/chime.mp3.";
    expect(scanReferences(src, resolves).map((r) => r.target)).toEqual(["src/vectors.ts"]);
    // No predicate = the pure scan (discovery validates nothing, ADR-044 contract)
    expect(scanReferences(src).map((r) => r.target)).toEqual([
      "src/vectors.ts",
      "palettes/okuda.json",
      "example.com/chime.mp3",
    ]);
  });

  test("W2: the :NNN suffix is swallowed into the span, stripped from the target", () => {
    const src = "the edit brief is wired at src/tui.ts:756 today.";
    const refs = scanReferences(src);
    expect(refs.length).toBe(1);
    expect(refs[0]!.target).toBe("src/tui.ts"); // the silcrow is file-level
    expect(src.slice(refs[0]!.pos, refs[0]!.end)).toBe("src/tui.ts:756"); // paint covers the mention
  });

  test("W2: suffixed and plain mentions share the vector (one destination, one silcrow)", () => {
    const resolves = (t: string) => t === "src/tui.ts";
    const map = jumpMapFor("see src/tui.ts:756, then src/tui.ts plain.", resolves);
    expect([...map.values()]).toEqual(["src/tui.ts"]);
    expect(map.size).toBe(1);
  });

  test("W1: paint inside the codespan — the badge lands before the closing backtick", () => {
    const resolves = (t: string) => t === "src/vectors.ts";
    const src = "the scan is `src/vectors.ts`, pure.";
    const map = jumpMapFor(src, resolves);
    const out = annotateSource(src, map);
    expect(out).toBe("the scan is `src/vectors.ts %okuda-vector:12%`, pure.");
  });

  test("fences and frontmatter stay prose-free (the standing discipline)", () => {
    const src = "---\ncallsign: BRF-X\n---\n\n```\nsrc/vectors.ts\n```\n\nprose src/vectors.ts after.";
    const refs = scanReferences(src);
    expect(refs.map((r) => r.target)).toEqual(["src/vectors.ts"]);
  });

  test("reading order: Ring A joins the map in position, after earlier refs", () => {
    const resolves = () => true;
    const src = "first ADR-030, then src/vectors.ts, then [a doc](docs/x.md).";
    const map = jumpMapFor(src, resolves);
    expect([...map.values()]).toEqual(["ADR-030", "src/vectors.ts", "docs/x.md"]);
  });
});

describe("vectors — Ring B: named md paths (BRF-SILCROW-PATHS step 3)", () => {
  test("a bare dir/name.md mention is a reference — the corpus's own convention", () => {
    // 1,192 free-standing mentions, 1 inside link syntax (the P-1
    // probe): bare mention is how the silo cites its own documents.
    const refs = scanReferences("see docs/help.md for keys.").map((r) => r.target);
    expect(refs).toEqual(["docs/help.md"]);
  });

  test("the gate is the same substrate: a phantom md path never paints", () => {
    const resolves = (t: string) => t === "docs/help.md";
    const src = "real docs/help.md, phantom briefs/ghost-brief.md, both bare.";
    expect(scanReferences(src, resolves).map((r) => r.target)).toEqual(["docs/help.md"]);
    // no predicate = the pure scan, discovery validates nothing
    expect(scanReferences(src).map((r) => r.target)).toEqual(["docs/help.md", "briefs/ghost-brief.md"]);
  });

  test("one claim, one badge: a link's internal target is never re-minted", () => {
    const src = "one claim: [the doc](docs/help.md), and bare docs/help.md again.";
    const refs = scanReferences(src);
    expect(refs.map((r) => r.target)).toEqual(["docs/help.md", "docs/help.md"]); // two occurrences
    const map = jumpMapFor(src);
    expect([...map.values()]).toEqual(["docs/help.md"]); // one destination, one silcrow
    const out = annotateSource(src, map);
    expect((out.match(/%okuda-vector:12%/g) ?? []).length).toBe(2); // both painted, once each
  });

  test("W2 re-worn: an md :NNN suffix swallows into the span, strips from the target", () => {
    const src = "the line is docs/help.md:42, file-level only.";
    const refs = scanReferences(src);
    expect(refs.length).toBe(1);
    expect(refs[0]!.target).toBe("docs/help.md"); // the silcrow is file-level
    expect(src.slice(refs[0]!.pos, refs[0]!.end)).toBe("docs/help.md:42"); // paint covers the mention
  });

  test("suffixed and plain md mentions share the vector", () => {
    const resolves = (t: string) => t === "docs/help.md";
    const map = jumpMapFor("see docs/help.md:42, then docs/help.md plain.", resolves);
    expect([...map.values()]).toEqual(["docs/help.md"]);
    expect(map.size).toBe(1);
  });

  test("legibility (ADR-049): .jsonl never paints — the exile applies ungated", () => {
    // Horizontal data is not a readable render: the exile is a token
    // class, not a gate — an exiled target can never enter the map,
    // so body, actuator, and the References section retract in one move.
    const src = "results data/graded_matrix.jsonl and data/eval_log.json.";
    expect(scanReferences(src).map((r) => r.target)).toEqual(["data/eval_log.json"]); // .json survives
    expect(jumpMapFor(src, () => true).size).toBe(1); // .jsonl never enters the map
  });

  test("fences still fence Ring B (the standing discipline)", () => {
    const src = "```\ndocs/help.md\n```\n\nprose docs/help.md after.";
    expect(scanReferences(src).map((r) => r.target)).toEqual(["docs/help.md"]);
  });

  test("no slash, no intent: bare basenames stay Ring C, parked", () => {
    expect(scanReferences("see help.md and README.md, unprefixed.")).toEqual([]);
  });

  test("reading order: Ring B joins the map in position", () => {
    const resolves = () => true;
    const src = "first ADR-030, then src/vectors.ts, then docs/help.md bare, then [a doc](docs/x.md).";
    expect([...jumpMapFor(src, resolves).values()]).toEqual([
      "ADR-030", "src/vectors.ts", "docs/help.md", "docs/x.md",
    ]);
  });
});
