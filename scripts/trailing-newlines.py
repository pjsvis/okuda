"""Trailing-newline accounting for the tree. Reads many files in one pass.

    python3 scripts/trailing-newlines.py <file>...     report
    python3 scripts/trailing-newlines.py --fix <file>...  repair

Two classes, reported separately because they have different owners:

  SLACK  (>1 trailing newline)  — fails the gate. Produced by a generator
         appending its own newline to a string that already ended in one; the
         renderer collapses it so nothing reaches the glass, but every diff and
         concatenation inherits it. Repaired for all ten files that carried it
         on 2026-10-25 and prevented at source in `scripts/status-doc.ts`.

  NONE   (0 trailing newlines)  — counted, never gated. ~120 tracked docs,
         mostly frozen tiers. The operator's call, 2026-10-25: repairing a
         hundred files of history for a convention no reader can see costs more
         than it buys, so this class is repaired ON ENCOUNTER and merely counted
         here, to keep its trend legible. `--fix` is the encounter's one command.

One process for N files, not N processes: the per-file form cost `tree-lint`
8.8 s on a 500-file corpus, which is a gate asking to be waived.
"""
import sys

fix = "--fix" in sys.argv
paths = [a for a in sys.argv[1:] if a != "--fix"]

slack: list[str] = []
none: list[str] = []

for path in paths:
    try:
        data = open(path, "rb").read()
    except OSError:
        continue
    if not data:
        continue
    extra = len(data) - len(data.rstrip(b"\n"))
    if extra > 1:
        slack.append(f"  {path} (ends with {extra} newlines)")
        if fix:
            open(path, "wb").write(data.rstrip(b"\n") + b"\n")
    elif extra == 0:
        none.append(path)
        if fix:
            open(path, "wb").write(data + b"\n")

for line in slack:
    print(line)

# The count is a reading for the shell gate; a fixed run stays silent so the
# repair can be verified by running the check again.
print(f"__NONE__ {len(none)}")
