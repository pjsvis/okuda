import { describe, expect, test } from "bun:test";
import { elideCanvasRow, renderDocument } from "../src/render";
import { DRACULA_PALETTE } from "../src/palette";
import { displayWidth, stripANSI } from "../src/width";
import { existsSync } from "node:fs";

const W = 64;

describe("render — tables (uniform presentation policy)", () => {
  test("header cyan+bold, rule kept, amber first column, loose rows", async () => {
    const out = await renderDocument(
      "| Name | Qty |\n|---|---|\n| x | 1 |\n| y | 2 |\n",
      { width: W, palette: DRACULA_PALETTE },
    );
    const ls = out.split("\n").map((l) => l.trim() === "" ? "" : l);
    // header row: pine bold
    expect(out).toContain("\x1b[38;2;189;147;249;1m");
    // rule under header (shifted by top margin line, prefixed by 2-char margin)
    expect(ls[2]).toMatch(/^  \x1b\[38;2;88;88;88m─+/);
    // amber key column
    expect(out).toContain("\x1b[38;2;255;255;135;1m");
    // blank line between body rows
    const bodyStart = ls.findIndex((l) => l.includes("255;255;135"));
    expect(ls[bodyStart + 1]).toBe("");
    // no internal pipes or box borders in rendered rows
    expect(out).not.toMatch(/\x1b\[0m\s*\|/);
  });

  test("alignment markers preserved: centre and right", async () => {
    const out = await renderDocument(
      "| L | C | R |\n|---|:---:|--:|\n| left | centre | right |\n",
      { width: W },
    );
    const ls = out.split("\n");
    const dataLine = ls.find((l) => stripANSI(l).includes("centre"));
    expect(dataLine).toBeDefined();
    // centre: content has leading spaces within the padded cell
    expect(stripANSI(dataLine!)).toMatch(/left\s+centre\s+right/);
    // the header "C" is centred: spaces on both sides; `│` separators
    // between header cells (grid cue, ADR-007 divergence table).
    const headerLine = ls.find((l) => stripANSI(l).trim().startsWith("L"));
    expect(stripANSI(headerLine!)).toMatch(/L\s*│\s*C\s*│\s*R/);
  });

  test("header grid: │ separators between header cells, rules bracket the table", async () => {
    const out = await renderDocument(
      "| Name | Qty |\n|---|---|\n| x | 1 |\n",
      { width: W, palette: DRACULA_PALETTE },
    );
    const ls = out.split("\n").map((l) => l);
    // header row has │ between cells (muted pipe, colour mode)
    const headerLine = ls.find((l) => stripANSI(l).includes("Name"))!;
    expect(stripANSI(headerLine)).toMatch(/Name\s*│\s*Qty/);
    // body rows do NOT have │ (loose body, gutter only)
    const bodyLine = ls.find((l) => stripANSI(l).includes("x"))!;
    expect(stripANSI(bodyLine)).not.toMatch(/│/);
    // The header rule and the closing rule bracket the TABLE, not the glass
    // (BRF-TABLE-LADDER): a bracket wider than its contents is a promise the
    // table does not keep — it was up to 103 columns of air under the bar.
    // Each rule is exactly as wide as the widest line drawn.
    // The block terminator also draws a muted rail (same channel) — exclude
    // it: it ends in the chip, table rules do not.
    const ruleLines = ls.filter(
      (l) => /^\s*\x1b\[38;2;88;88;88m─+/.test(l) && !stripANSI(l).endsWith("█"),
    );
    expect(ruleLines.length).toBe(2);
    const widest = Math.max(
      ...ls
        .filter((l) => l !== "" && !ruleLines.includes(l) && !stripANSI(l).endsWith("█"))
        .map((l) => displayWidth(l)),
    );
    for (const r of ruleLines) expect(displayWidth(r)).toBe(widest);
    // and a narrow table's rule is emphatically NOT the content width
    expect(displayWidth(ruleLines[0]!)).toBeLessThan(W - 4);
  });

  test("a narrow glass wraps the cells — rows become blocks, nothing is elided", async () => {
    // BRF-TABLE-GLASS-FIT repealed the below-cap squeeze and the single-line
    // cut: the floor test runs at the glass, so a cell over its share wraps
    // onto continuation lines rather than truncating with `…`.
    const out = await renderDocument(
      "| a | b |\n|---|---|\n| hi | long cell content here |\n",
      { width: 24 },
    );
    const ls = out.split("\n");
    // Every word of the long cell is present: the row is a block, not a cut.
    for (const word of ["hi", "long", "content", "here"]) {
      expect(ls.some((l) => stripANSI(l).includes(word))).toBe(true);
    }
    expect(ls.every((l) => !l.includes("…"))).toBe(true);
    for (const l of ls) expect(displayWidth(l)).toBeLessThanOrEqual(24);
  });

  test("right-aligned column pads on the left", async () => {
    const out = await renderDocument(
      "| n |\n|--:|\n| 7 |\n| 42 |\n",
      { width: W },
    );
    const l7 = out.split("\n").find((l) => stripANSI(l).includes("7"));
    // "7" is right-aligned in a column of width 2: leading space
    expect(stripANSI(l7!)).toMatch(/\s7/);
  });

  test("fits the terminal width — never overflows", async () => {
    const wide = Array.from({ length: 5 }, (_, i) =>
      `cell-${i}-${"x".repeat(18)}`,
    ).join(" | ");
    const src = `| a | b | c | d | e |\n|--|--|--|--|--|\n| ${wide} |\n`;
    const out = await renderDocument(src, { width: 40 });
    for (const l of out.split("\n")) {
      expect(displayWidth(l)).toBeLessThanOrEqual(40);
    }
  });

  test("no artificial floor — narrow table content stays narrow", async () => {
    const out = await renderDocument("| a | b |\n|--|--|\n| 1 | 2 |\n", { width: W });
    // Data rows stay narrow (no padding to 40), and since BRF-TABLE-LADDER the
    // rules match them — a narrow table carries a narrow bar.
    const dataRows = out.split("\n").filter((l) =>
      stripANSI(l).includes("a") || stripANSI(l).includes("1"),
    );
    for (const l of dataRows) {
      expect(displayWidth(l)).toBeLessThan(20);
    }
  });

  test("inline styles inside cells survive", async () => {
    const out = await renderDocument(
      "| k |\n|--|\n| **bold** cell |\n",
      { width: W, palette: DRACULA_PALETTE },
    );
    expect(out).toContain("\x1b[38;2;255;184;108;1mbold\x1b[0m");
  });

  test("table inside code fence renders verbatim (no presentation layer)", async () => {
    const src = "```\n| a | b |\n|---|---|\n| 1 | 2 |\n```";
    const out = await renderDocument(src, { width: W });
    expect(out).toContain("| a | b |");
    expect(out).toContain("|---|---|");
    expect(out).not.toContain("38;2;189;147;249;1"); // no header colour
  });
});

// ── Mermaid ───────────────────────────────────────────────────────────

const MERMAID_SRC = "flowchart LR\n  A[Input v2.0] --> B[Render]\n";

/** A diagram whose canvas is 60 columns: it renders at a canvas of 60 and is
 *  refused at 59. The number is exact, which is what makes it usable as the
 *  expected value in the receipt's provenance test. */
const MERMAID_WIDE =
  "flowchart LR\n  A[Alpha] --> B[Beta] --> C[Gamma] --> B[Delta] --> E[Epsilon] --> F[Zeta] --> G[Eta]";

/** A family the engine does not draw — it returns the source in a box. */
const MERMAID_UNSUPPORTED = "gantt\n  title Plan\n  section S\n  Task :a, 2026-01-01, 1d\n";

/** Six nodes in LR: 65 columns wide, nine rows — and rows 1, 2, 6, 7 put their
 *  first glyph at column 32, so at a narrow budget they are *blank in view*
 *  while carrying content far to the right. That is the shape of the defect the
 *  marker rule exists for, and it is why a fixture whose art starts at column 0
 *  cannot see it. */
const MERMAID_CHAIN = [
  "flowchart LR",
  "  A[Alpha] --> B[Beta]",
  "  B --> C[Cee]",
  "  C --> D[Dee]",
  "  C --> E[Eee]",
  "  E --> F[Eff]",
  "  F --> G[Gee]",
  "",
].join("\n");

describe("render — menu tables (ADR-022 right-anchored role fit, td-b81597)", () => {
  const row = (slug: string, cs: string, n: string, f: string) =>
    `| *${slug}* | ${cs} | **${n}** <!-- %%okuda-rhs:${n}%% ${f} --> |`;
  const menu =
    `| Document | Callsign | # |\n|---|---|---|\n` +
    row("A very long title that goes on and on far past the budget", "BRF-ELISION-PRIMITIVE", "11", "briefs/x.md") + "\n" +
    row("Short", "ADR-ROLE-LAYOUT-022", "12", "decisions/y.md");

  test("number holds the far right edge at every width; callsign never wraps", async () => {
    for (const w of [80, 60, 46, 40]) {
      const out = await renderDocument(menu, { width: w });
      for (const l of out.split("\n")) {
        const s = stripANSI(l);
        if (/^\s+(A very|Short)/.test(s)) {
          // the row is one line filling the content width (ctx.width =
          // w-4, + the 2-char finalize margin = w-2 on the terminal):
          // number at the right edge of the content boundary
          expect(displayWidth(s)).toBe(w - 2);
          expect(s.trimEnd().endsWith("11") || s.trimEnd().endsWith("12")).toBe(true);
        }
      }
      // the mid-token wrap that starved the callsign is gone: no line
      // breaks inside a callsign
      const flat = stripANSI(out).replace(/\s+/g, " ");
      expect(flat).toContain("BRF-ELISION-PRIMITIVE");
      expect(flat).toContain("ADR-ROLE-LAYOUT-022");
    }
  });

  test("the ladder: slug truncates with …, then suppresses; floor stays", async () => {
    // truncate rung: the long slug ends … at the budget
    const mid = await renderDocument(menu, { width: 46 });
    const slugLine = stripANSI(mid).split("\n").find((l) => l.includes("A very"))!;
    expect(slugLine.trimEnd().match(/…\s{2,}/)).toBeTruthy(); // … then gap to callsign
    // suppress rung: no slug at all, callsign + number right-anchored
    const tight = await renderDocument(menu, { width: 34 });
    for (const l of stripANSI(tight).split("\n")) {
      expect(l).not.toContain("A very");
      expect(l).not.toContain("Short");
      if (/BRF-ELISION/.test(l)) {
        expect(l.trimEnd().endsWith("11")).toBe(true); // floor intact
      }
    }
    // widening reverses: the full slug returns at a wide width
    const wide = await renderDocument(menu, { width: 140 });
    expect(stripANSI(wide)).toContain("far past the budget");
  });

  test("degenerate: callsign elides, the number keeps its home", async () => {
    const out = await renderDocument(menu, { width: 14 });
    for (const l of stripANSI(out).split("\n")) {
      if (/BRF-|ADR-/.test(l)) {
        expect(displayWidth(l)).toBeLessThanOrEqual(14);
        expect(l).toMatch(/…\s+1[12]$/); // elided callsign, number at edge
      }
    }
  });

  test("unwired tables stay generic: no role ladder, and the glass wraps them", async () => {
    const plain =
      `| Document | Callsign | # |\n|---|---|---|\n` +
      row("A very long title that goes on and on far past the budget", "BRF-ELISION-PRIMITIVE", "11", "briefs/x.md")
        .replace(/ <!-- [^>]* -->/, ""); // wiring stripped → generic
    const out = await renderDocument(plain, { width: 40 });
    // The menu's right-anchored ladder (floor homes, suppression order) never
    // runs on an unwired table; the generic path wraps the long title at the
    // glass instead of suppressing it (BRF-TABLE-GLASS-FIT).
    const ls = out.split("\n");
    for (const word of ["very", "long", "title", "budget", "PRIMITIVE"]) {
      expect(ls.some((l) => stripANSI(l).includes(word))).toBe(true);
    }
    expect(ls.every((l) => !l.includes("…"))).toBe(true);
  });

  test("wiring never leaks: the comment is invisible in output", async () => {
    const out = await renderDocument(menu, { width: 80 });
    expect(out).not.toContain("%%okuda-rhs");
    expect(out).not.toContain("<!--");
    expect(out).not.toContain("\u0000"); // no tag residue
  });
});

describe("render — mermaid precondition (dependency named, not inferred)", () => {
  // The diagram tests below pipe through the real mermaid-to-md binary.
  // When it is missing they fail opaquely — empty art, colour assertions
  // fail, four tests die with no culprit named. The Omarchy bring-up
  // (2026-09-02) spent a round trip on exactly that. This test names the
  // dependency before the diagram tests run: one failure, one missing
  // tool, one fix. DEPENDENCIES.md is the source of truth for the fix.
  //
  // Round two (2026-09-02, Omarchy field report): the wrapper resolved
  // (symlink in place) but mermaid-tui — the binary the wrapper delegates
  // to — was never installed, so the wrapper existed and failed. An
  // existence check passes while the pipe is broken; the precondition
  // therefore SMOKES the pipe: it spawns the resolved wrapper with a
  // minimal diagram and demands non-empty output. Stat is not smoke.
  const resolveMermaid = (): string | null => {
    // Same resolution order as src/render.ts: ~/.local/bin first, then PATH.
    const candidates = [
      `${process.env.HOME ?? ""}/.local/bin/mermaid-to-md`,
      ...(process.env.PATH ?? "").split(":").map((d) => `${d}/mermaid-to-md`),
    ];
    return candidates.find((p) => p && existsSync(p)) ?? null;
  };

  test("mermaid-to-md pipe smokes end-to-end (precondition for the diagram tests)", async () => {
    const wrapper = resolveMermaid();
    // Unresolved wrapper: name the dependency outright (round-one symptom).
    expect(wrapper).not.toBeNull();
    if (!wrapper) return;
    // Resolved but broken: spawn it and demand art. Catches wrapper-present-
    // binary-missing — the wrapper's own "mermaid-tui not found" exit — and
    // any other pipe failure, before the diagram tests fail opaquely
    // (round-two symptom).
    const proc = Bun.spawn([wrapper], { stdin: "pipe", stdout: "pipe" });
    proc.stdin.write("flowchart LR\n  A[Smoke] --> B[Pipe]\n");
    proc.stdin.end();
    const out = await new Response(proc.stdout).text();
    const code = await proc.exited;
    expect(code).toBe(0);
    expect(out.trim().length).toBeGreaterThan(0);
    expect(out).not.toContain("not found");
  });
});

describe("render — mermaid pipe + colour classification", () => {
  test("mermaid fence replaced by classified ASCII art", async () => {
    const out = await renderDocument("```mermaid\n" + MERMAID_SRC + "```\n", {
      width: W,
      palette: DRACULA_PALETTE,
    });
    // border channel muted, arrow channel link-coloured, text full contrast
    expect(out).toContain("\x1b[38;2;88;88;88m"); // border
    expect(out).toContain("\x1b[38;2;0;175;95m"); // arrow
    expect(out).toContain("\x1b[38;2;215;215;215m"); // text
    // the mermaid source is omitted from the render (tautological in a
    // single-render seam); an indicator names where it lives instead.
    // (brief: mermaid-source-omitted.)
    expect(out).not.toContain("flowchart LR");
    expect(out).not.toContain("-->");
    expect(out).toContain("mermaid source elided");
    // node label survived in the art
    expect(out).toContain("Input v2.0");
  });

  test("every coloured diagram line ends with reset (hygiene rule 4)", async () => {
    const out = await renderDocument("```mermaid\n" + MERMAID_SRC + "```\n", {
      width: W,
      palette: DRACULA_PALETTE,
    });
    const art = out.split("\n").filter((l) => l.includes("38;2;"));
    for (const l of art) expect(l.endsWith("\x1b[0m")).toBe(true);
  });

  test("a diagram wider than the glass is drawn and cut, never refused (BRF-DIAGRAM-WIDTH-HANDOFF)", async () => {
    // The engine is always given a generous canvas, so this diagram exists at
    // its natural 60 columns and the 20-column pane cuts it. The policy that
    // preceded this one refused it instead — reached determinism by making the
    // diagram's existence a function of window width, and cost the document
    // its vertical rhythm (measured: 268 / 374 / 431 / 467 lines at
    // 80 / 100 / 120 / 160 columns).
    const out = await renderDocument("```mermaid\n" + MERMAID_WIDE + "```\n", {
      width: 20,
      palette: DRACULA_PALETTE,
      color: "none",
    });
    for (const l of out.split("\n")) {
      expect(displayWidth(l)).toBeLessThanOrEqual(20);
    }
    expect(out).toContain("…");
    // The fit ladder: at 20 columns the caption and the source clause
    // cannot fit, but the art loss is the new fact and holds the last
    // rung — the receipt never elides the very thing it exists to say.
    expect(out).toContain("art elided");
    // NO refusal: `▸` is reserved for "no art at all", and here there is art.
    expect(out).not.toContain("▸");
    expect(out).not.toMatch(/too wide/);
  });

  test("a cut coloured line closes its SGR before the marker — hygiene holds at the cut", async () => {
    const out = await renderDocument("```mermaid\n" + MERMAID_WIDE + "```\n", {
      width: 20,
      palette: DRACULA_PALETTE,
    });
    const cut = out.split("\n").filter((l) => l.includes("38;2;") && l.endsWith("…"));
    expect(cut.length).toBeGreaterThan(0);
    // elideToWidth closes the open SGR, THEN the marker: no dangling
    // style — the cut line's last SGR bytes precede the ….
    for (const l of cut) expect(l).toMatch(/\x1b\[0m…$/);
  });

  test("the elision notice reaches a titled fence too (BRF-PROJECTION-LOSSES)", async () => {
    // The caption used to be a ternary: a title OR the notice. So the 22
    // titled fences in the silo never said the source is not shown. The
    // notice now rides both branches; the titled one appends the shorter
    // clause because the caption is RAW-protected (never wrapped) and the
    // silo's longest title plus `· mermaid source elided` measures 79
    // against a 78-column budget at width 80.
    const titled = "```mermaid\ntitle: The cycle\nflowchart LR\n  A --> B\n```\n";
    const untitled = "```mermaid\nflowchart LR\n  A --> B\n```\n";
    const line = (out: string) => out.split("\n").find((l) => l.includes("⋮"));

    const titledNone = await renderDocument(titled, { width: W, color: "none" });
    expect(line(titledNone)).toBe(
      "  \x1b[1m⋮\x1b[0m The cycle · source elided",
    );
    expect(titledNone).toContain("The cycle");
    expect(titledNone).not.toContain("mermaid source elided");

    // The untitled line keeps its exact bytes — 36 fences already read
    // this and nothing here changes them.
    const untitledNone = await renderDocument(untitled, { width: W, color: "none" });
    expect(line(untitledNone)).toBe("  \x1b[1m⋮\x1b[0m mermaid source elided");

    // Colour mode: the glyph keeps its weight (state-parked + SGR 1), the
    // caption rides the muted register, and both close with a full reset.
    // Aubergine since 2026-10-27 (BRF-IRONY-MARK): the receipt and the parked
    // state share the ink because they share the meaning — *this is a comment on
    // the document*, not part of it. The glyphs differ (⋮ continues, ⸮ asks).
    const titledTC = await renderDocument(titled, { width: W, palette: DRACULA_PALETTE });
    expect(line(titledTC)).toBe(
      "  \x1b[38;2;160;111;168;1m⋮\x1b[0m\x1b[38;2;88;88;88m" +
        " The cycle · source elided\x1b[0m",
    );
    const untitledTC = await renderDocument(untitled, { width: W, palette: DRACULA_PALETTE });
    expect(line(untitledTC)).toBe(
      "  \x1b[38;2;160;111;168;1m⋮\x1b[0m\x1b[38;2;88;88;88m" +
        " mermaid source elided\x1b[0m",
    );
  });

  test("no ASCII character is ever an arrow: v2.0 label stays text", async () => {
    const out = await renderDocument("```mermaid\n" + MERMAID_SRC + "```\n", {
      width: W,
      palette: DRACULA_PALETTE,
    });
    // find the "Input v2.0" label span: text-channel coloured, and the
    // arrow colour sequence must never wrap an ASCII ^v>< or alphanumerics
    const arrowRuns = out.match(/\x1b\[38;2;0;175;95m[^\x1b]*\x1b\[0m/g) ?? [];
    for (const run of arrowRuns) {
      const content = run.replace(/\x1b\[[0-9;]*m/g, "");
      for (const ch of content) {
        expect(ch).toMatch(/[▲▼◄►▶◁△▽●×✕]/);
      }
    }
  });

  test("NO_COLOR: diagram bytes identical to the binary's art", async () => {
    const plain = await renderDocument("```mermaid\n" + MERMAID_SRC + "```\n", {
      width: W,
      color: "none",
    });
    // NO_COLOR strips colour, not attributes — the diagram art is unpainted
    // (byte-identical to the binary), only the `⋮` indicator keeps its
    // bold. Assert no colour escapes, not no escapes.
    expect(plain).not.toContain("\x1b[38;2;");
    expect(plain).not.toContain("\x1b[48;2;");
    // compare against a direct binary run
    const proc = Bun.spawn(
      [`${process.env.HOME}/.local/bin/mermaid-to-md`],
      { stdin: "pipe", stdout: "pipe" },
    );
    proc.stdin.write(MERMAID_SRC);
    proc.stdin.end();
    const bin = await new Response(proc.stdout).text();
    const art = bin.match(/```text\n([\s\S]*?)\n?```/)?.[1] ??
      "";
    const trimmed = art.replace(/^\n+/, "").replace(/\n+$/, "");
    for (const artLine of trimmed.split("\n")) {
      if (artLine.trim() !== "") expect(plain).toContain(artLine);
    }
  });

  test("a marker sits beside the content it truncates — never on a row blank in view", async () => {
    // The observed defect: `d01` is 241 columns wide and its second and third
    // subgraphs start at column 176, so at a 60-column budget eight of its
    // thirteen rows are *blank in view* while carrying content far right. The
    // renderer marked every one of them, putting a vertical stripe of `…` down
    // the block — a marker 176 columns from the thing it marked, and a marker
    // that now means two different things ("this line is cut" and "this block
    // is cut"), which is how a receipt stops being trusted.
    //
    // Tested on the instrument rather than inferred from the bytes, the same
    // reason `tableSlots` is exported: the rule is not observable in the output
    // when the output is what is wrong (BRF-TABLE-SLOT-INSTRUMENT's argument).

    // A row that fits is untouched.
    expect(elideCanvasRow("│ Cee ├───▶│ Dee │", 40)).toBe("│ Cee ├───▶│ Dee │");

    // A row with content at the cut loses it, and says so at the cut.
    const withContent = elideCanvasRow("│ Cee ├───▶│ Dee ├───▶│ Eee │", 20);
    expect(withContent).toContain("…");
    expect(displayWidth(withContent)).toBeLessThanOrEqual(20);
    expect(stripANSI(withContent).trimEnd().startsWith("│ Cee ├")).toBe(true);

    // A row whose visible prefix is only padding is blank, not marked: nothing
    // is drawn there, so there is nothing to mark. The block's receipt carries
    // the loss.
    expect(elideCanvasRow(" ".repeat(32) + "┌─────┐", 20)).toBe("");

    // The boundary the first version of this rule got wrong: content exactly at
    // the last column the cut would keep. The check has to be made against the
    // line that will be EMITTED — which is one column narrower than the probe,
    // because the marker takes that column. Judged against a marker-free probe,
    // this row passed and then showed as a bare `…`; measured on the fixture at
    // 40 columns, twelve rows were exactly that one column short.
    expect(elideCanvasRow(" ".repeat(19) + "x" + " ".repeat(20), 20)).toBe("");

    // And the render, end to end: no line is a bare marker.
    for (const w of [30, 34, 40, 44]) {
      const out = await renderDocument("```mermaid\n" + MERMAID_CHAIN + "```\n", {
        width: w,
        color: "none",
      });
      for (const l of out.split("\n")) {
        expect(stripANSI(l)).not.toMatch(/^\s*…\s*$/);
      }
    }
  });

  test("the receipt drops a separator only with the clause it joined", async () => {
    // At 34 columns the fit ladder keeps the note and drops the standing source
    // clause. It used to leave the clause's leading `·` behind: `⋮ · art
    // elided · needs 65 cols` — a mark with nothing on its left, which is the
    // thing *attributable structure* fails on.
    const out = await renderDocument("```mermaid\n" + MERMAID_CHAIN + "```\n", {
      width: 34,
      color: "none",
    });
    const receipt = out.split("\n").find((l) => l.includes("art elided"))!;
    expect(stripANSI(receipt)).not.toMatch(/⋮\s+·/);
    expect(stripANSI(receipt)).toContain("art elided · needs");
  });

  test("a cut diagram states what widening would buy — and the number is the art's", async () => {
    // 40 columns of pane, 36 of budget, against a layout whose canvas is 60:
    // the miss is small and exact, which is what a number is for.
    const W2 = 40;
    const out = await renderDocument("```mermaid\n" + MERMAID_WIDE + "```\n", {
      width: W2,
      color: "none",
    });
    const m = /art elided · needs (\d+) cols/.exec(out);
    expect(m).not.toBeNull();
    const need = Number(m![1]);
    expect(need).toBeGreaterThan(W2 - 4);
    // PROVENANCE: the number is the layout's, not a guess. Give the engine
    // that canvas and it draws the diagram — and the art is exactly that wide.
    const proc = Bun.spawn([
      `${process.env.HOME ?? ""}/.local/bin/mermaid-to-md`,
    ], {
      stdin: "pipe",
      stdout: "pipe",
      env: { ...process.env, COLUMNS: String(need) },
    });
    proc.stdin.write(MERMAID_WIDE);
    proc.stdin.end();
    const raw = await new Response(proc.stdout).text();
    await proc.exited;
    const art = raw.match(/```text\n([\s\S]*?)\n?```/)?.[1] ?? "";
    expect(art).not.toContain("too wide");
    const widest = art.split("\n").reduce((a, l) => Math.max(a, displayWidth(l)), 0);
    expect(widest).toBe(need);
  });

  test("the vertical rhythm is invariant under pane width (the gate for BRF-DIAGRAM-WIDTH-HANDOFF)", async () => {
    // The guarantee the whole policy exists for: resizing the window moves the
    // cut, never the content. A diagram is drawn at its own canvas, so its
    // height is a property of the diagram; the pane only decides how much of
    // each line you see.
    //
    // Note what the invariant is NOT: the document's total line count. Prose
    // reflows, that is what prose is for, and a paragraph legitimately takes
    // six lines at 60 columns and three at 160. Measured on the fixture
    // document, totals run 484/484/484/483/481/481 — the drift is prose. So the
    // claim is about the BLOCKS: the sequence of prose-run, art-run and receipt
    // must not change, and art-run lengths must not change. Prose runs may.
    const doc = [
      "# Rhythm\n",
      "Intro prose that is long enough to wrap differently at different widths, " +
        "because a paragraph which never reflows would hide the distinction this " +
        "test is drawing.\n",
      "```mermaid\n" + MERMAID_SRC + "```\n",
      "Middle prose, also long enough to reflow under a narrow pane and fold into " +
        "a single line under a wide one, so that a prose run changes length while " +
        "every diagram keeps its own.\n",
      "```mermaid\n" + MERMAID_WIDE + "```\n",
      "```mermaid\n" + MERMAID_UNSUPPORTED + "```\n",
      "Tail prose.\n",
    ].join("\n");
    /** Collapse a classification string into runs: "PPPAARPP" → "P:A:R:P". */
    const runs = (s: string): string => {
      const out: string[] = [];
      let cur = "";
      let n = 0;
      for (const c of s) {
        if (c === cur) { n++; continue; }
        if (cur) out.push(`${cur}${n}`);
        cur = c;
        n = 1;
      }
      if (cur) out.push(`${cur}${n}`);
      return out.join(":");
    };
    const shapes: string[] = [];
    for (const w of [60, 80, 100, 120, 160, 200]) {
      const out = await renderDocument(doc, { width: w, color: "none" });
      const lines = out.split("\n").map((l) => l.replace(/[ ]+$/, ""));
      shapes.push(
        runs(
          lines
            .map((l) =>
              /^\s*(⋮|▸)/.test(l) ? "R" : l.trim() === "" ? "B" : /[─│┌┐└┘├┤┬┴┼╭╮╰╯]/.test(l) ? "A" : "P",
            )
            .join(""),
        ),
      );
    }
    // Art runs and receipts identical at every width — the diagram keeps its
    // block. Prose runs are allowed to differ in length (P6 vs P3), so compare
    // the sequence with prose lengths normalised away.
    const blocks = (s: string) => s.replace(/P\d+/g, "P").replace(/B\d+/g, "B");
    for (const s of shapes) expect(blocks(s)).toBe(blocks(shapes[0]!));
    // and the art's own footprint, stated plainly: same letter-run, same length
    const artRuns = (s: string) => s.split(":").filter((r) => r.startsWith("A"));
    for (const s of shapes) expect(artRuns(s)).toEqual(artRuns(shapes[0]!));
  });

  test("the ambient $COLUMNS never reaches the art (one width, one source)", async () => {
    // The defect this closes: the engine's canvas defaulted to the ambient
    // `$COLUMNS` (the shell's width) or 80 (when absent), while okuda elided
    // at its own. Same document, same pane, two answers — the inconsistency
    // the whole brief is about.
    const before = process.env.COLUMNS;
    const render = async () => {
      const out = await renderDocument("```mermaid\n" + MERMAID_WIDE + "```\n", {
        width: 120,
        color: "none",
      });
      return out;
    };
    process.env.COLUMNS = "200";
    const wide = await render();
    process.env.COLUMNS = "40";
    const narrow = await render();
    if (before === undefined) delete process.env.COLUMNS;
    else process.env.COLUMNS = before;
    expect(narrow).toBe(wide);
  });

  test("a source-only fence is a code listing with its reason above it", async () => {
    // Two claims, and the second is the simplification. First: the receipt used
    // to read `⋮ mermaid source elided` above a box that was displaying the
    // source — a false claim printed over its own counter-example, the class
    // ADR-027 calls the one failure worse than saying nothing.
    //
    // Second: okuda no longer passes the ENGINE's fallback box through. That box
    // was a third presentation carrying a foreign frame into okuda's byte stream
    // — its title came from the source's first word (`%%{init:` when a directive
    // led) and it re-flowed its content when its canvas was narrow. okuda already
    // holds the source; it renders it as the listing it is, and states why above
    // it. So no engine framing may appear anywhere in the output.
    const out = await renderDocument("```mermaid\n" + MERMAID_UNSUPPORTED + "```\n", {
      width: W,
      color: "none",
    });
    expect(out).toContain("source shown");
    expect(out).toContain("gantt not drawn by the engine");
    expect(out).not.toContain("mermaid source elided");
    // the source is present, as source
    expect(out).toContain("title Plan");
    expect(out).toContain("Task :a, 2026-01-01, 1d");
    // and the engine's frame is not
    expect(out).not.toContain("╭ mermaid:");
    expect(out).not.toContain("╰");
    // the reason precedes the listing: a reader should know what they are about
    // to read before they read it, not after twenty lines of mermaid
    expect(out.indexOf("source shown")).toBeLessThan(out.indexOf("title Plan"));
  });

  test("the listing elides at the glass like any other preformatted block", async () => {
    // A long source line is cut with `…`, never wrapped — the listing is
    // preformatted content, and wrapping it is the claim ADR-PANE-NOT-CANVAS-069
    // refuses. Measured at 40 columns, where the fence's own lines outrun the
    // glass.
    const long = "gantt\n  title " + "x".repeat(80) + "\n  section S\n  Task :a, 2026-01-01, 1d\n";
    const out = await renderDocument("```mermaid\n" + long + "```\n", { width: 40, color: "none" });
    for (const l of out.split("\n")) {
      expect(displayWidth(l)).toBeLessThanOrEqual(40);
    }
    expect(out).toContain("…");
    // one line of source, cut — not two lines of it
    expect(out.split("\n").filter((l) => l.includes("xxxx")).length).toBe(1);
  });

  test("missing binary: the fence says why, the document renders", async () => {
    // The inverse of the old contract. The fence used to vanish in silence,
    // which is how a wrapper crash on Omarchy rendered as a blank line and
    // cost a session of diagnosis (DBF-OMARCHY-TOOLCHAIN). A projection loss
    // is said, and a missing instrument is named.
    const out = await renderDocument(
      "# Doc\n\n```mermaid\nflowchart LR\n  A --> B\n```\n\nTail\n",
      { width: W, mermaidBin: "/nonexistent/mermaid-to-md", color: "none" },
    );
    expect(out).toContain("Doc");
    expect(out).toContain("Tail");
    expect(out).not.toContain("okuda-mmd");
    expect(out).not.toContain("flowchart"); // no art, source still omitted
    expect(out).toContain("diagram unavailable"); // ...and the loss is said
    expect(out).toContain("not found"); // ...with the instrument's name in it
    expect(out).not.toContain("mermaid source elided"); // that receipt is for art
  });

  test("failing binary: the reason carries its exit code", async () => {
    // The Omarchy shape exactly: the binary was present and resolved, and it
    // exited 1 with the diagnosis on stderr. "Present but broken" and "absent"
    // are different facts and the receipt must distinguish them.
    //
    // Resolve `false` rather than naming /bin/false: macOS has no /bin/false, so
    // posix_spawn returns ENOENT and the receipt correctly says "not found" —
    // the absent case this test is not about. Same idiom as the silent-binary
    // test below, and it reads as portable on purpose (2026-10-17, darwin).
    const broken = existsSync("/usr/bin/false")
      ? "/usr/bin/false"
      : existsSync("/bin/false")
        ? "/bin/false"
        : "";
    if (!broken) return;
    const out = await renderDocument(
      "```mermaid\nflowchart LR\n  A --> B\n```\n",
      { width: W, mermaidBin: broken, color: "none" },
    );
    expect(out).toContain("diagram unavailable");
    expect(out).toContain("exit 1");
  });

  test("silent binary: exit 0 with no art is its own reason", async () => {
    // /usr/bin/true exits 0 and prints nothing — the third failure mode, and
    // the one a bare `code === 0` check would have called a success.
    const noop = existsSync("/usr/bin/true") ? "/usr/bin/true" : "";
    if (!noop) return;
    const out = await renderDocument(
      "```mermaid\nflowchart LR\n  A --> B\n```\n",
      { width: W, mermaidBin: noop, color: "none" },
    );
    expect(out).toContain("produced no art");
  });

  test("the receipt is one line, elided, and never wraps", async () => {
    // Same discipline as the art it stands in for: the notice is RAW and
    // elided to the width budget, so a 40-column terminal gets a cut notice,
    // not a wrapped one (ADR-UNIVERSAL-ELISION-050).
    const out = await renderDocument(
      "```mermaid\nflowchart LR\n  A --> B\n```\n",
      { width: 40, mermaidBin: "/nonexistent/mermaid-to-md", color: "none" },
    );
    const line = out.split("\n").find((l) => l.includes("diagram unavailable"))!;
    expect(displayWidth(line)).toBeLessThanOrEqual(40);
    expect(line.trim().endsWith("…")).toBe(true);
  });

  test("palette override of diagram-arrow takes effect", async () => {
    const palette = { ...DRACULA_PALETTE, "diagram-arrow": "#010203" };
    const out = await renderDocument("```mermaid\n" + MERMAID_SRC + "```\n", {
      width: W,
      palette,
    });
    expect(out).toContain("\x1b[38;2;1;2;3m");
    expect(out).not.toContain("38;2;0;175;95");
  });
});

// ── Described diagram (BRF-DIAGRAM-DESCRIBE) ──────────────────────────

describe("render — described mermaid diagrams", () => {
  test("mermaid describe fence degrades gracefully when binary is absent", async () => {
    // When diagram-describe binary is absent or returns empty, the token
    // is dropped cleanly — no crash, no raw token leakage, no mermaid
    // source bleeding into the render. The LLM call is tested by hand;
    // a test that calls ollama is slow and environment-dependent.
    //
    // Hermetic by declaration (2026-10-05): this test used to rely on the
    // binary not being installed, so on a machine where it IS installed
    // the "absent" case called ollama and hung past the 5s budget. The
    // binary path is now injected — a name that cannot exist — so the
    // case under test is always the case that runs.
    const out = await renderDocument("```mermaid describe\ngraph TD\n    A --> B\n```\n", {
      width: W,
      palette: DRACULA_PALETTE,
      describeBin: "/nonexistent/diagram-describe",
    });
    expect(out).not.toContain("okuda-dsc");
    expect(out).not.toContain("graph TD");
  });

  test("mermaid fence WITHOUT describe tag still routes to ASCII art", async () => {
    const out = await renderDocument("```mermaid\n" + MERMAID_SRC + "```\n", {
      width: W,
      palette: DRACULA_PALETTE,
    });
    // ASCII path unaffected — describe is a separate token.
    expect(out).toContain("mermaid source elided");
    expect(out).toContain("Input v2.0");
  });
});

// ── Classification unit tests ─────────────────────────────────────────

import { classifyChar } from "../src/render";

describe("classifyChar — three channels, Unicode-only arrows", () => {
  test("box drawing → border", () => {
    for (const ch of "─│┌┐└┘├┤┬┴┼╭╮╰╯╌".split("")) {
      expect(classifyChar(ch)).toBe("border");
    }
  });

  test("unicode arrows → arrow", () => {
    for (const ch of "▲▼◄►▶".split("")) {
      expect(classifyChar(ch)).toBe("arrow");
    }
  });

  test("ASCII never classified as arrow (v2.0, x > 5 stay text)", () => {
    for (const ch of "^v><V2.0x ".split("")) {
      expect(classifyChar(ch)).toBe("text");
    }
  });
});
