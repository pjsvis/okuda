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
  test("heading: bold + \\x1b[38;2;189;147;249;1m (glow purple, colour-first)", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    const out = s.roleBold("heading", "T");
    expect(out).toBe("\x1b[38;2;189;147;249;1mT\x1b[0m");
  });

  test("code text: \\x1b[38;2;80;250;123m (glow green)", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.role("code-text", "x")).toBe("\x1b[38;2;80;250;123mx\x1b[0m");
  });

  test("code line: no background (dropped Pass B); \x1b[38;2;80;250;123m fg", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    const out = s.codeLine("x");
    expect(out).toBe("\x1b[38;2;80;250;123mx\x1b[0m");
    expect(out).not.toContain("48;2"); // no background
  });

  test("blockquote: \\x1b[38;2;118;118;118m", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.role("blockquote", "q")).toBe("\x1b[38;2;118;118;118mq\x1b[0m");
  });

  test("link: rose text + cyan-underlined URL, no OSC 8 (glow-faithful)", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    const out = s.link("text", "https://x.example");
    expect(out).toContain("\x1b[38;2;255;121;198mtext\x1b[0m"); // rose text
    expect(out).toContain("\x1b[38;2;139;233;253;4mhttps://x.example\x1b[0m"); // cyan+underline url
    expect(out).not.toContain("\x1b]8;;"); // no OSC 8
  });

  test("emphasis: italic + \\x1b[38;2;241;250;140;3m (glow Dracula yellow, colour-first)", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.roleItalic("emphasis", "i")).toBe("\x1b[38;2;241;250;140;3mi\x1b[0m");
  });

  test("bold-italic combo: \\x1b[38;2;241;250;140;1;3m — emphasis colour, not strong's", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.roleBoldItalic("emphasis", "bi")).toBe("\x1b[38;2;241;250;140;1;3mbi\x1b[0m");
  });

  test("strong: bold + \\x1b[38;2;255;184;108;1m (glow orange, colour-first)", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.roleBold("strong", "b")).toBe("\x1b[38;2;255;184;108;1mb\x1b[0m");
  });

  test("table header: bold + \\x1b[38;2;189;147;249;1m (glow purple, colour-first)", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.roleBold("table-header", "h")).toBe("\x1b[38;2;189;147;249;1mh\x1b[0m");
  });

  test("table key: bold + \\x1b[38;2;255;255;135;1m (colour-first)", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.roleBold("table-key", "k")).toBe("\x1b[38;2;255;255;135;1mk\x1b[0m");
  });

  test("badge: pink bg + near-white fg + padded (Gloam footer chrome)", () => {
    const s = makeStyler(DEFAULT_PALETTE, "truecolor");
    expect(s.badge("Gloam")).toBe("\x1b[48;2;255;121;198m\x1b[38;2;248;248;242m Gloam \x1b[0m");
  });

  test("none mode: identity, no escapes anywhere; codespan strips backticks (parity); link shows URL", () => {
    const s = makeStyler(DEFAULT_PALETTE, "none");
    expect(s.roleBold("heading", "T")).toBe("T");
    expect(s.codespan("c")).toBe("c");
    expect(s.link("text", "url")).toBe("text url"); // parity: URL shown in both modes
    expect(s.badge("G")).toBe(" G "); // padding kept, no colour
    expect(s.rule(4)).toBe("────");
  });
});

describe("palette — defaults + override loader", () => {
  test("defaults match the contract table byte-exactly", () => {
    expect(DEFAULT_PALETTE.heading).toBe("#bd93f9");
    expect(DEFAULT_PALETTE["code-text"]).toBe("#50fa7b");
    expect(DEFAULT_PALETTE["code-background"]).toBe("");
    expect(DEFAULT_PALETTE.blockquote).toBe("#767676");
    expect(DEFAULT_PALETTE.link).toBe("#00af5f");
    expect(DEFAULT_PALETTE.emphasis).toBe("#f1fa8c");
    expect(DEFAULT_PALETTE.strong).toBe("#ffb86c");
    expect(DEFAULT_PALETTE["table-header"]).toBe("#bd93f9");
    expect(DEFAULT_PALETTE["table-key"]).toBe("#ffff87");
    expect(DEFAULT_PALETTE.muted).toBe("#585858");
    expect(DEFAULT_PALETTE["diagram-border"]).toBe("#585858");
    expect(DEFAULT_PALETTE["diagram-arrow"]).toBe("#00af5f");
    expect(DEFAULT_PALETTE["diagram-text"]).toBe("#d7d7d7");
  });

  test("override file replaces known roles, ignores junk", () => {
    // Pinned to the dracula preset (brief option b): the assertions anchor
    // to Dracula bytes, and the override mechanism is base-independent —
    // the runtime default is the okuda preset since the 2026-08-25 flip.
    const path = tempFile("palette.json");
    writeFileSync(
      path,
      JSON.stringify({
        "diagram-arrow": "#ff0000",
        heading: "not-a-hex",
        "unknown-role": "#00ff00",
      }),
    );
    const p = loadPalette({ name: "dracula", path });
    expect(p["diagram-arrow"]).toBe("#ff0000");
    expect(p.heading).toBe("#bd93f9"); // invalid value ignored
  });

  test("malformed JSON → base preset, no throw", () => {
    const path = tempFile("palette.json");
    writeFileSync(path, "{broken");
    const p = loadPalette({ name: "dracula", path });
    expect(p).toEqual(DEFAULT_PALETTE);
  });

  test("missing file → base preset", () => {
    expect(
      loadPalette({ name: "dracula", path: "/nonexistent/path/palette.json" }),
    ).toEqual(DEFAULT_PALETTE);
  });

  test("override takes effect through the styler", () => {
    const p = { ...DEFAULT_PALETTE, "diagram-arrow": "#123456" };
    const s = makeStyler(p, "truecolor");
    expect(s.role("diagram-arrow", "→")).toContain("38;2;18;52;86");
  });
});
