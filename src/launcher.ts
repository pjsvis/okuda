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
 * fzf on our ship follows our rules; back in unix land it follows its
 * own. The binds are scoped to this invocation (`FZF_DEFAULT_OPTS=`
 * blanks inherited opts); no global mutation, no dotfile edit.
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { detectRoot } from "./root";
import { runTui } from "./tui";
import { terminalCols, terminalRows } from "./width";

const FZF_BINDS = "ctrl-d:page-down,ctrl-u:page-up,esc:cancel";
const HEADER = "enter: read · ctrl-w: clear word · esc: clear/done";
const PROMPT = "gloam ❯ ";

/** The verb-grammar binds, exported for a contract test to pin against. */
export const GLOAM_FZF_BINDS = FZF_BINDS;

/** fzf must be on PATH; fd is preferred but has an in-process fallback. */
function which(cmd: string): string | null {
  for (const dir of (process.env.PATH ?? "").split(":")) {
    if (!dir) continue;
    const p = join(dir, cmd);
    if (existsSync(p)) return p;
  }
  return null;
}

/** List markdown files: `fd -e md` if available (respects .gitignore),
 *  else an in-process recursive walk (the fallback the brief names).
 *  Sorted ASCII-deterministic (LC_ALL=C equivalent) so the picker's
 *  `--tiebreak=index` keeps a canonical order. Pure-ish (reads fs). */
export function listMarkdownFiles(cwd: string = process.cwd()): string[] {
  if (which("fd")) {
    const out = Bun.spawnSync(["fd", "-e", "md"], { cwd, env: { ...process.env, LC_ALL: "C" } });
    const text = out.stdout.toString();
    return text ? text.split("\n").filter(Boolean) : [];
  }
  return walkMarkdown(cwd).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function walkMarkdown(dir: string, acc: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    if (name === ".git" || name.startsWith(".")) continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walkMarkdown(p, acc);
    else if (name.endsWith(".md")) acc.push(p);
  }
  return acc;
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
 *  no file arg, stdin is a TTY. fzf absence is a clean error, never a
 *  stack trace (brief: graceful absence). */
export async function runLauncher(): Promise<void> {
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
  let query = "";
  try {
    for (;;) {
      const files = listMarkdownFiles();
      const pick = await pickFile(files, query);
      if (pick === null) break; // Esc / Ctrl-C in the picker
      query = pick.query; // reseed next round
      if (!pick.file) break; // empty selection (Enter on empty list)
      await runTui({
        file: pick.file,
        width: terminalCols(80),
        rows: terminalRows(24),
        silo: root?.badge,
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