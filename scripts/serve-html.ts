#!/usr/bin/env bun
/**
 * serve-html.ts — serve the published packages, with a listing.
 *
 * A preview server, not a publisher. It exists so the artefacts can be
 * checked the way a reader will meet them: a URL, a tab, a click. The
 * listing is the first thing a reader sees, and it is the canonical test
 * the style guide names — an index has no content depth to hide behind, so
 * its look *is* its legibility.
 *
 * The listing is DERIVED, never specified: the directory is the index, the
 * ISO date prefix is the sort key, and the title is read from each file's
 * own `<title>`. There is no manifest to maintain and therefore none to
 * drift.
 *
 * Serving is a compositor's job (AGENTS.md, three concerns), so this lives
 * in `scripts/` and okuda is untouched.
 *
 * Usage:  bun scripts/serve-html.ts [--port 8080] [--dir html]
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { styleBlock } from "./html-palette.ts";

const args = process.argv.slice(2);
const flag = (name: string, fallback: string): string => {
  const i = args.indexOf(name);
  return i >= 0 ? (args[i + 1] ?? fallback) : fallback;
};

const PORT = Number(flag("--port", "8080"));
const DIR = resolve(flag("--dir", "html"));

if (!existsSync(DIR)) {
  console.error(`no such directory: ${DIR}\nrun \`just html <file>\` first`);
  process.exit(1);
}

// ── The catalogue ─────────────────────────────────────────────────────
//
// One read per file, cached on mtime. A title is the file's own claim
// about itself; the date is the filename's, because the filename is the
// sort key and a document that disagrees with its own name is a defect
// worth seeing rather than hiding.

interface Entry {
  file: string;
  date: string;
  title: string;
  size: number;
  mtime: number;
}

const cache = new Map<string, { mtime: number; title: string }>();

/** The title is read from the file's own `<title>`, which is already
 *  HTML-escaped. Unescape it here and escape it again on the way out, or a
 *  title containing `&lt;details&gt;` renders as `&amp;lt;details&amp;gt;` —
 *  the double-escape the listing showed on 2026-11-05. */
function unescapeHtml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function titleOf(path: string, mtime: number): string {
  const hit = cache.get(path);
  if (hit && hit.mtime === mtime) return hit.title;
  let title = basename(path, ".html");
  try {
    const head = readFileSync(path, "utf8").slice(0, 4096);
    const raw = head.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
    if (raw) title = unescapeHtml(raw);
  } catch {
    /* unreadable — the filename stands */
  }
  cache.set(path, { mtime, title });
  return title;
}

function catalogue(): Entry[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".html"))
    .map((file) => {
      const path = join(DIR, file);
      const st = statSync(path);
      // The ISO date prefix is the sort key. A file without one sorts last
      // rather than being hidden: an unnameable artefact is still an
      // artefact, and the listing is the place to notice it.
      const date = file.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
      return {
        file,
        date,
        title: titleOf(path, st.mtimeMs),
        size: st.size,
        mtime: st.mtimeMs,
      };
    })
    .sort((a, b) => (b.date || "0000").localeCompare(a.date || "0000") || b.mtime - a.mtime);
}

// ── The listing ───────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function kib(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} KiB`;
}

function listing(): string {
  const entries = catalogue();
  const rows = entries
    .map(
      (e) => `<tr>
  <td class="date">${escapeHtml(e.date || "—")}</td>
  <td><a href="/${encodeURIComponent(e.file)}">${escapeHtml(e.title)}</a></td>
  <td class="size">${kib(e.size)}</td>
</tr>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>okuda — published packages</title>
<style>
${styleBlock()}
/* The listing is a menu, so it takes the menu's shape: the date is the
 * far column (provenance, not content), the title is near, the size is
 * chrome. */
.listing { width: 100%; }
.listing td { border-bottom: 1px solid color-mix(in oklab, var(--okuda-muted) 30%, transparent); }
.listing .date { color: var(--okuda-muted); white-space: nowrap; width: 1%; }
.listing .size { color: var(--okuda-muted); text-align: right; white-space: nowrap; width: 1%; }
.listing a { text-decoration: none; }
.listing a:hover { text-decoration: underline; }
.count { color: var(--okuda-muted); font-size: 0.9em; margin: 0 0 1.5em; }
</style>
</head>
<body>
<main>
<h1>Published packages</h1>
<p class="count">${entries.length} document${entries.length === 1 ? "" : "s"} · newest first</p>
<table class="listing">
<thead><tr><th>Date</th><th>Document</th><th>Size</th></tr></thead>
<tbody>
${rows || `<tr><td colspan="3" class="count">nothing published yet — run <code>just html &lt;file&gt;</code></td></tr>`}
</tbody>
</table>
</main>
</body>
</html>
`;
}

// ── The server ────────────────────────────────────────────────────────

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    const path = decodeURIComponent(url.pathname);

    if (path === "/" || path === "/index.html") {
      return new Response(listing(), {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      });
    }

    // Only `.html` in the served directory, and only by bare name: a path
    // with a separator is a traversal attempt, not a document. The
    // directory is the whole namespace.
    const name = path.slice(1);
    if (name !== basename(name) || !name.endsWith(".html")) {
      return new Response("not found\n", { status: 404 });
    }
    const file = join(DIR, name);
    if (!existsSync(file)) return new Response("not found\n", { status: 404 });

    return new Response(Bun.file(file), {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  },
});

console.log(`serving ${DIR}`);
console.log(`  http://localhost:${server.port}/`);
