import { describe, expect, test } from "bun:test";
import { renderDocument } from "../src/render";
import { displayWidth, stripANSI } from "../src/width";

const W = 60;

async function render(src: string, width = W, color: "truecolor" | "none" = "truecolor") {
  return await renderDocument(src, { width, color });
}

function lines(out: string): string[] {
  return out.split("\n");
}

describe("render — headings", () => {
  test("H1–H3 styled, marker visible, blank line after", async () => {
    const out = await render("# Title\n\nBody");
    expect(out).toContain("\x1b[38;2;189;147;249;1m# Title\x1b[0m");
    expect(lines(out)[0]).toBe("");
    expect(lines(out)[2]).toBe("");
  });

  test("H4+ renders the Glow way: marker + heading colour", async () => {
    const out = await render("#### Deep");
    expect(out).toContain("\x1b[38;2;189;147;249;1m#### Deep\x1b[0m");
    expect(out).not.toContain("\x1b[1mDeep\x1b[0m"); // no longer a bold-paragraph collapse
  });

  test("long heading wraps within width", async () => {
    const out = await render("# " + "heading ".repeat(12), 30);
    for (const l of lines(out)) expect(displayWidth(l)).toBeLessThanOrEqual(30);
  });
});

describe("render — paragraphs and inline styles", () => {
  test("bold, italic, strikethrough, codespan emit contract sequences", async () => {
    const out = await render("**b** *i* ~~s~~ `c`");
    expect(out).toContain("\x1b[38;2;255;184;108;1mb\x1b[0m");
    expect(out).toContain("\x1b[38;2;241;250;140;3mi\x1b[0m");
    expect(out).toContain("\x1b[9ms\x1b[0m");
    expect(out).toContain("\x1b[38;2;80;250;123m`c`");
  });

  test("***bold italic*** renders in the emphasis colour, not strong's", async () => {
    const out = await render("***bi***");
    // glow-faithful: single SGR, emphasis colour + bold + italic, colour-first
    expect(out).toContain("\x1b[38;2;241;250;140;1;3mbi\x1b[0m");
    // and NOT the nested form where strong's gold would override
    expect(out).not.toContain("\x1b[38;2;255;215;0;1m");
  });

  test("link wraps OSC 8 with underlined green", async () => {
    const out = await render("[text](https://example.com)");
    expect(out).toContain("\x1b]8;;https://example.com\x1b\\");
    expect(out).toContain("\x1b[38;2;0;175;95;4mtext\x1b[0m");
    expect(out).toContain("\x1b]8;;\x1b\\");
  });

  test("image rejected as [image: alt]", async () => {
    const out = await render("![the alt](pic.png)");
    expect(out).toContain("[image: the alt]");
    expect(out).not.toContain("pic.png");
  });

  test("soft return becomes a line break", async () => {
    const out = await render("line one\nline two");
    expect(out).toContain("line one\n  line two");
  });

  test("word wrap at width, no trailing spaces", async () => {
    const out = await render("word ".repeat(20), 30);
    for (const l of lines(out)) {
      expect(displayWidth(l)).toBeLessThanOrEqual(30);
      expect(l === l.trimEnd() || l === "").toBe(true);
    }
  });
});

describe("render — lists (loose, markers, continuation)", () => {
  test("loose spacing: blank line between items", async () => {
    const out = await render("- one\n- two\n- three");
    const ls = lines(out).filter((l) => l.trim() !== "").map((l) => l.trimStart());
    expect(ls[0]).toBe("• one");
    expect(ls[1]).toBe("• two");
    expect(ls[2]).toBe("• three");
    // loose: blank line between items
    const raw = lines(out);
    const i = raw.findIndex((l) => l.includes("• one"));
    expect(raw[i + 1]).toBe("");
  });

  test("ordered markers with start", async () => {
    const out = await render("3. three\n4. four");
    expect(out).toContain("3. three");
    expect(out).toContain("4. four");
  });

  test("wrapped item continuation aligns under text (2 spaces)", async () => {
    const out = await render("- " + "word ".repeat(12), 24);
    // Strip the 4-char margin+list-indent prefix to check contIndent alone.
    const ls = lines(out).filter((l) => l !== "").map((l) => l.slice(4));
    expect(ls[0]).toStartWith("• ");
    expect(ls[1]).toStartWith("  ");
  });

  test("nested list indents; depth capped at 2 levels", async () => {
    const src = "- outer\n  - inner one\n  - inner two\n- outer two";
    const out = await render(src);
    expect(out).toContain("• outer\n");
    expect(out).toContain("  • inner one");
    const deep = "- a\n  - b\n    - c";
    const out2 = await render(deep); // third level flattens; no crash
    expect(out2).not.toContain("\u0000");
  });

  test("task list checkbox markup stays literal", async () => {
    const out = await render("- [ ] todo\n- [x] done");
    expect(out).toContain("[ ] todo");
    expect(out).toContain("[x] done");
  });
});

describe("render — blockquote", () => {
  test("muted pipe + indent, single level", async () => {
    const out = await render("> quoted line");
    expect(out).toContain("\x1b[38;2;118;118;118m│\x1b[0m quoted line");
  });

  test("quote content re-wraps inside the pipe column", async () => {
    const out = await render("> " + "word ".repeat(12), 30);
    for (const l of lines(out)) {
      if (l !== "") expect(displayWidth(l)).toBeLessThanOrEqual(30);
    }
  });
});

describe("render — code fences", () => {
  test("2-space indent, code colours, never wrapped", async () => {
    const long = "x".repeat(70);
    const out = await render("```ts\nconst line = \"" + long + "\"\n```", 40);
    const codeLine = lines(out).find((l) => l.includes(long));
    expect(codeLine).toBeDefined();
    expect(stripANSI(codeLine!)).toStartWith("  ");
    expect(displayWidth(codeLine!)).toBeGreaterThan(40); // overflows by design
  });

  test("interior blank lines preserved", async () => {
    const out = await render("```\na\n\nb\n```");
    const stripped = lines(out).map((l) => stripANSI(l));
    expect(stripped).toEqual(["", "    a", "", "    b", ""]);
  });

  test("indented code block rejected as plain text (no crash, no markup)", async () => {
    const out = await render("para\n\n    secret = true\n\nafter");
    expect(out).toContain("secret = true");
    expect(out).not.toContain("    secret"); // no 4-space verbatim block
  });
});

describe("render — thematic break", () => {
  test("muted ─ rule to terminal width", async () => {
    const out = await render("a\n\n---\n\nb");
    const rule = lines(out).find((l) => l.includes("─"));
    expect(rule).toBeDefined();
    expect(displayWidth(rule!)).toBe(W - 2);
  });
});

describe("render — rejections (no crash, no raw markup)", () => {
  test("HTML block stripped silently", async () => {
    const out = await render("<div>\nblock\n</div>\n\npara");
    expect(out).not.toContain("<div>");
    expect(out).not.toContain("block");
    expect(out).toContain("para");
  });

  test("inline HTML stripped (tags removed, text content kept)", async () => {
    const out = await render("before <b>bold</b> after");
    expect(out).toContain("before bold after");
    expect(out).not.toContain("<b>");
    expect(out).not.toContain("</b>");
  });

  test("footnote renders as literal text", async () => {
    const out = await render("Text[^1]\n\n[^1]: the note");
    expect(out).toContain("[^1]");
    expect(out).not.toContain("\u0000");
  });
});

describe("render — NO_COLOR parity", () => {
  const doc = [
    "# Head",
    "",
    "Paragraph with **bold** and `code` and [link](https://x.y) text.",
    "",
    "- item one",
    "- item two with more words to encourage wrapping in narrow widths",
    "",
    "> a quote",
    "",
    "| a | b |",
    "|--|--|",
    "| 1 | 2 |",
    "",
    "---",
    "",
    "```ts",
    "const x = 1;",
    "```",
    "",
  ].join("\n");

  test("plain output is the colored output minus escapes (identical line breaks)", async () => {
    const colored = await render(doc, 40, "truecolor");
    const plain = await render(doc, 40, "none");
    expect(plain).not.toContain("\x1b");
    // identical structure: strip escapes from colored → same lines
    const cLines = colored.split("\n").map((l) => stripANSI(l).replace(/ +$/, ""));
    const pLines = plain.split("\n").map((l) => l.replace(/ +$/, ""));
    expect(cLines).toEqual(pLines);
  });

  test("--no-color path: no OSC 8 either", async () => {
    const plain = await render("[text](https://example.com)", 60, "none");
    expect(plain).not.toContain("\x1b]8;;");
    expect(plain).toContain("text");
  });
});

describe("render — property invariants", () => {
  // deterministic LCG — reproducible pseudo-random documents
  function lcg(seed: number): () => number {
    let s = seed;
    return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  }
  const WORDS = ["alpha", "beta", "gamma", "delta", "epsilon", "日本語", "🎉fest", "e\u0301lan"];

  test("every emitted line ≤ width across pseudo-random styled paragraphs", async () => {
    const rand = lcg(42);
    for (let i = 0; i < 25; i++) {
      const n = 8 + Math.floor(rand() * 40);
      const words: string[] = [];
      for (let j = 0; j < n; j++) {
        let w = WORDS[Math.floor(rand() * WORDS.length)]!;
        if (rand() < 0.2) w = `**${w}**`;
        else if (rand() < 0.15) w = `\`${w}\``;
        else if (rand() < 0.1) w = `[${w}](https://example.com/${j})`;
        words.push(w);
      }
      const width = 20 + Math.floor(rand() * 40);
      const out = await render(words.join(" "), width);
      for (const l of out.split("\n")) {
        expect(displayWidth(l)).toBeLessThanOrEqual(width);
      }
    }
  });

  test("ANSI byte length > display length on colored output", async () => {
    const out = await render("**styled** paragraph content here");
    expect(Buffer.byteLength(out, "utf8")).toBeGreaterThan(out.replace(/\x1b\[[0-9;]*m/g, "").length);
  });

  test("no protocol tags leak into final output", async () => {
    const doc = "- a\n  - b\n\n> q\n\n| h | k |\n|--|--|\n| 1 | 2 |\n";
    const out = await render(doc);
    expect(out).not.toContain("\u0000");
  });
});
