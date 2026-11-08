#!/usr/bin/env bun
// ── omarchy-theme.ts — the pair, delivered into the re-themer's own override ──
//
//  `just ground` prints a paste-me Ghostty `.conf`, and `scripts/herdr-theme.ts`
//  writes a host theme. Both need a human to paste or select them, and both are
//  overwritten by a desktop that re-themes itself: Omarchy regenerates
//  `~/.local/state/omarchy/current/theme/ghostty.conf` from a template on every
//  theme switch, so a pair pasted into `~/.config/ghostty/config` wins until the
//  next switch and then loses silently.
//
//  The override point is the host's own: `~/.config/omarchy/themed/<output>.tpl`
//  takes priority over the built-in template and is **re-applied by the very
//  thing that changes the surface**. That is why the delivery goes there and not
//  into a flag: anything okuda asserts competes with the re-themer, and the
//  competitor loses on the next keystroke.
//
//  ## What is pinned, and the one rule it settles
//
//  **The neutral rank is ours; the hues and the selection pair are the theme's.**
//  The template's eighteen variables divide cleanly on that line: slots 0, 7, 8
//  and 15 are the figure/ground rank (ground, ink, quiet ink, bright ink), slots
//  1–6 and 9–14 are the theme's identity, and the selection pair is an attention
//  mark that is loud on purpose.
//
//  The first cut of this file pinned three of the four neutrals and left
//  `{{ muted }}` alone on a *legibility* test: a light theme's muted is a light
//  grey, 7.98:1 on the reference ground, so it reads. That test measured the wrong
//  axis (review, 2026-11-03). Slot 8's requirement is not legibility, it is
//  **quietness** — the channel's meaning is `muted ÷ ink`, and every shipped theme
//  holds it at 0.11–0.26 on its own ground:
//
//      ristretto 0.26 · tokyo-night 0.24 · nord 0.18   (dark)
//      rose-pine 0.22 · flexoki-light 0.11 · catppuccin-latte 0.27   (light)
//
//  On the pinned dark ground those light themes' muted goes to **0.95 / 0.75 /
//  0.71** — rose-pine's dim text arrives at the prose's own loudness, and the
//  page's rule is that above 1.00 a rule out-shouts what it divides
//  (`docs/2026-10-28-the-ground-you-read-on.md`). Nothing errors; the quiet
//  register is simply gone, *because* the ground was pinned and the rank left
//  behind. Pinning three of four neutrals is the hybrid with no name: own the
//  rank, or recommend a theme instead of delivering a pair.
//
//  `{{ muted }}` therefore takes okuda's own quiet ink (`#445566`, 2.14:1 on the
//  reference ground, share 0.20 — inside every shipped theme's range, and darker
//  than tokyo-night's 1.84:1). On a dark theme this is close to a no-op; on a
//  light one it is the repair.
//
//  `{{ bright_foreground }}` is the fourth neutral and it is spent twice —
//  `cursor-color` **and** `palette = 15`. A light theme's bright foreground is a
//  *dark* ink (flexoki-light `#100F0F` 1.17:1, catppuccin-latte `#4c4f69`
//  2.05:1), so on a pinned dark ground it is an invisible cursor. Legibility does
//  bind here, which is why the two directions of the rule are stated separately:
//  **a neutral may fail by going dark (unreadable) or by staying loud (unquiet);
//  the hues fail only if the theme's identity fails, and that is the theme's.**
//
//  Token-level substitution is also what preserves the template's own invariant
//  (`palette 0` is the ground, `palette 7` is the ink). Rewriting lines instead
//  would break the pairing that makes a fence's ANSI-0 background match the page.
//
//  Usage:
//    bun scripts/omarchy-theme.ts                    # the pinned template, on stdout
//    bun scripts/omarchy-theme.ts --rung 6           # another dogfooded pair
//    bun scripts/omarchy-theme.ts --bg '#23272e' --fg '#c8ccd4'
//    bun scripts/omarchy-theme.ts --muted '#5a4f45'   # a different quiet ink
//    bun scripts/omarchy-theme.ts --from <tpl>       # a copy, e.g. on a Mac
//    bun scripts/omarchy-theme.ts --diff             # only the lines that moved
//    bun scripts/omarchy-theme.ts --install          # write the override, say where
//
//  A crossing (`AGENTS.md`, the seam rule): `--install` prints what it wrote,
//  where it landed, and that the receiver owns it.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { okudaPalette, PAIR, referencePair, surfaceText, surfaceVerdict } from "./contrast";

/** The built-in template Omarchy ships for Ghostty. One per output file, which
 *  is what the override name keys on — not the theme name. */
export const DEFAULT_SOURCE = "/usr/share/omarchy/default/themed/ghostty.conf.tpl";

/** The override that wins over the built-in and is re-applied on every switch. */
export const DEFAULT_TARGET = join(homedir(), ".config", "omarchy", "themed", "ghostty.conf.tpl");

/** The tokens this pins, in the order the reading names them: **the four neutrals
 *  that carry the rank** (ANSI 0, 7, 8, 15 — ground, ink, quiet ink, bright ink).
 *  Membership is the header's rule; the values are below. The hues and the
 *  selection pair are the theme's and are not here on purpose. */
export const PINNED = ["background", "foreground", "muted", "bright_foreground"] as const;

export type PinnedToken = (typeof PINNED)[number];

export interface Pin {
  token: PinnedToken;
  value: string;
  /** Occurrences replaced. The template spends each token twice, so 2 is normal
   *  and 1 is a template that changed shape — reported, not corrected. */
  count: number;
}

export interface PinnedTemplate {
  text: string;
  pins: Pin[];
  /** Pinned tokens the template never mentioned. Empty is the passing case; a
   *  non-empty list means Omarchy renamed or dropped a variable, and the emitter
   *  refuses to write a template it cannot vouch for. */
  missing: PinnedToken[];
}

/** What each token becomes. `bright_foreground` takes the ink, not a brighter
 *  one: on a ground this dark the ink *is* the brightest text, and the theme's
 *  own bright foreground is the value that can go dark (the header's finding).
 *  `muted` takes okuda's own quiet ink by default — a *rank* value, share 0.20 on
 *  the reference ground, which is why it comes from the palette and not from the
 *  pair. A principal who wants a different quiet register passes `--muted`. */
export function pinValues(
  pair: { bg: string; fg: string },
  muted: string = okudaPalette().muted,
): Record<PinnedToken, string> {
  return { background: pair.bg, foreground: pair.fg, muted, bright_foreground: pair.fg };
}

/** Substitute the pinned tokens and leave every other `{{ … }}` byte-identical.
 *  Pure: template text, a pair and the quiet ink in; text and a receipt out. */
export function pinTemplate(
  template: string,
  pair: { bg: string; fg: string },
  muted: string = okudaPalette().muted,
): PinnedTemplate {
  const values = pinValues(pair, muted);
  const counts = new Map<PinnedToken, number>();
  const text = template.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (whole, name: string) => {
    if (!(PINNED as readonly string[]).includes(name)) return whole;
    const token = name as PinnedToken;
    counts.set(token, (counts.get(token) ?? 0) + 1);
    return values[token];
  });
  const pins: Pin[] = PINNED.filter((t) => counts.has(t)).map((token) => ({
    token,
    value: values[token],
    count: counts.get(token)!,
  }));
  const missing = PINNED.filter((t) => !counts.has(t));
  return { text, pins, missing };
}

/** The lines that differ between the built-in and the pinned template: the
 *  receipt a reader can check without diffing by eye. */
export function changedLines(source: string, pinned: string): { n: number; from: string; to: string }[] {
  const a = source.split("\n");
  const b = pinned.split("\n");
  const out: { n: number; from: string; to: string }[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) out.push({ n: i + 1, from: a[i] ?? "", to: b[i] ?? "" });
  }
  return out;
}

/** What the installed template currently says for each pinned neutral — read by
 *  **alignment, not by name**: the installed file is the built-in with values
 *  substituted, so the line that carries `{{ token }}` in the source is the line
 *  that carries the value on disk. Written this way because a substituted
 *  template no longer mentions the token, and a reader that cannot find a token it
 *  wrote cannot say whether its write survived.
 *
 *  Pure: two texts and the expected values in, a receipt out. `found: null` is a
 *  token whose line moved shape — the case where the answer is "cannot vouch"
 *  rather than "absent", and the two are reported differently. */
export function verifyPin(
  source: string,
  installed: string,
  expected: Record<PinnedToken, string>,
): { token: PinnedToken; found: string[]; expected: string; held: boolean }[] {
  const src = source.split("\n");
  const inst = installed.split("\n");
  return PINNED.map((token) => {
    const want = expected[token].toLowerCase();
    const needle = new RegExp(`\\{\\{\\s*${token}\\s*\\}\\}`);
    // **Every** occurrence, not the first: the template spends each token twice
    // (`background`, `foreground`, `palette = 0/7/8/15`, `cursor-color`), and a
    // reader that checks the first one calls a half-substituted template held.
    // Found by the stale control: editing `palette = 7` alone read as HELD.
    const found = src.flatMap((l, i) =>
      needle.test(l) ? [inst[i]?.match(/#[0-9a-fA-F]{6}/)?.[0].toLowerCase() ?? null] : [],
    );
    return { token, found, expected: want, held: found.length > 0 && found.every((f) => f === want) };
  });
}

/** The verify reading, and the one rule it enforces: **a pin that is not read
 *  back is an advice**. Three verdicts, and they are different facts:
 *
 *  - `absent` — no override file. The theme owns the surface again, which on a
 *    light theme means 16 of 21 on-ground roles under 3:1 (measured; `just
 *    surface-probe` on the box). This is a FAILURE on a host that has the
 *    template, because the pin is what makes okuda's own palette legible there.
 *  - `stale` — a file is installed and at least one neutral is not the pair it
 *    was pinned to. Someone edited it, or a pair moved in the palette.
 *  - `held` — all four neutrals are the pinned values. The page is the one the
 *    measurements describe. */
export function verifyText(
  rows: { token: PinnedToken; found: string[]; expected: string; held: boolean }[],
  where: string,
): string {
  const pad = (s: string | number, n: number): string => String(s).padEnd(n);
  const out: string[] = [`ground: ${where}`];
  for (const r of rows) {
    const seen = r.found.length === 0 ? "(not found)" : [...new Set(r.found.map((f) => f ?? "?"))].join(", ");
    out.push(
      `  ${pad(r.token, 18)}${pad(seen, 22)}${pad(`×${r.found.length}`, 4)}${r.held ? "held" : `expected ${r.expected}`}`,
    );
  }
  const held = rows.every((r) => r.held);
  out.push(
    held
      ? `  verdict: HELD — the four neutrals are okuda's pair; the theme supplies the hues.`
      : `  verdict: ${rows.some((r) => r.found.length === 0) ? "UNREADABLE" : "STALE"} — ` +
        `${rows.filter((r) => !r.held).map((r) => r.token).join(", ")} do not match the pin.`,
  );
  return out.join("\n");
}

function main(argv: string[]): number {
  const argAfter = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const sourcePath = argAfter("--from") ?? DEFAULT_SOURCE;
  const install = argv.includes("--install");
  const verify = argv.includes("--verify");
  const target = argAfter("--out") ?? DEFAULT_TARGET;

  // ── Verifying comes first, because its three verdicts are not the emitter's
  //    two. A host with no Omarchy template is not a failure — the pin has no
  //    meaning there — so that case exits 0 and *names the skip*; an Omarchy host
  //    with no override file is a failure, because the palette it will render is
  //    the unpacked one the light-theme measurement refuses.
  if (verify) {
    if (!existsSync(sourcePath)) {
      console.log(
        `ground: not this host — no Omarchy template at ${sourcePath}; the pin cannot be judged here.`,
      );
      return 0;
    }
    if (!existsSync(target)) {
      console.error(`ground: NOT INSTALLED — ${target} is absent.`);
      console.error(`  the theme owns the surface; okuda's palette is the unpacked one.`);
      console.error(`  fix: bun scripts/omarchy-theme.ts --install`);
      return 1;
    }
    const expected = pinValues(referencePair());
    const rows = verifyPin(readFileSync(sourcePath, "utf8"), readFileSync(target, "utf8"), expected);
    const held = rows.every((r) => r.held);
    // `--gate` is the quiet reading: the verdict in one line on pass, the table
    // when it is the evidence for a failure (ADR-GATE-TWO-RENDERS-085).
    const quiet = argv.includes("--gate");
    const text = verifyText(rows, `${target} ← ${sourcePath}`);
    if (held) console.log(quiet ? text.split("\n").pop()!.trim() : text);
    else console.error(text);
    return held ? 0 : 1;
  }

  if (!existsSync(sourcePath)) {
    console.error(
      `${sourcePath}: no Omarchy template to pin.\n` +
        `  This is expected off the Omarchy box (a Mac has no /usr/share/omarchy).\n` +
        `  Run it there, or pass --from <copy of the built-in template>.`,
    );
    return 1;
  }
  const source = readFileSync(sourcePath, "utf8");

  const rung = argAfter("--rung");
  const ref = rung === undefined ? PAIR : referencePair(Number.parseInt(rung, 10));
  const pair = { bg: argAfter("--bg") ?? ref.bg, fg: argAfter("--fg") ?? ref.fg };
  const muted = argAfter("--muted") ?? okudaPalette().muted;

  const pinned = pinTemplate(source, pair, muted);
  if (pinned.missing.length > 0) {
    console.error(
      `${sourcePath}: ${pinned.missing.map((t) => `{{ ${t} }}`).join(", ")} not found in the template.\n` +
        `  Omarchy's template changed shape. The pair cannot be pinned by a substitution it\n` +
        `  does not match — read the template and correct PINNED before writing anything.`,
    );
    return 1;
  }

  if (argv.includes("--diff")) {
    for (const l of changedLines(source, pinned.text)) {
      console.log(`${String(l.n).padStart(3)}  − ${l.from}`);
      console.log(`     + ${l.to}`);
    }
    return 0;
  }

  if (argv.includes("--json")) {
    console.log(JSON.stringify({ source: sourcePath, pair, muted, pins: pinned.pins, text: pinned.text }, null, 2));
    return 0;
  }

  if (install) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, pinned.text);
    // The crossing declares itself: what was written, where it landed, who owns
    // it — and where the pair is judged, because a pin that is never read back
    // is a claim.
    console.log(`wrote ${target}`);
    console.log(
      `  from ${sourcePath} — neutral ramp pinned to ${pair.bg} / ${pair.fg}` +
        (ref.name ? ` (${ref.name})` : ""),
    );
    console.log(`  ${pinned.pins.map((p) => `${p.token} ×${p.count}`).join(", ")}; palette 0/7/8/15 follow`);
    console.log(`  the file is yours now: Omarchy re-applies it on every theme switch;`);
    console.log(`  delete it to let the theme own the surface again`);
    console.log(`  next: switch a theme, then \`just surface-probe\` — it reads the pair back`);
    return 0;
  }

  // The verdict is the instrument the palette is gated by, so a pin that cannot
  // be read is refused here rather than in the report. It goes to stderr because
  // stdout is the template: `> file` must stay byte-clean.
  const v = surfaceVerdict(pair);
  const line = surfaceText(v, PAIR).split("\n")[0]!;
  process.stderr.write(`${line}\n`);
  if (!v.readable || !v.navigable) {
    process.stderr.write(`REFUSED — ${pair.bg} / ${pair.fg} is not a pair to pin.\n`);
    return 1;
  }

  process.stdout.write(pinned.text);
  return 0;
}

if (import.meta.main) process.exitCode = main(process.argv.slice(2));
