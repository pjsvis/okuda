#!/usr/bin/env bun
/**
 * platform-packages.ts — the platform matrix, derived.
 *
 * BRF-PLATFORM-PACKAGES. The family's binaries ride npm as per-platform payload
 * packages under `@okuda`, and a main package's `bin` shims over whichever one
 * installed. The PRODUCTS come from FAMILY.md (the derived manifest); the
 * PLATFORMS are the explicit deployment matrix — a fact about hosts, not a
 * reading of the repo.
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

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const SCOPE = "okuda";
const OUT = resolve(ROOT, "packages/platform");

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

const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));

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
  if (fail) process.exit(1);
  console.log(`platform-packages: OK — ${entries.length} manifest(s) match the matrix`);
}
