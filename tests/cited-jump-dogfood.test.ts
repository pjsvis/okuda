import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { deriveReferences, parseAddress, scanReferences } from "../src/vectors";
import { arrivalScroll, extractJumps, viewport } from "../src/tui";
import { renderDocument, wrapWholeFile } from "../src/render";
import { makeSilcrowGate } from "../src/root";

/** The dogfood page is an instrument, not a demo.
 *
 *  `docs/2026-10-30-dogfood-cited-jump.md` is a menu of real arrivals, hand-wired:
 *  the numbers are the compositor's half and the lines are the code's, so the page
 *  can rot in two ways — a number that no longer matches the map, or a line that no
 *  longer holds what the row says. Both are silent to a reader who never types the
 *  number, and both fail here.
 *
 *  The warrant for the page: the brief that specified the jump had six silcrows and
 *  one of them landed on `return { ok: true, out };` — measured 2026-10-30. A wrong
 *  address is invisible until something dereferences it, which is exactly what
 *  `ADR-ADDRESS-NOT-COORDINATE-074` spent 310 citations arguing.
 */

const ROOT = join(import.meta.dir, "..");
const DOC = join(ROOT, "docs/2026-10-30-dogfood-cited-jump.md");
const doc = readFileSync(DOC, "utf8");
/** The TUI's own gate (callsign || path, minus self), not a filesystem stand-in:
 *  the page cites callsigns too, and a narrower gate would allocate different
 *  numbers than the ones a reader types. */
const gate = makeSilcrowGate(DOC, ROOT);

/** Every wired row, in reading order — [address, the text its arrival must show].
 *  `null` means there is no line to show: the row is the past-EOF clamp. */
const ROWS: Array<[string, string | null]> = [
  ["src/vectors.ts:138", "export function parseAddress"],
  ["src/tui.ts:634", "export function scrollForLine"],
  ["src/vectors.ts:305", "if (seen.has(ref.target))"],
  ["src/render.ts:1164", "export function wrapWholeFile"],
  ["src/render.ts:996", "export const RE_CITED_PATH"],
  ["src/vectors.ts:138-142", "export function parseAddress"],
  ["src/tui.ts:9999", null],
];

const frameOf = async (path: string, width = 80): Promise<string[]> =>
  (
    await renderDocument(wrapWholeFile(path, readFileSync(path, "utf8")), { width, color: "none" })
  ).split("\n");

describe("cited-jump dogfood — the page's numbers are the map's", () => {
  test("every wired number is the number the map gives that address", () => {
    // The compositor contract: a wired row's number and the silcrow the map would
    // paint for the same address cannot disagree.
    const { map } = deriveReferences(doc, gate);
    const wires = extractJumps(doc);
    expect(wires.size).toBe(ROWS.length);
    for (const [address, token] of [...wires].map(([n, a]) => [a, n] as const)) {
      expect(map.get(token)).toBe(address);
    }
    expect([...map].filter(([, a]) => ROWS.some(([addr]) => addr === a)).length).toBe(ROWS.length);
  });

  test("the page's displayed numbers are the wiring's numbers", () => {
    // The table's § column is what the reader types; the comment is what the
    // compositor reads. A row where they differ is a wrong number on the glass.
    const shown = [...doc.matchAll(/\*\*(\d{1,2})\*\* <!-- %%okuda-rhs:(\d{1,2})%%/g)];
    expect(shown.length).toBe(ROWS.length);
    for (const [, display, wire] of shown) expect(display).toBe(wire);
  });
});

describe("cited-jump dogfood — every address is still true", () => {
  test("each lined address holds the text its row promises", () => {
    for (const [address, marker] of ROWS) {
      const { path, line } = parseAddress(address);
      const lines = readFileSync(join(ROOT, path), "utf8").split("\n");
      if (marker === null) {
        expect(line!).toBeGreaterThan(lines.length); // the row is the clamp
        continue;
      }
      expect(lines[line! - 1] ?? "").toContain(marker);
    }
  });

  test("each arrival puts that line at the top of the frame", async () => {
    const HEIGHT = 6;
    for (const [address, marker] of ROWS) {
      const { path } = parseAddress(address);
      const frame = await frameOf(join(ROOT, path));
      const scroll = arrivalScroll(frame, address, HEIGHT);
      const top = viewport(frame, scroll, HEIGHT).visible[0] ?? "";
      if (marker === null) {
        expect(scroll).toBe(viewport(frame, 0, HEIGHT).maxScroll); // clamps, never blanks
        expect(top.trim()).not.toBe("");
        continue;
      }
      expect(top).toContain(marker);
    }
  });
});

describe("cited-jump dogfood — the controls still refuse", () => {
  test("a document is entered at the top, and its line is dropped at discovery", () => {
    // Both spellings mint ONE address; the suffix never reaches the map.
    const targets = scanReferences(doc, gate).map((r) => r.target);
    expect(targets.filter((t) => t === "docs/style-guide.md")).toHaveLength(2);
    expect(targets.some((t) => t.startsWith("docs/style-guide.md:"))).toBe(false);
    const { map } = deriveReferences(doc, gate);
    const n = [...map].find(([, a]) => a === "docs/style-guide.md")![0];
    expect([...map].filter(([, a]) => a === "docs/style-guide.md")).toHaveLength(1);
    expect(n).toBeGreaterThan(0);
  });

  test("an address on a file that does not resolve mints nothing", () => {
    const { map } = deriveReferences(doc, gate);
    expect([...map.values()]).not.toContain("a.rs:1123-1142");
    expect(doc).toContain("`a.rs:1123-1142`"); // it is on the page, and it gilds
    expect(scanReferences(doc, gate).map((r) => r.target)).not.toContain("a.rs:1123-1142");
  });

  test("a coordinate without an extension is prose, not an address", () => {
    for (const shape of ["path:1123", "v1.2:3"]) {
      expect(doc).toContain(shape);
      expect(scanReferences(doc, gate).some((r) => r.target.includes(shape))).toBe(false);
    }
  });

  test("the page renders with no paint marker on the glass", async () => {
    const out = await renderDocument(doc, { width: 100, color: "none" });
    expect(out).not.toContain("%okuda-");
    expect(out).toContain("parseAddress"); // the table's first row survives as a row
  });
});
