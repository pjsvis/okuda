#!/usr/bin/env bash
# search-smoke.sh — prove the -g content search works, end to end, no TTY.
#
# The conformance chain, each link loud:
#   1. fresh    — the binary on PATH is this checkout's HEAD.
#   2. entries  — rankedShortlistEntries() emits path<TAB>snippet lines.
#   3. fzf      — the exact picker flags (--filter mode) find the query
#                 in the entries' *snippets*, not just filenames.
#
# The scenario is the operator's: type a version number, find the
# dependencies row. Exit 0 = the search works; any failure names the
# broken link.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

QUERY="${1:-load bearing}"
WANT="${2:-briefs/2026-08-26-brief-tui-live-documents.md}"
# Custom scenarios: bash scripts/search-smoke.sh <query> <expected-path>
# (the just recipe is parameterless — facade-lint forbids param defaults).

# ── 1. binary freshness ────────────────────────────────────────────────
bash scripts/fresh.sh

# ── 2. the merge produces evidence-carrying entries ───────────────────
bun -e '
import { rankedShortlistEntries } from "./src/launcher";
const entries = rankedShortlistEntries(process.argv[1]!);
if (entries.length === 0) { console.error("smoke: FAIL — merge returned zero entries"); process.exit(1); }
const withSnippet = entries.filter((e) => e.includes("\t") && e.split("\t")[1]!.length > 0);
console.log(`smoke: merge OK — ${entries.length} entries, ${withSnippet.length} with content evidence`);
console.log("smoke: sample —", (withSnippet[0] ?? entries[0]!).slice(0, 100));
' "$QUERY"

# ── 3. fzf finds it (async spawn, stdin pipe — Bun.spawnSync's `input`
#       option is a silent no-op in bun 1.4.0) ──────────────────────────
bun -e '
import { rankedShortlistEntries } from "./src/launcher";
const [query, want] = [process.argv[1]!, process.argv[2]!];
const entries = rankedShortlistEntries(query);
const args = ["fzf", "--filter", query, "--exact", "--tiebreak=index", "--delimiter=\t"];
const proc = Bun.spawn(args, { stdin: "pipe", stdout: "pipe", env: { ...process.env, FZF_DEFAULT_OPTS: "" } });
proc.stdin.write(entries.join("\n") + "\n");
await proc.stdin.end();
const out = await new Response(proc.stdout).text();
const matches = out.split("\n").filter(Boolean).map((l) => l.split("\t")[0]!.trimEnd());
if (!matches.includes(want)) {
  console.error(`smoke: FAIL — fzf "${query}" returned ${matches.length} matches, none is ${want}`);
  console.error("smoke: top matches:", matches.slice(0, 5).join(" | ") || "(none)");
  process.exit(1);
}
console.log(`smoke: PASS — fzf "${query}" surfaces ${want} (${matches.length} matches)`);
' "$QUERY" "$WANT"

echo "search-smoke: OK — $QUERY → $WANT, end to end"
