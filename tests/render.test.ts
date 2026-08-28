import { describe, expect, test } from "bun:test";
import { renderDocument } from "../src/render";
import { DRACULA_PALETTE } from "../src/palette";
import { displayWidth, stripANSI } from "../src/width";

const W = 60;

async function render(src: string, width = W, color: "truecolor" | "none" = "truecolor") {
  return await renderDocument(src, { width, color, palette: DRACULA_PALETTE });
}

function lines(out: string): string[] {
  return out.split("\n");
}

describe("render — headings", () => {
  test("H1–H3 styled, marker badged, blank line after", async () => {
    const out = await render("# Title\n\nBody");
    // Marker is badged: bg = fg = heading colour (solid block, glyph hidden).
    expect(out).toContain("\x1b[48;2;189;147;249m\x1b[38;2;189;147;249m#\x1b[0m");
    // Rest of line (space + text) in heading colour bold.
    expect(out).toContain("\x1b[38;2;189;147;249;1m Title\x1b[0m");
    expect(lines(out)[0]).toBe("");
    expect(lines(out)[2]).toBe("");
  });

  test("H4+ renders the Glow way: marker badged + heading colour", async () => {
    const out = await render("#### Deep");
    expect(out).toContain("\x1b[48;2;189;147;249m\x1b[38;2;189;147;249m####\x1b[0m");
    expect(out).toContain("\x1b[38;2;189;147;249;1m Deep\x1b[0m");
    expect(out).not.toContain("\x1b[1mDeep\x1b[0m"); // no longer a bold-paragraph collapse
  });

  test("long heading wraps within width", async () => {
    const out = await render("# " + "heading ".repeat(12), 30);
    for (const l of lines(out)) expect(displayWidth(l)).toBeLessThanOrEqual(30);
  });
});

// ── Block terminator (the okudagram's bottom; candidate B of the
// 2026-08-27 four-way probe). Rule to the title's column, chip in the
// header chip's cell — renderer-emitted, never authored.
describe("render — block terminator", () => {
  test("present on a non-empty document, two chips bookend the rail", async () => {
    const out = await render("# Title\n\nBody");
    const last = lines(out).map(stripANSI).filter((l) => l !== "").at(-1)!;
    // LHS chip mirrors the H1 badge column; RHS chip mirrors the heading chip.
    expect(last).toMatch(/^ {2}█ ─+ █$/);
    // Same total width as the heading line — the chips land at the same columns.
    const heading = lines(out).map(stripANSI).find((l) => l.includes("Title"))!;
    expect(displayWidth(last)).toBe(displayWidth(heading));
    // LHS chip at the badge column (first content col), RHS chip at the last.
    expect(last[2]).toBe("█");
    expect(last[last.length - 1]).toBe("█");
  });

  test("absent on an empty document", async () => {
    const out = await render("");
    expect(out).not.toContain("─");
    expect(out).not.toContain("█");
  });

  test("none-mode parity: plain rail, plain chips, same columns", async () => {
    const out = await render("Body", W, "none");
    const last = lines(out).map(stripANSI).filter((l) => l !== "").at(-1)!;
    // chip + space + rail(W-4-4) + space + chip = content width (W-4)
    expect(last).toBe("  " + "█ " + "─".repeat(W - 4 - 4) + " █");
    expect(out).not.toContain("\x1b[");
  });
});

// ── RHS chip (brief: right-edge LCARS tab). A heading-bg space at the
//    last content column of every header line — the visible right bound,
//    bookend to the left badge. The chip IS the rhs margin for headers.
//    Structural parity: plain space in NO_COLOR (strip escapes → identical).
describe("render — heading RHS chip (right-edge tab)", () => {
  // Default-palette muted colour is #585858 → bg=fg on `█` (solid block).
  const CHIP = "\x1b[48;2;88;88;88m\x1b[38;2;88;88;88m█\x1b[0m";

  test("chip present at the RHS edge of the text (content boundary)", async () => {
    const w = 40;
    const out = await render("# Title\n\nbody", w);
    expect(out).toContain(CHIP);
    const hdr = lines(out)[1]!; // line 0 is the leading blank
    expect(hdr.endsWith(CHIP)).toBe(true);
    // The chip lines up with the body's right margin: content_width +
    // left_margin = (w-4) + 2 = w-2.
    expect(displayWidth(stripANSI(hdr))).toBe(w - 2);
  });

  test("short header still gets the chip at the content boundary", async () => {
    const w = 20;
    const out = await render("# Hi", w);
    const hdr = lines(out)[1]!;
    expect(hdr.endsWith(CHIP)).toBe(true);
    // The chip lines up with the body's right margin, not floating past it.
    expect(displayWidth(stripANSI(hdr))).toBe(w - 2);
  });

  test("chip on every line of a wrapped header (the bar form)", async () => {
    const out = await render(
      "# " + "heading word ".repeat(8),
      28,
    );
    // Each wrapped header line ends with the chip — the bar bounds the
    // full height of the header block.
    const hdrLines = lines(out).slice(1).filter((l) => l.includes(CHIP));
    expect(hdrLines.length).toBeGreaterThan(1); // wrapped → multiple
    for (const l of hdrLines) expect(l.endsWith(CHIP)).toBe(true);
  });

  test("header text wraps at content_width (chip lines up with body edge)", async () => {
    const w = 24;
    const out = await render("# " + "x".repeat(40), w);
    const chipLines = lines(out).filter((l) => l.includes(CHIP));
    expect(chipLines.length).toBeGreaterThan(0);
    for (const l of chipLines) {
      expect(l.endsWith(CHIP)).toBe(true);
      // Chip at content boundary = content_width + left_margin = w-2.
      expect(displayWidth(stripANSI(l))).toBe(w - 2);
    }
  });

  test("NO_COLOR parity: chip is a plain `█`, lines identical", async () => {
    const src = "# " + "heading word ".repeat(6);
    const tc = await render(src, 26, "truecolor");
    const none = await render(src, 26, "none");
    expect(none).not.toContain("\x1b");
    expect(none).toContain("█"); // glyph present in plain mode too
    // Structural parity: strip escapes from truecolor → identical lines.
    expect(stripANSI(tc).split("\n")).toEqual(none.split("\n"));
  });

  test("reflow on resize keeps the chip at the right bound", async () => {
    const src = "# " + "heading word ".repeat(10);
    const prev = await render(src, 30, "truecolor");
    const next = await render(src, 20, "truecolor");
    // Narrower width → more header lines, every one still chip-terminated.
    const prevChipLines = lines(prev).filter((l) => l.endsWith(CHIP)).length;
    const nextChipLines = lines(next).filter((l) => l.endsWith(CHIP)).length;
    expect(nextChipLines).toBeGreaterThan(prevChipLines);
    for (const l of lines(next)) if (l.includes(CHIP)) expect(l.endsWith(CHIP)).toBe(true);
  });

  test("chip is constant 1 cell (the H1 unit) regardless of level", async () => {
    const h1 = await render("# One", 40);
    const h2 = await render("## Two", 40);
    const h3 = await render("### Three", 40);
    // The RHS chip is the H1 unit, constant — a fixed reference the LHS
    // badge (which grows with level) is measured against.
    expect(lines(h1)[1]).toEndWith(CHIP);
    expect(lines(h2)[1]).toEndWith(CHIP);
    expect(lines(h3)[1]).toEndWith(CHIP);
  });
});

// ── Grammar pre-passes (brief 2026-08-25): front matter elided, setext
//    neutralised. These are the bear-trap leg of the moat — CommonMark
//    parses a closing `---` as a setext h2 underline, silently corrupting
//    renders. Regression coverage for the grammar decision (ADR-009).
describe("render — grammar pre-passes (front matter, setext)", () => {
  test("YAML front matter elided — not parsed as setext h2", async () => {
    const out = await render("---\ntitle: x\ndate: 2026\n---\n# Real\n\nbody");
    // The keys must not surface as content (setext h2 / heading / paragraph).
    expect(out).not.toContain("title:");
    expect(out).not.toContain("date:");
    // The first real content survives as the ATX heading.
    expect(stripANSI(out)).toContain("# Real");
    expect(stripANSI(out)).toContain("body");
  });

  test("`---` under a paragraph is a thematic break, not a setext h2", async () => {
    const tc = await render("para text\n---\n");
    // Neutralised → hr line present (muted rule)…
    expect(tc).toContain("\x1b[38;2;88;88;88m");
    // …and "para text" is NOT promoted to a heading (no heading colour).
    expect(tc).not.toContain("\x1b[38;2;189;147;249mpara text");
    // Structural parity in plain mode: hr rule emitted, no escapes.
    const none = await render("para text\n---\n", W, "none");
    expect(none).toContain("──");
    expect(none).not.toContain("\x1b");
  });

  test("`===` under a paragraph is stripped — text stays a paragraph", async () => {
    const tc = await render("para text\n===\n");
    // The underline is gone, the text is not a heading.
    expect(tc).not.toContain("===");
    expect(tc).not.toContain("\x1b[38;2;189;147;249mpara text");
    expect(tc).toContain("para text");
    const none = await render("para text\n===\n", W, "none");
    expect(none).not.toContain("===");
  });

  test("setext-like lines inside a code fence are untouched", async () => {
    const none = await render("```text\npara\n---\n===\n```", W, "none");
    // Fence body preserved verbatim — not neutralised, not turned into hr.
    expect(none).toContain("para");
    expect(none).toContain("---");
    expect(none).toContain("===");
    // No hr manufactured inside the fence: the only `──` run is the block
    // terminator, and it is the document's last line.
    const hrLines = lines(none).map(stripANSI).filter((l) => l.includes("──"));
    expect(hrLines).toHaveLength(1);
    expect(hrLines[0]).toMatch(/─+ █$/);
  });

  test("standalone thematic break (blank line above) still renders as hr", async () => {
    const out = await render("a\n\n---\n\nb");
    expect(out).toContain("\x1b[38;2;88;88;88m"); // hr present
    expect(out).toContain("a");
    expect(out).toContain("b");
  });
});

describe("render — paragraphs and inline styles", () => {
  test("bold, italic, strikethrough, codespan emit contract sequences", async () => {
    const out = await render("**b** *i* ~~s~~ `c`");
    expect(out).toContain("\x1b[38;2;255;184;108;1mb\x1b[0m");
    expect(out).toContain("\x1b[38;2;241;250;140;3mi\x1b[0m");
    expect(out).toContain("\x1b[9ms\x1b[0m");
    expect(out).toContain("\x1b[38;2;80;250;123mc\x1b[0m");
    expect(out).not.toContain("`c`"); // backticks stripped (Pass B)
  });

  test("***bold italic*** renders in the emphasis colour, not strong's", async () => {
    const out = await render("***bi***");
    // glow-faithful: single SGR, emphasis colour + bold + italic, colour-first
    expect(out).toContain("\x1b[38;2;241;250;140;1;3mbi\x1b[0m");
    // and NOT the nested form where strong's gold would override
    expect(out).not.toContain("\x1b[38;2;255;215;0;1m");
  });

  test("link renders rose text + visible cyan URL, no OSC 8", async () => {
    const out = await render("[text](https://example.com)");
    expect(out).toContain("\x1b[38;2;255;121;198mtext\x1b[0m"); // rose text
    expect(out).toContain("\x1b[38;2;139;233;253;4mhttps://example.com\x1b[0m"); // cyan+underline url
    expect(out).not.toContain("\x1b]8;;"); // no OSC 8 (Pass C)
  });

  test("image rejected as [image: alt]", async () => {
    const out = await render("![the alt](pic.png)");
    expect(out).toContain("[image: the alt]");
    expect(out).not.toContain("pic.png");
  });

  test("soft return reflows to wrap width (ADR-007 amendment)", async () => {
    // Single \n in prose is a word separator, not a line break — text
    // reflows. Reversed 2026-08-24 (foxtrot oscar principle).
    const out = await render("line one\nline two");
    expect(out).toContain("line one line two");
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

  // ADR-004 invariant: okuda owns every \n — no emitted line exceeds the
  // terminal width. Composition shifts nested blocks +4 per level AFTER
  // wrapping (item continuation + LIST_INDENT); the wrap must budget it.
  test("nested list lines respect terminal width (ADR-004)", async () => {
    // 7-char words tile the (pre-fix) avail budget so wrapped lines hit
    // the width limit exactly — shorter words can leave slack and miss.
    const src = "- " + "outerr ".repeat(16) + "\n  - " + "innerr ".repeat(16);
    const out = await render(src, 40);
    for (const l of lines(out)) {
      expect(displayWidth(l)).toBeLessThanOrEqual(40);
    }
  });

  test("flattened third-level lines respect terminal width (ADR-004)", async () => {
    const src =
      "- " + "alpha ".repeat(14) +
      "\n  - " + "beta ".repeat(14) +
      "\n    - " + "gamma ".repeat(14);
    const out = await render(src, 40);
    for (const l of lines(out)) {
      expect(displayWidth(l)).toBeLessThanOrEqual(40);
    }
  });

  // ADR-006 NO_COLOR parity for nested lists: the depth budget is
  // structural and color-independent, so plain output is the coloured
  // output minus escapes with identical line breaks — including the
  // wrapped nested lines where the ADR-004 violation used to live.
  // The existing parity test uses a top-level list only; this pins the
  // nested case so a future palette/depth change can't silently diverge.
  test("nested list plain output is coloured output minus escapes (NO_COLOR parity)", async () => {
    const src =
      "- " + "outerr ".repeat(16) +
      "\n  - " + "innerr ".repeat(16) +
      "\n    - " + "flattened ".repeat(14);
    const colored = await render(src, 40, "truecolor");
    const plain = await render(src, 40, "none");
    expect(plain).not.toContain("\x1b");
    const cLines = colored.split("\n").map((l) => stripANSI(l).replace(/ +$/, ""));
    const pLines = plain.split("\n").map((l) => l.replace(/ +$/, ""));
    expect(cLines).toEqual(pLines);
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
    expect(out).toContain("\x1b[38;2;118;118;118m│\x1b[0m \x1b[38;2;241;250;140;3mquoted line\x1b[0m");
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
    expect(stripped.slice(0, 5)).toEqual(["", "    a", "", "    b", ""]);
    // The block terminator follows: two chips bookend a muted rail.
    expect(stripped.filter((l) => l !== "").at(-1)).toMatch(/^ {2}█ ─+ █$/);
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

// ── doc-ref: bare .md path tokens in prose get the doc-ref colour ──
// (experimental, brief: index-and-jump). The heuristic is greedy — it
// colours any .md mention in prose, not just index lines. The leap.

describe("render — doc-ref colour on bare .md path tokens", () => {
  test("a trailing .md path in an index line is coloured doc-ref", async () => {
    const out = await render("- [01] Title — decisions/foo.md");
    // #e8c44a → 38;2;232;196;74, the doc-ref SGR on the dracula preset.
    expect(out).toContain("\x1b[38;2;232;196;74mdecisions/foo.md\x1b[0m");
  });

  test("the [NN] token is NOT coloured doc-ref (only the .md path)", async () => {
    const out = await render("- [01] Title — decisions/foo.md");
    // The token [01] should not carry the doc-ref SGR.
    expect(out).not.toMatch(/\x1b\[38;2;232;196;74m\[01\]/);
  });

  test("greedy: a .md mention in ordinary prose also colours (the leap)", async () => {
    // This is the documented over-reach — the heuristic colours any .md
    // path in prose, not just index lines. Pinned so a future tightening
    // is a deliberate decision, not a silent regression.
    const out = await render("See the notes in docs/essay.md for more.");
    expect(out).toContain("\x1b[38;2;232;196;74mdocs/essay.md\x1b[0m");
  });

  test("over-reach: a .md path inside a codespan is coloured doc-ref (the leap)", async () => {
    // The text handler runs before codespan (post-order), so the greedy
    // heuristic reaches inside backticks — the path renders doc-ref, not
    // code-green. This is the documented over-reach the experiment accepts;
    // pinned so a future tightening (context guard) is a deliberate change.
    const out = await render("run `decisions/foo.md` now");
    expect(out).toContain("\x1b[38;2;232;196;74mdecisions/foo.md\x1b[0m");
  });

  test("plain prose without a .md token gets no doc-ref SGR", async () => {
    const out = await render("Just a plain sentence about decisions.");
    expect(out).not.toContain("\x1b[38;2;232;196;74m");
  });

  test("extractJumps still lifts the path from the coloured source", async () => {
    // The colouring is render-plane; extractJumps reads source text
    // (pre-render), so jump resolution is immune to the heuristic.
    const { extractJumps } = await import("../src/tui");
    const src = "- [02] Another — briefs/bar.md";
    const j = extractJumps(src);
    expect(j.get(2)).toBe("briefs/bar.md");
  });
});
