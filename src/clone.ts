/**
 * clone.ts — the clone verb's restricted grammar (ADR-031).
 *
 * `99` promotes the current document to main of a new instance — by
 * spinning up another terminal. The integration is DECLARED, not
 * discovered: `OKUDA_CLONE` names one of the built-ins, and the
 * built-ins are a closed set. tmux is a guest capability, not a
 * runtime dependency; herdr and friends join the same way — one entry
 * in the grammar, or `cmd` with a command of their own.
 *
 * Pure: the function returns a spawn spec; the caller spawns, flashes,
 * and lives with the result.
 */

export type CloneSpec = { cmd: string; args: string[] } | { error: string };

const shellQuote = (s: string): string => `"${s.replace(/[\\"]/g, "\\$&")}"`;

const appleScript = (cwd: string, command: string): string => {
  // Two quoting layers: the do-script argument is an AppleScript string
  // whose CONTENT is a shell command — so the shell paths get their own
  // double quotes first, then the whole line is escaped for AppleScript.
  const shellQuote = (s: string): string => `"${s.replace(/[\\"]/g, "\\$&")}"`;
  const appleEscape = (s: string): string => s.replace(/[\\"]/g, "\\$&");
  const shellLine = `cd ${shellQuote(cwd)} && ${command}`;
  return `tell application "Terminal" to do script "${appleEscape(shellLine)}"`;
};

/** Resolve a clone integration to a spawn spec. Unknown integration or
 *  missing configuration → `{ error }` with an honest message. Pure. */
export function cloneArgs(
  integration: string,
  doc: string,
  platform: string = process.platform,
  cwd: string = process.cwd(),
): CloneSpec {
  switch (integration) {
    case "terminal":
      if (platform === "darwin") {
        return { cmd: "osascript", args: ["-e", appleScript(cwd, `gloam ${shellQuote(doc)}`)] };
      }
      return { error: "the built-in `terminal` integration is macOS-only — declare OKUDA_CLONE=tmux or OKUDA_CLONE=cmd" };
    case "tmux":
      if (!process.env.TMUX) {
        return { error: "the `tmux` integration needs a tmux session ($TMUX unset)" };
      }
      return { cmd: "tmux", args: ["new-window", "-c", cwd, "gloam", doc] };
    case "cmd": {
      const template = process.env.OKUDA_CLONE_CMD;
      if (!template) return { error: "the `cmd` integration needs OKUDA_CLONE_CMD ($1 = the document)" };
      return { cmd: "sh", args: ["-c", template, "okuda-clone", doc] };
    }
    case "herdr":
      return { error: "the `herdr` integration is specced, not built — see BRF-PORCH-MATRIX and the filter model" };
    case "edit-terminal": {
      // The 09 verb (edit a blank document): the terminal spins up
      // running the declared editor on the new file. The editor is
      // OKUDA_EDITOR ?? EDITOR ?? vi; the file is the contract.
      const editor = process.env.OKUDA_EDITOR ?? process.env.EDITOR ?? "vi";
      if (platform === "darwin") {
        return { cmd: "osascript", args: ["-e", appleScript(cwd, doc, editor)] };
      }
      return { error: "the built-in `edit-terminal` integration is macOS-only — declare OKUDA_CLONE=tmux and edit inside tmux" };
    }
    default:
      return { error: `unknown clone integration "${integration}" — known: terminal, tmux, cmd, herdr` };
  }
}
