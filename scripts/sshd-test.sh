#!/usr/bin/env bash
# sshd-test.sh — sandboxed OpenSSH ForceCommand test for okuda over SSH.
#
# Spins up an unprivileged sshd on 127.0.0.1:2222 with its own host key,
# authorized_keys, and a ForceCommand pointing at this repo's okuda binary
# in --tui mode against a served markdown doc. Nothing touches system SSH
# config; the sandbox lives under $HOME (StrictModes rejects /tmp).
#
# Usage:
#   bash scripts/sshd-test.sh view  [doc]   # interactive: connect on your real TTY, teardown on quit
#   bash scripts/sshd-test.sh smoke [doc]   # automated: connect, capture, assert, teardown (exit 0/1)
#   bash scripts/sshd-test.sh serve [doc]   # start sshd, print the connect command, leave it running
#   bash scripts/sshd-test.sh stop          # tear down a running sandbox sshd
#
# The smoke test asserts the real transport properties: alternate-screen
# entry, truecolor SGR propagation (color over the wire), the footer badge,
# and clean teardown. It does NOT assert cadence/live-update — --tui --watch
# is not implemented yet (brief: tui-live-documents). The smoke test proves
# the transport, not the feed.
set -euo pipefail

ACTION="${1:-smoke}"
PORT="${OKUDA_SSHD_PORT:-2222}"
SANDBOX="${OKUDA_SSHD_SANDBOX:-$HOME/okuda-sshd-test}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
OKUDA="$REPO/okuda"
DEFAULT_DOC="$REPO/docs/glow-vs-okuda.md"
DOC="${2:-$DEFAULT_DOC}"
# Resolve a relative doc path against the repo root before any cd.
[[ "$DOC" = /* ]] || DOC="$REPO/$DOC"

die() { echo "sshd-test: $*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "missing dependency: $1"; }

need ssh-keygen; need sshd; need ssh; need nc

stop_sandbox() {
  if [[ -f "$SANDBOX/sshd.pid" ]]; then
    kill "$(cat "$SANDBOX/sshd.pid")" 2>/dev/null || true
    rm -f "$SANDBOX/sshd.pid"
  fi
  # Belt and braces: anything listening on our port that we spawned.
  pkill -f "sshd_config=$SANDBOX/sshd_config" 2>/dev/null || true
}

case "$ACTION" in
  stop)
    stop_sandbox
    echo "sandbox sshd stopped ($SANDBOX)"
    exit 0
    ;;
esac

# ── Bootstrap sandbox ──────────────────────────────────────────────────
[[ -x "$OKUDA" ]] || die "okuda binary not found at $OKUDA — run 'just build'"
[[ -f "$DOC" ]]   || die "serve doc not found: $DOC"

stop_sandbox   # never stack two sandboxes
mkdir -p "$SANDBOX"; chmod 700 "$SANDBOX"; cd "$SANDBOX"

# Clear stale key material (ssh-keygen prompts to overwrite; under set -e
# that's a silent abort). Fresh keys per run — cheap, hermetic.
rm -f host_key host_key.pub client_key client_key.pub authorized_keys

# Fresh keys per run (cheap, hermetic).
ssh-keygen -q -t ed25519 -f host_key   -N "" -C okuda-test-host   >/dev/null
ssh-keygen -q -t ed25519 -f client_key -N "" -C okuda-test-client >/dev/null
cp client_key.pub authorized_keys; chmod 600 authorized_keys host_key client_key
cp "$DOC" "$SANDBOX/served.md"

cat > sshd_config <<EOF
Port $PORT
ListenAddress 127.0.0.1
HostKey $SANDBOX/host_key
PidFile $SANDBOX/sshd.pid
AuthorizedKeysFile $SANDBOX/authorized_keys
UsePAM no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
PermitTTY yes
X11Forwarding no
PermitTunnel no
AllowTcpForwarding no
PermitOpen none
AllowAgentForwarding no
ForceCommand $OKUDA --tui $SANDBOX/served.md
LogLevel VERBOSE
EOF

/usr/sbin/sshd -f "$SANDBOX/sshd_config" -D -e > "$SANDBOX/sshd.log" 2>&1 &
SSHD_BG=$!
# Wait for the listener.
for _ in 1 2 3 4 5 6 7 8 9 10; do
  nc -z 127.0.0.1 "$PORT" 2>/dev/null && break
  kill -0 "$SSHD_BG" 2>/dev/null || die "sshd died during startup — log: $SANDBOX/sshd.log"
  sleep 0.3
done
nc -z 127.0.0.1 "$PORT" 2>/dev/null || die "sshd not listening on $PORT — log: $SANDBOX/sshd.log"

# -tt forces PTY allocation even though stdin is a pipe — required so okuda's
# TUI gate (stdout.isTTY && stdin.isTTY) passes and --tui runs instead of
# falling back to the streaming renderer.
SSH_CMD="ssh -tt -i $SANDBOX/client_key -p $PORT -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes $USER@127.0.0.1"

case "$ACTION" in
  serve)
    echo "sandbox sshd listening on 127.0.0.1:$PORT  (pid $SSHD_BG)"
    echo "serving: $DOC  →  $SANDBOX/served.md"
    echo
    echo "connect:"
    echo "  $SSH_CMD"
    echo
    echo "teardown: bash scripts/sshd-test.sh stop"
    # Leave it running; detach so the script exits.
    disown "$SSHD_BG" 2>/dev/null || true
    exit 0
    ;;

  view)
    # Connect in the foreground on the caller's real TTY. When the reader
    # quits okuda (q / Esc / Ctrl-C), ssh exits and the trap tears down the
    # sandbox — nothing left running. -tt forces PTY allocation so okuda's
    # TUI gate passes and --tui runs (not the streaming fallback).
    trap 'stop_sandbox' EXIT INT TERM
    $SSH_CMD
    ;;

  smoke)
    CAP="$SANDBOX/capture.raw"; ERR="$SANDBOX/ssh.err"
    # Sleep so the TUI renders, then 'q' to quit cleanly, hold stdin briefly.
    # The pipe's left side dies of SIGPIPE when ssh closes after q — expected,
    # not an error — so tolerate pipefail/errexit around the call.
    set +e +o pipefail
    ( sleep 1.2; printf 'q'; sleep 1.5 ) | $SSH_CMD > "$CAP" 2> "$ERR"
    SSH_EXIT=$?
    set -e -o pipefail
    stop_sandbox

    echo "ssh exit:        $SSH_EXIT"
    echo "capture bytes:  $(wc -c < "$CAP" | tr -d ' ')"
    echo "ssh stderr:     $(head -1 "$ERR")"
    echo

    # ── Assertions (the harden: each must hold, named, no soft claims) ──
    pass=0; fail=0
    assert() { # desc, condition-cmd
      local desc="$1"; shift
      if "$@" >/dev/null 2>&1; then
        echo "  ✓ $desc"; pass=$((pass+1))
      else
        echo "  ✗ $desc"; fail=$((fail+1))
      fi
    }

    assert "ssh client exited 0"                    test "$SSH_EXIT" -eq 0
    # Escape sequences contain regex metachars ([ ?) — match as fixed strings.
    assert "alternate screen entered (?1049h)"     grep -Fq $'\x1b[?1049h' "$CAP"
    assert "alternate screen restored (?1049l)"    grep -Fq $'\x1b[?1049l' "$CAP"
    assert "truecolor SGR propagated (color over wire)" grep -Fq $'\x1b[38;2;' "$CAP"
    assert "footer badge 'Gloam' rendered"         grep -Fq "Gloam" "$CAP"
    assert "served doc title present"              grep -Fq "Glow vs okuda" "$CAP"
    assert "cursor shown on teardown (?25h)"       grep -Fq $'\x1b[?25h' "$CAP"

    echo
    echo "result: $pass passed, $fail failed"
    [[ "$fail" -eq 0 ]] || { echo "FAIL — see $SANDBOX/"; exit 1; }
    echo "PASS — transport proven; cadence untested (--tui --watch open, brief tui-live-documents)"
    ;;
  *)
    die "unknown action: $ACTION (view | smoke | serve | stop)"
    ;;
esac
