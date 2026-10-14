// ── The idea ledger's gate (ADR-IDEA-LEDGER-064) ─────────────────────
//  The ledger exists because an idea had no cheap place to be written: the
//  brief is a *promise* (intent, preconditions, acceptance criteria), so
//  writing one is a commitment, so every idea became a promise, so 59 of 71
//  live briefs sat at `open`. `docs/ideas.md` is the cheaper container.
//
//  The price of a cheap container is that anything can be put in it — so the
//  gate is the *trigger*: every entry must name the observation that would
//  make the idea worth doing. This is the lexicon's test-bearing rule applied
//  to ideas, and it is the distinction the brief format cannot make, because a
//  brief demands acceptance criteria and never demands a trigger. An idea that
//  cannot name its trigger has said so about itself.
//
//  What the gate does NOT do is judge the idea. There is no threshold, no
//  score, no "is this good" — that is the operator's, on a reading. The screen
//  prints the census and the one number the decision named as its own
//  falsifier: promoted / total. A ledger whose line count grows while its
//  promotions do not is a graveyard, and ADR-IDEA-LEDGER-064 says delete it
//  rather than curate it.
//
//  A missing ledger is a reading, not a failure — deleting it is a reversal of
//  the decision, and a lint that fails on a deliberately reversed decision is
//  the alarm that fires on every render, which BRF-BOUNDARY-MARK refuses.
//
//  Usage: bun scripts/idea-lint.ts [--gate] [--json]
//  Exit 1 on any malformed entry, 0 otherwise.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** The ledger's path, relative to the repo root. One file, by decision. */
export const LEDGER = "docs/ideas.md";

export type Outcome = "open" | "promoted" | "refused";

export interface Idea {
  slug: string;
  raised: string;
  cluster: string;
  outcome: Outcome;
  /** The text after the outcome word — a callsign for `promoted`, a reason
   *  for `refused`, empty for `open`. */
  onto: string;
  trigger: string;
  line: number;
}

export interface Census {
  total: number;
  byCluster: Record<string, number>;
  byOutcome: Record<Outcome, number>;
  /** promoted / total, or null when there is nothing to promote. The
   *  falsifier, as a number. */
  promotionRatio: number | null;
}

/** The entry head: `- **`slug`** · YYYY-MM-DD · `cluster` · **outcome**`.
 *  Anchored at column 0 so the header's indented examples cannot match. */
export const ENTRY = /^- \*\*`([a-z0-9-]+)`\*\* · (\d{4}-\d{2}-\d{2}) · `([a-z0-9-]+)` · \*\*(.+?)\*\*\s*$/;

/** The outcome field's vocabulary. A word outside it is a finding, not a
 *  synonym — the lesson ADR-BRIEF-LIFECYCLE-061 paid for with ten
 *  unrecognised status words and one six-week-old lie. */
export function parseOutcome(raw: string): { outcome: Outcome; onto: string } | null {
  const t = raw.trim();
  if (t === "open") return { outcome: "open", onto: "" };
  const m = t.match(/^(promoted|refused):\s*(.+)$/);
  if (m) return { outcome: m[1] as Outcome, onto: m[2]!.trim() };
  return null;
}

/** Parse the ledger into entries. Pure: text in, entries and faults out.
 *
 *  An entry opens at a column-zero `- **`; it runs until the next such line, a
 *  heading, or end of file. Blocks are therefore not required to be separated
 *  by blank lines: a consecutive list of entries is the natural way to write a
 *  list, and a parser that needed the blank line would silently read the run as
 *  one entry. Only the text above the first entry (or between headings) is
 *  inert, so the file's own spec needs no marker. */
export function parseLedger(
  text: string,
  path = LEDGER,
): { ideas: Idea[]; faults: string[] } {
  const lines = text.split("\n");
  const starts: number[] = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]!;
    // A fenced block is the file's own spec, not its content: the format is
    // shown in a fence so that it renders as code and cannot be read as an
    // entry — which is also why the gate must skip fences, or it would read
    // the spec as a malformed idea and fail on the document that defines it.
    if (/^\s*```/.test(l)) {
      inFence = !inFence;
      continue;
    }
    if (!inFence && l.startsWith("- **")) starts.push(i);
  }

  const ideas: Idea[] = [];
  const faults: string[] = [];
  for (let k = 0; k < starts.length; k++) {
    const i = starts[k]!;
    const stop = k + 1 < starts.length ? starts[k + 1]! : lines.length;
    const at = i + 1;
    const m = lines[i]!.match(ENTRY);
    if (!m) {
      faults.push(
        `${path}:${at}: entry head does not parse — want 'slug · YYYY-MM-DD · cluster · outcome' on one line`,
      );
      continue;
    }
    // The body ends early at a heading or rule, so an entry cannot swallow the
    // prose that follows the list.
    let bodyEnd = stop;
    for (let j = i + 1; j < stop; j++) {
      const l = lines[j]!;
      if (/^#{1,6} /.test(l) || /^---\s*$/.test(l)) {
        bodyEnd = j;
        break;
      }
    }
    const [, slug, raised, cluster, rawOutcome] = m as unknown as [
      string, string, string, string, string,
    ];
    const parsed = parseOutcome(rawOutcome);
    if (!parsed) {
      faults.push(
        `${path}:${at}: \`${slug}\` carries the outcome "${rawOutcome}" — not a word of the vocabulary (open | promoted | refused)`,
      );
      continue;
    }
    const body = lines.slice(i + 1, bodyEnd).join("\n");
    const tm = body.match(/^[ \t]*\*\*Trigger:\*\*[ \t]*([\s\S]+)$/m);
    const trigger = tm ? tm[1]!.replace(/\s+/g, " ").trim() : "";
    if (trigger.length === 0) {
      faults.push(`${path}:${at}: \`${slug}\` names no trigger — an idea without one is a slogan`);
    }
    ideas.push({ slug, raised, cluster, outcome: parsed.outcome, onto: parsed.onto, trigger, line: at });
  }
  return { ideas, faults };
}

/** The census, and the falsifier. Pure. */
export function census(ideas: Idea[]): Census {
  const byCluster: Record<string, number> = {};
  const byOutcome: Record<Outcome, number> = { open: 0, promoted: 0, refused: 0 };
  for (const i of ideas) {
    byCluster[i.cluster] = (byCluster[i.cluster] ?? 0) + 1;
    byOutcome[i.outcome]++;
  }
  const total = ideas.length;
  return {
    total,
    byCluster,
    byOutcome,
    promotionRatio: total === 0 ? null : byOutcome.promoted / total,
  };
}

function main(): void {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");
  const gate = argv.includes("--gate");
  const path = join(ROOT, LEDGER);

  if (!existsSync(path)) {
    if (json) console.log(JSON.stringify({ ledger: LEDGER, present: false }));
    else console.log(`idea lint: no ledger at ${LEDGER} — the container is absent (a reversal, not a fault)`);
    return;
  }

  const { ideas, faults } = parseLedger(readFileSync(path, "utf8"));
  const c = census(ideas);

  if (json) {
    console.log(JSON.stringify({ ledger: LEDGER, present: true, ...c, ideas, faults }, null, 2));
    if (gate && faults.length > 0) process.exitCode = 1;
    return;
  }

  console.log(`idea ledger: ${c.total} entr${c.total === 1 ? "y" : "ies"} in ${Object.keys(c.byCluster).length} cluster(s)`);
  for (const [cluster, n] of Object.entries(c.byCluster).sort((a, b) => b[1] - a[1])) {
    const un = ideas.filter((i) => i.cluster === cluster && i.outcome === "open").length;
    console.log(`  ${cluster}: ${n} (${un} open)`);
  }
  const ratio = c.promotionRatio;
  console.log(
    `  outcomes: ${c.byOutcome.open} open · ${c.byOutcome.promoted} promoted · ${c.byOutcome.refused} refused` +
      (ratio === null ? "" : ` — promotion ${(ratio * 100).toFixed(0)}%`),
  );
  if (c.total >= 20 && c.byOutcome.promoted === 0) {
    console.log(
      "  FALSIFIER: the ledger is growing and promoting nothing — ADR-IDEA-LEDGER-064 says delete it, not curate it",
    );
  }

  if (faults.length > 0) {
    console.error(`idea lint: ${faults.length} entr${faults.length === 1 ? "y" : "ies"} failed the trigger gate —`);
    for (const f of faults) console.error(`  ${f}`);
    process.exitCode = 1;
  } else if (gate) {
    console.log("idea lint: OK (every entry names its trigger)");
  }
}

if (import.meta.main) main();
