#!/bin/bash
# read-diagram.sh — smoke test for BRF-DIAGRAM-DESCRIBE
# Pipes a mermaid describe fence through okuda and shows the prose output.
set -euo pipefail

FILE="${1:-tmp/diagram-smoke.md}"

# If the file doesn't exist, create a fixture with one described diagram.
if [ ! -f "$FILE" ]; then
  mkdir -p "$(dirname "$FILE")"
  cat > "$FILE" << 'FIXTURE'
# Diagram Describe Smoke Test

A sequence diagram, described:

```mermaid describe
title: Authentication Flow
sequenceDiagram
    User->>API: POST /login
    API->>DB: SELECT user
    DB-->>API: user row
    API-->>User: JWT token
```

A flowchart, described:

```mermaid describe
title: Validation
flowchart TD
    A[Input] --> B{Valid?}
    B -->|Yes| C[Process]
    B -->|No| D[Reject]
```

Text after the diagrams continues normally.
FIXTURE
  echo "Created fixture: $FILE"
fi

echo "=== Rendering $FILE ==="
echo

# Render with okuda, strip ANSI for readability
./okuda "$FILE" --no-color 2>/dev/null || {
  echo
  echo "=== Describing mermaid source directly ==="
  echo
  # Fallback: extract the first mermaid fence and describe it directly
  awk '/```mermaid describe/,/```/' "$FILE" | head -n -1 | tail -n +2 | diagram-describe
}