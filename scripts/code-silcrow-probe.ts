#!/usr/bin/env bun
/**
 * code-silcrow-probe.ts — would CALLSIGNS in code comments earn a silcrow?
 *
 * The question. A non-`.md` file rendered by okuda is wrapped whole in a fence
 * (`src/render.ts` wrapWholeFile:772), and fenced content is excluded from
 * reference discovery (`src/vectors.ts` fenceRanges:127). So a comment citing
 * ADR-030 or BRF-ROOT-CONTAINMENT paints nothing. Option (c) narrows the
 * change to COMMENT regions and, further, to CALLSIGNS — the auditable,
 * registry-backed documents — because a callsign is unambiguous where a path
 * in a string is not.
 *
 * What it measures, after ADR-044's method: of the callsign-shaped tokens in
 * code comments, how many RESOLVE (a real, auditable document) versus how many
 * are junk (acronyms, stale, forward). A high resolved ratio is the warrant to
 * gate the discovery on comments; a low one is the warrant for the fence.
 *
 * Over-approximation, named. The comment extractor is line-based and
 * language-agnostic: `//`, `#`, and `/* *​/` starts, `//` ignored after a scheme
 * colon so `https://` is not a comment, block state carried across lines. A `#`
 * in a string or a colour is still read as a comment. The error direction is
 * over-counting, which is the conservative side for this decision.
 *
 * Pure-ish (git + rg at the edges; the registry read is the validator's).
 * Usage: bun scripts/code-silcrow-probe.ts [--json]
 */

import { makeCallsignValidator } from "../src/root";

/** The callsign token, mirroring src/vectors.ts:97 (RE_CALLSIGN). */
const RE_CALLSIGN = /\b[A-Z]{3}(?:-[A-Z0-9]+)+\b/g;

/** Extensions that carry comments. `.json`/`.jsonl` are data (no comments). */
const CODE_EXTS = new Set([
  "ts", "tsx", "mts", "cts", "js", "mjs", "cjs", "jsx",
  "sh", "bash", "zsh", "py", "rs", "go", "c", "h", "cc", "cpp", "toml", "css",
]);

interface CommentLine { line: number; text: string }

/** The comment text per source line. Line-based, language-agnostic. */
function commentText(text: string): CommentLine[] {
  const out: CommentLine[] = [];
  const lines = text.split("\n");
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]!;
    if (inBlock) {
      const close = l.indexOf("*/");
      out.push({ line: i + 1, text: close < 0 ? l : l.slice(0, close) });
      if (close >= 0) inBlock = false;
      continue;
    }
    let start = -1;
    let block = false;
    for (const tok of ["//", "#", "/*"]) {
      let p = l.indexOf(tok);
      while (p >= 0 && tok === "//" && p > 0 && l[p - 1] === ":") p = l.indexOf(tok, p + 1);
      if (p >= 0 && (start < 0 || p < start)) {
        start = p;
        block = tok === "/*";
      }
    }
    if (start < 0) continue;
    const rest = l.slice(start);
    out.push({ line: i + 1, text: rest });
    if (block && rest.indexOf("*/") < 0) inBlock = true;
  }
  return out;
}

const tokensIn = (s: string): string[] => [...s.matchAll(RE_CALLSIGN)].map((m) => m[0]!);

const files = Bun.spawnSync(["git", "ls-files"], { stdout: "pipe" })
  .stdout.toString()
  .split("\n")
  .filter((f) => f && !f.startsWith(".") && CODE_EXTS.has(f.split(".").pop()!.toLowerCase()));

const resolves = makeCallsignValidator(process.cwd());

const rows: Array<{
  file: string;
  commentTokens: number;
  commentResolved: string[];
  commentJunk: string[];
  outsideResolved: string[];
  outsideJunk: string[];
}> = [];

const junkTotal = new Map<string, number>();
const resolvedTotal = new Map<string, number>();

for (const file of files) {
  let text: string;
  try {
    text = require("fs").readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const comments = commentText(text);
  const commentBlob = comments.map((c) => c.text).join("\n");
  const commentToks = tokensIn(commentBlob);
  // The whole-file scan minus the comment tokens is the string/import/identifier
  // population the fence guard was protecting against — JUNK only, since it is
  // precisely the population a whole-file option would add.
  const allToks = [...tokensIn(text)];
  const commentCount = new Map<string, number>();
  for (const t of commentToks) commentCount.set(t, (commentCount.get(t) ?? 0) + 1);
  const outside: string[] = [];
  for (const t of allToks) {
    const n = commentCount.get(t) ?? 0;
    if (n > 0) commentCount.set(t, n - 1);
    else outside.push(t);
  }
  const commentResolved: string[] = [];
  const commentJunk: string[] = [];
  for (const t of commentToks) (resolves(t) ? commentResolved : commentJunk).push(t);
  const outsideResolved = outside.filter((t) => resolves(t));
  const outsideJunk = outside.filter((t) => !resolves(t));
  for (const t of commentResolved) resolvedTotal.set(t, (resolvedTotal.get(t) ?? 0) + 1);
  for (const t of commentJunk) junkTotal.set(t, (junkTotal.get(t) ?? 0) + 1);
  if (commentToks.length || outside.length)
    rows.push({ file, commentTokens: commentToks.length, commentResolved, commentJunk, outsideResolved, outsideJunk });
}

const totalComment = rows.reduce((a, r) => a + r.commentTokens, 0);
const totalResolved = rows.reduce((a, r) => a + r.commentResolved.length, 0);
const totalJunk = rows.reduce((a, r) => a + r.commentJunk.length, 0);
const totalOutsideResolved = rows.reduce((a, r) => a + r.outsideResolved.length, 0);
const totalOutsideJunk = rows.reduce((a, r) => a + r.outsideJunk.length, 0);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ files: rows.length, totalComment, totalResolved, totalJunk, totalOutsideResolved, totalOutsideJunk, rows }, null, 2));
} else {
  console.log(`code files scanned        ${files.length}`);
  console.log(`callsigns in comments     ${totalComment}`);
  console.log(`  resolve (auditable)     ${totalResolved}`);
  console.log(`  junk (unresolved)       ${totalJunk}`);
  console.log(`callsigns OUTSIDE comments: ${totalOutsideResolved} resolve, ${totalOutsideJunk} junk`);
  console.log(`  (resolved-outside is what a whole-file scan would paint that comment-scan would not)`);
  const by = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\nunique resolved (${resolvedTotal.size}):`);
  for (const [t, n] of by(resolvedTotal)) console.log(`  ${String(n).padStart(3)}  ${t}`);
  console.log(`\nunique junk (${junkTotal.size}):`);
  for (const [t, n] of by(junkTotal)) console.log(`  ${String(n).padStart(3)}  ${t}`);
  const worst = [...rows].sort((a, b) => b.commentTokens - a.commentTokens).slice(0, 10);
  console.log(`\nfiles with callsigns in comments (top 10):`);
  for (const r of worst) console.log(`  ${String(r.commentTokens).padStart(3)}  (${r.commentResolved.length} ok)  ${r.file}`);
}
