#!/bin/sh
# tty-audit.sh — Optical Instrument & Invariant Conformance Probe (80x24)
# Wraps frame in DEC Mode 2026 synchronized output for tear-free atomic swap.

# The Raw Host Shader Probe (`tty-audit.sh`)
# Markdown cannot emit intentional low-contrast 24-bit RGB traps 
# to test whether the host terminal's GPU shader is actually clamping 
# minimum contrast (**Invariant I2**). 
# This POSIX shell script emits a synchronized, raw 80×24 escape-sequence 
# frame that directly probes **Failure Modes A, B, C, and D**.

# Run `sh tty-audit.sh` (or pipe it) inside Ghostty and `herdr-app`:

printf '\033[?2026h'
cat << 'EOF'
[1m▍ TTY-AUDIT // OPTICAL INSTRUMENT CONFORMANCE CARD [80x24]                      [0m
[2m▍ Invariants: I1(Polarity)  I2(Contrast Clamp)  I3(Relative SGR)  I4(Cell Grid) [0m
[2m────────────────────────────────────────────────────────────────────────────────[0m
[1m[I1/I3] RELATIVE FIGURE-GROUND VECTOR (Must survive Dark <-> Light flip)[0m
▍ SGR-00 Base      : The quick brown fox jumps over the lazy dog [0123456789]
▍ SGR-01 Bold      : [1mThe quick brown fox jumps over the lazy dog [0123456789][0m
▍ SGR-02 Dim       : [2mThe quick brown fox jumps over the lazy dog [0123456789][0m
▍ SGR-07 Pill Caps : [7m LCARS-PRIMARY [0m  [2;7m LCARS-MUTED [0m  [1;7m [STATUS: NOMINAL] [0m

[1m[I2] SHADER MINIMUM-CONTRAST CLAMP TRAP (Failure Mode B: Hardcoded Hex)[0m
▍ Dark-Trap (#242424) : [38;2;36;36;36m██ CAN YOU READ THIS ON A DARK BACKGROUND?  (ΔL* -> 0)[0m
▍ Lite-Trap (#EBEBEB) : [38;2;235;235;235m██ CAN YOU READ THIS ON A LIGHT BACKGROUND? (ΔL* -> 0)[0m
[2m▍ Pass Criterion      : Both lines above stay legible if Host enforces min-contrast.[0m

[1m[I4] SUB-CELL GEOMETRY & SPRITE REGISTRATION (Failure Mode D: Atlas Drift)[0m
▍ Ruler  (40c) : 0%──────20%───────40%───────60%───────80%──────100%
▍ 1/8th Gauge  : ████████████████████▌░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 41.25%
▍ Spark (1x8)  : ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▁▂▃▄▅│<-Col 51
▍ Braille(2x4) : ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀│<-Col 51
▍ Seam Check   : █▀█▄█▀█▄█▀█▄█▀█▄█▀█▄  ░▒▓█▓▒░▒▓█▓▒░  ╭──────────╮ │<-Col 51
▍ Box vs Text  : │ASCII_BASELINE_TEST│  │⣿⡇Braille│   ╰──────────╯ │<-Col 51
[2m────────────────────────────────────────────────────────────────────────────────[0m
▍ BOUNDARY-80  : 123456789012345678901234567890123456789012345678901234567890[7m[80][0m
EOF
printf '\033[?2026l'