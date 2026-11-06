#!/usr/bin/env bun
/**
 * platform-packages.ts — the platform matrix, derived.
 *
 * BRF-PLATFORM-PACKAGES. The family's binaries ride npm as per-platform payload
 * packages under the family's scope, and a main package's `bin` shims over
 * whichever one installed. The PRODUCTS come from FAMILY.md (the derived
 * manifest); the PLATFORMS are the explicit deployment matrix — a fact about
 * hosts, not a reading of the repo. The SCOPE is declared once, in the root
 * manifest's `family.scope`, and every committed manifest is checked against it
 * (ADR-SCOPE-FAMILY-087): six documents carried two different scope names for a
 * day and nothing could see it, which is what a second hand-written name buys.
 *
 * The manifests are COMMITTED and gated, the reg-sync pattern: generated, so a
 * product with no row is a gate failure rather than a silence, and checked in, so
 * a reader can see the matrix without running anything.
 *
 *   --write  regenerates packages/platform/<product>-<platform>/package.json
 *   --check  fails when a committed manifest is missing or stale
 *   default  prints the matrix
 *
 * It does NOT touch the root package.json. The main package's optionalDependencies
 * arrive with the shim that consumes them — declaring them before anything reads
 * them would install binaries the `bin` ignores.
 *
 * Usage: bun scripts/platform-packages.ts [--write|--check]
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const OUT = resolve(ROOT, "packages/platform");

/** A manifest's two fields this file reasons about. */
export interface ManifestName {
  name?: string;
  family?: { scope?: unknown };
}

/** The family's npm scope, from the one place it is declared. Pure.
 *
 *  The scope is a fact about the DESTINATION (like the platform matrix), so it
 *  cannot be derived from the tree — but it can be declared once and checked
 *  everywhere. Once the root package itself moves under the scope, its own name
 *  is the better source, so this asserts the two agree rather than letting them
 *  drift apart in silence. */
export function scopeOf(root: ManifestName): string {
  const declared = root.family?.scope;
  if (typeof declared !== "string" || declared.trim() === "") {
    throw new Error('package.json: "family": { "scope": … } is missing — the npm scope is declared once, there (ADR-SCOPE-FAMILY-087)');
  }
  const name = root.name ?? "";
  if (name.startsWith("@")) {
    const fromName = name.slice(1, name.indexOf("/"));
    if (fromName !== declared) {
      throw new Error(`package.json: family.scope "${declared}" disagrees with the root package name "${name}" — one of them is a leftover`);
    }
  }
  return declared;
}

/** Every committed manifest in the tree must sit under the family's scope. Pure;
 *  the caller does the reading. A foreign name is a leftover, not a preference:
 *  npm names are permanent, so two names published once cannot be un-published. */
export function foreignManifests(scope: string, manifests: { path: string; name: string }[]): string[] {
  return manifests
    .filter((m) => !m.name.startsWith(`@${scope}/`))
    .map((m) => `${m.path}: "${m.name}" is not under @${scope}/`);
}

/** The deployment matrix. npm installs the row whose os/cpu matches the host. */
const PLATFORMS = [
  { id: "darwin-arm64", os: "darwin", cpu: "arm64" },
  { id: "darwin-x64", os: "darwin", cpu: "x64" },
  { id: "linux-x64", os: "linux", cpu: "x64" },
  { id: "linux-arm64", os: "linux", cpu: "arm64" },
] as const;

/** The binaries, read from FAMILY.md's Products table — derived, not listed. */
function products(): string[] {
  const doc = readFileSync(resolve(ROOT, "FAMILY.md"), "utf8");
  const out: string[] = [];
  for (const m of doc.matchAll(/^\|\s*`([^`]+)`\s*\|\s*binary\s*\|/gm)) out.push(m[1]!);
  return out;
}

const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as ManifestName & Record<string, unknown>;
const SCOPE = scopeOf(pkg);

interface Entry {
  product: string;
  id: string;
  os: string;
  cpu: string;
  name: string;
  dir: string;
}
const entries: Entry[] = products().flatMap((product) =>
  PLATFORMS.map((p) => {
    const id = `${product}-${p.id}`;
    return { product, id: p.id, os: p.os, cpu: p.cpu, name: `@${SCOPE}/${id}`, dir: resolve(OUT, id) };
  }),
);

/** The manifest, as a string. The version is the family's — one release, one version. */
function manifest(e: Entry): string {
  return (
    JSON.stringify(
      {
        name: e.name,
        version: pkg.version,
        description: `${e.product} — the compiled binary for ${e.os} ${e.cpu}`,
        license: pkg.license,
        repository: pkg.repository,
        os: [e.os],
        cpu: [e.cpu],
        files: [e.product],
      },
      null,
      2,
    ) + "\n"
  );
}

const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--check") ? "check" : "print";

if (mode === "print") {
  const lines = entries.map((e) => `  ${e.name.padEnd(30)} ${e.os}/${e.cpu}  → ${e.product}`);
  process.stdout.write(`platform packages (${entries.length}) — @${SCOPE}@${pkg.version}\n${lines.join("\n")}\n`);
} else if (mode === "write") {
  for (const e of entries) {
    mkdirSync(e.dir, { recursive: true });
    writeFileSync(resolve(e.dir, "package.json"), manifest(e));
  }
  console.log(`platform-packages: wrote ${entries.length} manifest(s) to packages/platform/`);
} else {
  let fail = 0;
  for (const e of entries) {
    const path = resolve(e.dir, "package.json");
    if (!existsSync(path)) {
      console.error(`platform-packages: missing ${e.name} — run \`just platform-packages --write\``);
      fail = 1;
    } else if (readFileSync(path, "utf8") !== manifest(e)) {
      console.error(`platform-packages: ${e.name} is stale — run \`just platform-packages --write\``);
      fail = 1;
    }
  }
  // every committed manifest in the tree, not just the platform ones
  const committed: { path: string; name: string }[] = [];
  for (const dir of readdirSync(resolve(ROOT, "packages"), { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const walk = (base: string): void => {
      for (const d of readdirSync(base, { withFileTypes: true })) {
        if (d.isDirectory()) walk(resolve(base, d.name));
        else if (d.name === "package.json") {
          const rel = resolve(base, d.name).slice(ROOT.length + 1);
          const m = JSON.parse(readFileSync(resolve(base, d.name), "utf8")) as ManifestName;
          committed.push({ path: rel, name: m.name ?? "(no name)" });
        }
      }
    };
    walk(resolve(ROOT, "packages", dir.name));
  }
  for (const f of foreignManifests(SCOPE, committed)) {
    console.error(`platform-packages: ${f} — a foreign name is a leftover (ADR-SCOPE-FAMILY-087)`);
    fail = 1;
  }
  if (fail) process.exit(1);
  console.log(`platform-packages: OK — ${entries.length} manifest(s) match the matrix, ${committed.length} under @${SCOPE}/`);
}
