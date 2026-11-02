#!/bin/sh
# tty-card.sh — a card you read, not a suite you run.
#
#  A terminal's *surface* has invariants a byte stream cannot test: the glyph
#  atlas registers a block or a braille cell to integer pixels, and the shader
#  either clamps low-contrast ink away from the ground or it does not. Both are
#  properties of bytes -> pixels, so a renderer cannot verify them, and a card
#  is what is left: something a human sights down.
#
#  Two rules this file exists to obey, both learned the hard way.
#
#  1. THE RULER MUST NOT BE BUILT FROM THE FAMILY UNDER TEST.
#     A grid drawn in U+2500..U+259F cannot measure U+2500..U+259F, because a
#     systematic atlas error cancels against itself. Every measuring element
#     here is ASCII; every measured element is Unicode. That is why the gutter,
#     the ruler and the spine are `|` and `.` and not a box or a block.
#
#  2. THE CONTROL PASSES FIRST.
#     The ASCII row is not decoration. If its spine is not at the column the
#     MARKS row points at, this file's arithmetic is broken and every Unicode
#     reading below it is void. Check it before trusting any of them.
#
#  Usage:  sh scripts/tty-card.sh            # print the card
#          sh scripts/tty-card.sh --assert    # check the ASCII arithmetic, exit 1 on fail
#          sh scripts/tty-card.sh -w 100      # a wider card
#
#  Nothing in the emitted output is a hand-typed ruler: every measuring column
#  is derived from W and the layout constants below.

set -u

W=80
LABEL=10
MARK=55          # the absolute column the spine must occupy, at any W

case "${LC_ALL:-${LC_CTYPE:-${LANG:-}}}" in
    *UTF-8*|*utf-8*|*UTF8*|*utf8*) UTF8=1 ;;
    *) UTF8=0 ;;
esac
ASSERT=0

while [ $# -gt 0 ]; do
    case "$1" in
        --assert) ASSERT=1 ;;
        -w) shift; W=${1:-80} ;;
        -h|--help) sed -n '3,28p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
        *) echo "tty-card: unknown argument: $1" >&2; exit 2 ;;
    esac
    shift
done

LEAD=$((2 + LABEL + 2))            # '| ' + label + '| '
FIELD=$((W - LEAD - 1))            # ... field, then the right border
POS=$((MARK - LEAD))               # spine position within the field, 1-based
LEFT=$((POS - 1))

[ "$LEFT" -ge 0 ] && [ "$FIELD" -gt "$POS" ] || {
    echo "tty-card: W=$W cannot carry a spine at column $MARK" >&2
    exit 2
}

# A ramp may only be cut on a cycle boundary, or the tail reads as a flat run and
# the reader is entitled to ask why the pattern stopped mid-glyph. Both spans are
# therefore floored to whole cycles, and the slack is left as margin. That the
# spine sits on a cycle boundary is an invariant of MARK, so it is checked.
CYCLE=8
[ "$((LEFT % CYCLE))" -eq 0 ] || {
    echo "tty-card: MARK=$MARK does not put the spine on a ${CYCLE}-cell boundary" >&2
    exit 2
}
RIGHT=$(( ((FIELD - POS) / CYCLE) * CYCLE ))
TAIL=$((FIELD - POS - RIGHT))

die() { echo "tty-card: $*" >&2; }

rep() { # rep N STR
    _n=$1
    while [ "$_n" -gt 0 ]; do printf '%s' "$2"; _n=$((_n - 1)); done
}

ruler() { # digits at tens, ':' at fives, '.' elsewhere — ASCII, with the spine cut in
    _i=1
    while [ "$_i" -le "$FIELD" ]; do
        if [ "$_i" -eq "$POS" ]; then
            printf '|'
        else
            _t=$((_i % 10))
            _f=$((_i % 5))
            if [ "$_t" -eq 0 ]; then
                printf '%s' $((_i / 10 % 10))
            elif [ "$_f" -eq 0 ]; then
                printf ':'
            else
                printf '.'
            fi
        fi
        _i=$((_i + 1))
    done
}

marks() { # '^' under the spine, '.' elsewhere — the sighting reference
    rep "$LEFT" '.'
    printf '^'
    rep "$((RIGHT + TAIL))" '.'
}

emitcycle() { # emitcycle CYCLE LEN N — exactly N cells, N a multiple of LEN
    _c=$1 _l=$2 _n=$3
    _full=$((_n / _l))
    while [ "$_full" -gt 0 ]; do printf '%s' "$_c"; _full=$((_full - 1)); done
}

subject() { # subject CYCLE LEN — ramp, spine, ramp, margin
    emitcycle "$1" "$2" "$LEFT"
    printf '|'
    emitcycle "$1" "$2" "$RIGHT"
    rep "$TAIL" ' '
}

row() { # row LABEL FIELD
    printf '| %-*s| %s|\n' "$LABEL" "$1" "$2"
}

rule() {
    printf '| %s |\n' "$(rep "$((W - 4))" '-')"
}

head() { # head TEXT — ASCII only: printf pads by bytes, and %-*s cannot see a glyph
    printf '| %-*s |\n' "$((W - 4))" "$1"
}

# The subject rows. Each is a *pattern*, not a solid field: a constant run cannot
# show sub-cell drift, because every cell is the same and every error looks the
# same too. A ramp makes one bad cell a kink in a diagonal.
R_EIGHTH='▁▂▃▄▅▆▇█'; R_EIGHTH_N=8
R_DITHER='░▒▓█'; R_DITHER_N=4
R_BRAILLE='⠁⠃⠇⡇⣇⣧⣷⣿'; R_BRAILLE_N=8
R_BLOCK='▀▄'; R_BLOCK_N=2

emit() {
    printf '\033[?2026h'
    head "tty-card  surface invariants  ${W} cols"
    head "spine col ${MARK}  ruler ASCII  subjects Unicode"
    rule
    row "RULER"   "$(ruler)"
    row "MARKS"   "$(marks)"
    row "ASCII"   "$(subject '-' 1 '-')"
    row "EIGHTH"  "$(subject "$R_EIGHTH" "$R_EIGHTH_N")"
    row "DITHER"  "$(subject "$R_DITHER" "$R_DITHER_N")"
    row "BRAILLE" "$(subject "$R_BRAILLE" "$R_BRAILLE_N")"
    row "BLOCK"   "$(subject "$R_BLOCK" "$R_BLOCK_N")"
    rule
    printf '\033[?2026l\n'

    # I2 — the contrast floor. Each trap is invisible on the ground it matches;
    # a host that clamps minimum contrast makes both legible.
    printf '| %-*s |\n' "$((W - 4))" "TRAPS  host minimum-contrast clamp (I2)"
    printf '| %-*s |\n' "$((W - 4))" ""
    printf '|   DARK  \033[38;2;36;36;36m%-*s\033[0m |\n' "$((W - 12))" "CAN YOU READ THIS ON A DARK GROUND?"
    printf '|  LIGHT  \033[38;2;235;235;235m%-*s\033[0m |\n' "$((W - 12))" "CAN YOU READ THIS ON A LIGHT GROUND?"
    printf '| %-*s |\n' "$((W - 4))" ""
    printf '| %-*s |\n' "$((W - 4))" "the ASCII row above is the control: if its spine is off," 
    printf '| %-*s |\n' "$((W - 4))" "the Unicode readings mean nothing. The traps test the host,"
    printf '| %-*s |\n' "$((W - 4))" "not this file. Nothing here asserts your terminal."
}

# ── the check ───────────────────────────────────────────────────────────

check() {
    rc=0
    ascii_row() { printf '| %-*s| %s|\n' "$LABEL" "$1" "$2"; }

    for pair in "RULER:$(ruler)" "MARKS:$(marks)" "ASCII:$(subject '-' 1 '-')"; do
        name=${pair%%:*}
        body=${pair#*:}
        line=$(ascii_row "$name" "$body")

        n=$(printf '%s' "$line" | wc -c | tr -d ' ')
        [ "$n" -eq "$W" ] || { die "$name: $n cells, expected $W"; rc=1; }

        at=$(printf '%s' "$line" | cut -c"$MARK")
        case "$name" in
            MARKS) [ "$at" = '^' ] || { die "$name: mark at col $MARK is '$at'"; rc=1; } ;;
            *)     [ "$at" = '|' ] || { die "$name: spine at col $MARK is '$at'"; rc=1; } ;;
        esac
    done

    # The Unicode rows are measured only where the locale counts characters. A
    # card cannot assert the wcwidth it is testing, so under a byte-oriented
    # locale this declines rather than lying in either direction.
    if [ "$UTF8" -eq 1 ]; then
        for pair in "EIGHTH:$R_EIGHTH:$R_EIGHTH_N" \
                    "DITHER:$R_DITHER:$R_DITHER_N" \
                    "BRAILLE:$R_BRAILLE:$R_BRAILLE_N" \
                    "BLOCK:$R_BLOCK:$R_BLOCK_N"; do
            name=$(printf '%s' "$pair" | cut -d: -f1)
            cy=$(printf '%s' "$pair" | cut -d: -f2)
            cn=$(printf '%s' "$pair" | cut -d: -f3)
            line=$(ascii_row "$name" "$(subject "$cy" "$cn")")
            n=$(printf '%s' "$line" | wc -m | tr -d ' ')
            [ "$n" -eq "$W" ] || { die "$name: $n cells, expected $W"; rc=1; }
        done
        note="Unicode rows measured: ${W} cells each"
    else
        note="Unicode rows NOT measured (locale is not UTF-8): read them, trust no count"
    fi

    if [ "$rc" -eq 0 ]; then
        printf 'PASS  spine at col %s, every ASCII row %s cells\n' "$MARK" "$W"
        printf '      %s\n' "$note"
        printf '      Boundary: this checks the card. It does not check your terminal.\n'
    fi
    return "$rc"
}

if [ "$ASSERT" -eq 1 ]; then
    check
    exit $?
fi

emit
echo
check
