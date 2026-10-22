import { describe, expect, test } from "bun:test";
import { renderDocument, wrapWholeFile } from "../src/render";
import { DRACULA_PALETTE } from "../src/palette";
import { stripANSI } from "../src/width";

const W = 64;

/** chroma 2.27.0 — the pinned bytes below are that version exactly
 * (DEPENDENCIES.md carries the pin). Absent binary → colour tests skip;
 * the wrapWholeFile unit tests still run. */
const CHROMA = !!Bun.which("chroma");

/** The pin, as a version string chroma's own `--version` starts with. */
const CHROMA_PIN = "2.27.0";

const PY = "```py\ndef f():\n    pass\n```\n";
const BODY = "def f():\n    pass\n";

describe("render — fence colour (BRF-FENCE-COLOUR)", () => {
  test.skipIf(!CHROMA)("the installed chroma is the pinned one", () => {
    // Every byte-level assertion below is chroma 2.27.0's output. Without
    // this test a 2.28 install fails as "colour is broken" — a true
    // sentence pointing at the renderer, which is innocent. Name the
    // version, so the failure names the pin (BRF-TOOLCHAIN-TRUTH).
    const proc = Bun.spawnSync(["chroma", "--version"]);
    const line = new TextDecoder().decode(proc.stdout).trim();
    expect(line).toContain(CHROMA_PIN);
    // chroma appends its build commit and timestamp to --version, e.g.
    // 2.27.0-a6d00fe-…; a different pin fails with the line below in the
    // message, which is the whole point of the assertion.
    if (!line.includes(CHROMA_PIN)) {
      throw new Error(
        `chroma ${line} is installed; these tests pin ${CHROMA_PIN} exactly ` +
          `(DEPENDENCIES.md). Install the pin, or re-pin the bytes deliberately.`,
      );
    }
  });

  test.skipIf(!CHROMA)("tagged py fence paints chroma's class codes", async () => {
    const out = await renderDocument(PY, { width: W, palette: DRACULA_PALETTE });
    // chroma 2.27.0, --formatter terminal16 --style monokai: keyword =
    // SGR 96 (bright cyan), function name = 93 (bright yellow), plain =
    // 97 (full white — brighter than the default style's gray 37), and
    // the function name is classified separately (Name.Function), which
    // the default lumped in with identifiers. Pinned exactly — 4 visible
    // indent columns like every fence (2 handler + 2 finalize margin), no
    // codeLine wrap (chroma's codes are the styling). The fence body
    // reaches chroma without its trailing newline (the closing-fence
    // regex eats it), so the pin mirrors that, not a fresh pipe run.
    expect(out).toContain(
      "    \x1b[96mdef\x1b[0m\x1b[97m \x1b[0m\x1b[93mf\x1b[0m\x1b[97m():\x1b[0m\x1b[97m\x1b[0m\n" +
        "    \x1b[97m    \x1b[0m\x1b[96mpass\x1b[0m",
    );
  });

  test.skipIf(!CHROMA)("an unknown tag renders byte-identical to untagged", async () => {
    // chroma never rejects an unknown --lexer — it colours plaintext
    // white, silently. The alias table is the only way to honour "an
    // unknown tag renders as today", so `zzzq` must never reach it.
    const a = await renderDocument(`\`\`\`zzzq\n${BODY}\`\`\`\n`, {
      width: W,
      palette: DRACULA_PALETTE,
    });
    const b = await renderDocument(`\`\`\`\n${BODY}\`\`\`\n`, {
      width: W,
      palette: DRACULA_PALETTE,
    });
    expect(a).toBe(b);
  });

  test.skipIf(!CHROMA)("none mode leaves tagged fences plain", async () => {
    // NO_COLOR strips colour, not attributes — but chroma's output is
    // colour-first (SGR 97 is a colour), and surgery on its bytes to
    // keep the bold would be fragile. The voice path keeps plain code.
    const a = await renderDocument(PY, { width: W, color: "none" });
    const b = await renderDocument(`\`\`\`\n${BODY}\`\`\`\n`, {
      width: W,
      color: "none",
    });
    expect(a).toBe(b);
  });

  test.skipIf(!CHROMA)("absent chroma degrades to today's render", async () => {
    const a = await renderDocument(PY, {
      width: W,
      palette: DRACULA_PALETTE,
      chromaBin: "/nonexistent/chroma",
    });
    const b = await renderDocument(`\`\`\`\n${BODY}\`\`\`\n`, {
      width: W,
      palette: DRACULA_PALETTE,
    });
    expect(a).toBe(b);
  });

  test.skipIf(!CHROMA)("a coloured line elides at its plain twin's column", async () => {
    // elideToWidth's run scanner skips escapes — the ruler never sees
    // chroma's bytes, so the cut lands where the plain twin's would.
    const long = `value = "${"x".repeat(80)}"`;
    const coloured = await renderDocument(`\`\`\`py\n${long}\n\`\`\`\n`, {
      width: 40,
      palette: DRACULA_PALETTE,
    });
    const plain = await renderDocument(`\`\`\`\n${long}\n\`\`\`\n`, {
      width: 40,
      palette: DRACULA_PALETTE,
    });
    expect(stripANSI(coloured)).toBe(stripANSI(plain));
    expect(coloured).toContain("…");
  });

  test.skipIf(!CHROMA)("a mermaid fence still owns its tag", async () => {
    // chroma must never claim the tag mermaid-to-md owns — the alias
    // check plus the explicit guard keep the diagram path untouched.
    const out = await renderDocument(
      "```mermaid\nflowchart LR\n  A --> B\n```\n",
      { width: W, palette: DRACULA_PALETTE },
    );
    expect(out).toContain("⋮");
    expect(out).toContain("mermaid source elided");
  });
});

describe("wrapWholeFile — a code file is a one-fence document (P2)", () => {
  test("the extension becomes the tag; trailing newlines normalised", () => {
    expect(wrapWholeFile("f.py", "x = 1\n")).toBe("```py\nx = 1\n```\n");
    expect(wrapWholeFile("a/b/c.rs", "fn m(){}\n\n\n")).toBe("```rs\nfn m(){}\n```\n");
  });

  test("markdown stays itself; extensionless and dotless pass through", () => {
    expect(wrapWholeFile("d.md", "# h\n")).toBe("# h\n");
    expect(wrapWholeFile("d.markdown", "# h\n")).toBe("# h\n");
    expect(wrapWholeFile("justfile", "x\n")).toBe("x\n");
    expect(wrapWholeFile(".gitignore", "x\n")).toBe("x\n");
  });

  test.skipIf(!CHROMA)("integration: a .ts file renders as one coloured fence", async () => {
    const out = await renderDocument(wrapWholeFile("t.ts", "let x: number = 1\n"), {
      width: W,
      palette: DRACULA_PALETTE,
    });
    const tagged = await renderDocument("```ts\nlet x: number = 1\n```\n", {
      width: W,
      palette: DRACULA_PALETTE,
    });
    expect(out).toBe(tagged);
    expect(out).toContain("\x1b[96m");
  });

  test.skipIf(!CHROMA)("a mid-line ``` in the source cannot close the fence", async () => {
    // The glass regression (td-3e6d24): src/vectors.ts carries the
    // fence-detector regex /^\s*(```|~~~)/ — the lazy close once
    // truncated the whole-file fence at that mid-line ```, and the
    // tail fell out of the code path into prose: the doc comment
    // rendered white, ` * ` lines became • bullets, `**bold**`
    // styled. CommonMark: the close is its own line — the EOL
    // lookahead enforces it.
    const src = "const RE = /^\\s*(```|~~~)/;\n/** one doc */\nlet a = 1;\n";
    const out = await renderDocument(wrapWholeFile("t.ts", src), {
      width: W,
      palette: DRACULA_PALETTE,
    });
    // The fence spans the whole file: the doc comment *after* the
    // mid-line ``` still carries the comment class (94 — lifted from
    // monokai's 90 by the spawnChroma hand-patch), a keyword paints,
    // and no prose bullet appears.
    expect(out).toContain("\x1b[94m/** one doc */");
    expect(out).toContain("\x1b[96m");
    expect(out).not.toContain("•");
  });
});
