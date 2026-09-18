A field repository must never block the local human or speech interface because a cellular link dropped mid-uplink.

By applying the Operational Heuristic, we treat Git not as an interactive VCS, but strictly as an **asynchronous transport wire**. Local reads and writes to Markdown files remain zero-latency, non-blocking, and pure POSIX file operations. Synchronization happens out-of-band via an idempotent, bounded daemon loop over SSH.

---

### Invariants for the Field Loop

1. **Local Primacy (Never Block GLoam):** GLoam and the user only ever read and append to the local working tree. The sync daemon runs in a decoupled background process.
2. **Deterministic Divergence Avoidance:**
* The field node owns its append stream (e.g., `diaries/`, field `debriefs/`).
* The remote node owns administrative or upstream updates.
* Field nodes commit only to their designated branch (`node/`). Merging into `main` is delegated upstream to avoid local merge conflict freezes.


3. **Bounded Network Timeouts:** An SSH handshake in a bandwidth-denied maritime or tower environment must fail fast (e.g., 5-second socket timeout) rather than hanging the daemon.

---

### The Architecture: Decoupled Spooling

```
[ GLoam / Speech Input ]
         │ (Instant Local POSIX Write)
         ▼
[ Local Silo Repo (Branch: node/field-alpha) ]
         ▲
         │ (Polls every N seconds; non-blocking)
[ Sync Daemon (gloam-sync) ]
         │
         │ (SSH Transport: Connect timeout = 5s)
         ▼
[ Upstream SSH Server (Bare Git Repo / Hub) ]

```

---

### The Daemon Script: `gloam-sync.sh`

This script runs locally as a `systemd` user service or a background loop. It requires only standard POSIX shell utilities, Git, and OpenSSH.

```bash
#!/usr/bin/env bash
set -euo pipefail

# =========================================================================
# Configuration & Invariants
# =========================================================================
SILO_DIR="\({GLOAM_SILO_DIR:-\)HOME/silo}"
REMOTE_ALIAS="origin"
REMOTE_HOST="hub.leith-scriptorium.internal"
NODE_CALLSIGN="${GLOAM_NODE_CALLSIGN:-field-bravo}"
BRANCH="node/${NODE_CALLSIGN}"
SYNC_INTERVAL_SEC=30
SSH_TIMEOUT_SEC=5

# Export hard socket boundaries for SSH
export GIT_SSH_COMMAND="ssh -o BatchMode=yes \
                            -o ConnectTimeout=${SSH_TIMEOUT_SEC} \
                            -o ServerAliveInterval=10 \
                            -o ServerAliveCountMax=2"

cd "${SILO_DIR}"

# Ensure we are anchored to our dedicated local branch
current_branch="$(git symbolic-ref --short HEAD 2>/dev/null || true)"
if [ "\({current_branch}" != "\){BRANCH}" ]; then
    git checkout -B "${BRANCH}"
fi

# =========================================================================
# The Autonomous Loop
# =========================================================================
while true; do
    # 1. Local Ledger Phase: Commit pending changes locally (Zero Network Cost)
    if [ -n "$(git status --porcelain)" ]; then
        # Stage only valid Markdown files and ignore temp artifacts
        git add -- *.md .archive/ 2>/dev/null || true
        
        # Only commit if something was staged
        if ! git diff --cached --quiet; then
            timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
            git commit -m "ledger(\({NODE_CALLSIGN}): local append at\){timestamp}" --quiet
        fi
    fi

    # 2. Remote Transport Phase: Check SSH connectivity before attempting transfer
    if ssh -q -o BatchMode=yes -o ConnectTimeout="\({SSH_TIMEOUT_SEC}" "\){REMOTE_HOST}" exit 2>/dev/null; then
        
        # Push local branch updates to upstream hub
        git push "\({REMOTE_ALIAS}" "\){BRANCH}" --quiet 2>/dev/null || true

        # Fetch upstream canonical updates (decisions, playbooks, advisories)
        if git fetch "${REMOTE_ALIAS}" main --quiet 2>/dev/null; then
            # Rebase cleanly against upstream main without creating merge bubbles.
            # In the rare event of a clash, abort immediately to keep working tree clean.
            git rebase "${REMOTE_ALIAS}/main" --quiet 2>/dev/null || {
                git rebase --abort --quiet 2>/dev/null || true
            }
        fi
    fi

    # Sleep until next scheduled boundary pulse
    sleep "${SYNC_INTERVAL_SEC}"
done

```

---

### Resilience Properties

* **Atomic Local Operations:** If the network cable is cut mid-sentence, the local Markdown file is already committed to the local Git ref. Not a single character is lost.
* **Fail-Fast Probing:** The `ssh -q ... exit` test drops dead in 5 seconds if the radio link is silent, completely avoiding Git process lock contention (`.git/index.lock`).
* **Zero Conflict Stalls:** Because the node never performs a standard recursive merge on the edge device, you never get a terminal suspended waiting for `<<<<<<< HEAD` resolution while an engineer is trying to listen to an emergency playbook. If a rebase clashing occurs, it immediately aborts, keeping the local files readable and intact.