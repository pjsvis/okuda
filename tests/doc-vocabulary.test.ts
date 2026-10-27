import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STATE_GLYPH_ROLE } from "../src/render";
import { DRACULA_PALETTE, } from "../src/palette";

/** The documents that *teach* the state vocabulary must agree with the code that
 *  applies it. Written 2026-10-27 after a day of exactly this drift: `⋮` stayed in
 *  the showcase, the monsters, the key lines and this documentation for hours after
 *  the renderer had stopped treating it as a state. Docs are the last copy to be
 *  corrected because nothing checks them; so this checks them.
 *
 *  The code-side half is `tests/render.test.ts` (glyph → SGR) and
 *  `tests/ansi-palette.test.ts` (hexes and ΔE floors). This is the doc-side half. */

const ROOT = join(import.meta.dir, "..");
const DOCS = ["docs/state-glyphs.md", "docs/state-colours.md"];
const read = (f: string) => readFileSync(join(ROOT, f), "utf8");
const GLYPHS = Object.keys(STATE_GLYPH_ROLE);

describe("the vocabulary documents teach what the renderer does", () => {
  for (const doc of DOCS) {
    test(`${doc}: all four state glyphs are present, and none is retired`, () => {
      const text = read(doc);
      for (const g of GLYPHS) expect(text, `${doc} is missing ${g}`).toContain(g);
      // The retired glyph must not be presented as a state. It may appear as the
      // elision mark, so this asserts the *pairing* — `⋮` on a state row — is gone.
      expect(text).not.toMatch(/\|\s*⋮\s*\|[^|]*state-parked/);
      expect(text).not.toContain("#ff9933");
      expect(text).not.toContain("255;153;51");
    });

    test(`${doc}: the byte-rule fence's glyphs sit in one column`, () => {
      // The fence is a table in all but syntax: four rows, one glyph column. The
      // parked row was one column late (measured 2026-10-27) — invisible in the
      // source, obvious on the glass, which is the whole reason to assert it.
      const rows = read(doc)
        .split("\n")
        .filter((l) => /^state-(ok|todo|parked|failed)\s/.test(l))
        .map((l) => {
          const name = l.split(/\s+/)[0]!;
          const rest = l.slice(name.length);
          return { name, pad: rest.length - rest.trimStart().length, glyph: rest.trimStart()[0] };
        });
      expect(rows.length).toBe(4);
      const columns = rows.map((r) => r.name.length + r.pad);
      expect(new Set(columns).size, `columns differ: ${columns.join(",")}`).toBe(1);
      for (const r of rows) expect(r.glyph).toBe(GLYPHS.find((g) => STATE_GLYPH_ROLE[g] === r.name)!);
    });
  }

  test("the documented hex for state-parked is the palette's, not the retired orange", () => {
    const hex = DRACULA_PALETTE["state-parked"];
    for (const doc of DOCS) expect(read(doc)).toContain(hex);
  });
});
