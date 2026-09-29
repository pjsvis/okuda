/**
 * onion.ts — the staged query pipeline's pure layers (BRF-ONION-
 * SEARCH-GRAMMAR). Each layer owns one concern and knows nothing of
 * the layers below it:
 *
 *   Layer 0 — the candidate set (launcher: rg --files, exclusions)
 *   Layer 1 — path predicates (@date, dir/) — THIS FILE, pure
 *   Layers 2-4 — registry > body > remainder channels — THIS FILE,
 *              pure given the channel deps (the rg-backed deps live
 *              in launcher.ts; fs is an edge concern, never a layer)
 *   Layer 5 — fzf --exact (unchanged)
 *
 * The grammar routes predicates to layers; the layers do not parse.
 * A token is path-shaped (`@YYYY-MM`, `@YYYY-MM-DD`, `dir/`, `/dir`)
 * or it is a content word; `!` routes to the same layer as its
 * operand. Property-testable throughout — no fs, no rg, no spawn.
 *
 * Layer-1 scope (the contract tests are the arbiter): @date is a
 * GLOBAL filter (AND over the whole query) — `@2026-09 debriefs/ |
 * decisions/` dates every clause, which is what the smoke query meant
 * (the original parens grouped the dirs; the date scoped everything).
 * Directories AND within a clause, OR across clauses. Negations are
 * global (exclusion is exclusion). The one expressiveness lost: per-
 * clause dates — elision ladder, no real query has asked.
 */

/** A Layer-1 negation: `!@date` or `!dir/` — a pure `path => boolean`
 *  with a name. Positive predicates decompose into the global `dates`
 *  and the clause `dirs` (see RoutedQuery); negations stay whole. Globs,
 *  not regexes (the brief's ladder): promote only when dogfood asks. */
export type PathPredicate =
  | { kind: "date"; date: string }
  | { kind: "dir"; dir: string };

/** One OR-alternative. Dirs AND within the clause (intersection —
 *  rare but honest); content words form a phrase (bodyPattern's
 *  bounded-gap join, the landed semantic — stricter than AND, refined
 *  further by fzf --exact). */
export interface RoutedClause {
  dirs: string[];
  content: string[];
}

/** The routed query. Dates are global scope (AND everywhere); path
 *  negations and content negations are global kills. */
export interface RoutedQuery {
  clauses: RoutedClause[];
  dates: string[];
  pathNegations: PathPredicate[];
  contentNegations: string[];
}

/** The sigil with ONE shape: `@YYYY-MM` or `@YYYY-MM-DD`, nothing
 *  else. A sigil with any shape would be a second grammar inside the
 *  grammar (elision ladder: ship two shapes, let dogfood ask). */
const RE_DATE = /^@(\d{4}-\d{2}(?:-\d{2})?)$/;

/** Classify one (de-negated) token: path-shaped or content. Pure. */
function classify(token: string): { layer: "path" | "content"; pred?: PathPredicate } {
  const m = token.match(RE_DATE);
  if (m) return { layer: "path", pred: { kind: "date", date: m[1]! } };
  if (token.length > 1 && token.endsWith("/")) {
    return { layer: "path", pred: { kind: "dir", dir: token.replace(/\/+$/, "") } };
  }
  if (token.length > 1 && token.startsWith("/")) {
    return { layer: "path", pred: { kind: "dir", dir: token.replace(/^\/+/, "") } };
  }
  return { layer: "content" };
}

/** The grammar (parseQuery v2 — the classification IS the routing):
 *
 *   query     := clause ("|" clause)*
 *   clause    := predicate (" " predicate)*     // AND within
 *   predicate := pathpred | contentpred | negate
 *   pathpred  := "@" date | "/" dir | dir "/"   // → Layer 1
 *   contentpred := word | phrase                // → Layer 3
 *   negate    := "!" pathpred | "!" contentpred // → operand's layer
 *
 * `dir/` is a path, bare `dir` is content — the rule is stated, never
 * inferred from whether it matches a real directory (magic is where
 * the glued-alternative defect came from). `@foo` (sigil, wrong shape)
 * falls to content. Dates hoist to the global scope; dirs stay in
 * their clause. Empty clauses (consecutive `|`, negation-only
 * fragments) are dropped — they carried no predicate. Pure. */
export function routeQuery(query: string): RoutedQuery {
  const clauses: RoutedClause[] = [];
  const dates: string[] = [];
  const pathNegations: PathPredicate[] = [];
  const contentNegations: string[] = [];
  for (const raw of query.split("|")) {
    const clause: RoutedClause = { dirs: [], content: [] };
    for (const token of raw.split(/\s+/).filter(Boolean)) {
      const negated = token.startsWith("!");
      const body = negated ? token.slice(1) : token;
      if (!body) continue; // a lone `!` (empty operand) is nothing
      const c = classify(body);
      if (c.layer === "path" && c.pred) {
        if (!negated && c.pred.kind === "date") dates.push(c.pred.date);
        else if (negated) pathNegations.push(c.pred);
        else clause.dirs.push(c.pred.dir);
      } else {
        (negated ? contentNegations : clause.content).push(body);
      }
    }
    clauses.push(clause);
  }
  return {
    clauses: clauses.filter((c) => c.dirs.length > 0 || c.content.length > 0),
    dates,
    pathNegations,
    contentNegations,
  };
}

/** Match one predicate against one path. `date` matches the FILENAME
 *  (docs/2026-08-26-…md carries its date in the slug); `dir` is a
 *  path prefix (briefs/ owns briefs/*). Pure. */
export function matchPathPredicate(pred: PathPredicate, path: string): boolean {
  if (pred.kind === "date") {
    const name = path.slice(path.lastIndexOf("/") + 1);
    return name.includes(pred.date);
  }
  return path.startsWith(`${pred.dir}/`);
}

/** Layer 1 — narrow the candidate set in memory. Dates AND globally
 *  (the query's scope); dirs AND within a clause and OR across
 *  clauses; negations kill globally. A clause with no dirs matches
 *  every path (its narrowing is content's, at Layer 3). No clauses at
 *  all → unconstrained (a negation- or date-only query is still a
 *  query). Pure. */
export function applyPathPredicates(
  candidates: string[],
  clauses: Array<{ dirs: string[] }>,
  dates: string[],
  negations: PathPredicate[],
): string[] {
  const basename = (p: string): string => p.slice(p.lastIndexOf("/") + 1);
  const dateOk = (p: string): boolean => dates.every((d) => basename(p).includes(d));
  const negated = (p: string): boolean => negations.some((n) => matchPathPredicate(n, p));
  const dirOk = (p: string): boolean =>
    clauses.length === 0 || clauses.some((c) => c.dirs.every((d) => p.startsWith(`${d}/`)));
  return candidates.filter((p) => dateOk(p) && !negated(p) && dirOk(p));
}

/** One channel hit: a surviving path plus its display evidence
 *  (registry: callsign — summary; body: the matching line). Evidence
 *  arrives pre-clipped (ADR-028) — the budget is the launcher's edge. */
export interface ChannelHit {
  path: string;
  evidence: string;
}

/** The channel deps — the onion's only door to the outside. rg-backed
 *  in the launcher; fake in the tests. Each dep receives the Layer-1
 *  survivors, so no channel ever sees the raw corpus. */
export interface OnionDeps {
  /** Layer 2 — registry rows (callsign-anchored) matching a clause's
   *  content query, among the survivors. */
  registryHitsFor(clauseQuery: string, survivors: string[]): ChannelHit[];
  /** Layer 3 — body matches (the evidence line) for a clause's content
   *  query, among the survivors. */
  bodyHitsFor(clauseQuery: string, survivors: string[]): ChannelHit[];
  /** Layer-3 exclude-by-result: survivors whose bodies mention the
   *  negated term. (Path negation is Layer 1 — two mechanisms, two
   *  layers, two semantics.) */
  contentMentions(term: string, survivors: string[]): string[];
}

/** Layers 2-4: the ranked merge over the survivors. Registry before
 *  body before remainder; the first channel to find a path carries
 *  its evidence; the dive suppresses root files (the shelf owns them);
 *  content negations remove a path from every channel. Pure given
 *  deps — the ranking is the composition, the deps are the edges. */
export function onionMerge(candidates: string[], routed: RoutedQuery, deps: OnionDeps): ChannelHit[] {
  const survivors = applyPathPredicates(candidates, routed.clauses, routed.dates, routed.pathNegations);
  const survivorSet = new Set(survivors);
  const isRoot = (p: string): boolean => !p.includes("/");
  const excluded = new Set<string>();
  for (const term of routed.contentNegations) {
    for (const p of deps.contentMentions(term, survivors)) excluded.add(p);
  }
  const registry: ChannelHit[] = [];
  const body: ChannelHit[] = [];
  const seen = new Set<string>();
  const take = (hit: ChannelHit, into: ChannelHit[]): void => {
    if (!survivorSet.has(hit.path) || excluded.has(hit.path) || isRoot(hit.path)) return;
    if (seen.has(hit.path)) return; // first channel wins the row and the evidence
    seen.add(hit.path);
    into.push(hit);
  };
  for (const clause of routed.clauses) {
    if (clause.content.length === 0) continue;
    for (const hit of deps.registryHitsFor(clause.content.join(" "), survivors)) take(hit, registry);
  }
  for (const clause of routed.clauses) {
    if (clause.content.length === 0) continue;
    for (const hit of deps.bodyHitsFor(clause.content.join(" "), survivors)) take(hit, body);
  }
  const remainder: ChannelHit[] = survivors
    .filter((p) => !isRoot(p) && !excluded.has(p) && !seen.has(p))
    .map((p) => ({ path: p, evidence: "" }));
  return [...registry, ...body, ...remainder];
}
