#!/usr/bin/env bun
/**
 * vector-check.ts — headless assertion of the vector contract (ADR-031).
 *
 * Renders &alpha.md the way the TUI does (annotated, through
 * renderDocument) and asserts every case in the dogfood range:
 *   - every discovered reference carries its painted silcrow
 *   - the numbers run from VECTOR_MIN in reading order, skipping the
 *     doubled pairs (ADR-032 canon — one actuator class, never jumps);
 *     one destination, one silcrow — repeats reuse the number
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
import { jumpMapFor, annotateSource, scanReferences, VECTOR_MIN, VECTOR_MAX, MAX_ADDRESSES, RESERVED_VECTORS } from "../src/vectors";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOC = join(ROOT, "&alpha.md");

const source = await Bun.file(DOC).text();
const palette = loadPalette();
const color = detectColorMode(process.env as NodeJS.ProcessEnv);
// The premise is RGB: silcrows paint in the palette's truecolour rose.
// Under `none` (NO_COLOR/dumb) there is no RGB to match — fail once,
// named, not 22 times as "not painted".
if (color !== "truecolor") {
  console.error(`vector-check: needs truecolor, got '${color}' (NO_COLOR? TERM=dumb?)`);
  process.exit(1);
}

const map = jumpMapFor(source);
const annotated = annotateSource(source, map);
const out = await renderDocument(annotated, { width: 100, palette, color });
const plain = out.replace(/\x1b\[[0-9;]*m/g, "");
// Only PAINTED silcrows count — literal §NN text in prose is the
// user's, and the reserved paint is what makes ours ours.
const vectorHex = palette["vector"]!.replace("#", "");
const vectorRgb = [0, 2, 4].map((i) => parseInt(vectorHex.slice(i, i + 2), 16)).join(";");
// b6b701c: the silcrow is bold everywhere (weight reconciled) — the
// paint reads `SGR 38;2;R;G;B;1`, and the bold attribute is part of the
// contract. The colour-only form is stale: af72d3e wrote it, the weight
// reconciliation outran it, and the smoke ran red for ~115 commits.
const paintedRe = new RegExp(`\\x1b\\[38;2;${vectorRgb};1m§(\\d{2})\\x1b\\[0m`, "g");

let fail = 0;
const ok = (msg: string): void => console.log(`  ✓ ${msg}`);
const bad = (msg: string): void => { console.error(`  ✗ ${msg}`); fail++; };

// 1. Every unique destination carries its silcrow (one destination,
//    one silcrow — repeats reuse the number).
const refs = scanReferences(source);
const unique = [...new Set(refs.map((r) => r.target))];
const painted = [...out.matchAll(paintedRe)].map((m) => Number(m[1]!));
// The i-th unique destination holds the i-th assignable address:
// ascend from VECTOR_MIN, skipping the doubled pairs — the walk
// buildJumpMap performs (ADR-032 canon). Walked independently here so
// the check catches an allocator that lies, rather than trusting the
// map's own numbering.
let n = VECTOR_MIN;
for (let i = 0; i < unique.length; i++) {
  while (RESERVED_VECTORS.has(n)) n++;
  const num = n++;
  if (num > VECTOR_MAX) break; // over-cap destinations carry no vector
  if (!painted.includes(num)) bad(`§${num} (${unique[i]!}) is not painted`);
}
if (painted.length >= unique.length && unique.length > 0) ok(`${painted.length} silcrow(s) painted, ${unique.length} destinations, map size ${map.size}`);

// 2. Every painted number is a valid map entry — no invention.
const mapKeys = new Set(map.keys());
if (painted.every((n) => mapKeys.has(n))) ok("every painted number is a mapped vector");
else bad(`painted numbers outside the map: ${painted.filter((n) => !mapKeys.has(n)).join(", ")}`);

// 2b. The citation convention: repeated destinations reuse exactly
//     their number, once per mention (repeats never get new numbers).
const mentionCounts = new Map<string, number>();
for (const r of refs) mentionCounts.set(r.target, (mentionCounts.get(r.target) ?? 0) + 1);
const numByTarget = new Map<string, number>();
for (const [num, target] of map) numByTarget.set(target, num);
let conventionHolds = true;
for (const [target, count] of mentionCounts) {
  const num = numByTarget.get(target);
  if (num === undefined) continue; // over-cap destination — unpainted
  const paintCount = painted.filter((n) => n === num).length;
  if (paintCount !== count) { conventionHolds = false; bad(`citation convention broken: ${target} has ${count} mention(s) but ${paintCount} paint(s) of §${num}`); }
}
if (conventionHolds) ok("the citation convention holds — repeats reuse the silcrow");

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
console.log(`vector-check: OK — ${map.size} mapped, ${painted.length} painted, ${MAX_ADDRESSES} addressable`);
