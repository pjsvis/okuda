import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectColorMode, makeStyler, sameAddress } from "../src/ansi";
import { DRACULA_PALETTE, loadPalette } from "../src/palette";
import okudaPreset from "../src/palettes/okuda.json";

function tempFile(name: string): string {
  return join(mkdtempSync(join(tmpdir(), "okuda-pal-")), name);
}

describe("ansi — colour mode detection (contract table)", () => {
  test("default: truecolor", () => {
    expect(detectColorMode({})).toBe("truecolor");
  });

  test("NO_COLOR (any value) → none", () => {
    expect(detectColorMode({ NO_COLOR: "1" })).toBe("none");
    expect(detectColorMode({ NO_COLOR: "" })).toBe("none");
  });

  test("TERM=dumb → none", () => {
    expect(detectColorMode({ TERM: "dumb" })).toBe("none");
  });

  test("FORCE_COLOR overrides TERM=dumb", () => {
    expect(detectColorMode({ TERM: "dumb", FORCE_COLOR: "1" })).toBe("truecolor");
  });

  test("FORCE_COLOR overrides NO_COLOR (explicit override wins)", () => {
    expect(detectColorMode({ NO_COLOR: "1", FORCE_COLOR: "1" })).toBe("truecolor");
  });
});

describe("styler — byte-exact SGR sequences", () => {
  test("heading: bold + \\x1b[38;2;189;147;249;1m (glow purple, colour-first)", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    const out = s.roleBold("heading", "T");
    expect(out).toBe("\x1b[38;2;189;147;249;1mT\x1b[0m");
  });

  test("code text: \\x1b[38;2;80;250;123m (glow green)", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    expect(s.role("code-text", "x")).toBe("\x1b[38;2;80;250;123mx\x1b[0m");
  });

  test("code line: no background (dropped Pass B); \x1b[38;2;80;250;123m fg", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    const out = s.codeLine("x");
    expect(out).toBe("\x1b[38;2;80;250;123mx\x1b[0m");
    expect(out).not.toContain("48;2"); // no background
  });

  test("blockquote: \\x1b[38;2;118;118;118m", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    expect(s.role("blockquote", "q")).toBe("\x1b[38;2;118;118;118mq\x1b[0m");
  });

  test("link: rose text + cyan-underlined URL, no OSC 8 (glow-faithful)", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    const out = s.link("text", "https://x.example");
    expect(out).toContain("\x1b[38;2;255;121;198mtext\x1b[0m"); // rose text
    expect(out).toContain("\x1b[38;2;139;233;253;4mhttps://x.example\x1b[0m"); // cyan+underline url
    expect(out).not.toContain("\x1b]8;;"); // no OSC 8
  });

  test("link self-identical: the address once, destination paint (BRF-SELF-IDENTICAL-LINK)", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    const out = s.link("https://x.example", "https://x.example");
    expect(out).toBe("\x1b[38;2;139;233;253;4mhttps://x.example\x1b[0m"); // once, cyan+underline
    // Trailing-slash equivalence — still once, no rose twin.
    const slash = s.link("https://x.example/", "https://x.example");
    expect(slash.match(/https:\/\/x\.example/g)).toHaveLength(1);
  });

  test("sameAddress: exact or scheme-shaped slash-equal — nothing further", () => {
    expect(sameAddress("https://a.b", "https://a.b")).toBe(true);
    expect(sameAddress("https://a.b/", "https://a.b")).toBe(true); // root-slash equivalence
    expect(sameAddress("foo", "foo")).toBe(true); // relative self-link: same zero-information case
    expect(sameAddress("a.b", "https://a.b")).toBe(false); // shortened label — two-part paint stands
    expect(sameAddress("text", "https://a.b")).toBe(false);
    expect(sameAddress("http://a.b", "https://a.b")).toBe(false); // no scheme equivalence
    expect(sameAddress("x", "")).toBe(false);
    expect(sameAddress("", "https://a.b")).toBe(false);
  });

  test("emphasis: italic + \\x1b[38;2;241;250;140;3m (glow Dracula yellow, colour-first)", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    expect(s.roleItalic("emphasis", "i")).toBe("\x1b[38;2;241;250;140;3mi\x1b[0m");
  });

  test("bold-italic combo: \\x1b[38;2;241;250;140;1;3m — emphasis colour, not strong's", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    expect(s.roleBoldItalic("emphasis", "bi")).toBe("\x1b[38;2;241;250;140;1;3mbi\x1b[0m");
  });

  test("strong: bold + \\x1b[38;2;255;184;108;1m (glow orange, colour-first)", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    expect(s.roleBold("strong", "b")).toBe("\x1b[38;2;255;184;108;1mb\x1b[0m");
  });

  test("table header: bold + \\x1b[38;2;189;147;249;1m (glow purple, colour-first)", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    expect(s.roleBold("table-header", "h")).toBe("\x1b[38;2;189;147;249;1mh\x1b[0m");
  });

  test("table key: bold + \\x1b[38;2;255;255;135;1m (colour-first)", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    expect(s.roleBold("table-key", "k")).toBe("\x1b[38;2;255;255;135;1mk\x1b[0m");
  });

  test("badge: pink bg + near-white fg + padded (Gloam footer chrome)", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    expect(s.badge("Gloam")).toBe("\x1b[48;2;255;121;198m\x1b[38;2;248;248;242m Gloam \x1b[0m");
  });

  test("bold: the white-bold affordance (digits-only strong runs)", () => {
    const s = makeStyler(DRACULA_PALETTE, "truecolor");
    // bold attribute only, no colour → white bold. The menu's jump number.
    expect(s.bold("01")).toBe("\x1b[1m01\x1b[0m");
  });

  test("none mode: colour stripped, attributes kept; codespan strips backticks (parity); link shows URL", () => {
    const s = makeStyler(DRACULA_PALETTE, "none");
    // NO_COLOR strips colour, not attributes — roleBold's weight survives
    // (SGR 1 is not colour); the redundant channel the doc claims remains.
    expect(s.roleBold("heading", "T")).toBe("\x1b[1mT\x1b[0m");
    expect(s.role("heading", "T")).toBe("T"); // colour-only role → plain
    expect(s.codespan("c")).toBe("c");
    expect(s.link("text", "url")).toBe("text url"); // parity: URL shown in both modes
    expect(s.link("https://x.example", "https://x.example")).toBe("https://x.example"); // parity: once in both modes
    expect(s.badge("G")).toBe(" G "); // padding kept, no colour
    expect(s.bold("01")).toBe("01"); // plain digits, no colour
    expect(s.rule(4)).toBe("────");
  });
});

describe("palette — dracula contract + override loader", () => {
  test("dracula palette (DRACULA_PALETTE) matches the contract table byte-exactly", () => {
    expect(DRACULA_PALETTE.heading).toBe("#bd93f9");
    expect(DRACULA_PALETTE["code-text"]).toBe("#50fa7b");
    expect(DRACULA_PALETTE["code-background"]).toBe("");
    expect(DRACULA_PALETTE.blockquote).toBe("#767676");
    expect(DRACULA_PALETTE.link).toBe("#00af5f");
    expect(DRACULA_PALETTE.emphasis).toBe("#f1fa8c");
    expect(DRACULA_PALETTE.strong).toBe("#ffb86c");
    expect(DRACULA_PALETTE["table-header"]).toBe("#bd93f9");
    expect(DRACULA_PALETTE["table-key"]).toBe("#ffff87");
    expect(DRACULA_PALETTE.muted).toBe("#585858");
    expect(DRACULA_PALETTE["diagram-border"]).toBe("#585858");
    expect(DRACULA_PALETTE["diagram-arrow"]).toBe("#00af5f");
    expect(DRACULA_PALETTE["diagram-text"]).toBe("#d7d7d7");
  });

  test("alert role: red in both presets — the failed channel (ADR-015)", () => {
    expect(DRACULA_PALETTE.alert).toBe("#ff5555");
    expect((okudaPreset as Record<string, string>).alert).toBe("#ff5555");
  });

  test("alert is non-confusable: distinct from every other role in each preset", () => {
    // The whole point of ADR-015: failed must not collide with changed (amber),
    // same (muted), or the badge. Check against every other role.
    for (const [role, hex] of Object.entries(DRACULA_PALETTE)) {
      if (role === "alert" || role === "state-failed") continue;
      expect(hex).not.toBe(DRACULA_PALETTE.alert);
    }
    const okuda = okudaPreset as Record<string, string>;
    for (const [role, hex] of Object.entries(okuda)) {
      if (role === "alert" || role === "state-failed") continue;
      expect(hex).not.toBe(okuda.alert);
    }
  });

  // ── State-glyph vocabulary (brief: state-glyph-vocabulary, 2026-08-28) ──
  // Four state roles: ✓ green (ok), ☐ yellow (todo), ⋮ orange (parked),
  // ✗ red (failed). Traffic-lamp-universality: preset-independent, like
  // alert. state-failed === alert (same hex, two names — the convergence
  // ADR-015 set the precedent for). ◆ is NOT a state role (priority, not
  // lifecycle — colouring it would collapse two axes).

  test("state roles present in both presets with the traffic-lamp hexes", () => {
    const okuda = okudaPreset as Record<string, string>;
    for (const p of [DRACULA_PALETTE, okuda]) {
      expect(p["state-ok"]).toBe("#5fd35f");      // green
      expect(p["state-todo"]).toBe("#ffe066");    // yellow
      expect(p["state-parked"]).toBe("#a06fa8");  // aubergine — off the lamp
      expect(p["state-failed"]).toBe("#ff5555");  // red
    }
  });

  test("state-failed converges with alert (ADR-015 precedent: same hex, two names)", () => {
    expect(DRACULA_PALETTE["state-failed"]).toBe(DRACULA_PALETTE.alert);
    const okuda = okudaPreset as Record<string, string>;
    expect(okuda["state-failed"]).toBe(okuda.alert);
  });

  test("state colours are preset-independent — traffic-lamp-universality", () => {
    // Document channels diverge by preset identity; state channels converge
    // (a green check reads as a green check on every bridge — the principle
    // ADR-015 set for alert, extended here to the full lamp).
    const okuda = okudaPreset as Record<string, string>;
    for (const role of ["state-ok", "state-todo", "state-parked", "state-failed"]) {
      expect(DRACULA_PALETTE[role as keyof typeof DRACULA_PALETTE]).toBe(okuda[role]);
    }
  });

  test("state roles are mutually non-confusable within each preset", () => {
    // The four states must be four distinct hues — no two states share a
    // colour, or the scan collapses two states into one.
    for (const p of [DRACULA_PALETTE, okudaPreset as Record<string, string>]) {
      const hexes = [p["state-ok"], p["state-todo"], p["state-parked"], p["state-failed"]];
      expect(new Set(hexes).size).toBe(4);
    }
  });

  test("state-parked is off the lamp, and measurably distinguishable", () => {
    // BRF-IRONY-MARK: parked stopped being a traffic-lamp rung and became a
    // comment on the plan, so its hue left the red-green ramp. Two floors keep
    // that honest — the second is the one that matters, because the old orange
    // measured 2.9 from `state-ok` in the plane that survives red-green
    // deficiency, i.e. parked and done were the same colour to ~8% of men.
    const oklab = (hex: string): [number, number, number] => {
      const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255)) as [number, number, number];
      const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
      const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
      const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
      return [
        0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
      ];
    };
    const dE = (a: string, b: string) => {
      const [x, y, z] = oklab(a), [p, q, r] = oklab(b);
      return Math.hypot(x - p, y - q, z - r) * 100;
    };
    const safe = (a: string, b: string) => { // (L, b) only: what survives deuteranopia
      const [x, , z] = oklab(a), [p, , r] = oklab(b);
      return Math.hypot(x - p, z - r) * 100;
    };
    for (const p of [DRACULA_PALETTE, okudaPreset as Record<string, string>]) {
      for (const other of ["state-ok", "state-todo", "state-failed"]) {
        expect(dE(p["state-parked"]!, p[other]!)).toBeGreaterThan(12);
        expect(safe(p["state-parked"]!, p[other]!)).toBeGreaterThan(12);
      }
    }
  });

  test("state colours do not collide with the document channels they'd corrupt", () => {
    // The ADR-006 justification test, enforced: each state colour must
    // differ from the document channel it would corrupt if reused.
    // state-ok ≠ link (navigational), state-todo ≠ emphasis (aside),
    // state-parked ≠ strong (bold-emphasis), state-failed = alert (by intent).
    for (const p of [DRACULA_PALETTE, okudaPreset as Record<string, string>]) {
      expect(p["state-ok"]).not.toBe(p.link);
      expect(p["state-ok"]).not.toBe(p["code-text"]); // Dracula code is green
      expect(p["state-todo"]).not.toBe(p.emphasis);
      expect(p["state-todo"]).not.toBe(p["table-key"]);
      expect(p["state-parked"]).not.toBe(p.strong);
      expect(p["state-parked"]).not.toBe(p["badge-bg"]);
      expect(p["state-parked"]).not.toBe(p["table-header"]); // lavender, the nearest
      // aubergine in okuda: close, and distinguishable — see the ΔE floor test
      // state-failed === alert is the one allowed collision (by design).
    }
  });

  test("roleBold on a state role emits colour + bold in truecolor; bold survives in none", () => {
    const tc = makeStyler(DRACULA_PALETTE, "truecolor");
    // green + bold: \x1b[38;2;95;211;95;1m✓\x1b[0m  (#5fd35f)
    expect(tc.roleBold("state-ok", "✓")).toBe("\x1b[38;2;95;211;95;1m✓\x1b[0m");
    // red + bold: \x1b[38;2;255;85;85;1m✗\x1b[0m
    expect(tc.roleBold("state-failed", "✗")).toBe("\x1b[38;2;255;85;85;1m✗\x1b[0m");
    // NO_COLOR strips colour, not attributes — the glyph survives by shape
    // AND weight (SGR 1 is not colour). ADR-015's plain-`role` invariant is
    // separate: the fetch stamp's `✗` rides `role("alert", …)`, not roleBold.
    const none = makeStyler(DRACULA_PALETTE, "none");
    expect(none.roleBold("state-ok", "✓")).toBe("\x1b[1m✓\x1b[0m");
    expect(none.roleBold("state-failed", "✗")).toBe("\x1b[1m✗\x1b[0m");
  });

  test("emphasis attributes survive in none mode (BRF-PROJECTION-LOSSES)", () => {
    // The rule `roleBold` above states — NO_COLOR strips colour, not
    // attributes — applies to italic and bold-italic too. It did not:
    // both were plain text, so `*emphasis*` was indistinguishable from
    // body prose once colour was dropped, and the voice path
    // (`justfile:110`) passes `--no-color`. One reset each, full, per
    // the wrap invariant.
    const none = makeStyler(DRACULA_PALETTE, "none");
    expect(none.roleItalic("emphasis", "e")).toBe("\x1b[3me\x1b[0m");
    expect(none.roleBoldItalic("emphasis", "e")).toBe("\x1b[1;3me\x1b[0m");
    // Truecolor composes the same attributes with a colour first.
    const tc = makeStyler(DRACULA_PALETTE, "truecolor");
    expect(tc.roleItalic("emphasis", "e")).toBe("\x1b[38;2;241;250;140;3me\x1b[0m");
    expect(tc.roleBoldItalic("emphasis", "e")).toBe("\x1b[38;2;241;250;140;1;3me\x1b[0m");
    // Underline stays plain: a link's cue is its address, shown in both modes.
    expect(none.roleUnderline("link", "l")).toBe("l");
  });

  test("override file replaces known roles, ignores junk", () => {
    // Pinned to the dracula preset (brief option b): the assertions anchor
    // to Dracula bytes, and the override mechanism is base-independent —
    // the runtime default is the okuda preset since the 2026-08-25 flip.
    const path = tempFile("palette.json");
    writeFileSync(
      path,
      JSON.stringify({
        "diagram-arrow": "#ff0000",
        heading: "not-a-hex",
        "unknown-role": "#00ff00",
      }),
    );
    const p = loadPalette({ name: "dracula", path });
    expect(p["diagram-arrow"]).toBe("#ff0000");
    expect(p.heading).toBe("#bd93f9"); // invalid value ignored
  });

  test("malformed JSON → base preset, no throw", () => {
    const path = tempFile("palette.json");
    writeFileSync(path, "{broken");
    const p = loadPalette({ name: "dracula", path });
    expect(p).toEqual(DRACULA_PALETTE);
  });

  test("missing file → base preset", () => {
    expect(
      loadPalette({ name: "dracula", path: "/nonexistent/path/palette.json" }),
    ).toEqual(DRACULA_PALETTE);
  });

  test("override takes effect through the styler", () => {
    const p = { ...DRACULA_PALETTE, "diagram-arrow": "#123456" };
    const s = makeStyler(p, "truecolor");
    expect(s.role("diagram-arrow", "→")).toContain("38;2;18;52;86");
  });
});

describe("the quote cue is the aside's own ink (BRF-PAPER-RUNG)", () => {
  // Surfaced by reading the paper page: the pipe was blue-grey and the quoted
  // text gold. The aside is an emphasis-italic (that is its identity), so its
  // ink is the emphasis role; the okuda preset therefore sets `blockquote` — the
  // pipe's role — to the same value, and the cue and the content are one hue on
  // every rung (glass, paper, TUI). The dracula preset keeps Glow's grey pipe:
  // that preset's job is parity, not our taste.
  test("the okuda preset's pipe and its quoted text are one colour, italic apart", () => {
    const s = makeStyler(okudaPreset, "truecolor");
    const ink = (seq: string) => seq.match(/38;2;(\d+;\d+;\d+)/)?.[1];
    expect(okudaPreset.blockquote).toBe(okudaPreset.emphasis);
    expect(ink(s.quotePipe())).toBe(ink(s.roleItalic("emphasis", "q")));
  });

  test("and the pipe is still just a pipe — the italic stays the aside's identity", () => {
    const s = makeStyler(okudaPreset, "truecolor");
    // The slant rides inside the colour sequence (…;3m), not a standalone SGR 3.
    expect(s.quotePipe()).not.toContain(";3m"); // no slant on the cue
    expect(s.roleItalic("emphasis", "q")).toContain(";3m"); // the aside is italic
  });
});
