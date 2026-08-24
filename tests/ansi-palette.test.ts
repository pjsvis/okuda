import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectColorMode, makeStyler } from "../src/ansi";
import { DEFAULT_PALETTE, loadPalette } from "../src/palette";

function tempFile(name: string): string {
  return join(mkdtempSync(join(tmpdir(), "okuda-pal-")), name);
}

describe("ansi — colour mode detection (contract table)", () => {
  test("default: truecolor", () => {
    expect(detectColorMode({})).toBe("truecolor");
  });

  test("NO_COLOR (any value) → none", () => {
    expect(detectColorMode({ NO_COLOR: "1" })).toBe("none");
    expect(detectColorMode({ NO_COLOR: "" })).toBe("none");
  });

  test("TERM=dumb → none", () => {
    expect(detectColorMode({ TERM: "dumb" })).toBe("none");
  });

  test("FORCE_COLOR overrides TERM=dumb", () => {
    expect(detectColorMode({ TERM: "dumb", FORCE_COLOR: "1" })).toBe("truecolor");
  });

  test("FORCE_COLOR overrides NO_COLOR (explicit override wins)", () => {
    expect(detectColorMode({ NO_COLOR: "1", FORCE_COLOR: "1" })).toBe("truecolor");
  });
});

describe("styler — byte-exact SGR sequences", () => {
  test("heading: bold + \\x1b[1;38;2;224;222;244m", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    const out = s.roleBold("heading", "T");
    expect(out).toBe("\x1b[1;38;2;224;222;244mT\x1b[0m");
  });

  test("code text: \\x1b[38;2;235;111;146m", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.role("code-text", "x")).toBe("\x1b[38;2;235;111;146mx\x1b[0m");
  });

  test("code background: \\x1b[48;2;38;35;58m", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.codeLine("x")).toContain("\x1b[48;2;38;35;58m");
  });

  test("blockquote/muted: \\x1b[38;2;110;106;134m", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.role("blockquote", "q")).toBe("\x1b[38;2;110;106;134mq\x1b[0m");
  });

  test("link: \\x1b[4;38;2;156;207;216m (underline + cyan)", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    const out = s.link("text", "https://x.example");
    expect(out).toContain("\x1b[4;38;2;156;207;216m");
    expect(out).toStartWith("\x1b]8;;https://x.example\x1b\\");
    expect(out).toEndWith("\x1b]8;;\x1b\\");
  });

  test("emphasis: italic + \\x1b[3;38;2;246;193;119m", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.roleItalic("emphasis", "i")).toBe("\x1b[3;38;2;246;193;119mi\x1b[0m");
  });

  test("strong: bold + \\x1b[1;38;2;235;188;186m", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.roleBold("strong", "b")).toBe("\x1b[1;38;2;235;188;186mb\x1b[0m");
  });

  test("table header: bold + \\x1b[1;38;2;49;116;143m", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.roleBold("table-header", "h")).toBe("\x1b[1;38;2;49;116;143mh\x1b[0m");
  });

  test("table key: bold + \\x1b[1;38;2;246;193;119m", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.roleBold("table-key", "k")).toBe("\x1b[1;38;2;246;193;119mk\x1b[0m");
  });

  test("none mode: identity, no escapes anywhere", () => {
    const s = makeStyler(DEFAULT_PALETTE, "none");
    expect(s.roleBold("heading", "T")).toBe("T");
    expect(s.codespan("c")).toBe("`c`");
    expect(s.link("text", "url")).toBe("text");
    expect(s.rule(4)).toBe("────");
  });
});

describe("palette — defaults + override loader", () => {
  test("defaults match the contract table byte-exactly", () => {
    expect(DEFAULT_PALETTE.heading).toBe("#e0def4");
    expect(DEFAULT_PALETTE["code-text"]).toBe("#eb6f92");
    expect(DEFAULT_PALETTE["code-background"]).toBe("#26233a");
    expect(DEFAULT_PALETTE.blockquote).toBe("#6e6a86");
    expect(DEFAULT_PALETTE.link).toBe("#9ccfd8");
    expect(DEFAULT_PALETTE.emphasis).toBe("#f6c177");
    expect(DEFAULT_PALETTE.strong).toBe("#ebbcba");
    expect(DEFAULT_PALETTE["table-header"]).toBe("#31748f");
    expect(DEFAULT_PALETTE["table-key"]).toBe("#f6c177");
    expect(DEFAULT_PALETTE.muted).toBe("#6e6a86");
    expect(DEFAULT_PALETTE["diagram-border"]).toBe("#6e6a86");
    expect(DEFAULT_PALETTE["diagram-arrow"]).toBe("#9ccfd8");
    expect(DEFAULT_PALETTE["diagram-text"]).toBe("#e0def4");
  });

  test("override file replaces known roles, ignores junk", () => {
    const path = tempFile("palette.json");
    writeFileSync(
      path,
      JSON.stringify({
        "diagram-arrow": "#ff0000",
        heading: "not-a-hex",
        "unknown-role": "#00ff00",
      }),
    );
    const p = loadPalette(path);
    expect(p["diagram-arrow"]).toBe("#ff0000");
    expect(p.heading).toBe("#e0def4"); // invalid value ignored
  });

  test("malformed JSON → defaults, no throw", () => {
    const path = tempFile("palette.json");
    writeFileSync(path, "{broken");
    const p = loadPalette(path);
    expect(p).toEqual(DEFAULT_PALETTE);
  });

  test("missing file → defaults", () => {
    expect(loadPalette("/nonexistent/path/palette.json")).toEqual(DEFAULT_PALETTE);
  });

  test("override takes effect through the styler", () => {
    const p = { ...DEFAULT_PALETTE, "diagram-arrow": "#123456" };
    const s = makeStyler(p, "truecolor");
    expect(s.role("diagram-arrow", "→")).toContain("38;2;18;52;86");
  });
});
