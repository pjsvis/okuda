/**
 * citation-drift.ts — the finder for a line hint that has moved.
 *
 * **The problem, and it is now a smaller one by design.** A citation's line —
 * `src/render.ts:1164` — is a copy of a fact that lives in the file, and the
 * file moves. Measured 2026-10-30 over the corpus this script walks: of the
 * citations that name a symbol beside their line, **11% still land on it** (5 of
 * 46 at the last run). That measurement is why `ADR-LINE-IS-PROSE-078` took the line *out* of the address:
 * the renderer now gilds the path and leaves the `:NNN` as prose, so the tool no
 * longer promises a row and a stale hint is the author's problem rather than a
 * lie in the affordance register.
 *
 * What remains is a hygiene reading: how many prose hints are stale, where they
 * are, and which ones name their referent well enough to be checkable at all. It
 * keeps the argument that got it built — a line rots because it is a copy — and
 * it keeps the shape of the evidence that would reopen the decision.
 *
 * **Nothing here is gated.** With no promise there is no defect: a hint past EOF
 * is a hint about a file that shrank, not an address that lies. `past-eof` is
 * reported because it is the clearest rot, and the day someone proposes a gate,
 * the numbers below are the argument to have with them.
 *
 * **Why a finder and not a fixer.** Re-anchoring is a claim about intent — the
 * symbol moved and the sentence still means it, or the code changed and the
 * sentence is now false — and a script that rewrites lines converts *wrong* into
 * *plausible*, which is the failure `ADR-TEMPERAMENT-DISCIPLINE-027` calls worse
 * than silence. So this prints; a human takes the diff. The house precedent is
 * `reg-sync`, which writes derived tables and never prose.
 *
 * **The expectation, which is the whole difficulty.** A linter needs to know what
 * the line was supposed to say, and a citation does not carry that. Three
 * substrates exist and only one is free:
 *   - the ident the sentence names — `wrapWholeFile` (`src/render.ts:1164`) —
 *     derivable from the page, no second store, and the house form already. The
 *     attribution is crude on purpose: with two addresses on a line each takes
 *     the text since the previous one, and with one it takes the whole line. A
 *     sentence that names two things therefore yields a proposal, not an answer;
 *   - the line's content at write time — a ledger, refused: a parallel store
 *     that drifts from the thing it describes;
 *   - git (`blame -L`, then follow the hunk) — exact about *moved vs changed*,
 *     and it is the only one that can re-anchor a citation whose prose names
 *     nothing. Deliberate tool, never a gate.
 *
 * **What is gated and what is only read.** A line past EOF cannot hold anything,
 * so `--gate` fails on that alone. Blank, missing and the semantic verdicts are
 * readings: a blank line can be the point, a missing path can be another silo
 * (the seam rule — a reference across a boundary is a message), and a named
 * ident that is not on the line is a proposal, not a verdict. `--gate` is not in
 * `just check` yet: the rung has defects, and one of them is deliberate
 * (`docs/2026-10-30-dogfood-cited-jump.md` demonstrates the clamp).
 *
 * Prints numbers, not conclusions. Run: bun scripts/citation-drift.ts [--json] [--all]
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { RE_CITED_PATH } from "../src/render";
import { scannedFiles } from "./td-id-lint";

const ROOT = resolve(dirname(import.meta.dir), ".");

/** One path carrying a line hint, and the idents the sentence offers as its
 *  referent (same line, backticked, at least four characters — a one- or
 *  two-letter ident is a variable in prose, not a reference). */
export interface Cite {
  source: string;
  at: number; // 1-based line in the citing document
  address: string; // `path:NN` as written
  path: string;
  line: number;
  named: string[];
}

export type Verdict = "ok" | "moved" | "gone" | "unnamed" | "missing" | "past-eof" | "blank";

/** A proposal is where a named ident occurs in the target: `line` and whether
 *  the shape reads as a definition, which is the likelier referent when the
 *  ident is also mentioned in a comment. */
export interface Proposal {
  ident: string;
  line: number;
  definition: boolean;
}

export interface Drift extends Cite {
  verdict: Verdict;
  /** The cited line as it reads now, trimmed. Empty when there is no line. */
  at_text: string;
  proposed: Proposal[];
  /** A missing path that exists with a leading dot: the defect is the address
   *  grammar, not the document — `RE_CITED_PATH` starts at a word character, so
   *  `.archive/…` is read as `archive/…`. Reported, never corrected here. */
  hint?: string;
}

const IDENT = /`([A-Za-z_][A-Za-z0-9_]*)`/g;
const DEFINITION = /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|const|let|var|class|type|interface|enum|def|fn|struct|trait|impl)\b/;

/** Every citation in a document that carries a line, with the idents its line
 *  offers. Only addressed citations: a bare path has no coordinate to drift, and
 *  its existence is the paint gate's question (ADR-045). Pure. */
export function citationsIn(text: string, source: string): Cite[] {
  const out: Cite[] = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const matches = [...line.matchAll(RE_CITED_PATH)];
    // Two hints on one line are two claims; attributing the whole line's idents
    // to both made each citation the other's evidence. With one hint the whole
    // line is fair game — the house form often names the referent after it.
    const multi = matches.length > 1;
    let cursor = 0;
    for (const m of matches) {
      const path = m[0]!;
      const at = m.index!;
      const segment = multi ? line.slice(cursor, at) : line;
      cursor = at + path.length;
      // The hint is the `:NN` immediately after the gilded path — the renderer's
      // own grammar for what lifts, then the author's prose for the row. Reading
      // it this way keeps one extension list (ADR-LINE-IS-PROSE-078).
      const hint = /^:(\d+)(?:-(\d+))?\b/.exec(line.slice(cursor));
      if (!hint) continue;
      const address = `${path}:${hint[1]}${hint[2] ? `-${hint[2]}` : ""}`;
      const named = [...segment.matchAll(IDENT)].map((x) => x[1]!).filter((s) => s.length >= 4);
      out.push({ source, at: i + 1, address, path, line: Number(hint[1]), named: [...new Set(named)] });
    }
  }
  return out;
}

/** The verdict for one citation against its target's lines (`null` = no such
 *  file). Pure, so the classification is testable without a corpus. */
export function judge(cite: Cite, target: string[] | null): Drift {
  const base = { ...cite, at_text: "", proposed: [] as Proposal[] };
  if (target === null) return { ...base, verdict: "missing" };
  const at = cite.line > 0 ? target[cite.line - 1] : undefined;
  if (at === undefined) return { ...base, verdict: "past-eof" };
  const atText = at.trim();
  if (atText === "") return { ...base, verdict: "blank", at_text: atText };
  if (cite.named.length === 0) return { ...base, verdict: "unnamed", at_text: atText };
  if (cite.named.some((id) => at.includes(id))) return { ...base, verdict: "ok", at_text: atText };
  const proposed: Proposal[] = [];
  for (const ident of cite.named) {
    for (let i = 0; i < target.length; i++) {
      if (target[i]!.includes(ident)) {
        proposed.push({ ident, line: i + 1, definition: DEFINITION.test(target[i]!) });
      }
    }
  }
  // A definition is the likelier referent; among equals, the nearest wins — the
  // move is usually a local one, and a proposal a reader can accept at a glance
  // is worth more than an exhaustive list.
  proposed.sort(
    (a, b) =>
      Number(b.definition) - Number(a.definition) ||
      Math.abs(a.line - cite.line) - Math.abs(b.line - cite.line),
  );
  return {
    ...base,
    verdict: proposed.length > 0 ? "moved" : "gone",
    at_text: atText,
    proposed: proposed.slice(0, 3),
  };
}

/** The corpus: the same file set the other lints walk (`scannedFiles`), minus
 *  the archive — a settled document is history, and rewriting its coordinates
 *  would edit a record rather than maintain one. */
export function walk(root = ROOT): Drift[] {
  const cwd = process.cwd();
  process.chdir(root);
  let files: string[];
  try {
    files = scannedFiles().filter((f) => f.endsWith(".md"));
  } finally {
    process.chdir(cwd);
  }
  const out: Drift[] = [];
  const targetCache = new Map<string, string[] | null>();
  for (const file of files) {
    const text = readFileSync(join(root, file), "utf8");
    for (const cite of citationsIn(text, file)) {
      let target = targetCache.get(cite.path);
      if (target === undefined) {
        const p = join(root, cite.path);
        target = existsSync(p) ? readFileSync(p, "utf8").split("\n") : null;
        targetCache.set(cite.path, target);
      }
      const row = judge(cite, target);
      if (row.verdict === "missing" && existsSync(join(root, "." + cite.path))) {
        row.hint = `exists only as .${cite.path} — the address grammar drops a leading dot`;
      }
      out.push(row);
    }
  }
  return out;
}

const ORDER: Verdict[] = ["past-eof", "blank", "missing", "gone", "moved", "unnamed", "ok"];
const LABEL: Record<Verdict, string> = {
  "past-eof": "past EOF — the hint points beyond the file",
  blank: "blank line (the blank may be the point)",
  missing: "no such file here (it may be another silo)",
  gone: "GONE — the sentence names an ident this file does not hold",
  moved: "MOVED — the named ident is elsewhere; a line is proposed",
  unnamed: "unnamed — nothing to check (the expectation problem)",
  ok: "lands on the named ident",
};

export function counts(rows: Drift[]): Map<Verdict, number> {
  const m = new Map<Verdict, number>(ORDER.map((v) => [v, 0]));
  for (const r of rows) m.set(r.verdict, (m.get(r.verdict) ?? 0) + 1);
  return m;
}

function main(): void {
  const argv = new Set(process.argv.slice(2));
  const rows = walk();
  if (argv.has("--json")) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  const n = counts(rows);
  const named = (n.get("ok") ?? 0) + (n.get("moved") ?? 0) + (n.get("gone") ?? 0);
  console.log(`citation-drift — ${rows.length} path(s) carrying a line hint, ${named} naming a referent\n`);
  for (const v of ORDER) {
    console.log(`  ${String(n.get(v)).padStart(4)}  ${LABEL[v]}`);
  }
  if (named > 0) {
    console.log(`\n  of the named: ${n.get("ok")} land (${Math.round(((n.get("ok") ?? 0) / named) * 100)}%), ${n.get("moved")} moved, ${n.get("gone")} gone`);
  }
  const limit = argv.has("--all") ? Infinity : 8;
  for (const v of ORDER) {
    const rowsOf = rows.filter((r) => r.verdict === v);
    if (v === "ok" || v === "unnamed" || rowsOf.length === 0) continue;
    console.log(`\n${LABEL[v]} — ${rowsOf.length}`);
    for (const r of rowsOf.slice(0, limit)) {
      const where = `${r.source}:${r.at}  ${r.address}`;
      if (r.verdict === "moved") {
        const to = r.proposed.map((p) => `${p.ident}:${p.line}${p.definition ? "*" : ""}`).join(" ");
        console.log(`  ${where}\n      → ${to}    (was "${r.at_text.slice(0, 48)}")`);
      } else {
        const shown = r.verdict === "past-eof" || r.verdict === "missing" ? "" : `  "${r.at_text || "(blank)"}"`;
        const names = r.named.length && v !== "past-eof" ? `  names ${r.named.join(",")}` : "";
        const hint = r.hint ? `\n      ! ${r.hint}` : "";
        console.log(`  ${where}${shown}${names}${hint}`);
      }
    }
    if (rowsOf.length > limit) console.log(`  … ${rowsOf.length - limit} more (--all)`);
  }
  console.log(`\n* definition-shaped occurrence. Proposals are proposals: re-anchoring is a claim about intent, so a diff is printed and a human takes it.`);
  console.log(
    `citation-drift: a reading — nothing is gated, because the renderer no longer ` +
      "promises a row (`ADR-LINE-IS-PROSE-078`).",
  );
}

if (import.meta.main) main();
