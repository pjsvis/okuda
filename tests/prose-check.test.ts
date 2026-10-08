import { describe, expect, test } from "bun:test";
import { countSentences, height, leaks, plain, units } from "../scripts/prose-check";

describe("prose-check — the wall meter", () => {
  test("markup is stripped to what the reader sees", () => {
    expect(plain("A **bold** and `code` word")).toBe("A bold and code word");
    expect(plain("A [link](docs/x.md) and an ![image](a.png)")).toBe("A link and an image");
    expect(plain("**Created:** 2026-08-26")).toBe("Created: 2026-08-26");
  });

  test("soft returns are inert: a wrapped paragraph is one unit", () => {
    const src = [
      "---", "type: Brief", "---", // front matter is skipped
      "# Title",
      "",
      "A para one",
      "wrapped across lines.",
      "",
      "- item alpha",
      "  continued on the next line",
      "",
      "> a quote line",
      "",
      "```",
      "code ** is not prose",
      "```",
      "",
      "| a | b |",
      "|---|---|",
      "| x | y |",
    ].join("\n");
    const u = units(src);
    expect(u.map((x) => x.kind)).toEqual(["para", "item", "quote"]);
    expect(u[0]!.text).toBe("A para one wrapped across lines.");
    expect(u[0]!.line).toBe(6);
    expect(u[1]!.text).toBe("item alpha continued on the next line");
    expect(u[2]!.text).toBe("a quote line");
  });

  test("height is the renderer's own wrap count", () => {
    const word = "a".repeat(40); // one unbreakable token
    // 40 columns of text in a 20-column budget: two lines
    expect(height(word, "para", 24)).toBe(2);
    // the same text with room to spare: one line
    expect(height("short one", "para", 24)).toBe(1);
  });

  test("sentence count merges the abbreviation boundary ICU splits on", () => {
    // ICU splits "Dr." and "Mr."; the guard merges them back. Two sentences.
    expect(countSentences("Dr. Smith met Mr. Jones at 3 p.m. Then he left.")).toBe(2);
    expect(countSentences("One. Two. Three.")).toBe(3);
  });

  test("a leak is markdown emphasis that reached the reader", async () => {
    expect(await leaks("A **good** span.\n")).toEqual([]);
    // the closing `**` landed inside the code span, so nothing paired
    expect((await leaks("* x: **Pipe to `less -R**` or not.\n")).length).toBe(1);
  });

  test("non-prose carriers are not leaks: a displayed span, a glob", async () => {
    // a code span that DISPLAYS the field syntax is the point of the span
    expect(await leaks("The field `**Date:**` is declared.\n")).toEqual([]);
    // literal `**` in a glob is content, and the render is right to print it
    expect(await leaks("A glob: -g !.archive/** stays.\n")).toEqual([]);
  });
});
