import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { KEYBINDINGS, verbFor } from "../src/keygrammar";
import { VECTOR_MIN, VECTOR_MAX, MAX_REFS } from "../src/vectors";

const DOC = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "docs",
  "keymap.md",
);
const src = readFileSync(DOC, "utf8");

describe("keymap doc — the map is refereed against the territory", () => {
  // Every table row of the form `| **NN** | word | … |`: the word is
  // either a Verb identifier (a binding) or `reserved` (a pocket
  // member). No other word is admissible — a drifted cell fails here.
  const rows = [...src.matchAll(/\| \*\*(\d{2})\*\* \| (\w+) \|/g)].map(
    (m) => [Number(m[1]), m[2]] as [number, string],
  );

  test("the bound rows ARE the KEYBINDINGS table, both directions", () => {
    const bound = rows.filter(([, v]) => v !== "reserved");
    const table = Object.entries(KEYBINDINGS).map(([k, v]) => [
      Number(k),
      v,
    ] as [number, string]);
    expect(bound).toEqual(table); // same rows, same order, nothing hidden
  });

  test("the pocket rows are exactly the reserved-unassigned tokens", () => {
    const stated = rows.filter(([, v]) => v === "reserved").map(([t]) => t);
    // Derived from the code: every token in 00-99 that resolves to
    // null and is not bound. If a binding lands, its row must move.
    const expected = [...Array(100).keys()].filter(
      (n) => verbFor(n) === null && !(n in KEYBINDINGS),
    );
    expect(stated).toEqual(expected);
  });

  test("every row is honest: bound rows bind, reserved rows resolve null", () => {
    for (const [t, v] of rows) {
      if (v === "reserved") {
        expect(verbFor(t)).toBeNull();
        expect(t in KEYBINDINGS).toBe(false);
      } else {
        expect(KEYBINDINGS[t]).toBe(v as never);
        expect(t < VECTOR_MIN || t > VECTOR_MAX).toBe(true);
      }
    }
  });

  test("the vector range row states the current floor and ceiling", () => {
    // The range is stated as `MIN–MAX` (en dash); if the constants
    // move, this fails until the page catches up.
    expect(src).toContain(`${VECTOR_MIN}–${VECTOR_MAX}`);
    expect(src).toContain(`${MAX_REFS} addresses`);
  });
});
