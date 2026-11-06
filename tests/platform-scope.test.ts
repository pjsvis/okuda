import { describe, expect, test } from "bun:test";
import { foreignManifests, scopeOf } from "../scripts/platform-packages";

describe("the family's scope is declared once (ADR-SCOPE-FAMILY-087)", () => {
  test("the declared scope is the answer", () => {
    expect(scopeOf({ name: "okuda", family: { scope: "polyvis" } })).toBe("polyvis");
  });

  test("a scoped root name must agree with the declaration — one of them is a leftover", () => {
    // this is the state the rename lands in: the root package moves under the
    // scope, and from then on its own name is the source of truth
    expect(scopeOf({ name: "@polyvis/okuda", family: { scope: "polyvis" } })).toBe("polyvis");
    expect(() => scopeOf({ name: "@okuda/okuda", family: { scope: "polyvis" } })).toThrow(/disagrees/);
  });

  test("an undeclared scope is a loud failure, not an empty prefix", () => {
    expect(() => scopeOf({ name: "okuda" })).toThrow(/declared once/);
    expect(() => scopeOf({ name: "okuda", family: { scope: "  " } })).toThrow(/declared once/);
  });

  test("a manifest under a foreign scope is named, with its path", () => {
    const manifests = [
      { path: "packages/testcard/package.json", name: "@polyvis/testcard" },
      { path: "packages/platform/okuda-linux-x64/package.json", name: "@okuda/okuda-linux-x64" },
    ];
    expect(foreignManifests("polyvis", manifests)).toEqual([
      'packages/platform/okuda-linux-x64/package.json: "@okuda/okuda-linux-x64" is not under @polyvis/',
    ]);
    expect(foreignManifests("polyvis", [manifests[0]!])).toEqual([]);
  });
});
