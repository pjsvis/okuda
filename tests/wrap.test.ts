import { describe, expect, test } from "bun:test";
import { displayWidth } from "../src/width";
import { wrapANSI } from "../src/wrap";

const OPEN = "\x1b[1;38;2;235;188;186m";
const RESET = "\x1b[0m";

describe("wrap — hard-wrap mandate (ADR-004)", () => {
  test("wraps at width on word boundaries", () => {
    const lines = wrapANSI("one two three four five", { width: 11 });
    expect(lines).toEqual(["one two", "three four", "five"]);
    for (const l of lines) expect(displayWidth(l)).toBeLessThanOrEqual(11);
  });

  test("every line ≤ width (long unbroken words hard-split)", () => {
    const lines = wrapANSI("short " + "a".repeat(30) + " tail", { width: 10 });
    for (const l of lines) expect(displayWidth(l)).toBeLessThanOrEqual(10);
    expect(lines[0]).toBe("short");
  });

  test("existing newlines are forced breaks (soft returns honoured)", () => {
    const lines = wrapANSI("line one\nline two", { width: 40 });
    expect(lines).toEqual(["line one", "line two"]);
  });

  test("continuation indent aligns under text column", () => {
    const lines = wrapANSI("word word word word", { width: 12, indent: "    " });
    expect(lines[1]).toStartWith("    ");
  });

  test("style closed at wrap point, re-emitted at continuation (hygiene rule 2)", () => {
    const text = `${OPEN}bold text that certainly wraps across${RESET} and plain tail`;
    const lines = wrapANSI(text, { width: 20 });
    expect(lines.length).toBeGreaterThan(1);
    // First line: opens with the style
    expect(lines[0]).toContain(OPEN);
    // Continuation line re-emits the style (state tracked across the break)
    const cont = lines.find((l) => l.startsWith(OPEN) && l !== lines[0]);
    expect(cont).toBeDefined();
    for (const l of lines) {
      if (l.includes("\x1b[")) expect(l.endsWith(RESET)).toBe(true); // rule 4
    }
  });

  test("plain lines carry no escapes", () => {
    const lines = wrapANSI("plain text only here", { width: 20 });
    for (const l of lines) expect(l).not.toContain("\x1b");
  });

  test("OSC 8 zone closed at line end, reopened on continuation (rule 3)", () => {
    const linkOpen = "\x1b]8;;https://example.com/very/long/path\x1b\\";
    const linkClose = "\x1b]8;;\x1b\\";
    const text = `${linkOpen}link text long enough to wrap right here${linkClose}`;
    const lines = wrapANSI(text, { width: 15 });
    expect(lines.length).toBeGreaterThan(1);
    // Rule 3: no line may leave an open hyperlink zone — opens == closes per line.
    for (const l of lines) {
      const opens = (l.match(/\x1b\]8;;[^\x1b]+\x1b\\/g) ?? []).length;
      const closes = (l.match(/\x1b\]8;;\x1b\\/g) ?? []).length;
      expect(opens).toBe(closes);
    }
    // Continuation inside the link re-opens the URL
    const reopened = lines.slice(1).find((l) => l.startsWith(linkOpen));
    expect(reopened).toBeDefined();
  });

  test("ANSI byte length > display length when styled", () => {
    const text = `${OPEN}${"x".repeat(30)}${RESET}`;
    const lines = wrapANSI(text, { width: 12 });
    expect(lines.length).toBe(3);
    expect(Buffer.byteLength(lines[0]!, "utf8")).toBeGreaterThan(displayWidth(lines[0]!));
  });

  test("empty input yields one empty line", () => {
    expect(wrapANSI("", { width: 10 })).toEqual([""]);
  });

  test("no-color parity: styled and plain wrap to identical widths", () => {
    const plain = "the quick brown fox jumps over the lazy dog again";
    const styled = `${OPEN}the quick brown fox${RESET} jumps over ${OPEN}the lazy dog${RESET} again`;
    const a = wrapANSI(plain, { width: 15 }).map((l) => displayWidth(l));
    const b = wrapANSI(styled, { width: 15 }).map((l) => displayWidth(l));
    expect(a).toEqual(b);
  });

  test("CJK wraps on grapheme boundaries, never exceeding width", () => {
    const lines = wrapANSI("日本語のテキストはここで折り返されるべきです", { width: 10 });
    for (const l of lines) expect(displayWidth(l)).toBeLessThanOrEqual(10);
    // no grapheme was split: reassembly minus breaks equals source
    expect(lines.join("")).toBe("日本語のテキストはここで折り返されるべきです");
  });
});
