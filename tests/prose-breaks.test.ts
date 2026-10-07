import { describe, expect, test } from "bun:test";
import { renderDocument } from "../src/render";
import { stripANSI } from "../src/width";

/** The edit-safety invariant (ADR-PROSE-BREAKS-056): **a text edit changes only what
 *  it changes.** In prose the render is a function of the words and the blocks, never
 *  of the line breaks or space runs between them — so re-wrapping, padding, trimming
 *  and double-spacing cannot move the layout. If this file fails, editing has become a
 *  layout operation, which is the defect it exists to prevent.
 *
 *  The last prose case is the deliberate divergence from CommonMark: two trailing
 *  spaces are an INVISIBLE mark, and an invisible mark cannot be intent, so they
 *  collapse like any other run rather than becoming a break. A reader who knows the
 *  spec expects a `<br>` here; the divergence is stated in the ADR and pinned here so
 *  that nobody "fixes" it back into a bug.
 *
 *  DEFERRED, not owed: a trailing backslash would be the one break signal worth
 *  honouring, and the operator's decision (2026-10-07) is not to build it yet, if ever.
 *  That makes this invariant ABSOLUTE rather than qualified — with no character-level
 *  channel in prose at all, there is no exception to state and no case to add. If it is
 *  ever built, its test belongs here (a break between wrapped segments, consumed before
 *  the wrapper sees it), not in the render suite. */

const visible = (out: string) =>
  stripANSI(out)
    .split("\n")
    .filter((l) => l.trim().length > 0 && !l.trimEnd().endsWith("█"))
    .map((l) => l.replace(/[ ]+$/, ""))
    .join("\n");

async function render(source: string): Promise<string> {
  return visible(await renderDocument(source + "\n", { width: 80, color: "none" }));
}

describe("prose whitespace is inert", () => {
  const WORDS = "Alpha beta gamma delta epsilon zeta eta theta iota kappa.";

  test("soft wrapping, double spaces, indent and trailing runs render identically", async () => {
    const variants = [
      WORDS,
      "Alpha beta gamma\ndelta epsilon zeta\neta theta iota kappa.",
      "Alpha  beta   gamma delta epsilon zeta eta theta iota kappa.",
      "   Alpha beta gamma delta epsilon zeta eta theta iota kappa.",
      "Alpha beta gamma delta epsilon zeta eta theta iota kappa.\t",
    ];
    const baseline = await render(variants[0]!);
    for (const v of variants.slice(1)) {
      expect(await render(v)).toBe(baseline);
    }
  });

  test("two trailing spaces are inert — the divergence, pinned", async () => {
    // CommonMark says this is a hard break. We say an invisible mark is a residue.
    const withSpaces = "Alpha beta  \ngamma delta.";
    const without = "Alpha beta gamma delta.";
    expect(await render(withSpaces)).toBe(await render(without));
  });

  test("a paragraph break still separates, because a block is visible intent", async () => {
    const one = await render("Alpha beta.");
    const two = await render("Alpha beta.\n\nGamma delta.");
    expect(two).not.toBe(one);
    expect(two).toContain("Gamma delta.");
  });

  test("code keeps its bytes: the invariant is prose-only", async () => {
    const out = stripANSI(
      await renderDocument("```\ncode   keeps   spaces\n```\n", { width: 80, color: "none" }),
    );
    expect(out).toContain("code   keeps   spaces");
  });
});
