#!/usr/bin/env bun
/**
 * probe-osc.ts — can the ground be *taken* and *given back*?
 *
 * `BRF-OWN-SURFACE` proposes that Gloam own the glass's foreground and background
 * for the duration of its instantiation, and dispose of them on the way out. The
 * lifecycle half of that is already true (`src/tui.ts:6-11`: alt screen, raw mode,
 * a documented exit order); the half that is *not* known is whether the pair can
 * be read and written on the hosts we actually run on.
 *
 * Two facts decide it, and neither can be argued:
 *
 *   1. **Does the host answer `OSC 10;?` / `OSC 11;?`, and how fast?** Without a
 *      successful read there is no give-back, and ownership without a give-back is
 *      a leak — so a timeout means *own nothing*.
 *   2. **Does an `OSC 11;<c>` set actually take effect?** A host may accept the
 *      query and ignore the set, and a multiplexer may answer the query with its
 *      *own* colour rather than the emulator's — the wrong-answer class, which is
 *      confidently wrong and therefore worse than silence.
 *
 * So this probe asks both, and it restores **byte-for-byte the string the host
 * said**, not a re-serialised hex: a reply that arrives as `rgb:1e1e/1e1e/2e2e`
 * goes back as that string, because that is the only value we know the host
 * understands.
 *
 * ## Safety, which is the whole design
 *
 * - **Read-only by default.** It queries and reports; it changes nothing.
 * - **`--set` is opt-in**, and it refuses when a multiplexer is present, because
 *   there the blast radius is every other pane in the window, not this one.
 * - **Fail closed.** No reply in time → no set. A set whose read-back does not
 *   match the sentinel is reported as `NO EFFECT` and the original is written back
 *   anyway.
 * - **A set is always followed by a restore**, on every path including SIGINT and
 *   SIGTERM. `SIGKILL` is the accepted residue — the same one raw mode and the alt
 *   screen already carry, and the same remedy (`reset`).
 *
 * ## What it cannot tell you, stated as a limit
 *
 * A host that answers correctly and a multiplexer that answers on its behalf look
 * identical from inside the process. The multiplexer check is an *environment*
 * test, not a fact about the reply — so a host that proxies silently will read as a
 * plain terminal. That is why `--set` refuses on a multiplexer rather than
 * trusting the answer.
 *
 * ## The receipt carries nine named facts, and no more
 *
 * `TERM`, `COLORTERM`, `TERM_PROGRAM` and the four multiplexer markers. The whole
 * environment is never read into a record and never travels through a function: a
 * receipt is a claim about a terminal, and it should not be able to carry a machine
 * with it.
 *
 * Usage:
 *   bun scripts/probe-osc.ts                 # query only: what does the host say?
 *   bun scripts/probe-osc.ts --set           # + take the ground and give it back
 *   bun scripts/probe-osc.ts --set --force   # + even under a multiplexer
 *   bun scripts/probe-osc.ts --json          # the receipt
 *
 * Exit: 0 both queries answered · 1 a query went unanswered · 2 not a tty (a
 * missing instrument is not a verdict — facade-lint's rule).
 */

const ESC = "\x1b";
const ST = `${ESC}\\`;
const BEL = "\x07";

/** The nine facts the probe is allowed to know about its host. Named reads, one
 *  at a time, so no environment object is ever handed around. */
export interface Host {
  TERM?: string | undefined;
  COLORTERM?: string | undefined;
  TERM_PROGRAM?: string | undefined;
  TMUX?: string | undefined;
  STY?: string | undefined;
  HERDR_ENV?: string | undefined;
  HERDR_PANE_ID?: string | undefined;
  ZELLIJ?: string | undefined;
  WEZTERM_PANE?: string | undefined;
}

export function hostFacts(): Host {
  return {
    TERM: process.env.TERM,
    COLORTERM: process.env.COLORTERM,
    TERM_PROGRAM: process.env.TERM_PROGRAM,
    TMUX: process.env.TMUX,
    STY: process.env.STY,
    HERDR_ENV: process.env.HERDR_ENV,
    HERDR_PANE_ID: process.env.HERDR_PANE_ID,
    ZELLIJ: process.env.ZELLIJ,
    WEZTERM_PANE: process.env.WEZTERM_PANE,
  };
}

/** `rgb:R/G/B` with each channel 1–4 hex digits, or `#rrggbb`. Both spellings are
 *  in the wild: xterm-family hosts answer in `rgb:`, several newer ones in hex. */
export function parseOscReply(reply: string, code: number): { hex: string | null; raw: string } | null {
  // \e]11;rgb:1e1e/1e1e/2e2e\e\\   |   \e]10;#cdd6f4\a
  const re = new RegExp(`\\x1b\\]${code};([^\\x07\\x1b]*)(?:${ESC}\\\\|${BEL})`);
  const m = reply.match(re);
  if (!m) return null;
  const raw = m[1]!;
  const rgb = raw.match(/^rgb:([0-9a-f]{1,4})\/([0-9a-f]{1,4})\/([0-9a-f]{1,4})$/i);
  if (rgb) {
    const scale = (s: string): string => {
      // X11's `rgb:` syntax: each component is a *fraction of the maximum
      // representable in its width*, not a left-aligned bit pattern. So `f` is
      // 15/15 = 1.0, not 0xf000/0xffff — the difference between #ff0088 and
      // #ef007c for a one-digit reply. Real hosts answer in 2 or 4 digits, but a
      // parse that is only right for the common case is a parse that lies quietly.
      const max = (1 << (4 * s.length)) - 1;
      return Math.round((parseInt(s, 16) / max) * 255).toString(16).padStart(2, "0");
    };
    return { hex: `#${scale(rgb[1]!)}${scale(rgb[2]!)}${scale(rgb[3]!)}`, raw };
  }
  const hex = raw.match(/^#[0-9a-f]{6}$/i);
  return hex ? { hex: raw.toLowerCase(), raw } : { hex: null, raw };
}

/** The hosts whose answers cannot be trusted to describe the outermost glass. */
export function multiplexer(host: Host): string | null {
  if (host.TMUX) return "tmux";
  if (host.STY) return "screen";
  if (host.HERDR_ENV || host.HERDR_PANE_ID) return "herdr";
  if (host.ZELLIJ) return "zellij";
  if (host.WEZTERM_PANE) return "wezterm";
  return null;
}

/** One query: write the request, collect bytes until the reply parses or the
 *  deadline passes. Returns the latency, the parse, and every byte seen — the
 *  bytes matter, because a host that answers with something unexpected is the
 *  finding. Impure by construction; the parse above is the pure half. */
async function query(
  code: number,
  queryString: string,
  timeoutMs: number,
): Promise<{ ms: number; reply: string | null; seen: string }> {
  const started = performance.now();
  let seen = "";
  process.stdout.write(queryString);
  return await new Promise((resolve) => {
    const done = (reply: string | null): void => {
      process.stdin.removeListener("data", onData);
      clearTimeout(timer);
      resolve({ ms: performance.now() - started, reply, seen });
    };
    const onData = (chunk: Buffer): void => {
      seen += chunk.toString("utf8");
      if (parseOscReply(seen, code)) done(seen);
    };
    const timer = setTimeout(() => done(null), timeoutMs);
    process.stdin.on("data", onData);
  });
}

function writeOsc(code: number, value: string): void {
  process.stdout.write(`${ESC}]${code};${value}${ST}`);
}

interface SetResult {
  sentinel: string;
  took: boolean | null;
  readBackMs: number | null;
  restored: boolean | null;
  why: string;
}

async function main(argv: string[]): Promise<number> {
  const json = argv.includes("--json");
  const doSet = argv.includes("--set");
  const force = argv.includes("--force");
  const timeout = Number.parseInt(argv[argv.indexOf("--timeout") + 1] ?? "150", 10) || 150;

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error(
      "probe-osc: not a tty — there is no terminal to ask.\n" +
        "  Run this in the pane it is meant to describe (a Mac's own Terminal, or the\n" +
        "  Omarchy box's Ghostty). An answer from a pipe would be an answer about a pipe.",
    );
    return 2;
  }

  const host = hostFacts();
  const mux = multiplexer(host);

  process.stdin.setRawMode(true);
  process.stdin.resume();

  const bg = await query(11, `${ESC}]11;?${ST}`, timeout);
  const fg = await query(10, `${ESC}]10;?${ST}`, timeout);
  const parsedBg = bg.reply ? parseOscReply(bg.reply, 11) : null;
  const parsedFg = fg.reply ? parseOscReply(fg.reply, 10) : null;

  // ── The write half. Only with --set, never under a multiplexer unless forced,
  //    and never without a read to give back.
  let setResult: SetResult | null = null;
  if (doSet) {
    if (mux && !force) {
      setResult = {
        sentinel: "",
        took: null,
        readBackMs: null,
        restored: null,
        why: `refused — ${mux} is present and its panes are not ours (--force to override)`,
      };
    } else if (!parsedBg || !bg.reply) {
      setResult = {
        sentinel: "",
        took: null,
        readBackMs: null,
        restored: null,
        why: "refused — the background never answered, so there is nothing to give back",
      };
    } else {
      const rawBack = parsedBg.raw; // byte-for-byte what the host said
      const sentinel = "#010203";
      const restore = (): void => writeOsc(11, rawBack);
      const bail = (): void => {
        restore();
        process.exitCode = 1;
      };
      process.once("SIGINT", bail);
      process.once("SIGTERM", bail);
      try {
        writeOsc(11, sentinel);
        const check = await query(11, `${ESC}]11;?${ST}`, timeout);
        const checkParsed = check.reply ? parseOscReply(check.reply, 11) : null;
        const took = checkParsed?.hex === sentinel;
        // Give it back before reporting, so an interrupted report leaves nothing.
        restore();
        const back = await query(11, `${ESC}]11;?${ST}`, timeout);
        const backParsed = back.reply ? parseOscReply(back.reply, 11) : null;
        setResult = {
          sentinel,
          took,
          readBackMs: check.ms,
          restored: backParsed?.hex === parsedBg.hex,
          why: took
            ? "the set takes effect and the restore returns the host's own value"
            : "the host answered the query and ignored the set (or answered with its own colour)",
        };
      } finally {
        process.removeListener("SIGINT", bail);
        process.removeListener("SIGTERM", bail);
        // Belt and braces: the restore is idempotent, and this is the one place a
        // crash between set and restore would leave the glass altered.
        restore();
      }
    }
  }

  process.stdin.setRawMode(false);
  process.stdin.pause();

  const answered = [parsedBg?.hex, parsedFg?.hex].filter(Boolean).length;
  const verdict = setResult
    ? setResult.took === true && setResult.restored === true
      ? "OWNED-ABLE — the ground can be taken and given back"
      : setResult.took === null
        ? `NOT TESTED — ${setResult.why}`
        : "NOT OWNED-ABLE — the ground cannot be taken back safely"
    : answered === 2
      ? "QUERY OK — both values answered; ownership was not tested (--set)"
      : "NO REPLY — the host does not answer, so nothing may be taken";

  if (json) {
    console.log(
      JSON.stringify(
        {
          host,
          mux,
          size: { cols: process.stdout.columns, rows: process.stdout.rows },
          queries: { bg: { ms: bg.ms, ...parsedBg }, fg: { ms: fg.ms, ...parsedFg } },
          set: setResult,
          verdict,
        },
        null,
        2,
      ),
    );
    return answered === 2 ? 0 : 1;
  }

  const pad = (s: string, n: number): string => s.padEnd(n);
  const line = (
    label: string,
    q: { ms: number; reply: string | null },
    p: { hex: string | null; raw: string } | null,
  ): string =>
    `  ${pad(label, 16)}${q.reply ? `answered in ${q.ms.toFixed(0)}ms` : `NO REPLY (> ${timeout}ms)`}` +
    `${
      p
        ? `   ${pad(p.hex ?? "unparsed", 9)} ${p.raw}`
        : q.reply
          ? `   ${JSON.stringify(q.reply.slice(0, 40))}`
          : ""
    }`;

  console.log("probe-osc — the pair, read (and optionally written)");
  console.log(
    `  host            ${host.TERM}${host.COLORTERM ? ` · ${host.COLORTERM}` : ""}` +
      `${host.TERM_PROGRAM ? ` · ${host.TERM_PROGRAM}` : ""}` +
      `${mux ? ` · multiplexer ${mux} — replies may come from it, not the glass` : ""}`,
  );
  console.log(`  tty             ${process.stdout.columns}×${process.stdout.rows}`);
  console.log(line("OSC 11;? bg", bg, parsedBg));
  console.log(line("OSC 10;? fg", fg, parsedFg));
  if (setResult) {
    console.log(
      `  ${pad("set + restore", 16)}` +
        `${setResult.took === true ? "set took" : setResult.took === false ? "set had NO EFFECT" : "skipped"}` +
        `${setResult.readBackMs !== null ? ` in ${setResult.readBackMs.toFixed(0)}ms` : ""}` +
        `${
          setResult.restored === true
            ? " · restored exactly"
            : setResult.restored === false
              ? " · RESTORE DID NOT MATCH"
              : ""
        }`,
    );
    console.log(`  ${pad("", 16)}${setResult.why}`);
  }
  console.log(`  verdict         ${verdict}`);
  return answered === 2 ? 0 : 1;
}

if (import.meta.main) process.exitCode = await main(process.argv.slice(2));
