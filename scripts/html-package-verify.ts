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
  `---\ntype: Brief\ncallsign: BRF-FIXTURE\ndate: 2026-11-05\n---\n\n# Fixture\n\n---\n\n## A section after a rule\n\nThe rule above is redundant — the heading is the break — so the build drops it.\n\n${filler}\n\n---\n\nText after a bare rule, which stays: no heading follows, so the rule is the\nonly structure there is.\n\n${filler}\n\n- **Tight.** A tight list item.

- **Loose.** A loose list item, which is the house form.

This fixture cites itself: fixture.md, and must not grow a panel — the reader is
already there. A bare silcrow §27 in prose stays prose, and an inline reference to
decisions/027-temperament-is-downstream-of-discipline.md becomes a link. A code
file is a document too: src/render.ts should dereference into a fence. A callsign
such as ADR-GLASS-INK-073 is a registered name, not a path, so it stays in prose
ink.\n\ndecisions/027-temperament-is-downstream-of-discipline.md §27\n\nA closing paragraph.\n`,
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

// ── The budget is honest ──────────────────────────────────────────────
//
// A dropped reference looks exactly like an unresolvable one — gold text,
// no link. So the build must SAY when the budget bites. Checked here at the
// build, not in the browser, because it is a message to the publisher.

const capped = Bun.spawnSync(
  ["bun", "scripts/html-package.ts", src, "-o", join(dir, "capped.html"), "--root", repo, "--max-panels", "1"],
  { cwd: repo, stdout: "pipe", stderr: "pipe" },
);
const budgetSaid = capped.stderr.toString().includes("dropped by the budget");

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
      // A panel is open by :target (no JS) or by the class the script
      // toggles (JS, no history entry). Both are the same state.
      panelOpen: p ? (p.matches(':target') || p.classList.contains('is-open')) : null,
      closeHref: document.querySelector('.deref-close')?.getAttribute('href') ?? null,
      // A bare §NN is a section number or a painted badge, never a
      // reference: the renderer's scan keys on paths and callsigns
      // (src/vectors.ts), and §NN is what it PAINTS after one.
      historyLen: history.length,
      inlineSilcrowIsLink: [...document.querySelectorAll('a')]
        .some(a => a.textContent?.trim() === '§27'),
      silcrowInProse: document.body.textContent?.includes('bare silcrow §27') ?? false,
      // A code file is not markdown. The panel must be a fence, wrapped by
      // wrapWholeFile, not TypeScript parsed as prose.
      codePanelIsFenced: [...document.querySelectorAll('.deref pre code')]
        .some(c => /language-(ts|rs|sh|py)/.test(c.className)),
      terminator: (() => {
        const t = document.querySelector('.terminator');
        if (!t) return null;
        return {
          chips: getComputedStyle(t, '::before').content + getComputedStyle(t, '::after').content,
          rule: !!t.querySelector('.rule'),
        };
      })(),
      inlineRefIsLink: [...document.querySelectorAll('a.doc-ref')]
        .some(a => a.textContent?.includes('decisions/027')),
      byline: document.querySelector('.byline')?.textContent ?? null,
      // The house move, in the house's own list style. A loose list emits
      // <li><p><strong>, so a selector that only knows <li><strong> misses
      // the signature pattern in the style it is named for.
      looseBoldLead: (() => {
        const e = document.querySelector('li > p > strong:first-child');
        return e ? getComputedStyle(e).color : null;
      })(),
      tableKey: getComputedStyle(document.documentElement)
        .getPropertyValue('--okuda-table-key').trim(),
      // The heading anchors: a badge on the left, a chip on the right.
      // They are the strongest horizontal signal on the page, and losing
      // them is most of why a web page scans worse than a terminal.
      headingBadge: (() => {
        const h = document.querySelector('h1');
        if (!h) return null;
        const cs = getComputedStyle(h, '::before');
        return { content: cs.content, bg: cs.backgroundColor };
      })(),
      headingChip: (() => {
        const h = document.querySelector('h1');
        if (!h) return null;
        const cs = getComputedStyle(h, '::after');
        return { content: cs.content, position: cs.position };
      })(),
      // The terminal normalises list looseness away; so must the sheet.
      listRhythm: (() => {
        const items = [...document.querySelectorAll('li')];
        if (items.length < 2) return null;
        return getComputedStyle(items[1]).marginTop;
      })(),
      frontMatterLeaked: document.body.textContent?.includes('callsign: BRF-FIXTURE') ?? false,
      // A rule before a heading is redundant: 603 of the corpus's 656
      // thematic breaks are followed by one. A rule that is NOT followed by
      // a heading is the only structure there, and stays.
      // A document citing itself mints nothing. The terminal retired this
      // with makeSelfExclusion; the package had no such rule until the
      // showcase grew a panel containing a copy of itself.
      selfPanel: !!document.querySelector('.deref#ref-fixture'),
      selfLink: !!document.querySelector('a[href="#ref-fixture"]'),
      hrTotal: document.querySelectorAll('hr').length,
      // The three link registers, and the rule that must not borrow a second
      // colour: the colour is the register, the rule is only the affordance.
      linkRuleMatchesInk: (() => {
        const a = document.querySelector('a.ref-callsign, a');
        if (!a) return null;
        const cs = getComputedStyle(a);
        return { rule: cs.textDecorationColor, ink: cs.color };
      })(),
      callsignIsInk: (() => {
        const a = document.querySelector('a.ref-callsign');
        if (!a) return null;
        // The link inherits its colour, so it must match the prose around it.
        return getComputedStyle(a).color === getComputedStyle(a.parentElement).color;
      })(),
      // A table's structure is its columns, not its rules.
      tableRowRule: (() => {
        const tds = document.querySelectorAll('tbody td');
        if (tds.length < 2) return null;
        return [...tds].map(td => getComputedStyle(td).borderBottomWidth).join(',');
      })(),
      headingGap: (() => {
        const h = document.querySelector('h2');
        return h ? getComputedStyle(h).marginBottom : null;
      })(),
      hrBeforeHeading: [...document.querySelectorAll('hr')]
        .some(h => /^H[1-6]$/.test(h.nextElementSibling?.tagName ?? '')),
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

// The close control must stay in view when the panel scrolls. Measured
// before the socket closes, because a probe after it would hang.
await ev("document.querySelector('a.receipt').click()");
await Bun.sleep(300);
await ev("document.querySelector('.deref.is-open, .deref:target').scrollTop = 600");
await Bun.sleep(250);
const closeVisibleOnScroll = await ev(`(() => {
  const c = document.querySelector('.deref-close');
  if (!c) return false;
  const r = c.getBoundingClientRect();
  return r.top >= 0 && r.top < window.innerHeight && r.height > 0;
})()`);

// The panel's chrome must carry the identity AND stay in view. A scrolled
// panel otherwise has none: the browser tab still names the MAIN document,
// so the reader is inside a document that nothing on screen names.
const chromeOnScroll = await ev(`(() => {
  const c = document.querySelector('.deref-chrome');
  if (!c) return null;
  const r = c.getBoundingClientRect();
  const id = c.querySelector('.deref-id')?.textContent ?? '';
  return { inView: r.top >= 0 && r.top < window.innerHeight, id: id.trim() };
})()`);

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
  ["a loose list's bold lead takes the key colour", closed.looseBoldLead === "rgb(224, 180, 92)", `${closed.looseBoldLead} vs ${closed.tableKey}`],
  ["a heading carries its LHS badge", closed.headingBadge?.content === '"#"', `content ${closed.headingBadge?.content}`],
  ["a heading carries its RHS chip", closed.headingChip?.content === '"█"' && closed.headingChip?.position === "absolute", `${closed.headingChip?.content} ${closed.headingChip?.position}`],
  // A full line of air, not a fraction: the terminal's blank row between
  // items. Asserted as a range, because an exact pixel value is a
  // measurement of the font, not of the rhythm.
  ["every list item is loose", parseFloat(closed.listRhythm) > 20, `margin-top ${closed.listRhythm}`],
  ["a bare silcrow stays prose", closed.silcrowInProse === true && closed.inlineSilcrowIsLink === false, `prose ${closed.silcrowInProse}, link ${closed.inlineSilcrowIsLink}`],
  ["the document closes with its terminator", closed.terminator?.chips === '"█""█"' && closed.terminator?.rule === true, `${closed.terminator?.chips} rule ${closed.terminator?.rule}`],
  ["a code file dereferences into a fence", closed.codePanelIsFenced === true, `fenced ${closed.codePanelIsFenced}`],
  ["opening a panel adds no history entry", opened.historyLen === before.historyLen, `${before.historyLen} → ${opened.historyLen}`],
  ["closing adds no history entry", closed.historyLen === before.historyLen, `${before.historyLen} → ${closed.historyLen}`],
  ["the close control stays visible when the panel scrolls", closeVisibleOnScroll === true, `in view ${closeVisibleOnScroll}`],
  ["the panel chrome stays in view when scrolled", chromeOnScroll?.inView === true, `in view ${chromeOnScroll?.inView}`],
  ["the panel chrome names the document", (chromeOnScroll?.id ?? "").length > 0, `id "${chromeOnScroll?.id}"`],
  ["the build says when the panel budget bites", budgetSaid === true, `warned ${budgetSaid}`],
  ["a self-citation mints no panel", closed.selfPanel === false && closed.selfLink === false, `panel ${closed.selfPanel}, link ${closed.selfLink}`],
  ["a rule before a heading is dropped", closed.hrBeforeHeading === false, `hr before heading ${closed.hrBeforeHeading}`],
  ["a rule that is the only structure stays", closed.hrTotal === 1, `${closed.hrTotal} hr`],
  ["a heading keeps a full line of air below", closed.headingGap !== null && parseFloat(closed.headingGap) >= 20, `gap ${closed.headingGap}`],
  ["a link's rule is the same colour as its ink", closed.linkRuleMatchesInk !== null && closed.linkRuleMatchesInk.rule === closed.linkRuleMatchesInk.ink, `${closed.linkRuleMatchesInk?.rule} vs ${closed.linkRuleMatchesInk?.ink}`],
  ["a callsign link stays in prose ink", closed.callsignIsInk === true, `ink ${closed.callsignIsInk}`],
  ["table rows are separated by space, not rules", closed.tableRowRule !== null && !closed.tableRowRule.split(',').some(w => parseFloat(w) > 0), `borders ${closed.tableRowRule}`],
];

let failed = 0;
for (const [name, ok, detail] of checks) {
  console.log(`${ok ? "✓" : "✗"} ${name} — ${detail}`);
  if (!ok) failed++;
}

cleanup();
process.exit(failed === 0 ? 0 : 1);
