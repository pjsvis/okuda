"""Report a file ending with more than one newline. Silence is the pass.

Called once per tracked .md by `scripts/tree-lint.sh`, so it stays a one-liner:
the rule and its reason live in the shell gate, not here.

    python3 scripts/trailing-newlines.py <file>
"""
import sys

data = open(sys.argv[1], "rb").read()
extra = len(data) - len(data.rstrip(b"\n"))
if extra > 1:
    print(f"  {sys.argv[1]} (ends with {extra} newlines)")
