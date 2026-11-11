import { describe, expect, test } from "bun:test";
import {
  ESC,
  ST,
  QUERY,
  multiplexer,
  parseOscReply,
  setOsc,
  surfaceCommand,
  surfacePlan,
  surfaceRefusal,
  type Host,
} from "../src/surface-plan";

/** ── The pair's lifecycle, asserted rather than discovered at a terminal ──
 *
 *  The control runs first: a plain tty host that answered both queries may be
 *  owned, and its plan names the bytes and their order. Only then is the module
 *  believed about the refusals — six ways to not be the glass, each of which must
 *  emit **no byte at all**, because a fail-closed path that writes a read is
 *  still a state change.
 */

const PAIR = { bg: "#221f1c", fg: "#d6cfc4" };

/** A host that answered, in X11's `rgb:` spelling — the spelling most likely to
 *  be re-serialised by a careless give-back, so the one worth pinning. */
const GOOD: Host = { tty: true, reply: { bg: "rgb:1e1e/1e1e/2e2e", fg: "rgb:cdcd/d6d6/f4f4" } };

describe("surface-plan — the control passes first", () => {
  test("a plain tty host that answered is ownable, in the documented order", () => {
    expect(surfaceRefusal(GOOD)).toBeNull();
    expect(surfaceCommand(GOOD)).toBe("own");
    const plan = surfacePlan(GOOD, PAIR);
    expect(plan.command).toBe("own");
    // foreground, then background — for the set and for the give-back alike.
    expect(plan.enter).toEqual([setOsc(10, PAIR.fg), setOsc(11, PAIR.bg)]);
    expect(plan.leave).toEqual([setOsc(10, GOOD.reply!.fg), setOsc(11, GOOD.reply!.bg)]);
  });

  test("the give-back is the host's own string, never a re-serialised hex", () => {
    const plan = surfacePlan(GOOD, PAIR);
    expect(plan.leave[1]).toBe(`${ESC}]11;rgb:1e1e/1e1e/2e2e${ST}`);
    expect(plan.leave[1]).not.toContain("#1e1e2e");
    // ...and the other spelling survives just as literally.
    const hexed = surfacePlan({ ...GOOD, reply: { bg: "#1e1e2e", fg: "#cdd6f4" } }, PAIR);
    expect(hexed.leave).toEqual([setOsc(10, "#cdd6f4"), setOsc(11, "#1e1e2e")]);
  });
});

describe("surface-plan — every refusal emits nothing", () => {
  const refusals: [string, Host][] = [
    ["not a tty", { ...GOOD, tty: false }],
    ["tmux", { ...GOOD, TMUX: "/tmp/tmux-501/default,1234,0" }],
    ["screen", { ...GOOD, STY: "1234.pts-1" }],
    ["herdr", { ...GOOD, HERDR_PANE_ID: "pane-7" }],
    ["zellij", { ...GOOD, ZELLIJ: "0" }],
    ["wezterm", { ...GOOD, WEZTERM_PANE: "3" }],
    ["no reply at all", { tty: true }],
    ["background only", { tty: true, reply: { bg: "#1e1e2e" } as never }],
    ["foreground only", { tty: true, reply: { fg: "#cdd6f4" } as never }],
  ];

  for (const [why, host] of refusals) {
    test(`${why} → inherit, and not one byte`, () => {
      expect(surfaceCommand(host)).toBe("inherit");
      expect(surfaceRefusal(host)).toBeTruthy();
      const plan = surfacePlan(host, PAIR);
      expect(plan.command).toBe("inherit");
      expect(plan.enter).toEqual([]);
      expect(plan.leave).toEqual([]);
      // The assertion with teeth: the refusal must not smuggle a *read* either.
      const bytes = [...plan.enter, ...plan.leave].join("");
      expect(bytes).not.toContain(";?");
      expect(bytes).not.toContain(ESC);
    });
  }

  test("the refusal names the cause, in the caller's own words", () => {
    expect(surfaceRefusal({ ...GOOD, tty: false })).toContain("pipe");
    expect(surfaceRefusal({ ...GOOD, TMUX: "x" })).toContain("tmux");
    expect(surfaceRefusal({ tty: true })).toContain("nothing to give back");
  });
});

describe("surface-plan — the reply parse is one derivation", () => {
  test("X11 `rgb:` is a fraction of the maximum, not a left-aligned pattern", () => {
    // `f` in one digit is 15/15, i.e. #ff — the case a naive parse gets quietly wrong.
    expect(parseOscReply(`\x1b]11;rgb:f/f/f\x1b\\`, 11)).toEqual({ hex: "#ffffff", raw: "rgb:f/f/f" });
    expect(parseOscReply(`\x1b]10;rgb:1e1e/1e1e/2e2e\x07`, 10)).toEqual({
      hex: "#1e1e2e",
      raw: "rgb:1e1e/1e1e/2e2e",
    });
  });

  test("the hex spelling normalises for reading and keeps the raw for giving back", () => {
    const parsed = parseOscReply(`\x1b]10;#CDD6F4\x1b\\`, 10);
    expect(parsed).toEqual({ hex: "#cdd6f4", raw: "#CDD6F4" });
  });

  test("the wrong code, or no reply, is not a reading", () => {
    expect(parseOscReply(`\x1b]11;rgb:1e1e/1e1e/2e2e\x1b\\`, 10)).toBeNull();
    expect(parseOscReply("no escape here", 10)).toBeNull();
    expect(parseOscReply(`\x1b]10;not-a-colour\x1b\\`, 10)).toEqual({ hex: null, raw: "not-a-colour" });
  });
});

describe("surface-plan — the wire vocabulary", () => {
  test("only the two defaults, in the shapes the hosts answer", () => {
    expect(QUERY).toEqual({ bg: `${ESC}]11;?${ST}`, fg: `${ESC}]10;?${ST}` });
    expect(setOsc(10, "#d6cfc4")).toBe(`${ESC}]10;#d6cfc4${ST}`);
    expect(setOsc(11, "#221f1c")).toBe(`${ESC}]11;#221f1c${ST}`);
    expect(multiplexer({})).toBeNull();
    expect(multiplexer({ HERDR_ENV: "1" })).toBe("herdr");
  });
});
