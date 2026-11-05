#!/usr/bin/env bun
/**
 * html-package-verify.ts — the acceptance criterion, measured rather than
 * asserted: an address line opens a panel, and the close control returns the
 * reader to the same scroll position.
 *
 * Contract: briefs/2026-11-05-brief-html-package.md, acceptance criterion 3.
 *
 * Why a browser and not a unit test: the claim is about a browser's fragment
 * resolution, and no amount of reading the spec substitutes for measuring it.
 * The spike that produced the design (2026-11-05) found the trap this script
 * now guards — `#` scrolls to the top, so the panel closes correctly and the
 * reader is silently somewhere else.
 *
 * Usage:  bun scripts/html-package-verify.ts
 * Exits 0 when every check holds, 1 otherwise. Requires Google Chrome.
 */

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;

// ── The fixture ───────────────────────────────────────────────────────
//
// Long enough to scroll, so "return to the same place" is measurable rather
// than trivially true. The address line is the renderer's own form
// (RE_ADDRESS_LINE, src/render.ts:78).

const dir = mkdtempSync(join(tmpdir(), "okuda-html-"));
const src = join(dir, "fixture.md");
const out = join(dir, "fixture.html");

const filler = Array.from(
  { length: 40 },
  (_, i) => `Paragraph ${i + 1} — filler, so the page scrolls and the return to place is measurable.`,
).join("\n\n");

writeFileSync(
  src,
  `---\ntype: Brief\ncallsign: BRF-FIXTURE\ndate: 2026-11-05\n---\n\n# Fixture\n\n${filler}\n\nAn inline reference to decisions/027-temperament-is-downstream-of-discipline.md in prose.\n\ndecisions/027-temperament-is-downstream-of-discipline.md §27\n\nA closing paragraph.\n`,
);

// The package is built from the repo root, so the relative address resolves.
const repo = new URL("..", import.meta.url).pathname;
const build = Bun.spawnSync(
  ["bun", "scripts/html-package.ts", src, "-o", out, "--root", repo],
  { cwd: repo, stdout: "pipe", stderr: "pipe" },
);
if (build.exitCode !== 0) {
  console.error("build failed:", build.stderr.toString());
  process.exit(1);
}

// ── Chrome ────────────────────────────────────────────────────────────

const profile = mkdtempSync(join(tmpdir(), "okuda-chrome-"));
const chrome = Bun.spawn(
  [
    CHROME,
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ],
  { stdout: "ignore", stderr: "ignore" },
);

const cleanup = () => {
  chrome.kill();
  rmSync(profile, { recursive: true, force: true });
  rmSync(dir, { recursive: true, force: true });
};

async function wsUrl(): Promise<string> {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      return (await r.json()).webSocketDebuggerUrl;
    } catch {
      await Bun.sleep(200);
    }
  }
  throw new Error("chrome did not start");
}

const ws = new WebSocket(await wsUrl());
await new Promise<void>((res, rej) => {
  ws.onopen = () => res();
  ws.onerror = (e) => rej(e);
});

let id = 0;
const pending = new Map<number, (v: any) => void>();
ws.onmessage = (ev) => {
  const m = JSON.parse(String(ev.data));
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)!(m);
    pending.delete(m.id);
  }
};
const send = (method: string, params: any = {}, sessionId?: string) =>
  new Promise<any>((res) => {
    const mid = ++id;
    pending.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
  });

const { result: targets } = await send("Target.getTargets");
const page = targets.targetInfos.find((t: any) => t.type === "page");
const { result: att } = await send("Target.attachToTarget", {
  targetId: page.targetId,
  flatten: true,
});
const S = att.sessionId;
await send("Page.enable", {}, S);
await send("Runtime.enable", {}, S);
await send("Page.navigate", { url: `file://${out}` }, S);
await Bun.sleep(800);

const ev = async (expr: string) => {
  const r = await send(
    "Runtime.evaluate",
    { expression: expr, returnByValue: true, awaitPromise: true },
    S,
  );
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
  return r.result?.result?.value;
};

const probe = () =>
  ev(`(() => {
    const p = document.querySelector('.deref');
    return {
      scrollY: Math.round(window.scrollY),
      panelOpen: p ? p.matches(':target') : null,
      closeHref: document.querySelector('.deref-close')?.getAttribute('href') ?? null,
      inlineSilcrowIsLink: [...document.querySelectorAll('a')]
        .some(a => a.textContent?.trim() === '§27'),
      inlineRefIsLink: [...document.querySelectorAll('a.doc-ref')]
        .some(a => a.textContent?.includes('decisions/027')),
      byline: document.querySelector('.byline')?.textContent ?? null,
      frontMatterLeaked: document.body.textContent?.includes('callsign: BRF-FIXTURE') ?? false,
      // ASSETS, not references. A link to another document is a reference
      // the reader may follow; an asset is something this file must fetch,
      // and that is what breaks the single-file invariant.
      externalAssets: [
        ...[...document.querySelectorAll('[src]')].map(e => e.getAttribute('src')),
        ...[...document.querySelectorAll('link[rel=stylesheet]')].map(e => e.getAttribute('href')),
      ].filter(Boolean),
    };
  })()`);

const step = async (fn: () => Promise<void>) => {
  await fn();
  await Bun.sleep(400);
  return probe();
};

const before = await step(() => ev("window.scrollTo(0, document.body.scrollHeight)"));
const opened = await step(() => ev("document.querySelector('a.receipt').click()"));
const closed = await step(() => ev("document.querySelector('.deref-close').click()"));

ws.close();

// ── The checks ────────────────────────────────────────────────────────

const checks: Array<[string, boolean, string]> = [
  ["the page scrolls (the fixture is long enough)", before.scrollY > 0, `scrollY ${before.scrollY}`],
  ["the receipt opens the panel", opened.panelOpen === true, `panelOpen ${opened.panelOpen}`],
  ["opening does not move the page", opened.scrollY === before.scrollY, `${before.scrollY} → ${opened.scrollY}`],
  ["closing returns to the same place", closed.scrollY === before.scrollY, `${before.scrollY} → ${closed.scrollY}`],
  ["the panel closes", closed.panelOpen === false, `panelOpen ${closed.panelOpen}`],
  ["the close control uses an unmatched fragment", closed.closeHref === "#_", `href ${closed.closeHref}`],
  ["an inline silcrow is not a link", closed.inlineSilcrowIsLink === false, `isLink ${closed.inlineSilcrowIsLink}`],
  ["an inline path is a link to its panel", closed.inlineRefIsLink === true, `isLink ${closed.inlineRefIsLink}`],
  ["front matter becomes a byline", closed.byline === "BRF-FIXTURE · Brief · 2026-11-05", `byline ${closed.byline}`],
  ["front matter does not leak into the body", closed.frontMatterLeaked === false, `leaked ${closed.frontMatterLeaked}`],
  ["the file fetches no external asset", closed.externalAssets.length === 0, `${closed.externalAssets.length} found`],
];

let failed = 0;
for (const [name, ok, detail] of checks) {
  console.log(`${ok ? "✓" : "✗"} ${name} — ${detail}`);
  if (!ok) failed++;
}

cleanup();
process.exit(failed === 0 ? 0 : 1);
