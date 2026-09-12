/**
 * keygrammar.ts — the two-digit keyboard grammar as data (ADR-031,
 * keyboard-controls 2026-09-05).
 *
 * This file is a grammar and some actuators. Keep them consistent
 * throughout time; recover if things go wrong (re-derivation is always
 * available — nothing here is state). There is no messy state to deal
 * with: just the system invariants and the inescapable side effects,
 * which live in the actuators, at the edge, visibly.
 *
 * The two-digit space has three zones, one per actuator type (the
 *   canon, 2026-09-12):
 *   01-10  verbs and modes — what the instance DOES
 *   00,11,22,…,99  the doubled pairs — one actuator class (00 exit,
 *          99 clone bound; the rest the pocket); never jumps
 *   mixed digits 12-98 — what the instance SHOWS (the silcrows)
 *
 * The bindings are a TABLE, not code: the numbers may move as the
 * fingers learn them, and moving one is a one-line edit here — never a
 * change to the dispatch. Unassigned reserved tokens (`04`–`08`, `10`
 * if freed) resolve to null and flash nothing; they are reserved, not
 * missing.
 */

import { RESERVED_VECTORS } from "./vectors";

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
 *  The doubled pairs {11,22,33,44,55,66,77,88} (ADR-032, canonized
 *  2026-09-12 — one actuator class, never jumps) are reserved for
 *  future double-tap verbs and resolve to null until bound. Pure. */
export function verbFor(token: number): Verb | "vector" | null {
  if (token === 99) return "clone";
  const verb = KEYBINDINGS[token];
  if (verb) return verb;
  if (RESERVED_VECTORS.has(token)) return null; // ADR-032 actuator pocket
  if (token >= 11 && token <= 98) return "vector";
  return null;
}

/** Split a raw stdin read into key events: the four supported escape
 *  sequences ride as single multi-byte events, everything else is a
 *  single-byte event. Burst-safe: a pasted "12" yields two presses,
 *  not one swallowed byte. Pure. */
export function splitKeyEvents(bytes: Uint8Array): Uint8Array[] {
  const events: Uint8Array[] = [];
  let i = 0;
  while (i < bytes.length) {
    if (bytes[i] === 0x1b && bytes[i + 1] === 0x5b) {
      const c = bytes[i + 2];
      if (c !== undefined && c >= 0x41 && c <= 0x44) {
        events.push(bytes.slice(i, i + 3)); // ESC [ A–D
        i += 3;
        continue;
      }
      if (c !== undefined && (c === 0x35 || c === 0x36) && bytes[i + 3] === 0x7e) {
        events.push(bytes.slice(i, i + 4)); // ESC [ 5~ / 6~
        i += 4;
        continue;
      }
    }
    // Vim's section motions ride whole: `]]` and `[[` (BRF-
    // OKUDAGRAM-STEP — the declared header-to-header jump). A single
    // bracket stays a single event; the pair is one key event, burst-
    // safe like the escape sequences.
    if ((bytes[i] === 0x5d || bytes[i] === 0x5b) && bytes[i] === bytes[i + 1]) {
      events.push(bytes.slice(i, i + 2));
      i += 2;
      continue;
    }
    events.push(bytes.slice(i, i + 1));
    i += 1;
  }
  return events;
}
