import { describe, expect, test } from "bun:test";
import {
  EXCLUSIONS,
  FZF_FIXED_ARGS,
  FZF_HL_ARG,
  GLOAM_FZF_BINDS,
  bodyPattern,
  fzfEnv,
  invokedAsGloam,
  listMarkdownFiles,
  rankedShortlistEntries,
  registryHits,
  selfEntriesCmd,
} from "../src/launcher";
import { existsSync } from "node:fs";
import { basename } from "node:path";

describe("launcher — verb-grammar binds (ADR-016, contract pin)", () => {
  test("the three parity binds are present and in the agreed order", () => {
    // The picker is a guest of the reader's key set. These binds are the
    // contract; changing them is a key-grammar change, not a tweak.
    expect(GLOAM_FZF_BINDS).toBe("ctrl-d:page-down,ctrl-u:page-up,esc:clear-query");
  });

  test("esc NEVER aborts the picker (keyboard-controls: double-ESC must not exit)", () => {
    // The old esc:cancel made ESC abort the picker round — a double-tap
    // took the operator out of the game. ESC clears the query; leaving
    // is Ctrl-C or 00 in the document.
    expect(GLOAM_FZF_BINDS).toContain("esc:clear-query");
    expect(GLOAM_FZF_BINDS).not.toContain("esc:cancel");
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

  test("esc:clear-query is present (ESC never exits — keyboard-controls)", () => {
    expect(GLOAM_FZF_BINDS).toContain("esc:clear-query");
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

  test("generated index.md views are not in the corpus (build artifacts)", () => {
    // reg-sync regenerates every index.md from the JSONL — "hand-edits
    // are overwritten" by the silo's own constitution. They are not
    // documents; the picker is the better index.
    const files = listMarkdownFiles(process.cwd());
    expect(files.some((f) => f.endsWith("/index.md") || f === "index.md")).toBe(false);
  });
});

describe("launcher — rankedShortlistEntries (the -g merge, integration)", () => {
  test("a pure-registry query ranks the owning document first", () => {
    // SHORTLIST names exactly one owner: the brief itself. Registry
    // channel fires, body mentions rank later, filename remainder last.
    // (Orientation files float above all channels — ADR-030-era channel
    // 0 — so the owning doc is the first row *with a directory*.)
    const entries = rankedShortlistEntries("BRF-CONTENT-SHORTLIST", process.cwd());
    const firstTiered = entries.find((e) => pathOf(e).includes("/"));
    expect(pathOf(firstTiered!)).toBe("briefs/2026-08-30-brief-content-shortlist.md");
    expect(entries.length).toBeGreaterThan(1); // the remainder followed
  });

  test("a pure-filename query still surfaces the file (remainder channel)", () => {
    // The 2026-09-04 amendment: filenames and content, one search.
    const entries = rankedShortlistEntries("origin-doc", process.cwd());
    expect(entries.some((e) => pathOf(e) === "docs/2026-08-20-origin-doc.md")).toBe(true);
  });

  test("no duplicates in the merged list", () => {
    const entries = rankedShortlistEntries("diagram", process.cwd());
    const paths = entries.map(pathOf);
    expect(new Set(paths).size).toBe(paths.length);
  });

  test("generated index.md surfaces in no channel", () => {
    // Body hits and remainder alike exclude the generated views.
    // basename, not endsWith: the exclusion is a path component. A
    // suffix test also swallows any document whose slug ends in
    // `-index.md` (docs/2026-09-15-the-invariants-and-the-index.md),
    // which is a hand-written document and belongs in the corpus.
    const entries = rankedShortlistEntries("silo index generated", process.cwd());
    expect(entries.some((e) => basename(pathOf(e)) === "index.md")).toBe(false);
  });

  test("orientation: the landing is the shelf — root files, nothing else", () => {
    // The landing is a shelf, not a dump: the silo's top level, and
    // nothing else. Folder contents stay behind their labels until the
    // filter is expressed.
    const shelf = rankedShortlistEntries("", process.cwd());
    expect(shelf.every((e) => !pathOf(e).includes("/"))).toBe(true);
    expect(shelf.length).toBe(listMarkdownFiles(process.cwd()).filter((f) => !f.includes("/")).length);
  });

  test("the dive: searching suppresses root files entirely", () => {
    // Filter text expressed → the shelf steps aside: no root file is a
    // destination in the dive, in any channel.
    for (const q of ["diagram", "load bearing", "1.4.0"]) {
      const entries = rankedShortlistEntries(q, process.cwd());
      expect(entries.length).toBeGreaterThan(0);
      expect(entries.every((e) => !pathOf(e).includes("/"))).toBe(false); // corpus rows exist
      expect(entries.some((e) => !pathOf(e).includes("/"))).toBe(false); // no root files at all
    }
  });

  test("shelf rows carry first-line previews", () => {
    const shelf = rankedShortlistEntries("", process.cwd());
    const dep = shelf.find((e) => e.startsWith("DEPENDENCIES.md\t"));
    expect(dep).toBeDefined();
    expect(dep!.split("\t")[1]!.length).toBeGreaterThan(0); // preview attached
  });

  test("body-channel entries carry the matching line as snippet evidence", () => {
    const entries = rankedShortlistEntries("1.4.0", process.cwd());
    const hit = entries.find((e) => pathOf(e) === "decisions/023-tty-active-input-reader.md");
    expect(hit).toBeDefined();
    expect(hit).toContain("1.4.0"); // the snippet shows the version mention
  });

  test("snippets are bounded — anti-pathological only (ADR-028)", () => {
    for (const q of ["diagram", "the", "Bun 1.4.0"]) {
      for (const e of rankedShortlistEntries(q, process.cwd())) {
        const [path, snippet] = e.split("\t");
        expect(path!.length).toBeGreaterThan(0);
        if (snippet) expect(snippet.length).toBeLessThanOrEqual(240);
      }
    }
  });

  test("single column: paths at natural width, evidence on the same line", () => {
    // The 2026-09-04 operator layout: the file list looks like the
    // filename picker (no padding), evidence follows on the same line,
    // and fzf's glass-edge truncation is the widening reveal.
    const entries = rankedShortlistEntries("load bearing", process.cwd());
    for (const e of entries) {
      const pathField = e.split("\t")[0]!;
      expect(pathField).toBe(pathField.trimEnd()); // no alignment padding
      expect(pathField).not.toMatch(/\s/); // paths are paths
    }
  });

  test("evidence grammar: single-spaced, no table-pipe padding at the edges", () => {
    const entries = rankedShortlistEntries("load bearing", process.cwd());
    for (const e of entries) {
      const snippet = e.slice(e.indexOf("\t") + 1);
      if (!snippet) continue;
      expect(snippet).not.toMatch(/\s{2,}/); // collapsed
      expect(snippet).not.toMatch(/^\|/); // leading cell padding stripped
      expect(snippet).not.toMatch(/\|$/); // trailing cell padding stripped
    }
  });

  test("alignment retired — single natural-width column (2026-09-04)", () => {
    // The padded-table look lasted one revision: the operator chose the
    // file-list-as-normal column, evidence on the same line, widening as
    // the reveal. This test stays as the tombstone and the guard: no
    // entry may carry alignment padding.
    const entries = rankedShortlistEntries("diagram", process.cwd());
    for (const e of entries) {
      expect(e.split("\t")[0]).toBe(e.split("\t")[0]!.trimEnd());
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

// Path extraction mirroring pickFile (alignment padding trimmed).
function pathOf(line: string): string {
  return line.split("\t")[0]!.trimEnd();
}

describe("launcher — conformance smoke: the search the operator runs", () => {
  // The 2026-09-04 miss: the merge was tested, the search was not. This
  // drives fzf non-interactively (--filter) exactly as pickFile drives
  // it interactively — same flags, same stdin — and asserts the
  // operator's scenario end to end: type the content query, find the
  // file. If this fails, the picker is broken, whatever the unit tests
  // say about the merge.

  // Path extraction mirrors pickFile: everything before the tab, with
  // alignment padding trimmed.
  const pathOf = (line: string) => line.split("\t")[0]!.trimEnd();

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
    return out.split("\n").filter(Boolean).map(pathOf);
  }

  test("the shelf surfaces DEPENDENCIES.md; the dive never does (root excluded)", async () => {
    // The 2026-09-04 shelf decision: root files live on the landing and
    // are excluded from the dive — the bun version is found by opening
    // the shelf's DEPENDENCIES.md, not by corpus search.
    const shelf = rankedShortlistEntries("", process.cwd());
    expect(shelf.some((e) => e.startsWith("DEPENDENCIES.md\t"))).toBe(true);
    const dive = rankedShortlistEntries("1.4.0", process.cwd());
    const matches = await fzfFilter("1.4.0", dive);
    expect(matches.length).toBeGreaterThan(0); // the v1 failure mode: zero matches
    expect(matches.every((m) => !m.includes("/"))).toBe(false); // the dive is corpus-wide
    expect(matches).not.toContain("DEPENDENCIES.md"); // root excluded from the dive
  });

  test("query 'bun 1.4.0' (fzf AND) narrows within the dive", async () => {
    const entries = rankedShortlistEntries("bun", process.cwd());
    const matches = await fzfFilter("bun 1.4.0", entries);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((m) => !m.startsWith("&"))).toBe(true); // &-family never in the dive
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

  test("entry path: unquoted multi-word positionals join the -g query", async () => {
    // `just gloam -g load bearing` must mean the phrase "load bearing" —
    // not "load" with "bearing" silently dropped or turned into a file.
    const proc = Bun.spawnSync(["bun", "run", "src/cli.ts", "-g", "load", "bearing"], {
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, FZF_DEFAULT_OPTS: "" },
    });
    expect(proc.exitCode).toBe(1);
    expect(proc.stderr.toString()).toContain("-g is a gloam mode flag"); // -g gate, not "unexpected argument"
  });

  test("entry path: --entries prints the ranked stream headless (ADR-030)", () => {
    // The live picker's reload target — and the seam where dev (bun run
    // src/cli.ts) and compiled (the binary) invocations must behave
    // identically. If this diverges, the operator's picker goes stale
    // while every stdin-fed test stays green.
    const proc = Bun.spawnSync(["bun", "run", "src/cli.ts", "--entries", "load", "bearing"], {
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, FZF_DEFAULT_OPTS: "" },
    });
    expect(proc.exitCode).toBe(0);
    const out = proc.stdout.toString();
    expect(out).toContain("load-bearing"); // evidence rows
    // Root files are the shelf, not the dive — so assert a root *row*, not the
    // bare substring. `not.toContain` also caught the nested candidate
    // `templates/silo/DEPENDENCIES.md` once the silo template landed
    // (2026-10-12); the root file itself is correctly absent from the dive.
    expect(out.split("\n").some((l) => l.startsWith("DEPENDENCIES.md"))).toBe(false);
  });

  test("entry path: --entries with no query lists the shelf", () => {
    const proc = Bun.spawnSync(["bun", "run", "src/cli.ts", "--entries"], {
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, FZF_DEFAULT_OPTS: "" },
    });
    expect(proc.exitCode).toBe(0);
    const lines = proc.stdout.toString().split("\n").filter(Boolean);
    expect(lines.length).toBe(listMarkdownFiles(process.cwd()).filter((f) => !f.includes("/")).length);
  });

  test("selfEntriesCmd resolves the seam: dev re-execs bun, compiled re-execs itself", () => {
    const cmd = selfEntriesCmd();
    if (process.execPath.endsWith("/bun")) {
      // The script-path half of this seam is proven end to end by the
      // --entries spawn tests above (bun run src/cli.ts as the child);
      // under `bun test` argv[1] is the runner's, not the CLI's.
      expect(cmd).toMatch(/^bun run "/);
    } else {
      expect(cmd).toBe(`"${process.execPath}"`);
    }
  });

  test("bodyPattern: multi-word queries tolerate hyphenation and spacing", () => {
    const p = bodyPattern("load bearing");
    expect(p.kind).toBe("regex");
    expect(p.pattern).toBe("load.{0,3}bearing");
    const single = bodyPattern("1.4.0");
    expect(single).toEqual({ kind: "fixed", pattern: "1.4.0" });
  });

  test("'load bearing' surfaces corpus documents (hyphenated in the prose)", async () => {
    const entries = rankedShortlistEntries("load bearing", process.cwd());
    const hit = entries.find((e) => pathOf(e) === "briefs/2026-08-26-brief-tui-live-documents.md");
    expect(hit).toBeDefined();
    expect(hit).toContain("load-bearing"); // evidence: the hyphenated row
    // And through the real matcher: the phrase query must surface it.
    const matches = await fzfFilter("load bearing", entries);
    expect(matches).toContain("briefs/2026-08-26-brief-tui-live-documents.md");
  });
});

describe("launcher — fzf spawn wiring (non-interactive smoke)", () => {
  // Can't drive the interactive TUI loop here, but verify the spawn
  // contract: fzf reads the file list from stdin, writes selection to
  // stdout. --filter makes fzf non-interactive (selects matches, exits).
  test("the fzf spine pins --no-hscroll (the path must never slide)", () => {
    // hscroll centers the match — which lives in the evidence, mid-line —
    // and clips the path's beginning ("··.md"). Comprehension fix.
    expect(FZF_FIXED_ARGS).toContain("--no-hscroll");
    expect(FZF_FIXED_ARGS).toContain("--delimiter=\t");
  });

  test("match highlight: okuda's own amber, bold+underline (the Cmd+F courtesy)", () => {
    expect(FZF_HL_ARG).toContain("#dfa21a"); // the reader's `strong`
    expect(FZF_HL_ARG).toContain("bold:underline");
    expect(FZF_HL_ARG).toContain("hl:");
    expect(FZF_HL_ARG).toContain("selected-hl:"); // highlight survives on the cursor line
  });

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

describe("launcher — the search grammar at the seam (BRF-ONION-SEARCH-GRAMMAR; routing unit-tested in onion.test.ts)", () => {
  test("case fix: zod finds ZOG in the body channel", () => {
    // The single-word body channel was case-sensitive (rg -F without -i).
    // The modern concordance style: case-insensitive everywhere.
    const entries = rankedShortlistEntries("zod", process.cwd());
    // ZOG appears in the corpus as a callsign or body text.
    // If the case fix works, we get results; without it, zero.
    expect(entries.length).toBeGreaterThan(0);
  });

  test("OR: protocol-free | TTS finds both alternatives' documents", () => {
    const entries = rankedShortlistEntries("protocol-free | TTS", process.cwd());
    const paths = entries.map((e) => e.split("\t")[0]!);
    // The identity doc (protocol-free) should be in the union.
    expect(paths.some((p) => p.includes("protocol-free"))).toBe(true);
    // TTS dogfood docs should be in the union.
    expect(paths.some((p) => p.includes("tts"))).toBe(true);
  });

  test("OR deduplicates: a doc matching two alternatives appears once", () => {
    const entries = rankedShortlistEntries("okuda | okuda", process.cwd());
    const paths = entries.map((e) => e.split("\t")[0]!);
    const okudaPaths = paths.filter((p) => p.includes("okuda"));
    // No duplicate paths — dedup by path.
    const unique = new Set(okudaPaths);
    expect(unique.size).toBe(okudaPaths.length);
  });

  test("negation: !word is content exclude-by-result (Layer 3) — not a filename glob", () => {
    // The onion split the old double net (filename glob + content
    // match — defect 3): `!word` excludes docs whose BODIES mention
    // the term; the path way to exclude is `!dir/`. Corpus-independent
    // assertion: no surviving doc mentions the negated term.
    const rg = Bun.spawnSync(["rg", "-l", "-i", "-F", "filter", "--type", "md", "-g", "!**/index.md"], {
      cwd: process.cwd(),
    });
    const mentioning = new Set((rg.stdout.toString() ?? "").split("\n").filter(Boolean));
    const entries = rankedShortlistEntries("concordance !filter", process.cwd());
    for (const e of entries) {
      expect(mentioning.has(e.split("\t")[0]!)).toBe(false);
    }
  });

  test("--exact anti-soup preserved: state does not match estate", () => {
    // --exact is load-bearing; the pre-filter must not break it.
    expect(FZF_FIXED_ARGS).toContain("--exact");
  });
});

// ─── The onion search grammar (BRF-ONION-SEARCH-GRAMMAR) ─────────────
// Green since the onion landed (td-d95cf3, 2026-09-24). Written red
// by design 2026-09-07 against the then-filesystem (1/10/50); the
// corpus has since grown, so the counts are named from the
// filesystem at test time — the decisive shape survives: the search
// count EQUALS the ground-truth count, or the grammar lies.
describe("launcher — the onion search grammar (BRF-ONION-SEARCH-GRAMMAR)", () => {
  // Ground truth via the filesystem (2026-09-07 originals in braces):
  //   briefs/2026-09-02-*  → 2 {1} · briefs/2026-09-* → 39 {10} · briefs/ → 78 {50}
  //   decisions/ (numbered, undated) → 0 dated anything

  test("@date is a path predicate: briefs/ @2026-09-02 → the filesystem count {was 1}", () => {
    // The smoke-test query that motivated the brief.
    const expected = listMarkdownFiles(process.cwd())
      .filter((p) => p.startsWith("briefs/") && p.includes("2026-09-02")).length;
    const entries = rankedShortlistEntries("briefs/ @2026-09-02", process.cwd());
    const paths = entries.map((e) => e.split("\t")[0]!);
    expect(paths.length).toBe(expected);
    expect(paths.every((p) => p.startsWith("briefs/"))).toBe(true);
    expect(paths.every((p) => p.includes("2026-09-02"))).toBe(true);
  });

  test("@YYYY-MM is a path predicate: briefs/ @2026-09 → the filesystem count {was 10}", () => {
    // Month-granularity date predicate.
    const expected = listMarkdownFiles(process.cwd())
      .filter((p) => p.startsWith("briefs/") && p.includes("2026-09")).length;
    const entries = rankedShortlistEntries("briefs/ @2026-09", process.cwd());
    const paths = entries.map((e) => e.split("\t")[0]!);
    expect(paths.length).toBe(expected);
    expect(paths.every((p) => p.startsWith("briefs/"))).toBe(true);
    expect(paths.every((p) => p.includes("2026-09"))).toBe(true);
  });

  test("dir/ is a path predicate: briefs/ → the filesystem count {was 50}", () => {
    // A bare directory token. The whole briefs/ tier and nothing
    // else — a bare word is content; the trailing / is the path signal.
    const expected = listMarkdownFiles(process.cwd())
      .filter((p) => p.startsWith("briefs/")).length;
    const entries = rankedShortlistEntries("briefs/", process.cwd());
    const paths = entries.map((e) => e.split("\t")[0]!);
    expect(paths.length).toBe(expected);
    expect(paths.every((p) => p.startsWith("briefs/"))).toBe(true);
  });

  test("@date alone (no dir): @2026-09-02 → entries across every tier", () => {
    // @date without a directory filters by date across the whole corpus.
    // 2026-09-02 appears in multiple tiers (briefs/, docs/, etc.) — the
    // test confirms the count matches the filesystem ground truth, not
    // 214. Computed dynamically so the test survives tier growth.
    const expected = listMarkdownFiles(process.cwd())
      .filter((p) => p.includes("2026-09-02"))
      .length;
    const entries = rankedShortlistEntries("@2026-09-02", process.cwd());
    const paths = entries.map((e) => e.split("\t")[0]!);
    expect(paths.length).toBe(expected);
    expect(paths.every((p) => p.includes("2026-09-02"))).toBe(true);
  });

  test("!path excludes a directory: !briefs/ @2026-09-02 → zero briefs/", () => {
    // Path negation at Layer 1. Excluding briefs/ from the date query
    // removes the one brief; the result is every other tier's 2026-09-02
    // docs, with no briefs/ paths. Today negation matches nothing (the
    // literal `(briefs/)` glob hits zero files) so briefs/ leaks in.
    const entries = rankedShortlistEntries("!briefs/ @2026-09-02", process.cwd());
    const paths = entries.map((e) => e.split("\t")[0]!);
    expect(paths.every((p) => !p.startsWith("briefs/"))).toBe(true);
    expect(paths.every((p) => p.includes("2026-09-02"))).toBe(true);
  });

  test("the regression query: !briefs/ @2026-09 debriefs/ | decisions/ | docs/ → no briefs, all 2026-09", () => {
    // The smoke-test query rewritten in the onion grammar. Flat OR of
    // path predicates, no parens, no grouping operator. Every result is
    // in one of the named dirs, dated 2026-09, and briefs/ is excluded.
    const q = "!briefs/ @2026-09 debriefs/ | decisions/ | docs/";
    const entries = rankedShortlistEntries(q, process.cwd());
    const paths = entries.map((e) => e.split("\t")[0]!);
    expect(paths.every((p) => !p.startsWith("briefs/"))).toBe(true);
    expect(paths.every((p) => p.includes("2026-09"))).toBe(true);
    expect(
      paths.every((p) =>
        p.startsWith("debriefs/") ||
        p.startsWith("decisions/") ||
        p.startsWith("docs/")),
    ).toBe(true);
  });

  test("path predicates compose: decisions/ @2026-09 → zero (decisions aren't date-prefixed)", () => {
    // The honest-empty case. decisions/ files are numbered (001-…), not
    // dated, so decisions/ @2026-09 is zero — the path predicate ANDs
    // and finds no file matching both. Zero, not 214, is the green.
    const entries = rankedShortlistEntries("decisions/ @2026-09", process.cwd());
    const paths = entries.map((e) => e.split("\t")[0]!);
    expect(paths.length).toBe(0);
  });

  // ─── The code shelf (BRF-CODE-SHELF) ──────────────────────────
  // A dir predicate scopes the tier: naming a directory asks for the
  // directory, not its md subset. Predicate-less queries stay
  // doc-scoped — code never floods the default corpus.

  test("src/ scopes Layer 0 to all files — code surfaces with hit-line evidence", () => {
    const entries = rankedShortlistEntries("src/ wrapWholeFile", process.cwd());
    const paths = entries.map((e) => e.split("\t")[0]!);
    expect(paths).toContain("src/cli.ts");
    expect(paths).toContain("src/render.ts");
    // the evidence is the MATCHING line, not line 1 — a code hit shows
    // the hit, the same contract the body channel always had.
    const cli = entries.find((e) => e.startsWith("src/cli.ts"))!;
    expect(cli).toContain("wrapWholeFile");
  });

  test("a predicate-less query stays doc-scoped — no src/ leakage", () => {
    const entries = rankedShortlistEntries("render", process.cwd());
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((e) => e.startsWith("src/"))).toBe(false);
  });

  test("doc tier queries are unchanged by the widening", () => {
    // briefs/ is all-md, so the widened corpus narrows to the same set
    // it always had — the load-bearing smoke path, asserted here.
    const entries = rankedShortlistEntries("briefs/ load bearing", process.cwd());
    const paths = entries.map((e) => e.split("\t")[0]!);
    expect(paths).toContain("briefs/2026-08-26-brief-tui-live-documents.md");
  });

  test("src/ alone lists the directory's files", () => {
    const entries = rankedShortlistEntries("src/", process.cwd());
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((e) => e.startsWith("src/"))).toBe(true);
    expect(entries.some((e) => e.startsWith("src/onion.ts"))).toBe(true);
  });
});