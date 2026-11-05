#!/usr/bin/env bun
// ── seams.ts — the seam census: every inbound crossing, and its rung ──
//
// The silo is a closed system, so confounding cannot be manufactured at
// home — it can only be imported. The candidate set is the **inbound
// crossings**: ambient state written outside our boundary that reaches a
// knob and an observable both. `explainers/causation.md` states the law and
// the ladder; this script is the instrument that keeps the ladder honest.
//
// Two halves, in the registry's shape (`derived, not specified`):
//
//   - **Derived** — the crossings, grep'd out of `src/` with comments
//     stripped, so the list cannot drift from the code.
//   - **Declared** — one policy row per crossing: its rung on the ladder
//     (cut / control / lag / declare) and one clause of why. A judgement,
//     recorded where it can be argued with.
//
// The gate holds the two together and fails on three defects:
//
//   MISSING — a crossing exists in `src/` with no policy row. A new ambient
//             read arrived without anyone naming its rung.
//   STALE   — a policy row whose crossing is gone. The arrow was cut; the
//             record must be updated, not left as a claim about air.
//   CLOSED  — a refused arrow whose verifier no longer holds. The `closed`
//             list is the dotted edge as a lint: an arrow we decided not to
//             have, with a pattern that must NOT appear in `src/`. When a
//             refusal stops being true, that is news, not drift.
//
// Usage:
//   bun scripts/seams.ts            # the census (a reading; exit 0)
//   bun scripts/seams.ts --gate     # the gate (exit 1 on any defect)

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const SRC = join(ROOT, "src");

type Rung = "cut" | "control" | "lag" | "declare";

interface Policy {
  /** `<file> <key>` — the crossing, named as the census names it. */
  key: string;
  rung: Rung;
  /** One clause. If it needs two sentences, it is two crossings. */
  why: string;
}

/** The ladder, in order of deletion cost. `adjust` is not offered: a rung we
 *  reach for only when the four above are unavailable, and in this silo they
 *  rarely are (`explainers/causation.md`). */
const POLICY: Policy[] = [
  // ── env — the host is the config system (docs/2026-08-31-actuator-inputs.md:51).
  //    A variable is a declared frame input: set it and the render is a
  //    function of it. Nothing to cut (the host owns the launch), nothing to
  //    control (there is no second source for a launch parameter).
  { key: "cli.ts env:*", rung: "declare", why: "colour protocol — NO_COLOR / FORCE_COLOR / TERM, read whole, honoured as declared" },
  { key: "clone.ts env:EDITOR", rung: "declare", why: "the host names the editor; the fallback chain is the declaration" },
  { key: "clone.ts env:OKUDA_CLONE_CMD", rung: "declare", why: "windowing belongs to the host; the command is its contract" },
  { key: "clone.ts env:OKUDA_EDITOR", rung: "declare", why: "an explicit override, ranked above the convention" },
  { key: "clone.ts env:OKUDA_TERMINAL", rung: "declare", why: "the same, for the terminal integration's name" },
  { key: "clone.ts env:SHELL", rung: "declare", why: "read, and known to lie — a box asserting zsh while running bash; the override exists for that" },
  { key: "clone.ts env:TMUX", rung: "declare", why: "presence selects the multiplexer path; declared, not inferred" },
  { key: "clone.ts env:TERMINAL", rung: "declare", why: "the conventional name, ranked below the explicit override" },
  { key: "clone.ts env:VISUAL", rung: "declare", why: "convention, ranked below OKUDA_EDITOR" },
  { key: "keygrammar.ts env:OKUDA_READONLY", rung: "declare", why: "a mode the host pins; the grammar reads it once, at boot" },
  { key: "launcher.ts env:*", rung: "declare", why: "the whole environment is forwarded to the child and scanned for its name" },
  { key: "launcher.ts env:NO_COLOR", rung: "declare", why: "colour protocol, same as cli's read" },
  { key: "launcher.ts env:PATH", rung: "declare", why: "where the tools live is the host's fact, not ours" },
  { key: "palette.ts env:HOME", rung: "declare", why: "the palette's default path is under the host's home" },
  { key: "render.ts env:*", rung: "control", why: "the child's environment is passed deliberately and COLUMNS is OVERRIDDEN with ours — the ambient width cannot reach layout (ADR-PANE-NOT-CANVAS-069)" },
  { key: "render.ts env:HOME", rung: "declare", why: "the diagram binary's install path, same as the palette's" },
  { key: "tui.ts env:*", rung: "declare", why: "colour protocol, read whole at boot" },
  { key: "tui.ts env:OKUDA_CLONE", rung: "declare", why: "which host integration to actuate; a declared choice, never guessed" },
  { key: "tui.ts env:OKUDA_CLONE_CMD", rung: "declare", why: "the host's own command, run verbatim" },
  { key: "tui.ts env:OKUDA_FRAME_LOG", rung: "control", why: "the frame trace IS the second instrument — the reading that settled the widening jolt (ADR-WIDENING-LAG-054)" },
  { key: "tui.ts env:TMUX", rung: "declare", why: "presence selects the multiplexer path for a dereference" },
  { key: "width.ts env:FZF_PREVIEW_COLUMNS", rung: "declare", why: "the preview pane hands us its width; its presence means 'you are in a preview'" },
  { key: "cli.ts env:OKUDA_SYMBOLS", rung: "declare", why: "the symbol repertoire is chosen by the principal and never inferred from the face (BRF-SYMBOL-PLAIN); an ambient default would make the page machine-dependent" },
  // ── tty — the glass. It can lie (Bun's columns=0), so it is never trusted
  //    to a single reading.
  { key: "tui.ts tty:columns", rung: "control", why: "read through terminalSize, whose tput fallback is the independent instrument (src/width.ts:287-306)" },
  { key: "tui.ts tty:rows", rung: "control", why: "same instrument; the frame trace prints tty beside the resolved size for this reason" },
  { key: "width.ts tty:isTTY", rung: "control", why: "the gate that keeps a pipe's default winsize out of the measurement" },
  { key: "width.ts tty:rows", rung: "control", why: "winsize first, terminfo second, and a disagreement is the finding" },
  { key: "width.ts tty:columns", rung: "control", why: "the control itself: winsize first, terminfo second, and the two disagreeing is the finding" },
  // ── the filesystem's opinion about when, never what
  { key: "cli.ts fs:watch", rung: "control", why: "a notification is not a change: the content gate re-reads and compares rendered lines (ADR-RESIZE-GEOMETRY-046)" },
  // ── other processes
  { key: "launcher.ts proc:spawn", rung: "declare", why: "the search tool's answers are the subject, not ambient state" },
  { key: "render.ts proc:spawn", rung: "declare", why: "the diagram engine's art is content; its refusal is a named fact, not silence" },
  { key: "root.ts proc:spawn", rung: "declare", why: "git's answer to 'where is the top' is a fact about the host" },
  { key: "tui.ts proc:spawn", rung: "declare", why: "a dereference actuates the host; its failure is reported, not swallowed" },
  // ── signals
  { key: "cli.ts signal:SIGWINCH", rung: "lag", why: "geometry is adopted on the reader's intent, held in the widening direction (ADR-WIDENING-LAG-054)" },
  { key: "tui.ts signal:SIGINT", rung: "declare", why: "the exit is the host's request; the handler restores the terminal and infers nothing from it" },
  { key: "tui.ts signal:SIGTERM", rung: "declare", why: "the same handler, the same refusal to infer" },
  { key: "tui.ts signal:SIGWINCH", rung: "lag", why: "coalesced and held by direction; a one-column jolt is not a resize" },
  // ── the clock
  { key: "cli.ts tty:isTTY", rung: "declare", why: "the printing path branches on it; a pipe is a first-class reader" },
];

/** Refused arrows — the dotted edges, as executable claims. Each must hold:
 *  if the pattern ever appears in the watched files, the refusal has been
 *  quietly reversed and the gate says so. */
interface Closed {
  claim: string;
  /** Regex that must NOT appear in `files`. */
  absent: string;
  files: string[];
  why: string;
}

const CLOSED: Closed[] = [
  {
    claim: "no ambient `$COLUMNS` read reaches the diagram layout",
    absent: "process\\.env\\.COLUMNS|process\\.env\\[.COLUMNS.",
    files: ["src/render.ts"],
    why: "the canvas is a constant; the ambient width stopped composing art (ADR-PANE-NOT-CANVAS-069)",
  },
  {
    claim: "the render never reads the clock or randomness",
    absent: "Date\\.now|new Date\\(|Math\\.random|performance\\.now",
    files: ["src/render.ts", "src/wrap.ts", "src/width.ts"],
    why: "the same document at the same glass renders byte-identically; no arrow, so no confounder to adjust for",
  },
];

/** Strip line and block comments, respecting string literals **and regex
 *  literals**. A census that counts a comment is a census that lies about what
 *  it counted — and the corpus has the exact case: `src/width.ts:282` discusses
 *  `process.stdout.columns` without reading it, and `src/vectors.ts:484`
 *  mentions `process.stdout.isTTY` in a note about who gates what.
 *
 *  Regex literals are why this needs a scanner and not a regex: a pattern like
 *  `/['"]/` puts the naive version into string mode for the rest of the file,
 *  and the file stops being read at all — silently, which is the worst way for
 *  an instrument to fail. The regex heuristic is the standard one: a `/` opens a
 *  pattern only where a value cannot precede it. */
export function stripComments(src: string): string {
  const opens = new Set([..."(,=:[!&|?{};+-*%<>~^"]);
  let out = "";
  let i = 0;
  const n = src.length;
  let prev = "\n"; // the last significant character outside a literal
  while (i < n) {
    const c = src[i]!;
    const d = src[i + 1];
    if (c === "/" && d === "/") {
      while (i < n && src[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && d === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      out += c;
      i++;
      while (i < n) {
        if (src[i] === "\\") {
          out += src[i]! + (src[i + 1] ?? "");
          i += 2;
          continue;
        }
        out += src[i]!;
        if (src[i] === quote) {
          i++;
          break;
        }
        i++;
      }
      prev = quote;
      continue;
    }
    if (c === "/" && (prev === "\n" || opens.has(prev))) {
      // A regex literal: copy to the unescaped closing slash, honouring classes.
      out += c;
      i++;
      let inClass = false;
      while (i < n) {
        const ch = src[i]!;
        if (ch === "\\") {
          out += ch + (src[i + 1] ?? "");
          i += 2;
          continue;
        }
        if (ch === "[") inClass = true;
        else if (ch === "]") inClass = false;
        out += ch;
        i++;
        if (ch === "/" && !inClass) break;
      }
      prev = "/";
      continue;
    }
    out += c;
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return out;
}

/** One crossing found in the code. */
interface Crossing {
  key: string;
  lines: number[];
}

const ENV = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
const ENV_ANY = /process\.env(?![.\w])/;
const ENV_COMPUTED = /process\.env\[/;
const TTY = /process\.(?:stdout|stdin|stderr)\.(columns|rows|isTTY)/g;
const WATCH = /fs\.watch\(/;
const SPAWN = /Bun\.spawn(?:Sync)?\(/;
const SIGNAL = /process\.on\(\s*["'](SIG[A-Z]+)["']/g;

/** Every inbound crossing in `src/`, keyed `<file> <key>`. Pure: text in,
 *  crossings out, so the classifier is testable without the filesystem. */
export function findCrossings(files: { name: string; text: string }[]): Map<string, Crossing> {
  const found = new Map<string, Crossing>();
  const add = (key: string, line: number) => {
    const c = found.get(key);
    if (c) c.lines.push(line);
    else found.set(key, { key, lines: [line] });
  };
  for (const f of files) {
    const body = stripComments(f.text);
    // `const out = process.stdout` then `out.columns` is the same crossing,
    // spelled differently — src/width.ts does exactly this, and a census that
    // missed it would report a tty read that does not exist and hide the one
    // that does.
    const aliases = [...body.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*process\.(?:stdout|stdin|stderr)\b/g)].map((m) => m[1]!);
    const tty = aliases.length
      ? new RegExp(`(?:process\\.(?:stdout|stdin|stderr)|${aliases.join("|")})\\.(columns|rows|isTTY)`, "g")
      : TTY;
    // A bare `watch(` counts only where the file bound it from node:fs — by
    // import or by destructuring a dynamic one (`cli.ts` does the latter:
    // `const { watch } = await import("node:fs")`). The bound name is the
    // evidence; a call to something else's `watch` is not a crossing.
    const watches = /\{\s*watch\s*\}|fs\.watch/.test(body);
    body.split("\n").forEach((text, idx) => {
      const line = idx + 1;
      const envs = [...text.matchAll(ENV)].map((m) => m[1]!);
      const whole = ENV_ANY.test(text) && envs.length === 0;
      const computed = ENV_COMPUTED.test(text);
      if (computed && envs.length === 0) add(`${f.name} env:*`, line);
      else if (whole && envs.length === 0) add(`${f.name} env:*`, line);
      for (const v of new Set(envs)) add(`${f.name} env:${v}`, line);
      for (const m of text.matchAll(tty)) add(`${f.name} tty:${m[1]}`, line);
      if (WATCH.test(text) || (watches && /\bwatch\s*\(/.test(text))) add(`${f.name} fs:watch`, line);
      if (SPAWN.test(text)) add(`${f.name} proc:spawn`, line);
      for (const m of text.matchAll(SIGNAL)) add(`${f.name} signal:${m[1]}`, line);
    });
  }
  return found;
}

function main(): void {
const files = readdirSync(SRC)
  .filter((f) => f.endsWith(".ts"))
  .sort()
  .map((name) => ({ name, text: readFileSync(join(SRC, name), "utf8") }));

const crossings = findCrossings(files);
const byKey = new Map(POLICY.map((p) => [p.key, p]));

const missing = [...crossings.keys()].filter((k) => !byKey.has(k)).sort();
const stale = [...byKey.keys()].filter((k) => !crossings.has(k)).sort();
const closed = CLOSED.filter((c) =>
  c.files.some((f) => {
    const text = files.find((x) => x.name === f.split("/").pop())?.text ?? "";
    return new RegExp(c.absent).test(text);
  }),
);

const RUNG_ORDER: Rung[] = ["cut", "control", "lag", "declare"];
const rows = [...crossings.keys()].sort();
// The verdict render prints none of the census (ADR-GATE-TWO-RENDERS-085):
// the ladder IS the reading, and `just seams` is where it is looked at.
const GATE = process.argv.includes("--gate");

if (!GATE) console.log(`seams — ${crossings.size} inbound crossing(s) in src/, ${files.length} file(s)\n`);
for (const rung of GATE ? ([] as Rung[]) : RUNG_ORDER) {
  const mine = rows.filter((k) => byKey.get(k)?.rung === rung);
  if (mine.length === 0) {
    // CUT is the top rung and it is always empty, by construction: a cut
    // crossing is not in `src/` any more, so a census of what exists cannot
    // show it. Cuts live in CLOSED below, as a verifier that fails if the
    // arrow comes back. An empty rung here is the ladder working, not a gap.
    if (rung === "cut") console.log("CUT (0) — a cut crossing is not in the census; it is in CLOSED below\n");
    continue;
  }
  console.log(`${rung.toUpperCase()} (${mine.length})`);
  for (const k of mine) {
    const sites = crossings.get(k)!.lines.length;
    const p = byKey.get(k)!;
    console.log(`  ${k.padEnd(34)} ${String(sites).padStart(2)}×  ${p.why}`);
  }
  console.log("");
}
if (!GATE) {
  console.log(`CLOSED — refused arrows, with their verifier (${CLOSED.length})`);
  for (const c of CLOSED) {
    const holds = !closed.includes(c);
    console.log(`  ${holds ? "✓" : "✗"} ${c.claim}`);
  }
}

const defects: string[] = [];
if (missing.length) defects.push(`MISSING — ${missing.length} crossing(s) with no rung:` + missing.map((k) => `\n    ${k}`).join(""));
if (stale.length) defects.push(`STALE — ${stale.length} policy row(s) naming a crossing that is gone:` + stale.map((k) => `\n    ${k}`).join(""));
if (closed.length) defects.push(`CLOSED — ${closed.length} refused arrow(s) no longer refusing:\n` + closed.map((c) => `    ${c.claim} (${c.absent})`).join("\n"));

if (defects.length === 0) {
  // one line, no leading blank: the verdict render is read beside 23 others
  console.log(`${GATE ? "" : "\n"}seams: OK — every crossing names its rung, and every refusal holds.`);
  process.exit(0);
}
console.error("\n" + defects.join("\n\n"));
if (GATE) process.exit(1);
console.error("\n(reading mode — pass --gate to fail on this)");
}

if (import.meta.main) main();
