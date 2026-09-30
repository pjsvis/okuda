import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import {
  callsignForFile,
  detectRoot,
  loadCallsigns,
  makeCallsignResolver,
  makePathValidator,
  presentRegistries,
  resolveByCallsign,
} from "../src/root";
import { versionLine } from "../src/cli";

/** mkdtemp helper: returns a fresh empty dir and a cleanup thunk. */
function scratch(): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "root-test-"));
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

describe("root — detectRoot (rooted/unrooted gloam signature)", () => {
  test("empty dir → unrooted (no badge)", () => {
    const { dir, cleanup } = scratch();
    try {
      expect(detectRoot(dir)).toBeNull();
    } finally { cleanup(); }
  });

  test("OKF root index.md with okf_version → rooted via okf, badge = declared name", () => {
    const { dir, cleanup } = scratch();
    try {
      writeFileSync(join(dir, "index.md"), "---\nokf_version: \"0.2\"\nname: okuda\n---\n# okuda");
      const r = detectRoot(dir);
      expect(r).not.toBeNull();
      expect(r!.via).toBe("okf");
      expect(r!.badge).toBe("okuda");
    } finally { cleanup(); }
  });

  test("OKF root, no name → badge falls back to basename(cwd)", () => {
    const { dir, cleanup } = scratch();
    try {
      writeFileSync(join(dir, "index.md"), "---\nokf_version: \"0.2\"\n---\n# x");
      const r = detectRoot(dir);
      expect(r).not.toBeNull();
      expect(r!.via).toBe("okf");
      expect(r!.badge).toBe(basename(dir));
    } finally { cleanup(); }
  });

  test("OKF root, title but no name → badge falls back to title", () => {
    const { dir, cleanup } = scratch();
    try {
      writeFileSync(join(dir, "index.md"), "---\nokf_version: \"0.2\"\ntitle: titled\n---\n");
      const r = detectRoot(dir);
      expect(r).not.toBeNull();
      expect(r!.via).toBe("okf");
      expect(r!.badge).toBe("titled");
    } finally { cleanup(); }
  });

  test("index.md without okf_version, no registry → unrooted", () => {
    const { dir, cleanup } = scratch();
    try {
      writeFileSync(join(dir, "index.md"), "# just a readme");
      expect(detectRoot(dir)).toBeNull();
    } finally { cleanup(); }
  });

  test("tier registry present → rooted via registry, badge = basename", () => {
    const { dir, cleanup } = scratch();
    try {
      mkdirSync(join(dir, "briefs"));
      writeFileSync(join(dir, "briefs", "INDEX.jsonl"), "{}\n");
      const r = detectRoot(dir);
      expect(r).not.toBeNull();
      expect(r!.via).toBe("registry");
      expect(r!.badge).toBe(basename(dir));
    } finally { cleanup(); }
  });

  test("OKF signature wins over a co-present registry", () => {
    const { dir, cleanup } = scratch();
    try {
      mkdirSync(join(dir, "decisions"));
      writeFileSync(join(dir, "decisions", "INDEX.jsonl"), "{}\n");
      writeFileSync(join(dir, "index.md"), "---\nokf_version: \"0.2\"\nname: winner\n---\n");
      const r = detectRoot(dir);
      expect(r).not.toBeNull();
      expect(r!.via).toBe("okf");
      expect(r!.badge).toBe("winner");
    } finally { cleanup(); }
  });

  test("quoted frontmatter values are unwrapped (single + double)", () => {
    const { dir, cleanup } = scratch();
    try {
      writeFileSync(join(dir, "index.md"), "---\nokf_version: '0.2'\nname: \"quoted\"\n---\n");
      const r = detectRoot(dir);
      expect(r).not.toBeNull();
      expect(r!.badge).toBe("quoted");
    } finally { cleanup(); }
  });

  test("presentRegistries lists the tiers this silo actually indexes", () => {
    // This repo is itself a rooted silo (the dogfood case): all five
    // tiers — advisories joined 2026-09-24 (BRF-VALIDATED-SILCROWS P-0;
    // this test's "all four" was itself a record of the drift).
    const here = presentRegistries();
    expect(here.length).toBe(5);
    expect(here).toContain("briefs/INDEX.jsonl");
    expect(here).toContain("decisions/INDEX.jsonl");
    expect(here).toContain("debriefs/INDEX.jsonl");
    expect(here).toContain("playbooks/REGISTRY.jsonl");
    expect(here).toContain("advisories/INDEX.jsonl");
  });
});

describe("root — callsigns (resolution, not derivation)", () => {
  /** A scratch silo with one registry: two records, one malformed line,
   *  one record without a callsign (pre-migration shape). */
  function scratchSilo(): { dir: string; cleanup: () => void } {
    const dir = mkdtempSync(join(tmpdir(), "callsign-test-"));
    mkdirSync(join(dir, "briefs"));
    writeFileSync(
      join(dir, "briefs", "INDEX.jsonl"),
      [
        JSON.stringify({ file: "a.md", date: "2026-08-29", status: "open", summary: "A", callsign: "BRF-ALPHA" }),
        "{not json",
        JSON.stringify({ file: "b.md", date: "2026-08-29", status: "open", summary: "B", callsign: "BRF-BETA" }),
        JSON.stringify({ file: "c.md", date: "2026-08-29", status: "open", summary: "C" }),
      ].join("\n") + "\n",
    );
    return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
  }

  test("loadCallsigns parses records, skips malformed + callsign-less", () => {
    const { dir, cleanup } = scratchSilo();
    try {
      const recs = loadCallsigns(dir);
      expect(recs.map((r) => r.callsign).sort()).toEqual(["BRF-ALPHA", "BRF-BETA"]);
      expect(recs[0]!.path).toBe(join(dir, "briefs", "a.md"));
    } finally { cleanup(); }
  });

  test("resolveByCallsign: known → path; unknown → null", () => {
    const { dir, cleanup } = scratchSilo();
    try {
      expect(resolveByCallsign("BRF-ALPHA", dir)).toBe(join(dir, "briefs", "a.md"));
      expect(resolveByCallsign("BRF-NOPE", dir)).toBeNull();
    } finally { cleanup(); }
  });

  test("resolveByCallsign: the advisories tier resolves (BRF-VALIDATED-SILCROWS P-0 — the 2026-09-24 drift repair)", () => {
    const dir = mkdtempSync(join(tmpdir(), "adv-tier-"));
    try {
      mkdirSync(join(dir, "advisories"));
      writeFileSync(
        join(dir, "advisories", "INDEX.jsonl"),
        JSON.stringify({ file: "adv.md", date: "2026-09-24", status: "open", summary: "A", callsign: "ADV-READER-SIDE-FILTER" }) + "\n",
      );
      // 17 corpus references to this exact callsign painted dead
      // silcrows while the tier was invisible to the resolver.
      expect(resolveByCallsign("ADV-READER-SIDE-FILTER", dir)).toBe(join(dir, "advisories", "adv.md"));
      expect(resolveByCallsign("ADV-NOPE", dir)).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("file lookup matches on tier/file segments, however the path arrived", () => {
    const { dir, cleanup } = scratchSilo();
    try {
      expect(callsignForFile(join(dir, "briefs", "a.md"), dir)).toBe("BRF-ALPHA");
      expect(callsignForFile("briefs/a.md", dir)).toBe("BRF-ALPHA");
      expect(callsignForFile("briefs/c.md", dir)).toBeNull(); // no callsign
    } finally { cleanup(); }
  });

  test("makeCallsignResolver: index loads once, resolves per paint", () => {
    const { dir, cleanup } = scratchSilo();
    try {
      const r = makeCallsignResolver(dir);
      expect(r("briefs/b.md")).toBe("BRF-BETA");
      expect(r("nowhere/x.md")).toBeNull();
    } finally { cleanup(); }
  });

  test("resolveByCallsign: a collision is ambiguous → null (ADR-025 clause 4 — retire silent first-wins)", () => {
    const dir = mkdtempSync(join(tmpdir(), "callsign-collision-"));
    mkdirSync(join(dir, "briefs"));
    writeFileSync(
      join(dir, "briefs", "INDEX.jsonl"),
      [
        JSON.stringify({ file: "a.md", date: "2026-09-07", status: "open", summary: "A", callsign: "BRF-DUP" }),
        JSON.stringify({ file: "b.md", date: "2026-09-07", status: "open", summary: "B", callsign: "BRF-DUP" }),
      ].join("\n") + "\n",
    );
    try {
      // two records, one callsign — the retired .find() would silently
      // return a.md; the exactly-one resolver returns null (ambiguous).
      expect(resolveByCallsign("BRF-DUP", dir)).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
describe("cli — versionLine (single source of truth, v0.1.0 trifecta)", () => {
  test("reported version is the manifest's version, not a twin string", () => {
    // The old bug class: `0.1.0` hardcoded in cli.ts beside the same
    // value in package.json — two sources that match until they don't.
    // The invariant: the line is derived FROM the manifest at import
    // time, so drift is structurally impossible, not vigilantly avoided.
    const pkg = require("../package.json") as { version: string };
    expect(versionLine("abc1234")).toBe(`okuda ${pkg.version} (abc1234)`);
    expect(versionLine()).toBe(`okuda ${pkg.version} (dev)`);
  });
});

describe("resolveByCallsign — ordinal shorthand (ADR-031 dogfood)", () => {
  test("tier + ordinal resolves when exactly one callsign matches", () => {
    // The prose says ADR-030; the registry knows ADR-LIVE-SEARCH-030.
    expect(resolveByCallsign("ADR-030")).toBe(join(process.cwd(), "decisions/030-live-search-picker.md"));
    expect(resolveByCallsign("ADR-031")).toBe(join(process.cwd(), "decisions/031-main-document.md"));
  });

  test("exact callsigns still resolve first", () => {
    expect(resolveByCallsign("ADR-MAIN-DOCUMENT-031")).toBe(join(process.cwd(), "decisions/031-main-document.md"));
  });

  test("absent ordinals refuse", () => {
    expect(resolveByCallsign("ADR-999")).toBeNull();
  });
});

describe("root — makePathValidator (ADR-045: the path substrate, anchored like actuation)", () => {
  test("document-relative first, cwd second — the anchors actuation tries", () => {
    const dir = mkdtempSync(join(tmpdir(), "okuda-pathval-"));
    try {
      mkdirSync(join(dir, "docs"));
      mkdirSync(join(dir, "src"));
      writeFileSync(join(dir, "docs", "sibling.ts"), "");
      writeFileSync(join(dir, "src", "main.ts"), "");
      // Anchor = the main document's dir (resolveJumpTarget's semantics)
      const v = makePathValidator(join(dir, "docs", "doc.md"));
      expect(v("sibling.ts")).toBe(true); // doc-relative: docs/sibling.ts
      expect(v("src/main.ts")).toBe(false); // neither dir/docs/ nor repo cwd carries it
      // Unanchored (no main file): cwd-relative only — the launcher's picker.
      // The repo cwd carries src/vectors.ts (house style: root.test.ts
      // already reads the real registries at cwd).
      const cwdV = makePathValidator();
      expect(cwdV("src/vectors.ts")).toBe(true);
      expect(cwdV("no/such/file.ts")).toBe(false); // the fs gate: phantoms retract
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
