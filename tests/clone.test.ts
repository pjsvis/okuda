import { describe, expect, test } from "bun:test";
import { cloneArgs } from "../src/clone";

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
    expect("error" in spec && spec.error).toContain("terminal, tmux, cmd, herdr");
  });

  test("doc paths with spaces survive the appleScript quoting", () => {
    const spec = cloneArgs("terminal", "docs/my doc.md", "darwin", "/my silo");
    const args = spec as { cmd: string; args: string[] };
    expect(args.args[1]).toContain('cd \\"/my silo\\"');
    expect(args.args[1]).toContain('gloam \\"docs/my doc.md\\"');
  });
});
