import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  corpusRows,
  corpusStat,
  corpusText,
  jsonc,
  oklch,
  quantile,
  ratio,
  themePair,
  themeVariants,
} from "../scripts/contrast";

// The readers: one per spelling a host uses for "what colour is the page".
//
// Three exist in the wild and each was found by failing on it — Herdr's flat
// JSON, the terminals' `key = value`, and Zed's one-file-many-themes with dotted
// keys and JSONC. The fourth host gets a branch here, not a fourth instrument.
// This file is what stops a branch from being written in a host's dialect and
// then trusted for another's.

const dir = (): string => mkdtempSync(join(tmpdir(), "okuda-theme-"));
const file = (name: string, body: string): string => {
  const p = join(dir(), name);
  writeFileSync(p, body);
  return p;
};

describe("the readers — one per spelling", () => {
  test("Herdr's flat JSON: two keys, one pair", () => {
    const p = file("herdr.json", JSON.stringify({ background: "#1b1e24", foreground: "#a9aeb8" }));
    expect(themeVariants(p)).toEqual([{ name: "herdr.json", bg: "#1b1e24", fg: "#a9aeb8" }]);
  });

  test("Ghostty's config: `key = value`, comments, extensionless file", () => {
    const p = file(
      "Zag",
      [
        "# a theme is another configuration file",
        "palette = 1=#cc6566",
        "background = #282c34",
        "foreground = #ffffff   # the ink",
      ].join("\n"),
    );
    expect(themeVariants(p)).toEqual([{ name: "Zag", bg: "#282c34", fg: "#ffffff" }]);
  });

  test("Zed's spelling: one file, many themes, dotted keys under `style`", () => {
    const p = file(
      "gruvbox.json",
      JSON.stringify({
        name: "Gruvbox",
        themes: [
          {
            name: "Gruvbox Dark",
            appearance: "dark",
            style: { "editor.background": "#282828ff", "editor.foreground": "#ebdbb2ff" },
          },
          {
            name: "Gruvbox Light",
            appearance: "light",
            style: { "editor.background": "#fbf1c7ff", "editor.foreground": "#282828ff" },
          },
        ],
      }),
    );
    const v = themeVariants(p);
    // Six-digit normalisation: Zed writes an alpha byte and every consumer here
    // paints opaque. Carrying the alpha would be a pair no comparison accepts.
    expect(v).toEqual([
      { name: "Gruvbox Dark", bg: "#282828", fg: "#ebdbb2", appearance: "dark" },
      { name: "Gruvbox Light", bg: "#fbf1c7", fg: "#282828", appearance: "light" },
    ]);
  });

  test("Zed's files are JSONC — comments and trailing commas must not defeat the read", () => {
    const p = file(
      "zed.jsonc",
      [
        "{",
        "  // the schema line is a comment in the real files",
        '  "$schema": "https://zed.dev/schema/themes/v0.2.0.json",',
        '  "themes": [',
        "    {",
        '      "name": "Only",  // trailing comma test',
        '      "appearance": "dark",',
        '      "style": { "editor.background": "#1d2021ff", "editor.foreground": "#ebdbb2ff" },',
        "    },",
        "  ],",
        "}",
      ].join("\n"),
    );
    expect(themeVariants(p)).toEqual([
      { name: "Only", bg: "#1d2021", fg: "#ebdbb2", appearance: "dark" },
    ]);
  });

  test("jsonc respects strings: a `//` inside a value is not a comment", () => {
    expect(jsonc('{"a": "http://x/y", "b": 1}')).toBe('{"a": "http://x/y", "b": 1}');
    expect(JSON.parse(jsonc('{"a":"x/*y*/z"// tail\n}'))).toEqual({ a: "x/*y*/z" });
  });

  test("an unreadable theme yields nothing, never a default", () => {
    // A default would invent a pair the host never declared, and the invented
    // pair would then be measured and reported as the host's choice.
    expect(themeVariants(file("chrome.json", JSON.stringify({ ui: { accent: "#ff0000" } })))).toEqual([]);
    expect(themeVariants(file("empty", ""))).toEqual([]);
    expect(themeVariants(join(dir(), "absent"))).toEqual([]);
    expect(themePair(join(dir(), "absent"))).toBeNull();
  });

  test("a theme that states one half of the pair is skipped, not completed", () => {
    const p = file("half", "background = #282c34\n");
    expect(themeVariants(p)).toEqual([]);
  });

  test("themePair answers with the first variant, and says so by returning a pair", () => {
    // A multi-variant file is Zed's shape; `themePair`'s contract is one pair, so
    // it gives the flagship and `themeVariants` is the door when the count matters.
    const p = file(
      "two.json",
      JSON.stringify({
        themes: [
          { name: "B", style: { "editor.background": "#000000ff", "editor.foreground": "#eeeeeeff" } },
          { name: "A", style: { "editor.background": "#ffffff", "editor.foreground": "#111111" } },
        ],
      }),
    );
    expect(themePair(p)).toEqual({ bg: "#000000", fg: "#eeeeee" });
    expect(themeVariants(p)).toHaveLength(2);
  });
});

describe("the corpus — a collection, measured on our axes", () => {
  test("every variant is a row; a Zed file is not collapsed to its first theme", () => {
    const d = dir();
    writeFileSync(
      join(d, "three.json"),
      JSON.stringify({
        themes: [
          { name: "Deep", style: { "editor.background": "#1d2021", "editor.foreground": "#ebdbb2" } },
          { name: "Mid", style: { "editor.background": "#282828", "editor.foreground": "#ebdbb2" } },
          { name: "Soft", style: { "editor.background": "#32302f", "editor.foreground": "#ebdbb2" } },
        ],
      }),
    );
    writeFileSync(join(d, "flat"), "background = #221f1c\nforeground = #d6cfc4\n");
    writeFileSync(join(d, ".hidden"), "background = #000000\nforeground = #ffffff\n");
    const rows = corpusRows(d);
    expect(rows).toHaveLength(4); // three variants + one flat, no dotfile
    expect(rows.map((r) => r.name)).toContain("three.json › Mid");
    for (const r of rows) {
      expect(r.lBg).toBeCloseTo(oklch(r.bg).L, 9);
      expect(r.prose).toBeCloseTo(ratio(r.fg, r.bg), 9);
      expect(r.lift).toBeCloseTo(r.lFg - r.lBg, 9);
      expect(r.dark).toBe(r.lBg < 0.5);
    }
  });

  test("ties a row to the tier it measures into", () => {
    const d = dir();
    writeFileSync(join(d, "band"), "background = #221f1c\nforeground = #d6cfc4\n"); // rung 8
    writeFileSync(join(d, "bright"), "background = #343a45\nforeground = #d4d8de\n"); // rung 7
    const rows = corpusRows(d);
    expect(rows.find((r) => r.name === "band")!.tier).toBe("comfort");
    expect(rows.find((r) => r.name === "bright")!.tier).toBe("outside");
  });

  test("quantiles are nearest-rank: every figure printed is a member", () => {
    const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(quantile(xs, 0)).toBe(1);
    expect(quantile(xs, 0.5)).toBe(5);
    expect(quantile(xs, 1)).toBe(10);
    expect(quantile([], 0.5)).toBeNaN();
    const s = corpusStat(xs);
    expect(s.n).toBe(10);
    expect(s.med).toBe(5);
    expect(xs).toContain(s.p25); // no interpolation: the value is in the set
    expect(xs).toContain(s.p90);
  });

  test("the census names its sizes, its hue split and the dark-ground limit", () => {
    const d = dir();
    writeFileSync(join(d, "warm"), "background = #221f1c\nforeground = #d6cfc4\n");
    writeFileSync(join(d, "cool"), "background = #1b1e24\nforeground = #a9aeb8\n");
    writeFileSync(join(d, "paper"), "background = #fbf1c7\nforeground = #282828\n");
    const text = corpusText(corpusRows(d));
    expect(text).toContain("corpus — 3 pair(s): 2 dark ground(s), 1 light");
    expect(text).toContain("── DARK (n=2)");
    expect(text).toContain("warm 1 · cool 1 · neutral 0");
    expect(text).toContain("the tiers are a dark-ground reading");
  });
});
