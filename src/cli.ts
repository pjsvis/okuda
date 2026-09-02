/**
 * cli.ts — okuda entry point.
 *
 * Usage: okuda <file.md> [--watch] [--tui] [--no-color] [--palette <name>]
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
import { renderDocument } from "./render";
import { runTui } from "./tui";
import { runLauncher, invokedAsGloam } from "./launcher";
import { detectRoot, makeCallsignResolver, resolveByCallsign } from "./root";
import { terminalCols, terminalRows } from "./width";
import { existsSync } from "node:fs";

interface Args {
  file: string | null;
  watch: boolean;
  noColor: boolean;
  tui: boolean;
  palette: string | null;
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

function parseArgs(argv: string[]): Args {
  const args: Args = { file: null, watch: false, noColor: false, tui: false, palette: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--watch" || a === "-w") args.watch = true;
    else if (a === "--no-color") args.noColor = true;
    else if (a === "--tui" || a === "-t") args.tui = true;
    else if (a === "--palette") {
      args.palette = argv[++i] ?? null;
      if (!args.palette) {
        process.stderr.write("okuda: --palette requires a name (e.g. dracula)\n");
        process.exit(1);
      }
    } else if (a === "--help" || a === "-h") {
      process.stdout.write("usage: okuda <file.md> [--watch] [--tui] [--no-color] [--palette <name>]\n");
      process.exit(0);
    } else if (a === "--version") {
      const sha = typeof BUILD_SHA !== "undefined" ? BUILD_SHA : undefined;
      process.stdout.write(versionLine(sha) + "\n");
      process.exit(0);
    } else if (!args.file) {
      args.file = a;
    } else {
      process.stderr.write(`okuda: unexpected argument: ${a}\n`);
      process.exit(1);
    }
  }
  return args;
}

/** Known preset names, for error messages. */
const KNOWN_PRESETS = ["okuda", "dracula"];

/** Callsign shape: tier prefix + significant tokens, uppercase (the
 *  registry's vocabulary — BRF-INDEX-JUMP, ADR-BOUND-010, PLY-REGISTRY). */
const CALLSIGN_SHAPE = /^[A-Z]{3}(-[A-Z0-9]+)+$/;

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
  process.stderr.write("usage: okuda <file.md> [--watch] [--no-color]\n");
  process.exit(1);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  // Gloam launcher (ADR-016): invoked as `gloam` with no file arg and a TTY
  // stdin → run the browse → read → browse picker loop. `okuda <file>` is
  // unaffected; two names, two entry contracts, one binary.
  if (invokedAsGloam() && !args.file && process.stdin.isTTY) {
    await runLauncher();
    return;
  }
  // `gloam <callsign>` (silo-mnemonics): a callsign-shaped argument that
  // names no file resolves through the rooted registry — the human code
  // for low-bandwidth channels. Unknown code or unrooted cwd → honest
  // error; anything else falls through to the reader's own diagnostics.
  if (invokedAsGloam() && args.file && !existsSync(args.file) && CALLSIGN_SHAPE.test(args.file) && process.stdin.isTTY) {
    const root = detectRoot();
    const path = root ? resolveByCallsign(args.file) : null;
    if (!path) {
      process.stderr.write(`gloam: unknown callsign: ${args.file}${root ? "" : " (cwd is not a rooted silo)"}\n`);
      process.exit(1);
    }
    await runTui({
      file: path,
      width: terminalCols(80),
      rows: terminalRows(24),
      silo: root?.badge,
      callsignFor: makeCallsignResolver(),
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

  const draw = async (): Promise<void> => {
    const source = await readSource(args.file);
    const width = terminalCols(80);
    const out = await renderDocument(source, { width, palette, color });
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
