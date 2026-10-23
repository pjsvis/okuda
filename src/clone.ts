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
 * Which integration runs is one question. **What runs it is another**, and it is
 * answered by a ladder — declaration, convention, platform fact, named refusal —
 * in `resolveTerminal` below. Two questions, two mechanisms; they were
 * conflated, and the conflation is the defect
 * (`ADR-ENVIRONMENT-ANSWERS-068`).
 *
 * Pure: the function returns a spawn spec; the caller spawns, flashes,
 * and lives with the result.
 *
 * ## The process-boundary crossing lesson (2026-10-03)
 *
 * When okuda spawns an external terminal (Ghostty, Terminal.app, etc.),
 * the spawned process crosses a boundary: the new terminal's login
 * shell has a DIFFERENT ENVIRONMENT than okuda's parent process. PATH
 * is bare (no ~/.local/bin, no Homebrew), EDITOR is unset, shell
 * aliases are absent. This is not a bug — it is the nature of
 * login(1). The fix is to carry the environment across the boundary:
 *
 *   - **Interactive shell**: `zsh -i -c "command"` sources .zshrc,
 *     picking up PATH, aliases, EDITOR, and everything the user's
 *     interactive session has.
 *   - **Absolute binary paths**: the terminal emulator itself
 *     (Ghostty.app/Contents/MacOS/ghostty) lives outside PATH — use
 *     the absolute path directly.
 *   - **Absolute document paths**: `resolve(doc)` against
 *     process.cwd() — the spawned terminal's CWD is the home
 *     directory, not the silo.
 *
 * One mechanism (interactive shell + absolute paths) serves every
 * spawn verb — clone (99) and edit (88). The lesson applies to any
 * future verb that spawns an external process: cross the boundary
 * once, carry the environment, and every command downstream inherits
 * the fix.
 *
 * ## What 88 adds (2026-10-05)
 *
 * The edit verb is the pair to clone: `99` promotes THIS document to a
 * new instance, `88` opens THIS document in the editor. But a GUI
 * editor does not need the boundary crossed at all — `zed <file>`
 * hands the file to a running app and returns, so spawning it directly
 * is *cheaper* than spawning a terminal to host it. A terminal editor
 * (vi, and anything else that wants a tty) still rides the ghostty-edit
 * integration; `resolveEditor` decides which. The precedence is
 * OKUDA_EDITOR, the GUI chain, then VISUAL/EDITOR, then vi — see the
 * reasoning on `resolveEditor`: the shell-wide terminal variables are
 * consulted *after* the chain, or `EDITOR=micro` (set for other reasons)
 * silently wins the GUI case.
 */

import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";

export type CloneSpec = { cmd: string; args: string[] } | { error: string };

/** The GUI editors, in preference order. They hand the file to a
 *  running app and return, so they need no terminal, no window and no
 *  login shell — 88 spawns one directly. Closed and deliberately short:
 *  OKUDA_EDITOR names anything else, and a terminal editor rides the
 *  integration below. */
const GUI_EDITORS = ["zed", "code", "cursor", "subl"] as const;
const GUI_SET: ReadonlySet<string> = new Set(GUI_EDITORS);

export interface Editor {
  /** As declared or found, command + any arguments (`zed`, `zed --wait`). */
  name: string;
  /** The declaration's tail beyond the command name. */
  args: string[];
  /** Absolute path for the command when it is on PATH; null otherwise. */
  path: string | null;
  /** True for the GUI set — a direct spawn, no terminal. */
  gui: boolean;
}

/** Split a declaration into command + arguments. */
function declare(declared: string): { cmd: string; args: string[] } {
  const [cmd = "", ...args] = declared.split(/\s+/).filter(Boolean);
  return { cmd, args };
}

/** Resolve the editor, in this order:
 *
 *  1. `OKUDA_EDITOR` — okuda's own declaration, wins outright. May carry
 *     arguments (`zed --wait`) and may name a path.
 *  2. **the GUI chain** — `zed`, `code`, `cursor`, `subl`, first on PATH.
 *     This is the house preference and it outranks `EDITOR`/`VISUAL`,
 *     which is a deliberate inversion of the usual convention: those two
 *     are terminal-era variables, set once for the whole shell and
 *     usually for something else entirely (`EDITOR=micro` here), so
 *     honouring them first hands the GUI case to a terminal editor by
 *     accident — which is exactly what 88 did on 2026-10-05, opening
 *     micro while zed sat on PATH. `OKUDA_EDITOR` is the escape hatch
 *     for anyone who disagrees.
 *  3. `VISUAL`, then `EDITOR` — taken as a command line, run in a
 *     terminal.
 *  4. `vi` — the floor.
 *
 *  A GUI-named editor that is NOT on PATH keeps `path: null`: the
 *  terminal path gives it a login shell to be found in, which is the
 *  honest fallback for an alias or a shell function. Reads env and PATH
 *  (`which` is injectable for tests); pure otherwise. */
export function resolveEditor(
  which: (name: string) => string | null = (n) => Bun.which(n),
): Editor {
  const trim = (v: string | undefined) => v?.trim() ?? "";
  const declared = trim(process.env.OKUDA_EDITOR);
  if (declared) {
    const { cmd, args } = declare(declared);
    return { name: declared, args, path: which(cmd), gui: GUI_SET.has(basename(cmd)) };
  }
  for (const name of GUI_EDITORS) {
    const path = which(name);
    if (path) return { name, args: [], path, gui: true };
  }
  const legacy = trim(process.env.VISUAL) || trim(process.env.EDITOR);
  if (legacy) {
    const { cmd, args } = declare(legacy);
    return { name: legacy, args, path: which(cmd), gui: GUI_SET.has(basename(cmd)) };
  }
  return { name: "vi", args: [], path: which("vi"), gui: false };
}

/** Resolve the edit verb (88) to a spawn spec: a GUI editor directly
 *  (its declared arguments ride along, so `VISUAL=zed --wait` is still
 *  `zed`), a terminal editor through the clone grammar's terminal
 *  integration, where the login shell can find it. Pure. */
export function editArgs(
  doc: string,
  integration: string,
  editor: Editor,
  platform: string = process.platform,
  cwd: string = process.cwd(),
  shell?: string,
): CloneSpec {
  if (editor.gui && editor.path) {
    return { cmd: editor.path, args: [...editor.args, resolve(cwd, doc)] };
  }
  return cloneArgs(integration, doc, platform, cwd, editor.name, shell);
}

/** The shell a terminal integration spawns through. The environment is read
 *  HERE and nowhere else, so every spec below is a function of its arguments
 *  — the machine is the caller's problem, not the grammar's. A spec that read
 *  `process.env.SHELL` itself asserted `zsh` on a box running bash and failed
 *  as if the product were broken (DBF-OMARCHY-TOOLCHAIN). */
const loginShell = (shell?: string): string =>
  shell ?? process.env.SHELL ?? "/bin/zsh";

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

/** The Ghostty bundle, as a fact about darwin — a fallback, never an assumption
 *  (`ADR-ENVIRONMENT-ANSWERS-068`). */
const GHOSTTY_BUNDLE = "/Applications/Ghostty.app/Contents/MacOS/ghostty";

export interface Terminal {
  /** The command that opens a terminal. */
  cmd: string;
  /** Its own arguments; the command to run inside is the caller's to append. */
  args: string[];
  /** Which rung answered, so a failure can name the winner rather than guess. */
  source: "OKUDA_TERMINAL" | "TERMINAL" | "bundle";
}

/** Resolve the terminal that hosts a clone or edit verb:
 *
 *  1. `OKUDA_TERMINAL` — okuda's own declaration; may carry arguments.
 *  2. `TERMINAL` — the Unix convention for exactly this question.
 *  3. the darwin Ghostty bundle, if it is really there.
 *  4. an honest refusal naming what to set.
 *
 *  The ladder `resolveEditor` already used, applied to the sibling that never
 *  got it: three integrations hardcoded a bundle path with no platform guard, so
 *  a Linux box was handed a spec naming a path it cannot have
 *  (`ADR-ENVIRONMENT-ANSWERS-068`).
 *
 *  What this does NOT do is decide how a terminal is told to run a command. `-e`
 *  is assumed because it is the most common form; a terminal that spells it
 *  differently is served by the `cmd` integration, which takes the whole
 *  invocation (`OKUDA_CLONE_CMD`). Reads env and the filesystem; pure otherwise. */
export function resolveTerminal(
  platform: string = process.platform,
  exists: (path: string) => boolean = (p) => existsSync(p),
): Terminal | { error: string } {
  const declared = process.env.OKUDA_TERMINAL?.trim();
  if (declared) {
    const { cmd, args } = declare(declared);
    return { cmd, args, source: "OKUDA_TERMINAL" };
  }
  const conventional = process.env.TERMINAL?.trim();
  if (conventional) {
    const { cmd, args } = declare(conventional);
    return { cmd, args, source: "TERMINAL" };
  }
  if (platform === "darwin" && exists(GHOSTTY_BUNDLE)) {
    return { cmd: GHOSTTY_BUNDLE, args: [], source: "bundle" };
  }
  return {
    error:
      "no terminal to open: set OKUDA_TERMINAL (or TERMINAL) to the command that " +
      "opens one, or use the `cmd` integration with OKUDA_CLONE_CMD",
  };
}

/** Resolve a clone integration to a spawn spec. Unknown integration or
 *  missing configuration → `{ error }` with an honest message. Pure. */
export function cloneArgs(
  integration: string,
  doc: string,
  platform: string = process.platform,
  cwd: string = process.cwd(),
  editor?: string,
  shell?: string,
): CloneSpec {
  const editCmd = (doc: string): string => {
    const ed = editor ?? process.env.OKUDA_EDITOR ?? process.env.EDITOR ?? "vi";
    return `${ed} ${shellQuote(doc)}`;
  };
  switch (integration) {
    // ── clone verbs (99) ──
    case "terminal":
      if (platform === "darwin") {
        return { cmd: "osascript", args: ["-e", appleScript(cwd, `gloam ${shellQuote(doc)}`)] };
      }
      return { error: "the `terminal` integration is macOS-only — use ghostty, tmux, or cmd" };
    case "ghostty": {
      const term = resolveTerminal(platform);
      if ("error" in term) return term;
      // The terminal's shell has a bare environment — use an interactive
      // shell so the rc file sources PATH, aliases, etc.
      return {
        cmd: term.cmd,
        args: [...term.args, "-e", loginShell(shell), "-i", "-c", `gloam ${shellQuote(resolve(cwd, doc))}`],
      };
    }
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
    // ── edit verb (88) ──
    case "edit-terminal": {
      if (platform === "darwin") {
        return { cmd: "osascript", args: ["-e", appleScript(cwd, editCmd(doc))] };
      }
      return { error: "the `edit-terminal` integration is macOS-only — use ghostty-edit or tmux" };
    }
    case "ghostty-edit": {
      const ed = editor ?? process.env.OKUDA_EDITOR ?? process.env.EDITOR ?? "vi";
      const term = resolveTerminal(platform);
      if ("error" in term) return term;
      return {
        cmd: term.cmd,
        args: [...term.args, "-e", loginShell(shell), "-i", "-c", `${ed} ${shellQuote(resolve(cwd, doc))}`],
      };
    }
    default:
      return { error: `unknown clone integration "${integration}" — known: terminal, ghostty, tmux, cmd, herdr, edit-terminal, ghostty-edit` };
  }
}
