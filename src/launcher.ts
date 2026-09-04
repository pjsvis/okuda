/**
 * launcher.ts — the browse → read → browse loop.
 *
 * When the binary is invoked as `gloam` (argv[0] basename) with no file
 * argument, it runs the picker itself instead of reading one document.
 * fzf is spawned with Gloam's verb-grammar binds (the picker is a guest
 * of the reader's key set); on selection, `runTui` reads the document;
 * on quit, the picker resumes with the query reseeded. On Esc, exit.
 * (briefs/2026-08-26-brief-gloam-launcher-promotion.md; ADR-016.)
 *
 * `-g <query>` (BRF-CONTENT-SHORTLIST) seeds the picker with the ranked
 * shortlist — registry field hits, body hits, filename remainder —
 * instead of the plain file list. rg is the source for both modes.
 *
 * fzf on our ship follows our rules; back in unix land it follows its
 * own. The binds are scoped to this invocation (`FZF_DEFAULT_OPTS=`
 * blanks inherited opts); no global mutation, no dotfile edit.
 */

import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import { detectRoot, makeCallsignResolver, TIER_REGISTRIES } from "./root";
import { runTui } from "./tui";
import { terminalCols, terminalRows } from "./width";

const FZF_BINDS = "ctrl-d:page-down,ctrl-u:page-up,esc:cancel";
const HEADER = "enter: read · ctrl-w: clear word · esc: clear/done";
const PROMPT = "gloam ❯ ";

/** The verb-grammar binds, exported for a contract test to pin against. */
export const GLOAM_FZF_BINDS = FZF_BINDS;

/** fzf must be on PATH (rg is gated separately — it is the source for
 *  both picker modes). */
function which(cmd: string): string | null {
  for (const dir of (process.env.PATH ?? "").split(":")) {
    if (!dir) continue;
    const p = join(dir, cmd);
    if (existsSync(p)) return p;
  }
  return null;
}

/** One rg invocation → stdout lines. Empty on no-match (rg exit 1) or
 *  any other nonzero exit — the launcher's channels are best-effort
 *  shortlists, and a channel that found nothing feeds an empty list,
 *  not a crash. Pure-ish (spawns rg, reads stdout). */
function rgLines(args: string[], cwd?: string): string[] {
  const out = Bun.spawnSync(["rg", ...args], { cwd, env: { ...process.env, LC_ALL: "C" } });
  if (out.exitCode !== 0) return [];
  const text = out.stdout.toString();
  return text ? text.split("\n").filter(Boolean) : [];
}

/** Escape a query for embedding in an rg regex (registry channel only;
 *  the body channel uses -F and needs no escaping). Pure. */
function escapeRegex(q: string): string {
  return q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** List markdown files: `rg --files --type md` (respects .gitignore
 *  uniformly — the include/exclude question is a .gitignore decision,
 *  not a per-codepath accident). Sorted ASCII-deterministic (LC_ALL=C
 *  equivalent) so the picker's `--tiebreak=index` keeps a canonical
 *  order. Pure-ish (reads fs). */
export function listMarkdownFiles(cwd: string = process.cwd()): string[] {
  return rgLines(["--files", "--type", "md"], cwd).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/** Registry field hits (channel 1, owner-only per ADR-025): rg the tier
 *  INDEX.jsonl files with a callsign-anchored pattern, parse each match
 *  as JSON, emit the owning document's path. The rg match is the
 *  prefilter; the JSON parse is the anchor — a line whose *summary*
 *  happens to match is discarded because only `callsign` was anchored.
 *  Unrooted cwd → no registries → empty channel (honest: no owner
 *  index, no channel-1 ranking). Pure-ish (reads fs). */
export function registryHits(query: string, cwd: string = process.cwd()): string[] {
  const hits: string[] = [];
  const pattern = `"callsign":"[^"]*${escapeRegex(query)}`;
  for (const [dir, file] of TIER_REGISTRIES) {
    const reg = join(dir, file);
    if (!existsSync(join(cwd, reg))) continue;
    for (const line of rgLines(["-i", "--no-filename", pattern, reg], cwd)) {
      try {
        const row = JSON.parse(line) as { file?: string };
        if (row.file) hits.push(join(dir, row.file));
      } catch {
        // A registry line that isn't JSON isn't ours — skip, don't crash.
      }
    }
  }
  return hits;
}

/** Dedupe ranked channels by path, preserving first occurrence (feed
 *  order = priority: a document that appears in several channels ranks
 *  at its highest). Pure; exported for the contract test. */
export function dedupeByPath(channels: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const channel of channels) {
    for (const f of channel) {
      if (!seen.has(f)) {
        seen.add(f);
        out.push(f);
      }
    }
  }
  return out;
}

/** The `-g` shortlist (BRF-CONTENT-SHORTLIST, ranked sources): registry
 *  field hits first, then body hits (`rg -l -F`), then the filename
 *  remainder — deduped by path. Prioritisation is feed order; fzf's
 *  `--tiebreak=index` (already pinned) makes ties rank by input
 *  position. The pipe is the ranker; there is no scorer. Pure-ish. */
export function rankedShortlist(query: string, cwd: string = process.cwd()): string[] {
  const registry = registryHits(query, cwd);
  const body = rgLines(["-l", "-F", query, "--type", "md"], cwd);
  const all = listMarkdownFiles(cwd);
  return dedupeByPath([registry, body, all]);
}

/** One picker round. Pipes `files` into fzf, returns the selection + the
 *  reseedable query; `null` on Esc/abort (exit the loop). */
export async function pickFile(
  files: string[],
  query: string,
): Promise<{ query: string; file: string } | null> {
  const input = files.join("\n") + "\n";
  const args = [
    "fzf",
    "--layout=reverse",
    "--no-mouse",
    "--exact",
    "--tiebreak=index",
    `--bind=${FZF_BINDS}`,
    `--prompt=${PROMPT}`,
    `--query=${query}`,
    "--print-query",
    `--header=${HEADER}`,
  ];
  const proc = Bun.spawn(args, {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "inherit",
    env: { ...process.env, FZF_DEFAULT_OPTS: "" },
  });
  proc.stdin.write(input);
  await proc.stdin.end();
  const exit = await proc.exited;
  if (exit !== 0) return null;
  const out = await new Response(proc.stdout).text();
  const lines = out.split("\n");
  const q = lines[0] ?? "";
  const file = lines.slice(1).join("\n").replace(/\n+$/, "");
  return { query: q, file };
}

/** The browse → read → browse loop. Caller gates: invoked as `gloam`,
 *  no file arg (or `-g <query>`), stdin is a TTY. fzf and rg absence are
 *  clean errors, never a stack trace (brief: graceful absence; rg is a
 *  hard dep alongside fzf — BRF-CONTENT-SHORTLIST source unification).
 *  `opts.grep` seeds the loop with the ranked content shortlist instead
 *  of the plain file list; loop shape, query reseed, and cursor behavior
 *  are identical in both modes. */
export async function runLauncher(opts: { grep?: string } = {}): Promise<void> {
  if (!which("rg")) {
    process.stderr.write("gloam: rg not found — see DEPENDENCIES.md\n");
    process.exit(1);
  }
  if (!which("fzf")) {
    process.stderr.write("gloam: fzf not found — see DEPENDENCIES.md\n");
    process.exit(1);
  }
  process.stdout.write("\x1b[?1007h"); // alt-scroll on, one policy both surfaces
  // Rooted gloam carries a silo badge the renderer paints at the head of
  // the footer identity run (brief: 2026-08-28-silo-mnemonics). Unrooted →
  // undefined → today's footer, no silo badge. Resolved once per session:
  // the root does not move while gloam is running.
  const root = detectRoot();
  // Callsign layer (td-bdfce0): rooted gloam resolves per-file callsigns
  // from the registries for the footer's identity run. The root is static
  // for the session, so the index loads once — the resolver closure hands
  // the TUI strings, never registry knowledge (ADR-020).
  const callsignFor = root ? makeCallsignResolver() : undefined;
  let query = "";
  try {
    for (;;) {
      // The shortlist is computed once per invocation (the query is the
      // refinement; re-running `gloam -g <more specific>` is the Unix
      // remedy — the brief declines interactive change:reload). Inside
      // the loop the picker reseeds within the computed list, same as
      // the filename path.
      const files = opts.grep !== undefined ? rankedShortlist(opts.grep) : listMarkdownFiles();
      const pick = await pickFile(files, query);
      if (pick === null) break; // Esc / Ctrl-C in the picker
      query = pick.query; // reseed next round
      if (!pick.file) break; // empty selection (Enter on empty list)
      await runTui({
        file: pick.file,
        width: terminalCols(80),
        rows: terminalRows(24),
        silo: root?.badge,
        callsignFor,
      });
    }
  } finally {
    // alt-scroll off — don't leave the user's terminal in a mode gloam
    // turned on. The reader's own alt-screen exit is paired in tui.ts.
    process.stdout.write("\x1b[?1007l");
  }
}

/** Is the binary invoked as `gloam`? (argv[0] basename — the entry-point
 *  contract from ADR-016.) Pure. */
export function invokedAsGloam(): boolean {
  return basename(process.argv0 ?? "") === "gloam";
}