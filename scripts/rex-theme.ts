#!/usr/bin/env bun
// ── rex-theme.ts — the pin: the pair declared where the glass reads it ──
//
//  ADR-PAIR-HAS-A-HOME-092. The figure-ground pair belongs to the glass, so it
//  is declared in the host's theme slot — the only artifact that carries the
//  pair AND the colour space it is read in (`display-p3` values plus an
//  `srgbFallback` per colour; `Workspace.terminalUsesDisplayP3` picks one).
//
//  A *pin*, not a theme: okuda authors exactly three colours — background,
//  foreground, cursor — and no ANSI slots, unless a snapshot is named. It is
//  generated from `PAIRS` so it cannot drift from the ladder the docs quote.
//
//  Sibling of `herdr-theme.ts`, which pins the same three keys in Herdr's file
//  format. The difference is not the shape but the space: Herdr stores hexes,
//  Rex stores a P3 reading beside an sRGB fallback, so only this one derives
//  the second encoding — and only this one stores colours rather than strings.
//  It writes nothing: `--install` prints the sequence and refuses while Rex
//  runs, because the host holds the domain and cfprefsd would eat the write.
//
//  Usage: `just pin <rung> [--variant generate|snapshot] [--ansi-from <id>]
//  [--appearance dark|light] [--install]`. Without `--install` it prints the
//  entry and the sequence; it writes nothing.
//
//  Install is a declared sequence, not a call: Rex holds the domain while it
//  runs, so `cfprefsd` will overwrite a blind write. `--install` therefore
//  refuses while Rex is running, and says so.

import { writeFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PAIRS, ratio, oklchL, type Pair } from "./contrast.ts";

export type Space = "srgb" | "display-p3";

export interface Colour {
  red: number;
  green: number;
  blue: number;
  alpha: number;
  colorSpace: "display-p3";
  srgbFallback: {
    red: number;
    green: number;
    blue: number;
    alpha: number;
    colorSpace: "srgb";
  };
}

const hex2rgb = (hex: string): [number, number, number] | null => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3], 16)];
};

const toLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const toSrgb = (c: number): number =>
  c <= 0.0031308 ? 12.9 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

// sRGB → CIE XYZ (D65), and XYZ → linear Display P3. Both primaries share the
// D65 white, so no chromatic adaptation is needed — only the primaries differ.
const SRGB_TO_XYZ = [
  [0.4123908, 0.3575843, 0.1804808],
  [0.2126390, 0.7151687, 0.0721923],
  [0.0193308, 0.1191948, 0.9505322],
] as const;
const XYZ_TO_P3 = [
  [2.4934969, -0.9313836, -0.4027108],
  [-0.8294890, 1.7626641, 0.0236247],
  [0.0358458, -0.0761724, 0.9568845],
] as const;

const mul = (m: readonly (readonly number[])[], v: number[]): number[] =>
  m.map((row) => row[0]! * v[0]! + row[1]! * v[1]! + row[2]! * v[2]!);

/** The P3 encoding of an sRGB triple, each channel 0–1. Pure. */
export const srgbToP3 = (rgb: [number, number, number]): [number, number, number] => {
  const linear = rgb.map(toLinear);
  const p3 = mul(XYZ_TO_P3, mul(SRGB_TO_XYZ, linear)).map(toSrgb);
  return p3.map((c) => Math.min(1, Math.max(0, c))) as [number, number, number];
};

/** One colour in the host's stored shape: the P3 reading and its sRGB
 *  fallback, both stated. `null` for a hex the parser refuses. */
export const colour = (hex: string): Colour | null => {
  const rgb = hex2rgb(hex);
  if (!rgb) return null;
  const s = rgb.map((c) => c / 255) as [number, number, number];
  const p = srgbToP3(s);
  return {
    colorSpace: "display-p3",
    red: p[0],
    green: p[1],
    blue: p[2],
    alpha: 1,
    srgbFallback: {
      colorSpace: "srgb",
      red: s[0],
      green: s[1],
      blue: s[2],
      alpha: 1,
    },
  };
};

export interface PinOptions {
  rung: number;
  appearance?: "dark" | "light";
  /** `generate` leaves the host's own palette synthesis to fill the 16 slots;
   *  `snapshot` copies them from a named custom theme (declared, not authored). */
  variant?: "generate" | "snapshot";
  ansiFrom?: string | null;
  pairs?: Pair[];
}

/** A UUID shaped from a seed: deterministic, so a re-run replaces rather than
 *  appends, and the shape the host uses for its own ids (`custom-<UUID>`).
 *  The only id shape observed on this machine — so it is the shape we emit
 *  rather than one we hope is accepted. */
export const stableUuid = (seed: string): string => {
  const h = createHash("sha256").update(seed).digest("hex").toUpperCase();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
};

/** Apple's epoch: seconds since 2001-01-01, which is how `createdAt` is stored. */
const appleEpoch = (ms: number = Date.now()): number => ms / 1000 - 978307200;

export interface PinEntry {
  name: string;
  id: string;
  appearance: "dark" | "light";
  createdAt: number;
  source: { manual: Record<string, never> };
  palette: Record<string, unknown>;
}

/** The rung, or a refusal that names what was asked for. */
export const pinFromRung = (rung: number, pairs: Pair[] = PAIRS): Pair | { error: string } => {
  const pair = pairs.find((p) => p.n === rung);
  if (!pair) {
    return {
      error: `no rung ${rung} — PAIRS names ${pairs.map((p) => p.n).join(", ")} (scripts/contrast.ts:41)`,
    };
  }
  return pair;
};

/** The theme record. Three colours are ours; everything else is either left
 *  absent (the app generates it) or copied verbatim from `snapshot`. */
export const buildEntry = (
  opts: {
    pair: { bg: string; fg: string };
    rung: number;
    appearance: "dark" | "light";
    palette?: Record<string, unknown>;
  },
): PinEntry => {
  const bg = colour(opts.pair.bg);
  const fg = colour(opts.pair.fg);
  if (!bg || !fg) throw new Error("pair is not two hex colours");
  const palette: Record<string, unknown> = {
    background: bg,
    foreground: fg,
    cursor: fg,
    ...(opts.palette ?? {}),
  };
  // A rung's pin is named for the rung; a probe (no rung) is named for its own
  // pair, so two probes cannot wear one id and one cannot silently replace the
  // other. Both ids are deterministic: re-running replaces, never appends.
  const probe = opts.rung < 0;
  const seed = probe ? `okuda-pin-${opts.pair.bg}-${opts.pair.fg}` : `okuda-rung-${opts.rung}`;
  return {
    name: probe
      ? `okuda probe (${opts.pair.bg}/${opts.pair.fg}) — not a candidate`
      : `okuda rung ${opts.rung} (${opts.pair.bg}/${opts.pair.fg})`,
    id: `custom-${stableUuid(seed)}`,
    createdAt: appleEpoch(),
    appearance: opts.appearance,
    source: { manual: {} },
    palette,
  };
};

/** Which rung is on the glass, as the ladder reads it — the receipt. */
export const rungLine = (pair: Pair): string =>
  `rung ${pair.n} · ${pair.bg}/${pair.fg} · ${ratio(pair.bg, pair.fg).toFixed(1)}:1 · L ${oklchL(pair.fg).toFixed(2)} · ${pair.name}`;

/** Whether the host is up. Through the **exit status**, not the output: `pgrep`
 *  prints a PID, so testing its stdout for the word "Rex" reads every running
 *  host as absent — which is exactly how the first `pin-install` refused with
 *  Rex on screen (found by the operator, 2026-11-13). */
export const REX_RUNNING_CMD = "pgrep -x Rex >/dev/null || pgrep -f 'Rex Beta.app' >/dev/null";

export const isRexRunning = (): boolean =>
  Bun.spawnSync(["sh", "-c", REX_RUNNING_CMD]).exitCode === 0;

/** The theme blob as it stands, or a refusal. The stored value is `data`
 *  holding JSON, so it survives a plist round trip as base64 of that JSON. */
export const readThemes = (): { themes: Record<string, unknown>[] } | { error: string } => {
  const exported = Bun.spawnSync(["defaults", "export", "com.superlogical.rex", "-"]);
  if (exported.exitCode !== 0) return { error: "cannot read com.superlogical.rex" };
  // plutil reads a path, not a pipe: stage the export, convert, read, remove.
  const staged = join(tmpdir(), `rex-prefs-${process.pid}.plist`);
  try {
    writeFileSync(staged, exported.stdout);
  } catch {
    return { error: "cannot stage the preferences export" };
  }
  // The whole domain will not convert to JSON (it holds dates), and the key has
  // a dot in it — so extract the one key, escaped, in its raw (base64) form.
  const raw = Bun.spawnSync([
    "plutil",
    "-extract",
    "Workspace\\.customThemes",
    "raw",
    "-o",
    "-",
    staged,
  ]);
  rmSync(staged, { force: true });
  if (raw.exitCode !== 0) return { error: "no Workspace.customThemes key in the domain" };
  try {
    const blob = raw.stdout.toString().trim();
    return { themes: JSON.parse(Buffer.from(blob, "base64").toString("utf8")) };
  } catch {
    return { error: "Workspace.customThemes is not the JSON array the pin expects" };
  }
};

/** The array to write: every theme that is there, with the pin replacing only
 *  an entry of its own id. A pin that replaced the whole array would delete the
 *  operator's other themes, which is not a pin. */
export const mergeThemes = (
  existing: Record<string, unknown>[],
  entry: PinEntry,
): Record<string, unknown>[] =>
  existing.some((t) => t.id === entry.id)
    ? existing.map((t) => (t.id === entry.id ? entry : t))
    : [...existing, entry];

/** The detached installer, as text. Order is the whole point: wait for the host
 *  to exit (cfprefsd would overwrite a blind write), write, read the pair back,
 *  then relaunch. Pure — the caller writes and detaches it. */
export const installScript = (opts: {
  array: unknown[];
  id: string;
  slot: "dark" | "light";
  repo: string;
  log?: string;
}): string => {
  const hex = Buffer.from(JSON.stringify(opts.array), "utf8").toString("hex");
  const log = opts.log ?? "/tmp/rex-pin.log";
  return `#!/bin/sh
# written by just pin-install — kills the host, then writes. Order is the point.
log=${log}
{
  echo "$(date +%FT%T) pin installer: ${opts.id}"
  if pgrep -x Rex >/dev/null; then
    # SIGKILL, not a graceful quit: a quitting app writes its cached preferences
    # on the way out, and that write is the one that would clobber ours.
    echo "$(date +%FT%T) killing Rex (SIGKILL — no prefs save on the way out)"
    kill -9 $(pgrep -x Rex) 2>/dev/null
    i=0
    while pgrep -x Rex >/dev/null && [ $i -lt 20 ]; do sleep 0.25; i=$((i+1)); done
  fi
  if pgrep -x Rex >/dev/null; then
    echo "$(date +%FT%T) FAILED: Rex is still running; nothing written"
    exit 1
  fi
  defaults write com.superlogical.rex Workspace.customThemes -data ${hex}
  defaults write com.superlogical.rex Workspace.${opts.slot}ThemeID -string ${JSON.stringify(opts.id)}
  echo "$(date +%FT%T) wrote ${opts.id} into Workspace.${opts.slot}ThemeID"
  echo "$(date +%FT%T) readback (the file, not the screen):"
  cd ${JSON.stringify(opts.repo)} || exit 1
  just surface-probe 2>&1 | sed 's/^/    /'
  echo "$(date +%FT%T) relaunching"
  open -a "Rex Beta.app"
} >> "$log" 2>&1
`;
};

/** The write, spelled out. The caller decides whether to run it. */
export function planLines(entry: { name: string }, array: unknown[], selectSlot = "dark"): string[] {
  const hex = Buffer.from(JSON.stringify(array), "utf8").toString("hex");
  return [
    `# the array below is complete: ${array.length} theme(s), yours included`,
    "# 1. quit Rex (it holds the domain; cfprefsd overwrites a blind write)",
    "# 2. write it — the blob is data, and this value replaces the whole array:",
    `defaults write com.superlogical.rex Workspace.customThemes -data ${hex}`,
    `# 3. select it in the slot its appearance matches, then relaunch:`,
    `defaults write com.superlogical.rex Workspace.${selectSlot}ThemeID -string ${JSON.stringify((entry as { id?: string }).id)}`,
    "#    the other slot needs its own pin (--appearance light): one pin cannot fill both,",
    "#    and a dark pair selected in the light slot re-ranks the page on a switch.",
    "# 4. read it back — the probe is the instrument, not the memory of the write:",
    "just surface-probe",
  ];
}

const main = (argv: string[]): number => {
  const args = argv.slice(2);
  const rungArg = args.find((a) => /^\d+$/.test(a));
  const rung = rungArg ? Number(rungArg) : 8;
  const variant = (args.includes("--variant")
    ? args[args.indexOf("--variant") + 1]
    : "generate") as "generate" | "snapshot";
  const ansiFrom = args.includes("--ansi-from") ? args[args.indexOf("--ansi-from") + 1]! : null;
  const appearance = (args.includes("--appearance")
    ? args[args.indexOf("--appearance") + 1]
    : "dark") as "dark" | "light";
  const install = args.includes("--install");
  const arg = (flag: string): string | undefined =>
    args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined;

  // A rung, or an explicit pair. The pair exists for the *probe*: a ground you
  // cannot mistake for the one you are on, so a mechanism failure and a taste
  // failure are not the same observation.
  const bgArg = arg("--bg");
  const fgArg = arg("--fg");
  let pair: Pair;
  if (bgArg || fgArg) {
    if (!bgArg || !fgArg) {
      console.error("pin: --bg and --fg come together (a pair is two numbers)");
      return 2;
    }
    if (!colour(bgArg) || !colour(fgArg)) {
      console.error("pin: --bg/--fg take hex, RRGGBB or #RRGGBB");
      return 2;
    }
    pair = { n: -1, name: "probe — not a candidate", bg: bgArg, fg: fgArg };
  } else {
    const found = pinFromRung(rung);
    if ("error" in found) {
      console.error(`pin: ${found.error}`);
      return 2;
    }
    pair = found;
  }

  const palette: Record<string, unknown> = {};
  if (variant === "snapshot") {
    if (!ansiFrom) {
      console.error(
        "pin: --variant snapshot needs --ansi-from <theme id> — a stock theme's palette lives in the app, not the plist, so there is nothing to copy from by default",
      );
      return 2;
    }
    console.error(
      `pin: snapshot of ${ansiFrom} is not implemented in this phase — the copy must be read from Workspace.customThemes and declared with its date. Use --variant generate.`,
    );
    return 2;
  }
  // The host derives the 256 palette from the pair. Unverified until a relaunch.
  Object.assign(palette, {
    paletteGenerate: true,
    paletteHarmonious: true,
    paletteBase: {},
    paletteOverrides: {},
  });

  const entry = buildEntry({ pair, rung: pair.n, appearance, palette });
  const current = readThemes();
  if ("error" in current) {
    console.error(`pin: ${current.error} — refusing rather than replacing the blob blind`);
    return 2;
  }
  const array = mergeThemes(current.themes, entry);
  console.log(rungLine(pair));
  console.log(JSON.stringify(entry));
  for (const line of planLines(entry, array, appearance)) console.log(line);
  if (!install) return 0;

  const running = isRexRunning();
  if (!running) {
    console.error("pin: Rex is not running — nothing to wait for; write the plan by hand");
    return 2;
  }
  const path = join(tmpdir(), `rex-pin-${Date.now()}.sh`);
  writeFileSync(
    path,
    installScript({ array, id: entry.id, slot: appearance, repo: process.cwd() }),
    { mode: 0o755 },
  );
  // Detached on purpose: this process runs in a pane, and the pane dies with
  // the host. The write must outlive the terminal it was typed into.
  Bun.spawnSync(["sh", "-c", `nohup "${path}" >/dev/null 2>&1 &`]);
  console.log(`pin: installer staged at ${path}; log at /tmp/rex-pin.log`);
  console.log("pin: this window is about to die — the installer kills Rex, writes, reads back, relaunches");
  console.log("pin: the log is /tmp/rex-pin.log; the relaunched app carries the pin");
  return 0;
};

if (import.meta.main) process.exit(main(process.argv));
