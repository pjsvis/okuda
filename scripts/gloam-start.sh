#!/usr/bin/env bash

FG="${1:-#d8dee9}"
BG="${2:-#14171c}"
CURSOR="${3:-#88c0d0}"

cleanup() {
    # Reset OSC 10-12, show cursor, leave alternate screen
    printf '\e]110\a\e]111\a\e]112\a\e[?25h\e[?1049l'
}
trap cleanup EXIT

# Enter alternate screen and apply OSC 10-12
printf '\e[?1049h\e]10;%s\a\e]11;%s\a\e]12;%s\a' "$FG" "$BG" "$CURSOR"

# Replace this with your actual TUI command
# read -rp "Running in calibrated palette. Press Enter to exit..."
gloam