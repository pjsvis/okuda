#!/usr/bin/env bun
/**
 * jump-demo.ts — a demo compositor for the index-and-jump feature
 * (td-9d9981).
 *
 * Emits a numbered index document over decisions/00–09, each line an
 * inline-link `[NN](path)` token the TUI's jump buffer resolves. The
 * recipe writes this to a temp file and frames it in the TUI, so the
 * operator can type `01`–`09` to jump to a decision and `u`/Backspace
 * to come back. Ephemeral by design — never registered, never a brief.
 *
 * This is the *environment* composing (filesystem as the message bus),
 * not okuda — the renderer just paints the links it's given (ADR-020).
 *
 * Usage:
 *   bun scripts/jump-demo.ts          # markdown to stdout
 *   just jump-demo                    # generate + frame in the TUI
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Pull the first `# ` heading from a decision file, or fall back to
 *  its basename. Pure-ish (reads fs). */
function titleOf(file: string): string {
  try {
    const text = readFileSync(join(ROOT, file), "utf8");
    const m = text.match(/^#\s+(.+)$/m);
    return m?.[1]?.trim() ?? file;
  } catch {
    return file;
  }
}

if (import.meta.main) {
  const files = readdirSync(join(ROOT, "decisions"))
    .filter((f) => /^0\d{2}-.*\.md$/.test(f))
    .sort()
    .slice(0, 9);
  const lines = [
    "# Jump demo — recent decisions",
    "",
    "> Type a two-digit number to jump (`01`–`09`); `u` or `Backspace`",
    "> to come back. Press `?` to toggle the hints line. `q` to quit.",
    "",
  ];
  files.forEach((f, i) => {
    const token = String(i + 1).padStart(2, "0");
    const title = titleOf(`decisions/${f}`);
    lines.push(`- [${token}](decisions/${f}) ${title}`);
  });
  lines.push("");
  console.log(lines.join("\n"));
}