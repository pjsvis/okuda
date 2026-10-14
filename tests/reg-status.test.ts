import { describe, expect, test } from "bun:test";
import {
  authoredDate,
  derivedDrift,
  statusFor,
  statusVocabulary,
  statusWord,
  type Entry,
} from "../scripts/reg-sync";

const entry = (over: Partial<Entry> = {}): Entry => ({
  file: "2026-10-05-brief-x.md",
  date: "2026-10-05",
  status: "open",
  summary: "X",
  meta: {},
  ...over,
});

describe("the status word — the first word of the Status line", () => {
  test("the house's forms all resolve; detail after the word is ignored", () => {
    expect(statusWord("**Status:** Done\n")).toBe("done");
    expect(statusWord("**Status:** Done — shipped 2026-10-05 (abc123)")).toBe("done");
    expect(statusWord("**Status:** LANDED 2026-09-12 with the VI amendment")).toBe("landed");
    expect(statusWord("**Status:** Aborted (2026-08-30) — the fix landed")).toBe("aborted");
    expect(statusWord("**Status:** Parked — gated on the porch matrix")).toBe("parked");
    expect(statusWord("**Status:** In progress\n")).toBe("in progress");
    expect(statusWord("**Status:** in progress — blocked on review")).toBe("in progress");
  });

  test("no Status line is an empty word, not a default", () => {
    expect(statusWord("# Brief: no status here\n")).toBe("");
  });
});

describe("the tier vocabulary", () => {
  test("briefs: the playbook's words, plus the corpus's own", () => {
    expect(statusFor("open", "briefs")).toBe("open");
    expect(statusFor("in progress", "briefs")).toBe("in_progress");
    expect(statusFor("done", "briefs")).toBe("done");
    expect(statusFor("landed", "briefs")).toBe("done"); // the archive's word
    expect(statusFor("parked", "briefs")).toBe("parked");
    expect(statusFor("rejected", "briefs")).toBe("rejected");
    expect(statusFor("draft", "briefs")).toBe("open"); // the corpus's word for not-started
    expect(statusFor("proposed", "briefs")).toBe("open");
    // Added 2026-10-13 (ADR-BRIEF-LIFECYCLE-061): the state the panels had been
    // maintaining by hand, and three folds that name another tier's moment or a
    // gate that does not exist.
    expect(statusFor("ready", "briefs")).toBe("ready");
    expect(statusFor("aborted", "briefs")).toBe("rejected");
    expect(statusFor("accepted", "briefs")).toBe("done");
    expect(statusFor("pending", "briefs")).toBe("open");
  });

  test("an unknown word is null — a finding, never a silent `open`", () => {
    // `ready` sat in this assertion until 2026-10-13: the test had encoded the
    // vocabulary gap as a contract, which is how it survived six briefs using
    // the word and a panel maintaining the section by hand.
    expect(statusFor("frobnicated", "briefs")).toBeNull();
    expect(statusFor("ready", "decisions")).toBeNull(); // no `ready` in the ADR lifecycle
  });

  test("decisions: the ADR lifecycle plus the abort", () => {
    expect(statusFor("proposed", "decisions")).toBe("Proposed");
    expect(statusFor("accepted", "decisions")).toBe("Accepted");
    expect(statusFor("aborted", "decisions")).toBe("Aborted");
    expect(statusFor("superseded", "decisions")).toBe("Superseded");
    expect(statusFor("parked", "decisions")).toBeNull();
  });

  test("the archive briefs tier shares the brief vocabulary", () => {
    // ADR-ARCHIVE-BREADTH-063: the archive records WHICH settled word a
    // body declares (done or rejected), so it shares the brief vocabulary
    // rather than flattening every archival to `done`. The statuses fixed
    // by definition — debrief, playbook, advisory — still have none.
    expect(statusVocabulary("briefs")).not.toBeNull();
    expect(statusVocabulary("decisions")).not.toBeNull();
    expect(statusVocabulary(".archive/briefs")).toBe(statusVocabulary("briefs"));
    expect(statusVocabulary("debriefs")).toBeNull();
    expect(statusVocabulary("playbooks")).toBeNull();
    expect(statusVocabulary("advisories")).toBeNull();
  });
});

describe("the authored date — a claim, where an mtime is not", () => {
  test("frontmatter, then the bold line, then nothing", () => {
    expect(authoredDate("---\ntype: Brief\ndate: 2026-10-05\n---\n# x")).toBe("2026-10-05");
    expect(authoredDate("# Brief\n\n**Date:** 2026-09-16\n")).toBe("2026-09-16");
    expect(authoredDate("# Playbook\n\n> prose only\n")).toBeNull();
  });
});

describe("derivedDrift — the fields the registry mirrors", () => {
  test("an identical row is silent", () => {
    expect(derivedDrift(entry(), entry(), { haveCallsign: true, dateAuthored: true })).toEqual([]);
  });

  test("status is compared — the 2026-10-05 defect", () => {
    const diffs = derivedDrift(entry({ status: "open" }), entry({ status: "done" }), {
      haveCallsign: true,
      dateAuthored: true,
    });
    expect(diffs).toEqual(["status open → done"]);
  });

  test("the date is compared ONLY when the document declares one", () => {
    const stored = entry({ date: "2026-08-20" });
    const truth = entry({ date: "2026-10-02" });
    expect(derivedDrift(stored, truth, { haveCallsign: true, dateAuthored: false })).toEqual([]);
    expect(derivedDrift(stored, truth, { haveCallsign: true, dateAuthored: true })).toEqual([
      "date 2026-08-20 → 2026-10-02",
    ]);
  });

  test("summary is never compared — a status repair must not clobber authored prose", () => {
    const stored = entry({ status: "Accepted", summary: "hand-written summary" });
    const truth = entry({ status: "Aborted", summary: "The H1-derived summary" });
    expect(derivedDrift(stored, truth, { haveCallsign: true, dateAuthored: false })).toEqual([
      "status Accepted → Aborted",
    ]);
  });

  test("callsign is compared only when frontmatter carries one", () => {
    const stored = entry({ callsign: "BRF-OLD" });
    const truth = entry({ callsign: "BRF-NEW" });
    expect(derivedDrift(stored, truth, { haveCallsign: true, dateAuthored: false })).toEqual([
      "callsign BRF-OLD → BRF-NEW",
    ]);
    // Unrecognised (no frontmatter callsign): left alone, not cleared.
    expect(derivedDrift(stored, truth, { haveCallsign: false, dateAuthored: false })).toEqual([]);
  });
});
