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
import { detectRoot, makeCallsignResolver, resolveByCallsign, TIER_REGISTRIES } from "./root";
import { runTui } from "./tui";
import { terminalCols, terminalRows } from "./width";

/** Alt-screen enter/exit (BRF-LAUNCHER-FUT, return-edge fix). The reader
 *  toggles its own alt-screen per document (own mode); on quit it exits to
 *  primary, which is where the return-edge FUT lived — the rg gap + fzf
 *  startup flashed the user's shell scrollback. The launcher now re-enters
 *  and clears the alt-screen at the top of each round, so the gap is a
 *  blank alt-screen (same content-of-frame philosophy as the reader's
 *  enter-before-read ordering fix). Local constants — tui.ts stays the
 *  alt-screen authority for `okuda <file>`; the launcher owns the session
 *  *transitions*, not the reader's surface. */
const ENTER_ALT_SCREEN = "\x1b[?1049h";
const EXIT_ALT_SCREEN = "\x1b[?1049l";

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
const SNIPPET_MAX = 240;

/** Evidence grammar: one line, single spaces, no table-cell pipe padding
 *  at the edges (the corpus is full of `| cell | cell |` rows whose
 *  padding is format, not signal). The budget is anti-pathological only,
 *  not the reveal mechanism — fzf truncates entries at the glass edge,
 *  so widening the screen reveals more of the line for free (operator,
 *  2026-09-04: "contents on the same line, expands as screen is
 *  widened"). Pure. */
function clipSnippet(s: string): string {
  const oneLine = s.replace(/[\t\n]/g, " ").replace(/\s+/g, " ").trim();
  const bare = oneLine.replace(/^[|\s]+/, "").replace(/\s*\|$/, "").trim();
  const t = bare.length > 0 ? bare : oneLine;
  return t.length > SNIPPET_MAX ? t.slice(0, SNIPPET_MAX - 1) + "…" : t;
}

// esc:clear-query — ESC never exits the picker (keyboard-controls:
// "ESC stops short of exiting the app"); leaving is Ctrl-C or 00 in the
// document. The old esc:cancel made a double-ESC exit the game.
const FZF_BINDS = "ctrl-d:page-down,ctrl-u:page-up,esc:clear-query";
const HEADER =
  "type: search everything · enter: read · ctrl-w: clear word · esc: clear/done\n ";
  // The trailing space-line is the breath after the help text — fzf
  // renders header rows literally, and an explicitly non-empty line
  // guarantees the gap on every glass (a bare "\n\n" can collapse).
const PROMPT = "gloam ❯ ";

/** The verb-grammar binds, exported for a contract test to pin against. */
export const GLOAM_FZF_BINDS = FZF_BINDS;

/** The live-search bind (ADR-030): every keystroke recomputes the entry
 *  stream via this same binary's `--entries` printer. Exported for the
 *  contract test; the <self> placeholder is substituted at spawn time. */
export const LIVE_RELOAD_BIND_TEMPLATE = "change:reload(<self> --entries {q})";

/** The command fzf's `change:reload` runs to recompute the entry stream
 *  for the current query — this same binary, `--entries {q}`. Dev runs
 *  (`bun run src/cli.ts`) re-exec through bun; the compiled binary
 *  re-execs itself. The seam is pinned by the entry-path tests because
 *  it is exactly where a smoke-vs-operator divergence hid before. */
export function selfEntriesCmd(): string {
  const exe = process.execPath;
  if (exe.endsWith("/bun")) {
    const script = process.argv[1] ?? "";
    return `bun run "${script}"`;
  }
  return `"${exe}"`;
}

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
  return rgLines(["--files", "--type", "md", ...CORPUS_EXCLUSIONS], cwd).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
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
 *  sources; 2026-09-04 conformance amendment; ADR-030). Each entry is
 *  `path\tsnippet` so fzf matches content and filename in one query:
 *  - orientation channel: silo-root markdown (the &files) float first,
 *    carrying their evidence when they have any
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
  const bodyArgs = ["-n", "-m", "1", "--no-heading", ...CORPUS_EXCLUSIONS];
  if (kind === "fixed") bodyArgs.push("-F", pattern);
  else bodyArgs.push("-i", pattern);
  bodyArgs.push("--type", "md");
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
  // The shelf and the dive (the filter model's state rule, landed
  // 2026-09-04). No text → the SHELF: root files only — arrive, see the
  // silo's top level; the &-family and the root content documents are
  // the whole floor. Text → the DIVE: corpus search results, root files
  // excluded entirely — you have expressed intent, the shelf steps
  // aside, and the documents it announced take the floor. Arrive and
  // know what you want: type it. Do not know: read the root, which
  // links everywhere.
  const searching = query.trim().length > 0;
  const all = listMarkdownFiles(cwd);
  const rootFiles = all.filter((f) => !f.includes("/"));
  const isRoot = new Set(rootFiles);
  const evidenceOf = new Map<string, string>();
  for (const e of [...registry, ...body]) {
    const p = e.split(SEP)[0]!;
    if (!evidenceOf.has(p)) evidenceOf.set(p, e);
  }
  if (!searching) {
    // The shelf: every root file, first-line preview as evidence.
    return dedupeEntries([rootFiles.map((f) => evidenceOf.get(f) ?? `${f}${SEP}`)]);
  }
  // The dive: corpus results; root files are not destinations here.
  const inCorpus = (e: string): boolean => !isRoot.has(e.split(SEP)[0]!);
  const registryRest = registry.filter(inCorpus);
  const bodyRest = body.filter(inCorpus);
  const remainder = all
    .filter((f) => !isRoot.has(f) && !evidenceOf.has(f))
    .map((f) => `${f}${SEP}`);
  return dedupeEntries([registryRest, bodyRest, remainder]);
}

/** The fzf argv that never changes: the picker instance's fixed spine.
 *  Exported for the contract test. --no-hscroll is comprehension, not
 *  cosmetics: with hscroll, fzf slides the line left to center the
 *  match — which lives in the evidence, mid-line — and clips the path's
 *  beginning ("··.md"). The path is the only actionable part; it must
 *  never move. Right-edge truncation keeps every row readable and gives
 *  the widening-reveal for free (ADR-030 layout). */
export const FZF_FIXED_ARGS = [
  "--layout=reverse",
  "--no-mouse",
  "--no-hscroll",
  "--exact",
  "--tiebreak=index",
  "--delimiter=\t", // entries are `path\tsnippet`; match the whole line
];

/** Corpus exclusions: generated registry views are build artifacts, not
 *  documents — `reg-sync` regenerates every `index.md` from the JSONL
 *  ("hand-edits are overwritten", by the silo's own constitution). They
 *  crowd the search results with tables nobody searches for; the picker
 *  itself is the better index. Applied to every corpus rg call. */
export const CORPUS_EXCLUSIONS = ["-g", "!**/index.md"];

/** Match highlighting: the query's matched substrings render in the
 *  okuda palette's strong amber (#dfa21a — the reader's own `strong`,
 *  LCARS identity), bold + underlined, so the visual link between what
 *  you typed and why the row matched is legible at a glance — the same
 *  courtesy the host's Cmd+F extends to rendered text. Skipped under
 *  NO_COLOR: fzf falls back to its bw scheme and we don't fight it. */
export const FZF_HL_ARG =
  "--color=hl:#dfa21a:bold:underline,hl+:#dfa21a:bold:underline,selected-hl:#dfa21a:bold:underline";

/** One picker round. Pipes `files` into fzf, returns the selection + the
 *  reseedable query; `null` on Esc/abort (exit the loop). `live` adds
 *  the change:reload bind (ADR-030) — every keystroke recomputes the
 *  entry stream via this binary's `--entries` printer. */
export async function pickFile(
  files: string[],
  query: string,
  live: boolean,
): Promise<{ query: string; file: string } | null> {
  const input = files.join("\n") + "\n";
  const args = [
    "fzf",
    ...FZF_FIXED_ARGS,
    ...(process.env.NO_COLOR ? [] : [FZF_HL_ARG]),
    `--bind=${FZF_BINDS}`,
    `--prompt=${PROMPT}`,
    `--query=${query}`,
    "--print-query",
    `--header=${HEADER}`,
  ];
  if (live) args.push(`--bind=change:reload(${selfEntriesCmd()} --entries {q})`);
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
  // Selection is `path\tsnippet` in -g mode (path may be padded for
  // column alignment — trim it), bare path in filename mode — either
  // way the path is everything before the first tab.
  const file = lines.slice(1).join("\n").replace(/\n+$/, "").split(SEP)[0]!.trimEnd();
  return { query: q, file };
}

/** The browse → read → browse loop. Caller gates: invoked as `gloam`,
 *  TTY stdin (see ADR-030 for the arg dispatch). fzf and rg absence are
 *  clean errors, never a stack trace. `opts.query` seeds the search —
 *  plain `gloam` starts empty. Every mode is live (ADR-030): the picker
 *  recomputes the entry stream per keystroke via change:reload, and the
 *  loop recomputes the seed rows per round for the reseeded query. */
export async function runLauncher(opts: { query?: string } = {}): Promise<void> {
  if (!which("rg")) {
    process.stderr.write("gloam: rg not found — see DEPENDENCIES.md\n");
    process.exit(1);
  }
  if (!which("fzf")) {
    process.stderr.write("gloam: fzf not found — see DEPENDENCIES.md\n");
    process.exit(1);
  }
  process.stdout.write("\x1b[?1007h"); // alt-scroll on, one policy both surfaces
  // Enter + blank the session alt-screen up front so the FIRST round's
  // rg gap (rankedShortlistEntries) is a blank surface, not shell scrollback
  // — the launch-edge half of the same fix (BRF-LAUNCHER-FUT).
  process.stdout.write(ENTER_ALT_SCREEN + "\x1b[2J\x1b[H");
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
  // Live search (ADR-030): the seed rows are the ranked merge for the
  // current query; while the picker is open, change:reload recomputes
  // them per keystroke via this binary's --entries printer. Per round,
  // the rows are recomputed for the reseeded query — read a document,
  // Esc back, and the picker already matches what you last searched.
  let query = opts.query ?? "";
  try {
    for (;;) {
      // Return-edge FUT fix (BRF-LAUNCHER-FUT): the reader exited the
      // alt-screen on quit (?1049l → primary), so without this the rg
      // gap + fzf startup would flash the primary screen. Re-enter and
      // clear BEFORE the rg spawns — the gap reads as a blank alt-screen
      // ("loading"), not shell scrollback. Mirrors the reader's own-mode
      // enter-before-read ordering fix in tui.ts; fzf's own ?1049h on
      // spawn is idempotent against this. Alt-scroll re-armed per round
      // because the reader released it on exit.
      process.stdout.write(ENTER_ALT_SCREEN + "\x1b[2J\x1b[H" + "\x1b[?1007h");
      const files = rankedShortlistEntries(query);
      const pick = await pickFile(files, query, true);
      if (pick === null) break; // Esc / Ctrl-C in the picker
      query = pick.query; // reseed next round
      if (!pick.file) break; // empty selection (Enter on empty list)
      await runTui({
        file: pick.file,
        width: terminalCols(80),
        rows: terminalRows(24),
        silo: root?.badge,
        callsignFor,
        resolveTarget: (target: string): string | null => {
          if (existsSync(target)) return target;
          return root ? resolveByCallsign(target) : null;
        },
      });
    }
  } finally {
    // alt-scroll off, then exit the session alt-screen the launcher armed.
    // Don't leave the user's terminal in a mode gloam turned on. (The old
    // comment here — "the reader's own alt-screen exit is paired in tui.ts"
    // — described the return-edge FUT, now fixed by re-entering + clearing
    // each round.)
    process.stdout.write("\x1b[?1007l" + EXIT_ALT_SCREEN);
  }
}

/** Is the binary invoked as `gloam`? (argv[0] basename — the entry-point
 *  contract from ADR-016.) Pure. */
export function invokedAsGloam(): boolean {
  return basename(process.argv0 ?? "") === "gloam";
}