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
 *   canon, 2026-09-12; 88 bound 2026-10-05):
 *   01-10  verbs and modes — what the instance DOES
 *   00,11,22,…,99  the doubled pairs — one actuator class (00 exit,
 *          88 edit and 99 clone bound; the rest the pocket); never jumps
 *   mixed digits 12-98 — what the instance SHOWS (the silcrows)
 *
 * The bindings are a TABLE, not code: the numbers may move as the
 * fingers learn them, and moving one is a one-line edit here — never a
 * change to the dispatch. Unassigned reserved tokens (`04`-`10`, freed
 * 2026-10-05 when the edit verb moved to 88) resolve to null and flash
 * nothing; they are reserved, not missing.
 */

import { DOUBLED_PAIRS, VECTOR_MIN, VECTOR_MAX } from "./vectors";

export type Verb =
  | "exit"
  | "frame"
  | "slide"
  | "freeze"
  | "edit"
  | "clone"
  | "vector";

/** The bindings: token → verb. Data, by intent — renumber freely. */
export const KEYBINDINGS: Record<number, Verb> = {
  0: "exit", // 00 — double-tap the easiest key
  1: "frame", // 01 — frame/okudagram mode (needs BRF-PAGED-OKUDAGRAM)
  2: "slide", // 02 — sliding mode (today's default, named)
  3: "freeze", // 03 — the document stays still (auto-re-render off)
  88: "edit", // 88 — THIS document, in the editor (the pair to 99)
  99: "clone", // 99 — THIS document, made main of a new instance
};

/** Read-only mode (BRF-ROOT-CONTAINMENT): `OKUDA_READONLY=1` retires
 *  the spawn verbs — `88`/`99` flash instead of spawning or computing
 *  a write path. A declaration, like the bindings: the demo wrapper
 *  sets it, the actuators obey it. Pure-ish (reads env). */
export function readOnlyActive(): boolean {
  return process.env.OKUDA_READONLY === "1";
}

/** Reduce a completed two-digit token to its verb. Returns `"vector"`
 *  for the address range, `null` for reserved-unassigned tokens (the
 *  press is acknowledged and does nothing — reserved, not missing).
 *  The doubled pairs (ADR-032, canonized 2026-09-12 — one actuator
 *  class, never jumps) all resolve to null unless bound: 00/88/99 via
 *  their bound verbs in the table, 11 and {22,…,77} via the class Set.
 *  The question is "is this a doubled pair?", never "is it in range" —
 *  a floor change cannot turn an actuator into a vector. The boundaries
 *  are read from the constants, never retyped here. Pure. */
export function verbFor(token: number): Verb | "vector" | null {
  const verb = KEYBINDINGS[token];
  if (verb) return verb;
  if (DOUBLED_PAIRS.has(token)) return null; // ADR-032: the class, bound or not
  if (token >= VECTOR_MIN && token <= VECTOR_MAX) return "vector";
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
    // Vim's section motions, `]]` and `[[`, ride whole: a single bracket
    // stays a single event, the pair is one key event (BRF-OKUDAGRAM-STEP).
    // The lexer's job ends at keeping the pair together — `decodeKey` maps
    // it to frame-down/frame-up (tui.ts) and the TUI performs the declared
    // header-to-header jump via `snapFrame(headingLines(...))` (frames.ts).
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
