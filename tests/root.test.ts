import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { detectRoot, presentRegistries } from "../src/root";

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
    // This repo is itself a rooted silo (the dogfood case): all four tiers.
    const here = presentRegistries();
    expect(here.length).toBe(4);
    expect(here).toContain("briefs/INDEX.jsonl");
    expect(here).toContain("decisions/INDEX.jsonl");
    expect(here).toContain("debriefs/INDEX.jsonl");
    expect(here).toContain("playbooks/REGISTRY.jsonl");
  });
});