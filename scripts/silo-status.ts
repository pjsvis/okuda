#!/usr/bin/env bun
// ── silo-status.ts — the loop's state, in the vocabulary a host reads ──
//  Herdr (the host) reports an agent's state from one line of OSC 7501:
//    printf '\e]7501;state=blocked:app=my-agent\e\\'
//  This emits the silo's, from the reading `scripts/orient.ts` derives, so a
//  fleet of spaces says which one is waiting on a person without any of them
//  being opened. The host owns the windowing; this is the byte stream the
//  windowing reads (AGENTS.md, the three concerns).
//
//  **What it refuses to say: `working`.** A dirty tree is evidence of an edit,
//  not of an agent at work, and a queue of unpushed commits is evidence of a
//  chore. The derivation can see no process, so it claims none. An agent that
//  is working emits its own line — it is the only observer that has the fact.
//  Three states are payable from the repository; the fourth is left to whoever
//  holds it. That refusal is the whole design, and it is table-tested.
//
//  The second refusal: `done` requires a *count* of reviews, never an unknown.
//  `td` unreadable is not "nothing awaiting review" — it is silence, and
//  silence reported as completion is exactly the failure ADR-027 names.
//
//  Usage:
//    bun scripts/silo-status.ts             # the OSC 7501 line, nothing else
//    bun scripts/silo-status.ts --text      # the reading, for a person
//    bun scripts/silo-status.ts --explain   # the wire, and the reading on stderr
//    bun scripts/silo-status.ts --json      # {state, because}
//    bun scripts/silo-status.ts --no-fetch  # no network
//
//  The wire is the default because the pipe is the caller: `silo-status | host`
//  must carry the sequence and nothing else, and a person has `just
//  silo-status` (`--text`), which is the reading without the escape.
import { spawnSync } from "node:child_process";
import { deriveOrient, ROOT, type OrientReport } from "./orient";

/** The states a repository can evidence. `working` is deliberately absent:
 *  see the header. */
export type SiloState = "blocked" | "done" | "idle";

export interface SiloReading {
  state: SiloState;
  /** One clause, naming the evidence. Not a sentence — it is read in a strip. */
  because: string;
}

export interface SiloSignals {
  report: OrientReport;
  /** Issues awaiting a review (td's `in_review.total`), or null when td could
   *  not be read — which is not the same number as zero. */
  inReview: number | null;
}

/** The mapping, pure: blocked outranks done outranks idle, and every branch of
 *  it names the field it read. */
export function siloState({ report, inReview }: SiloSignals): SiloReading {
  if (report.detached) return { state: "blocked", because: "detached HEAD — a branch must be chosen" };
  if (report.behind > 0) {
    const tr = report.upstream ?? "upstream";
    return { state: "blocked", because: `behind ${tr} by ${report.behind} — reconcile before building` };
  }
  if (inReview !== null && inReview > 0) {
    return { state: "blocked", because: `${inReview} issue(s) await a review` };
  }

  const chores: string[] = [];
  if (report.changed.count > 0) chores.push(`${report.changed.count} changed file(s)`);
  if (report.ahead > 0) chores.push(`${report.ahead} commit(s) unpushed`);
  if (report.upstream === null && !report.detached) chores.push("no upstream");
  if (report.binary.state !== "fresh") chores.push(`binary ${report.binary.state}`);
  if (inReview === null) chores.push("td unreadable — reviews unknown");

  if (chores.length === 0) return { state: "done", because: "clean, in sync, nothing awaiting a review" };
  return { state: "idle", because: chores.join(" · ") };
}

/** The wire line. `app=silo` names the emitter, so a host can tell this status
 *  from an agent's own; the terminator is ST (`ESC \`), which is what the
 *  protocol documents. No trailing newline: the sequence is the message. */
export function statusLine(state: SiloState): string {
  return `\x1b]7501;state=${state}:app=silo\x1b\\`;
}

/** `td`'s review count, or null when td is absent, silent, or answering
 *  something else. A gate that reads a tool's JSON must not treat a parse
 *  failure as a zero. */
export function reviewCount(root: string = ROOT): number | null {
  const r = spawnSync("td", ["status", "--json"], { cwd: root, encoding: "utf8" });
  if (r.status !== 0 || !r.stdout.trim()) return null;
  try {
    const total = (JSON.parse(r.stdout) as { in_review?: { total?: unknown } })?.in_review?.total;
    return typeof total === "number" ? total : null;
  } catch {
    return null;
  }
}

function main(argv: string[]): number {
  const asJson = argv.includes("--json");
  const asText = argv.includes("--text") || argv.includes("--explain");
  const explain = !argv.includes("--json") && !argv.includes("--text") && argv.includes("--explain");
  const fetch = !argv.includes("--no-fetch");

  const reading = siloState({ report: deriveOrient({ fetch }), inReview: reviewCount() });

  const reading_line = `${reading.state} — ${reading.because}\n`;
  if (asJson) process.stdout.write(JSON.stringify(reading) + "\n");
  else if (argv.includes("--text")) process.stdout.write(reading_line);
  else process.stdout.write(statusLine(reading.state));
  if (explain) process.stderr.write(reading_line);
  return 0;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
