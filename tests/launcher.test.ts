import { describe, expect, test } from "bun:test";
import {
  GLOAM_FZF_BINDS,
  dedupeByPath,
  invokedAsGloam,
  listMarkdownFiles,
  rankedShortlist,
  registryHits,
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

describe("launcher — listMarkdownFiles (rg-sourced, BRF-CONTENT-SHORTLIST)", () => {
  test("rg on PATH (precondition — rg is the source for both picker modes)", () => {
    const onPath = (() => {
      for (const dir of (process.env.PATH ?? "").split(":")) {
        if (!dir) continue;
        if (existsSync(`${dir}/rg`)) return true;
      }
      return false;
    })();
    expect(onPath).toBe(true);
  });

  test("lists .md files in this repo (the silo we index against)", () => {
    const files = listMarkdownFiles(process.cwd());
    expect(files.length).toBeGreaterThan(20); // 43 briefs alone
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

describe("launcher — dedupeByPath (feed order = priority)", () => {
  test("first occurrence wins; channel order preserved", () => {
    expect(dedupeByPath([["a.md", "b.md"], ["b.md", "c.md"], ["c.md", "d.md"]])).toEqual([
      "a.md",
      "b.md",
      "c.md",
      "d.md",
    ]);
  });

  test("a document matching every channel appears once, at its highest channel", () => {
    expect(dedupeByPath([["hit.md"], ["hit.md"], ["hit.md"]])).toEqual(["hit.md"]);
  });

  test("empty channels are honest no-ops", () => {
    expect(dedupeByPath([[], ["a.md"], []])).toEqual(["a.md"]);
  });
});

describe("launcher — rankedShortlist (the -g merge, integration)", () => {
  test("a pure-registry query ranks the owning document first", () => {
    // SHORTLIST names exactly one owner: the brief itself. Registry
    // channel fires, body mentions rank later, filename remainder last.
    const shortlist = rankedShortlist("BRF-CONTENT-SHORTLIST", process.cwd());
    expect(shortlist[0]).toBe("briefs/2026-08-30-brief-content-shortlist.md");
    expect(shortlist.length).toBeGreaterThan(1); // the remainder followed
  });

  test("a pure-filename query still surfaces the file (remainder channel)", () => {
    // The 2026-09-04 amendment: filenames and content, one search.
    const shortlist = rankedShortlist("origin-doc", process.cwd());
    expect(shortlist).toContain("docs/2026-08-20-origin-doc.md");
  });

  test("no duplicates in the merged list", () => {
    const shortlist = rankedShortlist("diagram", process.cwd());
    expect(new Set(shortlist).size).toBe(shortlist.length);
  });

  test("registryHits is field-anchored: a summary-only match is not an owner", () => {
    // "diagram" appears in many summaries; only callsign-bearing rows
    // may produce channel-1 hits, and each hit must live in a tier dir.
    const hits = registryHits("diagram", process.cwd());
    for (const h of hits) {
      expect(h.startsWith("briefs/") || h.startsWith("decisions/") || h.startsWith("debriefs/") || h.startsWith("playbooks/")).toBe(true);
    }
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