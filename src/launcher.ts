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

/** The entry separator: `path\tsnippet`. fzf matches the whole line
 *  (path + snippet) so one query searches filenames AND content; the
 *  selection is parsed back to the path before the reader sees it.
 *  The reader's file-only contract is untouched — the snippet is
 *  picker-side evidence, never handed past pickFile (2026-09-04
 *  conformance amendment to BRF-CONTENT-SHORTLIST). */
const SEP = "\t";

/** Snippet budget (ADR-028: the wire is the budget). The snippet is
 *  evidence — enough to recognise why a file matched, never the
 *  document itself. Capped at source, not at the glass: deterministic
 *  across terminal widths, and the picker repaints the whole visible
 *  list per keystroke, so entry length is paint volume. Long entries
 *  also push the path off-screen when fzf hscrolls to a deep match —
 *  the path is the only actionable part; the snippet must never
 *  outrank it. */
const SNIPPET_MAX = 100;

function clipSnippet(s: string): string {
  const oneLine = s.replace(/[\t\n]/g, " ").trim();
  return oneLine.length > SNIPPET_MAX ? oneLine.slice(0, SNIPPET_MAX - 1) + "…" : oneLine;
}

const FZF_BINDS = "ctrl-d:page-down,ctrl-u:page-up,esc:cancel";
const HEADER = "enter: read · ctrl-w: clear word · esc: clear/done · -g <query>: content search";
const PROMPT = "gloam ❯ ";

/** The verb-grammar binds, exported for a contract test to pin against. */
export const GLOAM_FZF_BINDS = FZF_BINDS;

/** The environment we hand fzf: inherited, minus every `FZF_*` variable.
 *  We own the picker instance — its binds, its layout, its behavior are
 *  ours, passed as explicit args, never negotiated with shell rc files.
 *  Blanking FZF_DEFAULT_OPTS alone was a one-door fix in a hallway of
 *  doors: FZF_DEFAULT_OPTS merges binds/themes/geometry our args don't
 *  override, and other FZF_* vars (DEFAULT_COMMAND, TMUX opts, API_KEY)
 *  are future holes. Strip the namespace; the guest brings no furniture
 *  (ADR-016's guest principle, applied to env). Exported for the
 *  ownership contract test. */
export function fzfEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined && !k.startsWith("FZF_")) env[k] = v;
  }
  return env;
}

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

/** Escape a query for embedding in an rg regex (registry channel and
 *  the phrase-tolerant body pattern). Pure. */
function escapeRegex(q: string): string {
  return q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The body-channel rg pattern for a query. Single word → literal
 *  (`-F`, case-sensitive). Multi-word → phrase-tolerant regex: words
 *  joined by a bounded gap (`.{0,3}`, case-insensitive) so "load
 *  bearing" finds "load-bearing" — prose is written with hyphens and
 *  table pipes between the words, and a literal multi-word string
 *  matches none of it (found 2026-09-04: the operator's "load bearing"
 *  returned zero against a corpus full of "load-bearing"). Each word is
 *  regex-escaped; the bounded join is the only magic. Pure. */
export function bodyPattern(query: string): { kind: "fixed" | "regex"; pattern: string } {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return { kind: "fixed", pattern: words[0] ?? "" };
  return { kind: "regex", pattern: words.map(escapeRegex).join(".{0,3}") };
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
 *  as JSON, return the owning rows (path + callsign + summary). The rg
 *  match is the prefilter; the JSON parse is the anchor — a line whose
 *  *summary* happens to match is discarded because only `callsign` was
 *  anchored. Unrooted cwd → no registries → empty channel (honest: no
 *  owner index, no channel-1 ranking). Pure-ish (reads fs). */
export interface RegistryRow {
  path: string;
  callsign: string;
  summary: string;
}

export function registryRows(query: string, cwd: string = process.cwd()): RegistryRow[] {
  const rows: RegistryRow[] = [];
  const pattern = `"callsign":"[^"]*${escapeRegex(query)}`;
  for (const [dir, file] of TIER_REGISTRIES) {
    const reg = join(dir, file);
    if (!existsSync(join(cwd, reg))) continue;
    for (const line of rgLines(["-i", "--no-filename", pattern, reg], cwd)) {
      try {
        const row = JSON.parse(line) as { file?: string; callsign?: string; summary?: string };
        if (row.file) {
          rows.push({
            path: join(dir, row.file),
            callsign: row.callsign ?? "",
            summary: row.summary ?? "",
          });
        }
      } catch {
        // A registry line that isn't JSON isn't ours — skip, don't crash.
      }
    }
  }
  return rows;
}

/** Registry field hits as paths (the channel-1 view; the entries builder
 *  consumes registryRows for the snippet). */
export function registryHits(query: string, cwd: string = process.cwd()): string[] {
  return registryRows(query, cwd).map((r) => r.path);
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

/** Same dedupe for whole entries (`path\tsnippet`) — dedupe key is the
 *  path before the separator. Pure. */
function dedupeEntries(entries: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const channel of entries) {
    for (const e of channel) {
      const path = e.split(SEP)[0]!;
      if (!seen.has(path)) {
        seen.add(path);
        out.push(e);
      }
    }
  }
  return out;
}

/** The `-g` shortlist as picker entries (BRF-CONTENT-SHORTLIST, ranked
 *  sources; 2026-09-04 conformance amendment). Each entry is
 *  `path\tsnippet` so fzf matches content and filename in one query:
 *  - registry channel: snippet = `CALLSIGN — summary` (owner evidence)
 *  - body channel: snippet = the first matching line (`rg -n -F -m 1`)
 *  - filename remainder: path only (fzf matches it by name)
 *  Prioritisation is feed order; fzf's `--tiebreak=index` (already
 *  pinned) makes ties rank by input position. The pipe is the ranker.
 *  Pure-ish. */
export function rankedShortlistEntries(query: string, cwd: string = process.cwd()): string[] {
  // Channel 1 — registry field hits, callsign-anchored (ADR-025).
  const registry = registryRows(query, cwd).map((r) => {
    const snippet = clipSnippet(r.summary ? `${r.callsign} — ${r.summary}` : r.callsign);
    return `${r.path}${SEP}${snippet}`;
  });
  // Channel 2 — body hits with the matching line as evidence. The
  // pattern is phrase-tolerant (see bodyPattern): literal for one word,
  // bounded-gap join for multi-word, so prose hyphenation can't hide a
  // document. rg output is `path:line:text`; paths in this silo contain
  // no colons, so split on the first two.
  const body: string[] = [];
  const seenBody = new Set<string>();
  const { kind, pattern } = bodyPattern(query);
  const bodyArgs = kind === "fixed"
    ? ["-n", "-F", "-m", "1", "--no-heading", pattern, "--type", "md"]
    : ["-n", "-i", "-m", "1", "--no-heading", pattern, "--type", "md"];
  for (const line of rgLines(bodyArgs, cwd)) {
    const i = line.indexOf(":");
    const j = i === -1 ? -1 : line.indexOf(":", i + 1);
    if (i === -1 || j === -1) continue;
    const path = line.slice(0, i);
    const text = line.slice(j + 1).trim();
    if (!seenBody.has(path)) {
      seenBody.add(path);
      body.push(`${path}${SEP}${clipSnippet(text)}`);
    }
  }
  // Channel 3 — filename remainder, no snippet (fzf matches the path).
  const bodyPaths = new Set(body.map((e) => e.split(SEP)[0]));
  const remainder = listMarkdownFiles(cwd)
    .filter((f) => !bodyPaths.has(f) && !registry.some((e) => e.startsWith(f + SEP)))
    .map((f) => `${f}${SEP}`);
  return dedupeEntries([registry, body, remainder]);
}

/** One picker round. Pipes `files` into fzf, returns the selection + the
 *  reseedable query; `null` on Esc/abort (exit the loop). */
export async function pickFile(
  files: string[],
  query: string,
  prompt: string = PROMPT,
): Promise<{ query: string; file: string } | null> {
  const input = files.join("\n") + "\n";
  const args = [
    "fzf",
    "--layout=reverse",
    "--no-mouse",
    "--exact",
    "--tiebreak=index",
    "--delimiter=\t", // entries are `path\tsnippet`; match the whole line
    `--bind=${FZF_BINDS}`,
    `--prompt=${prompt}`,
    `--query=${query}`,
    "--print-query",
    `--header=${HEADER}`,
  ];
  const proc = Bun.spawn(args, {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "inherit",
    env: fzfEnv(), // owned instance — see fzfEnv, no FZF_* inheritance
  });
  proc.stdin.write(input);
  await proc.stdin.end();
  const exit = await proc.exited;
  if (exit !== 0) return null;
  const out = await new Response(proc.stdout).text();
  const lines = out.split("\n");
  const q = lines[0] ?? "";
  // Selection is `path\tsnippet` in -g mode, bare path in filename mode
  // — either way the path is everything before the first tab.
  const file = lines.slice(1).join("\n").replace(/\n+$/, "").split(SEP)[0]!;
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
  // The content query seeds the picker: entries carry `path\tsnippet`,
  // so the seeded query matches filenames AND body evidence in one AND.
  // Recomputed once per invocation (the query is the refinement;
  // re-running `gloam -g <more specific>` is the Unix remedy — the
  // brief declines interactive change:reload).
  let query = opts.grep ?? "";
  try {
    for (;;) {
      const files = opts.grep !== undefined ? rankedShortlistEntries(opts.grep) : listMarkdownFiles();
      const pick = await pickFile(files, query, opts.grep !== undefined ? "gloam -g ❯ " : PROMPT);
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