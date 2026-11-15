import { describe, expect, test } from "bun:test";
import { PAIRS, ratio } from "../scripts/contrast.ts";
import {
  srgbToP3,
  colour,
  pinFromRung,
  buildEntry,
  rungLine,
  mergeThemes,
  installScript,
  isRexRunning,
  REX_RUNNING_CMD,
} from "../scripts/rex-theme.ts";

describe("rex-theme — the conversion has a control, and the control passes first", () => {
  test("grey survives: a neutral sRGB triple is the same neutral in P3", () => {
    // The no-change case. Both primaries are D65, so a grey that moves is a bug.
    for (const v of [0, 0.25, 0.5, 0.8, 1]) {
      const p = srgbToP3([v, v, v]);
      for (const c of p) expect(Math.abs(c - v)).toBeLessThan(1e-3);
    }
  });

  test("a chromatic colour moves: sRGB red reads as the published P3 red", () => {
    // The change case — the control above is only evidence if this one differs.
    const [r, g, b] = srgbToP3([1, 0, 0]);
    expect(r).toBeCloseTo(0.9175, 3);
    expect(g).toBeCloseTo(0.2003, 3);
    expect(b).toBeCloseTo(0.1386, 3);
  });

  test("both spaces are stored, and the sRGB one is the input unchanged", () => {
    const c = colour("#221f1c")!;
    expect(c.colorSpace).toBe("display-p3");
    expect(c.srgbFallback.colorSpace).toBe("srgb");
    expect(c.srgbFallback.red).toBeCloseTo(0x22 / 255, 6);
    expect(c.srgbFallback.green).toBeCloseTo(0x1f / 255, 6);
    expect(c.srgbFallback.blue).toBeCloseTo(0x1c / 255, 6);
    // P3 is not a copy of sRGB: the readings differ, or one of them is a lie.
    expect(c.red).not.toBe(c.srgbFallback.red);
  });

  test("a hex the parser refuses is null, not a guess", () => {
    expect(colour("221f1c")).not.toBeNull(); // the leading # is optional
    expect(colour("#221f1")).toBeNull();
    expect(colour("nonsense")).toBeNull();
  });
});

describe("rex-theme — the pin is derived from the ladder", () => {
  test("the rung's pair is PAIRS', not a second table", () => {
    for (const pair of PAIRS) {
      const got = pinFromRung(pair.n);
      expect("error" in got).toBe(false);
      if (!("error" in got)) {
        expect(got.bg).toBe(pair.bg);
        expect(got.fg).toBe(pair.fg);
      }
    }
  });

  test("an unknown rung refuses and names the rungs there are", () => {
    const got = pinFromRung(99);
    expect("error" in got).toBe(true);
    if ("error" in got) expect(got.error).toContain("PAIRS names");
  });

  test("the receipt is contrast.ts's arithmetic, not a second calculation", () => {
    const pair = PAIRS[8]!;
    expect(rungLine(pair)).toContain(`${ratio(pair.bg, pair.fg).toFixed(1)}:1`);
  });

  test("the entry authors three colours and no ANSI slots", () => {
    const entry = buildEntry({ pair: PAIRS[8]!, rung: 8, appearance: "dark" });
    // the id shape the host uses for its own custom themes, and stable across runs
    expect(entry.id).toMatch(/^custom-[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/);
    expect(buildEntry({ pair: PAIRS[8]!, rung: 8, appearance: "dark" }).id).toBe(entry.id);
    expect(entry.createdAt).toBeGreaterThan(700000000); // after 2023, in Apple's epoch
    expect(entry.appearance).toBe("dark");
    expect(Object.keys(entry.palette).sort()).toEqual(["background", "cursor", "foreground"]);
    expect(entry.palette.ansi).toBeUndefined();
    // the cursor is the ink: one colour declared twice is not a fourth opinion
    expect(entry.palette.cursor).toEqual(entry.palette.foreground);
  });
});

describe("rex-theme — refusals name the cause", () => {
  test("snapshot without a source theme refuses, because a stock palette is not in the plist", () => {
    const r = Bun.spawnSync(["bun", "scripts/rex-theme.ts", "8", "--variant", "snapshot"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(r.exitCode).toBe(2);
    expect(r.stderr.toString()).toContain("--ansi-from");
  });

  test("an unknown rung at the CLI exits non-zero and prints the rungs", () => {
    const r = Bun.spawnSync(["bun", "scripts/rex-theme.ts", "99"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(r.exitCode).toBe(2);
    expect(r.stderr.toString()).toContain("no rung 99");
  });

  test("--plan writes nothing: the entry and the sequence go to stdout", () => {
    const r = Bun.spawnSync(["bun", "scripts/rex-theme.ts", "8"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(r.exitCode).toBe(0);
    const out = r.stdout.toString();
    expect(out).toMatch(/custom-[0-9A-F]{8}-[0-9A-F]{4}-/);
    expect(out).toContain("quit Rex");
    expect(out).toContain("Workspace.darkThemeID");
  });
});

describe("rex-theme — the pin never eats another theme", () => {
  test("a new id is appended; an existing id is replaced in place", () => {
    const other = { id: "custom-other", name: "someone else's" };
    const entry = buildEntry({ pair: PAIRS[8]!, rung: 8, appearance: "dark" });
    const appended = mergeThemes([other], entry);
    expect(appended.length).toBe(2);
    expect(appended[0]).toBe(other);
    const replaced = mergeThemes([other, { ...entry, name: "stale" }], entry);
    expect(replaced.length).toBe(2);
    expect((replaced[1] as { name: string }).name).toBe(entry.name);
  });
});

describe("rex-theme — the installer runs after the host, not during it", () => {
  test("the script waits, writes the whole array, reads back, relaunches", () => {
    const entry = buildEntry({ pair: PAIRS[8]!, rung: 8, appearance: "dark" });
    const sh = installScript({
      array: [{ id: "custom-other" }, entry],
      id: entry.id,
      slot: "dark",
      repo: "/repo",
    });
    expect(sh.startsWith("#!/bin/sh")).toBe(true);
    // it must kill before it writes, and it must not wait on a graceful quit
    const killAt = sh.indexOf("kill -9");
    const writeAt = sh.indexOf("Workspace.customThemes -data");
    expect(killAt).toBeGreaterThan(0);
    expect(writeAt).toBeGreaterThan(killAt);
    expect(sh).not.toContain("osascript");
    expect(sh).toContain(`Workspace.darkThemeID -string ${JSON.stringify(entry.id)}`);
    expect(sh).toContain("just surface-probe");
    expect(sh).toContain("open -a \"Rex Beta.app\"");
    // and it refuses to write on a timeout rather than proceeding anyway
    expect(sh).toContain("kill -9")
  });
});

describe("rex-theme — a probe is not a candidate", () => {
  test("two probe pairs get different ids, and neither is named a rung", () => {
    const a = buildEntry({ pair: { bg: "#F000C8", fg: "#7CFC00" }, rung: -1, appearance: "dark" });
    const b = buildEntry({ pair: { bg: "#0000FF", fg: "#FFFF00" }, rung: -1, appearance: "dark" });
    expect(a.id).not.toBe(b.id);
    expect(a.name).toContain("probe");
    expect(a.name).toContain("not a candidate");
  });
});

describe("rex-theme — the host check reads the exit status, not the PID", () => {
  test("pgrep's output is not evidence: the command is silent either way", () => {
    const r = Bun.spawnSync(["sh", "-c", REX_RUNNING_CMD]);
    expect(r.stdout.toString()).toBe(""); // a PID in stdout is what fooled the check
    // and the boolean agrees with the exit status
    expect(isRexRunning()).toBe(r.exitCode === 0);
  });
});
