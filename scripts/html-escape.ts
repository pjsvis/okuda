/**
 * html-escape.ts — the two text transforms the compositor and its passes share.
 *
 * One definition, imported everywhere. `unescapeHtml` was defined twice in
 * `html-package.ts` — identical bodies, the second shadowing the first — which
 * is harmless right up until one copy is edited and the other is not. Found
 * 2026-11-25 while moving the maths pass into its own module and needing both.
 */

/** Text → the HTML that renders it. */
export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** The inverse, for text read back out of generated HTML. A title containing
 *  `&lt;details&gt;` was escaped twice and rendered as `&amp;lt;details&amp;gt;`
 *  — the double-escape, 2026-11-05. */
export function unescapeHtml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}
