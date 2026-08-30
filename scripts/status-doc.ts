#!/usr/bin/env bun
/**
 * status-doc.ts — the island compositor.
 *
 * Assembles NOW.md: computed state (git, registries, td) plus the
 * hand-written stance from STANCE.md. Ephemeral by design — stale on
 * creation, regenerated on demand (`just island`), never registered,
 * never a brief. When a stance survives a few landings, promote it to a
 * dated docs/ essay and commit that instead.
 * (Phase zero of index-and-jump: the first generated-markdown compositor.)
 *
 * Usage:
 *   bun scripts/status-doc.ts    # markdown to stdout
 *   just island                  # regenerate NOW.md + frame it
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd: string): string {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function countLines(path: string): number {
  try {
    return readFileSync(join(ROOT, path), "utf8")
      .split("\n")
      .filter((l) => l.trim().length > 0).length;
  } catch {
    return 0;
  }
}

export interface IslandIssue {
  id: string;
  title: string;
  status: string;
  priority: string;
}

export interface IslandState {
  generated: string;
  branch: string;
  dirty: number;
  last: string;
  counts: { briefs: number; decisions: number; debriefs: number; playbooks: number };
  issues: IslandIssue[];
}

const PRIORITY_ORDER: Record<string, number> = { P1: 0, P2: 1, P3: 2, P4: 3 };

export const NO_STANCE = [
  "> No stance written. Put three lines in `STANCE.md`: the next move, the",
  "> one after, the gate to watch. Promote survivors to a dated `docs/` essay.",
].join("\n");

function collect(): IslandState {
  const dirty = run("git status --porcelain").length
    ? run("git status --porcelain").split("\n").filter(Boolean).length
    : 0;
  let issues: IslandIssue[] = [];
  try {
    issues = JSON.parse(run("td list --json")) as IslandIssue[];
  } catch {
    // td absent or failed — the island still renders, minus the board
  }
  return {
    generated: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
    branch: run("git branch --show-current") || "detached",
    dirty,
    last: run("git log -1 --oneline") || "no commits",
    counts: {
      briefs: countLines("briefs/INDEX.jsonl"),
      decisions: countLines("decisions/INDEX.jsonl"),
      debriefs: countLines("debriefs/INDEX.jsonl"),
      playbooks: countLines("playbooks/REGISTRY.jsonl"),
    },
    issues,
  };
}

/** Pure: state + stance → the island markdown. Exported for the test. */
export function composeDoc(s: IslandState, stance: string): string {
  const board = [...s.issues]
    .filter((i) => i.status === "in_progress" || i.status === "open")
    .sort(
      (a, b) =>
        (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9) ||
        a.status.localeCompare(b.status) ||
        a.id.localeCompare(b.id),
    )
    .map(
      (i) =>
        `- \`${i.priority}\` \`${i.id}\` — ${i.title} *(${i.status.replace("_", " ")})*`,
    )
    .join("\n");

  return [
    "# NOW — the island in the stream",
    "",
    `> Generated ${s.generated} by \`scripts/status-doc.ts\`. Ephemeral: stale on`,
    "> creation. Regenerate with `just island`. Never registered, never a brief.",
    "",
    "## Where we are",
    "",
    `- branch \`${s.branch}\` · ${s.dirty} dirty · last \`${s.last}\``,
    `- knowledge system: ${s.counts.briefs} briefs · ${s.counts.decisions} decisions · ${s.counts.debriefs} debriefs · ${s.counts.playbooks} playbooks`,
    "",
    "### The board",
    "",
    board || "- nothing open — the stream is clear",
    "",
    "## Where we're going",
    "",
    stance.trim() || NO_STANCE,
    "",
  ].join("\n");
}

function stanceText(): string {
  const p = join(ROOT, "STANCE.md");
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

if (import.meta.main) {
  console.log(composeDoc(collect(), stanceText()));
}
