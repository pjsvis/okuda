#!/usr/bin/env bun
/**
 * vector-check.ts — headless assertion of the vector contract (ADR-031).
 *
 * Renders &alpha.md the way the TUI does (annotated, through
 * renderDocument) and asserts every case in the dogfood range:
 *   - every discovered reference carries its painted silcrow
 *   - the numbers run 11+ in reading order (one-to-many: repeats keep
 *     their own vectors)
 *   - zero-padded bracketed numbers, external URLs, and legacy
 *     okuda-rhs tokens are never painted
 *   - no paint marker leaks into the frame
 *
 * Exit 0 = the contract holds on this glass; 1 = a named failure.
 * `just dogfood` runs this, then opens the glass.
 */

import { renderDocument } from "../src/render";
import { loadPalette } from "../src/palette";
import { detectColorMode } from "../src/ansi";
import { jumpMapFor, annotateSource, scanReferences, VECTOR_MIN, MAX_REFS } from "../src/vectors";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOC = join(ROOT, "&alpha.md");

const source = await Bun.file(DOC).text();
const palette = loadPalette();
const color = detectColorMode(process.env as NodeJS.ProcessEnv);

const map = jumpMapFor(source);
const annotated = annotateSource(source, map);
const out = await renderDocument(annotated, { width: 100, palette, color });
const plain = out.replace(/\x1b\[[0-9;]*m/g, "");

let fail = 0;
const ok = (msg: string): void => console.log(`  ✓ ${msg}`);
const bad = (msg: string): void => { console.error(`  ✗ ${msg}`); fail++; };

// 1. Every discovered reference is painted, in reading order.
const refs = scanReferences(source);
const painted = [...out.matchAll(/§(\d{2})/g)].map((m) => Number(m[1]!));
for (let i = 0; i < refs.length; i++) {
  const num = VECTOR_MIN + i;
  if (!painted.includes(num)) bad(`§${num} (${refs[i]!.target}) is not painted`);
}
if (painted.length >= refs.length && refs.length > 0) ok(`${painted.length} silcrow(s) painted, map size ${map.size}`);

// 2. Reading order: the painted sequence is 11, 12, … (one-to-many
//    allows repeated numbers; the ORDER must still ascend).
const ascending = painted.every((n, i) => i === 0 || n >= painted[i - 1]!);
if (ascending) ok("painted numbers ascend in reading order");
else bad(`painted numbers do not ascend: ${painted.join(", ")}`);

// 3. No marker leaks into the frame.
if (/%okuda-(?:vector|rhs):/.test(out)) bad("a paint marker leaked into the frame");
else ok("no paint markers leaked");

// 4. Zero-padded bracketed numbers are text, never vectors.
const userNums = [...plain.matchAll(/\[0?\d\]|\[0\d\]/g)].map((m) => m[0]!);
const paintedUserNums = userNums.filter((n) => new RegExp(`§${n.slice(1, -1)}(?=\\D|$)`).test(plain));
if (paintedUserNums.length === 0) ok("zero-padded numbers stay text");
else bad(`user numbers were painted: ${paintedUserNums.join(", ")}`);

// 5. The external URL is never vectorised.
if (/§\d+\s*(https|github)/i.test(plain) || /github\.com[^\n]*§/.test(plain)) bad("an external URL was vectorised");
else ok("the external URL stays a link, never a vector");

// 6. Legacy tokens leave no badge and no text.
if (/§\d+\s*(briefs\/x\.md)/.test(plain) || plain.includes("okuda-rhs")) bad("legacy wiring leaked or was honoured");
else ok("legacy okuda-rhs wiring is stripped and unhonoured");

if (fail > 0) {
  console.error(`vector-check: FAIL — ${fail} case(s)`);
  process.exit(1);
}
console.log(`vector-check: OK — ${map.size} mapped, ${painted.length} painted, ${MAX_REFS} addressable`);
