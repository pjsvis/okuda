#!/usr/bin/env bun
/**
 * cast.ts — cast a document to a new Herdr pane, running in okuda.
 *
 * Usage: bun scripts/cast.ts <file.md> [label]
 *
 * Creates a Herdr tab rooted in this silo, runs the okuda binary on the
 * file in its root pane, and waits for the okudagram to render before
 * reporting. The pane stays focused; q returns it to the shell.
 *
 * Herdr control surface (herdr.dev/docs): tab create → pane run →
 * pane wait-output → pane read. IDs are captured from JSON responses,
 * never predicted.
 */
import { spawnSync } from "node:child_process";

const file = process.argv[2];
const label = process.argv[3] ?? "on-screen-now";

if (!file) {
  console.error("usage: bun scripts/cast.ts <file.md> [label]");
  process.exit(1);
}

const cwd = process.cwd();

function herdr(args: string[]): { ok: boolean; out: string } {
  const p = spawnSync("herdr", args, { encoding: "utf8" });
  return { ok: p.status === 0, out: p.stdout ?? "" };
}

// 1. Layout: a new tab in this workspace; capture the root pane id.
const created = herdr(["tab", "create", "--cwd", cwd, "--label", label, "--focus"]);
if (!created.ok) {
  console.error("cast: herdr tab create failed");
  process.exit(1);
}
const paneId = JSON.parse(created.out)?.result?.root_pane?.pane_id;
if (!paneId) {
  console.error("cast: no root pane in herdr response");
  process.exit(1);
}

// 2. Run: submit the okuda command (pane run adds the Enter).
herdr(["pane", "run", paneId, "./okuda", file]);

// 3. Verify: wait for the okudagram to render before declaring victory.
const probe = file.split("/").pop() ?? file;
const wait = herdr([
  "pane", "wait-output", paneId, "--match", probe, "--timeout", "15000",
]);

if (!wait.ok) {
  console.error(`cast: pane ${paneId} did not render ${probe} within 15s`);
  process.exit(1);
}

const tabId = JSON.parse(created.out)?.result?.tab?.tab_id ?? "?";
console.log(`cast: ${file} → pane ${paneId} (tab ${tabId}, focused)`);
