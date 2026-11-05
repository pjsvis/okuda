#!/usr/bin/env bun
/**
 * family.ts — the products this tree ships, derived.
 *
 * ADR-EXPORT-SURFACE-082: the core's public surface is what the product
 * entries import, observed rather than declared. This reads the tree and
 * prints the family — the compiled binaries (from the justfile's compile
 * recipes), the npm packages (from their manifests), and each binary's
 * imports from the core (`src/`).
 *
 * Nothing here is hand-maintained. `--write` regenerates FAMILY.md; `--gate`
 * fails when the file no longer matches the tree — a product with no row, or
 * a row that moved. The default prints to stdout.
 *
 * A regex, not a parser, wherever reading is cheap: this is a manifest, and
 * the gate compares the reading to itself, so a missed import is a narrower
 * claim, not a wrong one. tsc still proves the imports.
 *
 * Usage: bun scripts/family.ts [--write|--gate]
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const DOC = resolve(ROOT, "FAMILY.md");

interface Product {
  name: string;
  kind: "binary" | "package";
  entry: string; // repo-relative entry file, or the package directory
  recipe: string; // the justfile recipe that builds it, or "—"
  version: string; // the package's own version, or "—"
  core: string[]; // repo-relative core files the entry imports (binaries only)
}

/** The compiled binaries, from the justfile's `--outfile` compile lines. */
function binaries(): Product[] {
  const lines = readFileSync(resolve(ROOT, "justfile"), "utf8").split("\n");
  const out: Product[] = [];
  lines.forEach((line, i) => {
    const m = line.match(/bun build --compile\b.*?\s(\S+\.(?:tsx?|js))\s--outfile\s+(\S+)/);
    if (!m) return;
    const entry = m[1]!;
    // The recipe is the nearest header above the compile line.
    let recipe = "—";
    for (let j = i; j >= 0; j--) {
      const h = lines[j]!.match(/^([a-z][\w-]*):/);
      if (h) {
        recipe = h[1]!;
        break;
      }
    }
    out.push({ name: m[2]!, kind: "binary", entry, recipe, version: "—", core: coreImports(entry) });
  });
  return out;
}

/** The npm packages, from their own manifests — root first, then `packages/`. */
function packages(): Product[] {
  const roots = ["."];
  const pkgsDir = resolve(ROOT, "packages");
  if (existsSync(pkgsDir)) {
    for (const d of readdirSync(pkgsDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (d.isDirectory() && existsSync(resolve(pkgsDir, d.name, "package.json"))) roots.push(`packages/${d.name}`);
    }
  }
  return roots.map((dir) => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, dir, "package.json"), "utf8"));
    return { name: pkg.name, kind: "package" as const, entry: dir, recipe: "—", version: pkg.version, core: [] };
  });
}

/** Every relative `from "<path>"` that resolves into `src/` — the observed
 *  surface. A bare specifier (`node:fs`, a package) is never the core; the
 *  extension is normalised away, because it is the file that is the claim. */
function coreImports(entry: string): string[] {
  const file = resolve(ROOT, entry);
  if (!existsSync(file)) return [];
  const srcRoot = resolve(ROOT, "src") + "/";
  const found = new Set<string>();
  for (const m of readFileSync(file, "utf8").matchAll(/from\s+["']([^"']+)["']/g)) {
    const spec = m[1]!;
    if (!spec.startsWith(".")) continue; // a bare specifier is not the core
    const r = resolve(dirname(file), spec);
    if (r.startsWith(srcRoot)) found.add(relative(ROOT, r).replace(/\.tsx?$/, ""));
  }
  return [...found].sort();
}

function render(products: Product[]): string {
  const tick = (s: string) => `\`${s}\``;
  const rows = products.map(
    (p) =>
      `| ${tick(p.name)} | ${p.kind} | ${tick(p.entry)} | ${p.recipe === "—" ? "—" : tick(p.recipe)} | ${p.version} |`,
  );
  const coreRows = products
    .filter((p) => p.kind === "binary")
    .map((p) => `| ${tick(p.name)} | ${p.core.length ? p.core.map(tick).join(", ") : "—"} |`);
  return `# FAMILY — the products this tree ships

> Derived by \`scripts/family.ts\` from the justfile, the package manifests, and
> each product's own imports. **Do not hand-edit** — \`just check\` runs
> \`family.ts --gate\` and fails when a product has no row, or a row that moved.

The public surface of the core (\`src/\`) is a contract by fact, not by
declaration (ADR-EXPORT-SURFACE-082): it is what the product entries import.
Adding an import is additive; removing or changing one a product imports is a
breaking change.

## Products

| Product | Kind | Entry | Recipe | Version |
|---|---|---|---|---|
${rows.join("\n")}

## What each binary imports from the core

| Binary | Core files |
|---|---|
${coreRows.join("\n")}
`;
}

const products = [...binaries(), ...packages()];
const content = render(products);
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--gate") ? "gate" : "print";

if (mode === "print") {
  process.stdout.write(content);
} else if (mode === "write") {
  writeFileSync(DOC, content);
  console.log(`family: wrote ${relative(ROOT, DOC)} — ${products.length} product(s)`);
} else {
  if (!existsSync(DOC)) {
    console.error(`family: ${relative(ROOT, DOC)} is missing — run \`just family --write\``);
    process.exit(1);
  }
  if (readFileSync(DOC, "utf8") !== content) {
    console.error(
      `family: ${relative(ROOT, DOC)} is stale — the tree moved and the manifest did not. Run \`just family --write\`.`,
    );
    process.exit(1);
  }
  const bins = products.filter((p) => p.kind === "binary").length;
  console.log(`family: OK — ${products.length} product(s), ${bins} binary(ies) against the core`);
}
