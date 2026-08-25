/**
 * cli.ts — okuda entry point.
 *
 * Usage: okuda <file.md> [--watch] [--tui] [--no-color] [--palette <name>]
 *        cat doc.md | okuda
 *
 *  - Terminal width: process.stdout.columns, fallback 80.
 *  - --watch: fs.watch + SIGWINCH re-render, debounced, screen cleared.
 *  - --no-color: same as NO_COLOR (plain text, identical line breaks).
 *  - --palette <name>: named preset (e.g. 'okuda'). Default: Dracula/glow.
 */

import { detectColorMode } from "./ansi";
import { loadPalette } from "./palette";
import { renderDocument } from "./render";
import { runTui } from "./tui";

interface Args {
  file: string | null;
  watch: boolean;
  noColor: boolean;
  tui: boolean;
  palette: string | null;
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
        process.stderr.write("okuda: --palette requires a name (e.g. okuda)\n");
        process.exit(1);
      }
    } else if (a === "--help" || a === "-h") {
      process.stdout.write("usage: okuda <file.md> [--watch] [--tui] [--no-color] [--palette <name>]\n");
      process.exit(0);
    } else if (a === "--version") {
      process.stdout.write("okuda 0.1.0\n");
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
const KNOWN_PRESETS = ["okuda"];

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
    const width = process.stdout.columns || 80;
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
      width: process.stdout.columns || 80,
      rows: process.stdout.rows || 24,
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

await main();
