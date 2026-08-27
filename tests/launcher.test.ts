import { describe, expect, test } from "bun:test";
import {
  GLOAM_FZF_BINDS,
  invokedAsGloam,
  listMarkdownFiles,
} from "../src/launcher";
import { existsSync } from "node:fs";
import { basename } from "node:path";

describe("launcher — verb-grammar binds (ADR-016, contract pin)", () => {
  test("the three parity binds are present and in the agreed order", () => {
    // The picker is a guest of the reader's key set. These binds are the
    // contract; changing them is a key-grammar change, not a tweak.
    expect(GLOAM_FZF_BINDS).toBe("ctrl-d:page-down,ctrl-u:page-up,esc:cancel");
  });

  test("ctrl-u is NOT clear-query (the punch the parity work fixed)", () => {
    // Gloam's Ctrl-U is half-page up; fzf's default is clear-query (destroys
    // input). The bind must neutralise the readline default, not keep it.
    expect(GLOAM_FZF_BINDS).not.toContain("ctrl-u:clear-query");
    expect(GLOAM_FZF_BINDS).toContain("ctrl-u:page-up");
  });

  test("ctrl-d is NOT delete-char (the readline no-op-feel asymmetry)", () => {
    expect(GLOAM_FZF_BINDS).not.toContain("ctrl-d:delete-char");
    expect(GLOAM_FZF_BINDS).toContain("ctrl-d:page-down");
  });

  test("esc:cancel is present (clear/done — fzf's modern default, located right)", () => {
    expect(GLOAM_FZF_BINDS).toContain("esc:cancel");
  });
});

describe("launcher — invokedAsGloam (argv[0] basename detection)", () => {
  test("detects the symlink case (basename gloam)", () => {
    // Simulate: process.argv0 = "/Users/x/.local/bin/gloam"
    const saved = process.argv0;
    Object.defineProperty(process, "argv0", { value: "/tmp/gloam", writable: true });
    expect(invokedAsGloam()).toBe(true);
    Object.defineProperty(process, "argv0", { value: saved, writable: true });
  });

  test("rejects the okuda invocation (basename okuda)", () => {
    const saved = process.argv0;
    Object.defineProperty(process, "argv0", { value: "/tmp/okuda", writable: true });
    expect(invokedAsGloam()).toBe(false);
    Object.defineProperty(process, "argv0", { value: saved, writable: true });
  });

  test("exec -a gloam sets basename to bare 'gloam'", () => {
    const saved = process.argv0;
    Object.defineProperty(process, "argv0", { value: "gloam", writable: true });
    expect(invokedAsGloam()).toBe(true);
    Object.defineProperty(process, "argv0", { value: saved, writable: true });
  });
});

describe("launcher — listMarkdownFiles", () => {
  test("lists .md files in this repo (the silo we index against)", () => {
    const files = listMarkdownFiles(process.cwd());
    expect(files.length).toBeGreaterThan(20); // 34 briefs alone
    expect(files.every((f) => f.endsWith(".md"))).toBe(true);
  });

  test("skips .git and hidden files", () => {
    const files = listMarkdownFiles(process.cwd());
    expect(files.some((f) => f.includes("/.git/"))).toBe(false);
    expect(files.some((f) => basename(f).startsWith("."))).toBe(false);
  });

  test("sorted ASCII-deterministic (LC_ALL=C equivalent)", () => {
    const files = listMarkdownFiles(process.cwd());
    const sorted = [...files].sort();
    expect(files).toEqual(sorted);
  });
});

describe("launcher — fzf spawn wiring (non-interactive smoke)", () => {
  // Can't drive the interactive TUI loop here, but verify the spawn
  // contract: fzf reads the file list from stdin, writes selection to
  // stdout. --filter makes fzf non-interactive (selects matches, exits).
  test("fzf on PATH (precondition for the launcher)", () => {
    // The launcher prints a clean error if fzf is missing; this test
    // documents that the dev environment has it.
    const onPath = (() => {
      for (const dir of (process.env.PATH ?? "").split(":")) {
        if (!dir) continue;
        if (existsSync(`${dir}/fzf`)) return true;
      }
      return false;
    })();
    expect(onPath).toBe(true);
  });
});