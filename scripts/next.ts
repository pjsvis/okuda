#!/usr/bin/env bun
// ── next.ts — the ready queue, derived from the honest view (BRF-FIRST-CONTACT)
//  A fresh session's first instrument is the board, and `td usage --new-session`
//  served a deferred P1 under READY TO START: the deferral lived in the task's
//  log, and the prose view did not know about it. The machine view is already
//  honest — `td list --json` omits deferred rows (td 0.69.0) — so this is a
//  derived reading over that view, not a second store (the store is td's; the
//  grouping is ours, ADR-DERIVED-AMP-TABLE-058).
//
//  What the queue is for: *a* next task is not *the* next task. Twenty-odd P2s
//  with a priority field are a backlog, and the shape — how many at each
//  priority, what is already claimed, how many rows the view is not showing —
//  is the decision a fresh context actually has to make.
//
//  Usage:
//    bun scripts/next.ts            # text
//    bun scripts/next.ts --json     # the same reading, as one object
//  Read-only by contract: it runs td, prints, and writes nothing.
import { spawnSync } from "node:child_process";
import { join } from "node:path";

export const ROOT = join(import.meta.dir, "..");

/** The fields this view uses. td's rows carry more; a view that needed them
 *  would be re-deriving td rather than reading it. */
export interface Task {
  id: string;
  title: string;
  status: string;
  /** td reports `"P2"`; the numeric form is what sorts and what the counts key on. */
  priority: string | number;
  type?: string;
}

/** `"P2"` → 2. A priority the board cannot state sorts last rather than first:
 *  an unreadable field must not silently outrank a P1. */
export function priorityOf(t: Task): number {
  const n = typeof t.priority === "number" ? t.priority : Number(String(t.priority).replace(/^P/i, ""));
  return Number.isFinite(n) ? n : 99;
}

export interface Queue {
  /** Claimed by a live session — the first thing a resuming context needs. */
  inProgress: Task[];
  /** Startable now, by priority then id. */
  ready: Task[];
  /** Ready rows per priority, including zeroes present in the data. */
  counts: Record<number, number>;
  /** Open rows the default view did not show — deferred, per `td list --all`.
   *  `null` when that second question could not be asked: an unmeasured zero
   *  would be a claim, and this file prints readings, not claims. */
  hidden: number | null;
}

/** Group the board. Pure — the tests assert this, the gate reads td. */
export function shape(tasks: Task[], allOpen: number | null): Queue {
  const byPriority = (a: Task, b: Task): number => priorityOf(a) - priorityOf(b) || a.id.localeCompare(b.id);
  const live = tasks.filter((t) => t.status !== "closed");
  const inProgress = live.filter((t) => t.status === "in_progress").sort(byPriority);
  const ready = live.filter((t) => t.status !== "in_progress").sort(byPriority);
  const counts: Record<number, number> = {};
  for (const t of ready) counts[priorityOf(t)] = (counts[priorityOf(t)] ?? 0) + 1;
  // `allOpen` is the same question asked of `td list --all`: the difference is
  // what the deferred mechanism is holding back, and it is a reading, not a
  // fault — a queue that hides its depth is the ventilator, not the plot.
  const hidden = allOpen === null ? null : Math.max(0, allOpen - live.length);
  return { inProgress, ready, counts, hidden };
}

function td(args: string[]): string | null {
  const out = spawnSync("td", args, { cwd: ROOT, encoding: "utf8" });
  if (out.error || out.status !== 0) return null;
  return out.stdout;
}

function main(): void {
  const json = process.argv.includes("--json");
  // `--limit 0` is not optional: td caps a list at 50 rows and says so on
  // stdout, so an uncapped read is an instrument that reports a ceiling as a
  // fact — and one that would poison the JSON parse.
  const list = td(["list", "--limit", "0", "--json"]);
  if (list === null) {
    // a missing instrument is not a verdict: say so, do not print an empty queue
    console.error("next: td is not answering — no board to read (install td, or run `td usage --new-session` yourself)");
    process.exit(2);
  }
  let tasks: Task[];
  try {
    tasks = JSON.parse(list) as Task[];
  } catch {
    console.error("next: td answered with something that is not JSON — the board is unreadable (exit 2, not a verdict)");
    process.exit(2);
  }
  // The second question, for the depth reading only. If it fails, the queue is
  // still the queue; a hidden count of 0 would be a claim we did not measure.
  const allRaw = td(["list", "--all", "--limit", "0", "--json"]);
  const allOpen = allRaw === null ? null : (JSON.parse(allRaw) as Task[]).filter((t) => t.status !== "closed").length;

  const q = shape(tasks, allOpen);
  const total = q.ready.length + q.inProgress.length;

  if (json) {
    console.log(JSON.stringify({ ...q, total }, null, 2));
    return;
  }

  const prios = Object.keys(q.counts).map(Number).sort((a, b) => a - b);
  const depth = prios.map((p) => `${q.counts[p]} P${p}`).join(" · ") || "nothing startable";
  console.log(
    `next — ${total} open: ${depth}` + (q.hidden === null ? "" : `  (${q.hidden} deferred, not shown — \`td list --all\`)`),
  );

  if (q.inProgress.length > 0) {
    console.log("in progress:");
    for (const t of q.inProgress) console.log(`  ${t.id}  P${priorityOf(t)}  ${t.title}`);
  }

  if (q.ready.length === 0) {
    console.log("nothing ready — the queue is empty, which is a reading, not a fault");
    return;
  }
  console.log("ready:");
  for (const t of q.ready) console.log(`  ${t.id}  P${priorityOf(t)}  ${t.title}`);
}

if (import.meta.main) main();
