/**
 * cli.ts — okuda entry point.
 *
 * Usage: okuda <file> [--watch] [--tui] [--no-color] [--palette <name>]
 *        cat doc.md | okuda
 *
 *  - Terminal width: terminalCols() (handles Bun's columns=0 bug; fallback 80).
 *  - --watch: fs.watch + SIGWINCH re-render, debounced, screen cleared.
 *  - --no-color: same as NO_COLOR (plain text, identical line breaks).
 *  - --palette <name>: named preset (e.g. 'dracula' for glow parity).
 *    Default: okuda (LCARS identity).
 */

import { detectColorMode } from "./ansi";
import { loadPalette } from "./palette";
import { renderDocument, wrapWholeFile, regionsForFile } from "./render";
import { runTui, displayPath } from "./tui";
import { runLauncher, invokedAsGloam, rankedShortlistEntries } from "./launcher";
import {
  detectRoot,
  makeCallsignResolver,
  isWithinRoot,
  makeSilcrowGate,
  resolveByCallsign,
  siloRoot,
} from "./root";
import { CALLSIGN_SHAPE, deriveReferences, annotateSource, appendReferences } from "./vectors";
import { terminalCols, terminalRows } from "./width";
import { existsSync } from "node:fs";

interface Args {
  file: string | null;
  watch: boolean;
  noColor: boolean;
  tui: boolean;
  palette: string | null;
  grep: string | null;
  entries: string | null;
  /** Declared glass width (`--width`), null = ask the terminal. */
  width: number | null;
  /** Suppress the receipt — no silcrow paint, no References section
   *  (the paper rung). */
  noReferences: boolean;
  extra: string[];
}

/** Build stamp: --define BUILD_SHA="<sha>" at compile time (justfile
 * build). The typeof guard keeps unstamped runs (bun run src/cli.ts,
 * old binaries) safe — they report (dev), and `just fresh` fails loud on
 * them rather than trusting them. */
declare const BUILD_SHA: string | undefined;

/** Version: single source of truth — package.json, imported so the
 * binary and the manifest cannot drift apart. The old hardcoded
 * `0.1.0` in this file was a second source wearing a matching value;
 * matching until the day it isn't is not a property, it's a latency. */
import pkg from "../package.json";

/** The --version line: manifest version + compile stamp. Pure. */
export function versionLine(sha?: string): string {
  return `okuda ${pkg.version}${sha ? ` (${sha})` : " (dev)"}`;
}

/** The width the reading path renders to: the declared `--width` when
 *  given, else the terminal's. A panel is not a terminal — no columns, no
 *  tput, no winsize — so a sink with a known cell grid (an e-ink frame, a
 *  PNG pipeline, a pager writing a fixed-width page) declares its glass
 *  instead of hoping the environment guesses right. `--no-color` says
 *  "no SGR"; `--width` says "here is the glass". Pure. */
function readingWidth(declared: number | null): number {
  return declared ?? terminalCols(80);
}

function parseArgs(argv: string[]): Args {
  const args: Args = { file: null, watch: false, noColor: false, tui: false, palette: null, grep: null, entries: null, width: null, noReferences: false, extra: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--watch" || a === "-w") args.watch = true;
    else if (a === "--no-color") args.noColor = true;
    else if (a === "--no-references") args.noReferences = true;
    else if (a === "--tui" || a === "-t") args.tui = true;
    else if (a === "--width") {
      const raw = argv[++i] ?? "";
      const n = parseInt(raw, 10);
      if (!Number.isFinite(n) || n < 20) {
        process.stderr.write(`okuda: --width wants a column count of 20 or more, got ${raw === "" ? "nothing" : `'${raw}'`}\n`);
        process.exit(1);
      }
      args.width = n;
    } else if (a === "--palette") {
      args.palette = argv[++i] ?? null;
      if (!args.palette) {
        process.stderr.write("okuda: --palette requires a name (e.g. dracula)\n");
        process.exit(1);
      }
    } else if (a === "--grep" || a === "-g") {
      args.grep = argv[++i] ?? null;
      if (!args.grep) {
        process.stderr.write("gloam: -g requires a query (e.g. gloam -g diagram)\n");
        process.exit(1);
      }
    } else if (a === "--entries") {
      // Headless entry-stream printer (ADR-030): the live picker's
      // reload target. Consumes the remaining args as the query.
      args.entries = argv.slice(i + 1).join(" ");
      break;
    } else if (a === "--help" || a === "-h") {
      process.stdout.write("usage: okuda <file> [--watch] [--tui] [--no-color] [--palette <name>] [--width <cols>] [--no-references]\n");
      process.stdout.write("       gloam [<query words>] [-g <query>] [--entries <query>]  (live search → read → loop)\n");
      process.exit(0);
    } else if (a === "--version") {
      const sha = typeof BUILD_SHA !== "undefined" ? BUILD_SHA : undefined;
      process.stdout.write(versionLine(sha) + "\n");
      process.exit(0);
    } else if (args.grep !== null) {
      // Positionals after -g join the query: `just gloam -g load bearing`
      // is the phrase "load bearing", not "load" with a stray "bearing".
      args.grep += " " + a;
    } else if (!args.file) {
      args.file = a;
    } else {
      args.extra.push(a);
    }
  }
  return args;
}

/** Known preset names, for error messages. */
const KNOWN_PRESETS = ["okuda", "dracula"];

async function readSource(file: string | null): Promise<string> {
  if (file) {
    const f = Bun.file(file);
    if (!(await f.exists())) {
      process.stderr.write(`okuda: no such file: ${file}\n`);
      process.exit(1);
    }
    return await f.text();
  }
  // Stdin piping (origin doc): `cat doc.md | okuda`
  if (!process.stdin.isTTY) return await new Response(process.stdin).text();
  process.stderr.write("usage: okuda <file> [--watch] [--no-color]\n");
  process.exit(1);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  // Headless entry-stream printer (ADR-030): the live picker's reload
  // target and the debugging surface. Works under both binary names, no
  // TTY required — fzf spawns it per keystroke. The corpus is the SILO
  // ROOT (ADR-048): one cached git spawn per process, never per query.
  if (args.entries !== null) {
    process.stdout.write(rankedShortlistEntries(args.entries, siloRoot()).join("\n") + "\n");
    return;
  }
  if (args.grep !== null && (!invokedAsGloam() || !process.stdin.isTTY)) {
    process.stderr.write("gloam: -g is a gloam mode flag and needs a TTY (invoke as gloam -g <query>)\n");
    process.exit(1);
  }
  if (!invokedAsGloam() && args.extra.length > 0) {
    process.stderr.write(`okuda: unexpected argument: ${args.extra[0]}\n`);
    process.exit(1);
  }
  // The vector actuator's resolver (ADR-031): target → document path.
  // File existence first (works unrooted), callsign dispatch where the
  // SILO ROOT is a rooted silo (ADR-048 — resolved once, the launch cwd
  // may be a subfolder). Built once per run; handed to every runTui.
  const cwd = siloRoot();
  const root = detectRoot(cwd);
  // Containment conjunct (BRF-ROOT-CONTAINMENT): existence is not
  // permission — a target outside the silo root falls through to the
  // callsign registry, not the read.
  const resolveTarget = (target: string): string | null => {
    if (existsSync(target) && isWithinRoot(target, cwd)) return target;
    if (root) return resolveByCallsign(target, cwd);
    return null;
  };
  // The silcrow gate (ADR-044) and ADR-045's second substrate: a code-file
  // mention validates against the filesystem, anchored the way actuation
  // resolves. Built once per run beside the actuator siblings — the paint
  // and the keypress share the one resolution semantics, so they cannot
  // disagree.
  // The silcrow gate, ONE composition (makeSilcrowGate): callsign ||
  // path, minus self — a target that resolves to THIS document mints
  // nothing (the showcase §12 nit). Feeds the streaming render and
  // runTui's opts.resolves; the launcher builds the same gate per round
  // — no second composition to drift (the launcher drift, 2026-10-02).
  const silcrowResolves = makeSilcrowGate(args.file ?? undefined, cwd);
  if (invokedAsGloam() && process.stdin.isTTY) {
    // `-g <query>`: seed alias (ADR-030 §4) — same as a bare-arg query.
    if (args.grep !== null) {
      await runLauncher({ query: args.grep });
      return;
    }
    // Bare args resolve deterministically (ADR-030 §3): existing file →
    // the shared reader below; callsign shape → registry dispatch below;
    // anything else (and no args at all) → the live search, seeded with
    // the joined positionals or empty.
    const isQuery = args.file !== null && !existsSync(args.file);
    if (isQuery && !CALLSIGN_SHAPE.test(args.file!)) {
      await runLauncher({ query: [args.file, ...args.extra].join(" ") });
      return;
    }
    if (!args.file) {
      await runLauncher({ query: "" });
      return;
    }
    // Existing file / callsign: fall through to the callsign gate and
    // the shared reader below — both contracts unchanged.
  }
  // `gloam <callsign>` (silo-mnemonics): a callsign-shaped argument that
  // names no file resolves through the rooted registry — the human code
  // for low-bandwidth channels. Unknown code or unrooted cwd → honest
  // error; anything else falls through to the reader's own diagnostics.
  if (invokedAsGloam() && args.file && !existsSync(args.file) && CALLSIGN_SHAPE.test(args.file) && process.stdin.isTTY) {
    const path = root ? resolveByCallsign(args.file, cwd) : null;
    if (!path) {
      process.stderr.write(`gloam: unknown callsign: ${args.file}${root ? "" : " (the silo is not rooted)"}\n`);
      process.exit(1);
    }
    await runTui({
      file: path,
      width: terminalCols(80),
      rows: terminalRows(24),
      silo: root?.badge,
      callsignFor: makeCallsignResolver(cwd),
      // The TUI's fence: the silo root, handed down (BRF-ROOT-CONTAINMENT).
      root: cwd,
      resolveTarget,
      resolves: silcrowResolves,
    });
    return;
  }
  const color = args.noColor
    ? "none"
    : detectColorMode(process.env as NodeJS.ProcessEnv);
  if (args.palette && !KNOWN_PRESETS.includes(args.palette)) {
    process.stderr.write(`okuda: unknown palette '${args.palette}' (known: ${KNOWN_PRESETS.join(", ")})\n`);
    process.exit(1);
  }
  const palette = loadPalette(args.palette ? { name: args.palette } : undefined);
  // Identity resolvers (BRF-STREAM-IDENTITY-HEADER): the streaming render
  // names itself, because its destination is unknown. Resolved once per
  // process; the header is added downstream of `scanReferences`, so its
  // callsign never re-enters the map.
  const callsignFor = makeCallsignResolver(cwd);

  const draw = async (): Promise<void> => {
    const source = await readSource(args.file);
    const width = readingWidth(args.width);
    // A streaming render to a TTY is a main document too (ADR-031): it
    // gets its silcrows. Piped output stays clean — the paint is for
    // glass, not for downstream tools. The map is built ALWAYS (ADR-047):
    // the generated References section is a projection of the map, so it
    // is present on every rung — glass, pipe, NO_COLOR — while the paint
    // stays TTY-gated. The section joins downstream of the paint; its
    // own callsigns never re-enter the map.
    //
    // `--no-references` is the third rung: NO paint and NO receipt. On
    // paper a silcrow cannot resolve (there is nothing to type `12` into)
    // and its number is a render-time allocation (ADR-032 — numbers are
    // dynamic, never authored), so a durable artefact carrying it is
    // guaranteed to disagree with the next render of the same document.
    // The receipt is dropped, and the map with it — nothing downstream
    // needs it.
    const wantMap = !args.noReferences;
    // A whole-file code render is a document for its comment prose
    // (BRF-CODE-SILCROWS): discovery runs over the comments only, so a callsign
    // cited in a comment paints while the same token in a string literal — a
    // test fixture, demo data — does not. The paint already works inside the
    // fence; the fence was only gating discovery.
    const regions = regionsForFile(args.file, source);
    const derived = wantMap
      ? deriveReferences(source, silcrowResolves, regions)
      : { map: new Map<number, string>(), truncated: false };
    const map = derived.map;
    const source2 = process.stdout.isTTY && wantMap ? annotateSource(source, map, regions) : source;
    // Wrap AFTER annotation (the tokens ride in the fence) and BEFORE the
    // receipt (the References section is markdown prose beneath the block, not
    // code inside it).
    const fenced = args.file ? wrapWholeFile(args.file, source2) : source2;
    const body = wantMap ? appendReferences(fenced, map, process.stdout.isTTY, derived.truncated) : fenced;
    const out = await renderDocument(body, {
      width,
      palette,
      color,
      // stdin (no file argument) is anonymous: no name, no header.
      ...(args.file
        ? {
            silo: root?.badge,
            callsign: callsignFor(args.file) ?? undefined,
            file: displayPath(args.file),
          }
        : {}),
    });
    if (args.watch) {
      process.stdout.write("\x1b[2J\x1b[3J\x1b[H"); // clear + home
    }
    process.stdout.write(out);
  };

  // Control plane (brief: okuda-tui-control-plane). Gated: file present,
  // both streams are TTYs, colour not suppressed. Otherwise fall back to
  // the streaming renderer — the brief's NO_COLOR/TERM=dumb clause.
  if (
    args.tui &&
    args.file &&
    process.stdout.isTTY &&
    process.stdin.isTTY &&
    color !== "none"
  ) {
    await runTui({
      file: args.file,
      width: terminalCols(80),
      rows: terminalRows(24),
      palette,
      // The TUI's fence: the silo root, handed down (BRF-ROOT-CONTAINMENT).
      root: cwd,
      resolveTarget,
      resolves: silcrowResolves,
    });
    return;
  }
  if (args.tui && !args.file) {
    process.stderr.write("okuda: --tui requires a file\n");
    process.exit(1);
  }

  await draw();

  if (args.watch) {
    if (!args.file) {
      process.stderr.write("okuda: --watch requires a file\n");
      process.exit(1);
    }
    const { watch } = await import("node:fs");
    let timer: ReturnType<typeof setTimeout> | undefined;
    watch(args.file, () => {
      clearTimeout(timer);
      timer = setTimeout(() => void draw(), 50);
    });
    process.on("SIGWINCH", () => void draw());
  }
}

// Entry guard: cli.ts is now importable (tests import versionLine
// from it) — importing a module must not execute the CLI. Found the
// hard way (2026-09-02): without the guard, `bun test` ran main() on
// import; with stdin a TTY (any interactive `just ship`), readSource
// printed usage and exit(1)'d the whole suite. The harness's piped
// stdin had been masking it — tests green in one environment are not
// tests green.
if (import.meta.main) {
  await main();
}
