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
import { type ChannelHit, type OnionDeps, onionMerge, routeQuery } from "./onion";
import {
  detectRoot,
  makeCallsignResolver,
  makeCallsignValidator,
  isWithinRoot,
  makePathValidator,
  resolveByCallsign,
  siloRoot,
  TIER_REGISTRIES,
} from "./root";
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
  "type: search · dir/ and @2026-08 filter paths · !word excludes · enter: read · ctrl-w: word · esc: clear/done\n ";
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

/** rg over an explicit path list — the onion's channel edge
 *  (BRF-ONION-SEARCH-GRAMMAR): Layers 3 run over the Layer-1 survivors,
 *  never the raw corpus, so rg never searches an excluded path. The
 *  list is chunked: argv bounds stated, not discovered (the ~350-path
 *  corpus fits one argv; a 10× corpus re-states the bound — the
 *  brief's Layer-1 license). Empty list → no rg (rg with no path
 *  argument reads stdin — the guard is load-bearing). */
const RG_PATH_CHUNK = 256;
function rgOverPaths(args: string[], paths: string[], cwd: string): string[] {
  if (paths.length === 0) return [];
  const out: string[] = [];
  for (let i = 0; i < paths.length; i += RG_PATH_CHUNK) {
    out.push(...rgLines([...args, "--", ...paths.slice(i, i + RG_PATH_CHUNK)], cwd));
  }
  return out;
}


/** The body-channel rg pattern for a query. Single word → literal
 *  (`-F`, case-insensitive — the modern concordance style, BRF-
 *  CONCORDANCE-PREFILTER). Multi-word → phrase-tolerant regex: words
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

/** Layer 0 — the candidate set, materialised once per query: every
 *  later layer sees this list, never the raw disk. `rg --files --type
 *  md` (respects .gitignore uniformly — the include/exclude question
 *  is a .gitignore decision, not a per-codepath accident) minus
 *  EXCLUSIONS. Sorted ASCII-deterministic (LC_ALL=C equivalent) so the
 *  picker's `--tiebreak=index` keeps a canonical order. Pure-ish
 *  (reads fs). */
export function listMarkdownFiles(cwd: string = process.cwd()): string[] {
  return rgLines(["--files", "--type", "md", ...EXCLUSIONS], cwd).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/** All tracked files, no type gate (BRF-CODE-SHELF). The code-shelf
 *  corpus: same EXCLUSIONS, same .gitignore respect — only the type
 *  flag drops. A query that names a `dir/` predicate scopes to this;
 *  every other query stays on the md corpus, so the default corpus is
 *  never flooded with identifiers. Pure-ish (reads fs). */
export function listAllFiles(cwd: string = process.cwd()): string[] {
  return rgLines(["--files", ...EXCLUSIONS], cwd).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
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

/** The `-g` shortlist as picker entries (BRF-CONTENT-SHORTLIST, ranked
 *  sources; 2026-09-04 conformance amendment; ADR-030; rebuilt as the
 *  onion, BRF-ONION-SEARCH-GRAMMAR — four smoke-test defects, one root
 *  cause: the grammar, the channels, and the exclusion were one
 *  undifferentiated mass. Each entry is `path\tsnippet` so fzf matches
 *  content and filename in one query. The pipeline is staged
 *  (src/onion.ts): Layer 0 materialises the candidate set once;
 *  Layer 1 narrows it in memory (`@date` global scope, `dir/`
 *  clauses, `!path` kills); Layers 2-4 run the channels over the
 *  survivors only — rg never searches an excluded directory, and the
 *  grammar routes rather than parses. Channels: registry
 *  (`CALLSIGN — summary`), body (the matching line), filename
 *  remainder (path only). Feed order is the rank; fzf's
 *  `--tiebreak=index` ranks ties by input position and `--exact`
 *  stays the anti-soup AND. Pure-ish (rg at the edges only). */
export function rankedShortlistEntries(query: string, cwd: string = process.cwd()): string[] {
  // Layer 0 — the candidate set. Route FIRST, then choose the corpus
  // (BRF-CODE-SHELF): a query naming a positive dir/ predicate asks
  // for a directory, not its md subset — `src/ elide` searches source.
  // A predicate-less query stays doc-scoped, so `render` never drowns
  // in identifiers. Negations don't widen (exclusion kills, never
  // scopes) — the check is on positive dirs only. Route once here; the
  // same routed query feeds onionMerge below (no double parse).
  const routedEarly = routeQuery(query);
  const wantsShelf = routedEarly.clauses.some((c) => c.dirs.length > 0);
  const all = wantsShelf ? listAllFiles(cwd) : listMarkdownFiles(cwd);
  const rootFiles = all.filter((f) => !f.includes("/"));
  if (!query.trim().length) {
    // The shelf: root files with first-line previews as evidence.
    // Narrowed to the root files themselves — the onion's rule: no
    // channel sees more of the disk than it needs.
    const evidenceOf = new Map<string, string>();
    for (const line of rgOverPaths(["-n", "-m", "1", "--no-heading", ""], rootFiles, cwd)) {
      const i = line.indexOf(":");
      const j = i === -1 ? -1 : line.indexOf(":", i + 1);
      if (i === -1 || j === -1) continue;
      const path = line.slice(0, i);
      const text = line.slice(j + 1).trim();
      if (!evidenceOf.has(path)) evidenceOf.set(path, `${path}${SEP}${clipSnippet(text)}`);
    }
    return rootFiles.map((f) => evidenceOf.get(f) ?? `${f}${SEP}`);
  }
  // The dive — the onion. The deps are the rg edges; the routing,
  // narrowing, and ranking live in the pure layers. routedEarly is the
  // same parse Layer 0 chose the corpus on — one route, one truth.
  const routed = routedEarly;
  const deps: OnionDeps = {
    // Layer 2 — callsign-anchored registry rows (ADR-025), survivors only.
    registryHitsFor: (clauseQuery, survivors) => {
      const sv = new Set(survivors);
      const seen = new Set<string>();
      const hits: ChannelHit[] = [];
      for (const r of registryRows(clauseQuery, cwd)) {
        if (!sv.has(r.path) || seen.has(r.path)) continue;
        seen.add(r.path);
        hits.push({
          path: r.path,
          evidence: clipSnippet(r.summary ? `${r.callsign} — ${r.summary}` : r.callsign),
        });
      }
      return hits;
    },
    // Layer 3 — body matches over the survivors (explicit path list):
    // rg never searches an excluded directory (defect 2, by construction).
    bodyHitsFor: (clauseQuery, survivors) => {
      const { kind, pattern } = bodyPattern(clauseQuery);
      const args = ["-n", "-m", "1", "--no-heading"];
      if (kind === "fixed") args.push("-F", "-i", pattern);
      else args.push("-i", pattern);
      const seen = new Set<string>();
      const hits: ChannelHit[] = [];
      for (const line of rgOverPaths(args, survivors, cwd)) {
        const i = line.indexOf(":");
        const j = i === -1 ? -1 : line.indexOf(":", i + 1);
        if (i === -1 || j === -1) continue;
        const path = line.slice(0, i);
        if (seen.has(path)) continue;
        seen.add(path);
        hits.push({ path, evidence: clipSnippet(line.slice(j + 1).trim()) });
      }
      return hits;
    },
    // Exclude-by-result: survivors whose bodies mention the term. The
    // old double net (filename glob + content) is gone — two mechanisms,
    // two layers: `!dir/` for paths, `!word` for bodies (defect 3).
    contentMentions: (term, survivors) => rgOverPaths(["-l", "-i", "-F", term], survivors, cwd),
  };
  return onionMerge(all, routed, deps).map((hit) =>
    hit.evidence ? `${hit.path}${SEP}${hit.evidence}` : `${hit.path}${SEP}`,
  );
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

/** Layer-0 exclusions (the onion): generated registry views are build
 *  artifacts, not documents — `reg-sync` regenerates every `index.md`
 *  from the JSONL ("hand-edits are overwritten", by the silo's own
 *  constitution), and the JSONL indexes are stated non-corpus for
 *  honesty (`--type md` already filters them) — they power Layer 2 as
 *  data and must never surface as results. A documented constant, not
 *  a user knob; no later layer sees the raw filesystem, so the
 *  exclusion holds by construction, not by glob discipline. */
export const EXCLUSIONS = [
  "-g", "!**/index.md",
  "-g", "!**/INDEX.jsonl",
  "-g", "!**/REGISTRY.jsonl",
];

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
  // The silo root (ADR-048): the git toplevel, resolved ONCE — the
  // corpus, the badge, and every validator trust it, not the launch
  // cwd. A gloam from a subfolder behaves as the silo.
  const cwd = siloRoot();
  // Rooted gloam carries a silo badge the renderer paints at the head of
  // the footer identity run (brief: 2026-08-28-silo-mnemonics). Unrooted →
  // undefined → today's footer, no silo badge. Resolved once per session:
  // the root does not move while gloam is running.
  const root = detectRoot(cwd);
  // Callsign layer (td-bdfce0): rooted gloam resolves per-file callsigns
  // from the registries for the footer's identity run. The root is static
  // for the session, so the index loads once — the resolver closure hands
  // the TUI strings, never registry knowledge (ADR-020).
  const callsignFor = root ? makeCallsignResolver(cwd) : undefined;
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
      const files = rankedShortlistEntries(query, cwd);
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
        // Containment conjunct (BRF-ROOT-CONTAINMENT): existence is
        // not permission — an absolute or traversing target outside the
        // silo root falls through to the callsign registry, not the read.
        resolveTarget: (target: string): string | null => {
          if (existsSync(target) && isWithinRoot(target, cwd)) return target;
          return root ? resolveByCallsign(target, cwd) : null;
        },
        // The TUI's fence: the same silo root, handed down for
        // resolveJumpTarget's anchors (BRF-ROOT-CONTAINMENT).
        root: cwd,
        // The silcrow gate (ADR-044 + ADR-045's path substrate), built
        // per round: re-derivation replaces invalidation — a document
        // (or a code file) landed mid-session is validated on the next
        // pick, not remembered as absent.
        resolves: (t) =>
          makeCallsignValidator(cwd)(t) || makePathValidator(pick.file, cwd)(t),
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