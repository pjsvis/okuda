#!/usr/bin/env bun
/**
 * amp-briefs.ts — the &briefs state table: membership derived, grouping editorial.
 *
 * `&briefs.md` is a hand-grouped view of the briefs registry. Its ROWS are the
 * registry's membership; its SECTIONS, state glyphs, narratives and debrief links are
 * the editor's. This script reconciles the membership only
 * (ADR-DERIVED-AMP-TABLE-058):
 *
 *   - a live brief absent from the table is appended to its status's default
 *     section (the row shape derived: callsign, glyph, summary);
 *   - a tabled callsign that resolves against neither the live nor the archive
 *     registry is a phantom — reported, never deleted;
 *   - every existing row is left untouched.
 *
 * `--check` (default) reports and exits 1 while the table is unfiled.
 * `--write` appends the missing rows (and refuses while a phantom remains).
 *
 * Usage: bun scripts/amp-briefs.ts [--check|--write]
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOC = join(ROOT, "&briefs.md");

type Entry = { callsign: string; status: string; summary: string };

function loadRegistry(path: string): Entry[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as Entry);
}

const live = loadRegistry(join(ROOT, "briefs/INDEX.jsonl"));
const archive = loadRegistry(join(ROOT, ".archive/briefs/INDEX.jsonl"));
const known = new Set<string>([...live, ...archive].map((e) => e.callsign));

// Registry status → the section heading a new row lands under, by prefix.
// The editor moves it from there; this map is the only default.
const SECTION: Record<string, string> = {
  open: "Open queue",
  // The heading already exists by hand (BRF-AMP-TABLE): the vocabulary was the
  // half that lagged. The map is prefix-based, so it matches that heading.
  ready: "Ready — specced, next up",
  done: "Landed — debrief on file",
  parked: "Parked / deferred",
  rejected: "Closed by other means",
};
const GLYPH: Record<string, string> = {
  open: "· open",
  ready: "▸ ready",
  done: "✓ done",
  parked: "↓ parked",
  rejected: "✗ rejected",
};

const source = readFileSync(DOC, "utf8");
const lines = source.split("\n");

type Section = { title: string; lastRow: number };
const sections: Section[] = [];
const tabled = new Set<string>();
let current: Section | null = null;

for (let i = 0; i < lines.length; i++) {
  const heading = lines[i]!.match(/^##\s+(.*\S)\s*$/);
  if (heading) {
    current = { title: heading[1]!, lastRow: i };
    sections.push(current);
    continue;
  }
  const row = lines[i]!.match(/^\|\s*(BRF-[A-Z0-9-]+)\s*\|/);
  if (row && current) {
    current.lastRow = i;
    tabled.add(row[1]!);
  }
}

const sectionByPrefix = (prefix: string): Section | undefined =>
  sections.find((s) => s.title.startsWith(prefix));

const errors: string[] = [];

// Phantoms — tabled, resolving nowhere. Reported; never deleted.
for (const c of tabled) {
  if (!known.has(c)) errors.push(`phantom — tabled brief not in the live or archive registry: ${c}`);
}

// Missing — live, absent from the table. Appended to the status default.
type Add = { section: Section; row: string };
const adds: Add[] = [];
for (const e of live) {
  if (tabled.has(e.callsign)) continue;
  const section = sectionByPrefix(SECTION[e.status] ?? "Open queue");
  if (!section) {
    errors.push(`no section for status '${e.status}' (brief ${e.callsign})`);
    continue;
  }
  // The fourth column is the ROW's narrative: what the work was, in one phrase.
  // Named `narrative` because the header says so — the panel's vocabulary and
  // its producer's must not drift (the one-constant rule, applied to a word).
  const narrative = e.summary.replace(/\|/g, "\\|");
  adds.push({ section, row: `| ${e.callsign} | ${GLYPH[e.status] ?? "· open"} | ${narrative} | — |` });
}

for (const e of errors) console.error(`✗ &briefs — ${e}`);

const write = process.argv.includes("--write");

if (adds.length === 0) {
  if (!errors.length) {
    console.log(
      `amp-briefs: OK — ${tabled.size} tabled, ${live.length} live, ${archive.length} archived`,
    );
  }
  process.exit(errors.length ? 1 : 0);
}

if (!write) {
  console.error(`✗ &briefs — ${adds.length} live brief(s) unfiled; run: just amp-regen`);
  for (const a of adds) console.error(`  + ${a.row}`);
  process.exit(1);
}

if (errors.length) {
  console.error(`amp-briefs: refusing to write while ${errors.length} phantom(s) remain`);
  process.exit(1);
}

// Append each section's rows after its last row, bottom-up so indices hold.
const bySection = new Map<Section, string[]>();
for (const a of adds) {
  const rows = bySection.get(a.section) ?? [];
  rows.push(a.row);
  bySection.set(a.section, rows);
}
for (const [section, rows] of [...bySection].sort((x, y) => y[0].lastRow - x[0].lastRow)) {
  lines.splice(section.lastRow + 1, 0, ...rows);
}
writeFileSync(DOC, lines.join("\n"));
console.log(`amp-briefs: wrote ${adds.length} new row(s) across ${bySection.size} section(s)`);
