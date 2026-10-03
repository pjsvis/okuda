import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { CUE_PATIENCE, cueFor } from "../src/cue";

// The cue seam (BRF-AUDIO-DISCOVERY): pure and unit-tested with NO audio
// device in the test — a table of input → (class, text). Every case below
// is an acceptance criterion from the brief, made mechanical.

describe("cue — the pending class names the digit, never the actuator", () => {
  test("all ten digits map to their words", () => {
    const words = [
      "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    ];
    for (let d = 0; d <= 9; d++) {
      expect(cueFor({ kind: "pending", digit: String(d) })).toEqual({
        cueClass: "pending",
        text: words[d],
      });
    }
  });

  test("a lone 9 never says clone — the actuator is undetermined for 9 of 10 second keys", () => {
    const cue = cueFor({ kind: "pending", digit: "9" });
    expect(cue).toEqual({ cueClass: "pending", text: "nine" });
    expect(cue!.text).not.toBe("clone"); // names the digit, never the actuator
  });

  test("the seam is total — garbage input is silence, not error", () => {
    expect(cueFor({ kind: "pending", digit: "" })).toBeNull();
    expect(cueFor({ kind: "pending", digit: "a" })).toBeNull();
    expect(cueFor({ kind: "pending", digit: "42" })).toBeNull();
    expect(cueFor({ kind: "pending", digit: " 9" })).toBeNull();
  });
});

describe("cue — the canon split: doubled speaks, mixed is silent (ADR-032)", () => {
  test("the bound doubled pairs speak, naming the actuator exactly", () => {
    expect(cueFor({ kind: "token", token: 0 })).toEqual({ cueClass: "identity", text: "exit" });
    expect(cueFor({ kind: "token", token: 99 })).toEqual({ cueClass: "identity", text: "clone" });
  });

  test("the pocket is silent — reserved, not missing; it speaks as it binds", () => {
    for (const t of [11, 22, 33, 44, 55, 66, 77, 88]) {
      expect(cueFor({ kind: "token", token: t })).toBeNull();
    }
  });

  test("the vector space is silent — mixed = the document moves", () => {
    for (const t of [12, 13, 14, 21, 87, 89, 98]) {
      expect(cueFor({ kind: "token", token: t })).toBeNull();
    }
  });

  test("mixed verbs are silent too — one rule, zero exceptions; flash is their receipt", () => {
    // 01 frame, 02 slide, 03 freeze, 09 editNew, 10 edit: real verbs, mixed
    // shape — and the canon does not qualify itself for them.
    for (const t of [1, 2, 3, 9, 10]) {
      expect(cueFor({ kind: "token", token: t })).toBeNull();
    }
  });

  test("reserved-unassigned tokens are silent", () => {
    for (const t of [4, 5, 6, 7, 8]) {
      expect(cueFor({ kind: "token", token: t })).toBeNull();
    }
  });

  test("out-of-space tokens are silence, not error", () => {
    expect(cueFor({ kind: "token", token: 100 })).toBeNull();
    expect(cueFor({ kind: "token", token: -1 })).toBeNull();
  });
});

describe("cue — the mode class names the surface, immediately", () => {
  test("reader and launcher, the focus boundary that started the idea", () => {
    expect(cueFor({ kind: "mode", surface: "reader" })).toEqual({
      cueClass: "mode",
      text: "reader",
    });
    expect(cueFor({ kind: "mode", surface: "launcher" })).toEqual({
      cueClass: "mode",
      text: "launcher",
    });
  });
});

describe("cue — the seam maps class → (text, patience) and stops", () => {
  test("patience is a property of the class", () => {
    expect(CUE_PATIENCE.pending).toBe("patient"); // waits for a hesitation
    expect(CUE_PATIENCE.identity).toBe("immediate"); // the receipt is the point
    expect(CUE_PATIENCE.mode).toBe("immediate"); // useless five seconds late
  });

  test("okuda implies no voice and no clock — the seam source carries neither (ADR-036)", () => {
    const src = readFileSync("src/cue.ts", "utf8");
    // no speech code: no spawn, no engine invocation
    expect(src).not.toContain("Bun.spawn");
    expect(src).not.toContain("exec");
    // no pause constant: no duration number anywhere in the cue path.
    // ADR citations are names, not numbers — strip the prefix first.
    const body = src.replace(/ADR-\d+/g, "");
    expect(body).not.toMatch(/\b\d{3,}\b/);
    // no prosody parameter (ADR-033: the voice is the parameter, not the tag)
    expect(src).not.toContain("pbas");
    expect(src).not.toContain("volm");
    // no voice name — the cast is entirely the silo's
    expect(src).not.toMatch(/\b[Mm]oir\w*\b/);
  });
});
