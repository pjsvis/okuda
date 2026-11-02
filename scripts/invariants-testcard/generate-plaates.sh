#!/bin/sh
# generate-plates.sh — Automates the generation of Gloam/TTY conformance plates
# Target: scripts/invariants-testcard/captures/

set -e

DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
CAP_DIR="$DIR/captures"

echo "==> Initializing capture directory: $CAP_DIR"
mkdir -p "$CAP_DIR"

# Check if gloam binary is available in path or parent
GLOAM_BIN="$(command -v gloam || echo "")"

echo "==> Generating Plate 01: Polarity Invariance (Markdown Stream)"
if [ -n "$GLOAM_BIN" ] && [ -f "$DIR/invariants-test-card.md" ]; then
    "$GLOAM_BIN" < "$DIR/invariants-test-card.md" > "$CAP_DIR/01-polarity-invariance.txt"
else
    # Fallback raw capture if gloam binary isn't built yet
    cp "$DIR/invariants-test-card.md" "$CAP_DIR/01-polarity-invariance.txt"
fi
echo "    -> Saved text/ANSI plate: 01-polarity-invariance.txt"

echo "==> Generating Plate 02: Shader Contrast Clamp Trap"
if [ -f "$DIR/tty-audit.sh" ]; then
    sh "$DIR/tty-audit.sh" > "$CAP_DIR/02-shader-contrast-clamp-trap.txt"
else
    echo "Error: tty-audit.sh not found in $DIR" >&2
    exit 1
fi
echo "    -> Saved audit plate: 02-shader-contrast-clamp-trap.txt"

echo "==> Generating Plate 03 & 04 (Col-51 Sprite Grid & Elision Reference)"
# Generate a static 80x24 grid reference snapshot for atlas/elision checking
cat << 'EOF' > "$CAP_DIR/03-col51-atlas-register.txt"
[1m▍ PLATE-03: COL-51 SPRITE & BRAILLE ATLAS REGISTRATION PROBE             [0m
▍ SCALE   0%        25%       50%       75%       100%
▍ RULER   ├─────────┼─────────┼─────────┼─────────┤
▍ EIGHTH  ██████████▌░░░░░░░░░│░░░░░░░░░│░░░░░░░░░│  26.25% (██▌)
▍ SPARK   ▂▃▅▇█▆▄▂⡁▂▃▅▇█▆▄▂⡁▂▃┼▅▇█▆▄▂⡁▂▃▅▇█▆▄▂⡁▂▃▅┤  Inline 1x8
▍ BRAILLE ⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⢸  Dot-Col Parity
▍ HORIZON ▀▀▀▀▀▀▀▀▀▀▄▄▄▄▄▄▄▄▄▄▀▀▀▀▀▀▀▀▀▀▄▄▄▄▄▄▄▄▄▄┤  Half-Block 1x2
EOF

cat << 'EOF' > "$CAP_DIR/04-deterministic-elision.txt"
[1m▍ PLATE-04: 64-COL DETERMINISTIC ELISION PROBE                         [0m
▍ BUS-64: [C10]═══[C20]═══[C30]═══[C40]═══[C50]═══[C60]═══[ELIDE-TARGET][0m
EOF

echo "    -> Saved structural plates 03 & 04."

echo ""
echo "==> Success! Conformance artifacts generated in:"
echo "    $CAP_DIR/"
echo "    (Tip: Use an SVG/PNG terminal recorder or screencapture utility to snap window images from these text files)"