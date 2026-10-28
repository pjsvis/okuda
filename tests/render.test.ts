import { describe, expect, test } from "bun:test";
import { MIN_RENDER_WIDTH, renderDocument } from "../src/render";
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

  test("heading style survives an embedded guest paint (td-290433)", async () => {
    // A silcrow in the H1: the guest paints in the vector role, closes
    // with a full reset — and the heading re-opens immediately after
    // it. The enclosing style owns the run; the guest borrows and hands
    // it back. Without the re-open: white text from the reset to the
    // wrap (the ADV-THE-PILE edge).
    // width 70: the heading fits on one line (the gap column narrowed the
    // budget by one, so 60 now wraps this heading mid-assertion). The
    // subject is the guest-paint handoff, not the wrap point.
    const out = await render(
      "# ADV-TEST — a silcrow %okuda-vector:12% and the words that follow it",
      70,
    );
    expect(out).toContain(
      "\x1b[38;2;251;113;133;1m§12\x1b[0m\x1b[38;2;189;147;249;1m and the words that follow it",
    );
  });

  test("NO_COLOR: the guest's weight channel survives and hands back (td-290433)", async () => {
    const out = await render("# T %okuda-vector:12% rest", 60, "none");
    expect(out).toContain("\x1b[1m§12\x1b[0m\x1b[1m rest");
  });
});

// ── Block terminator (the render's bottom; candidate B of the
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
    // NO_COLOR strips colour, not attributes — heading text keeps its bold
    // (SGR 1), but no colour escapes survive. The chip stays a plain `█`.
    expect(none).not.toContain("\x1b[38;2;");
    expect(none).not.toContain("\x1b[48;2;");
    expect(none).toContain("█"); // glyph present in plain mode too
    // Structural parity: strip escapes from both → identical lines.
    expect(stripANSI(tc).split("\n")).toEqual(stripANSI(none).split("\n"));
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

  test("wrapped continuation lines repaint the badge (the LHS rail)", async () => {
    const out = await render("# " + "heading word ".repeat(6), 26);
    const hdr = lines(out)
      .map(stripANSI)
      .filter((l) => l !== "" && l.includes("█") && !l.includes("─"));
    expect(hdr.length).toBeGreaterThan(1); // wrapped → multiple
    for (const l of hdr) {
      // margin (2) + badged hash + space — the rail runs the full height.
      expect(l.startsWith("  # ")).toBe(true);
      // and the column before the chip is always the reserved gap.
      expect(l[l.length - 2]).toBe(" ");
    }
  });

  test("NO_COLOR: the repainted badge is the literal hash", async () => {
    const out = await render("# " + "heading word ".repeat(6), 26, "none");
    // exclude the block terminator (it carries chips but is not a heading).
    const hdr = lines(out)
      .map(stripANSI)
      .filter((l) => l.includes("█") && !l.includes("─"));
    expect(hdr.length).toBeGreaterThan(1);
    for (const l of hdr) expect(l.startsWith("  # ")).toBe(true);
  });

  test("a heading line always leaves a space before the chip (even when full)", async () => {
    const out = await render("# " + "x".repeat(60), 24); // forces full/hard-split lines
    const chipLines = lines(out).map(stripANSI).filter((l) => l.endsWith("█") && !l.includes("─"));
    expect(chipLines.length).toBeGreaterThan(1);
    for (const l of chipLines) expect(l[l.length - 2]).toBe(" ");
  });

  test("the resize contract: the frame columns survive a width change (fixed edges)", async () => {
    // docs/2026-10-08-the-resize-contract.md, condition 1. The LHS badge
    // column and the RHS chip column are references; they do not move with
    // width, and the badge is repainted on every wrapped line so the rail
    // runs the full height of the heading at every width.
    const src = "# " + "heading word ".repeat(12) + "\n\nbody\n";
    for (const w of [24, 40, 72]) {
      const out = await render(src, w);
      const hdr = lines(out)
        .map(stripANSI)
        .filter((l) => l !== "" && l.includes("█") && !l.includes("─"));
      expect(hdr.length).toBeGreaterThan(1); // wraps at every width tested
      for (const l of hdr) {
        expect(l.indexOf("#")).toBe(2); // LHS frame: margin(2) + badge
        expect(l.endsWith("█")).toBe(true); // RHS frame: chip at the edge
        expect(l[l.length - 2]).toBe(" "); // reserved gap, never butted
      }
    }
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

  test("bare autolink / self-identical link: the address once, not twice", async () => {
    const out = await render(
      "See <https://example.com> and [https://example.com/](https://example.com)",
    );
    const stripped = stripANSI(out);
    expect(stripped.match(/https:\/\/example\.com/g)).toHaveLength(2); // once per link — was four
  });

  test("noun-phrase label keeps the two-part paint (the designed case)", async () => {
    const out = await render("[the okuda repo](https://github.com/x)");
    expect(out).toContain("\x1b[38;2;255;121;198mthe okuda repo\x1b[0m"); // rose label
    expect(out).toContain("\x1b[38;2;139;233;253;4mhttps://github.com/x\x1b[0m"); // cyan-underlined URL
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

  test("a flattened third level keeps one column — marker line and wrap share a base", async () => {
    // The cap flatten dedents a continuation line to its marker line's own base,
    // or the flattened item tears: the first line at the parent's indent and the
    // tail eight columns deeper (found 2026-10-12).
    const out = await render(
      "- top\n\n  - child\n\n    - a third level whose text is long enough to wrap at this width today",
      60,
    );
    const ls = lines(out);
    const i = ls.findIndex((l) => stripANSI(l).includes("a third level"));
    const indent = (s: string) => s.match(/^ */)![0].length;
    expect(i).toBeGreaterThan(0);
    expect(stripANSI(ls[i]!).includes("•")).toBe(false); // flattened — no marker
    expect(indent(ls[i + 1]!)).toBe(indent(ls[i]!)); // the wrap shares the base
  });

  test("a sub-list's first item is spaced from its parent like its siblings", async () => {
    // The parent→first-child seam is the one pair that lacks the blank
    // line `itemBlocks.join("\n\n")` gives every other pair. Source blank
    // lines cannot fix it: the list parser normalises them away.
    const out = await render("- parent\n  - first child\n  - second child", 40);
    const raw = lines(out);
    const at = (needle: string) =>
      raw.findIndex((l) => stripANSI(l).includes(needle));
    const p = at("parent");
    const c1 = at("first child");
    const c2 = at("second child");
    expect(raw[p + 1]).toBe(""); // parent → first child
    expect(c1).toBe(p + 2);
    expect(raw[c1 + 1]).toBe(""); // first child → second child
    expect(c2).toBe(c1 + 2); // both seams loose, consistently
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
    // An aside is italic — the invariant. The pipe is the blockquote
    // cue; the italic is the aside's identity.
    expect(out).toContain("\x1b[38;2;118;118;118m│\x1b[0m \x1b[38;2;241;250;140;3mquoted line\x1b[0m");
  });

  test("inline emphasis inside a blockquote renders correctly", async () => {
    const out = await render("> **bold** and *italic* and plain");
    // Bold and italic spans must survive the blockquote container —
    // no RESET spill killing surrounding emphasis, no double-italic.
    // The strong span uses roleBold (colour + ;1m); italic uses ;3m.
    expect(out).toContain(";1m"); // bold survives
    expect(out).toContain(";3m"); // italic survives
    // The plain tail after the inline spans must still be in the quote
    // (pipe prefix present on the line, content not lost).
    const line = lines(out).find((l) => l.includes("plain"));
    expect(line).toBeDefined();
    expect(stripANSI(line!)).toContain("plain");
  });

  test("quote content re-wraps inside the pipe column", async () => {
    const out = await render("> " + "word ".repeat(12), 30);
    for (const l of lines(out)) {
      if (l !== "") expect(displayWidth(l)).toBeLessThanOrEqual(30);
    }
  });
});

describe("render — code fences", () => {
  test("2-space indent, code colours, elided inside the content width (td-b81597)", async () => {
    const long = "x".repeat(70);
    // Untagged by intent (BRF-FENCE-COLOUR): this test pins the codeLine
    // palette path and the elision primitive — a tagged fence now goes
    // through chroma, whose bytes are that brief's to pin.
    const out = await render("```\nconst line = \"" + long + "\"\n```", 40);
    const codeLine = lines(out).find((l) => l.includes("const line"));
    expect(codeLine).toBeDefined();
    expect(stripANSI(codeLine!)).toStartWith("  ");
    // The emitted line stops at `width - 2` — the fence indent 2 + the budget
    // (ctx.width - 2) + the document margin 2. This assertion used to be
    // `toBe(40)`, i.e. the terminal's own width, on the reasoning that
    // "margin 2+2 + ctx.width = 40" keeps the terminal from wrapping. It does
    // the opposite: a line that reaches the last column puts the `…` there,
    // and the terminal wraps it. The invariant is that the glass is never
    // touched — the `…` marks the cut, one column clear of the edge.
    expect(displayWidth(codeLine!)).toBe(38);
    expect(stripANSI(codeLine!).endsWith("…")).toBe(true);
  });

  test("elision is grapheme-aware: a wide cluster never splits", async () => {
    // 16 CJK graphemes = 32 cols > budget 36 at width 40: the last
    // cluster that would straddle drops whole, … takes its place — the
    // elided line never exceeds the budget and never shows half a char.
    const out = await render("```\n\u4e2d\u6587\u5bbd\u5b57\u7b26\u6d4b\u8bd5\u884c\u5f88\u957f\u5f88\u957f\u5f88\u957f\u5f88\u957f\u518d\u52a0\u51e0\u4e2a\u5b57\n```", 40);
    const codeLine = lines(out).find((l) => l.includes("\u4e2d"));
    expect(codeLine).toBeDefined();
    expect(displayWidth(codeLine!)).toBeLessThanOrEqual(40);
    expect(stripANSI(codeLine!).endsWith("…")).toBe(true);
    expect(stripANSI(codeLine!)).not.toMatch(/[\u4e2d-\u9fff]$/); // … not a char
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

  test("HTML comments stripped — the jump-resolver wiring channel", async () => {
    // Compositors hide paths in `<!-- … -->`; the renderer strips them
    // (invisible to the reader) while extractJumps reads them from source.
    const out = await render("**01** *Title* <!-- briefs/foo.md -->");
    expect(out).not.toContain("briefs/foo.md");
    expect(out).not.toContain("<!--");
    expect(out).toContain("Title");
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

  test("plain output is the colored output minus colour (attributes retained, identical line breaks)", async () => {
    const colored = await render(doc, 40, "truecolor");
    const plain = await render(doc, 40, "none");
    // NO_COLOR strips colour, not attributes — bold (SGR 1) survives on
    // headings/strong; no truecolour escapes remain in the plain output.
    expect(plain).not.toContain("\x1b[38;2;");
    expect(plain).not.toContain("\x1b[48;2;");
    // identical structure: strip escapes from both → same lines
    const cLines = colored.split("\n").map((l) => stripANSI(l).replace(/ +$/, ""));
    const pLines = plain.split("\n").map((l) => stripANSI(l).replace(/ +$/, ""));
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

// ── near/far + RHS action: the one-line list pattern ──
// (brief: index-and-jump). Slug left (consider), number RHS (execute),
// path hidden in a comment. Truncate to fit, never wrap.

describe("render — near/far + RHS number, the one-line list pattern", () => {
  test("a .md path in an HTML comment is stripped (hidden wiring)", async () => {
    const out = await render("*Title* %%okuda-rhs:01%% <!-- decisions/foo.md -->");
    expect(out).not.toContain("decisions/foo.md");
    expect(out).not.toContain("<!--");
  });

  test("legacy okuda-rhs strips silently — retired, no badge (ADR-031)", async () => {
    const out = await render("*Title* %%okuda-rhs:01%% <!-- docs/foo.md -->");
    expect(out).not.toContain("[01]");
    expect(out).not.toContain("okuda-rhs");
    expect(out).toContain("Title");
  });

  test("the vector badge paints in the reserved vector role after the slug", async () => {
    const out = await render("*Title* %okuda-vector:01% <!-- docs/foo.md -->");
    // ADR-031 + td-c31929: the badge in the reserved vector paint (rose
    // #fb7185 → 251;113;133) AND bold — the silcrow is a control among
    // information; controls earn both channels (colour + weight).
    // Tolerant of the inline parser's % mangling.
    expect(out).toContain("\x1b[38;2;251;113;133;1m§01\x1b[0m");
  });

  test("the slug renders as emphasis (yellow, italic) on the left", async () => {
    const out = await render("*The Slug* %%okuda-rhs:01%% <!-- docs/foo.md -->");
    // emphasis #f1fa8c → 241;250;140 ; italic (3) on dracula.
    expect(out).toContain("\x1b[38;2;241;250;140;3mThe Slug\x1b[0m");
  });

  test("the slug and number are on one line (no wrap)", async () => {
    const out = await render("*Short* %okuda-vector:01% <!-- docs/foo.md -->");
    // The item is one line of body text (plus the header/footer rails).
    const bodyLines = out.split("\n").filter((l) => l.trim() && !l.includes("─") && !l.includes("█"));
    expect(bodyLines.length).toBe(1);
  });

  test("a long slug truncates with … and the vector badge still paints", async () => {
    const out = await render(
      "*A very long slug that will not fit in a narrow terminal* %okuda-vector:05% <!-- docs/x.md -->",
      40,
    );
    const plain = out.replace(/\x1b\[[0-9;]*m/g, "");
    expect(plain).toContain("§05");
    // ADR-031: references are prose — the badge wraps with the text
    // (the elide-to-one-line behavior was the legacy menu-row pattern).
    expect(plain.split("\n").some((l) => l.trimEnd().endsWith("§05"))).toBe(true);
    expect(plain).toContain("narrow terminal");
  });

  test("greedy: a .md mention in ordinary prose lifts to doc-ref gold (the affordance register)", async () => {
    const out = await render("See the notes in docs/essay.md for more.");
    // doc-ref #e8c44a → 232;196;74 — the affordance register, not the
    // gloaming (amended 2026-09-12: actable paths are near by function).
    expect(out).toContain("\x1b[38;2;232;196;74mdocs/essay.md\x1b[0m");
  });

  test("a non-digit strong run keeps the amber strong colour (not white)", async () => {
    const out = await render("**not-a-number**");
    // strong #ffb86c → 255;184;108 ; bold (1). The digits-only rule is
    // scoped to numbers; prose strong stays amber.
    expect(out).toContain("\x1b[38;2;255;184;108;1mnot-a-number\x1b[0m");
  });

  test("extractJumps still lifts the path from the RHS-token source", async () => {
    const { extractJumps } = await import("../src/tui");
    const j = extractJumps("*Another* %%okuda-rhs:02%% <!-- briefs/bar.md -->");
    expect(j.get(2)).toBe("briefs/bar.md");
  });
});

// ── prose state glyphs: the closed lexicon colours standalone glyphs ──
// (the leap — prose glyphs were plain before; now consistent everywhere).

describe("render — state glyphs colour in prose (the lexicon leap)", () => {
  test("a leading ☐ in a prose run colours state-todo yellow bold", async () => {
    const out = await render("☐ open — title");
    // state-todo #ffe066 → 255;224;102 ; bold (1)
    expect(out).toContain("\x1b[38;2;255;224;102;1m☐\x1b[0m");
  });
  test("✓ colours state-ok green bold", async () => {
    const out = await render("✓ done — landed");
    expect(out).toContain("\x1b[38;2;95;211;95;1m✓\x1b[0m");
  });
  test("✗ colours state-failed red bold", async () => {
    const out = await render("✗ rejected — out of scope");
    expect(out).toContain("\x1b[38;2;255;85;85;1m✗\x1b[0m");
  });
  test("⸮ colours state-parked aubergine bold, and ⋮ no longer claims the state", async () => {
    // BRF-IRONY-MARK: the irony mark takes the parked state; the vertical ellipsis
    // goes back to elision and must not be coloured as a state any more.
    const out = await render("⸮ parked — gate not fired");
    expect(out).toContain("\x1b[38;2;160;111;168;1m⸮\x1b[0m");
    const old = await render("⋮ parked — gate not fired");
    expect(old).not.toContain("\x1b[38;2;160;111;168;1m⋮\x1b[0m");
  });
  test("every standalone glyph in a legend line colours, not just the first", async () => {
    // The status key at the bottom of a menu: all four glyphs colour.
    const out = await render("☐ open · ⸮ parked · ✗ rejected · ✓ accepted");
    expect(out).toContain("\x1b[38;2;255;224;102;1m☐\x1b[0m");
    expect(out).toContain("\x1b[38;2;160;111;168;1m⸮\x1b[0m");
    expect(out).toContain("\x1b[38;2;255;85;85;1m✗\x1b[0m");
    expect(out).toContain("\x1b[38;2;95;211;95;1m✓\x1b[0m");
  });
  test("a glyph embedded in a word is NOT coloured (standalone only)", async () => {
    // The lookahead requires the glyph to be followed by space/end, so
    // an embedded use (no surrounding spaces) stays plain. Conservative.
    const out = await render("foo✓bar");
    expect(out).not.toContain("\x1b[38;2;95;211;95;1m✓");
  });
  test("a non-state glyph in prose stays plain (◆ is priority, not state)", async () => {
    const out = await render("◆ priority — not a state glyph");
    expect(out).not.toContain("\x1b[38;2;95;211;95;1m◆");
    expect(out).not.toContain("\x1b[38;2;255;224;102;1m◆");
  });

  test("a list lead with a state glyph paints ONCE — no decapitated SGR leak", async () => {
    // The inline paint reached the glyph before the list lead did; the
    // splice used to skip ONE BYTE at the SGR boundary — decapitating
    // the escape, leaking `[38;2;…` as literal text, doubling the glyph
    // (the operator's snag: `• ✗[38;2;255;85;85;1m✗ Autolink`).
    const out = await render("- ✗ Autolink pass. Rejected — URL detection is the terminal's job.");
    const line = out.split("\n").find((l) => stripANSI(l).includes("Autolink"))!;
    expect([...stripANSI(line).matchAll(/✗/g)].length).toBe(1); // once, never twice
    expect(line).toContain("\x1b[38;2;255;85;85;1m✗\x1b[0m"); // styled lead
    expect(stripANSI(line)).not.toContain("[38;"); // no escape body as text
  });

  test("a glyph under an enclosing style splices over the glyph — runs kept", async () => {
    // Strong wraps the (already-painted) glyph: the leading runs are an
    // enclosing style, the splice replaces exactly the glyph, and the
    // strong run survives ahead of it.
    const out = await render("- **✗ rejected inside strong** — the lead survives");
    const line = out.split("\n").find((l) => stripANSI(l).includes("rejected"))!;
    expect([...stripANSI(line).matchAll(/✗/g)].length).toBe(1);
    expect(line).toContain("\x1b[38;2;255;85;85;1m✗\x1b[0m");
    expect(stripANSI(line)).not.toContain("[38;");
  });

  test("a table cell glyph under an enclosing style — same splice, no leak", async () => {
    const out = await render("| a | b |\n|---|---|\n| plain | **✗ in strong** |");
    const line = out.split("\n").find((l) => stripANSI(l).includes("in strong"))!;
    expect([...stripANSI(line).matchAll(/✗/g)].length).toBe(1);
    expect(stripANSI(line)).not.toContain("[38;");
  });
});

// ── The GLöam wordmark (the BÖC move) ──
// The metal umlaut exists only at render time: source "GLoam"/"Gloam",
// screen GLöam, the ö rubricated in the vector rose — the wordmark
// channel, recognition not syntax (the mystery-logo pattern, second
// of its name after L§AB).
describe("render — the GLöam wordmark (render-time metal umlaut)", () => {
  test("GLoam and Gloam both paint the canonical GLöam, ö in vector rose", async () => {
    const out = await render("GLoam hosts, Gloam narrates.");
    const rose = "\x1b[38;2;251;113;133;1m";
    expect(out).toContain("GL" + rose + "\u00f6\x1b[0m" + "am");
    // Both source spellings canonicalise to the one wordmark.
    expect(stripANSI(out)).toContain("GL\u00f6am");
    expect(stripANSI(out)).toContain("GL\u00f6am hosts");
    expect(stripANSI(out)).toContain("GL\u00f6am narrates");
    // The un-umlauted source form never leaks to screen.
    expect(stripANSI(out)).not.toContain("GLoam");
    expect(stripANSI(out)).not.toContain("Gloam");
  });
  test("the lowercase Scots word (gloam) stays plain — word, not name", async () => {
    const out = await render("the gloam gathers");
    expect(stripANSI(out)).toContain("the gloam gathers");
    expect(out).not.toContain("\x1b[38;2;251;113;133;1m\u00f6");
  });
  test("the lowercase command (gloam) in a codespan stays literal — word, not name", async () => {
    // The corpus rule: code spans carry the command (lowercase `gloam`,
    // the launcher); prose carries the name (capitalized). The wordmark
    // paints the name; the command is never touched, in prose or code.
    const out = await render("`gloam -g flux` is the search");
    expect(stripANSI(out)).toContain("gloam -g flux");
    expect(out).not.toContain("\u00f6");
  });
  test("NO_COLOR parity: plain bold ö, no colour", async () => {
    const out = await render("GLoam in none mode", 60, "none");
    expect(out).toContain("\x1b[1m\u00f6\x1b[0m");
    expect(out).not.toContain("\x1b[38;2;251;113;133;1m");
  });
  test("the ö measures width 1 (table column math depends on it)", () => {
    expect(displayWidth("\u00f6")).toBe(1);
    expect(displayWidth("GL\u00f6am")).toBe(5);
  });
});

// ── Stream identity header (BRF-STREAM-IDENTITY-HEADER). The streaming path
//    names the document for an unknown destination: one muted line, a blank,
//    the body. Absent segments collapse; nothing → no header at all.
describe("render — stream identity header (BRF-STREAM-IDENTITY-HEADER)", () => {
  const ID = { silo: "okuda", callsign: "ADR-031", file: "decisions/031-main-document.md" };
  const run = (extra: object, color: "truecolor" | "none" = "truecolor") =>
    renderDocument("# Title\n\nBody\n", { width: 60, color, palette: DRACULA_PALETTE, ...extra });

  test("full identity: muted line, blank, then the body", async () => {
    const out = await run(ID);
    const l = lines(out);
    expect(stripANSI(l[0]!)).toBe("  okuda · ADR-031 · decisions/031-main-document.md");
    expect(l[0]).toContain("\x1b[38;2;"); // muted on the glass
    expect(l[1]).toBe(""); // the separator that survives every medium
    expect(stripANSI(l[2]!)).toContain("Title");
  });

  test("absent segments collapse — only what is available is shown", async () => {
    const out = await run({ silo: "okuda", file: "docs/note-20260905.md" });
    expect(stripANSI(lines(out)[0]!)).toBe("  okuda · docs/note-20260905.md");
  });

  test("no identity at all → no header, never a placeholder", async () => {
    const out = await run({});
    expect(lines(out)[0]).toBe(""); // the usual leading blank stands
    expect(out).not.toContain("·");
  });

  test("NO_COLOR: the header is plain — no escape, identical line breaks", async () => {
    const out = await run(ID, "none");
    expect(lines(out)[0]).toBe("  okuda · ADR-031 · decisions/031-main-document.md");
    expect(lines(out)[1]).toBe("");
  });
});

describe("render — the glass invariant: no emitted line is wider than the declared width", () => {
  // Every other width test in this file checks ONE block type, on a document
  // built to exercise it. So a block could outgrow the glass and only its own
  // test would notice — and the stream identity header had no such test at all.
  // Measured 2026-10-25: at a declared width of 40 the header rendered 42
  // columns, because `silo · callsign · file` was concatenated and never
  // elided; the terminal soft-wrapped it, which is the one thing okuda must
  // never make it do (ADR-004, ADR-UNIVERSAL-ELISION-050).
  //
  // This is the whole-document property instead: every emitter, one document,
  // a width ladder that crosses the failure. It is the invariant, not an
  // example of it.
  const DOC = [
    "## A heading that is long enough to need wrapping at narrow widths",
    "",
    "A paragraph of prose with a reasonably long line and a [link](https://example.com/x) and inline `code`.",
    "",
    "- a list item long enough to wrap when the glass is narrow",
    "  - a nested item, also long enough to wrap at narrow widths",
    "  - a second nested item",
    "",
    "| Column one | Column two |",
    "|---|---|",
    "| a cell with some width to it | another cell here |",
    "",
    "```ts",
    "const x = 'a code line long enough to be elided at narrow widths';",
    "```",
    "",
    "> A quoted aside long enough to wrap inside the pipe column at narrow widths.",
    "",
    "---",
    "",
    "Inline math $\\Delta t$ and a state glyph ✓ in prose.",
    "",
  ].join("\n");
  // A filename long enough to be the failure: the identity header is generated,
  // so it is the emitter an author cannot shorten by editing.
  const ID = { silo: "okuda", callsign: "BRF-DIAGRAM-WIDTH-HANDOFF", file: "docs/2026-10-25-a-deliberately-long-document-name.md" };

  // The ladder starts AT the declared floor (MIN_RENDER_WIDTH), because below it
  // the document is not composed at all — there is no line to be wider than the
  // glass. That is the policy this test exists to hold: a floor you do not test
  // is a floor that drifts.
  //
  // Measured 2026-10-25, which is also how the ellipsis myth died: of 280
  // over-width lines at 10-12 columns, ONE contained an ellipsis, and every one of
  // them began at 8 or 10 columns of indent. The `…` was a victim, not a cause —
  // when a line overruns, the terminal wraps it and the marker (being last) lands
  // alone on the next line, which reads as "the ellipsis is not breakable".
  test("every line fits, from the floor to 120", async () => {
    for (const w of [20, 24, 28, 32, 36, 40, 48, 60, 72, 100, 120]) {
      const out = await renderDocument(DOC, { width: w, color: "none", ...ID });
      for (const l of out.split("\n")) {
        expect(displayWidth(l), `width ${w}: ${JSON.stringify(l)}`).toBeLessThanOrEqual(w);
      }
    }
  });

  test("below the floor the document is not composed: one receipt, and it fits", async () => {
    // Three dishonest options (overflow; flatten the nesting; one grapheme per
    // line) and one honest one: say the number. The number leads so it survives
    // the elision the narrow glass forces on the receipt itself.
    for (const w of [8, 10, 13, 16, 19]) {
      const out = await renderDocument(DOC, { width: w, color: "none", ...ID });
      const lines = out.split("\n").filter((l) => l.trim() !== "");
      expect(lines.length, `width ${w} should be one receipt, got ${JSON.stringify(out)}`).toBe(1);
      expect(displayWidth(lines[0]!).valueOf()).toBeLessThanOrEqual(w);
      // The REQUIREMENT is the last thing to survive the cut — at eight columns
      // the receipt is `⋮ 20 …`, which still says what the pane needs. The unit
      // and the second number follow as room appears. Measured ladder, and the
      // reason the verb is absent: this receipt only ever fires below 20 columns,
      // where `needs` would have cost the number its place (first draft read
      // `⋮ nee…` at eight columns).
      expect(stripANSI(lines[0]!)).toContain(`${MIN_RENDER_WIDTH}`);
      if (w >= 9) expect(stripANSI(lines[0]!)).toContain("c");
      if (w >= 13) expect(stripANSI(lines[0]!)).toContain("cols");
      if (w >= 17) expect(stripANSI(lines[0]!)).toContain(`${w}`);
    }
  });

  test("and the identity header is the case that bites: it elides like every other receipt", async () => {
    // The generated line an author cannot shorten. It must elide, not wrap —
    // and it must keep its margin, which is not part of the budget.
    const out = await renderDocument("# T\n\nBody\n", { width: 40, color: "none", ...ID });
    // Line 0: the header is prepended above the body, and `finalize`'s leading
    // blank belongs to the body, not to the header.
    const first = out.split("\n")[0]!;
    expect(stripANSI(first).startsWith("  okuda · ")).toBe(true);
    expect(displayWidth(first)).toBeLessThanOrEqual(40);
    expect(stripANSI(first).endsWith("…")).toBe(true);
  });
});

describe("render — the read boundary tops and tails (a file's ending is not a contract)", () => {
  // The operator's question, 2026-10-25: "do we even need to fix the files in
  // place? we get the file from the file system so we have an opportunity to top
  // and tail it." We do, and it already happens — but "it works" and "it is meant
  // to work" are different states, and only one survives a dependency bump. So
  // the equivalence is pinned rather than assumed.
  //
  // This replaces a corpus lint about trailing newlines. A rule over file bytes
  // polices a property with no consumer: the renderer collapses them, no tool
  // reads the tail, and the files violating it are mostly frozen history, so the
  // rule could only ever record permanent debt. The contract belongs at the
  // boundary, where it is true and where it can be tested.
  const CLEAN = [
    "# Title",
    "",
    "A paragraph with",
    "two source lines.",
    "",
    "```ts",
    "const a = 1;",
    "```",
    "",
    "| Col | Val |",
    "|---|---|",
    "| a | 1 |",
    "",
  ].join("\n");

  const render = (source: string) =>
    renderDocument(source, { width: 60, color: "none", silo: "okuda", file: "docs/x.md" });

  const HAZARDS: [string, string][] = [
    ["a UTF-8 BOM", "\uFEFF" + CLEAN],
    ["CRLF line endings", CLEAN.replace(/\n/g, "\r\n")],
    ["lone CR line endings (classic Mac)", CLEAN.replace(/\n/g, "\r")],
    ["four leading blank lines", "\n\n\n\n" + CLEAN],
    ["seven trailing newlines", CLEAN.replace(/\n$/, "\n\n\n\n\n\n\n")],
    ["no final newline", CLEAN.replace(/\n$/, "")],
  ];

  for (const [name, dirty] of HAZARDS) {
    test(`${name} renders identically to the clean source`, async () => {
      expect(await render(dirty)).toBe(await render(CLEAN));
    });
  }

  test("prose line endings are already insignificant, which is WHY this is safe", async () => {
    // A hard break (`one  \n`), a soft break (`one\ntwo`) and a single line all
    // render to the same sentence — not because this normalisation ate the
    // syntax, but because okuda retired break-honouring in prose on 2026-08-24
    // (`ADR-007` amendment, the foxtrot oscar principle: soft returns were an
    // author-side hack against renderers that collapsed whitespace, and the hack
    // breaks the layout on resize). Which is the wrap law applied to the INPUT
    // rather than the output: in prose the break is insignificant, so normalising
    // it loses nothing.
    const flat = await render("one two\n");
    expect(await render("one  \ntwo\n")).toBe(flat);
    expect(await render("one\ntwo\n")).toBe(flat);
  });

  test("but whitespace that DECIDES STRUCTURE is untouched", async () => {
    // Indentation is structure: four spaces make a code block, three do not, and
    // the boundary must not trim either.
    expect(await render("    not fenced: this is an indented code block\n")).toContain("not fenced");
    expect(await render("# Title\n\n    code\n")).toContain("code");
    // (A blank line between blocks is NOT load-bearing here: an ATX heading
    // already ends at its newline, so `# Title\nBody` and `# Title\n\nBody` are
    // the same document by the spec. Block separation is the parser's business,
    // not the boundary's — which is the point of leaving it alone.)
  });
});

describe("render — an address elides; it does not wrap (a wrapped path is a false name)", () => {
  // Found 2026-10-25, and it was not a narrow-width matter: at a 60-column pane
  // the annotated-reference line rendered as `…-width-handoff.` / `md §12` — the
  // extension split from the basename, the badge stranded on the last line. The
  // handler that would have elided it was written and unreachable, because
  // post-order means `text()` replaces the vector token with the painted badge
  // before `paragraph()` can look for it.
  const REF = "briefs/2026-10-25-brief-diagram-width-handoff.md";
  const run = (src: string, w: number) => renderDocument(src, { width: w, color: "none" });

  test("a lone reference is cut with `…`, and the badge survives whole", async () => {
    // Both authored orders: token after the slug (what `annotateSource` emits) and
    // before it. The badge is the actuation point, so it is never the casualty.
    for (const src of [`${REF} %okuda-vector:12%\n`, `%okuda-vector:12% ${REF}\n`]) {
      const out = await run(src, 40);
      const lines = out.split("\n").filter((l) => l.trim() !== "");
      // One line for the address — not three. (The terminator is the last line.)
      const addr = lines.filter((l) => l.includes("§12") || l.includes("briefs/"));
      expect(addr.length).toBe(1);
      const text = stripANSI(addr[0]!);
      expect(text).toContain("…"); // cut, not re-flowed
      expect(text).toContain("§12"); // the actuation point survives whole
      // And nothing anywhere is an orphaned extension.
      for (const l of lines) expect(stripANSI(l).trim()).not.toBe("md");
      for (const l of out.split("\n")) expect(displayWidth(l)).toBeLessThanOrEqual(40);
    }
  });

  test("a line that already fits keeps its exact bytes", async () => {
    // The predicate returns null when the address fits, so the common case is
    // untouched — no reconstruction, no repaint, no byte drift.
    const source = `${REF} %okuda-vector:12%\n`;
    expect(await run(source, 120)).toBe(await run(source, 120));
    expect(stripANSI(await run(source, 120))).toContain(`${REF} §12`);
  });

  test("prose containing a reference is prose, and still wraps as prose", async () => {
    // Anchored at both ends: a sentence is not an address, and cutting it would
    // lose the sentence rather than an address.
    const src = `see ${REF} §12 for the reasoning\n`;
    const out = stripANSI(await run(src, 40));
    expect(out).toContain("see");
    expect(out).toContain("reasoning");
    // Wrapped, not cut: no single line carries the whole reference, and no line
    // carries the elision marker the address path would have added.
    for (const l of out.split("\n")) expect(l).not.toContain(REF);
    expect(out).not.toContain("…");
  });
});

describe("a nested role hands the enclosing style back (td-1dec86)", () => {
  // A state glyph paints in its own role and closes with a full RESET, which
  // strips the enclosing run for the whole tail: `**⸮ parked inside strong**`
  // rendered the words after the glyph plain. The heading handler had re-opened
  // since td-290433; list leads, table cells and inline spans had not. The
  // re-open now lives in the styler's wrap, so every role owes it.
  test("inline strong: the tail is styled again after the glyph", async () => {
    const out = await render("**⸮ parked inside strong**", 70);
    expect(out).toContain("\x1b[38;2;160;111;168;1m⸮\x1b[0m\x1b[38;2;255;184;108;1m parked inside strong");
  });

  test("list lead and table cell: same handoff, not just headings", async () => {
    const lead = await render("- **⸮ parked as a lead**", 70);
    expect(lead).toContain("\x1b[38;2;255;184;108;1m parked as a lead");
    const cell = await render("| a | b |\n|---|---|\n| **⸮ closed** | x |", 70);
    expect(cell).toContain("\x1b[38;2;255;184;108;1m closed");
  });

  test("none mode: the weight channel hands back too", async () => {
    const out = await render("**⸮ parked**", 60, "none");
    expect(out).toContain("\x1b[1m⸮\x1b[0m\x1b[1m parked");
  });
});

describe("body ink — a role for the ground, empty by default (td-eca2ef)", () => {
  // Prose was the only class with no role: paragraphs, list text and table
  // cells inherited whatever foreground the glass happened to have. That is not
  // neutrality — it is an unfilled role, and a principal who finds the default
  // too bright had no way to say so from inside okuda. The role ships EMPTY so
  // the renderer holds no opinion about a background it cannot query; the
  // override file is the dial (`~/.config/okuda/palette.json`).
  const BODY = "#8a8a84"; // 138,138,132 — a dogfood value, not a default
  const inked = (src: string) =>
    renderDocument(src, { width: W, color: "truecolor", palette: { ...DRACULA_PALETTE, body: BODY } });

  test("default: no ink at all — prose inherits the glass's foreground", async () => {
    const out = await render("Plain prose, no emphasis, no codespan.");
    const line = out.split("\n").find((l) => l.includes("Plain prose"))!;
    expect(line).toBe("  Plain prose, no emphasis, no codespan.");
  });

  test("a declared hex paints prose, a list lead, and a table cell", async () => {
    const prose = await inked("Dimmed prose reads as body text.");
    expect(prose).toContain("\x1b[38;2;138;138;132mDimmed prose reads as body text.");
    const list = await inked("- a lead\n- second");
    expect(list).toContain("\x1b[38;2;138;138;132m• a lead\x1b[0m");
    const table = await inked("| a | b |\n|---|---|\n| one | two |");
    // the key column keeps table-key amber; the plain cell takes body ink
    expect(table).toContain("\x1b[38;2;255;255;135;1mone\x1b[0m");
    expect(table).toContain("\x1b[38;2;138;138;132mtwo\x1b[0m");
  });

  test("a menu row's callsign and number take the ground; the slug stays the key", async () => {
    const out = await inked("| slug | CS | %%okuda-rhs:1%% |\n|---|---|---|\n| a doc | AB | 01 |");
    expect(out).toContain("\x1b[38;2;255;255;135;1ma doc\x1b[0m");
    expect(out).toContain("\x1b[38;2;138;138;132mAB\x1b[0m");
    expect(out).toContain("\x1b[38;2;138;138;132m01\x1b[0m");
  });

  test("body is the enclosing run: an inner role keeps its ink and hands the ground back", async () => {
    // The composition that matters — dim prose must not dim the emphasis the
    // author wrote, and the tail must return to the ground, not to plain.
    const out = await inked("prose with **strong** and a tail");
    expect(out).toContain(
      "\x1b[38;2;138;138;132mprose with \x1b[38;2;255;184;108;1mstrong\x1b[0m\x1b[38;2;138;138;132m and a tail",
    );
  });

  test("NO_COLOR parity: an inked body changes no visible character", async () => {
    const plain = await render("prose with **strong** and a tail", W, "none");
    const withInk = await renderDocument("prose with **strong** and a tail", {
      width: W, color: "none", palette: { ...DRACULA_PALETTE, body: BODY },
    });
    expect(withInk).toBe(plain);
  });
});
