// state-colours viewer — A/B the current bright set against a proposed
// dim/bright gradient (recede/watch/alarm) so the perceptual call is
// made from the terminal. The bright set is what the contract test
// pins today; the dim set is a first attempt at "structure receding,
// signal foreground" applied to the state axis. No palette mutation —
// the styler is fed ad-hoc palettes so the real palette is untouched.
import { makeStyler } from "../src/ansi.ts";
import { DRACULA_PALETTE } from "../src/palette.ts";

const bright = { ...DRACULA_PALETTE };
const dim: typeof DRACULA_PALETTE = {
  ...DRACULA_PALETTE,
  "state-ok": "#3d7a3d",      // dim green — expected, recedes
  "state-parked": "#8a5520",  // dim orange — expected, recedes
  // state-todo + state-failed stay bright — watch + alarm tiers
};

const sB = makeStyler(bright, "truecolor");
const sD = makeStyler(dim, "truecolor");

const pad = (s: string, n: number) => s + " ".repeat(Math.max(0, n - s.length));
const label = (s: string) => pad(s, 16);

const rows: string[] = [];
rows.push("\n  STATE GLYPHS — A/B: bright (current) vs dim (proposed)\n");
rows.push("  " + label("tier") + "bright                              dim");
rows.push("  " + "─".repeat(64));
rows.push(
  "  " + label("recede/done") +
    sB.roleBold("state-ok", "✓") + " done   " +
    sD.roleBold("state-ok", "✓") + " done",
);
rows.push(
  "  " + label("recede/parked") +
    sB.roleBold("state-parked", "⋮") + " parked " +
    sD.roleBold("state-parked", "⋮") + " parked",
);
rows.push(
  "  " + label("watch/todo") +
    sB.roleBold("state-todo", "☐") + " todo   " +
    sD.roleBold("state-todo", "☐") + " todo  (unchanged)",
);
rows.push(
  "  " + label("alarm/failed") +
    sB.roleBold("state-failed", "✗") + " failed " +
    sD.roleBold("state-failed", "✗") + " failed (unchanged)",
);
rows.push(
  "  " + label("priority") +
    "◆ load-bearing (uncoloured — priority, not state)",
);
rows.push("");
process.stdout.write(rows.join("\n") + "\n");