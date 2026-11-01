#!/usr/bin/env bun
// ── orient.ts — the vitals, derived once (BRF-SILO-STATUS) ─────────────
//  `scripts/orient.sh` answered one question in one format: "are both
//  machines looking at the same thing?" — text for a human's eye. A host that
//  renders the same reading (Herdr's sidebar, a status line, a pipe) needs it
//  as data, and the house rule is one derivation with several renders, never
//  a second derivation in another language: two implementations of one fact is
//  the drift hazard with a build step (AGENTS.md v1.1.0 against system.md
//  v1.4.0 is the recorded instance).
//
//  So the reading moved here, unchanged, and the shell kept its address:
//  `bash scripts/orient.sh` now delegates (the shim), and `just orient` is the
//  same seven lines it has always printed. `--json` is the second render.
//
//  What it reports is the four ways the protocol fails silently
//  (ADR-DOCS-DIRECT-060): drift, a dirty tree, a stale binary, a corpus whose
//  registries went missing. Read-only by contract: no writes, no builds.
//
//  Usage:
//    bun scripts/orient.ts              # text — the frame `just orient` shows
//    bun scripts/orient.ts --json       # the same reading, as one object
//    bun scripts/orient.ts --no-fetch   # no network; the local view, said so
import { spawnSync } from "node:child_process";
import { accessSync, constants, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** The silo root: this script's parent directory. */
export const ROOT = join(import.meta.dir, "..");

/** How the fetch ended. `skipped` is a mode, not a failure: `--no-fetch` is
 *  the caller saying "do not ask the network", and a report that called that
 *  offline would be blaming the mode for a failure it did not have. */
export type FetchOutcome = "ok" | "failed" | "skipped";

/** The stamp the binary carries, or the reason there is none. */
export type BinaryState = "fresh" | "stale" | "unstamped" | "absent";

export interface OrientReport {
  /** The current branch, or the short sha when detached. */
  branch: string;
  detached: boolean;
  /** The tracking ref (`origin/main`), or null when the branch has none. */
  upstream: string | null;
  fetch: FetchOutcome;
  /** Commits ahead of / behind the tracking ref; 0 when there is none. */
  ahead: number;
  behind: number;
  changed: { count: number; lines: string[] };
  /** `git log -1 --oneline`: the sha *and* the subject, as one line. */
  head: { sha: string; line: string };
  binary: { state: BinaryState; stamp: string | null; head: string };
  docs: { briefs: number; decisions: number; debriefs: number; playbooks: number };
}

/** Run git in the silo and hand back its exit code and stdout. Never throws:
 *  a missing repo is a reading (`branch: (no git)`), not a stack trace. */
function git(args: string[], root: string): { code: number; out: string } {
  const r = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  return { code: r.status ?? 1, out: (r.stdout ?? "").replace(/\n+$/, "") };
}

/** The shell's `-x` test: present *and* runnable. A present binary without the
 *  bit is not a stale binary, it is no binary — the reading `absent` names. */
function executable(path: string): boolean {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/** Non-empty lines in a registry file; 0 when the file is absent. `grep -c .`
 *  semantics, which is what the shell counted before the port. */
function countRows(path: string): number {
  if (!existsSync(path)) return 0;
  return readFileSync(path, "utf8").split("\n").filter((l) => l.trim() !== "").length;
}

/** The derivation. Every field is observed; nothing here is inferred from a
 *  field that is not in the report. */
export function deriveOrient(options: { root?: string; fetch?: boolean } = {}): OrientReport {
  const root = options.root ?? ROOT;
  const fetch = options.fetch !== false;

  // 1. fetch, then branch sync. Quiet and non-fatal: offline means the report
  //    is a local view, and saying so beats pretending the network answered.
  let fetchOutcome: FetchOutcome = "skipped";
  if (fetch) fetchOutcome = git(["fetch", "--quiet"], root).code === 0 ? "ok" : "failed";

  const current = git(["branch", "--show-current"], root).out.trim();
  const detached = current === "";
  const branch = detached ? `${git(["rev-parse", "--short", "HEAD"], root).out.trim()} (detached)` : current;

  // Tracking ref: the configured upstream, else origin/<branch> when it exists.
  // A push without -u sets no upstream, and a pushed branch must not read as
  // unpushed: the report does not cry wolf.
  const declared = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"], root).out.trim();
  let upstream: string | null = declared === "" ? null : declared;
  if (!upstream && !detached && git(["rev-parse", "--verify", "--quiet", `origin/${branch}`], root).code === 0) {
    upstream = `origin/${branch}`;
  }

  let ahead = 0;
  let behind = 0;
  if (upstream) {
    const counts = git(["rev-list", "--left-right", "--count", `${upstream}...HEAD`], root).out.trim();
    const [b, a] = counts.split(/\s+/);
    behind = Number.parseInt(b ?? "0", 10) || 0;
    ahead = Number.parseInt(a ?? "0", 10) || 0;
  }

  // 2. tree state — clean-tree is the build precondition.
  const statusLines = git(["status", "--short"], root).out.split("\n").filter((l) => l !== "");

  // 3. binary stamp vs HEAD. fresh.sh is the gate; this is the glance.
  const headSha = git(["rev-parse", "--short=7", "HEAD"], root).out.trim();
  const binPath = join(root, "okuda");
  let binary: OrientReport["binary"] = { state: "absent", stamp: null, head: headSha };
  if (executable(binPath)) {
    const version = spawnSync(binPath, ["--version"], { encoding: "utf8" });
    const stamp = (version.stdout ?? "").match(/\(([0-9a-f]{7,})\)/)?.[1] ?? null;
    const state: BinaryState = stamp === null ? "unstamped" : stamp === headSha ? "fresh" : "stale";
    binary = { state, stamp, head: headSha };
  }

  // 4. corpus counts — registry presence at a glance.
  const docs = {
    briefs: countRows(join(root, "briefs/INDEX.jsonl")),
    decisions: countRows(join(root, "decisions/INDEX.jsonl")),
    debriefs: countRows(join(root, "debriefs/INDEX.jsonl")),
    playbooks: countRows(join(root, "playbooks/REGISTRY.jsonl")),
  };

  return {
    branch,
    detached,
    upstream,
    fetch: fetchOutcome,
    ahead,
    behind,
    changed: { count: statusLines.length, lines: statusLines },
    head: { sha: headSha, line: git(["log", "-1", "--oneline"], root).out.trim() },
    binary,
    docs,
  };
}

/** The tracking ref as the shell printed it: `origin/` is the wire, not the
 *  name a reader needs. */
function trackName(upstream: string): string {
  return upstream.replace(/^origin\//, "");
}

/** The text render — byte-compatible with `scripts/orient.sh` before the port,
 *  because `just orient` is a habit and a frame whose columns shift is a frame
 *  retrained. Pure: everything it shows is in the report. */
export function renderOrientText(r: OrientReport): string {
  const out: string[] = [];

  let sync: string;
  if (r.upstream) {
    if (r.behind === 0 && r.ahead === 0) sync = ` — in sync with ${trackName(r.upstream)}`;
    else {
      sync = ` — ahead ${r.ahead}, behind ${r.behind} vs ${trackName(r.upstream)}`;
      if (r.behind > 0) sync += "  ← PULL FIRST";
      if (r.ahead > 0) sync += "  ← UNPUSHED";
    }
  } else {
    sync = " — no upstream  ← UNPUSHED BRANCH";
  }
  const fetched = r.fetch === "failed" ? "  (fetch failed — offline? local view only)" : "";
  out.push(`branch:  ${r.branch}${sync}${fetched}`);

  out.push(`status:  ${r.changed.count} changed file(s)`);
  for (const line of r.changed.lines) out.push(line);
  out.push(`last:    ${r.head.line}`);

  const b = r.binary;
  if (b.state === "fresh") out.push(`binary:  fresh (${b.stamp} = HEAD)`);
  else if (b.state === "unstamped") out.push("binary:  unstamped (dev build) — just build");
  else if (b.state === "absent") out.push("binary:  absent — just build");
  else out.push(`binary:  STALE (${b.stamp} ≠ ${b.head}) — just build`);

  out.push(
    `docs:    ${r.docs.briefs} briefs, ${r.docs.decisions} decisions, ${r.docs.debriefs} debriefs, ${r.docs.playbooks} playbooks`,
  );

  return out.join("\n") + "\n";
}

function main(argv: string[]): number {
  const json = argv.includes("--json");
  const fetch = !argv.includes("--no-fetch");
  const report = deriveOrient({ fetch });
  if (json) process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  else process.stdout.write(renderOrientText(report));
  return 0;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
