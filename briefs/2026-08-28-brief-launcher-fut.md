# Brief: Launcher FUT — session-scoped alt-screen

**Date:** 2026-08-28
**Status:** Open (the ordering half is landed; this is the scoping half)
**Branch:** feat/gloam-launcher
**Context:** dogfood finding during the gloam browse → read → browse loop.
Between the fzf picker and the okuda reader there is a flash of unstyled
terminal (FUT) — the user's shell scrollback visible for one frame at each
transition. A manual `Ctrl+L` before launch (clear the primary screen to
blank) was the working triage: it didn't fix the timing, it downgraded the
*content* of the flash from shell-history to blank. The instinct was right
— content of the transitional frame matters more than its duration.

## The two bugs

The FUT is not one bug, it's two compounding.

1. **Ordering (landed, this branch, `src/tui.ts`).** `runTui` read the
   file and rendered the markdown *before* entering the alt-screen. The
   async read+render happened in the primary screen with scrollback
   visible, then `ENTER_ALT` flipped the surface, then `paint()`. The
   FUT's duration was `fzf-exit + file-read + markdown-render`, not just
   fzf's exit cleanup. Fix: enter the alt-screen before the first read;
   the user sees a blank alt-screen during the read instead of their
   shell history. Zero architectural change. **Done.**

2. **Scoping (this brief).** The alt-screen is owned by the *reader*
   (`runTui` enters/exits it per document), but the thing with a session
   lifetime is the *launcher* — `runLauncher`'s browse → read → browse
   loop. Every fzf↔reader transition crosses an alt-screen boundary:
   reader quits → `EXIT_ALT` → primary screen flashes → fzf runs inline
   in primary → fzf exits → primary flashes again → reader `ENTER_ALT`.
   The FUT happens *on the way back too*, for the same reason. The
   comment at `launcher.ts:134` — "The reader's own alt-screen exit is
   paired in tui.ts" — records the bug as if it were a feature.

## What

The alt-screen belongs to the **session**, not the reader. Extend the
framing ADR-016 already established ("the picker is a guest of the
reader's key set") one level up: **fzf and okuda are both guests of the
session's screen.** `runLauncher` enters the alt-screen once at startup;
fzf inline-renders inside it; `runTui` runs as a **guest** that paints
into the existing alt-screen and does *not* exit it on quit. The launcher
tears the alt-screen down once, on loop exit. Transitions become
paint-over-paint, no primary-screen crossing — FUT gone in both
directions.

## Why it earns its place

1. **Matches the design that's already there.** ADR-016 made fzf a guest
   of the reader's key set. The screen has the same shape of problem and
   the same shape of answer: a session resource the guests share, not a
   resource each guest owns and re-enters. Owning the keys but renting
   the screen is a half-application of the principle.
2. **Kills the FUT in both directions, not one.** The ordering fix
   handles the launch edge (reader entry). The return edge — reader
   quits back to the picker — still crosses to primary screen today. The
   scoping fix is the only one that addresses the return path; the
   ordering fix can't, because the reader legitimately *exits* the
   alt-screen on quit.
3. **Retires the comment-as-feature.** "The reader's own alt-screen exit
   is paired in tui.ts" stops being a defensible contract and becomes
   what it is: a transition that flashes the user.

## How

`runTui` grows one option:

```ts
export interface TuiOptions {
  file: string;
  width: number;
  rows: number;
  palette?: Palette;
  altScreen?: "own" | "guest"; // default "own" — okuda <file> owns its screen
}
```

- **`"own"` (default):** today's behaviour. `runTui` enters the
  alt-screen on entry, exits it on quit. The `okuda <file>` entry point
  is unchanged — it has no surrounding session.
- **`"guest"` (gloam):** `runTui` paints into the *existing* alt-screen.
  On entry it does not emit `ENTER_ALT`; on quit it does not emit
  `EXIT_ALT`. It clears and paints as today; the launcher's surrounding
  alt-screen holds across the quit.

`runLauncher` becomes the screen owner:

```ts
process.stdout.write("\x1b[?1049h"); // session alt-screen — guests paint into it
try {
  for (;;) {
    const pick = await pickFile(files, query);
    if (pick === null) break;
    await runTui({ ...pick, altScreen: "guest", ... });
  }
} finally {
  process.stdout.write("\x1b[?1049l"); // tear down once, on session exit
}
```

The existing `\x1b[?1007h`/`l` alt-scroll pairing stays (it's a separate
mode, already session-scoped in the launcher).

## Risk / open questions

- **fzf inside an alt-screen we own.** fzf clears its own lines on exit
  (cursor up + erase rows); that works in alt-screen, but it is the
  untested assumption. Manual check before committing to the
  restructure. Failsafe: okuda's first `paint()` already does
  `\x1b[2J\x1b[H` (hard clear) — fzf's exit hygiene barely matters, the
  reader overwrites whatever fzf leaves. On the *return* edge (reader
  quits to picker), the picker re-runs fzf which clears before drawing,
  so a stale reader frame doesn't survive either.
- **Crash-leak symmetry.** The ordering fix already moved `ENTER_ALT`
  ahead of the async read, so a render throw could leak the alt-screen.
  Today this is a crash anyway; the scoping fix should pair its
  `ENTER_ALT` with a `try/finally` from the start (the launcher owns
  the lifecycle, so the finally is the natural place). `runTui` guest
  mode inherits the launcher's finally for free.
- **`okuda <file>` unchanged?** Yes — `altScreen: "own"` is the default,
  so the one-document contract is byte-identical. The option only
  exists for the launcher to pass `"guest"`.

## Scope / non-goals

- Not a TUI framework, not a screen abstraction layer. One boolean
  option, two call sites.
- Not changing fzf's invocation or binds (ADR-016's key-grammar parity
  is untouched — the screen and the keys are separate concerns).
- Not touching the streaming fallback (no alt-screen there, ever).

## Related

- ADR-016 (`decisions/016-argv0-launcher-dispatch.md`) — "the picker is
  a guest of the reader's key set." This brief extends the guest
  metaphor to the screen.
- `src/launcher.ts` — the session that should own the screen.
- `src/tui.ts` — the reader that should rent it in guest mode.
- Ordering fix (this branch, landed): enter alt-screen before first
  read; the content-of-frame half of the FUT fix.