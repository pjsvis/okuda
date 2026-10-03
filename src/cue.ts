/**
 * cue.ts — the cue seam: state in, (class, text) out (BRF-AUDIO-DISCOVERY).
 *
 * okuda owns the cue; the environment owns the voice (ADR-036: no speech
 * code in this repo — no engine, no spawn, no voice selection). This
 * seam is the whole of okuda's half: a pure function from what the
 * grammar knows — a pending digit, a resolved token, a focus surface —
 * to a cue class and its text. It is the audio pendant to `flash`
 * (src/tui.ts), the visual actuator receipt — same receipt, second
 * channel, but deriving the text rather than receiving it: the seam
 * knows the state, and state is what a table can test.
 * Pure by construction — no IO, no clock, no audio device; the test is
 * a table. The binding-to-state half (a cue is spoken only if the state
 * it describes still holds) is not here: that is the handle's job, and
 * the seam is stateless by design.
 *
 * THE CANON SPLIT LIVES HERE, IN THE SEAM'S COMMENT, NOT IN DISCIPLINE
 * (ADR-032): doubled = the system talks, mixed = the document moves.
 * Only doubled pairs produce an identity cue — `00` exit, `99` clone,
 * and the pocket {11,…,88} as they bind. The vector space is silent:
 * mixed pairs move the document, which the document itself already
 * shows, and voicing them would chatter the channel — and chatter does
 * not merely annoy, it drowns the alerts (a voice that speaks seldom
 * is a voice that is heard). Mixed verbs (01–10) are silent too,
 * deliberately: their receipt is already `flash`, and one rule with
 * zero exceptions is the canon's whole virtue.
 *
 * THE SEAM IMPLIES NO VOICE AND NO CLOCK. It maps input → (class,
 * text) and class → patience, and stops. No pause constant, no pitch,
 * volume, or rate, no voice name — the cast, the pause, and the engine
 * are the silo's (ADR-033: the voice is the parameter, not the tag).
 * Patience rides the class because it is the one property the channel
 * cannot recover from text alone: pending waits for a hesitation (a
 * cue about stopping should only speak into a stop); identity and mode
 * are immediate (the reader just acted; a focus transition is useless
 * five seconds late).
 */

import { verbFor } from "./keygrammar";

/** The cue classes (BRF-AUDIO-DISCOVERY): everything okuda can
 *  announce. The vocabulary grows here — a refusal, a limit — and the
 *  cast is one rule for all of it, so growing it costs the silo
 *  nothing. */
export type CueClass = "pending" | "identity" | "mode";

/** Patience is a property of the class, never a parameter of the
 *  call: the seam maps `class → (text, patience)` and stops — any
 *  number behind a patience is the silo's, never ours. */
export type Patience = "patient" | "immediate";

export const CUE_PATIENCE: Readonly<Record<CueClass, Patience>> = {
  pending: "patient", // waits for a hesitation — spoken only if the reader stops
  identity: "immediate", // the reader just acted; the receipt is the point
  mode: "immediate", // a focus transition is useless five seconds late
};

/** One cue: its class (which carries the patience and lets the silo
 *  pick a voice) and its text (a word the channel can speak as-is). */
export interface Cue {
  readonly cueClass: CueClass;
  readonly text: string;
}

/** What the grammar knows at cue time — the seam's entire input space. */
export type CueInput =
  | { readonly kind: "pending"; readonly digit: string } // first digit of a pair, token unresolved
  | { readonly kind: "token"; readonly token: number } // a resolved two-digit token
  | { readonly kind: "mode"; readonly surface: "reader" | "launcher" }; // a focus transition

/** Digit words. The pending cue names the digit, never the actuator:
 *  on a lone `9` the actuator is not yet determined, and it would be
 *  wrong nine times out of ten — wrong about the one thing the reader
 *  most needs to know. A word, not a numeral: the channel speaks, and
 *  an engine's numeral reading is not ours to assume. */
const DIGIT_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
];

/** The doubled-pair shape test (ADR-032's canon): tens === ones, in the
 *  two-digit space 0–99 (token 0 is `00`). A shape rule, not a range
 *  rule — the grammar's own organizing principle. */
const isDoubledPair = (token: number): boolean =>
  token >= 0 && token <= 99 && Math.floor(token / 10) === token % 10;

/** The cue seam: input → (class, text), or null for silence. Pure —
 *  the caller owns the emission, the channel owns the sound.
 *
 *  - **pending** names the digit ("nine"), patient. At most one per
 *    pending digit — the caller emits per state change, never per
 *    repaint.
 *  - **token** speaks only for doubled pairs bound to a verb, and the
 *    text is the verb's own name from KEYBINDINGS — the refereed
 *    vocabulary (docs/keymap.md derives from the same table; discovery
 *    and reference are one act). The unbound pocket is silent —
 *    reserved, not missing; it speaks as it binds. Everything mixed
 *    is silent (the canon split, above).
 *  - **mode** names the surface — the reader/launcher boundary, the
 *    focus failure the whole idea grew from; the highest-value cue,
 *    and the one that must not wait.
 */
export function cueFor(input: CueInput): Cue | null {
  switch (input.kind) {
    case "pending": {
      if (!/^[0-9]$/.test(input.digit)) return null; // total: garbage is silence, not error
      return { cueClass: "pending", text: DIGIT_WORDS[Number(input.digit)]! };
    }
    case "token": {
      if (!isDoubledPair(input.token)) return null; // mixed = the document moves = silent
      const verb = verbFor(input.token);
      if (verb === null || verb === "vector") return null; // the pocket — reserved, not missing
      return { cueClass: "identity", text: verb };
    }
    case "mode":
      return { cueClass: "mode", text: input.surface };
  }
}
