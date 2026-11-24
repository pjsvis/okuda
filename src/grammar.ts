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

/** HTML comments — stripped silently, so compositors can hide jump-resolver
 *  wiring (paths) from the rendered output while `extractJumps` reads it from
 *  source. Comments, and only comments, are stripped inside code: a comment is
 *  markup by definition, and the `text` handler must see it before the table
 *  menu wiring does (`RE_RHS_WIRE`, ADR-RIGHT-ANCHORED-022). */
export const RE_HTML_COMMENT = /<!--[\s\S]*?-->/g;

/** The closed grammar's HTML vocabulary: the tags that ARE markup.
 *
 *  A tag shape is not evidence of markup. `<file>`, `<callsign>`, `<query>` are
 *  placeholders, and `<speak>`/`<prosody>` are SSML in a document *about* SSML —
 *  none of them is HTML, and stripping them is silent data loss. Measured
 *  2026-11-24: 258 tag-shaped tokens in the corpus, ~200 of them placeholders
 *  across 47 documents, plus the entire SSML vocabulary of one; `git mv <file>`
 *  rendered as *git mv ,*. A decision record titled "`:target` over `<details>`
 *  and `<dialog>`" rendered with both tags deleted (td-110cf6).
 *
 *  So the matcher is a vocabulary, not a shape: the renderer strips what the
 *  platform would have parsed, and leaves everything else to the author. A tag
 *  missing from this list renders as text — visible, which is the safe
 *  direction; a placeholder listed here would vanish, which is not. */
const HTML_ELEMENTS = [
  "html", "head", "body", "title", "base", "link", "meta", "style", "script",
  "noscript", "template", "slot", "div", "span", "p", "a", "em", "strong", "b",
  "i", "u", "s", "small", "sub", "sup", "mark", "code", "pre", "kbd", "samp",
  "var", "q", "cite", "abbr", "dfn", "time", "data", "del", "ins", "br", "hr",
  "wbr", "img", "picture", "source", "video", "audio", "track", "iframe",
  "embed", "object", "param", "canvas", "map", "area", "svg", "path", "g",
  "circle", "rect", "line", "polyline", "polygon", "text", "tspan", "defs",
  "use", "ul", "ol", "li", "dl", "dt", "dd", "menu", "table", "caption",
  "thead", "tbody", "tfoot", "tr", "td", "th", "colgroup", "col", "h1", "h2",
  "h3", "h4", "h5", "h6", "hgroup", "header", "footer", "nav", "main", "aside",
  "section", "article", "figure", "figcaption", "blockquote", "details",
  "summary", "dialog", "form", "input", "button", "select", "option",
  "optgroup", "textarea", "label", "fieldset", "legend", "progress", "meter",
  "output", "ruby", "rt", "rp", "bdi", "bdo", "address", "center", "font",
  "marquee", "big", "tt", "strike", "dir", "search",
] as const;

/** A block-level element at the start of a line opens an **HTML block**, which
 *  CommonMark and Bun discard whole (`html()` → null). The pre-pass must leave
 *  those tags for the parser, or stripping them first turns a discarded block
 *  into a paragraph of its text — measured 2026-11-24 on both prose settle
 *  tests, ``<div>`` around a line. The list is CommonMark's own block-start
 *  condition, not a taste. */
export const RE_HTML_BLOCK_TAG = new RegExp(
  `^</?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|` +
    `colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|` +
    `form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|` +
    `main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|search|section|` +
    `summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul|script|style|pre|` +
    `noscript|template|textarea|canvas|video|audio|svg)\\b[^<>\\n]*>`,
  "i",
);

/** An open tag, a close tag or a self-closing tag of a NAMED element. The
 *  `\b` after the alternation is what keeps `<p>` from eating `<param>`. */
export const RE_HTML_TAG = new RegExp(`</?(?:${HTML_ELEMENTS.join("|")})\\b[^<>\\n]*>`, "gi");

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

/** RHS wire tag — a table cell's jump wiring (`<!-- %%okuda-rhs:NN%%
 *  path -->`) survives as this tag instead of being stripped as inline
 *  HTML: the `text` handler emits it, the `td` handler consumes it (the
 *  cell is marked wired), and any residual is swept by `stripTags`.
 *  Wired cells are the menu-pattern declaration — the renderer's cue
 *  that the table is a patterned surface (ADR-022 role fit), not a
 *  generic table. (td-b81597; same convention the paragraph path and
 *  `extractJumps` already key on.) */
export const TAG_RHS_WIRE = "\u0000W\u0000";
export const RE_RHS_WIRE = /^<!--\s*%%okuda-rhs:\d{1,2}%%[^>]*-->$/;

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

/**
 * Structural probe tags — list call identity for the width probe pass.
 * Bun.markdown is post-order: a nested list renders before its parent
 * fires, so ancestry can't reach it in one pass. The probe renders once
 * with list handlers swapped for these tags; a parent's children then
 * name its descendants, and the containment chain yields each list's
 * true depth (see render.ts probeListDepths). Probe tags never reach
 * the final document — probe output is discarded.
 */
export function tagProbeOpen(id: number): string {
  return `\u0000PB:${id}\u0000`;
}
export const TAG_PROBE_CLOSE = "\u0000/PB\u0000";
export const RE_PB_TAG = /\u0000PB:(\d+)\u0000/;

/** Strip every protocol tag from a rendered document. */
export function stripTags(s: string): string {
  return s.replace(/\u0000[^\u0000]*\u0000/g, "");
}

/** Mermaid placeholder paragraph token — survives markdown parsing. */
export function mermaidToken(id: string): string {
  return `%%okuda-mmd-${id}%%`;
}
export const RE_MERMAID_TOKEN = /%%okuda-mmd-([a-z0-9]+)%%/;

/** Described diagram placeholder — survives markdown parsing.
 *  The `describe` tag on a mermaid fence routes to diagram-describe
 *  instead of mermaid-to-md (BRF-DIAGRAM-DESCRIBE). */
export function describedToken(id: string): string {
  return `%%okuda-dsc-${id}%%`;
}
export const RE_DESCRIBED_TOKEN = /%%okuda-dsc-([a-z0-9]+)%%/;

/** Coloured code-fence placeholder paragraph token — survives markdown
 * parsing, resolves to the chroma-painted fence (BRF-FENCE-COLOUR). */
export function codeToken(id: string): string {
  return `%%okuda-code-${id}%%`;
}
export const RE_CODE_TOKEN = /%%okuda-code-([a-z0-9]+)%%/;

/** RHS number token — a trailing `%%okuda-rhs:NN%%` in a paragraph marks
 *  a one-line list item: the slug renders left, truncated to fit, the
 *  number renders bold at the RHS (the action follows the content). The
 *  compositor emits it; the paragraph handler renders the line;
 *  `extractJumps` reads the number from source. (brief: index-and-jump.) */
export const RE_RHS_TOKEN = /%%okuda-rhs:(\d{1,2})%%/;
