import { describe, expect, test } from "bun:test";
import { citationsIn, counts, judge, type Cite } from "../scripts/citation-drift";

/** The finder's two pure halves: what a citation carries, and what its target
 *  says about it. The corpus walk is the reading; these pin the classification,
 *  because a wrong verdict here is silent — a `moved` reported as `gone` looks
 *  exactly like a file that really lost the symbol.
 *
 *  What is deliberately *not* tested: that any particular corpus row is a
 *  finding. That is the reading's job, and a test that pinned it would have to
 *  be edited every time the corpus moved — the ledger problem in test form. */

const cite = (over: Partial<Cite> = {}): Cite => ({
  source: "doc.md",
  at: 7,
  address: "src/x.ts:3",
  path: "src/x.ts",
  line: 3,
  named: [],
  ...over,
});

describe("citation-drift — what a citations carries (pure)", () => {
  test("an addressed citation arrives with the idents its line offers", () => {
    const src = "the scan is `scanReferences` (`src/vectors.ts:207`) today.";
    const [c] = citationsIn(src, "doc.md");
    expect(c).toEqual({
      source: "doc.md",
      at: 1,
      address: "src/vectors.ts:207",
      path: "src/vectors.ts",
      line: 207,
      named: ["scanReferences"],
    });
  });

  test("a bare path is not a coordinate, so it has nothing to drift", () => {
    // Its existence is the paint gate's question (ADR-045), not this one's.
    expect(citationsIn("`src/vectors.ts` and src/vectors.ts both.", "doc.md")).toEqual([]);
  });

  test("a short ident is a prose variable, not a referent", () => {
    expect(citationsIn("`u` (`src/x.ts:3`)", "doc.md")[0]!.named).toEqual([]);
  });

  test("a range is one citation and its arrival is the opening line", () => {
    const [c] = citationsIn("`parseAddress` (`src/vectors.ts:138-142`)", "doc.md");
    expect(c!.address).toBe("src/vectors.ts:138-142");
    expect(c!.line).toBe(138);
  });

  test("two citations on one line are two claims, each with its own idents", () => {
    // Attributing the whole line to both made each citation the other's evidence.
    const src = "`alpha` (`src/a.ts:4`) then `betaOne` (`src/b.ts:9`).";
    expect(citationsIn(src, "doc.md").map((c) => [c.address, c.named])).toEqual([
      ["src/a.ts:4", ["alpha"]],
      ["src/b.ts:9", ["betaOne"]],
    ]);
  });

  test("with one address the whole line is fair game — the form names it after too", () => {
    const [c] = citationsIn("src/render.ts:594 is where `stripHtml` runs.", "doc.md");
    expect(c!.named).toEqual(["stripHtml"]);
  });
});

describe("citation-drift — the verdict (pure)", () => {
  test("ok: the named ident is on the cited line", () => {
    const d = judge(cite({ named: ["parseAddress"] }), ["a", "b", "export function parseAddress() {"]);
    expect(d.verdict).toBe("ok");
    expect(d.proposed).toEqual([]);
  });

  test("moved: the ident is elsewhere, and a definition is proposed first", () => {
    // Nearness loses to shape: the comment at line 2 mentions the ident, the
    // definition at line 9 is what a citation means.
    const target = ["", "  // parseAddress is called below", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "export function parseAddress("];
    const d = judge(cite({ named: ["parseAddress"] }), target);
    expect(d.verdict).toBe("moved");
    expect(d.proposed[0]).toEqual({ ident: "parseAddress", line: 9, definition: true });
    expect(d.proposed.some((p) => p.line === 2 && !p.definition)).toBe(true);
  });

  test("gone: the sentence names an ident the file does not hold", () => {
    const d = judge(cite({ named: ["editNew"] }), ["const edit = 1;", "b", "c"]);
    expect(d.verdict).toBe("gone");
    expect(d.proposed).toEqual([]);
  });

  test("unnamed: nothing to check — the expectation problem, reported not judged", () => {
    expect(judge(cite(), ["a", "b", "c"]).verdict).toBe("unnamed");
  });

  test("blank: the cited line is empty — a reading, not a verdict", () => {
    expect(judge(cite(), ["a", "b", ""]).verdict).toBe("blank");
  });

  test("past EOF: a line beyond the file cannot hold anything", () => {
    expect(judge(cite(), ["a", "b"]).verdict).toBe("past-eof");
  });

  test("missing: no such file — which may be another silo, so it is a reading", () => {
    expect(judge(cite(), null).verdict).toBe("missing");
  });
});

describe("citation-drift — a reading, with no gate", () => {
  test("the script exports no gateable verdict", async () => {
    // The renderer stopped promising a row (ADR-LINE-IS-PROSE-078), so a stale
    // hint is the author's problem, not an address that lies. An exported
    // GATED would be the first step back to gating a judgement.
    const mod = await import("../scripts/citation-drift");
    expect("GATED" in mod).toBe(false);
  });

  test("counts cover every verdict, including the quiet ones", () => {
    const rows = [
      judge(cite(), ["a", "b", "c"]),
      judge(cite(), ["a", "b"]),
      judge(cite({ named: ["x"] }), null),
    ];
    const n = counts(rows);
    expect([n.get("unnamed"), n.get("past-eof"), n.get("missing"), n.get("ok")]).toEqual([1, 1, 1, 0]);
  });
});
