import { describe, expect, test } from "bun:test";
import {
  applyPathPredicates,
  matchPathPredicate,
  onionMerge,
  orderByRecency,
  pathDate,
  routeQuery,
  type ChannelHit,
  type OnionDeps,
  type PathPredicate,
} from "../src/onion";

/** Layer-0/no-channel deps: every survivor lands in the remainder. */
function emptyDeps(): OnionDeps {
  return { registryHitsFor: () => [], bodyHitsFor: () => [], contentMentions: () => [] };
}

/** The synthetic corpus — every layer property is testable without
 *  rg, fs, or the real silo. Dates in slugs, five tiers, one root. */
const CORPUS = [
  "README.md",
  "briefs/2026-08-25-brief-alpha.md",
  "briefs/2026-09-01-brief-beta.md",
  "decisions/001-adr-alpha.md",
  "decisions/044-adr-beta.md",
  "debriefs/2026-08-26-dbf-alpha.md",
  "debriefs/2026-09-15-dbf-beta.md",
  "docs/2026-08-20-doc-alpha.md",
  "docs/2026-09-18-doc-beta.md",
  "playbooks/authoring-playbook.md",
  "advisories/ADV-READER-SIDE-FILTER.md",
];

/** Layer of a single-token query, via the public surface. */
function layerOf(token: string): "path" | "content" {
  const q = routeQuery(token);
  if (q.dates.length > 0) return "path";
  if (q.clauses[0]?.dirs.length) return "path";
  return "content";
}

describe("onion — routeQuery (the grammar routes; the layers parse nothing)", () => {
  test("@date is a path predicate, both shapes — the sigil with one shape", () => {
    const mm = routeQuery("@2026-08");
    expect(mm.dates).toEqual(["2026-08"]);
    const dd = routeQuery("@2026-08-26");
    expect(dd.dates).toEqual(["2026-08-26"]);
  });

  test("property: every YYYY-MM and YYYY-MM-DD classifies path; wrong shapes fall to content", () => {
    // Generated, deterministic — the shape rule, not the examples.
    const months: string[] = [];
    for (let y = 2024; y <= 2026; y++) {
      for (let m = 1; m <= 12; m++) months.push(`${y}-${String(m).padStart(2, "0")}`);
    }
    for (const mo of months) {
      expect(layerOf(`@${mo}`)).toBe("path");
      for (const d of ["01", "15", "26"]) {
        expect(layerOf(`@${mo}-${d}`)).toBe("path");
      }
    }
    for (const bad of ["@2026-8", "@2026", "@2026-08-2", "@x", "@2026-08-", "@202608"]) {
      expect(layerOf(bad)).toBe("content"); // a sigil with any shape is a second grammar
    }
  });

  test("property: dir/ and /dir are path predicates, both forms, every tier", () => {
    for (const dir of ["briefs", "decisions", "debriefs", "docs", "playbooks", "advisories", "docs/nested"]) {
      const trailing = routeQuery(`${dir}/`);
      expect(trailing.clauses[0]!.dirs).toContain(dir.replace(/\/+$/, ""));
      const leading = routeQuery(`/${dir}`);
      expect(leading.clauses[0]!.dirs).toContain(dir.replace(/^\/+/, ""));
    }
  });

  test("a bare word is content — the rule is stated, never inferred", () => {
    const q = routeQuery("elision");
    expect(q.clauses).toEqual([{ dirs: [], content: ["elision"] }]);
    expect(q.dates).toEqual([]);
  });

  test("! routes to the SAME layer as its operand — two mechanisms, two layers", () => {
    const p = routeQuery("!briefs/");
    expect(p.pathNegations).toEqual([{ kind: "dir", dir: "briefs" }]);
    expect(p.clauses).toEqual([]); // the negation-only fragment dropped
    const c = routeQuery("!zod");
    expect(c.contentNegations).toEqual(["zod"]);
    expect(c.clauses).toEqual([]);
    const d = routeQuery("!@2026-09");
    expect(d.pathNegations).toEqual([{ kind: "date", date: "2026-09" }]);
  });

  test("| splits clauses; empty clauses dropped; a lone ! is nothing", () => {
    expect(routeQuery("alpha | | beta").clauses.length).toBe(2);
    expect(routeQuery("| alpha").clauses.length).toBe(1);
    expect(routeQuery("!").clauses).toEqual([]);
    expect(routeQuery("!").contentNegations).toEqual([]);
  });

  test("a mixed clause ANDs across layers: @date dir/ content", () => {
    const q = routeQuery("@2026-08 decisions/ elision");
    expect(q.dates).toEqual(["2026-08"]); // global scope
    expect(q.clauses).toEqual([{ dirs: ["decisions"], content: ["elision"] }]);
  });

  test("property: token accounting — every non-empty token lands exactly once", () => {
    const battery = [
      "@2026-08 decisions/ elision | docs/ anchor !briefs/ !zod",
      "load bearing",
      "a | b | c",
      "!a !b !c/",
      "@2026-09-02",
    ];
    for (const query of battery) {
      const q = routeQuery(query);
      let pos = q.dates.length + q.contentNegations.length + q.pathNegations.length;
      for (const c of q.clauses) pos += c.dirs.length + c.content.length;
      const expected = query.split(/\s+/).filter((t) => t !== "|" && t !== "!").length;
      expect(pos).toBe(expected);
    }
  });
});

describe("onion — applyPathPredicates (Layer 1, pure)", () => {
  const smoke = "!briefs/ @2026-08 debriefs/ | decisions/ | docs/ | playbooks/ | advisories/";

  test("the smoke query over the synthetic corpus — every predicate at its home layer", () => {
    const routed = routeQuery(smoke);
    const out = applyPathPredicates(CORPUS, routed.clauses, routed.dates, routed.pathNegations);
    // No briefs (defect 2: the path negation kills, by construction).
    expect(out.some((p) => p.startsWith("briefs/"))).toBe(false);
    // The date is GLOBAL scope: every survivor is dated 2026-08
    // (defect 4: a date is never a content substring).
    expect(out.every((p) => p.slice(p.lastIndexOf("/") + 1).includes("2026-08"))).toBe(true);
    // Dirs OR across clauses, AND within.
    expect(out.every((p) =>
      p.startsWith("debriefs/") || p.startsWith("decisions/") ||
      p.startsWith("docs/") || p.startsWith("playbooks/") || p.startsWith("advisories/"),
    )).toBe(true);
    // debriefs narrowed to the date; the 2026-09 debrief is out.
    expect(out).toContain("debriefs/2026-08-26-dbf-alpha.md");
    expect(out).not.toContain("debriefs/2026-09-15-dbf-beta.md");
  });

  test("property: the result is always a subset of the candidates", () => {
    const queries = ["", "!briefs/", "@2026-08 debriefs/", "elision", smoke, "@2099-01", "!docs/ @2026-08"];
    for (const query of queries) {
      const routed = routeQuery(query);
      const out = applyPathPredicates(CORPUS, routed.clauses, routed.dates, routed.pathNegations);
      const inSet = new Set(CORPUS);
      expect(out.every((p) => inSet.has(p))).toBe(true);
    }
  });

  test("no path predicates anywhere → identity (content's narrowing is Layer 3's)", () => {
    const routed = routeQuery("elision | zod");
    const out = applyPathPredicates(CORPUS, routed.clauses, routed.dates, routed.pathNegations);
    expect(out).toEqual(CORPUS);
  });

  test("OR across clauses, AND within — dirs", () => {
    const routed = routeQuery("docs/ | playbooks/");
    const out = applyPathPredicates(CORPUS, routed.clauses, routed.dates, routed.pathNegations);
    expect(out).toEqual([
      "docs/2026-08-20-doc-alpha.md",
      "docs/2026-09-18-doc-beta.md",
      "playbooks/authoring-playbook.md",
    ]);
  });

  test("two dirs in ONE clause AND — the honest empty intersection", () => {
    const routed = routeQuery("docs/ briefs/");
    const out = applyPathPredicates(CORPUS, routed.clauses, routed.dates, routed.pathNegations);
    expect(out).toEqual([]);
  });

  test("negation is global — exclusion is exclusion, from every clause", () => {
    const routed = routeQuery("!docs/ elision | docs/");
    const out = applyPathPredicates(CORPUS, routed.clauses, routed.dates, routed.pathNegations);
    expect(out.some((p) => p.startsWith("docs/"))).toBe(false);
  });

  test("no clauses at all (date- or negation-only query) → unconstrained, minus the modifiers", () => {
    const routed = routeQuery("@2026-08");
    const out = applyPathPredicates(CORPUS, routed.clauses, routed.dates, routed.pathNegations);
    expect(out.every((p) => p.slice(p.lastIndexOf("/") + 1).includes("2026-08"))).toBe(true);
    expect(out).toEqual([ // the 2026-08-dated subset — dirs none, README undated → out
      "briefs/2026-08-25-brief-alpha.md",
      "debriefs/2026-08-26-dbf-alpha.md",
      "docs/2026-08-20-doc-alpha.md",
    ]);
  });

  test("matchPathPredicate: date matches the filename; dir is a prefix", () => {
    const date: PathPredicate = { kind: "date", date: "2026-08" };
    expect(matchPathPredicate(date, "docs/2026-08-20-doc-alpha.md")).toBe(true);
    expect(matchPathPredicate(date, "docs/2026-09-18-doc-beta.md")).toBe(false);
    expect(matchPathPredicate(date, "2026-08-20/x.md")).toBe(false); // the DIR is not the filename
    const dir: PathPredicate = { kind: "dir", dir: "docs" };
    expect(matchPathPredicate(dir, "docs/2026-08-20-doc-alpha.md")).toBe(true);
    expect(matchPathPredicate(dir, "docsites/a.md")).toBe(false); // prefix, not substring
  });
});

describe("onion — onionMerge (Layers 2-4: channels over survivors only)", () => {
  /** Fake deps: deterministic hits, full call recording. */
  function fakeDeps(opts: {
    registry?: string[]; // paths the registry channel "finds"
    body?: string[]; // paths the body channel "finds"
    mentions?: string[]; // paths contentMentions reports
  }): { deps: OnionDeps; seenSurvivors: string[][] } {
    const seenSurvivors: string[][] = [];
    const deps: OnionDeps = {
      registryHitsFor: (clauseQuery, survivors) => {
        seenSurvivors.push(survivors);
        return (opts.registry ?? [])
          .filter((p) => survivors.includes(p))
          .map((p) => ({ path: p, evidence: `reg(${clauseQuery})` }));
      },
      bodyHitsFor: (clauseQuery, survivors) => {
        seenSurvivors.push(survivors);
        return (opts.body ?? [])
          .filter((p) => survivors.includes(p))
          .map((p) => ({ path: p, evidence: `body(${clauseQuery})` }));
      },
      contentMentions: (term, survivors) => (opts.mentions ?? []).filter((p) => survivors.includes(p) && term === "zod"),
    };
    return { deps, seenSurvivors };
  }

  test("feed order: registry before body before remainder; evidence first-channel-wins", () => {
    const { deps } = fakeDeps({
      registry: ["decisions/001-adr-alpha.md", "docs/2026-08-20-doc-alpha.md"],
      body: ["docs/2026-08-20-doc-alpha.md", "playbooks/authoring-playbook.md"],
    });
    const out = onionMerge(CORPUS, routeQuery("alpha"), deps);
    // The invariant is the CHANNEL BLOCKS, in order — asserted as blocks,
    // not as index arithmetic between two rows, because recency orders
    // *within* a block (ADR-SEARCH-RECENCY-053) and the old index
    // comparison silently depended on the input order inside it.
    const blockOf = (e: string): number => (e.startsWith("reg(") ? 1 : e.startsWith("body(") ? 2 : 3);
    const blocks = out.map((h) => blockOf(h.evidence));
    expect(blocks).toEqual([...blocks].sort((a, b) => a - b)); // never out of order
    expect(blocks).toContain(1);
    expect(blocks).toContain(2);
    expect(blocks).toContain(3);
    // A doc found by both channels: one row, the registry's evidence.
    const twice = out.filter((h) => h.path === "docs/2026-08-20-doc-alpha.md");
    expect(twice.length).toBe(1);
    expect(twice[0]!.evidence).toMatch(/^reg\(/);
    // The remainder follows the channels, without evidence.
    const rem = out.filter((h) => !h.evidence);
    expect(rem.some((h) => h.path === "playbooks/authoring-playbook.md")).toBe(false); // body found it
    expect(rem.some((h) => h.path === "advisories/ADV-READER-SIDE-FILTER.md")).toBe(true);
  });

  test("root files are suppressed in the dive (the shelf owns them)", () => {
    const { deps } = fakeDeps({ registry: ["README.md"], body: ["README.md"] });
    const out = onionMerge(CORPUS, routeQuery("anything"), deps);
    expect(out.some((h) => h.path === "README.md")).toBe(false);
  });

  test("content negation removes the path from EVERY channel (exclude-by-result)", () => {
    const { deps } = fakeDeps({
      registry: ["docs/2026-08-20-doc-alpha.md"],
      body: ["docs/2026-08-20-doc-alpha.md"],
      mentions: ["docs/2026-08-20-doc-alpha.md"],
    });
    const out = onionMerge(CORPUS, routeQuery("alpha !zod"), deps);
    expect(out.some((h) => h.path === "docs/2026-08-20-doc-alpha.md")).toBe(false);
  });

  test("path negation never reaches the deps — rg never searches an excluded dir", () => {
    const { deps, seenSurvivors } = fakeDocs();
    function fakeDocs() {
      return fakeDeps({}); // no-op channels; the survivors record is the point
    }
    onionMerge(CORPUS, routeQuery("!briefs/ elision"), deps);
    expect(seenSurvivors.length).toBeGreaterThan(0);
    for (const sv of seenSurvivors) {
      expect(sv.some((p) => p.startsWith("briefs/"))).toBe(false); // defect 2, at the dep boundary
    }
  });

  test("a pure path query calls no channel — all survivors land in the remainder", () => {
    const { deps, seenSurvivors } = fakeDeps({});
    const out = onionMerge(CORPUS, routeQuery("decisions/"), deps);
    expect(seenSurvivors).toEqual([]); // no content → no channel runs
    expect(out.map((h) => h.path)).toEqual(["decisions/001-adr-alpha.md", "decisions/044-adr-beta.md"]);
    expect(out.every((h) => h.evidence === "")).toBe(true);
  });

  test("the same doc found via two clauses appears once", () => {
    const { deps } = fakeDeps({ registry: ["docs/2026-08-20-doc-alpha.md"] });
    const out = onionMerge(CORPUS, routeQuery("alpha | beta"), deps);
    expect(out.filter((h) => h.path === "docs/2026-08-20-doc-alpha.md").length).toBe(1);
  });

  test("layered narrowing: dir + date survivors only reach the content channels", () => {
    const { deps, seenSurvivors } = fakeDeps({});
    onionMerge(CORPUS, routeQuery("@2026-08 debriefs/ anchor"), deps);
    expect(seenSurvivors.every((sv) => sv.every((p) => p.startsWith("debriefs/")))).toBe(true);
    expect(seenSurvivors.every((sv) => sv.every((p) => p.includes("2026-08")))).toBe(true);
  });
});

/** ChannelHit re-exported shape sanity (the entries contract). */
describe("onion — the two 2026-10-05 refinements (ADR-SEARCH-RECENCY-053)", () => {
  const corpus = [
    "TradingAgents/README.md",
    "TradingAgents/src/deep.md",
    "briefs/2026-08-20-brief-old.md",
    "briefs/2026-10-05-brief-new.md",
    "briefs/2026-09-16-brief-mid.md",
    "docs/2026-10-05-a-note.md",
    "AGENTS.md",
    "README.md",
  ];

  test("dir predicates are case-insensitive — the casing is not the reader's business", () => {
    const lower = matchPathPredicate({ kind: "dir", dir: "tradingagents" }, "TradingAgents/README.md");
    expect(lower).toBe(true);
    expect(matchPathPredicate({ kind: "dir", dir: "TRADINGAGENTS" }, "TradingAgents/README.md")).toBe(true);
    expect(matchPathPredicate({ kind: "dir", dir: "TradingAgents" }, "TradingAgents/README.md")).toBe(true);
    // Not a prefix match either way — the boundary is still a path segment.
    expect(matchPathPredicate({ kind: "dir", dir: "trading" }, "TradingAgents/README.md")).toBe(false);
  });

  test("the clause filter agrees with the predicate — one rule, both call sites", () => {
    const out = applyPathPredicates(corpus, [{ dirs: ["tradingagents"] }], [], []);
    expect(out).toEqual(["TradingAgents/README.md", "TradingAgents/src/deep.md"]);
    const routed = routeQuery("tradingagents/");
    expect(applyPathPredicates(corpus, routed.clauses, routed.dates, routed.pathNegations)).toEqual(out);
  });

  test("a negated dir is case-insensitive too — exclusion is exclusion", () => {
    const out = applyPathPredicates(corpus, [], [], [{ kind: "dir", dir: "tradingagents" }]);
    expect(out).not.toContain("TradingAgents/README.md");
    expect(out).toContain("briefs/2026-08-20-brief-old.md");
  });

  test("dated rows come first, newest first; undated rows keep canonical order", () => {
    const merged = onionMerge(corpus, routeQuery("briefs/"), emptyDeps());
    expect(merged.map((h) => h.path)).toEqual([
      "briefs/2026-10-05-brief-new.md",
      "briefs/2026-09-16-brief-mid.md",
      "briefs/2026-08-20-brief-old.md",
    ]);
    // Undated, unfiltered: the collation is untouched, and equal dates keep
    // their input order (the sort is stable).
    const all = onionMerge(corpus, routeQuery("nothing-matches"), emptyDeps());
    expect(all.map((h) => h.path)).toEqual([
      "briefs/2026-10-05-brief-new.md",
      "docs/2026-10-05-a-note.md",
      "briefs/2026-09-16-brief-mid.md",
      "briefs/2026-08-20-brief-old.md",
      "TradingAgents/README.md",
      "TradingAgents/src/deep.md",
    ]);
  });

  test("recency orders WITHIN a channel; the channel rank is authoritative", () => {
    // A registry hit older than a body hit still leads: rank first, recency second.
    const deps: OnionDeps = {
      registryHitsFor: () => [{ path: "briefs/2026-08-20-brief-old.md", evidence: "BRF-OLD — x" }],
      bodyHitsFor: () => [
        { path: "briefs/2026-10-05-brief-new.md", evidence: "new line" },
        { path: "briefs/2026-09-16-brief-mid.md", evidence: "mid line" },
      ],
      contentMentions: () => [],
    };
    const merged = onionMerge(corpus, routeQuery("briefs/ x"), deps);
    expect(merged.map((h) => h.path)).toEqual([
      "briefs/2026-08-20-brief-old.md", // channel 1, however old
      "briefs/2026-10-05-brief-new.md", // channel 2, newest first
      "briefs/2026-09-16-brief-mid.md",
    ]);
  });

  test("pathDate: ISO prefixes compare correctly, day over month, else null", () => {
    expect(pathDate("briefs/2026-10-05-brief-x.md")).toBe("2026-10-05");
    expect(pathDate("docs/2026-09-note.md")).toBe("2026-09");
    expect(pathDate("src/onion.ts")).toBeNull();
    expect(orderByRecency([
      { path: "a/2026-09-note.md", evidence: "" },
      { path: "a/2026-10-05-x.md", evidence: "" },
      { path: "a/2026-08-20-y.md", evidence: "" },
      { path: "a/AGENTS.md", evidence: "" },
    ]).map((h) => h.path)).toEqual([
      "a/2026-10-05-x.md",
      "a/2026-09-note.md",
      "a/2026-08-20-y.md",
      "a/AGENTS.md",
    ]);
  });

  test("orderByRecency is permutation-invariant — the order is a function of the set", () => {
    // rg's discovery order is thread-scheduled, so a channel that kept it
    // handed back a differently-ordered list each render. Same members,
    // any input order, one output: ties break by path.
    const members: ChannelHit[] = [
      { path: "a/2026-10-05-x.md", evidence: "" },
      { path: "a/2026-09-note.md", evidence: "" },
      { path: "a/AGENTS.md", evidence: "" },
      { path: "a/2026-09-16-mid.md", evidence: "" },
      { path: "a/notes.md", evidence: "" },
    ];
    const permuted = [members[2]!, members[4]!, members[0]!, members[3]!, members[1]!];
    expect(orderByRecency(members).map((h) => h.path)).toEqual(
      orderByRecency(permuted).map((h) => h.path),
    );
    expect(orderByRecency(members).map((h) => h.path)).toEqual([
      "a/2026-10-05-x.md",
      "a/2026-09-16-mid.md",
      "a/2026-09-note.md",
      "a/AGENTS.md",
      "a/notes.md",
    ]);
  });
});

describe("onion — ChannelHit shape", () => {
  test("evidence is a plain string field (launcher clips at the edge)", () => {
    const hit: ChannelHit = { path: "x.md", evidence: "" };
    expect(Object.keys(hit).sort()).toEqual(["evidence", "path"]);
  });
});
