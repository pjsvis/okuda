---
type: Playbook
callsign: PLY-GREP
---

# Grep Playbook — the probe instrument, and its two traps

grep is the instrument of first resort when probing logs, sources, and
captured output. On macOS/BSD its defaults carry two traps that fail the
same way: **silence**. Exit 1, no output — indistinguishable, at a glance,
from "no matches". Silence from a probe is not evidence of absence.

## Trap 1 — BRE: the default dialect treats operators as literals

Default grep speaks **BRE** (Basic Regular Expressions). In BRE,
metacharacters like `+`, `?`, `|`, `(`, `)`, `{`, `}` are **literal
text**. `grep '[0-9]+'` searches for a digit followed by a literal plus.
`grep '(a|b)'` searches for literal parentheses. The pattern you meant
returns nothing, and nothing reads as "absent" — the exit code says 1
(no match), not 2 (error), so the failure is camouflaged as a result.

**Protocol:**

1. Always use `grep -E` (ERE) for operator-bearing patterns — the
   metacharacters work unescaped (`grep -E '[0-9]+'`).
2. `grep -P` (PCRE — `\d`, `\w`, lookarounds) is GNU-only; BSD grep
   rejects it. Do not reach for it in a portability-sensitive silo.
3. Escaping in BRE (`grep '[0-9]\+'`) is legal but error-prone — prefer
   `-E` for readability and portability alike.
4. `rg` (ripgrep), when available, is the better default: operator
   semantics without a dialect flag, and honest about binary files.

## Trap 2 — bytes: BSD grep aborts on non-UTF-8

Rendered TUI logs carry truecolor ANSI escape bytes; adjacent bytes can
form invalid UTF-8, and BSD grep then aborts — `illegal byte sequence`
on stderr, nothing on stdout. A *probe failure* masquerading as a null
result (glass session, 2026-09-30: the vectors.ts fence hunt, three
`LC_ALL=C` recoveries in one investigation).

**Protocol:**

1. Probe ANSI-laden or captured-binary logs with `LC_ALL=C grep ...` —
   byte mode; the log is bytes, not prose.
2. Or `grep -a` to treat the file as text despite detected binary.
3. Watch stderr — the abort is announced there, nowhere else.

## The positive-control rule

A null that matters is unproven until controlled. Before believing a
silent grep, re-run the probe against a pattern you **know is present** —
a line you have seen, a callsign, a token from the same stream. One
extra probe turns silence into evidence; without it, absence-of-signal
and signal-of-absence are the same bytes. A grep that returns nothing is
not an instrument reading zero — it may be a broken instrument
reporting nothing.

## Validation

- Operator in the pattern → `-E` is on the line.
- ANSI/binary bytes in the stream → `LC_ALL=C` is on the line.
- A null result that decides anything → positive control first.