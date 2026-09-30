/**
 * input-freeze-repro — a clean minimal repro for the Bun passive-stdin freeze.
 *
 * ADR-TTY-ACTIVE-INPUT-023 (Aborted) left an explicit gate: "A clean minimal repro
 * for the Bun passive-stdin freeze is the precondition for any future revisit —
 * record it here, not as a vague intention." This is that repro. The finding, the
 * measured table, and what the repro does NOT establish are in
 * docs/2026-09-30-the-freeze-repro.md.
 *
 * A bare Bun TUI and nothing else: raw mode, one paint, a passive `data` listener,
 * a repaint per keystroke, exit on `q` or after the timeout. No okuda import, no
 * fzf bind, no runTui. If this freezes, okuda is not required to freeze.
 *
 * Run standalone (a draining pty, the control):
 *
 *   (sleep 1.5; printf 'abcq'; sleep 2) \
 *     | script -q /dev/null bun scripts/input-freeze-repro.ts
 *
 * Run under fzf `execute` (the configuration that freezes):
 *
 *   printf 'one\ntwo\n' | fzf --bind "ctrl-e:execute(bun $PWD/scripts/input-freeze-repro.ts)"
 *
 * then, from another shell, drive it:
 *
 *   (sleep 1.5; printf '\005'; sleep 2; printf 'abcq'; sleep 8) \
 *     | script -q /dev/null bash <that command>
 *
 * Expected, measured 2026-09-30 (bun 1.4.0, fzf 0.74.4):
 *   standalone       -> "KEY 1" ... "GOT 'q' — passive delivery ALIVE"
 *   fzf `execute`    -> "TIMEOUT — 0 data event(s) received; timer FIRED"
 *
 * Two rules make this a measurement rather than an impression:
 *
 *  1. Findings go to a FILE, not the terminal. Under `execute` the pty's output path
 *     is exactly what is in doubt, so a result read off the screen cannot be trusted.
 *  2. A negative result needs a POSITIVE control. "It did not freeze" is worth nothing
 *     unless some configuration in the same harness does. The standalone run is that
 *     control; run it first. (PLY-GREP's rule.)
 *
 * PROBE_NOPAINT=1 writes nothing to the terminal at all, stderr included — the variant
 * that shows the drained paint write is not the trigger. Run it as:
 *
 *   PROBE_NOPAINT=1 ... | script -q /dev/null bun scripts/input-freeze-repro.ts
 */
import { appendFileSync } from "node:fs";

/** Scratch, and deliberately outside the silo: the probe must not be able to
 *  contaminate the tree it is diagnosing. Read it after the run — never the
 *  screen, and never a `cat` chained behind a pipeline the harness may SIGTERM. */
const LOGF = "/tmp/probe-log.txt";

/** See the header. Nothing reaches the terminal when this is set. */
const NOPAINT = process.env.PROBE_NOPAINT === "1";

const log = (m: string): void => {
  try {
    appendFileSync(LOGF, `PROBE ${m}\n`);
  } catch {
    /* the file is the evidence; a failed write is not the finding */
  }
  if (!NOPAINT) process.stderr.write(`PROBE ${m}\n`);
};

log(`--- run start pid=${process.pid} ---`);
log(`isTTY=${String(process.stdin.isTTY)} fd0=${process.stdin.fd}`);

if (process.stdin.isTTY) {
  try {
    process.stdin.setRawMode(true);
    log("raw mode set");
  } catch (e) {
    log(`setRawMode FAILED: ${String(e)}`);
  }
} else {
  log("stdin is NOT a tty — raw mode unavailable");
}

process.stdin.resume();

let n = 0;
process.stdin.on("data", (b: Buffer) => {
  n += 1;
  const bytes = [...b].map((x) => x.toString(16).padStart(2, "0")).join(" ");
  log(`KEY ${n}: ${JSON.stringify(b.toString())} [${bytes}]`);
  // Repaint per keystroke — the editor's pattern, and ADR-023's own condition
  // ("once the host drains the paint write"). A reader paints rarely; an
  // editor paints every time, so this is the workload worth testing.
  if (!NOPAINT) process.stdout.write(`\x1b[Hkey #${n}: ${JSON.stringify(b.toString())}\x1b[K`);
  if (b.toString().includes("q")) {
    log(`RESULT: GOT 'q' — ${n} data event(s); passive delivery ALIVE`);
    if (!NOPAINT) process.stdout.write("\x1b[?1049l");
    process.exit(0);
  }
});

if (!NOPAINT) {
  process.stdout.write("\x1b[?1049h\x1b[2J\x1b[Hprobe: type keys, q to quit\n");
}

setTimeout(() => {
  log(`RESULT: TIMEOUT — ${n} data event(s) received; timer FIRED`);
  if (!NOPAINT) process.stdout.write("\x1b[?1049l");
  process.exit(n > 0 ? 0 : 1);
}, 5000);
