/**
 * keygrammar.ts — the two-digit keyboard grammar as data (ADR-031,
 * keyboard-controls 2026-09-05).
 *
 * The two-digit space has three zones:
 *   00–10  verbs and modes — what the instance DOES
 *   11–98  addresses — what the instance SHOWS (the silcrows)
 *   99     promotion — clone to a new instance
 *
 * The bindings are a TABLE, not code: the numbers may move as the
 * fingers learn them, and moving one is a one-line edit here — never a
 * change to the dispatch. Unassigned reserved tokens (`04`–`08`, `10`
 * if freed) resolve to null and flash nothing; they are reserved, not
 * missing.
 */

export type Verb =
  | "exit"
  | "frame"
  | "slide"
  | "freeze"
  | "editNew"
  | "edit"
  | "clone"
  | "vector";

/** The bindings: token → verb. Data, by intent — renumber freely. */
export const KEYBINDINGS: Record<number, Verb> = {
  0: "exit", // 00 — double-tap the easiest key
  1: "frame", // 01 — frame/okudagram mode (needs BRF-PAGED-OKUDAGRAM)
  2: "slide", // 02 — sliding mode (today's default, named)
  3: "freeze", // 03 — the document stays still (auto-re-render off)
  9: "editNew", // 09 — a blank document, passed the current cwd
  10: "edit", // 10 — edit the current document
  99: "clone", // promotion (ADR-031)
};

/** Reduce a completed two-digit token to its verb. Returns `"vector"`
 *  for the address range, `null` for reserved-unassigned tokens (the
 *  press is acknowledged and does nothing — reserved, not missing).
 *  Pure. */
export function verbFor(token: number): Verb | "vector" | null {
  if (token === 99) return "clone";
  const verb = KEYBINDINGS[token];
  if (verb) return verb;
  if (token >= 11 && token <= 98) return "vector";
  return null;
}
