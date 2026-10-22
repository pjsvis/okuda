import { describe, expect, test } from "bun:test";
import { cloneArgs, editArgs, resolveEditor } from "../src/clone";

/** Run `fn` with the editor declarations removed, then restore them. */
function withoutEditorEnv<T>(fn: () => T): T {
  const keys = ["OKUDA_EDITOR", "EDITOR", "VISUAL"] as const;
  const saved = keys.map((k) => [k, process.env[k]] as const);
  for (const k of keys) delete process.env[k];
  try {
    return fn();
  } finally {
    for (const [k, v] of saved) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

/** The real environment is the test's enemy here: this machine has
 *  EDITOR=micro and VISUAL="zed --wait" set shell-wide. */
function withEnv<T>(vars: Record<string, string>, fn: () => T): T {
  const saved = Object.keys(vars).map((k) => [k, process.env[k]] as const);
  for (const [k, v] of Object.entries(vars)) process.env[k] = v;
  try {
    return fn();
  } finally {
    for (const [k, v] of saved) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

describe("clone — the restricted grammar (ADR-031)", () => {
  test("terminal on macOS: a new Terminal runs gloam on the document", () => {
    const spec = cloneArgs("terminal", "docs/x.md", "darwin", "/silo");
    // Two quoting layers: the shell quotes are AppleScript-escaped
    // inside the do-script string — Terminal decodes them back to
    // `cd "/silo" && gloam "docs/x.md"` before running the shell.
    expect(spec).toEqual({
      cmd: "osascript",
      args: ["-e", 'tell application "Terminal" to do script "cd \\"/silo\\" && gloam \\"docs/x.md\\""'],
    });
  });

  test("terminal off macOS: honest refusal, not a guess", () => {
    const spec = cloneArgs("terminal", "docs/x.md", "linux", "/silo");
    expect("error" in spec && spec.error).toContain("macOS-only");
  });

  test("tmux: needs a session ($TMUX)", () => {
    const saved = process.env.TMUX;
    delete process.env.TMUX;
    const spec = cloneArgs("tmux", "docs/x.md", "darwin", "/silo");
    if (saved !== undefined) process.env.TMUX = saved;
    expect("error" in spec).toBe(true);
  });

  test("cmd: OKUDA_CLONE_CMD is the whole integration, $1 = the doc", () => {
    const saved = process.env.OKUDA_CLONE_CMD;
    process.env.OKUDA_CLONE_CMD = "my-terminal-wrapper";
    const spec = cloneArgs("cmd", "docs/x.md", "darwin", "/silo");
    if (saved === undefined) delete process.env.OKUDA_CLONE_CMD;
    else process.env.OKUDA_CLONE_CMD = saved;
    expect(spec).toEqual({ cmd: "sh", args: ["-c", "my-terminal-wrapper", "okuda-clone", "docs/x.md"] });
  });

  test("herdr: specced, not built — the refusal says so", () => {
    const spec = cloneArgs("herdr", "docs/x.md", "darwin", "/silo");
    expect("error" in spec && spec.error).toContain("not built");
  });

  test("unknown integrations are refused with the known set", () => {
    const spec = cloneArgs("fancy", "docs/x.md", "darwin", "/silo");
    expect("error" in spec && spec.error).toContain("terminal, ghostty, tmux, cmd, herdr");
  });

  test("ghostty: spawns via interactive shell with gloam", () => {
    // The shell is INJECTED, like the platform: the grammar is "the user's
    // interactive login shell", and a spec that read process.env.SHELL
    // asserted zsh on a box running bash and read as a product failure
    // (DBF-OMARCHY-TOOLCHAIN). The machine is the caller's problem.
    const spec = cloneArgs("ghostty", "docs/x.md", "darwin", "/silo", undefined, "/bin/zsh");
    const args = spec as { cmd: string; args: string[] };
    expect(args.cmd).toContain("Ghostty.app/Contents/MacOS/ghostty");
    expect(args.args[0]).toBe("-e");
    expect(args.args[1]).toBe("/bin/zsh");
    expect(args.args[2]).toBe("-i");
    expect(args.args[3]).toBe("-c");
    expect(args.args[4]).toContain("gloam");
    expect(args.args[4]).toContain("docs/x.md");
  });

  test("ghostty: whatever shell the user has, not the one we shipped on", () => {
    const spec = cloneArgs("ghostty", "docs/x.md", "darwin", "/silo", undefined, "/usr/bin/bash");
    const args = spec as { cmd: string; args: string[] };
    expect(args.args[1]).toBe("/usr/bin/bash");
    expect(args.args[2]).toBe("-i"); // still interactive, still a login shell
  });

  test("ghostty-edit: spawns via interactive shell with editor", () => {
    const spec = cloneArgs("ghostty-edit", "docs/note.md", "darwin", "/silo", "vi", "/bin/zsh");
    const args = spec as { cmd: string; args: string[] };
    expect(args.cmd).toContain("Ghostty.app/Contents/MacOS/ghostty");
    expect(args.args[0]).toBe("-e");
    expect(args.args[1]).toBe("/bin/zsh");
    expect(args.args[2]).toBe("-i");
    expect(args.args[3]).toBe("-c");
    expect(args.args[4]).toContain("vi");
    expect(args.args[4]).toContain("docs/note.md");
  });

  test("doc paths with spaces survive the appleScript quoting", () => {
    const spec = cloneArgs("terminal", "docs/my doc.md", "darwin", "/my silo");
    const args = spec as { cmd: string; args: string[] };
    expect(args.args[1]).toContain('cd \\"/my silo\\"');
    expect(args.args[1]).toContain('gloam \\"docs/my doc.md\\"');
  });
});

describe("the editor — the declaration chain (88)", () => {
  test("OKUDA_EDITOR wins outright, verbatim, arguments and all", () => {
    withEnv({ OKUDA_EDITOR: "nvim --cmd x" }, () => {
      const ed = resolveEditor(() => null); // not on PATH — the name stands
      expect(ed.name).toBe("nvim --cmd x");
      expect(ed.args).toEqual(["--cmd", "x"]);
      expect(ed.gui).toBe(false);
      expect(ed.path).toBeNull();
    });
  });

  test("the GUI chain outranks EDITOR and VISUAL — the 2026-10-05 bug", () => {
    // EDITOR=micro and VISUAL="zed --wait" are set shell-wide on this
    // machine. Honouring them first handed 88 to micro while zed sat on
    // PATH — so the chain is consulted before the terminal-era variables.
    withEnv({ EDITOR: "micro", VISUAL: "nano" }, () => {
      const ed = resolveEditor((n) => (n === "zed" ? "/usr/local/bin/zed" : null));
      expect(ed).toEqual({ name: "zed", args: [], path: "/usr/local/bin/zed", gui: true });
      // zed absent, code present: the chain keeps its order.
      const next = resolveEditor((n) => (n === "code" ? "/opt/code" : null));
      expect(next).toEqual({ name: "code", args: [], path: "/opt/code", gui: true });
    });
  });

  test("no GUI editor anywhere: VISUAL wins over EDITOR, then vi is the floor", () => {
    withEnv({ EDITOR: "micro", VISUAL: "nano" }, () => {
      const ed = resolveEditor((n) => (n === "nano" ? "/usr/bin/nano" : null));
      expect(ed).toEqual({ name: "nano", args: [], path: "/usr/bin/nano", gui: false });
    });
    withEnv({ EDITOR: "micro", VISUAL: "" }, () => {
      const ed = resolveEditor((n) => (n === "micro" ? "/opt/homebrew/bin/micro" : null));
      expect(ed.name).toBe("micro");
      expect(ed.gui).toBe(false);
    });
    // A GUI-named declaration with nothing on PATH: the name stands and
    // the terminal path is the one that can still find it (`gui: true`
    // with `path: null` — editArgs sends it through the login shell).
    withEnv({ EDITOR: "micro", VISUAL: "zed --wait" }, () => {
      const ed = resolveEditor(() => null);
      expect(ed.name).toBe("zed --wait");
      expect(ed.gui).toBe(true);
      expect(ed.path).toBeNull();
    });
    withoutEditorEnv(() => {
      const ed = resolveEditor((n) => (n === "vi" ? "/usr/bin/vi" : null));
      expect(ed).toEqual({ name: "vi", args: [], path: "/usr/bin/vi", gui: false });
    });
  });

  test("a GUI editor is spawned directly — no terminal, absolute document", () => {
    const spec = editArgs(
      "docs/x.md",
      "ghostty-edit",
      { name: "zed", args: [], path: "/usr/local/bin/zed", gui: true },
      "darwin",
      "/silo",
    );
    expect(spec).toEqual({ cmd: "/usr/local/bin/zed", args: ["/silo/docs/x.md"] });
  });

  test("a GUI declaration's arguments ride along — VISUAL=zed --wait is still zed", () => {
    const spec = editArgs(
      "docs/x.md",
      "ghostty-edit",
      { name: "zed --wait", args: ["--wait"], path: "/usr/local/bin/zed", gui: true },
      "darwin",
      "/silo",
    );
    expect(spec).toEqual({ cmd: "/usr/local/bin/zed", args: ["--wait", "/silo/docs/x.md"] });
  });

  test("a terminal editor rides the integration, inside a login shell", () => {
    const spec = editArgs(
      "docs/x.md",
      "ghostty-edit",
      { name: "vi", args: [], path: "/usr/bin/vi", gui: false },
      "darwin",
      "/silo",
      "/bin/zsh",
    );
    const args = spec as { cmd: string; args: string[] };
    expect(args.cmd).toContain("Ghostty.app/Contents/MacOS/ghostty");
    expect(args.args[1]).toBe("/bin/zsh");
    expect(args.args[4]).toContain("vi");
    expect(args.args[4]).toContain("docs/x.md");
  });

  test("a declared editor that is NOT on PATH still goes through the shell", () => {
    // gui: true but path: null — an alias, a shell function, or a
    // PATH the login shell knows and this process does not. The
    // terminal path is the one that can find it; spawning `zed` by a
    // path we do not have would just fail.
    const spec = editArgs(
      "docs/x.md",
      "ghostty-edit",
      { name: "zed", args: [], path: null, gui: true },
      "darwin",
      "/silo",
    );
    const args = spec as { cmd: string; args: string[] };
    expect(args.cmd).toContain("Ghostty.app");
    expect(args.args[4]).toContain("zed");
  });
});
