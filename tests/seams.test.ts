import { describe, expect, test } from "bun:test";
import { findCrossings, stripComments } from "../scripts/seams";

/** The seam census (`scripts/seams.ts`, `explainers/causation.md`).
 *
 *  An instrument that cannot be tested is a reading, and a reading that
 *  mis-counts is worse than none — this session has two witnesses (a dogfood
 *  run against a stale binary, and a byte count read as a column count). So
 *  the classifier's two failure directions are pinned here: counting a
 *  *comment*, and missing a crossing spelled through an alias. */

describe("stripComments — the census reads code, not prose about code", () => {
  test("line and block comments are removed", () => {
    expect(stripComments("a // process.env.SECRET\nb")).toBe("a \nb");
    expect(stripComments("a /* process.env.SECRET */ b")).toBe("a  b");
  });

  test("string literals survive — they are code", () => {
    expect(stripComments('x = "process.env.KEEP"')).toContain("process.env.KEEP");
  });

  test("a regex literal containing a quote does not desync the scanner", () => {
    // The corpus case: src/vectors.ts carries `/['"]/`-shaped patterns, and a
    // naive scanner enters string mode and stops reading the file — silently.
    const src = 'const RE = /[\'"]/g;\n// process.env.HIDDEN\nconst y = 1;';
    expect(stripComments(src)).not.toContain("process.env.HIDDEN");
  });

  test("a comment that merely discusses a read is not a read", () => {
    // Shaped like src/width.ts:278-286 — the block comment that would
    // otherwise put a tty crossing in the file whose whole job is to *guard*
    // that read. A continuation line is only a comment if its opener is; the
    // scanner is right to require the `/**`.
    const src = "/**\n * `process.stdout.columns`/`rows` report **0** when\n */\nconst a = 1;";
    expect(stripComments(src)).not.toContain("columns");
  });
});

describe("findCrossings — every inbound crossing, named", () => {
  const scan = (name: string, text: string) => findCrossings([{ name, text }]);

  test("an env variable is one crossing, keyed by name", () => {
    expect([...scan("a.ts", "x = process.env.EDITOR;").keys()]).toEqual(["a.ts env:EDITOR"]);
  });

  test("a whole-environment read is its own key", () => {
    expect([...scan("a.ts", "f(process.env)").keys()]).toEqual(["a.ts env:*"]);
    expect([...scan("a.ts", "g({ ...process.env })").keys()]).toEqual(["a.ts env:*"]);
  });

  test("a tty read through an alias is the same crossing", () => {
    const src = "const out = process.stdout;\nif (out.columns > 0) {}";
    expect([...scan("a.ts", src).keys()]).toEqual(["a.ts tty:columns"]);
  });

  test("a bare watch( counts only where the name came from node:fs", () => {
    expect([...scan("a.ts", 'const { watch } = await import("node:fs");\nwatch(f, cb);').keys()]).toContain("a.ts fs:watch");
    expect([...scan("a.ts", "watchTheThing(f);").keys()]).not.toContain("a.ts fs:watch");
  });

  test("spawns and signals are crossings", () => {
    expect([...scan("a.ts", "Bun.spawn([\"ls\"])").keys()]).toEqual(["a.ts proc:spawn"]);
    expect([...scan("a.ts", 'process.on("SIGWINCH", f)').keys()]).toEqual(["a.ts signal:SIGWINCH"]);
  });

  test("comments contribute nothing to the census", () => {
    expect([...scan("a.ts", "// process.env.NOPE\n/* Bun.spawn(x) */").keys()]).toEqual([]);
  });
});
