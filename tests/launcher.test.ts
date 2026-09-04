import { describe, expect, test } from "bun:test";
import {
  GLOAM_FZF_BINDS,
  dedupeByPath,
  fzfEnv,
  invokedAsGloam,
  listMarkdownFiles,
  rankedShortlistEntries,
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

describe("launcher — rankedShortlistEntries (the -g merge, integration)", () => {
  test("a pure-registry query ranks the owning document first", () => {
    // SHORTLIST names exactly one owner: the brief itself. Registry
    // channel fires, body mentions rank later, filename remainder last.
    const entries = rankedShortlistEntries("BRF-CONTENT-SHORTLIST", process.cwd());
    expect(entries[0]!.split("\t")[0]).toBe("briefs/2026-08-30-brief-content-shortlist.md");
    expect(entries.length).toBeGreaterThan(1); // the remainder followed
  });

  test("a pure-filename query still surfaces the file (remainder channel)", () => {
    // The 2026-09-04 amendment: filenames and content, one search.
    const entries = rankedShortlistEntries("origin-doc", process.cwd());
    expect(entries.some((e) => e.split("\t")[0] === "docs/2026-08-20-origin-doc.md")).toBe(true);
  });

  test("no duplicates in the merged list", () => {
    const entries = rankedShortlistEntries("diagram", process.cwd());
    const paths = entries.map((e) => e.split("\t")[0]);
    expect(new Set(paths).size).toBe(paths.length);
  });

  test("body-channel entries carry the matching line as snippet evidence", () => {
    const entries = rankedShortlistEntries("1.4.0", process.cwd());
    const dep = entries.find((e) => e.startsWith("DEPENDENCIES.md\t"));
    expect(dep).toBeDefined();
    expect(dep).toContain("1.4.0"); // the snippet shows the version row
  });

  test("snippets are bounded (ADR-028: entry length is paint volume)", () => {
    for (const q of ["diagram", "the", "Bun 1.4.0"]) {
      for (const e of rankedShortlistEntries(q, process.cwd())) {
        const [path, snippet] = e.split("\t");
        expect(path!.length).toBeGreaterThan(0);
        if (snippet) expect(snippet.length).toBeLessThanOrEqual(100);
      }
    }
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

describe("launcher — conformance smoke: the search the operator runs", () => {
  // The 2026-09-04 miss: the merge was tested, the search was not. This
  // drives fzf non-interactively (--filter) exactly as pickFile drives
  // it interactively — same flags, same stdin — and asserts the
  // operator's scenario end to end: type the content query, find the
  // file. If this fails, the picker is broken, whatever the unit tests
  // say about the merge.

  async function fzfFilter(query: string, entries: string[]): Promise<string[]> {
    // Async Bun.spawn with stdin:"pipe" — the exact mechanism pickFile
    // uses. (Bun.spawnSync's `input` option is silently ignored in
    // bun 1.4.0: fzf receives an empty stdin and matches nothing — a
    // false negative that cost this suite one debugging round.)
    const args = ["fzf", "--filter", query, "--exact", "--tiebreak=index", "--delimiter=\t"];
    const proc = Bun.spawn(args, {
      stdin: "pipe",
      stdout: "pipe",
      env: { ...process.env, FZF_DEFAULT_OPTS: "" },
    });
    proc.stdin.write(entries.join("\n") + "\n");
    await proc.stdin.end();
    const out = await new Response(proc.stdout).text();
    return out.split("\n").filter(Boolean).map((line) => line.split("\t")[0]!);
  }

  test("query '1.4.0' locates the bun version row in DEPENDENCIES.md", async () => {
    const entries = rankedShortlistEntries("1.4.0", process.cwd());
    const matches = await fzfFilter("1.4.0", entries);
    expect(matches.length).toBeGreaterThan(0); // the v1 failure mode: zero matches
    // Locatable, not pinned-first: within the body channel rg traversal
    // order decides, and any other file mentioning Bun 1.4.0 may rank
    // above it. The conformance contract is *findable in the shortlist*.
    expect(matches).toContain("DEPENDENCIES.md");
  });

  test("query 'bun 1.4.0' (fzf AND) still finds it", async () => {
    const entries = rankedShortlistEntries("bun", process.cwd());
    const matches = await fzfFilter("bun 1.4.0", entries);
    expect(matches).toContain("DEPENDENCIES.md");
  });

  test("a filename query narrows through the same pipe", async () => {
    const entries = rankedShortlistEntries("origin", process.cwd());
    const matches = await fzfFilter("origin", entries);
    // The origin doc matches on both path and body; briefs that mention
    // "origin" may rank above it (rg traversal order within the body
    // channel) — the contract is that it surfaces in the shortlist.
    expect(matches).toContain("docs/2026-08-20-origin-doc.md");
  });

  test("entry path: `-g` parses at the CLI gate, never falls through to the reader", async () => {
    // The 2026-09-04 operator trap: the smoke drove the pipe directly and
    // stayed green while the operator's entry path (`just gloam -g q`)
    // silently dropped the flag — old recipe, no passthrough — and typed
    // the query into the filename-only picker. Zero results, smoke green.
    // This pin drives the *entry*: with -g parsed (non-TTY here), the
    // -g gate must fire its own error, proving the flag was consumed as
    // a mode flag and not passed to the reader or swallowed.
    const proc = Bun.spawnSync(["bun", "run", "src/cli.ts", "-g", "1.4.0"], {
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, FZF_DEFAULT_OPTS: "" },
    });
    expect(proc.exitCode).toBe(1);
    expect(proc.stderr.toString()).toContain("-g is a gloam mode flag");
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

describe("launcher — fzf env ownership (the picker inherits no FZF_* furniture)", () => {
  test("fzfEnv strips the whole FZF_* namespace, hostile env included", () => {
    // Saved/restored per key: process.env mutation in tests is fine if
    // scoped and reversed — same pattern the argv0 tests use.
    const hostile: Record<string, string> = {
      FZF_DEFAULT_OPTS: "--height=100% --border --bind=ctrl-z:abort",
      FZF_DEFAULT_COMMAND: "rm -rf /",
      FZF_TMUX: "1",
      FZF_API_KEY: "stolen",
      PATH: process.env.PATH ?? "",
      HOME: process.env.HOME ?? "",
    };
    const saved: Array<[string, string | undefined]> = Object.keys(hostile).map((k) => [k, process.env[k]]);
    for (const [k, v] of Object.entries(hostile)) process.env[k] = v;
    const env = fzfEnv();
    for (const [k, v] of saved) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    for (const k of Object.keys(hostile)) {
      if (k.startsWith("FZF_")) expect(env[k]).toBeUndefined();
      else expect(env[k]).toBeDefined(); // non-FZF_* env passes through
    }
  });

  test("behavioral: hostile FZF_DEFAULT_OPTS cannot reach the picker", async () => {
    // Spawn fzf through fzfEnv with FZF_DEFAULT_OPTS set to something
    // that would corrupt our layout (--height/border/binds). Our spawn
    // must behave as if the variable does not exist.
    const saved = process.env.FZF_DEFAULT_OPTS;
    process.env.FZF_DEFAULT_OPTS = "--height=100% --border --bind=ctrl-z:abort";
    const proc = Bun.spawn(
      ["fzf", "--filter", "1.4.0", "--exact", "--delimiter=\t"],
      { stdin: "pipe", stdout: "pipe", env: fzfEnv() },
    );
    proc.stdin.write("DEPENDENCIES.md\t| bun | 1.4.0 |\nother.md\tnothing\n");
    await proc.stdin.end();
    if (saved === undefined) delete process.env.FZF_DEFAULT_OPTS;
    else process.env.FZF_DEFAULT_OPTS = saved;
    const out = await new Response(proc.stdout).text();
    expect(out.split("\t")[0]).toBe("DEPENDENCIES.md"); // matched, unpolluted
  });
});