/**
 * ref-census.ts — the reference namespace, counted.
 *
 * **Why this exists.** The house rule is `feat/<name>` → fast-forward into
 * `main`, and `git merge --ff-only` fails loudly the moment a branch is stale —
 * so the rule is *self-enforcing* and the discipline still decayed. What was
 * missing is observation: `just check` lints the **files** (tracked symlinks,
 * truncated ids, callsigns, dates, the archive queue, prose leaks) and had **no
 * opinion about the ref namespace at all.** A branch can sit 369 commits behind
 * and nothing in the gate says a word. The moment a branch is a day old,
 * fast-forward becomes a rebase, which is work, which is why it slid.
 *
 * **The cost of a stale ref is not the lost work — it is the concealment.** One
 * audit found twelve non-main local branches of which exactly **one** held
 * unlanded work; the other eleven were merged, superseded, or duplicated. With
 * twelve live-*looking* refs, the one that matters is indistinguishable from the
 * eleven that do not. That is ADR-TEMPERAMENT-DISCIPLINE-027's *misleading
 * confidently*, one level up. A merged branch has zero value and positive cost:
 * it is what makes a census unreadable.
 *
 * **The rule, and it is two rules.**
 *   1. A branch whose tip is in `main` is **deleted** — it carries nothing.
 *   2. A branch that is not in `main` is either **current** (`ahead` of main and
 *      not behind it, so it can still fast-forward) or **declared**: named in
 *      `DECLARED` below with the condition that kills it and a review date. A
 *      branch that stops moving names the condition that kills it, or it dies —
 *      that is the whole difference between a siding and a queue.
 *
 * **What is gated and what is only reported.** Age, behind-count and the unique
 * commit subjects are *reported*, never gated: a census that nags about taste
 * becomes the alarm that fires on every render, which `BRF-BOUNDARY-MARK`
 * refuses. Only the two rules above fail, because neither is a matter of taste —
 * and each failure names its own remedy.
 *
 * Prints numbers, not conclusions. `--gate` exits 1 on a violation.
 *
 * Run: bun scripts/ref-census.ts [--gate]
 */
import { execFileSync } from "node:child_process";

const GATE = process.argv.includes("--gate");
const BASE = "main";

/** A branch that is not merged and not current must be declared here: the
 *  condition that kills it, and a date by which someone must look again. An
 *  undeclared stale branch is a siding; a declared one past its review date is
 *  one nobody looked at. Both are the same failure — nothing is watching. */
const DECLARED: Record<string, { why: string; review: string }> = {
  "feat/television-preview": {
    why: "BRF-TELEVISION-PREVIEW — parked on television #999 (fzf-style pane envs); the branch dies unmerged when the FZF_PREVIEW_COLUMNS gap closes upstream",
    review: "2026-11-15",
  },
};

const git = (...args: string[]): string =>
  execFileSync("git", args, { encoding: "utf8" }).trimEnd();

const today = new Date();
const days = (iso: string): number => Math.floor((today.getTime() - new Date(iso).getTime()) / 86_400_000);

const branches = git("for-each-ref", "--format=%(refname:short)|%(committerdate:iso-strict)", "refs/heads")
  .split("\n")
  .filter((s) => s !== "")
  .map((l) => {
    const [name, date] = l.split("|") as [string, string];
    return { name, date };
  })
  .filter((b) => b.name !== BASE);

interface Row {
  name: string;
  ahead: number;
  behind: number;
  age: number;
  subjects: string[];
}

const rows: Row[] = branches.map((b) => ({
  name: b.name,
  ahead: Number(git("rev-list", "--count", `${BASE}..${b.name}`)),
  behind: Number(git("rev-list", "--count", `${b.name}..${BASE}`)),
  age: days(b.date),
  subjects: git("log", "--format=%s", "-n", "3", `${BASE}..${b.name}`).split("\n").filter((s) => s !== ""),
}));

// The board half: an in_progress task whose branch is stale is the same failure
// one level up. The board should not be able to say "in progress" about work no
// live session holds.
let inProgress: { id: string; title: string; branch?: string }[] = [];
try {
  const raw = execFileSync("td", ["list", "--json"], { encoding: "utf8" });
  inProgress = (JSON.parse(raw) as { id: string; title: string; status: string; branch?: string }[])
    .filter((t) => t.status === "in_progress")
    .map((t) => ({ id: t.id, title: t.title, branch: t.branch }));
} catch {
  inProgress = []; // td absent: the ref half still stands
}

const merged = rows.filter((r) => r.ahead === 0);
const sidings = rows.filter((r) => r.ahead > 0 && r.behind > 0 && DECLARED[r.name] === undefined);
const expired = rows.filter((r) => DECLARED[r.name] !== undefined && new Date(DECLARED[r.name]!.review) < today);

console.log(`ref-census — ${rows.length} branch(es) beside ${BASE}, ${inProgress.length} task(s) in progress`);
console.log("");
for (const r of [...rows].sort((a, b) => b.behind - a.behind)) {
  const d = DECLARED[r.name];
  const state =
    r.ahead === 0 ? "MERGED  " : r.behind === 0 ? "current " : d ? "declared" : "SIDING  ";
  const note = d ? `  → declared: ${d.why} (review ${d.review})` : "";
  console.log(`  ${state} ${r.name.padEnd(24)} ${String(r.ahead).padStart(3)} ahead, ${String(r.behind).padStart(4)} behind, ${String(r.age).padStart(4)}d${note}`);
  for (const s of r.subjects) console.log(`             ${s.slice(0, 88)}`);
}
console.log("");

if (inProgress.length > 0) {
  console.log("in progress, per the board:");
  for (const t of inProgress) {
    const r = rows.find((x) => x.branch === t.id || t.branch === x.name);
    const stale = r !== undefined && r.ahead > 0 && r.behind > 0;
    console.log(`  ${t.id}  ${t.title.slice(0, 60)}${stale ? "  ← branch is behind main" : ""}`);
  }
  console.log("");
}

const fail = [
  ...merged.map((r) => `merged but still here: ${r.name} — git branch -d ${r.name}`),
  ...sidings.map((r) => `siding (cannot fast-forward): ${r.name} — rebase it, land it, or declare it in ref-census.ts`),
  ...expired.map((r) => `declaration expired: ${r.name} — review date ${DECLARED[r.name]!.review} has passed`),
];

if (fail.length === 0) {
  console.log(`ref-census: OK (${merged.length} merged, ${rows.length - merged.length} live, ${Object.keys(DECLARED).length} declared)`);
  process.exit(0);
}

for (const line of fail) console.error(`  ${line}`);
if (GATE) {
  console.error(`ref-census: FAIL — ${fail.length} ref(s) carry nothing or carry it out of date`);
  process.exit(1);
}
console.log(`ref-census: ${fail.length} finding(s) (report only)`);
