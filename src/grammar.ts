/**
 * grammar.ts — the closed Okuda Markdown grammar policy.
 *
 * Contract (brief 002 grammar table + brief 003 module split):
 *  - Bun.markdown parses; Okuda controls layout, spacing, colour, width.
 *  - Rejected elements (HTML, footnotes, task lists, indented code,
 *    images) strip or flatten silently — never an error, never raw markup.
 *
 * This module holds the parser option set and the private string-tag
 * protocol handlers use to shuttle structure through Bun.markdown's
 * string-in/string-out callback API (see decisions/005).
 */

/**
 * Bun.markdown parser options — the closed grammar's parser surface.
 *
 *  - hardSoftBreaks: soft returns honour as line breaks (origin doc).
 *  - tasklists: false — task lists are rejected; checkbox markup stays
 *    literal text in list items (grammar table: "No — treated as
 *    unordered list item").
 *  - noIndentedCodeBlocks: indented code is rejected → plain paragraph.
 */
export const PARSER_OPTIONS = {
  hardSoftBreaks: true,
  tasklists: false,
  noIndentedCodeBlocks: true,
} as const;

/** Inline HTML spans — stripped silently (grammar: Raw HTML → No). */
export const RE_INLINE_HTML = /<\/?[A-Za-z][^<>\n]*>/g;

/**
 * ── String-tag protocol ─────────────────────────────────────────────
 *
 * Bun.markdown (bun 1.3.8) callbacks pass strings only; listItem metadata
 * (index/depth/ordered) is absent from the runtime. Handlers therefore
 * emit private-use tags that container handlers (list, blockquote,
 * paragraph) resolve in post-order — inner blocks resolve before outer.
 * All residual tags are stripped in final document assembly.
 */

/** List item placeholder — the `list` handler assigns markers. */
export const TAG_ITEM = "\u0000I\u0000";

/** Raw block tags protect never-wrapped content during re-wraps. */
export function tagRawOpen(kind: string): string {
  return `\u0000RAW:${kind}\u0000`;
}
export const TAG_RAW_CLOSE = "\u0000/RAW\u0000";

/** Resolved nested list: marker `NL:<depth>` so the parent computes depth. */
export function tagNestedOpen(depth: number): string {
  return `\u0000NL:${depth}\u0000`;
}
export const TAG_NESTED_CLOSE = "\u0000/NL\u0000";

/** Strip every protocol tag from a rendered document. */
export function stripTags(s: string): string {
  return s.replace(/\u0000[^\u0000]*\u0000/g, "");
}

/** Mermaid placeholder paragraph token — survives markdown parsing. */
export function mermaidToken(id: string): string {
  return `%%okuda-mmd-${id}%%`;
}
export const RE_MERMAID_TOKEN = /%%okuda-mmd-([a-z0-9]+)%%/;
