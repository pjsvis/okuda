#!/usr/bin/env bun
/**
 * jump-demo.ts — a demo compositor for the index-and-jump feature
 * (td-9d9981).
 *
 * Emits a numbered index over decisions/00–09. Each line is plain text
 * (not a markdown link): a `[NN]` token, the decision title, then the
 * trailing path. The TUI's `extractJumps` lifts the token→path mapping
 * from this shape; the renderer paints it as ordinary prose — no fake
 * clickable styling for a file path that isn't a URL.
 *
 * Ephemeral by design — never registered, never a brief. This is the
 * *environment* composing (filesystem as the message bus), not okuda;
 * the renderer just paints the bytes it's given (ADR-020).
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
  const lines = ["# Jump demo — recent decisions", ""];
  files.forEach((f, i) => {
    const token = String(i + 1).padStart(2, "0");
    const title = titleOf(`decisions/${f}`);
    lines.push(`- [${token}] ${title} — decisions/${f}`);
  });
  lines.push("");
  console.log(lines.join("\n"));
}