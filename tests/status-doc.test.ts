import { describe, expect, test } from "bun:test";
import { composeDoc, NO_STANCE, type IslandState } from "../scripts/status-doc";

const state: IslandState = {
  generated: "2026-08-28 18:00 UTC",
  branch: "feat/gloam-launcher",
  dirty: 0,
  last: "8c2663a docs: tidy",
  counts: { briefs: 27, decisions: 20, debriefs: 8, playbooks: 11 },
  issues: [
    { id: "td-b4bae8", title: "OKLCH brightness", status: "open", priority: "P3" },
    { id: "td-9d9981", title: "Build index-and-jump", status: "open", priority: "P2" },
    { id: "td-450944", title: "TUI live documents", status: "in_progress", priority: "P2" },
  ],
};

describe("composeDoc", () => {
  test("renders computed state and the board, priority first", () => {
    const doc = composeDoc(state, "- next: index-and-jump");
    expect(doc).toContain("`feat/gloam-launcher`");
    expect(doc).toContain("27 briefs · 20 decisions");
    expect(doc).toContain("td-9d9981");
    expect(doc.indexOf("td-9d9981")).toBeLessThan(doc.indexOf("td-b4bae8"));
    expect(doc).toContain("## Where we're going");
  });

  test("empty board degrades to the clear-stream line; empty stance to the prompt", () => {
    const doc = composeDoc({ ...state, issues: [] }, "");
    expect(doc).toContain("nothing open — the stream is clear");
    expect(doc).toContain(NO_STANCE.slice(2, 20));
  });
});
