import { describe, expect, test } from "bun:test";
import { renderOrientText, type OrientReport } from "../scripts/orient";
import { siloState, statusLine, type SiloSignals } from "../scripts/silo-status";

/** The seam this file pins: the reading a host renders, and the one claim the
 *  suite is allowed to make from it. Both halves are pure, which is the point
 *  — a state derived from a live repository cannot be tested, and a state that
 *  cannot be tested is a sentence with a colour. */

const base: OrientReport = {
  branch: "main",
  detached: false,
  upstream: "origin/main",
  fetch: "ok",
  ahead: 0,
  behind: 0,
  changed: { count: 0, lines: [] },
  head: { sha: "abc1234", line: "abc1234 a subject" },
  binary: { state: "fresh", stamp: "abc1234", head: "abc1234" },
  docs: { briefs: 7, decisions: 77, debriefs: 59, playbooks: 21 },
};

const report = (patch: Partial<OrientReport> = {}): OrientReport => ({ ...base, ...patch });
const signals = (patch: Partial<OrientReport> = {}, inReview: number | null = 0): SiloSignals => ({
  report: report(patch),
  inReview,
});

describe("silo-status — the claim the repository can pay", () => {
  test("clean, in sync, fresh, nothing to review — done", () => {
    expect(siloState(signals()).state).toBe("done");
  });

  test("a review awaiting a person outranks any chore — blocked", () => {
    const r = siloState(signals({ changed: { count: 3, lines: [" M a", "?? b", "?? c"] } }, 2));
    expect(r.state).toBe("blocked");
    expect(r.because).toBe("2 issue(s) await a review");
  });

  test("behind the tracking ref is blocked: a build from a behind ref is the failure class", () => {
    const r = siloState(signals({ behind: 2 }));
    expect(r.state).toBe("blocked");
    expect(r.because).toContain("behind origin/main by 2");
  });

  test("detached HEAD is a choice someone has to make, so it is blocked", () => {
    expect(siloState(signals({ detached: true, upstream: null })).state).toBe("blocked");
  });

  test("chores with nobody needed are idle, and the chores are named", () => {
    const r = siloState(
      signals({ changed: { count: 1, lines: [" M doc"] }, ahead: 10, binary: { state: "stale", stamp: "aaa0000", head: "abc1234" } }),
    );
    expect(r.state).toBe("idle");
    expect(r.because).toBe("1 changed file(s) · 10 commit(s) unpushed · binary stale");
  });

  test("an unreadable td is never read as zero — unknown reviews cannot be done", () => {
    const r = siloState(signals({}, null));
    expect(r.state).toBe("idle");
    expect(r.because).toContain("td unreadable");
  });
});

describe("silo-status — the state it refuses to emit", () => {
  /** The prohibition, enumerated rather than asserted once: every combination of
   *  the fields the mapping reads, and no combination yields `working`. An
   *  agent reports its own work; a repository reports only what it can see. */
  test("no reading of a repository yields `working`", () => {
    const trees = [
      { count: 0, lines: [] },
      { count: 1, lines: [" M a"] },
    ];
    const seen = new Set<string>();
    for (const detached of [false, true])
      for (const upstream of [null, "origin/main"])
        for (const ahead of [0, 3])
          for (const behind of [0, 2])
            for (const changed of trees)
              for (const bin of ["fresh", "stale", "unstamped", "absent"] as const)
                for (const inReview of [null, 0, 1]) {
                  const s = siloState({
                    report: report({ detached, upstream, ahead, behind, changed, binary: { state: bin, stamp: null, head: "abc1234" } }),
                    inReview,
                  });
                  expect(["blocked", "done", "idle"]).toContain(s.state);
                  seen.add(s.state);
                }
    // A control: the grid actually exercises all three payable states.
    expect([...seen].sort()).toEqual(["blocked", "done", "idle"]);
  });
});

describe("silo-status — the wire", () => {
  test("the line is one OSC 7501 sequence, ST-terminated, with no newline", () => {
    expect(statusLine("blocked")).toBe("\x1b]7501;state=blocked:app=silo\x1b\\");
    expect(statusLine("done")).not.toContain("\n");
    // BEL would also terminate an OSC, but the protocol documents ST and a host
    // that only strips ST would leave a stray byte on the line.
    expect(statusLine("idle").endsWith("\x1b\\")).toBe(true);
  });
});

describe("orient — the text render is the frame it always was", () => {
  test("in sync, clean, fresh: seven aligned lines", () => {
    expect(renderOrientText(report())).toBe(
      [
        "branch:  main — in sync with main",
        "status:  0 changed file(s)",
        "last:    abc1234 a subject",
        "binary:  fresh (abc1234 = HEAD)",
        "docs:    7 briefs, 77 decisions, 59 debriefs, 21 playbooks",
        "",
      ].join("\n"),
    );
  });

  test("drift is labelled, and the changed files are shown under the count", () => {
    const text = renderOrientText(report({ behind: 2, ahead: 10, changed: { count: 1, lines: [" M doc"] } }));
    expect(text).toContain("branch:  main — ahead 10, behind 2 vs main  ← PULL FIRST  ← UNPUSHED");
    expect(text).toContain("status:  1 changed file(s)\n M doc\n");
  });

  test("no upstream says so rather than crying wolf, and only a failure names the network", () => {
    expect(renderOrientText(report({ upstream: null }))).toContain("— no upstream  ← UNPUSHED BRANCH");
    expect(renderOrientText(report({ fetch: "skipped" }))).not.toContain("fetch failed");
    expect(renderOrientText(report({ fetch: "failed" }))).toContain("(fetch failed — offline? local view only)");
  });

  test("each binary state has its own line — a missing binary is not a stale one", () => {
    expect(renderOrientText(report({ binary: { state: "stale", stamp: "aaa0000", head: "abc1234" } }))).toContain(
      "binary:  STALE (aaa0000 ≠ abc1234) — just build",
    );
    expect(renderOrientText(report({ binary: { state: "unstamped", stamp: null, head: "abc1234" } }))).toContain(
      "binary:  unstamped (dev build) — just build",
    );
    expect(renderOrientText(report({ binary: { state: "absent", stamp: null, head: "abc1234" } }))).toContain(
      "binary:  absent — just build",
    );
  });
});
