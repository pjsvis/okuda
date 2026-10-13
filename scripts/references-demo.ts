#!/usr/bin/env bun
/**
 * references-demo.ts — the References section, made visible.
 *
 * A document ends with one section listing every reference it used,
 * ordered by **act distance**: what the reader can act on first, what
 * they can only name last. Three tiers —
 *
 *   1. silcrowed  — two keystrokes (callsigns and local `.md` links)
 *   2. external   — beyond the silo's reach (URLs are in no map, so
 *                   they are *less* reachable than a bare path)
 *   3. in-silo, unaddressed — the bibliography; the path is enough
 *
 * The fixture also shows the two things the convention has to survive:
 *
 *   - **the gap.** Numbers are minted in reading order, so a body
 *     citation takes its number before the section at the end ever
 *     gets one. The section does not start at 12, and it should not
 *     be renumbered to hide that: a low number deep in the document
 *     means "you have seen this name before".
 *   - **the split.** The badge is injected at the end of the matched
 *     span. When a callsign sits *inside* the path, the badge lands
 *     mid-filename and strands the extension. The callsign belongs
 *     after the path, never inside it.
 *
 * Ephemeral — never registered, never a brief. The environment
 * composing (filesystem as the message bus), not okuda (ADR-020).
 *
 * Usage:
 *   bun scripts/references-demo.ts          # fixture markdown to stdout
 *   bun scripts/references-demo.ts --map    # the derived map, as text
 *   just references-demo                    # generate + frame in the TUI
 */

import { scanReferences, jumpMapFor, referencesSection, MAX_ADDRESSES, VECTOR_MIN } from "../src/vectors";

/** The fixture. Every path is real and every callsign resolves, so the
 *  silcrows actuate — the demo is the corpus, not a mock of it. Pure.
 *  Exported for the dogfood test (td-3562fe): the fixture asserts the
 *  generated section lists every map destination. */
export function buildFixture(): string {
  return [
    "# References section — the demo",
    "",
    "**Type:** demo fixture (ephemeral — never registered, never a brief)",
    "**Generated:** `scripts/references-demo.ts` — do not edit by hand",
    "**Regenerate:** `just references-demo`",
    "",
    "> The section at the end of a document that lists every file it",
    "> referenced. It opens with the callsigned files and closes with the",
    "> local file links — the two address shapes. The numbers are minted in",
    "> reading order, so this document also shows what that costs.",
    "",
    "## 1. The body citations claim the low numbers",
    "",
    "Two references are cited here and nowhere in the list below. They take",
    "the first two numbers, so the References section cannot open at the",
    "floor — and it should not pretend to.",
    "",
    "- **ADR-034** — no unnecessary rubrication: one signal is enough, and a",
    "  second signal announcing the first is decorated Stuff.",
    "- **BRF-CENSUS-MODE** — the opt-in census, which refuses exactly one",
    "  thing: authoring-convention pressure.",
    "",
    "This paragraph also *mentions* `docs/2026-09-04-the-silcrow.md` as a",
    "bare path. Watch it: the mention stays unpainted, and the same file",
    "enters the map only where the References section links it. A bare path",
    "is a mention; a link is a use; the promotion is scoped to the section",
    "whose whole job is to enumerate.",
    "",
    "## 2. References",
    "",
    "### Actuable — the callsigned files",
    "",
    "- **ADR-032** — the actuator pocket; the doubled pairs are one class,",
    "  never jumps, zero exceptions.",
    "- **BRF-TTS-STEPPER** — the clean citation shape: path first, callsign",
    "  after it, badge trailing the name.",
    "- **BRF-TTS-TEMPORAL** — the pause table, thinned by the rubrication",
    "  decision above.",
    "",
    "### Named — beyond the silo's reach",
    "",
    "- **fzf issue #412** — the `|` OR operator in `--exact`, closed 2015,",
    "  v0.11.0. A URL is in no jump map: it has no address here, so it is",
    "  less reachable than a bare path you can dive by typing it.",
    "  https://github.com/junegunn/fzf/issues/412",
    "",
    "### Actuable — the local file links",
    "",
    "- [the silcrow explainer](docs/2026-09-04-the-silcrow.md)",
    "- [the use-vs-mention adjudication](docs/2026-09-10-use-vs-mention.md)",
    "- [the authoring playbook](playbooks/authoring-playbook.md)",
    "",
    "Written as links, these take silcrows — and only here. The label is a",
    "noun phrase because the renderer paints a link as `label url`, so the",
    "path is displayed whether the label repeats it or not; naming the",
    "thing reads better than stuttering the path.",
    "",
    "## 3. Citation forms — what each shape costs",
    "",
    "### Callsign inside the path — the badge splits the filename",
    "",
    "- `advisories/ADV-READER-SIDE-FILTER.md` — the callsign is part of the",
    "  path, so the badge is injected mid-filename and the extension is",
    "  stranded after it.",
    "",
    "### Callsign after the path — the badge trails the name",
    "",
    "- `briefs/2026-09-10-brief-tts-stepper.md` (BRF-TTS-STEPPER) — the path",
    "  carries no callsign, so the badge lands outside it and the row reads",
    "  whole. This is the shape to write.",
    "",
    "### The filename as the link label — the path is painted twice",
    "",
    "- [2026-09-04-the-silcrow.md](docs/2026-09-04-the-silcrow.md) — the",
    "  label is the basename and the renderer still displays the target, so",
    "  the name arrives twice. The noun phrase above is the way out.",
    "",
    "## The one line",
    "",
    "Order by address shape; keep the callsign out of the path; the gaps are",
    "the signal, not the damage; and once the addresses run out the file",
    "paths themselves are enough.",
    "",
  ].join("\n");
}

/** Print the derived map and the GENERATED References section, and
 *  assert the receipt lists every destination (td-3562fe, ADR-047): a
 *  hand-written section omitted a third (six of nine); generation
 *  cannot. The fixture's own hand-written section stays in its text as
 *  the retired convention's specimen — the demo now shows the receipt.
 *  (The brief's "nine" is now ten: Ring A, ADR-045, minted the demo's
 *  own generator path after the brief was written — the assertion
 *  targets the invariant, every destination listed, not the count.) */
function reportMap(source: string): void {
  const occurrences = scanReferences(source);
  const map = jumpMapFor(source);
  const section = referencesSection(map).replace(/%okuda-vector:(\d+)%/g, "§$1");
  const listed = new Set(
    section
      .split("\n")
      .map((l) => l.replace(/^§\d+ /, ""))
      .filter((l) => l !== "" && l !== "## References"),
  );
  const missing = [...map.values()].filter((t) => !listed.has(t));

  console.log(`references-demo — ${occurrences.length} occurrences, ${map.size} destinations`);
  console.log(`floor ${VECTOR_MIN} · cap ${MAX_ADDRESSES} addresses · the generated section (ADR-047):`);
  console.log("");
  console.log(section);
  console.log("");
  console.log("the map:");
  for (const [n, target] of [...map].sort((a, b) => a[0] - b[0])) {
    console.log(`  §${n} → ${target}`);
  }
  const ok = missing.length === 0;
  console.log(`assert: the generated section lists ${listed.size} of ${map.size} — ${ok ? "OK" : "FAIL"}`);
  if (!ok) {
    console.error(`references-demo: missing from the generated section: ${missing.join(", ")}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  const fixture = buildFixture();
  if (process.argv.includes("--map")) reportMap(fixture);
  else console.log(fixture);
}
